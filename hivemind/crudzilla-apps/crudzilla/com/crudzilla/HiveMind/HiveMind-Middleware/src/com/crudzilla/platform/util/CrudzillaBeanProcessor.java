/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import com.crudzilla.platform.invocation.Executable;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLXML;
import java.sql.Timestamp;

/**
 *
 * @author bitlooter
 */
public class CrudzillaBeanProcessor extends org.apache.commons.dbutils.BeanProcessor{
    
    Executable caller;
    public CrudzillaBeanProcessor(Executable caller){
        this.caller = caller;
    }
    
    /**
     * Convert a <code>ResultSet</code> column into an object.  Simple
     * implementations could just call <code>rs.getObject(index)</code> while
     * more complex implementations could perform type manipulation to match
     * the column's type to the bean property type.
     *
     * <p>
     * This implementation calls the appropriate <code>ResultSet</code> getter
     * method for the given property type to perform the type conversion.  If
     * the property type doesn't match one of the supported
     * <code>ResultSet</code> types, <code>getObject</code> is called.
     * </p>
     *
     * @param rs The <code>ResultSet</code> currently being processed.  It is
     * positioned on a valid row before being passed into this method.
     *
     * @param index The current column index being processed.
     *
     * @param propType The bean property type that this column needs to be
     * converted into.
     *
     * @throws SQLException if a database access error occurs
     *
     * @return The object from the <code>ResultSet</code> at the given column
     * index after optional type processing or <code>null</code> if the column
     * value was SQL NULL.
     */
     @Override
     protected Object processColumn(ResultSet rs, int index, Class<?> propType)
        throws SQLException {

        
        /*if ( !propType.isPrimitive() && rs.getObject(index) == null ) {
            return null;
        }*/

        if (propType.equals(String.class)) {
            return rs.getString(index);
        }         
        else
        if (
            propType.equals(Integer.TYPE) || propType.equals(Integer.class)) {
            Integer r = rs.getInt(index);
            if(r != null)
                return Integer.valueOf(r);

        } else if (
            propType.equals(Boolean.TYPE) || propType.equals(Boolean.class)) {
            Boolean r = rs.getBoolean(index);
            if(r != null)
                return Boolean.valueOf(r);

        } else if (propType.equals(Long.TYPE) || propType.equals(Long.class)) {
            Long r = rs.getLong(index);
            if(r != null)
                return Long.valueOf(r);

        } else if (
            propType.equals(Double.TYPE) || propType.equals(Double.class)) {
            Double r = rs.getDouble(index);
            if(r != null)
                return Double.valueOf(r);

        } else if (
            propType.equals(Float.TYPE) || propType.equals(Float.class)) {
            Float r = rs.getFloat(index);
            if(r != null)
                return Float.valueOf(r);

        } else if (
            propType.equals(Short.TYPE) || propType.equals(Short.class)) {
            Short r = rs.getShort(index);
            if(r != null)
                return Short.valueOf(r);

        } else if (propType.equals(Byte.TYPE) || propType.equals(Byte.class)) {
            Byte r = rs.getByte(index);
            if(r != null)
                return Byte.valueOf(r);

        } else if (propType.equals(Timestamp.class)) {
            return rs.getTimestamp(index);

        } else if (propType.equals(SQLXML.class)) {
            return rs.getSQLXML(index);

        }
        else  
        {
            Object row = rs.getObject(index);
            /*--if(row instanceof java.sql.Clob){
                try
                {
                    Reader read = ((java.sql.Clob)row).getCharacterStream();
                    StringWriter write = new StringWriter();

                    int c = -1;
                    while ((c = read.read()) != -1)
                    {
                      write.write(c);
                    }
                    write.flush();
                    return write.toString();     
                }catch(Exception e){}
            }*/
            return row;
        }
        
        return null;
    }    
}
