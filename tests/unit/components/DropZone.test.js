import Vue from 'vue'
import { mount } from '@vue/test-utils'
import DropZone from '../../../src/components/DropZone.vue'
import sinon from 'sinon'


describe('DropZone', () => {

  const wrapper = mount(DropZone)

  // Inspect the raw component options
  it('has a created hook', () => {
    expect(typeof DropZone.created).toBe('function')
  })
  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    expect(typeof DropZone.data).toBe('function')
    const defaultData = DropZone.data()
    expect(typeof defaultData.reader).toBe('object')
    expect(defaultData.isActive).toBe(false)
  })

  // Inspect the component instance on mount
  it('initializes file reader when created', () => {
    const Constructor = Vue.extend(DropZone)
    const vm = new Constructor().$mount()
    expect(typeof vm.reader).toBe('object')
    expect(typeof vm.reader.onload).toBe('function')
  })

  // Mount an instance and inspect the render output
  it('renders with instructions', () => {

    expect(wrapper.html())
      .toContain('<p>Drop a MySQL schema anywhere on the page to get started.</p>')

    // const Constructor = Vue.extend(DropZone)
    // const vm = new Constructor().$mount()
    // expect(vm.$el.textContent)
    //   .toBe('Drop a MySQL schema anywhere on the page to get started.')
  }),

  it('handles dragover event', () => {
    expect(wrapper.vm.isActive).toBe(false)
    wrapper.trigger('dragover')
    expect(wrapper.vm.isActive).toBe(true)
  }),

  it('handles dragleave event', () => {
    // set isActive to true so we can check drag leave deactivates
    wrapper.vm.isActive = true
    wrapper.trigger('dragleave')
    expect(wrapper.vm.isActive).toBe(false)
  }),

  it('handles drop event', () => {
    // set isActive to true so we can check drop deactivates
    wrapper.vm.isActive = true
    wrapper.vm.reader.readAsText = sinon.spy(FileReader.prototype, 'readAsText')
    // trigger drop with no items
    wrapper.trigger('drop', { dataTransfer: { items: [] } } )
    expect(wrapper.vm.isActive).toBe(false)
    // should not read any data or emit schema-loaded
    expect(wrapper.vm.reader.readAsText.notCalled).toBe(true)

    // trigger drop with non-file item
    wrapper.trigger('drop', { dataTransfer: { items: [ { kind: 'text'} ] } } )
    expect(wrapper.vm.reader.readAsText.notCalled).toBe(true)

    // trigger drop with file in item list
    wrapper.trigger('drop', {
      dataTransfer: {
        items: [ {
          kind: 'file',
          getAsFile: function () {
            return new Blob(['some text content', { type: 'text/plain' }])
          }
        } ]
      }
    } )
    expect(wrapper.vm.reader.readAsText.callCount).toBe(1)

    // trigger drop with file in file list
    // - create a new mounted version, since the first FileReader has been used
    // (running on the same one fails with an InvalidStateError)
    let dropper = mount(DropZone)
    dropper.trigger('drop', {
      dataTransfer: {
        files: [ new Blob(['more text content', { type: 'text/plain' }]) ]
      }
    } )
    // sinon wraps the method, so the call count is total across instances
    expect(dropper.vm.reader.readAsText.callCount).toBe(2)
  }),

  it('emits schema-loaded on FileReader onload', () => {
    let fileContent = 'sample file contents from FileReader'
    wrapper.vm.reader.onload({ target: { result: fileContent } } )
    expect(wrapper.emitted()['schema-loaded']).toBeTruthy()
    expect(wrapper.emitted()['schema-loaded']).toEqual([[ fileContent ]])
  })

})
