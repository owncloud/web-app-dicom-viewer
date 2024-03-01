import { shallowMount } from '@vue/test-utils'
import { defaultPlugins } from '../../../src/helper/defaultPlugins.js'

import MetadataSidebarTableRow from '../../../src/components/MetadataSidebarTableRow.vue'

// test cases
describe('MetadataSidebarTableRow component', () => {
  describe('mount component', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
    })
    it('should have the class "dicom-metadata-section"', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.get('.dicom-metadata-section')).toBeTruthy()
    })
  })
  describe('passing props into the metadata sidebar table row component', () => {
    const metadataSectionTitle = 'Metadata Section Title'

    const patientName = 'Albert Einstein'
    const patientID = '1089'
    const patientBirthday = 'Mar 14, 1879'

    const mockedData = {
      metadataSectionName: metadataSectionTitle,
      metadataSectionData: [
        { label: 'patientName', value: patientName },
        { label: 'patientID', value: patientID },
        { label: 'patientBirthday', value: patientBirthday }
      ],
      isFirstSection: true
    }
    it('should display the section title in the .dicom-metadata-section-title header part of the table', () => {
      const { wrapper } = getWrapper(mockedData)
      expect(wrapper.get('.dicom-metadata-section-title').html()).toContain(metadataSectionTitle)
    })
    it('should create a data row (td) for each element of the section data object in the table', () => {
      let numberOfElements = 0
      mockedData.metadataSectionData.forEach(() => {
        numberOfElements += 1
      })
      const { wrapper } = getWrapper(mockedData)
      expect(wrapper.findAll('td').length).toBe(numberOfElements)
    })
    it('should display the section data values in the data part of the table', () => {
      const { wrapper } = getWrapper(mockedData)
      expect(wrapper.html()).toContain(patientName)
      expect(wrapper.html()).toContain(patientID)
      expect(wrapper.html()).toContain(patientBirthday)
    })
    it('should contain the "dicom-metadata-first-section" class if "isFirstSection" is true', () => {
      const { wrapper } = getWrapper({ isFirstSection: true })
      expect(wrapper.get('.dicom-metadata-first-section')).toBeTruthy()
      expect(wrapper.html()).toContain('dicom-metadata-first-section')
    })
    it('should not contain the "dicom-metadata-first-section" class if "isFirstSection" is false', () => {
      const { wrapper } = getWrapper({ isFirstSection: false })
      expect(wrapper.html()).not.toContain('dicom-metadata-first-section')
    })
  })
  describe('formatting labels', () => {
    it('should format a metadata variable name into a nicely readible label', () => {
      const label = 'patientName'
      const formattedLabel = 'Patient Name'
      const { wrapper } = getWrapper()
      expect(wrapper.vm.formatLabel(label)).toEqual(formattedLabel)
    })
    it('should format a metadata variable name with underlines and abbreviations into a nicely readible label', () => {
      const label = 'SOP_InstanceUID'
      const formattedLabel = 'SOP Instance UID'
      const { wrapper } = getWrapper()
      expect(wrapper.vm.formatLabel(label)).toEqual(formattedLabel)
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(MetadataSidebarTableRow, {
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
