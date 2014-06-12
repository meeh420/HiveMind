// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var appBuilder = {
        context_path:"",
        currentNode:null,
        body_height:$("body").height(),            
        registeredEditors:[],
        registeredViewSavers:[],
        APP_COMPONENT_LOAD_COUNT:5,  
        _appComponentReadyCount:0,
        editor_toolbar:null,
        popUpMenus:[],
        openTab:function(dtnode,src_component,tabctrl){
          appBuilder.currentNode = dtnode;
          
          if(dtnode.data.type == 'datasource'){
            appBuilder.createTab('datasource-'+dtnode.data.id,dtnode.data.title,tabctrl);
          }
          else
            if(dtnode.data.type == 'datatable'){
              appBuilder.createTab('datatable-'+dtnode.data.id,dtnode.data.title,tabctrl);
            } 
            else
              if(dtnode.data.type == 'datamodel'){
                appBuilder.createTab('datamodel-'+dtnode.data.id,dtnode.data.title,tabctrl);
              }             
              else
                if(dtnode.data.type == 'datastatement'){
                  appBuilder.createTab('datastatement-'+dtnode.data.id,dtnode.data.title,tabctrl);
                }       
                else
                  if(dtnode.data.type == 'connector'){
                    appBuilder.createTab('connector-'+dtnode.data.id,dtnode.data.title,tabctrl);
                  }
                  else
                    if(dtnode.data.type == 'apptaxonomy'){
                      appBuilder.createTab('apptaxonomy-'+dtnode.data.id,dtnode.data.title,tabctrl);
                    }
                    else
                      if(dtnode.data.type == 'appresource'){                    
                        appBuilder.currentNode = dtnode;
                        appBuilder.appresource_tab_type = "edit";
                        appBuilder.createTab('appresource-edit-'+dtnode.data.id,this.getTabTitle(dtnode),tabctrl,src_component);
                      }            
                      else
                        if(dtnode.data.type == 'usermanagement'){
                          appBuilder.createTab('usermanagement',dtnode.data.title,tabctrl);
                        }            
                        else
                          if(dtnode.data.type == 'scriptexecutor'){
                            appBuilder.createTab('scriptexecutor-'+dtnode.data.id,dtnode.data.title,tabctrl);
                          }
                          else
                            if(dtnode.data.type == 'fileuploader'){
                              appBuilder.createTab('fileuploader-'+dtnode.data.id,dtnode.data.title,tabctrl);
                            }
                            else
                              if(dtnode.data.type == 'instantiator'){
                                appBuilder.createTab('instantiator-'+dtnode.data.id,dtnode.data.title,tabctrl);
                              }            
                              else
                                if(dtnode.data.type == 'emailsender'){
                                  appBuilder.createTab('emailsender-'+dtnode.data.id,dtnode.data.title,tabctrl);
                                }
        },
        getTabTitle:function(dtnode){
          if(this.endsWith(dtnode.data.title,".htm") || this.endsWith(dtnode.data.title,".html"))
            return '<img src="img/mime/text-html.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold;color:#729fcf">'+dtnode.data.title+'</span>';
          
          return dtnode.data.title;
        },
        domPreserve:[],
        tabCallback:[],
        onApplicationEditorTabClose:function(tabid){
          for(i=0;i<appBuilder.open_tabs.length;i++){
            var tab1 = appBuilder.open_tabs[i];
            if(tabid == tab1.tabid){                                    
              appBuilder.open_tabs.splice(i,1);
              break;
            }
          }
          
          
          for(i=0;i<appBuilder.registeredEditors.length;i++){
            if(appBuilder.registeredEditors[i].tabid == tabid){ 
              appBuilder.registeredEditors.splice(i,1);--i;
            }
          }
          
          for(i=0;i<appBuilder.tabCallback.length;i++){
            if(appBuilder.tabCallback[i].tabid == tabid){ 
              appBuilder.tabCallback.splice(i,1);--i;
            }
          } 
         
        },
        getTabbedEditor:function(tabid){
          for(var i=0;i<appBuilder.registeredEditors.length;i++){
            
            if(appBuilder.registeredEditors[i].tabid == tabid) 
              return appBuilder.registeredEditors[i];
            
          }return null;
        },
        afterCloseCallBacks:[],
        beforeCloseCallBacks:[],
        htmlDroppableComponents:null,
        htmlEditableComponents:null,
        htmlBootstrapDroppableComponents:null,
        bindTabCloseEvent:function(tab,beforeClose,tabctrl){ 
          
          if(typeof beforeClose != "undefined"){
            $("#"+tab.tabid).data("beforeClose",beforeClose); 
            appBuilder.beforeCloseCallBacks[tab.tabid] = beforeClose;
          }               
          
          
          $("#"+tab.tabid).data("afterClose",function(){
            
            
            //preserve global dom element on this tab
            for(var i=0;i<appBuilder.domPreserve.length;i++){
              $('body').append($(appBuilder.domPreserve[i]).css({"display":"none"}));
            }
            
            //var index = $( "li", $('#tabs') ).index( $( this ).parent() );
            //$('#tabs').tabs( "remove", index );
            (tabctrl?tabctrl:$('#tabs')).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
            
            appBuilder.onApplicationEditorTabClose(tab.tabid);                          
            //alert("#"+tab.tabid+'-content')
            
            $("#"+tab.tabid+'-content').remove();
          }); 
          appBuilder.afterCloseCallBacks[tab.tabid] = $("#"+tab.tabid).data("afterClose");         
        },
        createNavigationTreeControl:function(id,url){
          var config = appBuilder.getNavigationTreeControlTemplate(id);
          
          $("#"+id).dynatree({
            imagePath: "./",
            rootVisible:false,
            minExpandLevel:2,
            //initAjax: {url: url},
            children:appBuilder.treeControlInitializationNodes[id].nodes,
            onActivate: config.onActivate,
            onDeactivate:config.onDeactivate,
            onRender:config.onRender,
            onClick: config.onClick,
            onKeydown:config.onKeydown,
            onExpand:config.onExpand,
            onPostInit:config.onPostInit,
            onLazyRead:config.onLazyRead,
            dnd:typeof appBuilder.treeControlInitializationNodes[id].getDnd == "function"?appBuilder.treeControlInitializationNodes[id].getDnd():config.dnd
          }).find('ul').css({"overflow":"visible","overflow-x":"visible","overflow-y":"visible","border-style":"none"});                
        },
        getNavigationTreeControlTemplate:function(id){
          var tmp =
              {
                persist:true,
                cookieId:id,
                onActivate: function(dtnode) {
                  
                  appBuilder.openTab(dtnode);
                }, 
                onDeactivate: function(dtnode) {
                  
                },
                onRender:function(dtnode,el){
                  //log('render:'+$(el).attr('class')+' type:'+dtnode.data.type)
                  //appBuilder.doContextMenuBinding(dtnode.data.type,el.getElementsByTagName('a')[0])
                },
                onClick: function(dtnode, event) {
                  // Eat keyboard events, while a menu is open
                  //if( $(".contextMenu:visible").length > 0 )
                  //  return false;                      
                  //if(dtnode.isActive())
                  if(dtnode.getEventTargetType(event) == "title")
                    appBuilder.openTab(dtnode);
                },
                onKeydown: function(dtnode, event) {
                  // Eat keyboard events, when a menu is open
                  if( $(".contextMenu:visible").length > 0 )
                    return false;
                  
                },
                onExpand:function(status,dtnode){
                  //appBuilder.bindAllContextMenus();
                  
                },
                onPostInit:function(isReloading, isError){
                  // Add context menu handler to tree nodes
                  //var treeControl = $("#app-treecontrol").dynatree('getTree');
                  if(id == "app-treecontrol"){
                    setTimeout(function(){
                      $("#app-treecontrol").dynatree('getTree').getNodeByKey("0").expand();
                    },0);
                  }
                },
                onLazyRead:function(node){
                  
                  
                  if(node.data.type == 'datasource-root'){                            
                    appBuilder.datasource.loadNode(node);
                    return;
                  }
                  else
                    if(node.data.type == 'datatable-root'){                            
                      appBuilder.datatable.loadNode(node);
                      return;
                    }
                    else
                      if(node.data.type == 'datamodel-root'){                            
                        appBuilder.datamodel.loadNode(node);
                        return;
                      }
                      else
                        if(node.data.type == 'datastatement-root'){                            
                          appBuilder.datastatement.loadNode(node);
                          return;
                        }
                        else
                          if(node.data.type == 'connector-root'){                            
                            appBuilder.connector.loadNode(node);
                            return;
                          }
                          else
                            if(node.data.type == 'scriptexecutor-root'){                            
                              appBuilder.scriptexecutor.loadNode(node);
                              return;
                            }
                            else
                              if(node.data.type == 'fileuploader-root'){                            
                                appBuilder.fileuploader.loadNode(node);
                                return;
                              }       
                              else
                                if(node.data.type == 'emailsender-root'){                            
                                  appBuilder.emailsender.loadNode(node);
                                  return;
                                }                    
                                else
                                  if(node.data.type == 'environment-root'){                            
                                    appBuilder.sysadmin.environment.loadNode(node);
                                    return;
                                  }
                                  else
                                    if(node.data.type == 'apptaxonomy-root'){                            
                                      appBuilder.sysadmin.apptaxonomy.loadNode(node);
                                      return;
                                    }
                                    else
                                      if(node.data.type == 'apptaxonomy-category'){                            
                                        appBuilder.sysadmin.apptaxonomy.loadCategoryNode(node);
                                        return;
                                      }
                                      else
                                        if(node.data.type == 'work-category'){                            
                                          appBuilder.sysadmin.apptaxonomy.loadCategoryNode(node);
                                          return;
                                        }                    
                                        else
                                          if(node.data.type == 'apptaxonomy-category-root'){                            
                                            appBuilder.sysadmin.apptaxonomy.loadCategoryRootNode(node);
                                            return;
                                          }
                                          else
                                            if(node.data.type == 'appresource-dir' || node.data.type == 'appresource-root'){  
                                              
                                              /**appBuilder.app.resource.loadDirectoryNode(node);**/
                                              appBuilder.runtime_resources.loadDirectoryNode(node);
                                              return;
                                            }
                  var data = null;
                  var url  = null;
                  node.appendAjax({url:url,
                                   data: data,
                                   // (Optional) use JSONP to allow cross-site-requests
                                   // (must be supported by the server):
                                   //                         dataType: "jsonp",
                                   success: function(node) {
                                     
                                     // Called after nodes have been created and the waiting icon was removed.
                                     // 'this' is the options for this Ajax request
                                   },
                                   error: function(node, XMLHttpRequest, textStatus, errorThrown) {
                                     
                                     // Called on error, after error icon was created.
                                   },
                                   cache: false // Append random '_' argument to url to prevent caching.
                                  });
                },
                dnd:
                {
                  onDragStart: function(node) {
                    
                    if(
                      node.data.type == 'appresource-dir' ||
                      node.data.type == 'appresource' || 
                      node.data.type == 'datastatement' || 
                      node.data.type == 'fileuploader' || 
                      node.data.type == 'emailsender' || 
                      node.data.type == 'connector' || 
                      node.data.type == 'instantiator' || 
                      node.data.type == 'scriptexecutor'){
                      $('.dynatree-drag-helper').css({"z-index":10000});
                      return true;
                    }
                    else
                      return false;
                    //log('draging...')
                    
                    
                    return true;
                  },
                  onDragStop: function(node) {
                    // This function is optional.
                    //logMsg("tree.onDragStop(%o)", node);
                  },
                  autoExpandMS: 1000,
                  preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                  onDragEnter: function(node, sourceNode) {
                    
                    
                    
                    if(node.data.type == 'appresource-dir'){
                      
                      if(sourceNode.data.type == 'appresource-dir' || 
                         sourceNode.data.type == 'appresource'   ||                          
                         sourceNode.data.type == 'datastatement' || 
                         sourceNode.data.type == 'fileuploader' || 
                         sourceNode.data.type == 'emailsender' || 
                         sourceNode.data.type == 'connector' || 
                         sourceNode.data.type == 'instantiator' || 
                         sourceNode.data.type == 'scriptexecutor')
                      {                                      
                        return ['over'];
                      }
                    }
                    return false;
                  },
                  onDragOver: function(node, sourceNode, hitMode) {
                  },
                  onDrop: function(node, sourceNode, hitMode, ui, draggable) {
                    
                    if(sourceNode.data.type == 'appresource' || 
                       sourceNode.data.type == 'appresource-dir' ||
                       sourceNode.data.type == 'datastatement' || 
                       sourceNode.data.type == 'fileuploader' || 
                       sourceNode.data.type == 'emailsender' || 
                       sourceNode.data.type == 'connector' || 
                       sourceNode.data.type == 'instantiator' || 
                       sourceNode.data.type == 'scriptexecutor'                              
                      ){
                      
                      if(hitMode == "before" || hitMode == "after"){
                        appBuilder.runtime_resources.moveResource(sourceNode,node.parent,function(){
                          sourceNode.move(node, hitMode);
                          // expand the drop target
                          node.expand(true); 
                        });
                      }
                      else
                      {
                        appBuilder.runtime_resources.moveResource(sourceNode,node,function(){                             
                          sourceNode.move(node, hitMode);
                          // expand the drop target
                          node.expand(true);                                   
                        });
                      }
                      
                    }else{
                      sourceNode.move(node, hitMode);
                      // expand the drop target
                      node.expand(true);                              
                    }
                  },
                  onDragLeave: function(node, sourceNode) {
                  }
                }                
              };
          return tmp;
        },
        showAppDirNav:function(){
          $('#app-directory-navigator-dialog').dialog('open');
        },
        createTab:function(tabid,title,acttabctrl,src_component){
          
          var tabctrl = typeof acttabctrl == "undefined"?$('#tabs'):acttabctrl;
          
          for(var i=0;i<appBuilder.open_tabs.length;i++){
            var tab = appBuilder.open_tabs[i];
            //alert(tab.tabid+"/"+tabid)
            if(tab.tabid == tabid){
              appBuilder.queuedAction.pop();
              tabctrl.tabs("option","active",$('a[href$="'+tabid+'"]').parent().index());
              return;
            }
          }
          
          //set a custom tab template
          //$('#tabs').tabs("option","tabTemplate","<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' id='remove-"+tabid+"'>Remove Tab</span></li>");
          //$("#tabs").tabs( 'add' ,'#'+tabid , title).tabs('length');
          
          
          var index = appBuilder.common_core.addTab(tabctrl,tabid,title);
          
          $("#"+tabid).data("tabid",tabid);
          appBuilder.onAddTab({panel:$("#"+tabid),index:index-1},tabctrl,src_component);
          
          tabctrl.tabs("option","active",index-1);
        },
        open_tabs:[],
        queuedAction:[],
        loadHtmlLayoutFrameworks:function(){
          //load dnd frameworks for html layout
          $.ajax({
            type:'POST',
            url:'/html-layout/frameworks/frameworks.ins',
            dataType:"json",
            success:function(data){
              appBuilder.htmlDnDFrameworks = data;
              appBuilder.htmlBootstrapDroppableComponents = data;
            }
          });
          
          
          //load droppables for html layout
          $.ajax({
            type:'POST',
            url:'/html-layout/editable/list.ins',
            dataType:"json",
            success:function(data){
              appBuilder.htmlEditableComponents = data;
            }
          });
        },
  		buildUITabs:function(){
          var _this = this;
          
          function activateTab(event,ui,curTab,homeTab,homeTabId){
            
            ui.panel = ui.newPanel;
            ui.panel.tabid = $(ui.panel).data("tabid");
            
            if(appBuilder[curTab]){
              $("#"+$(appBuilder[curTab]).data("tabid")+"-content").css("display","none");
              
              //call deactivate callbacks
              var onDeactivate = $( "#" + $(appBuilder[curTab]).data("tabid")+"-content" ).data("onDeactivate");
              
              if(onDeactivate){
                
                for(var cb=0;cb<onDeactivate.length;cb++){                         
                  onDeactivate[cb]();
                }
              }
              
              if($(appBuilder[curTab]).data("editor"))
              	appBuilder.editor_toolbar.removeEditor($(appBuilder[curTab]).data("editor"));
            }                        
            if(typeof ui.panel.VerticalScroll != "undefined"){
              //$(appBuilder.appLayout.center).scrollTop(ui.panel.VerticalScroll);
              //$(appBuilder.appLayout.center).scrollLeft(ui.panel.HorizontalScroll);
            }
            homeTab.css("display","none");
            if(appBuilder[curTab] && typeof appBuilder[curTab].panel != "undefined")
              appBuilder[curTab].panel.css("display","none");
            
            
            
            if($(ui.panel).attr("id") == /*"home-tab"*/homeTabId){
              homeTab.css("display","block");
            }
            else
            {
              $("#"+$(ui.newPanel).attr("id")+"-content").css("display","block");
            }
            
            appBuilder[curTab] = ui.panel;
            
            if($("#"+ui.panel.tabid).data("editor")){
                appBuilder.editor_toolbar.setEditor($("#"+ui.panel.tabid).data("editor"));
            }
            else
            {
              //appBuilder.editor_toolbar.setEditor(null);
            }
            //call activate callback
            if($("#"+ui.panel.tabid).data("activateCB"))
              $("#"+ui.panel.tabid).data("activateCB")();
            
            //call activate callbacks
            var onActivate = $( "#" + ui.panel.tabid+"-content" ).data("onActivate");
            
            if(onActivate){
              
              for(var cb=0;cb<onActivate.length;cb++){                         
                onActivate[cb]();
              }
            }            
          }
          
          
          
          $('#nav-tabs').tabs({
            
            create: function( event, ui ) {
          
            },
            activate:function(event, ui){   
              activateTab(event,ui,"currentNavTab",$("#app-home-tab-content"),'app-home-tab');
            }
          }).css({"padding":"0"}).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all").css({"border-top":"0","border-right":"0"});  
                    

          
          
          var $tabs = $('#tabs').tabs({
            create: function( event, ui ) {
            
            },
            activate:function(event, ui){
              activateTab(event,ui,"currentTab",$("#home-content-tab"),'home-tab');                      
            }})/*.scrollabletab()*/.css({"padding":"0","margin":"0"});
          /*DON'T CHAIN, need to initialize $tabs first*/
          $tabs.removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all").css({"border-width":"0","border-top":"0","border-left":"0"});
          //$tabs.find("ul li").removeClass("ui-corner-all");

          
          //var h = ($('#footer').position().top - $('#nav-tabs').position().top)-($('#nav-tabs').height()+5);
          //var h = ($(window).height() - $('#layout-left-content').position().top)-12;
          
          //alert("("+$(window).height()+","+$('#layout-left-content').position().top+")")
          //$('#layout-left-content,#layout-right-content').css({"height":h+'px'});
          //$('#splitter').css({"height":(h+33)+'px'});
          
          
          
          appBuilder.common_core.tabCloseBinding($('#tabs'),function(tabid){

            if(appBuilder.afterCloseCallBacks[tabid])
            {
              appBuilder.afterCloseCallBacks[tabid]();
              delete appBuilder.afterCloseCallBacks[tabid];
            }
          });

          appBuilder.common_core.tabCloseBinding($('#nav-tabs'),function(tabid){

            if(appBuilder.afterCloseCallBacks[tabid])
            {
              appBuilder.afterCloseCallBacks[tabid]();
              delete appBuilder.afterCloseCallBacks[tabid];
            }
          });              

          $("#app-home-tab-content").css({"height":$("#app-home-tab-content").parent().parent().height()})
    
  		},
  		buildToolbar:function(){
          var _this = this;
          
          var uiOptions = 
          { 
            path : 'sc/appbuilder/js/codemirror-ui/js/',
            imagePath: 'sc/appbuilder/js/codemirror-ui/images/silk', 
            searchMode : 'inline',
            buttons: ['save', 
                      'undo', 
                      'redo',
                      'search', 
                      'jump', 
                      'reindentSelection', 
                      'reindent',
                      'expandAll',
                      'collapseAll'],
            saveCallback:function(){                           
              appBuilder.saveAll();
            }
          };
          this.editor_toolbar = new CodeMirrorUI(document.getElementById('main-toolbar-holder'),uiOptions);
          $(this.editor_toolbar.appendContextualToolbar(
            {
              name:"layout-editor",
              buttons:["pushDownDraggables","pushUpDraggables","showViewPortResizer","toggleDesignerView","toggleView","enableEditable","refreshPage"],
              buttonObjects:{},
              buttonDefs:
              {
                'pushDownDraggables': ["Stretch Layout", "pushDownDraggables", "img/silk/shape_move_forwards.png"],
                'pushUpDraggables': ["Squeeze Layout", "pushUpDraggables", "img/silk/shape_move_backwards.png"],
                'showViewPortResizer': ["Set Viewport", "showViewPortResizer", "img/silk/shape_handles.png"],
                'toggleDesignerView': ["Toggle Design Annotation", "toggleDesignerView", "img/fugue-icons-3.5.6/icons/document-view-thumbnail.png"],
                'toggleView': ["Flip View", "toggleView", "img/silk/application_split.png"],
                'enableEditable': ["Enable Editable", "enableEditable", "img/silk/textfield_rename.png"],
                'refreshPage': ["Reload", "refreshPage", "img/silk/arrow_refresh.png"]
              },
              pushDownDraggables:function(){
                if(this.actionImplementation && this.actionImplementation.pushDownDraggables)
                  this.actionImplementation.pushDownDraggables(this);
              },
              pushUpDraggables:function(){
                if(this.actionImplementation && this.actionImplementation.pushUpDraggables)
                  this.actionImplementation.pushUpDraggables(this);
              },
              showViewPortResizer:function(){
                if(this.actionImplementation && this.actionImplementation.showViewPortResizer)
                  this.actionImplementation.showViewPortResizer(this);                
              },
              toggleView:function(){
                if(this.actionImplementation && this.actionImplementation.toggleView)
                  this.actionImplementation.toggleView(this);
              },
              enableEditable:function(){
                if(this.actionImplementation && this.actionImplementation.enableEditable)
                  this.actionImplementation.enableEditable(this);
              },
              refreshPage:function(){
                if(this.actionImplementation && this.actionImplementation.refreshPage)
                  this.actionImplementation.refreshPage(this);
              },
              toggleDesignerView:function(){
                if(this.actionImplementation && this.actionImplementation.toggleDesignerView)
                  this.actionImplementation.toggleDesignerView(this);                
              }
            }
          )).css({"width":"100%","float":"right"});
          $(appBuilder.editor_toolbar.getToolbarButton("layout-editor","showViewPortResizer"))
          .qtip({
            content: $("<div></div>"),
            position: {
              my: 'top right', // Use the corner...
              at: 'bottom center' // ...and opposite corner
            },
            show: {
              event: 'click', // Don't specify a show event...
              ready: false // ... but show the tooltip when ready
            },
            hide: "unfocus", // Don't specify a hide event either!
            style: {
              classes: 'qtip-shadow qtip-bootstrap crudzilla-dnd-viewport-resizer-tooltip',
              width:512
            },
            events: {
                show: function(event, api) {
                   //loadBookmarks();
                },
                hide:function(event,api){
                  //api.set('content.text','');
                }
            }      
          });              
          
          $(this.editor_toolbar.appendContextualToolbar(
            {
              name:"part-layout-editor",
              pane:".toolbar-left-3",
              buttons:["pushDownDraggables","pushUpDraggables","showViewPortResizer","toggleDesignerView"],
              buttonObjects:{},
              buttonDefs:
              {
                'pushDownDraggables': ["Stretch Layout", "pushDownDraggables", "img/silk/shape_move_forwards.png"],
                'pushUpDraggables': ["Squeeze Layout", "pushUpDraggables", "img/silk/shape_move_backwards.png"],
                'showViewPortResizer': ["Set Viewport", "showViewPortResizer", "img/silk/shape_handles.png"],
                'toggleDesignerView': ["Toggle Designer View", "toggleDesignerView", "img/fugue-icons-3.5.6/icons/document-view-thumbnail.png"],
                'toggleView': ["Flip View", "toggleView", "img/fugue-icons-3.5.6/icons/application-split-vertical.png"],
                'enableEditable': ["Editable", "enableEditable", "img/fugue-icons-3.5.6/icons/document--pencil.png"]                
              },
              pushDownDraggables:function(){
                if(this.actionImplementation && this.actionImplementation.pushDownDraggables)
                  this.actionImplementation.pushDownDraggables(this);
              },
              pushUpDraggables:function(){
                if(this.actionImplementation && this.actionImplementation.pushUpDraggables)
                  this.actionImplementation.pushUpDraggables(this);
              },
              showViewPortResizer:function(){
                if(this.actionImplementation && this.actionImplementation.showViewPortResizer)
                  this.actionImplementation.showViewPortResizer(this);                
              },
              toggleView:function(){
                if(this.actionImplementation && this.actionImplementation.toggleView)
                  this.actionImplementation.toggleView(this);
              },
              enableEditable:function(){
                if(this.actionImplementation && this.actionImplementation.enableEditable)
                  this.actionImplementation.enableEditable(this);
              },
              toggleDesignerView:function(){
                if(this.actionImplementation && this.actionImplementation.toggleDesignerView)
                  this.actionImplementation.toggleDesignerView(this);                
              }
            }
          )).css({"width":"100%","float":"right"});          
          $(appBuilder.editor_toolbar.getToolbarButton("part-layout-editor","showViewPortResizer"))
          .qtip({
            content:$("<div></div>"),
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
              classes: 'qtip-shadow qtip-bootstrap crudzilla-dnd-viewport-resizer-tooltip',
              width:512
            },
            events: {
                show: function(event, api) {
                   //loadBookmarks();
                },
                hide:function(event,api){
                  //api.set('content.text','');
                }
            }      
          });              
                    
          $(this.editor_toolbar.appendToolbar(
            {
              name:"context-free-toolbar",
              pane:".toolbar-left-2",
              buttons:["showPartStore","showAddressBar"],
              buttonObjects:{},
              buttonDefs:
              {
                'showPartStore': ["UI Parts from Crudzilla Part Store", "showPartStore", "img/fugue-icons-3.5.6/icons/gear.png"],
                'showAddressBar': ["UI Parts from web", "showAddressBar", "img/fugue-icons-3.5.6/icons/globe--arrow.png"]
              },
              showPartStore:function(){
                //if(this.actionImplementation && this.actionImplementation.pushDownDraggables)
                //  this.actionImplementation.pushDownDraggables();
                appBuilder.htmlLayout.openLayoutPartTab();
              },
              showAddressBar:function(){
                //if(this.actionImplementation && this.actionImplementation.showAddressBar)
                //  this.actionImplementation.showAddressBar(this);
              }
            }
          )).css({"width":"100%"/*,"float":"right"*/,"margin-left":"50px"});              
              
          //$("#text-search-tab").html('<iframe id="search-view-iframe" width="-10000px" height="-10000px" src="lucene/find.ste" frameborder="no"/>')
          //appBuilder.runtime_resources.searchFrame = $("#search-view-iframe");
          
          var userSettingsMenu = $('#crudzilla-user-settings-menu').menu({
            select:function(event,ui){
              var action = $(ui.item).find('a').html();
              if(action == "Log-out"){
                $.blockUI();
                $.ajax({
                  type:'GET',
                  url:"user-identity/logout.ste",
                  success:function(data){
                    $.unblockUI();
                    location.reload(true);
                  }
                });                         
              }
              else
              if(action == "Run Backup"){
                appBuilder.runtime_resources.runBackupResource();
              }
              else
              if(action == "OSGi Console"){
                appBuilder.openOSGiTab();
              }      
              else
              if(action == "Manage Users"){
                appBuilder.usermanagement.open();
              }                         
              else
              if(action == "Options"){
                 appBuilder.showPreferenceViewTab();
              }                        
              else
              if(action == "Generate Preemptive Schema Table"){
                 appBuilder.datatable.showDataTableGenTab(null);
              }
            }
          });
  		},
        jqInit:function(initCallback){
          var _this = this;
                   
          this.buildToolbar();
          
          
          $( document).on( "click", function() {
            //userSettingsMenu.hide();
            for(var i=0;i<appBuilder.popUpMenus.length;i++)
              appBuilder.popUpMenus[i].hide();
            
            appBuilder.popUpMenus = [];
          });              
          
          //$.blockUI.defaults.applyPlatformOpacityRules = false;
          //$.blockUI({css:{},overlayCSS: {backgroundColor: '#666666',opacity:.98},theme:true,message: '<h1><img src="../../img/busy.gif" />Loading ,please wait...</h1>'});
          
          this.body_height=$("body").height();
          this.setUpContextMenuBindings();
          //$(window).bind("beforeunload",function(){
          //    $('.ui-icon-close').click();
          //});
          
          this.loadHtmlLayoutFrameworks();

          var width  = window.innerWidth  || document.body.offsetWidth  || document.documentElement.offsetWidth;
          var height = window.innerHeight || document.body.offsetHeight || document.documentElement.offsetHeight;                    
          
          //$().dndPageScroll();
          
          
          var fixHeight = function(){
             var h = ($(window).height() - $('#layout-left-content').position().top)-12;
             //alert("("+$(window).height()+","+$('#layout-left-content').position().top+")")
          	 $('#layout-left-content,#layout-right-content').css({"height":h+'px'});                        
          }
          
          setTimeout(function(){
          fixHeight();
          
          //build major tab controls for both navigation and content
		  _this.buildUITabs();
          
            setTimeout(function(){
          appBuilder.loadTreeControlInitNodes();
          appBuilder.createNavigationTreeControl("app-treecontrol");                   
          appBuilder.createNavigationTreeControl("app-directory-navigator-treecontrol");
            },0);
            
          $('#app-directory-navigator-dialog').dialog({
            autoOpen: false,
            width: 350,
            height:"450",
            open:function(){
              
            },
            buttons:
            {
              "Ok":function(){
                appBuilder.appDirNavActionHandler();
                $(this).dialog("close");
              },
              "Cancel":function(){
                $(this).dialog("close");
              }
            }
          });                 
          
          //check for application updates
          appBuilder.checkForProductUpdates();                   

		  
          //load component
          appBuilder.common_core.init();
          appBuilder.datatable.init();

          appBuilder.datastatement.init();                
          appBuilder.connector.init();
          appBuilder.emailsender.init();                
          appBuilder.scriptexecutor.init();
          appBuilder.fileuploader.init(); 
          appBuilder.instantiator.init(); 
          appBuilder.sysadmin.apptaxonomy.init(); 

          appBuilder.runtime_resources.init(); 
          appBuilder.crud_test.init(); 
          appBuilder.todoList.init();

          appBuilder.htmlLayout.init();

          _this.scrollableTabs("main-tab-pane");
          if(typeof initCallback == "function")
            initCallback();

          },1000);
        },
  		menuAction:null,
	    onAddTab:function(ui,$tabs,src_component){
			   var event = {};
	       	   //ui.panel = ui.newPanel;
               $tabs.removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");

               $(ui.panel).css({"margin":"0","padding":0});
               
		
               ui.panel.dtnode = appBuilder.currentNode;
          	   
               appBuilder.open_tabs.push(ui.panel);
               
               /*$tabs.tabs("option","tabTemplate","<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>");*/
                
                             	
               
               if(appBuilder.queuedAction.length>0)
                {
                  	var action = appBuilder.queuedAction.pop();
                    appBuilder.queuedAction = [];
                    
                  	//if(ui.panel.dtnode)
                    //alert(ui.panel.dtnode.data.type)
                  
                    if(action == 'show-text-search'){
                        appBuilder.runtime_resources.createSearchTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }/*
                    else 
                    if(action == 'layout-html'){
                        appBuilder.runtime_resources.createHtmlLayoutTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }*/
                    else 
                    if(action == 'osgi-console'){
                        appBuilder.createOSGiTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }                  
                    else 
                    if(action == 'snippet'){
                        appBuilder.htmlLayout.createPartTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }    
                    else 
                    if(action == 'usermanagement'){
                        appBuilder.usermanagement.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }                  
                    else 
                    if(action == 'crudbase'){
                        appBuilder.runtime_resources.createCrudbaseTabView(ui,event,$tabs);
                        appBuilder.bindTabCloseEvent(ui.panel,$tabs);
                    }          
                    else                       
                    if(action == 'show-log'){
                        appBuilder.crud_test.createLogTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel,appBuilder.crud_test.onCloseLogTabView);
                    }
                    else
                    if(action == 'datatable-column-generator'){
                        appBuilder.datatable.createColumnGeneratorTabView(ui,event);
                        
                    }
                    else
                    if(action == 'datatable-generator'){
                        appBuilder.datatable.createDataTableGeneratorTabView(ui,event);
                        
                    }
                    else
                    if(action == 'datamodel-creation-tab'){
                        appBuilder.datatable.createDataModelTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }
                    else
                    if(action == 'preference-tab'){
                        appBuilder.createPreferenceTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                    }                   
                }
                else
                if(ui.panel.dtnode.data.type == 'appresource' || appBuilder.appresource_tab_type == "run"){
                        
                        
                        if(appBuilder.appresource_tab_type == "run"){
                            appBuilder.appresource_tab_type = "";
                            appBuilder.crud_test.createTabView(ui,event);                            
                        }
                        else
                        {
                              
                              if(ui.panel.dtnode.data.mime == 'stm')
                                  appBuilder.datastatement.createTabView(ui,event,ui.panel.dtnode);
                              else
                              if(ui.panel.dtnode.data.mime == 'ste')
                                  appBuilder.scriptexecutor.createTabView(ui,event,ui.panel.dtnode);
                              else
                              if(ui.panel.dtnode.data.mime == 'svc')
                                  appBuilder.connector.createTabView(ui,event,ui.panel.dtnode);
                              else
                              if(ui.panel.dtnode.data.mime == 'upl')
                                  appBuilder.fileuploader.createTabView(ui,event,ui.panel.dtnode);
                              else
                              if(ui.panel.dtnode.data.mime == 'ins')
                                  appBuilder.instantiator.createTabView(ui,event,ui.panel.dtnode);
                              else                                    
                              if(ui.panel.dtnode.data.mime == 'esd')
                                  appBuilder.emailsender.createTabView(ui,event,ui.panel.dtnode); 
                              else
                                appBuilder.runtime_resources.createTabView(ui,event,src_component,$tabs);
                        }
                        
                        appBuilder.bindTabCloseEvent(ui.panel);
                }   
                else
                if(ui.panel.dtnode.data.type == "datatable"){
                        appBuilder.datatable.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }                  
                else
                if(ui.panel.dtnode.data.type == "datastatement"){
                        appBuilder.datastatement.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }                  
                else
                if(ui.panel.dtnode.data.type == "connector"){
                        appBuilder.connector.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }
                else
                if(ui.panel.dtnode.data.type == "scriptexecutor"){
                        appBuilder.scriptexecutor.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }
                else
                if(ui.panel.dtnode.data.type == "fileuploader"){
                        appBuilder.fileuploader.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }
                else
                if(ui.panel.dtnode.data.type == "instantiator"){
                        appBuilder.instantiator.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }                        
                else
                if(ui.panel.dtnode.data.type == "emailsender"){
                        appBuilder.emailsender.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }
                else
                if(ui.panel.dtnode.data.type == "apptaxonomy" || ui.panel.dtnode.data.type == "apptaxonomy-category"){
                        appBuilder.sysadmin.apptaxonomy.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                }
                else
                if(ui.panel.dtnode.data.type == "appresource-root"){
                        appBuilder.runtime_resources.createAppTreeControlTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);
                } 
                else
                if(ui.panel.dtnode.data.type == "apptaxonomy-root"){
                        if(appBuilder.taxonomyAction == "clone")
                            appBuilder.runtime_resources.createWorkTreeControlTabView(ui,event);
                        else
                        if(appBuilder.taxonomyAction == "search")
                            appBuilder.sysadmin.apptaxonomy.createCrudSearchTabView(ui,event);
                    
                        appBuilder.bindTabCloseEvent(ui.panel);
                }                
                else
                if(ui.panel.dtnode.data.type == "usermanagement"){
                        appBuilder.usermanagement.createTabView(ui,event);
                        appBuilder.bindTabCloseEvent(ui.panel);                        
                }
              
                
				//$(ui.panel).data("tabid",ui.panel.tabid);
                if(typeof ui.panel.panel != "undefined")
                    $(ui.panel).data("panel",ui.panel.panel);
	    },
        removetab :function(tabselector, index) {
          $(".removetab").click(function(){
            $(tabselector).tabs('remove',index);
          });
        },
        replaceAll:function (txt, replace, with_this) {
              return txt.replace(new RegExp(replace, 'g'),with_this);
            },
        // --- Implement Cut/Copy/Paste --------------------------------------------
        clipboardNode : null,
        pasteMode : null,        
        copyPaste:function (action, dtnode) {
          switch( action ) {
            case "cut":
            case "copy":
              appBuilder.clipboardNode = dtnode;
              appBuilder.pasteMode = action;
              break;
            case "paste":
              if( !appBuilder.clipboardNode ) {
                alert("Clipoard is empty.");
                break;
              }
              if( appBuilder.pasteMode == "cut" ) {
                // Cut mode: check for recursion and remove source
                var isRecursive = false;
                var cb = appBuilder.clipboardNode.toDict(true, function(dict){
                  // If one of the source nodes is the target, we must not move
                  if( dict.key == dtnode.data.key )
                    isRecursive = true;
                });
                if( isRecursive ) {
                  alert("Cannot move a node to a sub node.");
                  return;
                }
                dtnode.append(cb);
                appBuilder.clipboardNode.remove();
              } else {
                // Copy mode: prevent duplicate keys:
                cb = appBuilder.clipboardNode.toDict(true, function(dict){
                  dict.title = "Copy of " + dict.title;
                  delete dict.key; // Remove key, so a new one will be created
                });
                dtnode.append(cb);
              }
              appBuilder.clipboardNode = pasteMode = null;
              break;
            default:
              alert("Unhandled clipboard action '" + action + "'");
          }
        },
        saveAll:function(){
          appBuilder.saveRegisteredEditorContent(true);
        },
        endsWith:function(str, suffix) {
          return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        getFileNameSansMimeType:function(name,mime){
          if(mime == 'html' && this.endsWith(name,".html")){
            return name.substring(0,name.lastIndexOf(".html"));
          }
          if(mime == "htm" && this.endsWith(name,".htm")){
            return name.substring(0,name.lastIndexOf(".htm"));
          }
          if(mime == "js" && this.endsWith(name,".js")){
            return name.substring(0,name.lastIndexOf(".js"));
          }
          if(mime == "xml" && this.endsWith(name,".xml")){
            return name.substring(0,name.lastIndexOf(".xml"));
          }
          if(mime == "txt" && this.endsWith(name,".txt")){
            return name.substring(0,name.lastIndexOf(".txt"));
          }
          if(mime == "css" && this.endsWith(name,".css")){
            return name.substring(0,name.lastIndexOf(".css"));
          }
          return name;
        },         
        getCheckStatus:function(e){
          
          if(e.prop("checked"))
            return "yes";
          else
            return "no";
        },
        setCheckStatus:function(e,status){
          if(status == "yes")
            e.prop("checked",true);
          else
          {
            $(e).removeAttr("checked");
            e.prop("checked",false);
          }
        },
        saveRegisteredEditorContent:function(fromClick){
          
          var invoke = function(registeredEditor){
            if(fromClick)
              $.blockUI();
            
            if(typeof registeredEditor.url != "undefined"){
              registeredEditor.params[registeredEditor.params.content_param] = registeredEditor.editor.getValue();
              $.ajax({
                type:'POST',
                data:registeredEditor.params,
                url:registeredEditor.url,
                success:function(data){
                  $.unblockUI();
                  registeredEditor.editor.contentModified = false;                                
                  if(typeof registeredEditor.onSave != "undefined")
                    registeredEditor.onSave();
                }
              });     
            }
            else
            {                           
              if(typeof registeredEditor.onSave != "undefined"){
                registeredEditor.onSave(function(){
                  $.unblockUI();
                  registeredEditor.editor.contentModified = false;
                });
              }
            }
          }
          
          
          for(var i=0;i<appBuilder.registeredEditors.length;i++){
            var registeredEditor = appBuilder.registeredEditors[i];
            
            /*--if(registeredEditor.editor.contentModified)*/
            invoke(registeredEditor);
          }
        },
        setRegisteredEditorContent:function(editor,content){
          editor.setValue(content);
          editor.clearHistory();
          //editor.removeLine(0);
        },              
        isExecutableType:function(t){
          return (t == 'stm' || t == 'ste' || t == 'esd' || t == 'upl' || t == 'svc' || t == 'ins');
        },
        setUpContextMenuBindings:function(){
          var _this = this;
          appBuilder.contextMenuBindings=
            {
            "crud-treenode":{
              selector:".emailsender-treenode,.instantiator-treenode,.fileuploader-treenode,.scriptexecutor-treenode,.connector-treenode,.datastatement-treenode",
              build:function($trigger,e){
                var m = {
                  items:
                  {
                    "open_in_browser":
                    {
                      name:"Open In Browser",
                      icon:"file-action-openbrowser",
                      exec:function(dtnode){
                        appBuilder.crud_test.openInBrowser(dtnode);
                      },
                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                    },                     
                    "clone":
                    {
                      name:"Clone",
                      exec:function(dtnode){$('#'+dtnode.data.type+'-dialog').data("dtnode",dtnode).data("rename",false).data("clone",true).dialog("open");},
                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                    },     
                    "bake":
                    {
                      name:"Bake",
                      exec:function(dtnode){appBuilder.common_core.autoGenerateCrud(dtnode);},
                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                    },                                      
                    "rename":
                    {
                      name:"Rename",
                      exec:function(dtnode){$('#'+dtnode.data.type+'-dialog').data("dtnode",dtnode).data("rename",true).dialog("open")},
                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                    }/*,
                                                  "copy":
                                                      {
                                                          icon:"copy-file",
                                                          name:"Copy",
                                                          exec:function(dtnode){ appBuilder.copiedNode = dtnode;appBuilder.isCut = false;},
                                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                      }*/
                                                ,
                                                "cut":
                                                {
                                                  icon:"cut-file",
                                                  name:"Cut",
                                                  exec:function(dtnode){ appBuilder.copiedNode = dtnode; appBuilder.isCut = true;},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "delete":
                                                {
                                                  name:"Delete",
                                                  exec:appBuilder.emailsender.deleteEmailSender,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "unlink": 
                                                {
                                                  name:"Unlink",
                                                  exec:appBuilder.sysadmin.apptaxonomy.unlinkItem,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },     
                                                "test":
                                                {
                                                  name:"Test",
                                                  exec:appBuilder.runtime_resources.runResource,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "refresh":
                                                {
                                                  name:"Refresh",
                                                  exec:appBuilder.runtime_resources.refreshResource,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "backup":
                                                {
                                                  name:"Backup",
                                                  exec:appBuilder.runtime_resources.backupResource,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "resource_to_source":
                                                {
                                                  name:"To Source",
                                                  exec:function(dtnode){$( "#crud-to-source-dialog-confirm" ).data("dtnode",dtnode).dialog("open");},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "edit_datamodel":
                                                {
                                                  name:"Edit DataModel",
                                                  icon:"datamodel-edit",
                                                  exec:appBuilder.datatable.editDataModel,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                }
                                              }
                                          };
                                        
                                        var dtnode = $.ui.dynatree.getNode($trigger);
                                        if(dtnode.parent.data.type == 'apptaxonomy-category'){
                                          
                                          delete m.items["backup"];
                                          delete m.items["resource_to_source"];
                                          delete m.items["refresh"];
                                          delete m.items["cut"];
                                          
                                        }
                                        else
                                        {
                                          delete m.items["unlink"]; 
                                        }
                                        
                                        if(dtnode.data.title != "datamodel.ins")
                                          delete m.items["edit_datamodel"];
                                        
                                        return m;
                                      }
                                  },
                                "apptaxonomy-root-treenode":{
                                  selector:".apptaxonomy-root-treenode",
                                  items:
                                  {
                                    "new":
                                    {
                                      name:"New",
                                      exec:function(dtnode){$('#sysadmin-apptaxonomy-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                    },
                                    "search":
                                    {
                                      name:"Search cruds",
                                      exec:function(dtnode){appBuilder.taxonomyAction="search";   appBuilder.currentNode=dtnode;appBuilder.createTab('definition-search','crud Search')},
                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                    },
                                    "clone":
                                    {
                                      name:"Clone Tree",
                                      exec:function(dtnode){appBuilder.taxonomyAction="clone"; appBuilder.currentNode=dtnode;appBuilder.createTab('worktreecontrol',dtnode.data.title)},
                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                    }
                                  }
                                },
                                "appresource-dir-treenode":{
                                  zIndex:100,
                                  selector:".appresource-dir-treenode,.appresource-folder-treenode,.app-root-treenode,.appresource-root-treenode",
                                  build:function($trigger,e){
                                        var m = 
                                        {
                                          "items":
                                          {
                                            "new":{
                                              icon:"new-file",
                                              name:"New",
                                              items:{
                                                "dir":{
                                                  icon:"file-folder",
                                                  name:"Folder",
                                                  exec:function(dtnode){$('#appresource-dialog').data("dtnode",dtnode).data("mime","dir").dialog("open")},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                                                                
                                                "webapp":{
                                                  icon:"file-webapp",
                                                  name:"Web App",
                                                  exec:function(dtnode){$('#new-web-app-dialog').data("dtnode",dtnode).dialog("open")},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },
                                                "editable":{},
                                                "executable":{
                                                  name:"Crud",
                                                  items:{                                     
                                                    "ins":{
                                                      icon:"crud-instantiator",
                                                      name:"Instantiator",
                                                      exec:function(dtnode){$('#instantiator-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    },                                        
                                                    "stm":{
                                                      icon:"crud-datastatement",
                                                      name:"DataStatement",
                                                      exec:function(dtnode){$('#datastatement-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    },                                        
                                                    "ste":{
                                                      icon:"crud-scriptexecutor",
                                                      name:"ScriptExecutor",
                                                      exec:function(dtnode){$('#scriptexecutor-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    },                                        
                                                    "svc":{
                                                      icon:"crud-httpconnector",
                                                      name:"HttpConnector",
                                                      exec:function(dtnode){$('#connector-dialog').data("dtnode",dtnode).data("mime","svc").dialog("open")},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    },                                        
                                                    "upl":{
                                                      icon:"crud-fileuploader",
                                                      name:"FileUploader",
                                                      exec:function(dtnode){$('#fileuploader-dialog').data("dtnode",dtnode).data("mime","upl").dialog("open")},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    },                    
                                                    "esd":{
                                                      icon:"crud-emailsender",
                                                      name:"EmailSender",
                                                      exec:function(dtnode){$('#emailsender-dialog').data("dtnode",dtnode).data("mime","esd").dialog("open")},
                                                      callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            "open_in_browser":
                                            {
                                              name:"Open In Browser",
                                              icon:"file-action-openbrowser",
                                              exec:function(dtnode){
                                              	appBuilder.crud_test.openInBrowser(dtnode);
                                              },
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },                                              
                                            "upload":
                                            {
                                              icon:"add-file",
                                              name:"Upload File",
                                              exec:function(dtnode){ $('#fileresource-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "download":
                                            {
                                              icon:"add-file",
                                              name:"Download File",
                                              exec:function(dtnode){ $('#crudzilla-download-dialog').data("dtnode",dtnode).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "zip":
                                            {
                                              icon:"zip-file",
                                              name:"Zip",
                                              exec:function(dtnode){ appBuilder.runtime_resources.zipDir(dtnode);},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },                                              
                                            "generate_update_package":
                                            {
                                              icon:"generate-update-package",
                                              name:"Generate Update Package",
                                              exec:function(dtnode){ $('#generate-update-package-dialog').data("dtnode",dtnode).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "copy":
                                            {
                                              icon:"copy-file",
                                              name:"Copy",
                                              exec:function(dtnode){ appBuilder.copiedNode = dtnode;appBuilder.isCut = false;},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "cut":
                                            {
                                              icon:"cut-file",
                                              name:"Cut",
                                              exec:function(dtnode){ appBuilder.copiedNode = dtnode; appBuilder.isCut = true;},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "paste":
                                            {
                                              icon:"paste-file",
                                              name:"Paste",
                                              exec:function(dtnode){ appBuilder.runtime_resources.pasteResource(appBuilder.copiedNode,dtnode);/*appBuilder.copiedNode=null;*/},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "rename":
                                            {
                                              name:"Rename",
                                              exec:function(dtnode){$('#appresource-dialog').data("dtnode",dtnode).data("rename",true).dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "delete":
                                            {
                                              icon:"delete-file",
                                              name:"Delete",
                                              exec:appBuilder.runtime_resources.deleteResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "refresh":{
                                              name:"Refresh",
                                              items:{
                                                "rins":{
                                                  name:"Instantiators",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'ins');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                                 
                                                "rstm":{
                                                  name:"DataStatements",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'stm');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                        
                                                "rste":{
                                                  name:"ScriptExecutors",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'ste');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                        
                                                "rsvc":{
                                                  name:"HttpConnectors",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'svc');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                        
                                                "rupl":{
                                                  name:"FileUploaders",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'upl');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                        
                                                "resd":{
                                                  name:"EmailSenders",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'esd');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                },                                        
                                                "rall":{
                                                  name:"All",
                                                  exec:function(dtnode){appBuilder.runtime_resources.refreshResource(dtnode,'all');},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                                }                                                  
                                              }
                                            },                                                                                
                                            "delete_webapp":{
                                              name:"Delete Web App",
                                              exec:function(dtnode){$('#delete-web-app-dialog').data("dtnode",dtnode).dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            }/*,
                                                  "sync":
                                                      {
                                                          name:"Sync",
                                                          exec:appBuilder.runtime_resources.syncResource,
                                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                      }*/,
                                                "clone":
                                                {
                                                  name:"Clone Tree",
                                                  exec:function(dtnode){appBuilder.currentNode=dtnode;appBuilder.createTab('apptreecontrol',dtnode.data.title)},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "crudbase":
                                                {
                                                  name:"Crudbase",
                                                  exec:function(dtnode){appBuilder.runtime_resources.openCrudbase();},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                }/*,
                                                  "layout_component":
                                                      {
                                                          name:"Layout Snippet",
                                                          exec:function(dtnode){appBuilder.runtime_resources.openLayoutSnippetTab();},
                                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                      }*/,
                                                "backup":
                                                {
                                                  name:"Backup",
                                                  exec:appBuilder.runtime_resources.backupResource,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "add_to_index":
                                                {
                                                  name:"Index",
                                                  exec:appBuilder.runtime_resources.indexResource,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "search":
                                                {
                                                  icon:"find-in-folder",
                                                  name:"Search From",
                                                  exec:appBuilder.runtime_resources.showSearchTabView,
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "resource_to_source":
                                                {
                                                  name:"To Source",
                                                  exec:function(dtnode){$( "#crud-to-source-dialog-confirm" ).data("dtnode",dtnode).dialog("open");},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "listify":
                                                {
                                                  name:"Listify",
                                                  exec:function(dtnode){$('#listify-dialog').data("dtnode",dtnode).dialog("open")},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                },
                                                "reload_node":
                                                {
                                                  icon:"reload-folder",
                                                  name:"Reload Folder",
                                                  exec:function(dtnode){dtnode.resetLazy();},
                                                  callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                                }
                                              }
                                        };
                                        
                                        var dtnode = $.ui.dynatree.getNode($trigger);
                                        
                                        var appConfig = appBuilder.common_core.getAppByPath(appBuilder.common_core.getRelPath(dtnode)+"/web");
                                        if(appConfig == null)
                                          delete m.items["delete_webapp"];
                                        
                                        if(dtnode.data.type == 'appresource-root'){
                                          delete m.items["delete"];
                                          delete m.items["rename"];
                                        }
                                        else{
                                          delete m.items["clone"];
                                          delete m.items["crudbase"];
                                        }
                                        
                                        if(dtnode.data.type != 'appresource-dir'){
                                          delete m.items["zip"];
                                        }                                  
                                                                        
                                    
                                    
                                        if(typeof appBuilder.copiedNode == "undefined" || appBuilder.copiedNode == null)
                                          delete m.items["paste"];
                                        
                                        
                                        
                                        m.items['new'].items['data items'] = appBuilder.common_core.dataItemMenu;
                                        
                                        m.items['new'].items['editable'] = appBuilder.common_core.editableTypeMenu;
                                        return m;
                                      }
                                  },
                                "appresource-treenode":{
                                  selector:".appresource-treenode",
                                  build:function($trigger,e){
                                    var m = 
                                        {
                                          items:
                                          {
                                            "open_in_browser":
                                            {
                                              name:"Open In Browser",
                                              icon:"file-action-openbrowser",
                                              exec:function(dtnode){
                                              	appBuilder.crud_test.openInBrowser(dtnode);
                                              },
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },                                            
                                            "view":
                                            {
                                              name:"Edit As Document",
                                              icon:"file-action-wysiwyg",
                                              exec:appBuilder.runtime_resources.editResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "layout":
                                            {
                                              name:"Open In Build Mode Layout",
                                              icon:"file-action-layout",
                                              exec:function(dtnode){
                                                appBuilder.layItOut = true;
                                              	appBuilder.openTab(dtnode);
                                              },
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "uipart":
                                            {
                                              name:"Open As UI Part",
                                              icon:"file-action-uipart",
                                              exec:function(dtnode){
                                                //appBuilder.layItOut = true;
                                              	appBuilder.htmlLayout.openLayoutPartTab(appBuilder.common_core.getDtNodeURL(dtnode));
                                              },
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "test":
                                            {
                                              name:"Test",
                                              exec:appBuilder.runtime_resources.runResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "build":
                                            {
                                              name:"Build",
                                              exec:appBuilder.runtime_resources.buildWebApp,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "deploy_context":
                                            {
                                              name:"Deploy Context",
                                              exec:appBuilder.runtime_resources.deployContext,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "deploy_war":
                                            {
                                              name:"Deploy War",
                                              exec:appBuilder.runtime_resources.deployWar,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "copy":
                                            {
                                              name:"Copy",
                                              exec:function(dtnode){ appBuilder.copiedNode = dtnode;appBuilder.isCut = false;},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "cut":
                                            {
                                              icon:"cut-file",
                                              name:"Cut",
                                              exec:function(dtnode){ appBuilder.copiedNode = dtnode;appBuilder.isCut = true;},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },                                            
                                            "rename":
                                            {
                                              name:"Rename",
                                              exec:function(dtnode){$('#appresource-dialog').data("dtnode",dtnode).data("rename",true).dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "delete":
                                            {
                                              name:"Delete",
                                              exec:appBuilder.runtime_resources.deleteResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "refresh":
                                            {
                                              name:"Refresh",
                                              exec:appBuilder.runtime_resources.refreshResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "sync":
                                            {
                                              name:"Sync",
                                              exec:appBuilder.runtime_resources.syncResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "backup":
                                            {
                                              name:"Backup",
                                              exec:appBuilder.runtime_resources.backupResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "add_to_index":
                                            {
                                              name:"Index",
                                              exec:appBuilder.runtime_resources.indexResource,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "search":
                                            {
                                              icon:"find-in-file",
                                              name:"Find",
                                              exec:appBuilder.runtime_resources.showSearchTabView,
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "resource_to_source":
                                            {
                                              name:"To Source",
                                              exec:function(dtnode){$( "#crud-to-source-dialog-confirm" ).data("dtnode",dtnode).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            },
                                            "unzip":
                                            {
                                              icon:"unzip-file",
                                              name:"Unzip",
                                              exec:function(dtnode){ appBuilder.runtime_resources.unZipFile(dtnode);},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                            }
                                          }                                    
                                        };
                                    
                                    var dtnode = $.ui.dynatree.getNode($trigger);
                                    if(!_this.isExecutableType(dtnode.data.mime)){
                                      
                                      delete m.items["refresh"];
                                      
                                      delete m.items["resource_to_source"];
                                    }
                                    
                                    delete m.items["sync"];
                                    if(!_this.isExecutableType(dtnode.data.mime) && 
                                       !appBuilder.endsWith(dtnode.data.title,".html")  && 
                                       !appBuilder.endsWith(dtnode.data.title,".htm")){
                                      delete m.items["view"];
                                      delete m.items["layout"];
                                    }
                                    
                                    if(dtnode.data.type != "appresource" || dtnode.data.title != "build.xml"){
                                      delete m.items["build"];                                  
                                    }   
                                    if(!(dtnode.data.type == "appresource" &&
                                         dtnode.data.title.lastIndexOf(".war") != -1 &&
                                         dtnode.data.title.substring(dtnode.data.title.lastIndexOf(".war")) == ".war")){
                                      delete m.items["deploy_war"];                                  
                                    }  
                                    if(dtnode.data.type != "appresource" || dtnode.data.title != "jetty-web.xml")
                                      delete m.items["deploy_context"];                                  
                                    
                                    if(dtnode.data.type != 'appresource' || 
                                           !appBuilder.endsWith(dtnode.data.title,".zip")){
                                          delete m.items["unzip"];
                                    }                                     
                                    
                                    return m;
                                  }
                                },
                                "apptaxonomy-category-treenode":{
                                  zIndex:100,
                                  selector:".apptaxonomy-category-treenode",
                                  build:function($trigger,e){
                                    var m ={
                                      items:
                                      {
                                        
                                        "new":{
                                          name:"New",
                                          items:{
                                            "cat":{
                                              name:"Category",
                                              exec:function(dtnode){$('#sysadmin-apptaxonomy-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                                        
                                            "ins":{
                                              name:"Instantiator",
                                              exec:function(dtnode){$('#instantiator-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                                        
                                            "stm":{
                                              name:"DataStatement",
                                              exec:function(dtnode){$('#datastatement-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                                        
                                            "ste":{
                                              name:"ScriptExecutor",
                                              exec:function(dtnode){$('#scriptexecutor-dialog').data("dtnode",dtnode).data("rename",false).dialog("open");},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                                        
                                            "svc":{
                                              name:"HttpConnector",
                                              exec:function(dtnode){$('#connector-dialog').data("dtnode",dtnode).data("mime","svc").dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                                        
                                            "upl":{
                                              name:"FileUploader",
                                              exec:function(dtnode){$('#fileuploader-dialog').data("dtnode",dtnode).data("mime","upl").dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            },                    
                                            "esd":{
                                              name:"EmailSender",
                                              exec:function(dtnode){$('#emailsender-dialog').data("dtnode",dtnode).data("mime","esd").dialog("open")},
                                              callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}                                            
                                            }
                                          }
                                        },
                                        "rename":
                                        {
                                          name:"Rename",
                                          exec:function(dtnode){$('#sysadmin-apptaxonomy-dialog').data("dtnode",dtnode).data("rename",true).dialog("open")},
                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                        },
                                        "delete":
                                        {
                                          name:"Delete",
                                          exec:appBuilder.sysadmin.apptaxonomy.deleteCategory,
                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                        },     
                                        "bake":
                                        {
                                          name:"Bake",
                                          exec:function(dtnode){appBuilder.common_core.autoGenerateCrud(dtnode);},
                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                        },
                                        "access_control":
                                        {
                                          name:"Access Control",
                                          exec:function(dtnode){appBuilder.currentNode=dtnode;appBuilder.createTab('apptaxonomy-'+dtnode.data.id,dtnode.data.title+"-Access Control")},
                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                        },
                                        "reload_node":
                                        {
                                          icon:"reload-folder",
                                          name:"Reload Category",
                                          exec:function(dtnode){dtnode.resetLazy();},
                                          callback:function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))}
                                        }
                                      }
                                    };
                                    var dtnode = $.ui.dynatree.getNode($trigger);
                                    //if(dtnode.data.appTaxonomyId != '0')
                                    delete m.items['access_control'];
                                    
                                    m.items['new'].items['data items'] = appBuilder.common_core.dataItemMenu;
                                    return m;
                                  }
                                }
                              }
                              
                              for(key in appBuilder.contextMenuBindings){
                                $.contextMenu(appBuilder.contextMenuBindings[key]);
                              }                    
                    
                  },
        loadTreeControlInitNodes:function(){
          appBuilder.treeControlInitializationNodes = {
            
            "work-treecontrol":
            {
              nodes:
              [
                {
                  "title":"Home",
                  "isLazy":true,
                  "type":"apptaxonomy-root",
                  "addClass":"apptaxonomy-root-treenode",
                  "appTaxonomyId":"0",
                  "key":"0",
                  "id":"0",
                  "link_id":'-1',
                  "link_apptaxonomy_id":'-1',                                        
                  "isFolder":true,
                  "children":[]
                }
              ],
              getDnd:appBuilder.sysadmin.apptaxonomy.getDnd
            },
            "work-treecontrol2":
            {
              nodes:
              [
                {
                  "title":"Home",
                  "isLazy":true,
                  "type":"apptaxonomy-root",
                  "addClass":"apptaxonomy-root-treenode",
                  "appTaxonomyId":"0",
                  "key":"0",
                  "id":"0",
                  "link_id":'-1',
                  "link_apptaxonomy_id":'-1',                                        
                  "isFolder":true,
                  "children":[]
                }
              ],
              getDnd:appBuilder.sysadmin.apptaxonomy.getDnd
            },
            "definition-search-treecontrol":{
              nodes:[
                {
                  "title":"Search Results",
                  "addClass":"definition-search-root-treenode",
                  "children":[]
                }
              ],
              getDnd:appBuilder.sysadmin.apptaxonomy.getDnd
            },
            "sysadmin-treecontrol":
            {
              nodes:
              [
                {
                  "title":"Manage User Identity",
                  "isLazy":false,
                  "type":"usermanagement",
                  "addClass":"usermanagement-treenode",
                  "isFolder":false,
                  "children":[]
                }, 
                {
                  "title":"App Taxonomies",
                  "isLazy":true,
                  "type":"apptaxonomy-root",
                  "addClass":"apptaxonomy-root-treenode",
                  "isFolder":true,
                  "children":[]
                }
              ]
            },
            "app-treecontrol":
            {
              nodes:
              [
                {
                  "title":"Home",
                  "isLazy":true,
                  "type":"appresource-root",
                  "addClass":"appresource-root-treenode",
                  "relPath":"/",
                  "isFolder":true,
                  "appTaxonomyId":"0",
                  "key":"0",
                  "id":"0",
                  "link_id":'-1',
                  "link_apptaxonomy_id":'-1'                                   
                }
              ]
            },
            "app-treecontrol2":
            {
              nodes:
              [
                {
                  "title":"Home",
                  "isLazy":true,
                  "type":"appresource-root",
                  "addClass":"appresource-root-treenode",
                  "relPath":"/",
                  "isFolder":true,
                  "appTaxonomyId":"0",
                  "key":"0",
                  "id":"0",
                  "link_id":'-1',
                  "link_apptaxonomy_id":'-1'
                }
              ]
            },
            "app-directory-navigator-treecontrol":
            {
              nodes:
              [
                {
                  "title":"Home",
                  "isLazy":true,
                  "type":"appresource-root",
                  "addClass":"appresource-root-treenode",
                  "relPath":"/",
                  "isFolder":true,
                  "appTaxonomyId":"0",
                  "key":"0",
                  "id":"0",
                  "link_id":'-1',
                  "link_apptaxonomy_id":'-1'    
                }
              ]
            }        
          }
        },
        getTimeZones:function(){
          return [    
            {value:"America/New_York",display:"Eastern Time (US & Canada)"},        
            {value:"America/Los_Angeles",display:"Pacific Time (US & Canada)"},
            {value:"America/Chicago",display:"Central Time (US & Canada)"},
            {value:"America/Denver",display:"Mountain Time (US & Canada)"},
            {value:"Europe/Belfast",display:"(GMT) Greenwich Mean Time : Belfast"},
            {value:"Europe/Dublin",display:"(GMT) Greenwich Mean Time : Dublin"},
            {value:"Europe/Lisbon",display:"(GMT) Greenwich Mean Time : Lisbon"},
            {value:"Europe/London",display:"(GMT) Greenwich Mean Time : London"},
            {value:"Europe/Amsterdam",display:"Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"},
            {value:"Europe/Belgrade",display:"Belgrade, Bratislava, Budapest, Ljubljana, Prague"},
            {value:"Europe/Brussels",display:"Brussels, Copenhagen, Madrid, Paris"},
            {value:"Europe/Moscow",display:"Moscow, St. Petersburg, Volgograd"},
            {value:"Pacific/Midway",display:"Midway Island, Samoa"},
            {value:"America/Adak",display:"Hawaii-Aleutian"},
            {value:"Etc/GMT+10",display:"Hawaii"},
            {value:"Pacific/Marquesas",display:"Marquesas Islands"},
            {value:"Pacific/Gambier",display:"Gambier Islands"},
            {value:"America/Anchorage",display:"Alaska"},
            {value:"America/Ensenada",display:"Tijuana, Baja California"},
            {value:"Etc/GMT+8",display:"Pitcairn Islands"},
            {value:"America/Chihuahua",display:"Chihuahua, La Paz, Mazatlan"},
            {value:"America/Dawson_Creek",display:"Arizona"},
            {value:"America/Belize",display:"Saskatchewan, Central America"},
            {value:"America/Cancun",display:"Guadalajara, Mexico City, Monterrey"},
            {value:"Chile/EasterIsland",display:"Easter Island"},
            {value:"America/Havana",display:"Cuba"},
            {value:"America/Bogota",display:"Bogota, Lima, Quito, Rio Branco"},
            {value:"America/Caracas",display:"Caracas"},
            {value:"America/Santiago",display:"Santiago"},
            {value:"America/La_Paz",display:"La Paz"},
            {value:"Atlantic/Stanley",display:"Faukland Islands"},
            {value:"America/Campo_Grande",display:"Brazil"},
            {value:"America/Goose_Bay",display:"Atlantic Time (Goose Bay)"},
            {value:"America/Glace_Bay",display:"Atlantic Time (Canada)"},
            {value:"America/St_Johns",display:"Newfoundland"},
            {value:"America/Araguaina",display:"UTC-3"},
            {value:"America/Montevideo",display:"Montevideo"},
            {value:"America/Miquelon",display:"Miquelon, St. Pierre"},
            {value:"America/Godthab",display:"Greenland"},
            {value:"America/Argentina/Buenos_Aires",display:"Buenos Aires"},
            {value:"America/Sao_Paulo",display:"Brasilia"},
            {value:"America/Noronha",display:"Mid-Atlantic"},
            {value:"Atlantic/Cape_Verde",display:"Cape Verde Is."},
            {value:"Atlantic/Azores",display:"Azores"},
            {value:"Africa/Abidjan",display:"(GMT) Monrovia, Reykjavik"},
            {value:"Africa/Algiers",display:"West Central Africa"},
            {value:"Africa/Windhoek",display:"Windhoek"},
            {value:"Asia/Beirut",display:"Beirut"},
            {value:"Africa/Cairo",display:"Cairo"},
            {value:"Asia/Gaza",display:"Gaza"},
            {value:"Africa/Blantyre",display:"Harare, Pretoria"},
            {value:"Asia/Jerusalem",display:"Jerusalem"},
            {value:"Europe/Minsk",display:"Minsk"},
            {value:"Asia/Damascus",display:"Syria"},
            {value:"Africa/Addis_Ababa",display:"Nairobi"},
            {value:"Asia/Tehran",display:"Tehran"},
            {value:"Asia/Dubai",display:"Abu Dhabi, Muscat"},
            {value:"Asia/Yerevan",display:"Yerevan"},
            {value:"Asia/Kabul",display:"Kabul"},
            {value:"Asia/Yekaterinburg",display:"Ekaterinburg"},
            {value:"Asia/Tashkent",display:"Tashkent"},
            {value:"Asia/Kolkata",display:"Chennai, Kolkata, Mumbai, New Delhi"},
            {value:"Asia/Katmandu",display:"Kathmandu"},
            {value:"Asia/Dhaka",display:"Astana, Dhaka"},
            {value:"Asia/Novosibirsk",display:"Novosibirsk"},
            {value:"Asia/Rangoon",display:"Yangon (Rangoon)"},
            {value:"Asia/Bangkok",display:"Bangkok, Hanoi, Jakarta"},
            {value:"Asia/Krasnoyarsk",display:"Krasnoyarsk"},
            {value:"Asia/Hong_Kong",display:"Beijing, Chongqing, Hong Kong, Urumqi"},
            {value:"Asia/Irkutsk",display:"Irkutsk, Ulaan Bataar"},
            {value:"Australia/Perth",display:"Perth"},
            {value:"Australia/Eucla",display:"Eucla"},
            {value:"Asia/Tokyo",display:"Osaka, Sapporo, Tokyo"},
            {value:"Asia/Seoul",display:"Seoul"},
            {value:"Asia/Yakutsk",display:"Yakutsk"},
            {value:"Australia/Adelaide",display:"Adelaide"},
            {value:"Australia/Darwin",display:"Darwin"},
            {value:"Australia/Brisbane",display:"Brisbane"},
            {value:"Australia/Hobart",display:"Hobart"},
            {value:"Asia/Vladivostok",display:"Vladivostok"},
            {value:"Australia/Lord_Howe",display:"Lord Howe Island"},
            {value:"Etc/GMT-11",display:"Solomon Is., New Caledonia"},
            {value:"Asia/Magadan",display:"Magadan"},
            {value:"Pacific/Norfolk",display:"Norfolk Island"},
            {value:"Asia/Anadyr",display:"Anadyr, Kamchatka"},
            {value:"Pacific/Auckland",display:"Auckland, Wellington"},
            {value:"Etc/GMT-12",display:"Fiji, Kamchatka, Marshall Is."},
            {value:"Pacific/Chatham",display:"Chatham Islands"},
            {value:"Pacific/Tongatapu",display:"Nuku'alofa"},
            {value:"Pacific/Kiritimati",display:"Kiritimati"}
          ];           
        },
        timeZones:null,
        _tmplCache :{},
        parseTemplate : function(str, data) {
          appBuilder._tmplCache = {};
          /// <summary>
          /// Client side template parser that uses &lt;#= #&gt; and &lt;# code #&gt; expressions.
          /// and # # code blocks for template expansion.
          /// NOTE: chokes on single quotes in the document in some situations
          ///       use &amp;rsquo; for literals in text and avoid any single quote
          ///       attribute delimiters.
          /// </summary>    
          /// <param name="str" type="string">The text of the template to expand</param>    
          /// <param name="data" type="var">
          /// Any data that is to be merged. Pass an object and
          /// that object's properties are visible as variables.
          /// </param>    
          /// <returns type="string" />  
          var err = "";
          try {
            var func = appBuilder._tmplCache[str];
            if (!func) {
              var strFunc =
                  "var p=[],print=function(){p.push.apply(p,arguments);};" +
                  "with(obj){p.push('" +
                  //                        str
                  //                  .replace(/[\r\t\n]/g, " ")
                  //                  .split("<#").join("\t")
                  //                  .replace(/((^|#>)[^\t]*)'/g, "$1\r")
                  //                  .replace(/\t=(.*?)#>/g, "',$1,'")
                  //                  .split("\t").join("');")
                  //                  .split("#>").join("p.push('")
                  //                  .split("\r").join("\\'") + "');}return p.join('');";
                  
                  str.replace(/[\r\t\n]/g, " ")
              .replace(/'(?=[^#]*#>)/g, "\t")
              .split("'").join("\\'")
              .split("\t").join("'")
              .replace(/<#=(.+?)#>/g, "',$1,'")
              .split("<#").join("');")
              .split("#>").join("p.push('")
              + "');}return p.join('');";
              
              //alert(strFunc);
              func = new Function("obj", strFunc);
              appBuilder._tmplCache[str] = func;
            }
            return func(data);
          } catch (e) {err = e.message;}
          return "< # ERROR: " + err.htmlEncode() + " # >";
        } ,
        scrollableTabs:function(containerId){
          //scrollpane parts
          var scrollPane = $( '#'+containerId+" .scroll-pane" ),
              scrollContent = $( '#'+containerId+" .scroll-content" );
          //build slider
          var scrollbar = $( '#'+containerId+" .scroll-bar" ).slider({
            slide: function( event, ui ) {
              if( scrollContent.width() > scrollPane.width() ) 
              {
                scrollContent.css( "margin-left", Math.round(
                  ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
                ) + "px" );
              } 
              else 
              {
                scrollContent.css( "margin-left", 0 );
              }
            }
          });
          //append icon to handle
          var handleHelper = scrollbar.find(".ui-slider-handle" )
          .mousedown(function() {
            scrollbar.width( handleHelper.width() );
          })
          .mouseup(function() {
            scrollbar.width( "100%" );
          })
          .append( "<span class='ui-icon ui-icon-grip-dotted-vertical'></span>" )
          .wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();
          //change overflow to hidden now that slider handles the scrolling
          scrollPane.css( "overflow", "hidden" );
          //size scrollbar and handle proportionally to scroll distance
          function sizeScrollbar() {
            var remainder = scrollContent.width() - scrollPane.width();
            var proportion = remainder / scrollContent.width();
            var handleSize = scrollPane.width() - ( proportion * scrollPane.width() );
            scrollbar.find( ".ui-slider-handle" ).css({
              width: handleSize,
              "margin-left": -handleSize / 2
            });
            handleHelper.width( "" ).width( scrollbar.width() - handleSize );
          }
          //reset slider value based on scroll content position
          function resetValue() {
            var remainder = scrollPane.width() - scrollContent.width();
            var leftVal = scrollContent.css( "margin-left" ) === "auto" ? 0 :
            parseInt( scrollContent.css( "margin-left" ) );
            var percentage = Math.round( leftVal / remainder * 100 );
            scrollbar.slider( "value", percentage );
          }
          //if the slider is 100% and window gets larger, reveal content
          function reflowContent() {
            var showing = scrollContent.width() + parseInt( scrollContent.css( "margin-left" ), 10 );
            var gap = scrollPane.width() - showing;
            if ( gap > 0 ) {
              scrollContent.css( "margin-left", parseInt( scrollContent.css( "margin-left" ), 10 ) + gap );
            }
          }
          //change handle position on window resize
          $( window ).resize(function() {
            resetValue();
            sizeScrollbar();
            reflowContent();
          });
          
          var value = 0;
          $('#'+containerId+" .scroll-left").button({
            text: false,
            icons: {
              primary: "ui-icon-carat-1-w"
            }
          }).click(function(){
            value -= 4;
            if( scrollContent.width() > scrollPane.width() ) 
            {
              scrollContent.css( "margin-left", Math.round(
                value / 100 * ( scrollPane.width() - scrollContent.width() )
              ) + "px" );
            } 
            else 
            {
              scrollContent.css( "margin-left", 0 );
            }
          }).removeClass("ui-corner-all").addClass("ui-corner-left").css({"padding":"0"});              
          
          
          $('#'+containerId+" .scroll-right").button({
            text: false,
            icons: {
              primary: "ui-icon-carat-1-e"
            }
          }).click(function(){
            value += 4;
            if( scrollContent.width() > scrollPane.width() ) 
            {
              scrollContent.css( "margin-left", Math.round(
                value / 100 * ( scrollPane.width() - scrollContent.width() )
              ) + "px" );
            } 
            else 
            {
              scrollContent.css( "margin-left", 0 );
            }
          }).removeClass("ui-corner-all").addClass("ui-corner-right").css({"padding":"0"});              
          
          /*
          $('#'+containerId+" .scroll-buttons")
          .css({"position":"absolute"})
          .position({
            my: "top right 5",
            at: "top right 5",
            of: $('#'+containerId)
          });                    
          */
          $( "#"+containerId+" .scroll-bar-wrap").css({"display":"none"});
          //init scrollbar size
          setTimeout( sizeScrollbar, 10 );//safari wants a timeout
          
          
        },
        showPreferenceViewTab:function(){
          appBuilder.currentNode = null;
          appBuilder.queuedAction.push('preference-tab');
          appBuilder.createTab('preference-tab-0','<img src="img/silk/wrench.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold">Options</span>');               
        },
        createPreferenceTabView:function(ui,event){
          var _this = this;
          ui.panel.tabid = "preference-tab-0";
          $("#tabs").tabs('option', 'active',ui.index);
          
          
          function load(callback){
            
            
            var loadCount 	= 0;
            var maxLoad 	= 1;
            
            
            
            var htmlg = [];
            htmlg.push('<ul style="list-style:none">');
            htmlg.push('	<li>');
            htmlg.push('		<h2><a href="" style="text-decoration:none" onclick="appBuilder.openResource(\'com/crudzilla/HiveMind/web/lucene/config.ins\'); return false;" >Lucene (Search Engine)</a></h2>');            
            htmlg.push('	</li>');
            htmlg.push('</ul>');
            
            $(ui.panel.panel).find('.right-panel').append(htmlg.join(''));                 
            
            
            
            
            
            $.ajax({
              type:'POST',
              url:'new-web-app/app-list/apps.ins',
              dataType:"json",
              success:function(appList){
                
                var html = [];
                html.push('<ul style="list-style:none">');
                html.push('	<li>');
                html.push('		<h2><a href="" style="text-decoration:none" onclick="appBuilder.openResource(\'/com/crudzilla/HiveMind/web/new-web-app/app-list/apps.ins\'); return false;" >Applications</a></h2>');
                html.push('		<ul style="list-style:none">');
                
                for(var i=0;i<appList.length;i++)
                  html.push('			<li><a href="" style="text-decoration:none" onclick="appBuilder.openResource(\'/com/crudzilla/HiveMind/web/new-web-app/app-list/'+appList[i].name+'.ins\'); return false;" >'+appList[i].name+'</a></li>');
                
                html.push('		</ul>');
                html.push('	</li>');
                html.push('</ul>');
                
                $(ui.panel.panel).find('.left-panel').append(html.join(''));
                if(++loadCount == maxLoad)
                  $.unblockUI();
                //	callback(html.join(''));
                
              }
            });
            
            $.ajax({
              type:'POST',
              url:'data-modeling/available-big-tables/list.ins',
              dataType:"json",
              success:function(list){
                
                var html = [];
                html.push('<ul style="list-style:none">');
                html.push('	<li>');
                html.push('		<h2><a href="" style="text-decoration:none" onclick="appBuilder.openResource(\'com/crudzilla/HiveMind/web/data-modeling/available-big-tables/list.ins\'); return false;" >Preemptive Schema Tables (aka WideTables)</a></h2>');
                html.push('		<ul style="list-style:none">');
                
                for(var i=0;i<list.length;i++){
                  var bigT = list[i];
                  
                  html.push('			<li><a href="" style="text-decoration:none" onclick="appBuilder.openResource(\''+list[i]+'\'); return false;" >'+bigT.split('/')[bigT.split('/').length-2]+'</a></li>');
                }
                
                html.push('		</ul>');
                html.push('	</li>');
                html.push('</ul>');
                
                $(ui.panel.panel).find('.middle-panel').append(html.join(''));
                
                if(++loadCount == maxLoad)
                  $.unblockUI();
                //callback(html.join(''));
              }
            }); 
            
            
            
          }
          
          
          $.blockUI();
          $.ajax({
            type:'POST',
            url:'sc/appbuilder/ui-templates/preference-tab-view.html',
            success:function(data){
              
              ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");                  
              $("#preference-tab").append(ui.panel.panel);                                    
              $(ui.panel.panel).html(appBuilder.parseTemplate(data,{}));
              $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height()});//.addClass("gray-background");                 
              
              load(function(html){
                $(ui.panel.panel).find('.left-panel').append(html);
              });
            }
          });
        },
        postNodeLoadCallback:null,
        expandPathNodes:function(dtnode,path,callback){
          
          dtnode.visit(function(dtnode){
            
            if(path[0] == dtnode.data.title)
            {
              appBuilder.postNodeLoadCallback = function(dtnode){
                
                if(path.length == 1){
                  callback(dtnode);
                }else{
                  
                  appBuilder.expandPathNodes(dtnode,path.slice(1,path.length),callback); 
                }
              };
              
              
              if(typeof dtnode.hasChildren() != "undefined"){                
                dtnode.expand();
                appBuilder.postNodeLoadCallback(dtnode); 
              }
              else
              {                
                dtnode.expand();  
              }
              
              return false;
            }return true;
          });              
        },
        openResource:function(path){
          
          var parts = path.split('/');
          var root = $("#app-treecontrol").dynatree("getTree").getRoot();
          
          appBuilder.expandPathNodes(root,path[0]=='/'?path.substring(1).split('/'):path.split('/'),function(dtnode){
            
            appBuilder.postNodeLoadCallback = null;
            //dtnode.activate();
            appBuilder.queuedAction = [];
            appBuilder.openTab(dtnode);
          });
        },
        openOSGiTab:function(){
          appBuilder.queuedAction.push('osgi-console');
          appBuilder.createTab('osgi-console-tab','<img src="img/felix.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold;color:#729fcf">OSGi Console</span>'); 
        },
        createOSGiTabView:function(ui,event){
          var _this = this;
          ui.panel.tabid = 'osgi-console-tab';
          
          $("#tabs").tabs('option', 'active',ui.index);
          
          $.ajax({
            type:'POST',
            url:'sc/appbuilder/ui-templates/osgi-console-tab-view.html',
            success:function(data){
              
              ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");                  
              $("#html-layout-tab").append(ui.panel.panel);                                    
              $(ui.panel.panel).html(appBuilder.parseTemplate(data,{}));
              
              $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
              
              $("#osgi-console-view-iframe")
              .attr("width","100%")
              .attr("height",$(ui.panel.panel).parent().parent().height());
              
              $("#osgi-console-view-iframe").load(function(){
                var $this = $(this);
                var htmlElement = $("#html-layout-view-iframe").contents().find("html")[0];
              });
              $("#osgi-console-view-iframe").attr("src","osgi/system/console/?ts="+(new Date().getTime()));
            }
          });              
        },
  		checkForProductUpdates:function(){
          $.ajax({
            type:'POST',
            data:{},
            url:"/about/product.ins",
            dataType:"json",
            success:function(product){
                          
              
              $.ajax({
                type:'POST',
                data:{},
                url:product.releaseInfoUrl,
                dataType:"json",
                success:function(releaseInfo){
                  
                  if(releaseInfo.currentVersion.buildNumber != product.buildNumber){
                    $("#crudzilla-product-update-notification-btn").css({"display":"inline"}).
                    
                    /*find("button").*/button({
                      icons :{},
                      text:false
                    }).click(function(){
                    	appBuilder.promptProductUpdate();
                    }).html('<img src="img/system-upgrade.png"/>');
                  }                      
                }});
            }});   
  		},
        promptProductUpdate:function(){
          if(confirm("Are you sure you want to perform update?")){
              $.blockUI();
              $.ajax({
                type:'POST',
                data:{},
                url:"/about/update.ste",
                //dataType:"json",
                success:function(releaseInfo){
                  $.unblockUI();                    
                }});            
          }
        },
        registerUIPart:function(uiPart){          
          this.UIPart.register(uiPart);
        },
        unregisterUIPart:function(uiPart){
          this.UIPart.unregister(uiPart);
        },
        UIPart:
        {
            ui_parts:[],
            register:function(uiPart){
                console.log("register ui part-"+uiPart.part.id);
                this.ui_parts[uiPart.part.id] = uiPart;
                this.ui_parts[uiPart.part.id].part.onDocMutation = appBuilder.htmlLayout.domManager.onDocMutation;
                this.ui_parts[uiPart.part.id].part.getActiveDoc  = appBuilder.htmlLayout.domManager.getActiveDoc;
            },
            unregister:function(uiPart){
                delete this.ui_parts[uiPart.part.id];
            },
            _notify:function(callback,doc){
              setTimeout(function(){
              	callback(doc);
              },0);
            },
            _notifyAllOnDocOpen:function(doc){
              for(var k in this.ui_parts)
              {
                if(this.ui_parts[k].part.onDocOpen)
                  this._notify(this.ui_parts[k].part.onDocOpen,doc);
              }
            },
            _notifyAllOnDocClose:function(doc){
              for(var k in this.ui_parts)
              {
                if(this.ui_parts[k].part.onDocClose)
                  this._notify(this.ui_parts[k].part.onDocClose,doc);
              }            
            },
            _notifyAllOnDocTabActivate:function(doc){
              for(var k in this.ui_parts)
              {
                if(this.ui_parts[k].part.onDocTabActivate)
                  this._notify(this.ui_parts[k].part.onDocTabActivate,doc);
              }              
            },
            _notifyAllOnDocTabDeactivate:function(doc){
              for(var k in this.ui_parts)
              {
                if(this.ui_parts[k].part.onDocTabDeactivate)
                  this._notify(this.ui_parts[k].part.onDocTabDeactivate,doc);
              }              
            }
        }
};// </editor-fold>
