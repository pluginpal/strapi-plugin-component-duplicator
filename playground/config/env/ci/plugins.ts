const path = require('path');

export default {
  sitemap: {
    enabled: true,
    resolve: path.resolve(__dirname, '../../../../node_modules/strapi-plugin-sitemap'),
  },
};
