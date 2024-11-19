# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)

The ownCloud Web DICOM Viewer app is an extension of [ownCloud Web](https://github.com/owncloud/web) to preview DICOM files (medical images and their corresponding metadata) in the browser. The preview of the medical images is based on MIT licensed [cornerstone3D](https://github.com/cornerstonejs/cornerstone3D).

The current implementation allows to preview .dcm files and display their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom in and out, rotation, flipping, colour inversion and reset on the image preview. The app UI is implemented in a responsive manner and adapts the size of the image preview and the way how metadata is displayed to the screen size of the device.


## Quick reference

- **Where to file issues:**\
  [owncloud/web-app-dicom-viewer](https://github.com/owncloud/web-app-dicom-viewer/issues)

- **Supported architectures:**\
  `amd64`

## Installation

### 1. Install dependencies

```
pnpm install
```

### 2. Build extension

Build the extension using watch for development.

```
pnpm build:w
```

### 3. Load apps

We can load the app into the oCIS server in two different ways, depending on the version of oCIS:

#### 1. For oCIS 5.0.0 (Seperate extension server)

Configure the extension in `web.config.json`

```json
{
  …
  "external_apps": [
    {
      "id": "dicom-viewer",
      "path": "https://host.docker.internal:9999/js/web-app-dicom-viewer.js",
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

#### 2. For oCIS >= 5.1

Copy `docker-compose.override.example.yml` to `docker-compose.override.yml`.

### 4. Run oCIS server

```
docker compose up
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
