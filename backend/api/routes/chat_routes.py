# backend/api/routes/chat_routes.py

from flask import Blueprint, request, jsonify
from ..services.chat_service import chat_with_health_bot

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route("/chat/completion", methods=["POST"])
def chat_completion():
    data = request.json
    user_id = data.get("user_id")
    messages = data.get("messages", [])
    
    if not messages:
        return jsonify({"error": "No messages"}), 400

    try:
        reply = chat_with_health_bot(user_id, messages)
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"success": False, "error": "AI 服务暂时不可用"}), 500