/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.crudzilla.platform.util;

/**
 *
 * @author bitlooter
 */
/*
 * $Id$
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import java.io.Serializable;
import java.util.List;
import java.util.Locale;
import java.util.StringTokenizer;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.validator.GenericTypeValidator;
import org.apache.commons.validator.GenericValidator;
import org.apache.commons.validator.UrlValidator;
/**
 * <p> This class contains the default validations that are used in the
 * validator-rules.xml file. </p> <p> In general passing in a null or blank
 * will return a null Object or a false boolean. However, nulls and blanks do
 * not result in an error being added to the errors. </p>
 *
 * @since Struts 1.1
 */
public class FieldValidationChecks implements Serializable {
    /**
     * Commons Logging instance.
     */
    private static final Log log = LogFactory.getLog(FieldValidationChecks.class);

    /**
     * The session attributes key under which the user's selected
     * <code>java.util.Locale</code> is stored, if any.  If no such attribute
     * is found, the system default locale will be used when retrieving
     * internationalized messages.  If used, this attribute is typically set
     * during user login processing.
     */
    public static final String LOCALE_KEY = "org.apache.struts.action.LOCALE";

    /**
     * Checks if the field isn't null and length of the field is greater than
     * zero not including whitespace.
     *
     * @param value     The value validation is being performed on.
     *                  current field being validated.
     * @param errors    The <code>List<String></code> list to add error codes
     *                  to if any validation errors occur.
     * @param request   Current request object.
     * @return true if meets stated requirements, false otherwise.
     */
    public static boolean validateRequired(String value,List<String> errors,HttpServletRequest request) {

        if (GenericValidator.isBlankOrNull(value)) {
            errors.add("VE_0001");
            return false;
        } else {
            return true;
        }
    }

    /**
     * Checks if the field isn't null based on the values of other fields.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if meets stated requirements, false otherwise.
     *
    public static boolean validateRequiredIf(String value,List<String> errors,HttpServletRequest request) {
        Object form =
            validator.getParameterValue(org.apache.commons.validator.Validator.BEAN_PARAM);
        String value = null;
        boolean required = false;

        try {
            value = evaluateBean(bean, field);
        } catch (Exception e) {
            processFailure(errors, field, validator.getFormName(), "requiredif", e);
            return false;
        }

        int i = 0;
        String fieldJoin = "AND";

        if (!GenericValidator.isBlankOrNull(field.getVarValue("fieldJoin"))) {
            fieldJoin = field.getVarValue("fieldJoin");
        }

        if (fieldJoin.equalsIgnoreCase("AND")) {
            required = true;
        }

        while (!GenericValidator.isBlankOrNull(field.getVarValue("field[" + i
                    + "]"))) {
            String dependProp = field.getVarValue("field[" + i + "]");
            String dependTest = field.getVarValue("fieldTest[" + i + "]");
            String dependTestValue = field.getVarValue("fieldValue[" + i + "]");
            String dependIndexed = field.getVarValue("fieldIndexed[" + i + "]");

            if (dependIndexed == null) {
                dependIndexed = "false";
            }

            String dependVal = null;
            boolean thisRequired = false;

            if (field.isIndexed() && dependIndexed.equalsIgnoreCase("true")) {
                String key = field.getKey();

                if ((key.indexOf("[") > -1) && (key.indexOf("]") > -1)) {
                    String ind = key.substring(0, key.indexOf(".") + 1);

                    dependProp = ind + dependProp;
                }
            }

            dependVal = ValidatorUtils.getValueAsString(form, dependProp);

            if (dependTest.equals(FIELD_TEST_NULL)) {
                if ((dependVal != null) && (dependVal.length() > 0)) {
                    thisRequired = false;
                } else {
                    thisRequired = true;
                }
            }

            if (dependTest.equals(FIELD_TEST_NOTNULL)) {
                if ((dependVal != null) && (dependVal.length() > 0)) {
                    thisRequired = true;
                } else {
                    thisRequired = false;
                }
            }

            if (dependTest.equals(FIELD_TEST_EQUAL)) {
                thisRequired = dependTestValue.equalsIgnoreCase(dependVal);
            }

            if (fieldJoin.equalsIgnoreCase("AND")) {
                required = required && thisRequired;
            } else {
                required = required || thisRequired;
            }

            i++;
        }

        if (required) {
            if (GenericValidator.isBlankOrNull(value)) {
                errors.add(field.getKey(),
                    Resources.getActionMessage(validator, request, va, field));

                return false;
            } else {
                return true;
            }
        }

        return true;
    }
     */
    /**
     * Checks if the field matches the regular expression in the field's mask
     * attribute.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if field matches mask, false otherwise.
     */
    public static boolean validateMask(String value,String mask,List<String> errors,HttpServletRequest request) {

        try {
 
            if (value != null && value.length()>0
                && !GenericValidator.matchRegexp(value, mask)) {
                errors.add("VE_0002");

                return false;
            } else {
                return true;
            }
        } catch (Exception e) {
            errors.add("VE_0003");

            return false;
        }
    }

    /**
     * Checks if the field can safely be converted to a byte primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateByte(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;


        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatByte(value);

        if (result == null) {
            errors.add("VE_0004");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a byte primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateByteLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;


        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatByte(value, locale);

        if (result == null) {
            errors.add("VE_0005");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a short primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateShort(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatShort(value);

        if (result == null) {
            errors.add("VE_0006");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a short primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateShortLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;


        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatShort(value, locale);

        if (result == null) {
            errors.add("VE_0007");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to an int primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateInteger(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatInt(value);

        if (result == null) {
            errors.add("VE_0008");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to an int primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateIntegerLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatInt(value, locale);

        if (result == null) {
            errors.add("VE_0009");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a long primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateLong(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;
        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatLong(value);

        if (result == null) {
            errors.add("VE_0010");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a long primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateLongLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatLong(value, locale);

        if (result == null) {
            errors.add("VE_0011");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a float primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateFloat(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatFloat(value);

        if (result == null) {
            errors.add("VE_0012");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a float primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateFloatLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatFloat(value, locale);

        if (result == null) {
            errors.add("VE_0013");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a double primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateDouble(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatDouble(value);

        if (result == null) {
            errors.add("VE_0014");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field can safely be converted to a double primitive.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateDoubleLocale(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        result = GenericTypeValidator.formatDouble(value, locale);

        if (result == null) {
            errors.add("VE_0015");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if the field is a valid date. If the field has a datePattern
     * variable, that will be used to format <code>java.text.SimpleDateFormat</code>.
     * If the field has a datePatternStrict variable, that will be used to
     * format <code>java.text.SimpleDateFormat</code> and the length will be
     * checked so '2/12/1999' will not pass validation with the format
     * 'MM/dd/yyyy' because the month isn't two digits. If no datePattern
     * variable is specified, then the field gets the DateFormat.SHORT format
     * for the locale. The setLenient method is set to <code>false</code> for
     * all variations.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateDate(String value,String datePattern,boolean isStrict,List<String> errors,HttpServletRequest request) {
        Object result = null;

        Locale locale = FieldValidationChecks.getUserLocale(request, null);

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        try {
            if (GenericValidator.isBlankOrNull(datePattern)) {
                result = GenericTypeValidator.formatDate(value, locale);
            } else {
                result =
                    GenericTypeValidator.formatDate(value, datePattern, isStrict);
            }
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }

        if (result == null) {
            errors.add("VE_0016");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if a fields value is within a range (min &amp; max specified in
     * the vars attribute).
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if in range, false otherwise.
     */
    public static boolean validateLongRange(String value,String minVar,String maxVar,List<String> errors,HttpServletRequest request) {

        try {
            
            if (!GenericValidator.isBlankOrNull(value)) {
                long longValue = Long.parseLong(value);
                long min = Long.parseLong(minVar);
                long max = Long.parseLong(maxVar);
    
                if (min > max) {
                    errors.add("VE_0033");
                    return false;
                }
    
                if (!GenericValidator.isInRange(longValue, min, max)) {
                    errors.add("VE_0017");
    
                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0018");

            return false;
        }

        return true;
    }

    /**
     * Checks if a fields value is within a range (min &amp; max specified in
     * the vars attribute).
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if in range, false otherwise.
     */
    public static boolean validateIntRange(String value,String minVar,String maxVar,List<String> errors,HttpServletRequest request) {
 
        try {
            if (!GenericValidator.isBlankOrNull(value)) {
                int min = Integer.parseInt(minVar);
                int max = Integer.parseInt(maxVar);
                int intValue = Integer.parseInt(value);

                if (min > max) {
                    errors.add("VE_0034");
                    return false;
                }

                if (!GenericValidator.isInRange(intValue, min, max)) {
                    errors.add("VE_0019");

                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0020");

            return false;
        }

        return true;
    }

    /**
     * Checks if a fields value is within a range (min &amp; max specified in
     * the vars attribute).
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if in range, false otherwise.
     */
    public static boolean validateDoubleRange(String value,String minVar,String maxVar,List<String> errors,HttpServletRequest request) {

        try {
            if (!GenericValidator.isBlankOrNull(value)) {
                double doubleValue = Double.parseDouble(value);
                double min = Double.parseDouble(minVar);
                double max = Double.parseDouble(maxVar);

                if (min > max) {
                    errors.add("VE_0035");
                    return false;
                }

                if (!GenericValidator.isInRange(doubleValue, min, max)) {
                    errors.add("VE_0021");

                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0022");

            return false;
        }

        return true;
    }

    /**
     * Checks if a fields value is within a range (min &amp; max specified in
     * the vars attribute).
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if in range, false otherwise.
     */
    public static boolean validateFloatRange(String value,String minVar,String maxVar,List<String> errors,HttpServletRequest request) {

        try {
            if (!GenericValidator.isBlankOrNull(value)) {
                float floatValue = Float.parseFloat(value);
                float min = Float.parseFloat(minVar);
                float max = Float.parseFloat(maxVar);
    
                if (min > max) {
                    errors.add("VE_0036");
                    return false;
                }
    
                if (!GenericValidator.isInRange(floatValue, min, max)) {
                    errors.add("VE_0023");
    
                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0024");

            return false;
        }

        return true;
    }

    /**
     * Checks if the field is a valid credit card number.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return true if valid, false otherwise.
     */
    public static Object validateCreditCard(String value,List<String> errors,HttpServletRequest request) {
        Object result = null;

        if (GenericValidator.isBlankOrNull(value)) {
            return Boolean.TRUE;
        }

        result = GenericTypeValidator.formatCreditCard(value);

        if (result == null) {
            errors.add("VE_0025");
        }

        return (result == null) ? Boolean.FALSE : result;
    }

    /**
     * Checks if a field has a valid e-mail address.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if valid, false otherwise.
     */
    public static boolean validateEmail(String value,List<String> errors,HttpServletRequest request) {

        if (!GenericValidator.isBlankOrNull(value)
            && !GenericValidator.isEmail(value)) {
            errors.add("VE_0026");

            return false;
        } else {
            return true;
        }
    }

    /**
     * Checks if the field's length is less than or equal to the maximum
     * value. A <code>Null</code> will be considered an error.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if stated conditions met.
     */
    public static boolean validateMaxLength(String value,String maxVar,String endLth,List<String> errors,HttpServletRequest request) {

        try {
            if (value != null) {
                int max = Integer.parseInt(maxVar);

                boolean isValid = false;
                if (GenericValidator.isBlankOrNull(endLth)) {
                    isValid = GenericValidator.maxLength(value, max);
                } else {
                    isValid = GenericValidator.maxLength(value, max,
                        Integer.parseInt(endLth));
                }

                if (!isValid) {
                    errors.add("VE_0027");

                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0028");

            return false;
        }

        return true;
    }

    /**
     * Checks if the field's length is greater than or equal to the minimum
     * value. A <code>Null</code> will be considered an error.
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if stated conditions met.
     */
    public static boolean validateMinLength(String value,String minVar,String endLth,List<String> errors,HttpServletRequest request) {


        try {
            if (!GenericValidator.isBlankOrNull(value)) {

                int min = Integer.parseInt(minVar);

                boolean isValid = false;

                if (GenericValidator.isBlankOrNull(endLth)) {
                    isValid = GenericValidator.minLength(value, min);
                } else {
                    isValid = GenericValidator.minLength(value, min,
                        Integer.parseInt(endLth));
                }

                if (!isValid) {
                    errors.add("VE_0029");

                    return false;
                }
            }
        } catch (Exception e) {
            errors.add("VE_0030");

            return false;
        }

        return true;
    }

    /**
     * Checks if a field has a valid url. Four optional variables can be
     * specified to configure url validation.
     *
     * <ul>
     *
     * <li>Variable <code>allow2slashes</code> can be set to <code>true</code>
     * or <code>false</code> to control whether two slashes are allowed -
     * default is <code>false</code> (i.e. two slashes are NOT allowed).</li>
     *
     * <li>Variable <code>nofragments</code> can be set to <code>true</code>
     * or <code>false</code> to control whether fragments are allowed -
     * default is <code>false</code> (i.e. fragments ARE allowed).</li>
     *
     * <li>Variable <code>allowallschemes</code> can be set to
     * <code>true</code> or <code>false</code> to control if all schemes are
     * allowed - default is <code>false</code> (i.e. all schemes are NOT
     * allowed).</li>
     *
     * <li>Variable <code>schemes</code> can be set to a comma delimited list
     * of valid schemes. This value is ignored if <code>allowallschemes</code>
     * is set to <code>true</code>. Default schemes allowed are "http",
     * "https" and "ftp" if this variable is not specified.</li>
     *
     * </ul>
     *
     * @param bean      The bean validation is being performed on.
     * @param va        The <code>ValidatorAction</code> that is currently
     *                  being performed.
     * @param field     The <code>Field</code> object associated with the
     *                  current field being validated.
     * @param errors    The <code>ActionMessages</code> object to add errors
     *                  to if any validation errors occur.
     * @param validator The <code>Validator</code> instance, used to access
     *                  other field values.
     * @param request   Current request object.
     * @return True if valid, false otherwise.
     */
    public static boolean validateUrl(String value,String allowallschemesVar,String allow2slashesVar,String nofragmentsVar,String schemesVarIn,List<String> errors,HttpServletRequest request) {


        if (GenericValidator.isBlankOrNull(value)) {
            return true;
        }

        // Get the options and schemes Vars

        boolean allowallschemes = "true".equalsIgnoreCase(allowallschemesVar);
        int options = allowallschemes ? UrlValidator.ALLOW_ALL_SCHEMES : 0;

        if ("true".equalsIgnoreCase(allow2slashesVar)) {
            options += UrlValidator.ALLOW_2_SLASHES;
        }

        if ("true".equalsIgnoreCase(nofragmentsVar)) {
            options += UrlValidator.NO_FRAGMENTS;
        }

        String schemesVar = allowallschemes ? null: schemesVarIn;

        // No options or schemes - use GenericValidator as default
        if ((options == 0) && (schemesVar == null)) {
            if (GenericValidator.isUrl(value)) {
                return true;
            } else {
                errors.add("VE_0031");

                return false;
            }
        }

        // Parse comma delimited list of schemes into a String[]
        String[] schemes = null;

        if (schemesVar != null) {
            StringTokenizer st = new StringTokenizer(schemesVar, ",");

            schemes = new String[st.countTokens()];

            int i = 0;

            while (st.hasMoreTokens()) {
                schemes[i++] = st.nextToken().trim();
            }
        }

        // Create UrlValidator and validate with options/schemes
        UrlValidator urlValidator = new UrlValidator(schemes, options);

        if (urlValidator.isValid(value)) {
            return true;
        } else {
            errors.add("VE_0032");

            return false;
        }
    }
    
    /**
     * <p>Look up and return current user locale, based on the specified
     * parameters.</p>
     *
     * @param request The request used to lookup the Locale
     * @param locale  Name of the session attribute for our user's Locale.  If
     *                this is <code>null</code>, the default locale key is
     *                used for the lookup.
     * @return current user locale
     * @since Struts 1.2
     */
    public static Locale getUserLocale(HttpServletRequest request, String locale) {
        Locale userLocale = null;
        HttpSession session = request.getSession(false);

        if (locale == null) {
            locale = FieldValidationChecks.LOCALE_KEY;
        }

        // Only check session if sessions are enabled
        if (session != null) {
            userLocale = (Locale) session.getAttribute(locale);
        }

        if (userLocale == null) {
            // Returns Locale based on Accept-Language header or the server default
            userLocale = request.getLocale();
        }

        return userLocale;
    }    
}
