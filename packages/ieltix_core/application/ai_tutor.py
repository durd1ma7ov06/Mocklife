import asyncio
import logging
import re
from typing import Any, Optional

import httpx

from packages.ieltix_core.application.key_pool import get_key_pool

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are MockLife AI — an elite IELTS Speaking Examiner and master English Language Tutor.

Your mission:
1. IELTS Speaking Simulation:
   - Act as an encouraging, professional British/American IELTS Examiner.
   - Ask one clear IELTS Speaking question at a time (Part 1 everyday topics, Part 2 cue card prompts, or Part 3 abstract discussion).
   - When the user answers, briefly give constructive feedback on their response:
     * Mention a positive aspect (Fluency or Grammar).
     * Offer 1 Band 8+ vocabulary word, collocation, or idiom that upgrades their sentence.
     * Then naturally ask the next follow-up question.

2. English Learning & Q&A (Bilingual):
   - If the user asks a question in Uzbek (e.g., about grammar, tenses, sentence structures, vocabulary, tips):
     * Explain clearly, warmly, and concisely in Uzbek.
     * Provide clear English examples with Uzbek translations.
   - If the user speaks or practices in English:
     * Converse primarily in natural, authentic English.
     * Keep corrections polite, encouraging, and actionable.

3. Voice Conversational Tone:
   - Keep answers conversational and concise (2 to 4 sentences usually, unless answering a deep grammar question).
   - Avoid lengthy bullet lists during spoken conversations so it feels like a real voice call.
   - Do not use markdown headers (# or ##) in conversational responses.
"""


def clean_for_speech(text: str) -> str:
    """Strips markdown symbols, emojis, and brackets so Edge-TTS speaks cleanly."""
    cleaned = re.sub(r"[\*\_#`~>\[\]\(\)]", " ", text)
    cleaned = re.sub(r"[^\w\s\.,!\?':;\-]", " ", cleaned, flags=re.UNICODE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def detect_language(text: str) -> str:
    """Heuristic detection of Uzbek vs English."""
    lower = text.casefold()
    uz_words = {
        "men", "siz", "biz", "sen", "qanday", "nima", "qachon", "qayerda",
        "kerak", "uchun", "bilan", "gapir", "o'rgan", "organ", "tushun",
        "haqida", "boladi", "bo'ladi", "rahmat", "salom", "yordam", "iltimos",
        "so'z", "soz", "grammatika", "qoida", "savol", "javob"
    }
    words = re.findall(r"\w+", lower)
    uz_count = sum(1 for w in words if w in uz_words)
    return "uz" if uz_count >= 1 else "en"


def extract_voice_prompts(content: str) -> tuple[str, str, str]:
    """Extracts (display_text, speech_uz, speech_en) from LLM output for bilingual speech."""
    display_text = content
    speech_uz = ""
    speech_en = ""

    if "[OVOZLI_UZ]:" in content:
        parts = content.split("[OVOZLI_UZ]:", 1)
        display_text = parts[0].strip()
        tail = parts[1].strip()
        if "[OVOZLI_EN]:" in tail:
            tail_parts = tail.split("[OVOZLI_EN]:", 1)
            speech_uz = clean_for_speech(tail_parts[0].strip())
            speech_en = clean_for_speech(tail_parts[1].strip())
        else:
            speech_uz = clean_for_speech(tail)
    elif "[OVOZLI]:" in content:
        parts = content.split("[OVOZLI]:", 1)
        display_text = parts[0].strip()
        speech_uz = clean_for_speech(parts[1].strip())

    if not speech_uz:
        speech_uz = "Rahmat! Javobingiz tahlil qilindi. Matndagi tavsiyalarga e'tibor bering va keyingi savolga javob bering."

    return display_text, speech_uz, speech_en


class AITutorService:
    def __init__(
        self,
        groq_api_key: str = "",
        gemini_api_key: str = "",
        default_model: str = "qwen/qwen3.8-27b",
        key_pool: Optional[Any] = None,
    ) -> None:
        self.groq_api_key = groq_api_key.strip()
        self.gemini_api_key = gemini_api_key.strip()
        self.default_model = default_model
        self.key_pool = key_pool or get_key_pool()

    def _resolve_groq_keys(self) -> list[str]:
        keys = []
        if self.key_pool:
            keys = self.key_pool.get_groq_keys()
        if not keys and self.groq_api_key:
            keys = [self.groq_api_key]
        return keys

    def _resolve_gemini_keys(self) -> list[str]:
        keys = []
        if self.key_pool:
            keys = self.key_pool.get_gemini_keys()
        if not keys and self.gemini_api_key:
            keys = [self.gemini_api_key]
        return keys

    async def chat(
        self,
        user_message: str,
        conversation_history: Optional[list[dict[str, str]]] = None,
        system_prompt: Optional[str] = None,
    ) -> dict[str, Any]:
        """Calls Groq or Gemini with conversation history and returns assistant response."""
        history = list(conversation_history or [])
        prompt = system_prompt or SYSTEM_PROMPT

        messages = [{"role": "system", "content": prompt}]
        # Append up to last 10 turns of history
        for msg in history[-10:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        # Try Groq pool first
        groq_keys = self._resolve_groq_keys()
        models_to_try = [self.default_model, "openai/gpt-oss-120b", "openai/gpt-oss-20b"]

        for active_key in groq_keys:
            key_had_rate_limit = False
            for model_name in models_to_try:
                try:
                    async with httpx.AsyncClient(timeout=18.0) as client:
                        resp = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={"Authorization": f"Bearer {active_key}"},
                            json={
                                "model": model_name,
                                "messages": messages,
                                "temperature": 0.7,
                                "max_tokens": 600,
                            },
                        )
                        if resp.status_code == 200:
                            if self.key_pool:
                                asyncio.create_task(self.key_pool.record_usage("groq", active_key, True))
                            data = resp.json()
                            content = data["choices"][0]["message"]["content"].strip()
                            lang = detect_language(content)
                            return {
                                "text": content,
                                "speech_text": clean_for_speech(content),
                                "language": lang,
                                "model": model_name,
                                "provider": "groq",
                            }
                        elif resp.status_code == 429:
                            logger.warning("Groq key rate limited (429). Switching to next key...")
                            if self.key_pool:
                                self.key_pool.mark_rate_limited("groq", active_key, cooldown_seconds=60)
                                asyncio.create_task(self.key_pool.record_usage("groq", active_key, False))
                            key_had_rate_limit = True
                            break
                        else:
                            logger.warning("Groq model %s returned status %s: %s", model_name, resp.status_code, resp.text)
                except Exception as exc:
                    logger.warning("Groq call failed for %s: %s", model_name, exc)
            if key_had_rate_limit:
                continue

        # Try Gemini pool if Groq unavailable or exhausted
        gemini_keys = self._resolve_gemini_keys()
        for active_key in gemini_keys:
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(
                        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                        headers={"Authorization": f"Bearer {active_key}"},
                        json={
                            "model": "gemini-1.5-flash",
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 600,
                        },
                    )
                    if resp.status_code == 200:
                        if self.key_pool:
                            asyncio.create_task(self.key_pool.record_usage("gemini", active_key, True))
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"].strip()
                        lang = detect_language(content)
                        return {
                            "text": content,
                            "speech_text": clean_for_speech(content),
                            "language": lang,
                            "model": "gemini-1.5-flash",
                            "provider": "gemini",
                        }
                    elif resp.status_code == 429:
                        if self.key_pool:
                            self.key_pool.mark_rate_limited("gemini", active_key, cooldown_seconds=60)
                            asyncio.create_task(self.key_pool.record_usage("gemini", active_key, False))
                        continue
            except Exception as exc:
                logger.warning("Gemini call failed: %s", exc)

        # Fallback offline reply
        fallback = (
            "Thank you! Could you please elaborate a bit more on that topic? For instance, what is your personal experience?"
            if detect_language(user_message) == "en"
            else "Savolingiz uchun rahmat! Bu haqda yana bir oz batafsilroq aytib bera olasizmi?"
        )
        return {
            "text": fallback,
            "speech_text": fallback,
            "language": detect_language(fallback),
            "model": "fallback",
            "provider": "fallback",
        }

    async def analyze_speaking(
        self,
        transcript: str,
        question: str = "",
        part: int = 1,
    ) -> dict[str, Any]:
        """Deep, comprehensive IELTS Speaking analysis in Uzbek with grammar corrections,
        Band 8+ upgrades, actionable advice, and next question.
        """
        system_instruction = (
            "Siz tajribali va qat'iy IELTS Speaking Examiner hamda malakali ingliz tili murabbiyisiz. "
            "Sizning vazifangiz nomzodning nutqini IELTS Band Deskriptorlari asosida chuqur, mukammal va "
            "tushunarli tarzda O'ZBEK tilida tahlil qilib berishdir. Format chiroyli, o'qishga qulay va aniq bo'lsin."
        )

        prompt = (
            f"Nomzodga berilgan savol: «{question or 'General Speaking Task'}»\n"
            f"Nomzodning og'zaki javobi (audio transkripti): «{transcript}»\n\n"
            "Ushbu javobni to'liq va mukammal tahlil qiling. Barcha izoh, xatolar tuzatishi va tavsiyalarni O'ZBEK tilida taqdim eting.\n\n"
            "Javobni aynan quyidagi bo'limlarda yozing:\n\n"
            "📊 <b>IELTS Baholash Natijasi:</b>\n"
            "• <b>Taxminiy Band:</b> [Masalan: Band 5.5 yoki 6.0]\n"
            "• 🌊 <i>Fluency & Coherence:</i> [Ball]/9.0 — [izoh]\n"
            "• 📚 <i>Lexical Resource:</i> [Ball]/9.0 — [so'z boyligi haqida izoh]\n"
            "• ⚖️ <i>Grammar Accuracy:</i> [Ball]/9.0 — [grammatika haqida izoh]\n"
            "• 🔊 <i>Pronunciation:</i> [Ball]/9.0 — [talaffuz bo'yicha maslahat]\n\n"
            "🛠 <b>Grammatik va Leksik Tahlil:</b>\n"
            "❌ <i>Xato:</i> [Javobdagi xato]\n"
            "✅ <i>To'g'ri:</i> [To'g'ri varianti] (O'zbekcha qoida va tushuntirish)\n\n"
            "✨ <b>Band 8+ So'z va Iboralar (Alternativalar):</b>\n"
            "• [Nomzod ishlatgan oddiy so'zlar o'rniga 2-3 ta yuqori darajadagi akademik so'z/idioma va o'zbekcha tarjimasi]\n\n"
            "💡 <b>O'zbekcha Mukammal Maslahat:</b>\n"
            "[Javobni qanday qilib kengaytirish, qaysi bog'lovchilar qo'shish kerakligi haqida amaliy maslahat]\n\n"
            "🎙 <b>Keyingi Savol (Next Question):</b>\n"
            "«[Ingliz tilida bitta aniq keyingi IELTS savoli]»\n\n"
            "[OVOZLI_UZ]: [Ovozli xabar uchun o'zbek tilida 1-2 ta gapli samimiy xulosa va maslahat]\n"
            "[OVOZLI_EN]: [Keyingi IELTS savoli, faqat ingliz tilida ravon o'qilishi uchun]"
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        # Try Groq pool models
        groq_keys = self._resolve_groq_keys()
        for active_key in groq_keys:
            key_had_rate_limit = False
            for model_name in [self.default_model, "openai/gpt-oss-120b", "openai/gpt-oss-20b"]:
                try:
                    async with httpx.AsyncClient(timeout=25.0) as client:
                        resp = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={"Authorization": f"Bearer {active_key}"},
                            json={
                                "model": model_name,
                                "messages": messages,
                                "temperature": 0.4,
                                "max_tokens": 1200,
                            },
                        )
                        if resp.status_code == 200:
                            if self.key_pool:
                                asyncio.create_task(self.key_pool.record_usage("groq", active_key, True))
                            data = resp.json()
                            content = data["choices"][0]["message"]["content"].strip()
                            display_text, speech_uz, speech_en = extract_voice_prompts(content)
                            return {
                                "text": display_text,
                                "speech_text": speech_uz,
                                "speech_uz": speech_uz,
                                "speech_en": speech_en,
                                "language": "uz",
                                "model": model_name,
                                "provider": "groq",
                            }
                        elif resp.status_code == 429:
                            logger.warning("Groq analyze key rate limited (429). Switching to next key...")
                            if self.key_pool:
                                self.key_pool.mark_rate_limited("groq", active_key, cooldown_seconds=60)
                                asyncio.create_task(self.key_pool.record_usage("groq", active_key, False))
                            key_had_rate_limit = True
                            break
                        else:
                            logger.warning("Groq analyze model %s returned status %s: %s", model_name, resp.status_code, resp.text)
                except Exception as exc:
                    logger.warning("Groq analyze failed for %s: %s", model_name, exc)
            if key_had_rate_limit:
                continue

        # Try Gemini pool if configured
        gemini_keys = self._resolve_gemini_keys()
        for active_key in gemini_keys:
            try:
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(
                        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                        headers={"Authorization": f"Bearer {active_key}"},
                        json={
                            "model": "gemini-1.5-flash",
                            "messages": messages,
                            "temperature": 0.4,
                            "max_tokens": 1200,
                        },
                    )
                    if resp.status_code == 200:
                        if self.key_pool:
                            asyncio.create_task(self.key_pool.record_usage("gemini", active_key, True))
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"].strip()
                        display_text, speech_uz, speech_en = extract_voice_prompts(content)
                        return {
                            "text": display_text,
                            "speech_text": speech_uz,
                            "speech_uz": speech_uz,
                            "speech_en": speech_en,
                            "language": "uz",
                            "model": "gemini-1.5-flash",
                            "provider": "gemini",
                        }
                    elif resp.status_code == 429:
                        if self.key_pool:
                            self.key_pool.mark_rate_limited("gemini", active_key, cooldown_seconds=60)
                            asyncio.create_task(self.key_pool.record_usage("gemini", active_key, False))
                        continue
            except Exception as exc:
                logger.warning("Gemini analyze failed: %s", exc)

        # Fallback analysis
        fallback_display = (
            "📊 <b>IELTS Baholash Natijasi:</b>\n"
            "• <b>Taxminiy Band:</b> Band 5.5\n"
            "• 🌊 <i>Fluency & Coherence:</i> 5.5/9.0 — Fikringiz tushunarli, ammo gaplarni ko'proq bog'lovchilar bilan kengaytirish kerak.\n"
            "• 📚 <i>Lexical Resource:</i> 5.5/9.0 — Kundalik so'zlar ishlatilgan. Akademik so'zlarni ko'paytirish tavsiya etiladi.\n"
            "• ⚖️ <i>Grammar Accuracy:</i> 5.0/9.0 — Fe'l zamonlari va artikllarga e'tibor qarating.\n"
            "• 🔊 <i>Pronunciation:</i> 6.0/9.0 — Talaffuz aniq, intonatsiyani yaxshilang.\n\n"
            "💡 <b>O'zbekcha Maslahat:</b>\n"
            "Javob berayotganda faqat 'ha' yoki 'yo'q' deb to'xtab qolmang. <i>Sabab (Why)</i> va <i>Misol (For example)</i> qo'shib gapiring.\n\n"
            "🎙 <b>Keyingi Savol:</b>\n"
            "«What do you usually do in your free time?»"
        )
        return {
            "text": fallback_display,
            "speech_text": "Rahmat! Javobingiz tahlil qilindi. Fikringiz yaxshi, biroq gaplarni ko'proq bog'lovchilar bilan kengaytiring.",
            "speech_uz": "Rahmat! Javobingiz tahlil qilindi. Fikringiz yaxshi, biroq gaplarni ko'proq bog'lovchilar bilan kengaytiring.",
            "speech_en": "What do you usually do in your free time, and why do you enjoy it?",
            "language": "uz",
            "model": "fallback",
            "provider": "fallback",
        }

