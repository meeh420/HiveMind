package com.crudzilla.platform.scriptexecutor.bean;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.invocation.Invocation;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.script.CompiledScript;
import net.sf.json.JSONObject;

/**
 *
 * @author bitlooter
 */
public class ScriptExecutorReference extends ExecutableDefinitionReference{
    List<ScriptStatement> scriptStatements ;
    CompiledScript compiledScript;
    
    public ScriptExecutorReference(JSONObject refFile,Invocation caller){
        super(refFile,new ScriptExecutor(),caller);        
        if(refFile.has("definition")){
            JSONObject definitionJSON = refFile.getJSONObject("definition");
            ((ScriptExecutor)definition).setName(StringOrNull(definitionJSON.get("name")));
            ((ScriptExecutor)definition).setType(StringOrNull(definitionJSON.get("type")));
            ((ScriptExecutor)definition).setCode(StringOrNull(definitionJSON.get("code")));
        }
    }

    public ScriptExecutor getScriptExecutor() {
        return (ScriptExecutor)definition;
    }

    public void setScriptExecutor(ScriptExecutor scriptExecutor) {
        this.definition = scriptExecutor;
    }

    public CompiledScript getCompiledScript() {
        return compiledScript;
    }

    public void setCompiledScript(CompiledScript compiledScript) {
        this.compiledScript = compiledScript;
    }
}
