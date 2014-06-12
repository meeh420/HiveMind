/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datamodel.bean;

/**
 *
 * @author bitlooter
 */
public class DataTable {
    String id;
    String dataSource;
    String name;
    String createSqlStatement;

    public String getCreateSqlStatement() {
        return createSqlStatement;
    }

    public String getDataSource() {
        return dataSource;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setCreateSqlStatement(String createSqlStatement) {
        this.createSqlStatement = createSqlStatement;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }
}
