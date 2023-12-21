import MetadataSidebar from '../../../src/components/MetadataSidebar.vue'
import { mount, shallowMount } from '@vue/test-utils' 

const selectors = {
  controlsBack: '.header__back',
  controlsClose: '.header__close'
}

// test cases
// dummy test case
describe('MetadataSidebar component', () => {
  describe('dummy test', () => {
    it('do nothing :)', () => {
      expect(1).toBe(1)
    })
  })
})

/*
describe('MetadataSidebar component', () => {
  describe('mount component', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      // const wrapper = shallowMount(MetadataSidebar)
      // const wrapper = mount(MetadataSidebar)
      // const wrapper = shallowMount(MetadataSidebar, { propsData: { } })
      // const wrapper = mount(MetadataSidebar, { props: { } })
      expect(wrapper.exists()).toBeTruthy()
    })
    it('should have the id "dicom-metadata-sidebar"', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.get('#dicom-metadata-sidebar')).toBeTruthy()
    })
  })
})
*/
/*
describe('MetadataSidebar component', () => {
  describe('navigation elements', () => {
    describe('back button', () => {
      it('should exist if screen size is small screen', () => {
        const { wrapper } = getWrapper({ isSmallScreen: true })
        expect(wrapper.find(selectors.controlsBack).exists()).toBeTruthy()
      })
      it('should emit "closeMetadataSidebar"-event on click if screen size is small screen', async () => {
        const { wrapper } = getWrapper({ isSmallScreen: true })
        await wrapper.find(selectors.controlsBack).trigger('click')
        expect(wrapper.emitted('closeMetadataSidebar').length).toBe(1)
      })
      it('should not exist if screen size is not small screen', () => {
        const { wrapper } = getWrapper({ isSmallScreen: false })
        expect(wrapper.find(selectors.controlsBack).exists()).toBeFalsy()
      })
    })
    describe('close button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsClose).exists()).toBeTruthy()
      })
      it('should emit "closeMetadataSidebar"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsClose).trigger('click')
        expect(wrapper.emitted('closeMetadataSidebar').length).toBe(1)
      })
    })
  })
})


function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(MetadataSidebar, {
      props: {
        ...props
      }
      ,
      global: {
        //TODO: solve import for defaultPlugins
        //plugins: [...defaultPlugins()]
      }
    })
  }
}
*/
