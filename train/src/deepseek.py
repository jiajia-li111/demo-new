import os
import sys
import os
import json
from datetime import datetime

# user_data.py 顶部的位置
import os, sys
current_dir = os.path.dirname(os.path.abspath(__file__))

# 加到项目根（假设结构是 demo-project/train/src/ 当前文件在 src/ 下）
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if project_root not in sys.path:
    sys.path.append(project_root)
# 使用相对导入

# 导入实时数据模块

try:
    from predict.detect_and_get.request import ask_deepseek
except Exception:
    print("❌ 导入 ask_deepseek 失败：")
    ask_deepseek = None


def build_health_prompt(task_name: str, inputs: dict, prediction: int, probability: list) -> str:
    """构造发送给 DeepSeek 的中文提示词。"""
    # 计算正类概率（假设 index=1 为患病概率）
    positive_proba = 0.0
    if isinstance(probability, (list, tuple)) and len(probability) >= 2:
        positive_proba = float(probability[1])
    elif isinstance(probability, (list, tuple)) and len(probability) == 1:
        positive_proba = float(probability[0])

    lines = [
        "你是一名资深的临床健康顾问，请基于以下模型预测结果，用简体中文给出通俗、可执行的健康建议。",
        f"- 任务: {task_name}",
        f"- 预测类别: {prediction} (1=高风险/阳性，0=低风险/阴性)",
        f"- 模型给出的患病概率(估计): {positive_proba:.2%}",
        "- 用户关键输入:"
    ]
    for k, v in inputs.items():
        lines.append(f"  - {k}: {v}")
    lines += [
        "要求:",
        "1) 先用一句话总结总体风险判断。",
        "2) 给出生活方式与饮食、运动、作息、体重管理、戒烟限酒等方面的具体建议（可分条列出）。",
        "3) 指出需要警惕的症状与自我监测要点（如血压/血糖/体重监测频率与阈值）。",
        "4) 给出何时需要尽快线下就医的触发条件。",
        "5) 语气温和，避免制造恐慌；不进行诊断，仅提供健康建议。",
        "6) 回答内容写成一段话。",
    ]
    return "\n".join(lines)


def call_deepseek_or_fallback(prompt: str) -> str:
    """调用 DeepSeek，失败时返回兜底建议。"""
    # 优先使用项目内封装的 ask_deepseek
    if ask_deepseek is not None:
        try:
            return ask_deepseek(prompt)
        except Exception as err:
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