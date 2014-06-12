/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.emailsender.bean;

import com.crudzilla.platform.bean.ExecutableDefinition;
import com.crudzilla.platform.bean.DefinitionExecutionParameter;
import java.util.List;

/**
 *
 * @author bitlooter
 */
public class EmailSender  extends ExecutableDefinition{
    String host;
    String smtpPort;
    String sslEnabled;
    String dataSourceURI;
    String loginUserId;
    String loginPassWord;    
    Object messageTemplate;
    Object alternativeTextMessage;
    String bouncedMessageAddress;
    

  
  
    List bcc;
    List cc;
    List replyTo;
    List headers;
    
    String type;
    Object from;
    Object to;
    String subject;

    Object attachments;
  
  	Object bulkMailData;
  	String forEachEvalMessage;
  	String forEachEvalAltMessage;
	String forEachEvalSubject;  
  	String forEachEvalTo;
  	String forEachEvalFrom;
    String forEachEvalAttachments;
  
  
    DefinitionExecutionParameter messageTemplateParameter;
    DefinitionExecutionParameter alternativeTextMessageParameter;
    DefinitionExecutionParameter fromParameter;
    DefinitionExecutionParameter toParameter;
    DefinitionExecutionParameter subjectParameter;
  	DefinitionExecutionParameter attachmentsParameter;  
  
  
    public DefinitionExecutionParameter getMessageTemplateParameter() {
        return messageTemplateParameter;
    }

    public void setMessageTemplateParameter(DefinitionExecutionParameter messageTemplateParameter) {
        this.messageTemplateParameter = messageTemplateParameter;
    }  
  
  
    public DefinitionExecutionParameter getAttachmentsParameter() {
        return attachmentsParameter;
    }

    public void setAttachmentsParameter(DefinitionExecutionParameter attachementsParameter) {
        this.attachmentsParameter = attachementsParameter;
    }

    public DefinitionExecutionParameter getAlternativeTextMessageParameter() {
        return alternativeTextMessageParameter;
    }

    public void setAlternativeTextMessageParameter(DefinitionExecutionParameter alternativeTextMessageParameter) {
        this.alternativeTextMessageParameter = alternativeTextMessageParameter;
    }
  
  
    public DefinitionExecutionParameter getFromParameter() {
        return fromParameter;
    }


    public DefinitionExecutionParameter getSubjectParameter() {
        return subjectParameter;
    }

    public DefinitionExecutionParameter getToParameter() {
        return toParameter;
    }

    public void setFromParameter(DefinitionExecutionParameter fromParameter) {
        this.fromParameter = fromParameter;
    }


    public void setSubjectParameter(DefinitionExecutionParameter subjectParameter) {
        this.subjectParameter = subjectParameter;
    }

    public void setToParameter(DefinitionExecutionParameter toParameter) {
        this.toParameter = toParameter;
    }  
  
  
  
  
  
    public String getHost() {
        return host;
    }

    public String getLoginPassWord() {
        return loginPassWord;
    }

    public String getLoginUserId() {
        return loginUserId;
    }

    public String getSmtpPort() {
        return smtpPort;
    }

    public String getSslEnabled() {
        return sslEnabled;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setLoginPassWord(String loginPassWord) {
        this.loginPassWord = loginPassWord;
    }

    public void setLoginUserId(String loginUserId) {
        this.loginUserId = loginUserId;
    }

    public void setSmtpPort(String smtpPort) {
        this.smtpPort = smtpPort;
    }

    public void setSslEnabled(String sslEnabled) {
        this.sslEnabled = sslEnabled;
    }

    public Object getMessageTemplate() {
        return messageTemplate;
    }

    public void setMessageTemplate(Object messageTemplate) {
        this.messageTemplate = messageTemplate;
    }

    public String getDataSourceURI() {
        return dataSourceURI;
    }

    public void setDataSourceURI(String dataSourceURI) {
        this.dataSourceURI = dataSourceURI;
    }

    public Object getFrom() {
        return from;
    }


    public String getSubject() {
        return subject;
    }

    public Object getTo() {
        return to;
    }

    public String getType() {
        return type;
    }

    public void setFrom(Object from) {
        this.from = from;
    }


    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setTo(Object to) {
        this.to = to;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getAttachments() {
        return attachments;
    }

    public void setAttachments(Object attachements) {
        this.attachments = attachements;
    }

    public String getBouncedMessageAddress() {
        return bouncedMessageAddress;
    }

    public void setBouncedMessageAddress(String bouncedMessageAddress) {
        this.bouncedMessageAddress = bouncedMessageAddress;
    }

    public List getBcc() {
        return bcc;
    }

    public List getCc() {
        return cc;
    }

    public List getHeaders() {
        return headers;
    }

    public List getReplyTo() {
        return replyTo;
    }

    public void setBcc(List bcc) {
        this.bcc = bcc;
    }

    public void setCc(List cc) {
        this.cc = cc;
    }

    public void setHeaders(List headers) {
        this.headers = headers;
    }

    public void setReplyTo(List replyTo) {
        this.replyTo = replyTo;
    }

    public Object getAlternativeTextMessage() {
        return alternativeTextMessage;
    }

    public void setAlternativeTextMessage(Object alternativeTextMessage) {
        this.alternativeTextMessage = alternativeTextMessage;
    }
  
    public void setBulkMailData(Object bulkMailData){
    	this.bulkMailData = bulkMailData;
    }
  
    public Object getBulkMailData(){
      return bulkMailData;
    }
  
    public void setForEachEvalMessage(String forEachEvalMessage){
      this.forEachEvalMessage = forEachEvalMessage;
    }
  
    public String getForEachEvalMessage(){
      return forEachEvalMessage;
    }
  
  
    public void setForEachEvalAltMessage(String forEachEvalAltMessage){
      this.forEachEvalAltMessage = forEachEvalAltMessage;
    }
  
    public String getForEachEvalAltMessage(){
      return forEachEvalAltMessage;
    }  
  
    public void setForEachEvalSubject(String forEachEvalSubject){
      this.forEachEvalSubject = forEachEvalSubject;
    }
  
    public String getForEachEvalSubject(){
      return forEachEvalSubject;
    }  
  
    public void setForEachEvalFrom(String forEachEvalFrom){
      this.forEachEvalFrom = forEachEvalFrom;
    }
  
    public String getForEachEvalFrom(){
      return forEachEvalFrom;
    }  
  
    public void setForEachEvalTo(String forEachEvalTo){
      this.forEachEvalTo = forEachEvalTo;
    }
  
    public String getForEachEvalTo(){
      return forEachEvalTo;
    }   
  
    public void setForEachEvalAttachments(String forEachEvalAttachments){
      this.forEachEvalAttachments = forEachEvalAttachments;
    }
  
    public String getForEachEvalAttachments(){
      return forEachEvalAttachments;
    }    
  
}
