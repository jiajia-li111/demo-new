
from healthdevicer import device_simulator
from data_gather import unified_processor
from current_data import data_processor
from user_data import user_manager,build_health_prompt,call_deepseek_or_fallback
from detect_diabetes import detect_diabetes_simple
from detect_heart import detect_heart_simple
from flask import Flask, jsonify, request
from auth import register_user, login_user
from database import init_db

app = Flask(__name__)

init_db()

@app.route("/start", methods=["POST"])
def start_monitoring_api():
    data_processor.start_monitoring()
    return jsonify({"message": "实时监测已启动"}), 200

@app.route("/stop", methods=["POST"])
def stop_monitoring_api():
    data_processor.stop_monitoring()
    return jsonify({"message": "实时监测已停止"}), 200

@app.route("/data", methods=["GET"])
def get_data_api():
    """获取实时数据（带历史）"""
    return jsonify(data_processor.get_current_display_data()), 200

@app.route("/summary", methods=["GET"])
def get_summary_api():
    """获取实时数据摘要"""
    return jsonify(data_processor.get_vital_signs_summary()), 200

#健康报告方面
@app.route("/health/report",methods=["POST"])
def get_report_api():
    # 从前端请求体获取 JSON 数据
        data = request.get_json() or {}
        user_id = data.get("user_id", "anonymous")  # 如果没有传，就用默认值 "anonymous"

        # 生成综合健康报告
        report = unified_processor.get_comprehensive_health_report(user_id)

        return jsonify(report), 200
    
@app.route("/health/save",methods=["POST"])
def get_save_api():
    data = request.get_json() or {}
    user_id = data.get("user_id", "anonymous")  # 如果没有传，就用默认值 "anonymous"
    report = unified_processor.get_comprehensive_health_report(user_id)
    filepath=unified_processor.save_health_report(report)
    return jsonify(filepath), 200


@app.route("/health/trends", methods=["GET"])
def get_trends_api():
    user_id = request.args.get("user_id", "anonymous")
    days = int(request.args.get("days", 7))
    trends = unified_processor.get_health_trends(user_id, days=days)
    return jsonify(trends), 200

@app.route("/diabetes",methods=["POST"])
def predict_diabetes_api():
    try:
        # 获取前端传过来的 JSON
        data = request.get_json()

        # 按照函数的输入格式取出数据（list）
        # 这里要求前端传 ["BloodPressure", "Age", "BMI", "Pregnancies"] 四个值
        input_data = [
            data.get("BloodPressure"),
            data.get("Age"),
            data.get("BMI"),
            data.get("Pregnancies")
        ]

        # 调用你写好的函数
        result = detect_diabetes_simple(input_data)

        # 返回 JSON
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/heart/predict",methods=["POST"])
def predict_heart_api():
    try:
        # 获取前端传过来的 JSON
        data = request.get_json()

        input_data = [
            data.get("age"),
            data.get("has_anaemia"),      # 是否贫血，1/0
            data.get("Diabetes"),     # 是否糖尿病，1/0
            data.get("HighBP"),       # 是否高血压，1/0
            data.get("Sex"),          # 男=1，女=0
            data.get("Smoker")        # 吸烟=1，不吸烟=0
        ]

        # 调用你写好的函数
        result = detect_heart_simple(input_data)

        # 返回 JSON
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/user/save", methods=["POST"])
def save_user_api():
    data = request.get_json() or {}
    user_id = data.get("user_id", "anonymous")
    form_data = data.get("form_data", {})
    predictions = data.get("predictions", {})

    path = user_manager.save_user_data(user_id, form_data, predictions)
    return jsonify({"message": "保存成功", "path": path}), 200

@app.route("/list_users", methods=["GET"])
def list_users():
    """返回所有历史记录文件名"""
    try:
        files = user_manager.get_saved_users()
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/user/load", methods=["POST"])
def load_user_api():
    data = request.get_json() or {}
    filename = data.get("filename")

    if not filename:
        return jsonify({"message": "缺少 filename"}), 400

    user_data = user_manager.load_user_data(filename)
    if user_data:
        return jsonify({"message": "加载成功", "data": user_data}), 200
    else:
        return jsonify({"message": "文件不存在"}), 404

@app.route("/user/delete", methods=["POST"])
def delete_user_api():
    data = request.get_json() or {}
    filename = data.get("filename")

    if not filename:
        return jsonify({"message": "缺少 filename"}), 400

    if user_manager.delete_user_data(filename):
        return jsonify({"message": "删除成功"}), 200
    else:
        return jsonify({"message": "文件不存在"}), 404

@app.route("/health_prompt", methods=["POST"])
def health_prompt():
    """
    接收前端传来的 JSON 参数，调用 build_health_prompt，返回提示词
    """
    try:
        data = request.get_json(force=True)
        task_name = data.get("task_name", "")
        inputs = data.get("inputs", {})
        prediction = data.get("prediction", 0)
        probability = data.get("probability", [0.0, 0.0])

        prompt = build_health_prompt(task_name, inputs, prediction, probability)

        return jsonify({"prompt": prompt})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/deepseek_call", methods=["POST"])
def deepseek_call():
    """
    接收 prompt，调用 DeepSeek 或返回兜底健康建议
    """
    try:
        data = request.get_json(force=True)
        prompt = data.get("prompt", "")

        if not prompt.strip():
            return jsonify({"error": "缺少 prompt"}), 400

        result = call_deepseek_or_fallback(prompt)
        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    return jsonify(register_user(data["username"], data["password"]))

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    return jsonify(login_user(data["username"], data["password"]))

if __name__ == "__main__":
    app.run(debug=True)