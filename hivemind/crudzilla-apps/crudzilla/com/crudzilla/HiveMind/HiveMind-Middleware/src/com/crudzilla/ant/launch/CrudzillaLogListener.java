/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.crudzilla.ant.launch;

//import org.apache.log4j.Logger;
//import org.apache.log4j.helpers.NullEnumeration;
import org.apache.tools.ant.BuildEvent;
import org.apache.tools.ant.BuildListener;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.Target;
import org.apache.tools.ant.Task;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *  Listener which sends events to Log4j logging system
 *
 */
public class CrudzillaLogListener implements BuildListener {
	private static Log  _logger = LogFactory.getLog(CrudzillaLogListener.class); 
    /** Indicates if the listener was initialized. */
    private final boolean initialized = true;

    /**
     * log category we log into
     */
    public static final String LOG_ANT = "com.crudzilla.ant.launch";

    /**
     * Construct the listener and make sure there is a valid appender.
     */
    public CrudzillaLogListener() {
        /*Logger log = Logger.getLogger(LOG_ANT);
        Logger rootLog = Logger.getRootLogger();
        initialized = !(rootLog.getAllAppenders() instanceof NullEnumeration);
        if (!initialized) {
            log.error("No log4j.properties in build area");
        }*/
    }

    /**
     * @see BuildListener#buildStarted
     */
    /** {@inheritDoc}. */
    public void buildStarted(BuildEvent event) {
        if (initialized) {
            //Logger log = Logger.getLogger(Project.class.getName());
            _logger.info("Build started.");
        }
    }

    /**
     * @see BuildListener#buildFinished
     */
    /** {@inheritDoc}. */
    public void buildFinished(BuildEvent event) {
        if (initialized) {
            //Logger log = Logger.getLogger(Project.class.getName());
            if (event.getException() == null) {
                _logger.info("Build finished.");
            } else {
                _logger.error("Build finished with error.", event.getException());
            }
        }
    }

    /**
     * @see BuildListener#targetStarted
     */
    /** {@inheritDoc}. */
    public void targetStarted(BuildEvent event) {
        if (initialized) {
            //Logger log = Logger.getLogger(Target.class.getName());
            _logger.info("Target \"" + event.getTarget().getName() + "\" started.");
        }
    }

    /**
     * @see BuildListener#targetFinished
     */
    /** {@inheritDoc}. */
    public void targetFinished(BuildEvent event) {
        if (initialized) {
            String targetName = event.getTarget().getName();
            //Logger cat = Logger.getLogger(Target.class.getName());
            if (event.getException() == null) {
                _logger.info("Target \"" + targetName + "\" finished.");
            } else {
                _logger.error("Target \"" + targetName
                    + "\" finished with error.", event.getException());
            }
        }
    }

    /**
     * @see BuildListener#taskStarted
     */
    /** {@inheritDoc}. */
    public void taskStarted(BuildEvent event) {
        if (initialized) {
            Task task = event.getTask();
            //Logger log = Logger.getLogger(task.getClass().getName());
            _logger.info("Task \"" + task.getTaskName() + "\" started.");
        }
    }

    /**
     * @see BuildListener#taskFinished
     */
    /** {@inheritDoc}. */
    public void taskFinished(BuildEvent event) {
        if (initialized) {
            Task task = event.getTask();
            //Logger log = Logger.getLogger(task.getClass().getName());
            if (event.getException() == null) {
                _logger.info("Task \"" + task.getTaskName() + "\" finished.");
            } else {
                _logger.error("Task \"" + task.getTaskName()
                    + "\" finished with error.", event.getException());
            }
        }
    }

    /**
     * @see BuildListener#messageLogged
     */
    /** {@inheritDoc}. */
    public void messageLogged(BuildEvent event) {
        if (initialized) {
            Object categoryObject = event.getTask();
            if (categoryObject == null) {
                categoryObject = event.getTarget();
                if (categoryObject == null) {
                    categoryObject = event.getProject();
                }
            }

            //Logger log  = Logger.getLogger(categoryObject.getClass().getName());
            switch (event.getPriority()) {
                case Project.MSG_ERR:
                    _logger.error(event.getMessage());
                    break;
                case Project.MSG_WARN:
                    _logger.warn(event.getMessage());
                    break;
                case Project.MSG_INFO:
                    _logger.info(event.getMessage());
                    break;
                case Project.MSG_VERBOSE:
                    _logger.debug(event.getMessage());
                    break;
                case Project.MSG_DEBUG:
                    _logger.debug(event.getMessage());
                    break;
                default:
                    _logger.error(event.getMessage());
                    break;
            }
        }
    }
}
