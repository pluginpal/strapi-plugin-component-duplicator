// admin/src/domManipulator.js
import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad';
import ReactDOM from 'react-dom';

export const setupDOMManipulator = (app) => {
  // Wacht tot de DOM volledig is geladen
  window.addEventListener('load', () => {
    const targetNode = document.body; // Observe the entire body
    const config = { childList: true, subtree: true };

    const callback = (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Zoek naar specifieke componenten op basis van een herkenbaar patroon
              // Bijvoorbeeld, zoek naar labels met "Variant"
              const variantLabels = node.querySelectorAll('label');
              variantLabels.forEach((label) => {
                if (label.textContent.includes('Variant')) {
                  // Vind de parent container waar de duplicatieknop moet worden toegevoegd
                  const container = label.closest('.sc-aXZVg'); // Pas aan naar de juiste klasse of selector

                  if (container && !container.querySelector('.duplicator-button')) {
                    // Render de Duplicator knop
                    const duplicatorButton = document.createElement('div');
                    duplicatorButton.classList.add('duplicator-button');

                    // Gebruik React om de knop te renderen in de container
                    ReactDOM.render(<DuplicatorWrapper />, duplicatorButton);

                    container.appendChild(duplicatorButton);
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
  });
};

// Creëer een wrapper component omdat hooks niet rechtstreeks gebruikt kunnen worden buiten React componenten
const DuplicatorWrapper = () => {
  const { modifiedData, onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  const handleDuplicate = (event) => {
    console.log('Dupliceer knop geklikt');

    const button = event.target.closest('.duplicator-button');
    if (!button) return;

    const componentContainer = button.closest('.sc-aXZVg'); // Pas aan naar de juiste selector
    if (!componentContainer) return;

    const inputs = componentContainer.querySelectorAll('input, select, textarea');
    let componentData = {};

    inputs.forEach((input) => {
      componentData[input.name] = input.value;
    });

    const currentVariants = modifiedData.variants || [];
    const newVariant = { ...componentData, id: Date.now() }; // Voeg unieke ID toe indien nodig

    const updatedVariants = [...currentVariants, newVariant];
    onChange({ target: { name: 'variants', value: updatedVariants } });

    alert('Component gedupliceerd!');
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDuplicate}
      style={{ marginLeft: '10px' }} // Pas styling aan indien nodig
    >
      {formatMessage({ id: getTrad('duplicator.button'), defaultMessage: 'Dupliceer Component' })}
    </Button>
  );
};
