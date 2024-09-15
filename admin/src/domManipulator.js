// admin/src/domManipulator.js
import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad';
import { createRoot } from 'react-dom/client';

export const setupDOMManipulator = (app) => {
  const targetNode = document.body; // Observe the entire body
  const config = { childList: true, subtree: true };

  const callback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Zoek naar alle 'Delete' knoppen
            const deleteButtons = node.querySelectorAll('button');
            deleteButtons.forEach((button) => {
              const span = button.querySelector('span');
              if (span && span.textContent.trim() === 'Delete') {
                console.log('Gevonden Delete knop:', button);

                const buttonContainer = button.parentElement; // De 'span' element rond de 'Delete' knop

                if (buttonContainer) {
                  // Controleer of de duplicator knop al bestaat
                  if (!buttonContainer.querySelector('.duplicator-button')) {
                    console.log('Voeg duplicator knop toe aan:', buttonContainer);

                    // Creëer een nieuwe button element voor de duplicator knop
                    const duplicatorButton = document.createElement('button');
                    duplicatorButton.classList.add('duplicator-button');
                    duplicatorButton.style.display = 'inline-block'; // Zorg ervoor dat de knop naast bestaande knoppen staat
                    duplicatorButton.style.marginLeft = '8px'; // Voeg wat ruimte toe
                    duplicatorButton.type = 'button'; // Zorg dat het een button is

                    // Render de DuplicatorWrapper component in de nieuwe button
                    const root = createRoot(duplicatorButton);
                    root.render(<DuplicatorWrapper buttonContainer={buttonContainer} />);

                    // Voeg de duplicator knop toe aan de buttonContainer
                    buttonContainer.appendChild(duplicatorButton);
                  }
                } else {
                  console.warn('buttonContainer niet gevonden voor Delete knop:', button);
                }
              }
            });
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log('MutationObserver is geïnitialiseerd en aan het observeren.');
};

// Creëer een wrapper component omdat hooks niet rechtstreeks gebruikt kunnen worden buiten React componenten
const DuplicatorWrapper = ({ buttonContainer }) => {
  const { modifiedData, onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();

  const handleDuplicate = () => {
    console.log('Dupliceer knop geklikt');

    if (!buttonContainer) {
      console.error('Button container niet gevonden.');
      return;
    }

    // Vind de variant component container via buttonContainer
    // Omdat de structuur complex is, proberen we een hogere container te vinden
    const variantComponent = buttonContainer.closest('div.sc-cbPlza'); // Gebruik een specifieke klasse die je in de DOM ziet

    console.log('Variant component:', variantComponent);

    if (!variantComponent) {
      console.error('Variant component container niet gevonden.');
      return;
    }

    // Haal de input velden binnen de component
    const inputs = variantComponent.querySelectorAll('input, select, textarea');
    let componentData = {};

    inputs.forEach((input) => {
      componentData[input.name] = input.value;
    });

    console.log('Component data om te dupliceren:', componentData);

    // Implementeer de duplicatie logica
    const currentVariants = modifiedData.variants || [];
    const newVariant = { ...componentData, id: Date.now() }; // Voeg unieke ID toe indien nodig

    const updatedVariants = [...currentVariants, newVariant];
    onChange({ target: { name: 'variants', value: updatedVariants } });

    // Gebruik notification in plaats van alert
    toggleNotification({
      type: 'success',
      message: { id: getTrad('duplicator.success'), defaultMessage: 'Component gedupliceerd!' },
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDuplicate}
      style={{ marginLeft: '8px' }} // Pas styling aan indien nodig
    >
      {formatMessage({ id: getTrad('duplicator.button'), defaultMessage: 'Dupliceer Component' })}
    </Button>
  );
};
