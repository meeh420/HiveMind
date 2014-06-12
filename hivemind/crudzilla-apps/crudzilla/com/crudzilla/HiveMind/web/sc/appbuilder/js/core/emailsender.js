/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.emailsender = {
            actionURL:appBuilder.context_path,
            init:function(){
                  $('#emailsender-dialog').dialog({
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
                              $('#emailsender-dialog-name').val(name);
                          	}
                            else
                                $('#emailsender-dialog-name').val('');
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#emailsender-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("clone")){
                                            //$('#emailsender-dialog-name').val(dtnode.data.title);
                                            var name = $('#emailsender-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"emailsender");                                          
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else                                      
                                        if($(this).data("rename")){                                          
                                            appBuilder.emailsender.renameEmailSender($('#emailsender-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.emailsender.newEmailSender($('#emailsender-dialog-name').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for emailsender");
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
                ui.panel.tabid = 'emailsender-'+dtnode.data.id; 
                             
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    emailSenderId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    emailsender_id:dtnode.data.id,
                    src_component:"emailsender",
                    definitionIdParameter:"emailsender_id",                 
                    keyPart : dtnode.data.id
                };


                //handler reference view
                if(typeof ems != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,ems,'emailsender');
                    return;
                }   

                $.ajax({
                    type:'POST',
                    data:{                         
                          "emailsender_id":dtnode.data.id,
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:'api/primary-execution/emailsender/get-emailsender.stm',
                    success:function(data){
                        
                        mainScope.emailSender = eval('('+data+')');
                        
                        block = {
                           run:function(mainScope){
                            $.ajax({
                                type:'POST',
                                url:'sc/appbuilder/ui-templates/emailsender-tab-view.html',
                                success:function(data){
                                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                    $("#emailsender-tab").append(ui.panel.panel);
                                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});

                                    appBuilder.common_core.createParameterTable(mainScope);                                    
                                    mainScope.definition = mainScope.emailSender;
                                    appBuilder.common_core.createPreView(mainScope,'emailsender');
                                    appBuilder.common_core.createPostView(mainScope,'emailsender');
                                                                    
                                    
                                    appBuilder.common_core.createSecurityTable(mainScope);
                                    
                                    $('#emailsender-tabs-'+mainScope.keyPart).tabs({
                                      "active":1
                                    });
                                    $('#emailsender-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    $('#emailsender-execution-handler-tab-'+mainScope.keyPart).tabs({
                                    }).find("ul").css({"border-top":"0"});                                    
                                    $("#tabs").tabs('option', 'active',mainScope.ui.index);
                                    $('#emailsender-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                    
                                    
                                    $('#emailsender-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                        "activate":function(event,ui){
                                            var index = $(this).tabs("option","active");
                                            if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                                appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                        }
                                    }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");                                
                                    appBuilder.common_core.tabCloseBinding($('#emailsender-execution-parameter-definition-tabs-'+mainScope.keyPart),function(){
                                        $('#emailsender-execution-parameter-definition-tabs-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                                    });                                      
                                  
                                    
                                    //$("#"+mainScope.src_component+"-execution-parameter-definition-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.7,"background-color":"blue","overflow":"auto"});
                                  
                                    appBuilder.common_core.modificationNotification(mainScope);
                                    appBuilder.common_core.getStaledReferences(mainScope.definition.id,mainScope.src_component,mainScope.definition.lastModifiedTimeStamp);
                                }
                            });                               
                          }
                       };block.run(mainScope);
                    }
                });
            },            
            newEmailSender:function(name,dtnode){
                $.blockUI();
                
                var emailSender = {
                   "name":name
                };
                $.ajax({
                    type:'POST',
                    data:emailSender,
                    url:'api/primary-execution/emailsender/add-emailsender.stm',
                    success:function(data){                        
                        $.unblockUI();
                      
                      	var id = appBuilder.common_core.stripNewLine(data);
                      
                        appBuilder.common_core.addCrudNode(dtnode,name,id,"emailsender");
                      
                        /**
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".esd";                      
                      
                      	emailSender.name = emailSender.name+ext;
                      
                        emailSender.id = appBuilder.common_core.stripNewLine(data);
                        //create tree control node and append to the emailsender tree                               
                        var newNode = dtnode.addChild(appBuilder.emailsender.createTreeNode(emailSender));
                        newNode.activate();
                        
                      
                     	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
                       
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, emailSender.id, 'emailsender', dtnode,newNode);
                        }
                        */
                    }});
            },            
            renameEmailSender:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name
                        },
                    url:'api/primary-execution/emailsender/update-emailsender-name.stm',
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
            deleteEmailSender:function(dtnode){
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this emailsender?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "emailsender_id":dtnode.data.id
                            },
                            url:appBuilder.emailsender.actionURL+'/api/datastatements/delete-emailsender.stm',
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
            createTreeNode:function(emailSender){
                return {
                    "title":emailSender.name,
                    "addClass":"emailsender-treenode",
                    "type":"emailsender",
                    "isFolder":false,
                    "id":emailSender.id,
                    "key":emailSender.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "crudzillaResultSetFormat":"list"
                        },
                        url:"api/primary-execution/emailsender/get-emailsenders.stm",
                        success:function(data){
                            var emailSenders = eval('('+data+')');
                            for(var i=0;i<emailSenders.length;i++){
                                var emailSender = emailSenders[i];
                                
                                //create tree control node and append to the emailsender tree                               
                                dtnode.addChild(appBuilder.emailsender.createTreeNode(emailSender));
                            }
                        }
                   });                
            }
};
