/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datastatement.bean;

/**
 *
 * @author bitlooter
 */
public class PreparedStatementWarning {
    String type;
    String brokenReference;
    int startIndex;
    int endIndex;

    public String getBrokenReference() {
        return brokenReference;
    }

    public int getEndIndex() {
        return endIndex;
    }

    public int getStartIndex() {
        return startIndex;
    }

    public String getType() {
        return type;
    }

    public void setBrokenReference(String brokenReference) {
        this.brokenReference = brokenReference;
    }

    public void setEndIndex(int endIndex) {
        this.endIndex = endIndex;
    }

    public void setStartIndex(int startIndex) {
        this.startIndex = startIndex;
    }

    public void setType(String type) {
        this.type = type;
    }
    
}
