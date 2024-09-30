import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-unresolved
import { renderToStaticMarkup } from 'react-dom/server';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import { Duplicate } from '@strapi/icons';

const Button = () => (
  <button
    aria-disabled="false"
    type="button"
    tabIndex="0"
    className="duplicator-button"
    style={{ display: 'inline-block', width: '2rem', height: '2rem', padding: '8px' }}
  >
    <Duplicate width={12} fill="#666687" />
  </button>
);

const insertDuplicateButton = (node) => {
  const deleteButtons = node.querySelectorAll('button');
  deleteButtons.forEach((button) => {
    const span = button.querySelector('span');
    if (span && span.textContent.trim() === 'Delete') {

      const buttonContainer = button.parentElement.parentElement;

      // Check if there already is a duplicate button in the container.
      // If so we should not attempt to add a new one.
      if (buttonContainer && !buttonContainer.querySelector('.duplicator-span')) {

        const duplicatorSpan = document.createElement('span');
        duplicatorSpan.classList.add('duplicator-span');
        duplicatorSpan.style.display = 'inline-block';

        const duplicatorButtonHTML = renderToStaticMarkup(<Button />);
        duplicatorSpan.innerHTML = duplicatorButtonHTML;

        buttonContainer.insertBefore(duplicatorSpan, button.parentElement.nextSibling);
      }
    }
  });
};


const DuplicateButton = () => {
  const { modifiedData, onChange, allLayoutData } = useCMEditViewDataManager();
  const [count, setCount] = useState(0);
  const visibleFields = allLayoutData.contentType.layouts.edit;
  const repeatableComponentFields = visibleFields.filter((field) => field[0].fieldSchema.type === 'component' && field[0].fieldSchema.repeatable);

  // Initially insert the duplicate buttons for all existing repeatable components.
  useEffect(() => {
    repeatableComponentFields.forEach((field) => {
      const { label } = field[0].metadatas;

      for (const labelElement of document.querySelectorAll('label')) {
        if (labelElement.textContent?.startsWith(`${label}`)) {
          const wrapperElement = labelElement.parentElement.parentElement.parentElement;
          insertDuplicateButton(wrapperElement);
        }
      }
    });
  }, [allLayoutData]);

  // Insert the duplicate button for any new repeatable components that are added to the DOM.
  // This happens when somebody adds a new component to the list, or drags it to a new position.
  useEffect(() => {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback = (mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              insertDuplicateButton(node);
              setCount((prevCount) => prevCount + 1);
            }
          });
        }
      });
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }, []);

  // Add a click event listener to all the duplicate buttons.
  useEffect(() => {
    const duplicatorButtons = document.querySelectorAll('.duplicator-button');

    if (!duplicatorButtons || duplicatorButtons.length === 0) {
      return () => {};
    }

    const clickFunction = (e) => {
      const button = e.target.nodeName === 'BUTTON' ? e.target : e.target.closest('button');
      const listItem = button.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
      const siblings = Array.from(listItem.parentElement.children);
      const index = siblings.indexOf(listItem);

      const wrapper = listItem.parentElement.parentElement.parentElement.parentElement.parentElement;
      const componentLabel = wrapper.querySelector('label').textContent;
      const componentInfo = repeatableComponentFields.filter((field) => componentLabel?.startsWith(`${field[0].metadatas.label}`));
      const componentName = componentInfo[0][0].name;

      const componentData = modifiedData[componentName][index];

      const currentComponents = [...modifiedData[componentName]] || [];
      const newComponent = { ...componentData, __temp_key__: Date.now() };
      delete newComponent.id;

      currentComponents.splice(index + 1, 0, newComponent);

      onChange({ target: { name: componentName, value: currentComponents } });
    };

    duplicatorButtons.forEach((button) => {
      button.addEventListener('click', clickFunction);
    });

    return () => {
      duplicatorButtons.forEach((button) => {
        button.removeEventListener('click', clickFunction);
      });
    };
  }, [modifiedData, count]);
};

export default DuplicateButton;
