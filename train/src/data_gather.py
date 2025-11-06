"""
统一数据处理模块
整合实时健康监测数据和用户填写的评估数据
提供综合健康参考和个性化建议
"""
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

from healthdevicer import device_simulator, get_realtime_health_data
from current_data import data_processor

class UnifiedHealthDataProcessor:
    """统一健康数据处理类"""
    
    def __init__(self, data_dir="local_data"):
        """初始化统一数据处理处理器"""
        self.data_dir = data_dir
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.full_data_dir = os.path.join(self.current_dir, data_dir)
        
        # 确保数据目录存在
        os.makedirs(self.full_data_dir, exist_ok=True)
        
        # 健康参考标准
        self.health_standards = {
            "heart_rate": {"normal_min": 60, "normal_max": 100, "optimal": 75},
            "blood_oxygen": {"normal_min": 95, "normal_max": 100, "optimal": 98},
            "temperature": {"normal_min": 36.1, "normal_max": 37.2, "optimal": 36.5},
            "systolic_bp": {"normal_min": 90, "normal_max": 130, "optimal": 120},
            "diastolic_bp": {"normal_min": 60, "normal_max": 85, "optimal": 80},
            "bmi": {"normal_min": 18.5, "normal_max": 24.9, "optimal": 22.0}
        }
        
        # 风险权重配置
        self.risk_weights = {
            "realtime_data": 0.6,  # 实时数据权重
            "user_assessment": 0.3,  # 用户评估数据权重
            "historical_trend": 0.1  # 历史趋势权重
        }
    
    def get_user_assessment_data(self, user_id: str = None) -> Optional[Dict]:
        """获取用户最新的评估数据"""
        try:
            if not user_id:
                user_id = "latest"
            
            # 查找最新的用户评估文件
            files = [f for f in os.listdir(self.full_data_dir) if f.endswith('.json')]
            if not files:
                return None
            
            # 按时间排序，获取最新的评估数据
            files.sort(key=lambda x: os.path.getmtime(os.path.join(self.full_data_dir, x)), reverse=True)
            
            for filename in files:
                filepath = os.path.join(self.full_data_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if 'form_data' in data and 'predictions' in data:
                            return data
                except:
                    continue
            
            return None
        except Exception as e:
            print(f"获取用户评估数据失败: {e}")
            return None
    
    def get_realtime_health_summary(self) -> Dict:
        """获取实时健康数据摘要"""
        try:
            return data_processor.get_vital_signs_summary()
        except Exception as e:
            print(f"获取实时健康数据失败: {e}")
            return {
                "heart_rate": {"value": 75, "status": "normal"},
                "blood_oxygen": {"value": 98, "status": "normal"},
                "temperature": {"value": 36.5, "status": "normal"},
                "blood_pressure": {"value": "120/80", "status": "normal"},
                "overall_status": "设备未连接",
                "alerts": []
            }
    
    def calculate_health_score(self, realtime_data: Dict, user_data: Dict = None) -> Dict:
        """计算综合健康评分"""
        score = 100
        factors = []
        
        # 实时数据评分
        if realtime_data:
            realtime_score = self._calculate_realtime_score(realtime_data)
            score -= (100 - realtime_score) * self.risk_weights["realtime_data"]
            factors.append(f"实时数据: {realtime_score:.1f}分")
        
        # 用户评估数据评分
        if user_data:
            assessment_score = self._calculate_assessment_score(user_data)
            score -= (100 - assessment_score) * self.risk_weights["user_assessment"]
            factors.append(f"评估数据: {assessment_score:.1f}分")
        
        # 历史趋势评分（简化处理）
        historical_score = 95  # 默认历史趋势良好
        score -= (100 - historical_score) * self.risk_weights["historical_trend"]
        
        final_score = max(0, min(100, score))
        
        # 健康等级
        if final_score >= 90:
            level = "优秀"
            color = "green"
        elif final_score >= 75:
            level = "良好"
            color = "blue"
        elif final_score >= 60:
            level = "一般"
            color = "yellow"
        else:
            level = "需要关注"
            color = "red"
        
        return {
            "score": round(final_score, 1),
            "level": level,
            "color": color,
            "factors": factors,
            "recommendations": self._generate_recommendations(realtime_data, user_data, final_score)
        }
    
    def _calculate_realtime_score(self, realtime_data: Dict) -> float:
        """计算实时数据健康评分"""
        score = 100
        
        # 心率评分
        hr = realtime_data.get("heart_rate", {}).get("value", 75)
        if hr < 60 or hr > 100:
            score -= 15
        elif hr < 50 or hr > 110:
            score -= 25
        
        # 血氧评分
        spo2 = realtime_data.get("blood_oxygen", {}).get("value", 98)
        if spo2 < 95:
            score -= 20
        elif spo2 < 90:
            score -= 35
        
        # 体温评分
        temp = realtime_data.get("temperature", {}).get("value", 36.5)
        if temp < 36.0 or temp > 37.2:
            score -= 10
        elif temp < 35.5 or temp > 38.0:
            score -= 20
        
        # 血压评分
        bp_str = realtime_data.get("blood_pressure", {}).get("value", "120/80")
        try:
            systolic, diastolic = map(int, bp_str.split("/"))
            if systolic > 130 or diastolic > 85:
                score -= 15
            elif systolic > 140 or diastolic > 90:
                score -= 25
        except:
            pass
        
        return max(0, score)
    
    def _calculate_assessment_score(self, user_data: Dict) -> float:
        """计算用户评估数据健康评分"""
        score = 100
        form_data = user_data.get("form_data", {})
        predictions = user_data.get("predictions", {})
        
        # BMI评分
        bmi = form_data.get("BMI", 22)
        if bmi < 18.5 or bmi > 24.9:
            score -= 10
        elif bmi < 16 or bmi > 30:
            score -= 20
        
        # 疾病风险评分
        for disease, result in predictions.items():
            if result.get("prediction") == 1:
                score -= 25  # 高风险疾病
        
        # 生活方式评分
        if form_data.get("is_smoker") == "是":
            score -= 15
        if form_data.get("has_high_bp") == "是":
            score -= 10
        if form_data.get("is_diabetic") == "是":
            score -= 20
        
        return max(0, score)
    
    def _generate_recommendations(self, realtime_data: Dict, user_data: Dict, score: float) -> List[str]:
        """生成个性化健康建议"""
        recommendations = []
        
        # 基于实时数据的建议
        if realtime_data:
            hr = realtime_data.get("heart_rate", {}).get("value", 75)
            if hr > 100:
                recommendations.append("心率偏高，建议适当休息，避免剧烈运动")
            elif hr < 60:
                recommendations.append("心率偏低，建议适量运动增强心肺功能")
            
            spo2 = realtime_data.get("blood_oxygen", {}).get("value", 98)
            if spo2 < 95:
                recommendations.append("血氧偏低，建议保持通风，必要时就医检查")
            
            temp = realtime_data.get("temperature", {}).get("value", 36.5)
            if temp > 37.2:
                recommendations.append("体温偏高，建议多饮水，注意休息")
            elif temp < 36.0:
                recommendations.append("体温偏低，建议注意保暖")
        
        # 基于用户评估的建议
        if user_data:
            form_data = user_data.get("form_data", {})
            if form_data.get("is_smoker") == "是":
                recommendations.append("建议戒烟，吸烟对心血管健康影响重大")
            
            bmi = form_data.get("BMI", 22)
            if bmi < 18.5:
                recommendations.append("体重偏轻，建议增加营养摄入")
            elif bmi > 24.9:
                recommendations.append("体重偏重，建议控制饮食，增加运动")
        
        # 基于综合评分的建议
        if score < 60:
            recommendations.append("健康评分较低，建议定期体检，咨询医生")
        elif score < 75:
            recommendations.append("健康评分一般，建议改善生活习惯")
        else:
            recommendations.append("健康状态良好，请继续保持健康生活方式")
        
        return recommendations[:5]  # 最多返回5条建议
    
    def get_comprehensive_health_report(self, user_id: str = None) -> Dict:
        """获取综合健康报告"""
        realtime_data = self.get_realtime_health_summary()
        user_data = self.get_user_assessment_data(user_id)
        
        health_score = self.calculate_health_score(realtime_data, user_data)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id or "anonymous",
            "realtime_data": realtime_data,
            "user_assessment": user_data,
            "health_score": health_score,
            "data_sources": {
                "realtime_active": hasattr(device_simulator, 'is_running') and device_simulator.is_running,
                "has_user_data": user_data is not None,
                "data_completeness": "complete" if user_data else "realtime_only"
            }
        }
    
    def save_health_report(self, report: Dict) -> str:
        """保存综合健康报告"""
        filename = f"health_report_{report['user_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.full_data_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return filepath
    
    def get_health_trends(self, user_id: str = None, days: int = 7) -> Dict:
        """获取健康趋势数据"""
        try:
            # 获取最近的健康报告
            files = [f for f in os.listdir(self.full_data_dir) if f.startswith('health_report_') and f.endswith('.json')]
            if not files:
                return {"trends": [], "summary": "暂无历史数据"}
            
            files.sort(key=lambda x: os.path.getmtime(os.path.join(self.full_data_dir, x)), reverse=True)
            
            trends = []
            for filename in files[:days]:
                filepath = os.path.join(self.full_data_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        trends.append({
                            "date": data["timestamp"][:10],
                            "score": data["health_score"]["score"],
                            "level": data["health_score"]["level"]
                        })
                except:
                    continue
            
            return {
                "trends": trends,
                "summary": f"过去{len(trends)}天健康趋势",
                "improvement": "保持稳定" if trends else "数据不足"
            }
        except Exception as e:
            return {"trends": [], "summary": f"获取趋势失败: {e}"}

# 全局处理器实例
unified_processor = UnifiedHealthDataProcessor()

def get_current_health_reference():
    """获取当前健康参考的便捷函数"""
    return unified_processor.get_comprehensive_health_report()

def save_current_health_report(user_id: str = None) -> str:
    """保存当前健康报告的便捷函数"""
    report = unified_processor.get_comprehensive_health_report(user_id)
    return unified_processor.save_health_report(report)



