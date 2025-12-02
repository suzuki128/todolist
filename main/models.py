from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    task = db.Column(db.String(255), nullable=False)
    done = db.Column(db.Boolean, default=False)
