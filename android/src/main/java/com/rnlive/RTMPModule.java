package com.rnlive;

import android.widget.Toast;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.pedro.rtplibrary.rtmp.RtmpCamera1;
import com.pedro.rtplibrary.view.TakePhotoCallback;
import com.pedro.encoder.input.video.CameraHelper;
import com.pedro.rtplibrary.view.OpenGlView;
import net.ossrs.rtmp.ConnectCheckerRtmp;

import android.graphics.Bitmap;
import android.graphics.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import java.util.HashMap;
import java.util.Map;

public class RTMPModule extends ReactContextBaseJavaModule {
    private static OpenGlView openGlView;
    private static RtmpCamera1 rtmpCamera1;
    private static boolean isSurfaceCreated;
    private static Promise whenReadyPromise;
    private ReactApplicationContext context;

    public RTMPModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "RTMPModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @ReactMethod
    public void show(String message) {
        Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public void startStream(String rtmpUrl, Integer width, Integer height, Promise promise) {
        if (isSurfaceCreated) {
            if (rtmpCamera1 != null && !rtmpCamera1.isStreaming() && rtmpCamera1.prepareAudio() && rtmpCamera1.prepareVideo(width, height, 30, 500000, false, 90)) {
                rtmpCamera1.startStream(rtmpUrl);
            } else {
                Toast.makeText(getReactApplicationContext(), "Failed to preparing RTMP builder.", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(getReactApplicationContext(), "Surface view is not ready.", Toast.LENGTH_SHORT).show();
        }

        promise.resolve(rtmpCamera1 != null && rtmpCamera1.isStreaming());
    }

    @ReactMethod
    public void stopStream(Promise promise) {
        if (rtmpCamera1 != null && rtmpCamera1.isStreaming()) {
            rtmpCamera1.stopStream();
        }

        promise.resolve(rtmpCamera1 != null && !rtmpCamera1.isStreaming());
    }


    @ReactMethod
    public void startPreview(Integer camFace) {
        if (rtmpCamera1 != null) {
            rtmpCamera1.startPreview(camFace == 1 ? CameraHelper.Facing.FRONT : CameraHelper.Facing.BACK);
        }
    }

    @ReactMethod
    public void startPreviewRatio(Integer camFace, Integer width, Integer height) {
        if (rtmpCamera1 != null) {
            rtmpCamera1.startPreview(camFace == 1 ? CameraHelper.Facing.FRONT : CameraHelper.Facing.BACK, width, height);
        }
    }

    @ReactMethod
    public void stopPreview() {
        if (rtmpCamera1 != null) {
            rtmpCamera1.stopPreview();
        }
    }

    @ReactMethod
    public void disableAudio() {
        if (rtmpCamera1 != null && rtmpCamera1.isStreaming()) {
            rtmpCamera1.disableAudio();
        }
    }

    @ReactMethod
    public void enableAudio() {
        if (rtmpCamera1 != null && rtmpCamera1.isStreaming()) {
            rtmpCamera1.enableAudio();
        }
    }

    @ReactMethod
    public void switchCamera(Promise promise) {
        if (rtmpCamera1 != null) {
            rtmpCamera1.switchCamera();
            promise.resolve(rtmpCamera1.isStreaming());
        }
    }

    @ReactMethod
    public void onCameraReady(Promise promise) {
        if (rtmpCamera1 != null) {
            promise.resolve(true);
        } else {
            RTMPModule.whenReadyPromise = promise;
        }
    }

    @ReactMethod
    public void takePhoto(final Integer width, final Integer height, final Promise promise) {
        if (rtmpCamera1 != null) {
          System.out.println("Trying to get bitmap");
          rtmpCamera1.getGlInterface().takePhoto(new TakePhotoCallback() {
            @Override
            public void onTakePhoto(Bitmap scaled) {
              // Bitmap scaled = Bitmap.createScaledBitmap(bitmap, width, height, true);
              if (scaled == null) {
                promise.reject("Failed to capture bitmap from textureView");
                return;
              }
              boolean hasAlpha = scaled.hasAlpha();
              WritableNativeMap result = new WritableNativeMap();
              WritableNativeArray pixels = new WritableNativeArray();
              for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                  int pixel = scaled.getPixel(x, y);
                  int R = Color.red(pixel);
                  int G = Color.green(pixel);
                  int B = Color.blue(pixel);
                  pixels.pushInt(R);
                  pixels.pushInt(G);
                  pixels.pushInt(B);
                }
              }
              result.putInt("width", width);
              result.putInt("height", height);
              result.putBoolean("hasAlpha", hasAlpha);
              result.putArray("pixels", pixels);
              promise.resolve(result);
            }
          }, width, height);
        }
    }

    public static void setOpenGlView(OpenGlView view) {
        openGlView = view;
        rtmpCamera1 = new RtmpCamera1(openGlView, new ConnectCheckerRtmp() {
            @Override
            public void onConnectionSuccessRtmp() {

            }

            @Override
            public void onConnectionFailedRtmp(String s) {

            }

            @Override
            public void onDisconnectRtmp() {

            }

            @Override
            public void onAuthErrorRtmp() {

            }

            @Override
            public void onAuthSuccessRtmp() {

            }

            @Override
            public void onNewBitrateRtmp(long bitrate) {

            }
        });

        isSurfaceCreated = true;
        if (whenReadyPromise != null) {
          whenReadyPromise.resolve(true);
        }
    }

    public static void destroyOpenGlView() {
        if (rtmpCamera1 != null && rtmpCamera1.isStreaming()) {
            rtmpCamera1.stopStream();
        }
        rtmpCamera1 = null;
        openGlView = null;
        isSurfaceCreated = false;
    }
}
