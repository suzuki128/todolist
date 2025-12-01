from flask import Flask
from main import bp

def create_app():
    app = Flask(__name__)

    # Blueprint 登録
    app.register_blueprint(bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
