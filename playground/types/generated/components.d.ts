import type { Schema, Attribute } from '@strapi/strapi';

export interface VariantsVariant extends Schema.Component {
  collectionName: 'components_variants_variants';
  info: {
    displayName: 'variant';
    icon: 'apps';
  };
  attributes: {
    name: Attribute.String;
    hub_bore_size: Attribute.Integer;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'variants.variant': VariantsVariant;
    }
  }
}
