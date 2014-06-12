/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datastatement.bean;

import com.crudzilla.platform.bean.ExecutableDefinition;
import com.crudzilla.platform.datasource.bean.DataSource;

/**
 *
 * @author bitlooter
 */
public class DataStatement extends ExecutableDefinition{
    String dataSourceId;
    String sqlCode;
    String statementType;
    
    String resultSetTemplate;
    String preparedStatement;
    String preparedStatementParamList;
    String sqlDialect;
       
    DataSource dataSource;
    String dataSourcePath;
    
    String transactionPath;
    String transactionAction;
    String dataModelReferencePath;
    String sqlSrcPath;
    String resultSetProcessorPath;
    
    public String getPreparedStatement() {
        return preparedStatement;
    }

    public String getSqlCode() {
        return sqlCode;
    }

    public String getStatementType() {
        return statementType;
    }

    public void setPreparedStatement(String preparedStatement) {
        this.preparedStatement = preparedStatement;
    }

    public void setSqlCode(String sqlCode) {
        this.sqlCode = sqlCode;
    }

    public void setStatementType(String statementType) {
        this.statementType = statementType;
    }

    public String getPreparedStatementParamList() {
        return preparedStatementParamList;
    }

    public void setPreparedStatementParamList(String preparedStatementParamList) {
        this.preparedStatementParamList = preparedStatementParamList;
    }

    public String getResultSetTemplate() {
        return resultSetTemplate;
    }

    public void setResultSetTemplate(String resultSetTemplate) {
        this.resultSetTemplate = resultSetTemplate;
    }

    public String getDataSourceId() {
        return dataSourceId;
    }

    public void setDataSourceId(String dataSourceId) {
        this.dataSourceId = dataSourceId;
    }

    public DataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public String getSqlDialect() {
        return sqlDialect;
    }

    public void setSqlDialect(String sqlDialect) {
        this.sqlDialect = sqlDialect;
    }

    public String getDataSourcePath() {
        return dataSourcePath;
    }

    public void setDataSourcePath(String dataSourcePath) {
        this.dataSourcePath = dataSourcePath;
    }

    public String getTransactionAction() {
        return transactionAction;
    }

    public String getTransactionPath() {
        return transactionPath;
    }

    public void setTransactionAction(String transactionAction) {
        this.transactionAction = transactionAction;
    }

    public void setTransactionPath(String transactionPath) {
        this.transactionPath = transactionPath;
    }

    public String getDataModelReferencePath() {
        return dataModelReferencePath;
    }

    public void setDataModelReferencePath(String dataModelReferencePath) {
        this.dataModelReferencePath = dataModelReferencePath;
    }

    public String getSqlSrcPath() {
        return sqlSrcPath;
    }

    public void setSqlSrcPath(String sqlSrcPath) {
        this.sqlSrcPath = sqlSrcPath;
    }

    public String getResultSetProcessorPath() {
        return resultSetProcessorPath;
    }

    public void setResultSetProcessorPath(String resultSetProcessorPath) {
        this.resultSetProcessorPath = resultSetProcessorPath;
    }
}
