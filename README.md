# Zero-Waste-Public // http://no-waste.herokuapp.com/

Welcome to my zero waste web application written using Flask and Python. The database used is MySQL and the search function is implemented via Elasticsearch.

## Home
Here users can browse the assets either by scrolling through the asset list or by clicking on the icon.

Clicking an icon on the map will cause a pop-up containing the asset's information to be shown.

Clicking an asset on the map will cause the map to zoom in on the clicked asset.

Each asset type is colour coded. 

![populated_map](https://user-images.githubusercontent.com/34558221/50674141-4e066b80-0f98-11e9-8043-4315d9122f3d.png)

## /create
Users can add assets to the map by navigating to /create and filling in the form. The user must either use the search box on the map to populate the form or drop a pin as an asset's coordinates are required.

![create_page](https://user-images.githubusercontent.com/34558221/50674140-4e066b80-0f98-11e9-84c6-8c3b3c1e4456.png)
