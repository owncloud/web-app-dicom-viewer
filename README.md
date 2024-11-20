# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)

The ownCloud Web DICOM Viewer app is an extension of [ownCloud Web](https://github.com/owncloud/web) to preview DICOM files (medical images and their corresponding metadata) in the browser. The preview of the medical images is based on MIT licensed [cornerstone3D](https://github.com/cornerstonejs/cornerstone3D).


## Table of Contents

* [Functionalities of DICOM Viewer Web Extension](#Functionalities-of-DICOM-Viewer-Web-Extension)
* [Adding DICOM Viewer to your oCIS installation](#Adding-DICOM-Viewer-to-your-oCIS-installation)
* [Build and run DICOM Viewer for development](#Build-and-run-for-development)
* [Contributing to DICOM Viewer Web Extension](#Contributing-to-DICOM-Viewer-Web-Extension)
* [Copyright](#Copyright)


## Functionalities of the DICOM Viewer Web Extension

The current release allows to preview .dcm files within oCIS and display their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom in and out, rotation, flipping, colour inversion and reset on the image preview. The app UI is implemented in a responsive manner and adapts the size of the image preview and the way how metadata is displayed to the screen size of the device.

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/1.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/4.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows to preview a DICOM image and it's most important metadata. On request, all corresponding metadata of the file are displayed in the sidebar._

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/2.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/3.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows to zoom, rotate and flip the preview of the image. Inverting the colors of the preview is also supported._


## Adding DICOM Viewer to your oCIS installation
As oCIS administrator, you can add custom web applications for your users. By adding the DICOM Viewer to the oCIS WebUI, you enable your users to take advantage of the [functionalities of this web extension](#Functionalities-of-the-DICOM-Viewer-Web-Extension).

Have a look at the ownCloud Infinite Scale Deployment documentation to learn how to [extend the WebUI with apps](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#extend-web-ui-with-apps). You will find instructions how to [load custom applications](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#loading-applications) into your installation and get a better understanding of the web extension [application structure](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#application-structure) and [application configuration](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#application-configuration).

---

DICOM Viewer's `manifest.json` (referenced in `application structure`) can be found [here](public/manifest.json).

---

### Prerequisites

#### Supported oCIS and Web Versions
- oCIS (>= 6.2.x)
- Web (>= 9.x.x)

#### Supported architectures:
    `amd64`

### App Installation

1. Download the zip file from the [releases page](https://github.com/owncloud/web-app-dicom-viewer/releases)  
2. Extract the zip file to the `apps` directory of the oCIS server. The `apps` directory is set using the `WEB_ASSET_APPS_PATH` environment variable.


## Build and run DICOM Viewer for development

### Prerequisites

- [Node.js `v18`](https://nodejs.org/en/)
- [pnpm `v8`](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/)


### 1. Install dependencies:

```bash
pnpm install
```

### 2. Build the extension

Build the extension using watch for development.

```bash
pnpm build:w
```

### 3. Load the extension

We can load the app into the oCIS server in two different ways, depending on the version of oCIS:

#### 1. For oCIS 5.0.0 (Separate extension server)

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

```bash
docker compose up
```

access oCIS through the following URL: [localhost:9200](https://localhost:9200)


### Docker Tags and respective Dockerfile links

- [`latest`](https://github.com/owncloud/web-app-dicom-viewer/blob/master/docker/Dockerfile) available as `registry.owncloud.com/internal/web-app-dicom-viewer:latest`

- Default volumes: None
- Exposed ports: 8080
- Environment variables: None


## Contributing to DICOM Viewer Web Extension

Contribution in the form of bug reports, user feedback or actual code is always welcome! Please file issues [here](https://github.com/owncloud/web-app-dicom-viewer/issues).


## Copyright

```Text
Copyright (c) 2023 ownCloud GmbH
```
