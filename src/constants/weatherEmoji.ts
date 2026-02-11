export const WEATHER_EMOJI_MAP: Record<string, string> = {
  // Clear sky
  '01d': '☀️',
  '01n': '🌙',

  // Few clouds
  '02d': '⛅',
  '02n': '☁️',

  // Scattered clouds
  '03d': '☁️',
  '03n': '☁️',

  // Broken clouds
  '04d': '☁️',
  '04n': '☁️',

  // Shower rain
  '09d': '🌧️',
  '09n': '🌧️',

  // Rain
  '10d': '🌦️',
  '10n': '🌧️',

  // Thunderstorm
  '11d': '⛈️',
  '11n': '⛈️',

  // Snow
  '13d': '❄️',
  '13n': '❄️',

  // Mist/Fog
  '50d': '🌫️',
  '50n': '🌫️',
}

/**
 * Get weather emoji from OpenWeatherMap icon code
 * @param iconCode - OpenWeatherMap icon code (e.g., '01d', '10n')
 * @returns Weather emoji, defaults to '🌡️' if not found
 */
export function getWeatherEmoji(iconCode: string): string {
  return WEATHER_EMOJI_MAP[iconCode] || '🌡️'
}
