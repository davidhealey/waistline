/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

module.exports = {
    get events () { return require('./src/events'); },
    get superspawn () { return require('./src/superspawn'); },

    get ActionStack () { return require('./src/ActionStack'); },
    get CordovaError () { return require('./src/CordovaError'); },
    get CordovaLogger () { return require('./src/CordovaLogger'); },
    get CordovaCheck () { return require('./src/CordovaCheck'); },
    get PlatformJson () { return require('./src/PlatformJson'); },
    get ConfigParser () { return require('./src/ConfigParser/ConfigParser'); },
    get FileUpdater () { return require('./src/FileUpdater'); },

    get PluginInfo () { return require('./src/PluginInfo/PluginInfo'); },
    get PluginInfoProvider () { return require('./src/PluginInfo/PluginInfoProvider'); },

    get PluginManager () { return require('./src/PluginManager'); },

    get ConfigChanges () { return require('./src/ConfigChanges/ConfigChanges'); },
    get ConfigKeeper () { return require('./src/ConfigChanges/ConfigKeeper'); },
    get ConfigFile () { return require('./src/ConfigChanges/ConfigFile'); },

    get xmlHelpers () { return require('./src/util/xml-helpers'); }
};
