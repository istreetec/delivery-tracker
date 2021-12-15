import { onMounted, onUnmounted, ref } from "vue";

export default function useGeolocation() {
  // Tip:: reactive won't work for individual properties instead use ref
  const coords = ref({ latitude: 0, longitude: 0 });
  const isSupported = "navigator" in window && "geolocation" in navigator;

  // Invoke geolocation watcher whenever user's location changes
  let watcher = null;
  onMounted(() => {
    if (isSupported) {
      watcher = navigator.geolocation.watchPosition((position) => {
        console.log("--- ", position.coords);
        coords.value = position.coords;
      });
    }
  });

  // Cleanup event listeners
  onUnmounted(() => {
    if (watcher) navigator.geolocation.clearWatch(watcher);
  });

  return { coords, isSupported };
}
