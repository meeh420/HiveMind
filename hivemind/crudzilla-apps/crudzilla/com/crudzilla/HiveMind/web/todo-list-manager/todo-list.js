appBuilder.todoList = {
  init:function(){
     var groupMarginRight = 8;
     var loadProject;
     var makeHeaderEditor;
     var makeCardEditor;
     var makeCardPanel;
     var loadProjects;
     var loadGroups;
     var loadCards;
     var addGroupPanel;
     var addCardPanel;
     var resizeProjectView;
     var resizeProjectViewHeight;
     

     $('#project-control-panel').addClass('todo-list');
     makeCardEditor=function(card,callback){
      var editor = $('#card-panel-'+card.id+' div.crudzilla-editable').tinymce({
        // Location of TinyMCE script
        script_url : '/todo-list-manager/tinymce_4.0.2_jquery/tinymce/js/tinymce/tinymce.min.js',
        
        // General options
        theme : "modern",
        plugins : 
        [
          "pagebreak layer table save insertdatetime preview media",
          "searchreplace print contextmenu paste directionality fullscreen",
          "noneditable visualchars nonbreaking template anchor charmap hr",
          "image link emoticons code textcolor"
        ],
        entity_encoding : "raw",
	    extended_valid_elements : "a[class|name|href|target|title|onclick|rel|style],script[type|src],iframe[src|style|width|height|scrolling|marginwidth|marginheight|frameborder|id],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]"
        ,
        menubar:false,
    	toolbar1: "insertfile undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
    	toolbar2: "forecolor backcolor emoticons | link image media | styleselect table | code",
        inline:true,
        schema: "html5",
        setup:function(ed){
            if(typeof callback == "function")
              callback(editor,ed);
            
            ed.on("change submit",function(){
              $.ajax({
                type:'POST',
                data:
                {
                  "content":ed.getContent(),
                  "id":card.id                                  
                },
                url:"/todo-list-manager/project/group/card/update-card-content.stm",
                success:function(data){
                  
                }});
            });
        }
      });
       
       return editor;
     }
     
     makeCardPanel=function(card){

       
       $('#card-panel-'+card.id+' div').css({"background":"none"});
      
       
       
      $('#delete-group-card-button-'+card.id).css({"float":"right","width":"16px","height":"16px"}).button({
        text: false,
        icons: {
          primary: "ui-icon-close"
        }
      }).click(function(event){
        if(!confirm("Are you sure you want to delete card?"))return;
        
        $.ajax({
          type:'POST',
          data:
          {
            "id":card.id
          },
          url:"/todo-list-manager/project/group/card/delete-card.stm",
          success:function(data){
            $.unblockUI();
            $("#card-panel-"+card.id).remove();                       
          }});                    
      });
       

      var editor = null;
      $('#update-group-card-button-'+card.id)
      .css({"float":"right","width":"16px","height":"16px"})
      .button({
        text: false,
        icons: {
          primary: "ui-icon-pencil"
        }
      }).click(function(event){
        	
          if(editor == null){
              //$("span", this).text("View");
              $(this).attr("title","View").tooltip({"content":"View"});
              $(this).button("option", {                
                icons: { primary: "ui-icon-pin-s" }
              });        
              editor = makeCardEditor(card,function(editor,ed){
          
              });        
          }else{              
              //$("span", this).text("Edit");
              //$(this).attr("title","Edit");
              $(this).attr("title","Edit").tooltip({"content":"Edit"});
              $(this).button("option", {
                icons: { primary: "ui-icon-pencil" }
              });             
              $(editor).tinymce().remove();
              editor = null;
          }
      }).tooltip({"content":"Edit"});       
       
       
       
      
       
      $("#group-card-bkgnd-color-button-"+card.id)
      .css({"float":"right","margin-right":"8px", "width":12,"height":12}).click(function(){
      	//$('#todo-card-colorpicker').simplecolorpicker("showPicker");
      }).attr("title","Background color");       
      
       if(card.backGroundColor != null){
         //alert(card.backGroundColor)
      	$("#group-card-bkgnd-color-button-"+card.id+" input").val(card.backGroundColor);
         //alert($("#group-card-bkgnd-color-button-"+card.id+" input").val())
       }
      else
        $("#group-card-bkgnd-color-button-"+card.id+" input").val("#ffffff");
       
       
      $('#card-panel-'+card.id)
       .css({"background-color":$("#group-card-bkgnd-color-button-"+card.id+" input").val()});
       
       
       
      $("#group-card-bkgnd-color-button-"+card.id+" input").colorPicker().change(
        function(){
          var color = $(this).val();
          $.ajax({
            type:'POST',
            data:
            {
              "id":card.id,
              "backGroundColor":color
            },
            url:"/todo-list-manager/project/group/card/update-background-color.stm",
            success:function(data){
              $.unblockUI();
              $('#card-panel-'+card.id).css({"background-color":color});
              
            }});           
        }      
      );
      $("#group-card-bkgnd-color-button-"+card.id+" .colorPicker-picker").css({"width":13.5,"height":13.5});
       
       
       
       
       
      $('#card-panel-'+card.id)
      .on("mouseover",function(){
        $('#delete-group-card-button-'+card.id+", #group-card-bkgnd-color-button-"+card.id+", #update-group-card-button-"+card.id).css({"visibility":"visible"});
      })
      .on("mouseout",function(){
        $('#delete-group-card-button-'+card.id+", #group-card-bkgnd-color-button-"+card.id+", #update-group-card-button-"+card.id).css({"visibility":"hidden"});
      })
    }    
     
     var init = false;
     loadProject=function(project){
           
       	  //if(typeof $("#crudzilla-active-project-label").data("editor") != "undefined")
          //  $("#crudzilla-active-project-label").data("editor").destroy();
       
       	   $('#crudzilla-active-project-label').unbind();
           $("#crudzilla-active-project-label").html(project.name);
          //load active project
           
       	   $('#add-card-project-group-button').css({"display":"inline"}).data("project_id",project.id);
           loadGroups({id:project.id});
       
       	   
       $("#crudzilla-active-project-label").addClass("card-project-title").css({"font-weight":"bold","font-size":"24px","overflow":"hidden","white-space":"nowrap","color":"#888a85"});
       
           function updateName(project_id){
                $.ajax({
                  type:'POST',
                  data:
                  {
                    "name":$("#crudzilla-active-project-label").html(),
                    "project_id":project_id                                  
                  },
                  url:"/todo-list-manager/project/rename-project.stm",
                  success:function(data){
                    
                  }});         
           }
       	
       	   
		   $('#crudzilla-active-project-label').bind("mousedown",function() {
        		$(this).attr('contentEditable', true);
    		}).blur(
        		function() {
            	$(this).attr('contentEditable', false);
                updateName(project.id);
            }).keypress(function(event){
             
           		if ( event.which == 13 )
                  event.preventDefault();
             
             	resizeProjectViewHeight();             
           }).keyup(function(event){
                resizeProjectViewHeight();
           });
          
       
           /*
           makeHeaderEditor("crudzilla-active-project-label",function(ed){
                $.ajax({
                  type:'POST',
                  data:
                  {
                    "name":ed.getContent(),
                    "project_id":project.id                                  
                  },
                  url:"todo-list-manager/project/rename-project.stm",
                  success:function(data){
                    
                  }});
           });*/
     }
     
     loadProjects=function(thisBtn){
       
          $.ajax({
            type:'POST',
            data:
            {},
            url:"/todo-list-manager/project/get-projects.stm",
            success:function(data){              
              $.unblockUI();
              var projects = eval('('+data+')');
              
              if(typeof thisBtn != "undefined"){
                  $('#crudzilla-card-project-menu').empty();
                  for(var i=0;i<projects.length;i++)
                    $('#crudzilla-card-project-menu').append("<li id=\""+projects[i].id+"\"><a onclick=\"return false\" href=\"\">"+projects[i].name+"</a></li>");
                  
                  $('#crudzilla-card-project-menu').menu("refresh");   
                  $('#crudzilla-card-project-menu').show().position({
                    my: "left top",
                    at: "left bottom",
                    of: thisBtn
                  });
              }
              else
              if(projects.length>0)
              {
                loadProject(projects[0]);
                $("#delete-project-button").css({"display":"inline"}).data("project_id",projects[0].id); 
              }              
           }});
     }
     
     loadGroups=function(project,callback){
       
          var _loadCards = function(group){
            setTimeout(function(){loadCards(group);},0);
          }
       
          $.ajax({
            type:'POST',
            data:
            {
              "project_id":project.id
            },
            url:"/todo-list-manager/project/group/get-groups.stm",
            success:function(data){
                $.unblockUI();
                
                $('#crudzilla-card-group-panel').empty();
                var groups = eval('('+data+')');              
                for(var i=0;i<groups.length;i++){
                  var group = groups[i];
                  addGroupPanel(group);
                  //get cards
                  
                  _loadCards(group);  
                }
             	if(typeof callback == "function")
               		callback();              
            }});        
     }
     
     loadCards=function(group,callback){
       $.ajax({
         type:'POST',
         data:
         {
           "group_id":group.id
         },
         url:"/todo-list-manager/project/group/card/get-cards.stm",
         success:function(data){
             $.unblockUI();
             
             var cards = eval('('+data+')');
             for(var i=0;i<cards.length;i++){
               var card = cards[i];             
               addCardPanel(card);             
             }
             if(typeof callback == "function")
               callback();
         }});
     }    
     
     resizeProjectView=function(seed){
       
       var currentWidth = seed;
       $('#crudzilla-card-group-panel .card-group-column').each(function(){
       		currentWidth += ($(this).width()+groupMarginRight)+32;
       });
       $('#crudzilla-card-group-panel').css({"width":(currentWidth)+"px"});
       resizeProjectViewHeight();
     }
     
     resizeProjectViewHeight=function(){
       var h = $('#crudzilla-card-project-panel').parent().parent().height()-$('#crudzilla-project-panel-header').height()-25;
       $('#crudzilla-card-project-panel')
       .css({
        "height":h+"px",
        "padding":"8px", 
        "overflow-x":"auto",
        "overflow-y":"hidden"
       });       
     }
     
     addGroupPanel=function(group){
       
       
       var deltaWidth = group.width+groupMarginRight;
       
       /*var currentWidth = deltaWidth;
       $('#crudzilla-card-group-panel .card-group-column').each(function(){
       		currentWidth += ($(this).width()+groupMarginRight)+32;
       });
       $('#crudzilla-card-group-panel').css({"width":(currentWidth)+"px"});
       */
       resizeProjectView(deltaWidth);
       
       //if(typeof $("#crudzilla-card-group-header-"+group.id).data("editor") != "undefined" && $("#crudzilla-card-group-header-"+group.id).data("editor") != null)
       //  $("#crudzilla-card-group-header-"+group.id).data("editor").destroy();       
       //tinymce.EditorManager.execCommand('mceRemoveControl',false, "crudzilla-card-group-header-"+group.id);
       
       
       
       //
       var html = [];
       html.push('<div id="card-group-panel-'+group.id+'" style="width:'+group.width+'px;margin:0;margin-right:'+groupMarginRight+'px;padding:4px" class="ui-widget-header ui-corner-top card-group-column">');
       html.push('	  <div class="ui-widget-header ui-corner-top" style="margin-bottom:4px;padding:3px;clear:both"><div id="crudzilla-card-group-header-'+group.id+'" class="crudzilla-card-group-header" style="width:60%;float:left"><span  style="vertical-align:middle"><img src="img/sticky-notes.png"/></span> <span class="title-label" >'+(group.name != null?group.name:"")+'</span></div><button id="delete-card-group-button-'+group.id+'">Delete</button><div style="clear:both"></div></div>');
       html.push('	  <div id="group-card-panel-'+group.id+'" class="card-group-column-list"></div>');
       html.push('	  <div class="ui-corner-all" style="text-align:right"><button value="'+group.id+'" id="add-card-to-group-button-'+group.id+'">Add</button></div>');
       html.push('</div>');
       $('#crudzilla-card-group-panel').append(html.join(''));
        
       function updateName(){
            $.ajax({
              type:'POST',
              data:
              {
                "name":$("#crudzilla-card-group-header-"+group.id+" .title-label").html(),
                "group_id":group.id                                  
              },
              url:"todo-list-manager/project/group/rename-group.stm",
              success:function(data){
                
              }});        
       }
       
       $("#crudzilla-card-group-header-"+group.id+" .title-label").mousedown(function() {
         $(this).attr('contentEditable', true);
       }).blur(
         function() {
           $(this).attr('contentEditable', false);
           updateName();
         }).keypress(function(event){
               
           		if ( event.which == 13 )
                  event.preventDefault();
       });       
       
       
       $("#crudzilla-card-group-header-"+group.id+" .title-label").addClass("card-project-title").css({"font-weight":"bold","font-size":"16px","overflow":"hidden","white-space":"nowrap","color":"#888a85"});

	   /*
       makeHeaderEditor("crudzilla-card-group-header-"+group.id,function(ed){
            $.ajax({
              type:'POST',
              data:
              {
                "name":ed.getContent(),
                "group_id":group.id                                  
              },
              url:"todo-list-manager/project/group/rename-group.stm",
              success:function(data){
                
              }});       
       });
       */
       //cap the height of group panel
       $('#group-card-panel-'+group.id)
       .css(
         {
           "max-height":($('#card-group-panel-'+group.id).parent().parent().height()*0.82)+"px",
           "overflow-y":"auto"         
         });
       
       
       $('#group-card-panel-'+group.id)
       .sortable({
         connectWith:".card-group-column-list",
         cancel:".crudzilla-editable",
         update:function(event,ui){
           
           var srcGroupId = $(ui.sender).data("group_id");
           var groupId    = $(ui.item.parent()).data("group_id");
           

           //update new group panel positions
           $(ui.item.parent()).find('.card-panel').each(function(){   
               
               //alert($(this).data("card_id")+"/"+$(this).index());
               //return;
               $.ajax({
                 type:'POST',
                 data:
                 {
                   "id":$(this).data("card_id"),
                   "group_id":groupId,                 
                   "position":$(this).index()
                 },
                 url:"todo-list-manager/project/group/card/update-card-position.stm",
                 success:function(data){
                   $.unblockUI();                              
               }});
             
           });
           
           
           
           //update source group panel positions
           $(ui.sender).find('.card-panel').each(function(){             
             
             //alert($(this).data("card_id")+"/"+$(this).index());
             //return;
             $.ajax({
               type:'POST',
               data:
               {
                 "id":$(this).data("card_id"),
                 "group_id":srcGroupId,
                 "position":$(this).index()
               },
               url:"todo-list-manager/project/group/card/update-card-position.stm",
               success:function(data){
                 $.unblockUI();                              
               }});                                                
           });                      
         }
       }).data("group_id",group.id);
       
       $('#card-group-panel-'+group.id)
       .data("group_id",group.id)
       .resizable({
         handles:"e",
         resize:function(){
           resizeProjectView(0);
         },
         stop:function(event,ui){
           resizeProjectView(0);
           $.ajax({
             type:'POST',
             data:
             {
               "group_id":$(this).data("group_id"),
               "width":$(this).width()
             },
             url:"todo-list-manager/project/group/update-group-width.stm",
             success:function(data){
               
             }});
         }
       });
       
       $('#add-card-to-group-button-'+group.id).button({
         text: true,
         icons: {
           primary: "ui-icon-plus"
         }
       })
       .click(function(event){
         $.ajax({
           type:'POST',
           data:
           {
             "name":"",
             "project_id":group.projectId,
             "group_id":group.id,
             "position":$("#group-card-panel-"+group.id).find('.card-panel').length
           },
           url:"todo-list-manager/project/group/card/add-card.stm",
           success:function(data){
               $.unblockUI();
               var id = appBuilder.common_core.stripNewLine(data);
             
               
               addCardPanel({
                 id:id,
                 projectId:group.projectId,
                 groupId:group.id,
                 position:$("#group-card-panel-"+group.id).find('.card-panel').length
               });             
           }});         
       });  
       
       $('#delete-card-group-button-'+group.id).css({"float":"right","width":"16px","height":"16px"}).button({
         text: false,
         icons: {
           primary: "ui-icon-close"
         }
       })
       .click(function(event){
         
         if(!confirm("Are you sure you want to delete deck?"))return;
         
         $.ajax({
           type:'POST',
           data:
           {
             "group_id":group.id
           },
           url:"todo-list-manager/project/group/delete-group.stm",
           success:function(data){
             	$.unblockUI();
             	$("#card-group-panel-"+group.id).remove();  
             	resizeProjectView(0);
           }});
         
       });       
     }
     
     addCardPanel=function(card){
       var html = [];
       html.push('<div id="card-panel-'+card.id+'" style="background:none;padding:4px;margin-bottom:4px;" class="ui-widget-content ui-corner-all card-panel">');
       //html.push('	<div class="bkdiv">');
       html.push('		<div style="width:100%;"><button id="delete-group-card-button-'+card.id+'" style="visibility:hidden;">Delete</button><button id="update-group-card-button-'+card.id+'" style="visibility:hidden;">Edit</button><div id="group-card-bkgnd-color-button-'+card.id+'" style="visibility:hidden;"><input type="text"/></div><div style="clear:both"></div></div>');
       html.push('		<div class="crudzilla-editable" style="background:none">'+(card.content != null?card.content:"")+'</div>');
       //html.push('  </div>');
       html.push('</div>');
       
       $("#group-card-panel-"+card.groupId).append(html.join(''));
       $("#card-panel-"+card.id).data("card_id",card.id);     
       makeCardPanel(card);
     }     

     var projectMenu = $('#crudzilla-card-project-menu').css({"width":256}).menu({
        select:function(event,ui){
           $("#delete-project-button").css({"display":"inline"}).data("project_id",$(ui.item).attr("id")); 
           //load active project
           loadProject({id:$(ui.item).attr("id"),name:$(ui.item).find('a').html()});                
        }
      }).removeClass("ui-corner-all").addClass("ui-corner-bottom");
    
      $( document ).on( "click", function() {
        	$('#crudzilla-card-project-menu').addClass("ui-corner-all").removeClass("ui-corner-bottom");
        	$('#show-card-project-list-button').css({"border-bottom-style":"solid"}).addClass("ui-corner-all").removeClass("ui-corner-top");
        	projectMenu.hide();
      });    
    
      $('#card-project-dialog').dialog({
        autoOpen: false,
        width: 164,
        open:function(){          
          $('#card-project-dialog-name').val('');
        },
        buttons: {
          "Ok": function() {
            if($('#card-project-dialog-name').val() != ''){

                 $.ajax({
                    type:'POST',
                    data:
                        {
                            "name":$('#card-project-dialog-name').val()
                        },
                    url:"todo-list-manager/project/add-project.stm",
                    success:function(data){
                        loadProject({"id":appBuilder.common_core.stripNewLine(data),"name":$('#card-project-dialog-name').val()});
                        $("#delete-project-button").css({"display":"inline"}).data("project_id",appBuilder.common_core.stripNewLine(data)); 
                        $.unblockUI();                    
                    }});             
              
              
              $(this).dialog("close");
            }else{
              alert("Please provide an appropriate name for project");
            }
          },
          "Cancel": function() {
            $(this).dialog("close");
          }
        }
        
      }).siblings('div.ui-dialog-titlebar').remove();     
    
    
    
      $('#card-project-group-dialog').dialog({
        autoOpen: false,
        width: 164,
        open:function(){          
          $('#card-project-group-dialog-name').val('');
        },
        buttons: {
          "Ok": function() {
            if($('#card-project-group-dialog-name').val() != ''){
				             
                 $.ajax({
                    type:'POST',
                    data:
                        {
                          "name":$('#card-project-group-dialog-name').val(),
                          "project_id":$('#add-card-project-group-button').data("project_id"),
                          "position":$(".card-group-column").length
                        },
                    url:"todo-list-manager/project/group/add-group.stm",
                    success:function(data){
                        $.unblockUI();
                      
                        var id = appBuilder.common_core.stripNewLine(data);
                        addGroupPanel({
                          id:id,
                          name:$('#card-project-group-dialog-name').val(),
                          position:$(".card-group-column").length,
                          width:256
                        });
                    }});
              
              $(this).dialog("close");
            }else{
              alert("Please provide an appropriate name for group");
            }
          },
          "Cancel": function() {
            $(this).dialog("close");
          }
        }
        
      }).siblings('div.ui-dialog-titlebar').remove();     
    
    
    
    
      $('#add-card-project-button').button({
              text: true,
              icons: {
                      primary: "ui-icon-plus"
              }
      }).click(function(event){
         $('#card-project-dialog').dialog("open");
      });     
    
    
    
     
     $('#add-card-project-group-button').css({"float":"right"}).button({
              text: true,
              icons: {
                      primary: "ui-icon-plus"
              }
      }).click(function(event){         
         $('#card-project-group-dialog').dialog("open");
      });    
    
    
    
      $('#delete-project-button').button({
              text: true,
              icons: {
                      primary: "ui-icon-trash"
              }
      }).click(function(event){
         if(!confirm("Are you sure you want to delete project?"))return;
        
         var project_id = $(this).data("project_id");
         $.ajax({
           type:'POST',
           data:
           {
             "project_id":project_id
           },
           url:"todo-list-manager/project/delete-project.stm",
           success:function(data){
             	$.unblockUI();
                $("#crudzilla-active-project-label").html("");
                $('#crudzilla-card-group-panel').html("");
             	$('#delete-project-button').css({"display":"none"});
                $('#add-card-project-group-button').css({"display":"none"});
             
             	loadProjects();
           }});        
      });  //888a85 3465a4 ad7fa8   5c3566  75507b  ef2929
    
    
    
    
      $('#show-card-project-list-button').button({
              text: true,
              icons: {
                      primary: "ui-icon-triangle-1-s"
              }
      }).click(function(event){
          event.stopPropagation(); 
          
          $(this).css({"border-bottom-style":"none"}).removeClass("ui-corner-all").addClass("ui-corner-top");
          var thisBtn = this;
		  loadProjects(this);
          $('#crudzilla-card-project-menu').removeClass("ui-corner-all").addClass("ui-corner-bottom");
      });  
    
      resizeProjectViewHeight();
    
    
      $('#crudzilla-project-panel-header').css({"padding":"4px"});
    
      $('#crudzilla-card-group-panel')
      .css({"width":"100%"})      
      .sortable(
        {
          cancel:".crudzilla-editable,.card-panel,.card-group-column-list,.crudzilla-card-group-header",
          update:function(event,ui)
          {                  
            $('#crudzilla-card-group-panel .card-group-column').each(function(){
              
              $.ajax({
                type:'POST',
                data:
                {
                  "id":$(this).data("group_id"),
                  "position":$(this).index()
                },
                url:"todo-list-manager/project/group/update-group-position.stm",
                success:function(data){  
                  
                }});
            });                  
      }});
    
    
       $('#screencast-viewer-dialog').dialog({
        autoOpen: false,
        width: 760,         
        open:function(){          
          //alert($(this).data("video"))
          $("#screencast-viewer-video").html($(this).data("video"));
        }/*,
        buttons: {
          "Ok": function() {

          },
          "Cancel": function() {
            $(this).dialog("close");
          }
        }*/
        
      });//.siblings('div.ui-dialog-titlebar').remove();      
     
    
      //load default project
      loadProjects();
  },
  openYoutube:function(url){
	  //var html = '<iframe width="640" height="480" src="'+url+'" frameborder="0" allowfullscreen></iframe>';
      //$('#screencast-viewer-dialog').data("video",html).dialog("open"); 
    $.colorbox({iframe:true, innerWidth:640, innerHeight:480,transition:"none",opacity:0.5,href:url});
      //$.colorbox({html:html});
  }
}