import docsearch from 'docsearch.js';
class DocSearchProvider {
  initDocSearch() {
    console.log('searchProvider.initDocSearch');
    this.isDevelop = parseInt(window.location.port) === 4000;
    document.querySelector('.luigi-search .fd-input-group').style.overflow = 'visible';

    const transformData = suggestions => {
      return suggestions.map(sg => {
        if (this.isDevelop) {
          sg.url = sg.url.replace(
            'https://docs.luigi-project.io',
            this.coreBaseUrl
          );
        }
        sg.url = sg.url.replace('/docu-microfrontend', '');
        return sg;
      });
    };

    const handleSelected = (_, event) => {
      if (
        !event ||
        !event._args ||
        !Array.isArray(event._args) ||
        !event._args[0] ||
        !event._args[0].url
      ) {
        console.debug('Error routing', event);
        return;
      }
      const url = new URL(event._args[0].url);
      const urlWithPath = url.pathname
        .replace(this.coreBaseUrl, '')
        .replace('.md', '')
        .replace('/docu-microfrontend', '');
      if (url.hash) {
        Luigi.navigation()
          .withParams({ section: url.hash.substring(1).toLowerCase() })
          .navigate(urlWithPath);
      } else {
        Luigi.navigation().navigate(urlWithPath);
      }
    };

    const createAlgoliaOptions = () => {
      const algoliaOptions = {
        hitsPerPage: 8
      };
      return {
        apiKey: '5ab04e0673d89f07c964afcf1522ad3a',
        indexName: 'luigi-project',
        inputSelector: '[data-testid="luigi-search-input"]',
        autocompleteOptions: {
          debug: this.isDevelop,
          openOnFocus: true,
          autoselect: true,
          hint: true,
          clearOnSelected: false // true
        },
        algoliaOptions,
        transformData,
        handleSelected
      };
    };
    docsearch(createAlgoliaOptions());
  }

  // attachHandlers() {
  //   const inputEl = document.getElementById('lui-search-field');

  //   const focusSearch = () => {
  //     let inputField = document.getElementById('docsearch');
  //     if (this.inputActive) {
  //       setTimeout(() => {
  //         inputField.focus();
  //       }, 200);
  //     } else {
  //       inputField.value = '';
  //     }
  //   };

  //   const toggleInputActive = () => {
  //     this.inputActive = !this.inputActive;
  //     const searchButton = document.getElementById('lui-search-button');
  //     searchButton.setAttribute('aria-hidden', this.inputActive);
  //     searchButton.setAttribute('aria-expanded', !this.inputActive);
  //     inputEl.setAttribute('aria-hidden', !this.inputActive);
  //   };

  //   document
  //     .getElementById('lui-search-button')
  //     .addEventListener('click', e => {
  //       e.preventDefault();
  //       toggleInputActive();
  //       focusSearch();
  //     });
  // }
}

export const searchProvider = new DocSearchProvider();
