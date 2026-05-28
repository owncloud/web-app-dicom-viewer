# ownCloud Web DICOM Viewer

<!-- OSPO-managed README | Generated: 2026-04-16 | v2 -->

[![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE) [![ownCloud OSPO](https://img.shields.io/badge/OSPO-ownCloud-blue)](https://kiteworks.com/opensource) [![Docker Hub](https://img.shields.io/docker/pulls/owncloud)](https://hub.docker.com/r/owncloud/web-app-dicom-viewer)

The ownCloud Web DICOM Viewer is an extension for ownCloud Web that enables previewing DICOM files (medical images and their corresponding metadata) directly in the browser. Built on the MIT-licensed cornerstone3D library, it provides image manipulation tools including zoom, rotation, flipping and color inversion, along with responsive metadata display adapted to the user's screen size.

## Part of oCIS

This extension is part of the [ownCloud Infinite Scale (oCIS)](https://github.com/owncloud/ocis) ecosystem, extending the [ownCloud Web](https://github.com/owncloud/web) frontend with medical imaging capabilities. It requires oCIS >= 6.2.x and Web >= 9.x.x.

The DICOM Viewer is available on [Docker Hub](https://hub.docker.com/r/owncloud/web-app-dicom-viewer).

## Getting Started

Follow the steps below to install the DICOM Viewer extension.

### Quick Installation

1. Download the zip from the [releases page](https://github.com/owncloud/web-app-dicom-viewer/releases)
2. Extract to the `apps` directory of your oCIS server (set via `WEB_ASSET_APPS_PATH`)

### Docker Compose (oCIS Deployment Example)

1. Copy `dicom-viewer.yml` into the `web_extensions` subfolder
2. Add `DICOMVIEWER=:web_extensions/dicom-viewer.yml` to the `.env` file
3. Append `${DICOMVIEWER:-}` to the `COMPOSE_FILE` variable
4. Update `csp.yaml` with the DICOM Viewer app ID

See the [full deployment instructions](https://doc.owncloud.com/ocis/next/depl-examples/ubuntu-compose/ubuntu-compose-prod.html).

### Development Setup

Prerequisites: Node.js v18, pnpm v8, Docker Compose

```bash
pnpm install               # Install dependencies
docker compose up           # Start oCIS server
pnpm build:w               # Build with watch mode
```

Access the Web UI at [localhost:9200](https://localhost:9200).

### Running Tests

```bash
pnpm test                  # Run unit tests (Vitest)
pnpm coverage              # Run tests with coverage
pnpm lint                  # Run ESLint
pnpm test:e2e              # Run e2e tests (Cucumber)
```

## Documentation

- [Extend Web UI with Apps](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#extend-web-ui-with-apps)
- [Loading Applications](https://doc.owncloud.com/ocis/next/deployment/webui/webui-customisation.html#loading-applications)
- [ownCloud Web Extension System](https://owncloud.dev/clients/web/extension-system/)

## Features

Capabilities of the DICOM medical image viewer:

### Image Viewing

- Preview `.dcm` (DICOM) files directly in the oCIS web interface
- Zoom in/out, rotation, flipping, and color inversion controls
- Fullscreen mode with reset capability
- Responsive layout that adapts image preview and metadata display to screen size

### Metadata Display

- Key DICOM metadata shown alongside the image preview
- Full metadata available in a collapsible sidebar on request

### Deployment via Docker Compose

For `ocis_full` deployment examples:

1. Copy `dicom-viewer.yml` into `web_extensions/`
2. Add `DICOMVIEWER=:web_extensions/dicom-viewer.yml` to the `.env` file under `## oCIS Web Extensions ##`
3. Append `${DICOMVIEWER:-}` to the `COMPOSE_FILE` variable
4. Update `csp.yaml` with the app ID `com.github.owncloud.web-app-dicom-viewer`

### Supported Versions

- oCIS >= 6.2.x
- Web >= 9.x.x
- Architecture: `amd64`

### Docker Image

Available as `registry.owncloud.com/internal/web-app-dicom-viewer:latest` (exposed port: `8080`).

## Community & Support

**[Star](https://github.com/owncloud/web-app-dicom-viewer)** this repo and **Watch** for release notifications!

- [ownCloud Website](https://owncloud.com)
- [Community Discussions](https://github.com/orgs/owncloud/discussions)
- [Matrix Chat](https://app.element.io/#/room/#owncloud:matrix.org)
- [Documentation](https://doc.owncloud.com)
- [Enterprise Support](https://owncloud.com/contact-us/)
- [OSPO Home](https://kiteworks.com/opensource)

## Contributing

We welcome contributions! Please read the [Contributing Guidelines](CONTRIBUTING.md)
and our [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

### Workflow

- **Rebase Early, Rebase Often!** We use a rebase workflow. Always rebase on the target branch before submitting a PR.
- **Dependabot**: Automated dependency updates are managed via Dependabot. Review and merge dependency PRs promptly.
- **Signed Commits**: All commits **must** be PGP/GPG signed. See [GitHub's signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification).
- **DCO Sign-off**: Every commit must carry a `Signed-off-by` line:
  ```
  git commit -s -S -m "your commit message"
  ```
- **GitHub Actions Policy**: Workflows may only use actions that are (a) owned by `owncloud`, (b) created by GitHub (`actions/*`), or (c) verified in the GitHub Marketplace.

## Translations

Help translate this project on Transifex:
**<https://explore.transifex.com/owncloud-org/owncloud-web/>**

Please submit translations via Transifex -- do not open pull requests for translation changes.

## Security

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities at **<https://security.owncloud.com>** -- see [SECURITY.md](SECURITY.md).

Bug bounty: [YesWeHack ownCloud Program](https://yeswehack.com/programs/owncloud-bug-bounty-program)

## License

This project is licensed under the [AGPL-3.0](LICENSE).

## About the ownCloud OSPO

The [Kiteworks Open Source Program Office](https://kiteworks.com/opensource), operating under
the [ownCloud](https://owncloud.com) brand, launched on May 5, 2026, to steward the open source
ecosystem around ownCloud's products. The OSPO ensures transparent governance, license compliance,
community health, and sustainable collaboration between the open source community and
[Kiteworks](https://www.kiteworks.com), which acquired ownCloud in 2023.

- **OSPO Home**: <https://kiteworks.com/opensource>
- **GitHub**: <https://github.com/owncloud>
- **ownCloud**: <https://owncloud.com>

For questions about the OSPO or licensing, contact ospo@kiteworks.com.

### License Migration to Apache 2.0

The OSPO is driving a strategic relicensing of ownCloud repositories toward the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), following
the [Apache Software Foundation's third-party license policy](https://www.apache.org/legal/resolved.html).

Individual repositories will migrate as their audit is completed. The LICENSE file
in each repo reflects its **current** license status (not the target).

**Current license: AGPL-3.0** (Category X per Apache policy -- cannot be included in Apache-2.0 works).

Migration prerequisites for this repository:

- **CLA/DCO coverage**: All past contributors must have signed agreements permitting relicensing
- **Copyleft dependency audit**: All AGPL/GPL dependencies must be replaced or isolated
- **KDE heritage review**: Any code with KDE-era copyrights requires legal analysis
- **Complete relicensing**: AGPL-3.0 is a strong copyleft license; migration requires full relicensing of all files, not just a header change
