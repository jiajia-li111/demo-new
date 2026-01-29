from .auth_routes import auth_bp
from .health_routes import health_bp
from .predict_routes import predict_bp
from .user_routes import user_bp
from .checkin_routes import checkin_bp
from .guardian_routes import guardian_bp
from .chat_routes import chat_bp  # [新增 1/2] 引入聊天路由

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(checkin_bp)
    app.register_blueprint(guardian_bp)
    app.register_blueprint(chat_bp) # [新增 2/2] 注册聊天路由
