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

/*
  // getting values via dicomtags.ts dictionary
  let key = findDicomTagByValue('patientName')
  //console.log('find key by value: ' + key )
  //console.log('getting dicomTag for patient name: ' + dicomTags[key] )
  //console.log('getting value for patient name: ' + this.dicomImageData.string(key) )
  console.log('getting value for patient name: ' + this.dicomImageData.string(findDicomTagByValue('patientName')) )
*/

  // todo: 
  // - store values into object
  // - move the stuff above into helper class function (extractDicomMetadata)
  // - check where to do nice formatting of date & time values
  // - make this function work for single objects as well as array of objects

  const extractDicomMetadataOld = async (imageId: string, dicomData: Object) => {
    // console.log('extracting dicom metadata')

    // define return object with opening tag
    var dicomDataExtracted = '{ '

    // get image data
    var dicomImageData // = await fetchDicomImageData(imageId)
                       // figure out why this can't be done in separate function

    await cornerstoneDICOMImageLoader.wadouri
      .loadImage(imageId)
      .promise.then(async function (dicomImage) {
        dicomImageData = dicomImage.data
      })

    // extract dicom tags from dicom data object
    var tags = Object.keys(dicomData)
    // todo: figure out why first 5 keys are undefined
    // pass string[] instead of object into this function?
    for (var i = 5; i < tags.length; i++) {
      //console.log('attribute name: ' + tags[i] + ' / value: ' + dicomImageData.string(findDicomTagByValue(tags[i])) )
      dicomDataExtracted += tags[i] + ': \'' + dicomImageData.string(findDicomTagByValue(tags[i])) + '\'; '
      /*
      if (i < tags.length -1 ) {
        dicomDataExtracted += ', '
      }
      */
    }

    // add closing tag
    dicomDataExtracted += ' }'

    // console.log('dicom data extracted (from helper function): ' + dicomDataExtracted)

    // todo
    // build new object and populate it
    // returns newly created object filled with the corresponding values

    // Type 'Promise<string>' is missing the following properties from type '{ patientName: string; patientBirthdate: string; institutionName: string; instanceCreationDate: string; instanceCreationTime: string; }': patientName, patientBirthdate, institutionName, instanceCreationDate, instanceCreationTimets(2739)
    return dicomDataExtracted
  }

  const extractDicomMetadata = async (imageId: string, tags: Object) => {
    console.log('tags: ' + tags)
    console.log('tags length: ' + tags.length)

    var testResult: [string, string][]

    /*
    testResult = [
              ['patientName', 'Maxine'],
              ['patientID', '1234'],
              ['patientBirthday', '01011901'],
              ['patientSex', 'F'],
              ['patientWeight', '80']
            ]
    */

    // get image data
    // var dicomImageData = await fetchDicomImageData(imageId)
    // figure out why this can't be done in separate function

    var dicomImageData

    await cornerstoneDICOMImageLoader.wadouri
        .loadImage(imageId)
        .promise.then(async function (dicomImage) {
          dicomImageData = dicomImage.data
        })

    for (var i=0; i < tags.length; ++i) {
        console.log('attribute name: ' + tags[i] + ' / value: ' + dicomImageData.string(findDicomTagByValue(tags[i])) )
        //dicomDataExtracted += tags[i] + ': \'' + dicomImageData.string(findDicomTagByValue(tags[i])) + '\'; '
        //testResult.push(tags[i].toString(), dicomImageData.string(findDicomTagByValue(tags[i])).toString())
    }

      //console.log('extracted data (from helper function): ' + testResult)

      // todo
      // build new object and populate it
      // returns newly created object filled with the corresponding values

      return testResult
    }

  /*
  const fetchVipMetadataInformationHelper = async (imageId: string) => {
    console.log('fetch vip meta data information helper function is called for: ' + imageId)

    let vipInformation
    let patientName, patientBirthdate, institutionName, instanceCreationDate, instanceCreationTime

    await cornerstoneDICOMImageLoader.wadouri
        .loadImage(imageId)
        .promise.then(async function (dicomImage) {
          patientName = dicomImage.data.string('x00100010')
          patientBirthdate = dicomImage.data.string('x00100030')
          institutionName = dicomImage.data.string('x00080080')
          instanceCreationDate = dicomImage.data.string('x00080012')
          instanceCreationTime = dicomImage.data.string('x00080013')
        })
  
      vipInformation.patientName = patientName
      vipInformation.patientBirthdate = patientBirthdate
      vipInformation.institutionName = institutionName
      vipInformation.instanceCreationDate = instanceCreationDate
      vipInformation.instanceCreationTime = instanceCreationTime
    
    return vipInformation
    
  }
  */

  return { uppercase, lowercase, test, asynctest, findDicomTagByValue, fetchDicomImageData, extractDicomMetadata, extractDicomMetadataOld }
}