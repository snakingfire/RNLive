package com.rnlive;

import android.util.Log;
import android.view.TextureView.SurfaceTextureListener;
import android.view.TextureView;
import android.graphics.SurfaceTexture;
import android.view.View;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class RTMPStreamingViewManager extends SimpleViewManager<View> implements SurfaceTextureListener {
    private RTMPTextureView textureView;

    @Override
    public String getName() {
        return "RTMPStreamingView";
    }

    @Override
    protected View createViewInstance(ThemedReactContext reactContext) {
        textureView = new RTMPTextureView(reactContext);
        textureView.setSurfaceTextureListener(this);
        return textureView;
    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
        RTMPModule.setTextureView(textureView);
    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {

    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {

    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        RTMPModule.destroyTextureView();
        return true;
    }
}
