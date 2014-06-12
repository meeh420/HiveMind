/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datastatement.bean;

import com.crudzilla.platform.datamodel.bean.DataModelField;

/**
 *
 * @author bitlooter
 */
public class DataStatementResultSetMap {
    String dataStatementId;
    String columnName;
    DataModelField field;

    public String getColumnName() {
        return columnName;
    }

    public String getDataStatementId() {
        return dataStatementId;
    }

    public DataModelField getField() {
        return field;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public void setDataStatementId(String dataStatementId) {
        this.dataStatementId = dataStatementId;
    }

    public void setField(DataModelField field) {
        this.field = field;
    }    
}
