import { mount } from '@vue/test-utils'
import Entity from '../../../src/components/Entity.vue'


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
  })

})
