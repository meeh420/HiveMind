/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.connector.bean.ConnectorReference;
import com.crudzilla.platform.datastatement.bean.DataStatementReference;
import com.crudzilla.platform.emailsender.bean.EmailSenderReference;
import com.crudzilla.platform.fileuploader.bean.FileUploaderReference;
import com.crudzilla.platform.instantiator.bean.InstantiatorReference;
import com.crudzilla.platform.scriptexecutor.bean.ScriptExecutorReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.io.File;
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
public class Router{
    //static Logger       _logger = Logger.getLogger(Router.class.getName());
    private Log _logger           = LogFactory.getLog(Router.class);
    protected Map<String,Object>   _arguments;
    protected String               _resourcePath;
    protected HttpServletRequest   _request;
    protected HttpServletResponse  _response;    
    boolean   serverSide          = false;
    protected Invocation           caller;
    protected Crudzilla			   _crudEngine;
    
    public Router(){
        
    }
    
    public Router(Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        this._arguments      = arguments;
        
        this._request        = request;
        this._response       = response;
        this.serverSide      = serverSide;
        this.caller          = caller;
        _crudEngine			 = crudEngine;
    }    
    
    public Router(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        this._arguments      = arguments;
        this._resourcePath   = resourcePath;
        
        this._request        = request;
        this._response       = response;
        this.serverSide      = serverSide;
        this.caller          = caller;
        _crudEngine			 = crudEngine;
        //super(method,resourcePath,arguments,request,response);
    }
    
    
    public Object execute(){        
        return route();
    }
    
    
    
    void resolveRelativeURL() throws Exception{
        if(_resourcePath != null && !_resourcePath.startsWith("/")){

            if(caller != null && caller.getResourcePath().lastIndexOf("/") != -1){
                String conRelPath = new File(caller.getResourcePath().substring(0,caller.getResourcePath().lastIndexOf("/")+1)+_resourcePath).getCanonicalPath().replace("\\","/");
                
                //remove windows drive letter part of the path
                if(conRelPath.indexOf(':') != -1)
                    conRelPath = conRelPath.substring(conRelPath.indexOf(':')+1);
              
              	_logger.info("caller:"+caller.getResourcePath()+" conRelPath:"+conRelPath);
              
                File file = CrudzillaUtil.getCrudFile(caller.getCrudEngine(),conRelPath);
                if(file != null && file.exists())
                    _resourcePath = conRelPath;
            }
            else
            _resourcePath = "/"+_resourcePath;                
        }
    }
    
    Object route(){
        
        //this is a hack to prevent logging log related calls, it pollutes the log file
        if(!_crudEngine.turnOffLogging)
             _logger.info("START invoking resource \""+_resourcePath);

        try
        {            
            //if a url alias is used, retrieve actual path
            if(_crudEngine.engineInitialized && 
               _crudEngine.sysSettings().get("crudzilla_url_mapper") != null){
              
                Map urlMapper = (Map)_crudEngine.sysSettings().get("crudzilla_url_mapper");
              
                if(urlMapper.get(_resourcePath) != null && 
                !urlMapper.get(_resourcePath).toString().isEmpty()){
                  
                    _resourcePath = urlMapper.get(_resourcePath).toString();
                }
            }
            
            //resolve the url if it is relative to caller            
            resolveRelativeURL();

            if(!_crudEngine.turnOffLogging)
                _logger.info("START invoking resolved resource \""+_resourcePath);
            
            
            if(this._resourcePath.endsWith(".stm")){
                return new DataStatement(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".esd")){
                return new EmailSender(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".upl")){
                return new FileUploader(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".svc")){
                return new HttpConnector(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".ste")){                
                return new ScriptExecutor(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".ins")){
                return new Instantiator(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }
            else
            if(this._resourcePath.endsWith(".crud")){
                return new Executable(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).execute();
            }            
            else
            {
                return new NonExecutable(_resourcePath,_arguments,_request,_response,_crudEngine).execute();
            }        
        }catch(Exception ex){
            _logger.error("Unknown Exception occured",ex);
          
            Map returnVal = new HashMap();
            returnVal.put("crudzilla_status", "error");
            returnVal.put("message","Unknown Exception occured");
            //returnVal.put("exception",ex);
            return returnVal;              
        }
    }
    
    
    
    public Object execute(ExecutableDefinitionReference ref){
        
        
        try
        {
            _resourcePath = ref.getBasePath();
            resolveRelativeURL();            
            
            _logger.info("running dynamic crud:"+_resourcePath);
            
            if(ref instanceof DataStatementReference){
                return new DataStatement(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof ScriptExecutorReference){                
                return new ScriptExecutor(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof InstantiatorReference){
                return new Instantiator(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof FileUploaderReference){
                return new FileUploader(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof EmailSenderReference){
                return new EmailSender(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof ConnectorReference){
                return new HttpConnector(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            else
            if(ref instanceof ExecutableDefinitionReference){
                return new Executable(_resourcePath,_arguments,_request,_response,serverSide,caller,_crudEngine).run(ref);
            }
            
            Map returnVal = new HashMap();
            returnVal.put("crudzilla_status", "404");
            return returnVal;
        }catch(Exception ex){
            _logger.error(ex);
            Map returnVal = new HashMap();
            returnVal.put("crudzilla_status", "error");
            returnVal.put("message","Unknown Exception occured");
            //returnVal.put("exception",ex);
            return returnVal;            
        }
    }



    public Map<String, Object> getArguments() {
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


    public void setArguments(Map<String, Object> _arguments) {
        this._arguments = _arguments;
    }

    public void setRequest(HttpServletRequest _request) {
        this._request = _request;
    }

    public void setResourcePath(String _resourcePath) {
        this._resourcePath = _resourcePath;
    }

    public void setResponse(HttpServletResponse _response) {
        this._response = _response;
    }
}
