import requests
import json

def ask_deepseek(question, model="deepseek-chat", temperature=0.7, max_tokens=2048):
    """
    Ask a question to the DeepSeek API and return the response.

    Args:
        question (str): The question to ask.
        model (str): The model to use for the request.
        temperature (float): The temperature for the response.
        max_tokens (int): The maximum number of tokens in the response.

    Returns:
        str: The response from the DeepSeek API.
    """
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": question}],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    headers = {
        "Authorization": "Bearer sk-1d71c0f0904c43488c5620c12219246f" 
    } # API密钥 目前是我的测试用例
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