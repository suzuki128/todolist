from flask import Flask
from main import bp

app = Flask(__name__)
app.register_blueprint(bp)  # url_prefix は bp 側で設定済み

if __name__ == "__main__":
    app.run(debug=True)
