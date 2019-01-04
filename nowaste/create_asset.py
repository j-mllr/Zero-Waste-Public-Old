import functools
import json
import time

from sqlalchemy import text
from flask_sqlalchemy import SQLAlchemy
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from nowaste import db
from nowaste.models import Asset
from nowaste.search import add_to_index, query_index

ASSET_TYPES = ['Donation', 'Second Hand', 'Repair', 'Reduced Packaging', 'Share']
bp = Blueprint('create', __name__, url_prefix='')

@bp.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        asset_name = request.form['asset_name']
        asset_type = request.form.get('asset_type')
        asset_address = request.form.get('asset_address')
        latitude = request.form['latitude']
        longitude = request.form['longitude']
        error = None
    
        print(asset_name)
        
        if not asset_name:
            error = 'Asset Name is required.'
        elif not asset_type:
            error = 'Asset Type is required.'
        elif not asset_type in ASSET_TYPES:
            error = 'Asset Type must be one of {}'.format(ASSET_TYPES)
        elif (not latitude or not longitude):
            error = 'Drop a pin or use the search'
        elif Asset.query.filter_by(asset_name=asset_name, latitude=latitude, longitude=longitude).all():
            error = '{} is already registered'.format(asset_name)
        
        if error is None:
            newAsset = Asset(asset_name=asset_name,asset_address=asset_address, asset_type=asset_type, latitude=latitude, longitude=longitude)
            db.session.add(newAsset)
            db.session.commit()

            new_asset = Asset.query.filter_by(asset_name=asset_name, latitude=latitude, longitude=longitude).first()

            payload = []
            payload = {
                "asset_id": new_asset.id,
                "asset_name": new_asset.asset_name,
                "asset_type": new_asset.asset_type,
                "asset_address": new_asset.asset_address
            }

            add_to_index(payload)
            time.sleep(0.5)
            return redirect(url_for('create.index'))
        
        flash(error)


    return render_template('create.html')

@bp.route('/',  methods=['GET', 'POST'])
def index():
    assets = Asset.query.all()

    data_dict=[]

    for asset in assets:
        data_dict.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [asset.longitude,
                                asset.latitude]
                },
                "properties": {
                    "id": asset.id,
                    "asset_name": asset.asset_name,
                    "asset_type": asset.asset_type,
                    "address": asset.asset_address,
                }
        })

    featureCollection = {
                        "type": "FeatureCollection",
                        "features": data_dict
                        }
    
    return render_template('index.html', assets=assets)


@bp.route('/geojson/', defaults={'query': None})
@bp.route('/geojson/<string:query>')
def geojson(query):

    if (not query):  
        assets = Asset.query.all()
    else:
        resultIds = query_index(query)[0]
        print(resultIds)
        resultIds = str(resultIds).strip('[]')

        if (resultIds == ""):
            assets = Asset.query.filter(Asset.id.in_(resultIds))
        else:
            sql = "SELECT * from asset WHERE id IN" + "("+resultIds+")" + "ORDER BY FIELD(id," + resultIds +")"
            assets = Asset.query.filter(Asset.id.in_(resultIds))
            conn = db.engine
            assets = conn.execute(text(sql))

    data_dict=[]

    for asset in assets:
        data_dict.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [asset.longitude,
                                asset.latitude]
                },
                "properties": {
                    "id": asset.id,
                    "asset_name": asset.asset_name,
                    "asset_type": asset.asset_type,
                    "address": asset.asset_address,
                }
        })

    featureCollection = {
                        "type": "FeatureCollection",
                        "features": data_dict
                        }
    
    geojson = json.dumps(featureCollection, indent=4, separators=(',', ':'))

    return geojson
