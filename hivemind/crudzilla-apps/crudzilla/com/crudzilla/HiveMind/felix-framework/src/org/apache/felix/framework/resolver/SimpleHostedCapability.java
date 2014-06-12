/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.felix.framework.resolver;

import java.util.Map;
import org.osgi.framework.wiring.BundleCapability;
import org.osgi.framework.wiring.BundleRevision;

class SimpleHostedCapability implements HostedCapability
{
    private final BundleRevision m_host;
    private final BundleCapability m_cap;

    SimpleHostedCapability(BundleRevision host, BundleCapability cap)
    {
        m_host = host;
        m_cap = cap;
    }

    public BundleRevision getResource()
    {
        return m_host;
    }

    public BundleRevision getRevision()
    {
        return m_host;
    }

    public BundleCapability getDeclaredCapability()
    {
        return m_cap;
    }

    public String getNamespace()
    {
        return m_cap.getNamespace();
    }

    public Map<String, String> getDirectives()
    {
        return m_cap.getDirectives();
    }

    public Map<String, Object> getAttributes()
    {
        return m_cap.getAttributes();
    }
}