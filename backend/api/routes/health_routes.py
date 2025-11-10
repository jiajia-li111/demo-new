from flask import Blueprint, jsonify, request

from ..services.current_data import data_processor
from ..services.data_gather import unified_processor

health_bp = Blueprint("health", __name__)


@health_bp.route("/start", methods=["POST"])
def start_monitoring():
    data_processor.start_monitoring()
    return jsonify({"message": "实时监测已启动"}), 200


@health_bp.route("/stop", methods=["POST"])
def stop_monitoring():
    data_processor.stop_monitoring()
    return jsonify({"message": "实时监测已停止"}), 200


@health_bp.route("/data", methods=["GET"])
def get_monitoring_data():
    return jsonify(data_processor.get_current_display_data()), 200


@health_bp.route("/summary", methods=["GET"])
def get_monitoring_summary():
    return jsonify(data_processor.get_vital_signs_summary()), 200


@health_bp.route("/health/report", methods=["POST"])
def get_health_report():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id", "anonymous")
    report = unified_processor.get_comprehensive_health_report(user_id)
    return jsonify(report), 200


@health_bp.route("/health/save", methods=["POST"])
def save_health_report():
    payload = request.get_json(silent=True) or {}

    if "report" in payload and isinstance(payload["report"], dict):
        report = payload["report"]
    else:
        user_id = payload.get("user_id", "anonymous")
        report = unified_processor.get_comprehensive_health_report(user_id)

    try:
        reference = unified_processor.save_health_report(report)
        return (
            jsonify(
                {
                    "success": True,
                    "message": "健康报告已保存",
                    "reference": reference,
                }
            ),
            200,
        )
    except Exception as exc:
        return (
            jsonify({"success": False, "message": f"保存失败: {exc}"}),
            500,
        )


@health_bp.route("/health/trends", methods=["GET"])
def get_health_trends():
    user_id = request.args.get("user_id", "anonymous")
    try:
        days = int(request.args.get("days", 7))
    except ValueError:
        return jsonify({"error": "days 参数必须为整数"}), 400

    trends = unified_processor.get_health_trends(user_id, days=days)
    return jsonify(trends), 200