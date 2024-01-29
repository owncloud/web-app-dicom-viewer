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

  const fetchDicomImageDataHelper = async (imageId: string) => {
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
  // - convert vipInformation.xyz into a string, get value for it (done) --> https://stackoverflow.com/questions/29191451/get-name-of-variable-in-typescript
  // - loop over the whole object and get values for all attributes (done)
  // - store values into object
  // - move the stuff above into helper class function (extractDicomMetadata)
  // - check where to do nice formating of date & time values

  const extractDicomMetadata = (imageData: Object, tags: Object) => {
    console.log('extracting dicom metadata')
    // seaches for the tags
    var k = Object.keys(tags)
    for (var i = 0; i < k.length; i++) {
      console.log('attribute name: ' + k[i] + ' / value: '  )
    }
    // imageData.string(findDicomTagByValue(k[i]))

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

  return { uppercase, lowercase, test, asynctest, findDicomTagByValue, fetchDicomImageDataHelper, extractDicomMetadata }
}