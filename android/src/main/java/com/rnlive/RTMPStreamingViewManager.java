package com.rnlive;

import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import com.pedro.rtplibrary.view.OpenGlView;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class RTMPStreamingViewManager extends SimpleViewManager<View> implements SurfaceHolder.Callback {
    private OpenGlView openGlView;
    private SurfaceHolder surfaceHolder;

    @Override
    public String getName() {
        return "RTMPStreamingView";
    }

    @Override
    protected View createViewInstance(ThemedReactContext reactContext) {
        openGlView = new OpenGlView(reactContext);
        surfaceHolder = openGlView.getHolder();
        surfaceHolder.addCallback(this);
        return openGlView;
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
      RTMPModule.setOpenGlView(openGlView);
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        RTMPModule.destroyOpenGlView();
        openGlView.surfaceDestroyed(holder);
    }
}
