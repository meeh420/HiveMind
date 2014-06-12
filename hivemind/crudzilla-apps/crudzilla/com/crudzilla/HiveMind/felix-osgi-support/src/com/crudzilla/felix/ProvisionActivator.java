/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.felix;

import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.File;
import java.io.FileInputStream;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

import org.eclipse.jdt.core.JavaCore;
/**
 *
 * @author bitlooter
 */
public final class ProvisionActivator  implements BundleActivator
{
    private final ServletContext servletContext;
    private BundleContext m_context = null;
    private ServiceRegistration m_registration = null;
    JDTService m_JDTService;
    
    public ProvisionActivator(ServletContext servletContext)
    {
        this.servletContext = servletContext;
    }

    @Override
    public void start(BundleContext context)
        throws Exception
    {
        m_context = context;
        servletContext.setAttribute(BundleContext.class.getName(), context);
        
      	String osgiDir = servletContext.getInitParameter("osgi.dir");      
      	
        if(osgiDir == null){
          
          String appServerHome = System.getProperty("jetty.home");
          if(appServerHome == null || appServerHome.isEmpty())
              appServerHome = System.getProperty("crudzilla.appserver.home");
                    
          osgiDir = appServerHome+"/crudzilla-osgi";
        }    
      
        ArrayList<Bundle> installed = new ArrayList<Bundle>();
      	/*
        for (URL url : findBundles()) {
            this.servletContext.log("Installing bundle [" + url + "]");
            Bundle bundle = context.installBundle(url.toExternalForm());
            installed.add(bundle);
        }
		*/
      
        for (File file : new File(osgiDir+"/bundles").listFiles()) {
            this.servletContext.log("Installing bundle [" + file.getName() + "]");
            Bundle bundle = context.installBundle(file.getAbsolutePath(),new FileInputStream(file));
            installed.add(bundle);
        }      
      
      
      
        for (Bundle bundle : installed) {
            bundle.start();
        }
        
        
        
        //start JDT service
        m_JDTService = new JDTService(){
            @Override
            public Map exec(HttpServletRequest request,HttpServletResponse response){
               
               Map returnVal = null;
               return returnVal;
            }  
            
            @Override
            public String getName(){
                return "JDTService";
            }
            
            @Override
            public String getDescription(){
                return "Invokes JDT operations.";
            }        
          
            @Override
            public JavaCore getJavaCore(){return null;}
        };
        
        // the service registration.
        m_registration = m_context.registerService(JDTService.class.getName(), m_JDTService, null);
                
    }

    @Override
    public void stop(BundleContext context)
        throws Exception
    {
        m_registration.unregister();
        m_context = null;        
    }

    private List<URL> findBundles()
        throws Exception
    {
        ArrayList<URL> list = new ArrayList<URL>();
        for (Object o : this.servletContext.getResourcePaths("/WEB-INF/bundles/")) {
            String name = (String)o;
            if (name.endsWith(".jar")) {
                URL url = this.servletContext.getResource(name);
                if (url != null) {
                    list.add(url);
                }
            }
        }
        return list;
    }
    
  
  
    public BundleContext getContext()
    {
        return m_context;
    }    
    
    public JDTService getJDTService(){
        return m_JDTService;
    }
}