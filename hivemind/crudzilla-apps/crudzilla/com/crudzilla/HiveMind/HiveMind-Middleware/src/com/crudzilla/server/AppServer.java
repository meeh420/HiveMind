/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.server;

import com.crudzilla.platform.Crudzilla;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author bitlooter
 */
public class AppServer extends HttpServlet {
    private Log  _logger = LogFactory.getLog(AppServer.class); 
  	Crudzilla crudEngine;
  
    String appHome;
    @Override
    public void init() throws ServletException {
        
        appHome = getInitParameter("app-home");
        crudEngine = new Crudzilla(appHome);
        System.out.println("Initializing server:"+appHome);
    }    
    
    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
         crudEngine.turnOffLogging = false;
              
         if(request.getPathInfo() != null && 
            (request.getPathInfo().endsWith("dev-logging/get-log-output.ste") ||
            request.getPathInfo().endsWith("dev-logging/clear-log-output.ste"))) 
                 crudEngine.turnOffLogging = true;
              
        if(!crudEngine.turnOffLogging)
        	_logger.info("request to appHome "+appHome);
              
        Object result = crudEngine.execute(request,response);
              
        
        if(result != null)
        {
            
            PrintWriter out = response.getWriter();
            response.setContentType("text/plain;charset=UTF-8");
            try {
                
                StringBuilder buf = new StringBuilder();
                
                if(result instanceof  java.util.ArrayList){
                    buf.append(JSONArray.fromObject(result).toString(2));
                }
                else
                if(result instanceof  java.util.Map || result instanceof  org.apache.commons.beanutils.DynaBean)
                    buf.append(JSONObject.fromObject(result).toString(2));
                else
                if((result instanceof  String) == false)
                    buf.append(JSONObject.fromObject(new org.apache.commons.beanutils.WrapDynaBean(result)).toString(2));               
				else
                {
                    buf.append(result.toString());                    
                }
                response.setHeader("Content-Length", String.valueOf(buf.length()));
                out.println(buf.toString());
            }
            finally {            
                out.close();
            }
        }
        else{
            
            //System.out.println("no result to return");
        }


    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
