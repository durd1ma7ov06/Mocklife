import base64

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from packages.ieltix_core.adapters.local_voice import LocalTextSpeechToText, NoAudioTextToSpeech
from packages.ieltix_core.adapters.repositories import SqlAlchemyLiveCallRepository
from packages.ieltix_core.application.examiner import ExaminerService
from packages.ieltix_core.security.tokens import CallTokenError, CallTokenService

router = APIRouter(prefix="/api/live-call", tags=["voice"])

ALLOWED_MIME_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/x-m4a",
    "audio/aac",
    "text/plain",
}
MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10 MB


def _tokens(request: Request) -> CallTokenService:
    settings = request.app.state.settings
    return CallTokenService(settings.call_token_secret, settings.call_token_ttl_seconds)


@router.post("/turns/audio", status_code=status.HTTP_200_OK)
async def process_audio_turn(
    request: Request,
    token: str = Form(...),
    user_id: int = Form(...),
    audio: UploadFile = File(...),
) -> dict:
    try:
        claims = _tokens(request).verify(token, expected_user_id=user_id)
    except CallTokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    content_type = (audio.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio media type '{content_type}'. Supported: {sorted(ALLOWED_MIME_TYPES)}",
        )

    content = await audio.read()
    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Audio payload exceeds maximum size of {MAX_AUDIO_BYTES} bytes",
        )

    async with request.app.state.database.session() as db_session:
        repository = SqlAlchemyLiveCallRepository(db_session)
        call = await repository.get(claims.session_id)
        if call is None or call.user_id != user_id:
            raise HTTPException(status_code=404, detail="live call session not found")

        stt = getattr(request.app.state, "stt", None) or LocalTextSpeechToText()
        try:
            transcript_result = await stt.transcribe(content, content_type, language_hint=call.locale)
        except Exception as exc:
            raise HTTPException(
                status_code=422,
                detail=f"Audio transcription failed: {exc}",
            ) from exc

        try:
            turn = ExaminerService().process_turn(call, transcript_result.text)
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

        await repository.save_turn(
            call, transcript_result.text, turn.examiner_text, turn.detected_language
        )
        if turn.report:
            await repository.save_report(call.id, turn.report)

        tts = getattr(request.app.state, "tts", None) or NoAudioTextToSpeech()
        speech = await tts.synthesize(turn.examiner_text, turn.detected_language)

    return {
        "session_id": call.id,
        "transcript": transcript_result.text,
        "examiner_text": turn.examiner_text,
        "detected_language": turn.detected_language,
        "part": turn.part,
        "completed": turn.completed,
        "report": turn.report.as_feedback() | {"band": turn.report.band} if turn.report else None,
        "audio_base64": base64.b64encode(speech.content).decode("ascii") if speech.content else None,
        "audio_mime_type": speech.mime_type if speech.content else None,
    }
