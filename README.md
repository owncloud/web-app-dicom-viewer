# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)

The ownCloud Web DICOM Viewer app is an extension of [ownCloud Web](https://github.com/owncloud/web) to preview DICOM files (medical images and their corresponding metadata) in the browser. The preview of the medical images is based on MIT licensed [cornerstone3D](https://github.com/cornerstonejs/cornerstone3D).


## Table of Contents

* [Functionalities of the app](#Functionalities-of-the-DICOM-Viewer-Web-Extension)
* [Installation instructions for developers](#)
* [Installation instructions](#)
* [Contribution](#)

TODO: update TOC!


## Functionalities of the DICOM Viewer Web Extension

The current release allows to preview .dcm files within oCIS and display their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom in and out, rotation, flipping, colour inversion and reset on the image preview. The app UI is implemented in a responsive manner and adapts the size of the image preview and the way how metadata is displayed to the screen size of the device.

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/1.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/4.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows to preview a DICOM image and it's most important meta data. On request, all corresponding metadata of the file are displayed in the sidebar._

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/2.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/3.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows to zoom, rotate and flip the preview of the image. Inverting the colors of the preview is also supported._


## Quick reference

- **Where to file issues:**\
  [owncloud/web-app-dicom-viewer](https://github.com/owncloud/web-app-dicom-viewer/issues)

- **Supported architectures:**\
  `amd64`


## Installation instructions - Add the app to your server
As administrator of an environment you can add custom web applications for your users. By adding DICOM Viewer you enable your users to take advantage of this web extension.

TODO: following text is taken from general installation instructions, insert specific steps?

Please follow the steps provided in our [developer documentation](https://owncloud.dev/services/web/#web-apps) if you want to install any of the
  following apps and extensions. For some of them there are released artifacts, others still need to be built from source code.


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
