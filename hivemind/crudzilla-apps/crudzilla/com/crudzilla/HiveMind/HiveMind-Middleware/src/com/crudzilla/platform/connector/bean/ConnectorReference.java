/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.connector.bean;

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
public final class ConnectorReference  extends ExecutableDefinitionReference{
    /*--public ConnectorReference(JSONObject refFile){
        super(refFile,new Connector());
        if(refFile.has("definition")){
            JSONObject definitionJSON = refFile.getJSONObject("definition");
        }
    }*/
    
    
    public ConnectorReference(JSONObject refFile,Invocation caller){
        super(refFile,new Connector(),caller);
    }    
    
    
    public Connector getConnector() {
        return (Connector)definition;
    }

    public void setConnector(Connector connector) {
        this.definition = connector;
    }
    
    @Override
    public void onPostValidate(Executable caller){
      
      		/*
            for (Map.Entry<DefinitionExecutionParameter, Object> entry : ((Map<DefinitionExecutionParameter, Object>)caller.getPreservedComputedParameterValues()).entrySet()) { 
              
              DefinitionExecutionParameter param = entry.getKey();
              Object val = entry.getValue();    
      		*/
      		
            for(DefinitionExecutionParameter param: this.getExecutionParameters()){
                
                //String rightEvalType = param.getEvalRight() != null && param.getEvalRight().compareTo("yes") == 0?"expression":"literal";
                //Object val = param.getComputedValue();// != null?param.getComputedValue():null;//CrudzillaUtil.getArgumentValue(param.getDefaultValue(),caller.getArguments(),rightEvalType);
           		Object val = caller.getPreservedComputedParameterValues().get(param);
              
              
                if(param.getName().compareTo("type") == 0){
                    this.getConnector().setType((String)val);
                }
                else                
                if(param.getName().compareTo("url") == 0){
                    this.getConnector().setUrl(val);
                }
                else                
                if(param.getName().compareTo("headers") == 0){
                    this.getConnector().setHeaders(val);
                }              
                else
                if(param.getName().compareTo("loginUserId") == 0){
                    this.getConnector().setLoginUserId((String)val);
                }   
                else
                if(param.getName().compareTo("loginPassWord") == 0){
                    this.getConnector().setLoginPassWord((String)val);
                }                
                else
                if(param.getName().compareTo("authenticationHost") == 0){
                    this.getConnector().setAuthenticationHost((String)val);
                }                
                else
                if(param.getName().compareTo("authenticationPort") == 0){
                    this.getConnector().setAuthenticationPort((String)val);
                }                
                else
                if(param.getName().compareTo("authenticationType") == 0){
                    this.getConnector().setAuthenticationType((String)val);
                }                
                else
                if(param.getName().compareTo("authenticationRealm") == 0){
                    this.getConnector().setAuthenticationRealm((String)val);
                }
                else
                if(param.getName().compareTo("authenticationScheme") == 0){
                    this.getConnector().setAuthenticationScheme((String)val);
                }
                else
                if(param.getName().compareTo("postDataSourceType") == 0){
                    this.getConnector().setPostDataSourceType((String)val);
                }                
                else
                if(param.getName().compareTo("postDataFileItems") == 0){
                    //this.getConnector().setPostDataFileItems(param);
                }
                else
                if(param.getName().compareTo("method") == 0){
                    this.getConnector().setMethod((String)val);
                }                
                else
                if(param.getName().compareTo("maxFileUploadSize") == 0){
                    this.getConnector().setMaxFileUploadSize((String)val);
                }   
                else
                if(param.getName().compareTo("servicePath") == 0){
                    this.getConnector().setServicePath((String)val);
                } 
                else
                if(param.getName().compareTo("mime") == 0){
                    this.getConnector().setMimeType((String)val);
                }
                else
                if(param.getName().compareTo("formPageUrl") == 0){
                    this.getConnector().setFormPageUrl((String)val);
                }
                else
                if(param.getName().compareTo("authenticationUseridParamName") == 0){
                    this.getConnector().setAuthenticationUseridParamName((String)val);
                }
                else
                if(param.getName().compareTo("authenticationPasswordParamName") == 0){
                    this.getConnector().setAuthenticationPasswordParamName((String)val);
                }
                else
                if(param.getName().compareTo("callParameters") == 0){
                    this.getConnector().setCallParameters(val);
                }   
                else
                if(param.getName().compareTo("download") == 0){
                    this.getConnector().setDownload(val);
                }              
                else
                if(param.getName().compareTo("destDir") == 0){
                    this.getConnector().setDestDir((String)val);
                }    
                else
                if(param.getName().compareTo("saveAs") == 0){
                    this.getConnector().setSaveAs((String)val);
                }      
                else
                if(param.getName().compareTo("enableUnpack") == 0){
                    this.getConnector().setEnableUnpack((String)val);
                }                
                else
                if(param.getName().compareTo("deleteOriginal") == 0){
                    this.getConnector().setDeleteOriginal((String)val);
                }                
            }
      
            try{
                  if(
                      (this.getConnector().getUrl() != null && 
                       this.getConnector().getUrl() instanceof String &&
                       !this.getConnector().getUrl().toString().isEmpty())
                     &&
                    (this.getConnector().getAuthenticationHost() == null 
                     || this.getConnector().getAuthenticationHost().isEmpty())){
                      
                      java.net.URL url = new java.net.URL((String)this.getConnector().getUrl());
                    
                      String host = url.getHost();
                      
                      if( this.getConnector().getUrl().toString().indexOf(":"+url.getPort())  != -1)
                        host += ":"+url.getPort();
                          
                      this.getConnector().setAuthenticationHost(host);
                      caller.logger().info("connector host set to "+host);
                  }
            }catch(Exception ex){
            	caller.logger().error("Error setting connector host name.",ex);
            }
    }
}
