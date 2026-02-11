import Index from '~/pages/index.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: Index,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('~/pages/NotFound.vue'),
  },
]
