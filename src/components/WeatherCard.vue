<script setup lang="ts">
import type { AnimationPlaybackControls } from 'motion-v'
import { animate, motion, RowValue, useMotionValue, useTransform } from 'motion-v'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { WEATHER_EMOJI_MAP } from '~/constants/weatherEmoji'

defineOptions({
  name: 'WeatherCard',
})

const {
  weatherData,
  temperature,
  feelsLike,
  humidity,
  windSpeed,
  visibility,
  weatherIconUrl,
  weatherDescription,
  fullLocation,
  lastUpdatedTime,
  isLoading,
  error,
  getCurrentLocation,
  onDataRefreshed,
} = useWeather()

const { isClipboardSupported, copyText, copyImage } = useClipboardShare()
const { showToast } = useToast()

const count = useMotionValue(0)
const roundedTemperature = useTransform(() => Math.round(count.get()))

const weatherContentRef = ref<HTMLElement>()
const isCopyingImage = ref(false)

// 格式化更新時間為 YYYY/MM/DD HH:mm:ss
const formattedUpdateTime = useDateFormat(lastUpdatedTime, 'YYYY/MM/DD HH:mm:ss')

let controls: AnimationPlaybackControls

function initAnimation() {
  controls?.stop()
  count.set(0)
  nextTick(() => {
    controls = animate(count, temperature.value, { duration: 1.5 })
  })
}

async function handleRefresh() {
  await getCurrentLocation()
  // Always reinitialize animation on refresh
  initAnimation()
}

function formatWeatherText(): string {
  if (!weatherData.value)
    return ''

  const icon = weatherData.value.weather?.[0]?.icon || ''
  const emoji = WEATHER_EMOJI_MAP[icon] || '🌡️'

  return `${fullLocation.value}
當前天氣：${emoji} ${weatherDescription.value}
🌡️ 溫度：${temperature.value}°C
🌡️ 體感：${feelsLike.value}°C
💧 濕度：${humidity.value}%
💨 風速：${windSpeed.value} m/s
👁️ 能見度：${visibility.value} km`
}

async function handleCopyAsText(): Promise<void> {
  try {
    const text = formatWeatherText()
    await copyText(text)
    showToast('天氣資訊已複製到剪貼簿', 'success')
  }
  catch (error) {
    console.error('Failed to copy text:', error)
    showToast('複製失敗，請重試', 'error')
  }
}

async function handleCopyAsImage(): Promise<void> {
  if (!weatherContentRef.value) {
    showToast('無法複製圖片', 'error')
    return
  }

  try {
    isCopyingImage.value = true
    await copyImage(weatherContentRef.value)
    showToast('天氣卡片已複製為圖片', 'success')
  }
  catch (error) {
    console.error('Failed to copy image:', error)
    showToast('複製圖片失敗，請重試', 'error')
  }
  finally {
    isCopyingImage.value = false
  }
}

onMounted(async () => {
  // 註冊數據刷新回調，用於權限重新授予後重新初始化動畫
  onDataRefreshed(initAnimation)

  await getCurrentLocation()
  initAnimation()
})

onUnmounted(() => {
  controls?.stop()
})
</script>

<template>
  <div class="mx-auto max-w-96">
    <div
      ref="weatherContentRef"
      class="
        h-full rounded-2xl from-stone-100 to-primary-light text-stone-700
        shadow-2xl
        not-dark:bg-linear-to-br
        dark:bg-primary-dark dark:text-stone-100
      "
    >
      <!-- 標題 -->
      <div class="flex items-center justify-between px-6 pt-8 pb-6">
        <h2 class="text-2xl font-bold">
          當前天氣
        </h2>

        <div class="hide-me flex items-center gap-2">
          <!-- 分享按鈕 -->
          <DropdownMenuRoot v-if="isClipboardSupported && weatherData">
            <DropdownMenuTrigger
              :disabled="isCopyingImage"
              class="
                block rounded-full p-2 leading-0 transition-colors
                not-disabled:hover:bg-gray-200
                disabled:cursor-not-allowed disabled:opacity-50
              "
              :title="isCopyingImage ? '複製中...' : '分享天氣資訊'"
              as-child
            >
              <motion.button
                type="button"
                :initial="{ scale: 0, opacity: 0 }"
                :animate="{ scale: 1, opacity: 1 }"
                :transition="{ delay: 1.5, duration: 0.3 }"
              >
                <span
                  class="size-6"
                  :class="
                    isCopyingImage
                      ? 'icon-[svg-spinners--180-ring-with-bg]'
                      : 'icon-[carbon--share]'
                  "
                ></span>
              </motion.button>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent
                class="
                  z-50 min-w-48 overflow-hidden rounded-lg border bg-white p-1
                  shadow-lg
                  dark:border-stone-700 dark:bg-stone-800
                "
                :side-offset="5"
              >
                <DropdownMenuItem
                  class="
                    flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2
                    text-sm transition-colors outline-none
                    hover:bg-gray-100
                    dark:hover:bg-stone-700
                  "
                  @select="handleCopyAsImage"
                >
                  <span class="icon-[carbon--image] size-5"></span>
                  <span>複製為圖片</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  class="
                    flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2
                    text-sm transition-colors outline-none
                    hover:bg-gray-100
                    dark:hover:bg-stone-700
                  "
                  @select="handleCopyAsText"
                >
                  <span class="icon-[carbon--text-align-left] size-5"></span>
                  <span>複製為文字</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <!-- 重新整理按鈕 -->
          <button
            type="button"
            :disabled="isLoading"
            class="
              block rounded-full p-2 leading-0 transition-colors
              not-disabled:hover:bg-gray-200
              disabled:opacity-50
            "
            title="重新整理"
            @click="handleRefresh"
          >
            <span class="icon-[carbon--rotate-360] size-6"></span>
          </button>
        </div>
      </div>

      <!-- 載入中狀態 -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-12"
      >
        <div
          class="
            size-16 animate-spin rounded-full border-4 border-stone-400
            border-t-transparent
            dark:border-stone-300 dark:border-t-primary-dark
          "
        ></div>
        <p class="mt-4 text-stone-700/70 dark:text-stone-300">
          正在取得天氣資訊...
        </p>
      </div>

      <!-- 錯誤狀態 -->
      <div
        v-else-if="error"
        class="rounded-lg border border-red-300 bg-red-500/20 p-4"
      >
        <div class="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 size-6 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex flex-col">
            <h3 class="mb-1 text-start font-semibold">
              發生錯誤
            </h3>
            <p class="text-sm text-black/90">
              {{ error }}
            </p>
            <button
              class="
                mt-3 w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium
                text-blue-600 transition-colors
                hover:bg-white/90
              "
              @click="getCurrentLocation"
            >
              重試
            </button>
          </div>
        </div>
      </div>

      <!-- 天氣資訊 -->
      <div
        v-else-if="weatherData"
        class="p-6 text-center"
      >
        <!-- 天氣圖示和溫度 -->
        <div class="mb-4 flex items-center justify-center gap-x-4">
          <!-- 天氣 Icon -->
          <motion.div
            class="size-16 rounded-full bg-stone-300"
            :initial="{ scale: 0 }"
            :animate="{ scale: 1 }"
          >
            <img
              v-if="weatherIconUrl"
              :src="weatherIconUrl"
              :alt="weatherDescription"
            >
          </motion.div>
          <!-- 溫度 -->
          <div class="mr-8 w-20 -translate-y-1 text-7xl font-bold">
            <motion.pre><RowValue :value="roundedTemperature" />&deg;</motion.pre>
          </div>
        </div>

        <!-- 天氣描述 -->
        <motion.p
          class="
            mb-6 text-xl font-semibold text-stone-500 capitalize
            dark:text-stone-300
          "
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
        >
          {{ weatherDescription }}
        </motion.p>

        <!-- 位置 -->
        <motion.p
          class="text-stone-500 dark:text-stone-300"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 0.2 }"
        >
          {{ fullLocation }}
        </motion.p>

        <!-- 詳細資訊 -->
        <div class="mt-6 grid grid-cols-2 gap-4 border-white/20">
          <motion.div
            class="rounded-lg bg-white/10 p-4"
            :initial="{ translateY: 20, opacity: 0 }"
            :animate="{ translateY: 0, opacity: 1 }"
            :transition="{ delay: 0.3, duration: 0.5 }"
          >
            <p class="mb-1 text-sm text-stone-700/70 dark:text-stone-300">
              體感溫度
            </p>
            <p class="text-2xl font-semibold">
              {{ feelsLike }}°
            </p>
          </motion.div>

          <motion.div
            class="rounded-lg bg-white/10 p-4"
            :initial="{ translateY: 20, opacity: 0 }"
            :animate="{ translateY: 0, opacity: 1 }"
            :transition="{ delay: 0.6, duration: 0.5 }"
          >
            <p class="mb-1 text-sm text-stone-700/70 dark:text-stone-300">
              濕度
            </p>
            <p class="text-2xl font-semibold">
              {{ humidity }}%
            </p>
          </motion.div>

          <motion.div
            class="rounded-lg bg-white/10 p-4"
            :initial="{ translateY: 20, opacity: 0 }"
            :animate="{ translateY: 0, opacity: 1 }"
            :transition="{ delay: 0.9, duration: 0.5 }"
          >
            <p class="mb-1 text-sm text-stone-700/70 dark:text-stone-300">
              風速
            </p>
            <p class="text-2xl font-semibold">
              {{ windSpeed }} m/s
            </p>
          </motion.div>

          <motion.div
            class="rounded-lg bg-white/10 p-4"
            :initial="{ translateY: 20, opacity: 0 }"
            :animate="{ translateY: 0, opacity: 1 }"
            :transition="{ delay: 1.2, duration: 0.5 }"
          >
            <p class="mb-1 text-sm text-stone-700/70 dark:text-stone-300">
              能見度
            </p>
            <p class="text-2xl font-semibold">
              {{ visibility }} km
            </p>
          </motion.div>
        </div>

        <!-- 更新時間 -->
        <motion.div
          v-if="formattedUpdateTime"
          class="
            mt-6 text-center text-sm text-stone-500/70
            dark:text-stone-400/70
          "
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 1.5, duration: 0.5 }"
        >
          {{ formattedUpdateTime }}
        </motion.div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
