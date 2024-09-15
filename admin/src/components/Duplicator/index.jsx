// admin/src/components/Duplicator.jsx
import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from '../../helpers/getTrad';

const Duplicator = () => {
  const { modifiedData, onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  const handleDuplicate = () => {
    const currentVariants = modifiedData.variants || [];
    const lastVariant = currentVariants[currentVariants.length - 1] || {};

    const newVariant = {
      ...lastVariant,
      id: Date.now(), // Unieke ID
      name: '', // Optioneel: reset naam
      // Voeg andere velden toe die je wilt resetten
    };

    const updatedVariants = [...currentVariants, newVariant];
    onChange({ target: { name: 'variants', value: updatedVariants } });
  };

  return null;
};

export default Duplicator;
