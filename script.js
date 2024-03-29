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

function getMarkers( cityID_list ) { // Added to handle Geocode API limitations and still get all markers.

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

    var i;

    for( i = 0; i < cityID_list.length; i++ ) {

        var cityname = cities[cityID_list [i]];

        var dest_url = geocode_url + cityname;

        $.ajax(dest_url, {
            success: function ( responseText, status, xhr ) {

                //console.info("GEOCODE:");

                var coords = responseText.results[0].geometry.location;

                var c_lat = coords.lat;
                var c_lng = coords.lng;

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

function animateIcon( line ) {

    var count = 0;
    window.setInterval(function () {
        count = (count + 1) % 200;

        var icons = line.get('icons');
        icons[0].offset = (count / 2) + '%';
        line.set('icons', icons);
    }, 20);

}

function drawPath() {

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
    animateIcon(journeyPath);
}

function initMap() {

    var poland_coor = {lat: 51.91944, lng: 19.14514};

    map = new google.maps.Map(document.getElementById('map'), {
        center: poland_coor,
        //scrollwheel: false,
        zoom: 7
    });

}

function main() {

    $('.route').hide();


    $('#calculate').click(function () {

        var from = $('#from').val();
        var to = $('#to').val();

        var URL = "http://pi.zetis.pw/krynskip/web-pathfinder/routes";

        $.post(URL,
            {
                from: from,
                to: to
            },
            function ( responseText, statusText, jqXHR ) {

                var mylocation = jqXHR.getResponseHeader('Location');

                $.ajax(mylocation, {
                    success: function ( response ) {

                        var cityID_list = JSON.parse(response);

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
