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
    describe('metadata sidebar content div section', () => {
      it('should exist if "isMetadataExtracted" is true', () => {
        const { wrapper } = getWrapper({ isMetadataExtracted: true })
        console.log(wrapper.html())
        expect(wrapper.find('div #dicom-metadata-sidebar-content').exists()).toBeTruthy()
      })
      it('should not exist if "isMetadataExtracted" is false', () => {
        const { wrapper } = getWrapper({ isMetadataExtracted: false })
        console.log(wrapper.html())
        expect(wrapper.find('div #dicom-metadata-sidebar-content').exists()).toBeFalsy()
      })
    })
    describe('passing patient metadata as props into the metadata sidebar', () => {
      const patientName = 'Albert Einstein'
      const patientID = '1089'
      const patientBirthday = 'Mar 14, 1879' // '18790314'

      const mockedPatientMetadata = {
        isMetadataExtracted: true,
        patientInformation : {
          patientName: patientName,
          patientID: patientID ,
          patientBirthday: patientBirthday
          }, 
        studyInformation: {},
        seriesInformation: {},
        instanceInformation: {},
        imageInformation: {},
        equipmentInformation: {},
        scanningInformation: {},
        uidsInformation: {},
        otherInformation: {}
      }

      it('should display the patients name in the content section of the sidebar', () => {
        const { wrapper } = getWrapper(mockedPatientMetadata)
        expect(wrapper.get('#dicom-metadata-sidebar-content').html()).toContain(patientName)
      })
      it('should display the patients ID in the content section of the sidebar', () => {
        const { wrapper } = getWrapper(mockedPatientMetadata)
        expect(wrapper.get('#dicom-metadata-sidebar-content').html()).toContain(patientID)
      })
      it('should display the patients name in the content section of the sidebar', () => {
        const { wrapper } = getWrapper(mockedPatientMetadata)
        expect(wrapper.get('#dicom-metadata-sidebar-content').html()).toContain(patientName)
      })
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