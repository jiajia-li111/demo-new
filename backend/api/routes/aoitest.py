import requests

BASE_URL = "http://127.0.0.1:5000"

# 测试 health_prompt
r1 = requests.post(
    f"{BASE_URL}/health_prompt",
    json={
        "task_name": "综合健康评估",
        "inputs": {"age": 25, "gender": "女", "bmi": 21.8},
        "prediction": 0,
        "probability": [0.76, 0.24],
    },
)
print("health_prompt 返回：", r1.json())

# 测试 deepseek_call
prompt = r1.json().get("prompt", "健康建议测试")
r2 = requests.post(f"{BASE_URL}/deepseek_call", json={"prompt": prompt})
print("deepseek_call 返回：", r2.json())
