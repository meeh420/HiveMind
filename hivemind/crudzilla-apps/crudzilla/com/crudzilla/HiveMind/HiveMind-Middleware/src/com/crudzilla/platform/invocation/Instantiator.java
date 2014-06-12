/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.DefinitionExecutionParameter;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.instantiator.bean.InstantiatorReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.BeanUtilsBean;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class Instantiator extends Executable{
    //static Logger       _logger = Logger.getLogger(Instantiator.class.getName());
    private Log _logger = LogFactory.getLog(Instantiator.class);
    
    public Instantiator(){
        
    }
    
    public Instantiator(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        super(resourcePath,arguments,request,response,serverSide,caller,crudEngine);
    }

    

    
    @Override
    public Object execute() throws Exception{
        Map returnVal;
        
        try
        {   
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
            if(_crudEngine.crudCache.get(file.getCanonicalPath()) == null){
                JSONObject crudExecutable = (JSONObject)getCrudExecutable();
                ExecutableDefinitionReference ref = new InstantiatorReference(crudExecutable,this);
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
        InstantiatorReference instantiatorReference = (InstantiatorReference)inref; 
        Map returnVal = new HashMap();
        Object returnBean;
        //org.apache.commons.beanutils.LazyDynaBean returnBean = new org.apache.commons.beanutils.LazyDynaBean();
        
        List listVals = new ArrayList();
      
        /*
        for (Map.Entry<DefinitionExecutionParameter, Object> entry : ((Map<DefinitionExecutionParameter, Object>)getPreservedComputedParameterValues()).entrySet()) { 
          
          DefinitionExecutionParameter parameter = entry.getKey();
          Object val = entry.getValue();    
        */
        
        for(DefinitionExecutionParameter parameter:instantiatorReference.getExecutionParameters()){
            
            Object val = getPreservedComputedParameterValues().get(parameter);//parameter.getComputedValue();
          
            if(parameter.getName() == null || parameter.getName().isEmpty()){
                listVals.add(val);
            }
            else
            {
                //returnBean.set(parameter.getName(),parameter.getComputedValue());
                //_logger.info(" set instantiator property "+parameter.getName()+" "+parameter.getComputedValue());
                returnVal.put(parameter.getName(),val);

                /*--String leftEvalType = parameter.getEvalLeft() != null && parameter.getEvalLeft().compareTo("yes") == 0?"expression":"literal";
                String rightEvalType = parameter.getEvalRight() != null && parameter.getEvalRight().compareTo("yes") == 0?"expression":"literal";

                Object paramVal = CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments,rightEvalType);
                CrudzillaUtil.setArgumentValue(parameter.getName(),returnVal, paramVal,"literal");
                returnBean.set(parameter.getName(),returnVal.get(parameter.getName()));*/
                //--returnVal.put(parameter.getName(), CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments,"expression"));
            }
        }
        
        //list values or single values take precedences
        if(!listVals.isEmpty()){
            //if(listVals.size()>1)
                return listVals;
            
            //return listVals.get(0);
        }
            
        
        String className = "org.apache.commons.beanutils.LazyDynaBean";
        
        if(returnVal.get("crudzillaJavaLangClass") != null){
            className = (String)returnVal.get("crudzillaJavaLangClass");
            returnVal.remove("crudzillaJavaLangClass");
            
            if(className.compareToIgnoreCase("java.util.HashMap") == 0 ||
               className.compareToIgnoreCase("java.util.Map") == 0 ||
               className.compareToIgnoreCase("map") == 0){
                return returnVal;
            }
            
            
            if(className.compareToIgnoreCase("java.util.ArrayList") == 0 ||
               className.compareToIgnoreCase("java.util.List") == 0 ||
               className.compareToIgnoreCase("list") == 0){
              
                listVals = new ArrayList();
              
              	/*
                  for (Map.Entry<DefinitionExecutionParameter, Object> entry : ((Map<DefinitionExecutionParameter, Object>)getPreservedComputedParameterValues()).entrySet()) { 
                    
                    DefinitionExecutionParameter parameter = entry.getKey();
                    Object val = entry.getValue();    
                */
              	 
                  for(DefinitionExecutionParameter parameter:instantiatorReference.getExecutionParameters()){
                    
            		Object val = getPreservedComputedParameterValues().get(parameter);//parameter.getComputedValue();
                    
                    
                    if(parameter.getName() != null && 
                       !parameter.getName().isEmpty()
                        ){
                      
                      if(parameter.getName().compareToIgnoreCase("crudzillaJavaLangClass") != 0){
                        Map obj = new HashMap();
                        obj.put(parameter.getName(),val);
                        listVals.add(obj);
                      }
                      
                    }else{                        
                        listVals.add(val);
                    }
                }
                
                return listVals;
            }            
        }
        
        
        try
        {
            returnBean = Class.forName(className).newInstance();
            BeanUtilsBean.getInstance().populate(returnBean, returnVal);
            return returnBean;
        }catch(Exception ex){
            _logger.error(ex);
            throw ex;
        }
    }
}
