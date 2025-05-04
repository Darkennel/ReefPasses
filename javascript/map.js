/**
 * Authors : Nathan Lafont & Samuel Martin
 * Date : 04.24.2025
 * Description : Webmap's script
 */

var map_ol = null;
var map_sdk = null;

let previouslySelected = null;

const white = [255, 255, 255, 1];

// -----------------------------------
// ---------- VECTOR LAYERS ----------
// -----------------------------------

// ---------- STYLE

// Allows to define device-based behaviour or symbology
const page = document.body.dataset.page;
var dotsize = 5;
// Relative path to geojson files from main
var urlfp = "data/reef_passages/french_polynesia.geojson";
var urlf = "data/reef_passages/PassesFiji.geojson";

if(page == "mobile-page"){
    console.log("Page détectée :", page);
    dotsize = 15;
    // Relative path to geojson files from son 1 folders (html sheets other than index)
    urlfp = "../data/reef_passages/french_polynesia.geojson";
    urlf = "../data/reef_passages/PassesFiji.geojson";
}

function getColor(d) {
    return d == 'Lagoon' ? '#2a96a2' : // Lagoon
        d == 'Coastal' ? '#3b4e38' : // Coastal
            d = 'Open Water' ? '#060f2e' : // Open Water
                '#eeeee4'; // Undefined
}

function style_rf(feature){
    return[
        new ol.style.Style({
            image: new ol.style.Circle({
                radius : dotsize,
                fill: new ol.style.Fill({
                    color: getColor(feature.get("Type")),
                }),
                stroke: new ol.style.Stroke({
                    color: white,
                    width: 1,
                })
            })
        })
    ]
}

function selectedStyle_rf(feature) {
    return [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: dotsize,
                fill: new ol.style.Fill({
                    color: getColor(feature.get("Type")),
                }),
                stroke: new ol.style.Stroke({
                    color: '#fcec03', // Stroke color for selected feature
                    width: 3      // Thicker stroke to show selection
                })
            })
        })
    ];
}


// ---------- PROPERTIES
// ----- French Polynesia

var source_fp = new ol.source.Vector({
    format : new ol.format.GeoJSON(),
    url : urlfp
});

source_fp._title = "French Polynesia reef passages";
source_fp._description = "Reef passages over Moorea and Tahiti (French Polynesia)";

var layer_fp = new ol.layer.Vector({
    source : source_fp,
    style : style_rf
});
// Set name to refer to it later
layer_fp.set('name', 'fp');

// ----- Fiji

var source_fiji = new ol.source.Vector({
    format : new ol.format.GeoJSON(),
    url : urlf
});

source_fiji._title = "Fiji reef passages";
source_fiji._description = "Reef passages overFiji archipel";

var layer_fiji = new ol.layer.Vector({
    source : source_fiji,
    style : style_rf
});
// Set name to refer to it later
layer_fiji.set('name', 'fiji');


// -----------------------------------
// --------- BASEMAP LAYERS ----------
// -----------------------------------

var source_bg = new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS',
    wrapX: true
});

source_bg._title = 'Esri BackGround';
var bglayer = new ol.layer.Tile({
    source: source_bg
});


// -----------------------------------
// ------------- INIT MAP ------------
// -----------------------------------

window.onload = function () {

    map_sdk = Gp.Map.load(
        "map",
        {
            // Init map center
            center: {
                x: -149.5322,
                y: -17.6512,

                // ,
                projection : "CRS:84"
            },
            zoom: 10,
            // Control options
            controlsOptions: {
                // Search Bar
                "search": {
                    maximised: true
                },
                // Layer Switcher
                "layerSwitcher" : {}
            },
            mapEventsOptions: {
                // Functions after map initalisation
                "mapLoaded": after_init_map
            },
        }
    );
}


// -----------------------------------
// -------------- PANEL --------------
// -----------------------------------

/*Panel elements*/
const fixedPanel = document.getElementById('fixed-panel');
const panelContent = document.getElementById('panel-content');
const panelCloser = document.getElementById('panel-closer');

console.log(panelCloser);

// Show fixed panel
function showPanel(content) {
    panelContent.innerHTML = content;
    fixedPanel.classList.add('visible');
}

// Hide fixed panel
panelCloser.onclick = function () {
    fixedPanel.classList.remove('visible');
};


// -----------------------------------
// ---- AFTER INIT MAP FUNCTIONS -----
// -----------------------------------

function after_init_map(){
    map = map_sdk.getLibMap();

    // Clear all base map layers
    const layersToRemove = [];
    map.getLayers().forEach(function(layer) {
        if (layer instanceof ol.layer.Tile || layer instanceof ol.layer.Image) {
           layersToRemove.push(layer);
        }
    });
    layersToRemove.forEach(layer => map.removeLayer(layer));
   
    // map.addOverlay(overlay);

    map.on('click', function (evt) {
        var result = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return { feature: feature, layer: layer };
        });

        if (result && result.feature && result.layer) {
            var feature = result.feature;
            var layer = result.layer;
            // Centroid for pop-up purpose
            // var geometry = feature.getGeometry();
            // var centroid = ol.extent.getCenter(geometry.getExtent());

            let content ='';

            // Checked which layer is clicked 
            if (["fp", "fiji"].includes(layer.get('name'))) {
                console.log(layer.get('name'));
                // Set panel content
                content = `
                <div class="layer-content">
                    <h3>Passage ${feature.get('ID')}</h3>
                    <p><strong>Name : </strong>${feature.get('NAME')}</p>
                    <p><strong>Minimal width : </strong>${feature.get('w [m]')} m</p>
                    <p><strong>Distance from shore : </strong>${feature.get('Dist shore')}</p>
                    <p><strong>Passage type : </strong>${feature.get('Type')}</p>
                    ${feature.get('image') ? `<img src="${feature.get('image')}" alt="Image" style="width:250px;height:187px;">` : '<i>No picture yet</i>'}
                </div>
                `;

                selectedFeatureStyle(feature);
            }

            // Sets overlay to feature's centroid
            // overlay.setPosition(centroid);
            showPanel(content);

        } else {
            // Hide overlay if nothing is clicked
            // overlay.setPosition(undefined);

            if (previouslySelected) {
                previouslySelected.setStyle(style_rf(previouslySelected));
                previouslySelected = null;
            }

            fixedPanel.classList.remove('visible'); //Hide if no feature clicked
        }
    });

    map.addLayer(bglayer);
    map.addLayer(layer_fp);
    map.addLayer(layer_fiji);

    //map.addLayer(bglayer);
}


// -----------------------------------
// ----------- REFRESH VIEW ----------
// -----------------------------------

// function refresh_view() {
//     source_fp.refresh();
//     overlay.changed();
// }


// -----------------------------------
// ----------- SELECTION HL ----------
// -----------------------------------

function selectedFeatureStyle(feature) {
    if (previouslySelected) {
        previouslySelected.setStyle(style_rf(previouslySelected)); // Back to normal
    }

    feature.setStyle(selectedStyle_rf(feature)); // Apply selection highlight

    previouslySelected = feature;
}

// -----------------------------------
// --------- FULLSCREEN VIEW ---------
// -----------------------------------

function fullScreenView() {
    const mapElement = document.getElementById("cs-picture");

    if (mapElement.requestFullscreen) {
      mapElement.requestFullscreen();
    } else if (mapElement.webkitRequestFullscreen) { // Safari
      mapElement.webkitRequestFullscreen();
    } else if (mapElement.msRequestFullscreen) { // IE11
      mapElement.msRequestFullscreen();
    }
}




