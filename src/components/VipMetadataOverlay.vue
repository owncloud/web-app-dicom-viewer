<template>
  <div id="dicom-viewer-vip-metadata" class="oc-position-absolute" >
    <div class="oc-pr-s oc-font-semibold">
      <span>{{ patientName || patientNameNotDefined }}, </span>
      <span>*{{ patientBirthdate || birthdateNotDefined }}</span>
    </div>
    <div class="oc-pr-s oc-font-semibold">
      <span>{{ institutionName || institutionNameNotDefined }}</span>,
      <span> {{ instanceCreationDateTime || instanceCreationDateAndTimeNotDefined }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'

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
  },
  setup(props) {
    const { $gettext } = useGettext()

    return {
      patientNameNotDefined: $gettext('patient name not defined'),
      birthdateNotDefined: $gettext('birthdate not defined'),
      institutionNameNotDefined: $gettext('institution name not defined'),
      instanceCreationDateAndTimeNotDefined: $gettext('instance creation date and time not defined'),
    }
  }
})
</script>
