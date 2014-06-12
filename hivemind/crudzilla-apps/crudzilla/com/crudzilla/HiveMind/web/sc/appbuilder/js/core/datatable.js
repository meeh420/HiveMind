/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


appBuilder.datatable={
            actionURL:appBuilder.context_path,
            init:function(){
                
            },  			
            showColumnGenTab:function(dtnode){ 
              appBuilder.currentNode = dtnode;
              appBuilder.queuedAction.push('datatable-column-generator');
              appBuilder.createTab('datatable-column-generator-tab','Column Generator');    
            },  			
            showDataTableGenTab:function(dtnode){ 
              appBuilder.currentNode = dtnode;
              appBuilder.queuedAction.push('datatable-generator');
              appBuilder.createTab('datatable-generator-tab','DataTable Generator');    
            },  			
            showDataModelTab:function(dtnode){
              appBuilder.currentNode = dtnode;
              appBuilder.queuedAction.push('datamodel-creation-tab');
              appBuilder.createTab('datamodel-creation-tab-'+dtnode.data.id,'<img src="img/silk/database_table.png" style="width:12px;height:12px;vertical-align:top"/> New DataModel');    
            },
            createDataModelFormView:function(ui,modelId,dtnode,dataModel,reloaded){
                var _this = this;
              
                var relPath 	  = appBuilder.runtime_resources.getPath(dtnode);
              	var parentRelPath = relPath;
                var parentId	  = modelId;
              	
                if(appBuilder.endsWith(relPath,"datamodel.ins")){
                	relPath = appBuilder.runtime_resources.getPath(dtnode.parent);
                  
                    parentRelPath = appBuilder.runtime_resources.getPath(dtnode.parent.parent);
                  	parentId = dtnode.parent.data.id;
                }
                else
                if(typeof reloaded != "undefined"){
                    relPath = relPath+'/'+dataModel.name;
                    parentRelPath = appBuilder.runtime_resources.getPath(dtnode);
                    parentId = reloaded.taxo_id;
                }
              
                appBuilder.datatable.deleteQueue[modelId] = {"idList":[]};
              
				var bigTables = dataModel.bigTables;
              
                
                function populateColumns(relPath){
                  	
                    for(var k=0;k<bigTables.length;k++){
                      
                      	
                        if(bigTables[k].columnsRelPath == relPath){
                          
                            var columns = bigTables[k].columns;
                            
                            var html = ['<option value="">Select</option>'];
                            for(var i=0;i<columns.length;i++){
                              
                              html.push('<option value="'+bigTables[k].columnsRelPath+'/columns/'+columns[i].name+'.ins">'+columns[i].name+'('+columns[i].sqlDefinition+')</option>');
                            }
                            
                            var idList = $("#crudzilla-datamodel-fields-"+modelId).getDataIDs();
                            
                            
                            for(var i=0;i<idList.length;i++){                              
                              $("#datamodel-field-column-"+idList[i]).html(html.join(''));                          
                            }
                          
                          	//alert(html.join(''))
                            break;
                        }
                    }                  
                }
              
              
                var block = {
                    get:function(mainScope){
                        return {url:'x',
                        datatype: "local",
                        postData:{},
                        colNames:['Name','Label','Column',''],
                        colModel:
                            [
                              	{name:'name',index:'name', align:"center",width:"256",sortable:false,"title":false},
                                {name:'use_as_label',index:'use_as_label', align:"center",width:"64",sortable:false,"title":false},                                
                                {name:'column_path',index:'column_path', align:'left',width:"256",sortable:false,"title":false},
                                {name:'actions',index:'actions', align:'center',width:"64",sortable:false,"title":false}
                            ],
                        loadComplete:function(){
                          
                          
                                //add default row for add new handler
                                appBuilder.datatable.insertDataModelField({datamodel_field:modelId,table:modelId},{before:false,insert:true},relPath);
                          		
                                
                          		if(dataModel.dataTable.length>0)
                                    populateColumns(dataModel.dataTable.substring(0,dataModel.dataTable.lastIndexOf('/')));
                          		else
                        		if(bigTables.length>0)
                          			populateColumns(bigTables[0].columnsRelPath);
                          

                                $("#crudzilla-datamodel-name-"+modelId).val(dataModel.name);
                                $("#crudzilla-datamodel-alias-"+modelId).val(dataModel.alias);
                                $("#crudzilla-datamodel-identifier-"+modelId).val(dataModel.typeIdentifier);
                          		$("#crudzilla-available-bigtables-"+modelId).val(dataModel.dataTable.length>0?dataModel.dataTable.substring(0,dataModel.dataTable.lastIndexOf('/')):""); 
                                
                                if(!appBuilder.endsWith(dtnode.data.title,'datamodel.ins') && typeof reloaded == "undefined")
                                { 
                                  $.unblockUI();
                                  return;
                                }
                          
                                $.ajax({
                                  data:{
                                    "relPath":relPath
                                  },
                                  dataType:"json",
                                  type:'POST',
                                  url:"data-modeling/get-datamodel-fields.ste",
                                  success:function(fields){
                                    
                                    var id = new Date().getTime();
                                    for(var i=0;i<fields.length;i++){                                           
                                      
                                      var datamodel_field = {
                                        "name":fields[i].name,
                                        "useAsLabel":fields[i].useAsLabel,
                                        "column":fields[i].column,
                                        "id":fields[i].defintionId
                                      };
                                      datamodel_field.useAsLabel = (datamodel_field.useAsLabel == 'true')?'yes':'no';
                                      
                                      //alert(fields[i].column)
                                      appBuilder.datatable.insertDataModelField({datamodel_field:fields[i].defintionId,table:modelId},{before:true,insert:true,"datamodel_field":datamodel_field},relPath);                                            
                                    }
                                    $.unblockUI();
                                  }
                                }); 
                          
                        },
                        rowNum:-1,
                        rowList:[],
                        //"height":"auto",
                        viewrecords: true,
                        autowidth: true,
                        "height":$(ui.panel.panel).parent().parent().height()*0.75,
                        caption:"Fields"
                      };
                    }   
                };    
                $("#crudzilla-datamodel-fields-"+modelId).jqGrid(block.get());
              
                //$("#datamodel-view").parent().css({"height":$(ui.panel.panel).parent().parent().height()*0.7,"background-color":"white","overflow":"auto"});             

                $("#crudzilla-available-bigtables-"+modelId).change(function(){
                    var relPath = $(this).val();
                  	populateColumns(relPath);
                });
              
                $("#crudzilla-create-datamodel-button-"+modelId).button().click(function(){
               		var idList = $("#crudzilla-datamodel-fields-"+modelId).getDataIDs();
                	var req = {};
                
                    for(var i=0;i< idList.length;i++){
                      if(idList[i] != modelId){
                       	req["dataModelField"+i] 			 = $("#datamodel-field-name-"+idList[i]).val();
                       	req["dataModelFieldUseAsLabel"+i] = appBuilder.getCheckStatus($("#datamodel-field-use_as_label-"+idList[i]));
                        
                        req["dataModelFieldUseAsLabel"+i] = (req["dataModelFieldUseAsLabel"+i] == 'yes')?'true':'false';
                        
                       	req["dataModelFieldColumn"+i] = $("#datamodel-field-column-"+idList[i]).val();
                      }
                    }
                
                    req["relPath"] 	   		   = parentRelPath;
                    req["dataModelName"] 	   = $("#crudzilla-datamodel-name-"+modelId).val();
                    req["dataModelAlias"] 	   = $("#crudzilla-datamodel-alias-"+modelId).val();
                    req["dataModelIdentifier"] = $("#crudzilla-datamodel-identifier-"+modelId).val();
                    req["dataModelDataTable"]  = $("#crudzilla-available-bigtables-"+modelId).val()+"/datatable.ins";
                
                	req["fieldCount"] = idList.length-1;
                    
                	$.blockUI();
                    $.ajax({
                      type:'POST',
                      data:req,
                      dataType:"json",
                      url:'/data-modeling/create-datamodel.ste',
                      success:function(result){
                        $("#"+ui.panel.tabid+"-content").remove();
                        var dataModelId = result.dataModelId//(''+data).trim();
                        appBuilder.datatable.createDataModelTabView(ui,{},dataModelId,{"name":req["dataModelName"],"taxo_id":result.dataModelTaxonomyId});
                        //$.unblockUI();
                      }
                    }); 
              	 });
              
                $("#crudzilla-save-datamodel-button-"+modelId).button().click(function(){
               		var idList = $("#crudzilla-datamodel-fields-"+modelId).getDataIDs();
                	var req = {};
                
                    for(var i=0;i< idList.length;i++){
                      if(idList[i] != modelId){
                        
                        req["dataModelFieldId"+i] 		  = $("#datamodel-field-id-"+idList[i]).val();
                       	req["dataModelField"+i] 		  = $("#datamodel-field-name-"+idList[i]).val();
                       	req["dataModelFieldUseAsLabel"+i] = appBuilder.getCheckStatus($("#datamodel-field-use_as_label-"+idList[i]));
                        
                        req["dataModelFieldUseAsLabel"+i] = (req["dataModelFieldUseAsLabel"+i] == 'yes')?'true':'false';
                        
                       	req["dataModelFieldColumn"+i] 	  = $("#datamodel-field-column-"+idList[i]).val();
                      }
                    }
                
                  	req["id"]				   = parentId;
                    req["relPath"] 	   		   = parentRelPath;
                    req["dataModelName"] 	   = $("#crudzilla-datamodel-name-"+modelId).val();
                    req["dataModelAlias"] 	   = $("#crudzilla-datamodel-alias-"+modelId).val();
                    req["dataModelIdentifier"] = $("#crudzilla-datamodel-identifier-"+modelId).val();
                    req["dataModelDataTable"]  = $("#crudzilla-available-bigtables-"+modelId).val()+"/datatable.ins";
                	req["fieldCount"]   	   = idList.length-1;
                    req["deleteQueue"]  	   = appBuilder.datatable.deleteQueue[modelId].idList.join(',');
                	
                    $.blockUI();
                    $.ajax({
                      type:'POST',
                      data:req,
                      dataType:"json",
                      url:'/data-modeling/update-datamodel.ste',
                      success:function(addedFields){
                        
                          for(var i=0;i< idList.length;i++){
                            if(idList[i] != modelId && typeof addedFields[idList[i]] != "undefined"){
                              //alert("updating id "+idList[i]+" "+addedFields[idList[i]])
                              $("#datamodel-field-id-"+idList[i]).val(addedFields[idList[i]]);
                            }
                          }
                          
                          appBuilder.datatable.deleteQueue[modelId].idList = [];
                          $.unblockUI();
                      }
                    }); 
              	});
              
                if(dataModel.status == 'old')
                   $("#crudzilla-create-datamodel-button-"+modelId).css({"display":"none"});
                else
                   $("#crudzilla-save-datamodel-button-"+modelId).css({"display":"none"});
            },
            loadDataModel:function(relPath,modelId,callback,reloaded){

                if(typeof reloaded == "undefined" && !appBuilder.endsWith(relPath,'datamodel.ins')){
                  
                  $.ajax({
                    type:'POST',
                    dataType:"json",                    
                    url:'data-modeling/load-datatables.ste',
                    success:function(bigTables){
                      
                      for(var i=0;i<bigTables.length;i++){    
                        
                        $("#crudzilla-available-bigtables-"+modelId).append('<option value="'+bigTables[i].columnsRelPath+'">'+bigTables[i].name+'</option>');
                      }
                      callback({"status":"new","typeIdentifier":relPath.length>1?appBuilder.replaceAll(relPath,'/','.').substring(1):"","dataTable":"","name":"","bigTables":bigTables});
                    }
                  });
                  return;
                }
              
              //alert("reloading:"+relPath+'/'+reloaded.name)
              
                $.ajax({
                  type:'POST',
                  dataType:"json",
                  data:{"relPath":typeof reloaded == "undefined"?relPath.substring(0,relPath.length-4):relPath+'/'+reloaded.name+'/datamodel'},
                  url:'data-modeling/load-datamodel.ste',
                  success:function(dataModel){
                    var bigTables = dataModel.bigTables;
                    dataModel.status = "old";
                    
                    
                    for(var i=0;i<bigTables.length;i++){    
                      
                      $("#crudzilla-available-bigtables-"+modelId).append('<option value="'+bigTables[i].columnsRelPath+'">'+bigTables[i].name+'</option>');
                    }
                    callback(dataModel);                    
                  }
                });               
              
            },
            createDataModelTabView:function(ui,event,dataModelId,reloaded){
              var _this = this;
              var dtnode = ui.panel.dtnode; 
              
              var modelId = typeof dataModelId == "undefined"?dtnode.data.id:dataModelId;//new Date().getTime();
              ui.panel.tabid = "datamodel-creation-tab-"+modelId;              
              
              
              $("#tabs").tabs('option', 'active',ui.index);
              $.blockUI();
              $.ajax({
                type:'POST',
                url:'sc/appbuilder/ui-templates/create-datamodel-tab-view.html',
                success:function(data){
                  
                    ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");                  
                    $("#datamodel-creation-tab").append(ui.panel.panel);                                    
                    $(ui.panel.panel).html(appBuilder.parseTemplate(data,{"id":modelId}));
                    $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height()}).addClass("gray-background");
                  
                    var relPath = appBuilder.runtime_resources.getPath(dtnode);
                    _this.loadDataModel(relPath,modelId,function(dataModel){
                        $("#datamodel-view-"+modelId).css({"visibility":"visible"});
                    	_this.createDataModelFormView(ui,modelId,dtnode,dataModel,reloaded);                        
                    },reloaded);
                }
              });
            },
            editDataModel:function(dtnode){
              appBuilder.currentNode = dtnode;
              appBuilder.queuedAction.push('datamodel-creation-tab');
              appBuilder.createTab('datamodel-creation-tab-'+dtnode.data.id,'<img src="img/silk/database_table.png" style="width:12px;height:12px;vertical-align:top"/> DataModel (<span style="font-weight:bold">'+dtnode.parent.data.title+'</span>) ');  
            },
            insertDataModelField:function(keyPart,options,relPath){
                var _this = this;
                 
                if(options.insert){
                    var actions = "";
                    if(typeof options.datamodel_field == "undefined"){
                        var da = "<button title=\"Add\" onclick=\"appBuilder.datatable.addDataModelField('"+keyPart.table+"','"+relPath+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
                        actions = da;
                    }else{
                        var de = "<button title=\"Delete\" onclick=\"appBuilder.datatable.deleteDataModelField('"+keyPart.table+"','"+options.datamodel_field.id+"','"+relPath+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                        var ds = '';//"<button title=\"Update\" onclick=\"appBuilder.datatable.updateDataModelField('"+options.datamodel_field.id+"','"+relPath+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
                        actions = ds+' '+de;
                    }
                  
                    var row = 
                    {
                        "actions":"<div style=\"padding:4px\">"+actions+"</div>",
                        "name":"<input type=\"text\"  id=\"datamodel-field-name-"+keyPart.datamodel_field+"\"/> <input type=\"hidden\"  id=\"datamodel-field-id-"+keyPart.datamodel_field+"\"/>",
                        "use_as_label":"<input type=\"checkbox\"  id=\"datamodel-field-use_as_label-"+keyPart.datamodel_field+"\"/>",
                      	"column_path":"<div style=\"padding:4px\"> <select id=\"datamodel-field-column-"+keyPart.datamodel_field+"\"></select></div>"
                    };
                    
                    if(options.before){
                        $("#crudzilla-datamodel-fields-"+keyPart.table).addRowData(options.datamodel_field.id,row,"before",keyPart.table); 
                    }
                    else
                        $("#crudzilla-datamodel-fields-"+keyPart.table).addRowData(typeof options.datamodel_field != "undefined"?options.datamodel_field.id:keyPart.table,row); 
 
                    $("#datamodel-field-column-"+keyPart.datamodel_field).html($("#datamodel-field-column-"+keyPart.table).html());
                }
              
              	$("#datamodel-field-id-"+keyPart.datamodel_field).val(typeof options.datamodel_field != "undefined"?options.datamodel_field.id:keyPart.datamodel_field);
              
                $("#datamodel-field-column-"+keyPart.datamodel_field).val(typeof options.datamodel_field != "undefined"?options.datamodel_field.column:"");
                $("#datamodel-field-name-"+keyPart.datamodel_field).val(typeof options.datamodel_field != "undefined"?options.datamodel_field.name:"");
                appBuilder.setCheckStatus($("#datamodel-field-use_as_label-"+keyPart.datamodel_field),typeof options.datamodel_field != "undefined"?options.datamodel_field.useAsLabel:"no");
            }, 
            addDataModelField:function(id,relPath){
                var ts = new Date().getTime();
                var datamodel_field = {
                  "name":$("#datamodel-field-name-"+id).val(),
                  "useAsLabel":appBuilder.getCheckStatus($("#datamodel-field-use_as_label-"+id)),
                  "column":$("#datamodel-field-column-"+id).val(),
                  "id":ts
                };              
                appBuilder.datatable.insertDataModelField({table:id,datamodel_field:ts},{"before":true,"insert":true,"datamodel_field":datamodel_field},relPath);
                
                $("#datamodel-field-column-"+id).val("");
                $("#datamodel-field-name-"+id).val("");
                appBuilder.setCheckStatus($("#datamodel-field-use_as_label-"+id),"no");              
            },
  			updateDataModelField:function(id,relPath){
              var req = {
                "name":$("#datamodel-field-name-"+id).val(),
                "useAsLabel":appBuilder.getCheckStatus($("#datamodel-field-use_as_label-"+id)),
                "column":$("#datamodel-field-column-"+id).val(),
                "id":id,
  				"relPath":relPath,
                "deleteQueue":appBuilder.datatable.deleteQueue[relPath].idList.join(',')
              };  		

			  req.useAsLabel = (req.useAsLabel == 'yes')?'true':'false';
              
              $.ajax({
                type:'POST',
                data:req,
                url:'/data-modeling/update-field.ste',
                success:function(data){
                  
                }
              });              
			},
  			deleteQueue:{},
            deleteDataModelField:function(modelId,id,relPath){
              appBuilder.datatable.deleteQueue[modelId].idList.push(id);//relPath;
              $("#crudzilla-datamodel-fields-"+modelId).delRowData(id);
            },
            createDataTableGeneratorTabView:function(ui,event){
              
              ui.panel.tabid = "datatable-generator-tab";
              var dtnode = ui.panel.dtnode;              
              
              var generationStrategy = null;
              
              $.ajax({
                type:'POST',                                    
                url:'sc/appbuilder/ui-templates/datatable-generator-tab-view.html',
                success:function(data){
                  
                  ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");//.appendTo("#datastatement-tab");
                  $("#datatable-tab").append(ui.panel.panel);
                  $(ui.panel.panel).html(data);
                  $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height()}).addClass("gray-background");
                  
				  var appConfig = null;
                  var strategyPath = null;
                  appBuilder.common_core.createDroppableReferenceView
                  (  'datatable-generation-strategy',"",
                     function(relPath,executableName,appConfigx){
                       
                       strategyPath = relPath;
                       appConfig = appConfigx;//appBuilder.common_core.findApp(relPath);
                       //alert(appConfig.contextPath+relPath)
                       $.blockUI();
                       $.ajax({
                         type:'POST',
                         data:
                         {
                           "crudAppPath":appConfig.baseDir,
                           "crudPath":relPath
                         },
                         url:/*appConfig.contextPath+relPath*/"crud-test/run-test.ste",
                         success:function(data){                           	   
                              $.unblockUI();
                              generationStrategy = eval('('+data+')');
                         }
                       }); 
                     },
                     function(){
                                        
                     }
                  );                  
                  

                  var sqlEditor = CodeMirror.fromTextArea(document.getElementById("datatable-generator-sql-editor-"), 
                                                                          {                                                
                                                                            mode:"text/x-sql",                              
                                                                            lineNumbers: true,                              
                                                                            matchBrackets: true,
                                                                            onChange:function(editor){editor.contentModified = true;}
                                                                          });
                  CodeMirror.autoLoadMode(sqlEditor, "sql");
                  //sqlEditor.setValue(mainScope.dataTable.createSqlStatement);
                  sqlEditor.setSize(null,$(ui.panel.panel).parent().parent().height()*0.87);
                  
                  appBuilder.registeredEditors.push(
                  {
                      onSave:function(){},
                      editor:sqlEditor
                  }); 
                  
                  $('#datatable-sql-generation-button-').button({
                    icons: {
                      primary: "ui-icon-gear"
                    },
                    text: true})
                  .click(function(){
                    
                      var sqlBuffer = [];
                      var j =0;
                      for(var i=0;i<generationStrategy.columnTypes.length;i++){
                        var columnType  = generationStrategy.columnTypes[i];
                          for(k=0;k<columnType.count;k++)
                              sqlBuffer.push('\npooled_column_'+(++j)+' '+columnType.sqlType);
                      }
                      
                      
                      sqlEditor.setValue('create table <table-name> ('+sqlBuffer.join(',')+')');
                      sqlEditor.refresh();
                  });
                       
                    
                    $('#datatable-sql-execute-button-').button({
                      icons: {
                        primary: "ui-icon-play"
                      },
                      text: true})
                    .click(function(){
                      
                        var url = "column-pooling/run-sql.ste";
                      	if(typeof generationStrategy.createDataTable != "undefined" && 
                           generationStrategy.createDataTable != null &&
                          generationStrategy.createDataTable != "")
                          url = appConfig.contextPath+"/"+generationStrategy.createDataTable;
                          
                        
                        var data={
                          "sql":sqlEditor.getValue(),
                          "dataSource":generationStrategy.dataSource,
                          "crudAppPath":appConfig.baseDir
                        };
                      
                      	//resolve the datasource to strategy
                        if(typeof generationStrategy.dataSource != "undefined" ||
                          generationStrategy.dataSource != null &&
                          generationStrategy.dataSource != ""){
                          	if(generationStrategy.dataSource.trim()[0] != '/'){
                              	if(strategyPath.lastIndexOf('/') != -1)
                          			data.dataSource = strategyPath.substring(0,strategyPath.lastIndexOf('/'))+"/"+generationStrategy.dataSource;
                                else
                                    data.dataSource = "/"+data.dataSource;
                            }
                        }
                      
                      	
                      	$.blockUI();
                        $.ajax({
                          type:'POST',
                          data:data,
                          url:url,
                          success:function(data){
                            $.unblockUI();
                          }
                        });
                    });

                  
                   $("#tabs").tabs('option','active',ui.index);
                  
                }
               });
            },
            createColumnGeneratorTabView:function(ui,event){
              
              ui.panel.tabid = "datatable-column-generator-tab";
              var dtnode = ui.panel.dtnode;
              
              
              $.ajax({
                type:'POST',                                    
                url:'sc/appbuilder/ui-templates/datatable-column-generator-tab-view.html',
                success:function(data){     
                  
                  ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");//.appendTo("#datastatement-tab");
                  $("#datatable-tab").append(ui.panel.panel);
                  $(ui.panel.panel).html(data);
                  $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height()*0.95});
                  //$(ui.panel.panel).addClass("gray-background");
                  $("#datatable-columns-table").parent().css({"height":$(ui.panel.panel).parent().parent().height()*0.88,"border-color":"red","overflow":"auto","padding-right":"20px"});
                  

                  var dataTable = "";
                  var appConfig = null;
                  var dataTablePath = null;
                  appBuilder.common_core.createDroppableReferenceView
                  (  'datatable-column-gen',"",
                     function(relPath,executableName,appConfigx){
                       appConfig = appConfigx;
                       dataTablePath = relPath;
                       
                       var url = "crud-test/run-test.ste";
                       var data={
                         "crudAppPath":appConfig.baseDir,
                         "crudPath":relPath
                       };
                       
                       $.blockUI();
                       $.ajax({
                         type:'POST',
                         data:data,
                         url:/*appConfig.contextPath+relPath*/url,
                         success:function(data){
                              $.unblockUI();
                              console.log("dataTable "+data)
                              dataTable = eval('('+data+')');
                         }
                       }); 
                     },
                     function(){
                                        
                     }
                  );
    
                  $("#datatable-columns-table").jqGrid({url:'x',
                              datatype: "local",
                              postData:{},
                              colNames:['Name','Type'],
                              colModel:
                              [
                                {name:'name',index:'name', align:"center","width":256},
                                {name:'type',index:'type', align:'center',"width":256,sortable:false}
                              ],
                              rowNum:-1,
                              rowList:[],
                              viewrecords: true,
                              autowidth: true,
                              multiselect: true,
                              height:"auto",
                              sortorder: "desc",
                              caption:"Columns"
                   });     
    
                  
                  
                  $('#datatable-column-gen-sql-get-button').button({
                    icons: {
                      primary: "ui-icon-refresh"
                    },
                    text: true})
                  .click(function(){
                    
                    
                    
                    //resolve url to absolute form
                    if(dataTable.dataSource.trim()[0] != '/'){
                      if(dataTablePath.lastIndexOf('/') != -1)
                        dataTable.dataSource = dataTablePath.substring(0,dataTablePath.lastIndexOf('/'))+"/"+dataTable.dataSource;
                      else
                        dataTable.dataSource = "/"+dataTable.dataSource;
                    }                    
                    
                    
                    
                    $.blockUI();
                    $.ajax({
                      type:'POST',
                      data:{
                        "dataTable":dataTable.name,
                        "dataTableDataSource":dataTable.dataSource,
                        "crudAppPath":appBuilder.common_core.findApp(appBuilder.common_core.getRelPath(dtnode)).baseDir
                      },
                      url:"column-pooling/get-datatable-columns.ste",
                      success:function(data){
                          $.unblockUI();
                          
                        
                          var columns = eval('('+data+')');
                          var ids = $("#datatable-columns-table").getDataIDs();
                          for(var i=0;i<ids.length;i++)
                            $("#datatable-columns-table").delRowData(ids[i]);
                          
                          for(var i=0;i<columns.length;i++)
                            $("#datatable-columns-table").addRowData(i+1,{"name":columns[i].name,"type":columns[i].type});
                      }
                    });
                  });
                  
                  $('#datatable-column-gen-generate-button').button({
                    icons: {
                      primary: "ui-icon-play"
                    },
                    text: true})
                  .click(function(){
                      $.blockUI();
                      var idStr = $("#datatable-columns-table").jqGrid('getGridParam','selarrrow');
                    
                      var ids = (''+idStr).split(',');
                    
                      for(var i =0;i<ids.length;i++){
                         var row = $("#datatable-columns-table").getRowData(ids[i]);
                         var cloneParam = {"crudzilla_name_value":row.name,"crudzilla_sqlDefinition_value":row.type};
                         appBuilder.common_core.cloneParam = cloneParam;
                         
                         appBuilder.common_core.dataItemMenu.items["Data Modeling"].items["DataTable Column"].exec(dtnode,row.name/*+"-"+row.type*/);
                      }                  
                  });                         
                  
				  $("#tabs").tabs('option','active',ui.index);
                }
                
                
              });
              
              
            }
}
