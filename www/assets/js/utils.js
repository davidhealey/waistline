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