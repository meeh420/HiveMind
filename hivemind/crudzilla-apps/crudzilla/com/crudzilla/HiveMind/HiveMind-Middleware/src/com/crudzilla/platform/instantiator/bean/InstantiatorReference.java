/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.instantiator.bean;

import com.crudzilla.platform.bean.DefinitionExecutionParameter;
import com.crudzilla.platform.bean.ExecutableDefinitionReference;
import com.crudzilla.platform.invocation.Executable;
import com.crudzilla.platform.invocation.Invocation;
import net.sf.json.JSONObject;
/**
 *
 * @author bitlooter
 */
public class InstantiatorReference  extends ExecutableDefinitionReference{
    
    public InstantiatorReference(JSONObject refFile,Invocation caller){
        super(refFile,new Instantiator(),caller);        
    }    
    
    @Override
    public void onPostValidate(Executable caller){

    }
    public Instantiator getInstantiator() {
        return (Instantiator)definition;
    }

    public void setInstantiator(Instantiator instantiator) {
        this.definition = instantiator;
    }    
}
