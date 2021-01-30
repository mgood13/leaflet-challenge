var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var myMap = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 3.5
});

// Add a tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);


var legend = L.control({ position: "bottomright" });

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

legend.addTo(myMap);



d3.json(url,function(response) {
    console.log(response)
    console.log(response.features.length)

    for (var i = 0; i<response.features.length; i++){

        var quake = response.features[i].geometry;

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


        var unixTime = response.features[i].properties.time;
        var realTime = new Date(unixTime);
        var formattedTime = realTime.toDateString() +" "+ realTime.getHours() + ":" + realTime.getMinutes();


        var magnitude = response.features[i].properties.mag * 30000;

        var circle = L.circle([quake.coordinates[1],quake.coordinates[0]], {
        stroke: true,
        color: 'black',
        weight: 1,
        fillColor: fillerColor,
        fillOpacity: 0.5,
        radius: magnitude
        }).bindPopup(
        `<strong><h4>Magnitude:</strong> ${response.features[i].properties.mag} </h4> <hr>
        <h3>Location: </h3> ${response.features[i].properties.place}<br>
        <h3>Time: </h3>${formattedTime}

        `

        ).addTo(myMap);
    };




});