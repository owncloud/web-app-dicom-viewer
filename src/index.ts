import translations from '../l10n/translations.json'
import { AppWrapperRoute, defineWebApplication } from '@ownclouders/web-pkg'
import App from './App.vue'
import { useGettext } from 'vue3-gettext'
import { id as appId } from '../public/manifest.json'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()

    const appInfo = {
      name: $gettext('DICOM Viewer'),
      id: appId,
      icon: 'resource-type-medical',
      iconFillType: 'fill',
      iconColor: 'var(--oc-color-icon-medical)',
      extensions: [
        {
          extension: 'dcm',
          routeName: appId,
          label: $gettext('Preview'),
          canBeDefault: true
        }
      ]
    }

    const routes = [
      {
        name: appId,
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(App, {
          applicationId: appId,
          urlForResourceOptions: {
            disposition: 'inline'
          }
        }),
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
      translations
    }
  }
})
