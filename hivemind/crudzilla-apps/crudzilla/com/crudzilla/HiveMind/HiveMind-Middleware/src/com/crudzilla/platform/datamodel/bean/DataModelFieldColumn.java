/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datamodel.bean;

import org.apache.commons.beanutils.LazyDynaBean;

/**
 *
 * @author bitlooter
 */
public class DataModelFieldColumn  /*extends LazyDynaBean*/{
    String id;
    String dataTableId;
    String name;
    String sqlDefinition;
    String mapped;

    public String getDataTableId() {
        return dataTableId;
    }

    public String getId() {
        return id;
    }

    public String getMapped() {
        return mapped;
    }

    public String getName() {
        return name;
    }

    public String getSqlDefinition() {
        return sqlDefinition;
    }

    public void setDataTableId(String dataTableId) {
        this.dataTableId = dataTableId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setMapped(String mapped) {
        this.mapped = mapped;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSqlDefinition(String sqlDefinition) {
        this.sqlDefinition = sqlDefinition;
    }    
}
