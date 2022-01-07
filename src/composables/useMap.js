import { ref, watch } from "vue";

export default function useMap() {
  const map = ref(null);
  const request = ref(null);
  const leg = ref(null);
  const marker = ref(null);
  const markers = ref([]);
  let destinationAddress = ref({ lat: -1.3720003, lng: 37.9765071 });
  const directionsService = ref(null);
  const directionsRenderer = ref(null);

  const launchMap = ({ mapDiv, center }) => {
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

    directionsRenderer.value.setMap(map.value);
  };

  function drawRoute() {
    request.value = {
      origin: { lat: -1.3031934, lng: 36.5672003 },
      destination: destinationAddress.value,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.value.route(request.value, (result, status) => {
      // Reset the existing markers immediately before drawing new route
      Object.keys(markers.value).length &&
        markers.value.map((mark) => (mark.visible = false));

      if (status === google.maps.DirectionsStatus.OK) {
        leg.value = result.routes[0].legs[0];

        // Start
        marker.value = new google.maps.Marker({
          position: leg.value.start_location,
          map: map.value
        });

        // End
        marker.value = new google.maps.Marker({
          position: leg.value.end_location,
          map: map.value
        });

        markers.value.push(marker.value);
        directionsRenderer.value.setDirections(result);
      } else {
        console.log(status);
      }
    });
  }

  watch(destinationAddress, () => {
    drawRoute();
  });

  const deliveryAddress = () => {
    map.value.addListener("click", ({ latLng: { lat, lng } }) => {
      destinationAddress.value = { lat: lat(), lng: lng() };
    });
  };

  return { launchMap, drawRoute, deliveryAddress };
}
