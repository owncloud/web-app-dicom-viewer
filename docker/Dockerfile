
FROM owncloudops/nginx@sha256:e8fd3ada06c93e82142111a65dc187e503ad4106f4db472b44014bc2a21e1b94

LABEL maintainer="ownCloud GmbH <devops@owncloud.com>" \
  org.opencontainers.image.title="ownCloud Web DICOM Viewer" \
  org.opencontainers.image.vendor="ownCloud GmbH" \
  org.opencontainers.image.authors="ownCloud GmbH" \
  org.opencontainers.image.description="ownCloud Web DICOM Viewer" \
  org.opencontainers.image.licenses="AGPL-3.0" \
  org.opencontainers.image.documentation="https://github.com/owncloud/web-app-dicom-viewer" \
  org.opencontainers.image.url="https://hub.docker.com/r/owncloud/web-app-dicom-viewer" \
  org.opencontainers.image.source="https://github.com/owncloud/web-app-dicom-viewer"

RUN rm -f /var/lib/nginx/html/*

ADD docker/overlay /
ADD dist/ /var/lib/nginx/html

EXPOSE 8080

USER nginx

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
WORKDIR /var/lib/nginx/html
