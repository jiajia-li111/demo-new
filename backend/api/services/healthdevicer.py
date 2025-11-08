"""
模拟硬件设备实时数据发送模块
模拟心率、血氧、体温等健康监测设备的数据输出
"""
import time
import random
import json
from datetime import datetime
import threading
  
  
  
class HealthDeviceSimulator:
    """健康监测设备模拟器"""
    
    def __init__(self):
        self.is_running = False
        self.current_data = {
            "heart_rate": 75,
            "blood_oxygen": 98,
            "temperature": 36.5,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "timestamp": datetime.now().isoformat()
        }
        self.callbacks = []
        self.update_thread = None
    
    def add_callback(self, callback):
        """添加数据更新回调函数"""
        self.callbacks.append(callback)
    
    def generate_realistic_data(self):
        """生成真实的健康数据"""
        # 心率：正常范围60-100，运动时可到150
        base_hr = 75
        variation = random.randint(-15, 25)
        heart_rate = max(60, min(150, base_hr + variation))
        
        # 血氧：正常范围95-100
        blood_oxygen = max(90, min(100, 98 + random.randint(-3, 2)))
        
        # 体温：正常范围36.1-37.2
        temperature = round(36.5 + random.uniform(-0.4, 0.7), 1)
        
        # 血压：收缩压90-140，舒张压60-90
        systolic_bp = max(90, min(140, 120 + random.randint(-15, 20)))
        diastolic_bp = max(60, min(90, 80 + random.randint(-10, 10)))
        
        return {
            "heart_rate": heart_rate,
            "blood_oxygen": blood_oxygen,
            "temperature": temperature,
            "systolic_bp": systolic_bp,
            "diastolic_bp": diastolic_bp,
            "timestamp": datetime.now().isoformat()
        }
    
    def simulate_alert_data(self):
        """模拟异常数据（用于测试警报功能）"""
        alert_types = [
            {
                "type": "high_heart_rate",
                "heart_rate": random.randint(120, 150),
                "blood_oxygen": 98,
                "temperature": 37.0,
                "systolic_bp": 130,
                "diastolic_bp": 85
            },
            {
                "type": "low_oxygen",
                "heart_rate": 95,
                "blood_oxygen": random.randint(85, 92),
                "temperature": 36.8,
                "systolic_bp": 115,
                "diastolic_bp": 75
            },
            {
                "type": "fever",
                "heart_rate": 105,
                "blood_oxygen": 97,
                "temperature": round(random.uniform(38.0, 39.5), 1),
                "systolic_bp": 125,
                "diastolic_bp": 80
            }
        ]
        
        alert_data = random.choice(alert_types)
        alert_data["timestamp"] = datetime.now().isoformat()
        return alert_data
    
    
    
    def start_monitoring(self, update_interval=2.0, alert_probability=0.1):
        """开始实时数据监测"""
        self.is_running = True
        
        def update_data():
            while self.is_running:
                # 90%概率生成正常数据，10%概率生成异常数据
                if random.random() < alert_probability:
                    new_data = self.simulate_alert_data()
                else:
                    new_data = self.generate_realistic_data()
                
                self.current_data = new_data
                
                # 调用所有注册的回调函数
                for callback in self.callbacks:
                    try:
                        callback(new_data)
                    except Exception as e:
                        print(f"回调函数执行错误: {e}")
                
                time.sleep(update_interval)
        
        self.update_thread = threading.Thread(target=update_data, daemon=True)
        self.update_thread.start()
        print("健康监测设备已启动...")
    
    
    
    
    def stop_monitoring(self):
        """停止数据监测"""
        self.is_running = False
        if self.update_thread:
            self.update_thread.join(timeout=1)
        print("健康监测设备已停止")
    
    def get_current_data(self):
        """获取当前数据"""
        return self.current_data.copy()
    
    def get_status_summary(self):
        """获取健康状态摘要"""
        data = self.current_data
        status = "正常"
        alerts = []
        
        # 心率检查
        if data["heart_rate"] > 100:
            status = "警告"
            alerts.append(f"心率偏高: {data['heart_rate']} bpm")
        elif data["heart_rate"] < 60:
            status = "警告"
            alerts.append(f"心率偏低: {data['heart_rate']} bpm")
        
        # 血氧检查
        if data["blood_oxygen"] < 95:
            status = "警告"
            alerts.append(f"血氧偏低: {data['blood_oxygen']}%")
        
        # 体温检查
        if data["temperature"] > 37.3:
            status = "警告"
            alerts.append(f"体温偏高: {data['temperature']}°C")
        elif data["temperature"] < 36.0:
            status = "警告"
            alerts.append(f"体温偏低: {data['temperature']}°C")
        
        # 血压检查
        if data["systolic_bp"] > 130 or data["diastolic_bp"] > 85:
            status = "警告"
            alerts.append(f"血压偏高: {data['systolic_bp']}/{data['diastolic_bp']} mmHg")
        
        return {
            "status": status,
            "alerts": alerts,
            "last_update": data["timestamp"]
        }

# 全局设备实例
device_simulator = HealthDeviceSimulator()

def start_realtime_monitoring(update_callback=None):
    """启动实时监测的便捷函数"""
    if update_callback:
        device_simulator.add_callback(update_callback)
    device_simulator.start_monitoring()

def stop_realtime_monitoring():
    """停止实时监测的便捷函数"""
    device_simulator.stop_monitoring()

def get_realtime_health_data():
    """获取实时健康数据的便捷函数"""
    return {
        "current": device_simulator.get_current_data(),
        "summary": device_simulator.get_status_summary()
    }