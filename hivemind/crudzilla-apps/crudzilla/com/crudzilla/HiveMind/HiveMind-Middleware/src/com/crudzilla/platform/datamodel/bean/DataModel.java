/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datamodel.bean;

import java.util.List;
import org.apache.commons.beanutils.LazyDynaBean;

/**
 *
 * @author bitlooter
 */
public class DataModel  /*extends LazyDynaBean*/{
    String id;
    String name;
  	String alias;
    String activeAlias;
    String description;  
    int    typeFieldId;
    String typeIdentifier;

    DataTable dataTable;
    int    index;
    List<DataModelField> fields;

    boolean usingAlias = false;
  
    public void setUsingAlias(boolean usingAlias){
      this.usingAlias = usingAlias;
    }
  
    public boolean isUsingAlias(){return usingAlias;};
  
    public void setActiveAlias(String activeAlias){
      this.activeAlias = activeAlias;
    }
  
    public String getActiveAlias(){ return activeAlias;}
  
    public String getId() {
        return id;
    }

    public int getTypeFieldId() {
        return typeFieldId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTypeFieldId(int typeFieldId) {
        this.typeFieldId = typeFieldId;
    }

    public String getDescription() {
        return description;
    }

    public String getName() {
        return name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAlias(String alias){
      this.alias = alias;
    }
  
    public String getAlias(){return alias;}
  
    public DataTable getDataTable() {
        return dataTable;
    }

    public void setDataTable(DataTable dataTableId) {
        this.dataTable = dataTableId;
    }

    public int getIndex() {
        return index;
    }


    public void setIndex(int index) {
        this.index = index;
    }

    public void setFields(List<DataModelField> fields) {
        this.fields = fields;
    }

    public List<DataModelField> getFields() {
        return fields;
    }
  
    public void setTypeIdentifier(String typeIdentifier){
       this.typeIdentifier = typeIdentifier;
    }
  
    public String getTypeIdentifier(){
       return typeIdentifier;    
    }
}
