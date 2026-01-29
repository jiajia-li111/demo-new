import os
import sys
import json
from datetime import datetime

# 1. 删除顶部的 sys.path hack 和 try-import 块
# 防止在文件加载初期就触发复杂的依赖链

def build_health_prompt(task_name, inputs, prediction, probability):
    """根据输入构造健康建议提示词"""
    try:
        # 兼容嵌套列表情况
        if isinstance(probability, list) and len(probability) > 0 and isinstance(probability[0], list):
            probability = probability[0]

        # 确保至少有两个值
        negative_proba = float(probability[0]) if len(probability) > 0 else 0.0
        positive_proba = float(probability[1]) if len(probability) > 1 else 0.0

        prompt = (
            f"你是一名资深的临床健康顾问，请基于以下模型预测结果，用简体中文给出通俗、可执行的健康建议。\n"
            f"- 任务: {task_name}\n"
            f"- 预测类别: {prediction} (1=高风险/阳性，0=低风险/阴性)\n"
            f"- 模型给出的患病概率(估计): {positive_proba*100:.2f}%\n"
            f"- 用户关键输入:\n"
        )
        for k, v in inputs.items():
            prompt += f"  - {k}: {v}\n"

        prompt += (
            "要求:\n"
            "1) 先用一句话总结总体风险判断。\n"
            "2) 给出生活方式与饮食、运动、作息、体重管理、戒烟限酒等方面的具体建议（可分条列出）。\n"
            "3) 指出需要警惕的症状与自我监测要点。\n"
            "4) 给出何时需要尽快线下就医的触发条件。\n"
            "5) 语气温和，避免制造恐慌；不进行诊断，仅提供健康建议。\n"
            "6) 回答内容写成一段话。"
        )
        return prompt

    except Exception as e:
        raise RuntimeError(f"构建提示词失败: {e}")


def call_deepseek_or_fallback(prompt: str) -> str:
    """调用 DeepSeek，失败时返回兜底建议。"""
    
    # ✅ [关键修改] 将导入移动到函数内部（延迟导入）
    # 这样只有在真正调用这个函数时才会去加载 model 模块
    # 避免了启动时的循环依赖死锁
    ask_deepseek = None
    try:
        # 确保路径能找到 model 目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir)) # backend 的上一级
        if backend_dir not in sys.path:
            sys.path.append(backend_dir)
            
        from model.predict.detect_and_get.request import ask_deepseek
    except Exception as e:
        print(f"❌ 延迟导入 ask_deepseek 失败: {e}")
    
    # 优先使用项目内封装的 ask_deepseek
    if ask_deepseek is not None:
        try:
            return ask_deepseek(prompt)
        except Exception as err:
            print(f"⚠️ DeepSeek 调用出错: {err}")
            pass

    # 兜底建议（不依赖外部 API）
    return (
        "提示：未能连接到健康建议服务，以下为通用健康建议供参考：\n"
        "- 保持均衡饮食，控制精制糖和高盐摄入，增加蔬果与优质蛋白摄入。\n"
        "- 每周至少进行150分钟中等强度有氧运动，并结合力量训练。\n"
        "- 保持规律作息，确保7-8小时睡眠，减压与情绪管理。\n"
        "- 体重管理：建议监测体重与腰围，逐步达成健康范围。\n"
        "- 如存在胸闷胸痛、呼吸困难、持续头晕、明显浮肿、持续异常口渴与尿频等情况，请尽快线下就医。"
    )