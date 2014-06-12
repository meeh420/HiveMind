/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.emailsender.bean;

import com.crudzilla.platform.bean.DefinitionExecutionParameter;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.LazyDynaBean;

import java.util.List;
import java.util.Map;

/**
 *
 * @author bitlooter
 */
public final class EmailSenderReference extends ExecutableDefinitionReference{

    
    public EmailSenderReference(JSONObject refFile,Invocation caller){
        super(refFile,new EmailSender(),caller);
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
            //Object val = param.getComputedValue();//+CrudzillaUtil.getArgumentValue(param.getDefaultValue(),caller.getArguments(),rightEvalType);
            //caller.logger().info("email property "+param.getName()+"/"+val);
	        Object val = caller.getPreservedComputedParameterValues().get(param);
          
            if(param.getName().compareTo("dataSourceURI") == 0){
                this.getEmailSender().setDataSourceURI((String)val);
            }
            else
            if(param.getName().compareTo("host") == 0){
                this.getEmailSender().setHost((String)val);
            }   
            else
            if(param.getName().compareTo("loginUserId") == 0){
                this.getEmailSender().setLoginUserId((String)val);
            }                
            else
            if(param.getName().compareTo("loginPassWord") == 0){
                this.getEmailSender().setLoginPassWord((String)val);
            }                
            else
            if(param.getName().compareTo("messageTemplate") == 0){
                this.getEmailSender().setMessageTemplate(val);
                this.getEmailSender().setMessageTemplateParameter(param);
            }                
            else
            if(param.getName().compareTo("smtpPort") == 0){
                this.getEmailSender().setSmtpPort((String)val);
            }                
            else
            if(param.getName().compareTo("sslEnabled") == 0){
                this.getEmailSender().setSslEnabled((String)val);
            }
            else
            if(param.getName().compareTo("type") == 0){
                this.getEmailSender().setType((String)val);
            }
            else
            if(param.getName().compareTo("from") == 0){
                this.getEmailSender().setFrom(val);
                this.getEmailSender().setFromParameter(param);
            }                
            else
            if(param.getName().compareTo("to") == 0){
                this.getEmailSender().setTo(val);
                this.getEmailSender().setToParameter(param);
            }
            else
            if(param.getName().compareTo("subject") == 0){
                this.getEmailSender().setSubject((String)val);
                this.getEmailSender().setSubjectParameter(param);
            }  
            else
            if(param.getName().compareTo("attachments") == 0){
                this.getEmailSender().setAttachments(val);
                this.getEmailSender().setAttachmentsParameter(param);
            } 
            else
            if(param.getName().compareTo("bouncedMessageAddress") == 0){
                this.getEmailSender().setBouncedMessageAddress((String)val);
            }
            else
            if(param.getName().compareTo("cc") == 0){
                this.getEmailSender().setCc((List)val);
            }
            else
            if(param.getName().compareTo("bcc") == 0){
                this.getEmailSender().setBcc((List)val);
            }
            else
            if(param.getName().compareTo("replyTo") == 0){
                this.getEmailSender().setReplyTo((List)val);
            }
            else
            if(param.getName().compareTo("headers") == 0){
                this.getEmailSender().setHeaders((List)val);
            }
            else
            if(param.getName().compareTo("bulkMailData") == 0){
                this.getEmailSender().setBulkMailData(val);
            }          
            else
            if(param.getName().compareTo("forEachEvalMessage") == 0){
                this.getEmailSender().setForEachEvalMessage((String)val);
            }           
            else
            if(param.getName().compareTo("forEachEvalAltMessage") == 0){
                this.getEmailSender().setForEachEvalAltMessage((String)val);
            }          
            else
            if(param.getName().compareTo("forEachEvalSubject") == 0){
                this.getEmailSender().setForEachEvalSubject((String)val);
            }
            else
            if(param.getName().compareTo("forEachEvalFrom") == 0){
                this.getEmailSender().setForEachEvalFrom((String)val);
            }
            else
            if(param.getName().compareTo("forEachEvalTo") == 0){
                this.getEmailSender().setForEachEvalTo((String)val);
            }   
            else
            if(param.getName().compareTo("forEachEvalAttachments") == 0){
                this.getEmailSender().setForEachEvalAttachments((String)val);
            }           
        }        
    }    
    
    public EmailSender getEmailSender() {
        return (EmailSender)definition;
    }

    public void setEmailSender(EmailSender emailSender) {
        this.definition = emailSender;
    }
}
