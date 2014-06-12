/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datastatement.bean;

/**
 *
 * @author bitlooter
 */
public final class ExecutablePreparedDataStatement {
    Object[] arguments;
    DataStatement dataStatement;
    
    public Object[] getArguments() {
        return arguments;
    }

    public void setArguments(Object[] arguments) {
        this.arguments = arguments;
    }

    public DataStatement getDataStatement() {
        return dataStatement;
    }

    public void setDataStatement(DataStatement dataStatement) {
        this.dataStatement = dataStatement;
    }
}
