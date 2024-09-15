// index.js
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './helpers/pluginId';
import CMEditViewExclude from './components/CMEditViewExclude';
import Duplicator from './components/Duplicator'; // Import Duplicator
import pluginPermissions from './permissions';
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
    // Inject CMEditViewExclude
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'sitemap-exclude-filter-edit-view',
      Component: CMEditViewExclude,
    });

    // Inject Duplicator
    app.injectContentManagerComponent('editView', 'actions', { // Pas 'actions' aan naar de juiste injection zone
      name: 'component-duplicator',
      Component: Duplicator,
    });
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
