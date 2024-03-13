import { shallowMount, flushPromises } from '@vue/test-utils'
import App from '../../src/App.vue'
import { vi } from 'vitest'
import { defaultPlugins } from '../../src/helper/defaultPlugins'

vi.mock('vue3-gettext', () => ({
  useGettext: vi.fn().mockImplementation((text) => {
    return {
      $gettext: () => text
    }
  }),
  createGettext: vi.fn()
}))

vi.mock('@cornerstonejs/core', () => {
  return {
    RenderingEngine: class RenderingEngine {
      getViewport() {
        return {
          setStack: vi.fn(),
          render: vi.fn(),
          getCamera: vi.fn().mockImplementation(() => {
            return { parallelScale: 137.3853139193763 }
          }),
          getImageData: vi.fn().mockImplementation(() => {
            return { dimensions: [] }
          })
        }
      }
      enableElement() {}
    },
    Types: vi.fn(),
    Enums: {
      ViewportType: {
        STACK: ''
      }
    },
    metaData: {
      get: vi.fn().mockImplementation(() => {
        return {
          pixelRepresentation: '',
          bitsAllocated: '',
          bitsStored: '',
          highBit: '',
          samplesPerPixel: ''
        }
      })
    },

    init: vi.fn(),
    getConfiguration: vi.fn().mockImplementation(() => {
      return { rendering: '' }
    }),
    registerImageLoader: vi.fn(),
    isCornerstoneInitialized: vi.fn()
  }
})

vi.mock('@cornerstonejs/dicom-image-loader', () => ({
  wadouri: {
    loadImage: () => ({
      promise: Promise.resolve({})
    })
  },
  external: vi.fn(),
  configure: vi.fn(),
  loadImage: vi.fn(),
  webWorkerManager: {
    initialize: vi.fn().mockImplementation(() => {})
  }
}))

vi.mock('dicom-parser', () => ({
  default: {}
}))

describe('App component', () => {
  const spyFetchVipMetadataInformation = vi
    .spyOn(App.methods, 'fetchVipMetadataInformation')
    .mockImplementation(vi.fn())
  const spyFetchMetadataInformation = vi
    .spyOn(App.methods, 'fetchMetadataInformation')
    .mockImplementation(vi.fn())
  const spyAddWadouriPrefix = vi
    .spyOn(App.methods, 'addWadouriPrefix')
    .mockReturnValue('wadouri:https://test')
  const spyInitCornerstoneCore = vi
    .spyOn(App.methods, 'initCornerstoneCore')
    .mockImplementation(vi.fn())

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch overlay metadata when the url is not provided', async () => {
    getWrapper()
    await flushPromises()

    expect(spyAddWadouriPrefix).toHaveBeenCalledTimes(0)
    expect(spyFetchVipMetadataInformation).toHaveBeenCalledTimes(0)
    expect(spyFetchMetadataInformation).toHaveBeenCalledTimes(0)
    expect(spyInitCornerstoneCore).toHaveBeenCalledTimes(1)
  })
  it('should fetch overlay metadata when the url is provided', async () => {
    getWrapper({ props: { url: 'https://test' } })
    await flushPromises()

    expect(spyAddWadouriPrefix).toHaveBeenCalledTimes(1)
    expect(spyAddWadouriPrefix).toHaveBeenCalledWith('https://test')
    expect(spyFetchVipMetadataInformation).toHaveBeenCalledTimes(1)
    expect(spyFetchVipMetadataInformation).toHaveBeenCalledWith('wadouri:https://test')
    expect(spyFetchMetadataInformation).toHaveBeenCalledTimes(1)
    expect(spyFetchMetadataInformation).toHaveBeenCalledWith('wadouri:https://test')
    expect(spyInitCornerstoneCore).toHaveBeenCalledTimes(1)
  })

  describe('Methods', () => {
    const wrapper = getWrapper()
    describe('method: wadouri', () => {
      beforeAll(() => {
        spyAddWadouriPrefix.mockRestore()
      })

      it('should add "wadouri" prefix', async () => {
        expect(await wrapper.vm.addWadouriPrefix('https://dummy_url')).toBe(
          'wadouri:https://dummy_url'
        )
      })
    })

    describe('method: formatOverlayDate', () => {
      it('should format a valid date', () => {
        expect(wrapper.vm.formatOverlayDate('19010101')).toBe('1/1/1901')
      })
      it.each([undefined, '1901010'])(
        'should return undefined for invalid date: %s',
        (invalidDate) => {
          expect(wrapper.vm.formatOverlayDate(invalidDate)).toBe(undefined)
        }
      )
    })

    describe('method: formatOverlayDateAndTime', () => {
      it.each([
        {
          date: '19960823',
          time: '093801',
          expected: 'Aug 23, 1996, 9:38 AM',
          description: 'valid date and time'
        },
        {
          date: '1996082',
          time: '093801',
          expected: undefined,
          description: 'invalid date and valid time'
        },
        {
          date: '19960823',
          time: '09380',
          expected: undefined,
          description: 'valid date and invalid time'
        },
        {
          date: '1996082',
          time: '09380',
          expected: undefined,
          description: 'invalid date and time'
        },
        {
          date: undefined,
          time: undefined,
          expected: undefined,
          description: 'undefined date and time'
        }
      ])(`should return $expected for $description`, ({ date, time, expected }) => {
        expect(wrapper.vm.formatOverlayDateAndTime(date, time)).toBe(expected)
      })
    })
  })
})

function getWrapper(options = {}) {
  return shallowMount(App, {
    ...options,
    global: {
      plugins: [...defaultPlugins()],
      mocks: {
        $language: {
          current: 'en'
        }
      }
    }
  })
}
