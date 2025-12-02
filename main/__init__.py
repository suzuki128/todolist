from flask import Blueprint

bp = Blueprint(
    "main",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path='/main_static',  
    url_prefix=""                    
)

from . import routes
