import { Track } from '@/types/simulator'

export const SIMULATOR_TRACKS: Track[] = [
  {
    id: 'monza',
    name: 'Autodromo di Monza',
    location: 'Italy',
    shortCode: 'MON',
    laps: 53,
    length_km: 5.793,
    drs_zones: 3,
    imageUrl: '/tracks/monza.jpg', // placeholder
  },
  {
    id: 'monaco',
    name: 'Circuit de Monaco',
    location: 'Monaco',
    shortCode: 'MOC',
    laps: 78,
    length_km: 3.337,
    drs_zones: 0, // No DRS in Monaco
    imageUrl: '/tracks/monaco.jpg',
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Belgium',
    shortCode: 'SPA',
    laps: 44,
    length_km: 7.004,
    drs_zones: 2,
    imageUrl: '/tracks/spa.jpg',
  },
  {
    id: 'austin',
    name: 'Circuit of The Americas',
    location: 'USA',
    shortCode: 'AUS',
    laps: 56,
    length_km: 5.513,
    drs_zones: 2,
    imageUrl: '/tracks/austin.jpg',
  },
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    location: 'United Kingdom',
    shortCode: 'SIL',
    laps: 52,
    length_km: 5.891,
    drs_zones: 3,
    imageUrl: '/tracks/silverstone.jpg',
  },
]

export const getTrackById = (id: string) =>
  SIMULATOR_TRACKS.find((track) => track.id === id)
