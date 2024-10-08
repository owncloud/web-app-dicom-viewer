<template>
  <div class="oc-position-bottom-center preview-controls">
    <div
      class="oc-background-brand oc-p-s oc-width-large oc-flex oc-flex-middle oc-flex-center oc-flex-around preview-controls-action-bar"
    >
      <!-- hide prev / next section while functionality is not yet implemented, set class of the wrapper div to 'oc-width-xlarge' once that section is activated -->
      <!--
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="previousDescription"
          class="preview-controls-previous"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="previousDescription"
          @click="$emit('togglePrevious')"
        >
          <oc-icon size="large" name="arrow-drop-left" variation="inherit" />
        </oc-button>
        <p v-if="!isFolderLoading" class="oc-m-rm preview-controls-action-count">
          <span aria-hidden="true" v-text="ariaHiddenFileCount" />
          <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
        </p>
        <oc-button
          v-oc-tooltip="nextDescription"
          class="preview-controls-next"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="nextDescription"
          @click="$emit('toggleNext')"
        >
          <oc-icon size="large" name="arrow-drop-right" variation="inherit" />
        </oc-button>
      </div>
      -->
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageShrinkDescription"
          class="preview-controls-image-shrink"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageShrinkDescription"
          @click="imageShrink"
        >
          <oc-icon fill-type="line" name="zoom-out" variation="inherit" />
        </oc-button>
        <oc-button
          v-oc-tooltip="imageOriginalSizeDescription"
          class="preview-controls-image-original-size oc-ml-s oc-mr-s"
          :class="isShowMetadataActivated ? 'oc-visible@m' : 'oc-visible@s'"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageOriginalSizeDescription"
          @click="$emit('setZoom', 1)"
        >
          <span v-text="currentZoomDisplayValue" />
        </oc-button>
        <oc-button
          v-oc-tooltip="imageZoomDescription"
          class="preview-controls-image-zoom"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageZoomDescription"
          @click="imageZoom"
        >
          <oc-icon fill-type="line" name="zoom-in" variation="inherit" />
        </oc-button>
      </div>
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageRotateLeftDescription"
          class="preview-controls-rotate-left"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageRotateLeftDescription"
          @click="imageRotateLeft"
        >
          <oc-icon fill-type="line" name="anticlockwise" variation="inherit" />
        </oc-button>
        <oc-button
          v-oc-tooltip="imageRotateRightDescription"
          class="preview-controls-rotate-right"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageRotateRightDescription"
          @click="imageRotateRight"
        >
          <oc-icon fill-type="line" name="clockwise" variation="inherit" />
        </oc-button>
      </div>
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageFlipHorizontalDescription"
          class="preview-controls-flip-horizontal oc-mr-xs"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageFlipHorizontalDescription"
          @click="$emit('setHorizontalFlip')"
        >
          <oc-icon fill-type="line" name="flip-horizontal-2" variation="inherit" />
        </oc-button>
        <oc-button
          v-oc-tooltip="imageFlipVerticalDescription"
          class="preview-controls-flip-vertical"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageFlipVerticalDescription"
          @click="$emit('setVerticalFlip')"
        >
          <oc-icon fill-type="line" name="flip-vertical-2" variation="inherit" />
        </oc-button>
      </div>
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageInvertDescription"
          class="preview-controls-invert"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageInvertDescription"
          @click="$emit('toggleInversion')"
        >
          <oc-icon fill-type="fill" name="contrast" variation="inherit" />
        </oc-button>
      </div>
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageResetDescription"
          class="preview-controls-reset"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageResetDescription"
          @click="$emit('resetViewport')"
        >
          <oc-icon fill-type="line" name="refresh" variation="inherit" />
        </oc-button>
      </div>
      <div class="oc-flex-middle oc-flex oc-mr-m">
        <oc-button
          v-oc-tooltip="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          class="preview-controls-show-metadata"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          @click="$emit('toggleShowMetadata')"
        >
          <oc-icon
            name="side-bar-right"
            :fill-type="isShowMetadataActivated ? 'fill' : 'line'"
            variation="inherit"
          />
        </oc-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Resource } from '@ownclouders/web-client/src'

export default defineComponent({
  name: 'DicomControls',
  props: {
    // files, activeIndex & isFolderLoading are currently not used since prev / next functionality is not yet implemented
    files: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    },
    isFolderLoading: {
      type: Boolean,
      default: false
    },
    currentImageZoom: {
      type: Number,
      default: 1
    },
    currentImageRotation: {
      type: Number,
      default: 0
    },
    isShowMetadataActivated: {
      type: Boolean
    }
  },
  emits: [
    'setZoom',
    'setRotation',
    'setHorizontalFlip',
    'setVerticalFlip',
    'toggleInversion',
    'resetViewport',
    'toggleShowMetadata',
    'toggleNext',
    'togglePrevious'
  ],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    const currentZoomDisplayValue = computed(() => {
      return `${(props.currentImageZoom * 100).toFixed(0)}%`
    })
    const ariaHiddenFileCount = computed(() => {
      return $gettext('%{ displayIndex } of %{ availableMediaFiles }', {
        displayIndex: (props.activeIndex + 1).toString(),
        availableMediaFiles: props.files.length.toString()
      })
    })
    const screenreaderFileCount = computed(() => {
      return $gettext('Media file %{ displayIndex } of %{ availableMediaFiles }', {
        displayIndex: (props.activeIndex + 1).toString(),
        availableMediaFiles: props.files.length.toString()
      })
    })
    const calculateZoom = (zoom, factor) => {
      return Math.round(zoom * factor * 20) / 20
    }
    const imageShrink = () => {
      emit('setZoom', Math.max(0.1, calculateZoom(props.currentImageZoom, 0.8)))
    }
    const imageZoom = () => {
      const maxZoomValue = calculateZoom(9, 1.25)
      emit('setZoom', Math.min(calculateZoom(props.currentImageZoom, 1.25), maxZoomValue))
    }
    const imageRotateLeft = () => {
      emit('setRotation', props.currentImageRotation === -270 ? 0 : props.currentImageRotation - 90)
    }
    const imageRotateRight = () => {
      emit('setRotation', props.currentImageRotation === 270 ? 0 : props.currentImageRotation + 90)
    }
    const imageShowMetadata = () => {
      emit('toggleShowMetadata')
    }

    return {
      currentZoomDisplayValue,
      screenreaderFileCount,
      ariaHiddenFileCount,
      imageShrinkDescription: $gettext('Shrink the image'),
      imageZoomDescription: $gettext('Enlarge the image'),
      imageOriginalSizeDescription: $gettext('Show the image at its normal size'),
      imageRotateLeftDescription: $gettext('Rotate the image 90 degrees to the left'),
      imageRotateRightDescription: $gettext('Rotate the image 90 degrees to the right'),
      previousDescription: $gettext('Show previous DICOM file in folder'),
      nextDescription: $gettext('Show next DICOM file in folder'),
      imageFlipHorizontalDescription: $gettext('Flip the image horizontally'),
      imageFlipVerticalDescription: $gettext('Flip the image vertically'),
      imageInvertDescription: $gettext('Invert the colours of the image'),
      imageResetDescription: $gettext('Reset all image manipulations'),
      imageShowMetadataDescription: $gettext('Show DICOM metadata'),
      imageHideMetadataDescription: $gettext('Hide DICOM metadata'),
      imageShrink,
      imageZoom,
      imageRotateLeft,
      imageRotateRight,
      imageShowMetadata
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-details {
  margin-bottom: 22px;
}

.preview-controls {
  z-index: 1000;
  margin: 10px auto;
}

.preview-controls-action-count {
  color: var(--oc-color-swatch-brand-contrast);
}

.preview-controls-image-original-size {
  width: 42px;
}

// remove this once the prev and next buttons are shown
.preview-controls-image-shrink .oc-icon {
  padding: 5px 0px;
}
</style>
