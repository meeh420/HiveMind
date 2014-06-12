/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

import com.crudzilla.platform.invocation.Executable;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.apache.commons.dbutils.BasicRowProcessor;
import org.apache.commons.dbutils.BeanProcessor;

/**
 *
 * @author bitlooter
 */
public class CrudzillaBasicRowProcessor extends BasicRowProcessor {
    /**
     * Convert a <code>ResultSet</code> row into an <code>Object[]</code>.
     * This implementation copies column values into the array in the same
     * order they're returned from the <code>ResultSet</code>.  Array elements
     * will be set to <code>null</code> if the column was SQL NULL.
     *
     * @see org.apache.commons.dbutils.RowProcessor#toArray(java.sql.ResultSet)
     * @param rs ResultSet that supplies the array data
     * @throws SQLException if a database access error occurs
     * @return the newly created array
     */
    Executable caller;
    public CrudzillaBasicRowProcessor(Executable caller){
        this.caller = caller;
    }
    
    public CrudzillaBasicRowProcessor(BeanProcessor beanProcessor){
        super(beanProcessor);
    }
    
    /**
     * A Map that converts all keys to lowercase Strings for case insensitive
     * lookups.  This is needed for the toMap() implementation because
     * databases don't consistently handle the casing of column names.
     *
     * <p>The keys are stored as they are given [BUG #DBUTILS-34], so we maintain
     * an internal mapping from lowercase keys to the real keys in order to
     * achieve the case insensitive lookup.
     *
     * <p>Note: This implementation does not allow <tt>null</tt>
     * for key, whereas {@link HashMap} does, because of the code:
     * <pre>
     * key.toString().toLowerCase()
     * </pre>
     */
    private static class CaseInsensitiveHashMap extends HashMap<String, Object> {
        /**
         * The internal mapping from lowercase keys to the real keys.
         *
         * <p>
         * Any query operation using the key
         * ({@link #get(Object)}, {@link #containsKey(Object)})
         * is done in three steps:
         * <ul>
         * <li>convert the parameter key to lower case</li>
         * <li>get the actual key that corresponds to the lower case key</li>
         * <li>query the map with the actual key</li>
         * </ul>
         * </p>
         */
        private final Map<String, String> lowerCaseMap = new HashMap<String, String>();

        /**
         * Required for serialization support.
         *
         * @see java.io.Serializable
         */
        private static final long serialVersionUID = -2848100435296897392L;

        /** {@inheritDoc} */
        @Override
        public boolean containsKey(Object key) {
            Object realKey = lowerCaseMap.get(key.toString().toLowerCase(Locale.ENGLISH));
            return super.containsKey(realKey);
            // Possible optimisation here:
            // Since the lowerCaseMap contains a mapping for all the keys,
            // we could just do this:
            // return lowerCaseMap.containsKey(key.toString().toLowerCase());
        }

        /** {@inheritDoc} */
        @Override
        public Object get(Object key) {
            Object realKey = lowerCaseMap.get(key.toString().toLowerCase(Locale.ENGLISH));
            return super.get(realKey);
        }

        /** {@inheritDoc} */
        @Override
        public Object put(String key, Object value) {
            /*
             * In order to keep the map and lowerCaseMap synchronized,
             * we have to remove the old mapping before putting the
             * new one. Indeed, oldKey and key are not necessaliry equals.
             * (That's why we call super.remove(oldKey) and not just
             * super.put(key, value))
             */
            Object oldKey = lowerCaseMap.put(key.toLowerCase(Locale.ENGLISH), key);
            Object oldValue = super.remove(oldKey);
            super.put(key, value);
            return oldValue;
        }

        /** {@inheritDoc} */
        @Override
        public void putAll(Map<? extends String, ?> m) {
            for (Map.Entry<? extends String, ?> entry : m.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                this.put(key, value);
            }
        }

        /** {@inheritDoc} */
        @Override
        public Object remove(Object key) {
            Object realKey = lowerCaseMap.remove(key.toString().toLowerCase(Locale.ENGLISH));
            return super.remove(realKey);
        }
    }    
    
    
    
    @Override
    public Object[] toArray(ResultSet rs) throws SQLException {
        ResultSetMetaData meta = rs.getMetaData();
        int cols = meta.getColumnCount();
        Object[] result = new Object[cols];

        boolean normStrm = true;
        if(caller != null &&
            caller.getArguments().get("crudzilla_normalize_stream_objects") != null &&
            caller.getArguments().get("crudzilla_normalize_stream_objects").toString().compareToIgnoreCase("false") == 0)
        {
          normStrm = false;
        }        
        
        
        for (int i = 0; i < cols; i++) {
            
            boolean normStrmCol;
            
            if(caller != null &&
               caller.getArguments().get("crudzilla_normalize_stream_object_"+meta.getColumnName(i+1)) != null &&
               caller.getArguments().get("crudzilla_normalize_stream_object_"+meta.getColumnName(i+1)).toString().compareToIgnoreCase("false") == 0){
                normStrmCol = false;
            }
            else
                normStrmCol = normStrm;
            
            if(normStrmCol && meta.getColumnType(i+1) == java.sql.Types.CLOB){
                result[i] = rs.getString(i+1);
            }
            else
            if(normStrmCol && meta.getColumnType(i+1) == java.sql.Types.BLOB){
                result[i] = rs.getBytes(i+1);
            }                
            else
                result[i] = rs.getObject(i + 1);
        }
        return result;
    }

    /**
     * Convert a <code>ResultSet</code> row into a <code>Map</code>.  This
     * implementation returns a <code>Map</code> with case insensitive column
     * names as keys.  Calls to <code>map.get("COL")</code> and
     * <code>map.get("col")</code> return the same value.
     * @see org.apache.commons.dbutils.RowProcessor#toMap(java.sql.ResultSet)
     * @param rs ResultSet that supplies the map data
     * @throws SQLException if a database access error occurs
     * @return the newly created Map
     */
    @Override
    public Map<String, Object> toMap(ResultSet rs) throws SQLException {
        Map<String, Object> result = new CrudzillaBasicRowProcessor.CaseInsensitiveHashMap();
        ResultSetMetaData rsmd = rs.getMetaData();
        int cols = rsmd.getColumnCount();

        boolean normStrm = true;
        if(caller != null &&
            caller.getArguments().get("crudzilla_normalize_stream_objects") != null &&
            caller.getArguments().get("crudzilla_normalize_stream_objects").toString().compareToIgnoreCase("false") == 0)
        {
          normStrm = false;
        }         
        
        for (int i = 1; i <= cols; i++) {
            
            boolean normStrmCol;
            
            if(caller != null &&
               caller.getArguments().get("crudzilla_normalize_stream_object_"+rsmd.getColumnName(i)) != null &&
               caller.getArguments().get("crudzilla_normalize_stream_object_"+rsmd.getColumnName(i)).toString().compareToIgnoreCase("false") == 0){
                normStrmCol = false;
            }
            else
                normStrmCol = normStrm;
            
            if(normStrmCol && rsmd.getColumnType(i) == java.sql.Types.CLOB){
                result.put(rsmd.getColumnName(i), rs.getString(i));
            }
            else
            if(normStrmCol && rsmd.getColumnType(i) == java.sql.Types.BLOB){
                result.put(rsmd.getColumnName(i), rs.getBytes(i));
            }            
            else
                result.put(rsmd.getColumnName(i), rs.getObject(i));
        }

        return result;
    }    
}
