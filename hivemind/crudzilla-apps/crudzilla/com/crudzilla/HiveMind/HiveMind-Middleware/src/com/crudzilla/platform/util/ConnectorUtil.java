/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.logging.Log; 
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class ConnectorUtil {
    //static Logger logger = Logger.getLogger(ConnectorUtil.class.getName());
    private static Log _logger = LogFactory.getLog(ConnectorUtil.class);
    
    public Map<String, Object> parseRequest(HttpServletRequest request){
        
        Map<String, Object> parameters = new HashMap<String,Object>();
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

                /*--((org.apache.commons.fileupload.disk.DiskFileItemFactory)factory).setRepository(new File(""+_arguments.get("crudzilla_temp_upload_directory")));*/
                // Create a new file upload handler
                org.apache.commons.fileupload.servlet.ServletFileUpload upload = new org.apache.commons.fileupload.servlet.ServletFileUpload(factory);

                // Parse the request
                java.util.List items = upload.parseRequest(request);
                java.util.Iterator iter = items.iterator();

                
                while (iter.hasNext()) {
                    org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem) iter.next();
                    if (item.isFormField()) {                        
                        parameters.put(item.getFieldName(), item.getString());
                    } 
                    else 
                    {
                        files.put(item.getFieldName(), item);
                    }
                }
                parameters.put("crudzilla_multipart_files",files);
                
            }
            catch(Exception ex){
                _logger.error(ex);
            }
        }
        
        return parameters;
    }        
}
