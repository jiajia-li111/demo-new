import json

from flask import Blueprint, jsonify, request

from ..services.user_data import user_manager

user_bp = Blueprint("user", __name__)


@user_bp.route("/user/save", methods=["POST"])
def save_user():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id", "anonymous")
    form_data = payload.get("form_data", {})
    predictions = payload.get("predictions", {})

    try:
        user_manager.save_user_data(user_id, form_data, predictions)
        return (
            jsonify(
                {
                    "success": True,
                    "message": "用户数据保存成功",
                }
            ),
            200,
        )
    except Exception as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"保存失败: {exc}",
                }
            ),
            500,
        )


@user_bp.route("/list_users", methods=["GET"])
def list_users():
    try:
        records = user_manager.get_saved_users()
        users = [
            {
                "id": record["id"],
                "user_id": record["user_id"],
                "timestamp": record["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
            }
            for record in records
        ]
        return (
            jsonify(
                {
                    "success": True,
                    "count": len(users),
                    "users": users,
                }
            ),
            200,
        )
    except Exception as exc:
        return (
            jsonify({"success": False, "message": str(exc)}),
            500,
        )


@user_bp.route("/user/load", methods=["POST"])
def load_user():
    payload = request.get_json(silent=True) or {}
    record_id = payload.get("id")

    if record_id is None:
        return jsonify({"success": False, "message": "缺少 id 参数"}), 400

    try:
        record = user_manager.load_user_data(record_id)
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500

    if not record:
        return jsonify({"success": False, "message": "记录不存在"}), 404

    try:
        form_data = json.loads(record["form_data"])
        predictions = json.loads(record["predictions"])
    except (TypeError, json.JSONDecodeError):
        form_data = record["form_data"]
        predictions = record["predictions"]

    response = {
        "success": True,
        "message": "加载成功",
        "data": {
            "id": record["id"],
            "user_id": record["user_id"],
            "timestamp": record["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
            "form_data": form_data,
            "predictions": predictions,
        },
    }
    return jsonify(response), 200


@user_bp.route("/user/delete", methods=["POST"])
def delete_user():
    payload = request.get_json(silent=True) or {}
    record_id = payload.get("id")

    if record_id is None:
        return jsonify({"success": False, "message": "缺少 id 参数"}), 400

    try:
        deleted = user_manager.delete_user_data(record_id)
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500

    if not deleted:
        return jsonify({"success": False, "message": "记录不存在"}), 404

    return jsonify({"success": True, "message": "删除成功"}), 200
