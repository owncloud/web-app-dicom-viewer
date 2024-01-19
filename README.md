# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)

The ownCloud Web DICOM Viewer app is an extension of [ownCloud Web](https://github.com/owncloud/web) to preview DICOM files (medical images and their corresponding metadata) in the browser. The preview of the medical images is based on MIT licensed [cornerstone3D](https://github.com/cornerstonejs/cornerstone3D).

The current implementation allows to preview .dcm files and display their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom, rotate, flip, invert and reset of the image preview. The UI is implemented in responsive manner and adapts the size of the image preview and the way how metadata is displayed to the screen size of the device.

## Quick reference

- **Where to file issues:**\
  [owncloud/web-app-dicom-viewer](https://github.com/owncloud/web-app-dicom-viewer/issues)

- **Supported architectures:**\
  `amd64`

## Config

```json
{
  …
  "external_apps": [
    {
      "id": "dicom-viewer",
      "path": "http://localhost:9999/js/web-app-dicom-viewer.js",
      "config": {
        "mimeTypes": [
          "application/dicom",
          "application/octet-stream",
          "application/dicom+xml",
          "application/json"
        ]
      }
    }
  ]
}
 
```


## Docker Tags and respective Dockerfile links

- [`latest`](https://github.com/owncloud/web-app-dicom-viewer/blob/master/docker/Dockerfile) available as `registry.owncloud.com/internal/web-app-dicom-viewer:latest`

## Default volumes

None

## Exposed ports

- 8080

## Environment variables

None

## Copyright

```Text
Copyright (c) 2023 ownCloud GmbH
```
