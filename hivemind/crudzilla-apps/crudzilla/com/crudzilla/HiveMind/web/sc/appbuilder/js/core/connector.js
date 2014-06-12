/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.connector = {
            actionURL:appBuilder.context_path,
            init:function(){
                  $('#connector-dialog').dialog({
                        autoOpen: false,
                        width: 150,
                        open:function(){
                            var dtnode = $(this).data("dtnode");
                            
                            if($(this).data("rename") || $(this).data("clone")){
                              var name = "";
                              if(dtnode.parent.data.type != "apptaxonomy-category" && dtnode.data.title.lastIndexOf('.') != -1){
                                name = dtnode.data.title.substring(0,dtnode.data.title.lastIndexOf('.'));
                                mime = dtnode.data.title.substring(dtnode.data.title.lastIndexOf('.')+1);
                                $(this).data("mime",mime);
                              }else{
                                name = dtnode.data.title;
                                $(this).data("mime","");
                              }                           
                              $('#connector-dialog-name').val(name);
                            }
                            else
                                $('#connector-dialog-name').val('');
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#connector-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("clone")){
                                            //$('#connector-dialog-name').val(dtnode.data.title);
                                            var name = $('#connector-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"connector");
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else                                      
                                        if($(this).data("rename")){                                          
                                            appBuilder.connector.renameConnector($('#connector-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.connector.newConnector($('#connector-dialog-name').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for connector");
                                    }
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                  });                
            },
            createTabView:function(ui,event,ems){
                var dtnode = ui.panel.dtnode;
                var _this = this;
                ui.panel.tabid = 'connector-'+dtnode.data.id; 
                               
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    connectorId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    connector_id:dtnode.data.id,
                    src_component:"connector",
                    definitionIdParameter:"connector_id",                 
                    keyPart : dtnode.data.id
                };

                
                //handler reference view
                if(typeof ems != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,ems,'connector');
                    return;
                }   

                $.ajax({
                    type:'POST',
                    data:{                         
                          "connector_id":dtnode.data.id,
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:'api/primary-execution/connector/get-connector.stm',
                    success:function(data){
                        
                        mainScope.connector = eval('('+data+')');
                        
                        block = {
                           run:function(mainScope){
                            $.ajax({
                                type:'POST',
                                url:'sc/appbuilder/ui-templates/connector-tab-view.html',
                                success:function(data){
                                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                    $("#connector-tab").append(ui.panel.panel);
                                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});

                                    appBuilder.common_core.createParameterTable(mainScope);                                    
                                    mainScope.definition = mainScope.connector;
                                    appBuilder.common_core.createPreView(mainScope,'connector');
                                    appBuilder.common_core.createPostView(mainScope,'connector');
                                                                    
                                    
                                    appBuilder.common_core.createSecurityTable(mainScope);
                                    
                                    $('#connector-tabs-'+mainScope.keyPart).tabs({"active":1});
                                    $('#connector-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    $('#connector-execution-handler-tab-'+mainScope.keyPart).tabs({
                                      
                                    }).find("ul").css({"border-top":"0"});                                    
                                    $("#tabs").tabs('option','active',mainScope.ui.index);
                                    $('#connector-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    
                                    $('#connector-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                        "activate":function(event,ui){
                                            var index = $(this).tabs("option","active");  
                                          
                                        if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                            appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                          
                                        }
                                    }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");                                
                                    appBuilder.common_core.tabCloseBinding($('#connector-execution-parameter-definition-tab-'+mainScope.keyPart),function(){
                                        $('#connector-execution-parameter-definition-tab-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
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
            newConnector:function(name,dtnode){
                $.blockUI();
                
                var connector = {
                   "name":name
                };
                $.ajax({
                    type:'POST',
                    data:connector,
                    url:'api/primary-execution/connector/add-connector.stm',
                    success:function(data){                        
                        $.unblockUI();
                        
                        var id = appBuilder.common_core.stripNewLine(data);
                      
                        appBuilder.common_core.addCrudNode(dtnode,name,id,"connector");
                      	/*
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".svc"; 
                      
                        connector.name = connector.name+ext;
                        //create tree control node and append to the connector tree                               
                        var newNode = dtnode.addChild(appBuilder.connector.createTreeNode(connector));
                        newNode.activate();
                        
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, connector.id, 'connector', dtnode,newNode);
                        }
                        */
                    }});
            },            
            renameConnector:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name
                        },
                    url:'api/primary-execution/connector/update-connector-name.stm',
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
            deleteConnector:function(dtnode){
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this connector?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "connector_id":dtnode.data.id
                            },
                            url:appBuilder.connector.actionURL+'/api/datastatements/delete-connector.stm',
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
            createTreeNode:function(connector){
                return {
                    "title":connector.name,
                    "addClass":"connector-treenode",
                    "type":"connector",
                    "isFolder":false,
                    "id":connector.id,
                    "key":connector.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "crudzillaResultSetFormat":"list"
                        },
                        url:"api/primary-execution/connector/get-connectors.stm",
                        success:function(data){
                            var connectors = eval('('+data+')');
                            for(var i=0;i<connectors.length;i++){
                                var connector = connectors[i];
                                
                                //create tree control node and append to the connector tree                               
                                dtnode.addChild(appBuilder.connector.createTreeNode(connector));
                            }
                        }
                   });                
            }
};
