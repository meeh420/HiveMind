/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

/**
 *
 * @author bitlooter
 */
public class PreExecutionHandler {
    String definitionId;
    String id;
    String onlyProceedOnTrue;
  	String returnMode;
    String returnValName;
    String path;
    String enable;
    String argumentPropagationMode;

    String argPropagationListPath;
  	String explodedListPath;
    String argPropagationMode;
    
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

    public String getOnlyProceedOnTrue() {
        return onlyProceedOnTrue;
    }

    public String getPath() {
        return path;
    }

    public String getReturnValName() {
        return returnValName;
    }

    public void setReturnValName(String returnValName) {
        this.returnValName = returnValName;
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

    public void setOnlyProceedOnTrue(String onlyProceedOnTrue) {
        this.onlyProceedOnTrue = onlyProceedOnTrue;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getArgumentPropagationMode() {
        return argumentPropagationMode;
    }

    public void setArgumentPropagationMode(String argumentPropagationMode) {
        this.argumentPropagationMode = argumentPropagationMode;
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
  
    public String getReturnMode() {
        return returnMode;
    }  
  
    public void setReturnMode(String returnMode) {
        this.returnMode = returnMode;
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
