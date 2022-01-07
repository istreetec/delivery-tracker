<template>
  <div>
    <google-maps />
  </div>
</template>

<script>
import GoogleMaps from "./components/GoogleMaps.vue";

export default {
  components: { GoogleMaps }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0;
  padding: 0;
}
</style>
