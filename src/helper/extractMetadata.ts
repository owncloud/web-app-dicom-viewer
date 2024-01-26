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
    return 'test'
  }  

  const asynctest = async () => {
    console.log('calling an async function')
    return 'async'
  }

  const findDicomTagByValue = (value: string): string | undefined => {
    return Object.keys(dicomTags).find(key => dicomTags[key] === value)
  }

  const extractDicomMetadata = (imageData: Object, tags: Object) => {
    // takes an Object with dicomImageData and an Object with empty values  
    // seaches for the tags
    // extracts values
    // creates object
    // returns newly created object filled with the corresponding values
    return 'todo'
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

  return { uppercase, lowercase, test, asynctest, findDicomTagByValue, extractDicomMetadata }
}