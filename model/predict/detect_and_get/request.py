import requests
import json
import os

def ask_deepseek(question, model="deepseek-chat", temperature=0.7, max_tokens=2048):
    payload = {
    "model": model,
    "messages": [
        {"role": "system", "content": "你是一名专业的医生，需要根据我的身体数据给我较为专业的建议。"},
        {"role": "user", "content": question}
    ],
    "temperature": temperature,
    "max_tokens": max_tokens
}


    headers = {
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
    }
 # API密钥 目前是我的测试用例
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        json=payload,
        headers=headers
    )

    if response.status_code == 200:
        return json.loads(response.text)["choices"][0]["message"]["content"]
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    question = input("输入信息：")  #预计在这里要做提示词设计
    try:
        answer = ask_deepseek(question)
        print("DeepSeek回复：", answer) # 这里可以根据需要修改输出格式
    except Exception as e:
        print("发生错误：", e) #目前是余额不足无响应;