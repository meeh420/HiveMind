
package com.crudzilla.platform.emailsender.bean;

import javax.mail.internet.MimeMessage;
import org.apache.commons.mail.SimpleEmail;

public class CrudSimpleEmail extends SimpleEmail {
  public void setMessage(MimeMessage message){
    this.message = message;
  }
}