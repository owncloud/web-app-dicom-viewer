# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)

ownCloud Web DICOM Viewer app.

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
      "path": "",
      "config": { }
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
