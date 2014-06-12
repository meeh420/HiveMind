/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform;
import com.crudzilla.platform.bean.CrudzillaHttpRequestContext;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import com.crudzilla.platform.invocation.Router;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.util.DataStatementUtil;
import com.crudzilla.platform.util.AssetFSManager;
import com.crudzilla.server.FileServlet;
import eu.medsea.mimeutil.MimeUtil;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import groovy.util.GroovyScriptEngine;
import java.io.File;
import java.util.*;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.beanutils.BeanUtilsBean;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.HiddenFileFilter;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.monitor.FileAlterationListener;
import org.apache.commons.io.monitor.FileAlterationMonitor;
import org.apache.commons.io.monitor.FileAlterationObserver;
import org.apache.commons.jexl2.JexlEngine;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.velocity.app.VelocityEngine;
import java.util.Properties;


/**
 *
 * @author bitlooter
 */
final public class Crudzilla {
    private static Log           _logger = LogFactory.getLog(Crudzilla.class); 
    
    public boolean        		engineInitialized;
    Crudzilla             		crudzilla;    
    CrudzillaUtil         		_crudzillaUtil;
    DataStatementUtil     		_dataSatementUtil; 
    
    FileAlterationMonitor 		crudMonitor;
    
    ScriptEngineManager   		factory;  
    
    JexlEngine            		jexl;    
    GroovyScriptEngine    		groovyEngine;
    
    ScriptEngine          		jexljsr223Engine;
    ScriptEngine          		groovyjsr223Engine;
    ScriptEngine          		jsEngine;
    ScriptEngine          		jrubyEngine;
    ScriptEngine          		jythonEngine;
    ScriptEngine          		clojureEngine;
    ScriptEngine          		scalaEngine;
    Map<String,ScriptEngine>    loadedEngines;
  	VelocityEngine   	  		velocityEngine;
    
    
    public LazyDynaBean   		_systemSettings;
    FileServlet           		_staticFileServer;
    public Map<String,ExecutableDefinitionReference>   crudCache;
    public Map<String,Crudzilla> crudModuleCache;
  
    String 						crudHomeDir;
  	public boolean 				turnOffLogging;
    
  	String appServerHome;
  
    public Crudzilla(){
        this.engineInitialized 			= false;         
        this.crudModuleCache 			= new HashMap<String,Crudzilla>();
        this._dataSatementUtil 			= new DataStatementUtil();
        this._crudzillaUtil    			= new CrudzillaUtil();
        this.loadedEngines 				= new Hashtable();
        this.crudCache 					= new HashMap<String,ExecutableDefinitionReference>();
        this.factory 					= new ScriptEngineManager();  
        this.turnOffLogging 			= false; 
      
        this.crudzilla 					= null;   
        this.crudMonitor 				= null;
        this.jexl 						= null;    
        this.groovyEngine 				= null;        
        this.jexljsr223Engine 			= null;
        this.groovyjsr223Engine 		= null;
        this.jsEngine 					= null;
        this.jrubyEngine 				= null;
        this.jythonEngine 				= null;
        this.clojureEngine 				= null;
        this.scalaEngine 				= null;        
        this.velocityEngine 			= null;
        this._systemSettings 			= null;
        this._staticFileServer 			= null;        
        this.crudHomeDir 				= null;
      	this.appServerHome				= null;
    }
    
    public Crudzilla(Crudzilla from,String crudHomeDir){
        this();
        /*
        this.engineInitialized 			= from.engineInitialized;
        this.crudzilla 					= from.crudzilla;    
        this._crudzillaUtil 			= from._crudzillaUtil;
        this._dataSatementUtil 			= from._dataSatementUtil; 
      
        this.crudMonitor 				= from.crudMonitor;
      
        this.factory 					= from.factory;  
    
        this.jexl 						= from.jexl;    
        this.groovyEngine 				= from.groovyEngine;
        
        this.jexljsr223Engine 			= from.jexljsr223Engine;
        this.groovyjsr223Engine 		= from.groovyjsr223Engine;
        this.jsEngine 					= from.jsEngine;
        this.jrubyEngine 				= from.jrubyEngine;
        this.jythonEngine 				= from.jythonEngine;
        this.clojureEngine 				= from.clojureEngine;
        this.scalaEngine 				= from.scalaEngine;
        this.loadedEngines 				= from.loadedEngines;
        this.velocityEngine 			= from.velocityEngine;
        
        
        this._systemSettings 			= from._systemSettings;
        this._staticFileServer 			= from._staticFileServer;
        this.crudCache 					= new HashMap<String,ExecutableDefinitionReference>();
        
        
        this.turnOffLogging 			= from.turnOffLogging;
        */
        this.crudHomeDir 				= crudHomeDir;
        this.appServerHome				= from.appServerHome;
      
      	configure();
      
        this.engineInitialized = true;
    }
  
    public Crudzilla(String appBaseDir){
		this();
      
      	//determine the location of the application server housing CWAB
        this.appServerHome = System.getProperty("jetty.home");
            
        if(appServerHome == null || appServerHome.isEmpty())
              appServerHome = System.getProperty("crudzilla.appserver.home");
      
        //assume this is a standard crudzilla appserver installation
        if(!appBaseDir.startsWith("/") && appBaseDir.indexOf(':') == -1){
          crudHomeDir = appServerHome+"/crudzilla-apps/"+appBaseDir;
        }else{
          crudHomeDir = appBaseDir;          
        }
        
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.MagicMimeMimeDetector");
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.ExtensionMimeDetector");

		configure();
        
        setupCrudMonitor();      
        this.engineInitialized = true;
    }
  
  
    void configure(){
      
        String engineSettingsCrud = "/crudzilla-app-settings/system-settings.ins";
        CrudzillaHttpRequestContext crudzillaHttpRequestContext = new CrudzillaHttpRequestContext();
        Map<String,Object> arguments = new HashMap<String,Object>();
        arguments.put("crudzillaHttpRequestContext",crudzillaHttpRequestContext);

        //get system settings
        _systemSettings = (LazyDynaBean)execute(engineSettingsCrud,arguments,true,null);
        
        //process app directory settings
        if(_systemSettings.get("crudzilla_static_file_base_dir") == null || 
           _systemSettings.get("crudzilla_static_file_base_dir").toString().isEmpty())
            _systemSettings.set("crudzilla_static_file_base_dir",crudHomeDir);
      
        if(_systemSettings.get("crudzilla_velocity_template_root") == null || 
           _systemSettings.get("crudzilla_velocity_template_root").toString().isEmpty())
            _systemSettings.set("crudzilla_velocity_template_root",crudHomeDir);
           
                
        try
        {
             //get engine settings
             Map settings = (Map)execute("/crudzilla-platform/engine/settings.ins",arguments,true,null);
             settings.remove("crudzillaJavaLangClass");
             BeanUtilsBean.getInstance().populate(_systemSettings,settings);
             
            //_logger.info("crudzilla_datasource_connection_creator:"+_systemSettings.get("crudzilla_datasource_connection_creator")+"/"+settings.get("crudzilla_datasource_connection_creator"));
            
        }catch(Exception ex){
            _logger.error("Error initializing platform.",ex);
        }
        
        //get url mapper if necessary        
        /**if(_systemSettings.get("crudzilla_url_mapper") != null && 
           !_systemSettings.get("crudzilla_url_mapper").toString().isEmpty()){
            String crudPath = CrudzillaUtil.resolveCrudPath("/crudzilla-app-settings/",sysSettings().get("crudzilla_url_mapper").toString(),this);

            _systemSettings.set("crudzilla_url_mapper", execute(crudPath,arguments,"GET",true,null));
        }**/
      
        
        //if static file services is enabled, initialize handler
        if(_systemSettings.get("crudzilla_serve_static_content") != null &&
           _systemSettings.get("crudzilla_serve_static_content").toString().compareTo("true") == 0){
          
          
          _staticFileServer = new FileServlet(this);
          
          if(_systemSettings.get("crudzilla_allow_directory_listing") != null &&
             _systemSettings.get("crudzilla_allow_directory_listing").toString().compareTo("true") == 0){
            //_staticFileServer.setDirectoriesListed(true);
            
          }
          
          if(_systemSettings.get("crudzilla_welcome_files") != null){
            String[] welcomeFiles = _systemSettings.get("crudzilla_welcome_files").toString().split(",");
            if(welcomeFiles.length == 0){
              welcomeFiles = new String[]{"index.html","index.htm"};
            }
            _staticFileServer.setWelcomeFiles(welcomeFiles);
            
          }else{
            String[] welcomeFiles = new String[]{"index.html","index.htm"};
            _staticFileServer.setWelcomeFiles(welcomeFiles);                    
          }
          
          if(_systemSettings.get("crudzilla_static_file_base_dir") == null ||
            _systemSettings.get("crudzilla_static_file_base_dir").toString().isEmpty()){
            _systemSettings.set("crudzilla_static_file_base_dir",crudHomeDir);
          }          
          
          
          //temp upload and download directory
          if(_systemSettings.get("crudzilla_temp_file_directory") == null ||
            _systemSettings.get("crudzilla_temp_file_directory").toString().isEmpty()){  
            
             if(new File(crudHomeDir+"/crudzilla-temp").exists())
                _systemSettings.set("crudzilla_temp_file_directory",crudHomeDir+"/crudzilla-temp");
             else
                _systemSettings.set("crudzilla_temp_file_directory",appServerHome+"/crudzilla-temp");
          }          
          else//if path is relative to crud home then make it absolute
          if(!_systemSettings.get("crudzilla_temp_file_directory").toString().startsWith("/") &&
            _systemSettings.get("crudzilla_temp_file_directory").toString().indexOf(":") == -1
            ){
            _systemSettings.set("crudzilla_temp_file_directory",crudHomeDir+"/"+_systemSettings.get("crudzilla_temp_file_directory"));
          }
          
            try{
              _staticFileServer.setBasePath(""+_systemSettings.get("crudzilla_static_file_base_dir"));
            }catch(Exception ex){
              _logger.error("Error setting static file server path ",ex);
            }                
        }
        
        /*if(_systemSettings.get("crudzilla_logger_setup") != null &&
                 !_systemSettings.get("crudzilla_logger_setup").toString().isEmpty()){
                  execute(_systemSettings.get("crudzilla_logger_setup").toString(),new HashMap<String,Object>(),"GET",true);
              }*/     
        
        
        crudzillaHttpRequestContext = new CrudzillaHttpRequestContext();
        arguments = new HashMap<String,Object>();
        arguments.put("crudzillaHttpRequestContext",crudzillaHttpRequestContext);
        
        //call post-engine-startup script if necessary
        if(_systemSettings.get("crudzilla_engine_startup_handler") != null &&
           !_systemSettings.get("crudzilla_engine_startup_handler").toString().isEmpty()){ 
          String crudPath = CrudzillaUtil.resolveCrudPath("/crudzilla-app-settings/",sysSettings().get("crudzilla_engine_startup_handler").toString(),this);
          execute(crudPath,arguments,true,null);
        }      
    }
  
  
  
    public JexlEngine JexlEngine(){
        if(jexl == null){
            jexl  = new JexlEngine();
            jexl.setCache(512);
            jexl.setLenient(true);
            jexl.setSilent(false);
        }return jexl;
    }
    
    public GroovyScriptEngine GroovyEngine(){
        
        if(groovyEngine == null){
            
            try{
                groovyEngine = new GroovyScriptEngine(crudHomeDir+"/");
            }catch(Exception ex){
            }
        }return groovyEngine;
    }
    
    
    public ScriptEngine jsEngine(){
        
        if(jsEngine == null){
            
            try{
                jsEngine = factory.getEngineByName("JavaScript");
            }catch(Exception ex){
            }
        }return jsEngine;
    }    
    
    public ScriptEngine jrubyEngine(){
        
        if(jrubyEngine == null){
            
            try{
                jrubyEngine = factory.getEngineByName("jruby");
            }catch(Exception ex){
            }
        }return jrubyEngine;
    }    
    
    
    public ScriptEngine jythonEngine(){
        
        if(jythonEngine == null){
            
            try{
                jythonEngine = factory.getEngineByName("python");
            }catch(Exception ex){
            }
        }return jythonEngine;
    }    
    
    public ScriptEngine groovyEngine(){
        
         
        if(groovyjsr223Engine == null){
            
            try{
                groovyjsr223Engine = factory.getEngineByName("groovy");
            }catch(Exception ex){
            }
        }return groovyjsr223Engine;
    }    
    
    public ScriptEngine jexlEngine(){
        
        if(jexljsr223Engine == null){
            
            try{
                jexljsr223Engine = factory.getEngineByName("jexl");                
                ((JexlEngine)jexljsr223Engine).setCache(512);
                ((JexlEngine)jexljsr223Engine).setLenient(true);
                ((JexlEngine)jexljsr223Engine).setSilent(false);                
            }catch(Exception ex){
            }
        }return jexljsr223Engine;
    }    
    
    public ScriptEngine clojureEngine(){
        
        if(clojureEngine == null){
            
            try{
                clojureEngine = factory.getEngineByName("Clojure");
            }catch(Exception ex){
            }
        }return clojureEngine;
    }    
    
    public ScriptEngine scalaEngine(){
        /*scala.tools.nsc.interpreter.ILoop il = new scala.tools.nsc.interpreter.ILoop();
        scala.tools.nsc.Interpreter n=new scala.tools.nsc.Interpreter(new scala.tools.nsc.Settings());
        n.bind("label", "Int", new Integer(4));
        n.interpret("println(2+label)");
        // didn't event try to check success or error
        n.close();*/

        //scala.tools.nsc.interpreter.IMain im = new scala.tools.nsc.interpreter.IMain();
        //im.bind("","");
        //im.close();
        
        if(scalaEngine == null){
            
            try{
                scalaEngine = factory.getEngineByName("scala");
            }catch(Exception ex){
            }
        }return scalaEngine;
    }    
    
    
    public VelocityEngine velocityEngine(){
        
        if(velocityEngine == null){
            
            try
            {
               /*
                * now initialize the velocity engine
                */
              
                Properties p = new Properties();
                p.setProperty("resource.loader", "file");                
                p.setProperty("file.resource.loader.path", (String)_systemSettings.get("crudzilla_velocity_template_root"));
              
                velocityEngine =  new VelocityEngine(p);
                velocityEngine.init(); 
            }catch(Exception ex){
            }
        }
        return velocityEngine;
    }    
  
  
    public ScriptEngine loadEngine(String type){
        
        if(loadedEngines.get(type) == null){
            
            try{
                loadedEngines.put(type,factory.getEngineByName(type));
            }catch(Exception ex){
              _logger.error("Error loading scripting engine for "+type,ex);
            }
        }
      
        return loadedEngines.get(type);
    }  
  
    public ScriptEngine jsr223Engine(String type){
        /*if(type.startsWith("jruby"))
            return jrubyEngine();
        if(type.startsWith("scala"))
            return scalaEngine();
        if(type.startsWith("clojure"))
            return clojureEngine();        
        if(type.startsWith("jython"))
            return jythonEngine();
        if(type.startsWith("groovy"))
            return groovyEngine();
        if(type.startsWith("javascript"))
            return jsEngine();
        if(type.startsWith("jexl"))
            return jexlEngine(); */       
        return loadEngine(type);
    }
    
    
    public GroovyShell GroovyShell(Map args){        
        return GroovyShell(new Binding(args));
    }    
    
    public static GroovyShell GroovyShell(Binding args){        
        return new GroovyShell((args));
    }     
    
    //public static ResourceHandler staticServer(){
    //    return _staticFileServer;
    //}
    
    public FileServlet staticFileServer(){
        return _staticFileServer;
    }
    
  
    public String getCrudHomeDir(){
    	return crudHomeDir;
    }
  
    public String getAppServerHome(){
      return appServerHome;
    }
  
    
    void setupCrudMonitor(){
        if(_systemSettings.get("crudzilla_monitor_crud_changes") != null){

            LazyDynaBean monitor = (LazyDynaBean)_systemSettings.get("crudzilla_monitor_crud_changes");
            if(monitor.get("enable").toString().compareTo("true") == 0){

                String[] crudExts = monitor.get("crud_extensions").toString().split(",");
                // Create a FileFilter
                IOFileFilter directories = FileFilterUtils.and(FileFilterUtils.directoryFileFilter(),HiddenFileFilter.VISIBLE);

                List<IOFileFilter> cruds = new ArrayList<IOFileFilter>();

                for(String ext:crudExts){
                    cruds.add(FileFilterUtils.and(FileFilterUtils.fileFileFilter(),FileFilterUtils.suffixFileFilter(ext)));
                }

                //or all the file extension filters
                IOFileFilter crud = cruds.get(0);                    
                for(int i=1;i<cruds.size();i++)
                    crud = FileFilterUtils.or(crud,cruds.get(i));                    

                final IOFileFilter filter      = FileFilterUtils.or(directories, crud);
				final Crudzilla crudEngine = this;

                monitor.set("filter", filter);
                // Create the File system observer and register File Listeners
                FileAlterationObserver observer = new FileAlterationObserver(new File(crudHomeDir), filter);                    
                observer.addListener(new FileAlterationListener(){

                    @Override
                    public void onStart(FileAlterationObserver fao) {
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onDirectoryCreate(File file) {
                        _logger.info("updating crud cache due to directory create");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);                            
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onDirectoryChange(File file) {
                        _logger.info("updating crud cache due to directory change");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);                            
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onDirectoryDelete(File file) {
                        _logger.info("updating crud cache due to directory delete");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onFileCreate(File file) {
                        _logger.info("updating crud cache due to file create");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);                            
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onFileChange(File file) {
                        _logger.info("updating crud cache due to file change");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);                            
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onFileDelete(File file) {
                        _logger.info("updating crud cache due to file delete");
                        String relPath = file.getAbsolutePath();//.substring(com.crudzilla.util.ConfigUtil.resource_directory.length()+1);
                        AssetFSManager.inValidateCrudCache(crudEngine,relPath, 0, -1);                            
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }

                    @Override
                    public void onStop(FileAlterationObserver fao) {
                        //throw new UnsupportedOperationException("Not supported yet.");
                    }                    
                });

                long interval = Long.parseLong(monitor.get("interval").toString());
                crudMonitor = new FileAlterationMonitor(interval);
                crudMonitor.addObserver(observer);
                try{
                    crudMonitor.start();
                    _logger.info("started crud monitor");
                }catch(Exception ex){
                    _logger.error("File Monitoring failed, crud hot swap would be disabled",ex);
                }
            }
        }        
    }
    
    
    public void inValidateCrudCache(String relPath){
        _logger.info("invalidating crud:"+relPath);
        crudCache.remove(relPath);
    }
    
    public Map<String,ExecutableDefinitionReference> getxCrudCache(){
        return crudCache;
    }
    
    void shutdown(){
        try
        {
            if(crudMonitor != null)
                crudMonitor.stop();
        }catch(Exception ex){
            _logger.error("Failed to shutdown crud monitor",ex);
        }
    }
    
    public DataStatementUtil getDataStatementUtil(){
        return _dataSatementUtil;
    }
    
    public CrudzillaUtil getCrudzillaUtil(){
        return _crudzillaUtil;
    }
    
    public CrudzillaUtil util(){
        return _crudzillaUtil;
    }     
    
    public LazyDynaBean sysSettings(){
        return _systemSettings;
    }
    
    public Log logger(){
        return _logger;
    }
    
    public Object execute(HttpServletRequest request,HttpServletResponse response){
        
        String requestPath      = request.getPathInfo();
        String[] pathParts      = requestPath.split("/");

        String resourcePath = "";
        for(int i=1;i<pathParts.length;i++)
            resourcePath += (!resourcePath.isEmpty()?"/":"")+pathParts[i];
        
        Map<String,Object> arguments = CrudzillaUtil.parseRequest(this,request);
        
        
        resourcePath = "/"+resourcePath;
        
        CrudzillaHttpRequestContext crudzillaHttpRequestContext = new CrudzillaHttpRequestContext(request,response);
        
        //add user_id to arguments, this is added here instead of having 
        //to propagate this across numerous pre-action handlers
        if(request != null && request.getUserPrincipal() != null){
            arguments.put("crudzilla_user",request.getUserPrincipal().getName());
            
            LazyDynaBean userInfo = null;
            if(request.getSession().getAttribute("crudzilla_user_profile") == null)
            {
               if(sysSettings().get("crudzilla_user_profile_initializer") != null &&
                 !sysSettings().get("crudzilla_user_profile_initializer").toString().isEmpty()){
                 
                    String crudPath = CrudzillaUtil.resolveCrudPath("/crudzilla-app-settings/",sysSettings().get("crudzilla_user_profile_initializer").toString(),this);
                    
                    userInfo = (LazyDynaBean)execute(crudPath,
                          							 arguments,
                          							 true,
                          							 null);
                   request.getSession().setAttribute("crudzilla_user_profile",userInfo);
               }
            }
          	else
          	{
              userInfo = (LazyDynaBean)request.getSession().getAttribute("crudzilla_user_profile");
          	}
          
          	//populate user info
          	if(userInfo != null){
            	/*arguments.put("crudzilla_user_id",userInfo.get("user_id"));
                arguments.put("crudzilla_user_full_name",userInfo.get("user_full_name"));
                arguments.put("crudzilla_user_first_name",userInfo.get("user_first_name"));
                arguments.put("crudzilla_user_middle_name",userInfo.get("user_middle_name"));
                arguments.put("crudzilla_user_last_name",userInfo.get("user_last_name"));
                arguments.put("crudzilla_user_last_name",userInfo.get("user_last_name"));
                */
                for (Map.Entry<String, Object> entry : ((Map<String,Object>)userInfo.getMap()).entrySet()) { 
                  String key = entry.getKey();
                  Object value = entry.getValue();
                  arguments.put("crudzilla_user_"+key,value);
                }
          	}
        }
        arguments.put("httpRequest",request);
        arguments.put("httpResponse",response);
        arguments.put("crudzillaHttpRequestContext",crudzillaHttpRequestContext);
        arguments.put("crudzilla_system_settings",sysSettings());
        
        /*--
        for (Map.Entry<String, Object> entry : arguments.entrySet()) { 
            String key = entry.getKey();
            Object value = entry.getValue();
            _logger.info("scoping "+key+":"+value);
            crudzillaHttpRequestContext.addArgumentLifeCount(key,"-1");
        }        
        */
        
        return execute(resourcePath,arguments,false,null);
    }    
    
    
    String getResourcePath(HttpServletRequest request){
        String requestPath      = request.getPathInfo();
        String[] pathParts      = requestPath.split("/");        
        
        
        String resourcePath = "";
        for(int i=1;i<pathParts.length;i++){
            resourcePath += (!resourcePath.isEmpty()?"/":"")+pathParts[i];
        }
        return resourcePath;
    }
    
    Map<String,Object> getArguments(HttpServletRequest request){
        Enumeration paramNames = request.getParameterNames();
        Map<String,String[]> params= request.getParameterMap();
        Map<String,Object> arguments = new HashMap<String,Object>();
        
        while(paramNames.hasMoreElements())        {
            String paramName =(String)paramNames.nextElement();
            arguments.put(paramName, org.apache.commons.lang.StringUtils.join(params.get(paramName)));
        }        
        return arguments;
    }
  
    public Map<String,Crudzilla> getCrudModuleCache(){
      return crudModuleCache;
    }
  
    public Object execute(HttpServletRequest request,HttpServletResponse response,String resourcePath,boolean serverSide){
      Map<String,Object> args = CrudzillaUtil.newArgumentMap(this,null);
      args.put("httpRequest",request);
      args.put("httpResponse",response);
      return execute(resourcePath,args,serverSide,null);
    }
    
    public Object execute(String resourcePath,boolean serverSide){
       return execute(resourcePath,CrudzillaUtil.newArgumentMap(this,null),serverSide,null);
    }
         
    
    public Object execute(String resourcePath,Map<String,Object> arguments,boolean serverSide,Invocation caller){
        org.apache.commons.beanutils.LazyDynaBean sys =  (org.apache.commons.beanutils.LazyDynaBean)arguments.get("crudzilla_system_settings");

        String interceptor = null;
        if(sys != null)
            interceptor = (String)sys.get("crudzilla_interceptor");
        
        if(interceptor != null && !interceptor.isEmpty()){
            //make sure that interceptor isn't being invoked directly, this would lead to infinite recursion
            //and is also illogical.
            if(interceptor.compareTo(resourcePath) == 0){
              Map error = new HashMap();
              error.put("crudzilla_status","error");
              error.put("message","Illegal call to interceptor");
              return error;
            }
          
            turnOffLogging = true;
            //String crudPath = CrudzillaUtil.resolveCrudPath("/crudzilla-app-settings/",interceptor,this);
            arguments.put("crudzilla_requested_resource",resourcePath);
            arguments.put("crudzilla_requested_serverside",serverSide);
          
            Object returnVal = new Router(/*crudPath*/interceptor,arguments,(HttpServletRequest)arguments.get("httpRequest"),(HttpServletResponse)arguments.get("httpResponse"),true,caller,this).execute();
            return returnVal;
        }
        else
        {
            Object returnVal = new Router(resourcePath,arguments,(HttpServletRequest)arguments.get("httpRequest"),(HttpServletResponse)arguments.get("httpResponse"),serverSide,caller,this).execute();
            return returnVal;
        }
    }
    
    public Object execute(ExecutableDefinitionReference ref,Map<String,Object> arguments,boolean serverSide,Invocation caller){
        Object returnVal = new Router(arguments,(HttpServletRequest)arguments.get("httpRequest"),(HttpServletResponse)arguments.get("httpResponse"),serverSide,caller,this).execute(ref);
        return returnVal;
    }     
  
    public Crudzilla findCaller(Invocation caller){
       if(caller == null)
           return this;
      
       if(caller.getCrudEngine() != this)
         return caller.getCrudEngine();
      
       return findCaller(((Executable)caller).getCaller());
    }
}
