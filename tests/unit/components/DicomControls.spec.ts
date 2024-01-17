import { Resource } from '@ownclouders/web-client/src' 
import { shallowMount } from '@vue/test-utils' 
import { mock } from 'vitest-mock-extended' 
import { defaultPlugins } from '../../../src/helper/defaultPlugins.js'

import DicomControls from '../../../src/components/DicomControls.vue'

const selectors = {
  controlsPrevious: '.preview-controls-previous',
  controlsNext: '.preview-controls-next',
  controlsImageShrink: '.preview-controls-image-shrink',
  controlsImageOriginalSize: '.preview-controls-image-original-size',
  controlsImageZoom: '.preview-controls-image-zoom',
  controlsRotateLeft: '.preview-controls-rotate-left',
  controlsRotateRight: '.preview-controls-rotate-right',
  controlsFlipHorizontal: '.preview-controls-flip-horizontal',
  controlsFlipVertical: '.preview-controls-flip-vertical',
  controlsInvert: '.preview-controls-invert',
  controlsReset: '.preview-controls-reset',
  controlsShowMetadata: '.preview-controls-show-metadata',
}

const descriptions = {
  imageShrinkDescription: 'Shrink the image',
  imageZoomDescription: 'Enlarge the image',
  imageOriginalSizeDescription: 'Show the image at its normal size',
  imageRotateLeftDescription: 'Rotate the image 90 degrees to the left',
  imageRotateRightDescription: 'Rotate the image 90 degrees to the right',
  previousDescription: 'Show previous DICOM file in folder',
  nextDescription: 'Show next DICOM file in folder',
  imageFlipHorizontalDescription: 'Flip the image horizontally',
  imageFlipVerticalDescription: 'Flip the image vertically',
  imageInvertDescription: 'Invert the colours of the image',
  imageResetDescription: 'Reset all image manipulations',
  imageShowMetadataDescription: 'Show DICOM metadata',
  imageHideMetadataDescription: 'Hide DICOM metadata'
}

const visibleOnlyOnScreensBiggerThan639px = 'oc-visible@s' 
const visibleOnlyOnScreensBiggerThan959px = 'oc-visible@m'

const defaultScreenSize = window.innerWidth
const smallScreen = 600  // smaller than 640px 
const mediumScreen = 800 // wider than 600px, smaller than 960px
const wideScreen = 1200  // wider than 960px

// test cases
describe('DicomControls component', () => {
  afterEach(() => resizeWindowSize(defaultScreenSize))
  describe('mount component', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
    })
    it('should have the css class "preview-controls"', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.get('.preview-controls')).toBeTruthy()
    })
  })
  // file navigation buttons are currently disabled, therefore this section is skipped
  describe.skip('file navigation', () => {
    describe('previous button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsPrevious).exists()).toBeTruthy()
      })
      it('should emit "togglePrevious"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsPrevious).trigger('click')
        expect(wrapper.emitted('togglePrevious').length).toBe(1)
      })
      it('should display previous description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsPrevious).attributes('aria-label')).toBe(descriptions.previousDescription)
      })
    })
    describe('next button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsNext).exists()).toBeTruthy()
      })
      it('should emit "toggleNext"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsNext).trigger('click')
        expect(wrapper.emitted('toggleNext').length).toBe(1)
      })
      it('should display next description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsNext).attributes('aria-label')).toBe(descriptions.nextDescription)
      })
    })
  })
  describe('size manipulation', () => {
    describe('shrink button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageShrink).exists()).toBeTruthy()
      })
      it('should emit "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsImageShrink).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBe(1)
      })
      it('should display shrink description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageShrink).attributes('aria-label')).toBe(descriptions.imageShrinkDescription)
      })
    })
    describe('original size button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageOriginalSize).exists()).toBeTruthy()
      })
      it('should be visible if screen size is not small screen', () => {
        const { wrapper } = getWrapper()
        resizeWindowSize(wideScreen)
        expect(wrapper.find(selectors.controlsImageOriginalSize).exists()).toBeTruthy()
        expect(wrapper.find(selectors.controlsImageOriginalSize).isVisible()).toBeTruthy()
      })
      it('should be hidden if screen size is small screen', () => {
        // element should exist but not be visible (css class .oc-visible\@s with "display: none !important;" should be applied)
        // testing for visibility seems to be an issue of https://github.com/vuejs/vue-test-utils/issues/2073, see also https://v1.test-utils.vuejs.org/api/wrapper/#isvisible
        const { wrapper } = getWrapper()
        resizeWindowSize(smallScreen)
        expect(wrapper.find(selectors.controlsImageOriginalSize).attributes('class')).toContain(visibleOnlyOnScreensBiggerThan639px)
      })
      it('should be hidden if screen size is medium screen and "isShowMetadataActivated" is true', () => {
        // element should exist but not be visible (css class .oc-visible\@s with "display: none !important;" should be applied)
        const { wrapper } = getWrapper({ isShowMetadataActivated: true })
        resizeWindowSize(mediumScreen)
        expect(wrapper.find(selectors.controlsImageOriginalSize).attributes('class')).toContain(visibleOnlyOnScreensBiggerThan959px)
      })
      it('should emit "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsImageOriginalSize).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBe(1)
      })
      it('should display original size description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageOriginalSize).attributes('aria-label')).toBe(descriptions.imageOriginalSizeDescription)
      })
    })
    describe('zoom button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageZoom).exists()).toBeTruthy()
      })
      it('should emit "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsImageZoom).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBe(1)
      })
      it('should display zoom description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageZoom).attributes('aria-label')).toBe(descriptions.imageZoomDescription)
      })
    })
  })
  describe('rotation manipulation', () => {
    describe('rotate left button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsRotateLeft).exists()).toBeTruthy()
      })
      it('should emit "setRotation"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsRotateLeft).trigger('click')
        expect(wrapper.emitted('setRotation').length).toBe(1)
      })
      it('should display rotate left description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsRotateLeft).attributes('aria-label')).toBe(descriptions.imageRotateLeftDescription)
      })
    })
    describe('rotate right button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsRotateRight).exists()).toBeTruthy()
      })
      it('should emit "setRotation"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsRotateRight).trigger('click')
        expect(wrapper.emitted('setRotation').length).toBe(1)
      })
      it('should display rotate right description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsRotateRight).attributes('aria-label')).toBe(descriptions.imageRotateRightDescription)
      })
    })
  })
  describe('flip manipulation', () => {
    describe('flip horizontal button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsFlipHorizontal).exists()).toBeTruthy()
      })
      it('should emit "setHorizontalFlip"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsFlipHorizontal).trigger('click')
        expect(wrapper.emitted('setHorizontalFlip').length).toBe(1)
      })
      it('should display horizontal flip description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsFlipHorizontal).attributes('aria-label')).toBe(descriptions.imageFlipHorizontalDescription)
      })
    })
    describe('flip vertical button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsFlipVertical).exists()).toBeTruthy()
      })
      it('should emit "setVerticalFlip"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsFlipVertical).trigger('click')
        expect(wrapper.emitted('setVerticalFlip').length).toBe(1)
      })
      it('should display vertical flip description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsFlipVertical).attributes('aria-label')).toBe(descriptions.imageFlipVerticalDescription)
      })
    })
  })
  describe('other manipulations', () => {
    describe('invert button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsInvert).exists()).toBeTruthy()
      })
      it('should emit "toggleInversion"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsInvert).trigger('click')
        expect(wrapper.emitted('toggleInversion').length).toBe(1)
      })
      it('should display invert description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsInvert).attributes('aria-label')).toBe(descriptions.imageInvertDescription)
      })
    })
    describe('reset button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsReset).exists()).toBeTruthy()
      })
      it('should emit "resetViewport"-event on click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find(selectors.controlsReset).trigger('click')
        expect(wrapper.emitted('resetViewport').length).toBe(1)
      })
      it('should display reset description as area label (hover text)', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsReset).attributes('aria-label')).toBe(descriptions.imageResetDescription)
      })
    })
  })
  describe('show metadata button', () => {
    it('should exist', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.controlsShowMetadata).exists()).toBeTruthy()
    })
    it('should emit "toggleShowMetadata"-event on click', async () => {
      const { wrapper } = getWrapper()
      await wrapper.find(selectors.controlsShowMetadata).trigger('click')
      expect(wrapper.emitted('toggleShowMetadata').length).toBe(1)
    })
    it('should display hide metadata description as area label (hover text) if "isShowMetadataActivated" is true', () => {
      const { wrapper } = getWrapper({ isShowMetadataActivated: true })
      expect(wrapper.find(selectors.controlsShowMetadata).attributes('aria-label')).toBe(descriptions.imageHideMetadataDescription)
    })
    it('should display show metadata description as area label (hover text) if "isShowMetadataActivated" is false', () => {
      const { wrapper } = getWrapper({ isShowMetadataActivated: false })
      expect(wrapper.find(selectors.controlsShowMetadata).attributes('aria-label')).toBe(descriptions.imageShowMetadataDescription)
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(DicomControls, {
      attachTo: document.body,
      props: {
        files: [mock<Resource>()],
        activeIndex: 0,
        ...props
      },
      global: {
        plugins: [...defaultPlugins()]
      }, 
    })
  }
}

const resizeWindowSize = (width) => {
  window.innerWidth = width
  window.dispatchEvent(new Event('resize'))
}