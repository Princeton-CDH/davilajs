<template>
  <div id="app" @drop="onDrop" @dragover="onDragOver">
  </div>
</template>

<script>
import { mysql } from './parser'

export default {
  name: 'app',
  data() {
    return {
      reader: Object,
    }
  },
  created() {
    this.reader = new FileReader()
    this.reader.onload = event => this.parseSchema(event.target.result)
  },
  methods: {
    onDrop(ev) {
      ev.preventDefault()
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
    },
    parseSchema(schema) {
      console.log(mysql.parse(schema))
    }
  },
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: red;
}
</style>
