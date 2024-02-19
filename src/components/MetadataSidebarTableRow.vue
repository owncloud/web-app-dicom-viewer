<template> 
  <tr class="dicom-metadata-section">
    <th colspan="2">
      <p 
        class="oc-py-s oc-font-semibold dicom-metadata-section-title"
        :class="isFirstSection ? 'dicom-metadata-first-section' : ''"
      >{{ metadataSectionName }} </p>
    </th>
  </tr>
  <tr v-for="element in metadataSectionData" :key="element.id">
    <th scope="col" class="oc-pr-s">{{ formatLabel(element.label) }}</th>
    <td class="oc-text-break">{{ element.value || '–' }}</td>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import upperFirst from 'lodash-es/upperFirst'

export default defineComponent({
  name: 'MetadataSidebarTableRow',
  props: {
    metadataSectionName: {
      type: String,
      required: true
    },
    metadataSectionData: {
      type: Array,
      required: true
    }, 
    isFirstSection: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatLabel(label: string) {
      // formatting camelcase labels into easily readable labels by adding a gap before each upper case letter
      // there is no space added if there are multiple upper case letters in a row (e.g. ID)
      // in cases where such an abbreviation is followed by another word and underline should be added in the variable name, e.g. "SOP_InstanceUID" becomes "SOP Instance UID"

      const result = label.replace(/([A-Z]+)/g, ' $1').replace('_', '')

      return upperFirst(result)
    }
  }
})
</script>

<style lang="scss" scoped>
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

.details-table th,
td {
  vertical-align: top;
}
</style>
