from flask import Blueprint, render_template

# Blueprintを定義します。__name__は 'main' パッケージを指します。
# このため、template_folder="templates" は 'main/templates' フォルダを正しく参照します。
bp = Blueprint(
    "main",
    __name__,
    template_folder="templates", 
    static_folder="static",
    url_prefix="/" 
)

# ----------------------------------------------------
# ルート('/')を定義し、index.htmlをレンダリングします。
# ----------------------------------------------------
@bp.route('/')
def index():
    # 'main/templates/index.html' を探してレンダリングします。
    return render_template('index.html') 

# ルートが routes.py に分割されている場合、以下を有効にします
# from . import routes