import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

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

  const dateTagChecker = (tag: string): boolean => {
    return (tag.endsWith('date') || tag.endsWith('Date')) ? true : false
  }

  const timeTagChecker = (tag: string): boolean => {
    if (tag.endsWith('time') || tag.endsWith('Time')) {
      return true
    }
    return false
  }

  // todo:
  // - check where to do nice formatting of date & time values
  // - make this function work for single objects as well as array of objects?

  const extractDicomMetadata = async (imageId: string, tags: string[], language: string = 'en') => {
    const extractedData: { label: string, value: string }[] = []

    // get image data
    const dicomImageData = await fetchDicomImageData(imageId)

    // extracting data
    for (let i=0; i < tags.length; ++i) {

      let isDate = dateTagChecker(tags[i])
      let isTime = timeTagChecker(tags[i])

      let metadataValue = dicomImageData.string(findDicomTagByValue(tags[i]))
      if (isDate && metadataValue.length >= 8) {
        metadataValue = formatDate(metadataValue, language, DateTime.DATE_MED)
      }

      extractedData.push({
        label: tags[i],
        value: metadataValue
      })
    }

    return extractedData
  }

  const formatDate = (date: string, language: string, dateFormat: DateTime) => {
  // transforming date into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
  // date output format: e.g. DateTime.DATE_MED, DateTime.DATE_SHORT, see https://moment.github.io/luxon/api-docs/index.html
    if (date != undefined && date.length >= 8) {
      let tempDateTimeString =
        date.substring(0, 4) +
        '-' +
        date.substring(4, 6) +
        '-' +
        date.substring(6, 8) +
        'T00:00:00'

      let formattedDate = DateTime.fromISO(tempDateTimeString).setLocale(language).toLocaleString(dateFormat)

      return upperFirst(formattedDate)
    }
  }

  /*
  const formatTime(time: string, isSimple: boolean) {
        // transform time string retrieved from dicom metadata into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
        // description of input format see https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html, VR Name 'TM'
        // isSimple determines output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
        if (time != undefined && time.length >= 4) {
          let tempDateTimeString =
            '1970-01-01T' +
            time.substring(0, 2) +
            ':' +
            time.substring(2, 4) +
            ':' +
            (time.length >= 6 ? time.substring(4, 6) : '00')

          let formattedTime = DateTime.fromISO(tempDateTimeString).setLocale(this.$language.current).toLocaleString(isSimple ? DateTime.TIME_SIMPLE : DateTime.TIME_24_WITH_SECONDS)

          return upperFirst(formattedTime)
        }
      }
      */

  return { fetchDicomImageData, findDicomTagByValue, dateTagChecker, timeTagChecker, formatDate, extractDicomMetadata }
}