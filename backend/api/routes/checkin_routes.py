# backend/api/routes/checkin_routes.py
from flask import Blueprint, request, jsonify
from api.utils.database import get_conn
from datetime import date
import random

checkin_bp = Blueprint('checkin_bp', __name__)

@checkin_bp.route('/checkin/status', methods=['GET'])
def get_checkin_status():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Missing user_id'}), 400
    
    conn = get_conn()
    try:
        with conn.cursor() as cursor:
            today = date.today()
            
            # 检查今日是否签到
            sql = "SELECT * FROM checkins WHERE user_id = %s AND checkin_date = %s"
            cursor.execute(sql, (user_id, today))
            record = cursor.fetchone()
            
            # 计算总签到天数
            sql_count = "SELECT COUNT(*) as count FROM checkins WHERE user_id = %s"
            cursor.execute(sql_count, (user_id,))
            res_count = cursor.fetchone()
            total_count = res_count['count'] if res_count else 0

        return jsonify({
            'success': True,
            'is_checked_in': bool(record),
            'total_days': total_count,
            'today_mood': record['mood'] if record else None
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@checkin_bp.route('/checkin', methods=['POST'])
def perform_checkin():
    data = request.json
    user_id = data.get('user_id')
    mood = data.get('mood', 'happy')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Missing user_id'}), 400

    conn = get_conn()
    try:
        with conn.cursor() as cursor:
            today = date.today()
            
            # 尝试插入，利用数据库唯一索引避免重复
            # 如果今日已签到，这里会报错或不执行，我们捕获它
            try:
                sql = "INSERT INTO checkins (user_id, checkin_date, mood) VALUES (%s, %s, %s)"
                cursor.execute(sql, (user_id, today, mood))
                conn.commit()
                msg = "签到成功"
            except Exception as e:
                # 可能是重复签到，视为成功但不更新
                print(f"Checkin insert warning: {e}")
                msg = "今日已签到"

        # 随机健康寄语
        quotes = [
            "每一天的坚持，都是对身体最长情的告白。",
            "今日活力值满满，继续保持哦！",
            "健康不是终点，而是一种生活方式。",
            "您的心脏正在为您的努力强力跳动！",
            "记得多喝水，水是生命之源。",
            "运动是天然的抗抑郁药。",
            "保持微笑，您的免疫力正在提升！"
        ]
        quote = random.choice(quotes)

        return jsonify({'success': True, 'message': msg, 'quote': quote})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()