/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.connector.bean;
import com.crudzilla.platform.bean.ExecutableDefinition;

/**
 *
 * @author bitlooter
 */
public class Connector extends ExecutableDefinition{
    String type;
    Object url;
    
    String loginUserId;
    String loginPassWord;
    
    String authenticationHost;
    String authenticationPort;
    String authenticationType;
    
    String authenticationRealm;
    String authenticationScheme;

    //NO-MULTIPART | MULTIPART-FROM-HTTPREQUEST | MULTIPART-FROM-FS  | MULTIPART-FROM-HTTPREQUEST-FS
    String postDataSourceType;
    Object postDataFileItems;
    
    
    String method;
    String servicePath;
    String maxFileUploadSize;
    
    Object download;
    String destDir;
    String saveAs;
  	String enableUnpack;
  	String deleteOriginal;
  
    //chuck or post request mime type
    String mimeType;
    
    
    String propagateUserCredential;
    String userCredentialHash;
    
    //for form authentication
    String formPageUrl;
    String authenticationUseridParamName;
    String authenticationPasswordParamName;
  
  	Object callParameters;
	Object headers;
  
    public Object getCallParameters(){
    	return this.callParameters;
    }
  
    public void setCallParameters(Object callParameters){
    	this.callParameters = callParameters;    
    }
  
  	public void setHeaders(Object headers){
    	this.headers = headers;
  	}
  
  	public Object getHeaders(){return headers;}
  
    public String getLoginPassWord() {
        return loginPassWord;
    }

    public String getLoginUserId() {
        return loginUserId;
    }


    public Object getUrl() {
        return url;
    }


    public void setLoginPassWord(String loginPassWord) {
        this.loginPassWord = loginPassWord;
    }

    public void setLoginUserId(String loginUserId) {
        this.loginUserId = loginUserId;
    }

    public void setUrl(Object url) {
        this.url = url;
    }

    public String getServicePath() {
        return servicePath;
    }


    public void setServicePath(String servicePath) {
        this.servicePath = servicePath;
    }

    public String getAuthenticationPasswordParamName() {
        return authenticationPasswordParamName;
    }

    public String getAuthenticationUseridParamName() {
        return authenticationUseridParamName;
    }

    public String getPropagateUserCredential() {
        return propagateUserCredential;
    }

    public void setAuthenticationPasswordParamName(String authenticationPasswordParamName) {
        this.authenticationPasswordParamName = authenticationPasswordParamName;
    }

    public void setAuthenticationUseridParamName(String authenticationUseridParamName) {
        this.authenticationUseridParamName = authenticationUseridParamName;
    }

    public void setPropagateUserCredential(String propagateUserCredential) {
        this.propagateUserCredential = propagateUserCredential;
    }

    public void setUserCredentialHash(String userCredentialHash) {
        this.userCredentialHash = userCredentialHash;
    }

    public String getUserCredentialHash() {
        return userCredentialHash;
    }

    public String getMaxFileUploadSize() {
        return maxFileUploadSize;
    }

    public void setMaxFileUploadSize(String maxFileUploadSize) {
        this.maxFileUploadSize = maxFileUploadSize;
    }

    public String getAuthenticationHost() {
        return authenticationHost;
    }

    public String getAuthenticationPort() {
        return authenticationPort;
    }

    public String getAuthenticationType() {
        return authenticationType;
    }

    public void setAuthenticationHost(String authenticationHost) {
        this.authenticationHost = authenticationHost;
    }

    public void setAuthenticationPort(String authenticationPort) {
        this.authenticationPort = authenticationPort;
    }

    public void setAuthenticationType(String authenticationType) {
        this.authenticationType = authenticationType;
    }

    public String getAuthenticationRealm() {
        return authenticationRealm;
    }

    public String getAuthenticationScheme() {
        return authenticationScheme;
    }

    public void setAuthenticationRealm(String authenticationRealm) {
        this.authenticationRealm = authenticationRealm;
    }

    public void setAuthenticationScheme(String authenticationScheme) {
        this.authenticationScheme = authenticationScheme;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Object getPostDataFileItems() {
        return postDataFileItems;
    }

    public String getPostDataSourceType() {
        return postDataSourceType;
    }

    public void setPostDataFileItems(Object postDataFileItems) {
        this.postDataFileItems = postDataFileItems;
    }

    public void setPostDataSourceType(String postDataSourceType) {
        this.postDataSourceType = postDataSourceType;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getFormPageUrl() {
        return formPageUrl;
    }

    public void setFormPageUrl(String formPageUrl) {
        this.formPageUrl = formPageUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
  
    public void setDownload(Object download){
        this.download = download;
    }
  
    public Object getDownload(){return download;}
  
    public void setDestDir(String destDir){
      this.destDir = destDir;
    }
  
    public String getDestDir(){ return destDir;}
  
    public void setSaveAs(String saveAs){
      this.saveAs = saveAs;
    }
    public String getSaveAs(){return saveAs;}
  
    public void setEnableUnpack(String enableUnpack){
      this.enableUnpack = enableUnpack;
    }
  
    public String getEnableUnpack(){
      return enableUnpack;
    }
  
    public void setDeleteOriginal(String deleteOriginal){
      this.deleteOriginal = deleteOriginal;
    }
  
    public String getDeleteOriginal(){
      return deleteOriginal;
    }
}
