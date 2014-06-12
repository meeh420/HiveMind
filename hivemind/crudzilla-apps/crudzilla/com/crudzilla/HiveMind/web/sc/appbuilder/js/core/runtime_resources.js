/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.runtime_resources={
            actionURL:appBuilder.context_path,
            init:function(){
              
              
              	  $('#new-web-app-dialog-create-auth-tables-row .atds').html(appBuilder.common_core.droppableReferenceHTML('new-web-app-dialog-create-auth-tables-datasource',''));
                  appBuilder.common_core.createDroppableReferenceView
                  (  'new-web-app-dialog-create-auth-tables-datasource',
                     '',
                     function(relPath,executableName,appConfig,fullPath){
                       
                       $("#new-web-app-dialog-create-auth-tables-datasource-path-").val(fullPath);
                     },
                     function(){
                       $("#new-web-app-dialog-create-auth-tables-datasource-path-").val('');
                     }
                  );              
              
              
              	  $('#new-web-app-dialog-app-location-row .crudzilla-app-location').html(appBuilder.common_core.droppableReferenceHTML('new-web-app-dialog-app-location',''));
                  appBuilder.common_core.createDroppableReferenceView
                  (  'new-web-app-dialog-app-location',
                     '',
                     function(relPath,executableName,appConfig,fullPath,droppedNode){ 
                       $("#new-web-app-dialog-app-location-path-").val(fullPath);
                       $('#new-web-app-dialog').data("dtnode",droppedNode);
                     },
                     function(){
                       $("#new-web-app-dialog-app-location-path-").val('/');
                       appBuilder.common_core.setDroppableReferenceVal('new-web-app-dialog-app-location','',"/");     
                     }
                  );               
                  /*$('#new-web-app-dialog-create-auth-tables').change(function(){
                        
                    	if($(this).attr('checked')){
                          	$('#new-web-app-dialog-create-auth-tables-row').css({"display":"table-row"});
                            //$('#new-web-app-dialog-create-auth-tables-db-row').css({"display":"table-row"});
                    	}
                    	else{
                  		    $('#new-web-app-dialog-create-auth-tables-row').css({"display":"none"});
                            //$('#new-web-app-dialog-create-auth-tables-db-row').css({"display":"none"});
                        }
                  });*/
              
              
                  $('#new-web-app-dialog').dialog({
                        autoOpen: false,
                        width: 470,                    
                        open:function(){
                          
                          $('#new-web-app-dialog-name').val('');
                          $('#new-web-app-dialog-create-auth-tables').removeAttr('checked');
                          //$('#new-web-app-dialog-create-auth-tables-row').css({"display":"none"});
                          $('#new-web-app-dialog-create-auth-tables-db-row').css({"display":"none"});

                          var dtnode = $(this).data("dtnode");
                          if(dtnode){
                            var relPath = appBuilder.runtime_resources.getPath(dtnode);
                            appBuilder.common_core.setDroppableReferenceVal('new-web-app-dialog-app-location','',relPath);
                            $("#new-web-app-dialog-app-location-path-").val(relPath);
                          }
                          else
                          {
                            appBuilder.common_core.setDroppableReferenceVal('new-web-app-dialog-app-location','',"/");
                            $("#new-web-app-dialog-app-location-path-").val("/");                            
                          }
                          
                          $("#new-web-app-dialog-create-auth-tables-datasource-path-label-drop- span" ).html('Drop reference here.');
                        },
                        buttons: {
                            "Create App": function() {
                              if($('#new-web-app-dialog-name').val() != ''){
                                var dtnode 		     = $(this).data("dtnode");

                                
                                var appLocation      = $("#new-web-app-dialog-app-location-path-").val();
                                var dataSource       = $("#new-web-app-dialog-create-auth-tables-datasource-path-").val();
                                var createDb         = $('#new-web-app-dialog-create-auth-tables-db').prop('checked')?"yes":"no";
                                var createAuthTables = $('#new-web-app-dialog-create-auth-tables').prop('checked')?'yes':'no'

					
                                if(typeof dataSource == "undefined" || dataSource == null || dataSource == "")
                                  dataSource  = $("#new-web-app-dialog-create-embeded-db").val();


                                if( createAuthTables == 'yes' && (typeof dataSource == "undefined" || dataSource == null || dataSource == ""))
                                {
                                  alert("You must specify a Database or DataSource to create Authentication tables.");
                                  return;
                                }

                                appBuilder.runtime_resources.newWebApp($('#new-web-app-dialog-name').val(),
                                                                       dtnode,
                                                                       appLocation,
                                                                       dataSource,
                                                                       createAuthTables,
                                                                       createDb);       
                                $(this).dialog("close");
                              }else{
                                alert("please provide an appropriate name for app");
                              }
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                        
                  }).siblings('div.ui-dialog-titlebar').remove();              
              


                $('#delete-web-app-dialog-drop-db-datasource-row .atds').html(appBuilder.common_core.droppableReferenceHTML('delete-web-app-dialog-drop-db-datasource',''));
                appBuilder.common_core.createDroppableReferenceView
                (  'delete-web-app-dialog-drop-db-datasource',
                 '',
                 function(relPath,executableName,appConfig,fullPath){
                   $("#delete-web-app-dialog-drop-db-datasource-path-").val(fullPath);
                 },
                 function(){
                   $("#delete-web-app-dialog-drop-db-datasource-path-").val('');
                 }
                );              
               $('#delete-web-app-dialog').dialog({
                        autoOpen: false,
                        width: 470,
                        open:function(){
                            $('#delete-web-app-dialog-drop-db').removeAttr('checked');                            
                            var dtnode = $(this).data("dtnode");
                            $("#delete-web-app-dialog-drop-db-datasource-path-label-drop- span" ).html('Drop definition here.');
                        },
                        buttons: {
                            "Ok": function() {
                                var dtnode 		 = $(this).data("dtnode");
                                var dataSource   = $("#delete-web-app-dialog-drop-db-datasource-path-").val();
                                var dropDb       = $('#delete-web-app-dialog-drop-db').prop('checked')?"true":"false";

                                
                              
                                $.blockUI();               
                                $.ajax({
                                    type:'POST',
                                    data:
                                        {
                                          "relPath":appBuilder.runtime_resources.getPath(dtnode),
                                          "dataSource":dataSource,
                                          "dropDatabase":dropDb
                                        },
                                    url:"/new-web-app/delete-web-app.ste",
                                    success:function(data){
                                        $.unblockUI();
                                        dtnode.remove();
                                        appBuilder.common_core.getApps();
                                    }
                                });
                                $(this).dialog("close");
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }
                        
                  }).siblings('div.ui-dialog-titlebar').remove();               

           	   $('#listify-dialog').dialog({
                        autoOpen: false,
                        width: 250,
                        open:function(){                          
                          $('#listify-dialog-name').val('');  
 						  $('#listify-dialog-eval').removeAttr("checked");                           
                          var dtnode = $(this).data("dtnode");
                        },
                        buttons: {
                            "Ok": function() {
                                if($('#listify-dialog-name').val() == ''){
                                	alert("Please provide a name for the list.")
                                    return;
                                }
                              
                                $(this).dialog("close");
                                var dtnode = $(this).data("dtnode");
                              
                                $.ajax({
                                  type:'POST',
                                  data:
                                  {
                                    "relPath":appBuilder.runtime_resources.getPath(dtnode),
                                    "name":$('#listify-dialog-name').val(),
                                    "evalRight":$('#listify-dialog-eval').prop("checked")?"yes":"no"
                                  },
                                  url:"util/listify-directory.ste",
                                  success:function(data){
                                    
                                  }});
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }                        
                  });              
              
           	   $('#fileresource-dialog').dialog({
                        autoOpen: false,
                        width: 300,
                  		height:150,
                        open:function(){
                          
                          		//$('#fileresource-dialog-name').val('');                            
                            	var dtnode = $(this).data("dtnode");
                        },
                        buttons: {
                            "Ok": function() {
                                $(this).dialog("close");
                                var dtnode = $(this).data("dtnode");
                                appBuilder.runtime_resources.uploadResource(dtnode);
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }                        
                  });
              
               $('#appresource-dialog').dialog({
                        autoOpen: false,
                        width: 250,
                        height:90,
                        open:function(){
                            $( "#appresource-dialog-definition-search-box" ).css({"display":"none"});
                            
                            var dtnode = $(this).data("dtnode");
                            
                            var mime = $(this).data("mime");
                            var text = '';                            
                            
                            if($(this).data("rename")){
                                
                                
                                var name = "";
                                if(dtnode.data.type == 'appresource' && dtnode.data.title.lastIndexOf('.') != -1){
                                    name = dtnode.data.title.substring(0,dtnode.data.title.lastIndexOf('.'));
                                    mime = dtnode.data.title.substring(dtnode.data.title.lastIndexOf('.')+1);
                                    $(this).data("mime",mime);
                                }else{
                                    name = dtnode.data.title;
                                    $(this).data("mime","");
                                }
                                
                                
                                $('#appresource-dialog-name').val(name);
                            }
                            else
                            if($(this).data("webapp")){
                              
                              
                            }
                            else
                            if(mime)
                            {
                                $('#appresource-dialog-name').val('');
                                $('#appresource-dialog-definition-search-field').val('');
                            
                                if(mime == 'stm')
                                    text = 'DataStatement';
                                else
                                if(mime == 'ste')
                                    text = 'ScriptExecutor';
                                else
                                if(mime == 'svc')
                                    text = 'Connector';
                                else
                                if(mime == 'upl')
                                    text = 'FileUploader';
                                else
                                if(mime == 'ins')
                                    text = 'Instantiator';                            
                                else
                                if(mime == 'esd')
                                    text = 'EmailSender';

                                if(mime == 'stm' || 
                                    mime == 'ste' || 
                                    mime == 'svc' || 
                                    mime == 'upl' || 
                                    mime == 'ins' || 
                                    mime == 'esd'){
                                    $( "#appresource-dialog-definition-search-box" ).css({"display":"block"});
                                    $( "#appresource-dialog-definition-search-box span" ).html(text);
                                }
                                
                                $("#appresource-dialog-definition-search-box-drop span" ).html('Drop definition here.');
                            }
                        },
                        buttons: {
                            "Ok": function() {
                                    if($('#appresource-dialog-name').val() != ''){
                                        var dtnode = $(this).data("dtnode");
                                      
                                        if($(this).data("rename"))
                                            appBuilder.runtime_resources.renameResource($('#appresource-dialog-name').val(),$(this).data("mime"), dtnode);
                                        else
                                        if($(this).data("webapp")){
                                          appBuilder.runtime_resources.newWebApp($('#appresource-dialog-name').val(),dtnode);                                          
                                        }                                      
                                        else
                                            appBuilder.runtime_resources.newResource($('#appresource-dialog-name').val(),$(this).data("mime"), dtnode,$(this).data("menu-label"));
                                        $(this).dialog("close");
                                    }else{
                                        alert("please provide an appropriate name for appresource");
                                    }
                                    $(this).data("mime","");
                                    $(this).data("definition_id","");
                                    $(this).data("rename",false);
                               		$(this).data("webapp",false);
                            },
                            "Cancel": function() {
                                	$(this).dialog("close");
                                    $(this).data("mime","");
                                    $(this).data("definition_id","");
                                    $(this).data("rename",false);
                               		$(this).data("webapp",false);                              
                            }
                        }
                  }).siblings('div.ui-dialog-titlebar').remove();            
               $( "#appresource-dialog-definition-search-field" )
                   .autocomplete({
                       minLength: 2,
                       source: function( request, response ) {
                           var url = '';
                           var mime = $('#appresource-dialog').data("mime");
                           if(mime == 'stm')
                               url = '/api/primary-execution/datastatement/search-datastatements.stm';
                           else
                           if(mime == 'ste')
                               url = '/api/primary-execution/scriptexecutor/search-scriptexecutors.stm';
                           else
                           if(mime == 'upl')
                               url = '/api/primary-execution/fileuploader/search-fileuploaders.stm';
                           else
                           if(mime == 'ins')
                               url = '/api/primary-execution/instantiator/search-instantiators.stm';
                           else                               
                           if(mime == 'svc')
                               url = '/api/primary-execution/connector/search-connectors.stm';                       
                           else
                           if(mime == 'esd')
                               url = '/api/primary-execution/emailsender/search-emailsenders.stm';                       
                       
                           $.getJSON( appBuilder.runtime_resources.actionURL+"/"+url, {
                            //term: extractLast( request.term )
                            'name': request.term+'%',
                            "crudzillaResultSetFormat":"list"
                           }, response );                           
                           
                       },
                       select: function( event, ui ) {
                           //alert(ui.item.value)
                           this.value = ui.item.label;
                           $('#appresource-dialog').data("definition_id",ui.item.value);
                           
                            if($('#appresource-dialog-name').val() == '')
                                $('#appresource-dialog-name').val(ui.item.label);
                            
                            /*--var terms = split( this.value );
                            // remove the current input
                            terms.pop();
                            // add the selected item
                            terms.push( ui.item.value );
                            // add placeholder to get the comma-and-space at the end
                            terms.push( "" );
                            this.value = terms.join( ", " );*/
                            return false;
                        }                       
                   });
                   
               $("#appresource-dialog-definition-search-box-drop").droppable({
                    //activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover", 
                    greedy: true,
                    tolerance:"touch",
                    accept:function(){return true;},
                    drop: function( event, ui ) {
                        var droppedNode = ui.helper.data("dtSourceNode");
                        
                        if(typeof droppedNode != "undefined" && 
                            droppedNode != null && 
                            droppedNode.data.type != 'appresource-dir' && 
                            droppedNode.data.type != 'apptaxonomy-category'){
                            $('#appresource-dialog').data("definition_id",droppedNode.data.id);
                            $("#appresource-dialog-definition-search-box-drop span" ).html(droppedNode.data.title);
                            
                            if($('#appresource-dialog-name').val() == '')
                                $('#appresource-dialog-name').val(droppedNode.data.title);
                        }
                    }
                });
              
               $("#crud-to-source-dialog-confirm" ).dialog({
                  resizable: false,
                  height:0,
                  modal: true,
                  autoOpen:false,
                  buttons: {
                  "Yes": function() {
                      $( this ).dialog( "close" );
                      var dtnode = $(this).data("dtnode");
                      appBuilder.runtime_resources.resourceToSource(dtnode,"true");
                  },
                  "No": function() {
                  	  $( this ).dialog( "close" );
                      var dtnode = $(this).data("dtnode");
                      appBuilder.runtime_resources.resourceToSource(dtnode,"false");
                    }
                  }
              });   
              
           	   $('#crudzilla-download-dialog').dialog({
                        autoOpen: false,
                        width: 200,
                        height:100,
                        open:function(){
                          $(this).find("input[type=text]").val("");
                          $(this).find("input[type=checkbox]").removeAttr("checked");
                        },
                        buttons: {
                            "Download": function() {
                                $(this).dialog("close");
                                
                                if($(this).find("input[type=text]").val() == "")return;
                                
                                var dtnode = $(this).data("dtnode");
                                $.blockUI();
                                $.ajax({
                                  type:'POST',
                                  data:
                                  {
                                    "destDir":appBuilder.runtime_resources.getPath(dtnode),
                                    "enableUnpack":$(this).find("input[type=checkbox]").prop("checked"),
                                    "url":$(this).find("input[type=text]").val()
                                  },
                                  url:"/file-system/download-file.svc",
                                  success:function(data){
                                    $.unblockUI();
                                    dtnode.resetLazy();
                                    dtnode.expand();
                                  }});
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }                        
                  }).siblings('div.ui-dialog-titlebar').remove();
              
              
               $('#generate-update-package-dialog-date_range_start_filters').datetimepicker({
                    timeFormat: "hh:mm tt"
               });   
               $('#generate-update-package-dialog-date_range_end_filters').datetimepicker({
                    timeFormat: "hh:mm tt"
               });                 
              
               
           	   $('#generate-update-package-dialog').dialog({
                        autoOpen: false,
                        width: 300,
                  		height:220,
                        open:function(){                          
                           $('#generate-update-package-dialog-name').val('');
                          
                           $('#generate-update-package-dialog-date_range_start_filters').val('');
                           $('#generate-update-package-dialog-date_range_end_filters').val('');
                          
                           $('#generate-update-package-dialog-size_range_start_filters').val('');
                           $('#generate-update-package-dialog-size_range_end_filters').val('');
                          
                           $('#generate-update-package-dialog-wildcard_filters').val('');
                           $('#generate-update-package-dialog-regex_filters').val('');
                           var dtnode = $(this).data("dtnode");
                        },
                        buttons: {
                            "Ok": function() {
                                var packageName = $('#generate-update-package-dialog-name').val();
                              
                                var dateRangeStartFilter = $('#generate-update-package-dialog-date_range_start_filters').val();
                                var dateRangeEndFilter = $('#generate-update-package-dialog-date_range_end_filters').val();
                              
                                var sizeRangeStartFilter = $('#generate-update-package-dialog-size_range_start_filters').val();
                                var sizeRangeEndFilter = $('#generate-update-package-dialog-size_range_end_filters').val();
                                
                                var wildCardFilter  = $('#generate-update-package-dialog-wildcard_filters').val();
                                var regExFilter  = $('#generate-update-package-dialog-regex_filters').val();
                              
                                if(typeof packageName == "undefined" || packageName == ""){
                                   alert("Please provide a package name."); 
                                   return;
                                }
                              
                                $(this).dialog("close");
                                var dtnode = $(this).data("dtnode");
                                appBuilder.runtime_resources.generateUpdatePackage(packageName,
                                                                                   dateRangeStartFilter,
                                                                                   dateRangeEndFilter,
                                                                                   sizeRangeStartFilter,
                                                                                   sizeRangeEndFilter,
                                                                                   wildCardFilter,
                                                                                   regExFilter,
                                                                                   dtnode);
                            },
                            "Cancel": function() {
                                $(this).dialog("close");
                            }
                        }                        
                  });
               
            },
            createTabView:function(ui,event,src_component,tabctrl){
                var src_cmpt = typeof src_component == "string"?src_component:"staticfile";
                var tb_ctrl =  tabctrl;
              
                if(typeof src_component != "undefined" && 
                   typeof src_component != "string")
                  tb_ctrl =  src_component;
              
                
                var _this = this;
                var dtnode = ui.panel.dtnode;                
                ui.panel.tabid = 'appresource-'+dtnode.data.id; 
                appBuilder.common_core.getReference(ui,dtnode,src_cmpt,tb_ctrl);
            },
            generateUpdatePackage:function(packageName,
                                           dateRangeStartFilter,
                                           dateRangeEndFilter,
                                           sizeRangeStartFilter,
                                           sizeRangeEndFilter,
                                           wildCardFilter,
                                           regExFilter,
                                           dtnode){
                $.blockUI();
                var relPath = appBuilder.runtime_resources.getPath(dtnode);
              
                $.ajax({
                    type:'POST',
                    data:
                        {
                          "relPath":relPath,
                          "packageName":packageName,
                          "dateRangeStartFilter":dateRangeStartFilter,
                          "dateRangeEndFilter":dateRangeEndFilter,
                          "sizeRangeStartFilter":sizeRangeStartFilter,
                          "sizeRangeEndFilter":sizeRangeEndFilter,
                          "wildCardFilter":wildCardFilter,
                          "regExFilter":regExFilter
                        },
                    url:"/file-system/generate-update-pack.ste",
                    success:function(data){
                        $.unblockUI();
                        
                 }});              
            },
            newResource:function(name,mimeType,dtnode,menuLabel){                               
                $.blockUI();
                var rp = appBuilder.runtime_resources.getPath(dtnode);
                var relPath = rp != ""?rp+"/"+name:name;
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "relPath":relPath+  (mimeType != '' && mimeType != 'dir'?   (mimeType[0] == '.'?mimeType:"."+mimeType):""),
                            "mime":mimeType,
                            "isUIPart":menuLabel == "Html-UI-Part"?"true":"false",
                            "definition_id":$('#appresource-dialog').data("definition_id")
                        },
                    url:"/file-system/create.ste",
                    success:function(data){
                        $.unblockUI();
                        var reply = eval('('+data+')');
                        
                        if(reply.status == 'success'){
                            var appresource = {};
                            appresource.mime          = mimeType;
                            appresource.isFolder      = (mimeType == "dir");
                            appresource.relPath       = relPath;
                            appresource.name          = name+  (mimeType != '' && mimeType != 'dir'?   (mimeType[0] == '.'?mimeType:"."+mimeType):"");
                            
                            //create tree control node and append to the appresource tree                               
                            dtnode.addChild(appBuilder.runtime_resources.createResourceTreeNode(appresource)).activate();
                        }
                 }});
            },
  		    openWebAppDialog:function(dtnode){
             var root = $("#app-treecontrol").dynatree("getTree").getRoot().getChildren()[0];
             $('#new-web-app-dialog').data("dtnode",root).dialog("open");                                      
            },
            newWebApp:function(name,dtnode,appLocation,dataSrc,createAuthTables,createDatabase){                               
                
                var relPath = appLocation;
              
                //var relPath = appBuilder.runtime_resources.getPath(dtnode);
              
                if(relPath != "/")
                  relPath = relPath+"/"+name;
                else
                  relPath = "/"+name;
                
              	$.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "relPath":relPath,
                            "name":name,
                            "dataSource":dataSrc,
                            "createAuthTables":createAuthTables,
                            "createDatabase":createDatabase
                        },
                    url:"/new-web-app/create-web-app.ste",
                    success:function(data){
                        
                                           
                      //spin-off taxonomy cloning operations.
                      $.ajax({
                        type:'POST',
                        data:
                        {
                          "relPath":relPath,
                          "name":name,
                          "dataSource":dataSrc,
                          "createAuthTables":createAuthTables,
                          "createDatabase":createDatabase
                        },
                        url:"/new-web-app/complete-create-web-app.ste",
                        success:function(data){
                          
                        }});                
                      
                        
                      
                        //var reply = eval('('+data+')');
                        
                        /*if(reply.status == 'success')*/{
                            var appresource = {};
                            appresource.mime          = "dir";//mimeType;
                            appresource.isFolder      = true;//(mimeType == "dir");
                            appresource.relPath       = relPath;
                            appresource.name          = name;//+  (mimeType != '' && mimeType != 'dir'? "."+mimeType:"");
                            
                            //create tree control node and append to the appresource tree                               
                            dtnode.addChild(appBuilder.runtime_resources.createResourceTreeNode(appresource)).activate();
                          
                            appBuilder.common_core.getApps(function(d){                                
                            	 var appConfig = appBuilder.common_core.findApp(relPath+"/web");
                              	 if(appConfig == null){                                    
                                	$.unblockUI();
                                	return;
                              	  }
                                 
                                 //setup poll to determine when new app is ready so it can 
                                 //opened in the browser
                                 var killPoll = false;
                                 var ts = new Date().getTime();
                              
                                 (function poll(){
                                    if(killPoll == true || ((new Date().getTime()-ts) > 60000)){
                                        $.unblockUI();
                                        return;
                                    }
                                  
                                    
                                    $.ajax({ 
                                            type:'GET',
                                            url: appConfig.contextPath+"/index.html?ts="+(ts++)
                                            ,                                             
                                            success: function(data){
                                      		  if(!killPoll){
                                              	 killPoll = true;
                                      			 $.unblockUI();
                                      		     appBuilder.layItOut = true;
                                                 appBuilder.openResource(relPath+"/web/index.html");
                                                 //window.open(appConfig.contextPath+"/"+appConfig.main,appConfig.name);
                                    		  }
                                           }, /*dataType: "json",*/ complete: poll, timeout: 30000});
                                })();                            
                              
                            });
                        }
                    }});
            },
            buildWebApp:function(dtnode){
                $.blockUI();
                var rp = appBuilder.runtime_resources.getPath(dtnode);
                var relPath = rp;// != ""?rp+"/"+dtnode.data.title:dtnode.data.title;
                              
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "relPath":relPath
                        },
                    url:"/new-web-app/build-web-app.ste",
                    success:function(data){
                        $.unblockUI();
                        var reply = eval('('+data+')');
                        
                        if(reply.status == 'success'){
                          
                        }
                    }});                            
            },
            deployContext:function(dtnode){
                
                var relPath   = appBuilder.common_core.getRelPath(dtnode);  
                //var assetPath  = relPath;      
                var appConfig = appBuilder.common_core.findApp(relPath);
                //relPath 	  = relPath.substring(appConfig.baseDir.length);
                              
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                          "relPath":relPath,
                          "appName":appConfig.name
                        },
                    url:"/new-web-app/deploy-context.ste",
                    success:function(data){
                        $.unblockUI();
                        
                }});                            
            },
            deployWar:function(dtnode){
                
                var relPath   = appBuilder.common_core.getRelPath(dtnode);  
                //var assetPath  = relPath;      
                var appConfig = appBuilder.common_core.findApp(relPath);
                //relPath 	  = relPath.substring(appConfig.baseDir.length);
                              
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                          "relPath":relPath,
                          "appName":appConfig.name
                        },
                    url:"/new-web-app/deploy-war.ste",
                    success:function(data){
                        $.unblockUI();
                        
                }});                            
            },
            bakeCrud:function(dtnode,callback){
                
                var rp = appBuilder.common_core.getRelPath(dtnode);
                
                var relPath = rp.lastIndexOf('.') != -1?rp.substring(0,rp.lastIndexOf('.')):rp;// != ""?rp+"/"+name:name;
              
                var id = dtnode.data.id;
                
                if(dtnode.data.type != "apptaxonomy-category")
                    id = dtnode.data.link_id;
              
              	var type = dtnode.data.type;
              	if(dtnode.data.type == "appresource")
                   type = appBuilder.common_core.definitionMimeToType(dtnode.data.mime);
                
                
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "relPath":relPath,
                          	"type":type,
                            "id":id,
                            "mimeType":appBuilder.common_core.definitionTypeToMime(dtnode.data.type)
                        },
                    url:"/taxonomy/bake-crud.ste",
                    success:function(data){
                        $.unblockUI();
                  
                         if(typeof callback == "function")
                   			callback();
                }});              
            },
            getPath:function(i_dtnode){
                var path = [];
                if(i_dtnode.data.type != 'appresource-root' && i_dtnode.data.type != 'apptaxonomy-root')
                    path= [i_dtnode.data.title];
                else
                    return "/";
                
                i_dtnode.visitParents(function(dtnode){
                    
                    if(dtnode.data.type == 'appresource-dir' || dtnode.data.type == 'apptaxonomy-category'){
                        path.push(dtnode.data.title);                      
                        return true;
                    }
                    else
                    if(appBuilder.common_core.isExecutableType(appBuilder.common_core.definitionTypeToMime(dtnode.data.type))){
                        
                      if(i_dtnode.data.mime == "vm"){
                        
                      }
                      else{
                      	path.splice(0,1);
                        path.push(dtnode.data.title);
                      }                        
                      return true;
                    }
                    /*else
                    if(dtnode.parent != null && appBuilder.common_core.isExecutableType(appBuilder.common_core.definitionTypeToMime(dtnode.parent.data.type))){
                        alert(dtnode.parent.data.title)
                        path.push(dtnode.parent.data.title);
                        return true;
                    }*/
                      	                     
                      
                  	return false;
                },false);
                path.reverse();
                return path.length>0?'/'+path.join('/'):'/';
            },
            zipDir:function(dtnode){
                $.blockUI();
                $.ajax({
                  type:'POST',		  		  
                  data:{
                    "relPath":appBuilder.runtime_resources.getPath(dtnode)
                  },
                  url:"/file-system/zip.ste",
                  success:function(data){                   
                    $.unblockUI();
					dtnode.parent.resetLazy();
                    dtnode.parent.expand();                    
                  }
                });              
            },
            unZipFile:function(dtnode){
                $.blockUI();
                $.ajax({
                  type:'POST',
                  data:{
                    "relPath":appBuilder.runtime_resources.getPath(dtnode)
                  },
                  url:"/file-system/unzip.ste",
                  success:function(data){
                    $.unblockUI();
					dtnode.parent.resetLazy();
                    dtnode.parent.expand();                    
                  }
                });            
            },
            viewResource:function(relPath,callback){
				
                $.ajax({
                  type:'POST',
		  		  dataType:"text",
                  data:{
                    "relPath":relPath
                  },
                  url:"/file-system/view.ste",
                  success:function(data){
                    
                    if(typeof callback != "undefined")
                      callback(data);
                  }
                });               
            },
            renameResource:function(name,mimeType,dtnode){
                
                var relPath = appBuilder.runtime_resources.getPath(dtnode);
                if(dtnode.data.type != "appresource" && dtnode.data.type != "appresource-dir" && appBuilder.common_core.isExecutableType(appBuilder.common_core.definitionTypeToMime(dtnode.data.type))){
                    relPath = relPath;//+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
                }
              
              	var newName =  name+(mimeType != '' && mimeType != 'dir'?   (mimeType[0] == '.'?mimeType:"."+mimeType):"");
              	
              	
              
                $.blockUI();
                $.ajax({
                    type:'POST',
                    data:
                        {
                            "relPath":relPath,
                            "name":newName
                        },
                    url:"/file-system/rename.ste",
                    success:function(data){    
                        
                        $.unblockUI(); 
                      
                         if(dtnode.data.key != '0' && dtnode.data.type == 'appresource-dir')
                         	appBuilder.sysadmin.apptaxonomy.renameCategory(name,dtnode);
                      	 else
                         if(dtnode.data.key != '0')
                         	appBuilder.sysadmin.apptaxonomy.renameItem(name,dtnode);
                      
                         dtnode.data.title = newName;
                         dtnode.render();
                         
                    }});
            },
            editResource:function(dtnode){
               appBuilder.currentNode = dtnode;
               appBuilder.appresource_tab_type = "edit";
               appBuilder.menuAction = "edit";
               appBuilder.createTab('appresource-edit-'+dtnode.data.id,dtnode.data.title);                                
            },
            runResource:function(dtnode){
                
             	var relPath   = appBuilder.common_core.getRelPath(dtnode);        
        		
                var assetPath  = relPath;      
                var appConfig = appBuilder.common_core.findApp(relPath);
                if(appConfig == null){
                	alert("Please test from a valid App context.");
                    return;                
                }
                relPath 	  = relPath.substring(appConfig.baseDir.length);
                
                if(dtnode.data.type != "appresource"){
                  relPath   = relPath;//+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
                  assetPath = assetPath;//+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
                }         
                
                if(appBuilder.common_core.isExecutableType(relPath)){
                    
                    appBuilder.runtime_resources.viewResource(assetPath,function(data){
                          try
                          {
                             var ref = eval('('+data+')');
                             var tabid = 'appresource-run-'+ref.reference_id;
                            
                             
                             if($("#"+tabid).length == 0){
                                appBuilder.currentNode = dtnode;
                                appBuilder.appresource_tab_type = "run";
                                appBuilder.createTab(tabid,dtnode.data.title);
                             }else{
                                $('#tabs').tabs("option","active",$('a[href$="'+tabid+'"]').parent().index());
                             }
                          }catch(error){
                            //attempt to bake it
                            appBuilder.runtime_resources.bakeCrud(dtnode,function(){
                              
                                  appBuilder.runtime_resources.viewResource(assetPath,function(data){
                                        try
                                        {
                                           var ref = eval('('+data+')');
                                           var tabid = 'appresource-run-'+ref.reference_id;
                                          
                                           if($("#"+tabid).length == 0){
                                              appBuilder.currentNode = dtnode;
                                              appBuilder.appresource_tab_type = "run";
                                              appBuilder.createTab('appresource-run-'+ref.reference_id,dtnode.data.title);                                          
                                           }else{
                                              $('#tabs').tabs("option","active",$('a[href$="'+tabid+'"]').parent().index());
                                           }
                                        }catch(error){
                                          alert("unable to test crud.");
                                        }
                                  });                          
                            });
                         }                 
                    });
                }
              	else
                {
                    var tabid = 'appresource-run-'+dtnode.data.id;
                    if($("#"+tabid).length == 0){
                      appBuilder.currentNode = dtnode;
                      appBuilder.appresource_tab_type = "run";
                      appBuilder.createTab(tabid,dtnode.data.title);
                    }else{
                      $('#tabs').tabs("option","active",$('a[href$="'+tabid+'"]').parent().index());
                    }                  
                }
            },  			
            deleteResource:function(dtnode,noprompt,callback){
                if(  (typeof noprompt != "undefined" && typeof noprompt != "function") || confirm("Are you sure you want to delete this resource?")){
                    
                    var relPath = appBuilder.runtime_resources.getPath(dtnode);
                    if(dtnode.data.type != "appresource" && dtnode.data.type != "appresource-dir" && appBuilder.common_core.isExecutableType(appBuilder.common_core.definitionTypeToMime(dtnode.data.type))){
                        relPath = relPath;//+"."+appBuilder.common_core.definitionTypeToMime(dtnode.data.type);
                    }
                  
                  var cb = typeof noprompt == "function"?noprompt:callback;
                  
                    $.blockUI();
                    $.ajax({
                            type:'POST',
                            data:{
                                "relPath":relPath
                            },
                            url:"/file-system/delete.ste",
                            success:function(data){
                              
                                //delete corresponding taxonomy
                                if(dtnode.data.type == "appresource-dir" && dtnode.data.key != '0'){
                                  appBuilder.sysadmin.apptaxonomy.deleteCategory(dtnode,true,typeof cb == "undefined"?function(){
                                  	dtnode.remove();
                                  }:cb);
                                }
                              	else{
                                    if(typeof cb == "undefined")                                            
                              			dtnode.remove();
                                    else
                                        cb();                               
                              	}                                
                                $.unblockUI();
                            }
                    });
                  

                }
            },
            moveResource:function(sourceNode,node,callback){
                    var oldAppTaxonomyId = sourceNode.data.appTaxonomyId;
                    var relPath = appBuilder.runtime_resources.getPath(sourceNode);
              
                    if(sourceNode.data.type != "appresource" && sourceNode.data.type != "appresource-dir" && appBuilder.common_core.isExecutableType(appBuilder.common_core.definitionTypeToMime(sourceNode.data.type))){
                       relPath = relPath;//+"."+appBuilder.common_core.definitionTypeToMime(sourceNode.data.type);
                       oldAppTaxonomyId = sourceNode.parent.data.appTaxonomyId;
                    }
              
              		
                    $.ajax({
                    type:'POST',
                    data:
                    {
                        "fromRelPath":relPath,
                        "toRelPath":appBuilder.runtime_resources.getPath(node)
                    },
                    url:"/file-system/move.ste",
                    success:function(data){
                        var reply = eval('('+data+')');
                      
                        if(reply.status == 'success'){
                            sourceNode.data.relPath = reply.relPath;
                          
                            
                          
                            if(sourceNode.data.key != '0' && node.data.key == '0'){
                               //need to create target taxonomy
                               appBuilder.sysadmin.apptaxonomy.
                               buildAncestorNodes(node,sourceNode,function(){
                               	 appBuilder.sysadmin.apptaxonomy
                                 .updateNodePosition(oldAppTaxonomyId,
                                                     appBuilder.sysadmin.apptaxonomy.nodeId(sourceNode),
                                                     appBuilder.sysadmin.apptaxonomy.nodeId(node),
                                                     '0',
                                                     oldAppTaxonomyId,callback);
                               });
                            }
                            else
                            if(sourceNode.data.key != '0' && node.data.key != '0'){
                              
                               	 appBuilder.sysadmin.apptaxonomy
                                 .updateNodePosition(oldAppTaxonomyId,
                                                     appBuilder.sysadmin.apptaxonomy.nodeId(sourceNode),
                                                     appBuilder.sysadmin.apptaxonomy.nodeId(node),
                                                     '0',
                                                     oldAppTaxonomyId,callback);
                            }
                            else
                            if(typeof callback == "function"){
                              	callback();
                            }
                        }
                    }
                });                
            },
            pasteResource:function(sourceNode,node){
              
              		if(appBuilder.isCut){
                       appBuilder.runtime_resources
                       .moveResource(sourceNode,node,function(){
                          appBuilder.copiedNode = null;
                          sourceNode.move(node,"over");
                        });
                        return;
              		}
              
                    function updateTargetNode(destTaxonomy){
                      var clonedData = eval(uneval(sourceNode.data));                      
                      clonedData.id = new Date().getTime();
                      
                      if(typeof destTaxonomy != "undefined")
                        clonedData.key = destTaxonomy.fromNode.id;
                      
                      node.addChild(clonedData);                
                    }
              
                    function copyTaxonomy(){
                      
                      $.ajax({
                        type:'POST',
                        data:
                        {
                            "fromCategory":appBuilder.common_core.getRelPath(sourceNode),
                            "toCategory":appBuilder.common_core.getRelPath(node),
                          	"includeRoot":"true"
                        },
                      	url:"/taxonomy/copy-taxonomy-category.ste",
                        success:function(data){
                             var node = eval('('+data+')');
                             updateTargetNode(node);
                        }
                      });
                    }
              
                    $.ajax({
                    type:'POST',
                    data:
                    {
                        "relPath":appBuilder.common_core.getRelPath(sourceNode),
                        "fromRelPath":appBuilder.common_core.getRelPath(sourceNode),
                        "toRelPath":appBuilder.common_core.getRelPath(node)
                    },
                    url:"/file-system/paste.ste",
                    success:function(data){
						
                        var reply = eval('('+data+')');
                        if(reply.status == 'success'){
                          
                            //alert(sourceNode.data.key+"/"+node.data.key);
                            if(sourceNode.data.key != '0' && node.data.key == '0'){//if source node is in taxonomy but target isn't
                               //need to create target taxonomy
                               appBuilder.sysadmin.apptaxonomy.
                               buildAncestorNodes(node,sourceNode,function(){
                               	 copyTaxonomy();
                               });
                            }
                            else
                            if(sourceNode.data.key != '0' && node.data.key != '0'){//if both target and soure nodes are in taxonomy
                               	 copyTaxonomy();
                            }else{
                              updateTargetNode();
                            }
                        }
                    }
                });                
            },
            uploadResource:function(dtnode){
              
                var destDir = appBuilder.common_core.getRelPath(dtnode);
              
                var formData = new FormData();
				formData.append("uploadedFile",document.getElementById("fileresource-dialog-file").files[0]);
    			formData.append("destDir",destDir);
              	formData.append("enableUnpack",$("#fileresource-dialog-unpack").prop("checked"));
              
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4 && xhr.status == 200)
                    {
					  dtnode.resetLazy();
                      dtnode.expand();                      
                      $.unblockUI();
                      
                        //cb(xhr.responseText); // Another callback here
                    }
                }
                
                $.blockUI();
                //alert(document.getElementById("fileresource-dialog-file"))
                // Add any event handlers here...
                xhr.open('POST','/file-system/add-file.upl', true);
                xhr.send(formData);
              
                    /*$.ajax({
                    type:'POST',
                    data:
                    {
                        "relPath":"/"+appBuilder.common_core.getRelPath(sourceNode),
                        fromRelPath:"/"+appBuilder.common_core.getRelPath(sourceNode),
                        toRelPath:"/"+appBuilder.common_core.getRelPath(node),
                        "METHOD":"GET",
                        "RESTRICTED_METHOD":"PASTE"                        
                    },
                    url:appBuilder.runtime_resources.actionURL+"/api/scriptexecutors/restricted-resource-action.ste",
                    success:function(data){

                        var reply = eval('('+data+')');
                        if(reply.status == 'success'){
                            var clonedData = eval(uneval(sourceNode.data));
                            clonedData.relPath = reply.relPath; 
                            clonedData.id = new Date().getTime();
                      		node.addChild(clonedData);
                        }
                    }
                });*/                
            },
            refresh:function(relPath,mime,cb){
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                            "relPath":relPath,
                            "mime":mime
                        },
                        url:"/file-system/refresh.ste",
                  		//url:"api/restricted-resource-action.ste",
                        success:function(data){
                            $.unblockUI();
                            if(typeof cb != "undefined")
                                cb();
                        }
                 });                
            },
            refreshResource:function(dtnode,mime){
                appBuilder.runtime_resources.refresh(appBuilder.runtime_resources.getPath(dtnode),mime)
            },
            syncResource:function(dtnode,mime){
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                            "relPath":appBuilder.runtime_resources.getPath(dtnode),
                            "depth":"-1",
                            "mime":mime
                        },
                        url:"/api/restricted-resource-action.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });
            },
            backupResource:function(dtnode,mime){
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                            "relPath":appBuilder.runtime_resources.getPath(dtnode)
                        },
                        url:"/asset-backup/add-to-backup.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });
            },
            runBackupResource:function(dtnode){
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                          
                        },
                        url:"/asset-backup/backup.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });
            },
            resourceToSource:function(dtnode,preserveIds){
                
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                          "relPath":appBuilder.runtime_resources.getPath(dtnode),
                          "preserveIds":preserveIds
                        },
                        url:"/crud-to-source/to-source.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });
            },
  			indexResource:function(dtnode){
               if(!confirm("Indexing can be time consuming, do you want to continue?"))return;
              
              
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                            "relPath":appBuilder.runtime_resources.getPath(dtnode)
                        },
                        url:"/lucene/perform-index.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });				
			},
  			searchInResource:function(dtnode){
                $.blockUI();
                $.ajax({
                        type:'POST',
                        data:{
                            "relPath":appBuilder.runtime_resources.getPath(dtnode)
                        },
                        url:"/lucene/perform-index.ste",
                        success:function(data){
                            $.unblockUI();
                        }
                 });				
			},
  			searchDirectory:null,
  			searchCallBack:null,
            showSearchTabView:function(dtnode){
              if(dtnode == null && appBuilder.runtime_resources.searchDirectory == null)
                appBuilder.runtime_resources.searchDirectory = '/';
              else
              if(dtnode != null)
              	appBuilder.runtime_resources.searchDirectory = appBuilder.runtime_resources.getPath(dtnode);
              
              if($("#text-search-tab iframe").length > 0){
      			var fd = $("#text-search-tab iframe")[0].contentWindow || $("#text-search-tab iframe")[0]; // document of iframe
      			fd.performSearch($("#crudzilla-searcbox").val());                
              }
              else
              {
              	appBuilder.currentNode = dtnode;
              	appBuilder.queuedAction.push('show-text-search');
              	appBuilder.createTab('text-search-tab-0','<img src="img/silk/magnifier.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold;color:#729fcf">Search Results</span>'); 
              }
            },
            focusSearchBox:function(){
              setTimeout(function(){
              
              },1000);
            },
  			//searchFrame:$("#search-view-iframe"),
            createSearchTabView:function(ui,event){
              var _this = this;
              ui.panel.tabid = "text-search-tab-0";
              
              /*
              ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");                  
              $("#text-search-tab").append(ui.panel.panel);                                    
              $(ui.panel.panel).append(this.searchFrame);
              
              
              $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
              
              $("#text-search-tab iframe")
              .attr("width","100%")
              .attr("height",$(ui.panel.panel).parent().parent().height());            
              */
              
              
              $("#tabs").tabs('option', 'active',ui.index);
              
              
              $.ajax({
                type:'POST',
                url:'/sc/appbuilder/ui-templates/text-search-tab-view.html',
                success:function(data){
                  
                  ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\" ></div>");                  
                  $("#text-search-tab").append(ui.panel.panel);                                    
                  $(ui.panel.panel).html(appBuilder.parseTemplate(data,{}));
                  
                  
                  $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
                  
                  $("#text-search-tab iframe")
                  .attr("width","100%")
                  .attr("height",$(ui.panel.panel).parent().parent().height());      
                  $("#text-search-tab iframe").load(function(){
                  	//alert("frame loaded");
                    $("#crudzilla-searcbox").focus();
                  });
                }
              });
            },
            getMime:function(p){
                var ext = p;
              	if(p.lastIndexOf('.') != -1)
                  ext = p.substring(p.lastIndexOf('.'));
              
                if(appBuilder.endsWith(p,'.stm'))
                    return 'stm';
                if(appBuilder.endsWith(p,'.ste'))
                    return 'ste';
                if(appBuilder.endsWith(p,'.upl'))
                    return 'upl';
                if(appBuilder.endsWith(p,'.esd'))
                    return 'esd';
                if(appBuilder.endsWith(p,'.svc'))
                    return 'svc';
                if(appBuilder.endsWith(p,'.ins'))
                    return 'ins';    
              
                 if(appBuilder.endsWith(p,'.html') || appBuilder.endsWith(p,'.htm'))
                    return 'html';     
                if(appBuilder.endsWith(p,'.java'))
                    return 'java';     
                if(appBuilder.endsWith(p,'.xml'))
                    return 'xml';    
                if(appBuilder.endsWith(p,'.svg'))
                    return 'svg';               
                if(appBuilder.endsWith(p,'.css'))
                    return 'css';  
              
                if(appBuilder.endsWith(p,'.js'))
                    return 'js';   
              
                if(appBuilder.endsWith(p,'.vm'))
                    return 'vm';               
              
                if(appBuilder.endsWith(p,'.zip') || 
                   appBuilder.endsWith(p,'.jar') ||
                   appBuilder.endsWith(p,'.war'))
                    return 'compress';
              
              
                if(appBuilder.endsWith(p,'.png') || 
                   appBuilder.endsWith(p,'.gif') ||
                   appBuilder.endsWith(p,'.jpeg') ||
                   appBuilder.endsWith(p,'.jpg'))
                    return 'image';
              
               if(typeof appBuilder.common_core.editorModeDefinitions[ext] != "undefined")                	
                  	return appBuilder.common_core.editorModeDefinitions[ext].mode;
              
              
                return 'na';
            },
            getFolderClass:function(path){
              if(appBuilder.endsWith(path,'crudzilla-backup-snapshots'))
                  return 'appresource-crudzilla-backup-folder-treenode';  
              
             
              var appConfig = appBuilder.common_core.getAppByPath(path+"/web");
              if(appConfig != null){
                return "appresource-webapp-folder-treenode";
              }
              
              if(appBuilder.endsWith(path,'/web')){
                
                appConfig = appBuilder.common_core.getAppByPath(path);
                
                if(appConfig != null){
                 	 return "appresource-webapp-public-folder-treenode";
                }
              }
              

              
              return 'appresource-dir-treenode';  
            },
            createResourceTreeNode:function(appresource){
                if(appresource.isFolder && 
                   appBuilder.common_core.isExecutableType(appresource.mime)){
                  
                  appresource.type = appBuilder.common_core.definitionMimeToType(appresource.mime);
                  
                  return appBuilder.common_core.createDefinitionNode(appresource);
                }
              
              	
                var d = {
                    "title":appresource.name,
                    "addClass":(appresource.isFolder?this.getFolderClass(appresource.relPath)+" appresource-folder-treenode":"appresource-"+this.getMime(appresource.name)+"-treenode")+" appresource-treenode",
                    "type":appresource.isFolder?"appresource-dir":"appresource",
                    "isFolder":appresource.isFolder,
                    "isLazy":appresource.isFolder,
                    "mime":appresource.mime?appresource.mime:"file",
                    "id":appresource.id?appresource.id:new Date().getTime(),
                    "relPath":appresource.relPath,
                    "children":[]
                };
              
              	if(appBuilder.common_core.isExecutableType(d.mime)){
                    
                    if(typeof appresource.corrupt == "undefined")
                  		d["addClass"] = d["addClass"]+" crud-executable-treenode";
                    else
                        d["addClass"] = d["addClass"]+" corrupt-crud-executable-treenode";
              	}
              
                if(typeof appresource.taxonomy != "undefined"){
                    
                    d.appTaxonomyId = appresource.taxonomy.appTaxonomyId;
                    d.key=appresource.taxonomy.id;
                    d.id=appresource.taxonomy.id;
                    d.link_id=appresource.taxonomy.linkId?appresource.taxonomy.linkId:'-1';
                    d.link_apptaxonomy_id=appresource.taxonomy.linkAppTaxonomyId?appresource.taxonomy.linkAppTaxonomyId:'-1';
                    
                }
              	else
                {
                    d.appTaxonomyId = '0';
                    d.key='0';
                    //d.id='0';
                    d.link_id='-1';
                    d.link_apptaxonomy_id='-1';                                    
               	}
                
              	 return d;
            },     
            addResourceNode:function(node,dtnode,pairTaxonomy){
                
                if(node.files){
                    
                        node.files.sort(function(a,b){
                                        if(a.name<b.name) return -1;
                                        if(a.name>b.name) return 1;
                                        return 0;
                                    });
                  
                  
                   var excludes = [];
                   for(var i=0;i<node.files.length;i++){
                     	if(typeof node.files[i].excludes != "undefined" && node.files[i].excludes.length>0){
                            //alert(node.files[i].excludes.length)
                   	  		excludes = excludes.concat(node.files[i].excludes) 
                     	}
                   }
                  
                   //alert(excludes.length)
                   for(var i=0;i<node.files.length;i++){
                        var file = node.files[i];
                        
                     	var item = null;
                     	var taxonomy = null;
                     
                     	var skip = false;
                     	for(var ex=0;ex<excludes.length;ex++){
                          //alert(excludes[ex])
                          if(excludes[ex] == file.name){
                            skip = true;
                            break;
                          }
                        }
                     	if(skip)continue;
                     
                     	if(typeof pairTaxonomy != "undefined"){
                              for(var j=0;j<pairTaxonomy.length;j++){
                                  if (
                                      file.isFolder && 
                                      !appBuilder.common_core.isExecutableType(file.mime) &&
                                      pairTaxonomy[j].type == "apptaxonomy-category" &&                             
                                      pairTaxonomy[j].name == file.name){
                                        
                                      file.taxonomy = pairTaxonomy[j];
                                      break;
                                  }
                                  else
                                  if(  
                                      file.isFolder && 
                                      appBuilder.common_core.isExecutableType(file.mime) &&
                                      pairTaxonomy[j].type != "apptaxonomy-category" &&
                                      appBuilder.common_core.definitionTypeToMime(pairTaxonomy[j].type) == file.mime &&
                                      (pairTaxonomy[j].name+"."+file.mime) == file.name
                                  ){
                                      file.taxonomy = pairTaxonomy[j];
                                      file.link_id = file.taxonomy.id;
                                      file.id = file.taxonomy.linkId;
                                    	
                                      
                                      item = appBuilder.runtime_resources.createResourceTreeNode(file);
                                      
                                      item.link_id = file.link_id;                                      
                                      item.appTaxonomyId = file.appTaxonomyId;
                                      break;
                                  }
                              }
                     	}
                     
                     
                        //create tree control node and append to the app tree 
                        if(item == null){
                       
                        	item = appBuilder.runtime_resources.createResourceTreeNode(file);
                        }
                     
                        appBuilder.runtime_resources.addResourceNode(file,dtnode.addChild(item));
                    }                 
                }
            },
            loadDirectoryNode:function(dtnode){
                
                $.ajax({
                        type:'POST',
                        data:
                        {
                            "relPath":appBuilder.runtime_resources.getPath(dtnode),
                            "depth":"1"
                        },
                  		url:"/file-system/list-dir.ste",
                        success:function(data){
                  			
                            var directory = eval('('+data+')');
                            appBuilder.sysadmin.apptaxonomy.loadCategoryNode(dtnode,function(categories){
                              
                              appBuilder.runtime_resources.addResourceNode(directory,dtnode,categories);
                              if(typeof appBuilder.postNodeLoadCallback == "function")
                                appBuilder.postNodeLoadCallback(dtnode);
                            },
                            true);
                        }
                   });                
            },            
            createAppTreeControlTabView:function(ui,event){
                var _this = this;
                var dtnode = ui.panel.dtnode;
                ui.panel.tabid = 'apptreecontrol';
                
                ui.panel.panel = $("<div id=\"apptreecontrol-content\"></div>");//.appendTo("#datastatement-tab");
                $("#apptreecontrol-tab").append(ui.panel.panel);                                    
                $(ui.panel.panel).html('<div id="app-treecontrol2"></div>');
                
                $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white","overflow":"auto"});
                appBuilder.createNavigationTreeControl("app-treecontrol2");
                
                $("#tabs").tabs('option','active',ui.index);
            },            
            createWorkTreeControlTabView:function(ui,event){
                var _this = this;
                var dtnode = ui.panel.dtnode;
                ui.panel.tabid = 'worktreecontrol';
                
                ui.panel.panel = $("<div id=\"worktreecontrol-content\"></div>");
                $("#worktreecontrol-tab").append(ui.panel.panel);                                    
                $(ui.panel.panel).html('<div id="work-treecontrol2"></div>');
                
                $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height(),"background-color":"white","overflow":"auto"});
                appBuilder.createNavigationTreeControl("work-treecontrol2"); 
              
              	              
                $("#tabs").tabs('option','active',ui.index);
            },
  			openCrudbase:function(){              
              //appBuilder.currentNode = dtnode;
              appBuilder.queuedAction.push('crudbase');
              appBuilder.createTab('crudbase','<span style="font-weight:bold;color:#729fcf">Crudbase</span>',$('#nav-tabs')); 
              
			},
            createCrudbaseTabView:function(ui,event,tabctrl){
                var _this = this;                
                ui.panel.tabid = 'crudbase';
                
                ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                $("#app-work-tab").append(ui.panel.panel);                                    
               $(ui.panel.panel).html('<div id="work-treecontrol"></div>');
                
                $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().parent().height(),"background-color":"white","overflow":"auto"});
                appBuilder.createNavigationTreeControl("work-treecontrol"); 
              
              	              
                $(tabctrl).tabs('option','active',ui.index); 
            },
            createAppResourceTabView:function(ui,event,tabctrl){
                var _this = this;                
                ui.panel.tabid = 'crudbase';
                
                ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                $("#app-work-tab").append(ui.panel.panel);                                    
               $(ui.panel.panel).html('<div id="app-treecontrol"></div>');
                
                $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().parent().height(),"background-color":"white","overflow":"auto"});
                appBuilder.createNavigationTreeControl("work-treecontrol"); 
              
              	              
                $(tabctrl).tabs('option','active',ui.index); 
            }
}
