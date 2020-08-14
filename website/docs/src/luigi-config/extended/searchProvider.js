import docsearch from 'docsearch.js';
class DocSearchProvider {
  onInput() {
    let searchString = Luigi.globalSearch().getSearchString();
    //searchProvider does a search
  }
  onEnter() {
    Luigi.globalSearch().showSearchResult(searchResults)
  }
  onEscape() {
    Luigi.globalSearch().closeSearchResult();
    Luigi.globalSearch().clearSearchField();
  }
  customSearchResultRenderer(searchResults, slot, searchApiObj) {
    //If this function is implemented, the default search result popover will not be displayed.
    let div = document.createElement('div');
    div.setAttribute(
      'class',
      'fd-popover__body fd-popover__body--right luigi-search__popover__body'
    );
    let nav = document.createElement('nav');
    nav.setAttribute('class', 'fd-menu');
    let ul = document.createElement('ul');
    ul.setAttribute('class', 'fd-menu__list fd-menu__list--top');
    for (let i = 0; i < searchResults.length; i++) {
      let li = document.createElement('li');
      li.setAttribute('class', 'fd-menu__item');
      let a = document.createElement('a');
      a.addEventListener('click', e => {
        searchApiObj.fireItemSelected(searchResults[i]);
      });
      a.setAttribute('class', 'fd-menu__link');
      let span = document.createElement('span');
      span.setAttribute('class', 'fd-menu__title');
      span.innerHTML = searchResults[i].label;
      a.appendChild(span);
      li.appendChild(a);
      ul.appendChild(li);
    }
    nav.appendChild(ul);
    div.appendChild(nav);
    slot.appendChild(div);
  }
  customSearchResultItemRenderer (searchResultItem, slot, searchApiObj) {
      let a = document.createElement('a');
    a.setAttribute('class', 'fd-menu__link');
    a.setAttribute('style', 'fd-menu__link');
    a.addEventListener('click', () => {
      searchApiObj.fireItemSelected(searchResultItem);
    })
    let span = document.createElement('span');
    span.setAttribute('class', "fd-menu__title");
    span.innerHTML = searchResultItem.label;
    a.appendChild(span);
    slot.appendChild(a);
  }
  onSearchResultItemSelected(searchResultItem) {
    Luigi.navigation().withParams(searchResultItem.pathObject.params).navigate(searchResultItem.pathObject.link);
  }




  // OLD ONE
  init() {
    this.isDevelop = parseInt(window.location.port) === 4000;
    console.log('isDevelop', this.isDevelop, window.location.port);
    this.coreBaseUrl = window.location.origin;

    this.initialized = false;
    this.inputActive = false;
    setTimeout(() => {
      if (this.initialized) {
        console.error('Cannot be initialized multiple times.');
        return;
      }
      this.addSearchField();
      this.initDocSearch();
      this.attachHandlers();
      this.initialized = true;
    });
  }
  addSearchField() {
    const createElementFromHTML = htmlString => {
      var div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      // Change this to div.childNodes to support multiple top-level nodes
      return div.firstChild;
    };
    const searchElement = createElementFromHTML(`
      <div class="fd-shellbar__action">
        <div class="fd-search-input fd-search-input--closed">
          <div class="fd-popover">
            <div class="fd-popover__control fd-search-input__control">
              <button class="fd-button fd-shellbar__button sap-icon--search" id="lui-search-button" aria-controls="lui-search-field" aria-expanded="false"
                aria-haspopup="true"></button>
              <div class="fd-search-input__closedcontrol" id="lui-search-field" aria-hidden="true">
                <div class="fd-search-input__controlinput" aria-controls="f7erK342" aria-expanded="false"
                  aria-haspopup="false">
                  <input type="text" class="fd-input" id="docsearch" placeholder="Search Documentation">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`);
    const shellBar = Luigi.elements().getShellbarActions();
    shellBar.insertBefore(searchElement, shellBar.firstChild);
  }

  initDocSearch() {
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
        inputSelector: '#docsearch',
        autocompleteOptions: {
          debug: this.isDevelop,
          openOnFocus: false,
          autoselect: true,
          hint: true,
          clearOnSelected: true
        },
        algoliaOptions,
        transformData,
        handleSelected
      };
    };
    docsearch(createAlgoliaOptions());
  }

  attachHandlers() {
    const inputEl = document.getElementById('lui-search-field');

    const focusSearch = () => {
      let inputField = document.getElementById('docsearch');
      if (this.inputActive) {
        setTimeout(() => {
          inputField.focus();
        }, 200);
      } else {
        inputField.value = '';
      }
    };

    const toggleInputActive = () => {
      this.inputActive = !this.inputActive;
      const searchButton = document.getElementById('lui-search-button');
      searchButton.setAttribute('aria-hidden', this.inputActive);
      searchButton.setAttribute('aria-expanded', !this.inputActive);
      inputEl.setAttribute('aria-hidden', !this.inputActive);
    };

    document
      .getElementById('lui-search-button')
      .addEventListener('click', e => {
        e.preventDefault();
        toggleInputActive();
        focusSearch();
      });
  }
}

export const searchProvider = new DocSearchProvider();
