// Themes begin
am4core.useTheme(am4themes_material);
am4core.useTheme(am4themes_animated);
// Themes end

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);
// Set map definition
chart.geodata = am4geodata_worldTimeZoneAreasHigh;
// Set projection
chart.projection = new am4maps.projections.Miller();
chart.panBehavior = "rotateLong";

var startColor = chart.colors.getIndex(0)
var middleColor = chart.colors.getIndex(7)
var endColor = chart.colors.getIndex(14)

var interfaceColors = new am4core.InterfaceColorSet();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;
polygonSeries.calculateVisualCenter = true;

var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.fillOpacity = 0.6;
polygonTemplate.nonScalingStroke = true;
polygonTemplate.strokeWidth = 1;
polygonTemplate.stroke = interfaceColors.getFor("background");
polygonTemplate.strokeOpacity = 1;

polygonTemplate.adapter.add("fill", function(fill, target) {

  if (target.dataItem.index > 0) {
    return chart.colors.getIndex(target.dataItem.index);
  }
  return fill;
})
var boundsSeries = chart.series.push(new am4maps.MapPolygonSeries());
boundsSeries.geodata = am4geodata_worldTimeZonesHigh;
boundsSeries.useGeodata = true;
boundsSeries.mapPolygons.template.fill = am4core.color(interfaceColors.getFor("alternativeBackground"));
boundsSeries.mapPolygons.template.fillOpacity = 0.07;
boundsSeries.mapPolygons.template.nonScalingStroke = true;
boundsSeries.mapPolygons.template.strokeWidth = 0.5;
boundsSeries.mapPolygons.template.strokeOpacity = 1;
boundsSeries.mapPolygons.template.stroke = interfaceColors.getFor("background");
boundsSeries.tooltipText = "{id}";


var hs = polygonTemplate.states.create("hover");
hs.properties.fillOpacity = 1;

var bhs = boundsSeries.mapPolygons.template.states.create("hover");
bhs.properties.fillOpacity = 0.3;


polygonSeries.mapPolygons.template.events.on("over", function(event) {
  var polygon = boundsSeries.getPolygonById(event.target.dataItem.dataContext.id);
  if (polygon) {
    polygon.isHover = true;
  }
})

polygonSeries.mapPolygons.template.events.on("out", function(event) {
  var polygon = boundsSeries.getPolygonById(event.target.dataItem.dataContext.id);
  if (polygon) {
    polygon.isHover = false;
  }
})


var labelSeries = chart.series.push(new am4maps.MapImageSeries());
var label = labelSeries.mapImages.template.createChild(am4core.Label);
label.text = "{id}";
label.strokeOpacity = 0;
label.fill = am4core.color("#000000");
label.horizontalCenter = "middle";
label.fontSize = 9;
label.nonScaling = true;


labelSeries.mapImages.template.adapter.add("longitude", (longitude, target) => {
  target.zIndex = 100000;

  var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
  if (polygon) {
    return polygon.visualLongitude
  }
  return longitude;
})

labelSeries.mapImages.template.adapter.add("latitude", (latitude, target) => {
  var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
  if (polygon) {
    return polygon.visualLatitude
  }
  return latitude;
})


var button = chart.createChild(am4core.SwitchButton);
button.align = "right";
button.marginTop = 40;
button.marginRight = 40;
button.valign = "top";
button.leftLabel.text = "Map";
button.rightLabel.text = "Globe";

button.events.on("toggled", function() {

  chart.deltaLatitude = 0;
  chart.deltaLongitude = 0;
  chart.deltaGamma = 0;

  if (button.isActive) {
    chart.projection = new am4maps.projections.Orthographic;
    chart.panBehavior = "rotateLongLat";
  }
  else {
    chart.projection = new am4maps.projections.Miller;
    chart.panBehavior = "move";
  }
})

polygonSeries.events.on("datavalidated", function() {
  labelSeries.data = polygonSeries.data;
})