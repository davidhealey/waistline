/*
  Copyright 2018, 2019 David Healey

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
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

var foodEditor = {

  open: function(food, uploader) {

    foodEditor.uploader = uploader; //Make uploader status class wide
    foodEditor.foodImages = [];

    nav.pushPage("src/activities/foodlist/views/food-editor.html", {"data":food})
    .then(function() {
      foodEditor.populateEditor(food);

      //If editor is being used for upload setup extra stuff
      if (uploader == true)
        foodEditor.setupUploadFields(food);
      else {
        document.querySelector('ons-page#food-editor #submit').addEventListener("tap", function(){ foodEditor.processEditor(food);});
        if (food) document.querySelector('ons-page#food-editor #portion').addEventListener("change", function(){ foodEditor.changePortion(food);});
      }
    });
  },

  populateEditor: function(data) {

    //Existing item info
    if (data) {
      if (Object.keys(data).length > 1) { //If there is only 1 key it's a scanned item's barcode
        document.querySelector("#food-editor #title").innerText = unescape(data.name);
        document.querySelector('#food-editor #name').value = unescape(data.name);
        document.querySelector('#food-editor #brand').value = unescape(data.brand);
        document.querySelector('#food-editor #portion').value = parseFloat(data.portion);
        document.querySelector('#food-editor #unit').value = data.portion.replace(/[^a-z]/gi, '');

        //Product images - only when connected to internet
        if (data.image_url && data.image_url != undefined) {
          if ((navigator.connection.type != "none" && navigator.connection.type != "unknown") || app.mode == "development") {
            let imageCarousel = document.querySelector('ons-page#food-editor #images ons-carousel');
            imageCarousel.closest("ons-card").style.display = "block";

            let c = document.createElement("ons-carousel-item");
            imageCarousel.appendChild(c);

            let img = document.createElement("img");
            img.setAttribute("src", unescape(data.image_url));
            c.appendChild(img);
          }
        }
      }

      //Display barcode if present
      if (data.barcode) {
        document.querySelector('#food-editor #barcode-container').style.display = "block";
        document.querySelector('#food-editor #barcode').innerText = data.barcode;
        //If connected to the internet and data doesn't contain image url download pictures
      }
    }

    //Render nutrition
    const nutriments = app.nutriments;
    const nutrition = document.querySelector("ons-page#food-editor #nutrition");
    for (let i = 0; i < nutriments.length; i++) {

      let nutriment = nutriments[i];

      let row = document.createElement("ons-row");
      nutrition.appendChild(row);

      //Nutriment name and unit
      let nutrimentUnits = app.nutrimentUnits;
      let col = document.createElement("ons-col");
      col.setAttribute("vertical-align", "center");
      col.setAttribute("width", "70%");
      row.appendChild(col);

      let text = app.strings[nutriment] || nutriment; //Localize
      let tnode = document.createTextNode((text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " "));
      col.appendChild(tnode);

      //Nutriment input box
      col = document.createElement("ons-col");
      col.setAttribute("width", "15%");
      row.appendChild(col);

      let input = document.createElement("ons-input");
      input.setAttribute("name", nutriment);
      input.setAttribute("placeholder", 0);
      input.setAttribute("type", "number");

      if (nutriment == "calories") {
        input.setAttribute("pattern", "pattern='[0-9]*'");
        input.setAttribute("inputmode", "numeric");
        input.setAttribute("required", "true");
      }
      else {
        input.setAttribute("inputmode", "decimal");
        input.setAttribute("step", "any");
      }

      if (data && data.nutrition && data.nutrition[nutriment])
        input.value = Number(parseFloat(data.nutrition[nutriment]).toFixed(4));

      col.appendChild(input);

      //Unit
      let nutrimentUnit = nutrimentUnits[nutriment] || "g";
      col = document.createElement("ons-col");
      col.className = "nutriment-unit";
      col.innerText = nutrimentUnit;
      row.appendChild(col);
    }
  },

  changePortion: function(data) {
    const nutriments = app.nutriments;
    let inputs = document.querySelectorAll('#food-editor input');
    let oldP = parseFloat(data.portion); //Get original portion
    let newP = document.querySelector('#food-editor #portion').value; //New portion

    if (oldP > 0 && newP > 0) {
      for (var i = 0; i < inputs.length; i++) {
        let name = inputs[i].getAttribute("name");

        if (nutriments.indexOf(name) != -1) {
          let v = parseFloat(((data.nutrition[name] / oldP) * newP).toFixed(2));
          inputs[i].value = v;
        }
      }
    }
  },

  processEditor: function(data) {

    const nutriments = app.nutriments;

    //Make sure there is data object set up correctly
    data = data || {};
    data.nutrition = data.nutrition || {};

    //Add date time
    var now = new Date();
    data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let inputs = document.querySelectorAll('#food-editor input');
    let unit = document.querySelector('#food-editor #unit').value;

    let validation = app.validateInputs(inputs);
    if (validation == true) {

      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        let name = input.getAttribute("name");
        let v = input.value;

        if (v == null || v == "") continue; //Ignore unset values

        if (nutriments.indexOf(name) != -1) //Nutriments
          data.nutrition[name] = parseFloat(v);
        else
        {
          if (name == "unit") continue;
          if (name == "portion") v = v + unit;
          data[name] = v;
        }
      }

      //Warn user if they input a really high calorie amount
      if (data.nutrition.calories > 5000) {
        ons.notification.confirm({
            message:"That's a lot of calories are you sure it's correct? This is kcal so you might want to divide it by 1000",
            buttonLabels:["Yes it's correct", "No I'd like to change it"]
        })
        .then(function(input) {
          if (input == 1)
           return true;
          else
            finalise(data); //Jump to finalise sub-function
        });
      }
      else {
        finalise(data); //Jump to finalise sub-function
      }
    }
    else {
      //Display validation messages
      let message = "Please add values to the following fields: <br><ul>";
      for (let i = 0; i < validation.length; i++) {
        message += "<li>" + validation[i].charAt(0).toUpperCase() + validation[i].slice(1) + "</li>";
      }
      message += "<ul>";
      ons.notification.alert(message, {"messageHTML":true});
    }

    function finalise(data) {

      if (foodEditor.uploader == true) {
        if (foodEditor.foodImages.length == 0) { //No images have been added for upload :(
          ons.notification.confirm({
              message:"You haven't added any product images. Adding images helps keep the Open Food Facts database accurate. Would you like to cancel the upload and add images?",
              buttonLabels:["No", "Yes!"]
          })
          .then(function(input) {
            if (input == 1)
             return true;
            else
              postAndAddToDB(data);
          });
        }
        else
          postAndAddToDB(data);
      }
      else {
        foodEditor.addToDB(data);
      }
    }

    function postAndAddToDB(data) {
      let modal = document.querySelector('#food-editor ons-modal');
      modal.show();
      foodEditor.uploadToOFF(data)
      .then(function(data) {
        alert("upload complete");
        modal.hide();
        foodEditor.addToDB(data);
      })
      .catch(function(e) {
        console.log(e);
        modal.hide();
        ons.notification.alert("Check Open Food Facts Username and Password", {title:"Upload Error"});
      });
    }
  },

  addToDB: function(data) {
    dbHandler.put(data, "foodList").onsuccess = function() {
      nav.resetToPage('src/activities/foodlist/views/foodlist.html');
    };
  },

  setupUploadFields: function(data) {
    document.querySelector("#food-editor #title").innerText = "Upload";
    document.querySelector('#food-editor #submit').style.display = "none";
    document.querySelector('#food-editor #upload-fields').style.display = "block";

    const btnCamera = document.querySelector('#food-editor #camera');
    btnCamera.style.display = "block";
    btnCamera.addEventListener("tap", foodEditor.takePicture);

    const btnUpload = document.querySelector('#food-editor #upload');
    btnUpload.style.display = "block";
    btnUpload.addEventListener("tap", function(event) {foodEditor.processEditor(data);});
  },

  takePicture: function() {
    let imageCarousel = document.querySelector('ons-page#food-editor #images ons-carousel');
    let options = {"allowEdit":true, "saveToPhotoAlbum":false};
    //let image_uri = cordova.file.applicationDirectory + "/assets/test.jpg";

    navigator.camera.getPicture(function(image_uri) {
      //Ask the user to select the type of image
      ons.openActionSheet({
        title: 'What is this image of?',
        buttons: ['Front Image', 'Ingredients', 'Nutrition']
      })
      .then(function(input) {
        let imageTypes = ["front", "ingredients", "nutrition"];

        //Make sure there is only one image per imagefield
        for (let i = 0; i < foodEditor.foodImages.length; i++) {
          if (foodEditor.foodImages[i].imagefield == imageTypes[input]) {
            foodEditor.foodImages.splice(i, 1); //Remove item from images array
            //Remove image from carousel
            let img = document.querySelector("#food-editor #images #"+imageTypes[input] + " img");
            img.removeEventListener("hold", deleteImage); //Remove img event listener
            let child = img.closest("ons-carousel-item");
            let parent = child.parentElement;
            parent.removeChild(child);
          }
        }

        let imageData = {"imagefield":imageTypes[input], "path":image_uri, "uploadType":"imgupload_"+imageTypes[input]};
        foodEditor.foodImages.push(imageData); //Push to class wide array

        //Show images container
        imageCarousel.closest("ons-card").style.display = "block";

        //Create carousel item with image and append to imageCarousel
        let ci = document.createElement("ons-carousel-item");
        ci.id = imageTypes[input];
        imageCarousel.appendChild(ci);

        let img = document.createElement("img");
        img.setAttribute("src", image_uri);
        img.addEventListener("hold", deleteImage);

        let gd = document.createElement("ons-gesture-detector");
        gd.appendChild(img);

        ci.appendChild(gd);
      });
    },
    function() {
      console.log("Camera problem");
    }, options);

    function deleteImage() {
      let ci = this.closest("ons-carousel-item");
      let img = this;

      ons.notification.confirm("Delete this item?")
      .then(function(input) {
        if (input == 1) { //Delete was confirmed
          foodEditor.foodImages.splice(ci.id, 1); //Remove item from images array
          //If there are no images left hide the image container
          if (foodEditor.foodImages.length == 0) {
            document.querySelector('ons-page#food-editor #images').style.display = "none";
          }
          this.removeEventListener("hold", deleteImage); //Remove the event handler

          //Remove the carousel item
          let parent = ci.parentElement;
          parent.removeChild(ci);
        }
      });
    }
  },

  uploadToOFF: function(data) {

    return new Promise(function(resolve, reject){

      let units = app.nutrimentUnits;

      /* jshint expr: true */
      let user_id, password;
      app.mode == "development" ? user_id = "" : user_id = "waistline-app";
      app.mode == "development" ? password = "" : password = "waistline";
      //let lang = app.getLocale() || "en";

      //Put data into the correct format for OFF request
      let s = "user_id=" + escape(user_id) + "&password=" + password;
      //s += "&lang=" + lang;
      s += "&code=" + data.barcode;
      s += "&product_name=" + escape(data.name);
      s += "&brands=" + escape(data.brand);
      s += "&product_quantity=" + escape(data.portion);
      s += "&nutrition_data_per=serving&serving_size="+escape(data.portion);
      s += "&nutriment_energy_unit=kcal";

      for (let n in data.nutrition) {

        if (n == "calories")
          s += "&nutriment_energy=";
        else
          s += "&nutriment_" + n + "=";

        if (n == "sodium") data.nutrition[n] = data.nutrition[n] / 1000;

        s += data.nutrition[n];
      }

      //Make request to OFF
      let endPoint;
      if (app.mode == "development")
        endPoint = "https://off:off@world.openfoodfacts.net/cgi/product_jqm2.pl?"; //Testing server
      else
        endPoint = "https://world.openfoodfacts.org/cgi/product_jqm2.pl?"; //Real server

      let request = new XMLHttpRequest();
      request.open("GET", endPoint + s, true); //Testing server
      request.setRequestHeader("Content-Type", "multipart/form-data");
      request.withCredentials = true;

      request.onload = function() {

        console.log(this.status);

        if (this.response && this.response.status == 1) { //Everything went well
          //Upload images, if any
          if (foodEditor.foodImages.length > 0) {
            foodEditor.uploadImagesToOFF(data.barcode, foodEditor.foodImages)
            .then(function() {
              resolve(data);
            });
          }
          else
            resolve(data);
        }
        else
          reject(new Error(this));
      };

      request.onerror = function() {
        reject(new Error(this));
      };

      request.send();
    });
  },

  uploadImagesToOFF: function(code, images) {
    return new Promise(function(resolve, reject) {

      let promises = [];

      //Upload images
      for (let i = 0; i < images.length; i++) {
        promises.push(uploadImage(code, images[i])); //Use sub-function (uploadImage)
      }

      //When all promises have completed
      Promise.all(promises).then(function(values) {
        console.log(values);
        resolve();
      });
    })
    .catch(function(err) {
      console.error('Augh, there was an error!', err.statusText);
      reject(err.statusText);
    });

    //This function won't work in the browser, must be tested on device
    function uploadImage(code, image) {

      return new Promise(function(resolve, reject) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fsSuccess, fsFail);

        function fsSuccess(fs) {
          console.log('file system open: ' + fs.name);
          window.resolveLocalFileSystemURL(image.path, getFileSuccess, getFileFail);
        }

        function getFileSuccess(fileEntry) {
          console.log("Got the file: " + image.imagefield);
          fileEntry.file(readFile, fileEntryFail);
        }

        function readFile(file) {

          console.log("Reading file");

          let reader = new FileReader();
          reader.onloadend = function() {
              // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
              let blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });

              let formdata = new FormData();
              formdata.append(image.uploadType, blob);
              formdata.append("code", code);
              formdata.append("imagefield", image.imagefield);
              postImage(formdata); //Send image to OFF
          };

          // Read the file as an ArrayBuffer
          reader.readAsArrayBuffer(file);
        }

        function postImage(formdata) {

          console.log("Upload start");

          var request = new XMLHttpRequest();

          if (app.mode == "development")
            request.open("POST", "https://off:off@world.openfoodfacts.net/cgi/product_image_upload.pl", true); //Testing server
          else
            request.open("POST", "https://world.openfoodfacts.org/cgi/product_image_upload.pl", true); //Live server

          request.setRequestHeader("Content-Type", "multipart/form-data");
          request.withCredentials = true;

          request.onload = function (e) {
            console.log("Image uploaded: " + image.imagefield);
            resolve(request.response);
          };

          request.onerror = function(e) {reject(e);};

          request.send(formdata);
        }

        function fsFail(err) {console.error('error getting persistent fs! ' + err); reject();}
        function getFileFail(err) {console.error('error getting file! ' + err); reject();}
        function fileEntryFail(err) {console.error('error getting fileentry file!' + err); reject();}
      })
      .catch(function(err) {
        console.error('Augh, there was an error!', err.statusText);
        reject();
      });

        /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

           console.log('file system open: ' + fs.name);

             window.resolveLocalFileSystemURL(image.path, function (fileEntry) {

                  console.log("Got the file: " + image.imagefield);

                  fileEntry.file(function (file) {

                      var reader = new FileReader();
                      reader.onloadend = function() {

                          // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                          var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });

                          var formdata = new FormData();
                          formdata.append(image.uploadType, blob);
                          formdata.append("code", code);
                          formdata.append("imagefield", image.imagefield);

                          console.log("Upload start");

                          var request = new XMLHttpRequest();

                          if (app.mode == "development")
                            request.open("POST", "https://off:off@world.openfoodfacts.net/cgi/product_image_upload.pl", true); //Testing server
                          else
                            request.open("POST", "https://world.openfoodfacts.org/cgi/product_image_upload.pl", true); //Live server

                          request.setRequestHeader("Content-Type", "multipart/form-data");
                          request.withCredentials = true;

                          request.onload = function (e) {
                            console.log("Image uploaded: " + image.imagefield);
                            resolve(request.response);
                          };

                          request.onerror = function(e) {
                              reject({"status":"Upload Error"});
                          };

                          request.send(formdata);
                      };

                      // Read the file as an ArrayBuffer
                      reader.readAsArrayBuffer(file);
                  }, function (err) { console.error('error getting fileentry file!' + err); reject();});
            }, function (err) { console.error('error getting file! ' + err); reject();});
        }, function (err) { console.error('error getting persistent fs! ' + err); reject();});
      })
      .catch(function(err) {
        console.error('Augh, there was an error!', err.statusText);
        reject();
      });*/
    }
  }
};
