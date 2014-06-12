/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.felix;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.io.File;
import java.io.FileInputStream;

import java.util.Properties;
import javax.servlet.ServletContext;
import org.apache.felix.framework.Felix;
import org.apache.felix.framework.util.FelixConstants;
import org.osgi.util.tracker.ServiceTracker;
/**
 *
 * @author bitlooter
 */
public final class FrameworkService
{
    private final ServletContext context;
    private Felix felix;
    public static ServiceTracker m_tracker = null;
    ProvisionActivator m_hostActivator;
    
    public FrameworkService(ServletContext context)
    {
        this.context = context;
    }

    public void start()
    {
        try {
            doStart();
        } catch (Exception e) {
            log("Failed to start framework", e);
        }
    }

    public void stop()
    {
        try {
            doStop();
        } catch (Exception e) {
            log("Error stopping framework", e);
        }
    }
    

    private void doStart()
        throws Exception
    {
        log("Starting felix framework.",null);
        Felix tmp = new Felix(createConfig());
        tmp.start();
        this.felix = tmp;
        log("OSGi framework started", null);
        //m_tracker = new ServiceTracker(m_hostActivator.getContext(), ScriptExecutorService.class.getName(), null);
        //m_tracker.open();          
    }

    private void doStop()
        throws Exception
    {
        if (this.felix != null) {
            this.felix.stop();
            this.felix.waitForStop(0);
        }

        log("OSGi framework stopped", null);
    }

    private Map<String, Object> createConfig()
        throws Exception
    {
      
      	String osgiDir = context.getInitParameter("osgi.dir");      
      	
        if(osgiDir == null){
          
          String appServerHome = System.getProperty("jetty.home");
          if(appServerHome == null || appServerHome.isEmpty())
              appServerHome = System.getProperty("crudzilla.appserver.home");
                    
          osgiDir = appServerHome+"/crudzilla-osgi";
        }       
      
        Properties props = new Properties();
        props.load(new FileInputStream(new File(osgiDir+"/config.properties")));

        HashMap<String, Object> map = new HashMap<String, Object>();
        for (Object key : props.keySet()) {
            map.put(key.toString(), props.get(key));
        }
        
        m_hostActivator = new ProvisionActivator(this.context);
        map.put(FelixConstants.FRAMEWORK_SYSTEMPACKAGES_EXTRA, "javax.servlet;javax.servlet.http;version=2.5,com.crudzilla.felix");
        map.put(FelixConstants.SERVICE_URLHANDLERS_PROP, "false");
        map.put(FelixConstants.SYSTEMBUNDLE_ACTIVATORS_PROP, Arrays.asList(m_hostActivator));
        return map;
    }
    
    public ProvisionActivator getHostActivator(){
        return m_hostActivator;
    }

    private void log(String message, Throwable cause)
    {
        if(cause != null)
            this.context.log(message, cause);
        else
            this.context.log(message);
    }
}