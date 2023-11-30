<template>
  <div
    id="dicom-metadata-sidebar"
    class="dicom-metadata-sidebar .sidebar-panel oc-position-relative oc-height-1-1 oc-py-s oc-width-1-1 oc-width-1-2@s oc-width-1-3@m"
  >
    <div id="dicom-metadata-sidebar-header" class="sidebar-panel__header header">
      <oc-button
        v-oc-tooltip="backToMainDescription"
        class="header__back oc-hidden@s"
        appearance="raw"
        :aria-label="backToMainDescription"
        @click="$emit('closeMetadataSidebar')"
      >
        <oc-icon name="arrow-left-s" fill-type="line" />
      </oc-button>

      <h2 class="header__title oc-my-rm">DICOM metadata</h2>

      <oc-button
        v-oc-tooltip="hideMetadataDescription"
        class="header__close"
        appearance="raw"
        :aria-label="hideMetadataDescription"
        @click="$emit('closeMetadataSidebar')"
      >
        <oc-icon name="close" />
      </oc-button>
    </div>
    <div v-if="isMetadataExtracted" id="dicom-metadata-sidebar-content" class="oc-p-s">
      <table class="details-table">
        <!-- patient information section -->
        <tr>
          <th colspan="2">
            <p
              class="oc-py-s oc-font-semibold dicom-metadata-section-title dicom-metadata-first-section"
            >
              Patient Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in patientInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- study information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Study Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in studyInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- series information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Series Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in seriesInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- instance information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Instance Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in instanceInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- image information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Image Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in imageInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- equipment information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Equipment Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in equipmentInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- scanning information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Scanning Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in scanningInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- uids information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">UIDS Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in uidsInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
        <!-- other information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Other Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in otherInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td class="oc-text-break">{{ value || '–' }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'
import upperFirst from 'lodash-es/upperFirst'

export default defineComponent({
  name: 'MetadataSidebar',
  props: {
    isMetadataExtracted: {
      type: Boolean,
      required: true,
      default: false
    },
    patientInformation: {
      type: Array,
      required: true
    },
    studyInformation: {
      type: Array,
      required: true
    },
    seriesInformation: {
      type: Array,
      required: true
    },
    instanceInformation: {
      type: Array,
      required: true
    },
    imageInformation: {
      type: Array,
      required: true
    },
    equipmentInformation: {
      type: Array,
      required: true
    },
    scanningInformation: {
      type: Array,
      required: true
    },
    uidsInformation: {
      type: Array,
      required: true
    },
    otherInformation: {
      type: Array,
      required: true
    }
  },
  emits: ['closeMetadataSidebar'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    return {
      hideMetadataDescription: $gettext('Hide DICOM metadata'),
      backToMainDescription: $gettext('Back to DICOM viewer')
    }
  },
  methods: {
    formatLabel(label: string) {
      // formatting camelcase labels into easily readible labels by adding a gap befor each upper case letter
      // there is no space added if there are multiple upper case letters in a row (e.g. ID)
      // in cases where such an abbreviation is followed by another word and underline should be added in the variable name, e.g. "SOP_InstanceUID" becomes "SOP Instance UID"

      const result = label.replace(/([A-Z]+)/g, ' $1').replace('_', '')

      // optionally make first letter of each word lower?
      // return upperFirst(result.toLowerCase())

      return upperFirst(result)
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-metadata-sidebar {
  border-left: 1px solid var(--oc-color-border); // TODO: hide line on small screen
  position: relative;
  overflow: hidden;
  max-width: var(--oc-breakpoint-medium-default);
}
#dicom-metadata-sidebar-header {
  border-bottom: 1px solid var(--oc-color-border);
  padding-bottom: var(--oc-space-medium);
}

#dicom-metadata-sidebar-content {
  height: calc(100% - 55px);
  // it seems that the bottom is cut off without the offset
  // the amount of 55px was determined by manual testing with chrome on a mac
  // it seems to have something to do with the amount of padding that has been added to the sidebar header
  // TODO: double check on other devices
  overflow-y: scroll;
}

#dicom-metadata-sidebar-content table {
  width: 100%;
}

.dicom-metadata-section-title {
  //margin: 4px 0px 8px 0px;
  margin-bottom: 0px;
  padding-top: 16px !important;
  border-top: 1px solid var(--oc-color-border);
}

.dicom-metadata-first-section {
  padding-top: 0 !important;
  border-top: none;
}

.details-table tr {
  height: 1rem; // reducing hight, originally 1.5rem
}

.details-table th,
td {
  vertical-align: top;
}
</style>