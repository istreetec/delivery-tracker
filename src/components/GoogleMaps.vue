<template>
  <div ref="mapDiv" style="width: 100%; height: 80vh"></div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import useMap from "../composables/useMap";
import useGeolocation from "../composables/useGeolocation";

export default {
  setup() {
    const { coords } = useGeolocation();
    const currentPosition = computed(() => ({
      lat: coords.value.latitude,
      lng: coords.value.longitude
    }));
    const { launchMap, drawRoute, deliveryAddress } = useMap({
      currentPosition: currentPosition.value
    });
    const mapDiv = ref(null);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "apikey";
    const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY });

    onMounted(async () => {
      await loader.load();
      launchMap({ mapDiv: mapDiv.value });

      // Simulate drawing the route
      drawRoute();
      // Register click event
      deliveryAddress();
    });

    return { mapDiv };
  }
};
</script>

<style scoped></style>
