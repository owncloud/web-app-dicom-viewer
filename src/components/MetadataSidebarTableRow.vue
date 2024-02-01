<template> 
  <tr>
    <th colspan="2">
      <p 
        class="oc-py-s oc-font-semibold dicom-metadata-section-title"
        :class="isFirstSection ? 'dicom-metadata-first-section' : ''"
      >{{ metadataSectionName }} </p>
      <!-- for testing only 
      <p>test: {{ $props.dummyText }}</p>
      <p>test: {{ $props.dummyArray }}</p>
      <p>test: {{ $props.dummyObject }}</p>
      <p v-for="item in $props.dummyArray"> {{ item }}</p>
      <p>props: {{ $props.metadataSectionData }}</p>  
      -->
    </th>
  </tr>
  <tr v-for="(value, key) in metadataSectionData" :key="key">
    <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
    <td class="oc-text-break">{{ value || '–' }}</td>
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
    },
    dummyText: {
      type: String
    },
    dummyArray: {
      type: Array,
    }, 
    dummyObject: {
      type: Array,
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
