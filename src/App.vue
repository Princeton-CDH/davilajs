<template>
  <div class="app">
    <DropZone @schema-loaded="onSchemaLoaded"/>
    <Viewer :entities="entities"/>
  </div>
</template>

<script>
import DropZone from './components/DropZone'
import Viewer from './components/Viewer'

export default {
  components: {
    DropZone,
    Viewer
  },
  data() {
    return {
      entities: [],
      relationships: [],
    }
  },
  methods: {
    onSchemaLoaded(schema) {
      this.entities = schema.entities
      this.relationships = schema.relationships
    }
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
