/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;


import com.crudzilla.db.DBManager; 
import com.crudzilla.platform.dao.CoreDAO;
import com.crudzilla.platform.datamodel.bean.DataTable;
import com.crudzilla.platform.datasource.bean.DataSource;
import com.crudzilla.platform.datatable.bean.DataTableColumnSpace;
import com.crudzilla.platform.invocation.Invocation;
import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author bitlooter
 */
public class DataTableUtil {
    //static Logger logger = Logger.getLogger(DataTableUtil.class.getName());
    static private Log logger = LogFactory.getLog(DataTableUtil.class);
    
    public static String generateCreateStatement(Invocation caller,Map<String,Object> arguments, String dataTableId){
        DataTable dataTable = CoreDAO.getDataTable(caller,arguments, dataTableId);
        List<DataTableColumnSpace> columnSpaces = CoreDAO.getDataTableColumnSpaces(caller,arguments, dataTableId);
        StringBuilder buffer = new StringBuilder();
        
        buffer.append("CREATE TABLE "+dataTable.getName()+" (\n@begin_column_definitions\n");
        boolean first = true;
        for(DataTableColumnSpace columnSpace:columnSpaces){
            for(int i=0;i<columnSpace.getInitialCount();i++){
                if(!first)
                    buffer.append(",");
                else
                    first = false;
                
                buffer.append("\narguments_column@arguments_column_id "+columnSpace.getSqlDefinition());
            }
        }
        buffer.append("\n@end_column_definitions\n)");
        return buffer.toString();
    }
    
    public static String createDataTable(Invocation caller,Map<String,Object> arguments,String dataTableId,String sql){
        DataTable datatable = CoreDAO.getDataTable(caller,arguments,dataTableId);
        //DataSource dataSource = CoreDAO.getDataSource(caller,arguments,datatable.getDataSourceId());

        String dataSourcePath = datatable.getDataSource();
        org.apache.commons.beanutils.LazyDynaBean dataSourceBean = (org.apache.commons.beanutils.LazyDynaBean)caller.call(dataSourcePath);

        DataSource dataSource = new DataSource();            
        dataSource.setName(CrudzillaUtil.StringOrNull(dataSourceBean.get("name")));
        dataSource.setJndiPath(CrudzillaUtil.StringOrNull(dataSourceBean.get("jndiPath")));

        //datatable.setDataSource(dataSource);        
        
        String sqlCreateStatement;
        
        try{
            if(sql != null){
                sqlCreateStatement = sql;
                CoreDAO.updateDataTableSql(caller,arguments,dataTableId, sql);
            }
            else{
                sqlCreateStatement =  datatable.getCreateSqlStatement();
            }
            
            int leftParenIndex = sqlCreateStatement.indexOf("@begin_column_definitions");
            int rightParenIndex = sqlCreateStatement.indexOf("@end_column_definitions", leftParenIndex);

            if(leftParenIndex >-1 && rightParenIndex>-1){
                
                String   columnDefinitionString = sqlCreateStatement.split("@begin_column_definitions")[1].split("@end_column_definitions")[0];
                String[] columnDefinitions = /*sqlCreateStatement.substring(leftParenIndex+25, rightParenIndex+24)*/columnDefinitionString.trim().split("arguments_column@arguments_column_id");
                
                sqlCreateStatement = sqlCreateStatement.replace("@begin_column_definitions","").replace("@end_column_definitions","");
                
                //logger.info(sqlCreateStatement+" columns:"+columnDefinitionString);
                
                for(int i=1;i<columnDefinitions.length;i++){
                    String columnTypeDefinitionString = columnDefinitions[i]/*.trim().split(" ")[1]*/.trim();
                    
                    if(columnTypeDefinitionString.charAt(columnTypeDefinitionString.length()-1) == ',')
                        columnTypeDefinitionString = columnTypeDefinitionString.substring(0, columnTypeDefinitionString.length()-1);
                    
                    int columnId = i+1;
                    CoreDAO.addDataTableColumn(caller,arguments, datatable.getId(), "arguments_column_"+datatable.getId()+"_"+columnId, columnTypeDefinitionString);
                    //DataTableDAO.updateColumn(userName, datatable.getId(),columnId,"arguments_column_"+datatable.getId()+"_"+columnId, columnTypeDefinitionString);
                    sqlCreateStatement = sqlCreateStatement.replaceFirst("@arguments_column_id", "_"+datatable.getId()+"_"+columnId);
                }
                
                //create table
                DBManager.getQueryRunner(dataSource.getJndiPath()).update(sqlCreateStatement);                
            }
        }catch(Exception ex){
            logger.error(ex);
            return "{\"status\":\"failure\"}";
        }
        return "{\"status\":\"success\"}";
    }    
}
