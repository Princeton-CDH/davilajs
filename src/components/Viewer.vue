<template>
    <div class="viewer">
        <div class="entities">
            <Entity v-for="entity in entities" v-bind="entity" :key="entity.id"  />
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
        Relation,
    },
    props: {
        entities: Array,
        relationships: Array,
    },
    data() {
        return {
            simulation: {},
        }
    },
    created() {
        this.simulation = forceSimulation()
            .force("link", forceLink().id(function(d) { return d.id; }).distance(200))
            .force("charge", forceManyBody())
            .force("charge", forceCollide(150))
            .stop()

            // no "tick" event handler is needed, since vue watches and
            // automatically updates entity and line positions
    },
    mounted() {
        var width = this.$el.clientWidth,
            height = this.$el.clientHeight;

        this.simulation.force("center", forceCenter(width / 2, height / 2))
    },
    watch:  {
        entities: function(val) {
            // when entities are initialized, populate the simulation

            this.simulation.nodes(this.entities)

            this.simulation.force("link")
                .links(this.relationships)

            // for testing: instead of restart, can tick once and
            // run ticked (tick() does not call trigger tick event)

            // this.simulation.tick()
            this.simulation.restart()
            return val;
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
