// DICOM Standard here: http://dicom.nema.org/medical/dicom/current/output/html/part06.html
// DICOM Tags Library: https://www.dicomlibrary.com/dicom/dicom-tags/

const dicomTags = {
  'x00100010': 'patientName',
  'x00100030': 'patientBirthdate',
  'x00080080': 'institutionName',
  'x00080012': 'instanceCreationDate',
  'x00080013': 'instanceCreationTime',
  'x00100020': 'patientID',
  'x00100040': 'patientSex',
  'x00101030': 'patientWeight',
  'x00081030': 'studyDescription',
  'x00181030': 'protocolName',
  'x00080050': 'accessionNumber',
  'x00200010': 'studyID',
  'x00080020': 'studyDate',
  'x00080030': 'studyTime',
  'x0008103e': 'seriesDescription',
  'x00200011': 'seriesNumber',
  'x00080060': 'modality',
  'x00180015': 'bodyPart',
  'x00080021': 'seriesDate',
  'x00080031': 'seriesTime',
}

export default dicomTags
