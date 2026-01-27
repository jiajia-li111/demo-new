from flask import Blueprint, request, jsonify
from ..utils.database import get_conn
import smtplib
from email.mime.text import MIMEText
from email.header import Header

guardian_bp = Blueprint('guardian_bp', __name__)

# === 邮件发送逻辑 ===
def send_email_alert(to_email, contact_name, alert_type, value):
    # 配置 SMTP 服务器 (以QQ邮箱为例)
    SMTP_HOST = "smtp.qq.com"
    SMTP_PORT = 465
    SMTP_USER = "your_email@qq.com" # 替换你的发件邮箱
    SMTP_PASS = "your_auth_code"    # 替换你的授权码

    content = f"""
    【紧急预警】智能健康管家
    
    亲爱的 {contact_name}：
    系统监测到用户的生命体征出现异常！
    
    - 报警类型：{alert_type}
    - 当前数值：{value}
    
    请立即确认用户安全！
    """
    try:
        # 模拟发送 (如果没有配置真实邮箱，代码不会崩，只打印日志)
        if "your_email" in SMTP_USER:
            print(f"=== [模拟邮件] 发给 {to_email} ===\n{content}")
            return True

        msg = MIMEText(content, 'plain', 'utf-8')
        msg['Subject'] = Header(f"SOS紧急预警：{alert_type}", 'utf-8')
        msg['From'] = Header("HealthGuard", 'utf-8')
        msg['To'] = Header(contact_name, 'utf-8')

        server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"邮件发送出错: {e}")
        return False

# 1. 获取配置
@guardian_bp.route('/guardian/config', methods=['GET'])
def get_config():
    user_id = request.args.get('user_id')
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guardian_settings WHERE user_id = %s", (user_id,))
            res = cur.fetchone()
            if not res:
                # 默认配置
                res = {'is_enabled': 0, 'threshold_hr_high': 120, 'threshold_bp_sys': 160}
        return jsonify({'success': True, 'data': res})
    finally:
        conn.close()

# 2. 保存配置
@guardian_bp.route('/guardian/config', methods=['POST'])
def save_config():
    data = request.json
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            sql = """
            REPLACE INTO guardian_settings 
            (user_id, is_enabled, contact_name, contact_email, contact_phone, threshold_hr_high, threshold_bp_sys)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                data.get('user_id'),
                1 if data.get('is_enabled') else 0,
                data.get('contact_name'),
                data.get('contact_email'),
                data.get('contact_phone'),
                data.get('threshold_hr_high'),
                data.get('threshold_bp_sys')
            ))
        conn.commit()
        return jsonify({'success': True, 'message': '配置已保存'})
    finally:
        conn.close()

# 3. 触发报警
@guardian_bp.route('/guardian/trigger', methods=['POST'])
def trigger_alert():
    data = request.json
    user_id = data.get('user_id')
    alert_type = data.get('alert_type')
    value = data.get('value')
    
    conn = get_conn()
    try:
        # 1. 查配置
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guardian_settings WHERE user_id = %s", (user_id,))
            config = cur.fetchone()
        
        status = "Failed"
        # 2. 发邮件
        if config and config['is_enabled'] and config['contact_email']:
            if send_email_alert(config['contact_email'], config['contact_name'], alert_type, value):
                status = "Sent"
        
        # 3. 写日志
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO alert_logs (user_id, alert_type, alert_value, status) VALUES (%s, %s, %s, %s)",
                (user_id, alert_type, str(value), status)
            )
        conn.commit()
        return jsonify({'success': True, 'status': status})
    finally:
        conn.close()

# 4. 获取日志
@guardian_bp.route('/guardian/logs', methods=['GET'])
def get_logs():
    user_id = request.args.get('user_id')
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM alert_logs WHERE user_id = %s ORDER BY timestamp DESC LIMIT 20", (user_id,))
            logs = cur.fetchall()
        return jsonify({'success': True, 'data': logs})
    finally:
        conn.close()