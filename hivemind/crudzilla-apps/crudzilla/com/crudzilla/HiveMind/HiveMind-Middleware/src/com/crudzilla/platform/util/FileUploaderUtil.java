/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import java.io.File;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class FileUploaderUtil {
    //static Logger logger = Logger.getLogger(FileUploaderUtil.class.getName());
    private static Log logger = LogFactory.getLog(FileUploaderUtil.class);
    
    public static void unZip(String zipFile,String destDir){
        File file = new File(zipFile);
 
        String unzipDir;
        String unzipFileName;
        String topMostEntryName = com.crudzilla.util.Unzip.getTopMostEntryName(file.getAbsolutePath());

        if(zipFile.lastIndexOf(".zip")>-1)
            unzipFileName = zipFile.substring(0,zipFile.lastIndexOf(".zip"));
        else
            unzipFileName = zipFile;

        
        //if there is a top-most entry that is a folder and it has the same name as zip file (sans extension), then flatten directory structure
        if(new File(unzipFileName).getName().compareTo(topMostEntryName) == 0){
            unzipDir = /*destDir+"/"+*/unzipFileName;
            //System.out.println("Unziping with skip");
            com.crudzilla.util.Unzip.unzipAndSkipBase(file.getAbsolutePath(),unzipDir);
        }
        else{
            unzipDir = /*destDir+"/"+*/unzipFileName;
            com.crudzilla.util.Unzip.unzip(file.getAbsolutePath(),unzipDir);
        }
        //file.delete();
    }    
}
