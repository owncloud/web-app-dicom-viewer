IMAGE_NAME = owncloud/web-app-dicom-viewer/dicom-viewer
TAG = 1.0.0

.PHONY: docker-build
docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .