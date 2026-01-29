from flask import Blueprint, request, jsonify
from ..utils.database import get_conn
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

guardian_bp = Blueprint('guardian_bp', __name__)

# ================= 邮件发送逻辑（终极修复版） =================
def send_email_alert(to_email, contact_name, alert_type, value):
    SMTP_HOST = "smtp.qq.com"
    SMTP_PORT = 465

    # ===== 发件人配置（必须是 QQ 邮箱 + 授权码）=====
    SMTP_USER = "1781887527@qq.com"
    SMTP_PASS = "vncxwevttecddhjf"
    # ============================================

    content = f"""
【紧急预警】智能健康管家

亲爱的 {contact_name}：
系统监测到用户的生命体征出现异常！

- 报警类型：{alert_type}
- 当前数值：{value}

请立即确认用户安全！
"""

    try:
        msg = MIMEText(content, "plain", "utf-8")
        msg["Subject"] = Header(f"SOS 紧急预警：{alert_type}", "utf-8")

        # ⭐ 关键：RFC 标准写法（QQ 邮箱 100% 通过）
        msg["From"] = formataddr((
            str(Header("智能健康管家", "utf-8")),
            SMTP_USER
        ))

        msg["To"] = to_email

        server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()

        print(f"✅ 邮件已成功发送给 {to_email}")
        return True

    except Exception as e:
        print(f"❌ 邮件发送出错: {e}")
        return False
# ============================================================


# 1️⃣ 获取监护人配置
@guardian_bp.route("/guardian/config", methods=["GET"])
def get_config():
    user_id = request.args.get("user_id")
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM guardian_settings WHERE user_id = %s",
                (user_id,)
            )
            res = cur.fetchone()

            if not res:
                res = {
                    "is_enabled": 0,
                    "threshold_hr_high": 120,
                    "threshold_bp_sys": 160
                }

        return jsonify({"success": True, "data": res})
    finally:
        conn.close()


# 2️⃣ 保存配置
@guardian_bp.route("/guardian/config", methods=["POST"])
def save_config():
    data = request.json
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            sql = """
            REPLACE INTO guardian_settings
            (user_id, is_enabled, contact_name, contact_email, contact_phone,
             threshold_hr_high, threshold_bp_sys)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                data.get("user_id"),
                1 if data.get("is_enabled") else 0,
                data.get("contact_name"),
                data.get("contact_email"),
                data.get("contact_phone"),
                data.get("threshold_hr_high"),
                data.get("threshold_bp_sys")
            ))
        conn.commit()
        return jsonify({"success": True, "message": "配置已保存"})
    finally:
        conn.close()


# 3️⃣ 触发报警
@guardian_bp.route("/guardian/trigger", methods=["POST"])
def trigger_alert():
    data = request.json
    user_id = data.get("user_id")
    alert_type = data.get("alert_type")
    value = data.get("value")

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM guardian_settings WHERE user_id = %s",
                (user_id,)
            )
            config = cur.fetchone()

        status = "Failed"

        if config and config["is_enabled"] and config["contact_email"]:
            if send_email_alert(
                config["contact_email"],
                config["contact_name"],
                alert_type,
                value
            ):
                status = "Sent"

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO alert_logs
                (user_id, alert_type, alert_value, status)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, alert_type, str(value), status)
            )

        conn.commit()
        return jsonify({"success": True, "status": status})

    finally:
        conn.close()


# 4️⃣ 获取报警日志
@guardian_bp.route("/guardian/logs", methods=["GET"])
def get_logs():
    user_id = request.args.get("user_id")
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM alert_logs
                WHERE user_id = %s
                ORDER BY timestamp DESC
                LIMIT 20
                """,
                (user_id,)
            )
            logs = cur.fetchall()

        return jsonify({"success": True, "data": logs})
    finally:
        conn.close()
