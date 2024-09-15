// admin/src/domManipulator.js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad';

/**
 * DuplicatorButton Component
 * Deze component rendert de duplicator knop met de innerlijke span en SVG.
 */
const DuplicatorButton = () => (
  <button
    aria-disabled="false"
    type="button"
    className="sc-aXZVg sc-gEvEer sc-cwHptR bzWqhm bYXTJs ksKyfS sc-cfxfcM bNDrnU sc-cPrPEB gsfWfo duplicator-button"
    tabIndex="0"
    aria-labelledby=":r1n:"
    aria-label="Dupliceer Component"
    style={{ display: 'inline-block'}}
  >
    <span className="sc-kAyceB dLMruc">Duplicate item line 1</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#212134" d="M1.056 24h15.906c.583 0 1.056-.473 1.056-1.056V7.028c0-.583-.473-1.056-1.056-1.056H1.056C.473 5.972 0 6.445 0 7.028v15.916C0 23.527.473 24 1.056 24Z"></path>
      <path fill="#212134" d="M8.094 2.111h13.795v13.795h-1.127v2.112h2.182A1.056 1.056 0 0 0 24 16.962V1.056A1.056 1.056 0 0 0 22.944 0H7.038a1.056 1.056 0 0 0-1.056 1.056v2.252h2.112V2.11Z"></path>
    </svg>
  </button>
);

/**
 * Setup DOM Manipulator
 * Initialiseert een MutationObserver die de DOM observeert op toevoeging van nieuwe nodes.
 * Het zoekt specifiek naar 'Delete' knoppen en voegt daar de Duplicator-knop naast toe in een nieuwe <span>.
 *
 * @param {object} app - Strapi app instance
 */
export const setupDOMManipulator = (app) => {
  const targetNode = document.body; // Observeer het gehele body-element
  const config = { childList: true, subtree: true }; // Observeer kind-elementen en de gehele subtree

  /**
   * MutationObserver Callback
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

                const buttonContainer = button.parentElement; // De <span> element rond de 'Delete' knop

                if (buttonContainer) {
                  // Controleer of de duplicator knop al bestaat binnen dezelfde container
                  if (!buttonContainer.querySelector('.duplicator-span')) { // Check for duplicator-span
                    console.log('Voeg duplicator knop toe aan:', buttonContainer);

                    // Creëer een nieuwe <span> element voor de duplicator knop
                    const duplicatorSpan = document.createElement('span');
                    duplicatorSpan.classList.add('duplicator-span');
                    duplicatorSpan.style.display = 'inline-block'; // Zorg ervoor dat de span naast bestaande spans staat

                    // Render de DuplicatorButton component als HTML string
                    const duplicatorButtonHTML = renderToStaticMarkup(<DuplicatorButton />);

                    // Injecteer de HTML string in de duplicatorSpan
                    duplicatorSpan.innerHTML = duplicatorButtonHTML;

                    // Selecteer de duplicator-button om een event listener toe te voegen
                    const duplicatorButton = duplicatorSpan.querySelector('.duplicator-button');
                    if (duplicatorButton) {
                      duplicatorButton.addEventListener('click', () => {
                        console.log('Dupliceer knop geklikt via innerHTML');

                        // Vind de variant component container via de DOM
                        const variantComponent = buttonContainer.parentElement;
                        if (!variantComponent) {
                          console.error('Variant component container niet gevonden.');
                          return;
                        }

                        console.log('Variant component:', variantComponent);

                        // Haal de input velden binnen de variant component
                        const inputs = variantComponent.querySelectorAll('input, select, textarea');
                        let componentData = {};

                        inputs.forEach((input) => {
                          if (input.name) {
                            componentData[input.name] = input.value;
                            console.log(`Extracted ${input.name}: ${input.value}`);
                          } else {
                            console.warn('Input zonder naam gevonden:', input);
                          }
                        });

                        console.log('Component data om te dupliceren:', componentData);

                        // Implementeer de duplicatie logica
                        const currentVariants = app.modifiedData?.variants || [];
                        const newVariant = { ...componentData, id: Date.now() }; // Voeg unieke ID toe indien nodig

                        const updatedVariants = [...currentVariants, newVariant];
                        app.onChange({ target: { name: 'variants', value: updatedVariants } });

                        // Gebruik notification in plaats van alert
                        app.toggleNotification({
                          type: 'success',
                          message: { id: getTrad('duplicator.success'), defaultMessage: 'Component gedupliceerd!' },
                        });
                      });
                    }

                    // Voeg de duplicator span toe naast de bestaande span
                    buttonContainer.parentElement.insertBefore(duplicatorSpan, buttonContainer.nextSibling);
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

export default setupDOMManipulator;
