/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.fileuploader.bean;

import com.crudzilla.platform.bean.DefinitionExecutionParameter;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import net.sf.json.JSONObject;

import java.util.Map;
/**
 *
 * @author bitlooter
 */
final public class FileUploaderReference  extends ExecutableDefinitionReference{
    
    public FileUploaderReference(JSONObject refFile,Invocation caller){
        super(refFile,new FileUploader(),caller);
    }    
    
    public FileUploader getFileUploader() {
        return (FileUploader)definition;
    }

    public void setFileUploader(FileUploader fileUploader) {
        this.definition = fileUploader;
    }
    
    @Override
    public void onPostValidate(Executable caller){
      
      		/*
            for (Map.Entry<DefinitionExecutionParameter, Object> entry : ((Map<DefinitionExecutionParameter, Object>)caller.getPreservedComputedParameterValues()).entrySet()) { 
              
              DefinitionExecutionParameter param = entry.getKey();
              Object val = entry.getValue();    
            */
      		
            for(DefinitionExecutionParameter param: this.getExecutionParameters()){
                
               //Object val = param.getComputedValue();// != null?param.getComputedValue().toString():null;//CrudzillaUtil.getArgumentValue(param.getDefaultValue(),caller.getArguments(),"expression");
 			   Object val = caller.getPreservedComputedParameterValues().get(param);
              
                if(param.getName().compareTo("destDir") == 0){
                    this.getFileUploader().setDestDir((String)val);
                }
                else
                if(param.getName().compareTo("autoGenName") == 0){
                    this.getFileUploader().setAutoGenName((String)val);
                }   
                else
                if(param.getName().compareTo("useName") == 0){
                   this.getFileUploader().setUseName((String)val);
                }                
                else
                if(param.getName().compareTo("namePrefix") == 0){
                    this.getFileUploader().setNamePrefix((String)val);
                }                
                else
                if(param.getName().compareTo("sizeLimit") == 0){
                    this.getFileUploader().setSizeLimit((String)val);
                }                
                else
                if(param.getName().compareTo("mime") == 0){
                    this.getFileUploader().setMime((String)val);
                }                
                else
                if(param.getName().compareTo("enableUnpack") == 0){
                    this.getFileUploader().setEnableUnpack((String)val);
                }              
                else
                if(param.getName().compareTo("deleteOriginal") == 0){
                    this.getFileUploader().setDeleteOriginal((String)val);
                }              
            }        
    }
}
