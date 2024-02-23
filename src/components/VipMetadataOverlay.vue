<template>
  <div id="dicom-viewer-vip-metadata" class="oc-position-absolute" >
    <div class="oc-pr-s oc-font-semibold">
      <span>{{ patientName || 'patient name not defined' }}</span>
      <span>*{{ patientBirthdate || 'birthdate not defined' }}</span>
    </div>
    <div class="oc-pr-s oc-font-semibold">
      <span>{{ institutionName || 'institution name not defined' }}</span>,
      <span> {{ instanceCreationDateTime || 'instance creation date and time not defined' }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VipMetadataOverlay',
  props: {
    patientName: {
      type: String,
      required: false
    }, 
    patientBirthdate: {
      type: String,
      required: false
    }, 
    institutionName: {
      type: String,
      required: false
    }, 
    instanceCreationDateTime: {
      type: String,
      required: false
    }
  }
})
</script>
