# 用户数据管理模块
import json
from datetime import datetime
from utils.database import get_conn 


class UserManager:
    """基于 MySQL 的用户健康数据管理类"""

    def __init__(self):
        """初始化：确保 user_data 表存在"""
        self._create_table()

    def _create_table(self):
        """防止表不存在（和 init_db 一样的安全检查）"""
        sql = """
        CREATE TABLE IF NOT EXISTS user_data (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            timestamp DATETIME NOT NULL,
            form_data JSON NOT NULL,
            predictions JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        conn.close()

    # === 保存用户数据 ===
    def save_user_data(self, user_id, form_data, predictions):
        """保存用户提交的数据和预测结果"""
        sql = """
        INSERT INTO user_data (user_id, timestamp, form_data, predictions)
        VALUES (%s, %s, %s, %s)
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        user_id,
                        datetime.now(),
                        json.dumps(form_data, ensure_ascii=False),
                        json.dumps(predictions, ensure_ascii=False),
                    ),
                )
            conn.commit()
            print(f"✅ 用户 {user_id} 的数据保存成功")
        except Exception as e:
            conn.rollback()
            print("❌ 保存用户数据失败：", e)
        finally:
            conn.close()

    # === 获取所有用户记录 ===
    def get_saved_users(self):
        """返回所有用户数据记录，最新在最前"""
        sql = """
        SELECT id, user_id, timestamp, form_data, predictions
        FROM user_data
        ORDER BY timestamp DESC
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql)
                return cur.fetchall()
        finally:
            conn.close()

    # === 加载单条记录 ===
    def load_user_data(self, record_id):
        """根据 ID 加载一条记录"""
        sql = "SELECT * FROM user_data WHERE id = %s"
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, (record_id,))
                return cur.fetchone()
        finally:
            conn.close()

    # === 删除单条记录 ===
    def delete_user_data(self, record_id):
        """根据 ID 删除一条记录"""
        sql = "DELETE FROM user_data WHERE id = %s"
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                affected = cur.execute(sql, (record_id,))
            conn.commit()
            if affected > 0:
                print(f"🗑️ 成功删除记录 ID={record_id}")
            return affected > 0
        except Exception as e:
            conn.rollback()
            print("❌ 删除记录失败：", e)
            return False
        finally:
            conn.close()
# 全局用户数据管理器实例
user_manager = UserManager()

