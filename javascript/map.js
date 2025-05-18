/**
 * Authors : Nathan Lafont & Samuel Martin
 * Date : 04.24.2025
 * Description : Webmap's script
 */

var map_ol = null;
var map_sdk = null;

let previouslySelected = null;

const white = [220, 220, 220, 1];

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
var urlnc = "data/reef_passages/new_caledonia.geojson";

if(page == "mobile-page"){
    console.log("Page détectée :", page);
    dotsize = 15;
    // Relative path to geojson files from son 1 folders (html sheets other than index)
    urlfp = "../data/reef_passages/french_polynesia.geojson";
    urlf = "../data/reef_passages/PassesFiji.geojson";
    urlnc = "../data/reef_passages/new_caledonia.geojson";
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
                    width: 2,
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
                    width: 2      // Thicker stroke to show selection
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
source_fiji._description = "Reef passages over Fiji archipelago";

var layer_fiji = new ol.layer.Vector({
    source : source_fiji,
    style : style_rf
});
// Set name to refer to it later
layer_fiji.set('name', 'fiji');

// ----- New Caledonia

var source_nc = new ol.source.Vector({
    format : new ol.format.GeoJSON(),
    url : urlnc
});

source_nc._title = "New-Caledonia reef passages";
source_nc._description = "Reef passages over New-Caledonia archipelago";

var layer_nc = new ol.layer.Vector({
    source : source_nc,
    style : style_rf
});
// Set name to refer to it later
layer_nc.set('name', 'newcaledonia');


// -----------------------------------
// --------- BASEMAP LAYERS ----------
// -----------------------------------


// ----- World Imagery ESRI 

var source_bg_op = new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS',
    attributions: 'Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS,',
    wrapX: true
});

source_bg_op._title = 'Esri BackGround';
source_bg_op._title = 'Esri Background';
var bglayer_op = new ol.layer.Tile({
    source: source_bg_op
});

// ----- CartoDB Voyager

var source_bg_topo = new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attributions: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    wrapX: true
});

source_bg_topo._title = 'CartoDB Voyager';
var bglayer_topo = new ol.layer.Tile({
    source: source_bg_topo
});

// ----- OSM Standard

var source_osm = new ol.source.OSM({
    attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

source_osm._title = 'OSM Standard';
var bglayer_osm = new ol.layer.Tile({
    source: source_osm
});

// ----- Labels

var source_label = new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
})

source_label._title = 'Label layer';
var labelLayer = new ol.layer.Tile({
    source: source_label
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
                x: -178,
                y: -17.7134,

                // ,
                projection : "CRS:84"
            },
            zoom: 4.5,
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
            let layerName = layer.get('name');
    
            let content = '';
    
            // Couches autorisées à afficher le panneau
            const allowedLayers = ["fp", "fiji", "newcaledonia"];
    
            if (allowedLayers.includes(layerName)) {
                console.log(layerName);
    
                content = `
                    <div class="layer-content">
                        <h3>Passage ${feature.get('ID')}</h3>
                        <p><strong>Name :</strong> ${feature.get('NAME')}</p>
                        <p><strong>Minimal width :</strong> ${feature.get('w [m]')} m</p>
                        <p><strong>Distance from shore :</strong> ${feature.get('Dist shore')}</p>
                        <p><strong>Passage type :</strong> ${feature.get('Type')}</p>
                        <p><strong>Author :</strong> <i>${feature.get('AUTHOR')}</i></p>
                        <p><strong>References :</strong></p>
                        ${feature.get('image') 
                            ? `<img src="${feature.get('image')}" alt="Image" style="width:250px;height:187px;">`
                            : '<i>No picture yet</i>'
                        }
                    </div>
                `;
    
                // Appliquer style à la feature sélectionnée
                selectedFeatureStyle(feature);
    
                // Affiche le panneau (à adapter à ta logique)
                showPanel(content);
    
                // (Optionnel) Centroid si besoin
                // var centroid = ol.extent.getCenter(feature.getGeometry().getExtent());
                // overlay.setPosition(centroid);
    
                // Sauvegarde la feature sélectionnée
                previouslySelected = feature;
            }
    
        } else {
            // Aucun clic sur une entité
            if (previouslySelected) {
                previouslySelected.setStyle(style_rf(previouslySelected));
                previouslySelected = null;
            }
    
            fixedPanel.classList.remove('visible');
        }
    
        // Fermeture du panneau via bouton
        panelCloser.onclick = function () {
            if (previouslySelected) {
                previouslySelected.setStyle(style_rf(previouslySelected));
                previouslySelected = null;
            }
            fixedPanel.classList.remove('visible');
        };
    });
    

    map.addLayer(bglayer_topo);
    map.addLayer(bglayer_osm);
    map.addLayer(bglayer_op);
    map.addLayer(labelLayer);
    map.addLayer(layer_fp);
    map.addLayer(layer_fiji);
    map.addLayer(layer_nc);

    // Add scalebar
    var scaleLineControl = new ol.control.ScaleLine({
        units: 'metric' 
    });
    map.addControl(scaleLineControl);


    // Zoom to selected layer 
    const zoomSelect = document.getElementById('zoom-select');
    let lastSelected = null;

    function zoomToLocation(locationKey) {
        const locations = {
            fiji: {
                x: 178.0650,
                y: -17.7134
            },
            tahiti: {
                x: -149.5322,
                y: -17.6512
            },
            newcaledonia: {
                x: 165.6180,
                y: -21.2990
            }
        };

        if (locationKey && locations[locationKey]) {
            const center = locations[locationKey];
            const view = map.getView();

            let zoomlevel = (locationKey === 'fiji' || locationKey === 'newcaledonia') ? 8 : 10;

            view.animate({
                center: ol.proj.fromLonLat([center.x, center.y], 'EPSG:3857'),
                zoom: zoomlevel,
                duration: 1000
            });

            console.log('Zoom to:', center);
        }
    }

    // Zooms to selected when selection changes
    zoomSelect.onchange = function () {
        const selected = zoomSelect.value;
        zoomToLocation(selected);
        lastSelected = selected;
    };

    // Zooms back to current selection when opening the select menu
    zoomSelect.onclick = function () {
        const selected = zoomSelect.value;
        if (selected === lastSelected) {
            zoomToLocation(selected);
        }
    };
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



