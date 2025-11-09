"""
统一数据处理模块（数据库版）
整合实时健康监测数据和用户填写的评估数据
提供综合健康参考和个性化建议
"""

import json
from datetime import datetime
from typing import Dict, List, Optional
from ..utils.database import get_conn
from .healthdevicer import device_simulator
from .current_data import data_processor
from .user_data import user_manager


class UnifiedHealthDataProcessor:
    """统一健康数据处理类（基于 MySQL 存储）"""

    def __init__(self):
        """初始化统一数据处理器（数据库版）"""

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
            "realtime_data": 0.6,
            "user_assessment": 0.3,
            "historical_trend": 0.1
        }

        # 初始化数据库表
        self._ensure_report_table()
        print("✅ UnifiedHealthDataProcessor 已启动（数据库模式）")

    # =====================================================
    # 初始化数据库表
    # =====================================================
    def _ensure_report_table(self):
        """确保健康报告表存在"""
        sql = """
        CREATE TABLE IF NOT EXISTS health_reports (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            timestamp DATETIME NOT NULL,
            report JSON NOT NULL,
            score DECIMAL(5,2) NOT NULL,
            level VARCHAR(16) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
        finally:
            conn.close()

    # =====================================================
    # 用户评估数据部分（从数据库读取）
    # =====================================================
    def get_user_assessment_data(self, user_id: str = None) -> Optional[Dict]:
        """从数据库获取用户最新的评估数据"""
        try:
            records = user_manager.get_saved_users()
            if not records:
                return None

            if user_id:
                records = [r for r in records if r["user_id"] == user_id]

            if not records:
                return None

            record = records[0]
            return {
                "user_id": record["user_id"],
                "timestamp": record["timestamp"].isoformat(),
                "form_data": json.loads(record["form_data"]),
                "predictions": json.loads(record["predictions"])
            }
        except Exception as e:
            print(f"获取用户评估数据失败: {e}")
            return None

    # =====================================================
    # 实时数据部分
    # =====================================================
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

    # =====================================================
    # 综合健康评分部分
    # =====================================================
    def calculate_health_score(self, realtime_data: Dict, user_data: Dict = None) -> Dict:
        """计算综合健康评分"""
        score = 100
        factors = []

        if realtime_data:
            realtime_score = self._calculate_realtime_score(realtime_data)
            score -= (100 - realtime_score) * self.risk_weights["realtime_data"]
            factors.append(f"实时数据: {realtime_score:.1f}分")

        if user_data:
            assessment_score = self._calculate_assessment_score(user_data)
            score -= (100 - assessment_score) * self.risk_weights["user_assessment"]
            factors.append(f"评估数据: {assessment_score:.1f}分")

        historical_score = 95
        score -= (100 - historical_score) * self.risk_weights["historical_trend"]

        final_score = max(0, min(100, score))

        if final_score >= 90:
            level, color = "优秀", "green"
        elif final_score >= 75:
            level, color = "良好", "blue"
        elif final_score >= 60:
            level, color = "一般", "yellow"
        else:
            level, color = "需要关注", "red"

        return {
            "score": round(final_score, 1),
            "level": level,
            "color": color,
            "factors": factors,
            "recommendations": self._generate_recommendations(realtime_data, user_data, final_score)
        }

    # =====================================================
    # 各类打分与建议函数
    # =====================================================
    def _calculate_realtime_score(self, realtime_data: Dict) -> float:
        score = 100
        hr = realtime_data.get("heart_rate", {}).get("value", 75)
        if hr < 60 or hr > 100:
            score -= 15
        elif hr < 50 or hr > 110:
            score -= 25

        spo2 = realtime_data.get("blood_oxygen", {}).get("value", 98)
        if spo2 < 95:
            score -= 20
        elif spo2 < 90:
            score -= 35

        temp = realtime_data.get("temperature", {}).get("value", 36.5)
        if temp < 36.0 or temp > 37.2:
            score -= 10
        elif temp < 35.5 or temp > 38.0:
            score -= 20

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
        score = 100
        form_data = user_data.get("form_data", {})
        predictions = user_data.get("predictions", {})

        bmi = form_data.get("BMI", 22)
        if bmi < 18.5 or bmi > 24.9:
            score -= 10
        elif bmi < 16 or bmi > 30:
            score -= 20

        for disease, result in predictions.items():
            if result.get("prediction") == 1:
                score -= 25

        if form_data.get("is_smoker") == "是":
            score -= 15
        if form_data.get("has_high_bp") == "是":
            score -= 10
        if form_data.get("is_diabetic") == "是":
            score -= 20

        return max(0, score)

    def _generate_recommendations(self, realtime_data: Dict, user_data: Dict, score: float) -> List[str]:
        recommendations = []

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

        if user_data:
            form_data = user_data.get("form_data", {})
            if form_data.get("is_smoker") == "是":
                recommendations.append("建议戒烟，吸烟对心血管健康影响重大")

            bmi = form_data.get("BMI", 22)
            if bmi < 18.5:
                recommendations.append("体重偏轻，建议增加营养摄入")
            elif bmi > 24.9:
                recommendations.append("体重偏重，建议控制饮食，增加运动")

        if score < 60:
            recommendations.append("健康评分较低，建议定期体检，咨询医生")
        elif score < 75:
            recommendations.append("健康评分一般，建议改善生活习惯")
        else:
            recommendations.append("健康状态良好，请继续保持健康生活方式")

        return recommendations[:5]

    # =====================================================
    # 综合健康报告与趋势
    # =====================================================
    def save_health_report(self, report: Dict) -> str:
        """保存综合健康报告（写入数据库）"""
        user_id = report.get("user_id", "anonymous")
        ts = None
        try:
            ts = datetime.fromisoformat(report.get("timestamp", ""))
        except Exception:
            ts = datetime.now()

        score = float(report.get("health_score", {}).get("score", 0))
        level = report.get("health_score", {}).get("level", "未知")

        sql = """
        INSERT INTO health_reports (user_id, timestamp, report, score, level)
        VALUES (%s, %s, %s, %s, %s)
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    user_id,
                    ts,
                    json.dumps(report, ensure_ascii=False),
                    score,
                    level
                ))
                conn.commit()
                new_id = cur.lastrowid
            return f"db://health_reports/{new_id}"
        except Exception as e:
            return f"error://{e}"
        finally:
            conn.close()

    def get_health_trends(self, user_id: str = None, days: int = 7) -> Dict:
        """获取健康趋势数据（从数据库查询）"""
        try:
            conn = get_conn()
            with conn.cursor() as cur:
                if user_id:
                    sql = """
                    SELECT timestamp, score, level
                    FROM health_reports
                    WHERE user_id = %s
                    ORDER BY timestamp DESC
                    LIMIT %s
                    """
                    cur.execute(sql, (user_id, int(days)))
                else:
                    sql = """
                    SELECT timestamp, score, level
                    FROM health_reports
                    ORDER BY timestamp DESC
                    LIMIT %s
                    """
                    cur.execute(sql, (int(days),))

                rows = cur.fetchall()

            trends = [{
                "date": r["timestamp"].strftime("%Y-%m-%d"),
                "score": float(r["score"]),
                "level": r["level"]
            } for r in rows]

            return {
                "trends": trends,
                "summary": f"过去{len(trends)}天健康趋势",
                "improvement": "保持稳定" if trends else "数据不足"
            }
        except Exception as e:
            return {"trends": [], "summary": f"获取趋势失败: {e}"}
        finally:
            try:
                conn.close()
            except:
                pass

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


# =====================================================
# 全局实例与便捷函数
# =====================================================
unified_processor = UnifiedHealthDataProcessor()

def save_current_health_report(user_id: str = None) -> str:
    """保存当前健康报告的便捷函数"""
    report = unified_processor.get_comprehensive_health_report(user_id)
    return unified_processor.save_health_report(report)


