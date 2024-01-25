import translations from '../l10n/translations.json'
import { AppWrapperRoute,
  defineWebApplication } from '@ownclouders/web-pkg'
import App from './App.vue'
import { useGettext } from 'vue3-gettext'

export default defineWebApplication({
  setup(args) {
    const { $gettext } = useGettext()

    const appInfo = {
      name: $gettext('DICOM Viewer'),
      id: 'dicom-viewer',
      icon: 'resource-type-medical',
      iconFillType: 'fill',
      iconColor: 'var(--oc-color-icon-medical)',
      extensions: [
        {
          extension: 'dcm',
          routeName: 'dicom-viewer',
          label: $gettext('Preview'),
          canBeDefault: true
        }
      ]
    }

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(App, {
          applicationId: 'dicom-viewer',
          urlForResourceOptions: {
            disposition: 'inline'
          }
        }),
        name: 'dicom-viewer',
        meta: {
          authContext: 'hybrid',
          title: $gettext('DICOM Viewer'),
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo,
      routes,
      translations,
      //extensions: extensions(args)
    }
  }
})