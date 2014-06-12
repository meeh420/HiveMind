/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



appBuilder.scriptexecutor = {
            actionURL:appBuilder.context_path,
            init:function(){
                var _this = this;
                  $('#scriptexecutor-dialog').dialog({
                        autoOpen: false,
                        width: 250,
                        open:function(){
                            var dtnode = $(this).data("dtnode");
                            
                            if($(this).data("rename") || $(this).data("clone")){
                                $('#scriptexecutor-dialog-type-box').css({"display":"none"});
                                
                                var name = "";
                                if(dtnode.parent.data.type != "apptaxonomy-category" && dtnode.data.title.lastIndexOf('.') != -1){
                                  name = dtnode.data.title.substring(0,dtnode.data.title.lastIndexOf('.'));
                                  mime = dtnode.data.title.substring(dtnode.data.title.lastIndexOf('.')+1);
                                  $(this).data("mime",mime);
                                }else{
                                  name = dtnode.data.title;
                                  $(this).data("mime","");
                                }                           
                                $('#scriptexecutor-dialog-name').val(name);
                            }
                            else{
                                $('#scriptexecutor-dialog-type-box').css({"display":"block"});
                                $('#scriptexecutor-dialog-type-box select').val('groovy');
                                $('#scriptexecutor-dialog-name').val('');
                            }
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#scriptexecutor-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("clone")){
                                            //$('#scriptexecutor-dialog-name').val(dtnode.data.title);
                                            var name = $('#scriptexecutor-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"scriptexecutor");                                          
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else                                      
                                        if($(this).data("rename")){
                                          
                                            appBuilder.scriptexecutor.renameScriptExecutor($('#scriptexecutor-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.scriptexecutor.newScriptExecutor($('#scriptexecutor-dialog-name').val(),$('#scriptexecutor-dialog-type').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("Please provide an appropriate name for ScriptExecutor");
                                    }
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                  });   
              
              
              $.ajax({
                type:'POST',
                url:'/crudzilla-platform/engine/jsr-223/language/languages.ins',
                success:function(data){
                  var langs = eval('('+data+')');
                  
                  for(var key in langs){
                    var lang = langs[key];
                    $("#scriptexecutor-dialog-type").append("<option value=\""+lang.type+"\">"+lang.name+"</option>"); 
                    if(lang.supportDisk == "true")
                      $("#scriptexecutor-dialog-type").append("<option value=\""+lang.type+"-file\">"+lang.name+"(file)</option>");
                  }
                }});
            },
            createTabView:function(ui,event,dstm){
                var dtnode = ui.panel.dtnode;
                var _this = this;
                ui.panel.tabid = 'scriptexecutor-'+dtnode.data.id; 
                               
                
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    scriptExecutorId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    scriptExecutor:null,
                    scriptexecutor_id:dtnode.data.id,
                    src_component:"scriptexecutor",
                    definitionIdParameter:"scriptexecutor_id",                 
                    keyPart : dtnode.data.id
                };            
                
                //handler reference view
                if(typeof dstm != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,dstm,'scriptexecutor');
                    return;
                }                
                
                $.ajax({
                    type:'POST',
                    data:{                         
                          "scriptexecutor_id":dtnode.data.id,
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:"/api/primary-execution/scriptexecutor/get-scriptexecutor.stm",
                    success:function(data){
                        
                        mainScope.scriptExecutor = eval('('+data+')');//.rows[0];
                        mainScope.definition = mainScope.scriptExecutor;
                        
                        block = {
                           run:function(mainScope){
                            $.ajax({
                                type:'POST',
                                url:'/sc/appbuilder/ui-templates/scriptexecutor-tab-view.html',
                                success:function(data){
                                    //$("<div id=\""+ui.panel.tabid+"-content\"></div>").appendTo("#scriptexecutor-tab");
                                    //ui.panel.panel = $("#scriptexecutor-tab div:last-child");
                                    //$(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));

                                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                    $("#scriptexecutor-tab").append(ui.panel.panel);
                                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
                                    
                                    block = {
                                        run:function(mainScope){
                                            
                                                $('#scriptexecutor-description-'+mainScope.keyPart).val(mainScope.scriptExecutor.description);                                                
                                                appBuilder.setCheckStatus($('#scriptexecutor-enabled-'+mainScope.keyPart),mainScope.scriptExecutor.enabled);
                                               
                                                
                                                $('#scriptexecutor-save-button-'+mainScope.keyPart).button({
                                                    icons: {
                                                    primary: "ui-icon-disk"
                                                    },
                                                    text: true})
                                                .click(function(){
                                                        try{
                                                            var description     = $('#scriptexecutor-description-'+mainScope.keyPart).val();                                                            
                                                            var enabled         = appBuilder.getCheckStatus($('#scriptexecutor-enabled-'+mainScope.keyPart));

                                                            $.blockUI();
                                                            $.ajax({
                                                                type:'POST',
                                                                data:{
                                                                    "id":mainScope.scriptExecutor.id,
                                                                    "description":description,
                                                                    "enabled":enabled,
                                                                    "action":"update"
                                                                },
                                                                url:appBuilder.scriptExecutor.actionURL,
                                                                success:function(data){                                                            
                                                                    $.unblockUI();
                                                                }
                                                            });
                                                        }catch(Error){}
                                                });                                                 
                                        }
                                    };block.run(mainScope);
                                    
                                    
                                    block = {
                                        run:function(mainScope){
                                            
                                            var srcType = appBuilder.common_core.getEditorModeFromExt("x."+mainScope.scriptExecutor.type.split('-')[0]);
                                            /*if(mainScope.scriptExecutor.type == "jexl"){
                                                srcType = "javascript";
                                                $("#scriptexecutor-type-label-"+mainScope.scriptExecutor.id).html("jexl");
                                            }
                                            else
                                            if(mainScope.scriptExecutor.type == "scala"){
                                                srcType = "scala";    
                                                $("#scriptexecutor-type-label-"+mainScope.scriptExecutor.id).html("scala");
                                            }
                                            else
                                            if(mainScope.scriptExecutor.type == "velocity-template-file" || 
                                               mainScope.scriptExecutor.type == "velocity-template"){
                                                srcType = "htmlmixed";//"text/velocity";
                                                $("#scriptexecutor-type-label-"+mainScope.scriptExecutor.id).html("velocity");
                                            }
                                            else
                                            if(mainScope.scriptExecutor.type == "groovy-file" || 
                                               mainScope.scriptExecutor.type == "groovy"){
                                                srcType = "text/x-groovy";//"text/velocity";
                                                $("#scriptexecutor-type-label-"+mainScope.scriptExecutor.id).html("groovy");
                                            }    */                                        
                                            
                                            $("#scriptexecutor-type-label-"+mainScope.scriptExecutor.id).html(mainScope.scriptExecutor.type.split('-')[0]);
                                            
                                            mainScope.scriptExecutor.codeEditor = CodeMirror.fromTextArea(document.getElementById("scriptexecutor-code-editor-"+mainScope.scriptExecutor.id), 
                                            {
                                                mode:srcType,                              
                                                lineNumbers: true,                              
                                                matchBrackets: true
                                            });
                                          
                                            
                                            CodeMirror.autoLoadMode(mainScope.scriptExecutor.codeEditor, srcType);
                                          
                                            mainScope.scriptExecutor.codeEditor.on("change",function(editor){editor.contentModified = true;});
                                            mainScope.ui.panel.editor = mainScope.scriptExecutor.codeEditor;
                                            
                                            mainScope.scriptExecutor.codeEditor.setValue(mainScope.scriptExecutor.code);
                                            mainScope.scriptExecutor.codeEditor.clearHistory();
                                            appBuilder.registeredEditors.push(
                                                {
                                                    "tabid": mainScope.ui.panel.tabid,
                                                    url:"/api/primary-execution/scriptexecutor/update-scriptexecutor-code.stm",
                                                    params:{
                                                        "content_param":"code",
                                                        "id":mainScope.scriptExecutor.id,
                                                        "action":"update-code"
                                                    },
                                                    onSave:function(){
                                                      appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);  
                                                    },
                                                    editor:mainScope.scriptExecutor.codeEditor
                                                }
                                            );        
                                            appBuilder.editor_toolbar.setEditor(mainScope.scriptExecutor.codeEditor);
                                            $("#"+ui.panel.tabid).data("editor",mainScope.scriptExecutor.codeEditor);
                                            $("#scriptexecutor-code-tab-"+mainScope.scriptExecutor.id).data("editor",mainScope.scriptExecutor.codeEditor);
                                      
                                            mainScope.scriptExecutor.codeEditor.setSize(null,$(ui.panel.panel).parent().parent().height()*0.80);
                                          
                                            if(srcType == 'html' || srcType == 'htmlmixed' || srcType == 'xml')
                                              mainScope.scriptExecutor.codeEditor.on("gutterClick", function(cm, where) { cm.foldCode(where, CodeMirror.tagRangeFinder); });
                                            else
                                              mainScope.scriptExecutor.codeEditor.on("gutterClick", function(cm, where) { cm.foldCode(where, CodeMirror.braceRangeFinder); });
                                        }
                                    };
                                    if(mainScope.scriptExecutor.type != 'crudzilla'){
                                       $("#scriptexecutor-jexl-"+mainScope.scriptExecutor.id).css({"display":"block"});
                                       $("#scriptexecutor-crudzilla-"+mainScope.scriptExecutor.id).css({"display":"none"})
                                         
                                        block.run(mainScope);
                                    }
                                    else
                                    {
                                       $("#scriptexecutor-jexl-"+mainScope.scriptExecutor.id).css({"display":"none"});
                                       $("#scriptexecutor-crudzilla-"+mainScope.scriptExecutor.id).css({"display":"block"})
                                       _this.createStatementTree(mainScope.scriptExecutor.id);      
                                    }



                                    appBuilder.common_core.createParameterTable(mainScope);                                    
                                    mainScope.definition = mainScope.scriptExecutor;
                                    appBuilder.common_core.createPreView(mainScope,'scriptexecutor');
                                    appBuilder.common_core.createPostView(mainScope,'scriptexecutor');
                                                                    
                                    
                                    appBuilder.common_core.createSecurityTable(mainScope);
                                    
                                    $('#scriptexecutor-tabs-'+mainScope.keyPart).tabs({
                                        "active":1,
                                        "activate":function(event, ui){
                                            if($(this).tabs("option", "active") == 1){
                                                mainScope.scriptExecutor.codeEditor.refresh();
                                            }
                                          
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                            	appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                        }          
                                    });
                                    $('#scriptexecutor-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    $('#scriptexecutor-execution-handler-tab-'+mainScope.keyPart).tabs({
                                        "active":1,
                                        "activate":function(event, ui){
                                            
                                            if($(this).tabs("option", "active") == 0){
                                                mainScope.scriptExecutor.codeEditor.refresh();
                                            }
                                          
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                                appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                          
                                        }
                                    }).find("ul").css({"border-top":"0"});                                    
                                    $("#tabs").tabs('option', 'active',mainScope.ui.index);
									$('#scriptexecutor-execution-handler-tab-'+mainScope.keyPart).tabs("option","active",0);

                                    $('#scriptexecutor-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    
                                    $('#scriptexecutor-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                        "activate":function(event,ui){
                                            var index = $(this).tabs("option","active");
                                          
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                                appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                        }
                                    }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");                                
                                    appBuilder.common_core.tabCloseBinding($('#scriptexecutor-execution-parameter-definition-tab-'+mainScope.keyPart),function(){
                                        $('#scriptexecutor-execution-parameter-definition-tab-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                                    });                                    
                                    
                                    
                                    appBuilder.common_core.modificationNotification(mainScope);
                                    appBuilder.common_core.getStaledReferences(mainScope.definition.id,mainScope.src_component,mainScope.definition.lastModifiedTimeStamp);
                                }
                            });                               
                          }
                       };block.run(mainScope);
                    }
                });
            },            
            newScriptExecutor:function(name,type,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name,
                            "type":type,
                            "action":"new"
                        },
                    url:'/api/primary-execution/scriptexecutor/add-scriptexecutor.stm',
                    success:function(data){                        
                        $.unblockUI();
                      
                      	var id = appBuilder.common_core.stripNewLine(data);
                      
                      	appBuilder.common_core.addCrudNode(dtnode,name,id,"scriptexecutor");
                      
                      
                        /*
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".ste";                      
                      
                      	                      
                        var id = appBuilder.common_core.stripNewLine(data);
                        var newNode = dtnode.addChild(appBuilder.scriptexecutor.createTreeNode({"name":name+ext,"id":id}));
                        newNode.activate();
                            
                      
                        if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root"){
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
                           
                            
                            if(type == "velocity-template-file")
                      		  appBuilder.runtime_resources.addResourceNode({files:[{"name":name+".vm","mime":"vm","isFolder":false}]},newNode);
                      	}
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, id, 'scriptexecutor', dtnode,newNode);
                        }
                        */
                        
                        
                    }});
            },            
            renameScriptExecutor:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name,
                            "action":"rename"
                        },
                    url:"/api/primary-execution/scriptexecutor/update-scriptexecutor-name.stm",
                    success:function(data){                        
                        $.unblockUI();     
                         //dtnode.data.title = name;
                         //dtnode.render();
                         if(dtnode.getParent().data.type == 'apptaxonomy-category' || dtnode.getParent().data.type == 'appresource-dir'){
                            //appBuilder.sysadmin.apptaxonomy.renameItem(name,dtnode);
                           
                            //rename executable if it exists
                            appBuilder.runtime_resources.renameResource(name,appBuilder.common_core.definitionTypeToMime(dtnode.data.type),dtnode);                           
                         }                         
                    }});
            },            
            deleteScriptExecutor:function(dtnode){
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this scriptexecutor?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "scriptexecutor_id":dtnode.data.id,
                                "action":"delete"
                            },
                            url:appBuilder.scriptexecutor.actionURL+"/api/datastatements/delete-scriptexecutor.stm",
                            success:function(data){
                                if(dtnode.getParent().data.type == 'apptaxonomy-category'){
                                    appBuilder.sysadmin.apptaxonomy.deleteItem(dtnode.getParent().data.appTaxonomyId,dtnode.data.link_id);
                                }
                                dtnode.remove();
                                $.unblockUI();
                            }
                    });
                }*/
            },
            createTreeNode:function(scriptexecutor){
                return {
                    "title":scriptexecutor.name,
                    "addClass":"scriptexecutor-treenode",
                    "type":"scriptexecutor",
                    "isFolder":false,
                    "id":scriptexecutor.id,
                    "key":scriptexecutor.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "action":"list"
                        },
                        url:"/api/primary-execution/scriptexecutor/get-scriptexecutors.stm",
                        success:function(data){
                            var scriptExecutors = eval('('+data+')');
                            for(var i=0;i<scriptExecutors.length;i++){
                                var scriptExecutor = scriptExecutors[i];
                                
                                //create tree control node and append to the jsservlet tree                               
                                dtnode.addChild(appBuilder.scriptexecutor.createTreeNode(scriptExecutor));
                            }
                        }
                   });                
            },
            getNonNullVal:function(val){
              if(typeof val == 'undefined' || val == null)return '';
              return val;
            }
};
