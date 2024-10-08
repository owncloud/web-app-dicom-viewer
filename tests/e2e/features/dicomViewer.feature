Feature: Preview dicom image
  As a user who has a DICOM file
  I want to preview the file
  so that I can assure myself that it contains the right image and check its metadata


  Scenario: user previews dicom image
    Given the dicom file "MRBRAIN.dcm" has been uploaded
    And the user "admin" has logged in
    When the user previews the dicom file "MRBRAIN.dcm"
    Then the user should see the dicom file "MRBRAIN.dcm"
    And the user should see patient name "MR/BRAIN/GRASE/1024" in the VIP metadata section
    When the user checks the extended metadata for dicom file
    Then the user should see patient name "MR/BRAIN/GRASE/1024" in the metadata sidebar
    When the user closes the metadata sidebar
    Then the metadata sidebar should not be displayed