# Blogpost about Dicom Viewer Web Extension

similar blog posts as reference shared by Tobias:
- https://owncloud.com/news/secure-view/
- https://owncloud.com/news/rolling-release/


## TITLE
Preview Medical Images in oCIS with the Dicom Viewer Web Extension

## TAGLINE
Through the new oCIS web extensions system, you can now also easily preview your medial images without installing any additional software

## TEXT
Have you ever received some medical images from your doctor or a lab after a checkup and were curious to have a sneak peak of the pics? Or has a lab technician ever handed you over a CD with your pics and asked to forward them to your GP, physiotherapist or health insurance?

The oCIS Dicom Viewer Web Extension offers an easy way to preview medical images such as Ultrasound, X-ray, CT, MRI, etc. plus their corresponding meta data of DICOM standard without installing any additional software. Plus the extension allows to access all of the extensive meta data attributes that are part of the .dcm file format, a distinguishing feature unique to our app - because we love data and want to make any useful information easily available to you. And of course the file can be shared securely with anyone you desire as it is integrated into the oCIS ecosystem.

### Capabilities of the Dicom Viewer Web Extension
The current release allows to preview .dcm files and display all their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom in and out, rotation, flipping, colour inversion on the image preview.

### How has it been implemented?
This web extension was developed in collaboration between ownCloud and JankariTech, a Software Development company in Nepal. The implementation is based on the open-source (MIT licensed) cornerstone3D JavaScript library (https://github.com/cornerstonejs/cornerstone3D). The app UI is implemented in a responsive manner, and guarantees optimal display on any end device you wish to use.

### How can I get the Dicom Viewer Web Extension?
- Get the latest release from https://github.com/owncloud/web-app-dicom-viewer/releases/
- Download the .zip file and extract it to the apps directory of your oCIS server.

_Prerequisite: Installation of the Dicom Viewer Web Extension App requires oCIS >= 6.2.0_

## SCREENSHOTS & CAPTIONS
https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/4.png
All corresponding metadata of the DICOM file are displayed in the sidebar.

https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/3.png
The extension allows to zoom, rotate, flip and even invert the colours of the preview of the DICOM image.

more screenshots can be found here: https://github.com/owncloud/awesome-ocis/tree/main/webApps/owncloud/web-app-dicom-viewer/screenshots
