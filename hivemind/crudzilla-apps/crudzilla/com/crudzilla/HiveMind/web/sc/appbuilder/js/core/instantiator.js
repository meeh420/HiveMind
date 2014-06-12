/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.instantiator = {
            actionURL:appBuilder.context_path,
            init:function(){
                  $('#instantiator-dialog').dialog({
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
                              $('#instantiator-dialog-name').val(name);
                          	}
                            else
                                $('#instantiator-dialog-name').val('');
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#instantiator-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("clone")){
                                            
                                            //$('#instantiator-dialog-name').val(dtnode.data.title);
                                            var name = $('#instantiator-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"instantiator");                                            
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else                               
                                        if($(this).data("rename")){
                                            appBuilder.instantiator.renameInstantiator($('#instantiator-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.instantiator.newInstantiator($('#instantiator-dialog-name').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for instantiator");
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
                ui.panel.tabid = 'instantiator-'+dtnode.data.id; 
                               
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    instantiatorId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    instantiator_id:dtnode.data.id,
                    src_component:"instantiator",
                    definitionIdParameter:"instantiator_id",                 
                    keyPart : dtnode.data.id
                };


                //handler reference view
                if(typeof ems != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,ems,'instantiator');
                    return;
                }   

                $.ajax({
                    type:'POST',
                    data:{                         
                          "instantiator_id":dtnode.data.id,
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:'api/primary-execution/instantiator/get-instantiator.stm',
                    success:function(data){
                        
                        mainScope.instantiator = eval('('+data+')');
                        
                        block = {
                           run:function(mainScope){
                            $.ajax({
                                type:'POST',
                                url:'sc/appbuilder/ui-templates/instantiator-tab-view.html',
                                success:function(data){
                                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                    $("#instantiator-tab").append(ui.panel.panel);
                                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});

                                    appBuilder.common_core.createParameterTable(mainScope);                                    
                                    mainScope.definition = mainScope.instantiator;
                                    appBuilder.common_core.createPreView(mainScope,'instantiator');
                                    appBuilder.common_core.createPostView(mainScope,'instantiator');
                                                                    
                                    
                                    appBuilder.common_core.createSecurityTable(mainScope);
                                    
                                    $('#instantiator-tabs-'+mainScope.keyPart).tabs({
                                      "active":1
                                    });
                                    $('#instantiator-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    $('#instantiator-execution-handler-tab-'+mainScope.keyPart).tabs({
                                    }).find("ul").css({"border-top":"0"});                                    
                                    $("#tabs").tabs('option', 'active',mainScope.ui.index);
                                    $('#instantiator-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    
                                    $('#instantiator-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                        "activate":function(event,ui){
                                            var index = $(this).tabs("option","active");
                                          
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                                appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                          
                                        }
                                    }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");                                
                                    appBuilder.common_core.tabCloseBinding($('#instantiator-execution-parameter-definition-tab-'+mainScope.keyPart),function(){
                                        $('#instantiator-execution-parameter-definition-tab-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
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
            newInstantiator:function(name,dtnode,callback){
                $.blockUI();
                
                var instantiator = {
                            
                            "name":name
                };
                $.ajax({
                    type:'POST',
                    data:instantiator,
                    url:'api/primary-execution/instantiator/add-instantiator.stm',
                    success:function(data){                        
                        $.unblockUI();
                        
                        var id = appBuilder.common_core.stripNewLine(data);
                      
                        appBuilder.common_core.addCrudNode(dtnode,name,id,"instantiator");
                      
                      	/*
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".ins";                       
                      
                      	instantiator.name = instantiator.name+ext;
                      
                        instantiator.id = appBuilder.common_core.stripNewLine(data);
                        //create tree control node and append to the instantiator tree                               
                        var newNode = dtnode.addChild(appBuilder.instantiator.createTreeNode(instantiator));
                        newNode.activate();
                        
                      
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
                      
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, instantiator.id, 'instantiator', dtnode,newNode);
                        }
                        */
                      
                        if(typeof callback != "undefined")
                          callback(id);
                    }});
            },            
            renameInstantiator:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name
                        },
                    url:'api/primary-execution/instantiator/update-instantiator-name.stm',
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
            deleteInstantiator:function(dtnode){
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this instantiator?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "instantiator_id":dtnode.data.id
                            },
                            url:appBuilder.instantiator.actionURL+'/api/datastatements/delete-instantiator.stm',
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
            createTreeNode:function(instantiator){
                return {
                    "title":instantiator.name,
                    "addClass":"instantiator-treenode",
                    "type":"instantiator",
                    "isFolder":false,
                    "id":instantiator.id,
                    "key":instantiator.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "crudzillaResultSetFormat":"list"
                        },
                        url:"api/primary-execution/instantiator/get-instantiators.stm",
                        success:function(data){
                            var instantiators = eval('('+data+')');
                            for(var i=0;i<instantiators.length;i++){
                                var instantiator = instantiators[i];
                                
                                //create tree control node and append to the instantiator tree                               
                                dtnode.addChild(appBuilder.instantiator.createTreeNode(instantiator));
                            }
                        }
                   });                
            }
};
