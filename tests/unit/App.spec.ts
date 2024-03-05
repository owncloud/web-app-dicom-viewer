import { shallowMount } from "@vue/test-utils";
import App from "../../src/App.vue";
import { vi } from "vitest";
import { defaultPlugins } from "../../src/helper/defaultPlugins";

vi.mock("vue3-gettext", () => ({
  useGettext: vi.fn().mockImplementation((text) => {
    return {
      $gettext: () => text,
    };
  }),
  createGettext: vi.fn(),
}));

vi.mock("@cornerstonejs/core", () => {
  return {
    successCallback: vi.fn(),
    errorCallback: vi.fn(),
    RenderingEngine: class RenderingEngine {
      getViewport() {
        return {
          setStack: vi.fn(),
          render: vi.fn(),
        };
      }
      enableElement() {}
    },
    Types: vi.fn(),
    Enums: {
      ViewportType: {
        STACK: "", // "stack",
      },
    },
    metaData: vi.fn(),
    init: vi.fn(),
    getConfiguration: vi.fn().mockImplementation(() => {
      return { rendering: "" };
    }),
    registerImageLoader: vi.fn(),
    isCornerstoneInitialized: vi.fn(),
  };
});

vi.mock("@cornerstonejs/dicom-image-loader", () => ({
  wadouri: {
    loadImage: (imgId) => ({
      promise: Promise.resolve({}),
    }),
  },
  external: vi.fn(),
  configure: vi.fn(),
  loadImage: vi.fn(),
  webWorkerManager: {
    initialize: vi.fn().mockImplementation(() => {}),
  },
}));

vi.mock("dicom-parser", () => ({
  default: {},
}));

describe("App component", () => {
  describe("Methods", () => {
    vi.spyOn(App.methods, "fetchVipMetadataInformation").mockImplementation(
      vi.fn()
    );
    vi.spyOn(App.methods, "fetchMetadataInformation").mockImplementation(
      vi.fn()
    );
    const wrapper = getWrapper();

    describe("method: wadouri", () => {
      it('should add "wadouri" prefix', async () => {
        expect(await wrapper.vm.addWadouriPrefix("https://dummy_url")).toBe(
          "wadouri:https://dummy_url"
        );
      });
    });

    describe("method: formatOverlayDate", () => {
      it("should format a valid date", () => {
        expect(wrapper.vm.formatOverlayDate("19010101")).toBe("1/1/1901");
      });
      it.each([undefined, "1901010"])(
        "should return undefined for invalid date: %s",
        (invalidDate) => {
          expect(wrapper.vm.formatOverlayDate(invalidDate)).toBe(undefined);
        }
      );
    });

    describe("method: formatOverlayDateAndTime", () => {
      it.each([
        {
          date: "19960823",
          time: "093801",
          expected: "Aug 23, 1996, 9:38 AM",
          description: "valid date and time",
        },
        {
          date: "1996082",
          time: "093801",
          expected: undefined,
          description: "invalid date and valid time",
        },
        {
          date: "19960823",
          time: "09380",
          expected: undefined,
          description: "valid date and invalid time",
        },
        {
          date: "1996082",
          time: "09380",
          expected: undefined,
          description: "invalid date and time",
        },
        {
          date: undefined,
          time: undefined,
          expected: undefined,
          description: "undefined date and time",
        },
      ])(
        `should return $expected for $description`,
        ({ date, time, expected }) => {
          expect(wrapper.vm.formatOverlayDateAndTime(date, time)).toBe(expected);
        }
      );
    });
  });
});

function getWrapper(options = {}) {
  return shallowMount(App, {
    ...options,
    global: {
      plugins: [...defaultPlugins()],
      mocks: {
        $language: {
          current: "en",
        },
      },
    },
  });
}
