app.Utils = {

  tidyText: function(text, maxLength) {

    if (text) {
      let t = unescape(text);

      if (text.length > maxLength)
        t = t.substring(0, maxLength - 2) + "..";

      //Format to title case
      return t.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
    return "";
  },

  deleteChildNodes: function(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  },

  isInternetConnected: function() {

    if (navigator.connection.type == "none") {
      let msg = app.strings["no-internet"] || "Internet connection required.";
      notification(msg, "error");
      return false;
    }

    return true;
  },

  notification: function(text, icon) {
    // Create notification with click to close
    let notification = app.f7.notification.create({
      icon: '<i class="icon material-icons">' + icon + '</i>',
      title: 'Waistline',
      titleRightText: '',
      subtitle: '',
      text: text,
      closeButton: true,
    });

    notification.open();
  },

  toast: function(text, timeout, position) {
    let toast = app.f7.toast.create({
      text: text,
      position: position || 'center',
      closeTimeout: timeout || 1000,
    });

    toast.open();
  },

  concatObjects: function(...sources) {
    const target = {};
    sources.forEach(el => {
      Object.keys(el).forEach(key => {
        target[key] = el[key];
      });
    });
    return target;
  },

  togglePreloader: function(state, text) {
    if (state) {
      app.preloader = app.f7.dialog.preloader(text);
    } else if (app.preloader !== undefined) {
      app.preloader.close();
      app.preloader = undefined;
    }
  }
};