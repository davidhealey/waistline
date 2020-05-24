/*
  Copyright 2018, 2019, 2020 David Healey

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

/*jshint -W030 */

foodlist.editor = {

  link: false, //Whether input fields are linked together and changing one will change another

  init: function(item, uploader) {

    this.uploader = uploader; //Make uploader status class wide
    this.foodImages = [];
    this.renderEditorInputs();

    if (item)
      this.populateEditor(item);

    //Attach event handler to link/unlink buttons
    document.getElementById("link-unlink").addEventListener("click", function(){
      foodlist.editor.link = 1-foodlist.editor.link;
      let icon = this.querySelector("i");
      foodlist.editor.link == 0 ? icon.className = "icon fas fa-unlink" : icon.className = "icon fas fa-link";
    });

    //If editor is being used for upload setup extra stuff
    if (uploader == true)
      foodEditor.setupUploadFields(food);
    else {
      //document.querySelector('ons-page#food-editor #submit').addEventListener("tap", function(){ foodEditor.processEditor(food);});
      //if (food) document.querySelector('ons-page#food-editor #portion').addEventListener("change", function(){ foodEditor.changePortion(food);});
    }
  },

  renderEditorInputs: function() {

    //Nutrition
    let units = waistline.nutrimentUnits;
    let ul = document.getElementById("nutrition");
    ul.innerHTML = ""; //Clear out old data

    for (let i in waistline.nutriments) {

      let n = waistline.nutriments[i];

      let li = document.createElement("li");
      li.className = "item-content item-input";

      ul.appendChild(li);

      let innerDiv = document.createElement("div");
      innerDiv.className = "item-inner";

      li.appendChild(innerDiv);

      let titleDiv = document.createElement("div");
      titleDiv.className = "item-input item-label";
      let text = waistline.strings[n] || n; //Localize
      titleDiv.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ") + " (" + (units[n] || "g") + ")";

      innerDiv.appendChild(titleDiv);

      let inputWrapper = document.createElement("div");
      inputWrapper.className = "item-input-wrap";

      innerDiv.appendChild(inputWrapper);

      let input = document.createElement("input");
      input.id = n;
      input.type = "number";
      input.min = "0";
      input.name = n;

      inputWrapper.appendChild(input);
    }
  },

  populateEditor: function(item) {

    //Existing item info
    if (item) {

      //If there is only 1 key then it's just a barcode from a scan. If there is more than one then display the other stuff
      if (Object.keys(item).length > 1) {
        document.querySelector("#foodlist-editor #title").innerText = "Edit Food";
        document.querySelector('#foodlist-editor #name').value = foodsMealsRecipes.formatItemText(item.name, 200);
        document.querySelector('#foodlist-editor #brand').value = foodsMealsRecipes.formatItemText(item.brand, 200);
        document.querySelector('#foodlist-editor #portion').value = parseFloat(item.portion);
        document.querySelector('#foodlist-editor #unit').value = item.portion.replace(/[^a-z]/gi, '');
      }

      //Populate nutrition inputs
      if (item.nutrition) {
        const nutriments = waistline.nutriments;

        let inputs = document.querySelectorAll("form input");

        for (let i = 0; i < inputs.length; i++) {

          if (nutriments.indexOf(inputs[i].id) == -1) continue; //Skip non-nutriment inputs

          n = inputs[i].id;

          inputs[i].value = item.nutrition[n];
        }
      }

      //Display barcode if present
      if (item.barcode) {
        document.querySelector('#barcode-container').style.display = "block";
        document.querySelector('#barcode').value = item.barcode;

        //If item doesn't contain image url download images - internet connection will be checked by getImages function
        if (item.barcode.indexOf("usda") != -1 && (!item.image_url || item.image_url == "" || item.image_url == null)) {
          foodlist.getImages(item.barcode, "image_front_url")
          .then(function(image_url) {
            //If an image was found add its URL to the item object
            if (image_url != false) {
              item.image_url = image_url; //Update item object
              if (item.image_url)
                renderImages(item);
            }
          });
        }
        else if (item.barcode.indexOf("usda") != -1 && item.image_url) {
          renderImages(item);
        }
      }
    }

    //Product images - only when connected to internet
    function renderImages(data) {
      if (settings.get("foodlist", "show-images") == true) {
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

  processForm: function(data) {

    const nutriments = waistline.nutriments;

    //Make sure there is data object set up correctly
    data = data || {};
    data.nutrition = data.nutrition || {};

    //Add date time
    var now = new Date();
    data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let inputs = document.querySelectorAll('#foodlist-editor input');
    let unit = document.querySelector('#foodlist-editor #unit').value;

    if (f7.input.validateInputs("#food-edit-form") == true) {

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
      /*if (data.nutrition.calories > 5000) {
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
      else {*/
        finalise(data); //Jump to finalise sub-function
      //}
    }

    function finalise(data) {

      /*if (foodlist.editor.uploader) {
        if (foodlist.editor.foodImages.length == 0) { //No images have been added for upload :(
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
      else {*/
        foodlist.editor.addToDB(data);
      //}
    }

    function postAndAddToDB(data) {
      let modal = document.querySelector('#food-editor ons-modal');
      modal.show();
      foodlist.editor.uploadToOFF(data)
      .then(function(data) {
        alert("upload complete");
        modal.hide();
        foodlist.editor.addToDB(data);
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
      f7.views.main.router.navigate("/foods-meals-recipes/");
    };
  },

  setupUploadFields: function(data) {
    document.querySelector("#food-editor #title").innerText = "Upload";
    document.querySelector('#food-editor #submit').style.display = "none";
    document.querySelector('#food-editor #upload-fields').style.display = "block";

    const btnCamera = document.querySelector('#food-editor #camera');
    btnCamera.style.display = "block";
    btnCamera.addEventListener("tap", foodlist.editor.takePicture);

    const btnUpload = document.querySelector('#food-editor #upload');
    btnUpload.style.display = "block";
    btnUpload.addEventListener("tap", function(event) {foodlist.editor.processEditor(data);});
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
        for (let i = 0; i < foodlist.editor.foodImages.length; i++) {
          if (foodlist.editor.foodImages[i].imagefield == imageTypes[input]) {
            foodlist.editor.foodImages.splice(i, 1); //Remove item from images array
            //Remove image from carousel
            let img = document.querySelector("#food-editor #images #"+imageTypes[input] + " img");
            img.removeEventListener("hold", deleteImage); //Remove img event listener
            let child = img.closest("ons-carousel-item");
            let parent = child.parentElement;
            parent.removeChild(child);
          }
        }

        let imageData = {"imagefield":imageTypes[input], "path":image_uri, "uploadType":"imgupload_"+imageTypes[input]};
        foodlist.editor.foodImages.push(imageData); //Push to class wide array

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
          foodlist.editor.foodImages.splice(ci.id, 1); //Remove item from images array
          //If there are no images left hide the image container
          if (foodlist.editor.foodImages.length == 0) {
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

      let username = settings.get("integrations", "off-username") || "waistline-app";
      let password = settings.get("integrations", "off-password") || "waistline";

      if (app.mode == "development") {
        username = "";
        password = "";
      }
      //let lang = app.getLocale() || "en";

      //Put data into the correct format for OFF request
      let s = "user_id=" + username + "&password=" + password;
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
          if (foodlist.editor.foodImages.length > 0) {
            foodlist.editor.uploadImagesToOFF(data.barcode, foodlist.editor.foodImages)
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

      let username = settings.get("integrations", "off-username") || "waistline-app";
      let password = settings.get("integrations", "off-password") || "waistline";
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
              formdata.append("user_id", username);
              formdata.append("password", password);
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

//Page initialization
document.addEventListener("page:init", function(event){
  if (event.target.matches(".page[data-name='foodlist-editor']")) {

    //If item ID was passed, get item from DB
    if (f7.views.main.router.currentRoute.context)
    {
      let id = f7.views.main.router.currentRoute.context.itemId;

      if (id) {

        let request = dbHandler.getItem(id, "foodList");

        request.onsuccess = function(e) {
          var item = e.target.result;
          foodlist.editor.init(item);
        };
      }
      else
        foodlist.editor.init();
    }
    else
      foodlist.editor.init();
  }
});
