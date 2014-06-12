/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.bean;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author bitlooter
 */
public class CrudzillaHttpRequestContext {
    HttpServletRequest   httpRequest;
    HttpServletResponse  httpResponse;
    Map<String,Integer>  argumentScopeCounter;
    
    public CrudzillaHttpRequestContext(){
        argumentScopeCounter  = new HashMap<String,Integer>();
    }  
    
    public CrudzillaHttpRequestContext(HttpServletRequest httpRequest,
                                       HttpServletResponse  httpResponse){
        this();
        this.httpRequest      = httpRequest;
        this.httpResponse     = httpResponse;
    }

    /*
    public Map<String, Integer> getArgumentScopeCounter() {
        return argumentScopeCounter;
    }*/

    public HttpServletRequest getHttpRequest() {
        return httpRequest;
    }

    public HttpServletResponse getHttpResponse() {
        return httpResponse;
    }
    /*
    public void setArgumentScopeCounter(Map<String, Integer> argumentScopeCounter) {
        this.argumentScopeCounter = argumentScopeCounter;
    }*/

    public void setHttpRequest(HttpServletRequest httpRequest) {
        this.httpRequest = httpRequest;
    }

    public void setHttpResponse(HttpServletResponse httpResponse) {
        this.httpResponse = httpResponse;
    }
    /*
    public void addArgumentLifeCount(String name,String count){
        if(count != null && !count.isEmpty() && count.compareTo("0") != 0)
            argumentScopeCounter.put(name, new Integer(count));
    }
    
    public int countDownArgumentLife(String name){
        if(argumentScopeCounter.get(name) != null){
            Integer i = (argumentScopeCounter.get(name).intValue()-1);
            if(i == 0)
                argumentScopeCounter.remove(name);
            else
                argumentScopeCounter.put(name, i);
            return i;
        }return 0;
    }*/
}
