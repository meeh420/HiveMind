/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.dao;

import com.crudzilla.platform.Crudzilla;
import com.crudzilla.bean.Parameter;
import com.crudzilla.platform.datamodel.bean.DataModel;
import com.crudzilla.platform.datamodel.bean.DataModelField;
import com.crudzilla.platform.datamodel.bean.DataModelFieldColumn;
import com.crudzilla.platform.datastatement.bean.DataModelReference;
import com.crudzilla.platform.datastatement.bean.DataStatement;
import com.crudzilla.platform.datamodel.bean.DataTable;
import com.crudzilla.platform.datatable.bean.DataTableColumn;
import com.crudzilla.platform.datatable.bean.DataTableColumnSpace;
import com.crudzilla.platform.invocation.Invocation;
import com.crudzilla.platform.scriptexecutor.bean.ScriptExecutor;
import com.crudzilla.platform.scriptexecutor.bean.ScriptStatement;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.util.List;
import java.util.Map;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class CoreDAO {
    private static Log  logger = LogFactory.getLog(CoreDAO.class); 
 
    
    public static DataStatement getDataStatement(Invocation caller,Map<String,Object> arguments,String dataStatementId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            
            newArguments.put("crudzillaJavaLangClass", DataStatement.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataStatement");
            /*--return (DataStatement)caller.call("api/datastatements/base-discover-datastatement.stm",newArguments); */
            return (DataStatement)caller.call(crudPath,newArguments);        
    } 
    
       
    
    public static List<Parameter> getExecutionParameters(Invocation caller,Map<String,Object> arguments,String dataStatementId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("definition_id", dataStatementId);
            
            newArguments.put("crudzillaJavaLangClass", Parameter.class.getName());
            newArguments.put("crudzillaResultSetFormat", "list");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getExecutionParameters");
            return (List<Parameter>)caller.call(crudPath,newArguments);       
    }    
    
    
    public static List<DataModelReference> getDataModelReferences(Invocation caller,Map<String,Object> arguments,String dataStatementId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            
            newArguments.put("crudzillaJavaLangClass", DataModelReference.class.getName());
            newArguments.put("crudzillaResultSetFormat", "list");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModelReferences");
            return (List<DataModelReference>)caller.call(crudPath,newArguments);        
    }    
    
    
    
    public static DataTable getDataTable(Invocation caller,Map<String,Object> arguments,String dataTableId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("id", dataTableId);
            
            newArguments.put("crudzillaJavaLangClass", DataTable.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataTable");
            return (DataTable)caller.call(crudPath,newArguments);        
    }    
      
    
    public static DataModel getDataModel(Invocation caller,Map<String,Object> arguments,String dataModelId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datamodel_id", dataModelId);
            
            newArguments.put("crudzillaJavaLangClass", DataModel.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModel");
            return (DataModel)caller.call(crudPath,newArguments);        
    }
    
    
    public static DataModelField getDataModelField(Invocation caller,Map<String,Object> arguments,String dataModelId,String dataModelFieldId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datamodel_id", dataModelId);
            newArguments.put("datamodel_field_id", dataModelFieldId);
            
            newArguments.put("crudzillaJavaLangClass", DataModelField.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModelField");
            return (DataModelField)caller.call(crudPath,newArguments);        
    }   
    
    
    public static DataModelField getDataModelFieldByName(Invocation caller,Map<String,Object> arguments,String dataModelId,String name){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datamodel_id", dataModelId);
            newArguments.put("datamodel_field_name", name);
            
            newArguments.put("crudzillaJavaLangClass", DataModelField.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModelFieldByName");
            return (DataModelField)caller.call(crudPath,newArguments);        
    }    
    
    public static List<DataModelField> getDataModelFields(Invocation caller,Map<String,Object> arguments,String dataModelId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datamodel_id", dataModelId);
            
            newArguments.put("crudzillaJavaLangClass", DataModelField.class.getName());
            newArguments.put("crudzillaResultSetFormat", "list");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModelFields");
            return (List<DataModelField>)caller.call(crudPath,newArguments);        
    }    
    
    public static DataModelFieldColumn getDataModelFieldColumn(Invocation caller,Map<String,Object> arguments,String dataModelId,String fieldId,String dataTableId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datamodel_id", dataModelId);
            newArguments.put("datamodel_field_id", fieldId);
            newArguments.put("datamodel_datatable_id", dataTableId);
            
            newArguments.put("crudzillaJavaLangClass", DataModelFieldColumn.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataModelFieldColumn");
            return (DataModelFieldColumn)caller.call(crudPath,newArguments);        
    }    
    
    public static DataTableColumn getDataTableColumn(Invocation caller,Map<String,Object> arguments,String dataTableId,String columnId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datatable_id", dataTableId);
            newArguments.put("datatable_column_id", columnId);
            
            newArguments.put("crudzillaJavaLangClass", DataTableColumn.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataTableColumn");
            return (DataTableColumn)caller.call(crudPath,newArguments);        
    }       
    
    public static void updateDataTableSql(Invocation caller,Map<String,Object> arguments,String dataTableId,String sql){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datatable_id", dataTableId);
            newArguments.put("create_table_statement", sql);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("updateDataTableSql");
            caller.call(crudPath,newArguments);        
    }    
    
    public static List<DataTableColumnSpace> getDataTableColumnSpaces(Invocation caller,Map<String,Object> arguments,String dataTableId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datatable_id", dataTableId);
            
            newArguments.put("crudzillacrudzillaJavaLangClass", DataTableColumnSpace.class.getName());
            newArguments.put("crudzillacrudzillaResultSetFormat", "list");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getDataTableColumnSpaces");
            return (List<DataTableColumnSpace>)caller.call(crudPath,newArguments);        
    }    
    
    public static void addDataTableColumn(Invocation caller,Map<String,Object> arguments,String dataTableId,String name,String sqlDefinition){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datatable_id", dataTableId);
            newArguments.put("name", name);
            newArguments.put("sql_definition", sqlDefinition);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("addDataTableColumn");
            caller.call(crudPath,newArguments);        
    }    
    
    public static void updateDataStatement(Invocation caller,Map<String,Object> arguments,String dataStatementId,String compiledSQL,String paramList){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            newArguments.put("preparedSQL", compiledSQL);
            newArguments.put("parameter_list", paramList);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("updateDataStatementPreparedStatement");
            caller.call(crudPath,newArguments);        
    }
    
    public static void updateDataStatement(Invocation caller,Map<String,Object> arguments,String dataStatementId,String resultSetTemplate){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            newArguments.put("resultset_template", resultSetTemplate);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("updateDataStatementResultSetTemplate");
            caller.call(crudPath,newArguments);        
    }    
    
    
    public static void deleteDataStatementResultSetMaps(Invocation caller,Map<String,Object> arguments,String dataStatementId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("deleteDataStatementResultSetMaps");
            caller.call(crudPath,newArguments);        
    }    
    
    public static void addDataStatementResultSetMap(Invocation caller,Map<String,Object> arguments,String dataStatementId,String columnName,String fieldName){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("datastatement_id", dataStatementId);
            newArguments.put("column_name", columnName);
            newArguments.put("field_name", fieldName);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("addDataStatementResultSetMap");
            caller.call(crudPath,newArguments);        
    }     
    
    
    public static ScriptExecutor getScriptExecutor(Invocation caller,Map<String,Object> arguments,String scriptExecutorId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(caller.getCrudEngine().getArguments());*/
            newArguments.put("scriptexecutor_id", scriptExecutorId);
            
            newArguments.put("crudzillaJavaLangClass", ScriptExecutor.class.getName());
            newArguments.put("crudzillaResultSetFormat", "bean");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getScriptExecutor");
            return (ScriptExecutor)caller.call(crudPath,newArguments);        
    }    
    
    
    public static List<ScriptStatement> getScriptStatements(Invocation caller,Map<String,Object> arguments,String scriptExecutorId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            /*--newArguments.putAll(crud.getArguments());*/
            newArguments.put("scriptexecutor_id", scriptExecutorId);
            
            newArguments.put("crudzillaJavaLangClass", ScriptStatement.class.getName());
            newArguments.put("crudzillaResultSetFormat", "list");
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("getScriptStatements");
            return (List<ScriptStatement>)caller.call(crudPath,newArguments);        
    }    
    
    public static void addDefinitionReference(Invocation caller,Map<String,Object> arguments,String definitionId,String referenceId,String lastRefreshTimeStamp,String path){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            //newArguments.putAll( caller.getCrudEngine().getArguments());
            newArguments.put("definitionId", definitionId);
            newArguments.put("referenceId", referenceId);
            newArguments.put("lastRefreshTimeStamp", lastRefreshTimeStamp);
            newArguments.put("path", path);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("addDefinitionReference");
            caller.call(crudPath,newArguments);        
    }
    
    public static void deleteDefinitionReference(Invocation caller,Map<String,Object> arguments,String referenceId){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            //newArguments.putAll( caller.getCrudEngine().getArguments());
            newArguments.put("referenceId", referenceId);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("deleteDefinitionReference");
            caller.call(crudPath,newArguments);        
    }
    
    public static void updateDefinitionReference(Invocation caller,Map<String,Object> arguments,String referenceId,String path){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            //newArguments.putAll( caller.getCrudEngine().getArguments());
            newArguments.put("referenceId", referenceId);
            newArguments.put("path", path);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("updateDefinitionReference");
            caller.call(crudPath,newArguments);        
    }    
    
    public static void updateDefinitionReferenceRefreshTS(Invocation caller,Map<String,Object> arguments,String referenceId,String ts){
            Map<String,Object> newArguments = CrudzillaUtil.newArgumentMap(caller.getCrudEngine(),arguments/*--, true*/);
            //newArguments.putAll( caller.getCrudEngine().getArguments());
            newArguments.put("referenceId", referenceId);
            newArguments.put("lastRefreshTimeStamp", ts);
            
            String crudPath = (String)((LazyDynaBean)caller.getCrudEngine().sysSettings().get("crudzilla_engine_crud_paths")).get("updateDefinitionReferenceRefreshTS");
            caller.call(crudPath,newArguments);        
    }    
}
