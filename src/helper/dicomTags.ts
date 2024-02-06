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
  //'': '',
  //'': '',
}

export default dicomTags
