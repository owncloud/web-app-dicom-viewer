//import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
//var async = require('async')

export const extractMetadataHelper = () => { 
  const uppercase = (s: string) => {
    return s.toUpperCase()
  }

  const test = () => {
    return 'test'
  }  

  return { uppercase, test}
}
/*
export async function fetchVipMetadataInformation(imageId) {
  console.log('fetch vip meta data information for: ' + imageId)
  
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