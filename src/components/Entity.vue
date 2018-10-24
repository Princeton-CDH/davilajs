<template>
    <div class="entity">
        <h2>{{ id }}</h2>
        <ul class="fields">
            <li v-for="field in fields">
                {{ field.name }}
                <span class="type">{{ field.type }}</span>
            </li>
        </ul>
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

<style lang="scss">
.entity {
    display: inline-block;
    background-color: white;
    min-width: 150px;
    padding: 10px;
    margin: 2px;
    position: absolute;
    border-style: solid;
    z-index: 4;

    h2 {
        padding-right: 2em;

    }

   .fields {
      // display:none;  /* for now; toggleable later */
      list-style-type: none;
      padding-left: 0;

      .type {
          float: right;
          margin-left: 10px;
      }
    }
}
</style>