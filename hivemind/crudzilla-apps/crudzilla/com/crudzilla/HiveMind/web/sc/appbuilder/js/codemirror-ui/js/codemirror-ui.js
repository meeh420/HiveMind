/* Demonstration of embedding CodeMirror in a bigger application. The
* interface defined here is a mess of prompts and confirms, and
* should probably not be used in a real project.
*/
//var CodeMirrorUI = Class.create();

/*--
function CodeMirrorUI(place, options, mirrorOptions) {
  this.initialize(place, options, mirrorOptions);
}
*/

function CodeMirrorUI(toolbar, options) {
  this.init(toolbar, options);
}

CodeMirrorUI.prototype = {
  init:function(toolbar,options){
    var defaultOptions = {
      searchMode: 'popup', // other options are 'inline' and 'dialog'.  The 'dialog' option needs work.
      imagePath: 'images/silk',
      path: 'js',
      buttons: ['search', 'undo', 'redo', 'jump', 'reindentSelection', 'reindent','about'],
      saveCallback: function() {
      
      },
    }
    this.toolbar = toolbar;
    
    var html = [];
    html.push("<div style=\"width:100%;padding-top:4px;padding-bottom:4px;\">");
    //left region of toolbar
    html.push("	<div class=\"toolbar-left\" style=\"width:40%;float:left\">");
    html.push("	  <div class=\"toolbar-left-1\" style=\"width:50%;float:left\"></div>");
    html.push("	  <div class=\"toolbar-left-2\" style=\"width:20%;float:left\"></div>");
    html.push("	  <div class=\"toolbar-left-3\" style=\"width:28%;float:left\"></div>");
    html.push("	  <div style=\"clear:both\"></div>");
    html.push(" </div>");
    
    //middle region of toolbar
    html.push("	<div class=\"toolbar-middle\" style=\"width:40%;float:left\">");
    html.push("	  <div class=\"toolbar-middle-1\" style=\"width:50%;float:left\"></div>");
    html.push("	  <div class=\"toolbar-middle-2\" style=\"width:50%;float:left\"></div>");
    html.push("	  <div style=\"clear:both\"></div>");    
    html.push(" </div>");
    
    html.push("	<div class=\"toolbar-right\" style=\"width:18%;float:right\"></div>");
    html.push("	<div style=\"clear:both\"></div>");
    html.push("</div>");
    
    $(this.toolbar).append(html.join(''));    
    
    
    //this.textarea = textarea
    this.options = options;
    this.setDefaults(this.options, defaultOptions);

    this.buttonDefs = {
      'expandAll': ["Expand all", "expand_all_nodes", this.options.imagePath + "/arrow_out.png", this.expand_all_nodes],
      'collapseAll': ["Collapse all", "collapse_all_nodes", this.options.imagePath + "/arrow_in.png", this.collapse_all_nodes],
      'save': ["Save", "save", this.options.imagePath + "/page_save.png", this.save],
      'search': ["Find/Replace", "find_replace_popup", this.options.imagePath + "/page_find.png", this.find_replace_popup],
      'searchClose': ["Close", "find_replace_popup_close", this.options.imagePath + "/cancel.png", this.find_replace_popup_close],
      'searchDialog': ["Search/Replace", "find_replace_window", this.options.imagePath + "/find.png", this.find_replace_window],
      'undo': ["Undo", "undo", this.options.imagePath + "/arrow_undo.png", this.undo],
      'redo': ["Redo", "redo", this.options.imagePath + "/arrow_redo.png", this.redo],
      'jump': ["Jump to line #", "jump", this.options.imagePath + "/page_go.png", this.jump],
      'reindentSelection': ["Reformat selection", "reindentSelect", this.options.imagePath + "/text_indent.png", this.reindentSelection],
      'reindent': ["Reformat whole document", "reindent", this.options.imagePath + "/page_refresh.png", this.reindent],
      'about': ["About CodeMirror-UI", "about", this.options.imagePath + "/help.png", this.about]
    };

    this.self = this;
    
    this.initButtons();


    
    if (this.options.searchMode == 'inline') {
      this.initFindControl();
    } else if (this.options.searchMode == 'popup') {
      this.initPopupFindControl();
    }
	
    this.deactiveEditorButtons();    
  },
  activeEditorButton:function(button){
      if (button) {
        this.removeClass(button,'inactive');
        $(button).removeAttr("disabled");
      }    
  },
  activeEditorButtons:function(){
    if(this.editor){
      
      if(this.editor.getOption && !this.editor.getOption("readOnly")){
        this.activeEditorButton(this.saveButton);
        this.activeEditorButton(this.undoButton);
        this.activeEditorButton(this.redoButton);        
      }
      else
      {
        this.deactiveEditorButton(this.saveButton);
        this.deactiveEditorButton(this.undoButton);
        this.deactiveEditorButton(this.redoButton);        
      }
      

      this.activeEditorButton(this.jumpButton);
      this.activeEditorButton(this.reindentSelectButton);
      this.activeEditorButton(this.reindentButton);
      this.activeEditorButton(this.expandAllButton);
      this.activeEditorButton(this.collapseAllButton);
      this.activeEditorButton(this.searchButton);
      
      this.editorChanged();
    }
  },
  deactiveEditorButton:function(button){
    if (button){ 
      this.addClass(button,'inactive');
      $(button).attr("disabled","disabled");
    }    
  },
  deactiveEditorButtons:function(){
    this.deactiveEditorButton(this.saveButton);
    this.deactiveEditorButton(this.undoButton);
    this.deactiveEditorButton(this.redoButton);
    this.deactiveEditorButton(this.jumpButton);
    this.deactiveEditorButton(this.reindentSelectButton);
    this.deactiveEditorButton(this.reindentButton);
    this.deactiveEditorButton(this.expandAllButton);
    this.deactiveEditorButton(this.collapseAllButton);
    this.deactiveEditorButton(this.searchButton);
    this.editorChanged();
  },
  getToolbarButton:function(toolbar,button){
    if(this.contextual_toolbars[toolbar])
    	return this.contextual_toolbars[toolbar].buttonObjects[button];
    else
        return this.dynamic_toolbars[toolbar].buttonObjects[button];
  },
  contextual_toolbars:[],
  appendContextualToolbar:function(toolbar){
    this.contextual_toolbars[toolbar.name] = toolbar;
    
    var buttonFrame = document.createElement("div");
    $(buttonFrame).css({"display":"none"});
    buttonFrame.className = "codemirror-ui-clearfix codemirror-ui-button-frame";
    $(this.toolbar).find(toolbar.pane?toolbar.pane:'.toolbar-middle-2').append(buttonFrame);
        
    for (var i = 0; i < toolbar.buttons.length; i++) {
      var buttonId = toolbar.buttons[i];
      
      var buttonDef = toolbar.buttonDefs[buttonId];
      
      toolbar.buttonObjects[buttonId] = this.addButton(buttonDef[0], 
                                                       buttonDef[1], 
                                                       buttonDef[2], 
                                                       toolbar[buttonDef[1]], 
                                                       buttonFrame,
                                                       toolbar);
    }
    toolbar.buttonFrame = buttonFrame;
    return buttonFrame;
  },
  dynamic_toolbars:[],
  appendToolbar:function(toolbar){
    this.dynamic_toolbars[toolbar.name] = toolbar;
    
    var buttonFrame = document.createElement("div");
    //$(buttonFrame).css({"display":"none"});
    buttonFrame.className = "codemirror-ui-clearfix codemirror-ui-button-frame";
    $(this.toolbar).find(toolbar.pane?toolbar.pane:'.toolbar-left-2').append(buttonFrame);
        
    for (var i = 0; i < toolbar.buttons.length; i++) {
      var buttonId = toolbar.buttons[i];
      
      var buttonDef = toolbar.buttonDefs[buttonId];
      
      toolbar.buttonObjects[buttonId] = this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], toolbar[buttonDef[1]], buttonFrame,toolbar);
    }
    toolbar.buttonFrame = buttonFrame;
    return buttonFrame;
  },
  activateContextualToolbar:function(name,actionImplementation){
    //hide current visible one
    for(var toolbarName in this.contextual_toolbars){
      if(this.contextual_toolbars[name].pane == this.contextual_toolbars[toolbarName].pane)
      	$(this.contextual_toolbars[toolbarName].buttonFrame).css({"display":"none"});
    }
    
    //show this one
    $(this.contextual_toolbars[name].buttonFrame).css({"display":"block"});
    
    
    //set the button action implementation
    if(actionImplementation)
    	this.contextual_toolbars[name].actionImplementation = actionImplementation;    
  },
  deactivateContextualToolbar:function(name,justHide){
    $(this.contextual_toolbars[name].buttonFrame).css({"display":"none"});
    if(!justHide)
    	this.contextual_toolbars[name].actionImplementation = null;
  },
  performSearch:function(txt){
    if($("#text-search-tab iframe").length == 0){
      appBuilder.runtime_resources.searchCallBack = function(){              
        var fd = /*$("#text-search-tab iframe")[0]*/appBuilder.runtime_resources.searchFrame.contentWindow || /*$("#text-search-tab iframe")[0]*/appBuilder.runtime_resources.searchFrame; // document of iframe
        fd.performSearch(txt);
        appBuilder.runtime_resources.searchCallBack = null;
        $("#crudzilla-searcbox").focus();
      }
      setTimeout(function(){
        appBuilder.runtime_resources.showSearchTabView(null);},0);
    }
    else
    {
      appBuilder.runtime_resources.showSearchTabView(null);
      var fd = $("#text-search-tab iframe")[0].contentWindow || $("#text-search-tab iframe")[0]; // document of iframe
      fd.performSearch(txt);
    }    
  },
  setUpSearchControl:function(){
     var _this = this;
    
     $("#crudzilla-searcbox").bind("input",function(event, ui){
          //if ( event.which == 13 ) return;       
       	  var txt = $(this).val();
           _this.performSearch(txt);
     });
  },
  removeEditor:function(editor){
    
    if(editor == this.editor){
      this.editor = null;
      this.deactiveEditorButtons();  
    }
  },
  setEditor:function(editor){
        
    this.editor = editor;  
    
    if(editor != null){
      this.searchBox.setEditor(editor);

      var onChange = this.editorChanged.cmuiBind(this);
      if(typeof editor.on == "function"){
          editor.on("change",function(){onChange();});
      }
      else
      {
          editor.options.change = function(){onChange();};
      }

      if(typeof this.editor.search == "undefined"){
          
          this.editor.search = function(txt){
              this.findString.value = txt;
              return this.find();
          }.cmuiBind(this);//function(){this.find()}.cmuiBind(this);
      }
      this.activeEditorButtons(); 
      if(this.editor.getOption && this.editor.getOption("readOnly")){
        $(this.replaceButton).attr("disabled","disabled");
        $(this.replaceAllButton).attr("disabled","disabled");
      }
      else
      {
        $(this.replaceButton).removeAttr("disabled");
        $(this.replaceAllButton).removeAttr("disabled");        
      }
    }
    else
    {
      this.deactiveEditorButtons();  
    }
  },
  setDefaults: function(object, defaults) {
    for (var option in defaults) {
      if (!object.hasOwnProperty(option))
        object[option] = defaults[option];
    }
  },
  toTextArea: function() {
    //this.home.parentNode.removeChild(this.home);
    this.editor.toTextArea();
  },
  initButtons: function() {
    this.buttonFrame = document.createElement("div");
    this.buttonFrame.className = "codemirror-ui-clearfix codemirror-ui-button-frame";
    $(this.toolbar).find(this.options.pane?this.options.pane:'.toolbar-left-1').append/*Child*/(this.buttonFrame);
    

    //this.buttonFrame = $(this.buttonFrame).find('.toolbar-left');
    
    
    for (var i = 0; i < this.options.buttons.length; i++) {
      var buttonId = this.options.buttons[i];
      var buttonDef = this.buttonDefs[buttonId];
      this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], buttonDef[3], this.buttonFrame);
    }
    
    $(this.toolbar).find(".toolbar-right").append('<button id="crudzilla-product-update-notification-btn" style="display:none;float:left;width:22px;height:22px" title="Install Updates"><img src="img/system-upgrade.png"/></button>');
    $(/*this.buttonFrame*/this.toolbar).find('.toolbar-right').append('<button id="toolbar_user_settings_button" style="float:right;width:22px;height:22px">Application Menu</button>');
    $('#toolbar_user_settings_button').button({
            text:false,
            icons: {
                    primary: "ui-icon-wrench"
            }
    }).click(function(event){
        event.stopPropagation(); 
      
        var appList = [];
        for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
           appList.push('<li><a onclick="return false" href="#">'+appBuilder.common_core.registeredApps[i].name+'</a></li>');
        }        
        $('#crudzilla-log-menu').html(appList.join(''));
        $('#crudzilla-user-settings-menu').menu('refresh');      
      
        appBuilder.popUpMenus.push($('#crudzilla-user-settings-menu'));
        $('#crudzilla-user-settings-menu')
        .css({"z-index":"100","position":"absolute","width":"150px"})
        .removeClass("ui-corner-all")
        .addClass("ui-corner-bottom")
        .show()
        .position({
          my: "left top",
          at: "left bottom",
          of: this
        });
    });    
        
    var searchHtml = [];
    searchHtml.push('<div id="crudzilla-blue" style="width:49%;float:left;">');
    searchHtml.push('<div id="crudzilla-apple">');
    searchHtml.push('	<div id="crudzilla-search">');
    searchHtml.push('		<input name="q" id="crudzilla-searcbox" type="text" size="40" placeholder="Search..." />');
    searchHtml.push('	</div>');
    searchHtml.push('</div>');
    searchHtml.push('</div>');
    $(this.toolbar).find('.toolbar-middle-1').append(searchHtml.join(''));
    this.setUpSearchControl();
  },
  createFindBar: function() {
    var _this = this;
    
    var findBar = document.createElement("div");

    var findTextField = $("#toolbar_search_and_replace_panel").find(".search_for_textbox")[0];//document.createElement("span");
    this.searchBox = new crudlayout.SearchBox(this.editor, /*--this.menu*/findTextField);
    /**findBar.appendChild(findTextField);    **/
    $(findTextField).css({"padding-left":"0","margin-left":"0"});    
   
    
    findBar.className = "codemirror-ui-find-bar";

    this.findString = $("#toolbar_search_and_replace_panel").find(".search_for_text")[0];//document.createElement("input");
    //this.findString.type = "hidden"//"text";
    this.findString.size = 8;

    this.findButton = $("#toolbar_search_and_replace_panel").find(".find_button")[0];
    $(this.findButton)
    .css({"font-size":"12px"})
	.button({
            icons: {
              primary: "ui-icon-search"
            },
            text: true            
     }).click(function(){_this.find()}.cmuiBind(_this));
    
    /**
    this.findButton = document.createElement("input");
    this.findButton.type = "button";
    this.findButton.value = "Find";
    this.findButton.onclick = function(){this.find()}.cmuiBind(this);
    **/
    
    this.connect(this.findString, "keyup", function(e){ 
      var code = e.keyCode;
      if (code == 13){
        this.find(this.editor.getCursor(false)) 
      }else{
        if(!this.findString.value == ""){
          this.find(this.editor.getCursor(true))
        } 
      }
      this.findString.focus();
      
    }.cmuiBind(this) );

    
    this.regex = $("#toolbar_search_and_replace_panel").find(".regex_checkbox")[0];
    
    /**
    var regLabel = document.createElement("label");
    regLabel.title = "Regular Expressions"
    this.regex = document.createElement("input");
    this.regex.type = "checkbox"
    this.regex.className = "codemirror-ui-checkbox"
    regLabel.appendChild(this.regex);
    regLabel.appendChild(document.createTextNode("RegEx"));
    */
    this.caseSensitive = $("#toolbar_search_and_replace_panel").find(".match_case_checkbox")[0];
    
    /**
    var caseLabel = document.createElement("label");
    caseLabel.title = "Case Sensitive"
    this.caseSensitive = document.createElement("input");
    this.caseSensitive.type = "checkbox"
    this.caseSensitive.className = "codemirror-ui-checkbox"
    caseLabel.appendChild(this.caseSensitive);
    caseLabel.appendChild(document.createTextNode("A/a"));
    **/
    
	this.replaceString = $("#toolbar_search_and_replace_panel").find(".replace_with_textfield")[0];
    
    /**
    this.replaceString = document.createElement("input");
    this.replaceString.type = "text";
    this.replaceString.size = 8;
    **/
    
    this.connect(this.replaceString, "keyup", function(e){ 
      var code = e.keyCode;
      if (code == 13){
        this.replace()
      }
    }.cmuiBind(this) );

    this.replaceButton = $("#toolbar_search_and_replace_panel").find(".replace_button")[0];
    $(this.replaceButton)
    .css({"font-size":"12px"})
	.button({
            /*icons: {
              primary: "ui-icon-search"
            },*/
            text: true            
    }).click(_this.replace.cmuiBind(_this));    
    
    /*
    this.replaceButton = document.createElement("input");
    this.replaceButton.type = "button";
    this.replaceButton.value = "Replace";
    this.replaceButton.onclick = this.replace.cmuiBind(this);
    */
    
    
    this.replaceAllButton = $("#toolbar_search_and_replace_panel").find(".replace_all_button")[0];
    $(this.replaceAllButton)
    .css({"font-size":"12px"})
	.button({
            /*icons: {
              primary: "ui-icon-search"
            },*/
            text: true            
    }).click(function(){
      _this.replaceAll.checked = true;
      _this.replace.cmuiBind(_this)();
      _this.replaceAll.checked = false;
    });    
    _this.replaceAll = {checked:false};
    
    /*
    var replaceAllLabel = document.createElement("label");
    replaceAllLabel.title = "Replace All"
    this.replaceAll = document.createElement("input");
    this.replaceAll.type = "checkbox"
    this.replaceAll.className = "codemirror-ui-checkbox"
    replaceAllLabel.appendChild(this.replaceAll);
    replaceAllLabel.appendChild(document.createTextNode("All"));
    */
    /**
    findBar.appendChild(this.findString);
    //findBar.appendChild(findTextField);
    
    findBar.appendChild(this.findButton);
    findBar.appendChild(caseLabel);
    findBar.appendChild(regLabel);

    findBar.appendChild(this.replaceString);
    findBar.appendChild(this.replaceButton);
    findBar.appendChild(replaceAllLabel);
    **/
    return findBar;
  },
  initPopupFindControl: function() {
    var findBar = this.createFindBar();

    this.popupFindWrap = document.createElement("div");
    this.popupFindWrap.className = "codemirror-ui-popup-find-wrap";

    this.popupFindWrap.appendChild(findBar);

    var buttonDef = this.buttonDefs['searchClose'];
    this.addButton(buttonDef[0], buttonDef[1], buttonDef[2], buttonDef[3], this.popupFindWrap);

    this.buttonFrame.appendChild(this.popupFindWrap);
  },
  initFindControl: function() {
    var findBar = this.createFindBar();
    $('#toolbar_search_and_replace_panel').append(findBar);
    
    $(this.searchButton).qtip({
            content: {
                    text: $('#toolbar_search_and_replace_panel'), 
                    title: {
                            text: 'Find & Replace',
                            button: true
                    }
            },
            position: {
                    my: 'top left', // Use the corner...
                    at: 'bottom center' // ...and opposite corner
            },
            show: {
                    event: 'click', // Don't specify a show event...
                    ready: false // ... but show the tooltip when ready
            },
            hide: false, // Don't specify a hide event either!
            style: {
                    classes: 'qtip-shadow qtip-bootstrap crudzilla-find-replace-tooltip'
            }
    });
    
    //this.buttonFrame.appendChild(findBar);
  },
  find: function( start ,reverse) {
    var isCaseSensitive = this.caseSensitive.checked;
    if(start == null){
      start = this.editor.getCursor();
    }
    var findString = this.findString.value;
    
    if (findString == null || findString == '') {
      alert('You must enter something to search for.');
      return;
    }
    if (this.regex.checked) {
      findString = new RegExp(findString, !isCaseSensitive ? "i" : "");
    }

    this.cursor = this.editor.getSearchCursor(findString, start, !isCaseSensitive );
    var found = reverse?this.cursor.findPrevious():this.cursor.findNext();
    console.log("found "+found);
    if (found) {
      
      if(reverse)
        this.editor.setSelection(this.cursor.to(),this.cursor.from())
      else
        this.editor.setSelection(this.cursor.from(),this.cursor.to())
      return this.cursor;
      //this.cursor.select();
    } 
    else 
    if(reverse){
      if (confirm("No more matches.  Should we start from the bottom?")) {
        var p = {"line":this.editor.lastLine(),"ch":this.editor.getLine(this.editor.lastLine()).length-1};
        
        this.cursor = this.editor.getSearchCursor(findString, p, !isCaseSensitive);
        found = this.cursor.findPrevious();
        if (found) {
          this.editor.setSelection(this.cursor.to(),this.cursor.from())
          //this.cursor.select();
        } else {
          alert("No matches found.");
        }
      }        
    }
    else
    {
      if (confirm("No more matches.  Should we start from the top?")) {
        this.cursor = this.editor.getSearchCursor(findString, 0, !isCaseSensitive);
        found = this.cursor.findNext();
        if (found) {
          this.editor.setSelection(this.cursor.from(),this.cursor.to())
          //this.cursor.select();
        } else {
          alert("No matches found.");
        }
      }
    }
  },
  replace: function() {
  	var findString = this.findString.value,
  	replaceString = this.replaceString.value,
  	isCaseSensitive = this.caseSensitive.checked,
  	isRegex = this.regex.checked,
  	regFindString = isRegex ? new RegExp(findString, !isCaseSensitive ? "i" : "") : "";

    if (this.replaceAll.checked) {
      var cursor = this.editor.getSearchCursor(isRegex ? regFindString : findString, 0, !isCaseSensitive);
      while (cursor.findNext())
        this.editor.replaceRange(
            isRegex ? cursor.pos.match[0].replace(regFindString, replaceString) : replaceString
            ,cursor.from(),cursor.to());
        //cursor.replace(this.replaceString.value);
    } else {
      this.editor.replaceRange(
        isRegex ? this.cursor.pos.match[0].replace(regFindString, replaceString) : replaceString
        ,this.cursor.from(),this.cursor.to())
      //this.cursor.replace(this.replaceString.value);
      this.find();
    }
  },
  initWordWrapControl: function() {
    var wrapDiv = document.createElement("div");
    wrapDiv.className = "codemirror-ui-wrap"

    var label = document.createElement("label");

    this.wordWrap = document.createElement("input");
    this.wordWrap.type = "checkbox"
    this.wordWrap.checked = true;
    label.appendChild(this.wordWrap);
    label.appendChild(document.createTextNode("Word Wrap"));
    this.wordWrap.onchange = this.toggleWordWrap.cmuiBind(this);
    wrapDiv.appendChild(label);
    this.buttonFrame.appendChild(wrapDiv);
  },
  toggleWordWrap: function() {
    if (this.wordWrap.checked) {
      this.editor.setTextWrapping("nowrap");
    } else {
      this.editor.setTextWrapping("");
    }
  },
  addButton: function(name, action, image, func, frame,bindTo) {
    var button = document.createElement("a");
    //button.href = "#";
    button.className = "codemirror-ui-button " + action;
    button.title = name;
    button.func = func.cmuiBind(bindTo?bindTo:this);
    button.onclick = function(event) {
      //alert(event.target);
      event.target.func();
      return false;
      //this.self[action].call(this);
      //eval("this."+action)();
    }
    .cmuiBind(bindTo?bindTo:this, func);
    var img = document.createElement("img");
    img.src = image;
    img.border = 0;
    img.func = func.cmuiBind(bindTo?bindTo:this);
    button.appendChild(img);
    frame.appendChild(button);
    
    
    if (action == 'save') {
      this.saveButton = button;
    }
    if (action == 'undo') {
      this.undoButton = button;
    }
    if (action == 'redo') {
      this.redoButton = button;
    }    
    if (action == 'find_replace_popup') {
      this.searchButton = button;
    }
    if (action == 'jump') {
      this.jumpButton = button;
    }    
    if (action == 'reindentSelect') {
      this.reindentSelectButton = button;
    }    
    if (action == 'reindent') {
      this.reindentButton = button;
    }    
    if (action == 'expand_all_nodes') {
      this.expandAllButton = button;
    }
    if (action == 'collapse_all_nodes') {
      this.collapseAllButton = button;
    }    
    
    return button;
  },
  classNameRegex: function(className) {
    var regex = new RegExp("(.*) *" + className + " *(.*)");
    return regex;
  },
  addClass: function(element, className) {
    if (!element.className.match(this.classNameRegex(className))) {
       element.className += " " + className;
    }
  },
  removeClass: function(element, className) {
    var m = element.className.match(this.classNameRegex(className))
    if (m) {
      element.className = m[1] + " " + m[2];
    }
  },
  editorChanged: function() {
      
    if(!this.editor || (this.editor.getOption && this.editor.getOption("readOnly"))) {
      return
    }
    
    if(typeof this.editor.historySize == "function"){
        var his = this.editor.historySize();

        if (his['undo'] > 0) {
        this.removeClass(this.saveButton, 'inactive');
        this.removeClass(this.undoButton, 'inactive');
        } else {
        this.addClass(this.saveButton, 'inactive');
        this.addClass(this.undoButton, 'inactive');
        }


        if (his['redo'] > 0) {
        this.removeClass(this.redoButton, 'inactive');
        } else {
        this.addClass(this.redoButton, 'inactive');
        }
    }
    else
    {
        if (this.editor.history.canUndo()) {
            this.removeClass(this.saveButton, 'inactive');
            this.removeClass(this.undoButton, 'inactive');
        } else {
            this.addClass(this.saveButton, 'inactive');
            this.addClass(this.undoButton, 'inactive');
        }


        if (this.editor.history.canRedo()) {
            this.removeClass(this.redoButton, 'inactive');
        } else {
            this.addClass(this.redoButton, 'inactive');
        }        
    }    
  },
  save: function() {
    this.options.saveCallback();
    this.addClass(this.saveButton, 'inactive');
  },
  undo: function() {
    if(typeof this.editor._onUndo == "function")
        this.editor._onUndo();
    else
        this.editor.undo();
  },
  redo: function() {
    if(typeof this.editor._onRedo == "function")
        this.editor._onRedo();
    else    
        this.editor.redo();
  },
  replaceSelection: function(newVal) {
    this.editor.replaceSelection(newVal);
    this.searchWindow.focus();
  },
  raise_search_window: function() {
    //alert('raising window!');
    this.searchWindow.focus();
  },
  find_replace_window: function() {
    if (this.searchWindow == null) {
      this.searchWindow = window.open(this.options.path + "find_replace.html", "mywindow", "scrollbars=1,width=400,height=350,modal=yes");
      this.searchWindow.codeMirrorUI = this;
    }
    this.searchWindow.focus();
  },
  find_replace_popup: function() {
    //alert('Hello!');
    //this.popupFindWrap.className = "codemirror-ui-popup-find-wrap active";
    this.findString.focus();
  },
  find_replace_popup_close: function() {
    //alert('Hello!');
    //this.popupFindWrap.className = "codemirror-ui-popup-find-wrap";
  },
  expand_all_nodes: function() {   
    if(this.editor){
      if(typeof this.editor.expandAll == "function")
         this.editor.expandAll();
      else
      if(typeof this.editor.unfoldAll == "function")
         this.editor.unfoldAll();        
    }
  },
  collapse_all_nodes: function() {
    if(this.editor){
      if(typeof this.editor.collapseAll == "function")
          this.editor.collapseAll();
      else
      if(typeof this.editor.foldAll == "function")
          this.editor.foldAll();       
    }
  },
  jump: function() {
    var line = prompt("Jump to line:", "");
    if (line && !isNaN(Number(line))) {
      this.editor.setCursor(Number(line),0);
      this.editor.setSelection({line:Number(line),ch:0},{line:Number(line)+1,ch:0});
      this.editor.focus();
    }
  },
  reindent: function() {
    var lineCount = this.editor.lineCount();
    for(var line = 0; line < lineCount; line++) {
      this.editor.indentLine(line);
    }
  },
  about : function() {
    string = "CodeMirror-UI was written by Jeremy Green (http://www.octolabs.com/) as a light interface around CodeMirror by Marijn Haverbeke (http://codemirror.net)."
    string += "\n\n"
    string += "Documentation and the code can be found at https://github.com/jagthedrummer/codemirror-ui/."
    alert(string);
  },
  reindentSelection: function() {
    var cur = this.editor.getCursor()
    //console.log(cur)
    var start = this.editor.getCursor(true)["line"]
    var end = this.editor.getCursor(false)["line"]
    for(var line = start; line <= end; line++) {
      this.editor.indentLine(line);
    }
    //this.editor.reindentSelection();

  },
  // Event handler registration. If disconnect is true, it'll return a
  // function that unregisters the handler.
  // Borrowed from CodeMirror + modified
  connect: function (node, type, handler, disconnect) {
    /*function wrapHandler(event) {
      handler(new Event(event || window.event));
    }*/

    if (typeof node.addEventListener == "function") {
      node.addEventListener(type, handler, false);
      if (disconnect)
        return function() {
          node.removeEventListener(type, handler, false);
        };
    } else {
      node.attachEvent("on" + type, handler);
      if (disconnect)
        return function() {
          node.detachEvent("on" + type, handler);
        };
    }
  }
};

/*
 * This makes coding callbacks much more sane
 */
Function.prototype.cmuiBind = function(scope) {
  var _function = this;

  return function() {
    return _function.apply(scope, arguments);
  }
}
