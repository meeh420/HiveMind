/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.scriptexecutor.bean;

import com.crudzilla.platform.bean.TopoSortable;

/**
 *
 * @author bitlooter
 */
public class ScriptStatement extends TopoSortable{
    String scriptExecutorId;
    String type;
    String invokedBy;
    String preSibling;
    String loopOperand;
    String loopFrom; 
    String loopTo; 
    String loopStepIncrement; 
    String assignmentLeft; 
    String assignmentRight; 
    String removeMapEntryOperand; 
    String commentText; 
    String invokePath; 
    String invokeReturnVal; 
    String ifOperand; 
    String explodeMapName; 
    String explodeMapEntryList;
    String returnVal;
    String removeVariableName;
    String jexlCode;
    
    public ScriptStatement(){
        super();
    }
    
    public ScriptStatement(TopoSortable ts){
        super(ts);
    }
    
    public String getAssignmentLeft() {
        return assignmentLeft;
    }

    public String getAssignmentRight() {
        return assignmentRight;
    }

    public String getCommentText() {
        return commentText;
    }

    public String getExplodeMapEntryList() {
        return explodeMapEntryList;
    }

    public String getExplodeMapName() {
        return explodeMapName;
    }

    public String getIfOperand() {
        return ifOperand;
    }

    public String getInvokePath() {
        return invokePath;
    }

    public String getInvokeReturnVal() {
        return invokeReturnVal;
    }

    public String getInvokedBy() {
        return invokedBy;
    }

    public String getLoopFrom() {
        return loopFrom;
    }

    public String getLoopOperand() {
        return loopOperand;
    }

    public String getLoopStepIncrement() {
        return loopStepIncrement;
    }

    public String getLoopTo() {
        return loopTo;
    }

    public String getRemoveMapEntryOperand() {
        return removeMapEntryOperand;
    }

    public String getReturnVal() {
        return returnVal;
    }

    public String getScriptExecutorId() {
        return scriptExecutorId;
    }

    public String getType() {
        return type;
    }

    public void setAssignmentLeft(String assignmentLeft) {
        this.assignmentLeft = assignmentLeft;
    }

    public void setAssignmentRight(String assignmentRight) {
        this.assignmentRight = assignmentRight;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public void setExplodeMapEntryList(String explodeMapEntryList) {
        this.explodeMapEntryList = explodeMapEntryList;
    }

    public void setExplodeMapName(String explodeMapName) {
        this.explodeMapName = explodeMapName;
    }

    public void setIfOperand(String ifOperand) {
        this.ifOperand = ifOperand;
    }

    public void setInvokePath(String invokePath) {
        this.invokePath = invokePath;
    }

    public void setInvokeReturnVal(String invokeReturnVal) {
        this.invokeReturnVal = invokeReturnVal;
    }

    public void setInvokedBy(String invokedBy) {
        this.invokedBy = invokedBy;
    }

    public void setLoopFrom(String loopFrom) {
        this.loopFrom = loopFrom;
    }

    public void setLoopOperand(String loopOperand) {
        this.loopOperand = loopOperand;
    }

    public void setLoopStepIncrement(String loopStepIncrement) {
        this.loopStepIncrement = loopStepIncrement;
    }

    public void setLoopTo(String loopTo) {
        this.loopTo = loopTo;
    }

    public void setRemoveMapEntryOperand(String removeMapEntryOperand) {
        this.removeMapEntryOperand = removeMapEntryOperand;
    }

    public void setReturnVal(String returnVal) {
        this.returnVal = returnVal;
    }

    public void setScriptExecutorId(String scriptExecutorId) {
        this.scriptExecutorId = scriptExecutorId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRemoveVariableName() {
        return removeVariableName;
    }

    public void setRemoveVariableName(String removeVariableName) {
        this.removeVariableName = removeVariableName;
    }
    
    @Override
    public String getParentId(){
        return this.invokedBy;
    }
    
    @Override
    public void setParentId(String parent){
        this.invokedBy = parent;
    }

    @Override
    public String getPreSiblingId() {
        return preSibling;
    }

    @Override
    public void setPreSiblingId(String preSibling) {
        this.preSibling = preSibling;
    }    
    
    public void setJexlCode(String jexlCode){
        this.jexlCode = jexlCode;
    }
    
    public String getJexlCode(){
        return jexlCode;
    }
}
