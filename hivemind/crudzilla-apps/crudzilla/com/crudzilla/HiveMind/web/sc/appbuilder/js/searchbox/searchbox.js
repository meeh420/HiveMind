/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * @license
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Copyright (c) 2011-2013 Jos de Jong, http://jsoneditoronline.org
 *
 * @author  Jos de Jong, <wjosdejong@gmail.com>
 */

// create namespace
var jsoneditor = jsoneditor || {};

/**
 * @constructor crudlayout.SearchBox
 * Create a search box in given HTML container
 * @param {crudlayout.JSONEditor} editor    The JSON Editor to attach to
 * @param {Element} container               HTML container element of where to
 *                                          create the search box
 */
crudlayout.SearchBox = function(editor, container) {
    var searchBox = this;

    this.editor = editor;
    this.timeout = undefined;
    this.delay = 200; // ms
    this.lastText = undefined;

    this.dom = {};
    this.dom.container = container;

    var table = document.createElement('table');
    this.dom.table = table;
    table.className = 'search';
    container.appendChild(table);
    var tbody = document.createElement('tbody');
    this.dom.tbody = tbody;
    table.appendChild(tbody);
    var tr = document.createElement('tr');
    tbody.appendChild(tr);

  
    this.dom.results = $("#toolbar_search_and_replace_panel").find(".search_results")[0];
    
    /**
    var td = document.createElement('td');
    tr.appendChild(td);
    var results = document.createElement('div');
    this.dom.results = results;
    results.className = 'results';
    td.appendChild(results);
	**/
  
    td = document.createElement('td');
    tr.appendChild(td);
    var divInput = document.createElement('div');
    this.dom.input = divInput;
    divInput.className = 'frame';
    divInput.title = 'Search fields and values';
    td.appendChild(divInput);

    // table to contain the text input and search button
    var tableInput = document.createElement('table');
    divInput.appendChild(tableInput);
    var tbodySearch = document.createElement('tbody');
    tableInput.appendChild(tbodySearch);
    tr = document.createElement('tr');
    tbodySearch.appendChild(tr);

    var refreshSearch = document.createElement('button');
    refreshSearch.className = 'refresh';
    td = document.createElement('td');
    td.appendChild(refreshSearch);
    tr.appendChild(td);

    var search = document.createElement('input');
    this.dom.search = search;
    search.oninput = function (event) {
        searchBox._onDelayedSearch(event);
    };
    search.onchange = function (event) { // For IE 8
        searchBox._onSearch(event);
    };
    search.onkeydown = function (event) {
        searchBox._onKeyDown(event);
    };
    search.onkeyup = function (event) {
        searchBox._onKeyUp(event);
    };
    refreshSearch.onclick = function (event) {
        search.select();
    };

    // TODO: ESC in FF restores the last input, is a FF bug, https://bugzilla.mozilla.org/show_bug.cgi?id=598819
    td = document.createElement('td');
    td.appendChild(search);
    tr.appendChild(td);

    var searchNext = document.createElement('button');
    searchNext.title = 'Next result (Enter)';
    searchNext.className = 'next';
    searchNext.onclick = function () {
        searchBox.next();
    };
    td = document.createElement('td');
    td.appendChild(searchNext);
    tr.appendChild(td);

    var searchPrevious = document.createElement('button');
    searchPrevious.title = 'Previous result (Shift+Enter)';
    searchPrevious.className = 'previous';
    searchPrevious.onclick = function () {
        searchBox.previous();
    };
    td = document.createElement('td');
    td.appendChild(searchPrevious);
    tr.appendChild(td);
};


crudlayout.SearchBox.prototype.setEditor = function(editor) {
    this.editor = editor;
};
 
/**
 * Go to the next search result
 * @param {boolean} [focus]   If true, focus will be set to the next result
 *                            focus is false by default.
 */
crudlayout.SearchBox.prototype.next = function(focus) {
    
    appBuilder.editor_toolbar.find(null,false);
    return;
  
    if (this.results != undefined) {
      
        this.results.findNext();
        return;
      
      
        var index = (this.resultIndex != undefined) ? this.resultIndex + 1 : 0;
        if (index > this.results.length - 1) {
            index = 0;
        }
        this._setActiveResult(index, focus);
    }
};

/**
 * Go to the prevous search result
 * @param {boolean} [focus]   If true, focus will be set to the next result
 *                            focus is false by default.
 */
crudlayout.SearchBox.prototype.previous = function(focus) {
  
    appBuilder.editor_toolbar.find(null,true);
    return;
  
    if (this.results != undefined) {
      
        this.results.findPrevious();
        return;
        
        var max = this.results.length - 1;
        var index = (this.resultIndex != undefined) ? this.resultIndex - 1 : max;
        if (index < 0) {
            index = max;
        }
        this._setActiveResult(index, focus);
    }
};

/**
 * Set new value for the current active result
 * @param {Number} index
 * @param {boolean} [focus]   If true, focus will be set to the next result.
 *                            focus is false by default.
 * @private
 */
crudlayout.SearchBox.prototype._setActiveResult = function(index, focus) {
    // de-activate current active result
    if (this.activeResult) {
        var prevNode = this.activeResult.node;
        var prevElem = this.activeResult.elem;
        if (prevElem == 'field') {
            delete prevNode.searchFieldActive;
        }
        else {
            delete prevNode.searchValueActive;
        }
        prevNode.updateDom();
    }

    if (!this.results || !this.results[index]) {
        // out of range, set to undefined
        this.resultIndex = undefined;
        this.activeResult = undefined;
        return;
    }

    this.resultIndex = index;

    // set new node active
    var node = this.results[this.resultIndex].node;
    var elem = this.results[this.resultIndex].elem;
    if (elem == 'field') {
        node.searchFieldActive = true;
    }
    else {
        node.searchValueActive = true;
    }
    this.activeResult = this.results[this.resultIndex];
    node.updateDom();

    // TODO: not so nice that the focus is only set after the animation is finished
    node.scrollTo(function () {
        if (focus) {
            node.focus(elem);
        }
    });
};

/**
 * Cancel any running onDelayedSearch.
 * @private
 */
crudlayout.SearchBox.prototype._clearDelay = function() {
    if (this.timeout != undefined) {
        clearTimeout(this.timeout);
        delete this.timeout;
    }
};

/**
 * Start a timer to execute a search after a short delay.
 * Used for reducing the number of searches while typing.
 * @param {Event} event
 * @private
 */
crudlayout.SearchBox.prototype._onDelayedSearch = function (event) {
    // execute the search after a short delay (reduces the number of
    // search actions while typing in the search text box)
    this._clearDelay();
    var searchBox = this;
    this.timeout = setTimeout(function (event) {
            searchBox._onSearch(event);
        },
        this.delay);
};

/**
 * Handle onSearch event
 * @param {Event} event
 * @param {boolean} [forceSearch]  If true, search will be executed again even
 *                                 when the search text is not changed.
 *                                 Default is false.
 * @private
 */
crudlayout.SearchBox.prototype._onSearch = function (event, forceSearch) {
    this._clearDelay();

    var value = this.dom.search.value;
    var text = (value.length > 0) ? value : undefined;
    if (text != this.lastText || forceSearch) {
        // only search again when changed
        this.lastText = text;
        this.results = this.editor.search(text);
        //console.log(text+" results:"+this.results);
        
        return;
      
        this._setActiveResult(undefined);

        // display search results
        if (text != undefined) {
            var resultCount = this.results.length;
            switch (resultCount) {
                case 0: this.dom.results.innerHTML = 'no&nbsp;results'; break;
                case 1: this.dom.results.innerHTML = '1&nbsp;result'; break;
                default: this.dom.results.innerHTML = resultCount + '&nbsp;results'; break;
            }
        }
        else {
            this.dom.results.innerHTML = '';
        }
    }
};

/**
 * Handle onKeyDown event in the input box
 * @param {Event} event
 * @private
 */
crudlayout.SearchBox.prototype._onKeyDown = function (event) {
    event = event || window.event;
    var keynum = event.which || event.keyCode;
    if (keynum == 27) { // ESC
        this.dom.search.value = '';  // clear search
        this._onSearch(event);
        crudlayout.util.preventDefault(event);
        crudlayout.util.stopPropagation(event);
    }
    else if (keynum == 13) { // Enter
        if (event.ctrlKey) {
            // force to search again
            this._onSearch(event, true);
        }
        else if (event.shiftKey) {
            // move to the previous search result
            this.previous();
        }
        else {
            // move to the next search result
            this.next();
        }
        crudlayout.util.preventDefault(event);
        crudlayout.util.stopPropagation(event);
    }
};

/**
 * Handle onKeyUp event in the input box
 * @param {Event} event
 * @private
 */
crudlayout.SearchBox.prototype._onKeyUp = function (event) {
    event = event || window.event;
    var keynum = event.which || event.keyCode;
    if (keynum != 27 && keynum != 13) { // !show and !Enter
        this._onDelayedSearch(event);   // For IE 8
    }
};

