/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform;

import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.datastatement.bean.DataStatementReference;
import com.crudzilla.platform.datastatement.bean.ExecutablePreparedDataStatement;
import com.crudzilla.platform.invocation.Invocation;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.util.CrudzillaBasicRowProcessor;
import com.crudzilla.platform.util.CrudzillaBeanProcessor;
import java.io.StringWriter;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.sql.Connection;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author bitlooter
 */
public class CoreCruds {
    private static Log  _logger = LogFactory.getLog(CoreCruds.class); 
    
    public static int getIsolationLevel(String level){
        
        if(level.compareToIgnoreCase("TRANSACTION_READ_COMMITTED") == 0)
         return Connection.TRANSACTION_READ_COMMITTED;

        if(level.compareToIgnoreCase("TRANSACTION_READ_UNCOMMITTED") == 0)
         return Connection.TRANSACTION_READ_UNCOMMITTED;

        if(level.compareToIgnoreCase("TRANSACTION_REPEATABLE_READ") == 0)
         return Connection.TRANSACTION_REPEATABLE_READ;

        if(level.compareToIgnoreCase("TRANSACTION_SERIALIZABLE") == 0)
         return Connection.TRANSACTION_SERIALIZABLE;   
      
      	if(level.compareToIgnoreCase("TRANSACTION_NONE") == 0)
        	return Connection.TRANSACTION_NONE;   
      
        return -1;
    }
  
  
    public static boolean startTransaction(Map arguments,DataStatementReference ref,LazyDynaBean transaction){
		return 
        (          
          (
            (
               ref.getDataStatement().getTransactionAction() != null &&
               (
                 ref.getDataStatement().getTransactionAction().compareTo("start") == 0 ||
                 ref.getDataStatement().getTransactionAction().compareTo("start_only") == 0
               )
            )
           ||
           (
             transaction != null && 
             arguments.get("crudzilla_transaction_action") != null &&
             (
               arguments.get("crudzilla_transaction_action").toString().compareTo("start") == 0 ||
               arguments.get("crudzilla_transaction_action").toString().compareTo("start_only") == 0
             )&&
             arguments.get("crudzilla_transaction_"+transaction.get("name")) == null
           )
          )   
        );
    }
  
  
    public static boolean startTransactionOnly(Map arguments,DataStatementReference ref,LazyDynaBean transaction){
	  return 
      (
        (
          ref.getDataStatement().getTransactionAction() != null &&
          ref.getDataStatement().getTransactionAction().compareTo("start_only") == 0
        )
        ||          
        (
          transaction != null && 
          arguments.get("crudzilla_transaction_action") != null &&
          arguments.get("crudzilla_transaction_action").toString().compareTo("start_only") == 0
        )
      );
    }  
  
  
    public static boolean joinTransaction(Map arguments,DataStatementReference ref,LazyDynaBean transaction){
		return
        (
          (
             ref.getDataStatement().getTransactionAction() != null &&
             ref.getDataStatement().getTransactionAction().compareTo("join") == 0
          )
          ||
          (
             transaction != null && 
             arguments.get("crudzilla_transaction_action") != null &&
             arguments.get("crudzilla_transaction_action").toString().compareTo("join") == 0 &&
             arguments.get("crudzilla_transaction_"+transaction.get("name")) != null
          )
        );
    }
  
  
    public static boolean commitTransaction(Map arguments,DataStatementReference ref,LazyDynaBean transaction){
        return
		(
          (
            ref.getDataStatement().getTransactionAction() != null &&
            ref.getDataStatement().getTransactionAction().compareTo("commit") == 0
          )
          ||
          (
            transaction != null && 
            arguments.get("crudzilla_transaction_action") != null &&
            arguments.get("crudzilla_transaction_action").toString().compareTo("commit") == 0 &&
            arguments.get("crudzilla_transaction_"+transaction.get("name")) != null
          )
        );
    }
  
  
    public static boolean commitTransactionOnly(Map arguments,DataStatementReference ref,LazyDynaBean transaction){  
        return
		(
          (
          	ref.getDataStatement().getTransactionAction() != null &&
          	ref.getDataStatement().getTransactionAction().compareTo("commit_only") == 0
          )
          ||          
          (
            transaction != null && 
            arguments.get("crudzilla_transaction_action") != null &&
            arguments.get("crudzilla_transaction_action").toString().compareTo("commit_only") == 0 &&
            arguments.get("crudzilla_transaction_"+transaction.get("name")) != null
          )
        );
    }
  
    public static Object datastatement(final Map arguments,final Executable caller, ExecutableDefinitionReference inref)throws Exception{
        
            final DataStatementReference ref = (DataStatementReference)inref;
            Map returnVal;            
            
      		final Crudzilla callingModule = caller.getCrudEngine().findCaller(caller);
      
            boolean doLog = true;//arguments.get("crudzilla_do_log") != null? Boolean.parseBoolean(arguments.get("crudzilla_do_log").toString()):false;
            
            //dynamic query support      
      
            if(arguments.get("crudzilla_dynamic_sql_statement") != null)
            {
                if(arguments.get("crudzilla_dynamic_resultset_template") != null &&
                   !arguments.get("crudzilla_dynamic_resultset_template").toString().isEmpty())
                    ref.getDataStatement().setResultSetTemplate((String)arguments.get("crudzilla_dynamic_resultset_template"));
                
                arguments.put("crudzilla_prepared_dynamic_sql_statement",ref.getDataStatement().getPreparedStatement());
                
                /**ref.getDataStatement().setPreparedStatement((String)callingModule.execute(ref.getDataStatement().getSqlSrcPath(),arguments,true,(Invocation)arguments.get("crudzilla_true_caller")));**/
                  
                ref.getDataStatement().setPreparedStatement((String)arguments.get("crudzilla_dynamic_sql_statement"));
                
                caller.logger().info("generated dynamic statement:"+ref.getDataStatement().getPreparedStatement());
            }
      		else
            if(ref.getDataStatement().getSqlSrcPath() != null && 
                    !ref.getDataStatement().getSqlSrcPath().isEmpty()){
                
                if(arguments.get("crudzilla_dynamic_resultset_template") != null &&
                   !arguments.get("crudzilla_dynamic_resultset_template").toString().isEmpty())
                    ref.getDataStatement().setResultSetTemplate((String)arguments.get("crudzilla_dynamic_resultset_template"));
                
                arguments.put("crudzilla_prepared_dynamic_sql_statement",ref.getDataStatement().getPreparedStatement());
                
                /**ref.getDataStatement().setPreparedStatement((String)callingModule.execute(ref.getDataStatement().getSqlSrcPath(),arguments,true,(Invocation)arguments.get("crudzilla_true_caller")));**/
                  
                ref.getDataStatement().setPreparedStatement((String)caller.resolvePathToCaller(ref.getDataStatement().getSqlSrcPath()).using(callingModule).call(ref.getDataStatement().getSqlSrcPath(),arguments));
                
                caller.logger().info("generated dynamic statement:"+ref.getDataStatement().getPreparedStatement());
            }            
            
      
      
            //don't take any action if there's not statement
            if(ref.getDataStatement().getPreparedStatement() == null ||
               ref.getDataStatement().getPreparedStatement().trim().isEmpty()){
                    returnVal = new HashMap();
                    returnVal.put("crudzilla_status", "success");
                    return returnVal;                
            }
                        
           if(doLog)
           	caller.logger().info("Active transaction path "+ref.getDataStatement().getTransactionPath()+" current action "+ref.getDataStatement().getTransactionAction());
      
      	   LazyDynaBean transaction = null;
           if(arguments.get("crudzillaCompile") == null && ref.getDataStatement().getTransactionPath() != null &&
              !ref.getDataStatement().getTransactionPath().isEmpty()){
             
     		    /**transaction = (LazyDynaBean)callingModule.execute(ref.getDataStatement().getTransactionPath(),arguments,true,(Invocation)arguments.get("crudzilla_true_caller"));**/
            
             	transaction = (LazyDynaBean)caller.resolvePathToCaller(ref.getDataStatement().getTransactionPath()).using(callingModule).call(ref.getDataStatement().getTransactionPath(),arguments);
           }
           else
           if(arguments.get("crudzillaCompile") == null &&
              arguments.get("crudzilla_transaction_object") != null){
             	transaction = (LazyDynaBean)arguments.get("crudzilla_transaction_object");
           }      
      
            /////////////////////////////Get Connection///////////////////////////
            java.sql.Connection conn = null;
            boolean isTransaction = false;
               
            //set datasource configuration
            if(arguments.get("crudzilla_datastatement_datasource_config") == null)
            	arguments.put("crudzilla_datastatement_datasource_config", ref.getDataStatement().getDataSource().getConfig());

            if(transaction != null){
              	if(doLog)
					caller.logger().info("Active transaction "+transaction.get("name")+" current action "+ref.getDataStatement().getTransactionAction());
              
                isTransaction = true;
              
                //start a new transaction
                if(startTransaction(arguments,ref,transaction)){
                  
                    String platformModule       = callingModule.sysSettings().get("crudzilla_platform_module").toString();
                    //String jdbcConnectorCreator = caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator").toString();
                  
                    //create connection
                    conn = (java.sql.Connection)caller.using(platformModule)
                      	  .call("/crud-types/datastatement/datasource-connection-creator.ste",arguments);
                  
                    /**conn = (java.sql.Connection)caller.resolvePathToCaller(caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator").toString()).call(""+caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator"), arguments);**/
					caller.logger().info("retrieved connection "+conn);
                  
                    conn.setAutoCommit(false);
                    LazyDynaBean transWrapper = new LazyDynaBean();
                    transWrapper.set("transaction", transaction);
                    transWrapper.set("connection", conn);
                    arguments.put("crudzilla_transaction_"+transaction.get("name"), transWrapper);
                  
                    if(transaction.get("isolation_level") != null && 
                       !transaction.get("isolation_level").toString().isEmpty()){
                     
                        int level = getIsolationLevel((String)transaction.get("isolation_level"));
                        if(level != -1)
                    		conn.setTransactionIsolation(level);
                        else
                          caller.logger().warn("invalid transaction isolation level specified "+transaction.get("isolation_level"));
                    }
                  
                  	if(doLog)
                    	caller.logger().info("Starting transaction "+transaction.get("name"));
                    
                    if(startTransactionOnly(arguments,ref,transaction))
                       return null;                    
                }
                else
                if(joinTransaction(arguments,ref,transaction)){
                  
                    LazyDynaBean transWrapper = (LazyDynaBean)arguments.get("crudzilla_transaction_"+transaction.get("name"));
                    conn = (java.sql.Connection)transWrapper.get("connection");
                  
                  	if(doLog)
                    	caller.logger().info("Joining transaction "+((LazyDynaBean)transWrapper.get("transaction")).get("name"));
                }
                else
                if(commitTransaction(arguments,ref,transaction)){
                  
                    LazyDynaBean transWrapper = (LazyDynaBean)arguments.get("crudzilla_transaction_"+transaction.get("name"));
                    conn = (java.sql.Connection)transWrapper.get("connection");
                  
                  	if(doLog)
                    	caller.logger().info("Before commiting transaction "+((LazyDynaBean)transWrapper.get("transaction")).get("name"));
                }
                else
                if(commitTransactionOnly(arguments,ref,transaction)){
                  
                    LazyDynaBean transWrapper = (LazyDynaBean)arguments.get("crudzilla_transaction_"+transaction.get("name"));
                    conn = (java.sql.Connection)transWrapper.get("connection");


                    conn.commit();
                    conn.close();
                    caller.logger().info("Commited transaction "+((LazyDynaBean)transWrapper.get("transaction")).get("name"));
                    return null;
                }
            }
            else
            {
                    String platformModule       = callingModule.sysSettings().get("crudzilla_platform_module").toString();
                    //String jdbcConnectorCreator = caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator").toString();
                  
                    //create connection
                    conn = (java.sql.Connection)caller.using(platformModule)
                      	  .call("/crud-types/datastatement/datasource-connection-creator.ste",arguments);
              
                    caller.logger().info("retrieved connection "+conn);
                /**conn = (java.sql.Connection)caller.resolvePathToCaller(caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator").toString()).call(""+caller.getCrudEngine().sysSettings().get("crudzilla_datasource_connection_creator"), arguments);**/
              
            }                  
            ///////////////////////////////////////////////////////////////////////////////
            
            
            
            final ExecutablePreparedDataStatement stm = caller.getCrudEngine().getDataStatementUtil().makeExecutableStatement(ref,conn, arguments,caller);
            String beanClass = null;
            
            
            //determine if there is a supplied type for the resultset
            if(arguments.get("crudzillaJavaLangClass") != null)
                beanClass = (String)arguments.get("crudzillaJavaLangClass");
            //else
            //    beanClass = (String)arguments.get("javaLangClass");
            /*--if(beanClass == null)
                beanClass = ref.getJavaLangClass();*/
            String returnFormat = null;
            if(arguments.get("crudzillaResultSetFormat") != null)
                returnFormat = (String)arguments.get("crudzillaResultSetFormat");
            //else
            //    returnFormat = (String)arguments.get("resultSetFormat");
            
            
            /*--if(returnFormat == null)
                returnFormat = ref.getResultSetFormat();            
            */
            
            ResultSetHandler resultSetHandler = null;
            
            if(beanClass != null){
                caller.logger().info("javaLangClass:"+beanClass);             
                caller.logger().info("crudzillaResultSetFormat:"+returnFormat);
              
                //format can be: bean|list
                try{
                    
                    if(beanClass.compareToIgnoreCase("java.util.HashMap") == 0 
                       || beanClass.compareToIgnoreCase("java.util.Map") == 0
                       || beanClass.compareToIgnoreCase("map") == 0){
                      
                        if(returnFormat != null && returnFormat.compareToIgnoreCase("bean") == 0)
                            resultSetHandler = new MapHandler(new CrudzillaBasicRowProcessor(caller));
                        else
                            resultSetHandler = new MapListHandler(new CrudzillaBasicRowProcessor(caller));                        
                    }
                    else
                    {                    
                        if(returnFormat != null && returnFormat.compareToIgnoreCase("bean") == 0)
                            resultSetHandler = new BeanHandler(Class.forName(beanClass),new CrudzillaBasicRowProcessor(new CrudzillaBeanProcessor(caller)));
                        else
                            resultSetHandler = new BeanListHandler(Class.forName(beanClass),new CrudzillaBasicRowProcessor(new CrudzillaBeanProcessor(caller)));
                    }
                }catch(Exception ex){//
                    caller.logger().error("Error creating resultset handler",ex);
                }
            }
            
            
            
            if(resultSetHandler == null){
                final String resultSetFormat = returnFormat;
                //caller.logger().info("creating mapped resultset handler");
                resultSetHandler = new ResultSetHandler</*--Map*/Object>() {
                    
                    @Override
                    public /*--Map*/Object handle(ResultSet rs) throws SQLException {
                        ResultSetMetaData meta = rs.getMetaData();
                        int cols = meta.getColumnCount();
                        
                        
                        if(ref.getDataStatement().getResultSetProcessorPath() != null &&
                           !ref.getDataStatement().getResultSetProcessorPath().isEmpty()){
                                arguments.put("crudzilla_datastatement_resultset",rs);
                          		
                          		/**return callingModule.execute(ref.getDataStatement().getResultSetProcessorPath(),arguments,true,(Invocation)arguments.get("crudzilla_true_caller"));**/

                          
                                return caller.resolvePathToCaller(ref.getDataStatement().getResultSetProcessorPath()).using(callingModule).call(ref.getDataStatement().getResultSetProcessorPath(),arguments);
                        }
                        /*--
                        String[] resultSetColumnTemplates = stm.getDataStatement().getResultSetTemplate().replaceAll("\\{","").replaceAll("}","").split(",");
                        String[] resultSetColumns = new String[resultSetColumnTemplates.length];
                        */ 
                        Map resultSet = new HashMap();

                        List columns = new ArrayList<String>();
                        /*--
                        for(int i=0;i<resultSetColumnTemplates.length;i++){
                            resultSetColumns[i] = resultSetColumnTemplates[i].split(":")[0];
                            resultSetColumns[i] = resultSetColumns[i].replaceAll("\"","");
                            columns.add(resultSetColumns[i]);
                        }*/ 
                        
                        List rows = new ArrayList();

                        Map row = null;
                        LazyDynaBean rowBean = null;
                        while(rs.next()){
                            row = new HashMap();
                            rowBean = new LazyDynaBean();
                            
                            for (int i = 0; i < cols; i++) {
                                String columnName = meta.getColumnLabel(i+1);
                                if(columnName.isEmpty())
                                    columnName = meta.getColumnName(i+1);
                                
                                
                                /*--
                                if(cols == resultSetColumnTemplates.length){                                
                                    row.put(resultSetColumns[i], rs.getObject(columnName));
                                    rowBean.set(resultSetColumns[i], rs.getObject(columnName));
                                }
                                else
                                */
                                {//invalid column template, so just use resultset meta
                                    Object r = null;
                                    
                                    //caller.logger().info("java.sql.Types:"+meta.getColumnType(i+1));
                                    if(meta.getColumnType(i+1) == java.sql.Types.CLOB){
                                        //convert clob to string
                                        /*if(r != null && r instanceof java.sql.Clob)*//*{
                                            try
                                            {
                                                StringWriter w = new StringWriter();
                                                IOUtils.copy(rs.getCharacterStream(i+1)/*.getAsciiStream()*, w);
                                                r  = w.toString();
                                            }catch(Exception e){
                                                caller.logger().error(e);
                                            }
                                        }*/
                                         r = rs.getString(columnName);
                                    }else{
                                         r = rs.getObject(columnName);
                                    }
                                    
                                    row.put(columnName, r);
                                    rowBean.set(columnName, r);
                                }
                            }
                            //rows.add(row);                            
                            rows.add(rowBean);
                        }
                        
                        //validate column meta data
                        if(/*--cols != resultSetColumnTemplates.length*/true){
                            columns = new ArrayList<String>();
                            for (int i = 0; i < cols; i++){
                                if(!meta.getColumnLabel(i+1).isEmpty())
                                    columns.add(meta.getColumnLabel(i+1));
                                else
                                    columns.add(meta.getColumnName(i+1));
                            }
                        }
                        
                        if(resultSetFormat != null && resultSetFormat.compareToIgnoreCase("decorated") == 0){
                            resultSet.put("columns", columns);
                            resultSet.put("rows", rows);
                            return resultSet;
                        }
                        else
                        if(resultSetFormat != null && resultSetFormat.compareToIgnoreCase("bean") == 0 && rows.size() == 1)
                            //return row;
                            return rowBean;
                        else
                        if(resultSetFormat != null && resultSetFormat.compareToIgnoreCase("bean") == 0 && rows.size() == 0)
                          return null;
                        else
                        //if(resultSetFormat == null || resultSetFormat.compareToIgnoreCase("list") == 0 || rows.size() > 0)
                        return rows;
                    }
                };            
            }
            
            
            try
            {
                if((ref.getDataStatement().getResultSetProcessorPath() != null &&
                           !ref.getDataStatement().getResultSetProcessorPath().isEmpty())
                        || stm.getDataStatement().getResultSetTemplate().compareTo("{}") != 0){
                  
                    //caller.logger().info("resultset template:"+stm.getDataStatement().getResultSetTemplate());
                    //Object result = DBManager.getQueryRunner(stm.getDataStatement().getDataSource().getJndiPath()).query(stm.getDataStatement().getPreparedStatement(),resultSetHandler,stm.getArguments());
                    Object result =  new QueryRunner().query(conn,stm.getDataStatement().getPreparedStatement(),resultSetHandler,stm.getArguments());
                    //caller.logger().info("object returned:"+(result!=null?result.getClass().getName():"empty resultset"));
                    
                    /*--if(result == null){
                        result = new HashMap();
                        ((Map)result).put("status", "success");
                    }*/
                    
                    //commit transaction
                    if(isTransaction && commitTransaction(arguments,ref,transaction))
                    {                      
                        LazyDynaBean transWrapper = (LazyDynaBean)arguments.remove("crudzilla_transaction_"+transaction.get("name"));
                        conn.commit();
                        conn.close();
                        caller.logger().info("Commited transaction "+((LazyDynaBean)transWrapper.get("transaction")).get("name"));
                    }
                    else
                    if(!isTransaction)
                    {
                        conn.close();
                    }
                    
                    return result;
                }
                else
                {
                    //caller.logger().info("empty resultset for:"+stm.getDataStatement().getName()+" conn:"+conn+" isTransaction:"+isTransaction+" type:"+stm.getDataStatement().getDataSource().getConfig().get("type"));
                    //DBManager.getQueryRunner(stm.getDataStatement().getDataSource().getJndiPath()).update(stm.getDataStatement().getPreparedStatement(),stm.getArguments());
                  
                    if(false && arguments.get("crudzilla_datastatement_type") != null && 
                       arguments.get("crudzilla_datastatement_type").toString().compareToIgnoreCase("insert") == 0){
                      /**
                      Object hr = new QueryRunner().insert(conn,stm.getDataStatement().getPreparedStatement(),new BeanHandler<Long>(Long.class),stm.getArguments());
                      returnVal = new HashMap();
                      returnVal.put("crudzilla_status", "success"); 
                      
                      if(hr != null && ( (hr instanceof Long) || (hr instanceof Integer) ))
                        arguments.put("crudzilla_datastatement_last_insert_id",hr);
                      **/
                    }
                    else
                    {
                      int updateCount = new QueryRunner().update(conn,stm.getDataStatement().getPreparedStatement(),stm.getArguments());
                      returnVal = new HashMap();
                      returnVal.put("crudzilla_status", "success");
                      
                      arguments.put("crudzilla_datastatement_update_count",updateCount);
                    }
                  
                    //commit transaction
                    if(isTransaction && commitTransaction(arguments,ref,transaction)){
                        LazyDynaBean transWrapper = (LazyDynaBean)arguments.remove("crudzilla_transaction_"+transaction.get("name"));
                        conn.commit();
                        conn.close();
                    }
                    else
                    if(!isTransaction)
                    {
                        conn.close();
                    }                    
                    return returnVal;
                }
            }catch(Exception ex){
                isTransaction = false;
                if(arguments.get("crudzillaCompile") != null &&
                   ex.getMessage() != null && 
                   ex.getMessage().indexOf("Can not issue data manipulation statements with executeQuery()") >= 0){
                    
                }else{
                    caller.logger().error("Error executing datastatement:",ex);
                }
            }
            
            finally {
                try{
                    if(!isTransaction)
                    	conn.close();
                }catch(Exception ex){}
            }
            
            returnVal = new HashMap();
            returnVal.put("crudzilla_status", "error");            
            return returnVal;
    }    
}
