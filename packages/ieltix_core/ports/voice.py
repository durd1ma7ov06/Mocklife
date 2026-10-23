from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True, slots=True)
class Transcript:
    text: str
    language: str
    confidence: float | None = None


@dataclass(frozen=True, slots=True)
class SpeechAudio:
    content: bytes
    mime_type: str


class SpeechToText(Protocol):
    async def transcribe(self, audio: bytes, mime_type: str, language_hint: str | None) -> Transcript: ...


class TextToSpeech(Protocol):
    async def synthesize(self, text: str, language: str) -> SpeechAudio: ...
