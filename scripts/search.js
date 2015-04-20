
var searchApp = {

    init: function() {

        var self = this;
        self.markers = [];
        self.initialLocation = new google.maps.LatLng(-33.8665433,151.1956316);
        self.geocoder = new google.maps.Geocoder();

        self.googleMap = new google.maps.Map(document.getElementById('map'), {
            center: self.initialLocation,
            zoom: 15
        });

        searchApp.search('london', '300', 'pizza');
        searchApp.bindUiEvents();
        searchApp.scaleMap();

    },
    /* User interaction events*/
    bindUiEvents: function() {

        $('#searchFormSubmit').on('click', function(){

            var locationValue = $('#location').val();
            var distanceValue = $('#distance').val();
            var interestValue = $('#interest').val();

             searchApp.search(locationValue, distanceValue, interestValue);

        });

        google.maps.event.addDomListener(window, 'resize', function() {
            searchApp.scaleMap();
        });

    },
    /* Search based on user input, and pan to this location */
    search: function(locationValue, distanceValue, interestValue) {

        searchApp.geocoder.geocode( { 'address': locationValue}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {

                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                var latLong = new google.maps.LatLng(latitude, longitude);

                var request = {
                    location: latLong || searchApp.initialLocation,
                    radius: distanceValue || '500',
                    query: interestValue || 'food'
                };

                var service = new google.maps.places.PlacesService(searchApp.googleMap);
                service.textSearch(request, searchApp.textSearchCallback);

                searchApp.googleMap.panTo(latLong);

                // Reset map to pan on resize also
                google.maps.event.addDomListener(window, 'resize', function() {
                    searchApp.googleMap.panTo(latLong);
                });

            }

        });

    },
    /* Insert new markers and remove old */
    textSearchCallback: function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            for (var i = 0; i < searchApp.markers.length; i++) {
                searchApp.markers[i].setMap(null); // Remove old markers
            }

            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                searchApp.createMarker(place); // Create new markers based on result
            }
        }
    },
    /* Set up Google marker */
    createMarker: function(place) {

        var marker = new google.maps.Marker({
            map: searchApp.googleMap,
            position: place.geometry.location,
            icon: 'images/layout/generic-skin/pin.png'
        });

        for ( var key in place ) {

            for (var i = 0; i < place.types.length; i++) {

                switch(place.types[i]) {
                    case 'food' || 'bar' || 'restaurant':
                        marker.icon = 'images/layout/generic-skin/bars.png'
                        break;
                    case 'health':
                        marker.icon = 'images/layout/generic-skin/health.png'
                        break;
                }

            }

        }


        marker.setMap(searchApp.googleMap);
        searchApp.markers.push(marker);

        google.maps.event.addListener(marker, 'click', function() {

            searchApp.slider(place);

        });

    },

    slider: function(place){

        var contentString = '';

        if (place.name) contentString += '<h2>' + place.name + ' </h2>';
        if (place.formatted_address) contentString += '<p>'+' <strong>Address:</strong> '+  place.formatted_address + '</p>';
        if (place.rating) contentString += '<p>'+' <strong>Rating:</strong> '+ place.rating + ' </p>';

        if (place.photos) {
            for ( var i = 0; i < place.photos.length; i++ ) {
                contentString += '<img src="'+ place.photos[i].getUrl({'maxWidth': 400, 'maxHeight': 400}) +'"/>';
            }
        } else {
            contentString += '<p><strong>NO IMAGE AVAILABLE</strong></p>';
        }

        if (place.opening_hours) {
            if (place.opening_hours.open_now ==  true) {
                contentString += '<p>Currently open</p>';
            } else {
                contentString += '<p>Currently closed</p>';
            }
        }

        $('#infoContainer').html(contentString);

    },

    scaleMap: function() {

        /* Set the map to fit window */
        $('#map').css({
            'height': $(window).outerHeight() - $('.site-header-wrapper').outerHeight(),
            'width': 100 + '%'
        });

        $('.filters').css({
            'height' : $(window).height()
        });

    }

};
