import { shallowMount } from '@vue/test-utils' 
import { defaultPlugins } from '../../../src/helper/defaultPlugins.js'

import VipMetadataOverlay from '../../../src/components/VipMetadataOverlay.vue'

// test cases
describe('VipMetadataOverlay component', () => {
  describe('mount component', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
    })
    it('should have the id "dicom-viewer-vip-metadata"', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.get('#dicom-viewer-vip-metadata')).toBeTruthy()
    })
  })
  describe('display of data', () => {
    describe('passing patient vip metadata as props into the component', () => {
      const patientName = 'Albert Einstein'
      const patientBirthday = '3/14/1879'
      const institutionName = 'Princeton Hospital'
      const instanceCreationDateTime = 'April 18, 1955, 1:15 AM'

      const patientVipMetadata = {
        patientName: patientName,
        patientBirthday: patientBirthday, 
        institutionName: institutionName, 
        instanceCreationDateTime: instanceCreationDateTime
      }

      it('should display the patients name in the vip metadata overlay', () => {
        const { wrapper } = getWrapper(patientVipMetadata)
        expect(wrapper.get('#dicom-viewer-vip-metadata').html()).toContain(patientName)
      })
      it('should display the patients birthday in the vip metadata overlay', () => {
        const { wrapper } = getWrapper(patientVipMetadata)
        expect(wrapper.get('#dicom-viewer-vip-metadata').html()).toContain(patientBirthday)
      })
      it('should display the institution name in the vip metadata overlayr', () => {
        const { wrapper } = getWrapper(patientVipMetadata)
        expect(wrapper.get('#dicom-viewer-vip-metadata').html()).toContain(institutionName)
      })
      it('should display the instance creation date and time in the vip metadata overlay', () => {
        const { wrapper } = getWrapper(patientVipMetadata)
        expect(wrapper.get('#dicom-viewer-vip-metadata').html()).toContain(instanceCreationDateTime)
      })
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(VipMetadataOverlay, {
      attachTo: document.body,
      props: {
        ...props
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}