export const tidyText = function(text, maxLength) {

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
};

export const deleteChildNodes = function(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export const isInternetConnected = function() {

  if (navigator.connection.type == "none") {
    let msg = waistline.strings["no-internet"] || "Internet connection required.";
    notification(msg, "error");
    return false;
  }

  return true;
};

export const notification = function(text, icon) {
  // Create notification with click to close
  let notification = f7.notification.create({
    icon: '<i class="icon material-icons">' + icon + '</i>',
    title: 'Waistline',
    titleRightText: '',
    subtitle: '',
    text: text,
    closeButton: true,
  });

  notification.open();
};

export const toast = function(text, position, timeout) {
  let toast = f7.toast.create({
    text: text,
    position: position || 'center',
    closeTimeout: timeout || 1000,
  });

  toast.open();
};

export const concatObjects = function(...sources) {
  const target = {};
  sources.forEach(el => {
    Object.keys(el).forEach(key => {
      target[key] = el[key];
    });
  });
  return target;
};