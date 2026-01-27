# backend/api/utils/database.py
import os
import pymysql
from pymysql.cursors import DictCursor

# === 数据库配置 ===
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
    sql_users = """
    CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    sql_user_data = """
    CREATE TABLE IF NOT EXISTS user_data (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        timestamp DATETIME NOT NULL,
        form_data JSON NOT NULL,
        predictions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    sql_users_health_reports=("""
            CREATE TABLE IF NOT EXISTS health_reports (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL,
                timestamp DATETIME NOT NULL,
                report JSON NOT NULL,
                score DECIMAL(5,2) NOT NULL,
                level VARCHAR(16) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
    
    # [新增] 签到表
    sql_checkins = """
    CREATE TABLE IF NOT EXISTS checkins (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        checkin_date DATE NOT NULL,
        mood VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_checkin (user_id, checkin_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql_users)
            cur.execute(sql_user_data)
            cur.execute(sql_users_health_reports)
            cur.execute(sql_checkins) # 执行创建签到表
        conn.commit()
        print("✅ 数据库初始化完成")
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        conn.rollback()
    finally:
        conn.close()