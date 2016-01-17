var cities = {};
cities['BIA'] = "Białystok";
cities['BZG'] = "Bydgoszcz";
cities['CZE'] = "Częstochowa";
cities['ELK'] = "Ełk";
cities['GDN'] = "Gdańsk";
cities['KTW'] = "Katowice";
cities['KIE'] = "Kielce";
cities['KOS'] = "Koszalin";
cities['KRK'] = "Kraków";
cities['LUB'] = "Lublin";
cities['LCJ'] = "Łódź";
cities['OLS'] = "Olsztyn";
cities['OPO'] = "Opole";
cities['PLO'] = "Płock";
cities['POZ'] = "Poznań";
cities['RAD'] = "Radom";
cities['SIE'] = "Sieradz";
cities['SZZ'] = "Szczecin";
cities['WAW'] = "Warszawa";
cities['WRO'] = "Wrocław";

var map;
var geocode_url = "http://maps.google.com/maps/api/geocode/json?address=";
var markers = [];
var marker_path = [];
var journeyPath;

function setMapOnAll( map ) {
    for( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function getMarkers( cityID_list ) {

    var i;

    for( i = 0; i < cityID_list.length; i++ ) {

        var cityname = cities[cityID_list [i]];

        var dest_url = geocode_url + cityname;

        $.ajax(dest_url, {
            success: function ( responseText ) {

                var coords = responseText.results[0].geometry.location;

                var marker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: {lat: coords.lat, lng: coords.lng}
                });
                markers.push(marker);
                deleteMarkers();
            }
        });
    }

}

function setMarkers( cityID_list ) {

    //console.info("SET MARKERS");

    //console.info(cityID_list);

    var i;

    for( i = 0; i < cityID_list.length; i++ ) {

        var cityname = cities[cityID_list [i]];
        //console.info(cityname);

        var dest_url = geocode_url + cityname;

        $.ajax(dest_url, {
            success: function ( responseText, status, xhr ) {

                //console.info("GEOCODE:");

                var coords = responseText.results[0].geometry.location;
                //console.info(coords);

                var c_lat = coords.lat;
                var c_lng = coords.lng;

                //console.info(c_lat);
                //console.info(c_lng);

                var marker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: {lat: c_lat, lng: c_lng}
                });
                markers.push(marker);

            }
        });

    }

}

function addPath() {
    journeyPath.setMap(map);
}

function removePath() {
    journeyPath.setMap(null);
    marker_path = [];
}

function animateCircle( line ) {
    var count = 0;
    window.setInterval(function () {
        count = (count + 1) % 200;

        var icons = line.get('icons');
        icons[0].offset = (count / 2) + '%';
        line.set('icons', icons);
    }, 20);
}

function drawPath() {

    //console.info("Draw path.");

    var i;

    for( i = 0; i < markers.length; i++ ) {
        marker_path.push(markers[i].position);
    }

    var lineSymbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 4,
        strokeColor: 'blue' //'#393'
    };

    journeyPath = new google.maps.Polyline({
        path: marker_path,
        icons: [{
            icon: lineSymbol,
            offset: '100%'
        }],
        geodesic: false,
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        strokeWeight: 5
    });

    addPath();
    animateCircle(journeyPath);
}

function initMap() {
    var poland_coor = {lat: 51.91944, lng: 19.14514};
    //var warsaw_coor = {lat: 52.22968, lng: 21.01223};

    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: poland_coor,
        //scrollwheel: false,
        zoom: 7
    });

    // Create a marker and set its position.
    /*
     var marker = new google.maps.Marker({
     map: map,
     position: warsaw_coor,
     title: 'Warsaw'
     });
     */

}

function main() {

    $('.route').hide();


    $('#calculate').click(function () {

        var from = $('#from').val();
        var to = $('#to').val();

        var URL = "http://pi.zetis.pw/krynskip/web-pathfinder/routes"; //routes
        //var url = routes + "?from=" + from + "&to=" +to;

        console.info(URL);

        $.post(URL,
            {
                from: from,
                to: to
            },
            function ( responseText, statusText, jqXHR ) {

                //console.info("POST SUCCESS");

                var mylocation = jqXHR.getResponseHeader('Location');
                //console.info(mylocation);

                $.ajax(mylocation, {
                    success: function ( response, status, xhr ) {
                        //console.info(response);

                        var cityID_list = JSON.parse(response);
                        console.info(cityID_list);

                        deleteMarkers();

                        if( typeof journeyPath !== "undefined" ) {
                            removePath();
                        }

                        var i;

                        $('#route-title').animate({height: 'show', opacity: 'show'}, "slow");
                        $('#path').empty();
                        $('#path').show();

                        for( i = 0; i < cityID_list.length; i++ ) {

                            var cityname = cities[cityID_list [i]];
                            //console.info(cityname);
                            $('<li>').text(cityname).addClass("list-group-item route-item").appendTo('#path');
                        }

                        $('li').last().addClass("list-group-item-success");

                        $('.route-item').hide();

                        var doneTimeout;
                        var drawTimeout;

                        getMarkers(cityID_list);

                        $("li").each(function ( index ) {
                            $(this).delay(400 * index).show(300);

                            clearTimeout(doneTimeout);
                            clearTimeout(drawTimeout);

                            doneTimeout = setTimeout(function () {
                                setMarkers(cityID_list);
                            }, 400 * index + 400);

                            drawTimeout = setTimeout(function () {
                                drawPath();
                            }, 400 * index + 1050);

                        });

                    }
                });
            });
    });


}

$(document).ready(main);
