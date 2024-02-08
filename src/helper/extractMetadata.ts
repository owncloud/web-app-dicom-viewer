import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import dicomTags from './dicomTags'

export const extractMetadata = () => { 
  const uppercase = (s: string) => {
    return s.toUpperCase()
  }

  const lowercase = (s: string) => {
    return s.toLowerCase()
  }

  const test = () => {
    var testResult: [string, string][]

    testResult = [
        ['patientName', 'Maxine'],
        ['patientID', '1234'],
        ['patientBirthday', '01011901'],
        ['patientSex', 'F'],
        ['patientWeight', '80']
      ]
    return testResult
  }

  const asynctest = async () => {
    var testResult: [string, string][]

    testResult = [
            ['patientName', 'Maxine'],
            ['patientID', '1234'],
            ['patientBirthday', '01011901'],
            ['patientSex', 'F'],
            ['patientWeight', '80']
          ]

    return testResult
  }

  //const fetchDicomImageData = async (imageId: string): Promise<object> => {
  const fetchDicomImageData = async (imageId: string) => {
    console.log('extract metadata helper - fetching dicom image data for: ' + imageId)

    let dicomImageData

    await cornerstoneDICOMImageLoader.wadouri
      .loadImage(imageId)
      .promise.then(async function (dicomImage) {
        dicomImageData = dicomImage.data
      })

    return dicomImageData
  }

  const findDicomTagByValue = (value: string): string | undefined => {
    return Object.keys(dicomTags).find(key => dicomTags[key] === value)
  }

  // todo: 
  // - store values into object
  // - move the stuff above into helper class function (extractDicomMetadata)
  // - check where to do nice formatting of date & time values
  // - make this function work for single objects as well as array of objects

  const extractDicomMetadata = async (imageId: string, tags: string[]) => {
    var extractedData: [string, string][] = []

    // get image data
    // var dicomImageData = await fetchDicomImageData(imageId)
    // figure out why this can't be done in separate function
    var dicomImageData

    await cornerstoneDICOMImageLoader.wadouri
      .loadImage(imageId)
      .promise.then(async function (dicomImage) {
        dicomImageData = dicomImage.data
      })

    // extracting data
    for (var i=0; i < tags.length; ++i) {
        let label = tags[i]
        let value = dicomImageData.string(findDicomTagByValue(tags[i]))
        let element = [label, value]
        extractedData.push(element)
    }

      return extractedData
    }

  return { uppercase, lowercase, test, asynctest, findDicomTagByValue, fetchDicomImageData, extractDicomMetadata }
}