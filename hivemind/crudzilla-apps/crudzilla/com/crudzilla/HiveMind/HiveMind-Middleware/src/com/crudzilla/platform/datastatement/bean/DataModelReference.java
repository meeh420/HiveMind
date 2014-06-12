package com.crudzilla.platform.datastatement.bean;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



/**
 *
 * @author bitlooter
 */
public class DataModelReference {
    String dataStatementId;
    String dataModelId;
    String alias;

    public String getAlias() {
        return alias;
    }

    public String getDataModelId() {
        return dataModelId;
    }

    public String getDataStatementId() {
        return dataStatementId;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public void setDataModelId(String dataModelId) {
        this.dataModelId = dataModelId;
    }

    public void setDataStatementId(String dataStatementId) {
        this.dataStatementId = dataStatementId;
    }    
}
