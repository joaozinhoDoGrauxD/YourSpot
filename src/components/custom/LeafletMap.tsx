import React, { useRef } from "react";
import { View, Platform, Linking } from "react-native";

let WebViewComponent: any = null;
if (Platform.OS !== "web") {
  WebViewComponent = require("react-native-webview").WebView;
}

export interface Spot {
  id: number | string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  image?: string;
  imageUrl?: string;
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  onLocationChanged: (latitude: number, longitude: number) => void;
  spots?: Spot[];
  onSpotSelect?: (spot: Spot) => void;
}

export default function LeafletMap({
  latitude,
  longitude,
  onLocationChanged,
  spots = [],
  onSpotSelect,
}: LeafletMapProps) {
  const webViewRef = useRef<any>(null);

  // Filtra apenas os spots que possuem coordenadas válidas e DIFERENTES de (0, 0)
  const validSpots = spots.filter((spot) => {
    const lat = Number(spot.latitude ?? spot.lat);
    const lng = Number(spot.longitude ?? spot.lng);
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0
    );
  });

  const handleMapMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "LOCATION_CHANGED") {
        onLocationChanged(data.latitude, data.longitude);
      } else if (data.type === "SPOT_SELECTED" && onSpotSelect) {
        onSpotSelect(data.spot);
      }
    } catch (e) {
      console.error("Erro ao ler mensagem do mapa", e);
    }
  };

  // Prepara o JSON seguro dos spots para injetar no JavaScript do Leaflet
  const spotsJson = JSON.stringify(
    validSpots.map((spot) => ({
      id: spot.id,
      title: spot.title || "Sem Título",
      description: spot.description || "",
      lat: Number(spot.latitude ?? spot.lat),
      lng: Number(spot.longitude ?? spot.lng),
      image: spot.image || spot.imageUrl || "",
    }))
  );

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background-color: #E5E5DE; }
        .leaflet-control-geocoder {
          position: fixed !important; top: 35px !important; left: 50% !important; transform: translateX(-50%) !important;
          width: 88% !important; max-width: 440px !important; margin: 0 !important; border-radius: 16px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; border: 1px solid rgba(255,255,255,0.6) !important;
          overflow: hidden; background: rgba(255, 255, 255, 0.75) !important; backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important; z-index: 99999 !important;
        }
        .leaflet-control-geocoder-form { width: 100% !important; display: flex !important; }
        .leaflet-control-geocoder-form input {
          font-size: 16px !important; padding: 14px 16px !important; width: 100% !important; border: none !important; outline: none !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: transparent !important;
        }
        .leaflet-control-geocoder-icon { display: none !important; }

        .spot-popup {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 200px;
        }
        .spot-popup h4 { margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #18181b; }
        .spot-popup p { margin: 0; font-size: 11px; color: #71717a; }
        .spot-popup img { width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${latitude}, ${longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Marcador da posição atual/selecionada
        var currentMarker = L.marker([${latitude}, ${longitude}]).addTo(map);

        // Marcadores customizados para os spots recebidos
        var spotsData = ${spotsJson};

        var spotIcon = L.divIcon({
          className: 'custom-spot-marker',
          html: '<div style="background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        spotsData.forEach(function(spot) {
          if (spot.lat && spot.lng) {
            var spotMarker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(map);
            
            var popupHtml = '<div class="spot-popup">';
            if (spot.image) {
              popupHtml += '<img src="' + spot.image + '" alt="' + spot.title + '" />';
            }
            popupHtml += '<h4>' + spot.title + '</h4>';
            if (spot.description) {
              popupHtml += '<p>' + spot.description + '</p>';
            }
            popupHtml += '</div>';

            spotMarker.bindPopup(popupHtml);

            spotMarker.on('click', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SPOT_SELECTED',
                  spot: spot
                }));
              }
            });
          }
        });

        // Campo de busca
        L.Control.geocoder({
          defaultMarkGeocode: false,
          placeholder: "📍 Buscar localização...",
          collapsed: false
        }).on('markgeocode', function(e) {
          var center = e.geocode.center; 
          map.flyTo(center, 16, { animate: true, duration: 1.5 }); 
          currentMarker.setLatLng(center);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOCATION_CHANGED', latitude: center.lat, longitude: center.lng }));
          }
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  if (Platform.OS === "web") {
    return (
      <View className="absolute inset-0 w-full h-full">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          srcDoc={mapHTML}
        />
      </View>
    );
  }

  return (
    <View className="absolute inset-0 w-full h-full">
      {WebViewComponent && (
        <WebViewComponent
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          className="flex-1"
          domStorageEnabled={true}
          javaScriptEnabled={true}
          onMessage={handleMapMessage}
          onShouldStartLoadWithRequest={(request: any) => {
            if (request.url.startsWith("http") && request.url !== "about:blank") {
              Linking.openURL(request.url).catch(() => {});
              return false;
            }
            return true;
          }}
        />
      )}
    </View>
  );
}