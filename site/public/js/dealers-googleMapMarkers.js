function dealersToGoogleMaps(dealers) {
  var js = 'function addMarkers(map){\n' +
    'var markers = [];\n' +
    'var Marker = google.maps.Marker;\n' +
    'var LatLng = google.maps.LatLng;\n';
  dealers.forEach(function (d) {
    var name = d.name.replace(/'/, '\\\'').replace(/\\/, '\\\\');
    js += 'markers.push(new Marker({\n' +
      '\tposition: new LatLng(' + d.lat + ', ' + d.lng + '),\n' +
      '\tmap:map,\n' +
      '\ttitle:\'' + name + '\',\n' +
      '}));\n';
  });
  js += '}';
  return js;
}