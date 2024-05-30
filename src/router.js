import {
  createRouter as vueCreateRouter,
  createWebHistory
} from 'vue-router'
import { useAuthStore } from './stores/auth'

/*
const getPageRoutes = importMap => {
  return Object.keys(importMap)
    // Ensure that static routes have
    // precedence over the dynamic ones
    .sort((a, b) => a > b ? -1 : 1)
    .map((path) => ({
      path: path
        // Remove /pages and .vue extension
        .slice(7, -4)
        // Replace [id] with :id
        .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
        // Replace '/index' with '/'
        .replace(/\/index$/, '/'),
      // The Vue component (default export)
      component: importMap[path].default,
      meta: importMap[path].routerMeta || {authNotRequired: true}
  }))
}
*/

const routes = [
  {
    path: '/dash',
    component: () => import('./layouts/LayoutDash.vue'),
    meta: {
      authRequired: true
    },
    children: [
      {
        path: '',
        name: 'dash',
        component: () => import('./pages/dash/index.vue'),
      },
      {
        path: 'contacts',
        name: 'contacts',
        component: () => import('./pages/dash/contacts.vue'),
        meta: {
          authRequired: true
        }
      },
      {
        path: 'new',
        name: 'wa-new',
        component: () => import('./pages/dash/new.vue'),
        meta: {
          authRequired: true
        }
      },
      {
        path: ':deviceId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
        component: () => import('./pages/dash/state.vue'),
        meta: {
          authRequired: true
        },
        children: [
          {
            path: "",
            name: 'wa-state',
            component: () => import('./pages/dash/loggedin.vue'),
            meta: {
              authRequired: true
            }
          },
          {
            path: 'send',
            name: 'wa-send',
            component: () => import('./pages/dash/sendmessage.vue'),
            meta: {
              authRequired: true
            }
          },
          {
            path: 'broadcasts',
            name: 'wa-broadcasts',
            component: () => import('./pages/dash/broadcasts.vue'),
            meta: {
              authRequired: true
            }
          },
          {
            path: 'broadcast',
            name: 'wa-broadcast',
            component: () => import('./pages/dash/send-broadcast.vue'),
            meta: {
              authRequired: true
            }
          },
        ]
      }
    ]
  },
  {
    path: '/',
    component: () => import('./layouts/LayoutPublic.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('./pages/home.vue'),
        meta: {
          authRequired: false,
          redirectIfLoggedIn: '/dash'
        }
      },
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('./pages/sign-in.vue'),
        meta: {
          authRequired: false,
          redirectIfLoggedIn: '/dash'
        }
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('./pages/sign-up.vue'),
        meta: {
          authRequired: false,
          redirectIfLoggedIn: '/dash'
        }
      }
    ]
  },
  {
    path: '/*',
    component: () => import('./pages/404.vue'),
    meta: {
      authRequired: false
    }
  }
]

const createRouter = () => {
  const router = vueCreateRouter({
    history: createWebHistory(),
    routes: routes
  })

  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const authRequired = to.meta.authRequired || false

    if (authRequired && !authStore.isLoggedIn){
      return {
        path: '/sign-in',
        query: {
          next: to.fullPath
        }
      }
    }
    if ( !authRequired && authStore.isLoggedIn && to.meta.redirectIfLoggedIn){
      return {
        path: to.meta.redirectIfLoggedIn
      }
    }
  })

  return router
}

export default createRouter