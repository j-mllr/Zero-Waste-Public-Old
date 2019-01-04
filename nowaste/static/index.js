    mapboxgl.accessToken = 'pk.eyJ1Ijoiam1pbGxhciIsImEiOiJjam9wODdsanIwZG1jM3BwcWp6a3ByNGxqIn0.oMW852cWW3fuQuipBhciqQ';
    let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-123.1126, 49.2418],
    zoom: 11
    });

let TYPES = ["Donation", "Second Hand", "Repair", "Reduced Packaging", "Share"];
let symbol = {Donation: '#0D7FFF', "Second Hand": '#FFBE2A', Repair: '#E700FF', "Reduced Packaging": '#009393', Share:'#FF3919'};
let geodata
let prevEle = null;


fetch('/geojson')
    .then(response => {
    return response.json();
  })
  .then(function(myJson) {
    geodata = myJson;
});

function removeLayers(){
    TYPES.forEach(type => {
        map.off('click',"poi-"+type, createPopUp);
        map.removeLayer("poi-"+type);
    });
}

function populateAssetList() {

    map.off
    removeLayers();
    map.removeSource('locations');

    let listings = document.getElementById("assetList");
    while (listings.firstChild) {
        listings.removeChild(listings.firstChild);
    }
    
    let j = 0;
    geodata.features.forEach(feature => {
        let listing = listings.appendChild(document.createElement('div'));
        let link = listing.appendChild(document.createElement('a'));
        link.id = j;
        link.className = feature.properties.id;
        link.innerHTML = feature.properties.asset_name;
        j++;
    });

    setUpMap()

    if (j==0){
        let noResults = document.createElement('div')
        noResults.innerHTML = "No results found";
        listings.appendChild(noResults);
    }
}


document.getElementById("searchForm").addEventListener('submit', changeURL);

function changeURL(e){
    fetch('/geojson/'+document.getElementById("searchInput").value)
    .then(response => {
    return response.json();
    })
    .then(function(myJson) {
    geodata = myJson;
    populateAssetList();
    });
}

function updateAssetList(geodata) {

    clearAssets();
    geodata.features.forEach(function(feature) {
        let elementsToKeep = Array.from(document.getElementsByClassName(feature.properties.id));

        elementsToKeep.forEach(asset => {
            console.log(asset);
            console.log(asset.parentElement);
            asset.parentElement.style.display = "block"
        });

    });
}

function clearAssets(){
    let assets = Array.from(document.getElementsByClassName('assets'));
    console.log(assets);
    assets.forEach(asset => {
        asset.style.display = "none"
        console.log(asset);
        });
}

function createPopUpHTML(props){
    let {id, asset_name, asset_type, address, postal_code} = props;
    console.log(asset_name);
    console.log(id);
    console.log(asset_type);
    console.log(address);
    console.log(postal_code);
    let html = ""
    if (asset_type == "ReducedPackaging"){
        html =  "<data class=" + id + "></data>" +
        "<div class=popName>" + asset_name + "</div>"
        + "<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>" + address +  "</div>"
        + "<div class=typeLabel> Type: </div> <div class=type> Reduced Packaging </div> </div>";

    } else if (asset_type == "SecondHand"){
        html =  "<data class=" + id + "></data>" +
                "<div class=popName>" + asset_name + "</div>"
                + "<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>" + address +  "</div>"
                + "<div class=typeLabel> Type: </div> <div class=type>  Second Hand </div> </div>";
    } else {
        html =  "<data class=" + id + "></data>" +
        "<div class=popName>" + asset_name + "</div>"
        + "<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>" + address +  "</div>"
        + "<div class=typeLabel> Type: </div> <div class=type>" + asset_type + "</div> </div>";

    }
    return html;
};


map.on('load', function(e) {
  
    setUpMap();

});

function setUpMap(){
    map.addSource("locations", {
        type: "geojson",
        data: geodata,
    });

    let i = 0;
    geodata.features.forEach(function(feature) {
        updateLink(i)
        i++;

        let type = feature.properties.asset_type;
        let layerID = 'poi-'+type;


        if (!map.getLayer(layerID)) {
            map.addLayer({
                id: layerID,
                source: "locations",
                type: "circle",
                "paint": {
                    "circle-radius": 8,
                    "circle-color": symbol[type]
                },
                "filter": ["==", "asset_type", type]
           });
        }
    });

    // When a click event occurs on a feature in all of the locations layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    prevEle = null;

    
    TYPES.forEach(function (type){
        let layerID = 'poi-'+type;
        
        map.on('click', layerID, createPopUp)
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', layerID, function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', layerID, function () {
                map.getCanvas().style.cursor = '';
            });

    });

};

    function createPopUp(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties;
       
        let elementsToChange = Array.from(document.getElementsByClassName(description['id']));
        
        changeFontColorToBlack();

        elementsToChange.forEach(function (e){
            e.style.color = "red";
        });

        prevEle = elementsToChange;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(createPopUpHTML(description))
            .addTo(map);
        };

        function flyToStore(currentFeature) {      
            closePopUp();
            map.flyTo({
              center: currentFeature.geometry.coordinates,
              zoom: 13
            });
    
        };
    
        let prevId = null;
        function updateLink(iteration){
            document.getElementById(iteration).addEventListener('click', function(e){
                changeFontColorToBlack();
    
                flyToStore(geodata.features[iteration]);
                document.getElementById(this.id).style.color = "red";
                prevId = this.id;
            });
        };
    
    
        function changeFontColorToBlack(){
            if (prevId){
                document.getElementById(prevId).style.color = "black";
            }
    
            if (prevEle){
                prevEle.forEach(function (e){
                    e.style.color = "black";
                });  
            }
        };
    
        function closePopUp(){
            var popUps = document.getElementsByClassName('mapboxgl-popup');
            if (popUps[0]){
                popUps[0].remove();  
            }
        };
