/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.scriptexecutor.bean;

import com.crudzilla.platform.bean.ExecutableDefinition;
import java.util.List;

/**
 *
 * @author bitlooter
 */
public class ScriptExecutor  extends ExecutableDefinition{

    String type;
    String enabled;
    String code;
    List<ScriptStatement> scriptStatements ;
    
    public String getCode() {
        return code;
    }

    public String getEnabled() {
        return enabled;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public void setEnabled(String enabled) {
        this.enabled = enabled;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<ScriptStatement> getScriptStatements() {
        return scriptStatements;
    }

    public void setScriptStatements(List<ScriptStatement> scriptStatements) {
        this.scriptStatements = scriptStatements;
    }
}
