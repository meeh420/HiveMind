/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/*!
 * @file crudlayout.js
 *
 * @brief
 * JSONEditor is an editor to display and edit JSON data in a treeview.
 *
 * Supported browsers: Chrome, Firefox, Safari, Opera, Internet Explorer 8+
 *
 * @license
 * This json editor is open sourced with the intention to use the editor as
 * a component in your own application. Not to just copy and monetize the editor
 * as it is.
 *
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
 * Copyright (C) 2011-2013 Jos de Jong, http://jsoneditoronline.org
 *
 * @author  Jos de Jong, <wjosdejong@gmail.com>
 * @date    2013-02-09
 */


var editor = null;
var formatter = null;

var crudlayout = crudlayout || {};

/**
 * Load the interface (editor, formatter, splitter)
 */
// TODO: split the method load in multiple methods, it is too large
crudlayout.load = function() {
        // splitter
        var domSplitter = document.getElementById('splitter');
        crudlayout.splitter = new Splitter({
            container: domSplitter,
            change: function () {
                crudlayout.resize();
                if(appBuilder.htmlLayout.resizeHandlers){
                   for(var k in appBuilder.htmlLayout.resizeHandlers)
                     appBuilder.htmlLayout.resizeHandlers[k]();
                }
            }
        });

        // web page resize handler
        crudlayout.util.addEventListener(window, 'resize', crudlayout.resize);
};


crudlayout.resize = function() {
    var domLeft = document.getElementById('layout-left-panel');
    var domRight = document.getElementById('layout-right-panel');
    var domSplitter = document.getElementById('splitter');


    var width = window.innerWidth || document.body.offsetWidth || document.documentElement.offsetWidth;
    var height = window.innerHeight || document.body.offsetHeight || document.documentElement.offsetHeight;
    var splitterWidth = domSplitter.clientWidth;


    if (crudlayout.splitter) {
        var splitterLeft = width * crudlayout.splitter.getValue();

        // resize formatter
        domLeft.style.width = Math.round(splitterLeft) + 'px';

        // resize editor
        // the width has a -1 to prevent the width from being just half a pixel
        // wider than the window, causing the content elements to wrap...
        domRight.style.left = Math.round(splitterLeft + splitterWidth) + 'px';
        domRight.style.width = Math.round(width - splitterLeft - splitterWidth - 2) + 'px';
    }
};

