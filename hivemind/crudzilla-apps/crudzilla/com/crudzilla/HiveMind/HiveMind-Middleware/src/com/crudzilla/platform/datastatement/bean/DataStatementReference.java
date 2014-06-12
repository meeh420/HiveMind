package com.crudzilla.platform.datastatement.bean;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.datasource.bean.DataSource;
import com.crudzilla.platform.invocation.Invocation;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.Crudzilla;
import org.apache.commons.beanutils.LazyDynaBean;
import net.sf.json.JSONObject;

/**
 *
 * @author bitlooter
 */
public class DataStatementReference extends ExecutableDefinitionReference{  
    
  
    
  
    public DataStatementReference(DataStatement dataStatement, Executable caller){
        super(dataStatement);
        
        String dataSourcePath = dataStatement.getDataSourcePath();
        
      	if(dataStatement.getDataSource() == null && dataSourcePath != null && !dataSourcePath.isEmpty()){
          
            Crudzilla callingModule = caller.getCrudEngine().findCaller(caller);
            //Invocation trueCaller = (Invocation)caller.getArguments().get("crudzilla_true_caller");
            
            //call this in the context of primary action so relative urls work
            LazyDynaBean dataSourceBean = (LazyDynaBean)caller.resolvePathToCaller(dataSourcePath).using(callingModule).call(dataSourcePath);
    		//LazyDynaBean dataSourceBean = (LazyDynaBean)callingModule.execute(dataSourcePath,caller.getArguments(),true,trueCaller);
            caller.logger().info("data source successfully loaded 1 "+dataSourceBean);
          
            DataSource dataSource = new DataSource();
            dataSource.setConfig(dataSourceBean);            
            dataStatement.setDataSource(dataSource);
      	}
    }
    
    
    public DataStatementReference(JSONObject refFile, Executable caller){
        super(refFile,new DataStatement(),caller);
        
        if(refFile.has("definition")){
            JSONObject definitionJSON = refFile.getJSONObject("definition");
            
            
            ((DataStatement)definition).setPreparedStatement(StringOrNull(definitionJSON.get("preparedStatement")));
            ((DataStatement)definition).setPreparedStatementParamList(StringOrNull(definitionJSON.get("preparedStatementParamList")));
            ((DataStatement)definition).setResultSetTemplate(StringOrNull(definitionJSON.get("resultSetTemplate")));
            ((DataStatement)definition).setSqlSrcPath(StringOrNull(definitionJSON.get("sqlSrcPath")));
            ((DataStatement)definition).setResultSetProcessorPath(StringOrNull(definitionJSON.get("resultSetProcessorPath")));

            ((DataStatement)definition).setTransactionPath(StringOrNull(definitionJSON.get("transactionPath")));
            ((DataStatement)definition).setTransactionAction(StringOrNull(definitionJSON.get("transactionAction")));
          
            
            if(definitionJSON.has("dataSourcePath")){
              String dataSourcePath = definitionJSON.getString("dataSourcePath");
              
              if(dataSourcePath != null && !dataSourcePath.isEmpty()){
                
                Crudzilla callingModule = caller.getCrudEngine().findCaller(caller);
                //Invocation trueCaller = (Invocation)caller.getArguments().get("crudzilla_true_caller");
                
                //call this in the context of primary action so relative urls work
                LazyDynaBean dataSourceBean = (LazyDynaBean)caller.resolvePathToCaller(dataSourcePath).using(callingModule).call(dataSourcePath);
                //LazyDynaBean dataSourceBean = (LazyDynaBean)callingModule.execute(dataSourcePath,caller.getArguments(),true,trueCaller);
                caller.logger().info("data source successfully loaded 2 "+dataSourceBean);
                
                DataSource dataSource = new DataSource();
                dataSource.setConfig(dataSourceBean);                  
                ((DataStatement)definition).setDataSource(dataSource);
                
              }
            }
        }
    }    
    
    public DataStatement getDataStatement() {
        return (DataStatement)definition;
    }

    public void setDataStatement(DataStatement dataStatement) {
        this.definition = dataStatement;
    }
}
