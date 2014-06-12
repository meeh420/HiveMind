/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

/**
 *
 * @author bitlooter
 */
public class ErrorWrapper {
    public Exception exception;
    public String    errorType;
    public String    errorSource;
    public Object    errorData;
    public ErrorWrapper(Exception exception,String errorType,String errorSource){
        this.exception   = exception;
        this.errorSource = errorSource;
        this.errorType   = errorType;
    }
}
