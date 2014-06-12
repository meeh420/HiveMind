/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.felix;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Web application lifecycle listener.
 *
 * @author bitlooter
 */
public class StartupListener implements ServletContextListener {
    public static FrameworkService service;
    @Override
    public void contextInitialized(ServletContextEvent sce) {
      if(service == null){
        service = new FrameworkService(sce.getServletContext());
        service.start();
      }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
         service.stop();
    }
}
