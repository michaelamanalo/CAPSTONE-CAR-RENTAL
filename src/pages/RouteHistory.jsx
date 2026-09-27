import React from 'react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function RouteHistory() {
  return (
    <PagePlaceholder
      eyebrow="Coming next"
      title="Route History & Playback"
      description="Pick a vehicle and date range to replay its trip on the map, with distance, duration, and timestamped waypoints. Needs the historical coordinate table from the backend before this can be wired up."
    />
  );
}
