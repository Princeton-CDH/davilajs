<template>
  <div class="app">
    <DropZone @schema-loaded="onSchemaLoaded"/>
    <Viewer :entities="entities" :relationships="relationships"/>
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
      this.entities = schema.entities.map(entity => {
          // set defaults so vue can detect changes made by d3 forceSimulation
          entity.x = 0
          entity.y = 0
          return entity
      })
      console.log(schema.relationships)
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
  left: 0;
  top: 0;
  background-color: white;
}
</style>
