<template>
    <div class="entity" :style="entityStyles" :class="{ expanded: isExpanded }"
        draggable="true" @dragstart="onDragStart" @drag="onDrag" @dragend="onDragEnd"
        @touchstart="onDragStart" @touchmove="onDrag" @touchend="onDragEnd"
        @click="onClick">
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
        x: Number,
        y: Number,
        fx: Number,
        fy: Number,
        index: Number,
        vx: Number,
        vy: Number,
        attributes: String,
    },
    data() {
        return {
           el: null,
           isExpanded: false,
           fixed: {
                x: this.fx,
                y: this.fy
           },
           dragOffset: {
                x: 0,
                y: 0
           },
           ghost: null
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
                    left: ((this.fixed.x || this.x) - this.$el.offsetWidth/2) + 'px',
                    top: ((this.fixed.y || this.y) - this.$el.offsetHeight/2) + 'px',
                }
            }
        },
        width: function() {
            return this.$el.offsetWidth
        },
        height: function() {
            return this.$el.offsetHeight
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
    },
    methods: {
      getEventCoords(ev) {
        // get event coordinates for mouse or first touch of touch event

            // for a touch event, use the location of the first touch
            if (ev.targetTouches != undefined) {
                return {
                    x: ev.targetTouches[0].pageX,
                    y: ev.targetTouches[0].pageY
                }
            }
            // otherwise, use event x, y
            return {
                x: ev.x,
                y: ev.y
            }
        },
      onDragStart(ev) {
        // store current position as fixed position
        this.fixed.x = this.x;
        this.fixed.y = this.y;

        let coords = this.getEventCoords(ev)

        // on double touch, release fixed position
        if (ev.touches != undefined && ev.touches.length == 2)  {
            this.release()
            ev.preventDefault()
        }

        // for drag events only (not present on touch events)
        if (ev.dataTransfer != undefined) {
            // create an invisible ghost node to use for drag image
            // to avoid doubling when ghost does not match exactly
            if (!this.ghost) {
                this.ghost = this.$el.cloneNode(true)
                this.ghost.style.opacity = 0
                document.body.appendChild(this.ghost);
            }
            ev.dataTransfer.setDragImage(this.ghost, 0, 0);
            // data transfer is required for Firefox or drag event does not fire
            ev.dataTransfer.setData("text", ev.target.id)
            ev.dataTransfer.effectAllowed = 'move'
        }

        // capture the offset of the click within the entity div
        // at the beginning of the drag event
        var rect = ev.target.getBoundingClientRect();
        this.dragOffset.x = coords.x - rect.left
        this.dragOffset.y = coords.y - rect.top

        this.$parent.$emit('fix-entity-position', this)

      },
      onDrag(ev) {
        let coords = this.getEventCoords(ev)
        // FIXME: in FF, drag event coordinates are 0,0
        // use dragover/mousemove event handler on the document/viewer to get coords?
        if (coords.x == 0 && coords.y == 0) {
            return
        }
        // - adjust click coordinates within the page to coordinates within the
        // view container (subtract parent element offsets)
        // - adjust click coordinate within the element to top left of entity
        // (drag offset calculated at start of drag event)
        // - adjust by element width and height to get center of element
        this.fixed.x = coords.x - this.$parent.$el.offsetLeft - this.dragOffset.x + this.width/2
        this.fixed.y = coords.y - this.$parent.$el.offsetTop - this.dragOffset.y + this.height/2

        this.$emit('fix-entity-position', this)
        this.$emit('restart-simulation')
      },
      onDragEnd(ev) {
        this.fixed.x = this.x
        this.fixed.y = this.y

        this.$emit('fix-entity-position', this)
        this.$emit('restart-simulation')
      },
      onClick(ev) {
        // on shift + click, release a node that has been dragged
        if (ev.shiftKey) {
            this.release()
        }
        return true
      },
      release() {
        // release entity fixed position
        this.fixed.x = null
        this.fixed.y = null

        this.$emit('release-entity-position', this)
        this.$emit('restart-simulation')
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
    border-width: 2px;
    z-index: 4;

    /* set cursor to indicate entity can be dragged */
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;

    /* Set "closed-hand" cursor during drag operation. */
    &:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }

    h2 {
        padding-right: 2em;
        margin: 0;
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
        top: 20px;

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
      padding: 0;
      margin: 0;

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