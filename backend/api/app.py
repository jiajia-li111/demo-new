import os
import sys

from flask import Flask

from .routes import register_blueprints
from .utils.database import init_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

app = Flask(__name__)
init_db()
register_blueprints(app)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
