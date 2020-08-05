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

import net.ossrs.rtmp.ConnectCheckerRtmp;

import android.graphics.Bitmap;

import java.util.HashMap;
import java.util.Map;

public class RTMPModule extends ReactContextBaseJavaModule {
    private static RTMPTextureView textureView;
    private static RtmpCamera1 rtmpCamera1;
    private static boolean isSurfaceCreated;
    private static Promise whenReadyPromise;

    public RTMPModule(ReactApplicationContext reactContext) {
        super(reactContext);
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
            Bitmap scaled = textureView.getBitmap(width, height);
            if (scaled == null) {
              promise.reject("Failed to capture bitmap from textureView");
              return;
            }
            boolean hasAlpha = scaled.hasAlpha();
            WritableNativeMap result = new WritableNativeMap();
            WritableNativeArray pixels = new WritableNativeArray();
            for (int x = 0; x < width; x++) {
              for (int y = 0; y < height; y++) {
                int pixel = scaled.getPixel(x, y);
                int R = (pixel & 0xff0000) >> 16;
                int G = (pixel & 0x00ff00) >> 8;
                int B = (pixel & 0x0000ff) >> 0;
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
    }

    public static void setTextureView(RTMPTextureView surface) {
        textureView = surface;
        rtmpCamera1 = new RtmpCamera1(textureView, new ConnectCheckerRtmp() {
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

    public static void destroyTextureView() {
        if (rtmpCamera1 != null && rtmpCamera1.isStreaming()) {
            rtmpCamera1.stopStream();
        }
        rtmpCamera1 = null;
        textureView = null;
        isSurfaceCreated = false;
    }
}
