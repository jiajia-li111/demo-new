import os
from openai import OpenAI

# 创建一个客户端对象
client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY"),
    base_url="https://api.deepseek.com"  # 官方推荐的 API 地址
)

# 调用对话接口
response = client.chat.completions.create(
    model="deepseek-chat",   # 模型名称
    messages=[
        {"role": "system", "content": "你是一名和善的人。"},
        {"role": "user", "content": "你最近过的好吗。"}
    ],
    stream=False             # 如果要实时流式输出，改成 True
)

# 输出 AI 回复
print(response.choices[0].message.content)
