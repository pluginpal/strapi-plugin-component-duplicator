// admin/src/domManipulator.js
import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad'; // Zorg ervoor dat deze helper correct is geïmporteerd
import { createRoot } from 'react-dom/client';

/**
 * Setup DOM Manipulator
 * Deze functie initialiseert een MutationObserver die de DOM observeert op toevoeging van nieuwe nodes.
 * Het zoekt specifiek naar 'Delete' knoppen en voegt daar de Duplicator-knop naast toe.
 *
 * @param {object} app - Strapi app instance
 */
export const setupDOMManipulator = (app) => {
  const targetNode = document.body; // Observeer het gehele body-element
  const config = { childList: true, subtree: true }; // Observeer kind-elementen en de gehele subtree

  /**
   * Callback functie voor MutationObserver
   * Deze functie wordt aangeroepen telkens wanneer er wijzigingen zijn in de geobserveerde nodes.
   *
   * @param {MutationRecord[]} mutationsList - Lijst van mutaties
   * @param {MutationObserver} observer - De observer instance
   */
  const callback = (mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Zoek naar alle 'Delete' knoppen binnen het nieuwe node
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
                    duplicatorButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#212134" d="M1.056 24h15.906c.583 0 1.056-.473 1.056-1.056V7.028c0-.583-.473-1.056-1.056-1.056H1.056C.473 5.972 0 6.445 0 7.028v15.916C0 23.527.473 24 1.056 24Z"></path><path fill="#212134" d="M8.094 2.111h13.795v13.795h-1.127v2.112h2.182A1.056 1.056 0 0 0 24 16.962V1.056A1.056 1.056 0 0 0 22.944 0H7.038a1.056 1.056 0 0 0-1.056 1.056v2.252h2.112V2.11Z"></path></svg>';
                    duplicatorButton.classList.add('duplicator-button');
                    duplicatorButton.style.display = 'inline-block'; // Zorg ervoor dat de knop naast bestaande knoppen staat
                    duplicatorButton.style.marginLeft = '8px'; // Voeg wat ruimte toe
                    duplicatorButton.type = 'button'; // Zorg dat het een button is
                    duplicatorButton.setAttribute('aria-label', 'Dupliceer Component'); // Toegankelijkheid

                    // Render de DuplicatorWrapper component in de nieuwe button
                    const root = createRoot(duplicatorButton);
                    root.render(<DuplicatorWrapper buttonElement={duplicatorButton} />);

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
    });
  };

  // Initialiseer de MutationObserver met de callback en config
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log('MutationObserver is geïnitialiseerd en aan het observeren.');
};

/**
 * DuplicatorWrapper Component
 * Deze component wordt gerenderd binnen de duplicator-knop en handelt de duplicatie logica af.
 *
 * @param {object} props - Component props
 * @param {HTMLElement} props.buttonElement - De duplicator button element
 */
const DuplicatorWrapper = ({ buttonElement }) => {
  const { modifiedData, onChange } = useCMEditViewDataManager(); // Haal de huidige data en onChange functie op
  const { formatMessage } = useIntl(); // Voor vertalingen
  const toggleNotification = useNotification(); // Voor notificaties

  /**
   * Handle Duplicate
   * Deze functie wordt aangeroepen wanneer de duplicator-knop wordt geklikt.
   * Het dupliceert de huidige variant en voegt deze toe aan de lijst.
   */
  const handleDuplicate = () => {
    console.log('Dupliceer knop geklikt');

    if (!buttonElement) {
      console.error('Button element niet gevonden.');
      return;
    }

    // Vind de variant component container via buttonElement
    // De structuur is:
    // buttonElement -> parent (span) -> parent (div.sc-cbPlza)
    // We gaan twee niveaus omhoog
    const span = buttonElement.parentElement;
    if (!span) {
      console.error('Span container niet gevonden.');
      return;
    }

    const variantComponent = span.parentElement;
    if (!variantComponent) {
      console.error('Variant component container niet gevonden.');
      return;
    }

    console.log('Variant component:', variantComponent);

    // Haal de input velden binnen de component
    const inputs = variantComponent.querySelectorAll('input, select, textarea');
    let componentData = {};

    inputs.forEach((input) => {
      if (input.name) {
        componentData[input.name] = input.value;
      }
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
