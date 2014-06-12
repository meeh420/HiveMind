/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutionActionHandler;
import com.crudzilla.platform.invocation.Executable;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONNull;
import net.sf.json.JSONObject;
import net.sf.json.JSONArray;

import org.apache.commons.beanutils.BeanUtilsBean;
import org.apache.commons.beanutils.LazyDynaBean;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Calendar;
import com.crudzilla.platform.bean.DefinitionExecutionParameter;

/**
 *
 * @author bitlooter
 */
public class CrudzillaUtil {
    
    static private Log _logger = LogFactory.getLog(CrudzillaUtil.class);
    //static Logger logger = Logger.getLogger(CrudzillaUtil.class.getName());
    
    public static void uploadFiles(HttpServletRequest request,String destDir,String namePrefix,String name,boolean autoGenName,HashMap parameters,List files){
        
        String fileName = "";
        
        int clbSizelimit = 100000000;
        // Check that we have a file upload request
        boolean isMultipart = org.apache.commons.fileupload.servlet.ServletFileUpload.isMultipartContent(request);
        if(isMultipart){
            try{
                // Create a factory for disk-based file items
                org.apache.commons.fileupload.FileItemFactory factory = new org.apache.commons.fileupload.disk.DiskFileItemFactory();

                ((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setSizeThreshold(clbSizelimit);

                // Create a new file upload handler
                org.apache.commons.fileupload.servlet.ServletFileUpload upload = new org.apache.commons.fileupload.servlet.ServletFileUpload(factory);

                // Parse the request
                java.util.List items = upload.parseRequest(request);
                java.util.Iterator iter = items.iterator();

                while (iter.hasNext()) {
                    org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem) iter.next();
                    if (item.isFormField()) {
                        parameters.put(item.getFieldName(), item.getString());
                    } else {
                        
                        //use original file name
                        if(namePrefix == null && name == null && !autoGenName)
                                fileName = item.getName();                        
                        else
                        if(namePrefix != null && autoGenName)
                                fileName = namePrefix+java.util.UUID.randomUUID().toString();
                        else
                        if(autoGenName)
                                fileName = java.util.UUID.randomUUID().toString();
                        else
                        if(name != null)
                                fileName = name;
                        
                        item.write(new File(destDir+fileName));
                        files.add(fileName);
                    }
                }
            }
            catch(Exception ex){
                _logger.error(ex);
            }
        }
    }
    
    public static void unZip(String destDir,String fileName){
        java.io.File file = new java.io.File(destDir+"/"+fileName+"z");
 
        String unzipDir;
        String unzipFileName;
        String topMostEntryName = com.crudzilla.util.Unzip.getTopMostEntryName(file.getAbsolutePath());

        if(fileName.lastIndexOf(".zip")>-1)
            unzipFileName = fileName.substring(0,fileName.lastIndexOf(".zip"));
        else
            unzipFileName = fileName;

        //if there is a top-most entry that is a folder and it has the same name as zip file (sans extension), then flatten directory structure
        if(unzipFileName.compareTo(topMostEntryName) == 0){
            unzipDir = destDir+"/"+unzipFileName;
            //System.out.println("Unziping with skip");
            com.crudzilla.util.Unzip.unzipAndSkipBase(file.getAbsolutePath(),unzipDir);
        }
        else{
            unzipDir = destDir+"/"+unzipFileName;
            com.crudzilla.util.Unzip.unzip(file.getAbsolutePath(),unzipDir);
        }
        //file.delete();
    }
    
    public static void writeFile(String filePath,HttpServletRequest request,HttpServletResponse response){
        try{
            String mime = null;
            java.io.File file = new java.io.File(filePath);

            
            String ext;
            if(filePath.lastIndexOf(".") != -1){
                ext = filePath.substring(filePath.lastIndexOf("."),filePath.length());
                mime = null;//com.appynote.util.ConfigUtil.ext2mime_mapping.get(ext);
            }

            if(mime == null)
            {
                java.util.Collection<?> mimeTypes = eu.medsea.mimeutil.MimeUtil.getMimeTypes(file);
                java.util.Iterator itr = mimeTypes.iterator();
                while(itr.hasNext()){
                    mime = itr.next().toString();
                    break;
                }
            }
            _logger.info("serving mime:"+mime);
            
            //if(mime.compareTo("text/javascript")==0){
            //    response.setContentType(mime+"; charset=UTF-8");
            //    response.setCharacterEncoding("UTF-8");
            //}else
            //if(mime != null)
                response.setContentType(mime);

            //response.setHeader("Pragma", "no-cache");
            //response.setHeader("Expires", "0");
            response.setHeader("Content-Length",""+file.length());


            java.io.OutputStream o = response.getOutputStream();

            //System.out.println("importing file:"+importFile);
            java.io.InputStream is =  new java.io.FileInputStream(file);
            
            byte[] buf = new byte[32 * 1024]; // 32k buffer
            int nRead = 0;

            while( (nRead=is.read(buf)) != -1 ) {
                o.write(buf, 0, nRead);
            }            
            //o.flush();
            //o.close();// *important* to ensure no more jsp output
            //is.close();
        }catch(IOException ex){
            _logger.error(ex);
        }        
    }
    
    public static void writeFile(File file,HttpServletResponse response){
        try{
            String mime = null;

            
            String ext;
            if(file.getName().lastIndexOf(".") != -1){
                ext = file.getName().substring(file.getName().lastIndexOf("."),file.getName().length());
                mime = null;//com.appynote.util.ConfigUtil.ext2mime_mapping.get(ext);
            }

            if(mime == null)
            {
                java.util.Collection<?> mimeTypes = eu.medsea.mimeutil.MimeUtil.getMimeTypes(file);
                java.util.Iterator itr = mimeTypes.iterator();
                while(itr.hasNext()){
                    mime = itr.next().toString();
                    break;
                }
            }
            
            _logger.info("serving mime:"+mime);
            //if(mime.compareTo("text/javascript")==0){
            //    response.setContentType(mime+"; charset=UTF-8");
            //    response.setCharacterEncoding("UTF-8");
            //}else
            //if(mime != null)
                response.setContentType(mime);

          
            
          
            //response.setHeader("Pragma", "no-cache");
            //response.setHeader("Expires", "0");
            response.setHeader("Content-Length",""+file.length());


            java.io.OutputStream o = response.getOutputStream();

            //System.out.println("importing file:"+importFile);
            java.io.InputStream is =  new java.io.FileInputStream(file);
            
            byte[] buf = new byte[32 * 1024]; // 32k buffer
            int nRead = 0;

            while( (nRead=is.read(buf)) != -1 ) {
                o.write(buf, 0, nRead);
            }            
            //o.flush();
            //o.close();// *important* to ensure no more jsp output
            //is.close();
        }catch(IOException ex){
            _logger.error(ex);
        }        
    }    
    
    /*--public static void writeText(String text,String mime,HttpServletResponse response){
        
        try{            
            response.setContentType(mime+";charset=UTF-8");
            PrintWriter out = response.getWriter();
            try {
                out.println(text);
            } finally {            
                out.close();
            }    
        }catch(Exception ex){
            _logger.error(ex);
        }
    }*/
    
    public static void writeFile(Crudzilla engine,String path,HttpServletResponse response){
        writeFile(getFile/*--FromRealm*/(engine,path),response);
    }    
    
    /*--public static File getFileFromRealm(String path){
        File file = new File(com.crudzilla.util.ConfigUtil.resource_directory+"/public/"+path);
        if(file.exists())return file;
        file = new File(com.crudzilla.util.ConfigUtil.resource_directory+"/authenticate/"+path);
        if(file.exists())return file;      
        file = new File(com.crudzilla.util.ConfigUtil.resource_directory+"/authorize/"+path);
        if(file.exists())return file;    
        return null;
    } */
    
    public static File getCrudFile(Crudzilla engine,String path){
        return new File(engine.getCrudHomeDir()+"/"+path);
    }    
    
    public static File getFile(Crudzilla engine,String path){
        return AssetFSManager.resolveToAssetBase(engine,path);
        //return new File(com.crudzilla.util.ConfigUtil.resource_directory+"/"+path);
    }  
    
    public static Map<String,String> getPathInfo(Crudzilla engine,String resourcePath){
        String realmBase = AssetFSManager.resolveToAssetBase(engine,"").getAbsolutePath();

        String curParentPath = "";

        int slashIndex = resourcePath.lastIndexOf("/");
        if(slashIndex >0)
            curParentPath = "/"+resourcePath.substring(0, slashIndex);

        Map<String,String> returnVal = new HashMap();
        while(true)
        {
            if(new File(realmBase+curParentPath).exists()){                
                returnVal.put("realm", "default");
                returnVal.put("parentDir", realmBase+curParentPath);
                String relPath = (realmBase+"/"+resourcePath).substring((realmBase+curParentPath).length());
                int mi = relPath.lastIndexOf("/");
                
                if(mi>0)
                    returnVal.put("missingPath",relPath.substring(0,mi));
                
                returnVal.put("resourceName", relPath.substring(mi+1));
                returnVal.put("relPath", relPath);
                return returnVal;
            }

            slashIndex = curParentPath.lastIndexOf("/");
            if(slashIndex >0)
                curParentPath = curParentPath.substring(0, slashIndex);
            else
                break;
        }return null;        
    }        
        
    public String newUUID(){
        return java.util.UUID.randomUUID().toString();
    }    
    
    public long currentTimeStamp(){
        return new java.util.Date().getTime();
    }
    
    static Object getJSONParameterValue(Object template,Map<String,Object> arguments){
        if(template instanceof String && template.toString().startsWith(":crudzilla_param"))
              return arguments.get(template.toString().substring(":crudzilla_param".length()).trim()); 
        return template.toString();
    }  
  
    static Object evalJSONArray(JSONArray jobj,Map<String,Object>arguments){
        List mobjs = new ArrayList();
        java.util.Iterator<Object> itr = jobj.iterator();
        
        while(itr.hasNext()){
          Object iobj = itr.next();
          
          if(iobj == null || iobj instanceof JSONNull  || (iobj instanceof JSONObject && ((JSONObject)iobj).isNullObject()))
            mobjs.add(null);
          else
          if(iobj instanceof JSONObject)
            mobjs.add(evalJSONObject((JSONObject)iobj,arguments));
          else
          if(iobj instanceof JSONArray)
            mobjs.add(evalJSONArray((JSONArray)iobj,arguments));
          else
            mobjs.add(iobj.toString());
        }
        return mobjs;      
    }
    
    static Object evalJSONObject(JSONObject jobj,Map<String,Object>arguments){
      
      	
          Map mobj = new HashMap();
          java.util.Iterator<String> itr = jobj.keys();
          while(itr.hasNext()){
              String key = itr.next();
            
              if(jobj.get(key) == null || jobj.get(key) instanceof JSONNull || (jobj.get(key) instanceof JSONObject && ((JSONObject)jobj.get(key)).isNullObject())){
              	mobj.put(key,null);
              }
              else
              if(jobj.get(key) instanceof JSONObject){
                mobj.put(key,evalJSONObject((JSONObject)jobj.get(key),arguments));
              }
              else
              if(jobj.get(key) instanceof JSONArray){                
                mobj.put(key,evalJSONArray((JSONArray)jobj.get(key),arguments));
              }
              else
              {
                mobj.put(key,getJSONParameterValue(jobj.get(key),arguments));
              }
          }
          
          try{
              String className = "org.apache.commons.beanutils.LazyDynaBean";
              if(jobj.has("crudzillaJavaLangClass"))
                className = jobj.getString("crudzillaJavaLangClass");
              
              Object jBean = Class.forName(className).newInstance();
              BeanUtilsBean.getInstance().populate(jBean, mobj);
              return jBean;
          }catch(Exception ex){
          	_logger.error("Error processing JSON object to bean",ex);
          }
      
      	  return null;
    }
  
    static Object evalJSONText(String jsonText,Map<String,Object>arguments){
      	if(jsonText.trim().startsWith("{"))
    		return evalJSONObject(JSONObject.fromObject(jsonText),arguments);
        else
        	return evalJSONArray(JSONArray.fromObject(jsonText),arguments);     
    }  
  	
    static Object evalPlainText(String text,Map<String,Object>arguments,Executable caller){
      	
        boolean 	  inExpr = false;
        String 		  expr 	 = "";
        StringBuilder buf 	 = new StringBuilder();
      
      	for(int i=0;i<text.length();i++){
          
        	char c = text.charAt(i);
          
            if(!inExpr && c == '#' && i+1<text.length() && text.charAt(i+1) == '{'){
              inExpr = true;
              ++i;
          	}
            else
            if(inExpr && c == '}'){
              
              if(!expr.trim().isEmpty()){
                JexlContext context = new MapContext(arguments);
                context.set("arguments",arguments);
                context.set("crud",caller);
                
                Expression e = caller.getCrudEngine().JexlEngine().createExpression(expr.trim());
                Object r = e.evaluate(context);
                
                if(r != null)
                  buf.append(r.toString());              
              }
              expr = "";
              inExpr = false;
            }
          	else
            if(inExpr){
              expr += c;
            }
          	else
            {
              buf.append(c); 
            }
      	}
      
        return buf.toString();
    }
  
    static long getCurrentUTCTimeStamp(){
   		Calendar tempcal = Calendar.getInstance();
    	return tempcal.getTimeInMillis();
    }
  
  
    static Object computeArgVal(String paramName,String arg,Map<String,Object> arguments,Executable caller){
        if(arg.compareTo("crudzilla_next_insert_id") == 0){
            String lastUUID = java.util.UUID.randomUUID().toString();            
            arguments.put("crudzilla_last_insert_id",lastUUID);
            return lastUUID;
        }
        else
        if(arg.compareTo("crudzilla_generate_uuid") == 0){
            String lastUUID = java.util.UUID.randomUUID().toString().replaceAll("-","");
            return lastUUID;
        }      
        else
        if(arg.compareTo("crudzilla_current_timestamp") == 0){
            long ts = getCurrentUTCTimeStamp();//""+(new java.util.Date().getTime());
            arguments.put("crudzilla_current_timestamp",ts);
            return ts;
        }     
        else
        if(arg.compareTo("crudzilla_current_timestamp_seconds") == 0){
            long ts = getCurrentUTCTimeStamp();//(new java.util.Date().getTime());
            arguments.put("crudzilla_current_timestamp_seconds", (long)(ts/1000));
            return ts;
        }      
        else
        if(arg.compareTo("crudzilla_current_timestamp_minutes") == 0){
            long ts = getCurrentUTCTimeStamp();//(new java.util.Date().getTime());
            arguments.put("crudzilla_current_timestamp_minutes", (long)(ts/60000));
            return ts;
        }      
        else
        if(arg.compareTo("crudzilla_empty_string") == 0){
            return "";
        }
        else
        if(arg.startsWith("crudzilla_selector_")){
            //get switch variable name
            String switchVariable = arg.substring("crudzilla_selector_".length());
          
            //check argument map first for switch variable
            String switchValue    = (String)arguments.get(switchVariable);
              
            //if the switch variable isn't present on argument map, get global switches
            Object appSwitches    = caller.getCrudEngine().sysSettings().get("crudzilla_variable_selector_switches");
            if(switchValue == null && appSwitches != null && !(appSwitches instanceof String))              
				switchValue = (String)((LazyDynaBean)appSwitches).get(switchVariable);
          
            if(switchValue != null)
            	return arguments.get(switchValue+"_"+paramName);            
        }
        return null;
    }
    
    public static Object getArgumentValue(String ref,Map<String,Object> arguments,String type,DefinitionExecutionParameter parameter,Executable caller){
  
        if(ref== null || ref.isEmpty()) return ref;
        
        String arg = ref;
        
         if(type.compareTo("expression") == 0 && 
           parameter != null &&
           parameter.getType() != null && 
           parameter.getType().compareTo("crud") == 0){
           return caller.call(arg,arguments);
        }
      
        if(type.compareTo("expression") == 0 && 
           parameter != null &&
           parameter.getType() != null && 
           parameter.getType().compareTo("json") == 0){
        	return evalJSONText(arg,arguments);        
        }
      
         if(type.compareTo("expression") == 0 && 
           parameter != null &&
           parameter.getType() != null && 
           parameter.getType().compareTo("plain-text") == 0){
        	return evalPlainText(arg,arguments,caller);        
        }     
      
        if(type.compareTo("expression") == 0 && arg.startsWith(":crudzilla_param")){
            arg = ref.substring(":crudzilla_param".length()).trim();
            return arguments.get(arg);
        }     
        
        if(type.compareTo("expression") == 0 && (arg.startsWith(":") || arg.startsWith("@"))){
            arg = ref.substring(1).trim();
                        
            
            Object val = computeArgVal(parameter != null?parameter.getName():"",arg,arguments,caller);
            if(val != null)return val;
            
            _logger.info("evaluating source parameter :"+arg+"="+arguments.get(arg));
            if(arguments.get(arg) != null)
                return arguments.get(arg);
            
            arg = ref;
        }      
      
        if(type.compareTo("expression") == 0){
            Object val = computeArgVal(parameter != null?parameter.getName():"",arg,arguments,caller);
            if(val != null)return val;            
            
            JexlContext context = new MapContext(arguments);
            context.set("arguments",arguments);
            context.set("crudzilla",caller.getCrudEngine());
            context.set("crud",caller);
            
            Expression e = caller.getCrudEngine().JexlEngine().createExpression(ref);
            return e.evaluate(context);
        }
        return (ref);
    }
    
    public static void setArgumentValue(String ref,Map<String,Object> arguments,Object val,String type,Executable caller){

        if(ref == null || ref.isEmpty()) return;
      
        if(type.compareTo("expression") == 0){
            JexlContext context = new MapContext(arguments);
            context.set("arguments",arguments);
            context.set("crud",caller);
            context.set("rval",val);
            
            //_logger.info("evaluating "+ref+"="+val.toString());
            if(ref != null && !ref.isEmpty()){
                Expression e = caller.getCrudEngine().JexlEngine().createExpression(ref+"=rval;");
                e.evaluate(context);
            }/*else{
                Expression e = Crudzilla.JexlEngine().createExpression("return rval;");
                e.evaluate(context);                
            }*/
        }else{
            arguments.put(ref,val);
        }
    }       
    
    public static Map<String,Object> newArgumentMap(Crudzilla engine,Map<String,Object> arguments){
               
        //if(true)return arguments;
        Map<String,Object> newMap = new HashMap<String,Object>();
        newMap.put("crudzilla_system_settings",engine.sysSettings());
      
        if(arguments != null){
          //add user_id to arguments, this is added here instead of having 
          //to propagate this across numerous pre-action handlers
          newMap.put("crudzilla_user",arguments.get("crudzilla_user"));
          newMap.put("httpRequest",arguments.get("httpRequest"));
          newMap.put("httpResponse",arguments.get("httpResponse"));        
          newMap.put("crudzillaHttpRequestContext",arguments.get("crudzillaHttpRequestContext"));
          
          
          if(arguments.get("crudException") != null)
              newMap.put("crudException",arguments.get("crudException"));         
          
          for (Map.Entry<String, Object> entry : arguments.entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue();
              if(key.startsWith("crudzilla_user_"))
                      newMap.put(key, value);
          }      
        }
        return newMap;
    }     
    
    public static Map<String,Object> copyToMap(Map<String,Object> arguments,Object copyArgs){
        
        if(copyArgs instanceof LazyDynaBean){
          _logger.info("begin exploding LazyDynaBean");
          for (Map.Entry<String, Object> entry : ((Map<String,Object>)((LazyDynaBean)copyArgs).getMap()).entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue();   
              _logger.info(key+":"+value);
              arguments.put(key,value); 
          }      
          
        }
        else
        if(copyArgs instanceof Map){
          _logger.info("begin exploding Map");
          for (Map.Entry<String, Object> entry : ((Map<String, Object>)copyArgs).entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue();
              _logger.info(key+":"+value);
              arguments.put(key,value);         
          }      
        }      
        else
        if(copyArgs instanceof ArrayList){
          _logger.info("begin exploding ArrayList");
          for(String copyArg:(ArrayList<String>)copyArgs){
              _logger.info(copyArg);
              arguments.put(copyArg, arguments.get(copyArg));        
          }
        }
        _logger.info("end exploding");
        return arguments;
    }  
    
    public static Map<String,Object> newArgumentMap(Crudzilla engine,Map<String,Object> arguments,Object copyArgs){
        return CrudzillaUtil.copyToMap(CrudzillaUtil.newArgumentMap(engine,arguments),copyArgs);
      
        /*
        if(copyArg instanceof LazyDynaBean){
          for (Map.Entry<String, Object> entry : ((Map<String,Object>)((LazyDynaBean)copyArg).getMap()).entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue();
            
              if(key != null && !key.isEmpty() && value != null && !value.isEmpty())
                newMap.put(value, arguments.get(key));     
              else
              if(key != null && !key.isEmpty())
                newMap.put(key, arguments.get(key));  
              else
              if(value != null && !value.isEmpty())
                newMap.put(value, arguments.get(value));
          }      
        }
        else
        if(copyArg instanceof Map){
          for (Map.Entry<String, Object> entry : ((Map<String, Object>)copyArg).entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue();
             
              if(key != null && !key.isEmpty() && value != null && !value.isEmpty())
                newMap.put(value, arguments.get(key));     
              else
              if(key != null && !key.isEmpty())
                newMap.put(key, arguments.get(key));  
              else
              if(value != null && !value.isEmpty())
                newMap.put(value, arguments.get(value));            
          }      
        }      
        else
        if(copyArg instanceof ArrayList){
        {       
          for(String copyArg:(ArrayList<String>)copyArgs)
              newMap.put(copyArg, arguments.get(copyArg));        
        }  
        
      	return newMap;
        */
    }        
    
    public static Map<String,Object> getCallArgMap(String propMode,String propListPath,Map<String,Object>curArguments,Executable caller){
            Map<String,Object> arguments = null;
            //propagate primary map
            if(propMode != null &&
                propMode.compareTo("pass_map") == 0){
                arguments = curArguments;
            }
            else
            if(propMode != null &&
                propMode.compareTo("all_map_values") == 0){
                arguments = new HashMap<String,Object>();
                for (Map.Entry<String, Object> entry : curArguments.entrySet()) { 
                    String key = entry.getKey();
                    Object value = entry.getValue();
                    arguments.put(key, value);
                }
            }
            else
            if(propMode != null &&
                propMode.compareTo("some_map_values") == 0){
                //propagate a selected list
                if(propListPath != null &&
                    !propListPath.isEmpty()){                    
                    arguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),curArguments,caller.call(propListPath,curArguments));
                }                
            }
            else
            if(propMode != null &&
                propMode.compareTo("none") == 0){
                arguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),curArguments);
            }
            else
            {//propagate none
                arguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),curArguments); 
            }        
            return arguments;
    }    
    
    
    public static Map<String, Object> parseRequest(Crudzilla engine,HttpServletRequest request){
        
        Map<String, Object> arguments  = new HashMap<String,Object>();
        Map<String,Object>  files      = new HashMap<String,Object>();
        
        int clbSizelimit = 100000000;
        // Check that we have a file upload request
        boolean isMultipart = org.apache.commons.fileupload.servlet.ServletFileUpload.isMultipartContent(request);
        if(isMultipart){
            
            try
            {
                // Create a factory for disk-based file items
                org.apache.commons.fileupload.FileItemFactory factory = new org.apache.commons.fileupload.disk.DiskFileItemFactory();

                ((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setSizeThreshold(clbSizelimit);

                ((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setRepository(new File(engine.sysSettings().get("crudzilla_temp_file_directory").toString()));
                // Create a new file upload handler
                org.apache.commons.fileupload.servlet.ServletFileUpload upload = new org.apache.commons.fileupload.servlet.ServletFileUpload(factory);

                // Parse the request
                java.util.List items = upload.parseRequest(request);
                java.util.Iterator iter = items.iterator();

                
                while (iter.hasNext()) {
                    org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem) iter.next();
                    if (item.isFormField()) {                        
                        arguments.put(item.getFieldName(), item.getString());
                    } 
                    else 
                    {
                        files.put(item.getFieldName(), item);
                    }
                }
                arguments.put("crudzilla_multipart_files",files);
            }
            catch(Exception ex){
                _logger.error(ex);
            }
        }
        else
        {
            Enumeration paramNames = request.getParameterNames();
            Map<String,String[]> params= request.getParameterMap();

            while(paramNames.hasMoreElements()){
                String paramName =(String)paramNames.nextElement();
                arguments.put(paramName, org.apache.commons.lang.StringUtils.join(params.get(paramName)));
            }
        }
        return arguments;
    }      
    
    /*--String resolvePath(String path){
        if(path.startsWith("../")){
            String[] parts =  path.split("/");
            String[] baseParts = com.crudzilla.util.ConfigUtil.resource_directory.split("/");
            String realPath = "";
            
        }
        new File(com.crudzilla.util.ConfigUtil.resource_directory+"/"+path)
    }*/
    
    public static String StringOrNull(Object obj){
        if(obj == JSONNull.getInstance() || obj == null)
            return null;
        
        return obj.toString();
    }    
  
    public static String resolveCrudPath(String basePath,String crudPath,Crudzilla engine){
      try
      {
          if(crudPath != null && !crudPath.startsWith("/")){
  
              if(basePath != null && basePath.lastIndexOf("/") != -1){
                  String conRelPath = new File(basePath.substring(0,basePath.lastIndexOf("/")+1)+crudPath).getCanonicalPath().replace("\\","/");
                  
                  //remove windows drive letter part of the path
                  if(conRelPath.indexOf(':') != -1)
                      conRelPath = conRelPath.substring(conRelPath.indexOf(':')+1);
                
                  _logger.info("caller:"+basePath+" conRelPath:"+conRelPath);
                
                  File file = CrudzillaUtil.getCrudFile(engine,conRelPath);
                  if(file != null && file.exists())
                      return conRelPath;
              }
              else
              return "/"+crudPath;                
          }
      }catch(Exception ex){
      	_logger.error("Error resolving crud path",ex);
      }
      return crudPath;
    }  
  
}
