# backend/api/services/chat_service.py

from ..utils.database import get_conn
from .deepseek_service import call_deepseek_or_fallback

def get_user_health_context(user_id):
    """
    专门用于聊天机器人的上下文获取函数
    """
    context_str = "用户健康画像：\n"
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 1. 尝试获取基本信息
            # 注意：这里假设你的 users 表里可能有 age/gender，如果没有也没关系，try-catch 会处理
            try:
                cur.execute("SELECT username FROM users WHERE username = %s", (user_id,))
                user_info = cur.fetchone()
                if user_info:
                    context_str += f"- 用户名: {user_info['username']}\n"
            except Exception:
                pass

            # 2. 获取最近一次预测记录 (HealthForm 的结果)
            # 假设表名是 health_records 或类似的，根据你之前的代码逻辑推断
            # 如果不确定表名，这部分可以先留空，或者只读实时数据
            try:
                cur.execute("SELECT result, created_at FROM health_records WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
                latest_record = cur.fetchone()
                if latest_record:
                    context_str += f"- 最近AI评估: {latest_record['result']} (时间: {latest_record['created_at']})\n"
            except Exception:
                pass
            
            # 3. 获取实时监测数据的平均值
            try:
                cur.execute("""
                    SELECT AVG(heart_rate) as avg_hr, AVG(systolic_bp) as avg_bp 
                    FROM monitor_data 
                    WHERE user_id = %s 
                    ORDER BY timestamp DESC LIMIT 10
                """, (user_id,))
                monitor_data = cur.fetchone()
                if monitor_data and monitor_data['avg_hr']:
                    context_str += f"- 近期实时体征(均值): 心率 {int(monitor_data['avg_hr'])} bpm, 收缩压 {int(monitor_data['avg_bp'])} mmHg\n"
            except Exception:
                pass

    except Exception as e:
        print(f"获取上下文失败: {e}")
    finally:
        conn.close()
    
    return context_str

def chat_with_health_bot(user_id, messages):
    """
    对话核心逻辑
    """
    # 1. 获取背景知识
    context = get_user_health_context(user_id)
    
    # 2. 构建 System Prompt
    system_prompt = (
        f"你是一名专业的AI健康助手 'HealthGuard'。\n"
        f"{context}\n"
        "请基于用户的真实健康数据回答。如果涉及具体用药，请提醒线下就医。\n"
        "回答要亲切、简短。"
    )
    
    # 3. 拼接对话历史给 DeepSeek (因为 call_deepseek_or_fallback 接收的是 string)
    full_prompt = f"System: {system_prompt}\n\n"
    
    for msg in messages:
        role = "User" if msg['role'] == 'user' else "Assistant"
        full_prompt += f"{role}: {msg['content']}\n"
    
    full_prompt += "Assistant: "
    
    # 4. 调用原有的 DeepSeek 服务
    return call_deepseek_or_fallback(full_prompt)