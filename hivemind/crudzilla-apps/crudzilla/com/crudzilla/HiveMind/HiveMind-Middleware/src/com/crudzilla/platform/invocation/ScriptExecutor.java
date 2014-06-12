/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.scriptexecutor.bean.ScriptExecutorReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.io.File;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import javax.script.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.commons.beanutils.LazyDynaBean;
/**
 *
 * @author bitlooter
 */
public class ScriptExecutor extends Executable{
    //static Logger       _logger = Logger.getLogger(ScriptExecutor.class.getName());
    private Log _logger = LogFactory.getLog(ScriptExecutor.class);
    
    public ScriptExecutor(){
        
    }
    
    public ScriptExecutor(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
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
                ExecutableDefinitionReference ref = new ScriptExecutorReference(crudExecutable,this);
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
        ScriptExecutorReference ref = (ScriptExecutorReference)inref;
        
        String type = ref.getScriptExecutor().getType();
      
      	String langType = type;
        if(langType.indexOf('-') != -1)
          langType = langType.substring(0,langType.indexOf('-'));
      
      	LazyDynaBean langs = (LazyDynaBean)this.getCrudEngine().sysSettings().get("crudzilla_jsr223_languages");
        
        /*if(ref.getScriptExecutor().getType() != null && 
           ref.getScriptExecutor().getType().compareTo("jexl") == 0){
            
            if(ref.getScriptExecutor().getCode() != null &&
               !ref.getScriptExecutor().getCode().isEmpty()){
                
                JexlContext context = new MapContext(_arguments);
                context.set("crudzilla",Crudzilla.crudzilla());
                context.set("crud",this);
                context.set("arguments",_arguments);
                
                
                try{
                    Object result = Crudzilla.JexlEngine().createScript(ref.getScriptExecutor().getCode()).execute(context);
                    return result;
                }catch(Exception ex){
                    _logger.error(ex);
                    throw ex;
                    /*if(ex instanceof org.apache.commons.jexl2.JexlException.Property){
                        _logger.error( "property error:"+((org.apache.commons.jexl2.JexlException.Property)ex).getProperty());
                    }*
                }
            }else{
                Map returnVal = new HashMap();
                returnVal.put("status","success");
                return returnVal;
            }
        }
        else*/
        if(ref.getScriptExecutor().getType() != null && 
           ref.getScriptExecutor().getType().compareTo("velocity-template-file") == 0){
            
            VelocityContext context = new VelocityContext(_arguments);
            context.put("crudzilla",_crudEngine);
            context.put("hivemind",_crudEngine);
            context.put("crud",this);
            context.put("arguments",_arguments);    
            
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
            String templateName = (getResourcePath().substring(0, getResourcePath().lastIndexOf(".ste"))+".vm").trim();
            if(templateName.startsWith("/"))
              templateName = templateName.substring(1);
          
            String httpPassThrough =  (String)_arguments.get("crudzilla_http_passthrough");
            if(httpPassThrough == null || httpPassThrough.isEmpty())
                httpPassThrough = (String)_crudEngine.sysSettings().get("crudzilla_http_passthrough");
            
            
            String httpOutputMIME =  (String)_arguments.get("crudzilla_http_output_mime");
            if(httpOutputMIME == null || httpOutputMIME.isEmpty())
                httpOutputMIME = (String)_crudEngine.sysSettings().get("crudzilla_http_output_mime");
            
            
            String templateEncoding =  (String)_arguments.get("crudzilla_velocity_template_encoding");
            if(templateEncoding == null || templateEncoding.isEmpty())
                templateEncoding = (String)_crudEngine.sysSettings().get("crudzilla_velocity_template_encoding");
            
            templateEncoding = templateEncoding != null?templateEncoding:"UTF-8";
            
            _logger.info("running template "+templateName);
            
            //if true it means it should be written directly to response
            if(httpPassThrough != null && httpPassThrough.compareTo("true") == 0){

                if(httpOutputMIME != null && !httpOutputMIME.isEmpty()){                        
                    ((HttpServletResponse)_arguments.get("httpResponse")).setContentType(httpOutputMIME);
                }
                
                
                
                try{
                    long tm = new java.util.Date().getTime();
                    _crudEngine.velocityEngine().mergeTemplate(templateName,templateEncoding,context, _response.getWriter());
                    //_logger.info("computation length:"+((new java.util.Date().getTime()-tm)/1000));
		    		return null;                    
                }catch(Exception ex){
                    Map returnVal = new HashMap();
                    returnVal.put("crudzilla_status", "error");
                    returnVal.put("message","failed to write to httpresponse");
                    returnVal.put("exception", ex.getMessage());
                    throw ex;
                }
            }
            else
            {
                StringWriter writer = new StringWriter();
                _crudEngine.velocityEngine().mergeTemplate(templateName,templateEncoding,context,writer);
                return writer.toString();
            }
        }
        else
        if(ref.getScriptExecutor().getType() != null && 
           ref.getScriptExecutor().getType().compareTo("velocity-template") == 0){
            
            if(ref.getScriptExecutor().getCode() != null &&
              !ref.getScriptExecutor().getCode().isEmpty()){                
                    
                    VelocityContext context = new VelocityContext(_arguments);
                    context.put("crudzilla",_crudEngine);
                    context.put("hivemind",_crudEngine);
                    context.put("crud",this);
                    context.put("arguments",_arguments);

                    String httpPassThrough =  (String)_arguments.get("crudzilla_http_passthrough");
                    if(httpPassThrough == null || httpPassThrough.isEmpty())
                        httpPassThrough = (String)_crudEngine.sysSettings().get("crudzilla_http_passthrough");
                     
                    
                    String httpOutputMIME =  (String)_arguments.get("crudzilla_http_output_mime");
                    if(httpOutputMIME == null || httpOutputMIME.isEmpty())
                        httpOutputMIME = (String)_crudEngine.sysSettings().get("crudzilla_http_output_mime");
                    
                    
                    //if true it means it should be written directly to response
                    if(httpPassThrough != null &&  httpPassThrough.compareTo("true") == 0){

                        if(httpOutputMIME != null && !httpOutputMIME.isEmpty()){
                            ((HttpServletResponse)_arguments.get("httpResponse")).setContentType(httpOutputMIME);
                        }                        
                        
                        //String encoding = _arguments.get("crudzilla_velocity_template_encoding") != null?_arguments.get("crudzilla_velocity_template_encoding").toString():"UTF-8";
                        
                        try{
                            _crudEngine.velocityEngine().evaluate(context, _response.getWriter(),ref.getScriptExecutor().getName(), ref.getScriptExecutor().getCode());
			   				return null;
                        }catch(Exception ex){
                            Map returnVal = new HashMap();
                            returnVal.put("crudzilla_status", "error");
                            returnVal.put("message","failed to write to httpresponse");
                            returnVal.put("exception", ex.getMessage());
                        }
                    }else{
                        StringWriter writer = new StringWriter();                        
                        _crudEngine.velocityEngine().evaluate(context, writer,ref.getScriptExecutor().getName(), ref.getScriptExecutor().getCode());
                        return writer.toString();
                    }
              }else{
                Map returnVal = new HashMap();
                returnVal.put("crudzilla_status","success");
                return returnVal;                
            }
        }
/*--        else
        if(ref.getScriptExecutor().getType() != null && 
           ref.getScriptExecutor().getType().compareTo("groovy-file") == 0){
            
            
            groovy.lang.Binding context = new groovy.lang.Binding(_arguments);
            context.setProperty("crudzilla",Crudzilla.crudzilla());
            context.setProperty("crud",this);
            context.setProperty("arguments",_arguments);    
            
            
            File file = CrudzillaUtil.getFile(_resourcePath);
            String scriptName = file.getName().substring(0, file.getName().lastIndexOf(".ste"))+".groovy";
            
            try{
                return Crudzilla.GroovyEngine().run(scriptName, context);
            }catch(Exception ex){

                Map returnVal = new HashMap();
                returnVal.put("status", "error");
                returnVal.put("message","error executing groovy script");
                returnVal.put("exception", ex.getMessage()); 
                //return returnVal;
                
                throw ex;
            }
        }
        else
        if(ref.getScriptExecutor().getType() != null && 
           ref.getScriptExecutor().getType().compareTo("groovy") == 0){
            
            if(ref.getScriptExecutor().getCode() != null &&
              !ref.getScriptExecutor().getCode().isEmpty()){
                    
                    //Map context = new HashMap(_arguments);
                    groovy.lang.Binding context = new groovy.lang.Binding(_arguments);
                    
                    context.setProperty("crudzilla",Crudzilla.crudzilla());
                    context.setProperty("crud",this);
                    context.setProperty("arguments",_arguments);

                    return Crudzilla.GroovyShell(context).evaluate(ref.getScriptExecutor().getCode());
              }else{
                Map returnVal = new HashMap();
                returnVal.put("status","success");
                return returnVal;                
            }
        }*/
        else
        if(type != null && 
           (
                /*type.startsWith("jruby") ||
                type.startsWith("groovy") ||
                type.startsWith("jython") ||
                type.startsWith("javascript") ||
                type.startsWith("clojure") ||
                type.startsWith("jexl"*/
           	  langs.get(langType) != null
           )
        )
        {
           if(!getCrudEngine().turnOffLogging)
                    _logger.info("using jsr 223");
            
		   String jsr223Name = ((LazyDynaBean)langs.get(langType)).get("jsr223Name").toString();
           
           ScriptContext newContext = new SimpleScriptContext();
           javax.script.Bindings bindings;
           
           
           
           /*
           for (Map.Entry<String, Object> entry : _arguments.entrySet()) { 
                String key = entry.getKey();
                Object value = entry.getValue();
                newContext.setAttribute(key, value,ScriptContext.ENGINE_SCOPE);
            }
            */         
            
            
            Object result;
            //engine.setContext(newContext);
            
            if(ref.getCompiledScript() != null){
              
                if(!getCrudEngine().turnOffLogging)
                    _logger.info("running compiled "+jsr223Name+" code");
                
                Bindings oldBindings = ref.getCompiledScript().getEngine().getBindings(ScriptContext.ENGINE_SCOPE);
                                
                bindings = ref.getCompiledScript().getEngine().createBindings();
              
                bindings.putAll(_arguments);
                newContext.setBindings(bindings, ScriptContext.ENGINE_SCOPE);
                newContext.setAttribute("crudzilla",_crudEngine,ScriptContext.ENGINE_SCOPE);
                newContext.setAttribute("hivemind",_crudEngine,ScriptContext.ENGINE_SCOPE);
              
                newContext.setAttribute("crud",this,ScriptContext.ENGINE_SCOPE);
                newContext.setAttribute("arguments",_arguments,ScriptContext.ENGINE_SCOPE);                
                
                result = ref.getCompiledScript().eval(newContext);
                
                //restore old context
                ref.getCompiledScript().getEngine().setBindings(oldBindings, ScriptContext.ENGINE_SCOPE);
                //engine.setContext(oldContext);
                return result;
            }
            
            
            ScriptEngine engine = _crudEngine.jsr223Engine(jsr223Name);
            Bindings oldBindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);

            
          
            bindings = engine.createBindings();
          
          	if(type.compareTo("netrexx") == 0){
            	_arguments.remove("httpRequest");
                _arguments.remove("httpResponse");
          	}
          
            bindings.putAll(_arguments);          
            newContext.setBindings(bindings,ScriptContext.ENGINE_SCOPE);
            newContext.setAttribute("crudzilla",_crudEngine,ScriptContext.ENGINE_SCOPE);
            newContext.setAttribute("hivemind",_crudEngine,ScriptContext.ENGINE_SCOPE);
            newContext.setAttribute("crud",this,ScriptContext.ENGINE_SCOPE);
            newContext.setAttribute("arguments",_arguments,ScriptContext.ENGINE_SCOPE);
            
            
            
            //ScriptContext oldContext = engine.getContext();             
            
            if(type.endsWith("-file")){
              
              	String ext = ((LazyDynaBean)langs.get(langType)).get("extension").toString();
               /*
                String ext = "";
                if(type.startsWith("jruby"))
                    ext = "rb";
                else
                if(type.startsWith("groovy"))
                    ext = "groovy";
                else
                if(type.startsWith("jython"))
                    ext = "py";
                else
                if(type.startsWith("javascript"))
                    ext = "js";
                else
                if(type.startsWith("clojure"))
                    ext = "clj";                
                else
                if(type.startsWith("jexl"))
                    ext = "jexl";                  
                */
                File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
                String scriptName = file.getAbsolutePath().substring(0,file.getAbsolutePath().lastIndexOf(".ste"))+ext;
                 
                
                if (engine instanceof Compilable) {
                    Compilable compEngine = (Compilable) engine;
                    ref.setCompiledScript(compEngine.compile(new java.io.FileReader(scriptName)));
                    // evaluate code from given file
                    result = ref.getCompiledScript().eval(newContext);
                    
                    //restore old context
                    engine.setBindings(oldBindings, ScriptContext.ENGINE_SCOPE);
                    //engine.setContext(oldContext);
                    return result;                    
                }
                else
                {
                    // evaluate code from given file
                    result = engine.eval(new java.io.FileReader(scriptName),newContext);
                    
                    //restore old context
                    engine.setBindings(oldBindings, ScriptContext.ENGINE_SCOPE);
                    //engine.setContext(oldContext);
                    return result;                    
                }
            }
            else
            {
                if (engine instanceof Compilable) {
           			if(!getCrudEngine().turnOffLogging)
                    	_logger.info("using jsr 223, initializing compilable engine");
                  
                    Compilable compEngine = (Compilable) engine;
                    ref.setCompiledScript(compEngine.compile(ref.getScriptExecutor().getCode()));
                    // evaluate code from given file
                    result = ref.getCompiledScript().eval(newContext);
                    
                    //restore old context
                    engine.setBindings(oldBindings, ScriptContext.ENGINE_SCOPE);
                    //engine.setContext(oldContext);
                    return result;                    
                }
                else
                {
           			if(!getCrudEngine().turnOffLogging)
                    	_logger.info("using jsr 223, uncompilable engine");                  
                    // evaluate code from given file
                    result = engine.eval(ref.getScriptExecutor().getCode(),newContext);
                    
                    //restore old context
                    engine.setBindings(oldBindings, ScriptContext.ENGINE_SCOPE);
                    //engine.setContext(oldContext);
                    return result;                    
                }
            }
        }
      	Map returnVal = new HashMap();
        returnVal.put("crudzilla_status","error");
      	returnVal.put("msg","couldn't execute code, possibly unsupported language");
      	returnVal.put("language_type",type);
      	return returnVal;
    }
}
