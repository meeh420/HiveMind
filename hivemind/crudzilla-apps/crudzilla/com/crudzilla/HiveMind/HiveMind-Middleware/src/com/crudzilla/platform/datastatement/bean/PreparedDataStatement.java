/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.datastatement.bean;

import java.util.List;

/**
 *
 * @author bitlooter
 */
public class PreparedDataStatement {
    String dataStatementId;
    String executableSql;
    java.util.List<String> parameterList;
    java.util.List<PreparedStatementWarning> warnings;

    public String getDataStatementId() {
        return dataStatementId;
    }

    public String getExecutableSql() {
        return executableSql;
    }

    public void setDataStatementId(String dataStatementId) {
        this.dataStatementId = dataStatementId;
    }

    public void setExecutableSql(String executableSql) {
        this.executableSql = executableSql;
    }

    public List<String> getParameterList() {
        return parameterList;
    }

    public void setParameterList(List<String> parameterList) {
        this.parameterList = parameterList;
    }

    public List<PreparedStatementWarning> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<PreparedStatementWarning> warnings) {
        this.warnings = warnings;
    }
}
