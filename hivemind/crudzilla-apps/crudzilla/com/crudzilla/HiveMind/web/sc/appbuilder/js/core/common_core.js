/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.common_core = {
            actionURL:appBuilder.context_path,
            type_list:[],
            role_opts:[],
            definition_types:[
              "datastatement",
              "scriptexecutor",
              "fileuploader",
              "emailsender",
              "connector",
              "instantiator"
            ],
            droppableReferenceHTML:function(prefix,id,width){
  			  var widthStr = "90%";
              if(width)
  				widthStr = width;
  
              var html = [];
  				html.push('<div>');
  				html.push('<span id="'+prefix+'-path-label-drop-'+id+'" class="ui-widget-header ui-corner-all" style="padding:8px;"><span>Drop reference here.</span></span>');               
  				html.push(' <button  id="'+prefix+'-clear-path-button-'+id+'" style=\"\">Clear</button>');
                html.push('<input type="hidden" id="'+prefix+'-path-'+id+'"/>');
                html.push('</div>');
              return html.join('');
            },
  			dataItemMenu:null,
  			editableTypeMenu:null,
  			editorModeDefinitions:null,
            appPackagePath:null,
  			clientSideSettings:null,
            init:function(){               
                  var _this = this;
              
                  $.ajax({
                   type:'POST',
                   data:{},
                   url:"/crudzilla-app-settings/client-side-settings.ins",
                  success:function(data){
                        appBuilder.clientSideSettings = eval('('+data+')');
                  }});              
              
              
                  $.ajax({
                   type:'GET',
                   data:{},
                   url:"/start-up/get-app-package-path.ste",
                  success:function(data){
                        appBuilder.common_core.appPackagePath = appBuilder.common_core.stripNewLine(data);
                  }});              
              
              
                  appBuilder.common_core.getApps();              
              
              
                  $.ajax({
                   type:'POST',
                   data:{},
                   url:"/editor-mode-definitions/codemirror-editor-ext2modes.ins",
                  success:function(data){        
                        
                        appBuilder.common_core.editorModeDefinitions = eval('('+data+')');
                        
                  }});
              
              
                  $.ajax({
                   type:'POST',
                   data:{},
                   url:"/data-definitions/definitions.ins",
                  success:function(data){
                        var dataTypes = eval('('+data+')');
                        appBuilder.common_core.dataItemMenu = _this.buildDynamicMenu(dataTypes,'Application Object',appBuilder.common_core.showCrudTypeInstantiatorDlg);
                  }});
              
              
                  $.ajax({
                   type:'POST',
                   data:{},
                   url:"/name-value-pair-processing/types/types.ins",
                  success:function(data){
                        appBuilder.common_core.nvpDataTypeDefinitions = eval('('+data+')');
                        for(var i=0;i<appBuilder.common_core.nvpDataTypeDefinitions.length;i++)
                            appBuilder.common_core.type_list.push("<option value\""+appBuilder.common_core.nvpDataTypeDefinitions[i].name+"\">"+appBuilder.common_core.nvpDataTypeDefinitions[i].name+"</option>");
                        		//_this.type_list.push(_this.nvpDataTypeDefinitions[i].name);
                  }});              
              
                  $.ajax({
                   type:'POST',
                   data:{},
                   url:"/editor-mode-definitions/editable-types.ins",
                  success:function(data){
                        var dataTypes = eval('('+data+')');
                        appBuilder.common_core.editableTypeMenu = appBuilder.common_core.buildDynamicMenu(dataTypes,'File',function(dtnode,typeTemplateName,typeTemplate){
                          	$('#appresource-dialog').data("mime",typeTemplate.extension);
                            $('#appresource-dialog').data("menu-label",typeTemplateName);
                            $('#appresource-dialog').data("dtnode",dtnode);
                            $('#appresource-dialog').dialog("open");                      		
                        });
                  }});
              
                  $('#crud-type-instantiator-dialog').dialog({
                        autoOpen: false,
                        width: 150,
                        open:function(){

                            var typeTemplateName = $(this).data("typeTemplateName");
                            $('#crud-type-instantiator-dialog-name').val('');
                            $('#crud-type-instantiator-dialog').dialog({"title":typeTemplateName});                            
                        },
                        buttons: {
                            "Ok": function() {
                            	var dtnode       = $(this).data("dtnode");
                            	var typeTemplate = $(this).data("typeTemplate");
                              	
                              	appBuilder.common_core.instantiateCrudType(typeTemplate,dtnode,$('#crud-type-instantiator-dialog-name').val());
								$(this).dialog("close");
                                /*appBuilder.instantiator.newInstantiator($('#data-item-dialog-name').val(), dtnode,function(id){
                                  
                                  $('#data-item-dialog').dialog("close");
                                  $('#data-item-dialog .fields').empty();
                                  
                                   
                                   $('#data-item-dialog .fields').append('<input type="hidden" id="data-item-execution-parameter-field-name-'+id+'"/>');
                                   $('#data-item-dialog .fields').append('<input type="hidden" id="data-item-execution-parameter-field-default-'+id+'"/>');
                                   $('#data-item-dialog .fields').append('<input type="hidden" id="data-item-execution-parameter-field-type-'+id+'" value="string"/>');
                                   for(field in typeTemplate){
                            			var defaultVal = typeTemplate[field];
                                	    $("#data-item-execution-parameter-field-name-"+id).val(field);
                                     	$("#data-item-execution-parameter-field-default-"+id).val(defaultVal);
                            			appBuilder.common_core.addExecutionParameter(id,"data-item");
                            	   }
                                   
                                });*/
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                  });              
            },
            getApps:function(callback){
                  $.ajax({
                   type:'GET',
                   data:{},
                   url:"/new-web-app/app-list/apps.ins",
                  success:function(data){
                        appBuilder.common_core.registeredApps = eval('('+data+')');
                    	for(var i=0;i<appBuilder.common_core.registeredApps.length;i++)
                    		appBuilder.common_core.registeredApps[i].id = new Date().getTime()+i;  
                        if(typeof callback == "function")
                    		callback(data);
                        
                  }});
            },            
	    	findApp:function(path){
              //alert(path+":"+appBuilder.common_core.registeredApps[1].baseDir)
              for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
                
                if(path.indexOf(appBuilder.common_core.registeredApps[i].baseDir) == 0)
                  return appBuilder.common_core.registeredApps[i];                
              }return null;                
            },            
	    	getAppByPath:function(path){
              for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){                
                if(path == appBuilder.common_core.registeredApps[i].baseDir)
                  return appBuilder.common_core.registeredApps[i];                
              }return null;                
            },
            resolvePathToApp:function(relPath){
                var appConfig = appBuilder.common_core.findApp(relPath);
                if(appConfig != null && relPath.indexOf(appConfig.baseDir) == 0)
                  return relPath.substring(appConfig.baseDir.length);
                return relPath;
            },
            getNVPDataType:function(name){
                for(var i=0;i<this.nvpDataTypeDefinitions.length;i++)
                    if(this.nvpDataTypeDefinitions[i].name == name)
                      return this.nvpDataTypeDefinitions[i];
              
              return null;                            
            },
            showCrudTypeInstantiatorDlg:function(dtnode,typeTemplateName,typeTemplate,progVal){
              if(typeof progVal == 'undefined'){
                $('#crud-type-instantiator-dialog').data("typeTemplate",typeTemplate);
                $('#crud-type-instantiator-dialog').data("typeTemplateName",typeTemplateName);
                $('#crud-type-instantiator-dialog').data("dtnode",dtnode);
                $('#crud-type-instantiator-dialog').dialog("open");
              }else{
                appBuilder.common_core.instantiateCrudType(typeTemplate,dtnode,progVal);
              }
            },
            buildDynamicMenu:function(node,name,callback){
              
              var items = {
                "name":name,
                "items":{}
              };
              for(var key in node){
                 var val = node[key];
                
                 if(typeof val == "string" 
                    || typeof node['crud_path'] != 'undefined' 
                    || typeof node['crudzilla_terminal_node'] != 'undefined'){
                   
                     //this.buildMenuNode(node,name,callback);
                      var getTypeTemplate = function(node){
                        
                        $.ajax({
                          type:'POST',
                          data:{
                            "relPath":node.crud_path,
                            "appendPackagePath":"true"
                          },
                          url:"/file-system/view.ste",
                          success:function(data){
                            //console.log(appBuilder.common_core.appPackagePath+node.crud_path+":"+ data)
                            node.crud = eval('('+data+')');
                          }
                        });                    
                      }
                      
                      if(typeof node['crud_path'] != 'undefined' && node['crud_path'] != '')
                        getTypeTemplate(node);
                      
                      var handler = callback;
                      if(typeof node['js_handler'] != 'undefined'){
                        handler = eval('('+node['js_handler']+')');
                      }
                      
                      //this is a type template, break loop and return;
                      return {
                        "icon":typeof node.icon != "undefined"?node.icon:"",
                        "name":name,
                        "callback":function(key, opt){opt.commands[key].exec($.ui.dynatree.getNode(opt.$trigger))},
                        "exec":function(dtnode,progVal){ handler(dtnode,name,node,progVal);}
                      };                    
                 }
                 else
                 {
                    var item = this.buildDynamicMenu(val,key,callback);
                    items.items[key]= item;
                 }
              }
              
              return items;
            },
            getAbsolutePath:function(relPath,baseDtNode){
              
              if(relPath.length>0 && relPath[0] == '/') {
                var absPath  = appBuilder.common_core.getRelPath(baseDtNode);
                
                var appConfig = appBuilder.common_core.findApp(absPath);
                if(appConfig != null && absPath.indexOf(appConfig.baseDir) == 0)
                  //absPath = absPath.substring(appConfig.baseDir.length);                
                return appConfig.baseDir+relPath;
                
                return relPath;
              }
              
              var parts  = relPath.split('/');
              var dtnode = baseDtNode;
              
              for(var i=0;i<parts.length;i++){
                if(parts[i] != '..')
                  return appBuilder.runtime_resources.getPath(dtnode.parent)+'/'+parts.slice(i).join('/');
                
                dtnode = dtnode.parent;
              }
              
              return relPath;
            },
            getRelativePath:function(basePath,targetPath){
              var base   = basePath.split('/');
              var target = targetPath.split('/');
              
              // First get all the common elements. Store them as a string,
              // and also count how many of them there are.
              var common = [];
      
              var commonIndex = 0;
              while (commonIndex < target.length && commonIndex < base.length
                      && target[commonIndex] == base[commonIndex]) {
                  common.push(target[commonIndex] +'/');
                  commonIndex++;
              }  
              
              if (commonIndex == 0) {
                  // No single common path element. This most
                  // likely indicates differing drive letters, like C: and D:.
                  // These paths cannot be relativized.
                  /*--throw new PathResolutionException("No common path element found for '" + normalizedTargetPath + "' and '" + normalizedBasePath
                          + "'");*/
                  return null;
              }   
      
              // The number of directories we have to backtrack depends on whether the base is a file or a dir
              // For example, the relative path from
              //
              // /foo/bar/baz/gg/ff to /foo/bar/baz
              // 
              // ".." if ff is a file
              // "../.." if ff is a directory
              //

              var relative = [];
      
              if (base.length != commonIndex) {
                  var numDirsUp = base.length - commonIndex - 1;
      
                  for (var i = 0; i < numDirsUp; i++) {
                      relative.push("../");
                  }
              }
              
              relative.push(targetPath.substring(common.join('').length));
              return relative.join('');              
            },  
  			makeTextFieldDroppable:function(element,dtRelativeToNode){
              $(element).parent().droppable({
                //activeClass: "ui-state-default",
                hoverClass: "ui-state-hover", 
                greedy: true,
                tolerance:"touch",
                accept:function(){return true;},
                drop: function( event, ui ) {
                    var droppedNode = ui.helper.data("dtSourceNode");
                  
                    if(typeof droppedNode != "undefined" && droppedNode != null && droppedNode.data.type == 'appresource-dir'){
                    
                      appBuilder.common_core.processDroppedNode(droppedNode,dtRelativeToNode,function(relPath,appConfig){
                         $(element).val(relPath);
                      });
                    }
                  }
               });          
            },
            processDroppedNode:function(droppedNode,targetNode,callback){
                var relPath  = appBuilder.common_core.getRelPath(droppedNode);
                var fullPath = relPath;
                              
              
                
                //if it is a crud definition, append extension
                if(droppedNode.data.type != 'appresource' && 
                   droppedNode.parent.data.type != "appresource-dir"
                   && droppedNode.parent.data.type != "appresource-root"){
                  
                  var ext =  appBuilder.common_core.definitionTypeToMime(droppedNode.data.type);
                  if(ext == 'unknown')
                    return;
                  
                  relPath = relPath +"."+ext;
                }
                
              
                var appConfig = appBuilder.common_core.findApp(relPath);
                if(appConfig != null && relPath.indexOf(appConfig.baseDir) == 0)
                  relPath = relPath.substring(appConfig.baseDir.length);
                
                
                if(targetNode){//relativize the path
                  
                  var targetPath  = appBuilder.common_core.getRelPath(targetNode);
                  if(appConfig != null && targetPath.indexOf(appConfig.baseDir) == 0)
                    targetPath = targetPath.substring(appConfig.baseDir.length);                        
                  
                  if(appConfig != null && targetPath.indexOf(appConfig.baseDir) == 0)
                    targetPath = targetPath.substring(appConfig.baseDir.length);
                  
                  var relativizedPath = appBuilder.common_core.getRelativePath(targetPath,relPath);
                  if(relativizedPath != null)
                    relPath = relativizedPath;
                  else
                    relPath = relPath;
                }
                else
                  relPath = relPath;
              
              
                callback(relPath,appConfig,fullPath,droppedNode);
            },
            setDroppableReferenceVal:function(prefix,id,relPath,dtCrudNode){
                var pathPart = this.getNonNullVal(relPath).split('/');
                var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                
                if(relPath == '/')
                  executableName = '/';
              
                $("#"+prefix+"-path-label-drop-"+id+" span").html(executableName != ''?('<a href="">'+executableName+'</a>'):'Drop reference here.');
                $('#'+prefix+'-path-label-drop-'+id).attr('title',executableName != ''?relPath:'');
                
                          
                $('#'+prefix+'-path-label-drop-'+id).tooltip('option','disabled',false); 
                $('#'+prefix+'-path-label-drop-'+id).tooltip('option','content',relPath);              
              
                $("#"+prefix+"-path-label-drop-"+id+" span").find('a').unbind("click").click(function(event){
                   event.preventDefault();
                  
                   console.log("absolute path "+appBuilder.common_core.getAbsolutePath(relPath,dtCrudNode));
                  
                   appBuilder.openResource(appBuilder.common_core.getAbsolutePath(relPath,dtCrudNode));
                   return false;
                }).css({"color":"#729fcf"});                                              
            },
  			createDroppableReferenceView:function(prefix,id,onDrop, delCb,targetNode){
                var _this = this;
              
                $('#'+prefix+'-path-label-drop-'+id).tooltip();
              
                $('#'+prefix+'-clear-path-button-'+id).button({
                  text: false,
                  icons: {
                    primary: "ui-icon-trash"
                  }
                }).click(function(){
                    $('#'+prefix+'-path-'+id).val('');                      
                    $('#'+prefix+"-path-label-drop-"+id+" span").html('Drop reference here.');
                    $('#'+prefix+'-path-label-drop-'+id).tooltip('option','disabled',true); 
                    
                  
                    if(typeof delCb != "undefined"){
                       delCb();
                    }                                                    
                    return false;
                });
                
                
                $("#"+prefix+"-path-label-drop-"+id).droppable({
                  //activeClass: "ui-state-default",
                  hoverClass: "ui-state-hover", 
                  greedy: true,
                  tolerance:"touch",
                  accept:function(){return true;},
                  drop: function( event, ui ) {
                    var droppedNode = ui.helper.data("dtSourceNode");
                    
                    if(typeof droppedNode != "undefined" && droppedNode != null /*&& droppedNode.data.type != 'appresource-dir'*/){
                      
                      appBuilder.common_core.processDroppedNode(droppedNode,targetNode,function(relPath,appConfig,fullPath,droppedNode){                       

                          /*
                          var pathPart = appBuilder.common_core.getNonNullVal(relPath).split('/');
                          var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                          
                          $("#"+prefix+"-path-label-drop-"+id+" span").html(executableName);
                          $('#'+prefix+'-path-'+id).val(relPath);
                          
                          
                          $('#'+prefix+'-path-label-drop-'+id).tooltip('option','disabled',false); 
                          $('#'+prefix+'-path-label-drop-'+id).tooltip('option','content',relPath);
                          */
                          appBuilder.common_core.setDroppableReferenceVal(prefix,id,relPath);
                        
                          if(typeof onDrop != "undefined"){
                            onDrop(relPath,$("#"+prefix+"-path-label-drop-"+id+" a").text(),appConfig,fullPath,droppedNode);
                          }                        
                      });
                    }
                  }
                });     
  			},
            current_statement:null,
            showAppDirNav:function(id,seltr,src_component){
                var _this = this;
                appBuilder.appDirNavActionHandler = function(){
                    var treeControl = $("#app-directory-navigator-treecontrol").dynatree('getTree');

                    var activeNode = treeControl.getActiveNode();
                    if(activeNode != null){
                        $('#'+src_component+'-'+seltr+'execution-path-'+id).val(activeNode.data.relPath);
                        
                        var pathPart = _this.getNonNullVal(activeNode.data.relPath).split('/');
                        var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                        $('#'+src_component+'-'+seltr+'execution-path-label-'+id).html(executableName);
                    }
                }
                appBuilder.showAppDirNav();
            },
            getNonNullVal:function(val){
              if(typeof val == 'undefined' || val == null)return '';
              return val;
            },            
            createParameterTable:function(mainScope){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;
                var block = {
                    get:function(src_component,mainScope){
                        return {url:'x',
                        datatype: "local",
                        postData:{},
                        colNames:['Name','Required','Final','Type','','Default Value','Eval (l/r)',''],
                        colModel:
                            [
                                {name:'name',index:'name', align:'center',sortable:false,title:false},
                                {name:'required',index:'required', align:"center",width:"48",sortable:false,title:false},
                                {name:'is_final',index:'is_final', align:"center",width:"48",sortable:false,title:false},
                                {name:'type',index:'type',align:"center",sortable:false,width:"96",title:false},                                    
                                {name:'validation',index:'validation', align:"center",width:"64",sortable:false,title:false},
                                {name:'default',index:'default', align:"center",sortable:false,title:false},
                                {name:'eval_lr',index:'eval_lr', align:"center",width:"64",sortable:false,title:false},
                                {name:'actions',index:'actions', align:'center',width:"55",sortable:false,title:false}
                            ],
                            loadComplete:function(){

                            var loadParameters = function(mainScope,executionParameters){

                                for(var j=0;j<executionParameters.length;j++){
                                    var param = executionParameters[j];
                                    var keyPart2 = mainScope.keyPart+'-'+param.id;
                                    appBuilder.common_core.insertParameter({param:keyPart2,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component,param:param});
                                }

                                //add default row for add new parameters
                                appBuilder.common_core.insertParameter({param:mainScope.keyPart,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component});
                            }

                            var data ={"definition_id":mainScope.definitionId};
                            data[mainScope.definitionIdParameter] = mainScope.definitionId;
                            $.ajax({
                                data:data,
                                type:'POST',
                                url:"/api/nvp-processing/get-execution-parameters.stm",
                                success:function(data){
                                    var executionParameters = eval('('+data+')');
                                    loadParameters(mainScope,executionParameters);
                                }
                            });                                                
                        },
                        rowNum:-1,
                        rowList:[],
                        "height":"auto",
                        viewrecords: true,
                        autowidth: true
                      };
                    }   
                };    
                
                $("#"+mainScope.src_component+"-execution-parameter-table-"+mainScope.keyPart).jqGrid(block.get(mainScope.src_component,mainScope))
                .sortableRows({
                    /*cancel:"input,textarea,button,select,option,a",*/
                    update:function(){                                  
                      var idList = $(this).getDataIDs();
                      var definitionId = mainScope.keyPart;
                      
                      for(var i=0;i<idList.length;i++){
                        _this.updateExecutionParameterPosition(definitionId,idList[i],mainScope.src_component,i);
                      }
                    }
               	});        
              
              	
                $("#"+mainScope.src_component+"-execution-parameter-definition-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.81,"background-color":"white","overflow":"auto"});

            },
            createSecurityTable:function(mainScope,options){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;  
                
                
                appBuilder.setCheckStatus($("#"+src_component+"-security-serverside-"+mainScope.keyPart),mainScope.definition.serverSideOnly);
                $("#"+src_component+"-security-serverside-"+mainScope.keyPart).change(function(){
                    
                    var serverSideOnly = appBuilder.getCheckStatus($("#"+src_component+"-security-serverside-"+mainScope.keyPart));
                    $.blockUI();
                    $.ajax({
                        data:{
                            "id":mainScope.definitionId,
                            "serverSideOnly":serverSideOnly
                        },
                        type:'POST',
                        url:"/api/primary-execution/crud-definition/update-crud-serverside.stm",
                        success:function(data){
                            $.unblockUI();
                            _this.markModified(src_component,mainScope.definitionId);
                        }
                    });                     
                });
              
                appBuilder.setCheckStatus($("#"+src_component+"-security-requireallidentities-"+mainScope.keyPart),mainScope.definition.requireAllIdentities);
                $("#"+src_component+"-security-requireallidentities-"+mainScope.keyPart).change(function(){
                    
                    var requireAllIdentities = appBuilder.getCheckStatus($("#"+src_component+"-security-requireallidentities-"+mainScope.keyPart));
                    $.blockUI();
                    $.ajax({
                        data:{
                            "id":mainScope.definitionId,
                            "requireAllIdentities":requireAllIdentities
                        },
                        type:'POST',
                        url:"/api/primary-execution/crud-definition/update-crud-requireallidentities.stm",
                        success:function(data){
                            $.unblockUI();
                            _this.markModified(src_component,mainScope.definitionId);
                        }
                    });                     
                });              
              
                
                var block = {
                    get:function(mainScope){
                        return {url:'x',
                                    datatype: "local",
                                    postData:{},
                                    colNames:['User Identity', ''],
                                    colModel:[
                                            {name:'user_identity',index:'user_identity', align:'center',sortable:false},
                                            {name:'actions',index:'actions', align:'center',width:'64',sortable:false}
                                        ],
                                    loadComplete:function(){
                                            
                                        var loadAccessControls = function(mainScope,accessControls){                                            
                                            for(var i=0;i<accessControls.length;i++){
                                                var access_control = accessControls[i];
                                                var keyPart2 = mainScope.keyPart+'-'+access_control.id
                                                appBuilder.common_core.insertAccessControl({access_control:keyPart2,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component,access_control:access_control});                                                    
                                            }
                                            
                                            //add default row for add new accesscontrol
                                            appBuilder.common_core.insertAccessControl({access_control:mainScope.keyPart,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component});                                            
                                        }
                                        
                                        var data ={"definition_id":mainScope.definitionId};
                                        data[mainScope.definitionIdParameter] = mainScope.definitionId;                                        
                                        $.ajax({
                                            data:data,
                                            type:'POST',
                                            url:"api/access-control/get-accesscontrols.stm",
                                            success:function(data){
                                                var accessControls = eval('('+data+')');
                                                loadAccessControls(mainScope,accessControls);
                                            }
                                        });                                            
                                    },
                                    rowNum:-1,
                                    rowList:[],                                        
                                    viewrecords: true,
                                    autowidth: true,
                                    //width:(typeof options != "undefined" && typeof options.width != "undefined"?options.width:512),
                                    "height":"auto",
                                    sortorder: "desc"/*,
                                    caption:"Security"*/
                          };
                    }
                };              
                $("#"+src_component+"-security-table-"+mainScope.keyPart).jqGrid(block.get(mainScope))
                .sortableRows(
                  {
                    update:function(){
                                      var idList = $(this).getDataIDs();
                                      var definitionId = mainScope.keyPart;
                                      
                                      for(var i=0;i<idList.length;i++){
                                         _this.updateAccessControlPosition(definitionId,idList[i],mainScope.src_component,i);
                                      }
                  }});
              
                $("#"+mainScope.src_component+"-security-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.9,"background-color":"white","overflow":"auto"});
            },
            createPreExecutionHandlerTable:function(mainScope,handler_prefix){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;
                var block = {
                    get:function(mainScope){
                        return {url:'x',
                        datatype: "local",
                        postData:{},
                        colNames:['Enable','Path','Arguments & Returns'/*, 'Require True','Return Var Name'*/,''],
                        colModel:
                            [
                                {name:'enable',index:'enable', align:"center",width:"48",sortable:false,"title":false},                                
                                {name:'path',index:'path', align:'left',width:"256",sortable:false,"title":false},
                                {name:'arg_propagation',index:'arg_propagation', align:'left',width:"256",sortable:false,"title":false},
                                /*{name:'only_proceedon_true',index:'only_proceedon_true', align:"center",width:"48",sortable:false,"title":false},
                                {name:'returnval_name',index:'returnval_name', align:"center",width:"128",sortable:false,"title":false},
                                */{name:'actions',index:'actions', align:'center',width:"48",sortable:false,"title":false}
                            ],
                        loadComplete:function(){
                               
                                var loadExecutionHandlers = function(mainScope,executionHandlers){
                                    
                                    for(var j=0;j<executionHandlers.length;j++){
                                        var handler = executionHandlers[j];
                                        var keyPart2 = handler.id;                                        
                                        appBuilder.common_core.insertPreExecutionHandler({execution_handler:keyPart2,table:mainScope.keyPart,handler_prefix:handler_prefix},{before:true,insert:true,src_component:src_component,execution_handler:handler});
                                    }
                                };
                                $.ajax({
                                    data:{
                                        "definition_id":mainScope.definitionId
                                    },
                                    type:'POST',
                                    url:"/api/"+handler_prefix+"-execution/get-"+handler_prefix+"execution-handlers.stm",
                                    success:function(data){
                                        var executionHandlers = eval('('+data+')');
                                        loadExecutionHandlers(mainScope,executionHandlers);
                                    }
                                });                                
                               
                                //add default row for add new handler
                                appBuilder.common_core.insertPreExecutionHandler({execution_handler:mainScope.keyPart,table:mainScope.keyPart,handler_prefix:handler_prefix},{before:false,insert:true,src_component:src_component});
                        },
                        rowNum:-1,
                        rowList:[],
                        "height":"auto",
                        viewrecords: true,
                        autowidth: true
                      };
                    }   
                };    
                $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+mainScope.keyPart).jqGrid(block.get(mainScope))
                .sortableRows({                       
                        update:function(){
                            var idList = $(this).getDataIDs();
                            var definitionId = mainScope.keyPart;
                            
                            for(var i=0;i<idList.length;i++){
                              _this.updatePreExecutionHandlerPosition(definitionId,idList[i],mainScope.src_component,"pre",i);
                            }
                        }});
              
                $("#"+mainScope.src_component+"-"+handler_prefix+"execution-handler-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.9,"background-color":"white","overflow":"auto"});            
            },
            createPostExecutionHandlerTable:function(mainScope,handler_prefix){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;
                var block = {
                    get:function(mainScope){
                        return {url:'x',
                        datatype: "local",
                        postData:{},
                        colNames:['Enable','Path','Arguments & Returns'/*, 'Primary Result','Return Mode','Return Var Name'*/,  ''],
                        colModel:
                            [
                              {name:'enable',index:'enable', align:"center",width:"48",sortable:false,"title":false,hidden:false},                                
                                {name:'path',index:'path', align:'left',width:"256",sortable:false,"title":false,hidden:false},
                                {name:'arg_propagation',index:'arg_propagation', align:'left',width:"256",sortable:false,"title":false,hidden:false},
                                /*{name:'primary_result_var_name',index:'primary_result_var_name', align:"center",width:"128",sortable:false,"title":false,hidden:false},
                                {name:'returnmode',index:'returnmode', align:"center",width:"128",sortable:false,"title":false,hidden:false},                                
                                {name:'returnval_name',index:'returnval_name', align:"center",width:"128",sortable:false,"title":false,hidden:false},
                                */{name:'actions',index:'actions', align:'center',width:"64",sortable:false,"title":false,hidden:false}
                            ],
                        loadComplete:function(){

                                var loadExecutionHandlers = function(mainScope,executionHandlers){
                                    
                                    for(var j=0;j<executionHandlers.length;j++){
                                        var handler = executionHandlers[j];
                                        var keyPart2 = handler.id;
                                        appBuilder.common_core.insertPostExecutionHandler({execution_handler:keyPart2,table:mainScope.keyPart,handler_prefix:handler_prefix},{before:true,insert:true,src_component:src_component,execution_handler:handler});
                                    }
                                };
                                $.ajax({
                                    data:{
                                        "definition_id":mainScope.definitionId
                                    },
                                    type:'POST',
                                    url:"/api/"+handler_prefix+"-execution/get-"+handler_prefix+"execution-handlers.stm",
                                    success:function(data){
                                        var executionHandlers = eval('('+data+')');
                                        loadExecutionHandlers(mainScope,executionHandlers);
                                    }
                                });  
                                //add default row for add new handler
                                appBuilder.common_core.insertPostExecutionHandler({execution_handler:mainScope.keyPart,table:mainScope.keyPart,handler_prefix:handler_prefix},{before:false,insert:true,src_component:src_component});
                        },
                        rowNum:-1,
                        rowList:[],
                        "height":"auto",
                        viewrecords: true,
                        autowidth: true                
                      };
                    }   
                };    
                $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+mainScope.keyPart).jqGrid(block.get(mainScope))
                .sortableRows(
                  {
                        update:function(){
                            var idList = $(this).getDataIDs();
                            var definitionId = mainScope.keyPart;
                            
                            for(var i=0;i<idList.length;i++){
                              _this.updatePostExecutionHandlerPosition(definitionId,idList[i],mainScope.src_component,"post",i);
                            }
                        }                
                });
              
                $("#"+mainScope.src_component+"-"+handler_prefix+"execution-handler-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.9,"background-color":"white","overflow":"auto"});
              
            },            
            createPreView:function(mainScope){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;
                
                
                $("#"+src_component+"-preexecution-path-"+mainScope.keyPart).val(mainScope.definition.preExecutionHandler);
                appBuilder.setCheckStatus($("#"+src_component+"-preexecution-enabled-"+mainScope.keyPart),mainScope.definition.enablePreExecutionHandler);
                appBuilder.setCheckStatus($("#"+src_component+"-preexecution-proceedon-"+mainScope.keyPart),mainScope.definition.proceedOnPreExecutionHandler);
                
                var pathPart = _this.getNonNullVal(mainScope.definition.preExecutionHandler).split('/');
                var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                //$('#'+src_component+'-preexecution-path-label-'+mainScope.keyPart).html(executableName);                
                                
                $("#"+src_component+"-preexecution-path-label-drop-"+mainScope.keyPart+" span").html(executableName != ''?executableName:'Drop reference here.');
                $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).attr('title',executableName != ''?mainScope.definition.preExecutionHandler:'');
                $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip();
                
                
                $('#'+src_component+'-preexecution-path-button-'+mainScope.keyPart).button({
                        text: false,
                        icons: {
                                primary: "ui-icon-search"
                        }
                }).css({"display":"none"}).click(function(){
                    _this.showAppDirNav(mainScope.keyPart,'pre',src_component);
                    return false;
                }); 
                
                $('#'+src_component+'-preexecution-clear-path-button-'+mainScope.keyPart).button({
                        text: false,
                        icons: {
                                primary: "ui-icon-trash"
                        }
                }).click(function(){
                    $('#'+src_component+'-preexecution-path-'+mainScope.keyPart).val('');                      
                    //$('#'+src_component+'-preexecution-path-label-'+mainScope.keyPart).html('');
                    $("#"+src_component+"-preexecution-path-label-drop-"+mainScope.keyPart+" span").html('Drop reference here.');
                    $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','disabled',true); 
                    
                    return false;
                });                
                
                $("#"+src_component+"-preexecution-path-label-drop-"+mainScope.keyPart).droppable({
                    //activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover", 
                    greedy: true,
                    tolerance:"touch",
                    accept:function(){return true;},
                    drop: function( event, ui ) {
                        var droppedNode = ui.helper.data("dtSourceNode");
                        
                        if(typeof droppedNode != "undefined" && droppedNode != null && droppedNode.data.type != 'appresource-dir'){
                            var relPath = _this.getRelPath(droppedNode);
                            var pathPart = _this.getNonNullVal(relPath).split('/');
                            var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        

                            $("#"+src_component+"-preexecution-path-label-drop-"+mainScope.keyPart+" span").html(executableName);
                            $('#'+src_component+'-preexecution-path-'+mainScope.keyPart).attr('value',relPath);
                            $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','disabled',false); 
                            $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','content',relPath);
                        }
                    }
                });
                
                
                this.createPreExecutionHandlerTable(mainScope,'pre');
            },
            createPostView:function(mainScope){
                var _this = this;
                this.src_component = mainScope.src_component;
                var src_component = mainScope.src_component;
                
                
                $("#"+src_component+"-postexecution-path-"+mainScope.keyPart).val(mainScope.definition.postExecutionHandler);
                appBuilder.setCheckStatus($("#"+src_component+"-postexecution-enabled-"+mainScope.keyPart),mainScope.definition.enablePostExecutionHandler);
                $("#"+src_component+"-postexecution-returnmode-"+mainScope.keyPart).val(mainScope.definition.postExecutionHandlerReturnMode);
                $("#"+src_component+"-postexecution-returnvalname-"+mainScope.keyPart).val(mainScope.definition.postExecutionHandlerReturnValName);
                
                var pathPart = _this.getNonNullVal(mainScope.definition.postExecutionHandler).split('/');
                var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                //$('#'+src_component+'-postexecution-path-label-'+mainScope.keyPart).html(executableName);                
                
                $("#"+src_component+"-postexecution-path-label-drop-"+mainScope.keyPart+" span").html(executableName != ''?executableName:'Drop reference here.');
                $('#'+src_component+'-postexecution-path-label-drop-'+mainScope.keyPart).attr('title',executableName != ''?mainScope.definition.postExecutionHandler:'');
                $('#'+src_component+'-postexecution-path-label-drop-'+mainScope.keyPart).tooltip();                
                
                
                $('#'+src_component+'-postexecution-path-button-'+mainScope.keyPart).button({
                        text: false,
                        icons: {
                                primary: "ui-icon-search"
                        }
                }).css({"display":"none"}).click(function(){
                    _this.showAppDirNav(mainScope.keyPart,'post',src_component);
                    return false;
                }); 
                
                $('#'+src_component+'-postexecution-clear-path-button-'+mainScope.keyPart).button({
                        text: false,
                        icons: {
                                primary: "ui-icon-trash"
                        }
                }).click(function(){
                    $('#'+src_component+'-postexecution-path-'+mainScope.keyPart).val('');                      
                    //$('#'+src_component+'-postexecution-path-label-'+mainScope.keyPart).html('');                    
                    $("#"+src_component+"-postexecution-path-label-drop-"+mainScope.keyPart+" span").html('Drop reference here.');
                    $('#'+src_component+'-postexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','disabled',true); 
                    return false;
                });
                
                
                $("#"+src_component+"-postexecution-path-label-drop-"+mainScope.keyPart).droppable({
                    //activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover", 
                    greedy: true,
                    tolerance:"touch",
                    accept:function(){return true;},
                    drop: function( event, ui ) {
                        var droppedNode = ui.helper.data("dtSourceNode");
                        
                        if(typeof droppedNode != "undefined" && droppedNode != null && droppedNode.data.type != 'appresource-dir'){
                            var relPath = _this.getRelPath(droppedNode)
                            var pathPart = _this.getNonNullVal(relPath).split('/');
                            var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        

                            $("#"+src_component+"-postexecution-path-label-drop-"+mainScope.keyPart+" span").html(executableName);
                            $('#'+src_component+'-postexecution-path-'+mainScope.keyPart).attr('value',relPath);
                            $('#'+src_component+'-postexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','disabled',false); 
                            $('#'+src_component+'-postexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','content',relPath);
                        }
                    }
                });                
                                
                this.createPostExecutionHandlerTable(mainScope,'post');
            },            
            insertAccessControl:function(keyPart,options){
                var _this = this;
                var src_component = this.src_component;   
                if(options.insert){
                    var actions = "";
                    if(typeof options.access_control == "undefined"){
                        var da = "<button title=\"Add\" onclick=\"appBuilder.common_core.addAccessControl('"+keyPart.table+"','"+src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
                        actions = da;
                    }else{
                        var de = "<button title=\"Delete\" onclick=\"appBuilder.common_core.deleteAccessControl('"+options.access_control.definitionId+"','"+options.access_control.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                        var ds = "<button title=\"Update\" onclick=\"appBuilder.common_core.updateAccessControl('"+options.access_control.definitionId+"','"+options.access_control.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
                        actions = ds+' '+de;
                    }
                
                    
                    var row = 
                    {
                        "actions":"<div style=\"padding:8px\">"+actions+"</div>",
                        "user_identity":_this.droppableReferenceHTML('accesscontrol-user',keyPart.access_control)+  "<input type=\"hidden\" id=\""+src_component+"-accesscontrol-user_identity-"+keyPart.access_control+"\"/>"
                    };                      
                    
                    if(options.before)
                        $("#"+src_component+"-security-table-"+keyPart.table).addRowData(options.access_control.id,row,"before",0); 
                    else
                        $("#"+src_component+"-security-table-"+keyPart.table).addRowData(typeof options.access_control != "undefined"?options.access_control.id:0,row); 
                }
                
				var dtCrudNode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(keyPart.table);
                
                appBuilder.common_core.createDroppableReferenceView
                (  'accesscontrol-user',
                   keyPart.access_control,
                 	function(relPath){
                     $("#"+src_component+"-accesscontrol-user_identity-"+keyPart.access_control).val(relPath);
                   },
                   function(){
                     $("#"+src_component+"-accesscontrol-user_identity-"+keyPart.access_control).val('');
                   },dtCrudNode
                );              
              	appBuilder.common_core.setDroppableReferenceVal('accesscontrol-user',keyPart.access_control,typeof options.access_control != "undefined"?options.access_control.userIdentity:"",dtCrudNode);
              
                
                $("#"+src_component+"-accesscontrol-user_identity-"+keyPart.access_control).val(typeof options.access_control != "undefined"?options.access_control.userIdentity:"");

            },
            deleteAccessControl:function(definition_id,id,src_component){
                var _this = this;
              
              	 
                 if(!confirm("Are you sure you want to delete this access control?"))return;
                 
                 $.blockUI();
                 
                 var keyPart = definition_id;
                 $.ajax({
                    type:'POST',
                    data:{
                        "definition_id":definition_id,
                        "id":id
                    },
                    url:"/api/access-control/delete-accesscontrol.stm",
                    success:function(data){     
                        _this.markModified(src_component,definition_id);
                        $.unblockUI();
                        $("#"+src_component+"-security-table-"+keyPart).delRowData(id);                        
                    }
                });                    
            },
            addAccessControl:function(definition_id,src_component){
                
                var _this = this;
                this.src_component = src_component;
                var keyPart = definition_id;
                

                 var userIdentity     = $("#"+src_component+"-accesscontrol-user_identity-"+keyPart).val();
                 var position = $("#"+src_component+"-security-table-"+keyPart).getDataIDs().length-1;                
                 
                 var access_control = 
                 {
                    "definitionId":definition_id,
                    "userIdentity":userIdentity,
                    "position":position
                 };
                 
                 $.blockUI();
                 $.ajax({
                    type:'POST',
                    data:access_control,
                    url:"/api/access-control/add-accesscontrol.stm",
                    success:function(data){    
                        _this.markModified(src_component,definition_id);
                        $.unblockUI();
                        
                        /*--
                        var reply = eval('('+data+')');
                        if(reply.status != 'success'){
                            alert("An error occured adding access control.");
                            return;
                        }*/
                        
                        //var access_control = reply.accessControl;
                        
                        access_control.id = /*_this.stripNewLine*/(""+data).trim();
                        
                        var keyPart2 = keyPart+'-'+access_control.id;
                        _this.insertAccessControl({table:keyPart,access_control:keyPart2},{"before":true,"insert":true,src_component:src_component,access_control:access_control});

                        //reset default
                        _this.insertAccessControl({table:keyPart,access_control:keyPart},{"insert":false,src_component:src_component});
                    }
                });                
            },
            updateAccessControlPosition:function(definition_id,id,src_component,position){           
                
                var _this = this;
                var param = 
                {
                    "position":position,
                    "definitionId":definition_id,
                    "id":id
                };
                
                param[src_component+"_id"] = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"/api/access-control/update-accesscontrol-position.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            //var reply = eval('('+data+')');                                                        
                        }
               });                
            },
            updateAccessControl:function(definition_id,id,src_component){
                 var keyPart = definition_id+'-'+id;
                 var _this = this;
              
                 var userIdentity    = $("#"+src_component+"-accesscontrol-user_identity-"+keyPart).val();   
                 
                 var access_control = 
                 {
                    "definition_id":definition_id,
                    "id":id,
                    "userIdentity":userIdentity
                 };                                  
                 $.blockUI();
                 $.ajax({
                    type:'POST',
                    data:access_control,
                    url:"/api/access-control/update-accesscontrol.stm",
                    success:function(data){
                        _this.markModified(src_component,definition_id);
                        $.unblockUI();
                    }
                });                
            },// actual addTab function: adds new tab using the input from the form above    
            addTab:function(tabs,tabId,tabTitle) {               
                
                var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close ui-icon-close-right' role='presentation'>Remove Tab</span></li>";
                var label = tabTitle,
                li = $( tabTemplate.replace( /#\{href\}/g, "#" + tabId ).replace( /#\{label\}/g, label ) );
                tabs.find( ".ui-tabs-nav" ).append( li );
                tabs.append( "<div id='" + tabId + "'></div>" );
                tabs.tabs( "refresh" );
                
                return tabs.find( ".ui-tabs-nav li" ).length;
            },
            tabCloseBinding:function(tabs,cb){
              
              //var tabctrl = tabctrlx?tabctrlx:$('#tabs');
              
               // close icon: removing the tab on click
               tabs.delegate( "span.ui-icon-close", "click", function() {
                    var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
                    
                    //disable editor if it is active
                    if($("#"+panelId).data("editor")){
                       appBuilder.editor_toolbar.removeEditor($("#"+panelId).data("editor"));
                    }
                   
                    if(typeof appBuilder.beforeCloseCallBacks[panelId] == "function"){                  	
                        appBuilder.beforeCloseCallBacks[panelId](panelId);
                        delete appBuilder.beforeCloseCallBacks[panelId](panelId);
                    }

                    if(typeof cb == 'function')
                        cb(panelId);
                  
					appBuilder.appresource_tab_type = "";
                  
                 	//call close callbacks
                 	var onClose = $( "#" + panelId+"-content" ).data("onClose");
                 	
                    if(onClose){
                      
                      for(var cb=0;cb<onClose.length;cb++){                         
                         onClose[cb]();
                         delete onClose[cb];
                      }
                    }
                 
                 
                    //call deactivate callbacks
                    var onActivate = $( "#" + panelId+"-content" ).data("onActivate");
                    
                    if(onActivate){
                      
                      for(var cb=0;cb<onActivate.length;cb++){
                        delete onActivate[cb];
                      }
                    }                 
                 
                 
                    //call deactivate callbacks
                    var onDeactivate = $( "#" + panelId+"-content" ).data("onDeactivate");
                    
                    if(onDeactivate){
                      
                      for(var cb=0;cb<onDeactivate.length;cb++){
                        delete onDeactivate[cb];
                      }
                    }                 
                 
                 	
                    
                    $( "#" + panelId+"-content" ).remove();
                    $( "#" + panelId ).remove();
                    
                    
                  
                    tabs.tabs( "refresh" );       
                    appBuilder.onApplicationEditorTabClose(panelId); 
                    tabs.removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                });
              
                tabs.bind( "keyup", function( event ) {
                    if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
                        var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
                        $( "#" + panelId ).remove();
                        tabs.tabs( "refresh" );
                    }
                }); 
            },
            showArgumentView:function(src_component,type,id){
                
                $("#"+src_component+"-execution-parameter-field-validation-value-range-wrapper-"+id).css("display","none");
                $("#"+src_component+"-execution-parameter-field-validation-date-wrapper-"+id).css("display","none");
                $("#"+src_component+"-execution-parameter-field-validation-url-wrapper-"+id).css("display","none");
                $("#"+src_component+"-execution-parameter-field-validation-mask-wrapper-"+id).css("display","none");
                //alert(src_component+","+type+","+id)
                
                if(type == "integer" || type == "float" || type == "double" || type == "long")
                    $("#"+src_component+"-execution-parameter-field-validation-value-range-wrapper-"+id).css("display","block");
                else
                if(type == "date")
                    $("#"+src_component+"-execution-parameter-field-validation-date-wrapper-"+id).css("display","block");
                else
                if(type == "url")
                    $("#"+src_component+"-execution-parameter-field-validation-url-wrapper-"+id).css("display","block");
                else
                if(type == "mask")
                    $("#"+src_component+"-execution-parameter-field-validation-mask-wrapper-"+id).css("display","block");

            },
            showValidationView:function(){
                
            },
            createValidationView:function(src_component,id){
              
              
              $("#"+src_component+"-validation-panel-trigger-"+id).qtip({
                    content: {
                            text: $("#"+src_component+"-validation-panel-"+id)/*, 
                            title: {
                                    text: 'Find & Replace',
                                    button: true
                            }*/
                    },
                    position: {
                            my: 'top center', // Use the corner...
                            at: 'bottom center' // ...and opposite corner
                    },
                    show: {
                            event: 'click', // Don't specify a show event...
                            ready: false // ... but show the tooltip when ready
                    },
                    hide: {event: 'unfocus'}, // Don't specify a hide event either!
                    style: {
                            classes: 'qtip-shadow qtip-bootstrap qtip-container'
                    },
                    events: 
                    {
                        show: function(event, api) {                        
                            //$("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).css({"display":"block"});
                        }
                    },
                    api:{
                        onRender:function(){
                            //$("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).parent().css({"padding":"2px"});                              
                        }
                    }
                });               
                
                $("#"+src_component+"-validation-panel-trigger-"+id).parent().css({"cursor":"auto"}).removeClass("ui-corner-top ui-state-default").unbind();
            },
            createCodeMirrorEditor:function(config){
                var _this = this;
                var editor = CodeMirror.fromTextArea(document.getElementById(config.elid), {
                mode:config.mode,                              
                lineNumbers: true,                              
                matchBrackets: true});
                editor.on("change",function(editor){editor.contentModified = true;});
				
              	if(typeof config.content != "undefined")
                	appBuilder.setRegisteredEditorContent(editor,config.content);
              
                //mainScope.dataStatement.sqlEditor.setValue(data);
                appBuilder.editor_toolbar.setEditor(editor);
              
                appBuilder.registeredEditors.push(
                {
                    "tabid": config.tabid,
                    url:config.updateUrl,
                    params:config.updateParams,                                                            
                    onSave:function(){
                        if(typeof config.onSave != "undefined")
                        	config.onSave();
                    },
                    editor:editor
                });
                return editor;
            },
            insertParameter:function(keyPart,options){
                var _this = this;
                var src_component = this.src_component;
                if(options.insert)
                {
                    var actions = "";
                    if(typeof options.param == "undefined"){
                        var as = "<button title=\"Add\" onclick=\"appBuilder.common_core.addExecutionParameter('"+keyPart.table+"','"+src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";                    
                        actions = as;
                    }else{
                        var de = "<button title=\"Delete\" onclick=\"appBuilder.common_core.deleteExecutionParameter('"+options.param.definitionId+"','"+options.param.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                        var ds = "<button title=\"Update\" onclick=\"appBuilder.common_core.updateExecutionParameter('"+options.param.definitionId+"','"+options.param.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Save</span></button>";
                        actions = ds+" "+de;
                    }
                    
                    var paramLength = "<div><table class=\"ui-widget-header ui-widget-content\" style=\"border-style:none\"><tr><td  style=\"border-style:dashed;border-width:1px\">min</td><td  style=\"border-style:dashed;border-width:1px\">max</td><td  style=\"border-style:dashed;border-width:1px\">line end length</td></tr><tr><td  style=\"border-style:dashed;border-width:1px\"><input type=\"text\" size=\"3\" id=\""+src_component+"-execution-parameter-field-length_range-min-"+keyPart.param+"\"/></td><td  style=\"border-style:dashed;border-width:1px\"><input type=\"text\" size=\"3\" id=\""+src_component+"-execution-parameter-field-length_range-max-"+keyPart.param+"\"/> </td><td  style=\"border-style:dashed;border-width:1px\"><input type=\"text\" size=\"3\" id=\""+src_component+"-execution-parameter-field-length_range-linelength-"+keyPart.param+"\"/></td></tr></table></div>";
                    var rangeInput = "<div style=\"display:none\"  id=\""+src_component+"-execution-parameter-field-validation-value-range-wrapper-"+keyPart.param+"\"><table class=\"ui-widget-content ui-widget-header\" style=\"border-style:none\"><tr><td style=\"border-style:dashed;border-width:1px\">min</td><td style=\"border-style:dashed;border-width:1px\">max</td></tr><tr><td style=\"border-style:dashed;border-width:1px\"><input size=\"3\" type=\"text\" id=\""+src_component+"-execution-parameter-field-validation-value-range-min-"+keyPart.param+"\"/></td><td style=\"border-style:dashed;border-width:1px\"><input type=\"text\" size=\"3\" id=\""+src_component+"-execution-parameter-field-validation-value-range-max-"+keyPart.param+"\"/></td></tr></table></div>";
                    var dateInput = "<div style=\"display:none\"  id=\""+src_component+"-execution-parameter-field-validation-date-wrapper-"+keyPart.param+"\"><table class=\"ui-widget-content ui-widget-header\" style=\"border-style:none\"><tr><td style=\"border-style:dashed;border-width:1px\" colspan=\"2\">format</td></tr><tr><td style=\"border-style:dashed;border-width:1px\" colspan=\"2\"><input type=\"text\" id=\""+src_component+"-execution-parameter-field-validation-date-format-"+keyPart.param+"\"/></td></tr><tr><td style=\"border-style:dashed;border-width:1px\">Strict</td><td style=\"border-style:dashed;border-width:1px\"> <input type=\"checkbox\" id=\""+src_component+"-execution-parameter-field-validation-date-format-strict-"+keyPart.param+"\"/></td></tr></table></div>";
                    var urlInput = "<div style=\"display:none\"  id=\""+src_component+"-execution-parameter-field-validation-url-wrapper-"+keyPart.param+"\"> <table class=\"ui-widget-content ui-widget-header\" style=\"border-style:none\"><tr><td  style=\"border-style:dashed;border-width:1px\">allowallschemes</td><td  style=\"border-style:dashed;border-width:1px\"><input type=\"checkbox\" id=\""+src_component+"-execution-parameter-field-validation-url-allowallschemes-"+keyPart.param+"\"/></td></tr> <tr><td  style=\"border-style:dashed;border-width:1px\">allow2slashes</td><td  style=\"border-style:dashed;border-width:1px\"><input type=\"checkbox\" id=\""+src_component+"-execution-parameter-field-validation-url-allow2slashes-"+keyPart.param+"\"/></td></tr><tr><td  style=\"border-style:dashed;border-width:1px\">nofragments</td><td  style=\"border-style:dashed;border-width:1px\"><input type=\"checkbox\" id=\""+src_component+"-execution-parameter-field-validation-url-nofragments-"+keyPart.param+"\"/></td></tr> <tr><td style=\"border-style:dashed;border-width:1px\" colspan=\"2\">Schemes</td></tr><tr><td style=\"border-style:dashed;border-width:1px\" colspan=\"2\"><input type=\"text\" id=\""+src_component+"-execution-parameter-field-validation-url-schemes-"+keyPart.param+"\"/></td></tr></table></div>";
                    var maskInput = "<div style=\"display:none\"  id=\""+src_component+"-execution-parameter-field-validation-mask-wrapper-"+keyPart.param+"\"><table class=\"ui-widget-content ui-widget-header\" style=\"border-style:none\"><tr><td  style=\"border-style:dashed;border-width:1px\">regex</td></tr><tr><td  style=\"border-style:dashed;border-width:1px\"><input type=\"text\" id=\""+src_component+"-execution-parameter-field-validation-mask-"+keyPart.param+"\"/></td></tr></table></div>";
                    
                    var validationView = "<div style=\"display:none\" id=\""+src_component+"-validation-panel-"+keyPart.param+"\">"+paramLength+rangeInput+dateInput+urlInput+maskInput+"</div>";
					$("body").append(validationView);
                  
                    var dataTypes = "<select id=\""+src_component+"-execution-parameter-field-type-"+keyPart.param+"\">"+this.type_list.join()+"</select>";
                    var row = 
                    {
                        "actions":"<div style=\"padding:2px\">"+actions+"</div>",
                        "required":"<input type=\"checkbox\"  id=\""+src_component+"-execution-parameter-field-required-"+keyPart.param+"\"/>",
                        "is_final":"<input type=\"checkbox\"  id=\""+src_component+"-execution-parameter-field-is_final-"+keyPart.param+"\"/>",
                        "name":"<input type=\"text\" id=\""+src_component+"-execution-parameter-field-name-"+keyPart.param+"\"/>",
                        "type":dataTypes,
                        "default":"<span  id=\""+src_component+"-execution-parameter-field-default-label-"+keyPart.param+"\"><input type=\"text\" id=\""+src_component+"-execution-parameter-field-default-"+keyPart.param+"\"/><input type=\"hidden\" id=\""+src_component+"-execution-parameter-field-default-value-"+keyPart.param+"\"/><button id=\""+src_component+"-execution-parameter-field-default-edit-button-"+keyPart.param+"\">edit</button></span>",
                        "validation":"<a href=\"#\" onclick=\"return false;\" id=\""+src_component+"-validation-panel-trigger-"+keyPart.param+"\">Validation</a>"/*+validationView*/,
                        "eval_lr":"<input type=\"checkbox\"  id=\""+src_component+"-execution-parameter-field-eval_left-"+keyPart.param+"\"/>"+"/<input type=\"checkbox\"  id=\""+src_component+"-execution-parameter-field-eval_right-"+keyPart.param+"\"/>"
                    };
                            
                    if(options.before)
                        $("#"+src_component+"-execution-parameter-table-"+keyPart.table).addRowData(options.param.id,row,"before",0); 
                    else
                        $("#"+src_component+"-execution-parameter-table-"+keyPart.table).addRowData(typeof options.param != "undefined"?options.param.id:0,row); 
                    
                    
                    var tabs = $('#'+src_component+'-execution-parameter-definition-tabs-'+keyPart.table);
                  	_this.tabCloseBinding(tabs,function(panelId){                    	
                      	appBuilder.onApplicationEditorTabClose(panelId);
                    });
                  
                    $("#"+src_component+"-execution-parameter-field-default-edit-button-"+keyPart.param).button({
                            text: false,
                            icons: {
                                    primary: "ui-icon-pencil"
                            }
                    }).click(function(){
                      
                        
                        var tabId = keyPart.param;
                      
                        
                        if($("#"+tabId).length>0){
                            $("#"+tabId).tabs("option","active",$('a[href$="'+tabId+'"]').parent().index());
                            return;
                        }
                        
                        var tindex = _this.addTab(tabs,tabId,$("#"+src_component+"-execution-parameter-field-name-"+keyPart.param).val());
                        
                        
                        tabs.find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                        tabs.tabs('option','active',tindex-1);
                        
                     	$("#"+tabId).css({"height":$("#"+tabId).parent().parent().parent().parent().parent().height()*0.80,"overflow":"auto"});
                
                      
                        var ptype = $("#"+src_component+"-execution-parameter-field-type-"+keyPart.param).val();
                      
                      	var paramVal = $("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val();
                      
                        var nvpDataType =  _this.getNVPDataType(ptype);
                        if(ptype == "json"){
                            $("#"+tabId).append('<div id="'+src_component+'-execution-parameter-field-default-json-editor-'+keyPart.param+'"></div>');

                            //var jsonData = $("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).val();
                            var container = document.getElementById(src_component+'-execution-parameter-field-default-json-editor-'+tabId);
                            var editor    = new jsoneditor.JSONEditor(container);        
                            $("#"+src_component+'-execution-parameter-field-default-json-editor-'+tabId).find(".menu").remove();
                            editor.set(eval('('+paramVal+')'));
                            appBuilder.registeredEditors.push(
                            {
                                "tabid":tabId,                                                           
                                onSave:function(){
                                    $("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).val(JSON.stringify(editor.get()));
                                    $("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val(JSON.stringify(editor.get()));
                                    appBuilder.common_core.updateExecutionParameter(options.param.definitionId,options.param.id,options.src_component);                                
                                },
                                editor:editor
                            });
                            
                            $("#"+tabId).data("editor",editor);
                          
                            $("#"+src_component+'-execution-parameter-field-default-json-editor-'+tabId).find(".menu").remove();
                            $("#"+src_component+'-execution-parameter-field-default-json-editor-'+tabId).find(".jsoneditor,.outer,.content").css({"border-style":"none","overflow":"visible","overflow-x":"visible","overflow-y":"visible","position":"relative"});
                        }
                        else
                        if(ptype == "date"){
                            
                        }
                        else
                        if(nvpDataType != null && typeof nvpDataType.code_mirror_type == "object"){
                            $("#"+tabId).append('<textarea id="'+src_component+'-execution-parameter-field-default-codemirror-editor-'+keyPart.param+'"></textarea>');

                            var container = document.getElementById(src_component+'-execution-parameter-field-default-codemirror-editor-'+tabId);
                            
                          
                            var editor = CodeMirror.fromTextArea(container, {
                              mode:nvpDataType.code_mirror_type.mode == "sql"?"text/x-sql":nvpDataType.code_mirror_type.mode,                              
                            lineNumbers: true,                              
                            matchBrackets: true});
                          
                            editor.on("change",function(editor){editor.contentModified = true;});
                            CodeMirror.autoLoadMode(editor, nvpDataType.code_mirror_type.mode);

                            appBuilder.setRegisteredEditorContent(editor,paramVal);
                            //mainScope.dataStatement.sqlEditor.setValue(data);
                            appBuilder.editor_toolbar.setEditor(editor);
            
                            appBuilder.registeredEditors.push(
                            {
                                "tabid":tabId,                                                           
                                onSave:function(){
                                    $("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).val(editor.getValue());
                                    $("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val(editor.getValue());
                                    appBuilder.common_core.updateExecutionParameter(options.param.definitionId,options.param.id,options.src_component);                                
                                },
                                editor:editor
                            });
                          
                            editor.setSize(null,$("#"+tabId).parent().parent().parent().parent().parent().height()*0.80);
                            $("#"+tabId).data("editor",editor);
                        }
                    });                    
                    
                    $("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).change(
                      function(){
                        $("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val($(this).val());                        
                    });
                  
                
                    _this.showArgumentView(src_component,typeof options.param!="undefined"?options.param.type:"string",keyPart.param);
                    $("#"+src_component+"-execution-parameter-field-type-"+keyPart.param).change(function(){
                        _this.showArgumentView(src_component,$(this).val(),keyPart.param);
                    });
                    
                    _this.createValidationView(src_component, keyPart.param);
                }

                $("#"+src_component+"-execution-parameter-field-name-"+keyPart.param).val(typeof options.param != "undefined"?options.param.name:"");
                $("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).val(typeof options.param != "undefined"?options.param.defaultValue:"");
              	$("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val(typeof options.param != "undefined"?options.param.defaultValue:"");
                
              
              	var dtCrudNode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(keyPart.table);
                $("#"+src_component+"-execution-parameter-field-default-label-"+keyPart.param).parent().droppable({
                    //activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover", 
                    greedy: true,
                    tolerance:"touch",
                    accept:function(){return true;},
                    drop: function( event, ui ) {
                        var droppedNode = ui.helper.data("dtSourceNode");
                        
                        if(typeof droppedNode != "undefined" && droppedNode != null && droppedNode.data.type != 'appresource-dir'){
                          
                            appBuilder.common_core.processDroppedNode(droppedNode,dtCrudNode,function(relPath,appConfig){
                            	$("#"+src_component+"-execution-parameter-field-default-"+keyPart.param).val(relPath);
                            	$("#"+src_component+"-execution-parameter-field-default-value-"+keyPart.param).val(relPath);
                            });
                            //var relPath = _this.getRelPath(droppedNode);
                            /*--var pathPart = _this.getNonNullVal(droppedNode.data.relPath).split('/');
                            var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        

                            $("#"+src_component+"-preexecution-path-label-drop-"+mainScope.keyPart+" span").html(executableName);
                            $('#'+src_component+'-preexecution-path-'+mainScope.keyPart).attr('value',droppedNode.data.relPath);
                            $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','disabled',false); 
                            $('#'+src_component+'-preexecution-path-label-drop-'+mainScope.keyPart).tooltip('option','content',droppedNode.data.relPath);*/
                        }
                    }
                });


                $("#"+src_component+"-execution-parameter-field-validation-mask-"+keyPart.param).val(typeof options.param != "undefined"?options.param.validationRegex:"");
                $("#"+src_component+"-execution-parameter-field-validation-value-range-min-"+keyPart.param).val(typeof options.param != "undefined"?options.param.minRange:"");
                $("#"+src_component+"-execution-parameter-field-validation-value-range-max-"+keyPart.param).val(typeof options.param != "undefined"?options.param.maxRange:"");

                $("#"+src_component+"-execution-parameter-field-validation-date-format-"+keyPart.param).val(typeof options.param != "undefined"?options.param.dateFormat:"");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-validation-date-format-strict-"+keyPart.param),typeof options.param != "undefined"?options.param.dateFormatStrict:"no");

                $("#"+src_component+"-execution-parameter-field-validation-schemes-"+keyPart.param).val(typeof options.param != "undefined"?options.param.schemesForURL:"");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allowallschemes-"+keyPart.param),typeof options.param != "undefined"?options.param.allowallschemesForURL:"no");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allow2slashes-"+keyPart.param),typeof options.param != "undefined"?options.param.allow2slashesForURL:"no");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-nofragments-"+keyPart.param),typeof options.param != "undefined"?options.param.nofragmentsForURL:"no");

                $("#"+src_component+"-execution-parameter-field-length_range-min-"+keyPart.param).val(typeof options.param != "undefined"?options.param.minLength:"");
                $("#"+src_component+"-execution-parameter-field-length_range-max-"+keyPart.param).val(typeof options.param != "undefined"?options.param.maxLength:"");
                $("#"+src_component+"-execution-parameter-field-length_range-linelength-"+keyPart.param).val(typeof options.param != "undefined"?options.param.lineEndLength:"");

                $("#"+src_component+"-execution-parameter-field-type-"+keyPart.param).val(typeof options.param != "undefined"?options.param.type:"string");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-required-"+keyPart.param),typeof options.param != "undefined"?options.param.required:"no");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-is_final-"+keyPart.param),typeof options.param != "undefined"?options.param.isFinal:"no");
                
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-eval_left-"+keyPart.param),typeof options.param != "undefined"?options.param.evalLeft:"no");
                appBuilder.setCheckStatus($("#"+src_component+"-execution-parameter-field-eval_right-"+keyPart.param),typeof options.param != "undefined"?options.param.evalRight:"no");
            },
            addExecutionParameter:function(definition_id,src_component){
                var _this = this;
                this.src_component = src_component;
                var keyPart = definition_id;
                
              
                var position = $("#"+src_component+"-execution-parameter-table-"+keyPart).getDataIDs().length-1;
              
                var param = 
                {
                    "name":$('#'+src_component+'-execution-parameter-field-name-'+keyPart).val(),
                    "type":$('#'+src_component+'-execution-parameter-field-type-'+keyPart).val(),
                    "keepAliveCount":$('#'+src_component+'-execution-parameter-field-scope-'+keyPart).val(),
                    "required":appBuilder.getCheckStatus($('#'+src_component+'-execution-parameter-field-required-'+keyPart)),
                    "isFinal":appBuilder.getCheckStatus($('#'+src_component+'-execution-parameter-field-is_final-'+keyPart)),
                    "defaultValue":$('#'+src_component+'-execution-parameter-field-default-'+keyPart).val(),
                    "validationRegEx":$('#'+src_component+'-execution-parameter-field-validation-mask-'+keyPart).val(),
                    "minRange":$('#'+src_component+'-execution-parameter-field-validation-value-range-min-'+keyPart).val(),
                    "maxRange":$("#"+src_component+"-execution-parameter-field-validation-value-range-max-"+keyPart).val(),
                    "dateFormat":$("#"+src_component+"-execution-parameter-field-validation-date-format-"+keyPart).val(),
                    "dateFormatStrict":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-date-format-strict-"+keyPart)),
                    "schemesForURL":$("#"+src_component+"-execution-parameter-field-validation-url-schemes-"+keyPart).val(),
                    "allowallschemesForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allowallschemes-"+keyPart)),
                    "allow2slashesForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allow2slashes-"+keyPart)),
                    "nofragmentsForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-nofragments-"+keyPart)),
                    "minLength":$("#"+src_component+"-execution-parameter-field-length_range-min-"+keyPart).val(),
                    "maxLength":$("#"+src_component+"-execution-parameter-field-length_range-max-"+keyPart).val(),
                    "lineEndLength":$("#"+src_component+"-execution-parameter-field-length_range-linelength-"+keyPart).val(),
                    "evalLeft":appBuilder.getCheckStatus($('#'+src_component+'-execution-parameter-field-eval_left-'+keyPart)),
                    "evalRight":appBuilder.getCheckStatus($('#'+src_component+'-execution-parameter-field-eval_right-'+keyPart)),
                    "definitionId":definition_id,
                    "position":position
                };
                
                /*if(param.name == ''){
                    alert('Please provide a name for the parameter.');
                    return;
                }*/
                param[src_component+"_id"] = definition_id;
                
                $.blockUI();                
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"api/nvp-processing/add-execution-parameter.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            
                            param.id = appBuilder.common_core.stripNewLine(data);                            
                            var keyPart2 = keyPart+'-'+param.id;
                            _this.insertParameter({table:keyPart,param:keyPart2},{"before":true,"insert":true,src_component:src_component,param:param});
                            
                            //reset default
                            _this.insertParameter({table:keyPart,param:keyPart},{"insert":false,src_component:src_component});
                        }
                   });                
            },
            deleteExecutionParameter:function(definition_id,id,src_component){
                var _this = this;
                if(!confirm("Are you sure you want to delete this parameter"))return;
                
                
                var keyPart = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{                           
                            "definitionId":definition_id,
                            "id":id
                        },
                        url:"api/nvp-processing/delete-execution-parameter.stm",
                        success:function(data){
                            //var reply = eval('('+data+')');
                            $("#"+src_component+"-execution-parameter-table-"+keyPart).delRowData(id);
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                        }
                   });      
            },
            updateExecutionParameterPosition:function(definition_id,id,src_component,position){           
                
                var _this = this;
                var param = 
                {
                    "position":position,
                    "definitionId":definition_id,
                    "id":id
                };
                
                param[src_component+"_id"] = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"api/nvp-processing/update-execution-parameter-position.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            //var reply = eval('('+data+')');                                                        
                        }
               });                
            },
            updateExecutionParameter:function(definition_id,id,src_component){
                var keyPart = definition_id+'-'+id;
                var _this = this;
                var param = 
                {
                    "name":$("#"+src_component+"-execution-parameter-field-name-"+keyPart).val(),
                    "type":$("#"+src_component+"-execution-parameter-field-type-"+keyPart).val(),
                    "required":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-required-"+keyPart)),
                    "isFinal":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-is_final-"+keyPart)),
                    "keepAliveCount":$("#"+src_component+"-execution-parameter-field-scope-"+keyPart).val(),
                    "defaultValue":$("#"+src_component+"-execution-parameter-field-default-"+keyPart).val(),
                    "validationRegEx":$("#"+src_component+"-execution-parameter-field-validation-mask-"+keyPart).val(),
                    "minRange":$("#"+src_component+"-execution-parameter-field-validation-value-range-min-"+keyPart).val(),
                    "maxRange":$("#"+src_component+"-execution-parameter-field-validation-value-range-max-"+keyPart).val(),
                    "dateFormat":$("#"+src_component+"-execution-parameter-field-validation-date-format-"+keyPart).val(),
                    "dateFormatStrict":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-date-format-strict-"+keyPart)),
                    "schemesForURL":$("#"+src_component+"-execution-parameter-field-validation-url-schemes-"+keyPart).val(),
                    "allowallschemesForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allowallschemes-"+keyPart)),
                    "allow2slashesForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-allow2slashes-"+keyPart)),
                    "nofragmentsForURL":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-validation-url-nofragments-"+keyPart)),
                    "minLength":$("#"+src_component+"-execution-parameter-field-length_range-min-"+keyPart).val(),
                    "maxLength":$("#"+src_component+"-execution-parameter-field-length_range-max-"+keyPart).val(),
                    "lineEndLength":$("#"+src_component+"-execution-parameter-field-length_range-linelength-"+keyPart).val(),
                    "evalLeft":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-eval_left-"+keyPart)),
                    "evalRight":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-eval_right-"+keyPart)),
                    "definitionId":definition_id,
                    "id":id
                };
                
                
              
              
                if($("#"+src_component+"-execution-parameter-field-default-value-"+keyPart).val() != ''){
                    
                    param.defaultValue = $("#"+src_component+"-execution-parameter-field-default-value-"+keyPart).val();
                    
                }
                
                
                /*if(param.name == ''){
                    alert('Please provide a name for the parameter.');
                    return;
                }*/
                
                param[src_component+"_id"] = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"api/nvp-processing/update-execution-parameter.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            //var reply = eval('('+data+')');                                                        
                        }
                   });                
            },
            insertPreExecutionHandler:function(keyPart,options){
                var _this = this;
                var src_component = this.src_component;   
                if(options.insert){
                    var actions = "";
                    if(typeof options.execution_handler == "undefined"){
                        var da = "<button title=\"Add\" onclick=\"appBuilder.common_core.addPreExecutionHandler('"+keyPart.table+"','"+src_component+"','"+keyPart.handler_prefix+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
                        actions = da;
                    }else{
                        var de = "<button title=\"Delete\" onclick=\"appBuilder.common_core.deletePreExecutionHandler('"+options.execution_handler.definitionId+"','"+options.execution_handler.id+"','"+options.src_component+"','"+keyPart.handler_prefix+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                        var ds = "<button title=\"Update\" onclick=\"appBuilder.common_core.updatePreExecutionHandler('"+options.execution_handler.definitionId+"','"+options.execution_handler.id+"','"+options.src_component+"','"+keyPart.handler_prefix+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
                        actions = ds+' '+de;
                    }
                
                    var pathCol = [];
                  	pathCol.push("<div style=\"padding:4px\"><span style=\"font-weight:bold;\">Require True:</span>");
                    pathCol.push("<input type=\"checkbox\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-only_proceedon_true-"+keyPart.execution_handler+"\"/>");
                    pathCol.push("</div>");
                    
                    pathCol.push(_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'execution-handler-path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler+"\">");
                  
                    var argPropCol = [];
                  	argPropCol.push("<div style=\"padding:4px\"><span style=\"font-weight:bold;display:block\">Argument Propagation Mode:</span><select  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"\"><option value=\"all_map_values\">pass all map values</option><option value=\"pass_map\">pass map</option><option value=\"some_map_values\">pass some map values</option><option value=\"none\">pass none</option></select></div>");
                    argPropCol.push("<div style=\"padding:4px\">");
                    argPropCol.push("<div style=\"display:none\" id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp\">"+_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler+"\"></div>");
                    argPropCol.push("</div>");                  


                    argPropCol.push("<div style=\"padding:4px\"><span style=\"font-weight:bold;display:block\">Return Mode:</span>");
                    argPropCol.push('<select id="'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+'"><option value="ignore_return">Ignore Return</option><option value="save_as_variable">Save As Variable</option><option value="explode_on_map">Explode</option></select>');
                    argPropCol.push("</div>");
                  	argPropCol.push("<div  id=\""+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+"-dp1\" style=\"padding:4px;display:none\"><span style=\"font-weight:bold;display:block\">Save Return As Variable:</span>");
                    argPropCol.push("<input type=\"text\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnval_name-"+keyPart.execution_handler+"\"/>");
                    argPropCol.push("</div>");                  
                  	argPropCol.push("<div  id=\""+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+"-dp2\" style=\"padding:4px;display:none\"><span style=\"font-weight:bold;display:block\">Selected Properties:</span>");
                  	argPropCol.push("<div style=\"margin-top:4px;\">"+_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart.execution_handler+"\"/></div>");
                    argPropCol.push("</div>");                  

                  
                  
                    var row = 
                    {
                        "actions":"<div style=\"padding:4px\">"+actions+"</div>",
                        "arg_propagation":argPropCol.join(''),
                        "enable":"<input type=\"checkbox\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-enable-"+keyPart.execution_handler+"\"/>",
                        //"only_proceedon_true":,                        
                        //"returnval_name":,
                        //"path":"<div id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-path-label-rowdrop-"+keyPart.execution_handler+"\" class=\"ui-widget-header ui-corner-all\" style=\"margin:4px;padding:8px;width:256px;display:inline\"><span>Drop reference here.</span></div> <input type=\"hidden\" id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler+"\"/>"
                      	"path":pathCol.join('')
                    };
                    
                    if(options.before){                        
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-table-"+keyPart.table).addRowData(options.execution_handler.id,row,"before",0); 
                    }
                    else
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-table-"+keyPart.table).addRowData(typeof options.execution_handler != "undefined"?options.execution_handler.id:0,row); 
                    
                  	var dtCrudNode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(keyPart.table);
                  
                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',
                       keyPart.execution_handler,
                       function(relPath){
                         $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val(relPath);
                       },
                       function(){
                         $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val('');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationListPath:"",dtCrudNode);
                   

                  
                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'execution-handler-path',
                       keyPart.execution_handler,
                       function(relPath){
                           var pathPart = _this.getNonNullVal(relPath).split('/');
                           $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-path-'+keyPart.execution_handler).attr('value',relPath);
                       },
                       function(){
                         $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-path-'+keyPart.execution_handler).attr('value','');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'execution-handler-path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.path:"",dtCrudNode);
                  
                  
                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',
                       keyPart.execution_handler,
                       function(relPath){
                           var pathPart = _this.getNonNullVal(relPath).split('/');
                           $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-selected_property_list_path-'+keyPart.execution_handler).attr('value',relPath);
                       },
                       function(){
                         $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-selected_property_list_path-'+keyPart.execution_handler).attr('value','');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.explodedListPath:"",dtCrudNode);
                }
                
 
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.path:"");
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnval_name-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.returnValName:"");
                appBuilder.setCheckStatus($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-only_proceedon_true-"+keyPart.execution_handler),typeof options.execution_handler != "undefined"?options.execution_handler.onlyProceedOnTrue:"no");
                appBuilder.setCheckStatus($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-enable-"+keyPart.execution_handler),typeof options.execution_handler != "undefined"?options.execution_handler.enable:"no");
                
              
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler)
                .change(function(){
                  
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"none"});
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"none"});     
                  
                    if($(this).val() == "save_as_variable")
                      $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"block"});
                    else
                    if($(this).val() == "explode_on_map"){
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"block"});  
                    }
                })
                .val(typeof options.execution_handler != "undefined"?options.execution_handler.returnMode:"");
              
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "save_as_variable")
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"block"});
                else
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "explode_on_map"){
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"block"});                     
                }              
              
              
              	//appBuilder.setCheckStatus($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler),typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationMode:"no");  
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationListPath:"");
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler)
                .change(function(){
                  if($(this).val() == "some_map_values")	
                  	$("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"block"});
                  else
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"none"});
                  
                })
                .val(typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationMode:"none");
              
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler).val() == "some_map_values")
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"block"}); 
            },            
            addPreExecutionHandler:function(definition_id,src_component,handler_prefix,presibling_id){
                var _this = this;
                var keyPart = definition_id;
                
                var position = $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).getDataIDs().length-1;
              
                var handler = 
                {
                    "path":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-path-"+keyPart).val(), 
                    "returnMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnmode-"+keyPart).val(),
                    "argPropagationListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart).val(),
                    "onlyProceedOnTrue":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-only_proceedon_true-"+keyPart)),
                    "returnValName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnval_name-"+keyPart).val(),
                    "enable":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-enable-"+keyPart)),
                    "argPropagationMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart).val(),
                    "explodedListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart).val(),
                    "definitionId":definition_id,
                    "parentId":"0",
                    "position":position
                };
                handler[src_component+"_id"] = definition_id;
                
                /*--if(handler.path == ''){
                    alert('Please provide a path for handler.');
                    return;
                }*/
                handler[src_component+"_id"] = definition_id;
                
                
                if(typeof presibling_id != 'undefined')
                    handler.presiblingId = presibling_id;
                else
                {
                    var ids = $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).getDataIDs();
                    if(ids.length>0){
                        handler.presiblingId = ids[ids.length-1];
                    }else{
                        handler.presiblingId = '0';
                    }
                }                
                
                
                $.blockUI();                
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/add-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                  			
                            _this.markModified(src_component,definition_id);
                            
                            $.unblockUI();
                            /*--var reply = eval('('+data+')');
                            if(reply.status != 'success'){
                                alert('An Error occured adding handler.')
                                return;
                            }*/
                            
                            handler.id = _this.stripNewLine(data);
                            var keyPart2 = keyPart+'-'+handler.id;
                            _this.insertPreExecutionHandler({table:keyPart,execution_handler:keyPart2,handler_prefix:handler_prefix},{"before":true,"insert":true,src_component:src_component,execution_handler:handler});
                            
                            //reset default
                            _this.insertPreExecutionHandler({table:keyPart,execution_handler:keyPart,handler_prefix:handler_prefix},{"insert":false,src_component:src_component});
                        }
                   });                
            },
            deletePreExecutionHandler:function(definition_id,id,src_component,handler_prefix){
                var _this = this;
                var keyPart = definition_id;
                var handler =
                {                           
                    "definition_id":definition_id,
                    "id":id
                }
                handler[src_component+"_id"] = definition_id;
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/delete-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                            //var reply = eval('('+data+')');
                            $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).delRowData(id);
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                        }
                 });      
            },
            updatePreExecutionHandlerPosition:function(definition_id,id,src_component,handler_prefix,position){           
                
                var _this = this;
                var param = 
                {
                    "position":position,
                    "definitionId":definition_id,
                    "id":id
                };
                
                param[src_component+"_id"] = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"api/"+handler_prefix+"-execution/update-"+handler_prefix+"execution-handler-position.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            //var reply = eval('('+data+')');                                                        
                        }
               });                
            },
            updatePreExecutionHandler:function(definition_id,id,src_component,handler_prefix){
                var keyPart = id;
                var _this = this;

                var handler = 
                {
                    "path":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-path-"+keyPart).val(),
                    "argPropagationListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart).val(),
                    "explodedListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart).val(),
                    "returnMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnmode-"+keyPart).val(),
                    "enable":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-enable-"+keyPart)),
                    "argPropagationMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart).val(),
                    "onlyProceedOnTrue":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-only_proceedon_true-"+keyPart)),
                    "returnValName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnval_name-"+keyPart).val(),
                    "definitionId":definition_id,
                    "id":id
                };
                
                
                /*--if(handler.path == ''){
                    alert('Please provide a path for the handler.');
                    return;
                }*/
                handler[src_component+"_id"] = definition_id;
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/update-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                            $.unblockUI();
                            _this.markModified(src_component,definition_id);
                            //var reply = eval('('+data+')');                                                        
                        }
                   });                
            },
            insertPostExecutionHandler:function(keyPart,options){
                var _this = this;
                var src_component = this.src_component;   
                if(options.insert){
                    var actions = "";
                    if(typeof options.execution_handler == "undefined"){
                        var da = "<button title=\"Add\" onclick=\"appBuilder.common_core.addPostExecutionHandler('"+keyPart.table+"','"+src_component+"','"+keyPart.handler_prefix+"',-1,'normal')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
                        da += "<button title=\"Add Error Handler\" onclick=\"appBuilder.common_core.addPostExecutionHandler('"+keyPart.table+"','"+src_component+"','"+keyPart.handler_prefix+"',-1,'error-handler')\"   id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-add-error-handler-button-"+keyPart.execution_handler+"\">Add Error Handler</button>";
                        actions = da;
                    }else{                        
                        var de = "<button title=\"Delete\" onclick=\"appBuilder.common_core.deletePostExecutionHandler('"+options.execution_handler.definitionId+"','"+options.execution_handler.id+"','"+options.src_component+"','"+keyPart.handler_prefix+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                        var ds = "<button title=\"Update\" onclick=\"appBuilder.common_core.updatePostExecutionHandler('"+options.execution_handler.definitionId+"','"+options.execution_handler.id+"','"+options.src_component+"','"+keyPart.handler_prefix+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
                        actions = ds+' '+de;
                    }
                	var errorHandlerIcon = "";
                    if(typeof options.execution_handler != "undefined" && typeof options.execution_handler.type != "undefined" && options.execution_handler.type == "error-handler")
                      	errorHandlerIcon = "<img src=\"img/dialog-error.png\"/>";
                  
                    var pathCol = [];
                    pathCol.push(_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'execution-handler-path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler+"\">");
                  
                    var argPropCol = [];
                  	argPropCol.push("<div style=\"padding:4px\"><span style=\"font-weight:bold;display:block\">Argument Propagation Mode:</span>");
                    argPropCol.push("<select  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"\"><option value=\"all_map_values\">pass all map values</option><option value=\"pass_map\">pass map</option><option value=\"some_map_values\">pass some map values</option><option value=\"none\">pass none</option></select>");
                    argPropCol.push("</div>");
                    argPropCol.push('<div style=\"padding:4px\"><span></span>');
                  	argPropCol.push("<div style=\"display:none\" id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp\">"+_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler+"\"></div>");
                    argPropCol.push("</div>");

                    argPropCol.push("<div style=\"padding:4px\"><span style=\"font-weight:bold;display:block\">Return Mode:</span>");
                    argPropCol.push('<select id="'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+'"><option value="ignore_return">Ignore Return</option><option value="return_as_primary">Return As Primary</option><option value="append_return_to_primary">Append to Primary</option><option value="append_primary_to_return">Append Primary</option><option value="return_named_variable">Return Variable</option><option value="save_as_variable">Save As Variable</option><option value="explode_on_map">Explode</option></select>');
                    argPropCol.push("</div>");
                  	argPropCol.push("<div  id=\""+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+"-dp1\" style=\"padding:4px;display:none\"><span style=\"font-weight:bold;display:block\" class=\"label\">Return Variable:</span>");
                    argPropCol.push("<input type=\"text\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnval_name-"+keyPart.execution_handler+"\"/>");
                    argPropCol.push("</div>");                  
                  	argPropCol.push("<div  id=\""+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+"-dp2\" style=\"padding:4px;display:none\"><span style=\"font-weight:bold;display:block\">Append As Variable Name:</span>");
                    argPropCol.push("<input type=\"text\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-primary_result_var_name-"+keyPart.execution_handler+"\"/>");
                  	argPropCol.push("</div>");
                  	argPropCol.push("<div  id=\""+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-returnmode-'+keyPart.execution_handler+"-dp3\" style=\"padding:4px;display:none\"><span style=\"font-weight:bold;display:block\">Selected Properties:</span>");
                  	argPropCol.push("<div style=\"margin-top:4px\">"+_this.droppableReferenceHTML(src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',keyPart.execution_handler)+  "<input type=\"hidden\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart.execution_handler+"\"/></div>");
                    argPropCol.push("</div>");
                    var row = 
                    {
                        "actions":"<div style=\"padding:4px\">"+actions+"</div>",
                        "arg_propagation":argPropCol.join(''),
                        "enable":errorHandlerIcon+" <input type=\"checkbox\"  id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-enable-"+keyPart.execution_handler+"\"/>",
                        //"primary_result_var_name":,
                        //"returnmode":,
                        //"returnval_name":,                        
                        //"path":"<div id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-path-label-rowdrop-"+keyPart.execution_handler+"\" class=\"ui-widget-header ui-corner-all\" style=\"margin:4px;padding:8px;width:256px;display:inline\"><span>Drop reference here.</span></div> <input type=\"hidden\" id=\""+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler+"\"/>"
                      	"path":pathCol.join('')
                    };
                    
                    
                    if(options.before){       
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-table-"+keyPart.table).addRowData(options.execution_handler.id,row,"before","0"); 
                    }
                    else
                    {
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-table-"+keyPart.table).addRowData(typeof options.execution_handler != "undefined"?options.execution_handler.id:"0",row); 
                      
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-add-error-handler-button-"+keyPart.execution_handler).button({
                            icons: 
                            {
                              primary: "ui-icon-plus",
                              secondary: "ui-icon-alert"
                            },
                            text: false                  
                        });                      
                    }
                    
                  
                    var dtCrudNode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(keyPart.table);


                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',
                       keyPart.execution_handler,
                       function(relPath){
                         
                         $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val(relPath);
                       },
                       function(){
                         $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val('');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'-arg-propagation-list-path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationListPath:"",dtCrudNode);
                  
                  
                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'execution-handler-path',
                       keyPart.execution_handler,
                       function(relPath){
                           var pathPart = _this.getNonNullVal(relPath).split('/');
                           $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-path-'+keyPart.execution_handler).attr('value',relPath);
                       },
                       function(){
                         $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-path-'+keyPart.execution_handler).attr('value','');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'execution-handler-path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.path:"",dtCrudNode);
                  
                  
                    appBuilder.common_core.createDroppableReferenceView
                    (  src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',
                       keyPart.execution_handler,
                       function(relPath){
                           var pathPart = _this.getNonNullVal(relPath).split('/');
                           $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-selected_property_list_path-'+keyPart.execution_handler).attr('value',relPath);
                       },
                       function(){
                         $('#'+src_component+'-'+keyPart.handler_prefix+'execution-handler-field-selected_property_list_path-'+keyPart.execution_handler).attr('value','');
                       },dtCrudNode
                    );
                    appBuilder.common_core.setDroppableReferenceVal(src_component+"-"+keyPart.handler_prefix+'execution-handler-selected_property_list_path',keyPart.execution_handler,typeof options.execution_handler != "undefined"?options.execution_handler.explodedListPath:"",dtCrudNode);                  
                  
                }
                
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler)
                .change(function(){
                  
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"none"});
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"none"});     
                  	$("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp3").css({"display":"none"}); 
                  
                  	if($(this).val() == "return_named_variable" || $(this).val() == "save_as_variable"){
                      
                      if($(this).val() == "save_as_variable")
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1 span.label").html("Save As Variable Name");
                      else
                        $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1 span.label").html("Return Variable Name");
                      
                      $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"block"});
                  	}
                    else
                    if($(this).val() == "append_return_to_primary" || $(this).val() == "append_primary_to_return")
                      $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"block"});         
                    else
                    if($(this).val() == "explode_on_map"){
                      $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp3").css({"display":"block"});  
                    }
                })
                .val(typeof options.execution_handler != "undefined"?options.execution_handler.returnMode:"");
              
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-primary_result_var_name-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.primaryResultVarName:"");
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnval_name-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.returnValName:"");
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-path-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.path:"");              
                appBuilder.setCheckStatus($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-enable-"+keyPart.execution_handler),typeof options.execution_handler != "undefined"?options.execution_handler.enable:"no");
                
                $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart.execution_handler).val(typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationListPath:"");
       			$("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler)
                .change(function(){
                  if($(this).val() == "some_map_values")	
                  	$("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"block"});
                  else
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"none"});
                  
                })                
                .val(typeof options.execution_handler != "undefined"?options.execution_handler.argPropagationMode:"none");
              
              
                
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler).val() == "some_map_values")
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart.execution_handler+"-dp").css({"display":"block"}); 
              
              	if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "save_as_variable"){
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1 span.label").html("Save As Variable Name");
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"block"});
              	}
				else              
              	if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "return_named_variable"){
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1 span.label").html("Return Variable Name");
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp1").css({"display":"block"});
              	}
                else
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "append_return_to_primary" || $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "append_primary_to_return")
                  $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp2").css({"display":"block"});
                else
                if($("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler).val() == "explode_on_map"){
                    $("#"+src_component+"-"+keyPart.handler_prefix+"execution-handler-field-returnmode-"+keyPart.execution_handler+"-dp3").css({"display":"block"});                      
                }
                  
            },
            addPostExecutionHandler:function(definition_id,src_component,handler_prefix,presibling_id,type){
                var _this = this;
                var keyPart = definition_id;
              
                var position = $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).getDataIDs().length-1;
              
                var handler = 
                {
                    "primaryResultVarName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-primary_result_var_name-"+keyPart).val(),
                    "returnValName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnval_name-"+keyPart).val(),
                    "path":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-path-"+keyPart).val(),               
                    "argPropagationListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart).val(),
                    "returnMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnmode-"+keyPart).val(),                    
                    "enable":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-enable-"+keyPart)),
                    "argPropagationMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart).val(),
                    "type":type,
                    "explodedListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart).val(),
                    "definitionId":definition_id,
                    "parentId":"0",
                    "position":position
                };
                handler[src_component+"_id"] = definition_id;
                
                if(typeof presibling_id != 'undefined' && presibling_id != -1)
                    handler.presiblingId = presibling_id;
                else
                {
                    var ids = $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).getDataIDs();
                    if(ids.length>0){
                        handler.presiblingId = ids[ids.length-1];
                    }else{
                        handler.presiblingId = '0';
                    }
                }
                
                /*--if(handler.path == ''){
                    alert('Please provide a path for handler.');
                    return;
                }*/
                handler[src_component+"_id"] = definition_id;
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/add-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            /*--var reply = eval('('+data+')');
                            if(reply.status != 'success'){
                                alert('An Error occured adding handler.')
                                return;
                            }
                            */
                            handler.id = _this.stripNewLine(data);
                            
                            var keyPart2 = keyPart+'-'+handler.id;
                            _this.insertPostExecutionHandler({table:keyPart,execution_handler:keyPart2,handler_prefix:handler_prefix},{"before":true,"insert":true,src_component:src_component,execution_handler:handler});
                            
                            //reset default
                            _this.insertPostExecutionHandler({table:keyPart,execution_handler:keyPart,handler_prefix:handler_prefix},{"insert":false,src_component:src_component});
                        }
                   });
            },
            deletePostExecutionHandler:function(definition_id,id,src_component,handler_prefix){
                var _this = this;
                var keyPart = definition_id;
                var handler =
                {                           
                    "definition_id":definition_id,
                    "id":id
                }
                handler[src_component+"_id"] = definition_id;
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/delete-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                            //var reply = eval('('+data+')');
                            
                            $("#"+src_component+"-"+handler_prefix+"execution-handler-table-"+keyPart).delRowData(id);
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                        }
                 });      
            },
            updatePostExecutionHandlerPosition:function(definition_id,id,src_component,handler_prefix,position){           
                
                var _this = this;
                var param = 
                {
                    "position":position,
                    "definitionId":definition_id,
                    "id":id
                };
                
                param[src_component+"_id"] = definition_id;
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:param,
                        url:"api/"+handler_prefix+"-execution/update-"+handler_prefix+"execution-handler-position.stm",
                        success:function(data){
                            _this.markModified(src_component,definition_id);
                            $.unblockUI();
                            //var reply = eval('('+data+')');                                                        
                        }
               });                
            },
            updatePostExecutionHandler:function(definition_id,id,src_component,handler_prefix){
                var keyPart = id;
                var _this = this;
                
                var handler = 
                {
                    "primaryResultVarName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-primary_result_var_name-"+keyPart).val(),
                    "returnValName":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnval_name-"+keyPart).val(),
                    "path":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-path-"+keyPart).val(),
                    "argPropagationListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_list_path-"+keyPart).val(),
                    "explodedListPath":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-selected_property_list_path-"+keyPart).val(),
                    "enable":appBuilder.getCheckStatus($("#"+src_component+"-"+handler_prefix+"execution-handler-field-enable-"+keyPart)),
                    "argPropagationMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-arg_propagation_mode-"+keyPart).val(),
                    "returnMode":$("#"+src_component+"-"+handler_prefix+"execution-handler-field-returnmode-"+keyPart).val(),                    
                    "definitionId":definition_id,
                    "id":id
                };
                
                /*--if(handler.path == ''){
                    alert('Please provide a path for the handler.');
                    return;
                }*/
                handler[src_component+"_id"] = definition_id;
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:handler,
                        url:"api/"+handler_prefix+"-execution/update-"+handler_prefix+"execution-handler.stm",
                        success:function(data){
                            $.unblockUI();
                            _this.markModified(src_component,definition_id);
                            //var reply = eval('('+data+')');                                                        
                        }
                   });                
            },
            createCrudTreeNode:function(crud,type){
                return {
                    "title":crud.name,
                    "addClass":type+"-treenode",
                    "type":type,
                    "isFolder":false,
                    "id":crud.id,
                    "key":crud.id,
                    "children":[]
                };                 
            },
            instantiateCrudType:function(crudTypeTemplate,dtParentNode,name){  
                
                //appBuilder.common_core.getRelPath(dtParentNode);
                
                
                appBuilder.common_core.cloneCrudDefinition(crudTypeTemplate.crud.definition_id,name,function(id){
                    
                  
                    appBuilder.common_core.addCrudNode(dtParentNode,name,id,crudTypeTemplate.crud.definition.crudType);
                  
                  	/*
                    var newNode = dtParentNode.addChild(appBuilder.common_core.createCrudTreeNode({"name":name,"id":id},crudTypeTemplate.crud.definition.crudType));
                    newNode.activate();
                    
                    
                    if(dtParentNode.data.type == 'apptaxonomy-category' || 
                       dtParentNode.data.type == 'appresource-dir'  || 
                       dtParentNode.data.type == 'appresource-root'){
                      appBuilder.sysadmin.apptaxonomy.newItem(name, id, crudTypeTemplate.crud.definition.crudType, dtParentNode,newNode);
                    }*/ 
                },crudTypeTemplate,dtParentNode);              
            },
  			cloneParam:null,
            cloneCrudDefinition:function(definition_id,name,callback,template,dtnode){
              		var param = {
                        "definition_id":definition_id,
                        "name":name
                    };
                    
                    if(appBuilder.common_core.cloneParam != null){
                       for(var key in appBuilder.common_core.cloneParam)
                         	param[key] = appBuilder.common_core.cloneParam[key];
                      
                      appBuilder.common_core.cloneParam = null;
                    }
              
              		
              		if(typeof template != "undefined" &&
                       typeof template.name != "undefined" &&
                       template.name == "datamodel"){
              			  var relPath = appBuilder.common_core.getRelPath(dtnode);
                      	  var typeIdentifier = relPath.indexOf('/') != -1?relPath.substring(relPath.indexOf('/')+1)+"."+name:relPath+"."+name;
                          
                      	  if(typeIdentifier.indexOf('/') != -1)
                      	  	typeIdentifier = typeIdentifier.split('/').join('.');
                          
              			  param["crudzilla_typeIdentifier_value"] =  typeIdentifier;
                    }
              
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:param,
                            url:"api/primary-execution/crud-definition/clone-crud-definition.stm",
                            success:function(data){
                                $.unblockUI();   
                                
                                var id = appBuilder.common_core.stripNewLine(data);
                                
                                if(typeof callback != "undefined")
                                  callback(id);
                            }
                    });              
            },            
            deleteCrudDefinition:function(dtnode){
                if(confirm("Are you sure you want to delete this crud definition?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "definition_id":dtnode.data.id
                            },
                            url:"api/primary-execution/crud-definition/delete-crud-definition.stm",
                            success:function(data){
                                
                                if(dtnode.getParent().data.type == 'apptaxonomy-root' || dtnode.getParent().data.type == 'apptaxonomy-category' || dtnode.getParent().data.type == 'appresource-dir'){
                                  
                                    
                                    appBuilder.sysadmin.apptaxonomy.deleteItem(dtnode.getParent().data.appTaxonomyId,dtnode.data.link_id);
                                  
                                  	appBuilder.runtime_resources.deleteResource(dtnode,false,function(){
                                  		dtnode.remove();
                                  	});
                                }
                              	else
                                  dtnode.remove();
                                
                                $.unblockUI();                           
                            }
                    });
                }
            },
            autoGenerateCrud:function(dtnode){
              appBuilder.runtime_resources.bakeCrud(dtnode);              
            },
            getEditorModeFromExt:function(f){
                /*if(f.endsWith('.js'))
                    return 'javascript';
                if(f.endsWith('.html') || f.endsWith('.htm') || f.endsWith('.vm'))
                    return 'htmlmixed';
                if(f.endsWith('.css'))
                    return 'text/css'; 
                if(f.endsWith('.xml'))
                    return 'text/xml';*/
                //alert(JSON.stringify(this.editorModeDefinitions))
                //alert(f.substring(f.lastIndexOf('.')));
                if(f.lastIndexOf('.') != -1 && typeof this.editorModeDefinitions[f.substring(f.lastIndexOf('.'))] != "undefined")
                	return this.editorModeDefinitions[f.substring(f.lastIndexOf('.'))].mode;
                return "shell";
            },
            getReference:function(ui,dtnode,src_component,tabctrl){
                var _this = this;
                var relPath = this.getRelPath(dtnode);
                var mime    = dtnode.data.mime;
                ui.panel.tabid = 'appresource-edit-'+dtnode.data.id; 
                
		
              	(tabctrl?tabctrl:$("#tabs")).tabs("option", "active",ui.index);
                
                
                var getData = function(cb){
                  appBuilder.common_core.viewResource(relPath,cb);                       
                }
                
                
                $.ajax({
                    type:'POST',
                    url:'sc/appbuilder/ui-templates/'+src_component+'-reference-tab-view.html',
                    success:function(data){
                      
                        
                        ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");//.appendTo("#datastatement-tab");
                        $(ui.panel.panel).data("onClose",[]);
                        $(ui.panel.panel).data("onActivate",[]);
                        $(ui.panel.panel).data("onDeactivate",[]);
                      
                      
                        $("#"+src_component+"-tab").append(ui.panel.panel);                                    
                        $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:dtnode.data.id}));
                      
                        var height = $(ui.panel.panel).parent().parent().height();
                        if(tabctrl != $("#tabs"))
                      		height = $(ui.panel.panel).parent().parent().parent().height();
                      
                        $(ui.panel.panel).css({"height":height,"background-color":"white"});

                        var container = document.getElementById(src_component+"-reference-editor-"+dtnode.data.id);
                        var containerParent = document.getElementById(src_component+"-reference-editor-container-"+dtnode.data.id);
						
                        var editor = null;
              			var getContent;
                        if(/*appBuilder.menuAction == "edit" &&  */_this.isExecutableType(mime)){
                            
                            editor = new jsoneditor.JSONEditor(container);
                            
                            appBuilder.runtime_resources.viewResource(relPath,function(data){
                                var definitionRef = eval('('+data+')');
                                
                                $('#'+src_component+"-reference-editor-"+dtnode.data.id).find(".menu").remove();
                                editor.set(definitionRef); 
                                //$('#'+src_component+"-reference-editor-"+dtnode.data.id).css({"overflow":"scroll"});
                                $(ui.panel.panel).css({"overflow":"auto"});
                                $('#'+src_component+"-reference-editor-"+dtnode.data.id).find(".jsoneditor,.outer,.content").css({"border-style":"none","overflow":"visible","overflow-x":"visible","overflow-y":"visible","position":"relative"});
                                
                            });
                            getContent = function(){return JSON.stringify(editor.get());}
                        }
              			else
                        if(appBuilder.menuAction == "edit" && 
                           (appBuilder.endsWith(relPath,".html") || appBuilder.endsWith(relPath,".htm"))){
                            appBuilder.menuAction = null;
                            editor = $( container ).ckeditor(function(){
                                
                                //$(this.element.$).removeAttr("title");
                                $(".cke_wysiwyg_frame").removeAttr("title");
                          		this.resize("100%",$(ui.panel.panel).parent().parent().height());
                            });                     	
                            appBuilder.runtime_resources.viewResource(relPath,function(data){
                                editor.val(data);
                            });    
                            getContent = function(){ return editor.val();}
                            $(container).attr("title","");                            
                        }
                        else
                        {
                            var mode = _this.getEditorModeFromExt(relPath);
				
                          	if(mode == 'java')
                              mode = 'text/x-java';
                            /*else
                            if(_this.isExecutableType(mime)){
                               mode = "application/json";
                               $("#"+src_component+"-reference-editor-"+dtnode.data.id).empty().append("<textarea id="+src_component+"-reference-editor-textarea"+dtnode.data.id+"></textarea>");
                               container = document.getElementById(src_component+"-reference-editor-textarea"+dtnode.data.id);
                            }*/
                          
                              
                            editor = new CodeMirror.fromTextArea(container, {
                            mode:mode,                              
                            lineNumbers: true,                              
                            matchBrackets: true,
                            readOnly:false,
                            onChange:function(editor){editor.contentModified = true;}
                            });

			    			
                            appBuilder.runtime_resources.viewResource(relPath,function(data){                                
                              editor.setValue(data);
                              editor.clearHistory();
                            });

                            editor.setSize(null,$(ui.panel.panel).parent().parent().height()-2);
                          
                          	if(mode == 'text/x-java')
                              mode = 'clike';                          
                            CodeMirror.autoLoadMode(editor, mode);
                          
                          	
                            if(mode == 'html' || mode == 'htmlmixed' || mode == 'xml')
                              editor.on("gutterClick", function(cm, where){cm.foldCode(where,CodeMirror.tagRangeFinder);});
                          	else
                              editor.on("gutterClick", function(cm, where){cm.foldCode(where,CodeMirror.braceRangeFinder);});
                          
                            getContent=function(){return editor.getValue();}
                            
                            var appConfig = appBuilder.common_core.findApp(relPath);
                            if(appConfig && 
                              (appBuilder.endsWith(relPath,".html") || appBuilder.endsWith(relPath,".htm")) &&
                               appBuilder.layItOut){
                              appBuilder.layItOut = false;
                              appBuilder.htmlLayout.layout(dtnode,{editor:editor,container:containerParent},ui);
                            }
                        }


                        appBuilder.editor_toolbar.setEditor(editor);
                        ui.panel.editor = editor;
                        $("#"+ui.panel.tabid).data("editor",editor);
					    
                        editor.foldAll = function(){
                            for (var i = this.firstLine(), e = this.lastLine(); i <= e; i++)
        					    this.foldCode(CodeMirror.Pos(i, 0), null, "fold");
                        }
                      
                        editor.unfoldAll = function(){
                            for (var i = this.firstLine(), e = this.lastLine(); i <= e; i++)
        					    this.foldCode(CodeMirror.Pos(i, 0), null, "unfold");
                        }                        
                        
                        appBuilder.registeredEditors.push(
                        {          
                            "tabid": ui.panel.tabid,
                            onSave:function(afterSaveCB){
                                $.blockUI();
                                $.ajax({
                                    type:'POST',
                                    data:
                                    {
                                        "relPath":_this.getRelPath(dtnode),
                                        "content":getContent()
                                    },
                                    url:"/file-system/put.ste",
                                    success:function(data){
                                        //var reply = eval('('+data+')');
                                        //$.unblockUI();

                                        afterSaveCB();
                                    }
                                }); 
                            },
                            editor:editor
                        });
                }});
            },              
            stripNewLine:function(data){
                return (""+data).replace(/^\s+|\s+$/g, '');//return data[data.length-1]=='\n'?data.substring(0,data.length-1):data;
            },
            getStaledReferences:function(definition_id,src,ts,cb){
                return;//diable this feature
                $.ajax({
                    data:{
                        "definitionId":definition_id,
                        "lastModifiedTimeStamp":ts,
                        "crudzillaResultSetFormat":"list"
                    },
                    type:'POST',
                    url:"api/primary-execution/crud-definition/get-staled-references.stm",
                    success:function(data){
                        //alert(ts+':'+data);
                        if(typeof cb == "undefined"){
                            if(typeof appBuilder.tabCallback[src+'-'+definition_id] != "undefined"){
                                if(typeof appBuilder.tabCallback[src+'-'+definition_id].onModified != "undefined")
                                    appBuilder.tabCallback[src+'-'+definition_id].onModified(eval('('+data+')'),ts);
                            }
                        }else{
                            cb(eval('('+data+')'));
                        }
                    }
                });                 
            },
            markModified:function(src,definition_id){
              
              
                var _this = this;
                $.ajax({
                    data:{
                        "definition_id":definition_id
                    },
                    type:'POST',
                    url:"api/primary-execution/crud-definition/update-crud-modified-timestamp.stm",
                    success:function(data){
                        var ts = _this.stripNewLine(data);                        
                        _this.getStaledReferences(definition_id,src,parseInt((""+ts).trim(),10));
                      
                        if(appBuilder.clientSideSettings.crudzilla_save_and_bake == "true"){
                            
                            //var dtnode = $("#work-treecontrol").dynatree("getTree").getNodeByKey(definition_id);
                            var dtnode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(definition_id);
                            appBuilder.runtime_resources.bakeCrud(dtnode);                
                        }                      
                    }
                });
            },
            modificationNotification:function(mainScope){
              
              	return;//disable this feature
              
                var p = $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).position();
                $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).addClass('ui-corner-all').css({"position":"absolute","font-size":"10px", "font-weight":"bold","left":p.left+100,"top":p.top+2});
                
                appBuilder.tabCallback[mainScope.ui.panel.tabid]=
                {
                  "tabid":mainScope.ui.panel.tabid,
                  onModified:function(staledReferences,lastModifiedTimeStamp){
                     
                     if(staledReferences.length>0){
                        var html = ['<ul style="list-style:none;margin:0">'];
                        for(var i =0;i<staledReferences.length;i++){
                            var pathPart = appBuilder.common_core.getNonNullVal(staledReferences[i].path).split('/');
                            var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';

                            html.push('<li  class="" title="'+staledReferences[i].path+'"><button class="'+mainScope.src_component+'-info-panel-refresh-button-'+mainScope.definitionId+'" style="width:22px;height:22px" value="'+staledReferences[i].path+'">refresh</button> <span>'+executableName+'</span></li>');
                        }
                        html.push('</ul>');

                        $("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).css({"width":"256px","display":"none"}).html(html.join(''));
                        $("."+mainScope.src_component+"-info-panel-refresh-button-"+mainScope.definitionId).button({
                                text: false,
                                icons: {
                                        primary: "ui-icon-refresh"
                                }
                        }).click(function(){
                            appBuilder.runtime_resources.refresh($(this).val(),'ste',function(){
                                appBuilder.common_core.getStaledReferences(mainScope.definition.id,mainScope.src_component,lastModifiedTimeStamp,function(sr){

                                    if(sr.length == 0)
                                        $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).css({"display":"none"});
                                    else
                                    {
                                        $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).html(sr.length);
                                    }
                                });                                
                            });
                        });
                        
                        $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).html(staledReferences.length).css({"position":"absolute","display":"block"});
                     }else{
                         //$("#"+mainScope.src_component+"-info-panel-"+mainScope.ui.panel.tabid).css({"display":"none"});
                         $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).css({"display":"none"});
                     }
                }
            };
            
            	$("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).qtip({
                        content: {
                                text: $("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart)/*, 
                                title: {
                                        text: 'Find & Replace',
                                        button: true
                                }*/
                        },
                        position: {
                                my: 'top center', // Use the corner...
                                at: 'bottom center' // ...and opposite corner
                        },
                        show: {
                                event: 'click', // Don't specify a show event...
                                ready: false // ... but show the tooltip when ready
                        },
                        hide: {event: 'unfocus'}, // Don't specify a hide event either!
                        style: {
                                classes: 'qtip-shadow qtip-bootstrap qtip-container'
                        },
                        events: 
                        {
                            show: function(event, api) {                                
                                //$("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).css({"display":"block"});
                            }
                        },
                        api:{
                            onRender:function(){
                                $("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).parent().css({"padding":"2px"});                              
                            }
                        }
                });
                
                $("#"+mainScope.src_component+"-info-panel-"+mainScope.keyPart).css({"padding":"2px"});
                $("#"+mainScope.src_component+"-info-panel-trigger-"+mainScope.keyPart).parent().css({"cursor":"auto"}).removeClass("ui-corner-top ui-state-default").unbind();
                //$("#"+mainScope.src_component+"-info-panel-bar-tab-"+mainScope.keyPart).removeClass("ui-corner-top ui-state-default").unbind(); 
                //$('#'+mainScope.src_component+'-tabs-'+mainScope.keyPart).tabs("disable",5);
            },            
            getRelPath:function(dtnode){
                return appBuilder.runtime_resources.getPath(dtnode);
            },
            definitionMimeToType:function(mime){
                if(mime == 'stm')
                    return 'datastatement';
                if(mime == 'ste')
                    return 'scriptexecutor';
                if(mime == 'upl')
                    return 'fileuploader';
                if(mime == 'esd')
                    return 'emailsender';
                if(mime == 'ins')
                    return 'instantiator';
                if(mime == 'svc')
                    return 'connector';
                return 'unknown';
            },
            definitionTypeToMime:function(type){
                if(type == 'datastatement')
                    return 'stm';
                if(type == 'scriptexecutor')
                    return 'ste';
                if(type == 'fileuploader')
                    return 'upl';
                if(type == 'emailsender')
                    return 'esd';
                if(type == 'instantiator')
                    return 'ins';
                if(type == 'connector')
                    return 'svc';
                return 'unknown';
            },
            createDefinitionNode:function(item){
                if(item.type == 'datastatement')
                    return appBuilder.datastatement.createTreeNode(item);

                if(item.type == 'scriptexecutor')
                    return appBuilder.scriptexecutor.createTreeNode(item);

                if(item.type == 'fileuploader')
                    return appBuilder.fileuploader.createTreeNode(item);

                if(item.type == 'emailsender')
                    return appBuilder.emailsender.createTreeNode(item);        

                if(item.type == 'connector')
                    return appBuilder.connector.createTreeNode(item);

                if(item.type == 'instantiator')
                    return appBuilder.instantiator.createTreeNode(item);

                return null;
            },
            addCrudNode:function(dtnode,name,id,type){
              var newNode = dtnode.addChild(appBuilder.common_core.createDefinitionNode({"name":name+"."+appBuilder.common_core.definitionTypeToMime(type),"id":id,"type":type}));
              newNode.activate();
              
              if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
              
              
              if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                appBuilder.sysadmin.apptaxonomy.newItem(name, id, type, dtnode,newNode);
              }                
            },
            isExecutableType:function(t){
                if(typeof t == "undefined" || t == null)return false;
              
                var types = ["stm","ste","esd","upl","svc","ins"];
                
              	//test endsWith
                for(var i=0;i<types.length;i++)
                	if(t.slice(-types[i].length) == types[i]) return true;
                
                return false;
                //return (t == 'stm' || t == 'ste' || t == 'esd' || t == 'upl' || t == 'svc' || t == 'ins');
            },
            getDtNodeURL:function(dtnode){
                var relPath   = appBuilder.common_core.getRelPath(dtnode); 

                var assetPath  = relPath;      
                var appConfig = appBuilder.common_core.findApp(relPath)?appBuilder.common_core.findApp(relPath):appBuilder.common_core.findApp(relPath+"/web");
                if(appConfig){
                  relPath 	  = relPath.substring(appConfig.baseDir.length);
                  var url = appConfig.contextPath+relPath;
                  if(dtnode.data.type == "appresource-dir")
                     url = url+"/";

                  return (url);
                }
                return null;
            }
};
