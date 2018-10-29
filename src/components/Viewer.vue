<template>
    <div class="viewer">
        <Entity v-for="entity in entities" v-bind="entity" :key="entity.id"  />
        <svg class="d3"/>
    </div>
</template>

<script>
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import Entity from './Entity'

export default {
    components: {
        Entity,
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
            .force("charge", forceCollide(50))
            .on("tick", this.ticked)
            .stop()
    },
    mounted() {
        var width = this.$el.clientWidth,
            height = this.$el.clientHeight;

        this.simulation.force("center", forceCenter(width / 2, height / 2))
    },
    methods:  {
        ticked() {
            // entity position styles automatically update based on
            // x and y set by force simulation

            // link positions still todo
            // link
            //     .attr("x1", function(d) { return d.source.x; })
            //     .attr("y1", function(d) { return d.source.y; })
            //     .attr("x2", function(d) { return d.target.x; })
            //     .attr("y2", function(d) { return d.target.y; });
        }
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
            // this.ticked()
            this.simulation.restart()
            return val;
        }
    }
}
</script>

<style>
.viewer, svg.d3 {
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 80%;
    height: 100%;
}
</style>
