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
              return 'testPatient'
          }
        }
      }

      const dicomMetaData = await extractMetadata.extractDicomMetadata(
        imageData,
        ['patientName', '', undefined, null],
        'en'
      )

      expect(dicomMetaData).toMatchObject([
        { label: 'patientName', value: 'testPatient' },
        { label: '', value: undefined }
      ])
    })
  })
})
