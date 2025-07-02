package io.wholehog.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.clear();
    }

    public void onResume() {
        super.onResume();
        WebSettings settings = bridge.getWebView().getSettings();
        settings.setTextZoom(100);
        settings.setSupportZoom(false);
    }
}
