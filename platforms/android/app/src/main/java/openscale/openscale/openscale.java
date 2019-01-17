/* Copyright (C) 2018  olie.xdev <olie.xdev@googlemail.com>
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
package openscale;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.BaseColumns;

import org.apache.cordova.BuildConfig;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

public class openscale extends CordovaPlugin {
    private final int REQUEST_CODE = 1;

    private final String APP_ID = "com.health.openscale";
    private final String AUTHORITY = APP_ID + ".provider";
    private final String REQUIRED_PERMISSION = APP_ID + ".READ_WRITE_DATA";

    private final Uri metaUri = new Uri.Builder()
            .scheme(ContentResolver.SCHEME_CONTENT)
            .authority(AUTHORITY)
            .path("meta")
            .build();

    private final Uri usersUri = new Uri.Builder()
            .scheme(ContentResolver.SCHEME_CONTENT)
            .authority(AUTHORITY)
            .path("users")
            .build();

    private final Uri measurementsUri = new Uri.Builder()
            .scheme(ContentResolver.SCHEME_CONTENT)
            .authority(AUTHORITY)
            .path("measurements")
            .build();

    private CallbackContext requestCallbackContext;
    
    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
    }

    @Override
    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException
    {
        if (requestCode == REQUEST_CODE) {
            if (grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                requestCallbackContext.error("openScale permission denied");
            }
            else {
                requestCallbackContext.success("openScale permission granted");
            }
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        if (action.equals("requestPermission")) {
            requestCallbackContext = callbackContext;
            
            if (cordova.hasPermission(REQUIRED_PERMISSION)) {
                callbackContext.success("openScale permission granted");
            } else {
                cordova.requestPermission(this, REQUEST_CODE, REQUIRED_PERMISSION);
            }
        }

        if (cordova.hasPermission(REQUIRED_PERMISSION)) {
            if (action.equals("exportWaistlineData")) {
                long timestamp = args.getLong(0);
                float calories = (float) args.getDouble(1);

                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        updateOpenScaleData(timestamp, calories, callbackContext);
                    }
                });
            }

            if (action.equals("importOpenScaleData")) {
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        importOpenScaleData(callbackContext);
                    }
                });
            }
        } else {
            callbackContext.error("openScale permission denied, please request first the openScale permission");
            return false;
        }

        return true;
    }

    private void updateOpenScaleData(long datetime, float calories, CallbackContext callbackContext) {
        Date date = new Date(datetime);
        ContentValues updateValues = new ContentValues();

        updateValues.put("datetime", datetime);
        updateValues.put("calories", calories);

        int updateCount = cordova.getContext().getContentResolver().update(measurementsUri, updateValues, null, null);

        if (updateCount == 0) {
            callbackContext.error("couldn't update openScale measurement; no measurement with timestamp " + datetime + " found");
        } else {
            callbackContext.success("update waistline measurement to openScale with datetime: " + date + " calories: " + calories);
        }
    }

    private void importOpenScaleData(CallbackContext callbackContext) {
        try {
            Cursor cursor = cordova.getContext().getContentResolver().query(
                    metaUri, null, null, null, null);

            try {
                while (cursor.moveToNext()) {
                    int apiVersion = cursor.getInt(cursor.getColumnIndex("apiVersion"));
                    int versionCode = cursor.getInt(cursor.getColumnIndex("versionCode"));

                    System.out.println("openScale version " + versionCode + " with content provider API version " + apiVersion);
                }
            } finally {
                cursor.close();
            }

            cursor = cordova.getContext().getContentResolver().query(
                    usersUri, null, null, null, null);

            try {
                while (cursor.moveToNext()) {
                    long userId = cursor.getLong(cursor.getColumnIndex(BaseColumns._ID));
                    Cursor m = cordova.getContext().getContentResolver().query(
                            ContentUris.withAppendedId(measurementsUri, userId),
                            null, null, null, null);

                    JSONArray values = new JSONArray();

                    try {
                        while (m.moveToNext()) {
                            long datetime = m.getLong(m.getColumnIndex("datetime"));
                            float weight = m.getFloat(m.getColumnIndex("weight"));

                            JSONObject object  = new JSONObject();
                            object.put("timestamp", datetime);
                            object.put("weight", weight);

                            values.put(object);

                            System.out.println("imported openScale measurement datetime " + datetime + " weight " + weight);
                        }
                    } finally {
                        callbackContext.success(values);
                        m.close();
                    }
                }
            } finally {
                cursor.close();
            }
        }
        catch (Exception e) {
            callbackContext.error("openScale content provider error: " + e.getMessage());
        }
    }
}


