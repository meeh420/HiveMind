appBuilder.htmlLayout={
  dragHandle:null,
  artifactSelectors:[
    ".crudzilla-dnd-outliner",
    ".crudzilla-dnd-active-drag",
    ".crudzilla-dnd-active-drop",
    ".crudzilla-dnd-panel",
    ".crudzilla-dnd-handle",
    ".crudzilla-dnd-active-drag",
    ".crudzilla-dnd-active-drop",
    ".crudzilla-dnd-linebreak",
    "[data-crudzilla]"
  ],
  onPostPartLoad:{},
  init:function(){
        
    //create address bar
    var addressBar = $($(".crudzilla-dnd-address-bar")[0].outerHTML).appendTo("body");
    
    
    $.ajax({
      type:'POST',
      dataType:"json",
      url:"/html-layout/viewport-resizer/viewports.ins",
      success:function(viewports){
        appBuilder.htmlLayout.viewPortDefinitions = viewports;
    }});     
    
    function loadBookmarks(){
      
      $.ajax({
        type:'POST',
        data:{},
        dataType:"json",
        url:"/html-layout/bookmarks/page-list.ins",
        success:function(bookmarks){
          console.log("bookmarks:"+bookmarks.length);
          
          var bookmarkHtml = [];
          
          for(var i =0;i<bookmarks.length;i++){
            bookmarkHtml.push('<li style="white-space: nowrap;padding:4px"><button value="'+bookmarks[i].id+'">Delete</button> <a href="" onclick="appBuilder.htmlLayout.openLayoutPartTab(\'/crudzilla-http-proxy/all/'+bookmarks[i].url+'\'); return false;" title="'+bookmarks[i].label+'\n'+bookmarks[i].url+'"> '+bookmarks[i].label+'</a> </li>');
          }
          
          $(addressBar).find("#crudzilla-dnd-address-bar-bookmark-list").html(bookmarkHtml.join(""));
          
          
          $("#crudzilla-dnd-address-bar-bookmark-list button")
          //.find("button")
          .button({
            icons: {
              primary: "ui-icon-closethick"
            },
            text: false            
          })
          .css({"width":"16px","height":"16px"})
          .click(function(){
            var $this = $(this);
            
            $.blockUI();
            $.ajax({
              type:'POST',
              data:{"pageName":$this.val()},
              url:"/html-layout/bookmarks/remove-page.ste",
              success:function(data){
                $.unblockUI();
                $this.parent().remove();
              }});                    
          });
        }});        
    }
    
    $(appBuilder.editor_toolbar.getToolbarButton("context-free-toolbar","showAddressBar"))
    .qtip({
      content: addressBar,
      position: {
        my: 'top left', // Use the corner...
        at: 'bottom center' // ...and opposite corner
      },
      show: {
        event: 'click', // Don't specify a show event...
        ready: false // ... but show the tooltip when ready
      },
      hide: "unfocus", // Don't specify a hide event either!
      style: {
        classes: 'qtip-shadow qtip-bootstrap crudzilla-dnd-bookmark-tooltip',
        width:320
      },
      events: {
          show: function(event, api) {
             loadBookmarks();
          }
      }      
    });          
    
    $(addressBar).find("#crudzilla-dnd-address-bar-go-btn").button({
      icons: {
        primary: "ui-icon-arrowrefresh-1-e"
      },
      text: false            
    }).css({"width":"22px","height":"22px"})
    .click(function(){      
      var url = $(addressBar).find("#crudzilla-dnd-address-bar-address").val();
      appBuilder.htmlLayout.openLayoutPartTab("crudzilla-http-proxy/all/"+url);      
    });    
    
    $(addressBar).find("#crudzilla-dnd-address-bar-bookmark-btn").button({
      icons: {
        primary: "ui-icon-bookmark"
      },
      text: false            
    }).css({"width":"22px","height":"22px"})
    .click(function(){      
      var url = $(addressBar).find("#crudzilla-dnd-address-bar-address").val();
      appBuilder.htmlLayout.openLayoutPartTab("crudzilla-http-proxy/all/"+url); 
      
      $.blockUI();
      appBuilder.htmlLayout.onPostPartLoad["crudzilla-dnd-address-bar-bookmark"] = function(doc){
        
        
        $.ajax({
          type:'POST',
          data:{"pageUrl":url,pageLabel:$(doc.documentElement).find("title").text()},
          url:"/html-layout/bookmarks/add-page.ste",
          success:function(data){
            $.unblockUI();
            loadBookmarks();
          }});
        
          delete appBuilder.htmlLayout.onPostPartLoad["crudzilla-dnd-address-bar-bookmark"];
      };
    });    
    
    $('#crudzilla-dependency-download-dialog').dialog({
      autoOpen: false,
      width: 400,
      height:400,
      open:function(){        
                
        var externalDependencies = $(this).data("external_dependencies");
        var crudzilla = $(this).data("crudzilla");
        
        var dtnode = appBuilder.activeDoc.ui.panel.dtnode;;
        
        var mutation = $(this).data("mutation");
        
        var relPath = appBuilder.activeDoc.relPath.substring(0, appBuilder.activeDoc.relPath.lastIndexOf("/"));
        var fullRelPath = relPath;
        
        var appConfig = appBuilder.common_core.findApp(relPath+"/web");
        if(appConfig)
          relPath = relPath.substring(appConfig.baseDir.length);
        if(relPath.length == 0)
          relPath = "/";
        
        var html = [];
        for(var i=0;i<externalDependencies.length;i++){
          var dependency = null;
          if(crudzilla){
            console.log("crudzilla.part.external_dependencies "+crudzilla.part.external_dependencies.length);
            if(crudzilla.part.external_dependencies[externalDependencies[i]])
              dependency = crudzilla.part.external_dependencies[externalDependencies[i]];
          }
          
		  var fileName = null;          
          if(dependency == null)
          {
            dependency = {
              "label":"",
              "url":externalDependencies[i],
              "local_path":relPath,
              "description":"",
              "info_page":""
             };
             dependency.label = dependency.url.substring(dependency.url.lastIndexOf("/")+1);
            
             fileName = dependency.label;
          }
          else
          fileName = dependency.url.substring(dependency.url.lastIndexOf("/")+1);
          
          if(!dependency.local_path || dependency.local_path == "")
            dependency.local_path = relPath;
          
          html.push('<div id="crudzilla-dependency-download-wrapper-'+i+'" class="badger-left badger-info" data-badger="'+fileName+'">');
          html.push("<table>");
          
          if(dependency.description && dependency.description.length>0){
            html.push(" <tr>");
            html.push("	<td></td><td>"+dependency.description+"</td>");        
            html.push(" </tr>");       
          }
          
          if(dependency.info_page && dependency.info_page.length>0){
            html.push(" <tr>");          
            html.push("	<td></td><td><span class=\"ui-icon ui-icon-info\" style=\"float:left; \"></span> <a style=\"font-weight:bold\" target=\"_blank\" title=\""+dependency.info_page+"\" href=\""+dependency.info_page+"\">Learn More</a></td>");        
            html.push(" </tr>");       
          }          
          
          
          html.push(" <tr>");
          html.push("	<td style=\"text-align:right;font-weight:bold\">Src:</td>");
          html.push("	<td><a target=\"_blank\" title=\""+dependency.url+"\" href=\""+dependency.url+"\">"+fileName+"</a></td>");        
          html.push(" </tr>");
          
          html.push(" <tr>");
          html.push("	<td style=\"text-align:right;font-weight:bold\">Path:</td>");
          html.push("	<td><div><input type=\"text\" size=\"48\" id=\"crudzilla-dependency-download-list-local_path-"+i+"\" value=\""+dependency.local_path+"\" /></div></td>");        
          html.push(" </tr>");
          

          
          html.push(" <tr>");
          html.push("	<td style=\"text-align:right;font-weight:bold\">Install:</td>");
          html.push("	<td><input type=\"checkbox\" id=\"crudzilla-dependency-download-list-install-"+i+"\" /></td>");        
          html.push(" </tr>");
          
          html.push("</table>");
          html.push('</div>')
        }
        
        $("#crudzilla-dependency-download-list").html(html.join(""));
        
        for(var i=0;i<externalDependencies.length;i++){
          appBuilder.common_core.makeTextFieldDroppable($("#crudzilla-dependency-download-list-local_path-"+i),dtnode);
          
        }        
      },
      buttons: {
        "Continue": function() {
          
            function done(){
              	appBuilder.htmlLayout.domManager
              	.loadDependencies($(mutation.dragElement)[0],
                                mutation.srcDoc,
                                $(mutation.dropElement),
                                mutation.mutation);

                //invoke callback for post drop processing
                if(crudzilla && crudzilla.part && crudzilla.part.onPostDrop)
                  crudzilla.part.onPostDrop(mutation.doc,mutation.mutation);             
            }
          
            var externalDependencies = $(this).data("external_dependencies");
            var crudzilla = $(this).data("crudzilla");
            
            var dependencies = [];
            var html = [];
            var mutation = $(this).data("mutation");
            var relPath =  appBuilder.activeDoc.relPath.substring(0, appBuilder.activeDoc.relPath.lastIndexOf("/"));
          
            var fullRelPath = relPath;
            var appConfig = appBuilder.common_core.findApp(relPath/*+"/web"*/);
            if(appConfig)
              relPath = relPath.substring(appConfig.baseDir.length);          
          	if(relPath.length == 0)
              relPath = "/";
          
            for(var i=0;i<externalDependencies.length;i++){
              var dependency = null;
              if(crudzilla){
                if(crudzilla.part.external_dependencies[externalDependencies[i]])
                  dependency = crudzilla.part.external_dependencies[externalDependencies[i]];
              }
              
              if(dependency == null)
              {
                dependency = {
                  "label":"",
                  "url":externalDependencies[i],
                  "local_path":fullRelPath,
                  "description":"",
                  "info_page":""
                 }; 
              }
              
              var local_path = $("#crudzilla-dependency-download-list-local_path-"+i).val().trim();
              
              if(local_path[0] == '/'){//absolute path
                if(local_path == "/")
                  dependency.local_path = appConfig.baseDir;
                else
              	  dependency.local_path = appConfig.baseDir+local_path;
              }
              else
              {
                if(local_path == "" || local_path == "." || local_path == "./")
                  dependency.local_path = fullRelPath;
                else
                  dependency.local_path = fullRelPath+'/'+local_path;
              }
              
              dependency.install    = $("#crudzilla-dependency-download-list-install-"+i).prop("checked");
              
              if(dependency.install){
                if(!dependency.local_path || dependency.local_path == "")
                  dependency.local_path = fullRelPath;
                
                dependencies.push(dependency.local_path);
                dependencies.push("\n");
                dependencies.push(dependency.url);
                
                if(i+1 < externalDependencies.length)
                  dependencies.push("\n");
              }
            }
          
            $(this).dialog("close");
          
          
            if(dependencies.length == 0){//no dependency to install
               done();
               return;
            }
          
            $.blockUI();
            $.ajax({
            type:'GET',
            data:{"dependencies":dependencies.join("")},
            url:"/html-layout/install-external-part-dependency.ste",
            success:function(data){
              
              	$.unblockUI();
                 done();
              
            }});
        },
        "Cancel": function() {
          $(this).dialog("close");
        }
      }      
    });//.siblings('div.ui-dialog-titlebar').remove();
  },
  createBrowserViewPort:function (html,options) {
    	
    	// jResize default options for customisation, ViewPort size, Background Color and Font Color
    	var defaults = {
            viewPortSizes   : appBuilder.htmlLayout.viewPortDefinitions,//["320px", "480px", "540px", "600px", "768px", "960px", "1024px", "1280px"],
            backgroundColor : 'fff',
            fontColor       : '444'
        }

        options = $.extend({}, defaults, options);

        // Variables
    var resizer        = '<div class="crudzilla-dnd-viewport-viewports" style="padding:0;display:none;position:relative;overflow:auto;background:#'
    + options.backgroundColor + ';color:#' + options.fontColor + ';"><ul class="crudzilla-dnd-viewport-viewlist" style="margin:0;padding:0;">'
                  	   + '</ul><div style="clear:both;"></div></div>';

        var viewPortWidths = options.viewPortSizes;

        var viewPortList   = 'display:inline-block;cursor:pointer;font-size:12px;line-height:12px;text-align:center;'
        		   + 'padding:4px;';


        // Wrap all HTML inside the <body>
        //$(html).first("body")*/.wrapInner('<div id="resizer" />');

        // Insert our resizing plugin    	
    	$(html).find('div:first-child').before(resizer);

        // Loop through the array, using the each to dynamically generate our ViewPort list  
        $.each(viewPortWidths, function (go, className) {
          
            $(html).find('.crudzilla-dnd-viewport-viewlist').append($('<li class="' + className.size + '"' + ' style="' + viewPortList + '">' + className.label + '</li>'));
          
          
            $(html).find('.' + className.size + '').click(function () {
              
                $(this).addClass('crudzilla-dnd-viewport-active').siblings().removeClass('crudzilla-dnd-viewport-active');
              
                $(html).find('.crudzilla-dnd-viewport-resizer').animate({
                    width: '' + className.size + ''
                }, 300);
                //$(this).addClass("crudzilla-dnd-viewport-custom-width");
            });
        });
    
        // Prepend our Reset button
        $(html).find('.crudzilla-dnd-viewport-viewlist').prepend('<li class="crudzilla-dnd-viewport-reset" style="' + viewPortList + '">Reset</li>');
        
        // Slidedown the viewport navigation and animate the resizer
        var height = $(html).find('.crudzilla-dnd-viewlist').outerHeight();
    
        $(html).find('.crudzilla-dnd-viewport-viewports');//.hide().slideDown('300');
    	$(html).find('div:first-child').css({margin: '0 auto'});//.animate({marginTop : height});

        // Allow for Reset
        $(html).find('.crudzilla-dnd-viewport-reset').click(function () {
            $(html).find('div:first-child').css({
                width: 'auto'
            });
        });   
  },  
  buildElementPanel:function(id){
    var html = []
    html.push('<div id="crudzilla-dnd-contextmenu-panel-'+id+'" style="display:none">');
    html.push('	<button id="crudzilla-dnd-contextmenu-panel-delete-'+id+'">Delete</button>');
    html.push('</div>');
    return html.join('');
  },
  loadDoc:function(doc){
    
    var styles = ['<style type="text/css" data-crudzilla="true">'];//background-color:#f2f2f2 #f9f9f9
    styles.push(' .crudzilla-dnd-layout-container-element {min-width:100%;min-height:128px;}');
    styles.push(' .crudzilla-dnd-layout-row-element {min-height:128px;}');
    styles.push(' .crudzilla-dnd-outliner {display:none;position:absolute;}');
    styles.push(' .crudzilla-dnd-active-drag {display:none;position:absolute;border-style:dashed;border-width:1px;border-color:#729fcf}');
    styles.push(' .crudzilla-dnd-active-drop {display:none;position:absolute;border-style:dashed;border-width:1px;border-color:#8ae234}');
    styles.push(' .crudzilla-dnd-panel {left:0;top:0;display:inline;padding:4px;}');
    styles.push(' .crudzilla-dnd-handle {cursor:move;display:inline;padding:4px;background-color: #F5F5F5;border: 1px solid #DDDDDD;border-radius: 4px 0;color: #9DA0A4;font-size: 12px;font-weight: bold;}');
    styles.push('</style>');
    
    $(styles.join('')).appendTo($(doc.iframe).contents().find('head'));
      
    
    doc.activeDrag = $('<div class="crudzilla-dnd-active-drag"><div style="width:50%;float:left;background-color:#729fcf" class="crudzilla-dnd-cue-left"></div><div style="width:50%;float:left;background-color:#3465a4" class="crudzilla-dnd-cue-right"></div><div class="crudzilla-dnd-active-cue"></div></div>').appendTo($(doc.iframe).contents().find("body"));
    doc.activeDrop = $('<div class="crudzilla-dnd-active-drop"><div class="crudzilla-dnd-active-cue"></div></div>').appendTo($(doc.iframe).contents().find("body"));
    
    
    function outline(element,dndComponent){
      
      $(element).data("crudzilla-outliner",$('<span class="crudzilla-dnd-outliner"><div class="crudzilla-dnd-handle"><span class="crudzilla-dnd-panel-title"></span></div></span>').prependTo(/*$(doc.iframe).contents().find("body")*/element));
      var outliner = $(element).data("crudzilla-outliner");

      var realElement = $(element).attr("data-crudzilla-element-wrapper")?$(element).find("[data-crudzilla-element-wrapped='true']"):element;
      
      var layoutClass = dndComponent.label;   
      
      var iframeLink = "";
      if($(realElement).is("iframe"))
        iframeLink = "<a title=\"Open iframe\" href=\"/crudzilla-http-proxy/all/"+$(realElement).attr("src")+"\"> &gt;&gt; </a>";
      
            
      $(outliner).css({"display":"block","position":"absolute"})
      .find('.crudzilla-dnd-panel-title')
      .html(layoutClass+iframeLink);
      return outliner;
    }
    
    
    doc.dndProcessElement = function(element,dndComponent){          
        	
      	  var elementId = $(element).attr("data-crudzilla-element");
          var outliner = null;
      
          
          outliner = outline(element,dndComponent);
      
		  appBuilder.htmlLayout.makeDraggable(element,this,this.activeDrag,this.activeDrop);        
        
      	  if(!$(element).is("html") && !$(element).is("body")){
            
            //popup panel on right click
            if(doc.ui)
            	$(appBuilder.htmlLayout.buildElementPanel(elementId)).appendTo(doc.ui.panel.panel);
            
            outliner.find('.crudzilla-dnd-handle').data("element",element)
            .mousedown(function() {
                appBuilder.htmlLayout.dragHandle = this;
            }).mouseup(function() {
                appBuilder.htmlLayout.dragHandle = null;
                $(doc.activeDrop).css({"display":"none"});
                $(doc.activeDrag).css({"display":"none"});
            }).mouseenter(function(){
                $($(this).data("element")).attr("draggable",'true');
               /*appBuilder.htmlLayout.makeDraggable($(this).data("element"),doc,
                                                   getDragOutliner,
                                                   getDropOutliner);*/
            }).mouseleave(function(){
               appBuilder.htmlLayout.removeDraggable($(this).data("element"));
            });
      
      			
            if(doc.ui){
              outliner.find('.crudzilla-dnd-handle')
              .bind("contextmenu",function(event){
               //event.preventDefault();
               //event.stopPropagation();     
               
               var st = $(doc.documentElement.ownerDocument).scrollTop();
               var sl = $(doc.documentElement.ownerDocument).scrollLeft();
                
               //console.log("scroll top:"+st);
               //console.log("scroll left:"+sl);
                
               $(this).qtip("api").set("position.target",[$(doc.ui.panel.panel).offset().left+event.pageX-sl,$(doc.ui.panel.panel).offset().top+event.pageY+5-st]);
              $(this).qtip("api").show();
               return false;
            }).qtip({
                content: {
                  text: $('#crudzilla-dnd-contextmenu-panel-'+elementId)
                },
                position: {
                  //target: 'mouse', // Position it where the click was...
                  //adjust: { mouse: false }, // ...but don't follow the mouse
                  "my":"top center",
                  "at":"bottom center"
                },
                show: "false",
                hide:"unfocus",
                /*events: {
                      show: function(event, api) {
                          /*
                           * event.originalEvent contains the event that caused the callback to be fired.
                           * event.originalEvent.button tells us which button was clicked e.g. 1= left, 2 = right;
                           *
                          if(event.originalEvent.button !== 2) {
                              // IE might throw an error calling preventDefault(), so use a try/catch block.
                              try { event.preventDefault(); } catch(e) {}
                          }
                      }
                }
                ,*/
                style: {
                  classes: 'qtip-shadow qtip-bootstrap'
                }
              });
              
              $("#crudzilla-dnd-contextmenu-panel-delete-"+elementId)
              .css({/*"width":"32","height":"22",*/"font-size":"10px"})
              .button( {icons: {
						primary: "ui-icon-trash"
							},
                      text: true})
              .click(function(){
                  doc.deleteNode($(element)[0]);
              });
            }
      }
      else
      {
        $(outliner).css({"display":"none"});
      }
    };
    
    
    doc.loadDnDComponent=function(dndComponent,elements){
      for(var j=0;j<elements.length;j++){
          var element = $(elements[j]);
          
          if($(element).is(dndComponent.selector)){
            
            $(element).data("crudzilla-dnd-component",dndComponent);
            
            if(dndComponent.wrapper){
              $(element).wrap(dndComponent.wrapper);
              
              var wrappedElement = $(element).parent();
              $(wrappedElement)
              .attr("data-crudzilla-element",$(element).attr("data-crudzilla-element"))
              .attr("data-crudzilla-element-wrapper","true");
              
              $(element).attr("data-crudzilla-element-wrapped","true");
              
          	  this.dndProcessElement(wrappedElement,dndComponent);
            }else{
              this.dndProcessElement(element,dndComponent);
            }
          }
      }
    }
    
    //find all dnd components from all available frameworks in this document and enable them.
    //eventually it would be nice if we knew which framework is being used by the document and only
    //attempt to enable those components instead of looping through all frameworks.
    doc.processElements = function(elements){
      for(var i=0;i<appBuilder.htmlDnDFrameworks.length;i++){
        var dndFramework = appBuilder.htmlDnDFrameworks[i];
        for(var j=0;j<dndFramework.length;j++){
          var dndComponent = dndFramework[j];
          
          if(!elements)         
          	this.loadDnDComponent(dndComponent,$(this.iframe).contents().find(dndComponent.selector));
          else
          //if($(elements).is(dndComponent.selector))
            this.loadDnDComponent(dndComponent,elements);            
        }
      }
    }
        
    doc.deleteNode = function(element){      
      
      var pair = this.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(element)];
      appBuilder.htmlLayout.domManager.traverseNode(pair,function(node){
        delete doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node)];
      });
      
      console.log("deleteNode "+pair.nodeName+" has parent "+pair.parentNode.contains(pair)+" live "+$(element)[0].nodeName);
      pair.parentNode.removeChild(pair);
      
      
      $(element).remove();
      
      this.updatePair();
      //maybe fire some sort of callback for part cleanup
    };
    
    doc.newNode = function(node,doc,mutation){
      
      //strip any crudzilla awareness from node
      appBuilder.htmlLayout.rinseElementNoClone(node);
      
      //save this for second pass post-clone
      var textIdCounter = doc.textIdCounter;
      
      //assign data-crudzilla-element
      appBuilder.htmlLayout.domManager.traverseNode(node,appBuilder.htmlLayout.domManager.makeNodeCrudzillaAware,doc);
      
      var coldNode = node.cloneNode(true);
      
      //restore 
      doc.textIdCounter = textIdCounter;
      
      //after clone, the text nodes loose their data-crudzilla-element attribute
      //reapply the attribute to the cloned nodes      
      appBuilder.htmlLayout.domManager.traverseNode(coldNode,appBuilder.htmlLayout.domManager.makeNodeCrudzillaAwarePostClone,doc);
            
      //do dnd processing
      doc.processElements($(node).find("*").addBack());
      
      //mutation source
      mutation.node = node;
            
      //update cold DOM
      appBuilder.htmlLayout.reparented(mutation,doc);      
    };    
    
    doc.updateNode = function(node,doc){      
      
      var pair = this.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node)];

      appBuilder.htmlLayout.domManager.traverseNode(pair,function(node){
        delete doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node)];
      });
      
      console.log("deleteNode "+pair.nodeName);
      if(pair.parentNode)
        pair.parentNode.removeChild(pair);      
      
      
      var dropNextToNode = "none";
      if(node.previousSibling)
        dropNextToNode = "right";
      else
      if(node.nextSibling)
        dropNextToNode = "left";
      
      //update this common parent
      var mutation = 
      {
        "node":node,
        "oldParentNode":node.parentNode,
        "newParentNode":node.parentNode,
        "oldPreviousSibling":node.previousSibling,
        "oldNextSibling":node.nextSibling,
        "dropNextToNode":dropNextToNode,
        "newPreviousSibling":node.previousSibling,
        "newNextSibling" :node.nextSibling
      };
      
      //assign data-crudzilla-element
      appBuilder.htmlLayout.domManager.traverseNode(node,appBuilder.htmlLayout.domManager.makeNodeCrudzillaAware,doc);
      
      var coldNode = node.cloneNode(true);
      
      //add all code nodes to array
      appBuilder.htmlLayout.domManager.traverseNode(coldNode,function(node){
                
          if(node.nodeType != 1) return;
        
          var id = appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node);
          doc.crudzillaCloneDOMArray[id] = node;
        
      },doc);
      
      //copy text id to cold nodes
      appBuilder.htmlLayout.domManager.traverseNode(node,function(node){
        
        if(node.nodeType == 1){
          var id = appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node);       
          var coldPair = doc.crudzillaCloneDOMArray[id];
                    
          //loop through children and fix text node ids
          for(var i=0;i<node.childNodes.length;i++){
            if(node.childNodes[i].nodeType == 3){
              
               if(!node.childNodes[i].dataCrudzillaElement)
               		node.childNodes[i].dataCrudzillaElement = "text-"+(doc.textIdCounter++);
              
               coldPair.childNodes[i].dataCrudzillaElement = node.childNodes[i].dataCrudzillaElement;
              
               doc.crudzillaCloneDOMArray[coldPair.childNodes[i].dataCrudzillaElement] = coldPair.childNodes[i];
            }            
          }
        }
      },doc);
                             
      //update cold DOM
      appBuilder.htmlLayout.reparented(mutation,doc);      
    };     
    
    doc.processElements();
    
    if(doc.isPart/* && doc.proxyLinks*/){
	  appBuilder.htmlLayout.proxyLinks(doc.documentElement,doc);
    }
    else
    {
      appBuilder.htmlLayout.unproxyLinks(doc.documentElement,doc);
    }
  },
  proxyLinks:function(element,doc){
    var f = function(){
        if($(this).attr("href") && $(this).attr("href") != "" && 
           $(this).attr("href").indexOf("/crudzilla-http-proxy/all") == -1 ){
          
            var url = "";
            if($(this).attr("href").indexOf("http://") != 0)
            {
              url = $(doc.iframe)[0].contentWindow.location.href;
              if(url[url.length-1] != '/')
                 url = url+'/';

            }
            //$(this).attr("href").indexOf("http:") == 0 || $(this).attr("href").indexOf("http:") == 0
          
        	var proxiedLink = "/crudzilla-http-proxy/all/"+url+$(this).attr("href");
        	$(this).attr("href",proxiedLink);
        }
    };
    
    $(element).find("a").each(f);
    if($(element).is("a"))
         $(element).each(f);
  },
  unproxyLinks:function(element,doc){
    var f = function(){
        if($(this).attr("href") && $(this).attr("href").indexOf("/crudzilla-http-proxy/all") == 0 ){
                     
            var url = $(doc.iframe)[0].contentWindow.location.href;
            if(url[url.length-1] != '/')
               url = url+'/';
               
        	var unproxiedLink = $(this).attr("href").substring("/crudzilla-http-proxy/all/".length);
            if(unproxiedLink.indexOf(url) == 0)
            {
              unproxiedLink = unproxiedLink.substring(url.length);
            
            }          
          
        	$(this).attr("href",unproxiedLink);
        }
    };
    
    $(element).find("a").each(f);
    if($(element).is("a"))
         $(element).each(f);     
  },
  rinseElementNoClone:function(element){
    var rinsedDom = $(element)[0];
    
    $(rinsedDom).removeAttr("data-crudzilla-element")
    .find("*").removeAttr("data-crudzilla-element");
    
    $(rinsedDom).find(this.artifactSelectors.join(",")).remove();
    
    $(rinsedDom).find("[data-crudzilla-element-wrapped='true']").unwrap();
    $(rinsedDom).removeAttr("data-crudzilla-element-wrapped").removeAttr("data-crudzilla-element-wrapper")
    .find("*").removeAttr("data-crudzilla-element-wrapped").removeAttr("data-crudzilla-element-wrapper");
    
    return rinsedDom;
  },
  rinseElement:function(element){
    var rinsedDom = $(element)[0].cloneNode(true);
    
    $(rinsedDom).removeAttr("data-crudzilla-element")
    .find("*").removeAttr("data-crudzilla-element");
    
    $(rinsedDom).find(this.artifactSelectors.join(",")).remove();
    
    $(rinsedDom).find("[data-crudzilla-element-wrapped='true']").unwrap();
    $(rinsedDom).removeAttr("data-crudzilla-element-wrapped").removeAttr("data-crudzilla-element-wrapper")
    .find("*").removeAttr("data-crudzilla-element-wrapped").removeAttr("data-crudzilla-element-wrapper");
    
    return rinsedDom;
  },
  toString:function(dom){
    return this.rinseElement(dom).outerHTML;
  },
  removeDraggable:function(element){
    $(element).removeAttr("draggable")
    //.unbind("dragstart dragenter dragover dragleave drag drop dragend");
  },
  makeDraggable:function(element,doc,getDragOutliner,getDropOutliner){
    var idcter = new Date().getTime();
    
    $(element)//.attr("draggable",'true')
    .bind('dragstart', function(event) {
      event.stopPropagation();
      if(appBuilder.htmlLayout.dragHandle == null) return false;
      
      console.log("dragstart ");
      
      doc.observe = true;
      
      appBuilder.htmlLayout.srcNode = event.target;
      appBuilder.htmlLayout.dropNode = null;
      var dt = event.originalEvent.dataTransfer;
      
      if($(appBuilder.htmlLayout.srcNode)[0].nodeName == "A")//can be used to download
        dt.setData("src", $(appBuilder.htmlLayout.srcNode).attr("href"));
      else
        if($(appBuilder.htmlLayout.srcNode)[0].nodeName == "IMG")//can be used to download
          dt.setData("src", $(appBuilder.htmlLayout.srcNode).attr("src"));            
      
      
      dt.setData("Text", /*appBuilder.htmlLayout.toString(appBuilder.htmlLayout.srcNode)*/"");
      //dt.setDragImage(appBuilder.htmlLayout.generateElementImage($(this)[0]),0,0);
      /*
              html2canvas($(this)[0], {
                  onrendered: function(canvas) {
                      dt.setDragImage(canvas,0,0);
                  }
              });            
              */
            appBuilder.htmlLayout.dragHandle = $(appBuilder.htmlLayout.srcNode).find('.crudzilla-dnd-handle');
            
            return true;
          })
          .bind('dragenter dragover', function(event) {
            
            
            
            
            
            var propagate = true;                          
            
            if(appBuilder.htmlLayout.accepts(appBuilder.htmlLayout.srcNode,this)){
              
              
              $(getDropOutliner)/*.prependTo(getDragOutliner())*/.css(
                {"top":$(this).offset().top,                      
                 "left":$(this).offset().left,
                 "width":$(this).width(),
                 "height":/*$(this).height()*0.1*/16,
                 "display":"block"
                });
              
              if($(this).is("html")){
                appBuilder.htmlLayout.dropNode = $(this).find("body")[0];
              }
              else
              {
                appBuilder.htmlLayout.dropNode = this;
              }
              console.log("droppable "+appBuilder.htmlLayout.dropNode);
              propagate = false;
              
              //appBuilder.htmlLayout.dropNextToNode = null;
            }
            //else
            //sortable
            if(
              
              //appBuilder.htmlLayout.dropNode != null &&
              //!$(this).is(appBuilder.htmlLayout.dropNode) &&
              appBuilder.htmlLayout.shareDroppable($(appBuilder.htmlLayout.srcNode),$(this),$(appBuilder.htmlLayout.dropNode))
            )
            {//because of event bubbling, this would happen before accept test is passed
              
              $(getDragOutliner)/*.prependTo(getDropOutliner())*/.css(
                {"top":$(this).offset().top,
                 "left":$(this).offset().left,
                 "width":$(this).width()/2,
                 "height":/*$(this).height()/2*/32,
                 "display":"block"
                });
              
              
              var x = event.originalEvent.pageX;// - $(this).offset().left;
              var y = event.originalEvent.pageY;// - $(this).offset().top; 
              
              var dropSide = "right";
              //if(event.pageX >= $(this).offset().left && event.pageX<($(this).offset().left+($(this).width()/2)))
              if(x >= $(this).offset().left && x<($(this).offset().left+($(this).width()/2)))
                dropSide = "left";
              //console.log("event.pageX "+x+" "+$(this).offset().left);                
              
              appBuilder.htmlLayout.dropNextToNode = {"element":this,"side":dropSide};
              
              $(getDragOutliner).find(".crudzilla-dnd-cue-left,.crudzilla-dnd-cue-right")
              .css({"height":32,});
              
              if(dropSide == "left"){
                $(getDragOutliner).find(".crudzilla-dnd-cue-left").css({"background-color":"#3465a4"});
                $(getDragOutliner).find(".crudzilla-dnd-cue-right").css({"background-color":"#729fcf"});
                //$(getDragOutliner).prepend($(getDragOutliner).find(".crudzilla-dnd-cue-left").remove());
              }else{
                //$(getDragOutliner).append($(getDragOutliner).find(".crudzilla-dnd-cue-right").remove());
                $(getDragOutliner).find(".crudzilla-dnd-cue-left").css({"background-color":"#729fcf"});
                $(getDragOutliner).find(".crudzilla-dnd-cue-right").css({"background-color":"#3465a4"});              
              }
            }
            else{
              //appBuilder.htmlLayout.dropNextToNode = null;
            }
            
            if(!propagate){
              event.stopPropagation();
              return false;                
            }
            
            return true;
          })
          .bind('dragleave', function(event) {             
            if(event.target == this){
              $(getDropOutliner).css({"display":"none"});
              $(getDragOutliner).css({"display":"none"});
            }
            
            return true;
          })
          .bind('drag', function(event) {             
            // srcNode = this;
          })          // Handle the end of dragging.
          .bind('drop', function(event) {    
            event.preventDefault();
            
            
            $(getDropOutliner).css({"display":"none"}); 
            $(getDragOutliner).css({"display":"none"});
            /*
              if(appBuilder.htmlLayout.accepts(appBuilder.htmlLayout.srcNode,this)){
                
              }
              */
            return false;
          })
          .bind('dragend', function(event) {
            event.stopPropagation();
            
            console.log("dropped ")
            
            $(getDropOutliner).css({"display":"none"});
            
            if(appBuilder.htmlLayout.dropNode !=null){
              appBuilder.htmlLayout.drop(appBuilder.htmlLayout.srcNode,appBuilder.htmlLayout.dropNode,doc);
              appBuilder.htmlLayout.dropNode = null;
              appBuilder.htmlLayout.srcNode  = null;
            }
            
            $(getDropOutliner).css({"display":"none"});
            $(getDragOutliner).css({"display":"none"});            
            appBuilder.htmlLayout.dragHandle = null;
            
            return false;
          }); 
  },
  srcNode : null,
  dropNode: null,
  generateElementImage:function(element){
      var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
    
      var ctx = canvas.getContext("2d");
      var data = "<svg xmlns='http://www.w3.org/2000/svg' width='"+$(element).width()+"' height='"+$(element).height()+"'>" +
                   "<foreignObject width='100%' height='100%'>" +
                     element.outerHTML +
                   "</foreignObject>" +
                 "</svg>";
      
      var DOMURL = self.URL || self.webkitURL || self;
      var img = new Image();
      var svg = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
      var url = DOMURL.createObjectURL(svg);
      img.onload = function() {
          ctx.drawImage(img, 0, 0);
          DOMURL.revokeObjectURL(url);
      };
      img.src = url; 
      return canvas;
  },
  shareDroppable:function(dragElement,dropNextToElement,dropElement){
    
    //console.log("dropNextToElement-"+$(dropNextToElement)[0]+" "+this.accepts(dropNextToElement,dropElement));
    //console.log("dragElement-"+$(dragElement)[0]+" "+this.accepts(dragElement,dropElement));
    
    return (this.accepts(dragElement,dropElement) && this.accepts(dropNextToElement,dropElement))
  },
  acceptedAlongPath:function(dragElement,dropElement){
    var p = dragElement.parentNode;    
    while(p != null){
       if(this.accepts(dragElement,p)) return true;
       p = p.parentNode;
    }
    return false;
  },
  accepts:function(dragElement,dropElement){
    
    var drag_element = dragElement;
    var drop_element = dropElement;
    
    var drag_dndComponent = $(dragElement).data("crudzilla-dnd-component");
    if($(dragElement).is("[data-crudzilla-element-wrapper='true']")){
        drag_element = $(dragElement).find("[data-crudzilla-element-wrapped='true']");
        drag_dndComponent = drag_element.data("crudzilla-dnd-component");
    }
    
    
    var drop_dndComponent = $(dropElement).data("crudzilla-dnd-component");
    if($(dropElement).is("[data-crudzilla-element-wrapper='true']")){
        drop_element = $(dropElement).find("[data-crudzilla-element-wrapped='true']");
        drop_dndComponent = drop_element.data("crudzilla-dnd-component");
    }
    
    if(drag_dndComponent && drop_dndComponent)
    {
      if(drop_dndComponent.accepts){
        for(var i=0; i<drop_dndComponent.accepts.length;i++){
            var acceptable = drop_dndComponent.accepts[i];
            if(!$(drag_element).is("html") && !$(drag_element).is("body") && $(drag_element).is(acceptable.selector))
                return true;        
        }    
      }
    }
    return false;
    
    /**
    var classes = $(dragElement).attr("class");
    if(classes == null || typeof classes == "undefined") return false;
    
    var dragComponent = appBuilder.htmlLayout.getLayoutComponent(dragElement);
    
    if(dragComponent == null) return false;
    
    var dropComponent = appBuilder.htmlLayout.getLayoutComponent(dropElement);
    
    if(dropComponent == null || typeof dropComponent.accepts == "undefined") return false;
    
        
    classes = classes.split(' ');
      
    
    for(var i=0; i<dropComponent.accepts.length;i++){
        var acceptable = dropComponent.accepts[i];
               
        
        for(var j=0;j<classes.length;j++){       
            //console.log(acceptable.selector+" ? "+classes[j])
            
            if(acceptable.selector.indexOf("."+classes[j].trim()) != -1) return true;
        }
    }
     
    return false;
    **/
  },
  getLayoutComponent:function(element){
    
    var dndComponent = $(element).data("crudzilla-dnd-component");
    if($(element).is("[data-crudzilla-element-wrapper='true']")){
      var realElement = $(element).find("[data-crudzilla-element-wrapped='true']");
      return realElement.data("crudzilla-dnd-component");
    }
    return dndComponent;
    
    /*
    for(var i=0;i<appBuilder.htmlDnDFrameworks.length;i++){
      var dndFramework = appBuilder.htmlDnDFrameworks[i];
      for(var j=0;j<dndFramework.length;j++){
        var dndComponent = dndFramework[j];
        
        var dndComponent = $(element).data("data-crudzilla-dnd-component");
        if($(element).is(dndComponent.selector)) return dndComponent;
      }
    }
    return null;
    */
  },
  observers:[],
  observeFrame:function(doc){
    //console.log("starting observer on "+doc.documentElement)
    /*
    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //console.log(mutation.type);
        alert(mutation.type)
      });    
    });
     
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true,subtree:true };
     
    // pass in the target node, as well as the observer options
    observer.observe(ifrm, config); 
    this.observers.push(observer);
    */
    var observer = new MutationSummary({

      callback: function(summaries){
        if(!doc.observe) return;
        
        
        //console.log("change observed ("+summaries.length+")");
        
        var nodes = [];
        for(var i=0;i<summaries.length;i++){
          var summary = summaries[i];
          summary.added.forEach(function(node){
            nodes.push(node);
          });
          
          
          summary.removed.forEach(function(node){
            nodes.push(node);
          }); 
        }
        
        if(nodes.length>0){
          /*
          var curParent = nodes[0].parentNode;
        
          while(curParent != null){
            if(!appBuilder.htmlLayout.containsAll(curParent,nodes))
              curParent = curParent.parentNode;
            else
            {
              doc.updateNode(curParent.parentNode,doc); 
              break;
            }
          }
          */
          doc.updateNode($(doc.documentElement).find("body")[0],doc); 
        }
        
        
        for(var i=0;i<summaries.length;i++){
          appBuilder.htmlLayout.processSummary(summaries[i],doc);
        }
        
		
    	if(doc.updatePair)
        	doc.updatePair();        
      },
      oldPreviousSibling:true,
      rootNode:doc.documentElement,
      queries: [{
        element: '[data-crudzilla-element]'
        
      },{characterData: true}]
    });    
    this.observers.push(observer);
  },
  containsAll:function(parent,nodes){
    for(var i=0;i<nodes.length;i++){
      if(!parent.contains(nodes[i])){        
        return false;
      }
    }return true;
  },
  processSummary:function(summary,doc){   
    
    if(summary.valueChanged && summary.valueChanged.length>0){
      
      summary.valueChanged.forEach(function(node){
         
        if(appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node)){
          var pair  = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node)];
          
          console.log("pair "+pair+" "+appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node));
          if(pair)
            pair.textContent = node.textContent;
        }
        else
        {
          var textParent = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node.parentNode)];
          if(textParent){
            
            var oldData = summary.getOldCharacterData(node);
            
            for(var i=0;i<textParent.childNodes.length;i++){
              
              if(textParent.childNodes[i].nodeType == 3){
                
                if(textParent.childNodes[i].textContent == oldData){//this is a hacky solution, there may be more than one text node with same value, though not likely
                  
                  appBuilder.htmlLayout.domManager
                  .setDataCrudzillaElement(node,textParent.childNodes[i]); 
                  
                  //update text
                  textParent.childNodes[i].textContent = node.textContent;
                  return;
                }
              }
            }              
          }
          else
          {
            console.log("expected textParent not found") ;
          }
        }
      });
    }
  },
  reparented:function(mutation,doc){      
           
      var pair       			 = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(mutation.node)];
      var pairNewParentNode      = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(mutation.newParentNode)];
      var pairOldParentNode      = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(mutation.oldParentNode)];
      
      var pairNewPreviousSibling = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(mutation.newPreviousSibling)];
      var pairNewNextSibling     = doc.crudzillaCloneDOMArray[appBuilder.htmlLayout.domManager.getDataCrudzillaElement(mutation.newNextSibling)];
      
      //remove from old pair parent
      if(pairOldParentNode && pairOldParentNode.contains(pair))
        pairOldParentNode.removeChild(pair);
      
      //if the new parent is invalid, discard this node
      if(typeof pairNewParentNode == "undefined"){
        console.log("pair parent not found");
        return;
      }
      
      //console.log("pairNewNextSibling "+pairNewNextSibling);
      //console.log("pairNewPreviousSibling "+pairNewPreviousSibling.innerHTML);
      //they were inserted before the first node
      if(mutation.dropNextToNode == "left" &&pairNewNextSibling && pairNewNextSibling.parentNode/*pairNewNextSibling && pairOldParentNode.contains(pairNewNextSibling)*/){
        console.log(pair+" insertBefore "+pairNewNextSibling+" parent "+pairNewParentNode);
        $(pair).insertBefore(pairNewNextSibling);
        //pairNewParentNode.insertBefore(pair,pairNewNextSibling);
      }
      else//inserted after this node
      if(mutation.dropNextToNode == "right" &&pairNewPreviousSibling && pairNewPreviousSibling.parentNode/*pairNewPreviousSibling && pairOldParentNode.contains(pairNewPreviousSibling)*/){
          console.log(pair+" insertAfter "+pairNewPreviousSibling+" "+pairNewPreviousSibling.parentNode);
          $(pair).insertAfter(pairNewPreviousSibling);
      }//appended to empty tree
      else
      if(pair)
      {
          console.log("orphaned append "+pair);
          //pairNewParentNode.appendChild(pair);
          $(pairNewParentNode).append(pair);
      }
      doc.updatePair();
  },
  drop:function(dragElement,dropElement,doc){
	
    //this is a hack, the dropNextToNode may not be a valid one
    if(this.dropNextToNode && 
       (
       !$(dropElement)[0].ownerDocument.documentElement.contains($(this.dropNextToNode.element)[0])
       ||
       !$(dropElement)[0].contains($(this.dropNextToNode.element)[0])
       )
      )
      this.dropNextToNode = null;
    
    var dropped = false;
    
    if(this.dropNextToNode)
       console.log("appBuilder.htmlLayout.dropNextToNode "+this.dropNextToNode.side);
    
    var mutation = 
    {
      "node":$(dragElement)[0],
      "oldParentNode":$(dragElement)[0].parentNode,
      "newParentNode":$(dropElement)[0],
      "oldPreviousSibling":$(dragElement)[0].previousSibling,
      "oldNextSibling":$(dragElement)[0].nextSibling,
      "dropNextToNode":this.dropNextToNode?this.dropNextToNode.side:"none",
      "newPreviousSibling": this.dropNextToNode && this.dropNextToNode.side == "right"?this.dropNextToNode.element: null,
      "newNextSibling" : this.dropNextToNode && this.dropNextToNode.side == "left"?this.dropNextToNode.element: null,
      "scriptNode":null
    };
    
    
    //console.log("newNextSibling:"+mutation.newNextSibling);

    if(!$(dropElement)[0].ownerDocument.documentElement.contains($(dragElement)[0])){
      
      var crudzilla = $(dragElement)[0].ownerDocument.crudzilla;
       
      var element = null;
      
      if($(dragElement).attr("data-crudzilla-call-ondrop") && crudzilla){
        
        crudzilla.part.onDrop(doc,$(dragElement),$(dropElement),function(elementToAttach,mode){
          //mode:
           /*if(appBuilder.activeDoc.documentElement.contains(elementToAttach)){
              //already inserted, just crudzillarize it
              mutation.attached = true;
           }
           else
           {//insert into dom
             mutation.attached = false;
           
           	 //elements to be attached as a result of this drop
           	 return this.domManager.newDroppedNode($(elementToAttach)[0],appBuilder.activeDoc,$(dropElement),mutation);
           }*/
        });
      }
      else
      {
        //check attribute data-crudzilla-depends-on and insert dependencies in the order they are listed
        //when processing dependencies, attempt to preserve their DOM order in relation to the dropped element
        
        //console.log("data-crudzilla-depends-on:"+$(dragElement).attr("data-crudzilla-depends-on"));
        
        if($(dragElement).attr("data-crudzilla-depends-on")){
          
            var externalDependencies = [];
            this.domManager.loadDependencies($(dragElement)[0],doc,$(dropElement),mutation,externalDependencies);
          
            if(crudzilla && crudzilla.part.onCheckDependencies)//remove depenecies that have been met
              crudzilla.part.onCheckDependencies(externalDependencies,appBuilder.activeDoc);
          
            console.log("accumulated dependency after "+externalDependencies.length);
            if(externalDependencies.length>0){//install external dependencies first
              $('#crudzilla-dependency-download-dialog')
              .data("external_dependencies",externalDependencies)
              .data("mutation",{
                "dragElement":dragElement,
                "doc":appBuilder.activeDoc,
                "srcDoc":doc,
                "dropElement":dropElement,
                "mutation":mutation
              })
              .data("crudzilla",crudzilla)
              .dialog("open");
            }
            else
            {
              this.domManager.loadDependencies($(dragElement)[0],doc,$(dropElement),mutation);
              
              //invoke callback for post drop processing
              if(crudzilla && crudzilla.part && crudzilla.part.onPostDrop)
                crudzilla.part.onPostDrop(appBuilder.activeDoc,mutation); 
            }
        }
        else
        {
            //just drop a copy of the node dragged
           	this.domManager.newDroppedNode($(dragElement)[0],appBuilder.activeDoc,$(dropElement),mutation);
               
            //invoke callback for post drop processing
            if(crudzilla && crudzilla.part && crudzilla.part.onPostDrop)
              crudzilla.part.onPostDrop(appBuilder.activeDoc,mutation);        
         }
      }
    }
    else            
    if(
      appBuilder.activeDoc &&
      appBuilder.activeDoc.documentElement.contains(dragElement) &&
      appBuilder.activeDoc.documentElement.contains(dropElement) &&
      $(dropElement).attr("data-crudzilla-element") && 
         $(dragElement).attr("data-crudzilla-element")){
      /**
      mutation.newPreviousSibling = this.dropNextToNode && this.dropNextToNode.side == "right"?this.dropNextToNode.element: $(dragElement)[0].previousSibling;
      mutation.newNextSibling     = this.dropNextToNode && this.dropNextToNode.side == "left"?this.dropNextToNode.element: $(dragElement)[0].nextSibling;                
      **/
      
      
      if($(mutation.newPreviousSibling).is(dragElement) ||
         $(mutation.newNextSibling).is(dragElement))
        return;//no move
      
      
      if(this.dropNextToNode && this.dropNextToNode.side == "right")             
        $(dragElement).insertAfter(this.dropNextToNode.element)
      else
      if(this.dropNextToNode && this.dropNextToNode.side == "left")
        $(dragElement).insertBefore(this.dropNextToNode.element)
      else
        $(dropElement).append($(dragElement));
      
      appBuilder.htmlLayout.reparented(mutation,doc);
    }
    else
    {
      console.log("no valid drop:") ;
    }
  },
  domManager:
  {
    makeNodeCrudzillaAware:function (element,doc){
         var nodeType = element.nodeType;
      	 
         if(nodeType != 2){
           //console.log("node type "+element.nodeType+" "+(typeof element.setAttribute != "function"))
           if(typeof element.setAttribute != "function"){
             element.dataCrudzillaElement = "text-"+(doc.textIdCounter++);
             //console.log("text id "+element.dataCrudzillaElement)
           }
           else
           if(element.getAttribute("data-crudzilla-element") == null ||
              element.getAttribute("data-crudzilla-element") == "")//don't override permanent ids
           {
             element.setAttribute("data-crudzilla-element",doc.elementIdCounter++); 
             //console.log("element.getAttribute "+element.getAttribute("data-crudzilla-element"))
           }
         }
         
         //element.setAttribute("data-crudzilla-element",idCounter++);          
    },
    makeNodeCrudzillaAwarePostClone:function(node,doc){
               
      var id = appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node);
            
      if(typeof id != "undefined")
        doc.crudzillaCloneDOMArray[id] = node;
      else
      {
        node.dataCrudzillaElement = "text-"+(doc.textIdCounter++);
        //console.log("safed id "+node.dataCrudzillaElement)
        doc.crudzillaCloneDOMArray[node.dataCrudzillaElement] = node;
        //alert("adding node "+node.nodeType+"/"+id)
      }
    },
    traverseNode:function (node,workerCallback,doc){
      for(var i=0;i<node.childNodes.length;i++){

           var tr = this.traverseNode(node.childNodes[i],workerCallback,doc);
             
           if(typeof tr != "undefined" && tr == false)
              return false;
        
      }
      return workerCallback(node,doc);
    },
    init:function(doc){
        var _this = this;
      
        //save this for second pass post-clone
        var textIdCounter = doc.textIdCounter;
      
        if(doc.crudzillarize)        	
           this.traverseNode(doc.documentElement,_this.makeNodeCrudzillaAware,doc); 
      
        if(doc.coldDoc)
          doc.crudzillaCloneDOM = doc.coldDoc;
        else
          doc.crudzillaCloneDOM = doc.documentElement.cloneNode(true);
      
        
        
        //set text node id
        if(doc.crudzillarize){
          doc.textIdCounter = textIdCounter;
          
          doc.crudzillaCloneDOMArray = [];
          //after clone, the text nodes loose their data-crudzilla-element attribute
          //reapply the attribute to the cloned nodes
          this.traverseNode(doc.crudzillaCloneDOM,_this.makeNodeCrudzillaAwarePostClone,doc); 
        }
	},
    crudzillarize:function(node,doc){
      //assign data-crudzilla-element to each node
      this.traverseNode(node,this.makeNodeCrudzillaAware,doc);
      
      //clone
      var coldNode = node.cloneNode(true);
      
      //add all code nodes to array
      appBuilder.htmlLayout.domManager.traverseNode(coldNode,function(node){
                
          if(node.nodeType != 1) return;
        
          var id = appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node);
          doc.crudzillaCloneDOMArray[id] = node;
        
      },doc);
      
      //copy text id to cold nodes
      appBuilder.htmlLayout.domManager.traverseNode(node,function(node){
        
        if(node.nodeType == 1){
          var id = appBuilder.htmlLayout.domManager.getDataCrudzillaElement(node);       
          var coldPair = doc.crudzillaCloneDOMArray[id];
                    
          //loop through children and fix text node ids
          for(var i=0;i<node.childNodes.length;i++){
            if(node.childNodes[i].nodeType == 3){
               var textNode = node.childNodes[i];
               var pairTextNode = coldPair.childNodes[i];
              
               if(!textNode.dataCrudzillaElement)
               		textNode.dataCrudzillaElement = "text-"+(doc.textIdCounter++);
              
               pairTextNode.dataCrudzillaElement = textNode.dataCrudzillaElement;
              
               doc.crudzillaCloneDOMArray[pairTextNode.dataCrudzillaElement] = pairTextNode;
            }            
          }
        }
      },doc);
      
      return coldNode;
    },
    loadScript:function(dependency){
      var elementId = new Date().getTime();
      if(!$(dependency).attr("src")){
        
        console.log("eval Script");
        
        appBuilder.queuedScript = {};
        appBuilder.queuedScript[elementId] = {};        
        appBuilder.queuedScript[elementId].code = dependency.innerHTML;        
        appBuilder.queuedScript[elementId].window = $(appBuilder.activeDoc.iframe)[0].contentWindow;
        
        //console.log("window:"+appBuilder.queuedScript[$(dependency).attr("data-crudzilla-element")].window);
        //var doc = $(appBuilder.activeDoc.iframe).contents()[0];
        var script = appBuilder.activeDoc.iframe.contentWindow.document.createElement("script");
        script.setAttribute("type", "text/javascript");
        
        var s = ['var w = top.appBuilder.queuedScript["'+elementId+'"].window; '];
        s.push('var c = top.appBuilder.queuedScript["'+elementId+'"].code;');
        s.push('w.eval(c);');
        
        script.textContent = s.join("");
        
        return script;
      }
      else
      {
        console.log("write Script");
        
        appBuilder.queuedScript = {};
        appBuilder.queuedScript[elementId] = {};
        //appBuilder.queuedScript[elementId].code = dependency.outerHTML;
        appBuilder.queuedScript[elementId].window = $(appBuilder.activeDoc.iframe)[0].contentWindow;
        appBuilder.queuedScript[elementId].attributes = $(dependency)[0].attributes;
        
        var code = [];
        //code.push('var w = top.appBuilder.queuedScript["'+elementId+'"].window; ');
        code.push('var arr = top.appBuilder.queuedScript["'+elementId+'"].attributes;');
        code.push('var parentScript = top.appBuilder.queuedScript["'+elementId+'"].parentScript;');
		code.push('var script = document.createElement("script");');
        code.push('script.setAttribute("type", "text/javascript");');
        code.push('for(var i = 0; i < arr.length; i++)');
        code.push('  script.setAttribute(arr[i].name,arr[i].value);');
        code.push('parentScript.parentNode.insertBefore(script,parentScript);');
        appBuilder.queuedScript[elementId].code = code.join('');
        
        
        var script = appBuilder.activeDoc.iframe.contentWindow.document.createElement("script");
        script.setAttribute("type", "text/javascript");
        appBuilder.queuedScript[elementId].parentScript = script;
        
        
        var s = [];
        s.push('var w = top.appBuilder.queuedScript["'+elementId+'"].window; ');
        s.push('var c = top.appBuilder.queuedScript["'+elementId+'"].code;');
        s.push("w.eval(c);");
        
        
        //s.push("w.document.open(); ");
        //s.push("w.document.write(c); ");
        //s.push("w.document.close(); ");
        
        script.textContent = s.join("");
        
        return script;        
      }      
      return null;
    },
    loadDependencies:function(sourceElement,doc,dropElement,mutation,accumulatedExtDependencies){
      
      var dependencies = $(sourceElement).attr("data-crudzilla-depends-on").split(",");
      console.log("loading dependencies "+dependencies.length);
      
      var keyElement = null;
      
      for(var i=0;i<dependencies.length;i++){
        
        if($(appBuilder.activeDoc.documentElement).find(dependencies[i]).length == 0){
                      
        	var dependency = $(doc.documentElement).find(dependencies[i])[0];
         
            if($(dependency).attr("data-crudzilla-depends-on") && !$(dependency).is(sourceElement))
               appBuilder.htmlLayout.domManager.loadDependencies(dependency,doc,dropElement,mutation,accumulatedExtDependencies);
          
            //if dependency exist, skip
            //if($(appBuilder.activeDoc.documentElement).find(dependencies[i]).length>0) continue;
            
            
          
            if(accumulatedExtDependencies){//first pass to collect dependencies
              if($(dependency).attr("data-crudzilla-external-dependency-src")){
                  //add to list of external dependencies that maybe downloaded, 
                  //may itself be a comma seperated list of sources
                  var extDependencies = $(dependency).attr("data-crudzilla-external-dependency-src").split(",");
                  for(var j=0;j<extDependencies.length;j++)
                	accumulatedExtDependencies.push(extDependencies[j]);
                
                  //accumulatedExtDependencies = accumulatedExtDependencies.concat(extDependencies);
                  //console.log("accumulated dependency "+accumulatedExtDependencies.length);
              }
            }
            else
            {//second pass to insert nodes
              //console.log("nodeName:"+dependency.nodeName);
              //clone this node and strip any crudzilla awareness from the cloned node
              //var newNode = appBuilder.htmlLayout.rinseElement($(dependency));
  
              var scriptNode = null;
              //for script node we need to eval so it runs in iframe context
              if(dependency.nodeName == "SCRIPT")  { 
                console.log("script src "+$(dependency).attr("src"));
                //continue;
                scriptNode = this.loadScript(dependency);
              }
              
              //console.log("scriptNode:"+mutation.scriptNode);
              if(dependency.parentNode.nodeName == "HEAD" || dependency.parentNode.nodeName == "head"){
                 //$(appBuilder.activeDoc.documentElement).find("head").append(newNode);  
                
                  var newMutation = 
                  {
                    "node":$(dependency)[0],
                    "oldParentNode":$(dependency)[0].parentNode,
                    "newParentNode":$(appBuilder.activeDoc.documentElement).find("head")[0],
                    "oldPreviousSibling":$(dependency)[0].previousSibling,
                    "oldNextSibling":$(dependency)[0].nextSibling,
                    "dropNextToNode":"none",
                    "newPreviousSibling": null,
                    "newNextSibling" : null,
                    "scriptNode":scriptNode
                  };                
                
                 keyElement = appBuilder.htmlLayout.domManager
                 .newDroppedNode(dependency,appBuilder.activeDoc,newMutation.newParentNode,newMutation);
              }
              else
              {
                  var newMutation = 
                  {
                    "node":$(dependency)[0],
                    "oldParentNode":$(dependency)[0].parentNode,
                    "newParentNode":mutation.newParentNode,
                    "oldPreviousSibling":$(dependency)[0].previousSibling,
                    "oldNextSibling":$(dependency)[0].nextSibling,
                    "dropNextToNode":mutation.dropNextToNode,
                    "newPreviousSibling":mutation.newPreviousSibling,
                    "newNextSibling" : mutation.newNextSibling,
                    "scriptNode":scriptNode
                  };
                
                  
                  if($(sourceElement).is(dependencies[i]))//original drop so use original mutation
                  {
                     keyElement = appBuilder.htmlLayout.domManager
                     .newDroppedNode(dependency,appBuilder.activeDoc,mutation.newParentNode,mutation);                
                  }
                  else
                  {
                     keyElement = appBuilder.htmlLayout.domManager
                     .newDroppedNode(dependency,appBuilder.activeDoc,newMutation.newParentNode,newMutation);                
                  }
              }
            }
        }
      }
      
      return keyElement;
    },
    getActiveDoc:function(){
      return appBuilder.activeDoc;
    },
    onDocMutation:function(mutation,doc){
      var _doc = doc?doc:appBuilder.activeDoc;
      
      if(mutation.type == "added")
      	 appBuilder.htmlLayout.domManager.newDroppedNode(mutation.node,_doc,mutation.newParentNode,mutation,true);
      else
      if(mutation.type == "removed")
        _doc.deleteNode(mutation.node);
      else
      if(mutation.type == "reparented")
        appBuilder.htmlLayout.reparented(mutation,_doc);
    },
    newDroppedNode:function(element,doc,dropTarget,mutation,addedNode){
      
      if($(element).attr("data-crudzilla-element-wrapper")){
       element = $($(element).find("[data-crudzilla-element-wrapped='true']"))[0]; 
      }
      
      
      if(doc.isPart){
        //do dnd processing
        doc.processElements($(element).find("*").addBack());     
        return;
      }
      
            
      //clone this node and strip any crudzilla awareness from the cloned node
      var newNode = addedNode?element:appBuilder.htmlLayout.rinseElement(element);
                  
      //remove crudzilla proxy on links
      appBuilder.htmlLayout.unproxyLinks(newNode,doc);
      
      //save this for second pass post-clone
      var textIdCounter = doc.textIdCounter;
      
      //assign data-crudzilla-element
      this.traverseNode(newNode,this.makeNodeCrudzillaAware,doc);
      
      var coldNode = newNode.cloneNode(true);
      
      //restore 
      doc.textIdCounter = textIdCounter;
      
      //after clone, the text nodes loose their data-crudzilla-element attribute
      //reapply the attribute to the cloned nodes      
      this.traverseNode(coldNode,this.makeNodeCrudzillaAwarePostClone,doc);
      
     // console.log("addedNode "+addedNode+" mutation.dropNextToNode "+mutation.dropNextToNode);
      
      if(!addedNode){//only do this it has already been added
        if(mutation.dropNextToNode == "left"){
          $(mutation.scriptNode?mutation.scriptNode:newNode).insertBefore(mutation.newNextSibling);
        }
        else//inserted after this node
        if(mutation.dropNextToNode == "right"){
          $(mutation.scriptNode?mutation.scriptNode:newNode).insertAfter(mutation.newPreviousSibling);
        }
        else//insert into live document
        {
          $(dropTarget).append(mutation.scriptNode?mutation.scriptNode:newNode);
        }
      }
            
      //mutation source
      mutation.node = newNode;      
            
      //update cold DOM
      appBuilder.htmlLayout.reparented(mutation,doc);
            
      //do dnd processing
      doc.processElements($(newNode).find("*").addBack());      
      
      return newNode;
    },
    getDataCrudzillaElement:function(node){
      
      if(node == null) return;
      
      if(typeof node.getAttribute != "function"){        
        return node.dataCrudzillaElement;
      }
      else
      {             
        return node.getAttribute("data-crudzilla-element"); 
      }
    },
	setDataCrudzillaElement:function(node,from){
      
      if(node == null || from == null) return;
      
      if(typeof from.getAttribute != "function"){        
        node.dataCrudzillaElement = from.dataCrudzillaElement;
      }
      else
      {             
        node.setAttribute("data-crudzilla-element",from.getAttribute("data-crudzilla-element")); 
      }      
    }
  },
  resizeHandlers:[],
  createPartControlPanel:function(id,panel,partPath,doc){
      $.ajax({
        type:'POST',
        url:'/sc/appbuilder/ui-templates/part-control-panel-view.html',
        success:function(data){                    
          
          $(panel).append(appBuilder.parseTemplate(data,{"id":id})); 
          
          
          $("#crudzilla-part-install-panel-"+id)
          .css({
            "display":"block",
            "padding":"5px",
            "background-color":"#3465a4"
          });
          var h = $(panel).height()-$("#crudzilla-part-install-panel-"+id).height();
          $(doc.iframe).attr("height",h-10);
          
          
          $("#navback-crudzilla-part-btn-"+id).button({
            text: true,
            icons: {
				primary: "ui-icon-circle-arrow-w"
			}
          })
          .css({"float":"left"}).
          click(function(){
          	$(doc.iframe)[0].contentWindow.history.back(); 
          });          
          

          $("#install-crudzilla-part-btn-"+id).button({
            text: true,
            icons: {
				primary: "ui-icon-circle-arrow-s"
			}
          })
          .css({"float":"right"})          
          .click(function(event){
            //install part
            event.stopPropagation(); 
            
            var appList = [];
            for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
              appList.push('<li><a onclick="return false" href="#">'+appBuilder.common_core.registeredApps[i].name+'</a></li>');
            }
            
            try{
              $('#crudzilla-app-menu').menu("destroy");
            }catch(e){}
            
            $('#crudzilla-app-menu').html(appList.join('')).css({"width":256});
            $('#crudzilla-app-menu').menu({
              select:function(event,ui){
                var action = $(ui.item).find('a').html();
                
                $(this).menu("destroy");
                $(this).hide();
                
                for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
                  if(appBuilder.common_core.registeredApps[i].name == action){
                    
                    $.blockUI();
                    $.ajax({
                      type:'GET',
                      data:{
                        "appPath":appBuilder.common_core.registeredApps[i].baseDir,
                        "partPath":partPath
                      },
                      url:"/parts/install.ste",
                      success:function(data){
                        $.unblockUI();
                      }
                    });
                    return;
                  }
                }                              
              },
              blur:function(){
                $(this).menu("destroy");
                $(this).hide();
              }
            });      
            
            appBuilder.popUpMenus.push($('#crudzilla-app-menu'));
            $('#crudzilla-app-menu').show().position({
              my: "left top",
              at: "left bottom+12",
              of: this
            });
            
          });
          
        }
      });
  },
  layout:function(dtnode,editor,ui){
      var _this = this;
      
      var relPath   = appBuilder.runtime_resources.getPath(dtnode);
      //var appConfig = appBuilder.common_core.findApp(relPath);
      //relPath 	    = relPath.substring(appConfig.baseDir.length);              
      
      var height = $(ui.panel.panel).height();
      var defaultOrientation = true;
      var sizeRatio			 = 0.5;
      var margin			 = 2;
      var rmargin			 = 2;
      var designerView       = true;
    
      var webViewPane = null;
      var resizer = $("<div class=\"ui-widget-header crudzilla-dnd-pane-resizer-off\" style=\"border-left-width:0px;border-right-width:0px\"></div>")
      if(defaultOrientation)
        resizer.prependTo($(ui.panel.panel));
      else
        resizer.appendTo($(ui.panel.panel));
    
      var toolbarContext 	 = null;
      editor.editor.setSize(null,(height*sizeRatio)-margin);
      
      var codePath = "/crud-proxy"+relPath+"?ts="+(new Date().getTime());              
      
      function handleToolbar(doc){
        
        var lineCounter = 0;
        //activate layout toolbar
        toolbarContext = {
          showViewPortResizerInit:false,
          pushDownDraggables:function(){
            $(doc.iframe).contents().find(".crudzilla-dnd-outliner").after("<br class=\"crudzilla-dnd-linebreak crudzilla-dnd-linebreak-"+(lineCounter++)+"\"/>");
          },
          pushUpDraggables:function(){
            $(doc.iframe).contents().find(".crudzilla-dnd-linebreak-"+(--lineCounter)).remove();
          },
          showViewPortResizer:function(){
            
            
            if(!this.showViewPortResizerInit)//only attach it once
            {
              var btn = appBuilder.editor_toolbar.getToolbarButton("layout-editor","showViewPortResizer");
              
              var content = $(btn).qtip("api").get('content.text');               
              $(content).append(doc.viewPortResizer);
              $(doc.viewPortResizer).css({"display":"block"});
              this.showViewPortResizerInit = true;
            }
            else
            {
              $(doc.viewPortResizer).css({"display":"block"});
            }
          },
          toggleView:function(){
                        
            
            if(defaultOrientation){
              resizer.prependTo($(ui.panel.panel));
              
              
              $(editor.container).prependTo($(ui.panel.panel));
              resizer.css({/*"left":$(editor.container).offset().left,*/"top":$(doc.iframe).offset().top});
            }
            else
            {
              resizer.appendTo($(ui.panel.panel));
              
              
              $(editor.container).appendTo($(ui.panel.panel));
              resizer.css({/*"left":$(editor.container).offset().left,*/"top":$(editor.container).offset().top});
            }
            
            defaultOrientation = !defaultOrientation;
          },
          enableEditable:function(){
            if($(doc.documentElement).attr("contenteditable")){
              $(doc.documentElement).removeAttr("contenteditable");
              doc.observe = false;
            }
            else{
              $(doc.documentElement).attr("contenteditable","true");
              doc.observe = true;
            }
          },
          refreshPage:function(){
             codePath = "/crud-proxy"+relPath+"?ts="+(new Date().getTime());   
             $("#html-layout-view-iframe-"+dtnode.data.id).attr("sandbox","allow-same-origin");
             $("#html-layout-view-iframe-"+dtnode.data.id).attr("src",codePath);                        
          },
          toggleDesignerView:function(){
            if(designerView){
              $(doc.iframe).contents().find(".crudzilla-dnd-outliner").css({"display":"none"});
              designerView = false;
            }
            else
            {
              $(doc.iframe).contents().find(".crudzilla-dnd-outliner").css({"display":"block"});
              designerView = true;
            }
          }
        };
        
        appBuilder.editor_toolbar
        .activateContextualToolbar("layout-editor",toolbarContext);
        
  		//appBuilder.editor_toolbar.getToolbarButton("context-free-toolbar","showAddressBar")      
        
        
        //register for activate callback
        $("#"+ui.panel.tabid).data("activateCB",function(){
          appBuilder.editor_toolbar
          .activateContextualToolbar("layout-editor",toolbarContext);
        });
        
        var resizeDelta = 0;
       
        
        //create resizer
        resizer
        //./*appendTo*/insertAfter($(ui.panel.panel).find("div:first"))        
        .css({"position":"absolute",
              "z-index":10,
              "width":$(ui.panel.panel).width()})
        .draggable({
          "axis":"y",
          "containment":ui.panel.panel,
          "iframeFix": true,
          drag:function(event,ui){

            console.log("position "+ui.position.top);
            console.log("offset "+ui.offset.top);
            console.log("offsetx "+$(resizer).offset().top);
            
            sizeRatio = (($(resizer).offset().top-72)/height);
            
            console.log("sizeRatio:"+sizeRatio);
            
            if(defaultOrientation){
              
			  $("#html-layout-view-iframe-"+dtnode.data.id).attr("height",(height*(sizeRatio))); 
              editor.editor.setSize(null,(height*(1-sizeRatio))-margin);
            }
            else
            {
              editor.editor.setSize(null,(height*(sizeRatio)));
			  $("#html-layout-view-iframe-"+dtnode.data.id).attr("height",(height*(1-sizeRatio))-margin);
            }
          },
          start:function(event,ui){
            ///$(this).css({"position":"absolute","z-index":1000});
            //$(this).addClass("crudzilla-dnd-pane-resizer-on");
          },
          stop:function(event,ui){
            //$(this).removeClass("crudzilla-dnd-pane-resizer-on");
            //$(this).css({"position":"relative","z-index":1000});
          }
        });
      }
      
    
      _this.resizeHandlers[ui.panel.tabid] = function(){
    	$(resizer).width($(ui.panel.panel).width());
      };
      
      $.ajax({
        type:'POST',
        url:'/sc/appbuilder/ui-templates/html-layout-tab-view.html',
        success:function(data){
          
          if(defaultOrientation)
            $(ui.panel.panel).prepend(appBuilder.parseTemplate(data,{"id":dtnode.data.id,"path":codePath}));
          else
            $(ui.panel.panel).append(appBuilder.parseTemplate(data,{"id":dtnode.data.id,"path":codePath}));
          //$(panel).css({"height":$(ui.panel.panel).height()*0.5});
          
          webViewPane = $("#html-layout-view-iframe-"+dtnode.data.id).parent().parent();
          //$(webViewPane).css({"overflow":"hidden"});
          $("#html-layout-view-iframe-"+dtnode.data.id).parent().css({"overflow":"hidden"});
          
          $("#html-layout-view-iframe-"+dtnode.data.id)
          .attr("width","100%")
          //.attr("scrolling","no")
          .attr("sandbox","allow-same-origin")
          .attr("height",height*sizeRatio); 
                   
          var doc      = null;
          var cleanDoc = null;
          var idBase   = new Date().getTime();
          
          $("#html-layout-view-iframe-"+dtnode.data.id).load(function(){
            var $this = $(this);
            
            var url = $this[0].contentWindow.location.href;
            var startSym = url.indexOf("?")==-1?"?":"&";
            
            if(url.indexOf("/crud-proxy/") == -1) return;
            
            url = url.substring(url.indexOf("/crud-proxy/"));
            
            //var htmlElementd = $(this).contents().find("html")[0];
            //console.log("pre crudzillarize:"+htmlElementd.outerHTML);

            console.log("href:"+url);
            
            if($(this).attr("sandbox")){
              
                var htmlElement = $(this).contents().find("html")[0];
                //console.log("pre crudzillarize inside:"+htmlElement.outerHTML);
              
                doc = {
                  "crudzillaCloneDOMArray":[],
                  "iframe":this,
                  "documentElement":htmlElement,
                  "elementIdCounter":idBase,
                  "textIdCounter":idBase,
                  "crudzillarize":true,
                  "isReload":false,
                  "observe":false,
                  "ui":ui,
                  "relPath":url.substring("/crud-proxy".length)
                };
                //make crudzilla aware
                //appBuilder.htmlLayout.domManager.init(doc);
                doc.crudzillaCloneDOM = appBuilder.htmlLayout.domManager.crudzillarize(htmlElement,doc);
                      
                 $.ajax({
                   type:'POST',
                   data:{html:doc.crudzillaCloneDOM.outerHTML},
                   url:"/html-layout/cache-html.ste",
                  success:function(data){
                	  $($this).removeAttr("sandbox");
              
                      var newUrl = url+startSym+"ts="+(new Date().getTime())+"&crudzilla-html-layout-request=true&baseId="+idBase;   
                      console.log("loading unboxed page:"+newUrl);
                      $($this).attr("src",newUrl);                    
                    
                 }});
            }
            else
            if(url.indexOf("crudzilla-html-layout-request") == -1){              
              
                var newUrl = url+startSym+"ts="+(new Date().getTime());
                console.log("loading sandboxed page:"+newUrl);              
                
                $("#html-layout-view-iframe-"+dtnode.data.id)              
                .attr("sandbox","allow-same-origin")
                .attr("src",newUrl);                
            }
            else
            {
                  console.log("done loading page");
              
                  var htmlElement = $(this).contents().find("html")[0];
                  doc.documentElement = htmlElement;
                  //console.log(htmlElement.outerHTML)
                  
                  //$(htmlElement).css({"width":"3000px"}).find("body").css({"width":"3000px"});
              
                  //make the dom crudzilla aware by adding data-crudzilla-element attribute
                  //appBuilder.htmlLayout.domManager.init(doc);
                  
                  //reconsile cloned dom with clean dom that was previously obtained
                  
                  //create handler that would be notified by mutation observer
                  doc.updatePair = function(){
                    if(editor.editor)
                      editor.editor.setValue(appBuilder.htmlLayout.toString(doc.crudzillaCloneDOM));
                  };
                  editor.editor.setValue(appBuilder.htmlLayout.toString(doc.crudzillaCloneDOM));
              
                  //start a mutation observer
                  appBuilder.htmlLayout.observeFrame(doc); 
                  
                  //enable drag-n-drop
                  appBuilder.htmlLayout.loadDoc(doc);
                  
                  appBuilder.activeDoc = doc;
              
                  //setup contextual toolbar
              	  if(!doc.isReload){
                     handleToolbar(doc);
                     $(ui.panel.panel).data("onClose").push(
                       function(){
                         //notify any callbacks about document closing
                         appBuilder.UIPart._notifyAllOnDocClose(doc);
                         
                         appBuilder.editor_toolbar.deactivateContextualToolbar("layout-editor");
                         delete _this.resizeHandlers[ui.panel.tabid];
                         
                         $(doc.viewPortResizer).remove();
                       }
                     );
                    
                     $(ui.panel.panel).data("onDeactivate").push(
                       function(){
                         appBuilder.UIPart._notifyAllOnDocTabDeactivate(doc);
                         
                         appBuilder.editor_toolbar.deactivateContextualToolbar("layout-editor",true);
                         
                         $(doc.viewPortResizer).css({"display":"none"});                         
              		     //var btn = appBuilder.editor_toolbar.getToolbarButton("layout-editor","showViewPortResizer");
              			 //$(btn).qtip("api").set("content.text",'');
                       }
                     );
                    
                     $(ui.panel.panel).data("onActivate").push(
                       function(){
                         
                         appBuilder.activeDoc = doc;
                         appBuilder.UIPart._notifyAllOnDocTabActivate(doc);
                         
                         appBuilder.editor_toolbar.activateContextualToolbar("layout-editor");
                         //$(doc.viewPortResizer).css({"display":"block"});
                       }
                     );
                    
                     
              	  }
              
                  doc.isReload = true;
                  //notify any callbacks about document opening
                  appBuilder.UIPart._notifyAllOnDocOpen(doc);    
              
                  //console.log("createBrowserViewPort")
                  appBuilder.htmlLayout.createBrowserViewPort(webViewPane);
              	  doc.viewPortResizer = $(doc.iframe).parent().parent().find(".crudzilla-dnd-viewport-viewports");
             }
           });
          
        }});              
  },
  defaultStoreFrameUrl:"crudzilla-http-proxy/crudzilla-part-store/",
  openLayoutPartTab:function(url){
    
    if(url && appBuilder.htmlLayout.currentStoreFrame)
      	$(appBuilder.htmlLayout.currentStoreFrame).attr("src",url);
    else
    if(appBuilder.htmlLayout.currentStoreFrame)
        $(appBuilder.htmlLayout.currentStoreFrame).attr("src",appBuilder.htmlLayout.defaultStoreFrameUrl);
    else
    if(url)
    	appBuilder.htmlLayout.currentStoreFrameUrl = url;
    else
        appBuilder.htmlLayout.currentStoreFrameUrl = null;
    
    appBuilder.queuedAction.push('snippet');
    appBuilder.createTab('snippet','<img src="img/nav/document-properties.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold;color:#729fcf">Parts</span>',$('#nav-tabs')); 
  },
  createPartTabView:function(ui,event,tabctrl){
    
    var _this = this;                
    ui.panel.tabid = 'snippet';
    
   
    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
    $("#html-layout-snippet-tab").append(ui.panel.panel).css({"overflow":"hidden"});
    
    var height = $(ui.panel.panel).parent().parent().parent().height();
    
    $(ui.panel.panel).css({"height":height,"background-color":"white","overflow":"hidden"});
    
    var designerView = true;
    var webViewPane = null
    var id = new Date().getTime();
    var path =   appBuilder.htmlLayout.currentStoreFrameUrl?
        		 appBuilder.htmlLayout.currentStoreFrameUrl:
    			 "crudzilla-http-proxy/crudzilla-part-store/";
    $.ajax({
      type:'POST',
      url:'/sc/appbuilder/ui-templates/html-layout-component-tab-view.html',
      success:function(data){                                          
        
        var panel = ui.panel.panel;                      
        $(panel).data("onClose",[]).data("onDeactivate",[]).data("onActivate",[]);
        $(panel).html(appBuilder.parseTemplate(data,{"id":id,"path":path}));                    
        
        //$(panel).css({"height":$(panel).parent().parent().height(),"background-color":"white"});
        
        webViewPane = $("#html-layout-component-view-iframe-"+id).parent().parent();
        
        $("#html-layout-component-view-iframe-"+id)
        .attr("width","100%")
        .attr("height",height);
        
        $("#html-layout-component-view-iframe-"+id).load(function(){
          var $this = $(this);
          
          appBuilder.htmlLayout.currentStoreFrame = $this;
          $(ui.panel.panel).data("onClose").push(
            function(){
              appBuilder.editor_toolbar.deactivateContextualToolbar("part-layout-editor");
              appBuilder.htmlLayout.currentStoreFrame    = null;
              appBuilder.htmlLayout.currentStoreFrameUrl = null;
              
              if(doc)
              $(doc.viewPortResizer).remove();
            }
          );          
          
          //restore hieght
          $this.attr("height",height);
          
          
          $("#crudzilla-part-install-panel-"+id).remove();
          
          var url = $this[0].contentWindow.location.href;
          appBuilder.editor_toolbar.deactivateContextualToolbar("part-layout-editor");
          
          var setViewPortbtn = appBuilder.editor_toolbar.getToolbarButton("part-layout-editor","showViewPortResizer");

          //if this is the part store home page
          if(url.indexOf("/crudzilla-http-proxy/crudzilla-part-store/") != -1 &&
             url.indexOf("/crudzilla-http-proxy/crudzilla-part-store/parts/") == -1) {
            $(setViewPortbtn).css({"display":"none"})
            		return;
          }
          
          $(setViewPortbtn).css({"display":"inline"});
          
          var htmlElement =  $(this).contents().find("html")[0];
                    
          var doc =                               
          {
            "iframe":this,
            "documentElement":htmlElement,
            "isPart":true
          };                        
          
          appBuilder.htmlLayout.loadDoc(doc);   
          
          var crudzilla = $(htmlElement)[0].ownerDocument.crudzilla;
          if(crudzilla && crudzilla.part)
          	crudzilla.part.doc = doc;

          
          var lineCounter = 0;
          //activate layout toolbar
          appBuilder.editor_toolbar.activateContextualToolbar("part-layout-editor",{
              showViewPortResizerInit:false,
              pushDownDraggables:function(){                
                $(doc.iframe).contents().find(".crudzilla-dnd-outliner").after("<br class=\"crudzilla-dnd-linebreak crudzilla-dnd-linebreak-"+(lineCounter++)+"\"/>");
              },
              pushUpDraggables:function(){
                $(doc.iframe).contents().find(".crudzilla-dnd-linebreak-"+(--lineCounter)).remove();
              },
              showViewPortResizer:function(){
                //var btn = appBuilder.editor_toolbar.getToolbarButton("part-layout-editor","showViewPortResizer");
                //$(btn).qtip("api").set("content.text",doc.viewPortResizer);
                
                if(!this.showViewPortResizerInit)//only attach it once
                {
                  var btn = appBuilder.editor_toolbar.getToolbarButton("part-layout-editor","showViewPortResizer");
                  
                  var content = $(btn).qtip("api").get('content.text');               
                  $(content).empty().append(doc.viewPortResizer);
                  $(doc.viewPortResizer).css({"display":"block"});
                  this.showViewPortResizerInit = true;
                }
                else
                {
                  $(doc.viewPortResizer).css({"display":"block"});
                }                
              },
          	  toggleDesignerView:function(){
                if(designerView){
                  $(doc.iframe).contents().find(".crudzilla-dnd-outliner").css({"display":"none"});
                  designerView = false;
                }
                else
                {
                  $(doc.iframe).contents().find(".crudzilla-dnd-outliner").css({"display":"block"});
                  designerView = true;
                }
          	 }
          });
          
          $(ui.panel.panel).data("onDeactivate").push(
            function(){
              appBuilder.editor_toolbar.deactivateContextualToolbar("part-layout-editor",true);
              $(doc.viewPortResizer).css({"display":"none"});
            }
          );
          $(ui.panel.panel).data("onActivate").push(
            function(){
              appBuilder.editor_toolbar.activateContextualToolbar("part-layout-editor");
            }
          );
          
          //show control panel for this part
          if(url.indexOf("/crudzilla-http-proxy/crudzilla-part-store/parts/") != -1){
            var partPath = url.substring(url.indexOf("/crudzilla-http-proxy/crudzilla-part-store/parts/")+("/crudzilla-http-proxy/crudzilla-part-store/parts").length);
            appBuilder.htmlLayout.createPartControlPanel(id,panel,partPath,doc);  
          }
          
          if(appBuilder.htmlLayout.onPostPartLoad){
             for(var k in appBuilder.htmlLayout.onPostPartLoad)
               appBuilder.htmlLayout.onPostPartLoad[k](doc);
          }
          
          appBuilder.htmlLayout.createBrowserViewPort(webViewPane);
          doc.viewPortResizer = $(doc.iframe).parent().parent().find(".crudzilla-dnd-viewport-viewports");        
        });                      
      }
    });               
  }
};
