Feature: Preview dicom image
  As a user
  I want to preview a DICOM file
  so that I can preview DICOM image and its metadata


  Scenario: user previews dicom image
    Given the user "Admin" has logged in
    And the user has uploaded the dicom file "MRBRAIN.dcm"
    When the user previews the dicom file "MRBRAIN.dcm"
    And the user checks VIP metadata for dicom file
    Then the user should see patient name "MR/BRAIN/GRASE/1024" in VIP metadata
    When the user checks the extended metadata for dicom file
    Then the user should see patient name "MR/BRAIN/GRASE/1024" in metadata sidebar
    And the user closes the DICOM file preview
    And the user logs out
