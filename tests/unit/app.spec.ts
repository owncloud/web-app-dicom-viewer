import { describe, it, expect, test, vi } from 'vitest'
import { mount } from "@vue/test-utils"

import App from '../../src/App.vue'


// defining data
const dicomTestFilePath = './testfiles/MRBRAIN.dcm' 

const dicomFiles = [
  {
    id: '1',
    name: 'MRBRAIN.dcm',
    mimeType: 'application/dicom',
    path: 'personal/admin/MRBRAIN.dcm'
  }
] // so far not used in any test case


// test cases
describe('Dicom viewer app', () => {

  // pending tests syntax example
  describe.todo('example for unimplemented test suite')

  describe('example for an group of tests where implementaito is still pending', () => {
    it.todo('example for unimplemented test 1')
    it.todo('example for unimplemented test 2')
  })

  // dummy test cases
  describe('dummy test', () => {
    it('do nothing :)', () => {
      expect(dicomTestFilePath).toBe(dicomTestFilePath)
    })
    test('dummy test - do nothing :)', () => {
      expect(1).toBe(1)
    })
    test('another dummy test', () => {
      expect(1).not.toBe(2)
    })
  })

  // examples for mocks
  describe('mock examples', () => {
    const fn = vi.fn()

    it('first mock test', () => {
      fn('hello', 1)
      expect(vi.isMockFunction(fn)).toBe(true)
      expect(fn.mock.calls[0]).toEqual(['hello', 1])
    })
    it('second mock test', () => {
      fn.mockImplementation(arg => arg)

      fn('world', 2)
  
      expect(fn.mock.results[1].value).toBe('world')
      expect(fn.mock.results[1].value).not.toBe('hello')
    })
  })
})

/*
// test addWadouriPrefix() method
describe('Dicom viewer app', () => {
  describe('Method "addWadouriPrefix"', () => {
    it('should add wadouri prefix to dicom file path', async () => {
      const dicomURL = 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const wadouriDicomURL = 'wadouri:https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const modifiedURL = await App.methods.addWadouriPrefix(dicomURL)
      expect(modifiedURL).toEqual(wadouriDicomURL)
    })
  })
})

// mounting the component
describe('dicom viewer app', () => {
  describe('mount app', () => {
    it('should create a shallow mount of the app', () => {
      const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

      let wrapper

      try {
        wrapper = shallowMount(App)
      } catch (error) {
        expect(error.message).not.toBe(undefined)
        //expect(wrapper).not.toBe(undefined)
        //expect(wrapper.exists()).toBeTruthy()
        // it seems like the wrapper instance doesn't really exist...
      } finally {
        spy.mockRestore()
      }
    })
  })
})

// testing the lifecycle
describe('dicom viewer app', () => {
  describe('app lifecycle', () => {
    const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})
    const createdLifecyleMethodSpy = jest.spyOn(App, 'created')
    const mountedLifecyleMethodSpy = jest.spyOn(App, 'mounted')

    let wrapper

    it('should call "created" on mounting the app', () => {
      try {
        wrapper = shallowMount(App)
      } catch (error) {
        expect(error.message).not.toBe(undefined)
        expect(createdLifecyleMethodSpy).toHaveBeenCalled()
        expect(createdLifecyleMethodSpy).toHaveBeenCalledTimes(1)
      } finally {
        spy.mockRestore()
      }
    })
    it('should call "mounted" on mounting the app', () => {
      try {
        wrapper = shallowMount(App)
      } catch (error) {
        expect(error.message).not.toBe(undefined)
        expect(mountedLifecyleMethodSpy).toHaveBeenCalled()
        expect(mountedLifecyleMethodSpy).toHaveBeenCalledTimes(1)
      } finally {
        spy.mockRestore()
      }
    })
    it('Cornerstone core instance should be initialized at "mounted"', () => {
      // TODO
    })
    it('RenderEngine should be instantiated and have viewport element enabled at "mounted"', () => {
      // TODO make sure wrapper is properly mounted
      try {
        wrapper = shallowMount(App)
      } catch (error) {
        expect(error.message).not.toBe(undefined)
        expect(mountedLifecyleMethodSpy).toHaveBeenCalled()
        //expect(wrapper.vm.renderingEngine).toBeDefined()
        //expect(wrapper.vm.renderingEngine.getRenderingEngines().length).toBe(1)
      } finally {
        spy.mockRestore()
      }
    })
    it('should contain element with id="dicom-canvas" / element should be visible at "mounted"', () => {
      // TODO
      // get wrapper, trigger lifecyle phase
      // expect(wrapper.get('#dicom-canvas')).toBeTruthy()
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper.find('.dicom-canvas').exists()).toBeTruthy()
    })
    it('should contain element with class="cornerstone-canvas" at "mounted" (only after successful init of Cornerstone)', () => {
      // TODO
      // get wrapper, trigger lifecyle phase
      const { wrapper } = getWrapper()
      expect(wrapper.find('.cornerstone-canvas').exists()).toBeTruthy()
    })
  })
})

// test initCornerstoneCore() method
// describe('dicom viewer app', () => {
//   describe('Method "initCornerstoneCore"', () => {
//     it('should initzalize Cornerstone core', async () => {
//       // do we need to test this in the scope of unit test?
//     })

//     it('should fail with an error if Cornerstone core is not properly initialized', async () => {
//       await expect(() => {
//         // TODO: call the function through the wrapper? wrapper.vm.initCornerstoneCore()
//         App.function.initCornerstoneCore()
//       }).toThrow(TypeError)
//     })
//   })
// })

// test addWadouriPrefix() method
describe('dicom viewer app', () => {
  describe('Method "addWadouriPrefix"', () => {
    it('should add wadouri prefix to dicom file path', async () => {
      const dicomURL = 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const wadouriDicomURL = 'wadouri:https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const { wrapper } = getWrapper()
      const data = await wrapper.vm.addWadouriPrefix(dicomURL)
      expect(data).toBe(wadouriDicomURL)
      // const modifiedURL = await App.methods.addWadouriPrefix(dicomURL)
      // TODO: call the function through the wrapper? wrapper.vm.addWadouriPrefix(dicomURL)
      // expect(modifiedURL).toEqual(wadouriDicomURL)
    })
  })
})

// test formatLabel() method
describe('dicom viewer app', () => {
  describe('Method "formatLabel()"', () => {
    it('should format a metadata variable name into a nicely readible label', () => {
      const label = 'patientName'
      const formatedLabel = 'Patient Name'
      expect(App.methods.formatLabel(label)).toEqual(formatedLabel)
      // TODO: call the function through the wrapper? wrapper.vm.formatLabel(label)
    })
    it('should format a metadata variable name with underlines and abbreviations into a nicely readible label', () => {
      const label = 'SOP_InstanceUID'
      const formatedLabel = 'SOP Instance UID'
      expect(App.methods.formatLabel(label)).toEqual(formatedLabel)
      // TODO: call the function through the wrapper? wrapper.vm.formatLabel(label)
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(App, {
      props: {
        // url: 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz',
        ...props
      },
      global: {
        plugins: [...defaultPlugins()]
        //mocks,
        //provide: mocks
      }
    })
  }
}
*/
