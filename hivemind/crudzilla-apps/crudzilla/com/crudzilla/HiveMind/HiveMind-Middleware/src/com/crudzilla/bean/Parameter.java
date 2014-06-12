/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.bean;

/**
 *
 * @author bitlooter
 */
public class Parameter {
    String id;
    String required;
    String isFinal;
    String name;
    String type;
    String validationRegEx;
    String defaultValue;
    String maxLength;
    String minLength;
    String lineEndLength;
    String maxRange;
    String minRange;
    String dateFormat;
    String dateFormatStrict;
    String allowallschemesForURL;
    String allow2slashesForURL;
    String nofragmentsForURL;
    String schemesForURL;
    String evalLeft;
    String evalRight;
    String keepAliveCount;
    //Object computedValue;
    String validatorPath;
    String position;
    
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRequired() {
        return required;
    }

    public String getType() {
        return type;
    }

    public String getValidationRegEx() {
        return validationRegEx;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRequired(String required) {
        this.required = required;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setValidationRegEx(String validationRegEx) {
        this.validationRegEx = validationRegEx;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getAllow2slashesForURL() {
        return allow2slashesForURL;
    }

    public String getAllowallschemesForURL() {
        return allowallschemesForURL;
    }

    public String getDateFormatStrict() {
        return dateFormatStrict;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public String getMaxLength() {
        return maxLength;
    }

    public String getMaxRange() {
        return maxRange;
    }

    public String getMinLength() {
        return minLength;
    }

    public String getMinRange() {
        return minRange;
    }

    public String getNofragmentsForURL() {
        return nofragmentsForURL;
    }

    public String getSchemesForURL() {
        return schemesForURL;
    }

    public void setAllow2slashesForURL(String allow2slashesForURL) {
        this.allow2slashesForURL = allow2slashesForURL;
    }

    public void setAllowallschemesForURL(String allowallschemesForURL) {
        this.allowallschemesForURL = allowallschemesForURL;
    }

    public void setDateFormatStrict(String dateFormatStrict) {
        this.dateFormatStrict = dateFormatStrict;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public void setMaxLength(String maxLength) {
        this.maxLength = maxLength;
    }

    public void setMaxRange(String maxRange) {
        this.maxRange = maxRange;
    }

    public void setMinLength(String minLength) {
        this.minLength = minLength;
    }

    public void setMinRange(String minRange) {
        this.minRange = minRange;
    }

    public void setNofragmentsForURL(String nofragmentsForURL) {
        this.nofragmentsForURL = nofragmentsForURL;
    }

    public void setSchemesForURL(String schemesForURL) {
        this.schemesForURL = schemesForURL;
    }

    public String getLineEndLength() {
        return lineEndLength;
    }

    public void setLineEndLength(String lineEndLength) {
        this.lineEndLength = lineEndLength;
    }

    public String getEvalLeft() {
        return evalLeft;
    }

    public String getEvalRight() {
        return evalRight;
    }

    public void setEvalLeft(String evalLeft) {
        this.evalLeft = evalLeft;
    }

    public void setEvalRight(String evalRight) {
        this.evalRight = evalRight;
    }

    public String getKeepAliveCount() {
        return keepAliveCount;
    }

    public void setKeepAliveCount(String keepAliveCount) {
        this.keepAliveCount = keepAliveCount;
    }

  	/*
    public Object getComputedValue() {
        return computedValue;
    }

    public void setComputedValue(Object computedValue) {
        this.computedValue = computedValue;
    }
	*/
  
    public String getIsFinal() {
        return isFinal;
    }

    public void setIsFinal(String isFinal) {
        this.isFinal = isFinal;
    }

    public String getValidatorPath() {
        return validatorPath;
    }

    public void setValidatorPath(String validatorPath) {
        this.validatorPath = validatorPath;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}
