/**
 * Author : Nathan Lafont
 * Date : 04.24.2025
 * Description : Webmap's script
 */


var map = L.map('reef_passes', { center: [149.5322,-17.6512], zoom: 10 });

var baselayers = {
    ESRI: new L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
    OSM: new L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'),
    OSM_voyager: new L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png')
};

baselayers.ESRI.addTo(map);

L.control.layers(baselayers, null, { position: 'topright' }, { collapsed: false }).addTo(map);

L.control.scale({ position: 'bottomleft' }).addTo(map);

var geojson = L.geoJson(french_polynesia,
    {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(mymap);

function style(feature) {
    return {
        weight: 0.5,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1,
        fillColor: getColor(feature.properties.Type)
    };
}

function getColor(d) {
    return d == 'Lagoon' ? '#15210D' : // Lagoon
        d == 'Coastal' ? '#353C1A' : // Coastal
            d = 'Open Water' ? '#605D30' : // Open Water
                '#AAA28D'; // Undefined
}

var legend = L.control({ position: 'bottomright' });

// legend.onAdd = function (map) {
//     var div = L.DomUtil.create('div', 'info legend'),
//         grades = [0, 15, 25, 35, 45],
//         labels = ["<strong> Taux de boisement </strong>(%)</strong>"],
//         from, to;
//     for (var i = 0; i < grades.length; i++) {
//         from = grades[i];
//         to = grades[i + 1];
//         labels.push(
//             '<i style="background:' + getColor(from + 1) + '"></i> ' +
//             from + (to ? ' à ' + to : ' et plus'));
//     }
//     div.innerHTML = labels.join('<br/><br/>');
//     return div;
// };

legend.addTo(mymap);


var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};