/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;


import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.dao.CoreDAO;
import com.crudzilla.platform.datamodel.bean.DataModel;
import com.crudzilla.platform.datamodel.bean.DataModelField;
import com.crudzilla.platform.datamodel.bean.DataModelFieldColumn;
import com.crudzilla.platform.datamodel.bean.DataTable;
import com.crudzilla.platform.datastatement.bean.DataModelReference;
import com.crudzilla.platform.datastatement.bean.DataStatement;
import com.crudzilla.platform.datastatement.bean.PreparedDataStatement;
import com.crudzilla.platform.datastatement.bean.PreparedStatementWarning;
import com.crudzilla.platform.invocation.Invocation;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class StatementPreparer {
    //static Logger logger = Logger.getLogger(StatementPreparer.class.getName());  
    private static Log _logger = LogFactory.getLog(StatementPreparer.class);
    
    
    DataModel                           _currentDataModelContext;
    List<DataModelReference>            _dataModelReferences;
    List<DataModel>                     _dataModels;
    List<PreparedStatementWarning>      _warnings;
    List<String>                        _parameterList;
    DataStatement                       _dataStatement;
    
    StringBuilder                       _buffer;
    String                              _sql;
    int                                 _curIndex;
    String                              _curToken;
    Map<String,Object>                  _arguments;
    String                              crudPath;
    Invocation                          caller;
    Crudzilla							tempCrudEngine;
    /*String						    applicationModule;*/
    
    public StatementPreparer(Crudzilla tempCrudEngine/*String applicationModule*/,
                             Invocation caller,Map<String,Object> arguments,
                             String dataStatementId,
                             String crudPath){
      
        _arguments              = arguments;
        this.crudPath           = crudPath;
        this.tempCrudEngine     = tempCrudEngine;
        /**this.applicationModule  = applicationModule;*/
        _dataStatement          = CoreDAO.getDataStatement(caller,arguments,dataStatementId);
        
        if(_dataStatement.getDataModelReferencePath() != null && !_dataStatement.getDataModelReferencePath().isEmpty()){
             if(!_dataStatement.getDataModelReferencePath().startsWith("/")){
                String cp = crudPath;
                if(cp.lastIndexOf("/") != -1)
                    cp = cp.substring(0,cp.lastIndexOf("/"));
                else
                    cp = "";

                try{
                    cp = new File("/"+cp+"/"+_dataStatement.getDataModelReferencePath()).getCanonicalPath();
                }catch(Exception ex){} 
             
                /*_dataModels             = (List<DataModel>)tempCrudEngine.execute(cp,CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments),true,null);//(List<DataModel>)caller.call(cp,arguments);*/
                 _dataModels = (List<DataModel>)caller.using(tempCrudEngine).call(cp,CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments));
             }
             else{
                /*_dataModels             = (List<DataModel>)tempCrudEngine.execute(_dataStatement.getDataModelReferencePath(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments),true,null);//(List<DataModel>)caller.call(_dataStatement.getDataModelReferencePath(),arguments);*/
                _dataModels             = (List<DataModel>)caller.using(tempCrudEngine).call(_dataStatement.getDataModelReferencePath(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments));
             }
        }
        
        //_logger.info("loaded dataModels:"+_dataModels.size());

        _sql                    = _dataStatement.getSqlCode();
        _curIndex               = 0;
        _parameterList          = new ArrayList<String>();
        _buffer                 = new StringBuilder();
        _warnings               = new ArrayList<PreparedStatementWarning>();
        _curToken               = "";
        this.caller             = caller;
    }
    
    void setNewDataModelReferenceContext(boolean skipAdd){
        _currentDataModelContext = caller.getCrudEngine().getDataStatementUtil().getDataModel(tempCrudEngine,caller,_arguments,_curToken,_dataModels);
        
        if(!skipAdd){
          if(_currentDataModelContext != null && !_currentDataModelContext.isUsingAlias()){
              DataTable dataTable =  _currentDataModelContext.getDataTable();
              _buffer.append(dataTable.getName());//replace with actual table name
          }
          else
          if(_currentDataModelContext != null && !_currentDataModelContext.isUsingAlias()){
              //_currentDataModelContext.setUsingAlias(false);//reset   
              _buffer.append(_curToken);//use alias don't replace it
          }
          else
          {
              
              _buffer.append(_curToken);
          }
        }
    }
    
    boolean isValidDataModelReferenceContext(){
        return _currentDataModelContext != null;
    }
        
    void resetDataModelReferenceContext(){
        _currentDataModelContext = null;
    }
    
    void parseParamReference(char trigger){
        boolean typeHint = false;
        while(_curIndex<_sql.length()){
            char a = _sql.charAt(_curIndex);
            
            if(a == '_' || caller.getCrudEngine().getDataStatementUtil().isAlphaNumeric(a)){                
                _curToken += a;
            }
            else
            if(!typeHint && a == '('){
                _curToken += a;
                typeHint = true;
            }
            else
            if(typeHint && a == ')'){
                _curToken += a;
              
              
              
                if(_curToken.compareTo("crudzilla_type_identifier") == 0 
                   && isValidDataModelReferenceContext()
                   && _currentDataModelContext.getTypeIdentifier() != null 
                   && !_currentDataModelContext.getTypeIdentifier().isEmpty()){
                  
                	_buffer.append("'"+_currentDataModelContext.getTypeIdentifier()+"'");
                    resetDataModelReferenceContext();
                }
              	else
                {                    
               		_parameterList.add(_curToken);
               		_buffer.append("?");
                }
               
               _curIndex++;
               return;
            }
            else
            if(!_curToken.isEmpty())
            {
              
              	if(a == '.'){
                    setNewDataModelReferenceContext(true); 
                  	_curToken = "";
              	}
                else
                {
                  if(_curToken.compareTo("crudzilla_type_identifier") == 0 
                     && isValidDataModelReferenceContext() 
                     && _currentDataModelContext.getTypeIdentifier() != null 
                     && !_currentDataModelContext.getTypeIdentifier().isEmpty()){
                    
                      _buffer.append("'"+_currentDataModelContext.getTypeIdentifier()+"'");
                      resetDataModelReferenceContext();
                  }
                  else
                  {
                      _parameterList.add(_curToken);
                      _buffer.append("?");
                  }
                  return;
                }
              
            }else{
                _buffer.append(trigger);//restore parameter trigger token
                return;
            }
            _curIndex++;
        }
    }    
    
    
    void parseFieldInvocation(){
        while(_curIndex<_sql.length()){
            char a = _sql.charAt(_curIndex);
            
            if(a == '_' || caller.getCrudEngine().getDataStatementUtil().isAlphaNumeric(a)){                
                _curToken += a;
            }
            else
            if(_curToken.isEmpty() && a == ' '){
                _buffer.append(a);
            }       
            else
            if(!_curToken.isEmpty() || a == '*')
            {
                    /***
                    DataTableColumn dataTableColumn = DataStatementUtil.getDataModelFieldDataTableColumn(_arguments,_currentDataModelContext,!_curToken.isEmpty()?_curToken:"*");
                
                    //replace field reference with actual database column
                    if(dataTableColumn != null){
                        _buffer.append(dataTableColumn.getName());
                    }else{
                        logger.info("possible missing column mapping");
                        PreparedStatementWarning warning = new PreparedStatementWarning();
                        warning.setType("possible missing column mapping");
                        warning.setBrokenReference(!_curToken.isEmpty()?_curToken:"*");
                        warning.setStartIndex(_buffer.length());
                        _warnings.add(warning);                        
                        _buffer.append(!_curToken.isEmpty()?_curToken:"*");
                    }                    
                    ***/
                    
                    Map<DataModelField,DataModelFieldColumn> dataModelFieldColumns = caller.getCrudEngine().getDataStatementUtil().getDataModelFieldDataTableColumns(tempCrudEngine,caller,_arguments,_currentDataModelContext,!_curToken.isEmpty()?_curToken:"*");
                    if(dataModelFieldColumns != null && dataModelFieldColumns.size()>0){
                        
                        List<String> fieldNames = new ArrayList<String>();
                        boolean firstField = true;
                        for(DataModelField dataModelField: dataModelFieldColumns.keySet()){
                            DataModelFieldColumn dataModelFieldColumn = dataModelFieldColumns.get(dataModelField);
                            if(dataModelFieldColumn != null){
                                
                                String tableNamePrefix = "";
                                if(!firstField)
                                    tableNamePrefix = (_currentDataModelContext.isUsingAlias()?_currentDataModelContext.getActiveAlias():_currentDataModelContext.getDataTable().getName())+".";
                                
                                //use field names as column labels
                                if(
                                   a == '*' &&     
                                   dataModelField.getUseAsLabel() != null && 
                                   dataModelField.getUseAsLabel().compareTo("true") == 0){
                                  
                                    fieldNames.add(tableNamePrefix+dataModelFieldColumn.getName()+" as \""+dataModelField.getName() +"\""+(a != '*'?a:""));
                              }
                              else
                              {
                                    //append non-wildcard delimiters link commas
                                    fieldNames.add(tableNamePrefix+dataModelFieldColumn.getName()+(a != '*'?a:""));
                              }
                              firstField = false;
                            }
                            else
                            {
                                //if the current context is an alias, it is possible it is a composite
                                //let's make a best effort to see if the field is defined in other
                                //models that this alias references
                                boolean reportWarning = true;
                                if(_currentDataModelContext.isUsingAlias() && !_curToken.isEmpty()){
                                  
                                  DataModelField dataModelField1 = caller.getCrudEngine().getDataStatementUtil().getDataModelFieldByAlias(tempCrudEngine,caller,_arguments,_currentDataModelContext.getActiveAlias(),_dataModels,_curToken);
                                  
                                  if(dataModelField1 != null && dataModelField1.getColumn() != null){
                                    
                                    fieldNames.add(dataModelField1.getColumn().getName()+a);
                                    reportWarning = false;
                                    
                                  }
                                }
                              
                                if(reportWarning){
                                  _logger.info("possibly missing column mapping");
                                  PreparedStatementWarning warning = new PreparedStatementWarning();
                                  warning.setType("possibly missing column mapping");
                                  warning.setBrokenReference(dataModelField.getName());
                                  warning.setStartIndex(_buffer.length()+org.apache.commons.lang.StringUtils.join(fieldNames,",\n").length());
                                  _warnings.add(warning);                        
                                  fieldNames.add(dataModelField.getName()+(a != '*'?a:""));
                                }
                            }
                        }
                        _buffer.append(org.apache.commons.lang.StringUtils.join(fieldNames,",\n"));
                        _curIndex++;
                        return;
                    }
                    else
                    if(!_curToken.isEmpty())
                    {
                        _logger.info("possible missing field definition");
                        PreparedStatementWarning warning = new PreparedStatementWarning();
                        warning.setType("possible missing field definition");
                        warning.setBrokenReference(_curToken);
                        warning.setStartIndex(_buffer.length());
                        _warnings.add(warning);                        
                        _buffer.append(_curToken);                        
                    }
                    
                    return;
            }else{
                return;
            }
            _curIndex++;
        }
    }

    void prepare(){
        boolean comment_on = false;
        boolean string_on  = false;
        boolean gstring_on  = false;
        
        while(_curIndex<_sql.length()){
            char a = _sql.charAt(_curIndex);
            _curIndex++;
            
            
            if(!comment_on && a == '/' && _sql.length()> (_curIndex) && _sql.charAt(_curIndex) == '*'){
                comment_on = true;
                ++_curIndex;
            }
            else
            if(comment_on && a == '*' && _sql.length()> (_curIndex) && _sql.charAt(_curIndex) == '/'){
                comment_on = false;
                ++_curIndex;
            }
            else
            if(comment_on){
                continue;
            }   
            else
            if(!string_on && !gstring_on && a == '"'){
                string_on = true;
                _curToken += a;
                continue;
            }
            else
            if(string_on &&  a == '"'){
                string_on = false;
                _curToken += a;
                continue;
            }   
            else
            if(string_on){
                _curToken += a;
                continue;
            }    
            else
            if(!gstring_on &&!string_on && a == '\''){
                gstring_on = true;
                _curToken += a;
                continue;
            }
            else
            if(gstring_on &&  a == '\''){
                gstring_on = false;
                _curToken += a;
                continue;
            }   
            else
            if(gstring_on){
                _curToken += a;
                continue;
            }              
            else
            if(a == '_' || caller.getCrudEngine().getDataStatementUtil().isAlphaNumeric(a)){                
                _curToken += a;
            }
            else
            {//non-identifier token
                
                if(/*a == '@' ||*/ a == ':'){                    
                    _buffer.append(_curToken);
                    _curToken="";
                    parseParamReference(a);
                }
                else
                {
                    if(!_curToken.isEmpty())
                        setNewDataModelReferenceContext(false);
                    
                    _curToken = "";
                    _buffer.append(a);
                    if(a == '.' && isValidDataModelReferenceContext()){//field invocation
                        parseFieldInvocation();
                        resetDataModelReferenceContext();
                    }
                }
                _curToken = "";
            }
        }
    }
    
    public static PreparedDataStatement parse(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,String dataStatementId,String crudPath){

        
        StatementPreparer preparer = new StatementPreparer(tempCrudEngine,caller,arguments,dataStatementId,crudPath);
        if(preparer._dataStatement.getSqlCode() == null ||
           preparer._dataStatement.getSqlCode().trim().isEmpty())
            return null;
        
        preparer.prepare();
        
        PreparedDataStatement preparedStatement = new PreparedDataStatement();
        preparedStatement.setParameterList(preparer._parameterList);
        preparedStatement.setWarnings(preparer._warnings);
        preparedStatement.setExecutableSql(preparer._buffer.toString());
        
        return preparedStatement;
    }
}
