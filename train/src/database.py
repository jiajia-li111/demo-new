# === 数据库配置 ===

import os
import pymysql
from pymysql.cursors import DictCursor
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "ljj21041102"),
    "database": os.getenv("DB_NAME", "health_system"),
    "charset": "utf8mb4",
    "port": int(os.getenv("DB_PORT", "3306")),
}

# === 建立数据库连接 ===
def get_conn():
    """建立数据库连接"""
    return pymysql.connect(**DB_CONFIG, autocommit=False, cursorclass=DictCursor)

# === 初始化表 ===
def init_db():
    sql = """
    CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    conn.close()
    print("✅ 数据库初始化完成")