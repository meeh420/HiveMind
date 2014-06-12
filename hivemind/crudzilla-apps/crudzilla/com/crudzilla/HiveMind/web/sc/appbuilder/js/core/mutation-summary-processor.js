   
    var idCounter = new Date().getTime();
    var textIdBase = new Date().getTime();
    var textIdCounter = textIdBase;

    function makeNodeCrudzillaAware(element){
         var nodeType = element.nodeType;
      
         if(nodeType != 2){
           
           if(typeof element.setAttribute != "function"){
             element.dataCrudzillaElement = "text"+(textIdCounter++);
           }
           else
           {             
             element.setAttribute("data-crudzilla-element",idCounter++); 
           }
         }
         
         //element.setAttribute("data-crudzilla-element",idCounter++);          
    }
    
	/**
    function traverseElement(element,workerCallback){
      for(var i=0;i<element.children.length;i++){
         
         if(element.children[i].children.length){
         	var tr = traverseNode(element.children[i],workerCallback);
           
         	if(typeof tr != "undefined" && tr == false)
           		return false;//break;           
         }
        
         var r = workerCallback(element.children[i]);
         if(typeof r != "undefined" && r == false)
           return false;//break;
      }
    }
	**/

    function traverseNode(node,workerCallback){
      for(var i=0;i<node.childNodes.length;i++){
         
         if(node.childNodes[i].childNodes.length){
         	var tr = traverseNode(node.childNodes[i],workerCallback);
           
         	if(typeof tr != "undefined" && tr == false)
           		return false;//break;           
         }
        
         var r = workerCallback(node.childNodes[i]);
         if(typeof r != "undefined" && r == false)
           return false;//break;
      }
    }
    
    traverseNode(document.getElementsByTagName("html")[0],makeNodeCrudzillaAware);  

    var crudzillaCloneDOM = document.getElementsByTagName("html")[0].cloneNode(true);
    
    textIdCounter = textIdBase;//reset
    var crudzillaCloneDOMArray = [];
    traverseNode(crudzillaCloneDOM,function(node){
         
         var id = getDataCrudzillaElement(node);
         
         if(typeof id != "undefined")
           crudzillaCloneDOMArray[id] = node;
         else
         {
           node.dataCrudzillaElement = "text"+(textIdCounter++);
           //alert("safed id "+node.dataCrudzillaElement)
           crudzillaCloneDOMArray[node.dataCrudzillaElement] = node;
           //alert("adding node "+node.nodeType+"/"+id)
         }
    }); 
	

    
    function getDataCrudzillaElement(node){
      
      if(node == null) return;
      
      if(typeof node.getAttribute != "function"){        
        return node.dataCrudzillaElement;
      }
      else
      {             
        return node.getAttribute("data-crudzilla-element"); 
      }      
    }

	
    function setDataCrudzillaElement(node,from){
      
      if(node == null || from == null) return;
      
      if(typeof from.getAttribute != "function"){        
        node.dataCrudzillaElement = from.dataCrudzillaElement;
      }
      else
      {             
        node.setAttribute("data-crudzilla-element",from.getAttribute("data-crudzilla-element")); 
      }      
    }

    function addNodes(mutation){
      
      var pairTargetNode = crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.target)];
      if(pairTargetNode){
        
        //they were inserted before the first node
        if(mutation.nextSibling){
          
          var pairNextSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.nextSibling)];
          for(var i=mutation.addedNodes.length-1;i>=0;i--){    
            
            var node = mutation.addedNodes[i];            
            pairNextSibling = pairTargetNode.insertBefore(node.cloneNode(),pairNextSibling);
            crudzillaCloneDOMArray[getDataCrudzillaElement(pairNextSibling)] = pairNextSibling;
          }
        }
        else//inserted after this node
        if(mutation.previousSibling){
          
          var pairPreviousSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.previousSibling)];  
          
          var pairNextSibling = pairPreviousSibling.nextSibling;
          
          for(var i=mutation.addedNodes.length-1;i>=0;i--){   
            var node = mutation.addedNodes[i];
            pairNextSibling = pairTargetNode.insertBefore(node.cloneNode(),pairNextSibling);
            crudzillaCloneDOMArray[getDataCrudzillaElement(pairNextSibling)] = pairNextSibling;
          }                  
        }//appended to empty tree
        else
        {
          for(var i=0;i<mutation.addedNodes.length;i++){
			var node = mutation.addedNodes[i];            
            var pairNextSibling = pairTargetNode.appendChild(node.cloneNode());
            crudzillaCloneDOMArray[getDataCrudzillaElement(pairNextSibling)] = pairNextSibling;
          }
        }        
      }else{
        
      }
    }

    function removeNodes(mutation){
      
      var pairTargetNode = crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.target)];
      if(pairTargetNode){
                
          for(var i=0;i<mutation.removedNodes.length;i++){            
            
            var removedNode = crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.removedNodes[i])];
            pairTargetNode.removeChild(removedNode);
            delete crudzillaCloneDOMArray[getDataCrudzillaElement(mutation.removedNodes[i])];            
          }
      }
    }

    function attributeChange(mutation){
      
    }

    function characterDataChange(mutation){
      
    }


	/*
	var accumulatedMutations = [];
    function startObserver(){
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          
          mutations.forEach(function(mutation) {
            
            if(typeof mutation.target.hasAttribute != "function" || 
               !mutation.target.hasAttribute("data-crudzilla-element")) 
              return;
            
            if(mutation.type == "childList" && mutation.removedNodes != null)
              removeNodes(mutation);            
            
            
            if(mutation.type == "childList" && mutation.addedNodes != null)
              addNodes(mutation);
            
            
            if(mutation.type == "CharacterData")
              characterDataChange(mutation);        
            
            if(mutation.type == "attributes")
              attributeChange(mutation);  
            
            if(typeof updatePair == "function"){
              
              //updatePair();         
            }
          });          
          
          accumulatedMutations.push(mutations);
          
          if(top.appBuilder.htmlLayout.dragging)
            return;
          
          
          for(var i=0;i<accumulatedMutations.length;i++){
              
              accumulatedMutations[i].forEach(function(mutation) {
                
                if(typeof mutation.target.hasAttribute != "function" || 
                   !mutation.target.hasAttribute("data-crudzilla-element")) 
                  return;
         
                if(mutation.type == "childList" && mutation.removedNodes != null)
                  removeNodes(mutation);            
                
                
                if(mutation.type == "childList" && mutation.addedNodes != null)
                  addNodes(mutation);
           
                
                if(mutation.type == "CharacterData")
                  characterDataChange(mutation);        
                
                if(mutation.type == "attributes")
                  attributeChange(mutation);  
                
                if(typeof updatePair == "function"){
                  	
                    //updatePair();         
                }
              });
          }
          accumulatedMutations = [];
          *
          
        });
         
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true,subtree:true };
         
        // pass in the target node, as well as the observer options
        observer.observe(document, config);   
    }

	startObserver();
	*/


    /*
    var processSummary = function(summary){
        
		var targetNode = null;
        
        if(summary.added.length>0)
          targetNode = summary.added[0].parentNode;
        else
        if(summary.removed.length>0)
          targetNode = summary.removed[0].parentNode;
        
        
      if(targetNode){
        alert($(targetNode).attr("class")+"/"+summary.added.length+"/"+summary.removed.length)
        	//targetNode = findPairNode(targetNode);
        
        return;
      }
        if(summary.added){
            summary.added.forEach(function(newEl) {
              	//alert(newEl.nodeType+"/"+newEl.previousSibling.nodeType)
                if(newEl.hasAttribute && newEl.hasAttribute("data-crudzilla-element")){
                  
                  var nextSibling = findPairNode(newEl.nextSibling);
                  if(nextSibling)
                    targetNode.insertBefore(newEl.cloneNode(true),nextSibling);
                  else
                    targetNode.appendChild(newEl.cloneNode(true));
                }
            });
        }
        
        if(summary.valueChanged){
          alert("value changed")
          summary.valueChanged.forEach(function(newEl) {
              
              if(newEl.hasAttribute("data-crudzilla-element")){
                var pairElement = findPairNode(newEl);
                pairElement.textContent = newEl.textContent;
              }            
          })
        }
        
        if(summary.removed){
          summary.removed.forEach(function(newEl) {         	
              if(newEl.hasAttribute("data-crudzilla-element")){
                
                var pairElement = findPairNode(newEl);
                if(pairElement)
                  pairElement.remove();              
              }            
          })
        }
        
        if(typeof updatePair == "function")
        	updatePair();           
    }
    
    var observer = new MutationSummary({

      callback: function(summaries){
        
        /**
      	crudzillaCloneDOM = document.getElementsByTagName("html")[0].cloneNode(true);
        traverseNode(crudzillaCloneDOM,function(node){
          if(!node.hasAttribute("data-crudzilla-element"))
            node.remove();
        });
        
        
        if(typeof updatePair == "function")
        	updatePair(); 
        **
        for(var i=0;i<summaries.length;i++)
           processSummary(summaries[i]);
      },
      queries: [{
        element: '[data-crudzilla-element]'
        
      },{characterData: true}]
    });    */



	
    var processSummary = function(summary){

      //if(top.appBuilder.htmlLayout.dragging)
      //      return; 
      /*
      var targetNode 	  = null;
      var nextSibling 	  = null;
      var previousSibling = null;
      
      
      if(summary.added.length>0){
        targetNode      = summary.added[0].parentNode;
        previousSibling = summary.added[0].previousSibling;
        nextSibling		= summary.added[summary.added.length-1].nextSibling;
      }
      else
      if(summary.removed.length>0){
        targetNode = summary.removed[0].parentNode;
      }
        
      var mutation = 
      {
        "target":targetNode,
        "addedNodes":summary.added,
        "removeNodes":summary.removed,
        "previousSibling":previousSibling,
        "nextSibling":nextSibling
      };
      //if(mutation.target == null)return;  
     
      //if(typeof mutation.target.hasAttribute != "function" || 
      //   !mutation.target.hasAttribute("data-crudzilla-element")) 
      //  return;
      
      //if(mutation.removedNodes != null)
      //  removeNodes(mutation);            
      
      */
      /*
      summary.added.forEach(function(node){
        
      	var pairParentNode = crudzillaCloneDOMArray[getDataCrudzillaElement(node.parentNode)];
      	
      })
      */
      
      if(summary.reparented){
          
          summary.reparented.forEach(function(node){
              
              var pair       			 = crudzillaCloneDOMArray[getDataCrudzillaElement(node)];
              var pairNewParentNode      = crudzillaCloneDOMArray[getDataCrudzillaElement(node.parentNode)];
              var pairOldParentNode      = crudzillaCloneDOMArray[getDataCrudzillaElement(summary.getOldParentNode(node))];
              
              var pairNewPreviousSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(node.previousSibling)];
              var pairNewNextSibling     = crudzillaCloneDOMArray[getDataCrudzillaElement(node.nextSibling)];
              
              //remove from old pair parent
              if(pairOldParentNode.contains(pair))
              		pairOldParentNode.removeChild(pair);
              
              //if the new parent is invalid, discard this node
              if(typeof pairNewParentNode == "undefined")
                return;
                        
              //they were inserted before the first node
              if(pairNewNextSibling && pairOldParentNode.contains(pairNewNextSibling)){          
                pairNewParentNode.insertBefore(pair,pairNewNextSibling);
              }
              else//inserted after this node
              if(pairNewPreviousSibling){
                var pairNextSibling = pairNewPreviousSibling.nextSibling;
                
                if(pairNextSibling && pairOldParentNode.contains(pairNextSibling))
                  pairNewParentNode.insertBefore(pair,pairNextSibling); 
                else
                  pairNewParentNode.appendChild(pair);
              }//appended to empty tree
              else
              {
                pairNewParentNode.appendChild(pair);
              }         
          });
       
      }
      
      
      if(summary.reordered){
          //alert("reordered:"+summary.reordered.length)
          summary.reordered.forEach(function(node){
              alert("reorder")
              var pair       			 = crudzillaCloneDOMArray[getDataCrudzillaElement(node)];
              var pairNewParentNode      = crudzillaCloneDOMArray[getDataCrudzillaElement(node.parentNode)];
              var pairOldParentNode      = pairNewParentNode;
              
              var pairNewPreviousSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(node.previousSibling)];
              var pairOldPreviousSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(summary.getOldPreviousSibling(node))];
              var pairNewNextSibling     = crudzillaCloneDOMArray[getDataCrudzillaElement(node.nextSibling)];
              
              //remove from old pair parent
              pairOldParentNode.removeChild(pair);
              
              alert("reordering")
              //they were inserted before the first node
              if(pairNewNextSibling){          
                pairNewParentNode.insertBefore(pair,pairNewNextSibling);
              }
              else//inserted after this node
              if(pairNewPreviousSibling){
                var pairNextSibling = pairNewPreviousSibling.nextSibling;
                
                if(pairNextSibling)
                  pairNewParentNode.insertBefore(pair,pairNextSibling); 
                else
                  pairNewParentNode.appendChild(pair);
              }//appended to empty tree
              else
              {
                pairNewParentNode.appendChild(pair);
              }         
          });
       
      }      
      
      if(summary.removed){
          
          summary.removed.forEach(function(node){
              
            var pair       			 = crudzillaCloneDOMArray[getDataCrudzillaElement(node)];
            if(pair){
               var pairParentNode    = crudzillaCloneDOMArray[getDataCrudzillaElement(pair.parentNode)];

               //remove from old pair parent
              if(pairParentNode && pairParentNode.contains(pair)){
               	pairParentNode.removeChild(pair);                
              }
              
              delete crudzillaCloneDOMArray[getDataCrudzillaElement(pair)];
            }
          });       
      }           
      
      
      if(summary.added){
          
          summary.added.forEach(function(node){
              var pair = node.cloneNode();
              setDataCrudzillaElement(pair,node);
            
              var pairNewParentNode      = crudzillaCloneDOMArray[getDataCrudzillaElement(node.parentNode)];
            
              var pairNewPreviousSibling = crudzillaCloneDOMArray[getDataCrudzillaElement(node.previousSibling)];              
              var pairNewNextSibling     = crudzillaCloneDOMArray[getDataCrudzillaElement(node.nextSibling)];
              
              if(typeof pairNewParentNode == "undefined")
                return;
            
              //they were inserted before the first node
              if(pairNewNextSibling && pairNewParentNode.contains(pairNewNextSibling)){          
                pairNewParentNode.insertBefore(pair,pairNewNextSibling);
              }
              else//inserted after this node
              if(pairNewPreviousSibling){
                var pairNextSibling = pairNewPreviousSibling.nextSibling;
                
                if(pairNextSibling && pairNewParentNode.contains(pairNextSibling))
                  pairNewParentNode.insertBefore(pair,pairNextSibling); 
                else
                  pairNewParentNode.appendChild(pair);
              }//appended to empty tree
              else
              {
                pairNewParentNode.appendChild(pair);
              }         
          });       
      }
      //if(mutation.addedNodes != null)
      //  addNodes(mutation);
      
      
      /**if(mutation.type == "CharacterData")
                  characterDataChange(mutation);        
                
                if(mutation.type == "attributes")
                  attributeChange(mutation);  
                */
      
      if(typeof updatePair == "function"){        
        updatePair();         
      }       
    }
    /*
    var observer = new MutationSummary({

      callback: function(summaries){
        
        /**
      	crudzillaCloneDOM = document.getElementsByTagName("html")[0].cloneNode(true);
        traverseNode(crudzillaCloneDOM,function(node){
          if(!node.hasAttribute("data-crudzilla-element"))
            node.remove();
        });
        
        
        if(typeof updatePair == "function")
        	updatePair(); 
        **
        //for(var i=0;i<summaries.length;i++)
        //   processSummary(summaries[i]);
      },
      oldPreviousSibling:true,
      queries: [{
        element: '[data-crudzilla-element]'
        
      },{characterData: true}]
    });
	*/

