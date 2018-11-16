<template>
    <line :x1="x1" :y1="y1" :x2="x2" :y2="y2" />
</template>

<script>
export default {
    props: {
        source: Object,
        target: Object,
    },
    computed: {
        x1: function() {
            console.log(this.source.x)
            return this.source.x
        },
        y1: function() {
            return this.source.y
        },
        x2: function() {
            return this.target.x
        },
        y2: function() {
            return this.target.y
        }
    }
}
</script>

<style lang="scss">
line {
    stroke: #999;
    stroke-opacity: 0.6;
    stroke-width: 2;
}
</style>