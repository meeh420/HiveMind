/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.fileuploader = {
            actionURL:appBuilder.context_path,
            init:function(){
                  $('#fileuploader-dialog').dialog({
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
                              $('#fileuploader-dialog-name').val(name);
                          	}
                            else
                                $('#fileuploader-dialog-name').val('');
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#fileuploader-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                      
                                      
                                        if($(this).data("clone")){
                                            //$('#fileuploader-dialog-name').val(dtnode.data.title);
                                            var name = $('#fileuploader-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"fileuploader");                                           
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else                                      
                                        if($(this).data("rename")){                                          
                                            appBuilder.fileuploader.renameFileUploader($('#fileuploader-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.fileuploader.newFileUploader($('#fileuploader-dialog-name').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for fileuploader");
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
                ui.panel.tabid = 'fileuploader-'+dtnode.data.id; 
                               
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    fileUploaderId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    fileuploader_id:dtnode.data.id,
                    src_component:"fileuploader",
                    definitionIdParameter:"fileuploader_id",                 
                    keyPart : dtnode.data.id
                };


                //handler reference view
                if(typeof ems != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,ems,'fileuploader');
                    return;
                }   

                $.ajax({
                    type:'POST',
                    data:{                         
                          "fileuploader_id":dtnode.data.id,
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:'api/primary-execution/fileuploader/get-fileuploader.stm',
                    success:function(data){
                        
                        mainScope.fileUploader = eval('('+data+')');
                        
                        block = {
                           run:function(mainScope){
                            $.ajax({
                                type:'POST',
                                url:'sc/appbuilder/ui-templates/fileuploader-tab-view.html',
                                success:function(data){
                                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                    $("#fileuploader-tab").append(ui.panel.panel);
                                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});

                                    appBuilder.common_core.createParameterTable(mainScope);                                    
                                    mainScope.definition = mainScope.fileUploader;
                                    appBuilder.common_core.createPreView(mainScope,'fileuploader');
                                    appBuilder.common_core.createPostView(mainScope,'fileuploader');
                                                                    
                                    
                                    appBuilder.common_core.createSecurityTable(mainScope);
                                    
                                    $('#fileuploader-tabs-'+mainScope.keyPart).tabs({
                                      "active":1
                                    });
                                    $('#fileuploader-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    $('#fileuploader-execution-handler-tab-'+mainScope.keyPart).tabs({
                                    }).find("ul").css({"border-top":"0"});                                    
                                    $("#tabs").tabs('option', 'active',mainScope.ui.index);
                                    $('#fileuploader-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    
                                    $('#fileuploader-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                        "activate":function(event,ui){
                                            var index = $(this).tabs("option","active");
                                          
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                                appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                          
                                        }
                                    }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");                                
                                    appBuilder.common_core.tabCloseBinding($('#fileuploader-execution-parameter-definition-tab-'+mainScope.keyPart),function(){
                                        $('#fileuploader-execution-parameter-definition-tab-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
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
            newFileUploader:function(name,dtnode){
                $.blockUI();
                
                var fileUploader = {
                   "name":name
                };
                $.ajax({
                    type:'POST',
                    data:fileUploader,
                    url:'api/primary-execution/fileuploader/add-fileuploader.stm',
                    success:function(data){                        
                        $.unblockUI();
                      
                      	var id = appBuilder.common_core.stripNewLine(data);
                      
                      	appBuilder.common_core.addCrudNode(dtnode,name,id,"fileuploader");
                      
                        /*
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".upl";                         
                      
                      	fileUploader.name = fileUploader.name+ext;
                      
                        fileUploader.id = appBuilder.common_core.stripNewLine(data);
                        //create tree control node and append to the fileuploader tree                               
                        var newNode = dtnode.addChild(appBuilder.fileuploader.createTreeNode(fileUploader));
                        newNode.activate();
                        
                        if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
             
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, fileUploader.id, 'fileuploader', dtnode,newNode);
                          
                            //rename executable if it exists
                            appBuilder.runtime_resources.renameResource(name,appBuilder.common_core.definitionTypeToMime(dtnode.data.type),dtnode);                          
                        }
                        */
                    }});
            },            
            renameFileUploader:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name
                        },
                    url:'api/primary-execution/fileuploader/update-fileuploader-name.stm',
                    success:function(data){                        
                        $.unblockUI();     
                         //dtnode.data.title = name;
                         //dtnode.render();
                         
                         if(dtnode.getParent().data.type == 'apptaxonomy-category' || dtnode.getParent().data.type == 'appresource-dir'){
                            //appBuilder.sysadmin.apptaxonomy.renameItem(name,dtnode);
                            appBuilder.runtime_resources.renameResource(name,appBuilder.common_core.definitionTypeToMime(dtnode.data.type),dtnode);
                         }                         
                    }});
            },            
            deleteFileUploader:function(dtnode){
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this fileuploader?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "fileuploader_id":dtnode.data.id
                            },
                            url:appBuilder.fileuploader.actionURL+'/api/datastatements/delete-fileuploader.stm',
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
            createTreeNode:function(fileUploader){
                return {
                    "title":fileUploader.name,
                    "addClass":"fileuploader-treenode",
                    "type":"fileuploader",
                    "isFolder":false,
                    "id":fileUploader.id,
                    "key":fileUploader.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "crudzillaResultSetFormat":"list"
                        },
                        url:"api/primary-execution/fileuploader/get-fileuploaders.stm",
                        success:function(data){
                            var fileUploaders = eval('('+data+')');
                            for(var i=0;i<fileUploaders.length;i++){
                                var fileUploader = fileUploaders[i];
                                
                                //create tree control node and append to the fileuploader tree                               
                                dtnode.addChild(appBuilder.fileuploader.createTreeNode(fileUploader));
                            }
                        }
                   });                
            }
};
