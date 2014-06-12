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
public class DataModelField /*extends LazyDynaBean*/{
    String dataModelId;
    String id;
    String name;
    String type;
    String useAsLabel;
    DataModelFieldColumn column;
    
    public String getDataModelId() {
        return dataModelId;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public void setDataModelId(String dataModelId) {
        this.dataModelId = dataModelId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public DataModelFieldColumn getColumn() {
        return column;
    }

    public void setColumn(DataModelFieldColumn column) {
        this.column = column;
    }

    public String getUseAsLabel() {
        return useAsLabel;
    }

    public void setUseAsLabel(String useAsLabel) {
        this.useAsLabel = useAsLabel;
    }
}
