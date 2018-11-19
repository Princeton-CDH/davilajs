<template>
    <div class="entity" :style="entityStyles" :class="{ expanded: isExpanded }">
        <h2>{{ id }}</h2>
         <a class="toggle" v-on:click="isExpanded = !isExpanded">
            <i class="fas fa-chevron-down"></i>
        </a>
        <ul class="fields" :style="fieldStyles">
            <li v-for="field in fields" :key="field.name">
                {{ field.name }}
                <span class="label">{{ field.attributes }}</span>
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
        attributes: String,
    },
    data() {
        return {
           el: null,
           isExpanded: false,
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
        },

        attr: function() {
            return this.attributes.replace(' ', '-')
        },
        displayHeight: function() {
            // calculate display height; actual element scroll height
            // if expanded, otherwise zero
            if (this.isExpanded) {
                return this.el.getElementsByTagName('ul')[0].scrollHeight;
            }
            return '0';
        },
        fieldStyles: function() {
            // styles for field list within the entity
            if (this.el) {
                return {
                    height: this.displayHeight + 'px',
                }
            }
        },
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

    ul {
        // height set by fieldStyles property
        // height: 0;
        overflow: hidden;
        transition: all 0.5s ease;
    }

    .toggle {
        position: absolute;
        right: 10px;
        top: 40px;

        transition: all 0.5s ease;
        color: gray;
    }

    &.expanded {

        z-index: 5;

        ul {
            // expanded height set based on elment height in fieldStyles
            // property because CSS can't transition to auto height
            // height: auto;
        }

        .toggle {
            transform: rotate(180deg);
        }
    }

   .fields {
          list-style-type: none;
      padding-left: 0;

      .type {
          float: right;
          margin-left: 10px;
      }

      .label {
          padding-left: 0.5em;
          color: gray;
          font-variant: small-caps;
      }

    }
}
</style>