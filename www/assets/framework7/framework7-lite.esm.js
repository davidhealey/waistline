/**
 * Framework7 7.0.8
 * Full featured mobile HTML framework for building iOS & Android apps
 * https://framework7.io/
 *
 * Copyright 2014-2022 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: September 14, 2022
 */

import $ from './shared/dom7.js';
import Framework7 from './components/app/app-class.js';
import request from './shared/request.js';
import * as utils from './shared/utils.js';
import { getSupport } from './shared/get-support.js';
import { getDevice } from './shared/get-device.js';
import DeviceModule from './modules/device/device.js';
import SupportModule from './modules/support/support.js';
import UtilsModule from './modules/utils/utils.js';
import ResizeModule from './modules/resize/resize.js';
import RequestModule from './modules/request/request.js';
import TouchModule from './modules/touch/touch.js';
import ClicksModule from './modules/clicks/clicks.js';
import RouterModule from './modules/router/router.js';
import HistoryModule from './modules/history/history.js';
import ServiceWorkerModule from './modules/service-worker/service-worker.js';
import StoreModule, { createStore } from './modules/store/store.js';
import Statusbar from './components/statusbar/statusbar.js';
import View from './components/view/view.js';
import Navbar from './components/navbar/navbar.js';
import Toolbar from './components/toolbar/toolbar.js';
import Subnavbar from './components/subnavbar/subnavbar.js';
import TouchRipple from './components/touch-ripple/touch-ripple.js';
import Modal from './components/modal/modal.js';
Framework7.use([DeviceModule, SupportModule, UtilsModule, ResizeModule, RequestModule, TouchModule, ClicksModule, RouterModule, HistoryModule, ServiceWorkerModule, StoreModule, Statusbar, View, Navbar, Toolbar, Subnavbar, TouchRipple, Modal]);
export { $ as Dom7, request, utils, getDevice, getSupport, createStore };
export default Framework7;
