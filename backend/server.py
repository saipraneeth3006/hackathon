from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VALID_ACTIONS = {
    "check_balance", "recent_transactions", "send_money", "pay_bill",
    "mobile_recharge", "show_beneficiaries", "show_notifications",
    "go_back", "cancel", "help", "logout", "unknown",
}
VALID_BILLS = {"electricity", "water", "internet", "mobile", "other"}

SYSTEM_PROMPT = (
    "You are the command understanding engine for a simulated banking app called DevoicePay. "
    "Convert the user's request (voice or typed) into a single JSON intent object. "
    "Respond with ONLY the JSON object. No markdown, no code fences, no explanation.\n\n"
    "Schema: {\"action\": string, \"amount\": number|null, \"recipient\": string|null, \"bill_type\": string|null}\n"
    "action must be exactly one of: check_balance, recent_transactions, send_money, pay_bill, "
    "mobile_recharge, show_beneficiaries, show_notifications, go_back, cancel, help, logout, unknown.\n"
    "amount = number of rupees when a money/recharge amount is mentioned, else null.\n"
    "recipient = the person's name to send money to, else null.\n"
    "bill_type = one of electricity, water, internet, mobile, other when paying a bill, else null.\n\n"
    "Examples:\n"
    "'What is my balance?' -> {\"action\":\"check_balance\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Show my previous transactions' -> {\"action\":\"recent_transactions\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Send 500 rupees to Rahul' -> {\"action\":\"send_money\",\"amount\":500,\"recipient\":\"Rahul\",\"bill_type\":null}\n"
    "'Transfer 1200 to Priya' -> {\"action\":\"send_money\",\"amount\":1200,\"recipient\":\"Priya\",\"bill_type\":null}\n"
    "'Pay my electricity bill' -> {\"action\":\"pay_bill\",\"amount\":null,\"recipient\":null,\"bill_type\":\"electricity\"}\n"
    "'Recharge my mobile' -> {\"action\":\"mobile_recharge\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Show my beneficiaries' -> {\"action\":\"show_beneficiaries\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Show notifications' -> {\"action\":\"show_notifications\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Go back' -> {\"action\":\"go_back\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Cancel' -> {\"action\":\"cancel\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Help' -> {\"action\":\"help\",\"amount\":null,\"recipient\":null,\"bill_type\":null}\n"
    "'Log me out' -> {\"action\":\"logout\",\"amount\":null,\"recipient\":null,\"bill_type\":null}"
)


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_name: str


class CommandRequest(BaseModel):
    text: str


class CommandIntent(BaseModel):
    action: str = "unknown"
    amount: Optional[float] = None
    recipient: Optional[str] = None
    bill_type: Optional[str] = None


def _sanitize(data: dict) -> CommandIntent:
    action = str(data.get("action", "unknown")).strip().lower()
    if action not in VALID_ACTIONS:
        action = "unknown"
    amount = data.get("amount")
    try:
        amount = float(amount) if amount is not None else None
    except (TypeError, ValueError):
        amount = None
    recipient = data.get("recipient")
    if recipient is not None:
        recipient = str(recipient).strip() or None
    bill = data.get("bill_type")
    if bill is not None:
        bill = str(bill).strip().lower()
        if bill not in VALID_BILLS:
            bill = "other" if action == "pay_bill" else None
    return CommandIntent(action=action, amount=amount, recipient=recipient, bill_type=bill)


@api_router.get("/")
async def root():
    return {"message": "DevoicePay API running"}


@api_router.post("/parse-command", response_model=CommandIntent)
async def parse_command(req: CommandRequest):
    text = (req.text or "").strip()
    if not text:
        return CommandIntent(action="unknown")
    if not EMERGENT_LLM_KEY:
        return CommandIntent(action="unknown")
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="voicebank-command-parser",
            system_message=SYSTEM_PROMPT,
        ).with_model("openai", "gpt-5.4-mini")
        reply = await chat.send_message(UserMessage(text=text))
        raw = reply if isinstance(reply, str) else str(reply)
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return CommandIntent(action="unknown")
        data = json.loads(match.group(0))
        return _sanitize(data)
    except Exception as e:
        logger.error(f"parse-command error: {e}")
        return CommandIntent(action="unknown")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
