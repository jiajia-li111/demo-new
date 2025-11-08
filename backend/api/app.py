from flask import Flask, jsonify, request
import json
import os, sys

# === 确保 Python 能找到同级目录下的模块 ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# === 本地模块导入 ===
from .services.data_gather import unified_processor
from .services.healthdevicer import device_simulator
from .services.current_data import data_processor
from .services.user_data import user_manager
from .services.detect_diabetes import detect_diabetes_simple
from .services.detect_heart import detect_heart_simple
from .services.deepseek_service import build_health_prompt, call_deepseek_or_fallback
from .utils.database import init_db
from .routes.login import register_user, login_user

# === Flask 应用 ===
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
    
@app.route("/health/save", methods=["POST"])
def save_health_report_api():
    """保存健康报告"""
    try:
        data = request.get_json() or {}
        # 优先使用前端传入的report，否则重新生成
        if "report" in data:
            report = data["report"]
        else:
            user_id = data.get("user_id", "anonymous")
            report = unified_processor.get_comprehensive_health_report(user_id)

        save_result = unified_processor.save_health_report(report)

        return jsonify({
            "success": True,
            "message": "健康报告已保存",
            "reference": save_result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"保存失败: {str(e)}"
        }), 500



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
        import traceback
        traceback.print_exc()   # 👈 打印完整错误堆栈
        return jsonify({"error": str(e)}), 500
    
@app.route("/heart/predict", methods=["POST"])
def predict_heart_api():
    try:
        # 获取前端 JSON
        data = request.get_json(force=True)

        input_data = [
            data.get("age"),
            data.get("has_anaemia"),   # 是否贫血
            data.get("Diabetes"),      # 是否糖尿病
            data.get("HighBP"),        # 是否高血压
            data.get("Sex"),           # 性别
            data.get("Smoker")         # 吸烟
        ]

        print("🧠 [DEBUG] 接收到的 input_data:", input_data)

        # === 调用预测函数 ===
        from .services.detect_heart import detect_heart_simple
        result = detect_heart_simple(input_data)

        print("✅ [DEBUG] 预测结果:", result)
        return jsonify(result), 200

    except Exception as e:
        import traceback
        print("❌ [ERROR] /heart/predict 出错：")
        traceback.print_exc()  # 打印完整错误堆栈到控制台
        return jsonify({"error": str(e)}), 500

    

@app.route("/user/save", methods=["POST"])
def save_user_api():
    """保存用户评估数据（数据库版）"""
    try:
        data = request.get_json() or {}
        user_id = data.get("user_id", "anonymous")
        form_data = data.get("form_data", {})
        predictions = data.get("predictions", {})

        # 调用数据库保存方法
        record_id = user_manager.save_user_data(user_id, form_data, predictions)

        # 返回标准化响应
        return jsonify({
            "success": True,
            "message": "用户数据保存成功",
            "record_id": record_id  # 可用于前端后续查询
        }), 200

    except Exception as e:
        print(f"❌ 保存用户数据失败: {e}")
        return jsonify({
            "success": False,
            "message": f"保存失败: {str(e)}"
        }), 500


@app.route("/list_users", methods=["GET"])
def list_users():
    """返回所有用户评估记录（从数据库读取）"""
    try:
        records = user_manager.get_saved_users()

        # 格式化输出
        user_list = [{
            "id": r["id"],
            "user_id": r["user_id"],
            "timestamp": r["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        } for r in records]

        return jsonify({
            "success": True,
            "count": len(user_list),
            "users": user_list
        }), 200

    except Exception as e:
        print(f"❌ 获取用户列表失败: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ===============================
# 加载指定用户评估数据
# ===============================
@app.route("/user/load", methods=["POST"])
def load_user_api():
    """根据数据库记录 ID 加载用户评估数据"""
    data = request.get_json() or {}
    record_id = data.get("id")

    if not record_id:
        return jsonify({
            "success": False,
            "message": "缺少 id 参数"
        }), 400

    try:
        record = user_manager.load_user_data(record_id)
        if not record:
            return jsonify({
                "success": False,
                "message": "记录不存在"
            }), 404

        # 反序列化 JSON 数据
        form_data = json.loads(record["form_data"])
        predictions = json.loads(record["predictions"])

        return jsonify({
            "success": True,
            "message": "加载成功",
            "data": {
                "id": record["id"],
                "user_id": record["user_id"],
                "timestamp": record["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
                "form_data": form_data,
                "predictions": predictions
            }
        }), 200

    except Exception as e:
        print(f"❌ 加载用户数据失败: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ===============================
# 删除指定用户评估数据
# ===============================
@app.route("/user/delete", methods=["POST"])
def delete_user_api():
    """删除指定 ID 的用户评估记录"""
    data = request.get_json() or {}
    record_id = data.get("id")

    if not record_id:
        return jsonify({
            "success": False,
            "message": "缺少 id 参数"
        }), 400

    try:
        success = user_manager.delete_user_data(record_id)
        if success:
            return jsonify({
                "success": True,
                "message": "删除成功"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "记录不存在"
            }), 404

    except Exception as e:
        print(f"❌ 删除用户数据失败: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

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
    app.run(debug=True, host="0.0.0.0", port=5000)