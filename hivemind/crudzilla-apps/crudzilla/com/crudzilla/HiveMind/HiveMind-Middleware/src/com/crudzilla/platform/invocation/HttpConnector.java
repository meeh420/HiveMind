/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.connector.bean.ConnectorReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class HttpConnector extends Executable{
    //static Logger       _logger = Logger.getLogger(HttpConnectorImpl.class.getName());
    private static Log _logger = LogFactory.getLog(HttpConnector.class);
    
    public HttpConnector(){
        
    }
    
    public HttpConnector(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        super(resourcePath,arguments,request,response,serverSide,caller,crudEngine);
    }
   
    

    
    @Override
    public Object execute()throws Exception{
        Map returnVal;
        
        try
        {         
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
            if(_crudEngine.crudCache.get(file.getCanonicalPath()) == null){
                JSONObject crudExecutable = (JSONObject)getCrudExecutable();
                ExecutableDefinitionReference ref = new ConnectorReference(crudExecutable,this);
                _crudEngine.crudCache.put(file.getCanonicalPath(),ref);
                return run(ref);
            }
            else
            {
                return run(_crudEngine.crudCache.get(file.getCanonicalPath()));
            }          
        }catch(Exception ex){
            _logger.error("Error occured processing "+getResourcePath(),ex);
            returnVal = new HashMap();
            returnVal.put("crudzilla_status", "success");       
            throw ex;
        }//return returnVal;
    }

    @Override
    Object doCoreAction(ExecutableDefinitionReference inref) throws Exception{
        Map returnVal;
        ConnectorReference ref = (ConnectorReference)inref;
        
        try
        {
            String connectorType = ref.getConnector().getType();
            new com.crudzilla.platform.util.HttpConnectorImpl(ref,this).run();
            
            /*
            if(connectorType.compareToIgnoreCase("SOAP") == 0){
                //new HttpConnectorImpl(ref,this).run();
            }
            else            
            if(connectorType.compareToIgnoreCase("HTTP") == 0){
                new HttpConnectorImpl(ref,this).run();
            }
            else            
            if(connectorType.compareToIgnoreCase("HTTPPROXY_GET") == 0){
                new HttpProxyConnector(ref,this).doGet(_request, _response);
            }
            else
            if(connectorType.compareToIgnoreCase("HTTPPROXY_POST") == 0){
                new HttpProxyConnector(ref,this).doPost(_request, _response);
            }
            else
            {
                returnVal = new HashMap();
                returnVal.put("status", "error");
                returnVal.put("message", "unsupported connector type");
                setResult(returnVal);
            }
            */
            return getResult();
        }catch(Exception ex){
            _logger.error("Erroring running connector ",ex);
            //returnVal = new HashMap();
            //returnVal.put("status", "error");
            //returnVal.put("exception",ex.getMessage());
            throw ex;
        }

        //return returnVal;    
    }
}
