/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.fileuploader.bean.FileUploadPackage;
import com.crudzilla.platform.fileuploader.bean.FileUploaderReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.util.FileUploaderUtil;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class FileUploader extends Executable{
    //static Logger       _logger = Logger.getLogger(FileUploader.class.getName());
    private Log _logger = LogFactory.getLog(FileUploader.class);
    
    public FileUploader(){
        
    }
    
    public FileUploader(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
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
                ExecutableDefinitionReference ref = new FileUploaderReference(crudExecutable,this);
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
            returnVal.put("status", "success");  
            throw ex;
        }//return returnVal;
    }

    @Override
    Object doCoreAction(ExecutableDefinitionReference inref) throws Exception{
        FileUploaderReference uploaderReference = (FileUploaderReference)inref;
        
        String fileName = "";
        FileUploadPackage uploadPackage = new FileUploadPackage();
        uploadPackage.setFiles(new ArrayList<String>());
        uploadPackage.setParameters(new HashMap<String,String>());        

        
        if(_arguments.get("crudzilla_multipart_files") != null){
            
            Map<String,Object>  files =  (Map<String,Object>)_arguments.get("crudzilla_multipart_files");
            _logger.info("crudzilla_multipart_files:"+files.size());
            for (Map.Entry<String, Object> entry : files.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem)value;
                
                long sizeLimit = -1;
                if(uploaderReference.getFileUploader().getSizeLimit() != null &&
                   !uploaderReference.getFileUploader().getSizeLimit().isEmpty()){
                    sizeLimit = Long.parseLong(uploaderReference.getFileUploader().getSizeLimit());
                }
                
                if(sizeLimit>0 && item.getSize()>sizeLimit){
                    _logger.warn("File "+item.getName()+" exceeds size limit, will be descarded.");
                    continue;
                }
                
                //use original file name
                if((uploaderReference.getFileUploader().getNamePrefix() == null || uploaderReference.getFileUploader().getNamePrefix().isEmpty())
                     && (uploaderReference.getFileUploader().getUseName() == null || uploaderReference.getFileUploader().getUseName().isEmpty())
                    && (uploaderReference.getFileUploader().getAutoGenName() == null || uploaderReference.getFileUploader().getAutoGenName().isEmpty() || uploaderReference.getFileUploader().getAutoGenName().compareTo("false") == 0))
                        fileName = item.getName();                        
                else
                if(uploaderReference.getFileUploader().getNamePrefix() != null && 
                        uploaderReference.getFileUploader().getAutoGenName() != null &&
                        uploaderReference.getFileUploader().getAutoGenName().compareTo("true") == 0)
                        fileName = uploaderReference.getFileUploader().getNamePrefix()+java.util.UUID.randomUUID().toString();
                else
                if(uploaderReference.getFileUploader().getAutoGenName() != null &&
                        uploaderReference.getFileUploader().getAutoGenName().compareTo("true") == 0)
                        fileName = java.util.UUID.randomUUID().toString();
                else
                if(uploaderReference.getFileUploader().getUseName() != null)
                        fileName = uploaderReference.getFileUploader().getUseName();


                if(item.getName().endsWith(".zip") && item.getName().compareTo(fileName) != 0)
                    fileName += ".zip";

                File destDir;
                String destDirStr = uploaderReference.getFileUploader().getDestDir();
                  
                  
                  
                if(destDirStr.compareTo(".") == 0){
                    //destDirStr = getResourcePath().substring(0,getResourcePath().lastIndexOf("/"));                    
                    destDir = new File( _crudEngine.getCrudHomeDir()+getResourcePath() ) .getParentFile();
                }
                else              
                    destDir = new File(destDirStr);
                
                _logger.info("uploading to destdir "+destDir.getAbsolutePath());
                try
                {
                    item.write(new File(destDir.getAbsolutePath()+"/"+fileName));
                }
                catch(Exception ex){
                    _logger.error(ex);
                     throw ex;
                }
                
                //if it is a zip file and unpack is checked, unpack it.
                if(fileName.endsWith(".zip") && uploaderReference.getFileUploader().getEnableUnpack() != null && 
                        uploaderReference.getFileUploader().getEnableUnpack().compareToIgnoreCase("true") == 0){
                    _logger.info("unzipping");
                    
                    FileUploaderUtil.unZip(destDir.getAbsolutePath()+"/"+fileName,destDir.getAbsolutePath());
                  
         			if(uploaderReference.getFileUploader().getDeleteOriginal() != null && 
                        uploaderReference.getFileUploader().getDeleteOriginal().compareToIgnoreCase("true") == 0){
                       _logger.info("deleting original zip file");
                      
                       new File(destDir.getAbsolutePath()+"/"+fileName).delete();
                    }       
                }

                uploadPackage.getFiles().add(/*uploaderReference.getFileUploader().getDestDir()+"/"+*/fileName);
                
            }            
            
        }
        
        
        
        /*--
        FileUploadPackage uploadPackage = new FileUploadPackage();
        uploadPackage.setFiles(new ArrayList<String>());
        uploadPackage.setParameters(new HashMap<String,String>());
        
        FileUploaderReference uploaderReference = (FileUploaderReference)inref;        
        int clbSizelimit = 100000000;
        // Check that we have a file upload request
        boolean isMultipart = org.apache.commons.fileupload.servlet.ServletFileUpload.isMultipartContent(_request);
        if(isMultipart){
            
            try{
                // Create a factory for disk-based file items
                org.apache.commons.fileupload.FileItemFactory factory = new org.apache.commons.fileupload.disk.DiskFileItemFactory();

                ((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setSizeThreshold(clbSizelimit);

                ((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setRepository(new File(""+_arguments.get("crudzilla_temp_upload_directory")));
                // Create a new file upload handler
                org.apache.commons.fileupload.servlet.ServletFileUpload upload = new org.apache.commons.fileupload.servlet.ServletFileUpload(factory);

                // Parse the request
                java.util.List items = upload.parseRequest(_request);
                java.util.Iterator iter = items.iterator();

                _logger.info("about to do upload");
                
                while (iter.hasNext()) {
                    org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem) iter.next();
                    if (item.isFormField()) {                        
                        uploadPackage.getParameters().put(item.getFieldName(), item.getString());
                    } else {                        
                        
                        //use original file name
                        if(uploaderReference.getFileUploader().getNamePrefix() == null && uploaderReference.getFileUploader().getName() == null && uploaderReference.getFileUploader().getAutoGenName().compareTo("no") == 0)
                                fileName = item.getName();                        
                        else
                        if(uploaderReference.getFileUploader().getNamePrefix() != null && uploaderReference.getFileUploader().getAutoGenName().compareTo("yes") == 0)
                                fileName = uploaderReference.getFileUploader().getNamePrefix()+java.util.UUID.randomUUID().toString();
                        else
                        if(uploaderReference.getFileUploader().getAutoGenName().compareTo("yes") == 0)
                                fileName = java.util.UUID.randomUUID().toString();
                        else
                        if(uploaderReference.getFileUploader().getUseName() != null)
                                fileName = uploaderReference.getFileUploader().getUseName();
                        
                        _logger.info("uploaded file name:"+fileName);
                        
                        if(item.getName().endsWith(".zip"))
                            fileName += ".zip";
                        
                        String relDestDir =  uploaderReference.getFileUploader().getDestDir() != null && !uploaderReference.getFileUploader().getDestDir().isEmpty()?uploaderReference.getFileUploader().getDestDir():uploaderReference.getFileUploader().getDestDir();
                        File destDir = CrudzillaUtil.getFile(relDestDir);
                        item.write(new File(destDir.getAbsolutePath()+"/"+fileName));
                        
                        //if it is a zip file and unpack is checked, unpack it.
                        if(fileName.endsWith(".zip"))
                            FileUploaderUtil.unZip(destDir.getAbsolutePath(),fileName);
                        
                        uploadPackage.getFiles().add(relDestDir+"/"+fileName);
                    }
                }
            }
            catch(Exception ex){
                _logger.error(ex);
            }
        }
        */
        
        return uploadPackage.getFiles();
    }
}
