/*
  Copyright 2024 David Healey

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.FoodImages = {

  populateMainImage: function(mainPhotoEl, addPhotoEl, photoHolderEl, item, removable, removedCallback) {
    mainPhotoEl.style.display = "none";

    if (item.image_url !== undefined && item.image_url !== "" && item.image_url !== "undefined") {

      if (app.Settings.get("foodlist", "show-images")) {
        if (item.image_url.startsWith("http")) {
          let wifiOnly = app.Settings.get("foodlist", "wifi-images");
          if (app.mode == "development") wifiOnly = false;

          if (navigator.connection.type !== "none") {
            if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
              mainPhotoEl.style.display = "block";
              let src = unescape(item.image_url);
              app.FoodImages.insertImageEl(addPhotoEl, photoHolderEl, src, removable, removedCallback);
            }
          }
        } else {
          mainPhotoEl.style.display = "block";
          app.FoodImages.insertImageEl(addPhotoEl, photoHolderEl, item.image_url, removable, removedCallback);
        }
      }
    } else if (removable) {
      mainPhotoEl.style.display = "block";
      addPhotoEl.style.display = "flex";
      photoHolderEl.innerHTML = "";
    }
  },

  takePicture: function(sourceType, addPhotoEl, photoHolderEl, addedCallback, removedCallback) {

    let destinationType = Camera.DestinationType.FILE_URI;

    // Pictures from the library must be retrieved as base64 data to avoid permission errors
    if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY)
      destinationType = Camera.DestinationType.DATA_URL;

    let options = {
      "sourceType": sourceType,
      "destinationType": destinationType,
      "saveToPhotoAlbum": false,
      "quality": 25
    };

    navigator.camera.getPicture(onSuccess, onError, options);

    function onSuccess(image) {
      (async () => {

        let blob;
        if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
          let uri = "data:image/jpeg;base64," + image;
          let res = await fetch(uri);
          blob = await res.blob();
        } else {
          if (app.Settings.get("integration", "edit-images") == true) {
            let newPath = await app.Utils.cropImage(image);
            blob = await app.Utils.fileToBlob(newPath);
          } else {
            blob = await app.Utils.fileToBlob(image);
          }
        }

        addedCallback(blob);

        let blobUrl = URL.createObjectURL(blob);
        app.FoodImages.insertImageEl(addPhotoEl, photoHolderEl, blobUrl, true, removedCallback);
      })();
    }

    function onError(err) {
      let msg = app.strings.dialogs["camera-problem"] || "There was a problem accessing your camera.";
      app.Utils.toast(msg);
      console.error(err);
    }
  },

  removePicture: function(addPhotoEl, photoHolderEl, removedCallback) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.delete || "Delete",
          keyCodes: app.Utils.enterKeyCode,
          onClick: () => {
            addPhotoEl.style.display = "flex";
            photoHolderEl.innerHTML = "";
            removedCallback();
          }
        }
      ]
    }).open();
  },

  imageBlobToBase64: async function(blob) {
    app.f7.preloader.show();
    let resizedBlob = await app.Utils.resizeImageBlob(blob, "jpeg");
    let sourceString = await app.Utils.blobToBase64(resizedBlob);
    app.f7.preloader.hide();
    return sourceString;
  },

  insertImageEl: function(addPhotoEl, photoHolderEl, src, removable, removedCallback) {
    addPhotoEl.style.display = "none";
    photoHolderEl.innerHTML = "";

    let img = document.createElement("img");
    img.src = src;
    img.style["max-width"] = "80vw";
    img.style["max-height"] = "40vh";
    img.style["pointer-events"] = "none";

    if (removable == true) {
      photoHolderEl.classList.add("ripple");
      photoHolderEl.addEventListener("taphold", function(e) {
        app.FoodImages.removePicture(addPhotoEl, photoHolderEl, removedCallback);
      });
    } else {
      photoHolderEl.classList.remove("ripple");
    }

    photoHolderEl.appendChild(img);
  }
};
