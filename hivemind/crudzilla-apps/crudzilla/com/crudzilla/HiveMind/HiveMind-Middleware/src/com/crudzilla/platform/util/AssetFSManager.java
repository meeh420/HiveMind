/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.dao.CoreDAO;
import com.crudzilla.platform.invocation.*;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class AssetFSManager{
    //static Logger logger = Logger.getLogger(AssetFSManager.class.getName());
    static private Log logger = LogFactory.getLog(AssetFSManager.class);
    
    static final java.text.DateFormat dateFormat = new java.text.SimpleDateFormat("MM-dd-yyyy");

    static JSONObject getReference(Crudzilla engine,String path){
        if(!path.endsWith(".stm") &&
           !path.endsWith(".ste") &&
           !path.endsWith(".esd") &&
           !path.endsWith(".upl") &&
           !path.endsWith(".ins") &&
           !path.endsWith(".svc"))
            return null;
        
        File file = CrudzillaUtil.getFile(engine,path);
        try{
            return JSONObject.fromObject(org.apache.commons.io.FileUtils.readFileToString(file));
        }catch(Exception e){
            logger.error(e);
        }

        return null;
    }
 
    public static void inValidateCrudCache(Crudzilla engine,String relPath,int currentDepth,int depthLimit){
        
        File file = new File(relPath);//CrudzillaUtil.getFile(relPath);        
        
        if( file.isDirectory() && (depthLimit == -1 || depthLimit>currentDepth)){
         
            LazyDynaBean monitor = (LazyDynaBean)engine.sysSettings().get("crudzilla_monitor_crud_changes");
            List<File> files =  FileFilterUtils.filterList((IOFileFilter)monitor.get("filter"), file.listFiles());
            
            for( File f:files)
            {
                //String relativePath = relPath.isEmpty()?f.getName():relPath+ separatorChar + f.getName();
                inValidateCrudCache(engine,relPath+ "/" + f.getName(),currentDepth+1,depthLimit);
            }            
        }
        else
        if(file.isFile()){
            engine.inValidateCrudCache(relPath);
        }
    }      
    
    
    
    public static File resolveToAssetBase(Crudzilla engine,String path){
        try{
            logger.info("resolving file path:"+new File(engine.getCrudHomeDir()+"/"+engine.sysSettings().get("crudzilla_asset_base")+ (path.isEmpty()?"":"/"+path)).getCanonicalPath());
        }catch(Exception ex){
        	logger.error("Error resolving path ",ex);
        }
        return new File(engine.getCrudHomeDir()+"/"+engine.sysSettings().get("crudzilla_asset_base")+ (path.isEmpty()?"":"/"+path));
    }
}
