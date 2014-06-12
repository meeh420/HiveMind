/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.fileuploader.bean;

import com.crudzilla.platform.bean.ExecutableDefinition;


/**
 *
 * @author bitlooter
 */
public class FileUploader  extends ExecutableDefinition{
    String destDir;
    String autoGenName;
    String useName;
    String namePrefix;
    String sizeLimit;
    String mime;
    String enableUnpack;
    String deleteOriginal;

    public String getAutoGenName() {
        return autoGenName;
    }

    public String getUseName() {
        return useName;
    }

    public String getMime() {
        return mime;
    }

    public String getNamePrefix() {
        return namePrefix;
    }

    public String getSizeLimit() {
        return sizeLimit;
    }

    public void setAutoGenName(String autoGenName) {
        this.autoGenName = autoGenName;
    }

    public void setUseName(String useName) {
        this.useName = useName;
    }

    public void setMime(String mime) {
        this.mime = mime;
    }

    public void setNamePrefix(String namePrefix) {
        this.namePrefix = namePrefix;
    }

    public void setSizeLimit(String sizeLimit) {
        this.sizeLimit = sizeLimit;
    }

    public String getEnableUnpack() {
        return enableUnpack;
    }

    public void setEnableUnpack(String enableUnpack) {
        this.enableUnpack = enableUnpack;
    }

    public String getDestDir() {
        return destDir;
    }

    public void setDestDir(String destDir) {
        this.destDir = destDir;
    }
  
    public void setDeleteOriginal(String deleteOriginal){
        this.deleteOriginal = deleteOriginal;
    }
  
    public String getDeleteOriginal(){
        return deleteOriginal;
    }
}
