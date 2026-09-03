"""Backend tests for VoiceBank POST /api/parse-command."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://voicebank-access.preview.emergentagent.com").rstrip("/")
ENDPOINT = f"{BASE_URL}/api/parse-command"


def _post(text):
    r = requests.post(ENDPOINT, json={"text": text}, timeout=60)
    assert r.status_code == 200, f"HTTP {r.status_code}: {r.text}"
    return r.json()


class TestParseCommand:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200

    def test_send_money(self):
        d = _post("Send 500 rupees to Rahul")
        assert d["action"] == "send_money"
        assert d["amount"] == 500
        assert (d["recipient"] or "").lower() == "rahul"

    def test_check_balance(self):
        d = _post("what is my balance")
        assert d["action"] == "check_balance"

    def test_recent_transactions(self):
        d = _post("show recent transactions")
        assert d["action"] == "recent_transactions"

    def test_pay_bill_electricity(self):
        d = _post("pay my electricity bill")
        assert d["action"] == "pay_bill"
        assert d["bill_type"] == "electricity"

    def test_mobile_recharge(self):
        d = _post("recharge my mobile")
        assert d["action"] == "mobile_recharge"

    def test_beneficiaries(self):
        d = _post("show beneficiaries")
        assert d["action"] == "show_beneficiaries"

    def test_notifications(self):
        d = _post("show notifications")
        assert d["action"] == "show_notifications"

    def test_help(self):
        d = _post("help")
        assert d["action"] == "help"

    def test_go_back(self):
        d = _post("go back")
        assert d["action"] == "go_back"

    def test_cancel(self):
        d = _post("cancel")
        assert d["action"] == "cancel"

    def test_empty(self):
        d = _post("")
        assert d["action"] == "unknown"
