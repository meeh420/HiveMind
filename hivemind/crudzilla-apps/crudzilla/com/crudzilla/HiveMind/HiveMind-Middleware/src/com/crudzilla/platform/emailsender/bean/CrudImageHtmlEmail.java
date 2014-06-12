
package com.crudzilla.platform.emailsender.bean;

import javax.mail.internet.MimeMessage;
import org.apache.commons.mail.ImageHtmlEmail;

public class CrudImageHtmlEmail extends ImageHtmlEmail {
  public void setMessage(MimeMessage message){
    this.message = message;
  }
}