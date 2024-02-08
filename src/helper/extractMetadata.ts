import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import dicomTags from './dicomTags'

export const extractMetadata = () => {
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
  // - check where to do nice formatting of date & time values
  // - make this function work for single objects as well as array of objects

  const extractDicomMetadata = async (imageId: string, tags: string[]) => {
    const extractedData: [string, string][] = []

    // get image data
    const dicomImageData = await fetchDicomImageData(imageId)

    // extracting data
    for (let i=0; i < tags.length; ++i) {
      const label = tags[i]
      const value = dicomImageData.string(findDicomTagByValue(tags[i]))
      const element = [label, value]
      extractedData.push(element)
    }

    return extractedData
  }

  return { fetchDicomImageData, findDicomTagByValue, extractDicomMetadata }
}