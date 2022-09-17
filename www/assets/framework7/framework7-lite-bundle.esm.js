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
import Appbar from './components/appbar/appbar.js';
import Dialog from './components/dialog/dialog.js';
import Popup from './components/popup/popup.js';
import LoginScreen from './components/login-screen/login-screen.js';
import Popover from './components/popover/popover.js';
import Actions from './components/actions/actions.js';
import Sheet from './components/sheet/sheet.js';
import Toast from './components/toast/toast.js';
import Preloader from './components/preloader/preloader.js';
import Progressbar from './components/progressbar/progressbar.js';
import Sortable from './components/sortable/sortable.js';
import Swipeout from './components/swipeout/swipeout.js';
import Accordion from './components/accordion/accordion.js';
import ContactsList from './components/contacts-list/contacts-list.js';
import VirtualList from './components/virtual-list/virtual-list.js';
import ListIndex from './components/list-index/list-index.js';
import Timeline from './components/timeline/timeline.js';
import Tabs from './components/tabs/tabs.js';
import Panel from './components/panel/panel.js';
import Card from './components/card/card.js';
import Chip from './components/chip/chip.js';
import Form from './components/form/form.js';
import Input from './components/input/input.js';
import Checkbox from './components/checkbox/checkbox.js';
import Radio from './components/radio/radio.js';
import Toggle from './components/toggle/toggle.js';
import Range from './components/range/range.js';
import Stepper from './components/stepper/stepper.js';
import SmartSelect from './components/smart-select/smart-select.js';
import Grid from './components/grid/grid.js';
import Calendar from './components/calendar/calendar.js';
import Picker from './components/picker/picker.js';
import InfiniteScroll from './components/infinite-scroll/infinite-scroll.js';
import PullToRefresh from './components/pull-to-refresh/pull-to-refresh.js';
import Lazy from './components/lazy/lazy.js';
import DataTable from './components/data-table/data-table.js';
import Fab from './components/fab/fab.js';
import Searchbar from './components/searchbar/searchbar.js';
import Messages from './components/messages/messages.js';
import Messagebar from './components/messagebar/messagebar.js';
import Swiper from './components/swiper/swiper.js';
import PhotoBrowser from './components/photo-browser/photo-browser.js';
import Notification from './components/notification/notification.js';
import Autocomplete from './components/autocomplete/autocomplete.js';
import Tooltip from './components/tooltip/tooltip.js';
import Skeleton from './components/skeleton/skeleton.js';
import Menu from './components/menu/menu.js';
import ColorPicker from './components/color-picker/color-picker.js';
import Treeview from './components/treeview/treeview.js';
import TextEditor from './components/text-editor/text-editor.js';
import Breadcrumbs from './components/breadcrumbs/breadcrumbs.js';
import Elevation from './components/elevation/elevation.js';
import Typography from './components/typography/typography.js';
Framework7.use([DeviceModule, SupportModule, UtilsModule, ResizeModule, RequestModule, TouchModule, ClicksModule, RouterModule, HistoryModule, ServiceWorkerModule, StoreModule, Statusbar, View, Navbar, Toolbar, Subnavbar, TouchRipple, Modal, Appbar, Dialog, Popup, LoginScreen, Popover, Actions, Sheet, Toast, Preloader, Progressbar, Sortable, Swipeout, Accordion, ContactsList, VirtualList, ListIndex, Timeline, Tabs, Panel, Card, Chip, Form, Input, Checkbox, Radio, Toggle, Range, Stepper, SmartSelect, Grid, Calendar, Picker, InfiniteScroll, PullToRefresh, Lazy, DataTable, Fab, Searchbar, Messages, Messagebar, Swiper, PhotoBrowser, Notification, Autocomplete, Tooltip, Skeleton, Menu, ColorPicker, Treeview, TextEditor, Breadcrumbs, Elevation, Typography]);
export { $ as Dom7, request, utils, getDevice, getSupport, createStore };
export default Framework7;
