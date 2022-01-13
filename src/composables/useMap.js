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
  const remainingSeconds = ref(0);
  const speedFactor = ref(200);

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
      if (status === google.maps.DirectionsStatus.OK) {
        // Reset waypoints
        waypoints.value = [];
        leg.value = result.routes[0].legs[0]; // single route

        loadWaypoints(leg.value.steps);
        if (remainingSeconds.value > 0) waypoints.value.push(leg.end_location);

        // Push destination's latlng too
        waypoints.value.push(leg.value.end_location);
        // Initial rider simulation
        moveRider();
        directionsRenderer.value.setDirections(result);
      } else {
        console.error(status);
      }
    });
  }

  const loadWaypoints = (steps) => {
    steps.map((step) => {
      let stepSeconds = step.duration.value;
      let nextStopSeconds = speedFactor.value - remainingSeconds.value;

      while (nextStopSeconds <= stepSeconds) {
        let nextStopLatLng = getPointBetween(
          step.start_location,
          step.end_location,
          nextStopSeconds / stepSeconds
        );
        waypoints.value.push(nextStopLatLng);
        nextStopSeconds += speedFactor.value;
      }
      remainingSeconds.value =
        stepSeconds + speedFactor.value - nextStopSeconds;
    });
  };

  // helper method to calculate a point between A and B at some ratio
  const getPointBetween = (a, b, ratio) => {
    return new google.maps.LatLng(
      a.lat() + (b.lat() - a.lat()) * ratio,
      a.lng() + (b.lng() - a.lng()) * ratio
    );
  };

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
