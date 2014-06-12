/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.felix;

import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jdt.core.JavaCore;
  
/**
 *
 * @author bitlooter
 */
public interface JDTService {
    public Map exec(HttpServletRequest request,HttpServletResponse response);
    public JavaCore getJavaCore();
    public String getName();
    public String getDescription();    
}
