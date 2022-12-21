import Dom7 from 'dom7';
import Framework7 from './types/components/app/app-class'

import request from './types/shared/request';
import { getSupport } from './types/shared/get-support';
import { getDevice } from './types/shared/get-device';
import { Utils } from './types/shared/utils';

import { Clicks as ClicksModule } from './types/modules/clicks/clicks';
import { Component as ComponentModule } from './types/modules/component/component';
import { Device as DeviceModule } from './types/modules/device/device';
import { Request as RequestModule } from './types/modules/request/request';
import { Resize as ResizeModule } from './types/modules/resize/resize';
import { Router as RouterModule } from './types/modules/router/router';
import { ServiceWorker as ServiceWorkerModule } from './types/modules/service-worker/service-worker';
import { Store as StoreModule } from './types/modules/store/store';
import { Support as SupportModule } from './types/modules/support/support';
import { Touch as TouchModule } from './types/modules/touch/touch';
import { Utils as UtilsModule } from './types/modules/utils/utils';
import { ComponentFunction as Component } from './types/modules/component/component';
import { StoreObject as Store, StoreParameters, createStore } from './types/modules/store/store';

import { Accordion } from './types/components/accordion/accordion';
import { Actions } from './types/components/actions/actions';
import { Appbar } from './types/components/appbar/appbar';
import { AreaChart } from './types/components/area-chart/area-chart';
import { Autocomplete } from './types/components/autocomplete/autocomplete';
import { Badge } from './types/components/badge/badge';
import { Block } from './types/components/block/block';
import { Button } from './types/components/button/button';
import { Calendar } from './types/components/calendar/calendar';
import { Card } from './types/components/card/card';
import { Checkbox } from './types/components/checkbox/checkbox';
import { Chip } from './types/components/chip/chip';
import { ColorPicker } from './types/components/color-picker/color-picker';
import { ContactsList } from './types/components/contacts-list/contacts-list';
import { DataTable } from './types/components/data-table/data-table';
import { Dialog } from './types/components/dialog/dialog';
import { Elevation } from './types/components/elevation/elevation';
import { Fab } from './types/components/fab/fab';
import { Form } from './types/components/form/form';
import { Gauge } from './types/components/gauge/gauge';
import { Grid } from './types/components/grid/grid';
import { Icon } from './types/components/icon/icon';
import { InfiniteScroll } from './types/components/infinite-scroll/infinite-scroll';
import { Input } from './types/components/input/input';
import { Lazy } from './types/components/lazy/lazy';
import { Link } from './types/components/link/link';
import { List } from './types/components/list/list';
import { ListIndex } from './types/components/list-index/list-index';
import { LoginScreen } from './types/components/login-screen/login-screen';
import { Menu } from './types/components/menu/menu';
import { Messagebar } from './types/components/messagebar/messagebar';
import { Messages } from './types/components/messages/messages';
import { Modal } from './types/components/modal/modal';
import { Navbar } from './types/components/navbar/navbar';
import { Notification } from './types/components/notification/notification';
import { Page } from './types/components/page/page';
import { Panel } from './types/components/panel/panel';
import { PhotoBrowser } from './types/components/photo-browser/photo-browser';
import { Picker } from './types/components/picker/picker';
import { PieChart } from './types/components/pie-chart/pie-chart';
import { Popover } from './types/components/popover/popover';
import { Popup } from './types/components/popup/popup';
import { Preloader } from './types/components/preloader/preloader';
import { Progressbar } from './types/components/progressbar/progressbar';
import { PullToRefresh } from './types/components/pull-to-refresh/pull-to-refresh';
import { Radio } from './types/components/radio/radio';
import { Range } from './types/components/range/range';
import { Searchbar } from './types/components/searchbar/searchbar';
import { Sheet } from './types/components/sheet/sheet';
import { Skeleton } from './types/components/skeleton/skeleton';
import { SmartSelect } from './types/components/smart-select/smart-select';
import { Sortable } from './types/components/sortable/sortable';
import { Statusbar } from './types/components/statusbar/statusbar';
import { Stepper } from './types/components/stepper/stepper';
import { Subnavbar } from './types/components/subnavbar/subnavbar';
import { Swipeout } from './types/components/swipeout/swipeout';
import { Swiper } from './types/components/swiper/swiper';
import { Tabs } from './types/components/tabs/tabs';
import { TextEditor } from './types/components/text-editor/text-editor';
import { Timeline } from './types/components/timeline/timeline';
import { Toast } from './types/components/toast/toast';
import { Toggle } from './types/components/toggle/toggle';
import { Toolbar } from './types/components/toolbar/toolbar';
import { Tooltip } from './types/components/tooltip/tooltip';
import { TouchRipple } from './types/components/touch-ripple/touch-ripple';
import { Treeview } from './types/components/treeview/treeview';
import { Typography } from './types/components/typography/typography';
import { View } from './types/components/view/view';
import { VirtualList } from './types/components/virtual-list/virtual-list';

declare module './types/components/app/app-class' {
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

declare const utils: Utils;

export {
  request,
  getSupport,
  getDevice,
  utils,
  Dom7,
  Component,
  Store,
  StoreParameters,
  createStore,
};
export default Framework7;
