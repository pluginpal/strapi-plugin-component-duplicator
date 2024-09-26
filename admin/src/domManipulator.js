import React, { useEffect, useState } from 'react';
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

const insertDuplicateButton = (node) => {
  // Zoek naar alle 'Delete' knoppen binnen het nieuwe node
  const deleteButtons = node.querySelectorAll('button');
  deleteButtons.forEach((button) => {
    const duplicatorButtons = document.querySelectorAll('.duplicator-button');
    const index = duplicatorButtons.length;
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
          const duplicatorButtonHTML = renderToStaticMarkup(<DuplicatorButton index={index} />);
          duplicatorSpan.innerHTML = duplicatorButtonHTML;

          // Voeg de duplicator span toe naast de bestaande span
          buttonContainer.parentElement.insertBefore(duplicatorSpan, buttonContainer.nextSibling);
        }
      } else {
        console.warn('buttonContainer niet gevonden voor Delete knop:', button);
      }
    }
  });
};


/**
 * Setup DOM Manipulator
 * Initialiseert een MutationObserver die de DOM observeert op toevoeging van nieuwe nodes.
 * Het zoekt specifiek naar 'Delete' knoppen en voegt daar de Duplicator-knop naast toe in een nieuwe <span>.
 *
 * @param {object} app - Strapi app instance
 */
export const setupDOMManipulator = (app) => {
  const [insertedButtons, setInsertedButtons] = useState(0);
  const targetNode = document.body; // Observeer het gehele body-element
  const config = { childList: true, subtree: true }; // Observeer kind-elementen en de gehele subtree
  const { modifiedData, onChange, slug, allLayoutData } = useCMEditViewDataManager();

  console.log(modifiedData);

  useEffect(() => {
    const visibleFields = allLayoutData.contentType.layouts.edit;
    const repeatableComponentFields = visibleFields.filter((field) => field[0].fieldSchema.type === 'component' && field[0].fieldSchema.repeatable);

    repeatableComponentFields.forEach((field) => {
      const { label } = field[0].metadatas;

      for (const labelElement of document.querySelectorAll('label')) {
        if (labelElement.textContent?.startsWith(`${label}`)) {
          const wrapperElement = labelElement.parentElement.parentElement.parentElement;
          insertDuplicateButton(wrapperElement);
          setInsertedButtons(insertedButtons + 1);
        }
      }
    });
  }, [allLayoutData]);

  useEffect(() => {
    const callback = (mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              insertDuplicateButton(node);
              setInsertedButtons(insertedButtons + 1);
              console.log('inserted button');
            }
          });
        }
      });
    };

    // Initialiseer de MutationObserver met de callback en config

    // @todo: De mutiation observer zorgt er voor dat de duplicator knoppen
    // alleen worden toegevoegd aan de DOM wanneer er nieuwe nodes worden toegevoegd.
    // Echter betekend dat voor bestaande wielen, met al eerder aangemaakte varianten,
    // de duplicator knoppen niet worden toegevoegd. Dit moet nog worden opgelost.
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }, []);

  useEffect(() => {
    // @todo: Hier moet een loop komen om alle duplicator-buttons te selecteren
    // en event listeners toe te voegen.

    // Selecteer de duplicator-button om een event listener toe te voegen
    const duplicatorButtons = document.querySelectorAll('.duplicator-button');

    if (!duplicatorButtons || duplicatorButtons.length === 0) {
      return () => {};
    }

    const clickFunction = (e) => {
      console.log('Dupliceer knop geklikt via innerHTML', e);

      // Gebruik de variantIndex om de juiste variant te vinden
      const index = parseInt(e.target.parentElement.parentElement.getAttribute('data-index'), 10);
      console.log('Dupliceer knop indexx:', index);

      // Haal de variant data op via de index
      // @todo: Hier staat .Variant hardcoded. Dit moet dynamisch worden gemaakt.
      const componentData = modifiedData.Variant[index];
      if (!componentData) {
        console.error('Variant data niet gevonden voor index:', index);
        return;
      }

      // Log de variant data
      console.log('Variant data:', componentData);

      // Implementeer de duplicatie logica
      // @todo: Hier staat .Variant hardcoded. Dit moet dynamisch worden gemaakt.
      const currentVariants = modifiedData.Variant || [];
      const newVariant = { ...componentData, __temp_key__: Date.now() }; // Voeg unieke ID toe indien nodig
      delete newVariant.id;

      // Update de varianten lijst en voeg het nieuwe item toe
      const updatedVariants = [...currentVariants, newVariant];

      // Gebruik onChange om de nieuwe variant lijst in te stellen
      // @todo: Hier staat Variant hardcoded. Dit moet dynamisch worden gemaakt.
      onChange({ target: { name: 'Variant', value: updatedVariants } });

      // // Gebruik notification in plaats van alert
      // app.toggleNotification({
      //   type: 'success',
      //   message: { id: getTrad('duplicator.success'), defaultMessage: 'Component gedupliceerd!' },
      // });
    };

    duplicatorButtons.forEach((button) => {
      button.addEventListener('click', clickFunction);
    });

    console.log('added click function');

    return () => {
      duplicatorButtons.forEach((button) => {
        button.removeEventListener('click', clickFunction);
      });
    };
  }, [modifiedData, insertedButtons]);
};

export default setupDOMManipulator;
