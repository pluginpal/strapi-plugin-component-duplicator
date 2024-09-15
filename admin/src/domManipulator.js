import React, { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad';

/**
 * DuplicatorButton Component
 * Deze component rendert de duplicator knop met de innerlijke span en SVG.
 */
const DuplicatorButton = ({ index }) => (
  <button
    aria-disabled="false"
    type="button"
    className="sc-aXZVg sc-gEvEer sc-cwHptR bzWqhm bYXTJs ksKyfS sc-cfxfcM bNDrnU sc-cPrPEB gsfWfo duplicator-button"
    tabIndex="0"
    aria-labelledby=":r1n:"
    aria-label={`Dupliceer Component ${index + 1}`}
    style={{ display: 'inline-block'}}
    data-index={index} // Voeg de index toe als data attribuut
  >
    <span className="sc-kAyceB dLMruc">Duplicate item line {index + 1}</span>
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
  const { modifiedData, onChange } = useCMEditViewDataManager();

  useEffect(() => {
    console.log(modifiedData);
  }, [modifiedData]);

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
            let variantIndex = 0; // Index om de juiste variant aan te geven
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

                    // Render de DuplicatorButton component als HTML string en geef de variant index door
                    const duplicatorButtonHTML = renderToStaticMarkup(<DuplicatorButton index={variantIndex} />);
                    duplicatorSpan.innerHTML = duplicatorButtonHTML;

                    // Selecteer de duplicator-button om een event listener toe te voegen
                    const duplicatorButton = duplicatorSpan.querySelector('.duplicator-button');
                    if (duplicatorButton) {
                      duplicatorButton.addEventListener('click', () => {
                        console.log('Dupliceer knop geklikt via innerHTML');

                        // Gebruik de variantIndex om de juiste variant te vinden
                        const index = parseInt(duplicatorButton.getAttribute('data-index'), 10);
                        console.log('Dupliceer knop index:', index);

                        // Haal de variant data op via de index
                        const componentData = modifiedData.variants[index];
                        if (!componentData) {
                          console.error('Variant data niet gevonden voor index:', index);
                          return;
                        }

                        // Log de variant data
                        console.log('Variant data:', componentData);

                        // Implementeer de duplicatie logica
                        const currentVariants = modifiedData.variants || [];
                        const newVariant = { ...componentData, id: Date.now() }; // Voeg unieke ID toe indien nodig

                        // Update de varianten lijst en voeg het nieuwe item toe
                        const updatedVariants = [...currentVariants, newVariant];

                        // Gebruik onChange om de nieuwe variant lijst in te stellen
                        onChange({ target: { name: 'variants', value: updatedVariants } });

                        // Gebruik notification in plaats van alert
                        app.toggleNotification({
                          type: 'success',
                          message: { id: getTrad('duplicator.success'), defaultMessage: 'Component gedupliceerd!' },
                        });
                      });
                    }

                    // Voeg de duplicator span toe naast de bestaande span
                    buttonContainer.parentElement.insertBefore(duplicatorSpan, buttonContainer.nextSibling);

                    // Verhoog de variant index
                    variantIndex++;
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
