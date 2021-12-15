<template>
  <div>
    <h3>Your position</h3>
    <div>
      Lattitude :: {{ currentPosition.lat }} Longitude ::
      {{ currentPosition.lng }}
    </div>
  </div>
</template>

<script>
import { computed } from "@vue/reactivity";
import useGeolocation from "./composables/useGeolocation";

export default {
  setup() {
    const { coords } = useGeolocation();

    // Map coords to match google maps api's lat and lng convention
    const currentPosition = computed(() => ({
      lat: coords.value.latitude,
      lng: coords.value.longitude
    }));

    return { currentPosition };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
