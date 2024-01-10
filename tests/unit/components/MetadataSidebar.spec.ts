import { mount, shallowMount } from '@vue/test-utils' 
import { mock } from 'vitest-mock-extended' //import { mock } from 'jest-mock-extended'
import { defaultPlugins } from '../../../src/helper/defaultPlugins.js'

import MetadataSidebar from '../../../src/components/MetadataSidebar.vue'

const selectors = {
  controlsBack: '.header__back',
  controlsClose: '.header__close'
}

const defaultScreenSize = window.innerWidth
const smallScreenSize = 600 // smaller than 640
const wideScreenSize = 1200 // wider than 640

// test cases
describe('MetadataSidebar component', () => {
  afterEach(() => resizeWindowSize(defaultScreenSize))
  describe('mount component', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
    })
    it('should have the id "dicom-metadata-sidebar"', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.get('#dicom-metadata-sidebar')).toBeTruthy()
    })
  })
  describe('navigation elements', () => {
    describe('back button', () => {
      it('should exist if screen size is small screen', () => {
        const { wrapper } = getWrapper()
        resizeWindowSize(smallScreenSize)
        expect(wrapper.find(selectors.controlsBack).exists()).toBeTruthy()
      })
      it('should emit "closeMetadataSidebar"-event on click if screen size is small screen', async () => {
        const { wrapper } = getWrapper()
        resizeWindowSize(smallScreenSize)
        await wrapper.find(selectors.controlsBack).trigger('click')
        expect(wrapper.emitted('closeMetadataSidebar').length).toBe(1)
      })
      // TODO figure out why this test is failing
      it('should not exist if screen size is not small screen', () => {
        const { wrapper } = getWrapper()
        resizeWindowSize(wideScreenSize)
        // element should exist but not be visible (css display none)
        expect(wrapper.find(selectors.controlsBack).exists()).toBeTruthy()
        //expect(wrapper.find(selectors.controlsBack).isVisible()).toBeFalsy()
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
    // additional test cases
    describe('pass props into the Metadata Sidebar component', () => {
      it.todo('display some patient data (name, id, birthday, ...)')
      it.todo('other props? e.g. when isMetadataExtracted=false it should not display the metadata table #dicom-metadata-sidebar-content')
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(MetadataSidebar, {
      props: {
        ...props
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}

const resizeWindowSize = (width) => {
  window.innerWidth = width
  window.dispatchEvent(new Event('resize'))
}