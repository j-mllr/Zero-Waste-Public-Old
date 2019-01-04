import os 

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'nowaste.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT')
    SQLALCHEMY_POOL_RECYCLE = 90