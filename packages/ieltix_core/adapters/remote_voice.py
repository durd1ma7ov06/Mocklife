import asyncio
import io
import logging
from typing import Any, Optional

import httpx

from packages.ieltix_core.ports.voice import SpeechAudio, SpeechToText, TextToSpeech, Transcript

logger = logging.getLogger(__name__)


class RemoteGroqSpeechToText(SpeechToText):
    """Transcribes audio using Groq Whisper API (whisper-large-v3) with multi-key failover."""

    def __init__(
        self,
        api_key: str = "",
        model: str = "whisper-large-v3",
        timeout_seconds: float = 18.0,
        key_pool: Optional[Any] = None,
    ) -> None:
        self.api_key = api_key.strip()
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.key_pool = key_pool

    async def transcribe(self, audio: bytes, mime_type: str, language_hint: Optional[str] = None) -> Transcript:
        from packages.ieltix_core.application.key_pool import get_key_pool

        pool = self.key_pool or get_key_pool()
        keys = pool.get_groq_keys() if pool else []
        if not keys and self.api_key:
            keys = [self.api_key]
        if not keys:
            raise RuntimeError("GROQ_API_KEY is not configured for remote STT")

        url = "https://api.groq.com/openai/v1/audio/transcriptions"
        if "ogg" in mime_type or "oga" in mime_type:
            filename = "audio.ogg"
        elif "wav" in mime_type:
            filename = "audio.wav"
        else:
            filename = "audio.webm"

        files = {"file": (filename, audio, mime_type)}
        data = {"model": self.model, "response_format": "json"}
        if language_hint:
            data["language"] = language_hint

        last_error = ""
        for key in keys:
            headers = {"Authorization": f"Bearer {key}"}
            try:
                async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                    response = await client.post(url, headers=headers, files=files, data=data)
                    if response.status_code == 200:
                        if pool:
                            asyncio.create_task(pool.record_usage("groq", key, True))
                        result = response.json()
                        text = result.get("text", "").strip()
                        return Transcript(text=text, language=language_hint or "en", confidence=0.95)
                    elif response.status_code == 429:
                        logger.warning("Groq STT key %s rate-limited (429), switching to next key...", key[:8])
                        if pool:
                            pool.mark_rate_limited("groq", key, cooldown_seconds=60)
                            asyncio.create_task(pool.record_usage("groq", key, False))
                        last_error = f"Rate limited (429): {response.text}"
                        continue
                    else:
                        logger.error("Groq STT failed: %s %s", response.status_code, response.text)
                        last_error = f"Groq STT error ({response.status_code}): {response.text}"
            except Exception as exc:
                logger.warning("Groq STT attempt failed for key: %s", exc)
                last_error = str(exc)

        raise RuntimeError(f"All Groq STT keys failed. Last error: {last_error}")


import re


def normalize_uzbek_for_speech(text: str) -> str:
    """Normalizes Uzbek text for natural and flawless pronunciation with Microsoft Neural TTS.

    1. Removes HTML tags and formatting.
    2. Replaces curly/modifier apostrophes (`’`, `‘`, `ʻ`, `ʼ`, ``` ` ```) with standard ascii `'`.
    3. Converts IELTS and exam terminology to Uzbek phonetic approximations (e.g. IELTS -> Ayelts, Band 6.5 -> Bend olti butun besh).
    4. Strips markdown and non-verbal emojis/symbols.
    """
    if not text:
        return ""

    t = text
    # Strip HTML tags
    t = re.sub(r"<[^>]+>", " ", t)

    # Normalize various unicode apostrophes
    t = re.sub(r"[\u2018\u2019\u02BB\u02BC`´]", "'", t)

    # IELTS terminology and score phonetic mapping for fluent speech
    replacements = [
        (r"\bIELTS\b", "Ayelts"),
        (r"\bBand\s*(\d+)\.5\b", r"Bend \1 butun besh"),
        (r"\bBand\s*(\d+)\.0\b", r"Bend \1"),
        (r"\bBand\s*(\d+)\b", r"Bend \1"),
        (r"\b(\d+)\.5\b", r"\1 butun besh"),
        (r"\b(\d+)\.0\b", r"\1"),
        (r"\bPart\s*1\b", "Birinchi qism"),
        (r"\bPart\s*2\b", "Ikkinchi qism"),
        (r"\bPart\s*3\b", "Uchinchi qism"),
        (r"\bTask\s*1\b", "Birinchi topshiriq"),
        (r"\bTask\s*2\b", "Ikkinchi topshiriq"),
        (r"\bCue\s*Card\b", "Kyu kard"),
        (r"\bFluency\b", "Flyuensi"),
        (r"\bCoherence\b", "Kogerens"),
        (r"\bLexical\s*Resource\b", "Leksik boylik"),
        (r"\bGrammatical\s*Accuracy\b", "Grammatik aniqlik"),
        (r"\bGrammar\b", "Grammatika"),
        (r"\bPronunciation\b", "Pronanseyshin"),
        (r"\bExaminer\b", "Ekzaminer"),
        (r"\bAI\b", "Ey-Ay"),
    ]
    for pattern, repl in replacements:
        t = re.sub(pattern, repl, t, flags=re.IGNORECASE)

    # Strip markdown symbols
    t = re.sub(r"[\*\_#~>\[\]\(\)]", " ", t)

    # Strip emojis and unsupported symbols, keep Latin, Cyrillic, apostrophes, and basic punctuation
    t = re.sub(r"[^\w\s\.,!\?':;\-]", " ", t, flags=re.UNICODE)

    # Collapse multiple whitespaces
    t = re.sub(r"\s+", " ", t).strip()
    return t


class EdgeTextToSpeech(TextToSpeech):
    """Synthesizes text to speech using edge-tts (bilingual Uzbek & English)."""

    def __init__(
        self,
        voice_uz: str = "uz-UZ-MadinaNeural",
        voice_en: str = "en-GB-RyanNeural",
        rate: str = "+0%",
        pitch: str = "+0Hz",
    ) -> None:
        self.voice_uz = voice_uz
        self.voice_en = voice_en
        self.rate = rate
        self.pitch = pitch

    async def _synthesize_raw(self, text: str, voice: str) -> bytes:
        if not text.strip():
            return b""
        try:
            import edge_tts

            communicate = edge_tts.Communicate(text=text, voice=voice, rate=self.rate, pitch=self.pitch)
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            return audio_buffer.getvalue()
        except Exception as exc:
            logger.warning("Edge-TTS synthesis failed (%s): %s", voice, exc)
            return b""

    async def synthesize(self, text: str, language: str = "uz") -> SpeechAudio:
        if language == "uz":
            clean_text = normalize_uzbek_for_speech(text)
            voice = self.voice_uz
        else:
            clean_text = re.sub(r"<[^>]+>", " ", text)
            clean_text = re.sub(r"[\*\_#~>\[\]\(\)]", " ", clean_text)
            clean_text = re.sub(r"\s+", " ", clean_text).strip()
            voice = self.voice_en

        audio_bytes = await self._synthesize_raw(clean_text, voice)
        return SpeechAudio(content=audio_bytes, mime_type="audio/mpeg")

    async def synthesize_bilingual(self, uz_text: str = "", en_text: str = "") -> SpeechAudio:
        """Synthesizes bilingual voice audio:
        - Uzbek feedback/advice spoken natively by `uz-UZ-MadinaNeural` with Uzbek phonetic normalization.
        - English question or cue card prompt spoken natively by `en-GB-RyanNeural` (British IELTS Examiner).
        Both segments are merged into a single continuous MP3 voice file.
        """
        uz_bytes = b""
        en_bytes = b""

        if uz_text and uz_text.strip():
            clean_uz = normalize_uzbek_for_speech(uz_text)
            uz_bytes = await self._synthesize_raw(clean_uz, self.voice_uz)

        if en_text and en_text.strip():
            clean_en = re.sub(r"<[^>]+>", " ", en_text)
            clean_en = re.sub(r"[\*\_#~>\[\]\(\)]", " ", clean_en)
            clean_en = re.sub(r"\s+", " ", clean_en).strip()
            en_bytes = await self._synthesize_raw(clean_en, self.voice_en)

        combined = uz_bytes + en_bytes
        return SpeechAudio(content=combined, mime_type="audio/mpeg")
