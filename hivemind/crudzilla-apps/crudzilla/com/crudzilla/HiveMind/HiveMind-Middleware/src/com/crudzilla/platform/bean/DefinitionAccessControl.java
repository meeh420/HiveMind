/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

/**
 *
 * @author bitlooter
 */
public class DefinitionAccessControl{
    String definitionId;
    String id;
    String userIdentity;
    String userName;
    String role;
    String position;
    
    public String getDefinitionId() {
        return definitionId;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    public String getId() {
        return id;
    }

    public String getPosition() {
        return position;
    }

    public String getUserIdentity() {
        return userIdentity;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public void setUserIdentity(String userIdentity) {
        this.userIdentity = userIdentity;
    }

    public String getRole() {
        return role;
    }

    public String getUserName() {
        return userName;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
