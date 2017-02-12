//========================FOURSQUARE API RELATED===========================//
// Date to be in the format of YYYYMMDD for FourSquare
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};
var date = new Date();
var dateYYYYMMDDUrl = date.yyyymmdd();

//===============================Google Map===============================//

//Initials the google map api
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 53.802851,
            lng: -1.5519717
        }, // Leeds University
        zoom: 15
    });

    // model
    var Location = function(name, lat, lng, venueId) {
        var self = this;
        this.name = name;
        this.lng = lng;
        this.lat = lat;
        this.venueId = venueId;

        // gets the markers to be place on the map
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(self.lat, self.lng),
            map: map,
            animation: google.maps.Animation.DROP,
            title: self.name,
        });




        // Get comments to be displayed in the infowindow from from foursquare for the marker location.
        this.getFourSquareData = function() {
            var comments = [];
            //var photoURL = []

            //foursquare api URL
            var foursquareURL = 'https://api.foursquare.com/v2/venues/' + self.venueId + '/tips?sort=recent&limit=5&v=' + dateYYYYMMDDUrl + '&client_id=PQ3ZXMZW23HLAJMRRHFBQT01SWRFPPMLP4PRYY2ZMPIORS42&client_secret=GNRBJ0NFGIRINBBEEJMLJTVDHPMGG5YQ2SOJBY342OLWOP22';

            $.getJSON(foursquareURL,
                function(data) {
                    for (i = 0; i < data.response.tips.items.length; i++) {
                        comments.push('<li>' + data.response.tips.items[i].text + '</li>');
                    }
                    // photoURL.push('<img alt="Coffe Shop image here" width="200" src='+ data.response.tips.items[0].photourl +'>')

                }).done(function() {
                self.content = '<div style="display:inline"><img alt="FourSquare Icon" height="60" src="images/foursquareicon.jpg"></div>' + '<h2 style="display:inline">' + self.name + '</h2>' + '<h4>Most Recent Comments</h4>' + '<ol>' + comments.join('') + '</ol>';
            }).fail(function(jqXHR, textStatus, errorThrown) {
                self.content = '<h2>' + self.name + '</h2>' + '<h4>Most Recent Comments</h4>' + '<h5>Oops. There was a problem retrieving this location\'s comments.</h5>';
                console.log('getJSON request failed! ' + textStatus);
            });
        }();

        this.infowindow = new google.maps.InfoWindow();

        // Opens the info window for the location marker.
        this.openInfowindow = function() {
            for (var i = 0; i < locationsModel.locations.length; i++) {
                locationsModel.locations[i].infowindow.close();
            }
            map.panTo(self.marker.getPosition());
            toggleBounce(self.marker)
            self.infowindow.setContent(self.content); //uses the getfoursquaredata function to retrieve data
            self.infowindow.open(map, self.marker);
        };

        // Assigns a click event listener to the marker to open the info window.
        this.addListener = google.maps.event.addListener(self.marker, 'click', (this.openInfowindow));
    };

    // Contains all the locations and search function.
    var locationsModel = {

        locations: [
            new Location('Costa Coffee 1', 53.801678, -1.545176, '4b750e48f964a52074fc2de3'),
            new Location('Costa Coffee 2', 53.802851, -1.5519717, '4ddcb190b0fba481fc878e24'),
            new Location('Costa Coffee 3', 53.807407, -1.551241, '50c9ee26e4b0e4eaff216730'),
            new Location('Physics Coffee Bar', 53.805428, -1.552784, '4ece2e17722e01c57fc7dd5a'),
            new Location('Costa Coffee 4', 53.807363, -1.5511, '5447b524498ec638a88e4ef6'),
            new Location('Costa Coffee 5', 53.804482, -1.540508, '5049b28fe4b01e5032fd40e7'),
            new Location('Coffee Belt', 53.799565, -1.547951, '53089c4e498e2b4a97255056'),
            new Location('Costa Coffee 6', 53.802517, -1.543577, '52a30d3711d24d2c29c97c3c'),
            new Location('Coffee Rand', 53.805326, -1.549201, '4dac22506a2303012f316699'),
            new Location('Coffee To Go', 53.797950, -1.549262, '4bf6c03013aed13a6823eaf7'),
        ],

        query: ko.observable('coffee'),
    };
    // Search function to filter throught the locationsModel location list based on the name of the location
    locationsModel.search = ko.dependentObservable(function() {
        var self = this;
        var search = this.query().toLowerCase();
        return ko.utils.arrayFilter(self.locations, function(location) {
            return location.name.toLowerCase().indexOf(search) >= 0;
        });
    }, locationsModel);

    ko.applyBindings(locationsModel);
}

// Add bounce to a marker
function toggleBounce(marker) {
    // Google map documentation shows to keep one "=" instead of two. Does not work with "=="
    if (marker.setAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 600);
    }
};
