/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.connector.bean.ConnectorReference;
import com.crudzilla.platform.invocation.Invocation;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.*;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.entity.FileEntity;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.util.EntityUtils;
import org.apache.http.StatusLine;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.http.client.utils.URIBuilder;
import java.net.URI;

/**
 *
 * @author bitlooter
 */
public class HttpConnectorImpl {
    private static Log        _logger = LogFactory.getLog(HttpConnectorImpl.class);
    ConnectorReference ref;
    HttpClient         client;
    HttpHost           authHost;
    Invocation         invocation;
    
    public HttpConnectorImpl(ConnectorReference ref,Invocation invocation){
        this.ref        = ref;
        this.invocation = invocation;
    }
    
    void authenticate() throws Exception{
        String host       = null;
        int    port       = -1;
        String realm      = null;
        String schemeName = null;

        if(ref.getConnector().getAuthenticationHost() != null &&
            !ref.getConnector().getAuthenticationHost().isEmpty())
            host = ref.getConnector().getAuthenticationHost();

        if(ref.getConnector().getAuthenticationPort() != null &&
            !ref.getConnector().getAuthenticationPort().isEmpty())
            port = Integer.parseInt(ref.getConnector().getAuthenticationPort());

        if(ref.getConnector().getAuthenticationRealm() != null &&
            !ref.getConnector().getAuthenticationRealm().isEmpty())
            realm = ref.getConnector().getAuthenticationRealm();

        if(ref.getConnector().getAuthenticationScheme() != null &&
            !ref.getConnector().getAuthenticationScheme().isEmpty())
            schemeName = ref.getConnector().getAuthenticationScheme();               


        ((DefaultHttpClient)client).getCredentialsProvider().setCredentials(
            new AuthScope(host, port,realm,schemeName),
            new UsernamePasswordCredentials(ref.getConnector().getLoginUserId(), ref.getConnector().getLoginPassWord()));               
        
        authHost = new HttpHost(host,port);
    }
    
    void formAuthenticate() throws Exception{
        //url of form page
        HttpGet httpget = new HttpGet(ref.getConnector().getFormPageUrl());

        HttpResponse response = client.execute(httpget);
        HttpEntity entity = response.getEntity();

        _logger.info("Login form get: " + response.getStatusLine());
        EntityUtils.consume(entity);


        _logger.info("Initial set of cookies:");
        List<org.apache.http.cookie.Cookie> cookies = ((DefaultHttpClient)client).getCookieStore().getCookies();
        if (cookies.isEmpty()) {
            _logger.info("None");
        } else {
            for (int i = 0; i < cookies.size(); i++) {
                _logger.info("- " + cookies.get(i).toString());
            }
        }

        /*--
        HttpPost httpost = new HttpPost("https://portal.sun.com/amserver/UI/Login?" +
                "org=self_registered_users&" +
                "goto=/portal/dt&" +
                "gotoOnFail=/portal/dt?error=true");
        */
        HttpPost httpost = new HttpPost(ref.getConnector().getAuthenticationHost());
        List <BasicNameValuePair> nvps = new ArrayList <BasicNameValuePair>();
        nvps.add(new BasicNameValuePair(ref.getConnector().getAuthenticationUseridParamName(), ref.getConnector().getLoginUserId()));
        nvps.add(new BasicNameValuePair(ref.getConnector().getAuthenticationPasswordParamName(), ref.getConnector().getLoginPassWord()));

        httpost.setEntity(new UrlEncodedFormEntity(nvps, Consts.UTF_8));

        response = client.execute(httpost);
        entity = response.getEntity();

        _logger.info("Login form get: " + response.getStatusLine());
        EntityUtils.consume(entity);

        _logger.info("Post logon cookies:");
        cookies = ((DefaultHttpClient)client).getCookieStore().getCookies();
        if (cookies.isEmpty()) {
            _logger.info("None");
        } else {
            for (int i = 0; i < cookies.size(); i++) {
                _logger.info("- " + cookies.get(i).toString());
            }
        }
    }
    
    void preEmptiveBasicAuthentication() throws Exception{

        authenticate();
        
        // Create AuthCache instance
        AuthCache authCache = new BasicAuthCache();
        // Generate BASIC scheme object and add it to the local
        // auth cache
        BasicScheme basicAuth = new BasicScheme();
        authCache.put(authHost, basicAuth);

        // Add AuthCache to the execution context
        BasicHttpContext localcontext = new BasicHttpContext();
        localcontext.setAttribute(ClientContext.AUTH_CACHE, authCache);

        HttpGet httpget = new HttpGet("/");

        _logger.info("executing request: " + httpget.getRequestLine());
        _logger.info("to target: " + authHost);

        for (int i = 0; i < 3; i++) {
            HttpResponse response = client.execute(authHost, httpget, localcontext);
            HttpEntity entity = response.getEntity();

            System.out.println("----------------------------------------");
            System.out.println(response.getStatusLine());
            if (entity != null) {
                _logger.info("Response content length: " + entity.getContentLength());
            }
            EntityUtils.consume(entity);
        }
    }

    void preEmptiveDigestAuthentication() throws Exception{
        authenticate();
        
        // Create AuthCache instance
        AuthCache authCache = new BasicAuthCache();
        // Generate DIGEST scheme object, initialize it and add it to the local
        // auth cache
        DigestScheme digestAuth = new DigestScheme();
        // Suppose we already know the realm name
        digestAuth.overrideParamter("realm", "some realm");
        // Suppose we already know the expected nonce value
        digestAuth.overrideParamter("nonce", "whatever");
        authCache.put(authHost, digestAuth);

        // Add AuthCache to the execution context
        BasicHttpContext localcontext = new BasicHttpContext();
        localcontext.setAttribute(ClientContext.AUTH_CACHE, authCache);

        HttpGet httpget = new HttpGet("/");

        _logger.info("executing request: " + httpget.getRequestLine());
        _logger.info("to target: " + authHost);

        for (int i = 0; i < 3; i++) {
            HttpResponse response = client.execute(authHost, httpget, localcontext);
            HttpEntity entity = response.getEntity();

            System.out.println("----------------------------------------");
            System.out.println(response.getStatusLine());
            if (entity != null) {
                _logger.info("Response content length: " + entity.getContentLength());
            }
            EntityUtils.consume(entity);
        }

    }    
    
    void addParameters(HttpRequestBase req){
      	//append parameters
        if(ref.getConnector().getCallParameters() != null){
          
            LazyDynaBean parameters = null;
            URIBuilder uriBuilder = new URIBuilder(req.getURI());
          
          	if(ref.getConnector().getCallParameters() instanceof String){
            
              if(!ref.getConnector().getCallParameters().toString().isEmpty())
              	parameters = (LazyDynaBean)invocation.call(ref.getConnector().getCallParameters().toString(),invocation.getArguments());
              else
                return;
          	}
          	else
              parameters = (LazyDynaBean)ref.getConnector().getCallParameters();
          
        	//LazyDynaBean parameters = (LazyDynaBean)invocation.call(ref.getConnector().getCallParametersPath(),invocation.getArguments());
            for (Map.Entry<String, Object> entry : ((Map<String, Object>)parameters.getMap()).entrySet()) { 
                String key = entry.getKey();
                Object value = entry.getValue();              
                uriBuilder = uriBuilder.addParameter(key,value.toString());              
            }
            try{
            	req.setURI(uriBuilder.build());   
            }catch(Exception ex){
          		_logger.error("Error setting parameters for httpconnector",ex);
          	}
        }
    }
  
  	void addHeaders(HttpRequestBase req){
      	//append headers if any
        if(ref.getConnector().getHeaders() != null){
            LazyDynaBean headers;
            
            if(ref.getConnector().getHeaders() instanceof String){
               if(!ref.getConnector().getHeaders().toString().isEmpty())
                 headers = (LazyDynaBean)invocation.call(ref.getConnector().getHeaders().toString(),invocation.getArguments());
               else
                 return;
            }
            else
              headers = (LazyDynaBean)ref.getConnector().getHeaders();
            
            
            for (Map.Entry<String, Object> entry : ((Map<String, Object>)headers.getMap()).entrySet()) { 
              String key = entry.getKey();
              Object value = entry.getValue(); 
              _logger.info("adding header "+key+"("+value+")");
              //req.addHeader(key,value.toString());
			  req.setHeader(key,value.toString());              
            }
        }
    }
  
    void saveDownload(String fileName,
                      String dest,
                      String unPack,
                      String deleteOriginal,                      
                      HttpEntity resEntity){
      try
      {
        InputStream inputStream = resEntity.getContent();
        
        File destDir = new File(ref.getConnector().getDestDir());
        if(!destDir.exists())
          	destDir.mkdirs();
        
        OutputStream outputStream = new FileOutputStream(new File(ref.getConnector().getDestDir()+"/"+fileName));
        IOUtils.copy(inputStream, outputStream);
        outputStream.close();     
        
        //if it is a zip file and unpack is checked, unpack it.
        if(fileName.endsWith(".zip") && unPack != null && unPack.compareToIgnoreCase("true") == 0){
          _logger.info("unzipping downloaded file "+fileName);
          
          FileUploaderUtil.unZip(destDir.getAbsolutePath()+"/"+fileName,destDir.getAbsolutePath());
          
          if(deleteOriginal != null && deleteOriginal.compareToIgnoreCase("true") == 0){
            _logger.info("deleting original zip file");
            
            new File(destDir.getAbsolutePath()+"/"+fileName).delete();
          }
        }
        
      }catch(Exception e){
       _logger.error("failed to save downloaded file ",e); 
      }
    }
  
  	
    String getFileName(String cd,String saveAs,String url){
          //if a name is specified, use it
          String fileName = saveAs;
          
          //otherwise see if a name is suggested by response header
          if( (fileName == null || fileName.isEmpty()) && cd != null){
            
             if(cd != null && cd.indexOf("filename") != -1){
               
               cd = cd.substring(cd.indexOf("filename"));
               if(cd.indexOf("=") != -1){
                 cd = cd.substring(cd.indexOf("=")+1).trim();                 
               }
               
               
               if(cd.indexOf(";") != -1){
                 fileName = cd.substring(0,cd.indexOf(";")).trim();
               }
               else
               fileName = cd.trim();
               
               if(fileName != null)//remove any surrounding quotes
                 fileName = fileName.replaceAll("\"","").replaceAll("'","");
             }
          }
          
          //use last part of url as last resort
          if(fileName == null || fileName.isEmpty()){
            fileName = url.substring(url.lastIndexOf("/"));
          }
      
          return fileName;
    }
  
    Object downloadFile(String url,
                        String destDir,
                        String unPack,
                        String deleteOriginal,
                        String saveAs,
                        String method)throws Exception{
    	_logger.info("downloading file " + url);
      
        HttpRequestBase httpreq = method.compareToIgnoreCase("get")==0?new HttpGet(url):new HttpPost(url);
        addHeaders(httpreq);
		addParameters(httpreq);    
      
        HttpResponse response = client.execute(httpreq);
        HttpEntity resEntity = response.getEntity();    
      
        StatusLine statusLine = response.getStatusLine();
        if (statusLine.getStatusCode() >= 300) {
          
          if( resEntity == null){
            EntityUtils.consume(resEntity);            
            //throw new HttpResponseException(statusLine.getStatusCode(),
            //        statusLine.getReasonPhrase());
          }
        }
      	else
        {           
          saveDownload(getFileName(response.getFirstHeader("Content-Disposition") != null ?
                                   response.getFirstHeader("Content-Disposition").getValue():null,
                                   saveAs,
                                   url),
                       destDir,
                       unPack,
                       deleteOriginal,
                       resEntity);       
        }
      
        Map resp = new HashMap();      
        resp.put("statusCode",statusLine.getStatusCode());
        resp.put("statusLine",statusLine.getReasonPhrase());        
        return resp;
    }
  
  
    Object downloadFiles(String method) throws Exception{
      
      
      //loop through files to download
      if(ref.getConnector().getUrl() instanceof List){
          
          List<LazyDynaBean> downloads = (List<LazyDynaBean>)ref.getConnector().getUrl();
        
          List result = new ArrayList();
        
          for(LazyDynaBean bean: downloads){              
            result.add(downloadFile((String)bean.get("url"),
                                    (String)bean.get("destDir"),
                                    (String)bean.get("enableUnpack"),
                                    (String)bean.get("deleteOriginal"),
                                    (String)bean.get("saveAs"),
                                    method));
          }
          return result;
      }
      else
      {
        return downloadFile((String)ref.getConnector().getUrl(),
                            ref.getConnector().getDestDir(),
                            ref.getConnector().getEnableUnpack(),
                            ref.getConnector().getDeleteOriginal(),
                            (String)ref.getConnector().getSaveAs(),
                            method);
      }
    }
    
    Object doGET(String url) throws Exception{
        HttpGet httpget = new HttpGet(url);
        addHeaders(httpget);
		addParameters(httpget);

      
        _logger.info("executing request " + httpget.getURI());
        
      
        // Create a response handler
        ResponseHandler<Object> responseHandler = new CrudzillaBasicResponseHandler();
        Object responseBody = client.execute(httpget, responseHandler);

        
        _logger.info("----------------------------------------");
        _logger.info((responseBody instanceof java.util.Map)? ((Map)responseBody).get("statusCode")+"\n"+((Map)responseBody).get("statusLine")+"\n"+((Map)responseBody).get("error"):responseBody.toString());
        _logger.info("----------------------------------------"); 
        return (responseBody);    
    }
  
    void GET() throws Exception{
      
        if(ref.getConnector().getDownload() != null && 
           ref.getConnector().getDownload().toString().compareToIgnoreCase("true") == 0){            
          invocation.setResult(downloadFiles("get")); 
          return;
        }      
      
        //loop through urls to call
        if(ref.getConnector().getUrl() instanceof List){
            
            List<LazyDynaBean> urls = (List<LazyDynaBean>)ref.getConnector().getUrl();
          
            List result = new ArrayList();
          
            for(LazyDynaBean bean: urls){              
              result.add(doGET((String)bean.get("url")));
            }
            invocation.setResult(result);
        }
        else
        {
          invocation.setResult(doGET((String)ref.getConnector().getUrl()));
        }
    }
    
  
  
    Object doPOST(String url) throws Exception{
        HttpPost httppost = new HttpPost(url);
        addHeaders(httppost);
        addParameters(httppost);
      
      	_logger.info("executing request " + httppost.getURI());
      
        // Create a response handler
        ResponseHandler<Object> responseHandler = new CrudzillaBasicResponseHandler();
        Object responseBody = client.execute(httppost, responseHandler);

        _logger.info("----------------------------------------");
        _logger.info((responseBody instanceof java.util.Map)?((Map)responseBody).get("statusCode")+"\n"+((Map)responseBody).get("statusLine")+"\n"+((Map)responseBody).get("error"):responseBody.toString());
        _logger.info("----------------------------------------");
		return responseBody;    
    }
  
    void POST() throws Exception{
        if(ref.getConnector().getDownload() != null && 
           ref.getConnector().getDownload().toString().compareToIgnoreCase("true") == 0){            
          invocation.setResult(downloadFiles("post")); 
          return;
        }        
      
              
        //loop through urls to call
        if(ref.getConnector().getUrl() instanceof List){
            
            List<LazyDynaBean> urls = (List<LazyDynaBean>)ref.getConnector().getUrl();
          
            List result = new ArrayList();
          
            for(LazyDynaBean bean: urls){              
              result.add(doPOST((String)bean.get("url")));
            }
            invocation.setResult(result);
        }
        else
        {
          invocation.setResult(doPOST((String)ref.getConnector().getUrl()));
        }
    }
    
    Object doPOSTMultiPart(String url,String saveAs) throws Exception{
        HttpPost httppost = new HttpPost(url);
        addParameters(httppost);

        _logger.info("executing request " + httppost.getURI());

        File tempDir = new File(""+invocation.getCrudEngine().sysSettings().get("crudzilla_temp_file_dir"));

        Map<String,Object> fileItems = (Map<String,Object>)invocation.getArguments().get("crudzilla_multipart_files");
        MultipartEntity reqEntity = new MultipartEntity();

        for (Map.Entry<String, File> entry : getPostData(fileItems).entrySet()) {  
            String key = entry.getKey();
            File value = entry.getValue();

            FileBody f = new FileBody(value);
            reqEntity.addPart(key, f); 
        }                    
        httppost.setEntity(reqEntity);

        _logger.info("executing request " + httppost.getRequestLine());
        HttpResponse response = client.execute(httppost);
        HttpEntity resEntity = response.getEntity();

        _logger.info("----------------------------------------");
        _logger.info(response.getStatusLine());
        if (resEntity != null) {
            _logger.info("Response content length: " + resEntity.getContentLength());
        }
      
      	//save any download that resulted from request
        if(ref.getConnector().getDownload() != null && 
           ref.getConnector().getDownload().toString().compareToIgnoreCase("true") == 0){ 
          
		   saveDownload(getFileName(response.getFirstHeader("Content-Disposition") != null?
                                    response.getFirstHeader("Content-Disposition").getValue():null,
                                   saveAs, url),
                        ref.getConnector().getDestDir(),
                        ref.getConnector().getEnableUnpack(),
                        ref.getConnector().getDeleteOriginal(),
                        resEntity);                 
          
        } 
        
        EntityUtils.consume(resEntity); 
      
        return (response.getStatusLine().getStatusCode());         
    }
    
    void POSTMultiPart() throws Exception{
        //loop through urls to call
        if(ref.getConnector().getUrl() instanceof List){
            
            List<LazyDynaBean> urls = (List<LazyDynaBean>)ref.getConnector().getUrl();
          
            List result = new ArrayList();
          
            for(LazyDynaBean bean: urls){              
              result.add(doPOSTMultiPart((String)bean.get("url"),(String)bean.get("saveAs")));
            }
            invocation.setResult(result);
        }
        else
        {
          invocation.setResult(doPOSTMultiPart((String)ref.getConnector().getUrl(),
                                               (String)ref.getConnector().getSaveAs()));
        }
    }
    
    void doChunked(File file) throws Exception{
        HttpPost httppost = new HttpPost((String)ref.getConnector().getUrl());
        addParameters(httppost);

        String mimeType = "binary/octet-stream";
        if(ref.getConnector().getMimeType() != null &&
            !ref.getConnector().getMimeType().isEmpty())
                mimeType =  ref.getConnector().getMimeType();

        FileEntity reqEntity = new FileEntity(file, org.apache.http.entity.ContentType.create(mimeType));
        reqEntity.setContentType("binary/octet-stream");
        reqEntity.setChunked(true);
        // It may be more appropriate to use FileEntity class in this particular
        // instance but we are using a more generic InputStreamEntity to demonstrate
        // the capability to stream out data from any arbitrary source
        //
        // FileEntity entity = new FileEntity(file, "binary/octet-stream");

        httppost.setEntity(reqEntity);

        _logger.info("executing request " + httppost.getRequestLine());
        HttpResponse response = client.execute(httppost);
        HttpEntity resEntity = response.getEntity();

        _logger.info("----------------------------------------");
        _logger.info(response.getStatusLine());
        if (resEntity != null) {
            _logger.info("Response content length: " + resEntity.getContentLength());
            _logger.info("Chunked?: " + resEntity.isChunked());
        }
           
        EntityUtils.consume(resEntity);      
        //invocation.setResult(response.getStatusLine().getStatusCode());
    }
    
    void POSTchucked() throws Exception{
        
        Map<String,Object> fileItems = (Map<String,Object>)invocation.getArguments().get("crudzilla_multipart_files");
        Map<String,File> files = this.getPostData(fileItems);
        
        for (Map.Entry<String, File> entry : files.entrySet()) {  

            String key = entry.getKey();
            File value = (File)entry.getValue();
            doChunked(value);
        }
    }
    
    Map<String,File> getPostData(Map<String,Object> fileItems) throws Exception{
        
        Map<String,File> postFiles = new HashMap<String,File>();
    
        if(ref.getConnector().getPostDataSourceType().compareToIgnoreCase("DATAFROM-HTTPREQUEST") == 0 ||
            ref.getConnector().getPostDataSourceType().compareToIgnoreCase("DATAFROM-HTTPREQUEST-FS") == 0){

            for (Map.Entry<String, Object> entry : fileItems.entrySet()) {  
                
                String key = entry.getKey();
                org.apache.commons.fileupload.FileItem value = (org.apache.commons.fileupload.FileItem)entry.getValue();
                String fileName = java.util.UUID.randomUUID().toString();
                File file = new File(""+invocation.getCrudEngine().sysSettings().get("crudzilla_temp_file_dir")+"/"+fileName);
                value.write(file);     

                postFiles.put(key,file);

                FileBody f = new FileBody(file);
            }
        }
        else
        if(ref.getConnector().getPostDataSourceType().compareToIgnoreCase("DATAFROM-FS") == 0 ||
            ref.getConnector().getPostDataSourceType().compareToIgnoreCase("DATAFROM-HTTPREQUEST-FS") == 0){
            List<Map<String,String>> files = (List<Map<String,String>>)ref.getConnector().getPostDataFileItems();
            for(Map<String,String> fl:files){
                File file  = new File(fl.get("path"));
                FileBody f = new FileBody(file);
                postFiles.put(fl.get("paramName"),file);                         
            }
        }
        return postFiles;
    }
    
    public void run() throws Exception{
        client = new DefaultHttpClient();
        
        try 
        {            
            //authenticate if necessary
            if(ref.getConnector().getAuthenticationType() != null &&
            ref.getConnector().getAuthenticationType().compareToIgnoreCase("NONE") != 0){

                if(ref.getConnector().getAuthenticationType().compareToIgnoreCase("FORM") == 0){
                    formAuthenticate();
                }
                else
                if(ref.getConnector().getAuthenticationType().compareToIgnoreCase("PREEMPTIVE-BASIC") == 0){
                    preEmptiveBasicAuthentication();
                }
                else
                if(ref.getConnector().getAuthenticationType().compareToIgnoreCase("PREEMPTIVE-DIGEST") == 0){
                    preEmptiveDigestAuthentication();
                }                
                else
                {
                    authenticate();               
                }
            }
            
            if(ref.getConnector().getMethod().compareToIgnoreCase("HTTP_GET") == 0){
                this.GET();
            }
            else
            if(ref.getConnector().getMethod().compareToIgnoreCase("HTTP_POST") == 0){
                this.POST();
            }
            else                
            if(ref.getConnector().getMethod().compareToIgnoreCase("HTTP_POST_MULTIPART") == 0){
               this.POSTMultiPart();
            }
            else
            if(ref.getConnector().getMethod().compareToIgnoreCase("HTTP_POST_CHUNKED") == 0){
               this.POSTchucked();
            }            
        }
        
        
        finally {
            // When HttpClient instance is no longer needed,
            // shut down the connection manager to ensure
            // immediate deallocation of all system resources
            client.getConnectionManager().shutdown();
        }            
    }
}
