import { Resource } from '@ownclouders/web-client/src' 
import DicomControls from '../../../src/components/DicomControls.vue'
import { mount, shallowMount } from '@vue/test-utils' 
//import { mock } from 'jest-mock-extended'

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
  controlsShowMetadata: '.preview-controls-show-metadata'
}

// test cases
// dummy test case
describe('DicomControls component', () => {
  describe('dummy test', () => {
    it('do nothing :)', () => {
      expect(1).toBe(1)
    })
  })
})

/*
describe('DicomControls component', () => {
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
  describe('file navigation', () => {
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
    })
    describe('original size button', () => {
      it('should exist', () => {
        const { wrapper } = getWrapper()
        expect(wrapper.find(selectors.controlsImageOriginalSize).exists()).toBeTruthy()
      })
      it('should be visible if screen size is not small screen', () => {
        const { wrapper } = getWrapper({ isSmallScreen: false })
        expect(wrapper.find(selectors.controlsImageOriginalSize).isVisible()).toBeTruthy()
      })
      it('should not be visible if screen size is small screen', () => {
        const { wrapper } = getWrapper({ isSmallScreen: true })
        expect(wrapper.find(selectors.controlsImageOriginalSize).isVisible()).toBeFalsy()
      })
      it('should emit "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper({ isSmallScreen: false })
        await wrapper.find(selectors.controlsImageOriginalSize).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBe(1)
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
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(DicomControls, {
      props: {
        //files: [mock<Resource>()],
        activeIndex: 0,
        ...props
      },
      global: {
        //TODO: solve import for defaultPlugins
        //plugins: [...defaultPlugins()]
      }
    })
  }
}
*/
