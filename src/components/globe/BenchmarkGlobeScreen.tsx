// src/components/globe/BenchmarkGlobeScreen.tsx (dev-only)
import React, { useEffect, useRef } from 'react';
import GlobeRenderer from './GlobeRenderer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function BenchmarkGlobeScreen() {
  const rafId = useRef<number>();

  useEffect(() => {
    let start = Date.now();

    function loop() {
      // simulate a back-and-forth pan
      // or just idle and let the monitor capture idle FPS
      if (Date.now() - start < 10000) {
        rafId.current = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(rafId.current!);
      }
    }
    loop();
    return () => cancelAnimationFrame(rafId.current!);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobeRenderer onRegionPress={() => {}} />
    </GestureHandlerRootView>
  );
}
