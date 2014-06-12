/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.mail.*;
import org.apache.commons.mail.resolver.DataSourceUrlResolver;
import org.apache.commons.beanutils.LazyDynaBean;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.emailsender.bean.EmailSenderReference;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.util.EmailSenderUtil;

import com.crudzilla.platform.emailsender.bean.CrudSimpleEmail;
import com.crudzilla.platform.emailsender.bean.CrudHtmlEmail;
import com.crudzilla.platform.emailsender.bean.CrudImageHtmlEmail;

/**
 *
 * @author bitlooter
 */
public class EmailSender extends Executable{
    //static Logger       _logger = Logger.getLogger(EmailSender.class.getName());
    private Log _logger = LogFactory.getLog(EmailSender.class);
    
    public EmailSender(){
        
    }
    
    public EmailSender(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
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
                ExecutableDefinitionReference ref = new EmailSenderReference(crudExecutable,this);
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
            returnVal.put("crudzilla_status", "success");
            throw ex;
        }//return returnVal;
    }
  
    
    @Override
    Object doCoreAction(ExecutableDefinitionReference inref) throws Exception{
        Map returnVal = new HashMap();
        try
        {
            EmailSenderReference ref = ( EmailSenderReference)inref;
            Email email = null;
            
          
            List<EmailAttachment> attachments = null;
            /**if(ref.getEmailSender().getAttachments() != null && !ref.getEmailSender().getAttachments().isEmpty()){
                attachments = EmailSenderUtil.getAttachments(_crudEngine,ref.getEmailSender().getAttachments());
            }            
            **/

            if(ref.getEmailSender().getDataSourceURI() != null && 
               !ref.getEmailSender().getDataSourceURI().isEmpty()  /*ref.getEmailSender().getType().compareTo("ImageHtmlEmail") == 0*/){
                email = new CrudImageHtmlEmail();
                ((ImageHtmlEmail)email).setDataSourceResolver(new DataSourceUrlResolver(new URL(ref.getEmailSender().getDataSourceURI())));       
            }          
          
            
            if(ref.getEmailSender().getAttachments() != null/*attachments != null /*--ref.getEmailSender().getType().compareTo("MultiPartEmail") == 0*/){
                if(email == null)
                email = new CrudHtmlEmail();
                /**for(EmailAttachment attachment:attachments){
                    ((HtmlEmail)email).attach(attachment);
                }**/
            }
            

            
            if(email == null && ref.getEmailSender().getType() != null &&
               ref.getEmailSender().getType().compareTo("HtmlEmail") == 0 ){
                email = new CrudHtmlEmail();
            }            
            else
            if(email == null)
            /*--if(ref.getEmailSender().getType().compareTo("SimpleEmail") == 0)*/{
                email = new CrudSimpleEmail();
            }
            
          	_logger.info("sending email type "+email.getClass().getName());
          
            email.setHostName(ref.getEmailSender().getHost());
            email.setSmtpPort(Integer.parseInt(ref.getEmailSender().getSmtpPort()));
            email.setAuthenticator(new DefaultAuthenticator(ref.getEmailSender().getLoginUserId(), ref.getEmailSender().getLoginPassWord()));
            email.setSSLOnConnect(ref.getEmailSender().getSslEnabled().compareToIgnoreCase("true") == 0);

            //receipients
            Object to = ref.getEmailSender().getTo();
          
            /**for(String[] recipient:EmailSenderUtil.getRecipients(ref.getEmailSender().getTo())){
              	_logger.info("sending email to "+recipient[0]);
                email.addTo(recipient[0], recipient[1] != null?recipient[1]:"");
            }**/
            
            //cc
            if(ref.getEmailSender().getCc() != null && !ref.getEmailSender().getCc().isEmpty()){
                for(String[] cc:EmailSenderUtil.getRecipients(ref.getEmailSender().getCc()))
                    email.addCc(cc[0], cc[1] != null?cc[1]:"");
            }            
            //bcc
            if(ref.getEmailSender().getBcc() != null && !ref.getEmailSender().getBcc().isEmpty()){
                for(String[] bcc:EmailSenderUtil.getRecipients(ref.getEmailSender().getBcc()))
                    email.addBcc(bcc[0], bcc[1] != null?bcc[1]:"");
            }
            
            //reply to
            if(ref.getEmailSender().getReplyTo() != null && 
               !ref.getEmailSender().getReplyTo().isEmpty()){
                for(String[] replyTo:EmailSenderUtil.getRecipients(ref.getEmailSender().getReplyTo()))
                    email.addReplyTo(replyTo[0], replyTo[1] != null?replyTo[1]:"");
            }
            
            //headers
            if(ref.getEmailSender().getHeaders() != null && 
               !ref.getEmailSender().getHeaders().isEmpty()){
                for(String[] header:EmailSenderUtil.getHeaders(ref.getEmailSender().getHeaders()))
                    email.addHeader(header[0], header[1]);
            }
            
            LazyDynaBean  from;//    = (LazyDynaBean)ref.getEmailSender().getFrom();
          
            /**_logger.info("sending email from:"+from.get("emailAddress").toString());
          
            email.setFrom(from.get("emailAddress").toString(), from.get("name") != null?from.get("name").toString():"");
            email.setSubject(ref.getEmailSender().getSubject());         
            **/
            Object subject    = ref.getEmailSender().getSubject();    
          	Object message    = ref.getEmailSender().getMessageTemplate();
            Object altMessage = ref.getEmailSender().getAlternativeTextMessage();
          
            if(ref.getEmailSender().getBouncedMessageAddress() != null && 
               !ref.getEmailSender().getBouncedMessageAddress().isEmpty())
                email.setBounceAddress(ref.getEmailSender().getBouncedMessageAddress());
                      
            List<LazyDynaBean> bulkMailData = null;
          	//if this is bulk mail, extract data
            if(ref.getEmailSender().getBulkMailData() != null){
              
                if(ref.getEmailSender().getBulkMailData() instanceof String)
                 bulkMailData = (List)call(ref.getEmailSender().getBulkMailData().toString(),_arguments);
                else
                 bulkMailData = (List)ref.getEmailSender().getBulkMailData();  
              
                
                
                for(LazyDynaBean receiver : bulkMailData){
                  
                    //explode receiver data on map
                    CrudzillaUtil.copyToMap(_arguments,receiver);
                  
                  
                    if(ref.getEmailSender().getForEachEvalMessage() != null && 
                       ref.getEmailSender().getForEachEvalMessage().compareToIgnoreCase("true") == 0){
                      
                      message = CrudzillaUtil.getArgumentValue((String)ref.getEmailSender().getMessageTemplate(), _arguments,"expression",ref.getEmailSender().getMessageTemplateParameter(),this);
                    }
                  
                    if(ref.getEmailSender().getForEachEvalAltMessage() != null && 
                       ref.getEmailSender().getForEachEvalAltMessage().compareToIgnoreCase("true") == 0){
                      
                      altMessage = CrudzillaUtil.getArgumentValue((String)ref.getEmailSender().getAlternativeTextMessage(), _arguments,"expression",ref.getEmailSender().getAlternativeTextMessageParameter(),this);
                    }
                  
                    if(ref.getEmailSender().getForEachEvalSubject() != null && 
                       ref.getEmailSender().getForEachEvalSubject().compareToIgnoreCase("true") == 0){
                      
                      subject = CrudzillaUtil.getArgumentValue(ref.getEmailSender().getSubject(), _arguments,"expression",ref.getEmailSender().getSubjectParameter(),this);
                    }
                  
                    if(ref.getEmailSender().getForEachEvalFrom() != null && 
                       ref.getEmailSender().getForEachEvalFrom().compareToIgnoreCase("true") == 0){
                      from = (LazyDynaBean)CrudzillaUtil.getArgumentValue((String)ref.getEmailSender().getFrom(), _arguments,"expression",ref.getEmailSender().getFromParameter(),this);
                    }
                    else
                      from    = (LazyDynaBean)ref.getEmailSender().getFrom();
                  
                   
                    if(ref.getEmailSender().getForEachEvalTo() != null && 
                       ref.getEmailSender().getForEachEvalTo().compareToIgnoreCase("true") == 0){
                      to = CrudzillaUtil.getArgumentValue((String)ref.getEmailSender().getTo(), _arguments,"expression",ref.getEmailSender().getToParameter(),this);
                      //_logger.info("to template "+ref.getEmailSender().getTo()+" type "+to);
                    }
                  
                    if(ref.getEmailSender().getForEachEvalAttachments() != null && 
                       ref.getEmailSender().getForEachEvalAttachments().compareToIgnoreCase("true") == 0){
                      attachments = EmailSenderUtil.getAttachments(_crudEngine,(List)CrudzillaUtil.getArgumentValue((String)ref.getEmailSender().getAttachments(), _arguments,"expression",ref.getEmailSender().getAttachmentsParameter(),this));
                    }
                  
                  	//reset receipient list
                    if(email.getToAddresses() != null)
                    	email.getToAddresses().removeAll(email.getToAddresses());
                  
            		sendMail(email,
                         (String)subject,
                         altMessage,
                         message,
                         from,
                         (List)to,
                         attachments);
                    
                    if(email instanceof CrudSimpleEmail)
                    	((CrudSimpleEmail)email).setMessage(null);
                  	else
                    if(email instanceof CrudHtmlEmail)
                      	((CrudHtmlEmail)email).setMessage(null);
                    else
                    if(email instanceof CrudImageHtmlEmail)
                      	((CrudImageHtmlEmail)email).setMessage(null);                  
                }
            }
            else
            {
                from    = (LazyDynaBean)ref.getEmailSender().getFrom();
                
                if(ref.getEmailSender().getAttachments() != null && !  ((List)ref.getEmailSender().getAttachments()).isEmpty()){
                    attachments = EmailSenderUtil.getAttachments(_crudEngine,(List)ref.getEmailSender().getAttachments());
                }              
              
                /**if(attachments != null /*--ref.getEmailSender().getType().compareTo("MultiPartEmail") == 0*){
                   
                    for(EmailAttachment attachment:attachments){
                        ((HtmlEmail)email).attach(attachment);
                    }
                }   **/           
              
            	sendMail(email,
                         (String)subject,
                         altMessage,
                         message,
                         from,
                         (List)to,
                         attachments);
            }
          

          
            /**
            if(email instanceof MultiPartEmail){
                
                if(ref.getEmailSender().getAlternativeTextMessage() != null){
                    
                      Object message = ref.getEmailSender().getAlternativeTextMessage();
                  	  if(message != null && message instanceof String)
                      	((HtmlEmail)email).setTextMsg(message.toString());
                  	  else
                        _logger.warn("Failed to set alternative text, template call failed.");
                }              
              
                if(ref.getEmailSender().getMessageTemplate() != null){
                       
                    Object message = ref.getEmailSender().getMessageTemplate();
                    if(message != null && message instanceof String)
                        ((HtmlEmail)email).setHtmlMsg(message.toString());
                    else
                       _logger.warn("Failed to set html, template call failed.");
                }
            }
            else       
            if(ref.getEmailSender().getMessageTemplate() != null &&
               ref.getEmailSender().getMessageTemplate() instanceof String)
            {
                if(email instanceof HtmlEmail)
            		((HtmlEmail)email).setHtmlMsg(ref.getEmailSender().getMessageTemplate().toString());
                else
                    email.setMsg(ref.getEmailSender().getMessageTemplate().toString());
          	}
            else
            {
              ///**email.setMsg("");**
            }

            
            email.send();
            **/
            returnVal.put("status", "success");
            return returnVal;
        }catch(Exception ex){
            _logger.error(ex);
            throw ex;
        }
        //returnVal.put("status", "error");
        //return returnVal;
    }    
    
    void sendMail(Email email,
                  String subject,
                  Object altMessage,
                  Object message,
                  LazyDynaBean  from,
                  List to,
                  List<EmailAttachment> attachments) throws Exception{
      
      _logger.info("sending email from:"+from.get("emailAddress").toString());
      
      email.setFrom(from.get("emailAddress").toString(), from.get("name") != null?from.get("name").toString():"");
      email.setSubject(subject);         
      
      
      //receipients
      for(String[] recipient:EmailSenderUtil.getRecipients(to)){
        _logger.info("sending email to "+recipient[0]);
        email.addTo(recipient[0], recipient[1] != null?recipient[1]:"");
      }      
      
      
      if(attachments != null){
        for(EmailAttachment attachment:attachments){
          ((HtmlEmail)email).attach(attachment);
        }
      }      
      
      if(email instanceof MultiPartEmail){
        
        if(altMessage != null){          
          
          if(altMessage instanceof String)
            ((HtmlEmail)email).setTextMsg(altMessage.toString());
          else
            _logger.warn("Failed to set alternative text, template call failed.");
        }              
        
        if(message != null){
          
          if(message instanceof String)
            ((HtmlEmail)email).setHtmlMsg(message.toString());
          else
            _logger.warn("Failed to set html, template call failed.");
        }
      }
      else       
      if(message != null && message instanceof String)
      {
        if(email instanceof HtmlEmail)
          ((HtmlEmail)email).setHtmlMsg(message.toString());
        else
          email.setMsg(message.toString());
      }
      else
      {
        /**email.setMsg("");**/
      }
      
      
      email.send();    
    }
}
