# path: app/auth_service.py
import os
import re
import pymysql
import bcrypt
from pymysql.cursors import DictCursor
from database import get_conn


# === 密码加密与验证 ===
def hash_password(password: str) -> str:
    """加密密码"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# === 注册用户 ===
def register_user(username: str, password: str):
    """注册新用户"""
    if not re.fullmatch(r"[A-Za-z0-9_\-\.]{3,32}", username):
        return {"success": False, "message": "用户名需为3-32位字母数字及_.-"}
    if len(password) < 8:
        return {"success": False, "message": "密码至少8位"}

    pw_hash = hash_password(password)

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, pw_hash))
        conn.commit()
        return {"success": True, "message": "注册成功"}
    except pymysql.err.IntegrityError:
        return {"success": False, "message": "用户名已存在"}
    finally:
        conn.close()

# === 登录验证 ===
def login_user(username: str, password: str):
    """验证用户登录"""
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT password_hash FROM users WHERE username=%s", (username,))
        row = cur.fetchone()
    conn.close()

    if not row:
        return {"success": False, "message": "用户不存在"}
    if not check_password(password, row["password_hash"]):
        return {"success": False, "message": "密码错误"}
    return {"success": True, "message": "登录成功"}