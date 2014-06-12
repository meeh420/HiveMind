/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var testCrudPageHtml = "";
appBuilder.crud_test = {
    actionURL:appBuilder.context_path,
    logginApp:null,
    init:function(){
      
      var logMenu = $('#crudzilla-log-menu').menu({
        select:function(event,ui){   
          var app = $(ui.item).find('a').html();
          
          for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
            if(appBuilder.common_core.registeredApps[i].name == app){
              
                appBuilder.crud_test.loggingApp = appBuilder.common_core.registeredApps[i];
    			appBuilder.queuedAction.push('show-log');
                //alert(app+"/"+appBuilder.crud_test.loggingApp.id+"/"+appBuilder.crud_test.loggingApp.name)
              appBuilder.createTab(appBuilder.crud_test.loggingApp.id+'-log-output-viewer','<img src="img/silk/script_error.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold">'+app+'</span> Log Output');               
                appBuilder.queuedAction = [];
                return;
            }
          }
        }
      });  
      

      $( document ).on( "click", function() {
        	//if(logMenu.css("display") == "block")
        		logMenu.hide();
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
    createUI:function(crud,url,appConfig,crudPath,dtnode){
        var _this = this;
		var reference_id = crud.reference_id;
      
        var tabs = $('#crud-test-tabs-'+reference_id).tabs({
            "activate":function(event,ui){
                var index = $(this).tabs("option","active");
                
            },
            "create":function(){
                
            }
        });

        var testParamData = {
          "crudAppPath":appConfig.baseDir,
          "crudPath":crudPath,      
        };
      
      
        var block = {
            get:function(){
                return {
                url:'x',
                datatype: "local",
                postData:{},
                colNames:['Ignore', 'Name','Value','',''],
                colModel:
                    [
                        {name:'ignore',index:'ignore', align:'center',sortable:false},
                        {name:'name',index:'name', align:'right',sortable:false},
                        {name:'value',index:'value', align:"left",sortable:false},
                        {name:'info',index:'info', align:"center",sortable:false,"hidden":true},
                        {name:'actions',index:'actions', align:'center',width:"55",sortable:false}
                    ],
                loadComplete:function(){

                        if(typeof crud.execution_parameters != "undefined"){
                            for(var j=0;j<crud.execution_parameters.length;j++){
                              var param = crud.execution_parameters[j];
                              if(param.isFinal == "no")
                              	_this.insertArgument({param:param.id,table:reference_id},{before:false,insert:true,param:param});
                            }
                        }
                  		
                        //add default row for add new parameters
                        _this.insertArgument({param:reference_id,table:reference_id},{before:false,insert:true});                  
                },
                rowNum:-1,
                rowList:[],
                "height":"auto",
                viewrecords: true,
                  autowidth: true,
                  "caption":"Parameters"
               };
            }
        }; 
        
        $("#crud-test-argument-table-"+reference_id).jqGrid(block.get()); 
                
      
        var runTest = function(url){
             
             appBuilder.crud_test.run(url,reference_id,function(runUrl,ignore){
               		
                    var tabId =  'crud-test-tab-'+(new Date().getTime());
                    var index = appBuilder.crud_test.addTab(tabs,tabId,'Test');
                    
               		$("#"+tabId).css({"height":$("#"+tabId).parent().parent().height()*0.90,"overflow":"auto"});
               
               		//$("#"+tabId).parent().css({"height":$(ui.panel.panel).parent().parent().height()*0.835,"overflow":"auto"});

               
                    tabs.tabs('option', 'active',index-1);
                    
                    var html = [];       

                    var outputType = $("#crud-test-output-type-"+reference_id).val();
                    if(typeof ignore == "undefined" && outputType == 'json'){
                                            
                      
                      $.blockUI();
                      $.ajax({
                              type:'GET',
                              url:runUrl,
                              success:function(data){
                                  //cb(data);
                                  $.unblockUI();
                                  //var reply = eval('('+data+')');   
                                
                                  $("#"+tabId).append('<div id="crud-test-response-json-editor-'+tabId+'"></div>');
          
                                  var container = document.getElementById("crud-test-response-json-editor-"+tabId);
                                  var editor    = new jsoneditor.JSONEditor(container);        
                                  $("#crud-test-response-json-editor-"+tabId).find(".menu").remove();
                                  $("#crud-test-response-json-editor-"+tabId).find(".jsoneditor,.outer,.content").css({"border-style":"none","overflow":"visible","overflow-x":"visible","overflow-y":"visible","position":"relative"});

                                  editor.set(eval('('+data+')'));                                
                              }
                       });                      
          
                    }
                    else
                    if(typeof ignore == "undefined" && outputType == 'html-page'){                      
                      window.open(runUrl);                      
                    }
                    else
                    if(typeof ignore == "undefined" && outputType == 'ajax-html-page'){
                        $.ajax({
                            type:'GET',
                            data:{"bounce_html":data},
                            url:"api/primary-execution/scriptexecutor/save-test-html.ste",
                            success:function(data){
                                window.open('api/primary-execution/scriptexecutor/bounce-html.ste');
                            }
                        });
                    }
                    else
                    if(typeof ignore == "undefined" && outputType == 'text'){                        
                      
                      
                      $.blockUI();
                      $.ajax({
                              type:'GET',
                              url:runUrl,
                              success:function(data){
                                  $.unblockUI();
                                
                                  $("#"+tabId).append('<textarea id="crud-test-response-text-editor-'+tabId+'"></textarea>');
                                  
                                  var txtViewr = new CodeMirror.fromTextArea(document.getElementById("crud-test-response-text-editor-"+tabId), {
                                      mode:"",                              
                                      lineNumbers: true,                              
                                      matchBrackets: true,
                                      readOnly:true
                                  });
                                  txtViewr.setValue(data);
                                  txtViewr.setSize(null,$("#"+tabId).parent().parent().height()*0.90);
                              }
                       });
                    }
                    else
                    if(ignore)
                    {
                      $("#"+tabId).append('<textarea id="crud-test-response-text-editor-'+tabId+'"></textarea>');
                      
                      var txtViewr = new CodeMirror.fromTextArea(document.getElementById("crud-test-response-text-editor-"+tabId), {
                        mode:"",                              
                        lineNumbers: true,                              
                        matchBrackets: true,
                        readOnly:true
                      });
                      txtViewr.setValue(runUrl);
                    }
             },{},dtnode);        
        }
      
        $("#crud-test-argument-button-"+reference_id).button({
                text: true,
                icons: {
                        primary: "ui-icon-play"
                }
        }).click(function(){
          runTest(url);
        });        
        
        $("#crud-test-simulate-button-"+reference_id).button({
                text: true,
                icons: {
                        primary: "ui-icon-play"
                }
        }).click(function(){
          runTest(/*"crud-test/run-test.ste"*/"crud-proxy"+testParamData.crudAppPath+testParamData.crudPath);
        });       
      
        // close icon: removing the tab on click
        tabs.delegate( "span.ui-icon-close", "click", function() {
            var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
            $( "#" + panelId ).remove();
            tabs.tabs( "refresh" );
        });
        tabs.bind( "keyup", function( event ) {
            if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
                var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
                $( "#" + panelId ).remove();
                tabs.tabs( "refresh" );
            }
        });        
    },
    run:function(url,id,cb,testParamData,dtnode){
        var idList = $("#crud-test-argument-table-"+id).getDataIDs();
                
        var reqMethod = "GET";
        var req = testParamData.crudPath?[
          {"name":"crudPath","value":testParamData.crudPath},
          {"name":"crudAppPath","value":testParamData.crudAppPath}
        ]:[];
        var testUrl = url;
      
        /*if(appBuilder.common_core.isExecutableType(appBuilder.common_core.getRelPath(dtnode)) 
           ||
          appBuilder.common_core.isExecutableType("x."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type))){ 
        	testUrl = "crud-test/run-test.ste";
        }*/
        
        for(var i=0;i<idList.length;i++){
            if(idList[i] != '0'){
              var ignore = appBuilder.getCheckStatus($("#crud-test-argument-field-ignore-"+idList[i]));
              var name  =  $("#crud-test-argument-field-name-"+idList[i]).text();
              if(name.length>0 && name[name.length-1] == ':')
                name = name.substring(0,name.length-1);
              
              if(ignore != 'yes'){
                    
                    if($("#crud-test-argument-field-value-"+idList[i]).attr("type") == "file"){
                        var fileInput = document.getElementById("crud-test-argument-field-value-"+idList[i]);
                        var file = fileInput.files[0];                        
                        req.push({"name":name,"value":file});
                        reqMethod = "POST";
                    }
                    else
                    {
                        req.push({"name":name,"value":$("#crud-test-argument-field-value-"+idList[i]).val()});
                    }
              }
            }
        }
        
        
        if(reqMethod == 'GET'){
            
            var request = {};
            var params = [];
            for(i=0;i<req.length;i++){
               request[req[i].name]=req[i].value;
               params.push(req[i].name+"="+encodeURIComponent(req[i].value));
            }
          	
            cb(testUrl+(params.length>0?'?'+params.join('&'):''));
        }
        else
        {
            var formData = new FormData();
            for(i=0;i<req.length;i++)
                formData.append(req[i].name,req[i].value);

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function()
            {
                if (xhr.readyState == 4 && xhr.status == 200)
                {
                    cb(xhr.responseText,true); // Another callback here
                }
            }
            
            
            // Add any event handlers here...
            xhr.open('POST',testUrl, true);
            xhr.send(formData);
        }        
    },
    killLogPoller:false,
    onCloseLogTabView:function(tabid){
            
      for(var i=0;i<appBuilder.common_core.registeredApps.length;i++){
        if(appBuilder.common_core.registeredApps[i].id+'-log-output-viewer' == tabid) {
            
          	appBuilder.common_core.registeredApps[i].killLogPoller = true;
        }
      }
      return true;
    },
  	activeLogViews:[],
    createLogTabView:function(ui,event){
        var _this = this;
        var loggingApp = appBuilder.crud_test.loggingApp;
        ui.panel.tabid = loggingApp.id+"-log-output-viewer";
        
      
      
      	$("#tabs").tabs('option', 'active',ui.index);
        $.ajax({
          type:'POST',
          url:'/sc/appbuilder/ui-templates/log-viewer-tab-view.html',
          success:function(data){
            
            ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");
            $("#crud-test-tab").append(ui.panel.panel);                                    
            $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:loggingApp.id}));
            $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
            
            var container = document.getElementById("crudzilla-log-out-editor-"+loggingApp.id);

            var editor = new CodeMirror.fromTextArea(container, {
              mode:"message/http",                              
              lineNumbers: true,                              
              matchBrackets: true,
              readOnly:true,
              onChange:function(editor){editor.contentModified = true;}
            });
            editor.setSize(null,$(ui.panel.panel).parent().parent().height()-32);

            
            CodeMirror.autoLoadMode(editor, "message/http");

            $(ui.panel).data("editor",editor);
            appBuilder.editor_toolbar.setEditor(editor);
            
            editor.getDoc().markClean();
            editor.getDoc().clearHistory();            
            
            
            var logLength = 0;
            var logCallCount = new Date().getTime();
            $('#crudzilla-log-out-editor-clear-button-'+loggingApp.id).button({
                    text: true,
                    icons: {
                            primary: "ui-icon-trash"
                    }
            }).click(function(){
                    
                
                $.ajax({
                        type:'POST',
                        data:
                        {
                        },
                        url:loggingApp.contextPath+"/dev-logging/clear-log-output.ste",
                        success:function(data){
                          editor.setValue('');
                          editor.getDoc().markClean();
                          editor.getDoc().clearHistory();                          
                          
                  		  logLength = 0;
                        }
                });              
            });             
            
            loggingApp.killLogPoller = false;
            
            (function poll(){
                if(loggingApp.killLogPoller == true){
                    return;
                }
              
              	
                $.ajax({ 
                  		type:'POST',
                  		url: loggingApp.contextPath+"/dev-logging/get-log-output.ste?ts="+(++logCallCount)
                        , 
                  		dataType:"text",
                        success: function(data){
                          var logData = (""+data);
                          
                          if(logData.length>logLength){
                              editor.setValue(logData);                          
                          	  editor.getDoc().markClean();
                              editor.getDoc().clearHistory();
                          }
                          
                          logLength = logData.length;
                        
                       }, /*dataType: "json",*/ complete: poll, timeout: 30000});
            })(); 
	}});
    },
    openInBrowser:function(dtnode){
        var url = appBuilder.common_core.getDtNodeURL(dtnode);
        if(url){          
          window.open(url);
        }
        else
        {
          alert("File must be part of an App to open in browser."); 
        }
    },
    createTabView:function(ui,event){
        
        var _this = this;
        var dtnode = ui.panel.dtnode;
        ui.panel.tabid = 'appresource-run-'+dtnode.data.id; 


        var mainScope = {
            ui:ui,
            dtnode : ui.panel.dtnode,
            definitionId:dtnode.data.id,
            src_component:"crud-test",
            keyPart : dtnode.data.id
        };
        
        
        var relPath   = appBuilder.common_core.getRelPath(dtnode); 
        
        
        var assetPath  = relPath;      
        var appConfig = appBuilder.common_core.findApp(relPath);
        relPath 	  = relPath.substring(appConfig.baseDir.length);
      
        if(dtnode.data.type != "appresource" && dtnode.parent.data.type != "appresource-dir"){
          relPath   = relPath+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
          assetPath = assetPath+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
        }
      
        
        //alert(appConfig.contextPath+relPath);
        //alert(relPath)
        //make this path relative to app dir instead of asset dir
        
        //alert(relPath)
		//relPath.substring(relPath.indexOf(_this.assetBase))
      
        $("#tabs").tabs('option', 'active',ui.index);
      
        var setUp = function(crud){
            $.ajax({
              type:'POST',
              url:'/sc/appbuilder/ui-templates/crud-test.html',
              success:function(data){
                      ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                      $("#crud-test-tab").append(ui.panel.panel);                                    
                      $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:crud.reference_id}));
                      $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
                	  $("#crud-test-argument-table-"+crud.reference_id).parent().css({"height":$(ui.panel.panel).parent().parent().height()*0.835,"overflow":"auto"});
                      _this.createUI(crud,appConfig.contextPath+relPath,appConfig,relPath,dtnode);
                  }
               });      
        }
      
        
        if(appBuilder.common_core.isExecutableType(relPath)){            
         	
            appBuilder.runtime_resources.viewResource(assetPath,function(data){ 
              
              var ref = eval('('+data+')');
              ui.panel.tabid = 'appresource-run-'+ref.reference_id; 
              setUp(ref);
            });          
          
        }else{
          setUp({reference_id:ui.panel.tabid});          
        }        
    },            
    insertArgument:function(keyPart,options){
        var _this = this;
        if(options.insert)
        {
            var actions = "";
            if(typeof options.param == "undefined"){
                var as = "<button  id=\"crud-test-argument-button-addtext-"+keyPart.param+"\" title=\"Add Parameter\" onclick=\"appBuilder.crud_test.addArgument('"+keyPart.table+"','text')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";                    
                var af = "<button  id=\"crud-test-argument-button-addfile-"+keyPart.param+"\" title=\"Add File\" onclick=\"appBuilder.crud_test.addArgument('"+keyPart.table+"','file')\">Add File</button>";
                actions = af+as;
            }else{
                var de = "<button  id=\"crud-test-argument-button-delete-"+keyPart.param+"\" title=\"Delete\" onclick=\"appBuilder.crud_test.deleteArgument('"+keyPart.table+"','"+options.param.id+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
                //var ds = "<button  id=\"crud-test-argument-button-update-"+keyPart.param+"\" title=\"Update\" onclick=\"appBuilder.crud_test.updateArgument('"+keyPart.table+"','"+options.param.id+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Save</span></button>";
                actions = de;
            }

            var row = 
            {
                "actions":"<div style=\"padding:2px\">"+actions+"</div>",              
                "ignore":"<input type=\"checkbox\" id=\"crud-test-argument-field-ignore-"+keyPart.param+"\"/>",
                "name":"<span id=\"crud-test-argument-field-name-"+keyPart.param+"\"></span>",
                "value":"<input type=\"text\" id=\"crud-test-argument-field-value-"+keyPart.param+"\"/>",
                "info":""
            };

            if(options.before){
                if(options.param.type == 'file')
                    row.value = "<input type=\"file\" id=\"crud-test-argument-field-value-"+keyPart.param+"\"/>";

                $("#crud-test-argument-table-"+keyPart.table).addRowData(options.param.id,row,"before",'0'); 
            }
            else
            {
                if(typeof options.param == "undefined")
                    row.name = "<input type=\"text\" id=\"crud-test-argument-field-name-"+keyPart.param+"\"/>";
                
                $("#crud-test-argument-table-"+keyPart.table).addRowData(typeof options.param != "undefined"?options.param.id:'0',row); 
                
                if(typeof options.param == "undefined"){
                    $("#crud-test-argument-button-addfile-"+keyPart.param).button({
                            text: false,
                            icons: {
                                    primary: "ui-icon-document"
                            }
                    }).click(function(){

                    });                 
                }
            }
        }

        $("#crud-test-argument-field-name-"+keyPart.param).html((typeof options.param != "undefined"?options.param.name:"")+":");
        if($("#crud-test-argument-field-value-"+keyPart.param).attr("type") != "file")
        	$("#crud-test-argument-field-value-"+keyPart.param).val(typeof options.param != "undefined"?options.param.defaultValue:"");
        appBuilder.setCheckStatus($("#crud-test-argument-field-ignore-"+keyPart.param),typeof options.param != "undefined"?options.param.ignore:"no");
    },
    addArgument:function(crud_id,type){
        var _this = this;
        var keyPart = crud_id;

        var param = 
        {
            "name":$('#crud-test-argument-field-name-'+keyPart).val(),
            "defaultValue":$('#crud-test-argument-field-value-'+keyPart).val(),
            "type":type,
            "id":new Date().getTime()
        };
        
        
        _this.insertArgument({table:keyPart,param:param.id},{"before":true,"insert":true,param:param});

        //reset default
        _this.insertArgument({table:keyPart,param:keyPart},{"insert":false});
        $('#crud-test-argument-field-name-'+keyPart).val("");
    },
    deleteArgument:function(crud_id,id){
        $("#crud-test-argument-table-"+crud_id).delRowData(id);
    },
    updateArgument:function(definition_id,id,src_component){
        var keyPart = definition_id+'-'+id;
        var _this = this;
        var param = 
        {
            "name":$("#"+src_component+"-execution-parameter-field-name-"+keyPart).val(),
            "type":$("#"+src_component+"-execution-parameter-field-type-"+keyPart).val(),
            "required":appBuilder.getCheckStatus($("#"+src_component+"-execution-parameter-field-required-"+keyPart)),
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

        if(param.name == ''){
            alert('Please provide a name for the parameter.');
            return;
        }

        param[src_component+"_id"] = definition_id;
        $.blockUI();
        $.ajax({
                type:'POST',
                data:param,
                url:"api/datastatements/update-"+src_component+"-execution-parameter.stm",
                success:function(data){
                    _this.markModified(src_component,definition_id);
                    $.unblockUI();
                    //var reply = eval('('+data+')');                                                        
                }
            });                
    }
};
