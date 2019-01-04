import logging
import os
from flask import Flask
from elasticsearch import Elasticsearch
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config, test_config=None):
    # create and configure the app
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.elasticsearch = Elasticsearch([app.config['ELASTICSEARCH_URL']], verify_certs=False) if app.config['ELASTICSEARCH_URL'] else None
    app.SECRET_KEY = app.config['SECRET_KEY']
    if app.config['LOG_TO_STDOUT']:
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(logging.INFO)
        app.logger.addHandler(stream_handler)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    with app.app_context():
        db.init_app(app)
        from nowaste.models import Asset
        db.create_all()

    from . import create_asset
    app.register_blueprint(create_asset.bp)

    return app


