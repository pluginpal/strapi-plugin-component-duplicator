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
    // Logica om component te dupliceren komt hier
    console.log('Duplicatie knop geklikt');
  };

  return (
    <Button variant="secondary" onClick={handleDuplicate}>
      {formatMessage({ id: getTrad('duplicator.button'), defaultMessage: 'Dupliceer Component' })}
    </Button>
  );
};

export default Duplicator;
