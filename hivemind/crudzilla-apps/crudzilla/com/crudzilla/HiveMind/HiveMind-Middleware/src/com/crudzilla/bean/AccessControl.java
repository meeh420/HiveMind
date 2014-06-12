/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.bean;

/**
 *
 * @author bitlooter
 */
public class AccessControl {
    String  id;
    String  roleId;
    String  userId;
    String  createAccess;
    String  readAccess;
    String  writeAccess;
    String  deleteAccess;
    String  executeAccess;
    String  extendedAccess;
    String  position;

    public String getDeleteAccess() {
        return deleteAccess;
    }

    public String getExecuteAccess() {
        return executeAccess;
    }

    public String getExtendedAccess() {
        return extendedAccess;
    }

    public String getReadAccess() {
        return readAccess;
    }

    public String getRoleId() {
        return roleId;
    }

    public String getUserId() {
        return userId;
    }

    public String getWriteAccess() {
        return writeAccess;
    }

    public void setDeleteAccess(String deleteAccess) {
        this.deleteAccess = deleteAccess;
    }

    public void setExecuteAccess(String executeAccess) {
        this.executeAccess = executeAccess;
    }

    public void setExtendedAccess(String extendedAccess) {
        this.extendedAccess = extendedAccess;
    }

    public void setReadAccess(String readAccess) {
        this.readAccess = readAccess;
    }

    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setWriteAccess(String writeAccess) {
        this.writeAccess = writeAccess;
    }

    public String getCreateAccess() {
        return createAccess;
    }

    public void setCreateAccess(String createAccess) {
        this.createAccess = createAccess;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}
