'use client';

import { useEffect, useRef } from 'react';
import H from '@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js';

export default function InteractiveMap({
  apikey,
  center = { lat: -37.8136, lng: 144.9631 },
  zoom = 11,
  style,
  className,
}) {
  const containerRef = useRef(null);
  const platformRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Correct: pass { apikey }
    platformRef.current = new H.service.Platform({ apikey });

    const engineType = H.Map.EngineType.HARP;
    const layers = platformRef.current.createDefaultLayers({ engineType, pois: true });

    const map = new H.Map(
      containerRef.current,
      layers.vector.normal.map,
      { engineType, pixelRatio: window.devicePixelRatio, center, zoom }
    );
    mapRef.current = map;

    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, layers);

    map.addObject(new H.map.Marker(center));

    const onResize = () => map.getViewPort().resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      map.dispose();
      mapRef.current = null;
    };
  }, [apikey, center.lat, center.lng, zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 400, ...style }}
    />
  );
}
