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
      <h2 class="header__title oc-my-rm">{{ dicomMetadataSidebarTitle }}</h2>
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
        <caption>Details table</caption>
        <metadata-sidebar-table-row
          v-bind="$props.patientInformation"
          :metadata-section-name="'Patient Information'"
          :metadata-section-data="$props.patientInformation"
          :is-first-section="true"
        />
        <metadata-sidebar-table-row
          v-bind="$props.studyInformation"
          :metadata-section-name="'Study Information'"
          :metadata-section-data="$props.studyInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.seriesInformation"
          :metadata-section-name="'Series Information'"
          :metadata-section-data="$props.seriesInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.instanceInformation"
          :metadata-section-name="'Instance Information'"
          :metadata-section-data="$props.instanceInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.imageInformation"
          :metadata-section-name="'Image Information'"
          :metadata-section-data="$props.imageInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.equipmentInformation"
          :metadata-section-name="'Equipment Information'"
          :metadata-section-data="$props.equipmentInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.scanningInformation"
          :metadata-section-name="'Scanning Information'"
          :metadata-section-data="$props.scanningInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.uidsInformation"
          :metadata-section-name="'UIDS Information'"
          :metadata-section-data="$props.uidsInformation"
          :is-first-section="false"
        />
        <metadata-sidebar-table-row
          v-bind="$props.otherInformation"
          :metadata-section-name="'Other Information'"
          :metadata-section-data="$props.otherInformation"
          :is-first-section="false"
        />
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'

import MetadataSidebarTableRow from './MetadataSidebarTableRow.vue'

export default defineComponent({
  name: 'MetadataSidebar',
  components: {
    MetadataSidebarTableRow
  },
  props: {
    isMetadataExtracted: {
      type: Boolean,
      required: true,
      default: false
    },
    patientInformation: {
      type: Object,
      required: true
    },
    studyInformation: {
      type: Object,
      required: true
    },
    seriesInformation: {
      type: Object,
      required: true
    },
    instanceInformation: {
      type: Object,
      required: true
    },
    imageInformation: {
      type: Object,
      required: true
    },
    equipmentInformation: {
      type: Object,
      required: true
    },
    scanningInformation: {
      type: Object,
      required: true
    },
    uidsInformation: {
      type: Object,
      required: true
    },
    otherInformation: {
      type: Object,
      required: true
    }
  },
  emits: ['closeMetadataSidebar'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    return {
      dicomMetadataSidebarTitle: $gettext('DICOM metadata'),
      hideMetadataDescription: $gettext('Hide DICOM metadata'),
      backToMainDescription: $gettext('Back to DICOM viewer')
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-metadata-sidebar {
  border-left: 1px solid var(--oc-color-border);
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
  // bottom of sidebar content is cut off without this offset
  // the amount of 55px was determined by manual testing with chrome on mac
  // seems to be related to amount of padding being added to sidebar header
  overflow-y: scroll;
}

#dicom-metadata-sidebar-content table {
  width: 100%;
}

.details-table tr {
  height: 1rem; // reducing height, originally 1.5rem
}
</style>
