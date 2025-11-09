from flask import Blueprint, jsonify, request

from ..services.deepseek_service import (
    build_health_prompt,
    call_deepseek_or_fallback,
)
from ..services.detect_diabetes import detect_diabetes_simple
from ..services.detect_heart import detect_heart_simple

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/diabetes", methods=["POST"])
def predict_diabetes():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "请求体不是有效的 JSON"}), 400

    required_fields = ["BloodPressure", "Age", "BMI", "Pregnancies"]
    missing = [field for field in required_fields if data.get(field) is None]
    if missing:
        return (
            jsonify({"error": f"缺少必要字段: {', '.join(missing)}"}),
            400,
        )

    try:
        input_data = [data[field] for field in required_fields]
        result = detect_diabetes_simple(input_data)
        return jsonify(result), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@predict_bp.route("/heart/predict", methods=["POST"])
def predict_heart():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "请求体不是有效的 JSON"}), 400

    required_fields = [
        "age",
        "has_anaemia",
        "Diabetes",
        "HighBP",
        "Sex",
        "Smoker",
    ]
    missing = [field for field in required_fields if data.get(field) is None]
    if missing:
        return (
            jsonify({"error": f"缺少必要字段: {', '.join(missing)}"}),
            400,
        )

    try:
        input_data = [data.get(field) for field in required_fields]
        result = detect_heart_simple(input_data)
        return jsonify(result), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@predict_bp.route("/health_prompt", methods=["POST"])
def create_health_prompt():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "请求体不是有效的 JSON"}), 400

    task_name = data.get("task_name", "")
    inputs = data.get("inputs", {})
    prediction = data.get("prediction", 0)
    probability = data.get("probability", [0.0, 0.0])

    try:
        prompt = build_health_prompt(task_name, inputs, prediction, probability)
        return jsonify({"prompt": prompt}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@predict_bp.route("/deepseek_call", methods=["POST"])
def call_deepseek():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "请求体不是有效的 JSON"}), 400

    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "缺少 prompt"}), 400

    try:
        result = call_deepseek_or_fallback(prompt)
        return jsonify({"result": result}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
