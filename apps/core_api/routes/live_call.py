from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel, Field

from packages.ieltix_core.adapters.repositories import SqlAlchemyLiveCallRepository
from packages.ieltix_core.application.examiner import ExaminerService, SpeakingSession
from packages.ieltix_core.security.tokens import CallTokenError, CallTokenService

router = APIRouter(prefix="/api/live-call", tags=["live-call"])


class CreateCallRequest(BaseModel):
    user_id: int = Field(gt=0)
    locale: str = Field(pattern="^(uz|en)$")


class TextTurnRequest(BaseModel):
    token: str = Field(min_length=20)
    user_id: int = Field(gt=0)
    text: str = Field(min_length=1, max_length=5000)


def _tokens(request: Request) -> CallTokenService:
    settings = request.app.state.settings
    return CallTokenService(settings.call_token_secret, settings.call_token_ttl_seconds)


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    body: CreateCallRequest,
    request: Request,
    x_internal_key: str | None = Header(default=None),
) -> dict:
    settings = request.app.state.settings
    if not x_internal_key or x_internal_key != settings.call_token_secret:
        raise HTTPException(status_code=401, detail="invalid internal credential")
    session_id = f"call-{uuid4().hex}"
    call = SpeakingSession(session_id, body.user_id, body.locale)
    async with request.app.state.database.session() as db_session:
        await SqlAlchemyLiveCallRepository(db_session).create(call)
    token = _tokens(request).issue(body.user_id, session_id)
    opening = ExaminerService().opening(call)
    return {
        "session_id": session_id,
        "token": token,
        "opening": opening.examiner_text,
        "locale": body.locale,
    }


@router.post("/turns/text")
async def process_text_turn(body: TextTurnRequest, request: Request) -> dict:
    try:
        claims = _tokens(request).verify(body.token, expected_user_id=body.user_id)
    except CallTokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    async with request.app.state.database.session() as db_session:
        repository = SqlAlchemyLiveCallRepository(db_session)
        call = await repository.get(claims.session_id)
        if call is None or call.user_id != body.user_id:
            raise HTTPException(status_code=404, detail="live call session not found")
        try:
            turn = ExaminerService().process_turn(call, body.text)
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        await repository.save_turn(
            call, body.text, turn.examiner_text, turn.detected_language
        )
        if turn.report:
            await repository.save_report(call.id, turn.report)
    return {
        "session_id": call.id,
        "examiner_text": turn.examiner_text,
        "detected_language": turn.detected_language,
        "part": turn.part,
        "completed": turn.completed,
        "report": turn.report.as_feedback() | {"band": turn.report.band} if turn.report else None,
    }
