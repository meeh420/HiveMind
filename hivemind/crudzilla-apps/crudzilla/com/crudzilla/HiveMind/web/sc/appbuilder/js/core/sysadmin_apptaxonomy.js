/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

appBuilder.sysadmin.apptaxonomy={
    actionURL:appBuilder.context_path,
    init:function(){
            var _this = this;
            $('#sysadmin-apptaxonomy-dialog').dialog({
                autoOpen: false,
                width: 256,
                height:116,
                open:function(){
                    var dtnode = $(this).data("dtnode");

                    if($(this).data("rename")){
                        $('#sysadmin-apptaxonomy-dialog-name').val(dtnode.data.title);
                        $("#sysadmin-apptaxonomy-link-drop").css({"display":"none"});
                    }
                    else{
                        $('#sysadmin-apptaxonomy-dialog-name').val('');
                        $("#sysadmin-apptaxonomy-link-drop").css({"display":"block"});
                    }

                    $("#sysadmin-apptaxonomy-link-drop span").html('Drop link here.');
                },
                buttons: {
                    "Ok": function() {
                            if($('#sysadmin-apptaxonomy-dialog-name').val() != ''){
                                
                                var dtnode = $(this).data("dtnode");
                                if($(this).data("rename"))
                                    appBuilder.sysadmin.apptaxonomy.renameAppTaxonomy($('#sysadmin-apptaxonomy-dialog-name').val(), dtnode);
                                else
                                    appBuilder.sysadmin.apptaxonomy.newAppTaxonomy($('#sysadmin-apptaxonomy-dialog-name').val(), dtnode);
                                $(this).dialog("close");
                            }else{
                                alert("please provide an appropriate name for apptaxonomy");
                            }
                    },
                    "Cancel": function() {
                        $(this).dialog("close");
                    }
                }
            }).siblings('div.ui-dialog-titlebar').remove();


            $('#apptaxonomy-node-action-confirmation-dialog')
            .dialog({
                autoOpen: false,
                width: 150,
                buttons: {
                    "Yes": function() {
                        $(this).dialog("close");
                        _this.nodeActionHandler.ok();
                    },
                    "No": function() {
                        $(this).dialog("close");
                        _this.nodeActionHandler.cancel();
                    }
                }
            }).siblings('div.ui-dialog-titlebar').remove();  

            $("#sysadmin-apptaxonomy-link-drop").droppable({
                drop: function( event, ui ) {
                    $("#sysadmin-apptaxonomy-link-drop span").html(ui.helper.data("dtSourceNode").data.title);
                    $('#sysadmin-apptaxonomy-dialog-name').attr('value',ui.helper.data("dtSourceNode").data.title);
                    $('#sysadmin-apptaxonomy-dialog').data("linkNode",ui.helper.data("dtSourceNode"));
                }
            });
    },
    createTabView:function(ui,event){
        var _this = this;
        var dtnode = ui.panel.dtnode;
        ui.panel.tabid = 'apptaxonomy-'+dtnode.data.id; 

        var mainScope = {
            ui:ui,
            dtnode : ui.panel.dtnode,
            definitionId:dtnode.data.id,
            appTaxonomyId :dtnode.data.id,
            src_component:"apptaxonomy",
            definitionIdParameter:"apptaxonomy_id",                    
            appTaxonomy:null,
            keyPart : dtnode.data.id
        };            


        $.ajax({
            type:'POST',
            data:{
                    "id":dtnode.data.id
                },
            url:"api/app-taxonomy/get-apptaxonomy.stm",
            success:function(data){                        
                mainScope.appTaxonomy = eval('('+data+')');
                block = {
                    run:function(mainScope){
                        $.ajax({
                            type:'POST',                                    
                            url:'sc/appbuilder/ui-templates/sysadmin-apptaxonomy-tab-view.html',
                            success:function(data){
                                ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");
                                $("#sysadmin-apptaxonomy-tab").append(ui.panel.panel);                                    
                                $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                                $(ui.panel.panel).css({"min-height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});

                                mainScope.definition = mainScope.appTaxonomy;
                                _this.createSecurityTable(mainScope,{read:true,write:true,width:600});

                                $('#sysadmin-apptaxonomy-tabs-'+mainScope.keyPart).tabs();
                                $("#tabs").tabs('option','active',ui.index);

                                $('#sysadmin-apptaxonomy-tabs-'+mainScope.keyPart).removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                            }
                        });                                
                    }
                };block.run(mainScope);                             
            }})
    },            
    createCrudSearchTabView:function(ui,event){
        var _this = this;
        var dtnode = ui.panel.dtnode;
        ui.panel.tabid = 'definition-search';

        ui.panel.panel = $("<div id=\"definition-search-content\" style=\"margin:5px\"></div>");
        $("#definition-search-tab").append(ui.panel.panel);                                    
        $(ui.panel.panel).html('<select id="definition-search-type"></select> <input id="definition-search-term"/> <div id="definition-search-treecontrol"></div>');

        $(ui.panel.panel).css({"height":$(ui.panel.panel).parent().parent().height()*0.97,"background-color":"white","overflow":"auto"});
        
        
        var html = [];
        for(var i=0;i<appBuilder.common_core.definition_types.length;i++){
            html.push("<option value\""+appBuilder.common_core.definition_types[i]+"\">"+appBuilder.common_core.definition_types[i]+"</option>");
        }
        $("#definition-search-type").html(html.join(''));    
        
        
        var searchType = appBuilder.common_core.definition_types[0];
        var doDefinitionSearch = function(){
            $( "#definition-search-term" ).autocomplete({
                minLength: 2,
                source: function( request, response ) {
                    var url = '';
                    var mime = appBuilder.common_core.definitionTypeToMime(searchType);
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

                    
                    $.getJSON( appBuilder.runtime_resources.actionURL+url, {
                    //term: extractLast( request.term )
                    'name': request.term+'%',
                    "crudzillaResultSetFormat":"list"
                    }, /*response*/function(result){
                        var parent = $('#definition-search-treecontrol').dynatree('getTree').getRoot().getChildren()[0];
                        parent.removeChildren();
                        for(var i=0;i<result.length;i++){
                            result[i].type = searchType;
                            parent.addChild(appBuilder.common_core.createDefinitionNode(result[i]));
                        }
                    });
                },
                response: function( event, ui ) {
                    
                },
                select: function( event, ui ) {
                    //alert(ui.item.value)
                    this.value = ui.item.label;
                    /*$('#appresource-dialog').data("definition_id",ui.item.value);

                    if($('#appresource-dialog-name').val() == '')
                        $('#appresource-dialog-name').val(ui.item.label);*/

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
        }
        doDefinitionSearch();
        
        
        $("#definition-search-type").change(function(){
            searchType = $(this).val();
        });        
        appBuilder.createNavigationTreeControl("definition-search-treecontrol");

        $("#tabs").tabs('option','active',ui.index);
        
    },
    add:function(appTaxonomy,dtnode,newNode){
        var crudNode = newNode;
        $.blockUI();
        $.ajax({
            type:'POST',
            data:appTaxonomy,
            url:"api/app-taxonomy/add-apptaxonomy.stm",
            success:function(data){
                $.unblockUI();
                appTaxonomy.id = appBuilder.common_core.stripNewLine(data);

                if(appTaxonomy.type == 'apptaxonomy-category'){
                    //alert(JSON.stringify(appBuilder.sysadmin.apptaxonomy.createCategoryTreeNode(appTaxonomy)));
                    //create tree control node and append to the apptaxonomy tree                               
                    dtnode.addChild(appBuilder.sysadmin.apptaxonomy.createCategoryTreeNode(appTaxonomy)).activate();
                }
                else
                if(typeof newNode != "undefined" && newNode != null)
                {
                    newNode.data.link_id = appTaxonomy.id;
                }
                else
                {
                    var aptxId = appTaxonomy.id;
                    appTaxonomy.id = appTaxonomy.link_id;
                  
                    var itemDtNode = dtnode.addChild(appBuilder.sysadmin.apptaxonomy.createItemNode(appTaxonomy));
                    itemDtNode.data.link_id = aptxId;
                  	crudNode = itemDtNode;
                }
                
                if(appTaxonomy.type != 'apptaxonomy-category')
              		appBuilder.runtime_resources.bakeCrud(crudNode);              
            }});                
    },
  	buildAncestorNodes:function(parentNode,newNode,callback){
       //ensure the parent node exists in the taxonomy, otherwise create it.
       if(parentNode.data.type == "appresource-dir" && parentNode.data.key == '0'){
          
           var buildFromNode 	= null;
           var missingPath 		= appBuilder.runtime_resources.getPath(parentNode);
           var appTaxonomyId 	= '0';
           var parentId	 		= '0';
         
           //find first existing parent node
           parentNode.visitParents(function(dtnode){
             if(dtnode.data.type == 'appresource-dir' && dtnode.data.key != '0'){
               buildFromNode = dtnode;
               return false;
             }
             return true;
           },false); 
         	
           //build taxonomy from this node.
           if(buildFromNode != null){
           	  missingPath 		= appBuilder.runtime_resources.getPath(parentNode).substring(appBuilder.runtime_resources.getPath(buildFromNode).length);
              parentId 			= buildFromNode.data.key;
              appTaxonomyId  	= buildFromNode.data.appTaxonomyId;
           }
         
           
           $.blockUI();
           $.ajax({
             type:'POST',
             data:{
             	"appTaxonomyId":appTaxonomyId,
                "parentId":parentId,
                "missingPath":missingPath
             },
             url:"/taxonomy/build-category-nodes.ste",
             success:function(data){
                 $.unblockUI();
                 
                 var nodes = eval('('+data+')');
                 
                 var i = nodes.length;
               
                 if(appTaxonomyId == '0')
                   appTaxonomyId = nodes[0].id;
                 
                 //update parent nodes with taxonomy information
                 parentNode.visitParents(function(dtnode){
                   if(dtnode.data.type == 'appresource-dir' && dtnode.data.key == '0'){
                     dtnode.data.key 			 = nodes[--i].id;
                     
                     if(buildFromNode != null || i>0)
                     	dtnode.data.appTaxonomyId   = appTaxonomyId;
                     
                     return true;
                   }
                   return false;
                 },true);                
                 
                 callback();
            }});         
         
       }
       else
         callback();
  	},
    newItem:function(name,linkId,type,parentNode,newNode){
      
        appBuilder.sysadmin.apptaxonomy.
        buildAncestorNodes(parentNode,newNode,function(){
        
            var appTaxonomy = 
            {
                "appTaxonomyId":parentNode.data.appTaxonomyId == '0'?parentNode.data.key:parentNode.data.appTaxonomyId,
                "apptaxonomy_id":parentNode.data.appTaxonomyId == '0'?parentNode.data.key:parentNode.data.appTaxonomyId,          
                "parent_id":parentNode.data.key,
                "presibling_id":'0',
                "link_id":linkId,
                "type":type,
                "name":name
            };
    
            if(parentNode.hasChildren())
                    appTaxonomy.presibling_id = appBuilder.sysadmin.apptaxonomy.nodeId(parentNode.getChildren()[parentNode.getChildren().length-1]);
    
            
            appBuilder.sysadmin.apptaxonomy.add(appTaxonomy,parentNode,newNode);        
        });
    },
    newAppTaxonomy:function(name,dtnode){

        var appTaxonomy = 
        {
            "appTaxonomyId":dtnode.data.appTaxonomyId == '0'?dtnode.data.key:dtnode.data.appTaxonomyId,
            "apptaxonomy_id":dtnode.data.appTaxonomyId == '0'?dtnode.data.key:dtnode.data.appTaxonomyId,
            "parent_id":dtnode.data.key,
            "parentId":dtnode.data.key,
            "presibling_id":'0',            
            "link_id":'-1',
            "link_apptaxonomy_id":'-1',            
            "type":"apptaxonomy-category",
            "name":name
        };

        if(dtnode.hasChildren())
                appTaxonomy.presibling_id = dtnode.getChildren()[dtnode.getChildren().length-1].data.key;

        if($('#sysadmin-apptaxonomy-dialog').data("linkNode")){
            var linkNode = $('#sysadmin-apptaxonomy-dialog').data("linkNode");
            
            appTaxonomy.link_id             =  linkNode.data.key;
            appTaxonomy.link_apptaxonomy_id =  linkNode.data.appTaxonomyId;
            
            if(appTaxonomy.link_apptaxonomy_id == '0'){
               appTaxonomy.link_apptaxonomy_id = linkNode.data.key;
            }
        }
      
        appTaxonomy.linkId            = appTaxonomy.link_id ;
        appTaxonomy.linkAppTaxonomyId = appTaxonomy.link_apptaxonomy_id; 
        appTaxonomy.preSiblingId      = appTaxonomy.presibling_id;
      
        this.add(appTaxonomy,dtnode);
    },            
    renameAppTaxonomy:function(name,dtnode){
        appBuilder.sysadmin.apptaxonomy.renameCategory(name,dtnode);
    },            
    deleteAppTaxonomy:function(dtnode,noprompt){
        if(confirm("Are you sure you want to delete this app taxonomy?")){
            $.blockUI();
            $.ajax({
                    type:'POST',
                    data:{
                        "id":dtnode.data.id,
                        "action":"delete"
                    },
                    url:appBuilder.sysadmin.apptaxonomy.actionURL,
                    success:function(data){
                        dtnode.remove();
                        $.unblockUI();
                    }
            });
        }
    },
    renameItem:function(name,dtnode){
        this.renameCategory(name,dtnode);
    },
    renameCategory:function(name,dtnode){
        $.blockUI();
        $.ajax({
            type:'POST',
            data:
                {
                    "appTaxonomyId":dtnode.data.appTaxonomyId,
                    "id":dtnode.data.link_id != '-1'?dtnode.data.link_id:dtnode.data.key,
                    "name":name
                },
            url:"/api/app-taxonomy/update-apptaxonomy-name.stm",
            success:function(data){                        
                $.unblockUI();
              	
              if(dtnode.parent.data.type == "apptaxonomy-category"){
                dtnode.data.title = name;
                dtnode.render();                 
              }
              appBuilder.runtime_resources.bakeCrud(dtnode); 
        }});
    },          
    del:function(apptaxonomy_id,id){
        
        $.blockUI();
        $.ajax({
                type:'POST',
                data:{
                    "apptaxonomy_id":apptaxonomy_id,
                    "id":id
                },
                url:"api/app-taxonomy/delete-apptaxonomy.stm",
                success:function(data){

                    //dtnode.remove();
                    //if(dtnode.getParent().data.type == 'apptaxonomy-category'){
                    //    appBuilder.sysadmin.apptaxonomy.serializeAndSaveTaxonomy(dtnode.getParent().data.key);
                    //}                                

                    $.unblockUI();
                }
        });                    
    },  
    deleteItem:function(apptaxonomy_id,id){
        appBuilder.sysadmin.apptaxonomy.del(apptaxonomy_id,id);
    },          
    deleteCategoryOnServer:function(id,preserveChildren,callback){
        $.blockUI();
        $.ajax({
                type:'POST',
                data:{
                    "preserveChildren":preserveChildren,
                    "id":id
                },
                url:"taxonomy/delete-category.ste",
                success:function(data){

                    //dtnode.remove();
                    //if(dtnode.getParent().data.type == 'apptaxonomy-category'){
                    //    appBuilder.sysadmin.apptaxonomy.serializeAndSaveTaxonomy(dtnode.getParent().data.key);
                    //}                                
					if(typeof callback == "function")
                  		callback();
                  
                    $.unblockUI();
                }
        });                    
    },
    deleteCategory:function(dtnode,noprompt,callback){
        var _this = appBuilder.sysadmin.apptaxonomy;


        if((typeof noprompt != "undefined" && typeof noprompt != "function") || confirm("Are you sure you want to delete this category?")){

            if(/*dtnode.hasChildren() && */(typeof noprompt == "undefined" || typeof noprompt == "function")  && !_this.isLink(dtnode)){
                //prompt user to select whether children only should be moved or whole node
                _this.showNodeActionDialog(
                    function(){
                      
                        function f(){
                          _this.moveNodes(dtnode.data.appTaxonomyId, dtnode, dtnode, "after",true);
                          /*--_this.del(dtnode.data.appTaxonomyId,dtnode.data.key);*/
                        
                          _this.deleteCategoryOnServer(dtnode.data.key,true,typeof noprompt == "function"?noprompt:callback);
                        
                          dtnode.remove();                                                     
                        }
                        
                        if(dtnode.getChildren())
                          f();
                        else
                          _this.loadCategoryNode(dtnode,f);
                      
                       
                    },
                    function(){
                        /*--
                        var nodeIds = [];
                        _this.serializeNodeIDs(dtnode,nodeIds);

                        for(var i=0;i<nodeIds.length;i++)
                            _this.del(dtnode.data.appTaxonomyId,nodeIds[i]);
						*/
                        _this.deleteCategoryOnServer(dtnode.data.key,false,typeof noprompt == "function"?noprompt:callback);
                        dtnode.remove();
                    },'Preserve children?');
            }
          	else{
                /*--_this.del(dtnode.data.appTaxonomyId,dtnode.data.key,dtnode);*/
              _this.deleteCategoryOnServer(dtnode.data.key,false,typeof noprompt == "function"?noprompt:callback);
                dtnode.remove();
            }
        }
    },          
    createCategoryTreeNode:function(category){
        return {
            "title":category.name,
            "addClass":"apptaxonomy-category-treenode"+(category.linkId != '-1' && category.linkId != null?' apptaxonomy-category-link-treenode':''),
            "type":"apptaxonomy-category",
            "isFolder":true,
            "isLazy":true,
            "appTaxonomyId":category.appTaxonomyId,
            "key":category.id,
            "id":category.id,
            "link_id":category.linkId?category.linkId:'-1',
            "link_apptaxonomy_id":category.linkAppTaxonomyId?category.linkAppTaxonomyId:'-1',
            "children":[]
        };                 
    },
    isLink:function(dtnode){
        return (typeof dtnode.data.link_id != "undefined" && 
                dtnode.data.link_id != null && 
                dtnode.data.link_id != '-1');
    },
    loadNode:function(dtnode){
        this.loadCategoryNode(dtnode);
    },
    createItemNode:function(item){
        return appBuilder.common_core.createDefinitionNode(item);
    },
    loadCategoryNode:function(dtnode,callback,justGET){                
        var parent_id       = dtnode.data.key;
        var apptaxonomy_id  = dtnode.data.appTaxonomyId;
        
        if(dtnode.data.link_id != '-1' && dtnode.data.link_apptaxonomy_id != '-1'){
            parent_id       = dtnode.data.link_id;
            apptaxonomy_id  = dtnode.data.link_apptaxonomy_id;
            
            //this means link is a root node
            if(apptaxonomy_id == '0')
                 apptaxonomy_id = parent_id;
        }
        else
        if(apptaxonomy_id == '0'){
            if(parent_id !='0')
                apptaxonomy_id = dtnode.data.key;
        }
        
        $.ajax({
                type:'POST',
                data:{
                    "parent_id": parent_id,
                    "apptaxonomy_id":apptaxonomy_id,
                    "crudzillaResultSetFormat":"list"
                },
                url:"/api/app-taxonomy/get-apptaxonomys.stm",
                success:function(data){
                    var categories = eval('('+data+')');
                    
                  	if(typeof justGET != "undefined" && justGET == true){
                    	callback(categories);
                      	return;
                  	}
                  
                    //sort the nodes
                    for(var i=0;i<categories.length;i++)
                        categories[i].pre_sibling = categories[i].preSiblingId;
                    
                    categories = GraphTS.sort(categories,false,'0').reverse();
                    categories.splice(0,1);
                    

                    for(i=0;i<categories.length;i++){
                        var category = categories[i];
                        
                        //category.appTaxonomyId = category.appTaxonomyId;
                        if(category.type == null || category.type == 'apptaxonomy-category'){
                         	//if(category.name == 'fin')
                            //  alert(JSON.stringify(appBuilder.sysadmin.apptaxonomy.createCategoryTreeNode(category)));
                            dtnode.addChild(appBuilder.sysadmin.apptaxonomy.createCategoryTreeNode(category));
                        }
                        else
                        {
                            category.link_id = category.id;
                            category.id = category.linkId;
                            var item = appBuilder.sysadmin.apptaxonomy.createItemNode(category);
                          
                            item.link_id = category.link_id;
                            item.appTaxonomyId = category.appTaxonomyId;
                            dtnode.addChild(item);
                        }
                    }
                    
                    if(typeof callback == "function")
                      callback();
                }
            });                
    },
    serialize:function(taxonomyNode){
        var chld = [];
        if(taxonomyNode.hasChildren()){
        var children = taxonomyNode.getChildren();
        for(var i=0;i<children.length;i++){
            var iNode = children[i];
            if(iNode.data.type != 'apptaxonomy-category'){
                var node = {"id":iNode.data.key,"appTaxonomyId":taxonomyNode.data.appTaxonomyId,"type":iNode.data.type,"title":iNode.data.title,"children":[]};  
                //if(typeof taxonomyNode.data.taxonomyLink != "undefined")
                //    node.taxonomyLink = taxonomyNode.data.taxonomyLink;                        
                chld.push(node);
            }
        }
        }return chld;
    },
    unlinkItem:function(dtnode){
        appBuilder.sysadmin.apptaxonomy.del(dtnode.data.appTaxonomyId,dtnode.data.link_id);
        dtnode.remove();
    },
    updateRoot:function(apptaxonomy_id,old_apptaxonomy_id){
        
        $.blockUI();
        $.ajax({
                type:'POST',
                data:appTaxonomy,
                url:"/api/app-taxonomy/update-apptaxonomy-position.stm",
                success:function(data){
                    $('#work-treecontrol').dynatree('getTree').getNodeByKey(id);
                    $.unblockUI();
                }
        });        
    },
    updateNodePosition:function(apptaxonomy_id,id,parent_id,pre_sibling,new_apptaxonomy_id,callback){
        var parentNode = $('#work-treecontrol').dynatree('getTree').getNodeByKey(parent_id);
        
        var newAppTaxonomyId = '0';
      
        if(parentNode == null && typeof new_apptaxonomy_id != "undefined" && typeof new_apptaxonomy_id != "function"){
        	newAppTaxonomyId = new_apptaxonomy_id;
        }
      	else
        {
          newAppTaxonomyId = parentNode.data.appTaxonomyId?parentNode.data.appTaxonomyId:'0';
        }
      
        var appTaxonomy = 
        {
            "id":id,
            "old_apptaxonomy_id":apptaxonomy_id,
            "apptaxonomy_id":newAppTaxonomyId,
            "parent_id":parent_id,
            "presibling_id":pre_sibling
        };

        if(appTaxonomy.apptaxonomy_id == '0')
            appTaxonomy.apptaxonomy_id = this.nodeId(parentNode);

        
        $.blockUI();
        $.ajax({
                type:'POST',
                data:appTaxonomy,
                url:"/api/app-taxonomy/update-apptaxonomy-position.stm",
                success:function(data){
                    $.unblockUI();
                    if(typeof new_apptaxonomy_id == "function")
                      new_apptaxonomy_id();
                    else
                    if(typeof callback == "function")
                      callback();
                }
        });
    },
    serializeNodeIDs:function(node,ids){
        if(node.hasChildren()){
            var childNodes = node.getChildren();
            for(var i=childNodes.length-1;i>=0;i--){
                var moveNode = childNodes[i];                                            
                this.serializeNodeIDs(moveNode,ids);

                //if(moveNode.data.type == 'apptaxonomy-category')
                ids.push(moveNode.data.link_id?moveNode.data.link_id:moveNode.data.key);
            }
        }
        ids.push(node.data.key);
    },
    moveNodes:function(apptaxonomy_id,node, sourceNode, hitMode,shallowMove){
        var _this = this;
        var targetNode = node;
        var childNodes = sourceNode.getChildren().slice(0);


        if(hitMode == 'before'){
            for(var i=childNodes.length-1;i>=0;i--){
                var moveNode = childNodes[i];                                            
                _this.moveNode(apptaxonomy_id, targetNode, moveNode, hitMode,shallowMove);
                targetNode = moveNode;
            }
        }
        else
        if(hitMode == 'over'){

            for(i=0;i<childNodes.length;i++){
                moveNode = childNodes[i];                                            
                _this.moveNode(apptaxonomy_id, targetNode, moveNode, hitMode,shallowMove);                                                
            }                    
        }
        else
        if(hitMode == 'after'){
            for(i=0;i<childNodes.length;i++){
                moveNode = childNodes[i];                                            
                _this.moveNode(apptaxonomy_id, targetNode, moveNode, hitMode,shallowMove);
                targetNode = moveNode;
            }
        }                
    },
    nodeId:function(dtnode){
        if(dtnode.data.type == 'appresource-dir' || dtnode.data.type == 'apptaxonomy-category' || dtnode.data.type == 'apptaxonomy-root')
            return dtnode.data.key;
        else
            return dtnode.data.link_id;
    },
    isCategoryLink:function(dtnode){
        if(dtnode.data.type == 'apptaxonomy-category'){
            return (typeof dtnode.data.link_id != "undefined" && 
                dtnode.data.link_id != null && 
                dtnode.data.link_id != '-1');
        }return false;
    },
    moveNode:function(apptaxonomy_id,node, sourceNode, hitMode,shallowMove){
        var _this = this;
        var nodeAfter      = sourceNode.getNextSibling();
        var nodeBefore     = sourceNode.getPrevSibling();

        //update source presibling node
        if(typeof shallowMove == "undefined" || !shallowMove){
          if(nodeAfter != null)
              _this.updateNodePosition(apptaxonomy_id,_this.nodeId(nodeAfter),_this.nodeId(nodeAfter.parent),nodeBefore != null?_this.nodeId(nodeBefore):'0');
        }

        if(hitMode == 'before'){
            nodeBefore = node.getPrevSibling();
          
            if(typeof shallowMove == "undefined" || !shallowMove){
              //update source node
              if(nodeBefore != null)
                  _this.updateNodePosition(apptaxonomy_id,_this.nodeId(sourceNode),_this.nodeId(nodeBefore.parent),_this.nodeId(nodeBefore));
              else
                  _this.updateNodePosition(apptaxonomy_id,_this.nodeId(sourceNode),_this.nodeId(node.parent),'0');
  
              //update target node
              _this.updateNodePosition(apptaxonomy_id,_this.nodeId(node),_this.nodeId(node.parent),_this.nodeId(sourceNode));
            }
        }
        else
        if(hitMode == 'over'){
           
            if(typeof shallowMove == "undefined" || !shallowMove){
              //update source node
              if(node.hasChildren()){
                  var lastNode = node.getChildren()[node.getChildren().length-1];
                  _this.updateNodePosition(apptaxonomy_id,_this.nodeId(sourceNode),_this.nodeId(node),_this.nodeId(lastNode));               
              }else{
                  _this.updateNodePosition(apptaxonomy_id,_this.nodeId(sourceNode),_this.nodeId(node),'0');
              }
            }
        }
        else
        if(hitMode == 'after'){
            nodeAfter  = node.getNextSibling();
          
            if(typeof shallowMove == "undefined" || !shallowMove){
              if(nodeAfter != null)//update presibling of succeeding node
                  _this.updateNodePosition(apptaxonomy_id,_this.nodeId(nodeAfter),_this.nodeId(nodeAfter.parent),_this.nodeId(sourceNode));
  
              //update source node
              _this.updateNodePosition(apptaxonomy_id,_this.nodeId(sourceNode),_this.nodeId(node.parent),_this.nodeId(node));
            }
        }
        
        sourceNode.move(node, hitMode);
        if(hitMode == 'over'){
            var appTaxonomyId = node.data.appTaxonomyId;
            if(appTaxonomyId == '0')
                appTaxonomyId = _this.nodeId(node);
            
            sourceNode.visit(function(dtnode){
                dtnode.data.appTaxonomyId = appTaxonomyId;
            },true);
        }
    },
    getDnd:function(){
        var _this = appBuilder.sysadmin.apptaxonomy;
        return {
                onDragStart: function(node) {
                    if(node.data.type == 'apptaxonomy-category' ||
                        node.data.type == 'datastatement' || 
                        node.data.type == 'fileuploader' || 
                        node.data.type == 'emailsender' || 
                        node.data.type == 'connector' || 
                        node.data.type == 'instantiator' || 
                        node.data.type == 'scriptexecutor'){
                        $('.dynatree-drag-helper').css({"z-index":10000});
                        return true;
                    }
                    else
                        return false;

                    return true;
                },
                onDragStop: function(node) {
                },
                autoExpandMS: 1000,
                preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                onDragEnter: function(node, sourceNode) {

                    if(node.data.type == 'apptaxonomy-category'){

                        /*if(sourceNode.data.type == 'apptaxonomy-category'){
                            return ["over","before","after"];
                        }
                        else
                        if( 
                            sourceNode.data.type == 'datastatement' ||
                            sourceNode.data.type == 'fileuploader' ||
                            sourceNode.data.type == 'emailsender' ||
                            sourceNode.data.type == 'connector' ||
                            sourceNode.data.type == 'instantiator' ||
                            sourceNode.data.type == 'scriptexecutor')
                        {                                      
                            return ["over"];
                        }*/return ["over","before","after"];
                    }else
                    if( 
                        sourceNode.data.type == 'datastatement' ||
                        sourceNode.data.type == 'fileuploader' ||
                        sourceNode.data.type == 'emailsender' ||
                        sourceNode.data.type == 'connector' ||
                        sourceNode.data.type == 'instantiator' ||
                        sourceNode.data.type == 'scriptexecutor')
                    {
                        return ["before","after"];
                    }
                    return false;
                },
                onDragOver: function(node, sourceNode, hitMode) {
                },
                onDrop: function(node, sourceNode, hitMode, ui, draggable) {

                    
                    if(sourceNode.hasChildren() && !_this.isLink(sourceNode)){
                        //prompt user to select whether children only should be moved or whole node
                        _this.showNodeActionDialog(
                        function(){
                            _this.moveNodes(sourceNode.data.appTaxonomyId, node, sourceNode, hitMode);
                        },
                        function(){
                            _this.moveNode(sourceNode.data.appTaxonomyId, node, sourceNode, hitMode);
                        },'Move Only Children?');
                    }
                    else
                    if(sourceNode.data.type != 'apptaxonomy-category' && 
                        !_this.isLink(sourceNode)){
                        
                        var parentNode = node;
                        if(hitMode == 'before' || hitMode == 'after')
                            parentNode = node.parent;
                        
                        _this.newItem(sourceNode.data.title, sourceNode.data.id, (sourceNode.data.type), parentNode);
                    }
                    else{
                        _this.moveNode(sourceNode.data.appTaxonomyId, node, sourceNode, hitMode);
                    }
                },
                onDragLeave: function(node, sourceNode) {
                }
        };
    },
    nodeActionHandler:{},
    showNodeActionDialog:function(ok,cancel,text){
        this.nodeActionHandler.ok     = ok;
        this.nodeActionHandler.cancel = cancel;
        $('#apptaxonomy-node-action-confirmation-dialog-span').html(text);
        $('#apptaxonomy-node-action-confirmation-dialog').dialog("open");  
    },
    createSecurityTable:function(mainScope,options){
      var _this = this;
      this.src_component = mainScope.src_component;
      var src_component = mainScope.src_component;  
      
            
      var block = {
        get:function(mainScope){
          return {url:'x',
                  datatype: "local",
                  postData:{},
                  colNames:['Role','User','Read','Write','Delete','Execute', ''],
                  colModel:
                  [
                    {name:'role',index:'role', align:"center",sortable:false},
                    {name:'user',index:'user', align:'center',sortable:false},
                    {name:'read',index:'read', align:'center',hidden: (typeof options != "undefined" && options.read?false:true),sortable:false},
                    {name:'write',index:'write', align:'center',hidden:(typeof options != "undefined" && options.write?false:true),sortable:false},
                    {name:'delete',index:'delete', align:'center',hidden:true,sortable:false},
                    {name:'execute',index:'execute', align:'center',hidden:true,sortable:false},
                    {name:'actions',index:'actions', align:'center',width:'64',sortable:false}
                  ],
                  loadComplete:function(){
                    
                    var loadAccessControls = function(mainScope,accessControls){                                            
                      for(var i=0;i<accessControls.length;i++){
                        var access_control = accessControls[i];
                        var keyPart2 = mainScope.keyPart+'-'+access_control.id
                        _this.insertAccessControl({access_control:keyPart2,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component,access_control:access_control});                                                    
                      }
                      
                      //add default row for add new accesscontrol
                      _this.insertAccessControl({access_control:mainScope.keyPart,table:mainScope.keyPart},{before:false,insert:true,src_component:src_component});                                            
                    }
                    
                    var data ={"definition_id":mainScope.definitionId};
                    data[mainScope.definitionIdParameter] = mainScope.definitionId;                                        
                    $.ajax({
                      data:data,
                      type:'POST',
                      url:"/api/app-taxonomy/get-apptaxonomy-accesscontrols.stm",
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
                  width:(typeof options != "undefined" && typeof options.width != "undefined"?options.width:512),
                  "height":"auto",
                  sortorder: "desc"/*,
                                      caption:"Security"*/};
                      }
                  };              
                $("#"+src_component+"-security-table-"+mainScope.keyPart).jqGrid(block.get(mainScope));                
      },            
      insertAccessControl:function(keyPart,options){
        var _this = this;
        var src_component = this.src_component;   
        if(options.insert){
          var actions = "";
          if(typeof options.access_control == "undefined"){
            var da = "<button title=\"Add\" onclick=\"appBuilder.sysadmin.apptaxonomy.addAccessControl('"+keyPart.table+"','"+src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
            actions = da;
          }else{
            var de = "<button title=\"Delete\" onclick=\"appBuilder.sysadmin.apptaxonomy.deleteAccessControl('"+options.access_control.definitionId+"','"+options.access_control.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
            var ds = "<button title=\"Update\" onclick=\"appBuilder.sysadmin.apptaxonomy.updateAccessControl('"+options.access_control.definitionId+"','"+options.access_control.id+"','"+options.src_component+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
            actions = ds+' '+de;
          }
          
          
          var row = 
              {
                "actions":"<div style=\"padding:2px\">"+actions+"</div>",
                "role":"<input type=\"text\"  id=\""+src_component+"-accesscontrol-role-"+keyPart.access_control+"\">",
                "user":"<input type=\"text\" id=\""+src_component+"-accesscontrol-user-"+keyPart.access_control+"\"/>",
                "read":"<input type=\"checkbox\" id=\""+src_component+"-accesscontrol-read-"+keyPart.access_control+"\"/>",
                "write":"<input type=\"checkbox\" id=\""+src_component+"-accesscontrol-write-"+keyPart.access_control+"\"/>",
                "delete":"<input type=\"checkbox\" id=\""+src_component+"-accesscontrol-delete-"+keyPart.access_control+"\"/>",
                "execute":"<input type=\"checkbox\" id=\""+src_component+"-accesscontrol-execute-"+keyPart.access_control+"\"/>"
              };                      
          
          if(options.before)
            $("#"+src_component+"-security-table-"+keyPart.table).addRowData(options.access_control.id,row,"before",0); 
          else
            $("#"+src_component+"-security-table-"+keyPart.table).addRowData(typeof options.access_control != "undefined"?options.access_control.id:0,row); 
        }
        
               
        
        $("#"+src_component+"-accesscontrol-role-"+keyPart.access_control).val(typeof options.access_control != "undefined"?options.access_control.roleId:"");
        $("#"+src_component+"-accesscontrol-user-"+keyPart.access_control).val(typeof options.access_control != "undefined"?options.access_control.userId:"");
        
        appBuilder.setCheckStatus($("#"+src_component+"-accesscontrol-read-"+keyPart.access_control),typeof options.access_control != "undefined"?options.access_control.readAccess:"no");
        appBuilder.setCheckStatus($("#"+src_component+"-accesscontrol-write-"+keyPart.access_control),typeof options.access_control != "undefined"?options.access_control.writeAccess:"no");
        appBuilder.setCheckStatus($("#"+src_component+"-accesscontrol-delete-"+keyPart.access_control),typeof options.access_control != "undefined"?options.access_control.deleteAccess:"no");
        appBuilder.setCheckStatus($("#"+src_component+"-accesscontrol-execute-"+keyPart.access_control),typeof options.access_control != "undefined"?options.access_control.executeAccess:"no");
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
          url:"/api/app-taxonomy/delete-apptaxonomy-accesscontrol.stm",
          success:function(data){
            $.unblockUI();
            $("#"+src_component+"-security-table-"+keyPart).delRowData(id);                        
          }
        });                    
      },
      addAccessControl:function(definition_id,src_component){
        
        var _this = this;
        this.src_component = src_component;
        var keyPart = definition_id;
        
        var role_id  = $("#"+src_component+"-accesscontrol-role-"+keyPart).val();
        var user     = $("#"+src_component+"-accesscontrol-user-"+keyPart).val();
        
        
        /*--if((role_id=='' || role_id=='0') && user == ''){
                         alert("Please select a role or username");
                         return;
                     }*/
                  
                  var read_access     = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-read-"+keyPart));
                  var write_access    = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-write-"+keyPart));                 
                  var delete_access   = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-delete-"+keyPart));
                  var execute_access  = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-execute-"+keyPart));
                  
                  var access_control = 
                      {
                        "definition_id":definition_id,
                        "roleId":role_id,
                        "userId":user,
                        "readAccess":read_access,
                        "writeAccess":write_access,
                        "deleteAccess":delete_access,
                        "executeAccess":execute_access
                      };
                  
                  $.blockUI();
                  $.ajax({
                    type:'POST',
                    data:access_control,
                    url:"/api/app-taxonomy/add-apptaxonomy-accesscontrol.stm",
                    success:function(data){ 
                      $.unblockUI();
                      
                      /*--
                            var reply = eval('('+data+')');
                            if(reply.status != 'success'){
                                alert("An error occured adding access control.");
                                return;
                            }*/
                          
                          //var access_control = reply.accessControl;
                          
                          access_control.id = appBuilder.common_core.stripNewLine(data);
                          
                          var keyPart2 = keyPart+'-'+access_control.id;
                          _this.insertAccessControl({table:keyPart,access_control:keyPart2},{"before":true,"insert":true,src_component:src_component,access_control:access_control});
                          
                          //reset default
                          _this.insertAccessControl({table:keyPart,access_control:keyPart},{"insert":false,src_component:src_component});
                        }
                     });                
      },
      updateAccessControl:function(definition_id,id,src_component){
        var keyPart = definition_id+'-'+id;
        var _this = this;
        //alert("#"+src_component+"-accesscontrol-role-"+keyPart)
        var role_id = $("#"+src_component+"-accesscontrol-role-"+keyPart).val();
        var user    = $("#"+src_component+"-accesscontrol-user-"+keyPart).val();   
        
        /*--if(role_id=='' && user == ''){
                         alert("Please select a role or username");
                         return;
                     }   */              
                  
                  var read_access     = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-read-"+keyPart));
                  var write_access    = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-write-"+keyPart));                 
                  var delete_access   = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-delete-"+keyPart));
                  var execute_access  = appBuilder.getCheckStatus($("#"+src_component+"-accesscontrol-execute-"+keyPart));
                  
                  var access_control = 
                      {
                        "definition_id":definition_id,
                        "id":id,
                        "roleId":role_id,
                        "userId":user,
                        "readAccess":read_access,
                        "writeAccess":write_access,
                        "deleteAccess":delete_access,
                        "executeAccess":execute_access
                      };                                  
                  $.blockUI();
                  $.ajax({
                    type:'POST',
                    data:access_control,
                    url:"/api/app-taxonomy/update-apptaxonomy-accesscontrol.stm",
                    success:function(data){                      
                      $.unblockUI();
                    }
                  });                
        }
}
