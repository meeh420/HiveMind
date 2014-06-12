/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.fileuploader.bean;

import java.util.List;
import java.util.Map;

/**
 *
 * @author bitlooter
 */
public class FileUploadPackage {
    Map<String,String> parameters;
    List<String> files;

    public List<String> getFiles() {
        return files;
    }

    public Map<String, String> getParameters() {
        return parameters;
    }

    public void setFiles(List<String> files) {
        this.files = files;
    }

    public void setParameters(Map<String, String> parameters) {
        this.parameters = parameters;
    }    
}
