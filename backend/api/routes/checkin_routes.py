from flask import Blueprint, jsonify, request

from ..services.checkin_service import checkin_manager

checkin_bp = Blueprint("checkin", __name__)


@checkin_bp.route("/checkin", methods=["POST"])
def create_checkin():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "缺少 user_id 参数"}), 400

    try:
        result = checkin_manager.create_checkin(user_id)
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500

    return (
        jsonify(
            {
                "success": True,
                "checked_in": result["checked_in"],
                "message": result["message"],
            }
        ),
        200,
    )


@checkin_bp.route("/checkin/status", methods=["GET"])
def checkin_status():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "缺少 user_id 参数"}), 400

    try:
        status = checkin_manager.get_status(user_id)
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500

    return jsonify({"success": True, "data": status}), 200
