from packages.ieltix_core.ports.voice import SpeechAudio, SpeechToText, TextToSpeech, Transcript


class LocalTextSpeechToText(SpeechToText):
    """Credential-free adapter for development; accepts UTF-8 text as audio payload."""

    async def transcribe(self, audio: bytes, mime_type: str, language_hint: str | None) -> Transcript:
        if mime_type != "text/plain":
            raise RuntimeError("Remote STT is not configured; use typed input")
        return Transcript(audio.decode("utf-8"), language_hint or "en", 1.0)


class NoAudioTextToSpeech(TextToSpeech):
    async def synthesize(self, text: str, language: str) -> SpeechAudio:
        return SpeechAudio(content=b"", mime_type="text/plain")
