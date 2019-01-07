<template>
    <div class="dropzone" :class="{ active: isActive, disabled: disabled }" @drop="onDrop"
      @dragover="onDragOver" @dragleave="onDragLeave">
        <p>Drop a MySQL schema anywhere on the page to get started.</p>
      </div>
</template>

<script>
import { mysql } from '../parser'

export default {
  data() {
    return {
      reader: Object,
      isActive: false,
      disabled: false
    }
  },
  created() {
    this.reader = new FileReader()
    this.reader.onload = event => this.parseSchema(event.target.result)
  },
  methods: {
    onDrop(ev) {
      ev.preventDefault()
      this.isActive = false
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === 'file') {
            this.reader.readAsText(ev.dataTransfer.items[i].getAsFile())
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
          this.reader.readAsText(ev.dataTransfer.files[i])
        }
      }
    },
    onDragOver(event) {
      event.preventDefault()
      this.isActive = true
    },
    onDragLeave(event) {
      // exit without dropping; no longer active
      this.isActive = false
    },
    parseSchema(schema) {
      let parsedSchema = mysql.parse(schema)
    //   console.log(parsedSchema)
      this.$emit('schema-loaded', parsedSchema)

      // disable dropzone element once schema is loaded and parsed
      this.disabled = true
    }
  },
}
</script>

<style lang="scss">
.dropzone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;

    &.active {
      border: 3px dashed #bbb;
      border-radius: 5px;
    }

    &.disabled   {
      visibility: hidden
    }

  /* use flexbox to center the paragaph */
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    font-size: 16pt;
  }


  }
</style>