package com.crudzilla.platform.emailsender.bean;

import javax.mail.internet.MimeMessage;
import org.apache.commons.mail.HtmlEmail;

public class CrudHtmlEmail extends HtmlEmail {
  public void setMessage(MimeMessage message){
    this.message = message;
  }
}