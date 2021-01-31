// The earthquake data JSON
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Base tile layer for the streets
var streets = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

// Plate url JSON
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Creating the layer for our plate boundaries
var geoJsonLayer = new L.LayerGroup()

// Call the plate boundaries url
d3.json(plateUrl,function(response) {

    // Loop through the plate boundaries and add the String objects to the plate layer
    for (var j =0; j<response.features.length; j++){
        L.geoJSON(response.features[j]
        ).addTo(geoJsonLayer)
    };
});

// Create the dark tile layer (objectively the best base layer if we're honest)
var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Our base map with our base layers added
var myMap = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 3.5,
  layers: [streets,dark]
});

// Legend object
var legend = L.control({ position: "bottomright" });

// The legend body
// This creates small squares with the correct colors for our color scale and their scale values
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Color Legend</h4>";
  div.innerHTML += "<h5>Depth(km)</h5>"
  div.innerHTML += '<i style="background: #1de72f"></i><span> < 10</span><br>';
  div.innerHTML += '<i style="background: #00c576"></i><span>10-20</span><br>';
  div.innerHTML += '<i style="background: #009f94"></i><span>20-35</span><br>';
  div.innerHTML += '<i style="background: #007792"></i><span>35-60</span><br>';
  div.innerHTML += '<i style="background: #005c7f"></i><span>60-85</span><br>';
  div.innerHTML += '<i style="background: #0a3750"></i><span>85+</span><br>';
  return div;
};

// Don't forget to add the legend to the map
legend.addTo(myMap);

// Create a circles layer group so that we can switch it in the control panel later
var circlesGroup = new L.LayerGroup()
d3.json(url,function(response) {

    for (var i = 0; i<response.features.length; i++){
        // Make a variable with the partial path to the coordinates to clean up the code
        var quake = response.features[i].geometry;
        // Large if statement for picking the color of the circle based upon depth
        // The scale is a gradient from a light green to a dark blue as the quakes get deeper.
        if (quake.coordinates[2] < 10){
            var fillerColor = "#1de72f";
        }
        else if(quake.coordinates[2] >= 10 && quake.coordinates[2] < 20){
            var fillerColor = "#00c576";

        }
        else if (quake.coordinates[2] >= 20 && quake.coordinates[2] < 35){
            var fillerColor = "#009f94";

        }
        else if (quake.coordinates[2] >= 35 && quake.coordinates[2] < 60){
            var fillerColor = "#007792";

        }
        else if (quake.coordinates[2] >= 60 && quake.coordinates[2] < 85){
            var fillerColor = "#005c7f";

        }
        else{
            var fillerColor = "#0a3750";
        }

        // Extract the time from a unix time code for  our popup
        var unixTime = response.features[i].properties.time;
        var realTime = new Date(unixTime);
        var formattedTime = realTime.toDateString() +" "+ realTime.getHours() + ":" + realTime.getMinutes();

        // Scale our circle size by magnitude, larger circle -> higher magnitude
        var magnitude = response.features[i].properties.mag * 30000;

        // Create the circles with black outlines and inner colors as defined above.
        var circle = L.circle([quake.coordinates[1],quake.coordinates[0]], {
        stroke: true,
        color: 'black',
        weight: 1,
        fillColor: fillerColor,
        fillOpacity: 0.5,
        radius: magnitude
        })

        // Add the popup with extra information such as location in plain english, the magnitude and the time
        .bindPopup(
        `<strong><h4>Magnitude:</strong> ${response.features[i].properties.mag} </h4> <hr>
        <h3>Location: </h3> ${response.features[i].properties.place}<br>
        <h3>Time: </h3>${formattedTime}

        `

        ).addTo(circlesGroup);
    };

});
// Base maps for the control panel
var baseMaps = {
  Streets: streets,
  Dark: dark
};
// Overlay maps for the control panel
var overlayMaps = {
    Circles: circlesGroup,
    Plates: geoJsonLayer
};

// The control panel
L.control.layers(baseMaps, overlayMaps).addTo(myMap);
