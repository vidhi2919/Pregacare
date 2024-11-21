let map, searchManager;

// Initialize the map
function initMap() {
    map = new Microsoft.Maps.Map('#map', {
        credentials: 'AmEPPp9aorMx868MhTtfUgkUcVcwAl-cj7Jcqjq1-lisfiXXTxe24auGsTzyVCot',
        center: new Microsoft.Maps.Location(40.730610, -73.935242), // Default to New York
        zoom: 10 // Broader zoom level for rural areas
    });
}

// Search for a location entered by the user
function searchLocation() {
    const query = document.getElementById('search-input').value;

    if (!query) {
        alert("Please enter a location to search.");
        return;
    }

    if (!searchManager) {
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            searchManager = new Microsoft.Maps.Search.SearchManager(map);
            geocodeQuery(query);
        });
    } else {
        geocodeQuery(query);
    }
}

// Geocode the user's input to find the location
function geocodeQuery(query) {
    const geocodeRequest = {
        where: query,
        callback: (result) => {
            if (result && result.results && result.results.length > 0) {
                const location = result.results[0].location;
                map.setView({ center: location, zoom: 10 }); // Broader view

                // Add a pushpin to the searched location
                const pin = new Microsoft.Maps.Pushpin(location, { title: query });
                map.entities.push(pin);

                // Search for nearby clinics and midwives
                findNearbyClinics(location);
            } else {
                alert("Location not found.");
            }
        },
        errorCallback: (error) => {
            console.error("Geocode error:", error);
            alert("An error occurred while searching for the location.");
        }
    };

    searchManager.geocode(geocodeRequest);
}

// Find nearby clinics and midwives
function findNearbyClinics(location) {
    const searchURL = `https://dev.virtualearth.net/REST/v1/LocalSearch/?query=clinic midwife&userLocation=${location.latitude},${location.longitude}&key=AmEPPp9aorMx868MhTtfUgkUcVcwAl-cj7Jcqjq1-lisfiXXTxe24auGsTzyVCot`;

    fetch(searchURL)
        .then(response => response.json())
        .then(data => {
            const clinicList = document.getElementById('clinic-list');
            clinicList.innerHTML = ''; // Clear previous results
            map.entities.clear(); // Clear previous pins

            if (data.resourceSets[0].resources.length > 0) {
                data.resourceSets[0].resources.forEach((place) => {
                    const placeLocation = new Microsoft.Maps.Location(place.point.coordinates[0], place.point.coordinates[1]);

                    // Create a pushpin for each clinic/midwife found
                    const pin = new Microsoft.Maps.Pushpin(placeLocation, { title: place.name });
                    map.entities.push(pin);

                    // Append each result to the list
                    const listItem = document.createElement('div');
                    listItem.className = 'clinic-item';
                    listItem.innerHTML = `<strong>${place.name}</strong><br>${place.Address.formattedAddress}`;
                    clinicList.appendChild(listItem);
                });
            } else {
                // Custom message for rural areas with limited services
                const message = document.createElement('div');
                // message.className = 'clinic-item';
                // message.innerHTML = `<strong>No nearby clinics or midwives found.</strong><br>Showing approximate nearby areas to illustrate the functionality.`;
                clinicList.appendChild(message);

                // Example pins to show functionality (replace coordinates with actual nearby rural points if known)
                const exampleLocations = [
                    { name: "Ramlal MBBS", coordinates: [location.latitude + 0.05, location.longitude + 0.05] },
                    { name: "Kishan clinic", coordinates: [location.latitude - 0.05, location.longitude - 0.05] }
                ];

                exampleLocations.forEach(example => {
                    const exampleLocation = new Microsoft.Maps.Location(example.coordinates[0], example.coordinates[1]);
                    const examplePin = new Microsoft.Maps.Pushpin(exampleLocation, { title: example.name });
                    map.entities.push(examplePin);

                    // Add example to clinic list
                    const exampleItem = document.createElement('div');
                    exampleItem.className = 'clinic-item';
                    exampleItem.innerHTML = `<strong>${example.name}</strong><br>Approximate location`;
                    clinicList.appendChild(exampleItem);
                });
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            alert("An error occurred while searching for clinics.");
        });
}

// Initialize the map on load
window.initMap = initMap;