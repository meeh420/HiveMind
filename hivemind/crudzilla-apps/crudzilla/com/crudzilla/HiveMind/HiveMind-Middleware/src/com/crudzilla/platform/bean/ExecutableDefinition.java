/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

import java.util.List;

/**
 *
 * @author bitlooter
 */
public class ExecutableDefinition extends org.apache.commons.beanutils.LazyDynaBean{
    String id;
    String name;
    String description;    
    String lastModifiedTimeStamp;
    
    String crudType;
    String implementorPath;
    String implementorRefType;
    
    String initializerPath;
    String postValidateHandlerPath;
    
    PostExecutionHandler errorHandler;
  
    
    List<DefinitionExecutionParameter> executionParameters;
    List<DefinitionAccessControl> accessControls;
    
    List<PreExecutionHandler>preActionHandlers;
    List<PostExecutionHandler>postActionHandlers;
    
    
    
    public String getDescription() {
        return description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastModifiedTimeStamp() {
        return lastModifiedTimeStamp;
    }

    public void setLastModifiedTimeStamp(String lastModifiedTimeStamp) {
        this.lastModifiedTimeStamp = lastModifiedTimeStamp;
    }

        
    
    public List<DefinitionAccessControl> getAccessControls() {
        return accessControls;
    }

    public List<DefinitionExecutionParameter> getExecutionParameters() {
        return executionParameters;
    }

    public void setAccessControls(List<DefinitionAccessControl> accessControls) {
        this.accessControls = accessControls;
    }

    public void setExecutionParameters(List<DefinitionExecutionParameter> executionParameters) {
        this.executionParameters = executionParameters;
    }

    public List<PostExecutionHandler> getPostActionHandlers() {
        return postActionHandlers;
    }

    public List<PreExecutionHandler> getPreActionHandlers() {
        return preActionHandlers;
    }

    public void setPostActionHandlers(List<PostExecutionHandler> postActionHandlers) {
        this.postActionHandlers = postActionHandlers;
    }

    public void setPreActionHandlers(List<PreExecutionHandler> preActionHandlers) {
        this.preActionHandlers = preActionHandlers;
    }


    public String getCrudType() {
        return crudType;
    }

    public String getImplementorPath() {
        return implementorPath;
    }

    public String getImplementorRefType() {
        return implementorRefType;
    }

    public void setCrudType(String crudType) {
        this.crudType = crudType;
    }

    public void setImplementorPath(String implementorPath) {
        this.implementorPath = implementorPath;
    }

    public void setImplementorRefType(String implementorRefType) {
        this.implementorRefType = implementorRefType;
    }

    public String getInitializerPath() {
        return initializerPath;
    }

    public String getPostValidateHandlerPath() {
        return postValidateHandlerPath;
    }

    public void setInitializerPath(String initializerPath) {
        this.initializerPath = initializerPath;
    }

    public void setPostValidateHandlerPath(String postValidateHandlerPath) {
        this.postValidateHandlerPath = postValidateHandlerPath;
    }

    public PostExecutionHandler getErrorHandler() {
        return errorHandler;
    }

    public void setErrorHandler(PostExecutionHandler errorHandler) {
        this.errorHandler = errorHandler;
    }
    
    
}
