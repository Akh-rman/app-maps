const myModule = {
    init: function() {
        const self = this;
        navigator.geolocation.getCurrentPosition((position) => {
            //console.log(position, self);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const username = prompt("Hello! What is your name?");
            if (username && lat && lng) {
                const socket = io({
                    transportOptions: {
                        polling: {
                            extraHeaders: {
                                "username": username,
                                "lat": lat,
                                "lng": lng
                            }
                        }
                    }
                });

                self.mymap = L.map("mapid").setView([lat, lng], 13);
                L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(self.mymap);

                socket.on("all users", (data) => {
                    self.allMarkers = data;
                    for (let marker in self.allMarkers) {
                        self.addMarker(self.allMarkers[marker]);
                    }
                    //console.log(data);
                });

                socket.on("new user", (data) => {
                    self.allMarkers[data.id] = data;
                    self.addMarker(data);
                });

                socket.on("delete user", (data) => {
                    self.removeMarker(self.allMarkers[data]);
                    delete self.allMarkers[data];
                });
            };
        })
    },
    addMarker: function(marker) {
        marker.marker = L.marker([marker.lat, marker.lng]);
        marker.marker.addTo(this.mymap).bindPopup(marker.username).openPopup();
    },
    removeMarker: function(marker) {
        this.mymap.removeLayer(marker.marker);
    }
};

window.onload = myModule.init();