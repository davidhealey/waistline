import Dom7 from 'dom7';
import Framework7 from './components/app/app-class'

import request, {
  RequestError,
  RequestResponse,
  RequestParameters,
  RequestXHR,
} from './shared/request';
import { getSupport, Support } from './shared/get-support';
import { getDevice, Device } from './shared/get-device';
import { Utils } from './shared/utils';
import { Framework7Parameters, Framework7Plugin } from './components/app/app-class';

import { Clicks as ClicksModule } from './modules/clicks/clicks';
import { Component as ComponentModule } from './modules/component/component';
import { Device as DeviceModule } from './modules/device/device';
import { Request as RequestModule } from './modules/request/request';
import { Resize as ResizeModule } from './modules/resize/resize';
import { Router as RouterModule } from './modules/router/router';
import { ServiceWorker as ServiceWorkerModule } from './modules/service-worker/service-worker';
import { Store as StoreModule } from './modules/store/store';
import { Support as SupportModule } from './modules/support/support';
import { Touch as TouchModule } from './modules/touch/touch';
import { Utils as UtilsModule } from './modules/utils/utils';
import { ComponentFunction as Component } from './modules/component/component';
import { StoreObject as Store, StoreParameters, createStore } from './modules/store/store';

import { Accordion } from './components/accordion/accordion';
import { Actions } from './components/actions/actions';
import { Appbar } from './components/appbar/appbar';
import { AreaChart } from './components/area-chart/area-chart';
import { Autocomplete } from './components/autocomplete/autocomplete';
import { Badge } from './components/badge/badge';
import { Block } from './components/block/block';
import { Button } from './components/button/button';
import { Calendar } from './components/calendar/calendar';
import { Card } from './components/card/card';
import { Checkbox } from './components/checkbox/checkbox';
import { Chip } from './components/chip/chip';
import { ColorPicker } from './components/color-picker/color-picker';
import { ContactsList } from './components/contacts-list/contacts-list';
import { DataTable } from './components/data-table/data-table';
import { Dialog } from './components/dialog/dialog';
import { Elevation } from './components/elevation/elevation';
import { Fab } from './components/fab/fab';
import { Form } from './components/form/form';
import { Gauge } from './components/gauge/gauge';
import { Grid } from './components/grid/grid';
import { Icon } from './components/icon/icon';
import { InfiniteScroll } from './components/infinite-scroll/infinite-scroll';
import { Input } from './components/input/input';
import { Lazy } from './components/lazy/lazy';
import { Link } from './components/link/link';
import { List } from './components/list/list';
import { ListIndex } from './components/list-index/list-index';
import { LoginScreen } from './components/login-screen/login-screen';
import { Menu } from './components/menu/menu';
import { Messagebar } from './components/messagebar/messagebar';
import { Messages } from './components/messages/messages';
import { Modal } from './components/modal/modal';
import { Navbar } from './components/navbar/navbar';
import { Notification } from './components/notification/notification';
import { Page } from './components/page/page';
import { Panel } from './components/panel/panel';
import { PhotoBrowser } from './components/photo-browser/photo-browser';
import { Picker } from './components/picker/picker';
import { PieChart } from './components/pie-chart/pie-chart';
import { Popover } from './components/popover/popover';
import { Popup } from './components/popup/popup';
import { Preloader } from './components/preloader/preloader';
import { Progressbar } from './components/progressbar/progressbar';
import { PullToRefresh } from './components/pull-to-refresh/pull-to-refresh';
import { Radio } from './components/radio/radio';
import { Range } from './components/range/range';
import { Searchbar } from './components/searchbar/searchbar';
import { Sheet } from './components/sheet/sheet';
import { Skeleton } from './components/skeleton/skeleton';
import { SmartSelect } from './components/smart-select/smart-select';
import { Sortable } from './components/sortable/sortable';
import { Statusbar } from './components/statusbar/statusbar';
import { Stepper } from './components/stepper/stepper';
import { Subnavbar } from './components/subnavbar/subnavbar';
import { Swipeout } from './components/swipeout/swipeout';
import { Swiper } from './components/swiper/swiper';
import { Tabs } from './components/tabs/tabs';
import { TextEditor } from './components/text-editor/text-editor';
import { Timeline } from './components/timeline/timeline';
import { Toast } from './components/toast/toast';
import { Toggle } from './components/toggle/toggle';
import { Toolbar } from './components/toolbar/toolbar';
import { Tooltip } from './components/tooltip/tooltip';
import { TouchRipple } from './components/touch-ripple/touch-ripple';
import { Treeview } from './components/treeview/treeview';
import { Typography } from './components/typography/typography';
import { View } from './components/view/view';
import { VirtualList } from './components/virtual-list/virtual-list';

declare module './components/app/app-class' {
  interface Framework7Class<Events> extends ClicksModule.AppMethods{}
  interface Framework7Parameters extends ClicksModule.AppParams{}
  interface Framework7Events extends ClicksModule.AppEvents{}
  interface Framework7Class<Events> extends ComponentModule.AppMethods{}
  interface Framework7Parameters extends ComponentModule.AppParams{}
  interface Framework7Events extends ComponentModule.AppEvents{}
  interface Framework7Class<Events> extends DeviceModule.AppMethods{}
  interface Framework7Parameters extends DeviceModule.AppParams{}
  interface Framework7Events extends DeviceModule.AppEvents{}
  interface Framework7Class<Events> extends RequestModule.AppMethods{}
  interface Framework7Parameters extends RequestModule.AppParams{}
  interface Framework7Events extends RequestModule.AppEvents{}
  interface Framework7Class<Events> extends ResizeModule.AppMethods{}
  interface Framework7Parameters extends ResizeModule.AppParams{}
  interface Framework7Events extends ResizeModule.AppEvents{}
  interface Framework7Class<Events> extends RouterModule.AppMethods{}
  interface Framework7Parameters extends RouterModule.AppParams{}
  interface Framework7Events extends RouterModule.AppEvents{}
  interface Framework7Class<Events> extends ServiceWorkerModule.AppMethods{}
  interface Framework7Parameters extends ServiceWorkerModule.AppParams{}
  interface Framework7Events extends ServiceWorkerModule.AppEvents{}
  interface Framework7Class<Events> extends StoreModule.AppMethods{}
  interface Framework7Parameters extends StoreModule.AppParams{}
  interface Framework7Events extends StoreModule.AppEvents{}
  interface Framework7Class<Events> extends SupportModule.AppMethods{}
  interface Framework7Parameters extends SupportModule.AppParams{}
  interface Framework7Events extends SupportModule.AppEvents{}
  interface Framework7Class<Events> extends TouchModule.AppMethods{}
  interface Framework7Parameters extends TouchModule.AppParams{}
  interface Framework7Events extends TouchModule.AppEvents{}
  interface Framework7Class<Events> extends UtilsModule.AppMethods{}
  interface Framework7Parameters extends UtilsModule.AppParams{}
  interface Framework7Events extends UtilsModule.AppEvents{}
  interface Framework7Class<Events> extends Accordion.AppMethods{}
  interface Framework7Parameters extends Accordion.AppParams{}
  interface Framework7Events extends Accordion.AppEvents{}
  interface Framework7Class<Events> extends Actions.AppMethods{}
  interface Framework7Parameters extends Actions.AppParams{}
  interface Framework7Events extends Actions.AppEvents{}
  interface Framework7Class<Events> extends Appbar.AppMethods{}
  interface Framework7Parameters extends Appbar.AppParams{}
  interface Framework7Events extends Appbar.AppEvents{}
  interface Framework7Class<Events> extends AreaChart.AppMethods{}
  interface Framework7Parameters extends AreaChart.AppParams{}
  interface Framework7Events extends AreaChart.AppEvents{}
  interface Framework7Class<Events> extends Autocomplete.AppMethods{}
  interface Framework7Parameters extends Autocomplete.AppParams{}
  interface Framework7Events extends Autocomplete.AppEvents{}
  interface Framework7Class<Events> extends Badge.AppMethods{}
  interface Framework7Parameters extends Badge.AppParams{}
  interface Framework7Events extends Badge.AppEvents{}
  interface Framework7Class<Events> extends Block.AppMethods{}
  interface Framework7Parameters extends Block.AppParams{}
  interface Framework7Events extends Block.AppEvents{}
  interface Framework7Class<Events> extends Button.AppMethods{}
  interface Framework7Parameters extends Button.AppParams{}
  interface Framework7Events extends Button.AppEvents{}
  interface Framework7Class<Events> extends Calendar.AppMethods{}
  interface Framework7Parameters extends Calendar.AppParams{}
  interface Framework7Events extends Calendar.AppEvents{}
  interface Framework7Class<Events> extends Card.AppMethods{}
  interface Framework7Parameters extends Card.AppParams{}
  interface Framework7Events extends Card.AppEvents{}
  interface Framework7Class<Events> extends Checkbox.AppMethods{}
  interface Framework7Parameters extends Checkbox.AppParams{}
  interface Framework7Events extends Checkbox.AppEvents{}
  interface Framework7Class<Events> extends Chip.AppMethods{}
  interface Framework7Parameters extends Chip.AppParams{}
  interface Framework7Events extends Chip.AppEvents{}
  interface Framework7Class<Events> extends ColorPicker.AppMethods{}
  interface Framework7Parameters extends ColorPicker.AppParams{}
  interface Framework7Events extends ColorPicker.AppEvents{}
  interface Framework7Class<Events> extends ContactsList.AppMethods{}
  interface Framework7Parameters extends ContactsList.AppParams{}
  interface Framework7Events extends ContactsList.AppEvents{}
  interface Framework7Class<Events> extends DataTable.AppMethods{}
  interface Framework7Parameters extends DataTable.AppParams{}
  interface Framework7Events extends DataTable.AppEvents{}
  interface Framework7Class<Events> extends Dialog.AppMethods{}
  interface Framework7Parameters extends Dialog.AppParams{}
  interface Framework7Events extends Dialog.AppEvents{}
  interface Framework7Class<Events> extends Elevation.AppMethods{}
  interface Framework7Parameters extends Elevation.AppParams{}
  interface Framework7Events extends Elevation.AppEvents{}
  interface Framework7Class<Events> extends Fab.AppMethods{}
  interface Framework7Parameters extends Fab.AppParams{}
  interface Framework7Events extends Fab.AppEvents{}
  interface Framework7Class<Events> extends Form.AppMethods{}
  interface Framework7Parameters extends Form.AppParams{}
  interface Framework7Events extends Form.AppEvents{}
  interface Framework7Class<Events> extends Gauge.AppMethods{}
  interface Framework7Parameters extends Gauge.AppParams{}
  interface Framework7Events extends Gauge.AppEvents{}
  interface Framework7Class<Events> extends Grid.AppMethods{}
  interface Framework7Parameters extends Grid.AppParams{}
  interface Framework7Events extends Grid.AppEvents{}
  interface Framework7Class<Events> extends Icon.AppMethods{}
  interface Framework7Parameters extends Icon.AppParams{}
  interface Framework7Events extends Icon.AppEvents{}
  interface Framework7Class<Events> extends InfiniteScroll.AppMethods{}
  interface Framework7Parameters extends InfiniteScroll.AppParams{}
  interface Framework7Events extends InfiniteScroll.AppEvents{}
  interface Framework7Class<Events> extends Input.AppMethods{}
  interface Framework7Parameters extends Input.AppParams{}
  interface Framework7Events extends Input.AppEvents{}
  interface Framework7Class<Events> extends Lazy.AppMethods{}
  interface Framework7Parameters extends Lazy.AppParams{}
  interface Framework7Events extends Lazy.AppEvents{}
  interface Framework7Class<Events> extends Link.AppMethods{}
  interface Framework7Parameters extends Link.AppParams{}
  interface Framework7Events extends Link.AppEvents{}
  interface Framework7Class<Events> extends List.AppMethods{}
  interface Framework7Parameters extends List.AppParams{}
  interface Framework7Events extends List.AppEvents{}
  interface Framework7Class<Events> extends ListIndex.AppMethods{}
  interface Framework7Parameters extends ListIndex.AppParams{}
  interface Framework7Events extends ListIndex.AppEvents{}
  interface Framework7Class<Events> extends LoginScreen.AppMethods{}
  interface Framework7Parameters extends LoginScreen.AppParams{}
  interface Framework7Events extends LoginScreen.AppEvents{}
  interface Framework7Class<Events> extends Menu.AppMethods{}
  interface Framework7Parameters extends Menu.AppParams{}
  interface Framework7Events extends Menu.AppEvents{}
  interface Framework7Class<Events> extends Messagebar.AppMethods{}
  interface Framework7Parameters extends Messagebar.AppParams{}
  interface Framework7Events extends Messagebar.AppEvents{}
  interface Framework7Class<Events> extends Messages.AppMethods{}
  interface Framework7Parameters extends Messages.AppParams{}
  interface Framework7Events extends Messages.AppEvents{}
  interface Framework7Class<Events> extends Modal.AppMethods{}
  interface Framework7Parameters extends Modal.AppParams{}
  interface Framework7Events extends Modal.AppEvents{}
  interface Framework7Class<Events> extends Navbar.AppMethods{}
  interface Framework7Parameters extends Navbar.AppParams{}
  interface Framework7Events extends Navbar.AppEvents{}
  interface Framework7Class<Events> extends Notification.AppMethods{}
  interface Framework7Parameters extends Notification.AppParams{}
  interface Framework7Events extends Notification.AppEvents{}
  interface Framework7Class<Events> extends Page.AppMethods{}
  interface Framework7Parameters extends Page.AppParams{}
  interface Framework7Events extends Page.AppEvents{}
  interface Framework7Class<Events> extends Panel.AppMethods{}
  interface Framework7Parameters extends Panel.AppParams{}
  interface Framework7Events extends Panel.AppEvents{}
  interface Framework7Class<Events> extends PhotoBrowser.AppMethods{}
  interface Framework7Parameters extends PhotoBrowser.AppParams{}
  interface Framework7Events extends PhotoBrowser.AppEvents{}
  interface Framework7Class<Events> extends Picker.AppMethods{}
  interface Framework7Parameters extends Picker.AppParams{}
  interface Framework7Events extends Picker.AppEvents{}
  interface Framework7Class<Events> extends PieChart.AppMethods{}
  interface Framework7Parameters extends PieChart.AppParams{}
  interface Framework7Events extends PieChart.AppEvents{}
  interface Framework7Class<Events> extends Popover.AppMethods{}
  interface Framework7Parameters extends Popover.AppParams{}
  interface Framework7Events extends Popover.AppEvents{}
  interface Framework7Class<Events> extends Popup.AppMethods{}
  interface Framework7Parameters extends Popup.AppParams{}
  interface Framework7Events extends Popup.AppEvents{}
  interface Framework7Class<Events> extends Preloader.AppMethods{}
  interface Framework7Parameters extends Preloader.AppParams{}
  interface Framework7Events extends Preloader.AppEvents{}
  interface Framework7Class<Events> extends Progressbar.AppMethods{}
  interface Framework7Parameters extends Progressbar.AppParams{}
  interface Framework7Events extends Progressbar.AppEvents{}
  interface Framework7Class<Events> extends PullToRefresh.AppMethods{}
  interface Framework7Parameters extends PullToRefresh.AppParams{}
  interface Framework7Events extends PullToRefresh.AppEvents{}
  interface Framework7Class<Events> extends Radio.AppMethods{}
  interface Framework7Parameters extends Radio.AppParams{}
  interface Framework7Events extends Radio.AppEvents{}
  interface Framework7Class<Events> extends Range.AppMethods{}
  interface Framework7Parameters extends Range.AppParams{}
  interface Framework7Events extends Range.AppEvents{}
  interface Framework7Class<Events> extends Searchbar.AppMethods{}
  interface Framework7Parameters extends Searchbar.AppParams{}
  interface Framework7Events extends Searchbar.AppEvents{}
  interface Framework7Class<Events> extends Sheet.AppMethods{}
  interface Framework7Parameters extends Sheet.AppParams{}
  interface Framework7Events extends Sheet.AppEvents{}
  interface Framework7Class<Events> extends Skeleton.AppMethods{}
  interface Framework7Parameters extends Skeleton.AppParams{}
  interface Framework7Events extends Skeleton.AppEvents{}
  interface Framework7Class<Events> extends SmartSelect.AppMethods{}
  interface Framework7Parameters extends SmartSelect.AppParams{}
  interface Framework7Events extends SmartSelect.AppEvents{}
  interface Framework7Class<Events> extends Sortable.AppMethods{}
  interface Framework7Parameters extends Sortable.AppParams{}
  interface Framework7Events extends Sortable.AppEvents{}
  interface Framework7Class<Events> extends Statusbar.AppMethods{}
  interface Framework7Parameters extends Statusbar.AppParams{}
  interface Framework7Events extends Statusbar.AppEvents{}
  interface Framework7Class<Events> extends Stepper.AppMethods{}
  interface Framework7Parameters extends Stepper.AppParams{}
  interface Framework7Events extends Stepper.AppEvents{}
  interface Framework7Class<Events> extends Subnavbar.AppMethods{}
  interface Framework7Parameters extends Subnavbar.AppParams{}
  interface Framework7Events extends Subnavbar.AppEvents{}
  interface Framework7Class<Events> extends Swipeout.AppMethods{}
  interface Framework7Parameters extends Swipeout.AppParams{}
  interface Framework7Events extends Swipeout.AppEvents{}
  interface Framework7Class<Events> extends Swiper.AppMethods{}
  interface Framework7Parameters extends Swiper.AppParams{}
  interface Framework7Events extends Swiper.AppEvents{}
  interface Framework7Class<Events> extends Tabs.AppMethods{}
  interface Framework7Parameters extends Tabs.AppParams{}
  interface Framework7Events extends Tabs.AppEvents{}
  interface Framework7Class<Events> extends TextEditor.AppMethods{}
  interface Framework7Parameters extends TextEditor.AppParams{}
  interface Framework7Events extends TextEditor.AppEvents{}
  interface Framework7Class<Events> extends Timeline.AppMethods{}
  interface Framework7Parameters extends Timeline.AppParams{}
  interface Framework7Events extends Timeline.AppEvents{}
  interface Framework7Class<Events> extends Toast.AppMethods{}
  interface Framework7Parameters extends Toast.AppParams{}
  interface Framework7Events extends Toast.AppEvents{}
  interface Framework7Class<Events> extends Toggle.AppMethods{}
  interface Framework7Parameters extends Toggle.AppParams{}
  interface Framework7Events extends Toggle.AppEvents{}
  interface Framework7Class<Events> extends Toolbar.AppMethods{}
  interface Framework7Parameters extends Toolbar.AppParams{}
  interface Framework7Events extends Toolbar.AppEvents{}
  interface Framework7Class<Events> extends Tooltip.AppMethods{}
  interface Framework7Parameters extends Tooltip.AppParams{}
  interface Framework7Events extends Tooltip.AppEvents{}
  interface Framework7Class<Events> extends TouchRipple.AppMethods{}
  interface Framework7Parameters extends TouchRipple.AppParams{}
  interface Framework7Events extends TouchRipple.AppEvents{}
  interface Framework7Class<Events> extends Treeview.AppMethods{}
  interface Framework7Parameters extends Treeview.AppParams{}
  interface Framework7Events extends Treeview.AppEvents{}
  interface Framework7Class<Events> extends Typography.AppMethods{}
  interface Framework7Parameters extends Typography.AppParams{}
  interface Framework7Events extends Typography.AppEvents{}
  interface Framework7Class<Events> extends View.AppMethods{}
  interface Framework7Parameters extends View.AppParams{}
  interface Framework7Events extends View.AppEvents{}
  interface Framework7Class<Events> extends VirtualList.AppMethods{}
  interface Framework7Parameters extends VirtualList.AppParams{}
  interface Framework7Events extends VirtualList.AppEvents{}
}

export {
  request,
  RequestError,
  RequestResponse,
  RequestParameters,
  RequestXHR,
  getSupport,
  Support,
  getDevice,
  Device,
  Utils,
  Dom7,
  Component,
  Framework7Parameters,
  Framework7Plugin,
  RouterModule as Router,
  Store,
  StoreParameters,
  createStore,
};
export { Accordion, Actions, Appbar, AreaChart, Autocomplete, Badge, Block, Button, Calendar, Card, Checkbox, Chip, ColorPicker, ContactsList, DataTable, Dialog, Elevation, Fab, Form, Gauge, Grid, Icon, InfiniteScroll, Input, Lazy, Link, List, ListIndex, LoginScreen, Menu, Messagebar, Messages, Modal, Navbar, Notification, Page, Panel, PhotoBrowser, Picker, PieChart, Popover, Popup, Preloader, Progressbar, PullToRefresh, Radio, Range, Searchbar, Sheet, Skeleton, SmartSelect, Sortable, Statusbar, Stepper, Subnavbar, Swipeout, Swiper, Tabs, TextEditor, Timeline, Toast, Toggle, Toolbar, Tooltip, TouchRipple, Treeview, Typography, View, VirtualList }
export default Framework7;
