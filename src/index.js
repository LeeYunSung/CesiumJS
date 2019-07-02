var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYTU2OTQ5Mi0zM2VlLTQ5M2ItYTQwYy0wMWQzYzQ0ZGY4OGQiLCJpZCI6MTI3OTIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjE5NTg2NDF9.ZtMFDGZC7_nuzc76sCXZLlr1K6dIPBiCW0Q8quQ7ENI';

var viewer = new Cesium.Viewer('cesiumContainer',{

    animation:false,
    creditsDisplay:false,
    timeline:false
    
});
