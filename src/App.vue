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
      :patientInformation="vipInformation3"
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
import uids from './helper/uids'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

// declaring some const & references
const { ViewportType, Events } = Enums
const shortDateTimeFormat = true
const longDateTimeFormat = false

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
      vipInformation2: [
        { label: 'Patient Name', value: 'Max' },
        { label: 'Institution', value: 'TMU' },
      ],
      vipInformation3: [],
      patientInformation: [
        { label: 'patientName', value: 'x' },
        { label: 'patientID', value: '123' },
        { label: 'patientBirthdate', value: '01011900' },
        { label: 'patientSex', value: 'M' },
        { label: 'patientWeight', value: '90' }
      ],
      studyInformation: {
        studyDescription: '',
        protocolName: '',
        accessionNumber: '',
        studyID: '',
        studyDate: '',
        studyTime: ''
      },
      seriesInformation: {
        seriesDescription: '',
        seriesNumber: '',
        modality: '',
        bodyPart: '',
        seriesDate: '',
        seriesTime: ''
      },
      instanceInformation: {
        instanceNumber: '',
        acquisitionNumber: '',
        acquisitionDate: '',
        acquisitionTime: '',
        instanceCreationDate: '',
        instanceCreationTime: '',
        contentDate: '',
        contentTime: ''
      },
      imageInformation: {
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
      equipmentInformation: {
        manufacturer: '',
        model: '',
        stationName: '',
        AE_Title: '',
        institutionName: '',
        softwareVersion: '',
        implementationVersionName: ''
      },
      scanningInformation: {
        scanningSequence: '',
        sequenceVariant: '',
        scanOptions: '',
        sliceThickness: '',
        repetitionTime: '',
        echoTime: '',
        inversionTime: '',
        imagingFrequency: '',
        imagedNucleus: '',
        echoNumbers: '',
        magneticFieldStrength: '',
        spacingBetweenSlices: '',
        numberOfPhaseEncodingSteps: '',
        echoTrainLength: ''
      },
      uidsInformation: {
        studyUID: '',
        seriesUID: '',
        instanceUID: '',
        SOP_ClassUID: '',
        transferSyntaxUID: '',
        frameOfReferenceUID: ''
      },
      otherInformation: {
        specificCharacterSet: '',
        referringPhysicianName: '',
        MR_AcquisitionType: '',
        numberOfAverages: '',
        percentSampling: '',
        percentPhaseFieldOfView: '',
        lowRR_Value: '',
        highRR_Value: '',
        intervalsAcquired: '',
        intervalsRejected: '',
        heartRate: '',
        receiveCoilName: '',
        transmitCoilName: '',
        inPlanePhaseEncodingDirection: '',
        flipAngle: '',
        positionReferenceIndicator: '',
        windowCenter: '',
        windowWidth: ''
      },
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
        // more settings, TODO: check what other settings are needed/useful
        // orientation: Enums.OrientationAxis.AXIAL,
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
    addObject(newLabel: string, newValue: string) {
      this.vipInformation2.push({ label: newLabel, value: newValue })
    },
    addMetadataItem(informationObject, newLabel: string, newValue: string) {
      var object = Object.keys(informationCategory)
      informationObject.push({ label: newLabel, value: newValue })
    },
    async fetchVipMetadataInformation(imageId) {
      console.log('fetch vip meta data information for: ' + imageId)

      const { fetchDicomImageData, extractDicomMetadata } = extractMetadata()

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

      // using some function from extract metadata helper
      // for testing

      let testTags = ['patientName', 'patientID', 'patientBirthdate', 'patientSex', 'patientWeight' ]

      let vipInformation = extractDicomMetadata(imageId, testTags)
      vipInformation.then((result) => {
        console.log('logging result extract: ' + result)
        if (result != undefined) {
          for (let i=0; i<result.length; i++ ) {
            console.log('(' + i.toString() + ') ' + result[i][0] + ' / ' + result[i][1])
            this.vipInformation3.push({ label: result[i][0], value: result[i][1] })
          }
        }
      })

      console.log('vip information 3: ' + this.vipInformation3)

      /*
      let temp
      for (let tag in this.vipInformation ) {
        console.log('- ' + tag)
      }
      //console.log('patient name: ' + this.vipInformation.patientName)

      //this.vipInformation = vipInformationTest
      console.log('new patient name: ' +  this.vipInformation.patientName)

      // try to pass values over
      //this.vipInformation = vipInformation

      // todo:
      // - store values into object
      // - move the stuff above into helper class function (extractDicomMetadata)
      // - check where to do nice formatting of date & time values

      //getPatientData(dicomImage, "patientName")
      */
    },
    async fetchMetadataInformation(imageId) {
      console.log('fetch meta data information for: ' + imageId)
      const { fetchDicomImageData } = extractMetadata()

      if (!this.isVipMetadataFetched) {
        await this.fetchVipMetadataInformation(imageId)
        // making sure that all values that should have been populated by this function have been fetched,
        // alternatively this check could be made when assigning the values
      }

      if (!this.isDicomImageDataFetched) {
        this.dicomImageData = await fetchDicomImageData(imageId)
        this.isDicomImageDataFetched = true
      }

      //patientInformation
      this.patientInformation.patientName = this.vipInformation.patientName
      this.patientInformation.patientID = this.dicomImageData.string('x00100020')
      this.patientInformation.patientBirthdate = this.formatDate(
        this.vipInformation.patientBirthdate,
        longDateTimeFormat
      )
      this.patientInformation.patientSex = this.dicomImageData.string('x00100040')
      this.patientInformation.patientWeight = this.dicomImageData.string('x00101030')

      //studyInformation
      this.studyInformation.studyDescription = this.dicomImageData.string('x00081030')
      this.studyInformation.protocolName = this.dicomImageData.string('x00181030')
      this.studyInformation.accessionNumber = this.dicomImageData.string('x00080050')
      this.studyInformation.studyID = this.dicomImageData.string('x00200010')
      this.studyInformation.studyDate = this.formatDate(this.dicomImageData.string('x00080020'), longDateTimeFormat)
      this.studyInformation.studyTime = this.formatTime(this.dicomImageData.string('x00080030'), longDateTimeFormat)

      // seriesInformation
      this.seriesInformation.seriesDescription = this.dicomImageData.string('x0008103e')
      this.seriesInformation.seriesNumber = this.dicomImageData.string('x00200011')
      this.seriesInformation.modality = this.dicomImageData.string('x00080060')
      this.seriesInformation.bodyPart = this.dicomImageData.string('x00180015')  //Body Part Examined? or Body Part Thickness?
      this.seriesInformation.seriesDate = this.formatDate(this.dicomImageData.string('x00080021'), longDateTimeFormat)
      this.seriesInformation.seriesTime = this.formatTime(this.dicomImageData.string('x00080031'), longDateTimeFormat)

      // instanceInformation
      this.instanceInformation.instanceNumber = this.dicomImageData.string('x00200013')
      this.instanceInformation.acquisitionNumber = this.dicomImageData.string('x00200012')
      this.instanceInformation.acquisitionDate = this.formatDate(
        this.dicomImageData.string('x00080022'),
        longDateTimeFormat
      )
      this.instanceInformation.acquisitionTime = this.formatTime(
        this.dicomImageData.string('x0008002A'),
        longDateTimeFormat
      )
      this.instanceInformation.instanceCreationDate = this.formatDate(
        this.dicomImageData.string('x00080012'),
        longDateTimeFormat
      )
      this.instanceInformation.instanceCreationTime = this.formatTime(
        this.dicomImageData.string('x00080013'),
        longDateTimeFormat
      )
      this.instanceInformation.contentDate = this.formatDate(
        this.dicomImageData.string('x00080023'),
        longDateTimeFormat
      )
      this.instanceInformation.contentTime = this.formatTime(
        this.dicomImageData.string('x00080033'),
        longDateTimeFormat
      )

      // imageInformation
      this.imageInformation.photometricInterpretation = this.dicomImageData.string('x00280004')
      this.imageInformation.imageType = this.dicomImageData.string('x00080008')
      this.imageInformation.rescaleSlope = this.dicomImageData.string('x00281053')
      this.imageInformation.rescaleIntercept = this.dicomImageData.string('x00281052')
      this.imageInformation.imagePositionPatient = this.dicomImageData.string('x00200032')
      this.imageInformation.imageOrientationPatient = this.dicomImageData.string('x00280030')
      this.imageInformation.patientPosition = this.dicomImageData.string('x00204000')
      this.imageInformation.pixelSpacing = this.dicomImageData.string('x00200037')
      this.imageInformation.imageComments = this.dicomImageData.string('x00185100')

      // equipmentInformation
      this.equipmentInformation.manufacturer = this.dicomImageData.string('x00080070')
      this.equipmentInformation.model = this.dicomImageData.string('x00081090') // Manufacturer's Model Name
      this.equipmentInformation.stationName = this.dicomImageData.string('x00081010')
      this.equipmentInformation.AE_Title = this.dicomImageData.string('x') // Retrieve AE Title? or Station AE Title? // TODO: get value!!!
      this.equipmentInformation.institutionName = this.dicomImageData.string('x00080080') // this.vipInformation.institutionName
      this.equipmentInformation.softwareVersion = this.dicomImageData.string('x00181020')
      this.equipmentInformation.implementationVersionName = this.dicomImageData.string('x00020013')

      // scanningInformation
      this.scanningInformation.scanningSequence = this.dicomImageData.string('x00180020')
      this.scanningInformation.sequenceVariant = this.dicomImageData.string('x00180021')
      this.scanningInformation.scanOptions = this.dicomImageData.string('x00180022')
      this.scanningInformation.sliceThickness = this.dicomImageData.string('x00180050')
      this.scanningInformation.repetitionTime = this.dicomImageData.string('x00180080')
      this.scanningInformation.echoTime = this.dicomImageData.string('x00180081')
      this.scanningInformation.inversionTime = this.dicomImageData.string('x00180082')
      this.scanningInformation.imagingFrequency = this.dicomImageData.string('x00180084')
      this.scanningInformation.imagedNucleus = this.dicomImageData.string('x00180085')
      this.scanningInformation.echoNumbers = this.dicomImageData.string('x00180086')
      this.scanningInformation.magneticFieldStrength = this.dicomImageData.string('x00180087')
      this.scanningInformation.spacingBetweenSlices = this.dicomImageData.string('x00180088')
      this.scanningInformation.numberOfPhaseEncodingSteps = this.dicomImageData.string('x00180089')
      this.scanningInformation.echoTrainLength = this.dicomImageData.string('x00180091')

      // uidsInformation
      this.uidsInformation.studyUID = this.dicomImageData.string('x0020000d') // Study Instance UID?
      this.uidsInformation.seriesUID = this.dicomImageData.string('x0020000e') // Series Instance UID?
      this.uidsInformation.instanceUID = this.dicomImageData.string('x00080018') // SOP Instance UID?
      let SOP_ClassUID = this.dicomImageData.string('x00080016')
      this.uidsInformation.SOP_ClassUID = SOP_ClassUID + ' [' + uids[SOP_ClassUID] + ']' // adding description of the SOP module
      this.uidsInformation.transferSyntaxUID = this.dicomImageData.string('x00020010')
      this.uidsInformation.frameOfReferenceUID = this.dicomImageData.string('x00200052')

      // otherInformation
      this.otherInformation.specificCharacterSet = this.dicomImageData.string('x00080005')
      this.otherInformation.referringPhysicianName = this.dicomImageData.string('x00080090')
      this.otherInformation.MR_AcquisitionType = this.dicomImageData.string('x00180023')
      this.otherInformation.numberOfAverages = this.dicomImageData.string('x00180083')
      this.otherInformation.percentSampling = this.dicomImageData.string('x00180093')
      this.otherInformation.percentPhaseFieldOfView = this.dicomImageData.string('x00180094')
      this.otherInformation.lowRR_Value = this.dicomImageData.string('x00181081')
      this.otherInformation.highRR_Value = this.dicomImageData.string('x00181082')
      this.otherInformation.intervalsAcquired = this.dicomImageData.string('x00181083')
      this.otherInformation.intervalsRejected = this.dicomImageData.string('x00181084')
      this.otherInformation.heartRate = this.dicomImageData.string('x00181088')
      this.otherInformation.receiveCoilName = this.dicomImageData.string('x00181250')
      this.otherInformation.transmitCoilName = this.dicomImageData.string('x00181251')
      this.otherInformation.inPlanePhaseEncodingDirection = this.dicomImageData.string('x00181312')
      this.otherInformation.flipAngle = this.dicomImageData.string('x00181314')
      this.otherInformation.positionReferenceIndicator = this.dicomImageData.string('x00201040')
      this.otherInformation.windowCenter = this.dicomImageData.string('x00281050')
      this.otherInformation.windowWidth = this.dicomImageData.string('x00281051')

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
        this.imageInformation.rowsX_Columns =
          imageData.dimensions[0] + ' x ' + imageData.dimensions[1]
        this.imageInformation.bitsAllocated = bitsAllocated
        this.imageInformation.bitsStored = bitsStored
        this.imageInformation.highBit = highBit
        this.imageInformation.pixelRepresentation = pixelRepresentation
        this.imageInformation.samplesPerPixel = samplesPerPixel

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
      // isShort determins output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
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
    formatTime(time: string, isSimple: boolean) {
      // transform time string retrieved from dicom metadata into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      // description of input format see https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html, VR Name 'TM'
      // isSimple determines output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
      if (time != undefined && time.length >= 4) {
        let tempDateTimeString =
          '1970-01-01T' +
          time.substring(0, 2) +
          ':' +
          time.substring(2, 4) +
          ':' +
          (time.length >= 6 ? time.substring(4, 6) : '00')

        let formattedTime = DateTime.fromISO(tempDateTimeString).setLocale(this.$language.current).toLocaleString(isSimple ? DateTime.TIME_SIMPLE : DateTime.TIME_24_WITH_SECONDS)

        return upperFirst(formattedTime)
      }
    },
    formatLabel(label: string) {
      // formatting camelcase labels into easily readable labels by adding a gap before each upper case letter
      // there is no space added if there are multiple upper case letters in a row (e.g. ID)
      // in cases where such an abbreviation is followed by another word and underline should be added in the variable name, e.g. "SOP_InstanceUID" becomes "SOP Instance UID"

      const result = label.replace(/([A-Z]+)/g, ' $1').replace('_', '')

      // optionally make first letter of each word lower?
      // return upperFirst(result.toLowerCase())

      return upperFirst(result)
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
