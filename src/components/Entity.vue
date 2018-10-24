<template>
    <div class="entity">
        <span>id: {{ id }}</span>
        <div>{{ fields }}</div>
    </div>
</template>

<script>
export default {
    props: {
        id: String,
        fields: Array
    }
}
</script>

<style>
.entity {
    display: inline-block;
    width: 200px;
}
</style>