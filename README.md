# ownCloud Web DICOM Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-dicom-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-dicom-viewer)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web-app-dicom-viewer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=owncloud_web-app-dicom-viewer)

The ownCloud Web DICOM Viewer app is an extension of [ownCloud Web](https://github.com/owncloud/web) to preview DICOM files (medical images and their corresponding metadata) in the browser. The preview of the medical images is based on MIT licensed [cornerstone3D](https://github.com/cornerstonejs/cornerstone3D).


## Table of Contents

* [Functionalities of DICOM Viewer Web Extension](#functionalities-of-dicom-viewer-web-extension)
* [Adding DICOM Viewer to Your oCIS Installation](#adding-dicom-viewer-to-your-ocis-installation)
  * [Adding DICOM Viewer to the oCIS Deployment Example](#adding-dicom-viewer-to-the-ocis-deployment-example)
  * [Manual App Installation](#manual-app-installation)
* [Build and Run DICOM Viewer for Development](#build-and-run-dicom-viewer-for-development)
* [Contributing to DICOM Viewer Web Extension](#contributing-to-dicom-viewer-web-extension)
* [Copyright](#copyright)


## Functionalities of DICOM Viewer Web Extension

The current release allows previewing .dcm files within oCIS and displaying their corresponding metadata in a sidebar on request. It offers image manipulation operations such as zoom in and out, rotation, flipping, colour inversion and reset on the image preview. The app UI is implemented in a responsive manner and adapts the size of the image preview and the way that metadata is displayed to the screen size of the device.

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/1.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/4.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows previewing a DICOM image and it's most important metadata. On request, all corresponding metadata of the file are displayed in the sidebar._

<img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/2.png" alt="app functionalities" style="width:48%; height:auto;"> &nbsp; &nbsp; <img src="https://github.com/owncloud/awesome-ocis/blob/main/webApps/owncloud/web-app-dicom-viewer/screenshots/3.png" alt="display of metadata" style="width:48%; height:auto;">

_The extension allows the user to zoom, rotate and flip the preview of the image. Inverting the colors of the preview is also supported._


## Adding DICOM Viewer to Your oCIS Installation
As oCIS administrator, you can add custom web applications for your users. By adding the DICOM Viewer to the oCIS WebUI, you enable your users to take advantage of the [functionalities of this web extension](#functionalities-of-dicom-viewer-web-extension).


### Adding DICOM Viewer to the oCIS Deployment Example
oCIS provides some [deployment examples](https://github.com/owncloud/ocis/tree/master/deployments/examples/) including detailed configuration step by step guides for [local production setup](https://doc.owncloud.com/ocis/next/depl-examples/ubuntu-compose/ubuntu-compose-prod.html) and [deployment of Infinite Scale on the Hetzner Cloud](https://doc.owncloud.com/ocis/next/depl-examples/ubuntu-compose/ubuntu-compose-hetzner.html).
In both cases, it only takes a few very small and simple steps to add the DICOM Viewer Web Extension to the [`ocis_full` deployment example](https://github.com/owncloud/ocis/tree/master/deployments/examples/ocis_full/) of your own installation:

1. Navigate to the `/opt/compose/ocis/ocis_full` folder of your installation and copy [`dicom-viewer.yml`](https://github.com/owncloud/web-app-dicom-viewer/blob/main/dicom-viewer.yml) into the [`web_extensions`](https://github.com/owncloud/ocis/tree/master/deployments/examples/ocis_full/web_extensions) subfolder.

2. Add `DICOMVIEWER=:web_extensions/dicom-viewer.yml` to the `## oCIS Web Extensions ##` section of the `.env` file of your installation (file is located in `/opt/compose/ocis/ocis_full`).\
Your `.env` file should now look like this:
   ```
   ## oCIS Web Extensions ##
   # It is possible to use the oCIS Web Extensions to add custom functionality to the oCIS frontend.
   # For more details see https://github.com/owncloud/web-extensions/blob/main/README.md
   
   <list of all web extensions>
   
   DICOMVIEWER=:web_extensions/dicom-viewer.yml
   ```

3. Append `${DICOMVIEWER:-}` to the `COMPOSE_FILE` variable at the very end of the last line of the `.env` file. This variable combines the configs of all the components that need to be loaded.

   `COMPOSE_FILE=docker-compose.yml${OCIS:-} ... <variables of lots of other configs that are added to docker compose> ... ${DICOMVIEWER:-}`

   After appending `${DICOMVIEWER:-}`, your `.env` file should look like this:
   ```
   ## IMPORTANT ##
   # This MUST be the last line as it assembles the supplemental compose files to be used.
   # ALL supplemental configs must be added here, whether commented or not.
   # Each var must either be empty or contain :path/file.yml
   COMPOSE_FILE=docker-compose.yml${OCIS:-}${TIKA:-}${S3NG:-}${S3NG_MINIO:-}${COLLABORA:-}${MONITORING:-}${IMPORTER:-}${CLAMAV:-}${ONLYOFFICE:-}${INBUCKET:-}${EXTENSIONS:-}${UNZIP:-}${DRAWIO:-}${JSONVIEWER:-}${PROGRESSBARS:-}${EXTERNALSITES:-}${DICOMVIEWER:-}
   ```

4. Update the `csp.yaml` file located in `/config/ocis/csp.yaml` according to the description in https://github.com/owncloud/awesome-ocis/blob/main/webApps/apps.json#L374 

Done! Have fun using the [functionalities of the DICOM Viewer web extension](#functionalities-of-dicom-viewer-web-extension) on your installation!


### Manual App Installation

1. Download the zip file from the [releases page](https://github.com/owncloud/web-app-dicom-viewer/releases).
2. Extract the zip file to the `apps` directory of your oCIS server. The `apps` directory is set using the `WEB_ASSET_APPS_PATH` environment variable.

#### Prerequisites

- Supported oCIS and Web Versions: oCIS (>= 6.2.x), Web (>= 9.x.x)
- Supported Architectures: `amd64`

#### Additional Information

Have a look at the ownCloud Infinite Scale Deployment documentation to learn how to [extend the WebUI with apps](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#extend-web-ui-with-apps). You will find instructions how to [load custom applications](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#loading-applications) into your installation and get a better understanding of the web extension [application structure](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#application-structure) and [application configuration](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#application-configuration).


## Build and Run DICOM Viewer for Development

### Prerequisites

- [Node.js `v18`](https://nodejs.org/en/)
- [pnpm `v8`](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/)


### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run oCIS Server

```bash
docker compose up
```

### 3. Build the Extension

Build the extension using watch for development.

```bash
pnpm build:w
```

### 4. Load the Extension

We can load the app into the oCIS server in two different ways, depending on the version of oCIS:

#### For oCIS 5.0.0 (Separate Extension Server)

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

#### For oCIS >= 5.1

Copy `docker-compose.override.example.yml` to `docker-compose.override.yml`.


### 5. Have Fun

You can access oCIS WebUI with the DICOM Viewer extension through [localhost:9200](https://localhost:9200).


### Docker Tags and Respective Dockerfile Links

- [`latest`](https://github.com/owncloud/web-app-dicom-viewer/blob/master/docker/Dockerfile) available as `registry.owncloud.com/internal/web-app-dicom-viewer:latest`
- Default volumes: None
- Exposed ports: `8080`
- Environment variables: None


## Contributing to DICOM Viewer Web Extension

Contribution in the form of bug reports, user feedback or actual code is always welcome! Please file issues [here](https://github.com/owncloud/web-app-dicom-viewer/issues).


## Copyright

```Text
Copyright (c) 2023 ownCloud GmbH
```
