/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.datastatement = {
            actionURL:appBuilder.context_path,            
            _dataStatements:[],
            validation_types:[
                {"name":"integer"},
                {"name":"float"},
                {"name":"byte"},
                {"name":"short"},  
                {"name":"long"},
                {"name":"double"},
                {"name":"date"},
                {"name":"creditcard"},
                {"name":"email"},
                {"name":"url"},
                {"name":"mask"}               
            ],
            type_list:[],
            init:function(){
                                                 
                  for(var i=0;i<this.validation_types.length;i++){
                        this.type_list.push("<option value\""+this.validation_types[i].name+"\">"+this.validation_types[i].name+"</option>");
                  }                
                  $('#datastatement-dialog').dialog({
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
                              $('#datastatement-dialog-name').val(name);
                           }
                            else
                                $('#datastatement-dialog-name').val('');
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#datastatement-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("clone")){
                                            
                                            //$('#datastatement-dialog-name').val(dtnode.data.title);
                                            var name = $('#datastatement-dialog-name').val();
                                            appBuilder.common_core.cloneCrudDefinition(dtnode.data.id,name,function(id){
                                                appBuilder.common_core.addCrudNode(dtnode.parent,name,id,"datastatement");                                          
                                            });
                                            $(this).data("clone",false);
                                        }
                                        else
                                        if($(this).data("rename")){
                                            appBuilder.datastatement.renameDataStatement($('#datastatement-dialog-name').val(), dtnode);
                                        }
                                        else
                                            appBuilder.datastatement.newDataStatement($('#datastatement-dialog-name').val(), dtnode);
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for datastatement");
                                    }
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                  });                
            },
            getNonNullVal:function(val){
              if(typeof val == 'undefined' || val == null)return '';
              return val;
            },
            getSQL:function(mainScope){                
                var _this = this;
                
                mainScope.dataStatement.sqlEditor = CodeMirror.fromTextArea(document.getElementById("datastatement-sql-editor-"+mainScope.keyPart), {
                mode:"text/x-sql",                              
                lineNumbers: true,                              
                matchBrackets: true});
              
                mainScope.dataStatement.sqlCode = mainScope.dataStatement.sqlCode != null?mainScope.dataStatement.sqlCode:"";
                
                mainScope.dataStatement.sqlEditor.on("change",function(editor){editor.contentModified = true;});             
                appBuilder.setRegisteredEditorContent(mainScope.dataStatement.sqlEditor,mainScope.dataStatement.sqlCode);

                //mainScope.dataStatement.sqlEditor.setValue(data);
                appBuilder.editor_toolbar.setEditor(mainScope.dataStatement.sqlEditor);
                
                mainScope.ui.panel.editor = mainScope.dataStatement.sqlEditor;

                
              	CodeMirror.autoLoadMode(mainScope.dataStatement.sqlEditor, "sql");
                
                var appConfig = appBuilder.common_core.findApp(appBuilder.common_core.getRelPath(mainScope.dtnode));
              
                //alert(appBuilder.common_core.resolvePathToApp(appBuilder.common_core.getRelPath(mainScope.dtnode)))
                appBuilder.registeredEditors.push(
                {
                    "tabid": mainScope.ui.panel.tabid,
                    url:"api/primary-execution/datastatement/update-datastatement.stm",
                    params:{
                        "content_param":"sql_code",
                      	"crudAppPath":appConfig?appConfig.baseDir:"",
                        "crudPath":appBuilder.common_core.resolvePathToApp(appBuilder.common_core.getRelPath(mainScope.dtnode)),
                        "datastatement_id":mainScope.dataStatement.id
                    },                                                            
                    onSave:function(){
                        //alert(appBuilder.common_core.findApp(appBuilder.common_core.getRelPath(mainScope.dtnode)).baseDir+":"+appBuilder.common_core.resolvePathToApp(appBuilder.common_core.getRelPath(mainScope.dtnode)));
                        $.ajax({
                            data:{
                                "datastatement_id":mainScope.dataStatement.id,                                
                                "crudzillaResultSetFormat":"bean"
                            },
                            type:'POST',
                            url:"api/primary-execution/datastatement/get-datastatement.stm",
                            success:function(data){
                                 
                                var dataStatement = eval('('+data+')');

                                mainScope.dataStatement.preparedStatementParamList  = dataStatement.preparedStatementParamList
                                mainScope.dataStatement.resultSetTemplate           = dataStatement.resultSetTemplate;
                                mainScope.dataStatement.sqlCode                     = dataStatement.sqlCode;
                                mainScope.dataStatement.preparedStatement           = dataStatement.preparedStatement;                                                                

                                appBuilder.setRegisteredEditorContent(mainScope.dataStatement.sqlExecutableEditor,mainScope.dataStatement.preparedStatement);
                                //mainScope.dataStatement.sqlExecutableEditor.setValue(data);                                                                 

                                $("#datastatement-sql-executable-param-list-"+mainScope.keyPart).html(mainScope.dataStatement.preparedStatementParamList);
                                $("#datastatement-sql-executable-resultset-template-"+mainScope.keyPart).html(mainScope.dataStatement.resultSetTemplate); 
                                
                                appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                            }
                        });
                    },
                    editor:mainScope.dataStatement.sqlEditor
                });
  				
            },
            updateDataSource:function(mainScope){
                var _this = this;
                $.blockUI();
                var data={
                    "datastatement_id":mainScope.dataStatement.id,
                    "datasource_id":$("#datastatement-datasource-"+mainScope.keyPart).val()
                };
                $.ajax({
                    type:'POST',
                    data:data,
                    url:"api/primary-execution/datastatement/update-datastatement-datasource.stm",
                    success:function(data){
                        appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition_id);
                        $.unblockUI();
                    }
                });                
            },
            setUpDataSourceControl:function(mainScope){
                var _this = this;
                /*--$("#datastatement-datasource-drop-"+mainScope.keyPart).droppable({
                    drop: function( event, ui ) {
                        alert('droped')
                    }
                });*/
                
                $("#datastatement-clear-datasource-drop-button-"+mainScope.keyPart).button({
                        text: false,
                        icons: {
                                primary: "ui-icon-trash"
                        }
                }).css({"display":"none"}).click(function(){
                    
                    _this.updateDataSource(mainScope);
                });
            },
            showAppDirNav:function(id,seltr){
                var _this = this;
                appBuilder.appDirNavActionHandler = function(){
                    var treeControl = $("#app-directory-navigator-treecontrol").dynatree('getTree');

                    var activeNode = treeControl.getActiveNode();
                    if(activeNode != null){
                        $('#datastatement-'+seltr+'execution-path-'+id).val(activeNode.data.relPath);
                        
                        var pathPart = _this.getNonNullVal(activeNode.data.relPath).split('/');
                        var executableName = pathPart.length>0?pathPart[pathPart.length-1]:'';                        
                        $('#datastatement-'+seltr+'execution-path-label-'+id).html(executableName);
                    }
                }
                appBuilder.showAppDirNav();
            },
            createTabView:function(ui,event,dstm){
                var _this = this;
                var dtnode = ui.panel.dtnode;
                ui.panel.tabid = 'datastatement-'+dtnode.data.id; 
                                   
                var mainScope = {
                    ui:ui,
                    dtnode : ui.panel.dtnode,
                    dataStatementId :dtnode.data.id,
                    definitionId:dtnode.data.id,
                    src_component:"datastatement",
                    definitionIdParameter:"datastatement_id",
                    dataStatement:null,
                    keyPart : dtnode.data.id
                };            


                //handler reference view
                if(typeof dstm != "undefined"){
                    ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                    appBuilder.common_core.getReference(ui,dstm,'datastatement');                    
                    return;
                }

                $.ajax({
                    type:'POST',
                    data:{
                          "datastatement_id":dtnode.data.id,
                          "METHOD":"POST",
                          "crudzillaResultSetFormat":"bean"
                     },
                    url:"api/primary-execution/datastatement/get-datastatement.stm",
                    success:function(data){            
                        
                        mainScope.dataStatement = eval('('+data+')');//.rows[0];
                        $.ajax({
                            type:'POST',
                            url:'sc/appbuilder/ui-templates/datastatement-tab-view.html',
                            success:function(data){
                                ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");//.appendTo("#datastatement-tab");
                                $("#datastatement-tab").append(ui.panel.panel);                                    
                                $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                
                                $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
                                
                                
                                mainScope.definition = mainScope.dataStatement;
                                appBuilder.common_core.createPreView(mainScope,'datastatement');
                                appBuilder.common_core.createPostView(mainScope,'datastatement');

              					var dtCrudNode = $("#app-treecontrol").dynatree("getTree").getNodeByKey(mainScope.definition.id);

                                _this.setUpDataSourceControl(mainScope);
                                _this.getSQL(mainScope);

              					
                              	$("#"+ui.panel.tabid).data("editor",mainScope.dataStatement.sqlEditor);
              				    $("#datastatement-sql-template-tab-"+mainScope.definition.id).data("editor",mainScope.dataStatement.sqlEditor);
              					
                                appBuilder.common_core.createDroppableReferenceView
                                (  'datastatement-datasource',
                                   mainScope.definition.id,
                                   function(relPath){
                                       $.blockUI();
                                       var data={
                                         "datastatement_id":mainScope.definition.id,
                                         "datasource_path":relPath
                                       };
                                       $.ajax({
                                         type:'POST',
                                         data:data,
                                         url:"api/primary-execution/datastatement/update-datastatement-datasource-path.stm",
                                         success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                      });
                                   },
                                   function(){
                                      $.blockUI();
                                      var data={
                                          "datastatement_id":mainScope.definition.id,
                                          "datasource_path":""
                                      };
                                      $.ajax({
                                          type:'POST',
                                          data:data,
                                          url:"api/primary-execution/datastatement/update-datastatement-datasource-path.stm",
                                          success:function(data){
                                              appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                              $.unblockUI();
                                          }
                                      });
                                   },dtCrudNode
                                );
                                appBuilder.common_core.setDroppableReferenceVal('datastatement-datasource',mainScope.definition.id,mainScope.definition.dataSourcePath,dtCrudNode);
              
              
                                appBuilder.common_core.createDroppableReferenceView
                                (  'datastatement-datamodel-reference',
                                   mainScope.definition.id,
                                   function(relPath){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "datamodel_reference_path":relPath
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-datamodel-reference-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     }); 
                                   },
                                   function(){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "datamodel_reference_path":''
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-datamodel-reference-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     });
                                   },dtCrudNode
                                );
                                appBuilder.common_core.setDroppableReferenceVal('datastatement-datamodel-reference',mainScope.definition.id,mainScope.definition.dataModelReferencePath,dtCrudNode);
                                                              
                              
                              
                                appBuilder.common_core.createDroppableReferenceView
                                (  'datastatement-dynamic-sql',
                                   mainScope.definition.id,
                                   function(relPath){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "sql_src_path":relPath
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-dynamic-sql-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     }); 
                                   },
                                   function(){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "dynamic_sql_path":''
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-dynamic-sql-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     });
                                   },dtCrudNode
                                );
                                appBuilder.common_core.setDroppableReferenceVal('datastatement-dynamic-sql',mainScope.definition.id,mainScope.definition.sqlSrcPath,dtCrudNode);
                              
                              
                              	
                              
                                 appBuilder.common_core.createDroppableReferenceView
                                (  'datastatement-resultset-processor',
                                   mainScope.definition.id,
                                   function(relPath){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "resultset_processor_path":relPath
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-resultset-processor-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     }); 
                                   },
                                   function(){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "resultset_processor_path":''
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-resultset-processor-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     });
                                   },dtCrudNode
                                );
                                appBuilder.common_core.setDroppableReferenceVal('datastatement-resultset-processor',mainScope.definition.id,mainScope.definition.resultSetProcessorPath,dtCrudNode);
                             
              					
              
                              
                                appBuilder.common_core.createDroppableReferenceView
                                (  'datastatement-transaction',
                                   mainScope.definition.id,
                                   function(relPath){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "transaction_path":relPath
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-transaction-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     }); 
                                   },
                                   function(){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "transaction_path":''
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-transaction-path.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     });
                                   },dtCrudNode
                                );
                                appBuilder.common_core.setDroppableReferenceVal('datastatement-transaction',mainScope.definition.id,mainScope.definition.transactionPath,dtCrudNode);
                              
                              	$("#datastatement-transaction-action-"+mainScope.definition.id).val(mainScope.definition.transactionAction);
                                $("#datastatement-transaction-action-"+mainScope.definition.id).change(function(){
                                     $.blockUI();
                                     var data={
                                       "datastatement_id":mainScope.definition.id,
                                       "transaction_action":$(this).val()
                                     };
                                     $.ajax({
                                       type:'POST',
                                       data:data,
                                       url:"api/primary-execution/datastatement/update-datastatement-transaction-action.stm",
                                       success:function(data){
                                         appBuilder.common_core.markModified(mainScope.src_component,mainScope.definition.id);
                                         $.unblockUI();
                                       }
                                     });
                                });
                              
								
              					
              
                                var block = 
                                {
                                    run:function(mainScope){
                                            $("#datastatement-sql-executable-param-list-"+mainScope.keyPart).html(mainScope.dataStatement.preparedStatementParamList);
                                            $("#datastatement-sql-executable-resultset-template-"+mainScope.keyPart).html(mainScope.dataStatement.resultSetTemplate);

                                            
                                            var srcType = "text/x-sql";//mainScope.dataStatement.sqlDialect?mainScope.dataStatement.sqlDialect:"text/x-sql";

                                            mainScope.dataStatement.sqlExecutableEditor = new CodeMirror.fromTextArea(document.getElementById("datastatement-sql-executable-editor-"+mainScope.keyPart), {
                                            mode:srcType,                              
                                            lineNumbers: true,                              
                                            matchBrackets: true,
                                            viewportMargin: Infinity,
                                            readOnly:true,
                                            onChange:function(editor){editor.contentModified = true;}
                                            });

                                      		$(document.getElementById("datastatement-sql-executable-editor-"+mainScope.keyPart).parentNode).find(".CodeMirror").css({"height":"auto"});
                                      		$(document.getElementById("datastatement-sql-executable-editor-"+mainScope.keyPart).parentNode).find(".CodeMirror-scroll").css({"overflow-y": "hidden","overflow-x": "auto"});
                                       
                                      		mainScope.dataStatement.preparedStatement = mainScope.dataStatement.preparedStatement != null?mainScope.dataStatement.preparedStatement:"";
                                      
                                      
                                            appBuilder.setRegisteredEditorContent(mainScope.dataStatement.sqlExecutableEditor,mainScope.dataStatement.preparedStatement);
                                      		//mainScope.dataStatement.sqlExecutableEditor.setSize(null,$(ui.panel.panel).parent().parent().height()*0.7);
                                            mainScope.dataStatement.sqlEditor.setSize(null,$(ui.panel.panel).parent().parent().height()*0.62);
                                            mainScope.dataStatement.sqlExecutableEditor.refresh();
                                      		CodeMirror.autoLoadMode(mainScope.dataStatement.sqlExecutableEditor, "sql");
                                    }
                                };block.run(mainScope);

              					
              
                                appBuilder.common_core.createParameterTable(mainScope);
                                appBuilder.common_core.createSecurityTable(mainScope);

                                $('#datastatement-tabs-'+mainScope.keyPart).tabs({
                                    "disabled":[4],
                                    "active":1,
                                    "activate":function(event,ui){
                                        var index = $(this).tabs("option","active");
                                        //if(index == 1 && mainScope.dataStatement.sqlEditor)
                                            mainScope.dataStatement.sqlEditor.refresh();
                                      
                                        if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                            appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                      
                                    }
                                });//.css({"z-index":"0"}).find('ul').css({"z-index":"-1"});
                                $('#datastatement-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                

                                $('#datastatement-execution-handler-tab-'+mainScope.keyPart).tabs({
                                    "active":1,
                                    "activate":function(event,ui){
                                        var index = $(this).tabs("option","active");
                                        
                                      
                                        if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                            appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                      
                                        //if(index == 0 && mainScope.dataStatement.sqlEditor)
                                            mainScope.dataStatement.sqlEditor.refresh();
                                        //else
                                        //if(index == 1 && mainScope.dataStatement.sqlExecutableEditor)
                                            mainScope.dataStatement.sqlExecutableEditor.refresh();                                                
                                    }
                                }).removeClass("ui-corner-all").find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                                $('#datastatement-execution-handler-tab-'+mainScope.keyPart).tabs("option","active",0);
              
                                $("#tabs").tabs('option', 'active',mainScope.ui.index);
                                $('#datastatement-execution-handler-tab-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                                
                                
                                $('#datastatement-execution-parameter-definition-tabs-'+mainScope.keyPart).tabs({
                                    "activate":function(event,ui){
                                        var index = $(this).tabs("option","active");
                                      
                                        if($("#"+$(ui.newPanel).attr("id")).data("editor"))
                                            appBuilder.editor_toolbar.setEditor($("#"+$(ui.newPanel).attr("id")).data("editor")); 
                                      
                                      
                                        /*if(index == 0 && mainScope.dataStatement.sqlEditor)
                                            mainScope.dataStatement.sqlEditor.refresh();
                                        else
                                        if(index == 1 && mainScope.dataStatement.sqlExecutableEditor)
                                            mainScope.dataStatement.sqlExecutableEditor.refresh();   */                                             
                                    }
                                }).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                              
                              
                				$("#datastatement-sql-executable-tab-"+mainScope.keyPart).css({"height":$(mainScope.ui.panel.panel).parent().parent().height()*0.85,"background-color":"white","overflow":"auto"});
                              
                              
                              
                                appBuilder.common_core.tabCloseBinding($('#datastatement-execution-parameter-definition-tab-'+mainScope.keyPart),function(){
                                    $('#datastatement-execution-parameter-definition-tab-'+mainScope.keyPart).find("ul").css({"border-top":"0"}).removeClass("ui-corner-all");
                                });
                                
                              
                                appBuilder.common_core.modificationNotification(mainScope);
                                appBuilder.common_core.getStaledReferences(mainScope.definition.id,mainScope.src_component,mainScope.definition.lastModifiedTimeStamp);
                              
                            }
                        });
                    }
                });
            },            
            newDataStatement:function(name,dtnode){
                $.blockUI();
                         
                var appConfig = appBuilder.common_core.findApp(appBuilder.common_core.getRelPath(dtnode));
                $.ajax({
                    type:'POST',
                    data:
                        {
                          "name":name,
                          "crudAppPath":appConfig?appConfig.baseDir:"",
                        },
                    url:"/api/primary-execution/datastatement/add-datastatement.stm",
                    success:function(data){//alert(data)                        
                        $.unblockUI();
                        
                        var ext = "";
                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                          	ext = ".stm";
                      
                        var id = appBuilder.common_core.stripNewLine(data);
                      
                        appBuilder.common_core.addCrudNode(dtnode,name,id,"datastatement");
                        
                        //create tree control node and append to the datastatement tree                               
                        /*var newNode = dtnode.addChild(appBuilder.datastatement.createTreeNode({"name":name+ext,"id":id}));
                        newNode.activate();

                      	if(dtnode.data.type == "appresource-dir" || dtnode.data.type == "appresource-root")
                      		appBuilder.runtime_resources.addResourceNode({files:[{"name":"executable","mime":appBuilder.common_core.definitionTypeToMime(newNode.data.type),"isFolder":false}]},newNode);
                      
                      
                        if(dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'appresource-dir'){
                            appBuilder.sysadmin.apptaxonomy.newItem(name, id, 'datastatement', dtnode,newNode);
                        }*/
                        
                    }});
            },            
            renameDataStatement:function(name,dtnode){
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "id":dtnode.data.id,
                            "name":name,
                            "action":"rename"
                        },
                    url:"api/primary-execution/datastatement/update-datastatement-name.stm",
                    success:function(data){                        
                        $.unblockUI();     
                         //dtnode.data.title = name;
                         //dtnode.render();
                         
                         if(dtnode.getParent().data.type == 'apptaxonomy-category' || 
                            dtnode.getParent().data.type == 'appresource-dir'){
                            //appBuilder.sysadmin.apptaxonomy.renameItem(name,dtnode);
                           
                            //rename executable if it exists
                            appBuilder.runtime_resources.renameResource(name,appBuilder.common_core.definitionTypeToMime(dtnode.data.type),dtnode);
                         }
                    }});
            },            
            deleteDataStatement:function(dtnode){
              
                appBuilder.common_core.deleteCrudDefinition(dtnode);
                /*if(confirm("Are you sure you want to delete this datastatement?")){
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "datastatement_id":dtnode.data.id
                            },
                            url:appBuilder.datastatement.actionURL+"/api/datastatements/delete-datastatement.stm",
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
            createTreeNode:function(dataStatement){
                return {
                    "title":dataStatement.name,
                    "addClass":"datastatement-treenode",
                    "type":"datastatement",
                    "isFolder":false,
                    "id":dataStatement.id,
                    "key":dataStatement.id,
                    "children":[]
                };                 
            },
            loadNode:function(dtnode){
                $.ajax({
                        type:'POST',
                        data:{
                            "action":"list",
                            "METHOD":"POST"
                        },
                        url:"api/primary-execution/datastatement/get-datastatements.stm",
                        success:function(data){
                            var dataStatements = eval('('+data+')');
                            for(var i=0;i<dataStatements.length;i++){
                                var dataStatement = dataStatements[i];
                                
                                //create tree control node and append to the datastatement tree                               
                                dtnode.addChild(appBuilder.datastatement.createTreeNode(dataStatement));
                            }
                        }
                   });                
            }
};
