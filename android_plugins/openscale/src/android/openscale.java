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

public class openscale extends CordovaPlugin {
    final int REQUEST_CODE = 1;

    final String APP_ID = "com.health.openscale";
    final String AUTHORITY = APP_ID + ".provider";
    final String REQUIRED_PERMISSION = APP_ID + ".READ_DATA";

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
                System.out.println("PERMISSION DENIED");
            }
            else {
                System.out.println("PERMISSION GRANTED");
                getProviderData();
            }
        }
    }


    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        if (cordova.hasPermission(REQUIRED_PERMISSION)) {
            System.out.println("PERMISSION GRANTED");
            getProviderData();
        } else {
            System.out.println("REQUEST PERMISSION");
            cordova.requestPermission(this, REQUEST_CODE, REQUIRED_PERMISSION);
        }

        /*if (action.equals("coolMethod")) {
            String message = args.getString(0);
            this.coolMethod(message, callbackContext);
            return true;
        }

        return false;
        */
        return true;
    }

    private void getProviderData() {
        Uri metaUri = new Uri.Builder()
                .scheme(ContentResolver.SCHEME_CONTENT)
                .authority(AUTHORITY)
                .path("meta")
                .build();
        Uri usersUri = new Uri.Builder()
                .scheme(ContentResolver.SCHEME_CONTENT)
                .authority(AUTHORITY)
                .path("users")
                .build();
        Uri measurementsUri = new Uri.Builder()
                .scheme(ContentResolver.SCHEME_CONTENT)
                .authority(AUTHORITY)
                .path("measurements")
                .build();

        StringBuilder s = new StringBuilder();

        try {
            Cursor cursor = cordova.getContext().getContentResolver().query(
                    metaUri, null, null, null, null);

            try {
                while (cursor.moveToNext()) {
                    s.append("====== META ======");
                    s.append(System.lineSeparator());

                    for (int i = 0; i < cursor.getColumnCount(); ++i) {
                        s.append(" - ").append(cursor.getColumnName(i));
                        s.append(": ").append(cursor.getString(i));
                        s.append(System.lineSeparator());
                    }
                }
            } finally {
                cursor.close();
            }

            cursor = cordova.getContext().getContentResolver().query(
                    usersUri, null, null, null, null);

            try {
                int user = 0;
                while (cursor.moveToNext()) {
                    s.append("====== USER ");
                    s.append(++user).append("/").append(cursor.getCount());
                    s.append(" ======");
                    s.append(System.lineSeparator());

                    for (int i = 0; i < cursor.getColumnCount(); ++i) {
                        s.append(" - ").append(cursor.getColumnName(i));
                        s.append(": ").append(cursor.getString(i));
                        s.append(System.lineSeparator());
                    }

                    long userId = cursor.getLong(cursor.getColumnIndex(BaseColumns._ID));
                    Cursor m = cordova.getContext().getContentResolver().query(
                            ContentUris.withAppendedId(measurementsUri, userId),
                            null, null, null, null);

                    try {
                        int measurement = 0;
                        while (m.moveToNext()) {
                            s.append("++++++ MEASUREMENT ");
                            s.append(++measurement).append("/").append(m.getCount());
                            s.append(" ++++++");
                            s.append(System.lineSeparator());
                            for (int i = 0; i < m.getColumnCount(); ++i) {
                                s.append("  * ").append(m.getColumnName(i));
                                s.append(": ").append(m.getString(i));
                                s.append(System.lineSeparator());
                            }
                        }
                    } finally {
                        m.close();
                    }
                }
            } finally {
                cursor.close();
            }
        }
        catch (Exception e) {
            s.append(System.lineSeparator());
            s.append("Error: ");
            s.append(e);
        }

        System.out.println("openScale data: " + s.toString());
    }

    /*private void coolMethod(String message, CallbackContext callbackContext) {
        System.out.println("Hello World my foo");
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }*/
}




