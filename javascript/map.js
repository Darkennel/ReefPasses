/**
 * Author : Nathan Lafont
 * Date : 04.24.2025
 * Description : Webmap's script
 */

var map_ol = null;
var map_sdk = null;

const white = [255, 255, 255, 1];
const blue = [0, 153, 255, 1];


// ------------------------------> Styling reef passages

//---------- STYLE ----------

function style_fp(feature){

    return[
        new ol.style.Style({
            image: new ol.style.Circle({
                radius : 5,
                fill: new ol.style.Fill({
                    color: blue,
                }),
                stroke: new ol.style.Stroke({
                    color: white,
                    width: 1,
                })
            })
        })
    ]
}

//---------- PROPERTIES ----------

// "reef passages" properties

var source_fp = new ol.source.Vector({
    format : new ol.format.GeoJSON(),
    url : "../data/reef_passages/french_polynesia.geojson"
});

source_fp._title = "French Polynesia reef passages";
source_fp._description = "Reef passages over Moorea and Tahiti (French Polynesia)";

var layer_fp = new ol.layer.Vector({
    source : source_fp,
    style : style_fp
});
// Set name to refer to it later
layer_fp.set('name', 'fp');


// Basemap layer
var bglayer = new ol.layer.Tile({
    source: new ol.source.XYZ({ 
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
   }) 
});


// ------------------------------> INIT MAP
window.onload = function () {

    map_sdk = Gp.Map.load(
        "map",
        {
            // Acess keys
            //En fonction de la valeur permet d'accèder à différentes choses sur GeoPortail
            apiKey: "cartes,essentiels",

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


//---------------------------------------------------> PANEL

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

map_sdk.addLayer(bglayer);

// ------------------------------> INIT MAP

function after_init_map(){
    map = map_sdk.getLibMap();
    // map.addOverlay(overlay);

    map.on('click', function (evt) {
        var result = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return { feature: feature, layer: layer };
        });

        if (result && result.feature && result.layer) {
            var feature = result.feature;
            var layer = result.layer;
            // Calcul du centroïde de la géométrie de la feature cliquée
            var geometry = feature.getGeometry();
            var centroid = ol.extent.getCenter(geometry.getExtent());

            let content ='';

            // Vérification de la couche cliquée et affichage du pop-up
            if (layer.get('name') === "fp") {
                console.log(layer.get('name'));
                //Contenu du paneau
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
            }

            // Positionnement de l'overlay au centroïde de la feature
            // overlay.setPosition(centroid);
            showPanel(content);

        } else {
            // Masquer l'overlay si aucun élément n'est cliqué
            // overlay.setPosition(undefined);

            fixedPanel.classList.remove('visible'); //Hide if no feature clicked
        }
    });

    map.addLayer(layer_fp);
}

function refresh_view() {
    //mettre ici toutes les couches à raffraîchir
    source_fp.refresh();
    overlay.changed();
}
