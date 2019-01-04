from nowaste import db

class Asset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(64), nullable=False)
    asset_address = db.Column(db.String(120), nullable=False)
    asset_type = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.String(20), nullable=False)
    longitude = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return '<Asset {} Type: {}, lat: {} long: {}>'.format(self.asset_name, self.asset_type, self.latitude, self.longitude)    
