/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.crudzilla.db;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author bitlooter
 */
public class DBManager {

    private static Log   _logger = LogFactory.getLog(DBManager.class);
    private static javax.sql.DataSource _dataSource = null;
    public  static boolean              jdni_use_absolute = false;


    public static void init(){
        try{
            /*
            javax.naming.Context initContext = new javax.naming.InitialContext();
            javax.naming.Context envContext  = (javax.naming.Context)initContext.lookup("java:/comp/env");
            DBManager._dataSource = (javax.sql.DataSource)envContext.lookup("jdbc/feezixlabsDB");
            */
            javax.naming.Context initContext = new javax.naming.InitialContext();
            DBManager._dataSource = (javax.sql.DataSource)initContext.lookup("java:comp/env/jdbc/crudzillaDB");
        }catch(Exception ex){
            _logger.error("",ex);
        }
    }

    public static QueryRunner getDataSource(){
        QueryRunner run = new QueryRunner(DBManager._dataSource);
        
        try{
                run.update("select 1");
        }catch(Exception ex){
            //logger.error("",ex);
        }
        return run;
    }
    
    
    public static QueryRunner getQueryRunner(String dataSourceJNDI){
        try{
             javax.naming.Context initContext = new javax.naming.InitialContext();
             javax.sql.DataSource dataSource = (javax.sql.DataSource)initContext.lookup(/*"java:comp/env/"+*/dataSourceJNDI);
             
             
             QueryRunner run = new QueryRunner(dataSource);

             /**try{
                    run.update("select 1");
             }catch(Exception ex){
                logger.error(ex);
             }**/
             return run;
        }catch(Exception ex){
            _logger.error(ex);
        }
        return null;
    }    
}


