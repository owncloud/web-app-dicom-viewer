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
          :patientName ="vipInformation.patientName"
          :patientBirthdate ="formatDate(vipInformation.patientBirthdate, true)"
          :institutionName ="vipInformation.institutionName"
          :instanceCreationDateTime ="formatDateAndTime(vipInformation.instanceCreationDate, vipInformation.instanceCreationTime)"
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
          variation="brand"
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
      :patientInformation="patientInformation"
      :studyInformation="studyInformation"
      :seriesInformation="seriesInformation"
      :instanceInformation="instanceInformation"
      :imageInformation="imageInformation"
      :equipmentInformation="equipmentInformation"
      :scanningInformation="scanningInformation"
      :uidsInformation="uidsInformation"
      :otherInformation="otherInformation"
      :is-metadata-extracted="isMetadataExtracted"
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
import type { PropType } from 'vue'
import { useGettext } from 'vue3-gettext'

// other imports
import { Resource } from '@ownclouders/web-client/src'
import DicomControls from './components/DicomControls.vue'
import VipMetadataOverlay from './components/VipMetadataOverlay.vue'
import MetadataSidebar from './components/MetadataSidebar.vue'
import { extractMetadata } from './helper/extractMetadata'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

// declaring some const & references
const { ViewportType, Events } = Enums
const shortDateTimeFormat = true // check if this is still used
const longDateTimeFormat = false // check if this is still used

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

var config = {
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
// "loadImage" is used for stack, "createAndCacheVolume" for volumes (not needed at this point, maybe later...)
// see also https://www.cornerstonejs.org/docs/tutorials/basic-volume
cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

export default defineComponent({
  //name: 'DicomViewer', // seems like this is not needed anymore for streamlined apps
  components: {
    DicomControls,
    MetadataSidebar,
    VipMetadataOverlay
  },
  props: {
    url: {
      type: String,
      required: true
    },
    resource: {
      type: Object as PropType<Resource>,
      default: null
    },
    patientInformation: {
      type: Array
    },
    studyInformation: {
      type: Array
    },
    seriesInformation: {
      type: Array
    },
    instanceInformation: {
      type: Array
    },
    imageInformation: {
      type: Array
    },
    equipmentInformation: {
      type: Array
    },
    scanningInformation: {
      type: Array
    },
    uidsInformation: {
      type: Array
    },
    otherInformation: {
      type: Array
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
      isDicomFileRendered: false, // check if this is needed
      isMetadataExtracted: false,
      element: null,
      renderingEngine: null,
      viewport: null,
      viewportCameraParallelScale: 1,
      dicomUrl: null,
      currentImageZoom: 1,
      currentImageRotation: 0,
      isVipMetadataFetched: false,
      isMetadataFetched: false,
      isShowMetadataActivated: false,
      dicomFiles: [this.resource],
      vipInformation: [
        { patientName: '' },
        { patientBirthdate: '' },
        { institutionName: '' },
        { instanceCreationDate: '' },
        { instanceCreationTime: '' }
        ],
      patientInformation: [],
      studyInformation: [],
      seriesInformation: [],
      instanceInformation: [],
      imageInformation: [],
      imageInformationOld: {
        rowsX_Columns: '',
        photometricInterpretation: '',
        imageType: '',
        bitsAllocated: '',
        bitsStored: '',
        highBit: '',
        pixelRepresentation: '',
        rescaleSlope: '',
        rescaleIntercept: '',
        imagePositionPatient: '',
        imageOrientationPatient: '',
        patientPosition: '',
        pixelSpacing: '',
        samplesPerPixel: '',
        imageComments: ''
      },
      equipmentInformation: [],
      scanningInformation: [],
      uidsInformation: [],
      otherInformation: [],
    }
  },

  // --------------------------
  // vue js lifecylce functions
  // --------------------------

  // "created" runs before DOM is rendered, data and events are already accessible
  async created() {
    console.log('lifecycle @ created')

    // get resource, ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      this.dicomUrl = await this.addWadouriPrefix(this.url)
    }

    // get vip metadata
    await this.fetchVipMetadataInformation(await this.addWadouriPrefix(this.url))

    // prefetch all other metadata (in separate function for performance reasons)
    await this.fetchMetadataInformation(await this.addWadouriPrefix(this.url))
  },
  // "beforeMount" is called right before the component is to be mounted
  beforeMount() {
    console.log('lifecycle @ beforeMount')
  },
  // "mounted" is called when component has been added to DOM
  async mounted() {
    console.log('lifecycle @ mounted')
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

    // get stack viewport that was created
    this.viewport = <Types.IStackViewport>this.renderingEngine.getViewport(viewportId)

    // add resource to stack
    // ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      let dicomResourceUrl = await this.addWadouriPrefix(this.url)

      // define a stack containing a single image
      const dicomStack = [dicomResourceUrl]

      // set stack on the viewport (currently only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image (updates every viewport in the rendering engine)
      this.viewport.render()
      this.isDicomFileRendered = true
      this.setViewportCameraParallelScaleFactor()

      // setting metadata
      this.extractMetadataFromViewport(dicomResourceUrl)
    } else {
      console.log('no valid dicom resource url: ' + this.url)
    }
  },
  // "beforeUpdate" is implementing any change in the component
  beforeUpdate() {
    console.log('lifecycle @ beforeUpdate')
  },
  // updated gets called anytime some change is made in the component
  updated() {
    console.log('lifecycle @ updated')
    // this.viewport.resize()
    // also check if it is needed to recalculate scale factor
    // this.setViewportCameraParallelScaleFactor()
  },
  // cleaning up component, leaving no variables or events that could cause memory leaks to app
  beforeUnmount() {
    console.log('lifecycle @ beforeUnmount')
    this.renderingEngine.destroy()
    this.isDicomFileRendered = false
    this.isMetadataExtracted = false
    this.isVipMetadataFetched = false
    this.isMetadataFetched = false
    this.isDicomImageDataFetched = false
  },
  unmounted() {
    console.log('lifecycle @ unmounted')
  },
  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone core', e)
      }
    },
    async addWadouriPrefix(url: string) {
      return 'wadouri:' + url
    },
    async fetchVipMetadataInformation(imageId) {
      console.log('fetch vip meta data information for: ' + imageId)

      const { fetchDicomImageData, extractDicomMetadata } = extractMetadata()

      // fetching dicom image data
      if (!this.isDicomImageDataFetched) {
        this.dicomImageData = await fetchDicomImageData(imageId)
        if (!this.isDicomImageDataFetched) {
          if (this.dicomImageData != null){
            this.isDicomImageDataFetched = true
          }
        }
      }

      this.vipInformation.patientName = this.dicomImageData.string('x00100010')
      this.vipInformation.patientBirthdate = this.dicomImageData.string('x00100030')
      this.vipInformation.institutionName = this.dicomImageData.string('x00080080')
      this.vipInformation.instanceCreationDate = this.dicomImageData.string('x00080012')
      this.vipInformation.instanceCreationTime = this.dicomImageData.string('x00080013')

      this.isVipMetadataFetched = true
    },
    async fetchMetadataInformation(imageId) {
      console.log('fetch meta data information for: ' + imageId)

      const { fetchDicomImageData, extractDicomMetadata, extractDicomMetadata2 } = extractMetadata()

      // this might no longer be needed
      if (!this.isDicomImageDataFetched) {
        this.dicomImageData = await fetchDicomImageData(imageId)
        this.isDicomImageDataFetched = true
      }

      // patientInformation
      const patientInformationTags = ['patientName', 'patientID', 'patientBirthdate_formatDate', 'patientSex', 'patientWeight' ]
      const patientInformation = extractDicomMetadata(imageId, patientInformationTags, this.$language.current)
      //const patientInformation = extractDicomMetadata2(this.dicomImageData, patientInformationTags, this.$language.current)
      patientInformation.then((result) => {
        this.patientInformation = result
      })

      // studyInformation
      const studyInformationTags = ['studyDescription', 'protocolName', 'accessionNumber', 'studyID', 'studyDate_formatDate', 'studyTime_formatTime' ]
      const studyInformation = extractDicomMetadata(imageId, studyInformationTags, this.$language.current)
      studyInformation.then((result) => {
        this.studyInformation = result
      })

      // seriesInformation
      const seriesInformationTags = ['seriesDescription', 'seriesNumber', 'modality', 'bodyPart', 'seriesDate_formatDate', 'seriesTime_formatTime' ]
      const seriesInformation = extractDicomMetadata(imageId, seriesInformationTags, this.$language.current)
      seriesInformation.then((result) => {
        this.seriesInformation = result
      })

      // instanceInformation
      const instanceInformationTags = ['instanceNumber', 'acquisitionNumber', 'acquisitionDate_formatDate', 'acquisitionTime_formatTime', 'instanceCreationDate_formatDate', 'instanceCreationTime_formatTime', 'contentDate_formatDate', 'contentTime_formatTime' ]
      const instanceInformation = extractDicomMetadata(imageId, instanceInformationTags, this.$language.current)
      instanceInformation.then((result) => {
        this.instanceInformation = result
      })

      // imageInformation
      const imageInformationTags = ['rows', 'columns', 'photometricInterpretation', 'imageType', 'bitsAllocated', 'bitsStored', 'highBit', 'pixelRepresentation', 'rescaleSlope', 'rescaleIntercept', 'imagePositionPatient', 'imageOrientationPatient', 'patientPosition', 'pixelSpacing', 'samplesPerPixel', 'imageComments' ]
      const imageInformation = extractDicomMetadata(imageId, imageInformationTags, this.$language.current)
      imageInformation.then((result) => {
        this.imageInformation = result
      })

      // todo:
      // the following tags currently do not return a valid value...
      // they were previously extracted directly from viewport
      // not sure if order matters
      // 1. rowsX_Columns (rows, columns)
      // 4. bitsAllocated
      // 5. bitsStored
      // 6. highBit
      // 7. pixelRepresentation
      // 14. samplesPerPixel
      // seems to be related to the fact that these tags are of value US (Unsigned Short), see https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_6.2.html

      // equipmentInformation
      const equipmentInformationTags = ['manufacturer', 'model', 'stationName', 'AE_Title', 'institutionName', 'softwareVersion', 'implementationVersionName' ]
      const equipmentInformation = extractDicomMetadata(imageId, equipmentInformationTags, this.$language.current)
      equipmentInformation.then((result) => {
        this.equipmentInformation = result
      })

      // scanningInformation
      const scanningInformationTags = ['scanningSequence', 'sequenceVariant', 'scanOptions', 'sliceThickness', 'repetitionTime', 'echoTime', 'inversionTime', 'imagingFrequency', 'imagedNucleus', 'echoNumbers', 'magneticFieldStrength', 'spacingBetweenSlices', 'numberOfPhaseEncodingSteps', 'echoTrainLength' ]
      const scanningInformation = extractDicomMetadata(imageId, scanningInformationTags, this.$language.current)
      scanningInformation.then((result) => {
        this.scanningInformation = result
      })

      // uidsInformation
      const uidsInformationTags = ['studyUID', 'seriesUID', 'instanceUID', 'SOP_ClassUID_addSOPuids', 'transferSyntaxUID', 'frameOfReferenceUID' ]
      const uidsInformation = extractDicomMetadata(imageId, uidsInformationTags, this.$language.current)
      uidsInformation.then((result) => {
        this.uidsInformation = result
      })

      // otherInformation
      const otherInformationTags = ['specificCharacterSet', 'referringPhysicianName', 'MR_AcquisitionType', 'numberOfAverages', 'percentSampling', 'percentPhaseFieldOfView', 'lowRR_Value', 'highRR_Value', 'intervalsAcquired', 'intervalsRejected', 'heartRate', 'receiveCoilName', 'transmitCoilName', 'inPlanePhaseEncodingDirection', 'flipAngle', 'positionReferenceIndicator', 'windowCenter', 'windowWidth']
      const otherInformation = extractDicomMetadata(imageId, otherInformationTags, this.$language.current)
      otherInformation.then((result) => {
        this.otherInformation = result
      })

      this.isMetadataFetched = true
      // TODO: check that data only gets displayed after all metadata has been fetched
    },
    extractMetadataFromViewport(imageId: string) {
      // get metadata from viewport
      const imageData = this.viewport.getImageData() // returns IImageData object, see https://www.cornerstonejs.org/api/core/namespace/Types#IImageData

      if (imageId != (null || undefined) && typeof imageId == 'string') {
        console.log('extracting metadata from viewport for image id: ' + imageId)
        const { pixelRepresentation, bitsAllocated, bitsStored, highBit, samplesPerPixel } =
          metaData.get('imagePixelModule', imageId)

        // adding values to corresponding variable
        this.imageInformationOld.rowsX_Columns =
          imageData.dimensions[0] + ' x ' + imageData.dimensions[1]
        this.imageInformationOld.bitsAllocated = bitsAllocated
        this.imageInformationOld.bitsStored = bitsStored
        this.imageInformationOld.highBit = highBit
        this.imageInformationOld.pixelRepresentation = pixelRepresentation
        this.imageInformationOld.samplesPerPixel = samplesPerPixel

        this.isMetadataExtracted = true
      } else {
        console.log('no image meta data available available for extraction from viewport')
      }
    },
    setViewportCameraParallelScaleFactor() {
      const camera = this.viewport.getCamera()
      this.viewportCameraParallelScale = camera.parallelScale
    },
    // functions for styling data
    formatDateAndTime(date: string, time: string) {
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

        let formattedDate = DateTime.fromISO(tempDateTimeString).setLocale(this.$language.current).toLocaleString(DateTime.DATETIME_MED)

        return upperFirst(formattedDate)
      }
    },
    formatDate(date: string, isShort: boolean) {
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

        let formattedDate = DateTime.fromISO(tempDateTimeString).setLocale(this.$language.current).toLocaleString(isShort ? DateTime.DATE_SHORT : DateTime.DATE_MED)

        return upperFirst(formattedDate)
      }
    },
    // functions relating to dicom controls
    prev() {
      console.log('prev clicked')
      // TODO: still needs to be implemented, similar to prev & next in preview app, see https://github.com/owncloud/web-app-dicom-viewer/issues/7
    },
    next() {
      console.log('next clicked')
      // TODO: still needs to be implemented, similar to prev & next in preview app, see https://github.com/owncloud/web-app-dicom-viewer/issues/7
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
      const { rotation } = this.viewport.getProperties()
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
  //height: 100%; //calc(100% - 52px);
}

.dicom-canvas {
  border: none;
  width: 75vh;
  aspect-ratio: 1/1 auto;
}

.dicom-metadata {
  border: none;
  width: 500px;
  height: auto; //100%;
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

.dicom-metadata-section-title {
  margin-bottom: 0px;
  padding-top: 16px !important;
  border-top: 1px solid var(--oc-color-border);
}

.details-table {
  tr {
    height: 1rem;
  }

  border-bottom: 1px solid var(--oc-color-border);
}

</style>
