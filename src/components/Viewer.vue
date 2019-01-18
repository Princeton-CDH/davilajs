<template>
    <div class="viewer">
        <div class="entities">
            <Entity v-for="entity in entities" v-bind="entity" :key="entity.id"
                @fix-entity-position="fixEntityPosition"
                @release-entity-position="releaseEntityPosition"
                @restart-simulation="restartSimulation"/>
        </div>
        <svg class="d3">
            <Relation v-for="relationship in relationships" v-bind="relationship" :key="relationship.index" />
        </svg>
    </div>
</template>

<script>
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import Entity from './Entity'
import Relation from './Relation'

export default {
  components: {
    Entity,
    Relation
  },
  props: {
    entities: Array,
    relationships: Array
  },
  data () {
    return {
      simulation: {}
    }
  },
  created () {
    this.simulation = forceSimulation()
      .force('link', forceLink().id(function (d) { return d.id }).distance(100))
      .force('charge', forceManyBody())
      .force('charge', forceCollide(100))
      .stop()

    // no "tick" event handler is needed, since vue watches and
    // automatically updates entity and line positions
  },
  mounted () {
    let width = this.$el.clientWidth
    let height = this.$el.clientHeight

    this.simulation.force('center', forceCenter(width / 2, height / 2))
  },
  watch: {
    entities: function (val) {
      // when entities are initialized, populate the simulation

      this.simulation.nodes(this.entities)

      this.simulation.force('link')
        .links(this.relationships)

      // for testing: instead of restart, can tick once and
      // run ticked (tick() does not call trigger tick event)

      // this.simulation.tick()
      this.simulation.restart()
      return val
    }
  },
  methods: {
    fixEntityPosition (entity) {
      // store an entity's fixed position in the entities array
      // used by the d3 force network simulation
      let d3entity = this.entities.filter(ent => ent.id === entity.id)[0]
      d3entity.fx = entity.fixed.x
      d3entity.fy = entity.fixed.y
    },
    releaseEntityPosition (entity) {
      // release an entity's fixed position in the entities array
      // used by the d3 force network simulation
      let d3entity = this.entities.filter(ent => ent.id === entity.id)[0]
      d3entity.fx = null
      d3entity.fy = null
    },
    restartSimulation () {
      this.simulation.alphaTarget(0.3).restart()
    }
  }
}
</script>

<style lang="scss">
.viewer {
    grid-area: main;
    overflow: hidden;
    position: relative;
    background-color: #efefef;

    .entities, svg.d3 {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    /* for testing line display */
    svg {
        // z-index: 5;
    }

}
</style>
