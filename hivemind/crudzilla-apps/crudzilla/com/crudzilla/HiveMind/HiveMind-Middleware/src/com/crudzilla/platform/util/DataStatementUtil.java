/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

/**
 *
 * @author bitlooter
 */


import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.util.CrudzillaUtil;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.bean.Parameter;
import com.crudzilla.platform.dao.CoreDAO;
import com.crudzilla.platform.datamodel.bean.DataModel;
import com.crudzilla.platform.datamodel.bean.DataModelField;
import com.crudzilla.platform.datamodel.bean.DataModelFieldColumn;
import com.crudzilla.platform.datastatement.bean.*;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import com.crudzilla.platform.datasource.bean.DataSource;
import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.codec.binary.Base32;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.BinaryCodec;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class DataStatementUtil {
    //static Logger logger = Logger.getLogger(DataStatementUtil.class.getName());
    private Log logger = LogFactory.getLog(DataStatementUtil.class);
    
    public DataStatementUtil(){
        
    }
    
    boolean isAlpha(String a){        
        return org.apache.commons.lang.StringUtils.isAlpha(a);
    }
    
    boolean isAlphaNumeric(char a){
        return org.apache.commons.lang.StringUtils.isAlpha(""+a) || org.apache.commons.lang.StringUtils.isNumeric(""+a);
    }
    
    
    DataModel getDataModel(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,String name,java.util.List<DataModel> dataModels){
        if(dataModels != null){
            logger.info("number of referenced dataModels:"+dataModels.size());
            for(DataModel dataModel:dataModels){
                
                logger.info("looking for dataModel:"+dataModel.getName());
                //logger.info("name via DynaBean:"+dataModel.get("name"));
                dataModel.setUsingAlias(false);//reset
              
                if(dataModel.getName().compareTo(name) == 0){                    
                    return dataModel;
                }
                else
                if(dataModel.getAlias() != null && hasAlias(dataModel.getAlias(),name)){ 
                  logger.debug("setting alias "+name+" for "+dataModel.getName());
                  
                  dataModel.setActiveAlias(name);
                  dataModel.setUsingAlias(true);
                  return dataModel;                  
                }
            }
        }return null;
    }

    
    boolean hasAlias(String aliasList,String alias){
      String[] aliases = aliasList.split(",");
      
      for(String a : aliases){
        if(a.trim().compareTo(alias) == 0)
          return true;
      } return false;
    }
  
  
    DataModelField getDataModelFieldByAlias(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,String alias,java.util.List<DataModel> dataModels,String fieldName){
        if(dataModels != null){
            
            for(DataModel dataModel:dataModels){
                
                if(dataModel.getAlias() != null && hasAlias(dataModel.getAlias(),alias)){
                  
                    Map<DataModelField,DataModelFieldColumn> dataModelFieldColumns = caller.getCrudEngine().getDataStatementUtil().getDataModelFieldDataTableColumns(tempCrudEngine,caller,arguments,dataModel,fieldName);
                    if(dataModelFieldColumns != null/* && dataModelFieldColumns.size()>0*/){

                        for(DataModelField dataModelField: dataModelFieldColumns.keySet()){
                          
                            DataModelFieldColumn dataModelFieldColumn = dataModelFieldColumns.get(dataModelField);
                            dataModelField.setColumn(dataModelFieldColumn);
                            return dataModelField;
                        }
                        return null;//there is a field match but no column mapping
                    }
                }
            }
        }
      
        return null;
    }  
  
  
  
  
  
    Map<DataModelField,DataModelFieldColumn> getDataModelFieldDataTableColumns(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,DataModel dataModel,String name){
        logger.info("get field:"+name);    
        List<DataModelField> fields;
        
        if(name.compareTo("*") == 0){
            fields = dataModel.getFields();
        }
        else{
            fields = new ArrayList<DataModelField>();
            for(DataModelField field:dataModel.getFields()){
                if(field.getName().compareTo(name) == 0){                    
                    fields.add(field);
                    break;
                }
            }
        }
      
        //no field match
        if(fields.size() == 0)
          return null;
      
        
        Map<DataModelField,DataModelFieldColumn> fieldColumns = new HashMap<DataModelField,DataModelFieldColumn>();
        
        for(DataModelField field:fields)
        {
            DataModelFieldColumn fieldColumn = field.getColumn();
            if(fieldColumn != null){
                logger.info("field:"+name+" :"+dataModel.getName()+". get column("+fieldColumn.getName()+")");            
                
                fieldColumns.put(field, fieldColumn);
            }else{
                fieldColumns.put(field, null);
            }
        }
        return fieldColumns;
    }    
    
    DataModelFieldColumn getDataModelFieldDataTableColumn(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,DataModel dataModel,String name){
        logger.info("get field:"+name);
        
        
        DataModelField field = null;
        for(DataModelField f:dataModel.getFields()){
            if(f.getName().compareTo(name) == 0){                    
                field = f;
                break;
            }
        }        
        
        
        if(field != null){//field missing
            DataModelFieldColumn fieldColumn = field.getColumn();
            if(fieldColumn != null){
                logger.info("field:"+name+" :"+dataModel.getName()+". get column("+fieldColumn.getName()+")");            
                return fieldColumn;
            }
        }return null;
    }
    
    public String resolveToCrudPath(String crudPath,String relPath){
      if(relPath.trim().charAt(0) != '/'){
          String cp = crudPath;
          if(cp.lastIndexOf("/") != -1)
            cp = cp.substring(0,cp.lastIndexOf("/"));
          else
            cp = "";
          
          try{
            cp = new File("/"+cp+"/"+relPath).getCanonicalPath();
          }catch(Exception ex){}
          
          return cp;
      }
      return relPath;
    }
   
    
    public List<DataStatementResultSetMap> getResultSetModel(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,String dataStatementId){
        
        DataStatement dataStatement = CoreDAO.getDataStatement(caller,arguments, dataStatementId);
        
        /**LazyDynaBean typeDefinition = (LazyDynaBean)tempCrudEngine.execute(arguments.get("getTypeDefinition").toString(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments),true,null);//(LazyDynaBean)caller.call(arguments.get("getTypeDefinition").toString());*/
        //LazyDynaBean typeDefinition = (LazyDynaBean)caller.using(tempCrudEngine).call(arguments.get("getTypeDefinition").toString(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments));
      
        //some hairy ideas that have yet to fully implemented
        //dataStatement.setCrudType((String)typeDefinition.get("crudType"));
        //dataStatement.setImplementorPath(/*(String)typeDefinition.get("implementorPath")*/"");
        //dataStatement.setImplementorRefType((String)typeDefinition.get("implementorRefType"));
        //dataStatement.setInitializerPath((String)typeDefinition.get("initializerPath"));
        //dataStatement.setPostValidateHandlerPath((String)typeDefinition.get("postValidateHandlerPath"));          
        
        String crudPath = caller.getArguments().get("crudPath").toString();    
        
        //get all database columns that could be references in this datastatement via datamodel references
        Map<String,DataModelField> columnFields = new HashMap<String,DataModelField>();
        
            
        Map<String,Object> args = CrudzillaUtil.newArgumentMap(tempCrudEngine,caller.getArguments());
        
        args.put("crudzillaResultSetFormat", "decorated");
        args.put("crudzillaCompile", "yes");
        args.put("crudzillaJavaLangClass", null);
        dataStatement.setResultSetTemplate("");
        
        
        String dataSourcePath = resolveToCrudPath(crudPath,dataStatement.getDataSourcePath());
        
        /*LazyDynaBean dataSourceBean = (LazyDynaBean)tempCrudEngine.execute(dataSourcePath, CrudzillaUtil.newArgumentMap(tempCrudEngine,caller.getArguments()),true, null);*/
        LazyDynaBean dataSourceBean = (LazyDynaBean)caller.using(tempCrudEngine).call(dataSourcePath, CrudzillaUtil.newArgumentMap(tempCrudEngine,caller.getArguments()));
        DataSource dataSource = new DataSource();            
        dataSource.setConfig(dataSourceBean);      
        dataStatement.setDataSource(dataSource);
      
        //create the crud programmatically
        ExecutableDefinitionReference ref = new DataStatementReference(dataStatement,(Executable)caller);
        
        //get path to platform module
        String platformModule             = caller.getCrudEngine().sysSettings().get("crudzilla_platform_module").toString();
        
        //get crud type defintions
        Map crudTypes 				      = (Map)caller.using(platformModule).call("/crud-types/types.ins");
        
        //type definition for this crud
        LazyDynaBean crudTypeDefinition   = ((LazyDynaBean)crudTypes.get("datastatement"));
        
        ref.setTypeDefinition(crudTypeDefinition);

      
        //establish a base path for executing this crud, all relative crud calls will
        //be resolved relative to this base path
        ref.setBasePath(crudPath);      
     
        
        if(dataStatement.getDataModelReferencePath() != null && !dataStatement.getDataModelReferencePath().isEmpty()){
          
            String cp = resolveToCrudPath(crudPath,dataStatement.getDataModelReferencePath());
            //List<DataModel> dataModels = (List<DataModel>) caller.call(cp,arguments);
			/*List<DataModel> dataModels = (List<DataModel>)tempCrudEngine.execute(cp,CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments),true,null);*/
            List<DataModel> dataModels = (List<DataModel>)caller.using(tempCrudEngine).call(cp,CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments));
            
            for(DataModel dataModel:dataModels){
                List<DataModelField> fields = dataModel.getFields();
                for(DataModelField field:fields){
                    DataModelFieldColumn fieldColumn = field.getColumn();                
                    if(fieldColumn != null)
                        columnFields.put(fieldColumn.getName(), field);
                }
            }
        }
        
        String[] parameterReferenceList = dataStatement.getPreparedStatementParamList().length()>0?dataStatement.getPreparedStatementParamList().split(","):new String[0];
        
        List<Parameter> parameters = CoreDAO.getExecutionParameters(caller,arguments, dataStatementId);
      
        Object[] dbArgs = new Object[parameterReferenceList.length];
        //*** PASSING EMPTY STRING VS NULL, NEEDS FURTHER INVESTIGATION
        for(int i=0;i<parameterReferenceList.length;i++){
            String param = parameterReferenceList[i];
            String paramType = null;
            String paramName;
            if(param.indexOf("(") != -1){//there is a type hint
                paramName = param.split("\\(")[0];
                paramType = param.split("\\(")[1].split("\\)")[0];
            }
            else
               paramName = param; 
            
          
            for(Parameter p : parameters){
              if(p.getName().compareTo(paramName) == 0 && p.getDefaultValue() != null)
              {
                /*caller.getArguments()*/args.put(paramName, getTypedValue(paramName,
                                                                   p.getType(),
                                                                   p.getDefaultValue(),
                                                                   null,
                                                                   null));
                paramType = null;
                break;
              }
            }
          
            if(paramType != null)
                /*caller.getArguments()*/args.put(paramName, getTypedValueDefault(paramType));
        }
            
        //replace parameter references with ?
        //for(int i=0;i<parameterReferenceList.length;i++){
        //    ExecutionParameter parameter = DataStatementDAO.getExecutionParameter(userName, dataStatementId, parameterReferenceList[i]);
            //preparedStatement = preparedStatement.replaceFirst("@"+parameterReferenceList[i], "?");
            //dbArgs[i] = parameter.getType().compareTo("string")==0?arguments.get(parameterReferenceList[i]);
        //}
        

         
         caller.logger().info("running getResultSetModel:"+crudPath);
         //HashMap resultSetMeta = (HashMap)caller.call(ref,caller.getArguments());
         /*HashMap resultSetMeta = (HashMap)tempCrudEngine.execute(ref,args,true, null);*/
         HashMap resultSetMeta = (HashMap)caller.using(tempCrudEngine).call(ref,args);
         
         
         List<String> columns = (List<String>)resultSetMeta.get("columns");
         
         caller.getArguments().remove("crudzillaResultSetFormat");
         
         if(columns != null){
            
            List<DataStatementResultSetMap> columnMappings = new ArrayList<DataStatementResultSetMap>();
            for(String columnName:columns){
                DataStatementResultSetMap columnMap = new DataStatementResultSetMap();
                DataModelField field = columnFields.get(columnName);

                columnMap.setColumnName(columnName);
                columnMap.setField(field);
                columnMappings.add(columnMap);
            }return columnMappings;
         }
         return null;
    }

    
    byte[] getBinary(String paramName,String type,Object val,java.sql.Connection conn,Map<String,Object> arguments){
            try
            {
                String binaryFormat = "base64";
                if(arguments.get("crudzilla_binary_format_"+paramName) != null)//get formatting information
                    binaryFormat = arguments.get("crudzilla_binary_format_"+paramName).toString();

                if(binaryFormat.compareToIgnoreCase("base64") == 0){
                    String lineLength = (String)arguments.get("crudzilla_base64_format_"+paramName+"_linelength");
                    String lineSeparator = (String)arguments.get("crudzilla_base64_format_"+paramName+"_lineseparator");
                    String urlSafe = (String)arguments.get("crudzilla_binary_base64_"+paramName+"_urlsafe");


                    if(lineLength == null && lineSeparator == null && urlSafe == null)
                        return new Base64().decode(val.toString());
                    if(lineLength != null && lineSeparator != null)
                        return new Base64(Integer.parseInt(lineLength),new Base64().decode(lineSeparator)).decode(val.toString());
                    if(lineLength != null)
                        return new Base64(Integer.parseInt(lineLength)).decode(val.toString());
                }
                if(binaryFormat.compareToIgnoreCase("base32") == 0){
                    String lineLength = (String)arguments.get("crudzilla_base32_format_"+paramName+"_linelength");
                    String lineSeparator = (String)arguments.get("crudzilla_base32_format_"+paramName+"_lineseparator");
                    String urlSafe = (String)arguments.get("crudzilla_base32_format_"+paramName+"_urlsafe");


                    if(lineLength == null && lineSeparator == null && urlSafe == null)
                        return new Base32().decode(val.toString());
                    if(lineLength != null && lineSeparator != null)
                        return new Base32(Integer.parseInt(lineLength),new Base32().decode(lineSeparator)).decode(val.toString());
                    if(lineLength != null)
                        return new Base32(Integer.parseInt(lineLength)).decode(val.toString());
                }            

                if(binaryFormat.compareToIgnoreCase("binary") == 0)
                    return new BinaryCodec().decode(val.toString().getBytes()); 
                
                String charSet = (String)arguments.get("crudzilla_hex_format_"+paramName+"_charset");
                if(charSet != null)
                    return new Hex(charSet).decode(val.toString().getBytes());
                else
                    return new Hex().decode(val.toString().getBytes());
            }
            catch(Exception e){
            
            }
            
            return null;
    }
    
    Object getTypedValueDefault(String type){        
        if(type.compareToIgnoreCase("char") == 0 || 
        type.compareToIgnoreCase("varchar") == 0 || 
        type.compareToIgnoreCase("LONGVARCHAR") == 0 ||
        type.compareToIgnoreCase("string") == 0)
            return "";


        if(type.compareToIgnoreCase("NUMERIC") == 0 || 
        type.compareToIgnoreCase("BigDecimal") == 0)
            return -1;

        if(type.compareToIgnoreCase("BIT") == 0 || 
        type.compareToIgnoreCase("boolean") == 0){
            return false;
        }
        if(type.compareToIgnoreCase("TINYINT") == 0 || 
        type.compareToIgnoreCase("byte") == 0){
            return 0;
        } 
        if(type.compareToIgnoreCase("SMALLINT") == 0 || 
        type.compareToIgnoreCase("short") == 0){
            return 0;
        }    
        if(type.compareToIgnoreCase("INTEGER") == 0 || 
        type.compareToIgnoreCase("int") == 0){
            return 0;
        }  
        if(type.compareToIgnoreCase("BIGINT") == 0 || 
        type.compareToIgnoreCase("long") == 0){
            return 0;
        }     
        if(type.compareToIgnoreCase("REAL") == 0 || 
        type.compareToIgnoreCase("float") == 0){
            return 0;
        } 
        if(type.compareToIgnoreCase("DOUBLE") == 0){
            return 0;
        }   

        if(type.compareToIgnoreCase("CLOB") == 0)
            return "";


        if(type.compareToIgnoreCase("BLOB") == 0)
            return "0x0";


        if(type.compareToIgnoreCase("BINARY") == 0 ||
        type.compareToIgnoreCase("VARBINARY") == 0 ||
        type.compareToIgnoreCase("LONGVARBINARY") == 0)//this most likely needs to be read from file
            return "0x0";

        if(type.compareToIgnoreCase("DATE") == 0)
            return 0;


        if(type.compareToIgnoreCase("TIME") == 0)            
            return 0;            


        if(type.compareToIgnoreCase("TIMESTAMP") == 0)
            return 0;

        return null;
    }
    
    Object getTypedValue(String paramName,String type,Object val,java.sql.Connection conn,Map<String,Object> arguments){
 

        if(type.compareToIgnoreCase("CLOB") == 0){
            
            if(val != null){
                byte[] binData = this.getBinary(paramName, type, val, conn, arguments);
                try
                {
                    Clob myClob = conn.createClob();
                    IOUtils.write(binData, myClob.setCharacterStream(1));
                    return myClob;
                }catch(Exception e){}
            }
            else            
            if(arguments.get("crudzilla_multipart_files") != null){//see if there is a file that corresponds
                Map<String,Object>  files = (Map)arguments.get("crudzilla_multipart_files");
                org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem)files.get(paramName);
                if(item != null){
                    try
                    {
                        Clob myClob = conn.createClob();
                        Writer clobWriter = myClob.setCharacterStream(1);
        
                        BufferedReader br = new BufferedReader(new InputStreamReader(item.getInputStream()));
                        String nextLine;
                        while ((nextLine = br.readLine()) != null) {
                            clobWriter.write(nextLine);
                        }
                        
                        return myClob;
                    }catch(Exception e){}
                }
            }
        }      
        
        if(type.compareToIgnoreCase("BLOB") == 0){
            if(val != null){
                byte[] binData = this.getBinary(paramName, type, val, conn, arguments);
                try
                {
                    Blob myBlob = conn.createBlob();
                    IOUtils.write(binData, myBlob.setBinaryStream(1));
                    return myBlob;
                }catch(Exception e){}
            }
            else
            if(arguments.get("crudzilla_multipart_files") != null){//see if there is a file that corresponds
                Map<String,Object>  files = (Map)arguments.get("crudzilla_multipart_files");
                org.apache.commons.fileupload.FileItem item = (org.apache.commons.fileupload.FileItem)files.get(paramName);
                if(item != null){
                    try
                    {
                        Blob myBlob = conn.createBlob();
                        IOUtils.copy(item.getInputStream(), myBlob.setBinaryStream(1));                        
                        return myBlob;
                    }catch(Exception e){}
                }
            }
        }
        
        if(val == null)return val;
        
        
        if(type.compareToIgnoreCase("char") == 0 || 
           type.compareToIgnoreCase("varchar") == 0 || 
           type.compareToIgnoreCase("LONGVARCHAR") == 0 ||
           type.compareToIgnoreCase("string") == 0){
            return val.toString();
        }
        
        if(type.compareToIgnoreCase("NUMERIC") == 0 || 
           type.compareToIgnoreCase("BigDecimal") == 0){
            return new java.math.BigDecimal(val.toString().toCharArray());
        }    
        if(type.compareToIgnoreCase("BIT") == 0 || 
           type.compareToIgnoreCase("boolean") == 0){
            return Boolean.parseBoolean(val.toString());
        }
        if(type.compareToIgnoreCase("TINYINT") == 0 || 
           type.compareToIgnoreCase("byte") == 0){
            return (byte)Integer.parseInt(val.toString());
        } 
        if(type.compareToIgnoreCase("SMALLINT") == 0 || 
           type.compareToIgnoreCase("short") == 0){
            return (short)Integer.parseInt(val.toString());
        }    
        if(type.compareToIgnoreCase("INTEGER") == 0 || 
           type.compareToIgnoreCase("int") == 0){
            return Integer.parseInt(val.toString());
        }  
        if(type.compareToIgnoreCase("BIGINT") == 0 || 
           type.compareToIgnoreCase("long") == 0){
            return (long)Long.parseLong(val.toString());
        }     
        if(type.compareToIgnoreCase("REAL") == 0 || 
           type.compareToIgnoreCase("float") == 0){
            return Float.parseFloat(val.toString());
        } 
        if(type.compareToIgnoreCase("DOUBLE") == 0){
            return Double.parseDouble(val.toString());
        }  
        
        if(type.compareToIgnoreCase("BINARY") == 0 ||
           type.compareToIgnoreCase("VARBINARY") == 0 ||
           type.compareToIgnoreCase("LONGVARBINARY") == 0){//this most likely needs to be read from file
            byte[] binData = this.getBinary(paramName, type, val, conn, arguments);
            if(binData != null)return binData;
        }
        if(type.compareToIgnoreCase("DATE") == 0){
            
            try{
                return new java.sql.Date(Long.parseLong(val.toString()));
            }catch(Exception e){}
            
            try{
                if(arguments.get("crudzilla_date_format_"+paramName) != null){
                    return new java.sql.Date(new SimpleDateFormat(arguments.get("crudzilla_date_format_"+paramName).toString()).parse(val.toString()).getTime());
                }
                else{//assume
                    return new java.sql.Date(new SimpleDateFormat().parse(val.toString()).getTime());
                }
            }catch(Exception e){}
            return val;
        }          
        if(type.compareToIgnoreCase("TIME") == 0){
            
            try{
                return new java.sql.Time(Long.parseLong(val.toString()));
            }catch(Exception e){}
            
            try{
                if(arguments.get("crudzilla_time_format_"+paramName) != null){
                    return new java.sql.Time(new SimpleDateFormat(arguments.get("crudzilla_time_format_"+paramName).toString()).parse(val.toString()).getTime());
                }
                else{//assume
                    return new java.sql.Time(new SimpleDateFormat().parse(val.toString()).getTime());
                }
            }catch(Exception e){}
            
            return val;            
        }
        
        if(type.compareToIgnoreCase("TIMESTAMP") == 0){
            
            try{
                return new java.sql.Timestamp(Long.parseLong(val.toString()));
            }catch(Exception e){}
            
            try{
                if(arguments.get("crudzilla_timestamp_format_"+paramName) != null){
                    return new java.sql.Timestamp(new SimpleDateFormat(arguments.get("crudzilla_timestamp_format_"+paramName).toString()).parse(val.toString()).getTime());
                }
                else{//assume
                    return new java.sql.Timestamp(new SimpleDateFormat().parse(val.toString()).getTime());
                }
            }catch(Exception e){}
            
            return val;            
        }        
        return val;
    }
    
    public ExecutablePreparedDataStatement makeExecutableStatement(DataStatementReference ref,java.sql.Connection conn, Map<String,/*--String*/Object> arguments,Executable caller){
        
        
      	boolean doLog = true;//arguments.get("crudzilla_do_log") != null? Boolean.parseBoolean(arguments.get("crudzilla_do_log").toString()):false;
        String[] parameterReferenceList = {};
        int argCount = 0;
        
        if(ref.getDataStatement().getPreparedStatementParamList() != null && !ref.getDataStatement().getPreparedStatementParamList().isEmpty()){
            parameterReferenceList = ref.getDataStatement().getPreparedStatementParamList().split(",");
            argCount = parameterReferenceList.length;
        }
        
        Object[] dbArgs = new Object[argCount];
        //replace parameter references with ?
        for(int i=0;i<argCount;i++){
            
            //ExecutionParameter parameter = DataStatementDAO.getExecutionParameter(userName, dataStatementId, parameterReferenceList[i]);
            //preparedStatement = preparedStatement.replaceFirst("@"+parameterReferenceList[i], "?");
            //treat special parameters
            /*--if(parameterReferenceList[i].compareTo("arguments_next_insert_id") == 0 ||
               parameterReferenceList[i].compareTo("crudzilla_next_insert_id") == 0){
                String lastUUID = java.util.UUID.randomUUID().toString();
                dbArgs[i] = lastUUID;
                arguments.put("arguments_last_insert_id",lastUUID);
                arguments.put("crudzilla_last_insert_id",lastUUID);
            }
            else
            if(parameterReferenceList[i].compareTo("crudzilla_current_timestamp") == 0){
                dbArgs[i] = ""+(new java.util.Date().getTime());
                arguments.put("crudzilla_current_timestamp",dbArgs[i]);
            }            
            else            
            dbArgs[i] = arguments.get(parameterReferenceList[i]);
            */
            String param = parameterReferenceList[i];
            String paramType = null;
            String paramName;
            if(param.indexOf("(") != -1){//there is type hint
                paramName = param.split("\\(")[0];
                paramType = param.split("\\(")[1].split("\\)")[0];
            }
            else
               paramName = param;
            
            dbArgs[i] = CrudzillaUtil.getArgumentValue(paramName, arguments,"expression",null,caller);
            if(paramType != null)
                dbArgs[i] = getTypedValue(paramName,paramType,dbArgs[i],conn,arguments);
          
            if(doLog)
            	logger.info("setting argument("+paramName+","+dbArgs[i]+")");
        }
        ExecutablePreparedDataStatement executableDataStatement = new ExecutablePreparedDataStatement();
        executableDataStatement.setDataStatement(ref.getDataStatement());
        executableDataStatement.setArguments(dbArgs);
        
        /*
        for(ExecutionParameter param:parameters){
            
            
            
            
            
            String argument = arguments.get(param.getName());
            if(argument != null){
                preparedStatement = preparedStatement.replaceAll("@"+param.getName(), argument);
            }
        }
        */
        return executableDataStatement;
    }
            
    public String replaceParameterReferences(Crudzilla tempCrudEngine,Invocation caller,Map<String,Object> arguments,String dataStatementId){
        DataStatement dataStatement = CoreDAO.getDataStatement(caller,arguments, dataStatementId);
      
        /*LazyDynaBean typeDefinition = (LazyDynaBean)tempCrudEngine.execute(arguments.get("getTypeDefinition").toString(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments),true,null);//(LazyDynaBean)caller.call(arguments.get("getTypeDefinition").toString());*/
        LazyDynaBean typeDefinition = (LazyDynaBean)caller.using(tempCrudEngine).call(arguments.get("getTypeDefinition").toString(),CrudzillaUtil.newArgumentMap(tempCrudEngine,arguments));
      
        dataStatement.setCrudType((String)typeDefinition.get("crudType"));
        dataStatement.setImplementorPath((String)typeDefinition.get("implementorPath"));
        dataStatement.setImplementorRefType((String)typeDefinition.get("implementorRefType"));
        dataStatement.setInitializerPath((String)typeDefinition.get("initializerPath"));
        dataStatement.setPostValidateHandlerPath((String)typeDefinition.get("postValidateHandlerPath"));          
        
        
        String preparedStatement = dataStatement.getPreparedStatement();
        String[] parameterReferenceList = dataStatement.getPreparedStatementParamList().split(",");
        
        Object[] dbArgs = new Object[parameterReferenceList.length];
        //replace parameter references with ?
        for(int i=0;i<parameterReferenceList.length;i++){
            //ExecutionParameter parameter = DataStatementDAO.getExecutionParameter(userName, dataStatementId, parameterReferenceList[i]);
            preparedStatement = preparedStatement.replaceFirst("@"+parameterReferenceList[i], "?");
        }       
        ExecutablePreparedDataStatement executableDataStatement = new ExecutablePreparedDataStatement();
        executableDataStatement.setDataStatement(dataStatement);
        executableDataStatement.setArguments(dbArgs);
        return preparedStatement;
    }    
    
    
    
    public void compileDataStatement(Invocation caller,Map<String,Object> arguments,String dataStatementId){
        
        String crudPath = caller.getArguments().get("crudPath").toString();
        
		String crudAppPath = caller.getArguments().get("crudAppPath").toString();
        String assetBaseDir = "";
      	
        try{
          assetBaseDir = (new File(caller.appBaseDir()+"/"+caller.getCrudEngine().sysSettings().get("crudzilla_asset_base")).getCanonicalPath());
        }catch(Exception ex){}
      
        String module = assetBaseDir+"/"+crudAppPath.substring(0,crudAppPath.lastIndexOf("/"));
      
      	Crudzilla tempCrudEngine = caller.using(module).getActiveCrudModule();
      	caller.setActiveCrudModule(null);//modules should only be active per call and die afterwards.
        /*
      	if(caller.getCrudEngine().sysSettings().get(crudAppPath) != null)
          tempCrudEngine = (Crudzilla)caller.getCrudEngine().sysSettings().get(crudAppPath);
      	else
		  tempCrudEngine = new Crudzilla(assetBaseDir+"/"+crudAppPath);
        */
      
      
      	//cache for performance
        //caller.getCrudEngine().sysSettings().set(crudAppPath,tempCrudEngine);
      
        String preparedStm = "";
        PreparedDataStatement preparedStatement = StatementPreparer.parse(tempCrudEngine,caller,arguments,dataStatementId,crudPath);
        if(preparedStatement != null)
            preparedStm = preparedStatement.getExecutableSql();
        
        
        boolean first = true;
        String paramList = "";
        if(preparedStatement != null){
            for(String param:preparedStatement.getParameterList()){
                paramList += (!first?",":"")+param;
                first = false;
            }
        }
      
        
        //update prepared statement
        CoreDAO.updateDataStatement(caller,arguments,dataStatementId, preparedStm, paramList);
        
        //get resultset structure
        //remove all current mappings
        //CoreDAO.deleteDataStatementResultSetMaps(caller,arguments,dataStatementId);
                
        //determine new resultset model, this would be used for select
        String resultSetTemplate = "{";
        first = true;
        List<DataStatementResultSetMap> resultSetModel = getResultSetModel(tempCrudEngine,caller,arguments,dataStatementId);
        if(resultSetModel != null){
            
            for(DataStatementResultSetMap fieldColumnMap:resultSetModel){
                
                if(fieldColumnMap.getField() != null){
                    resultSetTemplate += (!first?",":"")+"\""+fieldColumnMap.getField().getName()+"\":@"+fieldColumnMap.getColumnName();
                    //CoreDAO.addDataStatementResultSetMap(caller,arguments,dataStatementId,fieldColumnMap.getColumnName(), fieldColumnMap.getField().getName());
                }
                else{
                    resultSetTemplate += (!first?",":"")+"\""+fieldColumnMap.getColumnName()+"\":@"+fieldColumnMap.getColumnName();
                    //CoreDAO.addDataStatementResultSetMap(caller,arguments,dataStatementId,fieldColumnMap.getColumnName(), fieldColumnMap.getColumnName());
                }
                first = false;
            }
        }
        resultSetTemplate += "}";
        
        CoreDAO.updateDataStatement(caller,arguments,dataStatementId,resultSetTemplate);
    } 
    
}
