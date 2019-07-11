var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYTU2OTQ5Mi0zM2VlLTQ5M2ItYTQwYy0wMWQzYzQ0ZGY4OGQiLCJpZCI6MTI3OTIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjE5NTg2NDF9.ZtMFDGZC7_nuzc76sCXZLlr1K6dIPBiCW0Q8quQ7ENI';

var viewer = new Cesium.Viewer('cesiumContainer',{
    animation:false,
    creditsDisplay:false,
    timeline:false,
    terrainProvider: Cesium.createWorldTerrain()
});

let lat = 37.5696784235802;
let lon = 126.87461221948317;
let height = 40.0;

let center = Cesium.Cartesian3.fromDegrees(lon, lat, height);
let heading = -Math.PI * 0.0;
let pitch   =  Math.PI * 0.5;
let roll    = -Math.PI * 0.5;
var orientation = Cesium.Transforms.headingPitchRollQuaternion(center, new Cesium.HeadingPitchRoll(heading, pitch, roll));

let homeCameraView = {
    destination : Cesium.Cartesian3.fromDegrees(lon, lat - 0.002, 200.0),
    orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-35.0),
        roll : 0.0
    },
};

viewer.homeButton.viewModel.command.beforeExecute.addEventListener(e => {
    e.cancel = true;
    viewer.scene.camera.flyTo(homeCameraView);
});

viewer.scene.camera.setView(homeCameraView);
viewer.scene.globe.depthTestAgainstTerrain = true;

let road = viewer.entities.add({
    position: center,
    model: {uri: './texture.gltf'},
    orientation : orientation,
    scale : 1.0,
});

viewer.trackedEntity = road;


//draw line
var drawingMode = 'none';
var handler;

function btn_point(){
    terminateShape();
    drawingMode = 'point';
    var entity = viewer.entities.add({
        label : {
            show : false,
            showBackground : true,
            font : '14px monospace',
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(5, 0)
        }
    });
        // Mouse over the globe to see the cartographic position
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function(movement) {
            var foundPosition = false;

            var scene = viewer.scene;
            if (scene.mode !== Cesium.SceneMode.MORPHING) {
                var pickedObject = scene.pick(movement.endPosition);
            
                if (scene.pickPositionSupported && Cesium.defined(pickedObject) ) {
      
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (Cesium.defined(cartesian)) { 
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                var heightString = cartographic.height.toFixed(2);
    
                entity.position = cartesian;
                entity.label.show = true;
                entity.label.text =
                    'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
                    '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0'+
                    '\nAlt: ' + ('   ' + heightString).slice(-7) + 'm';

                    entity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, -cartographic.height * (scene.mode === Cesium.SceneMode.SCENE2D ? 1.5 : 1.0));

                    foundPosition = true;

            }
        }
    }
    if (!foundPosition) {
        entity.label.show = false;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(
    function(event) {

    if (!Cesium.Entity.supportsPolylinesOnTerrain(viewer.scene)) {
        console.log('This browser does not support polylines on terrain.');
        return;
    }
    var earthPosition = viewer.scene.pickPosition(event.position);
    if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            var dynamicPositions = new Cesium.CallbackProperty(function () {
                return activeShapePoints;
            }, false);
            activeShape = drawShape(dynamicPositions);
        }
        activeShapePoints.push(earthPosition);
        createPoint(earthPosition);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(function(event) {
    if (Cesium.defined(floatingPoint)) {
        var newPosition = viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

};

function btn_line(){
    terminateShape();
    drawingMode = 'line';
}
function btn_area(){
    terminateShape();
    drawingMode = 'area';
};

function btn_clear(){
    terminateShape();
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    drawingMode = 'clear';
}

document.btn_point = btn_point;
document.btn_line = btn_line;
document.btn_area = btn_area;
document.btn_clear = btn_clear;

viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

function createPoint(worldPosition) {
    var point = viewer.entities.add({
        position : worldPosition,
        ellipsoid: {
            radii: new Cesium.Cartesian3(0.4, 0.4, 0.4),
            material: Cesium.Color.RED
        }
    });
    return point;
}

function drawShape(positionData) {
    var shape;
    if(drawingMode === 'line'){
        shape = viewer.entities.add({
            polyline : {
                positions : positionData,
                width : 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED
                })
            }
        }); 
    } 
    if(drawingMode === 'area'){
        shape = viewer.entities.add({
            polygon: {
                hierarchy: positionData,
                material: new Cesium.ColorMaterialProperty(Cesium.Color.RED.withAlpha(0.7))
            }
        });
    }   
    return shape;
}

var activeShapePoints = [];
var activeShape;
var floatingPoint;

function terminateShape() {
    activeShapePoints.pop();
    drawShape(activeShapePoints);
    viewer.entities.remove(floatingPoint);
    viewer.entities.remove(activeShape);
    floatingPoint = undefined;
    activeShape = undefined;
    activeShapePoints = [];
}
handler.setInputAction(function(event) {
    terminateShape();
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);