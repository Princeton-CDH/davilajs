<template>
    <div class="viewer">
        <Entity v-for="entity in entities" v-bind="entity" :key="entity.id"/>
    </div>
</template>

<script>
import Entity from './Entity'

export default {
    components: {
        Entity,
    },
    props: {
        entities: Array,
    }
}
</script>

<style>
.viewer {
    width: 80%;
    height: 100%;
    display: inline-block;
}
</style>
