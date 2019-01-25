import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Entity from '../../../src/components/Entity.vue'
import sinon from 'sinon'


describe('Entity', () => {

  const wrapper = mount(Entity,  {
  	propsData: {
  		id: 'people',
  		fields: [
  			{ name: 'id', attributes: 'primary key', type: 'integer'}
  		],
  		x: 0,
  		y: 0,
  		fx: 0,
  		fy: 0,
  		index: 0,
  		vx: 0,
  		vy: 0,
  		attributes: ''
		}
	})

  it('renders entity details', () => {
  	// table name
    expect(wrapper.html()).toContain('<h2>' + wrapper.vm.id + '</h2>')
    //field name
    expect(wrapper.html()).toContain(wrapper.vm.fields[0].name)
    // field attributes
    expect(wrapper.html()).toContain('<span class="label">' + wrapper.vm.fields[0].attributes)
    // field type
    expect(wrapper.html()).toContain('<span class="type">' + wrapper.vm.fields[0].type)
  }),

  it('stores element reference when mounted', () => {
    expect(typeof wrapper.vm.el).toBe('object')
    expect(wrapper.vm.el).toEqual(wrapper.vm.$el)
  }),

  it('calculates width from element offset width', () => {
		expect(wrapper.vm.width).toEqual(wrapper.vm.$el.offsetWidth)
  }),

  it('calculates height from element offset height', () => {
		expect(wrapper.vm.height).toEqual(wrapper.vm.$el.offsetHeight)
  }),

  it('converts attributes for use as css class', () => {
  	// default mounted version has no attributes
  	expect(wrapper.vm.attributes).toEqual('')
  	expect(wrapper.vm.attr).toEqual('')

  	// mount with attribute value
  	let wrap =  mount(Entity,  {
	  	propsData: { attributes: 'primary key' }
	  })
  	expect(wrap.vm.attributes).not.toEqual('')
  	expect(wrap.vm.attr).toEqual('primary-key')
  }),

  it('calculates display height if expanded', () => {
  	expect(wrapper.vm.isExpanded).toBeFalsy()
  	expect(wrapper.vm.displayHeight).toEqual(0)

  	wrapper.vm.isExpanded = true
  	expect(wrapper.vm.displayHeight).toEqual(wrapper.vm.el.getElementsByTagName('ul')[0].scrollHeight)
  }),

  it('generates styles with display height', () => {
  	expect(wrapper.vm.fieldStyles.height).toEqual(wrapper.vm.displayHeight + 'px')
  	// simulate el not yet defined
  	wrapper.vm.el = 0
  	expect(wrapper.vm.fieldStyles).toEqual(undefined)
  }),

  it('uses touch coordinates for touch event', () => {
  	let expectedX = 100
  	let expectedY = 250
    let coords = wrapper.vm.getEventCoords({
    	targetTouches: [
    		{ pageX: expectedX, pageY: expectedY },
    	],
    	// x,y should be ignored
    	x: 5,
    	y: 10
    })
    expect(coords.x).toEqual(expectedX)
    expect(coords.y).toEqual(expectedY)
  }),

  it('uses mouse clickcoordinates for non-touch event', () => {
  	let expectedX = 100
  	let expectedY = 250
    let coords = wrapper.vm.getEventCoords({
    	x: expectedX,
    	y: expectedY
    })
    expect(coords.x).toEqual(expectedX)
    expect(coords.y).toEqual(expectedY)
  }),

  it('handles dragstart event', () => {
  	let event = {
  		x: 100,
  		y: 250,
  	}
  	// el used to trigger is the target of the event
		wrapper.trigger('dragstart', event)

    // current x,y stored as fixed x,y
    expect(wrapper.vm.fixed.x).toEqual(wrapper.vm.x)

    // calculate and store click offset from beginning of drag event
    expect(wrapper.vm.dragOffset.x).not.toBe(undefined)
    expect(wrapper.vm.dragOffset.y).not.toBe(undefined)
    expect(wrapper.vm.dragOffset.x).toEqual(event.x - wrapper.element.getBoundingClientRect().left)
    expect(wrapper.vm.dragOffset.y).toEqual(event.y - wrapper.element.getBoundingClientRect().top)

    expect(wrapper.emitted()['fix-entity-position']).toBeTruthy()
    expect(wrapper.emitted()['fix-entity-position']).toEqual([[ wrapper.vm ]])

    // dataTransfer undefined if not set on event
    expect(event.dataTransfer).toBe(undefined)
    expect(wrapper.vm.ghost).toBe(null)
  }),

  it('handles dragend event', () => {
  	// init with x and y non-zero
  	let wrap =  mount(Entity,  {
	  	propsData: { x: 104, y: 207 }
	  })

  	wrap.trigger('dragend')
  	expect(wrap.vm.fixed.x).toEqual(wrap.vm.x)
  	expect(wrap.vm.fixed.y).toEqual(wrap.vm.y)
    expect(wrap.emitted()['fix-entity-position']).toBeTruthy()
    expect(wrap.emitted()['fix-entity-position']).toEqual([[ wrap.vm ]])
    expect(wrap.emitted()['restart-simulation']).toBeTruthy()
  }),

  it('releases fixed position when release is called', () => {
  	wrapper.vm.fixed.x = 1
  	wrapper.vm.fixed.y = 2

  	wrapper.vm.release()
  	// clear fixed x,y
  	expect(wrapper.vm.fixed.x).toEqual(null)
  	expect(wrapper.vm.fixed.y).toEqual(null)
  	// emit release and simulation signals
    expect(wrapper.emitted()['release-entity-position']).toBeTruthy()
    expect(wrapper.emitted()['release-entity-position']).toEqual([[ wrapper.vm ]])
    expect(wrapper.emitted()['restart-simulation']).toBeTruthy()
  }),

  it('releases on shift click', () => {
  	// trigger click with shift key held
    wrapper.vm.release = sinon.mock()
		wrapper.trigger('click', { shiftKey: true })
    expect(wrapper.vm.release.callCount).toBe(1)
  }),

  it('releases on double tap', () => {
  	// trigger click with shift key held
    wrapper.vm.release = sinon.mock()
    // fixme: should be touchstart
		wrapper.trigger('dragstart', { touches: { length: 2 } })
    expect(wrapper.vm.release.callCount).toBe(1)
  })


})
