import React from 'react';
import { useEffect, useRef } from 'react';
import H from '@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js';

const InteractiveMap = ({ apikey, center = { lat: -37.8136, lng: 144.9631 }, zoom = 11, style, className }) => {
  const mapContainerRef = useRef(null);
  const platformRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Init HERE platform
    platformRef.current = new H.service.Platform({ dX27NwP07cY5hk01tlBlVgSB5FMyaiAyNT6G6EwR524});

    const engineType = H.Map.EngineType.HARP;
    const layers = platformRef.current.createDefaultLayers({ engineType, pois: true });

    // Create the map
    mapRef.current = new H.Map(
      mapContainerRef.current,
      layers.vector.normal.map,
      {
        engineType,
        pixelRatio: window.devicePixelRatio,
        center,
        zoom,
      }
    );

    // Enable interactions and default UI
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapRef.current));
    const ui = H.ui.UI.createDefault(mapRef.current, layers);

    // Example: marker at center
    const marker = new H.map.Marker(center);
    mapRef.current.addObject(marker);

    // Handle resize
    const onResize = () => mapRef.current.getViewPort().resize();
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      mapRef.current && mapRef.current.dispose();
      mapRef.current = null;
    };
  }, [apikey, center.lat, center.lng, zoom]);

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 400, ...style }}
    />
  );
};

export default InteractiveMap;
