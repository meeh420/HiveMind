/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datatable.bean;

/**
 *
 * @author bitlooter
 */
public class DataTableColumnSpace {
    String dataTableId;
    String id;
    int initialCount;
    int incrementalCount;
    String sqlDefinition;

    public String getDataTableId() {
        return dataTableId;
    }

    public String getId() {
        return id;
    }

    public int getIncrementalCount() {
        return incrementalCount;
    }

    public int getInitialCount() {
        return initialCount;
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

    public void setIncrementalCount(int incrementalCount) {
        this.incrementalCount = incrementalCount;
    }

    public void setInitialCount(int initialCount) {
        this.initialCount = initialCount;
    }

    public void setSqlDefinition(String sqlDefinition) {
        this.sqlDefinition = sqlDefinition;
    }    
}
