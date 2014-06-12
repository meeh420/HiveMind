/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.mail.EmailAttachment;
import com.crudzilla.platform.Crudzilla;
import org.apache.commons.beanutils.LazyDynaBean;

/**
 *
 * @author bitlooter
 */
public class EmailSenderUtil {
    //static Logger logger = Logger.getLogger(EmailSenderUtil.class.getName());  
    static private Log logger = LogFactory.getLog(EmailSenderUtil.class);
  
  
    public static String getParameterValue(String template,Map<String,Object> arguments){
        if(template.startsWith(":"))
              return arguments.get(template.substring(1)).toString(); 
        return template;
    }
  
    public static List<String[]> getRecipients(String json,Map<String,Object> arguments){
            JSONArray recipients = JSONArray.fromObject(json);
            java.util.Iterator<JSONObject> itr = recipients.iterator();
            
            List<String[]> recipientList = new ArrayList<String[]>();
            while(itr.hasNext()){
                JSONObject recipient = itr.next();
                
                String[] rec = new String[2];
                rec[0] = getParameterValue(recipient.getString("emailAddress"),arguments);
                if(recipient.has("name"))
                    rec[1] = getParameterValue(recipient.getString("name"),arguments);
              
                recipientList.add(rec);
            }return recipientList;        
    }
    
    public static List<String[]> getEmbededImages(String json,Map<String,Object> arguments){
            JSONArray images = JSONArray.fromObject(json);
            java.util.Iterator<JSONObject> itr = images.iterator();
            
            List<String[]> imageList = new ArrayList<String[]>();
            while(itr.hasNext()){
                JSONObject image = itr.next();
                
                String[] rec = new String[2];
                rec[0] = getParameterValue(image.getString("title"),arguments);
                rec[1] = getParameterValue(image.getString("url"),arguments);
              
                imageList.add(rec);
            }return imageList;        
    }    
    
    
    public static List<String[]> getHeaders(String json,Map<String,Object> arguments){
            JSONArray recipients = JSONArray.fromObject(json);
            java.util.Iterator<JSONObject> itr = recipients.iterator();
            
            List<String[]> headerList = new ArrayList<String[]>();
            while(itr.hasNext()){
                JSONObject header = itr.next();
                
                String[] rec = new String[2];
                rec[0] = getParameterValue(header.getString("name"),arguments);
                rec[1] = getParameterValue(header.getString("value"),arguments);
              
                headerList.add(rec);
            }return headerList;        
    }    
    
    
    public static List<EmailAttachment> getAttachments(Crudzilla engine,String json,Map<String,Object> arguments){
            JSONArray fileAttachements = JSONArray.fromObject(json);
            java.util.Iterator<JSONObject> itr = fileAttachements.iterator();
            List<EmailAttachment> attachments = new ArrayList<EmailAttachment>();
            while(itr.hasNext()){
                JSONObject fileAttachment = itr.next();
                
                try
                {
                    EmailAttachment attachment = new EmailAttachment();

                    if(fileAttachment.has("path")){
                        String path = getParameterValue(fileAttachment.getString("path"),arguments);
                        attachment.setPath(CrudzillaUtil.getFile(engine,fileAttachment.getString("path")).getAbsolutePath());
                    }
                    else
                        attachment.setURL(new URL(fileAttachment.getString("url")));

                    if(fileAttachment.has("name"))
                        attachment.setName(getParameterValue(fileAttachment.getString("name"),arguments));  
                    
                    attachment.setDisposition(EmailAttachment.ATTACHMENT);
                    
                    if(fileAttachment.has("description"))
                        attachment.setDescription(getParameterValue(fileAttachment.getString("description"),arguments));  
                    
                    attachments.add(attachment);
                }catch(Exception ex){
                    logger.error(ex);
                }
            }return attachments;
    }
  
  
  
  
  
  
    public static List<String[]> getRecipients(List recipients){
        List<String[]> recipientList = new ArrayList<String[]>();
      		
        if(recipients != null){
          java.util.Iterator<LazyDynaBean> itr = recipients.iterator();

          while(itr.hasNext()){
            LazyDynaBean recipient = itr.next();
            
            String[] rec = new String[2];
            rec[0] = recipient.get("emailAddress").toString();
            if(recipient.get("name") != null)
              rec[1] = recipient.get("name").toString();
            
            recipientList.add(rec);
          }
        }
        return recipientList;        
    }
    
    public static List<String[]> getEmbededImages(List images){
        List<String[]> imageList = new ArrayList<String[]>();
      		
        if(images != null){
          java.util.Iterator<LazyDynaBean> itr = images.iterator();            
          while(itr.hasNext()){
            LazyDynaBean image = itr.next();
            
            String[] rec = new String[2];
            rec[0] = image.get("title").toString();
            rec[1] = image.get("url").toString();
            
            imageList.add(rec);
          }
        }
      	return imageList;        
    }    
    
    
    public static List<String[]> getHeaders(List headers){
            
      	List<String[]> headerList = new ArrayList<String[]>();
      		
        if(headers != null){
            java.util.Iterator<LazyDynaBean> itr = headers.iterator();
          
            while(itr.hasNext()){
              LazyDynaBean header = itr.next();
              
              String[] rec = new String[2];
              rec[0] = header.get("name").toString();
              rec[1] = header.get("value").toString();
              
              headerList.add(rec);
            }
        }
        return headerList;        
    }    
    
    
    public static List<EmailAttachment> getAttachments(Crudzilla engine,List fileAttachements){

        List<EmailAttachment> attachments = new ArrayList<EmailAttachment>();
        
        if(fileAttachements != null){
            java.util.Iterator<LazyDynaBean> itr = fileAttachements.iterator();
            while(itr.hasNext()){
              LazyDynaBean fileAttachment = itr.next();
              
              try
              {
                  EmailAttachment attachment = new EmailAttachment();
                  
                  if(fileAttachment.get("path") != null){
                    String path = fileAttachment.get("path").toString();
                    attachment.setPath(CrudzillaUtil.getFile(engine,path).getAbsolutePath());
                  }
                  else
                    attachment.setURL(new URL(fileAttachment.get("url").toString()));
                  
                  if(fileAttachment.get("name") != null)
                    attachment.setName(fileAttachment.get("name").toString());  
                  
                  attachment.setDisposition(EmailAttachment.ATTACHMENT);
                  
                  if(fileAttachment.get("description") != null)
                    attachment.setDescription(fileAttachment.get("description").toString());  
                  
                  attachments.add(attachment);
              }catch(Exception ex){
                logger.error(ex);
              }
            }
        }
        return attachments;
    }  
  
}
