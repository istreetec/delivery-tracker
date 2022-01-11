import { ref, watch } from "vue";

export default function useMap({ currentPosition: center }) {
  const map = ref(null);
  const request = ref(null);
  const leg = ref(null);
  const waypoints = ref([]);
  let destinationAddress = ref({ lat: -1.3720003, lng: 37.9765071 });
  const directionsService = ref(null);
  const directionsRenderer = ref(null);
  const riderMarker = ref(null);

  const launchMap = ({ mapDiv }) => {
    directionsService.value = new google.maps.DirectionsService();
    directionsRenderer.value = new google.maps.DirectionsRenderer();

    map.value = new google.maps.Map(mapDiv, {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 1,
      minZoom: 7,
      maxZoom: 20, // min-max zoom
      // Rider Marker
      center,
      // street view, map type, full screen, and zoom buttom UI control
      streetViewControl: true,
      mapTypeControl: true,
      fullScreenControl: true,
      zoomControl: true
    });

    // Set the rider marker on the same spot as the current map center
    riderMarker.value = new google.maps.Marker({
      position: center,
      map: map.value,
      // animation: google.maps.Animation.DROP,
      title: "Rider",
      icon: "src/assets/rider.svg"
    });

    directionsRenderer.value.setMap(map.value);
  };

  function drawRoute() {
    request.value = {
      origin: { lat: -1.3031934, lng: 36.5672003 }, // center
      destination: destinationAddress.value,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.value.route(request.value, (result, status) => {
      // Hide existing markers immediately before drawing new route
      Object.keys(waypoints.value).length &&
        waypoints.value.map((waypoint) => {
          waypoint.visible = false;
        });
      // Reset waypoints
      waypoints.value = [];

      if (status === google.maps.DirectionsStatus.OK) {
        leg.value = result.routes[0].legs[0];

        leg.value.steps.map((step) => {
          // Accumalate all the route waypoints
          waypoints.value.push(step.start_location);
        });

        // Push destination's latlng too
        waypoints.value.push(leg.value.end_location);
        // Initial rider simulation
        moveRider();
        directionsRenderer.value.setDirections(result);
      } else {
        console.log(status);
      }
    });
  }

  watch(destinationAddress, () => {
    drawRoute();
    moveRider();
  });

  const deliveryAddress = () => {
    map.value.addListener("click", ({ latLng: { lat, lng } }) => {
      destinationAddress.value = { lat: lat(), lng: lng() };
    });
  };

  const moveRider = () => {
    let autoDriveTimer = setInterval(() => {
      // stop the timer when all waypoints are over
      if (waypoints.value.length === 0) {
        clearInterval(autoDriveTimer);
        return;
      } else {
        // move marker to the next position (always the first in the array)
        riderMarker.value.setPosition(waypoints.value[0]);
        // remove the processed position
        waypoints.value.shift();
      }
    }, 1000);
  };

  return { launchMap, drawRoute, deliveryAddress };
}
