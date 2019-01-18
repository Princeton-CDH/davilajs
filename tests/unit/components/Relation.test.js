import { mount } from '@vue/test-utils'
import Relation from '../../../src/components/Relation.vue'


describe('Relation', () => {

  const wrapper = mount(Relation,  {
  	propsData: {
			source: { x: 0, y: 1 },
			target: { x: 100, y: 200 },
		}
	})

  it('renders a line', () => {
    expect(wrapper.html())
    	.toContain('<line x1="' + wrapper.vm.x1 + '" y1="' + wrapper.vm.y1 + '" ' +
    		'x2="' + wrapper.vm.x2 + '" y2="' + wrapper.vm.y2 + '">')
  }),
  it('computes x1 from source x', () => {
  	expect(wrapper.vm.x1).toBe(wrapper.vm.source.x)
  }),
  it('computes y1 from source y', () => {
  	expect(wrapper.vm.y1).toBe(wrapper.vm.source.y)
  }),
  it('computes x2 from target x', () => {
  	expect(wrapper.vm.x2).toBe(wrapper.vm.target.x)
  }),
  it('computes y2 from target y', () => {
  	expect(wrapper.vm.y2).toBe(wrapper.vm.target.y)
  })

})
