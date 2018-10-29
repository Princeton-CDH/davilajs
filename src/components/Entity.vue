<template>
    <div class="entity" :style="entityStyles">
        <h2>{{ id }}</h2>
        <ul class="fields">
            <li v-for="field in fields" :key="field.name">
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
        fields: Array,
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
        index: Number,
        vx: Number,
        vy: Number,
    },
    data() {
        return {
           el: null,
        }
    },
    mounted() {
        // store local copy so we can determine when $el is available
        this.el  = this.$el;
    },
    computed: {
        entityStyles: function() {
            // only return once $el is available, since we need the size
            if (this.el) {
                return {
                    // adjust by element size;
                    // x,y should be the center of the div
                    left: (this.x - this.$el.offsetWidth/2) + 'px',
                    top: (this.y - this.$el.offsetHeight/2) + 'px',
                }
            }
        }
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
      // display:none;  for now; toggleable later
      list-style-type: none;
      padding-left: 0;

      .type {
          float: right;
          margin-left: 10px;
      }
    }
}
</style>