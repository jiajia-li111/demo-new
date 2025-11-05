import pymysql
import hashlib

# === 数据库配置 ===
DB_CONFIG = {
    "host": "localhost",     # 数据库地址
    "user": "root",          # 用户名
    "password": "ljj21041102",    # 密码
    "database": "health_system",
    "charset": "utf8mb4"
}

def get_conn():
    """建立数据库连接"""
    return pymysql.connect(**DB_CONFIG)

def hash_password(password: str):
    """生成密码哈希"""
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(username: str, password: str) -> dict:
    """注册新用户"""
    conn = get_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                       (username, hash_password(password)))
        conn.commit()
        return {"success": True, "message": "注册成功"}
    except pymysql.err.IntegrityError:
        return {"success": False, "message": "用户名已存在"}
    finally:
        cursor.close()
        conn.close()

def login_user(username: str, password: str) -> dict:
    """验证用户登录"""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username=%s", (username,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return {"success": False, "message": "用户不存在"}
    elif row[0] != hash_password(password):
        return {"success": False, "message": "密码错误"}
    else:
        return {"success": True, "message": "登录成功"}
