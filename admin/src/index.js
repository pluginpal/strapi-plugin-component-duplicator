// index.js
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './helpers/pluginId';
import Duplicator from './components/Duplicator';
import pluginPermissions from './permissions';
import { setupDOMManipulator } from './domManipulator';
// import getTrad from './helpers/getTrad';

const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const { name } = pluginPkg.strapi;

export default {
  register(app) {
    app.registerPlugin({
      description: pluginDescription,
      id: pluginId,
      isReady: true,
      isRequired: pluginPkg.strapi.required || false,
      name,
      injectionZones: {
        modal: {
          advanced: [],
        },
      },
    });
  },
  bootstrap(app) {
    console.log('Plugin bootstrap called'); // Toegevoegd voor debugging

    // Inject CMEditViewExclude
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'component-duplicator-exclude-filter-edit-view',
      Component: setupDOMManipulator,
    });

    // Inject Duplicator - tijdelijk uitgeschakeld
    /*
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'component-duplicator',
      Component: Duplicator,
    });
    */
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(async (locale) => {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          const data = require(`./translations/${locale}.json`);
          return {
            data: prefixPluginTranslations(data, pluginId),
            locale,
          };
        } catch {
          return {
            data: {},
            locale,
          };
        }
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
