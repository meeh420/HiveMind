          document.crudzilla ={
            part:
            {
              //this is required and should be a uuid
              "id":"f77a7d52-a866-11e3-b1d4-030027ab8d96",
              //define your external dependencies before declaring them on elements
              external_dependencies:
              {
                "https://github.com/twbs/bootstrap/releases/download/v3.1.1/bootstrap-3.1.1-dist.zip":
                {
                  //url for downloading this dependency
                  "url":"https://github.com/twbs/bootstrap/releases/download/v3.1.1/bootstrap-3.1.1-dist.zip",
                  //a short one or two line 
                  "description":"bootstrap CSS framework",
                  //name of this dependecy
                  "label":"Bootstrap",
                  //external page for any additional information about this dependency
                  "info_page":"http://getbootstrap.com/",
                  //where you want this to be placed within the current application, 
                  //if left blank, downloaded file would be place in the same directory 
                  //as active document.
                  "local_path":"/path/to/save/in"
                },
                "https://github.com/twbs/bootstrap/releases/download/v3.1.1/bootstrap-3.1.1-dist1.zip":
                {
                  "url":"https://github.com/twbs/bootstrap/releases/download/v3.1.1/bootstrap-3.1.1-dist.zip",
                  "description":"bootstrap CSS framework",
                  "label":"Bootstrap",
                  "info_page":"http://getbootstrap.com/",
                  "local_path":"/path/to/save/in"
                }               
              }
              ,
             /*
              * This interface checks the list of required dependencies and removes the ones that have already
              * been met so user isn't prompted to install them. It can be implemented to check for dependencies
              * in the active document in whatever means the developer deems suitable, the implementation below
              * is just an example.
              */
              onCheckDependencies:function(requiredDependencies,activeDoc){
                
                //example implementation
                for(var i=0;i<requiredDependencies.length;i++){
                  var dependency = this.external_dependencies[requiredDependencies[i]];
                  if(dependency.label == "jquery"){
                    if(activeDoc.documentElement.ownerDocument.SomeJQueryVersion){
                      //remove this dependency as it has been already met
                      requiredDependencies.splice(i,1);
                    }
                  }
                  else
                  if(dependency.label == "bootstrap"){
                    if(activeDoc.documentElement.ownerDocument.SomeBootstrapVersion){
                      //remove this dependency as it has been already met
                      requiredDependencies.splice(i,1);
                    }
                  }
                  //...
                  //...do something similar for other dependencies                  
                }
              },
              /*
               * Implement this interface if you want to handle the insertion of html elements
               * when a drag-n-drop is performed. This interface would be called by the HiveMind
               * UI builder if drag-n-drop is performed on an element that has the attribute
               * data-crudzilla-call-ondrop defined and set to true.
               */
              onDrop:function(doc,dragElement,dropElement,callBack){
                //This object describes a mutation to a document.
                var mutation = 
                {
                  //node to be added, removed or reparentd
                  "node":nodeAddedRemovedOrReparented,
                  //can be null
                  "oldParentNode":null,
                  //the parent that it added node was attached to
                  "newParentNode":null,
                  //can be null
                  "oldPreviousSibling":null,
                  //can be null if one isn't applicable
                  "oldNextSibling":null,
                  //where to drop an added node in relation to a particular sibling
                  "dropNextToNode":"none | left | right",
                  //specify if application
                  "newPreviousSibling": null,
                  //specify if applicable
                  "newNextSibling" : null,
                  //select on of these values to indicate the type of mutation to perform
                  "type":"added | removed | reparented"
                };           
                //for all mutations to active document, notify HiveMind so mutation is persisted
                //you may call this interface any time you make a persitent mutation to
                //the active document. With out calling this interface, your changes would not
                //become persistent so saving the active document would not capture your mutations.
                this.onDocMutation(mutation,this.getActiveDoc());
                
                
                //additionaly you can leverage the HiveMind UI builder in the implementation of
                //this part. If you want the UI builder to enable drag-n-drop on an element that
                //you inserted into this UI part's DOM, you can invoke onDocMutation with this UI part's
                //document as follows:
                this.onDocMutation(mutation,this.doc);
              },
              /*
               * Called after an element is dragged from the UI Part document to the
               * currently active document.
               * @doc - refers the active document
               */
              onPostDrop:function(doc){                
                $(doc.crudzillaCloneDOM).find("*").removeClass(this.classes.join(" "));                
                doc.updatePair();
                console.log("onPostDrop");
              },
              /*
               * Called after a new document is open in design mode, this opened document
               * becomes the active document
               * @doc - refers the active document
               */              
              onDocOpen:function(doc){
                console.log("onDocOpen");
              },
              /*
               * Called when a document that is open in design mode is closed
               * @doc - refers the closed document
               */              
              onDocClose:function(doc){
                console.log("onDocClose");
              },
              /*
               * Called when a the tab an open document is activated, that is selected
               * This document becomes the active document.
               * @doc - refers the active document
               */              
              onDocTabActivate:function(doc){
                console.log("onDocTabActivate");
              },              
              /*
               * Called when a the tab of active document is deactivated, 
               * that is another tab is selected               
               * @doc - refers the active document
               */            
              onDocTabDeactivate:function(doc){
                console.log("onDocTabDeactivate");
              }
            }
      };
      
      //register this ui part interface implementation 
      if(top.appBuilder)             
        top.appBuilder.registerUIPart(document.crudzilla);
           