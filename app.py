from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps # 💡 デコレータ使用のため追加
from main import bp 

# ----------------------------------------------------
# 1. アプリケーションの初期化と設定
# ----------------------------------------------------
app = Flask(__name__)

# セッション管理に必須の秘密鍵を設定
app.secret_key = 'your_super_secret_key_here' 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Blueprintの登録
app.register_blueprint(bp)


# ----------------------------------------------------
# 2. データベースモデルの定義
# ----------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Calendar(db.Model):
    __tablename__ = 'calendars'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    calendar_id = db.Column(db.Integer, db.ForeignKey('calendars.id'), nullable=False)
    date_key = db.Column(db.String(10), nullable=False)  # 'YYYY-MM-DD'
    name = db.Column(db.String(255), nullable=False, default='(無題)')
    detail = db.Column(db.Text, default='')


# ----------------------------------------------------
# 3. ヘルパー関数とデコレータ
# ----------------------------------------------------
def get_current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None


def get_or_create_user_or_guest():
    """Return current logged-in user, or create/return a guest user otherwise."""
    user = get_current_user()
    if user:
        return user

    # use or create a guest user
    guest = User.query.filter_by(username='guest').first()
    if not guest:
        guest = User(username='guest')
        # set a dummy password hash
        guest.set_password('guest')
        db.session.add(guest)
        db.session.commit()
        # create default calendar for guest
        cal = Calendar(user_id=guest.id, name="ゲストカレンダー")
        db.session.add(cal)
        db.session.commit()
    return guest


def get_or_create_user_calendar(user):
    cal = Calendar.query.filter_by(user_id=user.id).first()
    if not cal:
        cal = Calendar(user_id=user.id, name="マイカレンダー")
        db.session.add(cal)
        db.session.commit()
    return cal


def task_to_dict(task):
    return {
        'id': task.id,
        'calendar_id': task.calendar_id,
        'date_key': task.date_key,
        'name': task.name,
        'detail': task.detail
    }

# 💡 修正: ログイン必須デコレータを定義
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': '認証が必要です'}), 401
        return f(*args, **kwargs)
    return decorated_function


# ----------------------------------------------------
# 4. 認証関連 API
# ----------------------------------------------------
@app.route('/api/register', methods=['POST'])
def register():
    # ... (登録処理は維持) ...
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'ユーザー名とパスワードを入力してください'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'そのユーザー名は既に登録されています'}), 409

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    # デフォルトカレンダー作成
    default_calendar = Calendar(user_id=new_user.id, name="マイカレンダー")
    db.session.add(default_calendar)
    db.session.commit()

    session['user_id'] = new_user.id
    return jsonify({'message': '登録が完了しました', 'user_id': new_user.id}), 201


@app.route('/api/login', methods=['POST'])
def login():
    # ... (ログイン処理は維持) ...
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'ログイン成功', 'user_id': user.id}), 200
    else:
        return jsonify({'message': 'ユーザー名またはパスワードが違います'}), 401


@app.route('/api/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'ログアウトしました'}), 200


# ----------------------------------------------------
# 5. タスク CRUD API
# ----------------------------------------------------
# 指定日付のタスク一覧取得
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get tasks. Supports query params `date=YYYY-MM-DD` or `month=YYYY-MM`."""
    user = get_or_create_user_or_guest()

    date_key = request.args.get('date')  # ?date=YYYY-MM-DD
    month = request.args.get('month')    # ?month=YYYY-MM

    cal = get_or_create_user_calendar(user)

    query = Task.query.filter_by(calendar_id=cal.id)
    if date_key:
        query = query.filter_by(date_key=date_key)
    elif month:
        # simple LIKE filter for YYYY-MM-
        query = query.filter(Task.date_key.like(f"{month}-%"))

    tasks = query.order_by(Task.id).all()
    return jsonify([task_to_dict(t) for t in tasks]), 200


# タスク追加 (POST)
@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a task. If `calendar_id` omitted, use user's default calendar."""
    user = get_or_create_user_or_guest()

    data = request.get_json() or {}
    calendar_id = data.get('calendar_id')
    date_key = data.get('date_key')
    name = data.get('name') or '(無題)'
    detail = data.get('detail') or ''

    if not date_key:
        return jsonify({'message': '日付は必須です'}), 400

    if calendar_id:
        calendar = Calendar.query.filter_by(id=calendar_id, user_id=user.id).first()
        if not calendar:
            return jsonify({'message': '指定されたカレンダーが見つからないか、アクセス権がありません'}), 403
    else:
        calendar = get_or_create_user_calendar(user)

    task = Task(calendar_id=calendar.id, date_key=date_key, name=name, detail=detail)
    db.session.add(task)
    db.session.commit()

    return jsonify(task_to_dict(task)), 201


# タスク更新 (PUT)
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    user = get_or_create_user_or_guest()

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'タスクが見つかりません'}), 404

    # 権限チェック
    cal = Calendar.query.get(task.calendar_id)
    if not cal or cal.user_id != user.id:
        return jsonify({'message': '権限がありません'}), 403

    data = request.get_json() or {}
    if 'name' in data:
        task.name = data['name'] or '(無題)'
    if 'detail' in data:
        task.detail = data['detail'] or ''
    if 'date_key' in data:
        task.date_key = data['date_key']

    db.session.commit()
    return jsonify(task_to_dict(task)), 200


# タスク削除 (DELETE)
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    user = get_or_create_user_or_guest()

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'タスクが見つかりません'}), 404

    # 権限チェック
    cal = Calendar.query.get(task.calendar_id)
    if not cal or cal.user_id != user.id:
        return jsonify({'message': '権限がありません'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': '削除しました'}), 200


# ----------------------------------------------------
# 6. DB 初期化とアプリ起動
# ----------------------------------------------------
with app.app_context():
    db.create_all()
    print("Database tables created/checked in test.db.")

if __name__ == '__main__':
    app.run(debug=True)