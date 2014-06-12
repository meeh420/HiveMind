/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author bitlooter
 */
public class TopoSortable {
    String             id;
    List<TopoSortable> children = new ArrayList();
    TopoSortable       parent;
    TopoSortable       preSibling;
    
    String             parentId;
    String             preSiblingId;
    
    
    public TopoSortable(){
        
    }
    
    public TopoSortable(String id){
        super();
        this.id = id;
    }    
    
    public TopoSortable(TopoSortable ts){
        this.id           = ts.id;
        this.children     = ts.children;
        this.parent       = ts.parent;
        this.parentId     = ts.parentId;
        this.preSibling   = ts.preSibling;
        this.preSiblingId = ts.preSiblingId;
    }
    
    public String getId(){
        return id;
    }
    
    public void setId(String id){
        this.id = id;
    }
        
    public static int getIndex(String id,List<TopoSortable>sortables){
        if(id == null || id.isEmpty() || id.compareTo("0") == 0)return 0;
        
        for(int i=0;i<sortables.size();i++)
            if(sortables.get(i).getId().compareTo(id) == 0)
                return i+1;
        return -1;
    }

    public List<TopoSortable> getChildren() {
        return children;
    }

    public TopoSortable getParent() {
        return parent;
    }

    public void setChildren(List<TopoSortable> children) {
        this.children = children;
    }

    public void setParent(TopoSortable parent) {
        this.parent = parent;
    }

    public TopoSortable getPreSibling() {
        return preSibling;
    }

    public void setPreSibling(TopoSortable preSibling) {
        this.preSibling = preSibling;
    }

    public String getParentId() {
        return parentId;
    }

    public String getPreSiblingId() {
        return preSiblingId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public void setPreSiblingId(String preSiblingId) {
        this.preSiblingId = preSiblingId;
    }
}
