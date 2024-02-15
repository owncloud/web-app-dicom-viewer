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

        <metadata-sidebar-table-row
          v-bind="$props.patientInformation"
          :metadataSectionName="'Patient Information'"
          :metadataSectionData="$props.patientInformation"
          :is-first-section="true"
        />

        <metadata-sidebar-table-row
          v-bind="$props.studyInformation"
          :metadataSectionName="'Study Information'"
          :metadataSectionData="$props.studyInformation"
          :is-first-section="false"
        />

        <metadata-sidebar-table-row
          v-bind="$props.seriesInformation"
          :metadataSectionName="'Series Information'"
          :metadataSectionData="$props.seriesInformation"
          :is-first-section="false"
        />

        <metadata-sidebar-table-row
          v-bind="$props.instanceInformation"
          :metadataSectionName="'Instance Information'"
          :metadataSectionData="$props.instanceInformation"
          :is-first-section="false"
        />

        <!--
        <metadata-sidebar-table-row
          v-bind="$props.imageInformation"
          :metadataSectionName="'Image Information'"
          :metadataSectionData="$props.imageInformation"
          :is-first-section="false"
        />

        <metadata-sidebar-table-row
          v-bind="$props.equipmentInformation"
          :metadataSectionName="'Equipment Information'"
          :metadataSectionData="$props.equipmentInformation"
          :is-first-section="false"
        />

        <metadata-sidebar-table-row
          v-bind="$props.scanningInformation"
          :metadataSectionName="'Scanning Information'"
          :metadataSectionData="$props.scanningInformation"
          :is-first-section="false"
        />

        <metadata-sidebar-table-row
          v-bind="$props.uidsInformation"
          :metadataSectionName="'UIDS Information'"
          :metadataSectionData="$props.uidsInformation"
          :is-first-section="false"
        />
        
        <metadata-sidebar-table-row
          v-bind="$props.otherInformation"
          :metadataSectionName="'Other Information'"
          :metadataSectionData="$props.otherInformation"
          :is-first-section="false"
        />
        -->

      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import upperFirst from 'lodash-es/upperFirst'

import MetadataSidebarTableRow from './MetadataSidebarTableRow.vue'

export default defineComponent({
  name: 'MetadataSidebar',
  components: {
    MetadataSidebarTableRow,
  },
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
      backToMainDescription: $gettext('Back to DICOM viewer'), 
    }
  },
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
  // it seems that the bottom is cut off without the offset
  // the amount of 55px was determined by manual testing with chrome on a mac
  // it seems to have something to do with the amount of padding that has been added to the sidebar header
  // TODO: double check on other devices
  overflow-y: scroll;
}

#dicom-metadata-sidebar-content table {
  width: 100%;
}

.details-table tr {
  height: 1rem; // reducing hight, originally 1.5rem
}
</style>
