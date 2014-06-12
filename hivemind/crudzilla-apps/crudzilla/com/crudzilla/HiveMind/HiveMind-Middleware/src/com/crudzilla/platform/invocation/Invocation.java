/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.util.HashMap;
import java.util.Map;
import java.io.File;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class Invocation {
    private static Log _logger = LogFactory.getLog(Invocation.class);
    
    protected Map<String,Object>   _arguments;
    private   Map<String,Object>   _callArguments;
    private String                 _resourcePath;
    protected HttpServletRequest   _request;
    protected HttpServletResponse  _response;
    protected String               _userName;
    protected Object               _result;
    protected Object               _returnVal;
    protected Crudzilla			   _crudEngine;
    protected boolean              serverSide = false;
    protected Crudzilla  		   activeCrudModule;
  
    public Invocation(){
        
    }
    
    public Invocation(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,Crudzilla crudEngine){
        this._arguments      = arguments;
        this._resourcePath   = resourcePath;
        
        this._request        = request;
        this._response       = response;
      
        if(request != null)
            this._userName       = request.getUserPrincipal() != null?request.getUserPrincipal().getName():null;        
      
        _crudEngine = crudEngine;
    }
    

    public Map<String,Object> getArguments() {
        return _arguments;
    }

    public HttpServletRequest getRequest() {
        return _request;
    }

    public String getResourcePath() {
        return _resourcePath;
    }

    public HttpServletResponse getResponse() {
        return _response;
    }

    public String getUserName() {
        return _userName;
    }

    public void setArguments(Map<String,Object> _arguments) {
        this._arguments = _arguments;
    }

    public void setRequest(HttpServletRequest _request) {
        this._request = _request;
    }


    public void setResponse(HttpServletResponse _response) {
        this._response = _response;
    }

    public void setUserName(String _userName) {
        this._userName = _userName;
    }

    public Object getResult() {
        return _result;
    }

    public void setResult(Object result) {
        this._result = result;
    }   
  
    public Crudzilla getActiveCrudModule(){
      return activeCrudModule; 
    }
    
    public void setActiveCrudModule(Crudzilla activeCrudModule){
      this.activeCrudModule = activeCrudModule; 
    }  
  
    class ChainedInvocationWrapper extends Invocation {
        Map arguments;
        Invocation caller;
        
      
        public ChainedInvocationWrapper(Invocation caller){
            this.caller= caller;
            arguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),caller.getArguments());
        }
        public Map getArguments(){
            return arguments;
        }

        public Invocation getCaller(){
            return caller;
        }
    }    
    
    
    public Invocation add(String key,Object val){
        
        if(this instanceof ChainedInvocationWrapper)
            ((ChainedInvocationWrapper)this).getArguments().put(key, val);
        else{
            ChainedInvocationWrapper thisWrapper = new ChainedInvocationWrapper(this);
            thisWrapper.getArguments().put(key, val);
            return thisWrapper;
        }
        return this;
    }    
  
    public Invocation using(String moduleName){
      
      Crudzilla  engine = getCrudEngine();
      Invocation caller = this;
      
      if(this instanceof ChainedInvocationWrapper){
        engine = ((ChainedInvocationWrapper)this).getCaller().getCrudEngine();
        caller = ((ChainedInvocationWrapper)this).getCaller();
      }
        
      
      
      String modulePath = moduleName;
      
      //use application supplied module configuration if present
      //when the path is relative
      if(engine.sysSettings().get("crudzilla_module_base") != null && 
         !engine.sysSettings().get("crudzilla_module_base").toString().isEmpty() &&
        !moduleName.startsWith("/") && moduleName.indexOf(':') == -1){
        
        modulePath = engine.sysSettings().get("crudzilla_module_base")+"/"+moduleName+"/web";
      }
      else//assume this is a standard crudzilla appserver installation
      if(!moduleName.startsWith("/") && moduleName.indexOf(':') == -1){
        
         if(moduleName.indexOf("/") == -1)//use default module location
            modulePath = engine.getAppServerHome()+"/crudzilla-modules/"+moduleName+"/web";
         else
         {//assume relative to asset base
            
           try
           {
			 String assetBaseDir = new File(caller.appBaseDir()+"/"+engine.sysSettings().get("crudzilla_asset_base")).getCanonicalPath();           
             modulePath = assetBaseDir+"/"+moduleName+"/web";
           }catch(Exception e){
             _logger.error(e);
           }
         }        
      }else{//absolute module path
        modulePath = moduleName+"/web";          
      }
      
      Crudzilla module = engine.getCrudModuleCache().get(modulePath);
      
      if(module != null)
         caller.setActiveCrudModule(module);
      else
      {
         caller.setActiveCrudModule(new Crudzilla(engine,modulePath));
        
         //cache for future use
  		 engine.getCrudModuleCache().put(modulePath,caller.getActiveCrudModule());
      }      
      return this;
    }
  
  
    public Invocation using(Crudzilla module){
      
      Crudzilla  engine = getCrudEngine();
      Invocation caller = this;
      
      if(this instanceof ChainedInvocationWrapper){
        engine = ((ChainedInvocationWrapper)this).getCaller().getCrudEngine();
        caller = ((ChainedInvocationWrapper)this).getCaller();
      }      
      caller.setActiveCrudModule(module);
      return this;
    }
    
    public Object call(String refPath){           
       return call(refPath,(this instanceof ChainedInvocationWrapper)?
                   ((ChainedInvocationWrapper)this).getArguments():
                   CrudzillaUtil.newArgumentMap(_crudEngine,_arguments),true);
    }
    
  
    public Object call(String refPath,boolean serverSide){
       return call(refPath,(this instanceof ChainedInvocationWrapper)?
                   ((ChainedInvocationWrapper)this).getArguments():
                   CrudzillaUtil.newArgumentMap(_crudEngine,_arguments),serverSide);
    }
    
    public Object call(String refPath,Map<String,Object> arguments){
       return call(refPath,arguments,true);
    }
    
    
    public Object call(String refPath,Map<String,Object> arguments,boolean serverSide){
      
        
        if(this instanceof ChainedInvocationWrapper){
           
            return ((ChainedInvocationWrapper)this).getCaller().call(refPath,arguments,serverSide);
        }
        else
        if(activeCrudModule != null){//call to a module
                
            Object  sys = arguments.get("crudzilla_system_settings");
            
            //might cause problems
            if(sys != null)
              arguments.remove("crudzilla_system_settings");                
            
            Object r = activeCrudModule.execute(refPath,arguments,serverSide,/*null*/this);
            activeCrudModule = null;
            
            
            if(sys != null)
              arguments.put("crudzilla_system_settings",sys);
            
            return r;
          }
      	  else
          return this.execute(refPath, arguments,serverSide);
    }
  
    Object execute(String resourcePath,Map<String,Object> arguments){
        return execute(resourcePath,arguments,true);
    }    
    
    Object execute(String resourcePath,Map<String,Object> arguments,boolean serverSide){
        Object returnVal = new Router(resourcePath,arguments,(HttpServletRequest)arguments.get("httpRequest"),(HttpServletResponse)arguments.get("httpResponse"),serverSide,this,_crudEngine).execute();
        return returnVal;
    }  
  
    /**************************using reference instances*******************/
    public Object call(ExecutableDefinitionReference ref){        
       return call(ref,(this instanceof ChainedInvocationWrapper)?
                   ((ChainedInvocationWrapper)this).getArguments():
                   CrudzillaUtil.newArgumentMap(_crudEngine,_arguments),true);
    }
  
  
    public Object call(ExecutableDefinitionReference ref,boolean serverSide){        
       return call(ref,(this instanceof ChainedInvocationWrapper)?
                   ((ChainedInvocationWrapper)this).getArguments():
                   CrudzillaUtil.newArgumentMap(_crudEngine,_arguments),serverSide);
    }  
    
    
    public Object call(ExecutableDefinitionReference ref,Map<String,Object> arguments){       
       return call(ref,arguments,true);
    }
    
  
    public Object call(ExecutableDefinitionReference ref,Map<String,Object> arguments,boolean serverSide){
      
       
       if(this instanceof ChainedInvocationWrapper){
         
            return ((ChainedInvocationWrapper)this).getCaller().call(ref,arguments,serverSide);
       }
       else
       if(activeCrudModule != null){//call to a module
                            
           Object  sys = arguments.get("crudzilla_system_settings");
           
           //might cause problems
           if(sys != null)
             arguments.remove("crudzilla_system_settings");
           
           Object r = activeCrudModule.execute(ref,arguments,serverSide,/*null*/this);
           activeCrudModule = null;
           
           if(sys != null)
             arguments.put("crudzilla_system_settings",sys);  
           
           return r;
         }
         else
         return this.execute(ref, arguments,serverSide);
    }   
  
    
    Object execute(ExecutableDefinitionReference ref,Map<String,Object> arguments){
        return execute(ref,arguments,true);
    }    
  
  
    Object execute(ExecutableDefinitionReference ref,Map<String,Object> arguments, boolean serverSide){
        Object returnVal = new Router(arguments,(HttpServletRequest)arguments.get("httpRequest"),(HttpServletResponse)arguments.get("httpResponse"),serverSide,this,_crudEngine).execute(ref);
        return returnVal;
    }  
        
    public Crudzilla getCrudEngine(){
    	return _crudEngine;
    }
    
    public Log logger(){
        return _logger;
    }
    
    public CrudzillaUtil util()throws Exception{
        return _crudEngine.getCrudzillaUtil();
    }
    
    public String appBaseDir(){
        return _crudEngine.getCrudHomeDir();
    }
}
