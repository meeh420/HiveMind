/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.bean;

/**
 *
 * @author bitlooter
 */
public class DataSourceReference {
    String id;
    String name;
    String jndiPath;

    public String getId() {
        return id;
    }

    public String getJndiPath() {
        return jndiPath;
    }

    public String getName() {
        return name;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setJndiPath(String jndiPath) {
        this.jndiPath = jndiPath;
    }

    public void setName(String name) {
        this.name = name;
    }
}
