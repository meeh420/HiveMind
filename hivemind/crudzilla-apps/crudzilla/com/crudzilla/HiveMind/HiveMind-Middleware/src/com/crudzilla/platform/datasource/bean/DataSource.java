/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datasource.bean;

import org.apache.commons.beanutils.LazyDynaBean;

/**
 *
 * @author bitlooter
 */
public class DataSource {
    String id;
    String name;
    String jndiPath;
    String enabled;
    org.apache.commons.beanutils.LazyDynaBean config;
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

    public String getEnabled() {
        return enabled;
    }

    public void setEnabled(String enabled) {
        this.enabled = enabled;
    }

    public LazyDynaBean getConfig() {
        return config;
    }

    public void setConfig(LazyDynaBean config) {
        this.config = config;
    }
}
