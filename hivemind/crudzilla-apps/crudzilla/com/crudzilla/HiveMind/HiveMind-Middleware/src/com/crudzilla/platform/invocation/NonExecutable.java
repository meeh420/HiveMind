/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.util.AssetFSManager;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class NonExecutable extends Invocation{
    //static Logger       _logger = Logger.getLogger(NonExecutable.class.getName());    
    private static Log _logger = LogFactory.getLog(NonExecutable.class);
    
    public NonExecutable(){
        
    }
    
    public NonExecutable(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,Crudzilla crudEngine){
        super(resourcePath,arguments,request,response,crudEngine);
    }    
    

    public Object execute() throws Exception{
        
        try{
            if(/*Crudzilla.staticFileServer() != null*/true){
                //Crudzilla.staticServer().handle(_resourcePath,null,_request,_response);   
                _logger.info("serving:"+getResourcePath());
                return _crudEngine.staticFileServer().processRequest(_request, _response, true,getResourcePath(),_arguments,(Invocation)this);
            }
        }catch(Exception ex){
            _logger.error("Error serving static file",ex);
        }
        
        Map returnVal = new HashMap();
        returnVal.put("crudzilla_status", "404");
        return returnVal;
    }
}
