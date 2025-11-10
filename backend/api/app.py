import os
import sys
from flask import Flask
from flask_cors import CORS
from .routes import register_blueprints
from .utils.database import init_db

# ✅ 只创建一次 app
app = Flask(__name__)

# ✅ 启用跨域访问
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ 初始化数据库
init_db()

# ✅ 注册蓝图
register_blueprints(app)

# ✅ 确保路径正确
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

