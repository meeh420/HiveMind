/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import net.sf.json.JSONArray;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.LazyDynaBean;

/**
 *
 * @author bitlooter
 */
public class ExecutableDefinitionReference {
    
    String      id;
    String      definitionId;
    String      description;
    JSONObject  crudExecutable; 
    boolean     serverSide = true;
  	boolean		requireAllIdentities = false;
    String      basePath;
    
    protected ExecutableDefinition definition;
    List<DefinitionExecutionParameter> executionParameters;
    List<DefinitionAccessControl> accessControls;
    
    List<PreExecutionHandler>preActionHandlers;
    List<PostExecutionHandler>postActionHandlers;
  
        
    public static String StringOrNull(Object obj){
        if(obj == JSONNull.getInstance() || obj == null)
            return null;
        
        return obj.toString();
    }
    
    public ExecutableDefinitionReference(){
        
    }
    
    public ExecutableDefinitionReference(ExecutableDefinition definition){
        this.definition    = definition;
        
        preActionHandlers = new ArrayList<PreExecutionHandler>();
        definition.setPreActionHandlers(preActionHandlers);  
        
        postActionHandlers = new ArrayList<PostExecutionHandler>();
        definition.setPostActionHandlers(postActionHandlers); 
        
        executionParameters = new ArrayList<DefinitionExecutionParameter>();
        this.definition.setExecutionParameters(executionParameters);     
        
        accessControls = new ArrayList<DefinitionAccessControl>();
        this.definition.setAccessControls(accessControls);        
    }
    
    public ExecutableDefinitionReference(JSONObject crudExecutable,ExecutableDefinition definition,Invocation caller){
        this.definition     = definition;
        this.crudExecutable = crudExecutable;
        
        if(crudExecutable.has("reference_id"))
            id  = StringOrNull(crudExecutable.get("reference_id"));
        
        definitionId    = StringOrNull(crudExecutable.get("definition_id"));    
        //description     = crudExecutable.getString("description");
                
        if(crudExecutable.has("definition")){
            JSONObject definitionJSON = crudExecutable.getJSONObject("definition");
            definition.setId(StringOrNull(definitionJSON.get("id")));
            
            if(StringOrNull(definitionJSON.get("serverSideOnly")) != null && 
                    definitionJSON.getString("serverSideOnly").compareTo("no") == 0)
                serverSide = false;
          
            if(StringOrNull(definitionJSON.get("requireAllIdentities")) != null && 
                    definitionJSON.getString("requireAllIdentities").compareTo("yes") == 0)
                requireAllIdentities = true;          
        }
      
        
        
        
        if(crudExecutable.has("type_definition")){
            JSONObject typeDefinition = crudExecutable.getJSONObject("type_definition");
            definition.setCrudType(StringOrNull(typeDefinition.get("crudType")));
            definition.setImplementorPath(StringOrNull(typeDefinition.get("implementorPath")));
            definition.setImplementorRefType(StringOrNull(typeDefinition.get("implementorRefType")));
            definition.setInitializerPath(StringOrNull(typeDefinition.get("initializerPath")));
            definition.setPostValidateHandlerPath(StringOrNull(typeDefinition.get("postValidateHandlerPath")));          
        }
        
        
        preActionHandlers = new ArrayList<PreExecutionHandler>();
        definition.setPreActionHandlers(preActionHandlers);  
        
        if(crudExecutable.has("preexecution_handlers")){
            JSONArray preExecutionHandlers = crudExecutable.getJSONArray("preexecution_handlers");
            Iterator itr = preExecutionHandlers.iterator();
            while(itr.hasNext()){
                PreExecutionHandler handler = new PreExecutionHandler();

                JSONObject h = (JSONObject)itr.next();
                handler.setDefinitionId(definitionId);
                handler.setId(StringOrNull(h.get("id")));
                handler.setPath(StringOrNull(h.get("path")));
                handler.setEnable(StringOrNull(h.get("enable")));
                handler.setReturnMode(StringOrNull(h.has("returnMode")?h.get("returnMode"):null));
                handler.setReturnValName(StringOrNull(h.get("returnValName")));
                handler.setOnlyProceedOnTrue(StringOrNull(h.get("onlyProceedOnTrue")));
                
                handler.setArgPropagationListPath(StringOrNull(h.get("argPropagationListPath")));
                handler.setArgPropagationMode(StringOrNull(h.get("argPropagationMode")));
                handler.setExplodedListPath(StringOrNull(h.has("explodedListPath")?h.get("explodedListPath"):null));
                preActionHandlers.add(handler);
            }
        }


        postActionHandlers = new ArrayList<PostExecutionHandler>();
        definition.setPostActionHandlers(postActionHandlers);  
        
        if(crudExecutable.has("postexecution_handlers")){

            JSONArray postExecutionHandlers = crudExecutable.getJSONArray("postexecution_handlers");
            Iterator itr = postExecutionHandlers.iterator();
            while(itr.hasNext()){
                
                JSONObject h = (JSONObject)itr.next();
                PostExecutionHandler handler = new PostExecutionHandler();
                
                handler.setDefinitionId(definitionId);
                handler.setId(StringOrNull(h.get("id")));                    
                handler.setPath(StringOrNull(h.get("path")));
                handler.setEnable(StringOrNull(h.get("enable")));
              	handler.setType(StringOrNull(h.get("type")));
                handler.setReturnMode(StringOrNull(h.get("returnMode")));
                handler.setReturnValName(StringOrNull(h.get("returnValName")));
                
                handler.setArgPropagationListPath(StringOrNull(h.get("argPropagationListPath")));
                handler.setArgPropagationMode(StringOrNull(h.get("argPropagationMode")));                
                handler.setExplodedListPath(StringOrNull(h.has("explodedListPath")?h.get("explodedListPath"):null));
              
                if(
                   handler.getType() != null &&
                   handler.getType().compareToIgnoreCase("error-handler") == 0 &&
                   handler.getEnable() != null && 
                   handler.getEnable().compareToIgnoreCase("yes") == 0){
                    definition.setErrorHandler(handler);
                }else{
                    postActionHandlers.add(handler);
                }
            }
        }
        
        
        
        executionParameters = new ArrayList<DefinitionExecutionParameter>();
        this.definition.setExecutionParameters(executionParameters);
        
        //load parameters
        if(crudExecutable.has("execution_parameters")){
            JSONArray executionParams = crudExecutable.getJSONArray("execution_parameters");
            Iterator itr = executionParams.iterator();
            while(itr.hasNext()){
                JSONObject param = (JSONObject)itr.next();
                DefinitionExecutionParameter executionParam = new DefinitionExecutionParameter();
                
                executionParam.setId(StringOrNull(param.get("id")));
                executionParam.setName(StringOrNull(param.get("name")));
                executionParam.setType(StringOrNull(param.get("type")));
                executionParam.setRequired(StringOrNull(param.get("required")));
                executionParam.setIsFinal(StringOrNull(param.get("isFinal")));
                executionParam.setValidationRegEx(StringOrNull(param.get("validationRegEx")));
                executionParam.setDefaultValue(StringOrNull(param.get("defaultValue")));
                
                executionParam.setEvalLeft(StringOrNull(param.get("evalLeft")));
                executionParam.setEvalRight(StringOrNull(param.get("evalRight")));
                executionParam.setKeepAliveCount(StringOrNull(param.get("keepAliveCount")));
                
                executionParam.setMaxLength(StringOrNull(param.get("maxLength")));
                executionParam.setMinLength(StringOrNull(param.get("minLength")));
                executionParam.setLineEndLength(StringOrNull(param.get("lineEndLength")));
                executionParam.setMaxRange(StringOrNull(param.get("maxRange")));
                executionParam.setMinRange(StringOrNull(param.get("minRange")));
                executionParam.setDateFormat(StringOrNull(param.get("dateFormat")));
                executionParam.setDateFormatStrict(StringOrNull(param.get("dateFormatStrict")));
                executionParam.setAllowallschemesForURL(StringOrNull(param.get("allowallschemesForURL")));
                executionParam.setAllow2slashesForURL(StringOrNull(param.get("allow2slashesForURL")));
                executionParam.setNofragmentsForURL(StringOrNull(param.get("nofragmentsForURL")));
                executionParam.setSchemesForURL(StringOrNull(param.get("schemesForURL")));
                executionParameters.add(executionParam);
            }
        }
        
        
        accessControls = new ArrayList<DefinitionAccessControl>();
        this.definition.setAccessControls(accessControls);
        
        //preexecution handlers
        if(crudExecutable.has("accesscontrols")){
            Iterator itr = crudExecutable.getJSONArray("accesscontrols").iterator();
            while(itr.hasNext()){
                JSONObject accesscontrol = (JSONObject)itr.next();
                DefinitionAccessControl accessControl = new DefinitionAccessControl();
                
                
                accessControl.setId(StringOrNull(accesscontrol.get("id"))); 
                accessControl.setDefinitionId(StringOrNull(accesscontrol.get("definition_id")));
                 
                if(StringOrNull(accesscontrol.get("userIdentity")) != null && !accesscontrol.getString("userIdentity").isEmpty()){
                    LazyDynaBean userIdentity = (LazyDynaBean)caller.call(accesscontrol.getString("userIdentity"),caller.getArguments());
                    accessControl.setUserName(StringOrNull(userIdentity.get("userName")));
                    accessControl.setRole(StringOrNull(userIdentity.get("role")));
                }
                
                accessControls.add(accessControl);
            }
        }        
    }    
    
    public String getDescription() {
        return description;
    }

    public String getId() {
        return id;
    }


    public void setDescription(String description) {
        this.description = description;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDefinitionId() {
        return definitionId;
    }

    public ExecutableDefinition getDefinition() {
        return definition;
    }

    public List<DefinitionAccessControl> getAccessControls() {
        return accessControls;
    }

    public List<DefinitionExecutionParameter> getExecutionParameters() {
        return executionParameters;
    }

    public List<PostExecutionHandler> getPostActionHandlers() {
        return postActionHandlers;
    }

    public List<PreExecutionHandler> getPreActionHandlers() {
        return preActionHandlers;
    }

    public void setAccessControls(List<DefinitionAccessControl> accessControls) {
        this.accessControls = accessControls;
    }

    public void setDefinition(ExecutableDefinition definition) {
        this.definition = definition;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    public void setExecutionParameters(List<DefinitionExecutionParameter> executionParameters) {
        this.executionParameters = executionParameters;
    }

    public void setPostActionHandlers(List<PostExecutionHandler> postActionHandlers) {
        this.postActionHandlers = postActionHandlers;
    }

    public void setPreActionHandlers(List<PreExecutionHandler> preActionHandlers) {
        this.preActionHandlers = preActionHandlers;
    }
    public void onPostValidate(Executable caller){}
    

    public JSONObject getCrudExecutable() {
        return crudExecutable;
    }

    public void setCrudExecutable(JSONObject crudExecutable) {
        this.crudExecutable = crudExecutable;
    }

    public boolean isServerSide() {
        return serverSide;
    }

    public void setServerSide(boolean serverSide) {
        this.serverSide = serverSide;
    }

    public void setRequireAllIdentities(boolean requireAllIdentities){
    	this.requireAllIdentities = requireAllIdentities;
    }
  
    public boolean requireAllIdentities(){
    	return requireAllIdentities;
    }
  
    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }
  
    public void setTypeDefinition(LazyDynaBean typeDefinition){
      definition.setCrudType(StringOrNull(typeDefinition.get("crudType")));
      definition.setImplementorPath(StringOrNull(typeDefinition.get("implementorPath")));
      definition.setImplementorRefType(StringOrNull(typeDefinition.get("implementorRefType")));
      definition.setInitializerPath(StringOrNull(typeDefinition.get("initializerPath")));
      definition.setPostValidateHandlerPath(StringOrNull(typeDefinition.get("postValidateHandlerPath")));          
   }
}
