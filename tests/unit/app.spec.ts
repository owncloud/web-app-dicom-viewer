import App from '../../src/App.vue'

/*
import { nextTick, ref } from 'vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { useAppDefaultsMock } from 'web-test-helpers/src/mocks/useAppDefaultsMock'
import { FileContext, useAppDefaults } from 'web-pkg/src/composables/appDefaults'

import { mock } from 'jest-mock-extended'
*/


// defining data
const dicomFiles = [
  {
    id: '1',
    name: 'MRBRAIN.dcm',
    mimeType: 'application/dicom',
    path: 'personal/admin/MRBRAIN.dcm'
  }
] // so far not used in any test case

const dicomTestFilePath = './testfiles/MRBRAIN.dcm' // check if this needs to be an import or a const

// test cases
// dummy test case
describe('Dicom viewer app', () => {
  describe('dummy test', () => {
    it('do nothing :)', () => {
      expect(dicomTestFilePath).toBe(dicomTestFilePath)
    })
  })
})

// test addWadouriPrefix() method
describe('Dicom viewer app', () => {
  describe('Method "addWadouriPrefix"', () => {
    it('should add wadouri prefix to dicom file path', async () => {
      const dicomURL = 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const wadouriDicomURL = 'wadouri:https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const modifiedURL = await App.methods.addWadouriPrefix(dicomURL)
      expect(modifiedURL).toEqual(wadouriDicomURL)
    })
  })
})
