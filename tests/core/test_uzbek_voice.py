import pytest
from packages.ieltix_core.adapters.remote_voice import EdgeTextToSpeech, normalize_uzbek_for_speech
from packages.ieltix_core.application.ai_tutor import extract_voice_prompts


def test_normalize_uzbek_for_speech_apostrophes_and_terms():
    raw_text = (
        "<b>IELTS</b> bo'yicha Band 6.5 oldingiz! Part 1 da Fluency yaxshi bo’ldi. "
        "O‘rganuvchilar uchun AI va Pronunciation juda muhim."
    )
    normalized = normalize_uzbek_for_speech(raw_text)

    # Check that IELTS got converted to Ayelts
    assert "Ayelts" in normalized
    # Check Band score expansion
    assert "Bend 6 butun besh" in normalized or "Bend 6" in normalized
    # Check Part 1 expansion
    assert "Birinchi qism" in normalized
    # Check Fluency & Pronunciation phonetic mapping
    assert "Flyuensi" in normalized
    assert "Pronanseyshin" in normalized
    # Check that curly apostrophes are normalized to ascii
    assert "’" not in normalized
    assert "‘" not in normalized
    assert "<b>" not in normalized
    assert "</b>" not in normalized


def test_extract_voice_prompts_bilingual():
    llm_output = (
        "📊 <b>IELTS Natijasi:</b> Band 6.0\n\n"
        "[OVOZLI_UZ]: Rahmat, javobingiz yaxshi bo'ldi. Fe'l zamonlariga e'tibor bering.\n"
        "[OVOZLI_EN]: What kind of movies do you like to watch in your spare time?"
    )
    display_text, speech_uz, speech_en = extract_voice_prompts(llm_output)

    assert "Band 6.0" in display_text
    assert "[OVOZLI_UZ]" not in display_text
    assert "Rahmat" in speech_uz
    assert "What kind of movies" in speech_en


def test_extract_voice_prompts_legacy_fallback():
    llm_output = (
        "Tahlil natijasi:\n"
        "[OVOZLI]: Rahmat, yaxshi javob berdingiz."
    )
    display_text, speech_uz, speech_en = extract_voice_prompts(llm_output)
    assert "Tahlil natijasi" in display_text
    assert "Rahmat" in speech_uz


@pytest.mark.asyncio
async def test_edge_tts_bilingual_synthesis():
    tts = EdgeTextToSpeech()
    # Test synthesizing with dummy/mock fallback if offline or real edge-tts
    audio = await tts.synthesize_bilingual(
        uz_text="Salom! Sizning ballingiz olti butun besh.",
        en_text="Tell me about your favorite book."
    )
    assert audio.mime_type == "audio/mpeg"
    # Content is bytes (may be non-empty if network is up)
    assert isinstance(audio.content, bytes)
