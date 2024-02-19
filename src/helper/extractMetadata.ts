import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

import dicomTags from './dicomTags'
import uids from './uids'


export const extractMetadata = () => {
  const fetchDicomImageData = async (imageId: string) => {
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

  const formatDateTagChecker = (tag: string): boolean => {
    return (tag.endsWith('_formatDate')) ? true : false
  }

  const formatTimeTagChecker = (tag: string): boolean => {
    return (tag.endsWith('_formatTime')) ? true : false
  }

  const addSopTagChecker = (tag: string): boolean => {
    return (tag.endsWith('_addSOPuids')) ? true : false
  }

  const extractDicomMetadata = async (imageData: object, tags: string[], language: string = 'en') => {
    const extractedData: { label: string, value: string }[] = []

    // get image data
    //const dicomImageData = await fetchDicomImageData(imageId)
    const dicomImageData = imageData

    // extracting data
    for (let i=0; i < tags.length; ++i) {
      // check if tag contains an extension for date or time or SOP formatting
      let isDate = formatDateTagChecker(tags[i])
      let isTime = formatTimeTagChecker(tags[i])
      let isSOP = addSopTagChecker(tags[i])

      let metadataLabel = tags[i]
      if (isDate || isTime || isSOP) {
        metadataLabel = metadataLabel.slice(0, -11) // cutting off the add-on (_formatDate or _formatTime or _addSOPuids) from the label
      }

      let metadataValue = dicomImageData.string(findDicomTagByValue(metadataLabel))

      if (isDate && metadataValue != undefined && metadataValue.length >= 8) {
        metadataValue = formatDate(metadataValue, language, DateTime.DATE_MED)
      }
      else if (isTime && metadataValue != undefined && metadataValue.length >= 4) {
        metadataValue = formatTime(metadataValue, language, DateTime.TIME_24_WITH_SECONDS)
      }
      else if (isSOP && metadataValue != undefined){
        // adding description of the SOP class uids
        metadataValue += ' [' + uids[metadataValue] + ']'
      }

      extractedData.push({
        label: metadataLabel,
        value: metadataValue
      })
    }

    return extractedData
  }

  const formatDate = (date: string, language: string, dateFormat: DateTime): string | undefined => {
  // transforming date into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
  // description of input format see https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html, VR Name 'DA'
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
    return undefined
  }

  const formatTime = (time: string, language: string, timeFormat: DateTime): string | undefined => {
  // transform time string retrieved from dicom metadata into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
  // description of input format see https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html, VR Name 'TM'
  // time output format: e.g. DateTime.TIME_SIMPLE, DateTime.TIME_24_WITH_SECONDS, see https://moment.github.io/luxon/api-docs/index.html

    if (time != undefined && time.length >= 4) {
      let tempDateTimeString =
        '1970-01-01T' +
        time.substring(0, 2) +
        ':' +
        time.substring(2, 4) +
        ':' +
        (time.length >= 6 ? time.substring(4, 6) : '00')

      let formattedTime = DateTime.fromISO(tempDateTimeString).setLocale(language).toLocaleString(timeFormat)

      return upperFirst(formattedTime)
    }
    return undefined
  }

  return { fetchDicomImageData, findDicomTagByValue, formatDateTagChecker, formatTimeTagChecker, addSopTagChecker, formatDate, formatTime, extractDicomMetadata }
}