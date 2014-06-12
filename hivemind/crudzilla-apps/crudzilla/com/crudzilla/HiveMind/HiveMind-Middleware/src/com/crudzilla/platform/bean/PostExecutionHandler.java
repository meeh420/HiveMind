/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

/**
 *
 * @author bitlooter
 */
public class PostExecutionHandler {
    String definitionId;
    String id;
    String enable;
    String type;
    String returnMode;
    String returnValName;
    String path;
    String evalReturnValName;
    String argumentPropagationMode;
    
    String argPropagationListPath;  
    String argPropagationMode;
    
  	String explodedListPath;
  
    String primaryResultVarName;
    String position;
    
    public String getDefinitionId() {
        return definitionId;
    }

    public String getEnable() {
        return enable;
    }

    public String getId() {
        return id;
    }

    public String getPath() {
        return path;
    }

    public String getReturnMode() {
        return returnMode;
    }

    public String getReturnValName() {
        return returnValName;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    public void setEnable(String enable) {
        this.enable = enable;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setReturnMode(String returnMode) {
        this.returnMode = returnMode;
    }

    public void setReturnValName(String returnValName) {
        this.returnValName = returnValName;
    }

    public String getEvalReturnValName() {
        return evalReturnValName;
    }

    public void setEvalReturnValName(String evalReturnValName) {
        this.evalReturnValName = evalReturnValName;
    }

    public String getArgumentPropagationMode() {
        return argumentPropagationMode;
    }

    public void setArgumentPropagationMode(String argumentPropagationMode) {
        this.argumentPropagationMode = argumentPropagationMode;
    }

    public String getPrimaryResultVarName() {
        return primaryResultVarName;
    }

    public void setPrimaryResultVarName(String primaryResultVarName) {
        this.primaryResultVarName = primaryResultVarName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getArgPropagationListPath() {
        return argPropagationListPath;
    }

    public String getArgPropagationMode() {
        return argPropagationMode;
    }

    public void setArgPropagationListPath(String argPropagationListPath) {
        this.argPropagationListPath = argPropagationListPath;
    }

    public void setArgPropagationMode(String argPropagationMode) {
        this.argPropagationMode = argPropagationMode;
    }
  
  
    public void setExplodedListPath(String explodedListPath){
    	this.explodedListPath = explodedListPath;
    }
  
    public String getExplodedListPath(){
    	return explodedListPath;
    }  

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}
