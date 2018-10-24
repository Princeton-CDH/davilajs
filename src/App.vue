<template>
  <div class="app">
    <DropZone/>
  </div>
</template>

<script>
import DropZone from './components/DropZone'

export default {
  components: {
    DropZone
  }
}
</script>

<style>
.app {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: white;
}
</style>
