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
public class ExecutionActionHandler {
    String definitionId;
    String id;
    String path;
    String type;
    String returnValName;
    String description;
    String enabled;
    String name;
    String allowOverride;
    String override;
    String returnValAsArg;
    String invokedBy;
    String returnResponse;
    String appendResult;
    String reverseDependency;
    Object returnVal;
    ExecutionActionHandler parent;
    java.util.List<ExecutionActionHandler> children;
    
    public String getReturnResponse() {
        return returnResponse;
    }

    public void setReturnResponse(String returnResponse) {
        this.returnResponse = returnResponse;
    }
    
        
    public String getDefinitionId() {
        return definitionId;
    }

    public String getDescription() {
        return description;
    }

    public String getEnabled() {
        return enabled;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public String getReturnValName() {
        return returnValName;
    }

    public String getType() {
        return type;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEnabled(String enabled) {
        this.enabled = enabled;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setReturnValName(String returnValName) {
        this.returnValName = returnValName;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAllowOverride() {
        return allowOverride;
    }

    public String getOverride() {
        return override;
    }

    public void setAllowOverride(String allowOverride) {
        this.allowOverride = allowOverride;
    }

    public void setOverride(String override) {
        this.override = override;
    }

    public String getReturnValAsArg() {
        return returnValAsArg;
    }

    public void setReturnValAsArg(String returnValAsArg) {
        this.returnValAsArg = returnValAsArg;
    }

    public String getInvokedBy() {
        return invokedBy;
    }

    public void setInvokedBy(String invokedBy) {
        this.invokedBy = invokedBy;
    }

    public String getAppendResult() {
        return appendResult;
    }

    public String getReverseDependency() {
        return reverseDependency;
    }

    public void setAppendResult(String appendTo) {
        this.appendResult = appendTo;
    }

    public void setReverseDependency(String reverseDependency) {
        this.reverseDependency = reverseDependency;
    }

    public Object getReturnVal() {
        return returnVal;
    }

    public void setReturnVal(Object returnVal) {
        this.returnVal = returnVal;
    }

    public List<ExecutionActionHandler> getChildren() {
        return children;
    }

    public ExecutionActionHandler getParent() {
        return parent;
    }

    public void setChildren(List<ExecutionActionHandler> children) {
        this.children = children;
    }

    public void setParent(ExecutionActionHandler parent) {
        this.parent = parent;
    }
}
