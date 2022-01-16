// Creating the map object
var layers = {
  small: new L.LayerGroup(),
  medium: new L.LayerGroup(),
  large: new L.LayerGroup()
};

var map = L.map("map", {
  center: [34.0522, 118.2437],
  zoom: 11,
  layers: [
    layers.small,
    layers.medium,
    layers.large
  ]
});



// Adding the tile layer
L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}/?access_token={accessToken}', 
  {
    tileSize:512,
    maxZoom: 18,
    zoomOffset: -1, 
    id: "mapbox/light-v10",
    accessToken: API_KEY
  
}).addTo(map);

var overlays = {
  "Small": layers.small,
  "Medium": layers.medium,
  "Large": layers.large
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map.
var info = L.control({
  position: "bottomright"
});

info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map.
info.addTo(map);


var icons = {
  small: L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "yellow",
    shape: "circle"
  }),
  medium: L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "orange",
    shape: "circle"
  }),
  large: L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "red",
    shape: "circle"
  }),

};


// // Use this link to get the GeoJSON data.
// var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// // Getting our GeoJSON data
// d3.json(link).then(function(data) {
//   // Creating a GeoJSON layer with the retrieved data
//   L.geoJson(data).addTo(map);
//   console.log(data);
// });

// Perform an API call.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    
    var earthquakeFeatures = statusRes.data.stations;
    var earthquakeGeometry = data.features.geometry;
    


    // Create an object to keep the number of markers in each layer.
    var earthquakeCount = {
      small: 0,
      medium: 0,
      large: 0
    };

    // Initialize stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for the layer group.
    var earthquakeCode;

    // Loop through the stations (they're the same size and have partially matching data).
    for (var i = 0; i < earthquakeFeatures.length; i++) {

      // Create a new station object with properties of both station objects.
      var station = Object.assign({}, stationInfo[i], stationStatus[i]);
      // If a station is listed but not installed, it's coming soon.
      if (earthquakeFeatures.mag < 4) {
        earthquakeCode = "small";
      }
      // If a station has no available bikes, it's empty.
      else if (earthquakeFeatures.mag > 4 && earthquakeFeatures.mag < 6) {
        earthquakeCode = "medium";
      }
    
      // Otherwise, the station is normal.
      else {
        earthquakeCode = "large";
      }

      // Update the station count.
      earthquakeCount[earthquakeCode]++;
      // Create a new marker with the appropriate icon and coordinates.
      var newMarker = L.marker([earthquakeGeometry.type.coordinates[0], earthquakeGeometry.type.coordinates[0]], {
        icon: icons[earthquakeCode]
      });

      // Add the new marker to the appropriate layer.
      newMarker.addTo(layers[earthquakeCode]);

      // Bind a popup to the marker that will  display on being clicked. This will be rendered as HTML.
      newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
    }

    // Call the updateLegend function, which will update the legend!
    updateLegend(updatedAt, stationCount);
  });
});

// Update the legend's innerHTML with the last updated time and station count.
function updateLegend(time, stationCount) {
  document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
    "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
    "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
    "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
    "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
  ].join("");
}
