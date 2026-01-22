from datetime import date, timedelta

from pymysql.err import IntegrityError

from ..utils.database import get_conn


class CheckinManager:
    """用户签到管理类"""

    def __init__(self):
        self._create_table()

    def _create_table(self):
        sql = """
        CREATE TABLE IF NOT EXISTS checkins (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            checkin_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_date (user_id, checkin_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        conn.close()

    def create_checkin(self, user_id):
        today = date.today()
        sql = """
        INSERT INTO checkins (user_id, checkin_date)
        VALUES (%s, %s)
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id, today))
            conn.commit()
            return {"checked_in": True, "message": "签到成功"}
        except IntegrityError:
            conn.rollback()
            return {"checked_in": False, "message": "今天已经签到过了"}
        finally:
            conn.close()

    def get_checkin_dates(self, user_id):
        sql = """
        SELECT checkin_date
        FROM checkins
        WHERE user_id = %s
        ORDER BY checkin_date DESC
        """
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                rows = cur.fetchall()
                return [row["checkin_date"] for row in rows]
        finally:
            conn.close()

    def get_status(self, user_id):
        today = date.today()
        dates = self.get_checkin_dates(user_id)
        date_set = set(dates)

        checked_in_today = today in date_set
        total = len(date_set)

        streak_anchor = today if checked_in_today else today - timedelta(days=1)
        streak = 0
        current = streak_anchor
        while current in date_set:
            streak += 1
            current -= timedelta(days=1)

        recent = [d.strftime("%Y-%m-%d") for d in dates[:7]]

        return {
            "checked_in_today": checked_in_today,
            "total": total,
            "streak": streak,
            "recent": recent,
        }


checkin_manager = CheckinManager()
