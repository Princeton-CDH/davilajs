<template>
  <div class="app" v-on:touchmove.prevent>
    <header>davila.js</header>
    <div class="controls"> <!-- provisional -->
      <p>Drag to arrange entities. Shift + click or two-finger touch to release.</p>
    </div>
    <Viewer :entities="entities" :relationships="relationships"/>
    <footer>an interactive schema annotation tool</footer>

    <DropZone @schema-loaded="onSchemaLoaded" :enabled="dropzone.enabled"/>
  </div>
</template>

<script>
import Vue from 'vue'
import Router from 'vue-router'
import { text } from 'd3-fetch'

import DropZone from './components/DropZone'
import Viewer from './components/Viewer'
import { mysql } from './parser'

Vue.use(Router)

export default {
  components: {
    DropZone,
    Viewer
  },
  data () {
    return {
      entities: [],
      relationships: [],
      dropzone: {
        enabled: true
      }
    }
  },
  mounted () {
    // if a URI is specified as a query string at load time, parse and load
    if (this.$route.query.uri) {
      this.loadRemoteSchema(this.$route.query.uri)
    }
  },
  methods: {
    onSchemaLoaded (text) {
      // takes text from a sql schema file
      let schema = mysql.parse(text)

      // bail out if parsing the text didn't return any entities
      // NOTE: maybe eventually logging in control panel somewhere
      if (!schema.entities.length) {
        return
      }

      this.entities = schema.entities.map(entity => {
        // set defaults so vue can detect changes made by d3 forceSimulation
        entity.x = 0
        entity.y = 0
        return entity
      })
      console.log(schema.relationships)
      this.relationships = schema.relationships
      // disable dropzone
      this.dropzone.enabled = false
    },
    loadRemoteSchema (uri) {
      // load remote uri as text, then parse and display as mysql schema
      var self = this
      text(uri).then(function (text) {
        self.onSchemaLoaded(text)
      })
    }
  }
}
</script>

<style lang="scss">
.app {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: white;

  // from jekyll theme previously in use
  font: 400 16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  color: #111;
  font-feature-settings: "kern" 1;
  font-kerning: normal;

  display: grid;
  grid-template-columns: [start] 205px [main] auto [end];
  grid-template-rows: [start] 60px [main] auto [footer] 55px [end];
  width: 100%;
  height: 100%;
  border: none;
  grid-template-areas:
    "header main"
    "sidebar main"
    "footer main";

  header, .controls, footer {
    border-right: 1px solid gray;
  }

  header {
    grid-area: header;
    display: block;
    padding: 10px;
    border-top: 5px solid #424242;
    border-bottom: 1px dashed gray;
    font-size: 26px;
    color: #424242;
    font-weight: 300;
  }

  .controls {
    grid-area: sidebar;
    margin: 0;
    resize: horizontal;
   }

  footer {
    grid-area: footer;
    border-top: 1px solid gray;
    font-size: 80%;
    font-style: italic;
    padding: 1em;
  }
}
</style>
