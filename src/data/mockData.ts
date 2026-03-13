export type WeatherCondition = 'CLEAR' | 'RAIN' | 'STORM' | 'FOG'

export const getWeatherMultiplier = (weather: WeatherCondition) => {
  switch (weather) {
    case 'RAIN':
      return 1.5
    case 'STORM':
      return 2.0
    case 'FOG':
      return 1.3
    case 'CLEAR':
    default:
      return 1.0
  }
}

export const calculateSeverity = (baseSeverity: number, weather: WeatherCondition) => {
  return Math.min(10, Math.round(baseSeverity * getWeatherMultiplier(weather) * 10) / 10)
}

export const getSeverityLabel = (severity: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (severity >= 8) return 'critical'
  if (severity >= 6) return 'high'
  if (severity >= 4) return 'medium'
  return 'low'
}

export const mockKPIs = {
  zenScore: 84,
  totalDistance: 12450,
  carbonFootprint: 4.2,
  activeVehicles: 42,
  criticalEvents: 12,
}

export const mockRecentEvents = [
  {
    id: '1',
    type: 'HARD_BRAKE',
    driver: 'Driver #402',
    time: '10:45 AM',
    baseSeverity: 6,
    weather: 'RAIN' as WeatherCondition,
    location: 'Downtown Ave',
  },
  {
    id: '2',
    type: 'POTHOLE',
    driver: 'Driver #119',
    time: '10:32 AM',
    baseSeverity: 4,
    weather: 'STORM' as WeatherCondition,
    location: 'Main St.',
  },
  {
    id: '3',
    type: 'CORNERING',
    driver: 'Driver #084',
    time: '10:15 AM',
    baseSeverity: 5,
    weather: 'CLEAR' as WeatherCondition,
    location: 'Highway 61',
  },
  {
    id: '4',
    type: 'IDLING',
    driver: 'Driver #221',
    time: '09:50 AM',
    baseSeverity: 2,
    weather: 'FOG' as WeatherCondition,
    location: 'Depot',
  },
  {
    id: '5',
    type: 'RAPID_ACCEL',
    driver: 'Driver #402',
    time: '09:45 AM',
    baseSeverity: 8,
    weather: 'RAIN' as WeatherCondition,
    location: 'Downtown Ave',
  },
]

export const mockFleetRanking = [
  {
    id: 'D-402',
    name: 'James Holden',
    zenScore: 92,
    weatherPenalties: 2,
    distance: 1240,
    idlingTime: '2h 10m',
    trend: 'up',
  },
  {
    id: 'D-119',
    name: 'Naomi Nagata',
    zenScore: 88,
    weatherPenalties: 0,
    distance: 980,
    idlingTime: '1h 45m',
    trend: 'neutral',
  },
  {
    id: 'D-084',
    name: 'Amos Burton',
    zenScore: 76,
    weatherPenalties: 5,
    distance: 1450,
    idlingTime: '4h 20m',
    trend: 'down',
  },
  {
    id: 'D-221',
    name: 'Alex Kamal',
    zenScore: 65,
    weatherPenalties: 8,
    distance: 1100,
    idlingTime: '5h 05m',
    trend: 'down',
  },
  {
    id: 'D-007',
    name: 'Bobbie Draper',
    zenScore: 95,
    weatherPenalties: 1,
    distance: 1600,
    idlingTime: '0h 50m',
    trend: 'up',
  },
]

export const mockTripTimeline = Array.from({ length: 60 }).map((_, i) => ({
  time: `${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`,
  jerk: Math.random() * 5 + (i === 20 ? 15 : 0) + (i === 45 ? 12 : 0), // Spikes
  gForceZ: 1 + (Math.random() * 0.2 - 0.1) + (i === 35 ? 2.5 : 0), // Pothole impact
  lateralForce: Math.sin(i / 5) * 0.8 + Math.random() * 0.1, // Curves
}))

export const mockESGData = [
  { month: 'Jan', co2: 5.2, idling: 120 },
  { month: 'Feb', co2: 4.8, idling: 110 },
  { month: 'Mar', co2: 4.5, idling: 95 },
  { month: 'Apr', co2: 4.2, idling: 80 },
  { month: 'May', co2: 3.9, idling: 75 },
  { month: 'Jun', co2: 3.8, idling: 60 },
]
