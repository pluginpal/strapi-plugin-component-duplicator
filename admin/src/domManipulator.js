// admin/src/domManipulator.js
import React from 'react';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import getTrad from './helpers/getTrad'; // Zorg ervoor dat deze helper correct is geïmporteerd
import { createRoot } from 'react-dom/client';

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
                  if (!buttonContainer.querySelector('.duplicator-button')) {
                    console.log('Voeg duplicator knop toe aan:', buttonContainer);

                    // Creëer een nieuwe <span> element voor de duplicator knop
                    const duplicatorSpan = document.createElement('span');
                    duplicatorSpan.classList.add('duplicator-span');
                    duplicatorSpan.style.display = 'inline-block'; // Zorg ervoor dat de span naast bestaande spans staat
                    duplicatorSpan.style.marginLeft = '8px'; // Voeg wat ruimte toe

                    // Creëer een nieuwe button element voor de duplicator knop
                    const duplicatorButton = document.createElement('button');
                    duplicatorButton.className = 'sc-aXZVg sc-gEvEer sc-cwHptR bzWqhm bYXTJs ksKyfS sc-cfxfcM bNDrnU sc-cPrPEB gsfWfo duplicator-button';
                    duplicatorButton.setAttribute('aria-disabled', 'false');
                    duplicatorButton.setAttribute('type', 'button');
                    duplicatorButton.setAttribute('tabindex', '0');
                    duplicatorButton.setAttribute('aria-labelledby', ':r1n:');
                    duplicatorButton.setAttribute('aria-label', 'Dupliceer Component');
                    duplicatorButton.style.display = 'inline-block';
                    duplicatorButton.style.marginLeft = '8px';

                    // Render de DuplicatorWrapper component binnen de duplicator button
                    const root = createRoot(duplicatorButton);
                    root.render(<DuplicatorWrapper />); // Verwijder buttonElement prop

                    // Voeg de duplicator button toe aan de duplicator span
                    duplicatorSpan.appendChild(duplicatorButton);

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

/**
 * DuplicatorWrapper Component
 * Deze component wordt gerenderd binnen de duplicator-knop en handelt de duplicatie logica af.
 */
const DuplicatorWrapper = () => {
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

    // Vind de variant component container via de duplicatorButton
    // duplicatorButton -> parent (span) -> parent (div.sc-aXZVg.sc-gEvEer.sc-cbPlza ...)
    const button = document.querySelector('.duplicator-button');
    if (!button) {
      console.error('Duplicator button niet gevonden.');
      return;
    }

    const span = button.parentElement;
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

    // Haal de input velden binnen de variant component
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

  // Voeg een event listener toe aan de button
  React.useEffect(() => {
    const button = document.querySelector('.duplicator-button');
    if (button) {
      button.addEventListener('click', handleDuplicate);
    }

    // Clean up the event listener on unmount
    return () => {
      if (button) {
        button.removeEventListener('click', handleDuplicate);
      }
    };
  }, [modifiedData, onChange, toggleNotification, formatMessage]);

  // Log rendering voor debugging
  console.log('DuplicatorWrapper rendered');

  return (
    <>
      <span className="sc-kAyceB dLMruc">Duplicate item line 1</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#212134" d="M1.056 24h15.906c.583 0 1.056-.473 1.056-1.056V7.028c0-.583-.473-1.056-1.056-1.056H1.056C.473 5.972 0 6.445 0 7.028v15.916C0 23.527.473 24 1.056 24Z"></path>
        <path fill="#212134" d="M8.094 2.111h13.795v13.795h-1.127v2.112h2.182A1.056 1.056 0 0 0 24 16.962V1.056A1.056 1.056 0 0 0 22.944 0H7.038a1.056 1.056 0 0 0-1.056 1.056v2.252h2.112V2.11Z"></path>
      </svg>
    </>
  );
};