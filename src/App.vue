<template>
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1 oc-flex">
    <div
      id="dicom-viewer-main"
      class="oc-position-relative oc-flex oc-flex-center oc-flex-middle oc-flex-around oc-p-s"
      :class="
        isShowMetadataActivated ? 'oc-width-1-2@s oc-width-2-3@m oc-visible@s' : 'oc-width-1-1'
      "
    >
      <div id="dicom-canvas" class="dicom-canvas oc-position-relative oc-mb-xl">
        <vip-metadata-overlay
          v-show="isVipMetadataFetched"
          :patient-name="vipInformation.patientName"
          :patient-birthdate="formatOverlayDate(vipInformation.patientBirthdate)"
          :institution-name="vipInformation.institutionName"
          :instance-creation-date-time="
            formatOverlayDateAndTime(
              vipInformation.instanceCreationDate,
              vipInformation.instanceCreationTime
            )
          "
        />
      </div>
      <div id="dicom-viewer-toggle-metadata-sidebar" class="oc-flex oc-position-absolute">
        <oc-button
          id="toggle-metadata-sidebar"
          v-oc-tooltip="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          class="preview-controls-show-metadata oc-m-s oc-p-xs"
          appearance="raw"
          :aria-label="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          @click="toggleShowMetadata"
        >
          <oc-icon
            :fill-type="isShowMetadataActivated ? 'fill' : 'line'"
            name="side-bar-right"
            variation="inherit"
          />
        </oc-button>
      </div>
      <dicom-controls
        :files="dicomFiles"
        :active-index="0"
        :is-folder-loading="false"
        :current-image-rotation="currentImageRotation"
        :current-image-zoom="currentImageZoom"
        :is-show-metadata-activated="isShowMetadataActivated"
        @set-zoom="setZoom"
        @set-rotation="setRotation"
        @set-horizontal-flip="setHorizontalFlip"
        @set-vertical-flip="setVerticalFlip"
        @toggle-inversion="toggleInversion"
        @reset-viewport="resetViewport"
        @toggle-show-metadata="toggleShowMetadata"
        @toggle-previous="prev"
        @toggle-next="next"
      />
    </div>
    <metadata-sidebar
      v-show="isShowMetadataActivated"
      :patient-information="patientInformation"
      :study-information="studyInformation"
      :series-information="seriesInformation"
      :instance-information="instanceInformation"
      :image-information="imageInformation"
      :equipment-information="equipmentInformation"
      :scanning-information="scanningInformation"
      :uids-information="uidsInformation"
      :other-information="otherInformation"
      :is-metadata-extracted="isMetadataFetched && isImageMetadataExtractedFromViewport"
      @close-metadata-sidebar="toggleShowMetadata"
    />
  </div>
</template>

<script lang="ts">
// import cornerstone packages
import dicomParser from 'dicom-parser'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

import { RenderingEngine, Types, Enums, metaData } from '@cornerstonejs/core'

// vue imports
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'

// other imports & declarations
import DicomControls from './components/DicomControls.vue'
import VipMetadataOverlay from './components/VipMetadataOverlay.vue'
import MetadataSidebar from './components/MetadataSidebar.vue'
import {
  fetchDicomImageData,
  findDicomTagByValue,
  extractDicomMetadata
} from './helper/extractMetadata'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

const { ViewportType } = Enums

// specify external dependencies
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser

// configure cornerstone dicom image loader
const { preferSizeOverAccuracy, useNorm16Texture } = cornerstone.getConfiguration().rendering
cornerstoneDICOMImageLoader.configure({
  useWebWorkers: true,
  decodeConfig: {
    convertFloatPixelDataToInt: false,
    use16BitDataType: preferSizeOverAccuracy || useNorm16Texture
  }
})

// configure web worker framework
let maxWebWorkers = 1

if (navigator.hardwareConcurrency) {
  maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7)
}

const config = {
  maxWebWorkers,
  startWebWorkersOnDemand: true,
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: true,
      strict: false
    }
  }
}

try {
  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)
} catch (e) {
  console.error('Error initializing cornerstone web worker manager', e)
}

// register image loader
// "loadImage" is used for stack, "createAndCacheVolume" for volumes (not used at this point),
// see also https://www.cornerstonejs.org/docs/tutorials/basic-volume
cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

export default defineComponent({
  //name: 'DicomViewer',
  components: {
    DicomControls,
    MetadataSidebar,
    VipMetadataOverlay
  },
  props: {
    url: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { $gettext } = useGettext()

    return {
      imageShowMetadataDescription: $gettext('Show DICOM metadata'),
      imageHideMetadataDescription: $gettext('Hide DICOM metadata')
    }
  },
  data() {
    return {
      element: null,
      renderingEngine: null,
      viewport: null,
      viewportCameraParallelScale: 1,
      dicomUrl: null,
      dicomImageData: null,
      currentImageZoom: 1,
      currentImageRotation: 0,
      isVipMetadataFetched: false,
      isMetadataFetched: false,
      isImageMetadataExtractedFromViewport: false,
      isDicomImageDataFetched: false,
      isShowMetadataActivated: false,
      dicomFiles: [this.resource], // currently not used since only one file is displayed, show prev/next feature will be implemented later, see https://github.com/owncloud/web-app-dicom-viewer/issues/7
      vipInformation: {
        patientName: '',
        patientBirthdate: '',
        institutionName: '',
        instanceCreationDate: '',
        instanceCreationTime: ''
      },
      patientInformation: [],
      studyInformation: [],
      seriesInformation: [],
      instanceInformation: [],
      imageInformation: [],
      equipmentInformation: [],
      scanningInformation: [],
      uidsInformation: [],
      otherInformation: []
    }
  },
  // vue js lifecylce functions

  async mounted() {
    if (this.url) {
      this.dicomUrl = await this.addWadouriPrefix(this.url)
      // get vip metadata
      await this.fetchVipMetadataInformation(this.dicomUrl)

      // prefetch all other metadata (in separate function for performance reasons)
      await this.fetchMetadataInformation(this.dicomUrl)
    }
    // check if cornerstone core is initialized
    if (!cornerstone.isCornerstoneInitialized()) {
      await this.initCornerstoneCore()
    }

    // set reference to HTML element for viewport
    this.element = document.getElementById('dicom-canvas') as HTMLDivElement

    // instantiate/register rendering engine
    this.renderingEngine = new RenderingEngine('dicomRenderingEngine')

    // create a stack viewport
    const { ViewportType } = Enums

    const viewportId = 'CT_STACK' // additional types of viewports see: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
    const element = this.element

    const viewportInput = {
      viewportId,
      type: ViewportType.STACK,
      element,
      defaultOptions: {
        background: <Types.Point3>[0.2, 0, 0.2]
      }
    }

    // enable element
    this.renderingEngine.enableElement(viewportInput)

    var canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.style.height = '100%'
      canvas.style.width = '100%'
    }

    // get stack viewport that was created
    this.viewport = <Types.IStackViewport>this.renderingEngine.getViewport(viewportId)

    // add resource to stack, ensure resource url is not empty!
    if (this.dicomUrl) {
      // define a stack containing a single image
      const dicomStack = [this.dicomUrl]

      // set stack on the viewport (currently only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // set initial parallel scale factor and render the image (updates every viewport in the rendering engine)
      this.setViewportCameraParallelScaleFactor()
      this.setZoom(this.currentImageZoom)
      this.viewport.render()

      // getting image metadata from viewport
      this.getImageMetadataFromViewport(this.dicomUrl)
    }
  },
  updated() {
    // this.viewport.resize()
  },
  beforeUnmount() {
    this.renderingEngine.destroy()
    this.isVipMetadataFetched = false
    this.isMetadataFetched = false
    this.isImageMetadataExtractedFromViewport = false
    this.isDicomImageDataFetched = false
  },

  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone core', e)
      }
    },
    addWadouriPrefix(url: string): string {
      return 'wadouri:' + url
    },
    async fetchVipMetadataInformation(imageId) {
      if (!this.isDicomImageDataFetched) {
        this.dicomImageData = await fetchDicomImageData(imageId)
        if (this.dicomImageData != null) {
          this.isDicomImageDataFetched = true
        }
      }

      this.vipInformation.patientName = this.dicomImageData.string(
        findDicomTagByValue('patientName')
      )
      this.vipInformation.patientBirthdate = this.dicomImageData.string(
        findDicomTagByValue('patientBirthdate')
      )
      this.vipInformation.institutionName = this.dicomImageData.string(
        findDicomTagByValue('institutionName')
      )
      this.vipInformation.instanceCreationDate = this.dicomImageData.string(
        findDicomTagByValue('instanceCreationDate')
      )
      this.vipInformation.instanceCreationTime = this.dicomImageData.string(
        findDicomTagByValue('instanceCreationTime')
      )

      this.isVipMetadataFetched = true
    },
    async fetchMetadataInformation(imageId) {
      // ensure dicom image data has been fetched
      if (!this.isDicomImageDataFetched) {
        this.dicomImageData = await fetchDicomImageData(imageId)
        if (!this.isDicomImageDataFetched) {
          if (this.dicomImageData != null) {
            this.isDicomImageDataFetched = true
          }
        }
      }

      // patientInformation
      const patientInformationTags = [
        'patientName',
        'patientID',
        'patientBirthdate_formatDate',
        'patientSex',
        'patientWeight'
      ]
      const patientInformation = extractDicomMetadata(
        this.dicomImageData,
        patientInformationTags,
        this.$language.current
      )
      patientInformation.then((result) => {
        this.patientInformation = result
      })

      // studyInformation
      const studyInformationTags = [
        'studyDescription',
        'protocolName',
        'accessionNumber',
        'studyID',
        'studyDate_formatDate',
        'studyTime_formatTime'
      ]
      const studyInformation = extractDicomMetadata(
        this.dicomImageData,
        studyInformationTags,
        this.$language.current
      )
      studyInformation.then((result) => {
        this.studyInformation = result
      })

      // seriesInformation
      const seriesInformationTags = [
        'seriesDescription',
        'seriesNumber',
        'modality',
        'bodyPart',
        'seriesDate_formatDate',
        'seriesTime_formatTime'
      ]
      const seriesInformation = extractDicomMetadata(
        this.dicomImageData,
        seriesInformationTags,
        this.$language.current
      )
      seriesInformation.then((result) => {
        this.seriesInformation = result
      })

      // instanceInformation
      const instanceInformationTags = [
        'instanceNumber',
        'acquisitionNumber',
        'acquisitionDate_formatDate',
        'acquisitionTime_formatTime',
        'instanceCreationDate_formatDate',
        'instanceCreationTime_formatTime',
        'contentDate_formatDate',
        'contentTime_formatTime'
      ]
      const instanceInformation = extractDicomMetadata(
        this.dicomImageData,
        instanceInformationTags,
        this.$language.current
      )
      instanceInformation.then((result) => {
        this.instanceInformation = result
      })

      // imageInformation
      const imageInformationTags = [
        'photometricInterpretation',
        'imageType',
        'rescaleSlope',
        'rescaleIntercept',
        'imagePositionPatient',
        'imageOrientationPatient',
        'patientPosition',
        'pixelSpacing',
        'imageComments'
      ]
      const imageInformation = extractDicomMetadata(
        this.dicomImageData,
        imageInformationTags,
        this.$language.current
      )
      imageInformation.then((result) => {
        if (this.imageInformation.length == 0) {
          // image information from viewport haven yet been added to this.imageInformation
          // will be added later in getImageMetadataFromViewport() through splice method to keep the right order
          this.imageInformation = result
        } else {
          // image information from viewport have already been added
          // storing elements in temp variable
          const tempImageInformation = this.imageInformation
          // adding image information elements from viewport (tempImageInformation) in proper order
          this.imageInformation = tempImageInformation
            .slice(0, 1)
            .concat(result.slice(0, 2))
            .concat(tempImageInformation.slice(1, 5))
            .concat(result.slice(2, 8))
            .concat(tempImageInformation.slice(5, 6))
            .concat(result.slice(8, 9))
        }
      })

      // equipmentInformation
      const equipmentInformationTags = [
        'manufacturer',
        'model',
        'stationName',
        'AE_Title',
        'institutionName',
        'softwareVersion',
        'implementationVersionName'
      ]
      const equipmentInformation = extractDicomMetadata(
        this.dicomImageData,
        equipmentInformationTags,
        this.$language.current
      )
      equipmentInformation.then((result) => {
        this.equipmentInformation = result
      })

      // scanningInformation
      const scanningInformationTags = [
        'scanningSequence',
        'sequenceVariant',
        'scanOptions',
        'sliceThickness',
        'repetitionTime',
        'echoTime',
        'inversionTime',
        'imagingFrequency',
        'imagedNucleus',
        'echoNumbers',
        'magneticFieldStrength',
        'spacingBetweenSlices',
        'numberOfPhaseEncodingSteps',
        'echoTrainLength'
      ]
      const scanningInformation = extractDicomMetadata(
        this.dicomImageData,
        scanningInformationTags,
        this.$language.current
      )
      scanningInformation.then((result) => {
        this.scanningInformation = result
      })

      // uidsInformation
      const uidsInformationTags = [
        'studyUID',
        'seriesUID',
        'instanceUID',
        'SOP_ClassUID_addSOPuids',
        'transferSyntaxUID',
        'frameOfReferenceUID'
      ]
      const uidsInformation = extractDicomMetadata(
        this.dicomImageData,
        uidsInformationTags,
        this.$language.current
      )
      uidsInformation.then((result) => {
        this.uidsInformation = result
      })

      // otherInformation
      const otherInformationTags = [
        'specificCharacterSet',
        'referringPhysicianName',
        'MR_AcquisitionType',
        'numberOfAverages',
        'percentSampling',
        'percentPhaseFieldOfView',
        'lowRR_Value',
        'highRR_Value',
        'intervalsAcquired',
        'intervalsRejected',
        'heartRate',
        'receiveCoilName',
        'transmitCoilName',
        'inPlanePhaseEncodingDirection',
        'flipAngle',
        'positionReferenceIndicator',
        'windowCenter',
        'windowWidth'
      ]
      const otherInformation = extractDicomMetadata(
        this.dicomImageData,
        otherInformationTags,
        this.$language.current
      )
      otherInformation.then((result) => {
        this.otherInformation = result
      })

      this.isMetadataFetched = true
    },
    getImageMetadataFromViewport(imageId: string) {
      // get image related metadata directly from viewport
      // proper values of these tags can't be extracted with extractDicomMetadata helper function since this tags are of value US (Unsigned Short),
      // see https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_6.2.html

      const imageData = this.viewport.getImageData()
      // returns IImageData object, see https://www.cornerstonejs.org/api/core/namespace/Types#IImageData

      if (imageId != (null || undefined) && typeof imageId == 'string') {
        const { pixelRepresentation, bitsAllocated, bitsStored, highBit, samplesPerPixel } =
          metaData.get('imagePixelModule', imageId)

        // adding values to image information array in corresponding order
        this.imageInformation.splice(0, 0, {
          label: 'rowsX_Columns',
          value: imageData.dimensions[0] + ' x ' + imageData.dimensions[1]
        })
        this.imageInformation.splice(3, 0, { label: 'bitsAllocated', value: bitsAllocated })
        this.imageInformation.splice(4, 0, { label: 'bitsStored', value: bitsStored })
        this.imageInformation.splice(5, 0, { label: 'highBit', value: highBit })
        this.imageInformation.splice(6, 0, {
          label: 'pixelRepresentation',
          value: pixelRepresentation
        })
        this.imageInformation.splice(13, 0, { label: 'samplesPerPixel', value: samplesPerPixel })

        this.isImageMetadataExtractedFromViewport = true
      }
    },
    setViewportCameraParallelScaleFactor() {
      const camera = this.viewport.getCamera()
      this.viewportCameraParallelScale = camera.parallelScale * 0.925
      // add small correction factor to remove purple border around image
    },
    // functions for styling data
    formatOverlayDateAndTime(date: string, time: string) {
      // transforming date and time into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      if (date != undefined && time != undefined && date.length >= 8 && time.length >= 6) {
        let tempDateTimeString =
          date.substring(0, 4) +
          '-' +
          date.substring(4, 6) +
          '-' +
          date.substring(6, 8) +
          'T' +
          time.substring(0, 2) +
          ':' +
          time.substring(2, 4) +
          ':' +
          time.substring(4, 6)

        let formattedDate = DateTime.fromISO(tempDateTimeString)
          .setLocale(this.$language.current)
          .toLocaleString(DateTime.DATETIME_MED)

        return upperFirst(formattedDate)
      }
    },
    formatOverlayDate(date: string) {
      // transforming date into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      // isShort determines output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
      if (date != undefined && date.length >= 8) {
        let tempDateTimeString =
          date.substring(0, 4) +
          '-' +
          date.substring(4, 6) +
          '-' +
          date.substring(6, 8) +
          'T00:00:00'

        let formattedDate = DateTime.fromISO(tempDateTimeString)
          .setLocale(this.$language.current)
          .toLocaleString(DateTime.DATE_SHORT)

        return upperFirst(formattedDate)
      }
    },
    // functions relating to dicom controls
    prev() {
      console.log('prev clicked')
      // currently not supported, will be implemented later similar to prev & next in preview app, see https://github.com/owncloud/web-app-dicom-viewer/issues/7
    },
    next() {
      console.log('next clicked')
      // currently not supported, will be implemented later similar to prev & next in preview app, see https://github.com/owncloud/web-app-dicom-viewer/issues/7
    },
    setZoom(newZoomFactor) {
      this.currentImageZoom = newZoomFactor
      const camera = this.viewport.getCamera()

      const newCamera = {
        parallelScale: this.viewportCameraParallelScale / this.currentImageZoom,
        position: camera.position,
        focalPoint: camera.focalPoint
      }

      this.viewport.setCamera(newCamera)
      this.viewport.render()
    },
    setRotation(newRotation) {
      this.currentImageRotation = newRotation
      this.viewport.setProperties({ rotation: this.currentImageRotation })
      this.viewport.render()
    },
    setHorizontalFlip() {
      const { flipHorizontal } = this.viewport.getCamera()
      this.viewport.setCamera({ flipHorizontal: !flipHorizontal })
      this.viewport.render()
    },
    setVerticalFlip() {
      const { flipVertical } = this.viewport.getCamera()
      this.viewport.setCamera({ flipVertical: !flipVertical })
      this.viewport.render()
    },
    toggleInversion() {
      const { invert } = this.viewport.getProperties()
      this.viewport.setProperties({ invert: !invert })
      this.viewport.render()
    },
    resetViewport() {
      this.currentImageZoom = 1
      this.currentImageRotation = 0
      this.viewport.resetCamera()
      this.viewport.resetProperties()
      this.viewport.render()
    },
    toggleShowMetadata() {
      this.isShowMetadataActivated = !this.isShowMetadataActivated
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dicom-canvas {
  border: none;
  width: 75vh;
  aspect-ratio: 1/1 auto;
}

.dicom-metadata {
  border: none;
  width: 500px;
  height: auto;
  padding: 20px;
  margin-left: 20px;
}

.dicom-metadata-item {
  display: none;
}

#dicom-viewer-toggle-metadata-sidebar {
  top: 0;
  right: 0;
}

#toggle-metadata-sidebar {
  vertical-align: middle;
  border: 3px solid transparent;
  &:hover {
    background-color: var(--oc-color-background-hover);
    border-radius: 3px;
  }
}

#dicom-viewer-vip-metadata {
  color: rgb(255, 117, 102);
  text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
  z-index: 2;
  margin: 10px;
}

.details-table {
  tr {
    height: 1rem;
  }

  border-bottom: 1px solid var(--oc-color-border);
}
</style>
