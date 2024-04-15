import { vi } from 'vitest'
import * as extractMetadata from '../../../src/helper/extractMetadata'

const mockImageData = {
  byteArray: [],
  elements: {}
}

vi.mock('@cornerstonejs/dicom-image-loader', () => ({
  wadouri: {
    loadImage: () => ({
      promise: Promise.resolve({
        data: mockImageData
      })
    })
  }
}))

describe('Methods', () => {
  describe('method: fetchDicomImageData', () => {
    it('should return dicom image data', async () => {
      const dicomImageData = await extractMetadata.fetchDicomImageData('wadouri:https://test')
      expect(dicomImageData).toMatchObject(mockImageData)
    })
  })

  describe('method: extractDicomMetaData', () => {
    it('should return extracted dicom metadata', async () => {
      const imageData = {
        string: function (tag: string) {
          switch (tag) {
            case 'x00100010':
              return 'testPatientName'
            case 'x00100030':
              return '19010101'
            case 'x00080030':
              return '093801'
            case 'x00080016':
              return '1.2.840.10008.1.1'
          }
        }
      }

      const dicomMetaData = await extractMetadata.extractDicomMetadata(
        imageData,
        [
          'patientName',
          'patientBirthdate_formatDate',
          'studyTime_formatTime',
          'SOP_ClassUID_addSOPuids',
          '',
          'invalidMetaData',
          undefined,
          null
        ],
        'en'
      )

      expect(dicomMetaData).toMatchObject([
        { label: 'patientName', value: 'testPatientName' },
        { label: 'patientBirthdate', value: 'Jan 1, 1901' },
        { label: 'studyTime', value: '09:38:01' },
        { label: 'SOP_ClassUID', value: '1.2.840.10008.1.1 [Verification SOP Class]' },
        { label: '', value: undefined },
        { label: 'invalidMetaData', value: undefined }
      ])
    })
  })
})
