from .auth_routes import auth_bp
from .health_routes import health_bp
from .predict_routes import predict_bp
from .checkin_routes import checkin_bp
from .user_routes import user_bp


def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(checkin_bp)
