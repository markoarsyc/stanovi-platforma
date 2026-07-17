import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const ACCENT = 'hsl(239, 84%, 67%)';
const LOAD_TIMEOUT_MS = 20000;

// Pinned to the same major the web frontend depends on; an unpinned CDN URL
// would let a future breaking release reach users with no deploy.
const MODEL_VIEWER_VERSION = '4.3.1';

// Same-origin with the Cloudinary GLB, which keeps model-viewer's fetch off the
// CORS path entirely.
const BASE_URL = 'https://res.cloudinary.com';

function buildHtml(src: string): string {
  const safeSrc = src.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: transparent; overflow: hidden; }
      model-viewer { width: 100vw; height: 100vh; background-color: transparent; }
    </style>
    <script type="module" src="https://unpkg.com/@google/model-viewer@${MODEL_VIEWER_VERSION}/dist/model-viewer.min.js"></script>
  </head>
  <body>
    <model-viewer
      id="viewer"
      src="${safeSrc}"
      alt="3D model stana"
      camera-controls
      auto-rotate
      loading="eager"
      touch-action="none"
      shadow-intensity="1"></model-viewer>
    <script>
      var post = function (msg) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
      };
      var viewer = document.getElementById('viewer');
      viewer.addEventListener('load', function () { post('loaded'); });
      viewer.addEventListener('error', function () { post('error'); });
      window.addEventListener('error', function () { post('error'); });
    </script>
  </body>
</html>`;
}

interface Model3DViewerProps {
  src: string;
}

export function Model3DViewer({ src }: Model3DViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const loadedRef = useRef(false);

  // The CDN script or the model itself can stall without ever firing an event,
  // which would leave the spinner up forever.
  useEffect(() => {
    loadedRef.current = false;
    setLoaded(false);
    setError(false);
    const timeout = setTimeout(() => {
      if (!loadedRef.current) setError(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [src]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    if (event.nativeEvent.data === 'loaded') {
      loadedRef.current = true;
      setLoaded(true);
    } else if (event.nativeEvent.data === 'error') {
      setError(true);
    }
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={44} color="#9A9AB0" />
        <Text className="mt-3 text-center font-body text-body-base text-muted">
          3D model se ne može učitati
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHtml(src), baseUrl: BASE_URL }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onError={() => setError(true)}
        onHttpError={() => setError(true)}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
      {!loaded ? (
        <View className="absolute inset-0 items-center justify-center bg-background">
          <ActivityIndicator color={ACCENT} />
          <Text className="mt-3 font-body text-body-sm text-muted">Učitavanje 3D modela...</Text>
        </View>
      ) : null}
    </View>
  );
}
