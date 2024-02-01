Feature: Preview dicom image

  Scenario: user previews dicom image
    Given "Admin" has logged in
    And "Admin" has uploaded the dicom file "MRBRAIN.dcm"
    When "Admin" previews the dicom file "MRBRAIN.dcm"
    And "Admin" opens files app
    And "Admin" deletes file "MRBRAIN.dcm"
    And "Admin" logs out
