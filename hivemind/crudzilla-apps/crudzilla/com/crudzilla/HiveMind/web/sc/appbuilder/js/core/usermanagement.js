/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
appBuilder.usermanagement = {
  getNonNullVal:function(val){
    if(typeof val == 'undefined' || val == null)return '';
    return val;
  },            
  init:function(){
    
  },    
  open:function(){
    appBuilder.queuedAction.push('usermanagement');
    appBuilder.createTab('usermanagement','<img src="img/silk/user_edit.png" style="width:12px;height:12px;vertical-align:top"/> <span style="font-weight:bold;color:#729fcf">Manage Users</span>'); 
    
  },
  createTabView:function(ui,event){
    
    var _this = this;
    ui.panel.tabid = 'usermanagement'; 
    
    var mainScope = {
      ui:ui
    };            
    
    $.ajax({
      type:'POST',
      url:"/user-identity/get-roles.stm",
      success:function(data){       
        mainScope.userRoles = eval('('+data+')');
        
        var block = {
          run:function(mainScope){
            
            $.ajax({
              type:'POST',
              url:'sc/appbuilder/ui-templates/usermanagement-tab-view.html',
              success:function(data){
                ui.panel.panel = $("<div id=\""+ui.panel.tabid+"-content\"></div>");//.appendTo("#usermanagement-tab");
                $("#usermanagement-tab").append(ui.panel.panel);
                
                $(ui.panel.panel).html(appBuilder.parseTemplate(data,{id:mainScope.keyPart}));
                $(ui.panel.panel).css({"min-height":$(ui.panel.panel).parent().parent().height(),"background-color":"white"});
                
                $('#usermanagement-tabs').tabs();
                $('#usermanagement-tabs').removeClass("ui-corner-all").find("ul").removeClass("ui-corner-all");
                
                $('#tabs').tabs('option','active',mainScope.ui.index);
                _this.createSecurityRoleTable(mainScope,$(ui.panel.panel).parent().parent().width());
                
                
                $.ajax({
                  type:'POST',
                  data:{
                  },
                  url:"/user-identity/list-users.ste",
                  success:function(data){       
                    mainScope.users = eval('('+data+')');
                    _this.createUserTable(mainScope,$(ui.panel.panel).parent().parent().width());
                  }
                });
              }
            });                               
          }
        };                      
        block.run(mainScope);
      }
    });
  },    
  createSecurityRoleTable:function(mainScope,width){
    var _this = this;          
    var block = {
      get:function(mainScope){
        return {url:'x',
                datatype: "local",
                postData:{},
                colNames:['Alias', 'Role','Description',''],
                colModel:
                [
                  {name:'alias',index:'alias', align:"center",width:"128",sortable:false},
                  {name:'role',index:'role', align:"center",width:"128",sortable:false},
                  {name:'description',index:'description',width:"128", align:'center',sortable:false},
                  {name:'actions',index:'actions', align:'center',width:'64',sortable:false}
                ],
                loadComplete:function(){
                  
                  var loadAccessControls = function(mainScope,accessControlRoles){                                            
                    for(var i=0;i<accessControlRoles.length;i++){
                      var access_control_role = accessControlRoles[i];                                                
                      appBuilder.usermanagement.insertAccessControlRole({access_control_role:access_control_role.ID},{before:false,insert:true,access_control_role:access_control_role});                                                    
                    }
                    
                    //add default row for add new accesscontrol
                    appBuilder.usermanagement.insertAccessControlRole({access_control_role:"0"},{before:false,insert:true});                                            
                  }
                  
                  loadAccessControls(mainScope,mainScope.userRoles);                                           
                },
                rowNum:-1,
                rowList:[],                                        
                viewrecords: true,
                //autowidth: false,
                width:width*0.95,
                "height":"auto",
                sortorder: "desc"/*,
                                    caption:"Security"*/};
      }
    };    
    
    $("#usermanagement-role-security-table").jqGrid(block.get(mainScope));                
  },    
  insertAccessControlRole:function(keyPart,options){
    var _this = this;
    
    if(options.insert)
    {
      var actions = "";
      if(typeof options.access_control_role == "undefined"){
        var da = "<button title=\"Add\" onclick=\"appBuilder.usermanagement.addAccessControlRole()\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
        actions = da;
      }else{
        var de = "<button title=\"Delete\" onclick=\"appBuilder.usermanagement.deleteAccessControlRole('"+options.access_control_role.ID+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
        var ds = "<button title=\"Update\" onclick=\"appBuilder.usermanagement.updateAccessControlRole('"+options.access_control_role.ID+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
        actions = ds+' '+de;
      }
      
      
      var row = 
          {
            "actions":"<div style=\"padding:4px\">"+actions+"</div>",         
            "alias":"<input type=\"text\" id=\"accesscontrol-role-alias-"+keyPart.access_control_role+"\"/>",
            "role":"<input type=\"text\" id=\"accesscontrol-role-"+keyPart.access_control_role+"\"/><input type=\"hidden\" id=\"accesscontrol-role-id-"+keyPart.access_control_role+"\"/>",
            "description":"<input type=\"text\" id=\"accesscontrol-role-description-"+keyPart.access_control_role+"\"/>"                    
          };                      
      
      if(options.before)
        $("#usermanagement-role-security-table").addRowData(options.access_control_role.ID,row,"before",'0'); 
      else
        $("#usermanagement-role-security-table").addRowData(typeof options.access_control_role != "undefined"?options.access_control_role.ID:'0',row); 
    }
    
    $("#accesscontrol-role-id-"+keyPart.access_control_role).val(typeof options.access_control_role != "undefined"?options.access_control_role.ID:"0");
    $("#accesscontrol-role-alias-"+keyPart.access_control_role).val(typeof options.access_control_role != "undefined"?options.access_control_role.ALIAS:"");
    $("#accesscontrol-role-"+keyPart.access_control_role).val(typeof options.access_control_role != "undefined"?options.access_control_role.ROLE:"");
    $("#accesscontrol-role-description-"+keyPart.access_control_role).val(typeof options.access_control_role != "undefined"?options.access_control_role.DESCRIPTION:"");
  },
  deleteAccessControlRole:function(id){
    if(!confirm("Are you sure you want to delete this role?"))return;
    
    $.blockUI();
    
    
    $.ajax({
      type:'POST',
      data:{                        
        "id":id
      },
      url:"/user-identity/delete-role.stm",
      success:function(data){                        
        $.unblockUI();
        $("#usermanagement-role-security-table").delRowData(id);                        
      }
    });                    
  },
  addAccessControlRole:function(){
    
    var _this = this;
    
    
    var role         = $("#accesscontrol-role-0").val();
    var alias        = $("#accesscontrol-role-alias-0").val();
    var description  = $("#accesscontrol-role-description-0").val();
    
    
    if(role ==''){
      alert("Please provide role");
      return;
    }
    
    var access_control_role = 
        {
          "role":role,
          "alias":alias,
          "description":description
        };
    
    $.blockUI();
    $.ajax({
      type:'POST',
      data:access_control_role,
      url:"/user-identity/add-role.ste",
      success:function(data){          
        $.unblockUI();
        
        access_control_role.ID = (""+data).trim();
        access_control_role.ALIAS = access_control_role.alias;
        access_control_role.ROLE = access_control_role.role;
        access_control_role.DESCRIPTION = access_control_role.description;

        
        _this.insertAccessControlRole({access_control_role:access_control_role.ID},{"before":true,"insert":true,access_control_role:access_control_role});
        
        //reset default
        _this.insertAccessControlRole({access_control_role:'0'},{"insert":false});
      }
    });                
  },
  updateAccessControlRole:function(id){
    var role         = $("#accesscontrol-role-"+id).val();
    var description  = $("#accesscontrol-role-description-"+id).val();
    var alias        = $("#accesscontrol-role-alias-"+id).val();
    
    if(role ==''){
      alert("Please provide role");
      return;
    }
    
    var access_control_role = 
        {
          "role_id":id,
          "role":role,
          "alias":alias,
          "description":description
        };
    
    $.blockUI();
    $.ajax({
      type:'POST',
      data:access_control_role,
      url:"/user-identity/update-role.stm",
      success:function(data){
        $.unblockUI();
      }
    });                
  },    
  createUserTable:function(mainScope,width){
    var _this = this;          
    var block = {
      get:function(mainScope){
        return {url:'x',
                datatype: "local",
                postData:{},
                colNames:['Name', 'Role','Login','Password','Part Store Access',''],
                colModel:
                [
                  {name:'name',index:'name', align:"center",width:"256",sortable:false},
                  {name:'role',index:'role', align:"center",width:"256",sortable:false},
                  {name:'login',index:'login',width:"256", align:'center',sortable:false},
                  {name:'new_password',index:'new_password',width:"256", align:'center',sortable:false},
                  {name:'part_store_access_token',index:'part_store_access_token',width:"256", align:'center',sortable:false},
                  {name:'actions',index:'actions', align:'center',width:'128',sortable:false}
                ],
                loadComplete:function(){
                  
                  var loadUsers = function(mainScope,users){                                            
                    for(var i=0;i<users.length;i++){
                      var user = users[i];                                                
                      appBuilder.usermanagement.insertUser({user:user.ID},{before:false,insert:true,user:user});                                                    
                    }
                    
                    //add default row for add new accesscontrol
                    appBuilder.usermanagement.insertUser({user:"0"},{before:false,insert:true});                                            
                  }
                  
                  loadUsers(mainScope,mainScope.users);                                           
                },
                rowNum:-1,
                rowList:[],                                        
                viewrecords: true,
                //autowidth: true,
                shrinkToFit:true,
                width:width*0.95,
                "height":"auto",
                sortorder: "desc"/*,
                                    caption:"Security"*/};
      }
    };    
    
    $("#usermanagement-user-security-table").jqGrid(block.get(mainScope));                
  },    
  getUserRoles:function(roles){
    if(typeof roles == "string") return roles;
    
    var roleNames = [];
    for(var i=0;i<roles.length;i++)
      roleNames.push(roles[i].ROLE);
    return roleNames.join(',');
  },
  insertUser:function(keyPart,options){
    var _this = this;
    
    if(options.insert)
    {
      var actions = "";
      if(typeof options.user == "undefined"){
        var da = "<button title=\"Add\" onclick=\"appBuilder.usermanagement.addUser()\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-plus\"></span><span class=\"ui-button-text\" style=\"\">Add</span></button>";
        actions = da;
      }else{
        var de = "<button title=\"Delete\" onclick=\"appBuilder.usermanagement.deleteUser('"+options.user.ID+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-close\"></span><span class=\"ui-button-text\" style=\"\">Delete</span></button>";
        var ds = "<button title=\"Update\" onclick=\"appBuilder.usermanagement.updateUser('"+options.user.ID+"')\" role=\"button\" aria-disabled=\"false\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only\"><span class=\"ui-button-icon-primary ui-icon ui-icon-disk\"></span><span class=\"ui-button-text\" style=\"\">Update</span></button>";
        actions = ds+' '+de;
      }
      
      
      var row = 
          {
            "actions":"<div style=\"padding:4px\">"+actions+"</div>",         
            "name":"<input type=\"text\" id=\"accesscontrol-user-name-"+keyPart.user+"\"/><input type=\"hidden\" id=\"accesscontrol-user-id-"+keyPart.user+"\"/>",
            "role":"<input type=\"text\" id=\"accesscontrol-user-role-"+keyPart.user+"\"/>",
            "login":"<input type=\"text\" id=\"accesscontrol-user-login-"+keyPart.user+"\"/>",
            "new_password":"<input type=\"password\" id=\"accesscontrol-user-new_password-"+keyPart.user+"\"/>",
            "part_store_access_token":"<input type=\"text\" id=\"accesscontrol-user-part_store_access_token-"+keyPart.user+"\"/>"
          };                      
      
      if(options.before)
        $("#usermanagement-user-security-table").addRowData(options.user.ID,row,"before",'0'); 
      else
        $("#usermanagement-user-security-table").addRowData(typeof options.user != "undefined"?options.user.ID:'0',row); 
    }
    
    $("#accesscontrol-user-id-"+keyPart.user).val(typeof options.user != "undefined"?options.user.ID:"0");
    $("#accesscontrol-user-name-"+keyPart.user).val(typeof options.user != "undefined"?options.user.NAME:"");
    $("#accesscontrol-user-role-"+keyPart.user).val(typeof options.user != "undefined"?_this.getUserRoles(options.user.roles):"");
    $("#accesscontrol-user-login-"+keyPart.user).val(typeof options.user != "undefined"?options.user.USER_NAME:"");
    $("#accesscontrol-user-new_password-"+keyPart.user).val(typeof options.user != "undefined"?options.user.PASS_WORD:"");
    $("#accesscontrol-user-part_store_access_token-"+keyPart.user).val(typeof options.user != "undefined"?options.user.PART_STORE_ACCESS_TOKEN:"");
  },
  deleteUser:function(id){
    if(!confirm("Are you sure you want to delete this user?"))return;
    
    $.blockUI();
    
    
    $.ajax({
      type:'POST',
      data:{                        
        "user_id":id
      },
      url:"/user-identity/delete-user.ste",
      success:function(data){                        
        $.unblockUI();
        $("#usermanagement-user-security-table").delRowData(id);                        
      }
    });                    
  },
  addUser:function(){
    
    var _this = this;
    
    
    var role         = $("#accesscontrol-user-role-0").val();
    var name        = $("#accesscontrol-user-name-0").val();
    var login  = $("#accesscontrol-user-login-0").val();
    var password  = $("#accesscontrol-user-new_password-0").val();
    var part_store_access_token  = $("#accesscontrol-user-part_store_access_token-0").val();
    
    if(role =='' || name == '' || password == ''){
      alert("Please provide required field");
      return;
    }
    
    var user = 
        {
          "roles":role,
          "name":name,
          "user_name":login,
          "pass_word":password,
          "part_store_access_token":part_store_access_token
        };
    
    $.blockUI();
    $.ajax({
      type:'POST',
      data:user,
      url:"/user-identity/add-user.ste",
      success:function(data){          
        $.unblockUI();
        
        user.ID = (""+data).trim();
        user.role = user.roles;
        user.NAME = user.name;
        user.PASS_WORD = user.pass_word;
        user.PART_STORE_ACCESS_TOKEN = user.part_store_access_token;
        
        _this.insertUser({user:user.ID},{"before":true,"insert":true,user:user});
        
        //reset default
        _this.insertUser({user:'0'},{"insert":false});
      }
    });                
  },
  updateUser:function(id){
    var role         = $("#accesscontrol-user-role-"+id).val();
    var name        = $("#accesscontrol-user-name-"+id).val();
    var login  = $("#accesscontrol-user-login-"+id).val();
    var password  = $("#accesscontrol-user-new_password-"+id).val();
    var part_store_access_token  = $("#accesscontrol-user-part_store_access_token-"+id).val();
    
    if(role =='' || name == ''){
      alert("Please provide required field");
      return;
    }
    
    var user = 
        {
          "user_id":id,
          "roles":role,
          "name":name,
          "user_name":login,
          "pass_word":password,
          "part_store_access_token":part_store_access_token
        };
    
    $.blockUI();
    $.ajax({
      type:'POST',
      data:user,
      url:"/user-identity/update-user.ste",
      success:function(data){
        $.unblockUI();
      }
    });                
  }
}

