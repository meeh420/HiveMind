/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;


import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.*;
import com.crudzilla.platform.dao.CoreDAO;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.util.FieldValidationChecks;
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
public class Executable  extends NonExecutable{
    //static Logger       _logger = Logger.getLogger(Executable.class.getName());
    private Log                 _logger      = LogFactory.getLog(Executable.class);
    Map<String,List<String>>    _validationErrors;
    ErrorWrapper                errorWrapper;
    Map<DefinitionExecutionParameter, Object>  		_preservedComputedParameterValues;
    private Invocation          caller;
    
    public Executable(){
        
    }
    
    public Executable(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        super(resourcePath,arguments,request,response,crudEngine);
        this.serverSide = serverSide;
        this.caller     = caller;
    }    
    
    Object doCoreAction(ExecutableDefinitionReference ref) throws Exception{
        return null;
    }
    
        
    @Override
    public Object execute() throws Exception{
        Map returnVal;

        //_arguments.put("crudzilla_true_caller",this);//make this available for relative path resolution
        try
        {
            
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());           
            if(_crudEngine.crudCache.get(file.getCanonicalPath()) == null){
              
                JSONObject crudExecutable = (JSONObject)getCrudExecutable(); 
              
                //preserve current map and prevent alteration by platform module
                Map<String,Object> callArgs = CrudzillaUtil.newArgumentMap(_crudEngine,_arguments);
                callArgs.put("crudExecutable",crudExecutable);
                callArgs.put("crudzilla_working_arguments",_arguments);
              
                //get current crud type
                String type = crudExecutable.getJSONObject("definition").getString("crudType");
              
                //get path to platform module
                String platformModule             = getCrudEngine().sysSettings().get("crudzilla_platform_module").toString();
              
                //get crud type defintions
                Map crudTypes 				      = (Map)this.using(platformModule).call("/crud-types/types.ins",callArgs);
              
                //type definition for this crud
                LazyDynaBean crudTypeDefinition   = ((LazyDynaBean)crudTypes.get(type));
              
                callArgs.put("crudzilla_type_definition",crudTypeDefinition);
                               
              
              
                String crudCreator 			      = crudTypeDefinition.get("initializerPath").toString();
                ExecutableDefinitionReference ref = (ExecutableDefinitionReference)this.using(platformModule).call(crudCreator,callArgs);
                              
                /*ExecutableDefinitionReference ref = (ExecutableDefinitionReference)call(crudExecutable.getJSONObject("type_definition").getString("initializerPath"),_arguments);*/
              
              
                _crudEngine.crudCache.put(file.getCanonicalPath(),ref);
                return run(ref);
            }
            else
            {
                return run(_crudEngine.crudCache.get(file.getCanonicalPath()));
            }
        }catch(Exception ex){
            _logger.error("Error occured processing "+getResourcePath()+" exception:"+ex.getMessage(),ex);
            returnVal = new HashMap();
            returnVal.put("crudzilla_status", "error");
        }        
        return returnVal;
    }    
    
    
    public Object run(ExecutableDefinitionReference crudExecutableWrapper) throws Exception{
            Object returnVal = null;
      
      		//initialize to store computed parameter value for subsequent processing
            _preservedComputedParameterValues = new HashMap();
            try
            {
                //security check
                if(!hasAccess(crudExecutableWrapper)){
                    _logger.warn("access control failure:"+getResourcePath());
                    returnVal = new HashMap();
                    ((Map)returnVal).put("crudzilla_status", "error");
                    ((Map)returnVal).put("message", "401"); 

                    if(crudExecutableWrapper.getDefinition().getErrorHandler() != null){
                        errorWrapper = new ErrorWrapper(null,"access-control","validation"); 
                        _arguments.put("crudError", errorWrapper);
                        
                        runPostExecutionHandler(crudExecutableWrapper.getDefinition().getErrorHandler());
                        return getResult();                        
                    }
                    else
                    {
                        setResult(returnVal);
                        return getResult(); 
                    }
                }

                //apply parameterization and validations
                if(!runParameterizationAndValidation(crudExecutableWrapper)){
                    returnVal = new HashMap();
                    ((Map)returnVal).put("crudzilla_status", "error");
                    ((Map)returnVal).put("message", "validation-error"); 
                    ((Map)returnVal).put("errorMessages", _validationErrors); 
                    

                    if(crudExecutableWrapper.getDefinition().getErrorHandler() != null){
                        errorWrapper = new ErrorWrapper(null,"parameterization-validation","validation"); 
                        errorWrapper.errorData = _validationErrors;                        
                        _arguments.put("crudError", errorWrapper);
                        
                        runPostExecutionHandler(crudExecutableWrapper.getDefinition().getErrorHandler());
                        return getResult();                        
                    }
                    else
                    {
                        setResult(returnVal);
                        return getResult();
                    }
                }
                
                
                try{
                    //execute preexecution logic if necessarily
                    if(!runPreExecutionHandlers(crudExecutableWrapper))
                        return getResult();
                    
                }catch(Exception ex){
                    if(crudExecutableWrapper.getDefinition().getErrorHandler() != null){
                        _arguments.put("crudError", errorWrapper);
                        runPostExecutionHandler(crudExecutableWrapper.getDefinition().getErrorHandler());
                        return getResult();                        
                    }else{
                        throw ex;
                    }                    
                }
                
                //update parameters that may have been updated by ex-ante handlers
                this.updateParametersPostExAnte(crudExecutableWrapper);
                
                //ex-ant processing for crud types
                crudExecutableWrapper.onPostValidate(this);
                
                
                try
                {
                    /*if(crudExecutableWrapper.getDefinition().getImplementorRefType() != null &&
                    crudExecutableWrapper.getDefinition().getImplementorRefType().compareToIgnoreCase("embedded") == 0){
                        _arguments.put("crudExecutableWrapper",crudExecutableWrapper);
                        ExecutableDefinitionReference crudImplementorExecutableWrapper = new ExecutableDefinitionReference(crudExecutableWrapper.getCrudExecutable().getJSONObject("implementor"),new ExecutableDefinition(),this);
                        returnVal = call(crudImplementorExecutableWrapper,_arguments);
                    }else
                    if(crudExecutableWrapper.getDefinition().getImplementorRefType() != null &&
                    crudExecutableWrapper.getDefinition().getImplementorRefType().compareToIgnoreCase("reference") == 0){
                      */
                    if(crudExecutableWrapper.getDefinition().getImplementorPath() != null &&
                       !crudExecutableWrapper.getDefinition().getImplementorPath().isEmpty()){
                      
                      String platformModule       = getCrudEngine().sysSettings().get("crudzilla_platform_module").toString();
                      
                      //preserve current map and prevent alteration by platform module
                      Map<String,Object> callArgs = CrudzillaUtil.newArgumentMap(_crudEngine,_arguments);                     
                      callArgs.put("crudExecutableWrapper",crudExecutableWrapper);
                      callArgs.put("crudzilla_working_arguments",_arguments);
                      
                      returnVal = this.using(platformModule).call(crudExecutableWrapper.getDefinition().getImplementorPath(),callArgs);
                      /*returnVal = call(crudExecutableWrapper.getDefinition().getImplementorPath(),_arguments);*/
                    }
                    else
                    {
                        //run core action
                        returnVal = doCoreAction(crudExecutableWrapper);
                    }
                }catch(Exception ex){
                    if(crudExecutableWrapper.getDefinition().getErrorHandler() != null){
                        
                        errorWrapper = new ErrorWrapper(ex,"primary","primary"); 
                        _arguments.put("crudError", errorWrapper);
                        
                        runPostExecutionHandler(crudExecutableWrapper.getDefinition().getErrorHandler());
                        return getResult();
                    }
                    else
                    {
                        throw ex;
                        /*returnVal = new HashMap();
                        ((Map)returnVal).put("status", "error");
                        ((Map)returnVal).put("message", "unhandled crud error");   
                        ((Map)returnVal).put("exception", ex.getMessage());
                        return returnVal;*/
                    }
                }
                
                //set the result, it may be needed to be appended to
                setResult(returnVal);

                try{
                    runPostExecutionHandlers(crudExecutableWrapper);
                }catch(Exception ex){
                    if(crudExecutableWrapper.getDefinition().getErrorHandler() != null){
                        _arguments.put("crudError", errorWrapper);
                        runPostExecutionHandler(crudExecutableWrapper.getDefinition().getErrorHandler());
                        return getResult();                        
                    }else{
                        throw ex;
                    }
                }
                return getResult();   
            }
            catch(Exception ex)
            {
                _logger.error("Unknown CrudExecutable exception",ex);
                
                returnVal = new HashMap();
                ((Map)returnVal).put("crudzilla_status", "error");
                ((Map)returnVal).put("message", ex.getMessage()); 
                //setResult(returnVal);
                throw ex;
            }
                 
    }    
    
    /*
     * If an access control entry is present with no value specified for
     * either role or user name, and there are no other entries with either
     * role or user name specified, then access would be granted with
     * only authentication required.
     * 
     * In other words, authorization requirements when present, always superceeds authentication.
     */
    public boolean hasAccess(ExecutableDefinitionReference ref){
        //make sure server-side execution restriction is respected
      
        //_logger.info("require server side?"+ref.isServerSide()+" from server side?"+this.serverSide);
      
        if(ref.isServerSide() && !this.serverSide)
            return false;
        
        boolean allowAccessOnAuthentication          = false;
        int     authorizationRequirementCount       = 0;        
      
        List<DefinitionAccessControl> accessControls = ref.getAccessControls();
      
      	//if all roles are required
        if(
            ref.requireAllIdentities() &&
            (
               accessControls.isEmpty() ||
               _request.getUserPrincipal() == null ||
               _request.getUserPrincipal().getName() == null
            )
          )      
          	return false;      
      
        for(DefinitionAccessControl accessControl:accessControls){
            
            if(ref.requireAllIdentities() &&
				(
                  accessControl.getRole() == null || 
                  accessControl.getRole().isEmpty() ||
                  !_request.isUserInRole(accessControl.getRole())
                )
              )
            {
              return false;
            }
          	else
            {              
                if( /*if both user name and role are empty
                      then assume only authentication is required*/
                  
                  (accessControl.getRole() == null || accessControl.getRole().isEmpty()) &&
                    (accessControl.getUserName() == null || accessControl.getUserName().isEmpty()) ){
                    allowAccessOnAuthentication = true;
                }
                else
                if(  
                  /*check against user name only*/
                  (accessControl.getRole() == null || accessControl.getRole().isEmpty()) && 
                  (
                   _request.getUserPrincipal() != null && 
                   _request.getUserPrincipal().getName() != null && 
                   _request.getUserPrincipal().getName().compareTo(accessControl.getUserName()) == 0)
                  ){
                    
                    return true;
                }
                else
                if(  
                  /*check againt user role only*/              
                  (accessControl.getUserName() == null || accessControl.getUserName().isEmpty()) &&              
                  
                  (
                      _request.getUserPrincipal() != null && 
                      _request.getUserPrincipal().getName() != null && 
                      _request.isUserInRole(accessControl.getRole()))  
                  ){
                    
                    return true;
                }          
                else
                if( /*check against both user name and role*/
                  
                  (
                        _request.getUserPrincipal() != null && 
                        _request.getUserPrincipal().getName() != null 
                    )
                  && 
                  
                    _request.isUserInRole(accessControl.getRole())
                   &&
                    _request.getUserPrincipal().getName().compareTo(accessControl.getUserName()) == 0
                  ){
                    
                    return true;
                }
                else
                authorizationRequirementCount++;
            }
        }
      
		if(ref.requireAllIdentities())      
          	return true;
      
        return (accessControls.isEmpty() || (authorizationRequirementCount == 0 && allowAccessOnAuthentication && _request.getUserPrincipal() != null));
    } 
    
    void updateParametersPostExAnte(ExecutableDefinitionReference ref){
      
      for (Map.Entry<DefinitionExecutionParameter, Object> entry : ((Map<DefinitionExecutionParameter, Object>)_preservedComputedParameterValues).entrySet()) { 
        DefinitionExecutionParameter param = entry.getKey();
        Object value = entry.getValue(); 
        
        //whatever is on the argument map takes precedence over previously
        //computed value
        if((param.getIsFinal() == null || param.getIsFinal().compareToIgnoreCase("no") == 0) &&
           getArguments().get(param.getName())  != null){
          
          //param.setComputedValue(PrimitiveCast(param.getType(),getArguments().get(param.getName())));
          _preservedComputedParameterValues.put(param,PrimitiveCast(param.getType(),getArguments().get(param.getName())));
        }
        getArguments().put(param.getName(),/*param.getComputedValue()*/_preservedComputedParameterValues.get(param));
      }
      
      /*
        for(DefinitionExecutionParameter param: ref.getDefinition().getExecutionParameters()){
            //whatever is on the argument map takes precedence over previously
            //computed value
            if((param.getIsFinal() == null || param.getIsFinal().compareToIgnoreCase("no") == 0) &&
               getArguments().get(param.getName())  != null){
                param.setComputedValue(PrimitiveCast(param.getType(),getArguments().get(param.getName())));
            }
            getArguments().put(param.getName(),param.getComputedValue());
        }     
      */
    }
    
    public Map<DefinitionExecutionParameter, Object> getPreservedComputedParameterValues(){
    	return _preservedComputedParameterValues;
    }
    
    Object PrimitiveCast(String type,Object val){
        
        if(val == null)return null;
        
        if(type.compareToIgnoreCase("integer") == 0){
            if(!val.toString().isEmpty())
                return Integer.valueOf(val.toString());
        }
        else
        if(type.compareToIgnoreCase("float") == 0){
            if(!val.toString().isEmpty())
                return Float.valueOf(val.toString());
        }  
        else
        if(type.compareToIgnoreCase("double") == 0){
            if(!val.toString().isEmpty())
                return Double.valueOf(val.toString());
        }   
        else
        if(type.compareToIgnoreCase("long") == 0){
            if(!val.toString().isEmpty())
                return Long.valueOf(val.toString());
        }
        else
        if(type.compareToIgnoreCase("byte") == 0){
            if(!val.toString().isEmpty())
                return Byte.valueOf(val.toString());            
        }  
        else
        if(type.compareToIgnoreCase("short") == 0){
            if(!val.toString().isEmpty())
                return Short.valueOf(val.toString());
        }   
        else
        if(type.compareToIgnoreCase("boolean") == 0){
            if(!val.toString().isEmpty())
                return Boolean.valueOf(val.toString());
        }  
        else
        if(type.compareToIgnoreCase("char") == 0){
            if(!val.toString().isEmpty())
                return Character.valueOf(val.toString().charAt(0));
        }
        return val;
    }
    
    
    boolean runParameterizationAndValidation(ExecutableDefinitionReference ref){
       //if(ref.getDefinition().getExecutionParameters()==null)return true;
       
       //_logger.info("validating parameters:"+ref.getDefinition().getExecutionParameters().size());
       _validationErrors = new HashMap<String,List<String>>();
       
       //CrudzillaHttpRequestContext crudzillaHttpRequestContext = (CrudzillaHttpRequestContext)_arguments.get("crudzillaHttpRequestContext");
       
       List<DefinitionExecutionParameter> envParameters = new ArrayList<DefinitionExecutionParameter>();
       for(DefinitionExecutionParameter parameter: ref.getDefinition().getExecutionParameters()){
           
           /** Not used anymore, using generic variable switching
           if(parameter.getDefaultValue() != null &&
                   parameter.getDefaultValue().compareTo("@crudzilla_env") == 0){
               envParameters.add(parameter);
               continue;
           }
           */
         
           List<String> errorCodes = new ArrayList<String>();
           
           Object paramVal;
           String paramName = parameter.getName();
                      
           String leftEvalType = parameter.getEvalLeft() != null && parameter.getEvalLeft().compareTo("yes") == 0?"expression":"literal";
           String rightEvalType = parameter.getEvalRight() != null && parameter.getEvalRight().compareTo("yes") == 0?"expression":"literal";
           
           //manage the scope of this parameter if necessary
           //crudzillaHttpRequestContext.addArgumentLifeCount(paramName,parameter.getKeepAliveCount());
           
           //_logger.info("evaluating:"+paramName+" is final?"+parameter.getIsFinal());
           //if(!getResourcePath().endsWith("get-log-output.ste") && !getResourcePath().endsWith("clear-log-output.ste"))
           //_logger.info("parameter("+paramName+","+_arguments.get(paramName)+")");
         
           //_logger.info(paramName+" | parameter:"+parameter.getDefaultValue()+" _arguments:"+_arguments.get(paramName));
         
         
           //set default value if this parameter is absent
           if(parameter.getDefaultValue() != null 
              && !parameter.getDefaultValue().isEmpty() 
              && 
              (
             // paramName == null ||
              //paramName.isEmpty() || 
              _arguments.get(paramName) == null
              )){
               
                //_logger.info("precomputed parameter:"+parameter.getDefaultValue());
             
                 //_logger.info("setting "+paramName+" using eval "+rightEvalType+","+parameter.getEvalRight());
                 /**if(parameter.getType().compareTo("crud") == 0 &&
                    rightEvalType.compareToIgnoreCase("expression") == 0)
                        paramVal = call(parameter.getDefaultValue(),_arguments); 
                    else**/
                 paramVal = CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments,rightEvalType,parameter,this);
                 
                 CrudzillaUtil.setArgumentValue(paramName,_arguments,/*PrimitiveCast(parameter.getType(),paramVal)*/paramVal,leftEvalType,this);
                 //--_arguments.put(paramName,CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments));
                 /*if(paramVal instanceof LazyDynaBean){
                   if(((LazyDynaBean)paramVal).get("id") != null)
                   _logger.info("computed parameter:"+ ((LazyDynaBean)paramVal).get("id"));
                 }*/
           }
           else//prevent override of final default value
           if(parameter.getIsFinal() != null &&
              parameter.getIsFinal().compareTo("yes") == 0
              && _arguments.get(paramName) != null){
               
               //discard supplied value
               _arguments.remove(paramName);
               
               if(parameter.getDefaultValue() != null && !parameter.getDefaultValue().isEmpty() ){
                   
                    /**
                    if(parameter.getType().compareTo("crud") == 0 &&
                       rightEvalType.compareToIgnoreCase("expression") == 0)
                        paramVal = call(parameter.getDefaultValue(),_arguments); 
                    else**/
                    paramVal = CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments,rightEvalType,parameter,this);
                    
                    CrudzillaUtil.setArgumentValue(paramName,_arguments, /*PrimitiveCast(parameter.getType(),paramVal)*/paramVal,leftEvalType,this);
                    //--_arguments.put(paramName,CrudzillaUtil.getArgumentValue(parameter.getDefaultValue(), _arguments));
               }
               else
               {
                   paramVal = new String();
                   CrudzillaUtil.setArgumentValue(paramName,_arguments, /*PrimitiveCast(parameter.getType(),paramVal)*/paramVal,leftEvalType,this);
               }
           }
           /*else
           if(!serverSide && 
              _arguments.get(paramName) != null &&
              paramName.toLowerCase().startsWith("crudzilla")){//protect platform parameters
             
             continue;
           }*/         
           else
           if(_arguments.get(paramName) == null){/*??declared parameter should not be null???*/
               paramVal = null;
               _arguments.put(paramName,paramVal);
               //paramVal = new String();//initialize to empty string
               //CrudzillaUtil.setArgumentValue(paramName,_arguments,PrimitiveCast(parameter.getType(),paramVal),leftEvalType,this);
           }
           else
           {
               //potentially a user submitted value, should only be evaluated 
               //if enabled at system level
               String evaluateUnSafeValue = _crudEngine.sysSettings() != null?(String)_crudEngine.sysSettings().get("crudzilla_evaluate_user_supplied_values"):"false";
               if(evaluateUnSafeValue != null &&
                  evaluateUnSafeValue.compareToIgnoreCase("true") == 0){
                   
                    /**if(parameter.getType().compareTo("crud") == 0 &&
                       rightEvalType.compareToIgnoreCase("expression") == 0)
                        paramVal = call((String)_arguments.get(paramName),_arguments); 
                    else**/
                        paramVal = CrudzillaUtil.getArgumentValue((String)_arguments.get(paramName), _arguments,rightEvalType,parameter,this);
                    
                    CrudzillaUtil.setArgumentValue(paramName,_arguments, /*PrimitiveCast(parameter.getType(),paramVal)*/paramVal,leftEvalType,this);                    
               }
               else{
               paramVal = _arguments.get(paramName);
               //if(!getResourcePath().endsWith("get-log-output.ste") && !getResourcePath().endsWith("clear-log-output.ste"))
               //_logger.info("setting verbatim parameter ("+paramName+","+paramVal+")");
               }
           }
           
           
           
           //check required
           if(parameter.getRequired() != null && parameter.getRequired().compareTo("yes") == 0){
               
               if(!FieldValidationChecks.validateRequired(paramVal.toString(),errorCodes, _request)){
                   _validationErrors.put(paramName, errorCodes);
               }
           }
           
           //check length validation
           if(parameter.getMinLength() != null && !parameter.getMinLength().isEmpty()){
               if(!FieldValidationChecks.validateMinLength(paramVal.toString(),parameter.getMinLength(),parameter.getLineEndLength(),errorCodes, _request)){
                   _validationErrors.put(paramName, errorCodes);
               }               
           }
           if(parameter.getMaxLength() != null && !parameter.getMaxLength().isEmpty()){
               if(!FieldValidationChecks.validateMaxLength(paramVal.toString(),parameter.getMaxLength(),parameter.getLineEndLength(),errorCodes, _request)){
                   _validationErrors.put(paramName, errorCodes);
               }               
           }           
           
           
           //check type validation
           
           if(parameter.getType() != null && !parameter.getType().isEmpty()){
               
               if(parameter.getType().compareTo("json") == 0){
                   
                    
               }
               else
               if(parameter.getType().compareTo("byte") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateByte(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }
               }
               else
               if(parameter.getType().compareTo("short") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateShort(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }                   
               }
               else
               if(parameter.getType().compareTo("integer") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateInteger(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }else{
                       //validate range if necessary
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty() &&
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//[min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateIntRange(paramVal.toString(),parameter.getMinRange(),parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }
                       else
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty()){//[min,max)
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateIntRange(paramVal.toString(),parameter.getMinRange(),""+Integer.MAX_VALUE,errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }
                       }
                       else
                       if(
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//(min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateIntRange(paramVal.toString(),""+Integer.MIN_VALUE,parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }                           
                   }
               }
               else
               if(parameter.getType().compareTo("long") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateLong(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }else{
                       //validate range if necessary
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty() &&
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//[min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateLongRange(paramVal.toString(),parameter.getMinRange(),parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }
                       else
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty()){//[min,max)
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateLongRange(paramVal.toString(),parameter.getMinRange(),""+Long.MAX_VALUE,errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }
                       }
                       else
                       if(
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//(min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateLongRange(paramVal.toString(),""+Long.MIN_VALUE,parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }                           
                   }               
               }
               else
               if(parameter.getType().compareTo("float") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateFloat(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }else{
                       //validate range if necessary
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty() &&
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//[min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateFloatRange(paramVal.toString(),parameter.getMinRange(),parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }
                       else
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty()){//[min,max)
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateFloatRange(paramVal.toString(),parameter.getMinRange(),""+Float.MAX_VALUE,errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }
                       }
                       else
                       if(
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//(min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateFloatRange(paramVal.toString(),""+Float.MIN_VALUE,parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }                           
                   }                
               }
               else
               if(parameter.getType().compareTo("double") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateDouble(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }else{
                       //validate range if necessary
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty() &&
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//[min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateDoubleRange(paramVal.toString(),parameter.getMinRange(),parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }
                       else
                       if(parameter.getMinRange() != null && 
                          !parameter.getMinRange().isEmpty()){//[min,max)
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateDoubleRange(paramVal.toString(),parameter.getMinRange(),""+Double.MAX_VALUE,errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }
                       }
                       else
                       if(
                          parameter.getMaxRange() != null && 
                          !parameter.getMaxRange().isEmpty()){//(min,max]
                            if(Boolean.FALSE.equals(FieldValidationChecks.validateDoubleRange(paramVal.toString(),""+Double.MIN_VALUE,parameter.getMaxRange(),errorCodes, _request))){
                                _validationErrors.put(paramName, errorCodes);
                            }                           
                       }                           
                   }                 
               } 
               else
               if(parameter.getType().compareTo("date") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateDate(paramVal.toString(),parameter.getDateFormat(),parameter.getDateFormatStrict() != null && parameter.getDateFormatStrict().compareTo("yes")==0,
                       errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }else
                   if(parameter.getDateFormat() != null && !parameter.getDateFormat().isEmpty())
                   {
                       try{
                            paramVal = /*parameter.setComputedValue*/(new java.text.SimpleDateFormat(parameter.getDateFormat()).parse(paramVal.toString()));
                            CrudzillaUtil.setArgumentValue(paramName,_arguments, /*parameter.getComputedValue()*/paramVal,leftEvalType,this);
                       }catch(Exception e){}
                   }
                   else{
                       try{
                            paramVal = /*parameter.setComputedValue*/(new java.text.SimpleDateFormat().parse(paramVal.toString()));
                            CrudzillaUtil.setArgumentValue(paramName,_arguments, /*parameter.getComputedValue()*/paramVal,leftEvalType,this);
                       }catch(Exception e){}                       
                   }
               }  
               else
               if(parameter.getType().compareTo("email") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateEmail(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }                   
               }
               else
               if(parameter.getType().compareTo("creditcard") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateCreditCard(paramVal.toString(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }                   
               }
               else
               if(parameter.getType().compareTo("url") == 0){
                   boolean allowallschemesVar = parameter.getAllowallschemesForURL() != null && parameter.getAllowallschemesForURL().compareTo("yes")==0;
                   boolean allow2slashesVar = parameter.getAllow2slashesForURL() != null && parameter.getAllow2slashesForURL().compareTo("yes") == 0;
                   boolean nofragmentsVar = parameter.getNofragmentsForURL() != null && parameter.getNofragmentsForURL().compareTo("yes") == 0;
                   String schemesVarIn = parameter.getSchemesForURL();
                   
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateUrl(paramVal.toString(),""+allowallschemesVar,""+allow2slashesVar,""+nofragmentsVar,schemesVarIn,errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }                   
               }
               else
               if(parameter.getType().compareTo("mask") == 0){
                   if(Boolean.FALSE.equals(FieldValidationChecks.validateMask(paramVal.toString(),parameter.getValidationRegEx(),errorCodes, _request))){
                       _validationErrors.put(paramName, errorCodes);
                   }                   
               }
             
               //save computed value
               if(_validationErrors.isEmpty()){
                    paramVal = PrimitiveCast(parameter.getType(),paramVal);
                 
               		//parameter.setComputedValue(PrimitiveCast(parameter.getType(),paramVal));
                    _preservedComputedParameterValues.put(parameter,paramVal);
                    
                    if(paramName != null && !paramName.isEmpty()){                       
                       _arguments.put(paramName,/*parameter.getComputedValue()*/paramVal);
                    }
               }
           }
       }
       
       //take this out, using variable switching mechanism
       /**setEnvironmentalParameters(envParameters);**/
       
       return _validationErrors.isEmpty();
   }

    /**
    void setEnvironmentalParameters(List<DefinitionExecutionParameter> envParameters){
       org.apache.commons.beanutils.LazyDynaBean sys =  (org.apache.commons.beanutils.LazyDynaBean)_arguments.get("crudzilla_system_settings");
       
       for(DefinitionExecutionParameter parameter: envParameters){
           parameter.setComputedValue(_arguments.get(sys.get("crudzilla_env")+"_"+parameter.getName()));
       }
    }
    **/
    boolean runPreExecutionHandler(PreExecutionHandler handler){
            if(handler.getEnable() != null && handler.getEnable().compareTo("yes") == 0)
            {
                Map<String,Object> arguments = CrudzillaUtil.getCallArgMap(handler.getArgPropagationMode(),handler.getArgPropagationListPath(),_arguments, this);
                Object r = call(handler.getPath(), arguments);

                if(handler.getOnlyProceedOnTrue() != null && 
                        handler.getOnlyProceedOnTrue().compareTo("yes") == 0){

                    if(r ==null || !(r instanceof Boolean)){
                        setResult(r);
                        return false;
                    }

                    if(!Boolean.parseBoolean(r.toString()))return false;
                }else{
                    
                    if(handler.getReturnMode() != null && 
                       handler.getReturnMode().compareTo("explode_on_map") == 0){
                    	
                      	if(handler.getExplodedListPath() != null &&
                           !handler.getExplodedListPath().isEmpty()){
                      	   	CrudzillaUtil.copyToMap(arguments,caller.call(handler.getExplodedListPath(),CrudzillaUtil.copyToMap(CrudzillaUtil.newArgumentMap(_crudEngine,arguments),r)));
                        }
                        else
                          	CrudzillaUtil.copyToMap(arguments,r);
                    }
                    else
                    if(handler.getReturnMode() != null && 
                       handler.getReturnMode().compareTo("save_as_variable") == 0
                       && handler.getReturnValName() != null 
                       && !handler.getReturnValName().isEmpty()){
                        _arguments.put(handler.getReturnValName(), r);
                    }
                    return true;
                }
            }
            return true;
    }
    
    boolean runPreExecutionHandlers(ExecutableDefinitionReference ref) throws Exception{
        
        for(PreExecutionHandler handler:ref.getPreActionHandlers()){
           try
           {
                if(!runPreExecutionHandler(handler))return false;
           }catch(Exception ex){
               errorWrapper = new ErrorWrapper(ex,"pre-action",handler.getPath());
               throw ex;
           }
        }
        return true;
    }

    void runPostExecutionHandler(PostExecutionHandler handler){
        Object r = null;


        Map<String,Object> arguments = CrudzillaUtil.getCallArgMap(handler.getArgPropagationMode(),handler.getArgPropagationListPath(),_arguments, this);

        //make result of primary action available
        if(handler.getPrimaryResultVarName() != null && 
                !handler.getPrimaryResultVarName().isEmpty())
            arguments.put(handler.getPrimaryResultVarName(),getResult());


        if(handler.getPath() != null && !handler.getPath().isEmpty())
            r = call(handler.getPath(),arguments);

        try
        {
            if(handler.getReturnMode() != null){
                if(handler.getReturnMode().compareTo("return_as_primary") == 0){
                    this.setResult(r);
                }
                else
                if(handler.getReturnMode().compareTo("ignore_return") == 0){

                }
                else
                if(getResult() != null && handler.getReturnMode().compareTo("append_return_to_primary") == 0){


                    if(getResult() instanceof Map){                     
                        ((Map)getResult()).put(handler.getReturnValName(), r);
                    }
                    else
                    {
                        BeanUtilsBean.getInstance().setProperty(getResult(),handler.getReturnValName(), r);
                    }
                }
                else
                if(handler.getReturnMode().compareTo("append_primary_to_return") == 0){
                    if(r instanceof Map){
                        ((Map)r).put(handler.getReturnValName(), getResult());
                    }
                    else
                    {
                        BeanUtilsBean.getInstance().setProperty(r,handler.getReturnValName(), getResult());
                    }
                }
                else
                if(handler.getReturnMode().compareTo("return_named_variable") == 0){
                    this.setResult(arguments.get(handler.getReturnValName()));
                }    
                else
                if(handler.getReturnMode() != null && 
                     handler.getReturnMode().compareTo("save_as_variable") == 0
                     ){
                  
                  if(handler.getReturnValName() != null && !handler.getReturnValName().isEmpty())
                  		_arguments.put(handler.getReturnValName(), r);
                }              
              	else
                if(handler.getReturnMode() != null && 
                     handler.getReturnMode().compareTo("explode_on_map") == 0){
                  
                    if(handler.getExplodedListPath() != null &&
                       !handler.getExplodedListPath().isEmpty()){
                      CrudzillaUtil.copyToMap(arguments,call(handler.getExplodedListPath(),CrudzillaUtil.copyToMap(CrudzillaUtil.newArgumentMap(_crudEngine,arguments),r)));
                    }
                    else//explode all properties onto map
                      CrudzillaUtil.copyToMap(arguments,r);
                }              
            }
        }catch(Exception ex){
            _logger.error("Error setting post execution result",ex);
        }        
    }
    void runPostExecutionHandlers(ExecutableDefinitionReference ref) throws Exception{
        
        for(PostExecutionHandler handler:ref.getPostActionHandlers()){
            
            try{
                if(handler.getEnable() != null && 
                handler.getEnable().compareTo("yes") == 0 &&
                (handler.getType() == null || handler.getType().compareTo("error-handler") != 0))
                {
                    runPostExecutionHandler(handler);
                }
            }catch(Exception ex){
                errorWrapper = new ErrorWrapper(ex,"post-action",handler.getPath());
                throw ex;
            }
        } 
    } 
   
   
    Object getCrudExecutable()throws Exception{
        return getCrudExecutable(getResourcePath());
    }
    
    public Object getCrudExecutable(String resourcePath) throws Exception{
        try{            
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
            return JSONObject.fromObject(org.apache.commons.io.FileUtils.readFileToString(file)); 
        }catch(Exception ex){
            _logger.info(ex);
        }return null;
    }    
    
   
    
    public Executable getCaller(){
        return (Executable)caller;
    }
        
    
    public  Executable resolvePathToCaller(String relativePath){
        if(!relativePath.startsWith("/")){

            if(getResourcePath().lastIndexOf("/") != -1){
                String conRelPath = getResourcePath();
                
                try{
                 conRelPath = new File(getResourcePath().substring(0,getResourcePath().lastIndexOf("/")+1)+relativePath).getCanonicalPath();
                }catch(Exception ex){}
                
                _logger.info("looking for path "+relativePath+" against "+getResourcePath()+" resulted in path "+conRelPath);
                File file = CrudzillaUtil.getCrudFile(_crudEngine,conRelPath);
                if(file != null && file.exists()){
                    _logger.info("found "+file.getAbsolutePath());
                    return this;
                }
                else
                if(getCaller() != null){
                    _logger.info("found "+file.getAbsolutePath()+" so climbing to "+getCaller().getResourcePath());
                    return getCaller().resolvePathToCaller(relativePath);
                }
            }
            //else
            //relativePath = "/"+relativePath;                
        }
        return this;
    }
}
