import type { DateLike } from '@vueuse/core'

interface Coordinates {
  latitude: number
  longitude: number
}

interface WeatherData {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level?: number
    grnd_level?: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  rain?: {
    '1h'?: number
    '3h'?: number
  }
  snow?: {
    '1h'?: number
    '3h'?: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type?: number
    id?: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

interface LocationData {
  name: string
  local_names?: {
    [key: string]: string
  }
  lat: number
  lon: number
  country: string
  state?: string
}

export function useWeather() {
  const coordinates = ref<Coordinates | null>(null)
  const locationError = ref<string | null>(null)
  const isGettingLocation = ref(false)
  const lastUpdatedTime = ref<DateLike>()

  const geolocationPermission = usePermission('geolocation')

  let onDataRefreshedCallback: (() => void) | null = null

  const onDataRefreshed = (callback: () => void) => {
    onDataRefreshedCallback = callback
  }

  const weatherUrl = import.meta.env.PROD
    ? `${import.meta.env.VITE_OPEN_WEATHER_API_URL}/data/2.5`
    : '/api/weather'

  const geoUrl = import.meta.env.PROD
    ? `${import.meta.env.VITE_OPEN_WEATHER_API_URL}/geo/1.0`
    : '/api/geo'

  // 天氣 URL
  const apiUrl = computed(() => {
    if (!coordinates.value)
      return ''

    const { latitude, longitude } = coordinates.value
    const params = new URLSearchParams({
      appid: import.meta.env.VITE_OPEN_WEATHER_API_KEY,
      lat: latitude.toString(),
      lon: longitude.toString(),
      exclude: 'minutely,hourly,daily,alerts',
      units: 'metric',
      lang: 'zh_tw',
    })

    return `${weatherUrl}/weather?${params.toString()}`
  })

  // 反向地理編碼 URL
  const reverseGeoUrl = computed(() => {
    if (!coordinates.value)
      return ''

    const { latitude, longitude } = coordinates.value
    const params = new URLSearchParams({
      appid: import.meta.env.VITE_OPEN_WEATHER_API_KEY,
      lat: latitude.toString(),
      lon: longitude.toString(),
      limit: '1',
    })

    return `${geoUrl}/reverse?${params.toString()}`
  })

  // 取得天氣資料
  const {
    data: weatherData,
    error: fetchError,
    isFetching,
    execute,
  } = useFetch<WeatherData>(
    apiUrl,
    {
      immediate: false,
      refetch: false,
    },
  ).json()

  // 取得城市名稱
  const {
    data: locationData,
    error: locationFetchError,
    isFetching: isLocationFetching,
    execute: executeLocationFetch,
  } = useFetch<LocationData[]>(
    reverseGeoUrl,
    {
      immediate: false,
      refetch: false,
    },
  ).json()

  // 將 Geolocation API 封裝 Promise
  const getPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })
  }

  // 取得使用者當前位置
  const getCurrentLocation = async (): Promise<void> => {
    try {
      isGettingLocation.value = true
      locationError.value = null

      const position = await getPosition()

      coordinates.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      await Promise.all([
        execute(),
        executeLocationFetch(),
      ])

      // 成功獲取天氣資訊後更新時間
      lastUpdatedTime.value = new Date()
    }
    catch (error) {
      let errorMessage = '無法取得您的位置'

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒絕了位置存取權限'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '無法取得您的位置資訊'
            break
          case error.TIMEOUT:
            errorMessage = '取得位置逾時，請稍後再試'
            break
        }
      }
      else if (error instanceof Error) {
        errorMessage = error.message
      }

      locationError.value = errorMessage
      throw error
    }
    finally {
      isGettingLocation.value = false
    }
  }

  // 監聽地理位置權限變化
  watch(geolocationPermission, async (newState, oldState) => {
    // 只在權限從非授予狀態變為授予時觸發
    if (newState === 'granted' && oldState !== 'granted' && locationError.value) {
      locationError.value = null
      await getCurrentLocation()
      // 數據刷新後觸發回調，讓組件重新初始化動畫
      nextTick(() => {
        onDataRefreshedCallback?.()
      })
    }
  })

  // 格式化溫度
  const temperature = computed(() => {
    if (!weatherData.value?.main)
      return 0
    return Math.round(weatherData.value.main.temp)
  })

  // 取得天氣圖示 URL
  const weatherIconUrl = computed(() => {
    if (!weatherData.value?.weather?.[0])
      return ''
    const icon = weatherData.value.weather[0].icon
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  })

  // 天氣描述
  const weatherDescription = computed(() => {
    return weatherData.value?.weather?.[0]?.description || ''
  })

  // 體感溫度
  const feelsLike = computed(() => {
    if (!weatherData.value?.main)
      return null
    return Math.round(weatherData.value.main.feels_like)
  })

  // 濕度
  const humidity = computed(() => {
    return weatherData.value?.main?.humidity ?? null
  })

  // 風速
  const windSpeed = computed(() => {
    if (!weatherData.value?.wind)
      return null
    return weatherData.value.wind.speed
  })

  // 能見度
  const visibility = computed(() => {
    if (!weatherData.value?.visibility)
      return null
    return (weatherData.value.visibility / 1000).toFixed(1)
  })

  // 城市名稱
  const cityName = computed(() => {
    const location = locationData.value?.[0]
    if (!location)
      return ''

    const zhTwName = location.local_names?.zh_tw || location.local_names?.zh
    if (zhTwName)
      return zhTwName

    return location.name
  })

  // 完整位置 (城市, 國家)
  const fullLocation = computed(() => {
    const location = locationData.value?.[0]
    if (!location)
      return ''

    const city = cityName.value
    const state = location.state
    const country = location.country

    if (state) {
      return `${city}, ${state}, ${country}`
    }
    return `${city}, ${country}`
  })

  // 載入狀態
  const isLoading = computed(() =>
    isGettingLocation.value || isFetching.value || isLocationFetching.value,
  )

  // 錯誤狀態
  const error = computed(() =>
    locationError.value || fetchError.value || locationFetchError.value,
  )

  return {
    coordinates,
    weatherData,
    locationData,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    visibility,
    weatherIconUrl,
    weatherDescription,
    cityName,
    fullLocation,
    lastUpdatedTime,
    isLoading,
    error,
    getCurrentLocation,
    onDataRefreshed,
    refetch: () => Promise.all([execute(), executeLocationFetch()]),
  }
}
