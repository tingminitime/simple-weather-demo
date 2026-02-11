interface Logo {
  text: string
  textColor: string
  href: string
  imgSrc: string
}

export const logos: Logo[] = [
  {
    text: 'Vite',
    textColor: 'text-purple-500',
    href: 'https://vitejs.dev/',
    imgSrc: `${import.meta.env.BASE_URL}icon-vite.svg`,
  },
  {
    text: 'Vue',
    textColor: 'text-emerald-500',
    href: 'https://vuejs.org/',
    imgSrc: `${import.meta.env.BASE_URL}icon-vue.svg`,
  },
  {
    text: 'TailwindCSS',
    textColor: 'text-cyan-500',
    href: 'https://tailwindcss.com/',
    imgSrc: `${import.meta.env.BASE_URL}icon-tailwindcss.svg`,
  },
  {
    text: 'Pinia',
    textColor: 'text-yellow-500 dark:text-yellow-200',
    href: 'https://pinia.vuejs.org/',
    imgSrc: `${import.meta.env.BASE_URL}icon-pinia.svg`,
  },
  {
    text: 'VueUse',
    textColor: 'text-emerald-500',
    href: 'https://vueuse.org/',
    imgSrc: `${import.meta.env.BASE_URL}icon-vueuse.svg`,
  },
]
