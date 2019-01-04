    mapboxgl.accessToken = 'pk.eyJ1Ijoiam1pbGxhciIsImEiOiJjam9wODdsanIwZG1jM3BwcWp6a3ByNGxqIn0.oMW852cWW3fuQuipBhciqQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-123.1126, 49.2418],
        zoom: 10.5
    });

    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });

    let dropPin = false;

    map.addControl(geocoder);

    // After the map style has loaded on the page, add a source layer and default
    // styling for a single point.
    map.on('load', function() {
        map.addSource('single-point', {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": []
            }
        });

        map.addLayer({
            "id": "point",
            "type": "symbol",
            "source": 'single-point',
            "layout": {
                'icon-image': 'marker-15',
                'icon-size' : 1.5
            }
        }); 

        // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
        // makes a selection and add a symbol that matches the result.
        
        geocoder.on('result', function(ev) {
            map.getSource('single-point').setData(ev.result.geometry);
            document.getElementById("asset_name").value=ev.result.text;
            document.getElementById("asset_address").value = getAddress(ev.result);
            document.getElementById("longitude").value=ev.result.geometry.coordinates[0];
            document.getElementById("latitude").value=ev.result.geometry.coordinates[1];
            dropPin = false;
        });

    });


    function getAddress(result){
        nameLength = result.text.length;
        return result.place_name.slice(nameLength + 2);
    };

    let dropPinButton = document.getElementById('dropPin');

    dropPinButton.addEventListener('click', function(event) {
        document.getElementById("asset_address").value = null;
        document.getElementById("longitude").value=null;
        document.getElementById("latitude").value=null;

        dropPin = true;
    });

    map.on('click', (e) => {
        let tempGeoJson = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.lngLat['lng'], e.lngLat['lat']]
            }
        }
    
        if (dropPin==true){
            map.getSource('single-point').setData(tempGeoJson);
            document.getElementById("longitude").value= e.lngLat['lng'];
            document.getElementById("latitude").value=e.lngLat['lat'];
        }

    });
