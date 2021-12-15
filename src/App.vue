<template>
  <div class="map-controls">
    <div class="current-position">
      <h3>Your position</h3>
      <div>
        Lattitude :: {{ currentPosition.lat }} Longitude ::
        {{ currentPosition.lng }}
      </div>
    </div>

    <div>
      <h3>Distance</h3>
      <p>{{ distance.toFixed(2) }} Kilometers</p>
    </div>

    <div class="target-position">
      <h3>Delivery position</h3>
      <div v-if="targetPosition">
        Lattitude :: {{ targetPosition.lat.toFixed(2) }} Longitude ::
        {{ targetPosition.lng.toFixed(2) }}
      </div>
      <div v-else>User needs to click a point on the map</div>
    </div>
  </div>

  <div ref="mapDiv" style="width: 100%; height: 80vh"></div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import useGeolocation from "./composables/useGeolocation";

const GOOGLE_MAPS_API_KEY = "AIzaSyBqsSzNacF6mddyf48se36Ec3JeuzGdlCY";

export default {
  setup() {
    const { coords } = useGeolocation();
    const targetPosition = ref(null);

    // Map coords to match google maps api's lat and lng convention
    const currentPosition = computed(() => ({
      lat: coords.value.latitude,
      lng: coords.value.longitude
    }));

    const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY });
    const mapDiv = ref(null);
    const map = ref(null);
    let clickListener = null;

    onMounted(async () => {
      // Chill for google object to be available
      await loader.load();
      // mapDiv.value is the actual HTML div element
      map.value = new google.maps.Map(mapDiv.value, {
        zoom: 7,
        center: currentPosition.value
      });

      // Get latitude and longitude of clicked position
      clickListener = map.value.addListener(
        "click",
        ({ latLng: { lat, lng } }) => {
          targetPosition.value = { lat: lat(), lng: lng() };
        }
      );
    });

    onUnmounted(async () => {
      if (clickListener) clickListener.remove();
    });

    let line = null;
    // Draw a line between the two points when position on the map changes
    watch([map, currentPosition, targetPosition], () => {
      if (line) line.setMap(null);
      if (map.value && targetPosition.value != null) {
        line = new google.maps.Polyline({
          path: [currentPosition.value, targetPosition.value],
          map: map.value
        });
      }
    });

    // Calculate the distance between the two points
    const haversineDistance = (pos1, pos2) => {
      const R = 3958.8; // Radius of the Earth in miles
      const rlat1 = pos1.lat * (Math.PI / 180); // Convert degrees to radians
      const rlat2 = pos2.lat * (Math.PI / 180); // Convert degrees to radians
      const difflat = rlat2 - rlat1; // Radian difference (latitudes)
      const difflon = (pos2.lng - pos1.lng) * (Math.PI / 180); // Radian difference (longitudes)
      const d =
        2 *
        R *
        Math.asin(
          Math.sqrt(
            Math.sin(difflat / 2) * Math.sin(difflat / 2) +
              Math.cos(rlat1) *
                Math.cos(rlat2) *
                Math.sin(difflon / 2) *
                Math.sin(difflon / 2)
          )
        );
      return d;
    };

    const distance = computed(() => {
      const miles =
        targetPosition.value === null
          ? 0
          : haversineDistance(currentPosition.value, targetPosition.value);
      const kilometers = miles * 1.60934;
      return kilometers;
    });

    return { currentPosition, mapDiv, distance, targetPosition };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0;
  padding: 0;
}
.map-controls {
  display: flex;
  justify-content: space-between;
}
</style>
