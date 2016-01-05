var cities = {};
cities['WAW'] = "Warszawa";
cities['PNO'] = "Piaseczno";
cities['KRK'] = "Kraków";
cities['GDN'] = "Gdańsk";
cities['POZ'] = "Poznań";
cities['BZG'] = "Bydgoszcz";
cities['SZZ'] = "Szczecin";
cities['KTW'] = "Katowice";

var map;
var markers = [];

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
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

function setMarkers(cityID_list) {

    console.info("SET MARKERS");

    console.info(cityID_list);

    var i;

    for( i=0; i < cityID_list.length; i++) {

        var cityname = cities[ cityID_list [i]];
        console.info(cityname);

        var dest_url = "http://maps.google.com/maps/api/geocode/json?address=" + cityname;

        $.ajax( dest_url, {
            success: function(responseText, status, xhr) {

                console.info("GEOCODE:");

                var coords = responseText.results[0].geometry.location;
                //console.info(coords);

                var c_lat = coords.lat;
                var c_lng = coords.lng;

                console.info(c_lat);
                console.info(c_lng);

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


    $('#calculate').click( function() {

        var from = $('#from').val();
        var to = $('#to').val();

        var routes = "http://pi.zetis.pw/krynskip/web-pathfinder/routes";
        var url = routes + "?from=" + from + "&to=" +to;

        console.info(url);

        $.ajax( url, {
            success: function(responseText, statusText, jqXHR) {

                var mylocation = jqXHR.getResponseHeader('Location');
                console.info(mylocation);

                $.ajax(mylocation, {
                    success: function( response, status, xhr) {
                        console.info(response);

                        var cityID_list = JSON.parse(response);
                        console.info(cityID_list);

                        deleteMarkers();

                        var i;

                        $('#route-title').animate({height: 'show', opacity: 'show'}, "slow");
                        $('#path').empty();
                        $('#path').show();

                        for( i=0; i < cityID_list.length; i++) {

                            var cityname = cities[ cityID_list [i]];
                            console.info(cityname);
                            $('<li>').text(cityname).addClass("list-group-item route-item").appendTo('#path');
                        }

                        $('li').last().addClass("list-group-item-success");

                        $('.route-item').hide();

                        var doneTimeout;

                        $("li").each(function(index) {
                            $(this).delay(400*index).show(300);

                            clearTimeout(doneTimeout);
                            doneTimeout = setTimeout( function() {
                                setMarkers(cityID_list);
                            }, 400*index+400);
                        });

                    }
                });

            }
        });

    });



}

$(document).ready(main);
