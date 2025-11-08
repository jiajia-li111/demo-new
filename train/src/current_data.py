"""
实时数据处理模块
处理来自硬件设备的健康数据，并提供给Streamlit界面显示
"""
import streamlit as st
from datetime import datetime
import json
from healthdevicer import device_simulator, get_realtime_health_data

class RealtimeDataProcessor:
    """实时数据处理类"""
    
    def __init__(self):
        self.is_monitoring = False
        self.data_history = []
        self.max_history = 100
    
    def start_monitoring(self):
        """开始实时监测"""
        if not self.is_monitoring:
            device_simulator.start_monitoring(
                update_interval=2.0,
                alert_probability=0.1
            )
            self.is_monitoring = True
    
    def stop_monitoring(self):
        """停止实时监测"""
        if self.is_monitoring:
            device_simulator.stop_monitoring()
            self.is_monitoring = False
    
    def get_current_display_data(self):
        """获取用于显示的数据"""
        try:
            data = get_realtime_health_data()
            current = data["current"]#当前的数据
            summary = data["summary"]#当前的健康概要
            
            # 添加到历史记录
            self.data_history.append(current)
            if len(self.data_history) > self.max_history:
                self.data_history.pop(0)
            
            return {
                "current": current,
                "summary": summary,
                "history": self.data_history.copy()
            }
        except Exception as e:
            return {
                "current": {
                    "heart_rate": 75,
                    "blood_oxygen": 98,
                    "temperature": 36.5,
                    "systolic_bp": 120,
                    "diastolic_bp": 80,
                    "timestamp": datetime.now().isoformat()
                },
                "summary": {
                    "status": "设备未连接",
                    "alerts": ["无法获取实时数据"],
                    "last_update": datetime.now().isoformat()
                },
                "history": []
            }
    
    def get_vital_signs_summary(self):
        """获取生命体征摘要"""
        data = self.get_current_display_data()
        current = data["current"]
        summary = data["summary"]
        
        return {
            "heart_rate": {
                "value": current["heart_rate"],
                "unit": "bpm",
                "status": "normal" if 60 <= current["heart_rate"] <= 100 else "warning",
                "range": "60-100"
            },
            "blood_oxygen": {
                "value": current["blood_oxygen"],
                "unit": "%",
                "status": "normal" if current["blood_oxygen"] >= 95 else "warning",
                "range": "≥95"
            },
            "temperature": {
                "value": current["temperature"],
                "unit": "°C",
                "status": "normal" if 36.0 <= current["temperature"] <= 37.2 else "warning",
                "range": "36.0-37.2"
            },
            "blood_pressure": {
                "value": f"{current['systolic_bp']}/{current['diastolic_bp']}",
                "unit": "mmHg",
                "status": "normal" if current["systolic_bp"] <= 130 and current["diastolic_bp"] <= 85 else "warning",
                "range": "≤130/85"
            },
            "overall_status": summary["status"],
            "alerts": summary["alerts"]
        }

# 全局处理器实例
data_processor = RealtimeDataProcessor()

