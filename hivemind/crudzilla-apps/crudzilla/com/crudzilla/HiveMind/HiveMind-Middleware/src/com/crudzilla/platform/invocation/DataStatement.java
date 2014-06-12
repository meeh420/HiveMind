/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.invocation;

import com.crudzilla.db.DBManager;
import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.datastatement.bean.DataStatementReference;
import com.crudzilla.platform.datastatement.bean.ExecutablePreparedDataStatement;
import com.crudzilla.platform.util.CrudzillaUtil;
import java.io.File;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;
import org.apache.commons.beanutils.LazyDynaBean;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
/**
 *
 * @author bitlooter
 */
public class DataStatement extends Executable{
    //static Logger       _logger = Logger.getLogger(DataStatement.class.getName());
    private Log _logger = LogFactory.getLog(DataStatement.class);
    
    public DataStatement(){
        
    }
    
    public DataStatement(String resourcePath,Map<String,Object> arguments,HttpServletRequest request,HttpServletResponse response,boolean serverSide,Invocation caller,Crudzilla crudEngine){
        super(resourcePath,arguments,request,response,serverSide,caller,crudEngine);
    }
         
    
    @Override
    public Object execute() throws Exception{
        Map returnVal;

        try
        {
           
            File file = CrudzillaUtil.getCrudFile(_crudEngine,getResourcePath());
            if(_crudEngine.crudCache.get(file.getCanonicalPath()) == null){
              
                JSONObject crudExecutable = (JSONObject)getCrudExecutable();
                if(crudExecutable.has("type_definition"))
                    return super.execute();
                
                ExecutableDefinitionReference ref = new DataStatementReference(crudExecutable,this);
                _crudEngine.crudCache.put(file.getCanonicalPath(),ref);
                return run(ref);
            }
            else
            {
                return run(_crudEngine.crudCache.get(file.getCanonicalPath()));
            }
        }catch(Exception ex){
            _logger.error("Error occured processing "+getResourcePath()+" exception:"+ex.getMessage(),ex);
            returnVal = new HashMap();
            returnVal.put("crudzilla_status", "error");
            throw ex;
        }        
        //return returnVal;
    }

}
