from flask import Blueprint, jsonify, request

from .login import login_user, register_user

auth_bp = Blueprint("auth", __name__)


def _extract_credentials():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")
    return username, password


@auth_bp.route("/register", methods=["POST"])
def register_route():
    username, password = _extract_credentials()
    if not username or not password:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "用户名与密码均不能为空",
                }
            ),
            400,
        )

    result = register_user(username, password)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@auth_bp.route("/login", methods=["POST"])
def login_route():
    username, password = _extract_credentials()
    if not username or not password:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "用户名与密码均不能为空",
                }
            ),
            400,
        )

    result = login_user(username, password)
    status = 200 if result.get("success") else 401
    return jsonify(result), status
