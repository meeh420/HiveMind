/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.bean;

/**
 *
 * @author bitlooter
 */
public class DefinitionReference {
    String referenceId;
    String definitionId;
    String path;
    String lastRefreshTimeStamp;
    
    public String getDefinitionId() {
        return definitionId;
    }

    public String getPath() {
        return path;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getLastRefreshTimeStamp() {
        return lastRefreshTimeStamp;
    }

    public void setLastRefreshTimeStamp(String lastRefreshTimeStamp) {
        this.lastRefreshTimeStamp = lastRefreshTimeStamp;
    }
}
