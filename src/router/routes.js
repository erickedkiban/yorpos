import { getAuth, onAuthStateChanged, signOut } from "@firebase/auth";

const routes = [
  {
    path: "/",
    component: () => import("pages/SignIn.vue"),
    children: [
      { path: "index", component: () => import("pages/IndexPage.vue") },
    ],
  },

  { path: "/register", component: () => import("pages/RegisterPage.vue") },
  { path: "/login", component: () => import("pages/Login.vue") },

  { path: "/sign-in", component: () => import("pages/SignIn.vue") },
  // {
  //   path: "/feed",
  //   component: () => import("pages/FeedPage.vue"),
  //   meta: {
  //     requiresAuth: true,
  //   },
  // },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "home",
        component: () => import("pages/HomePage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "menu",
        component: () => import("pages/FeedPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },

      {
        path: "payment",
        component: () => import("pages/PaymentPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "orders",
        component: () => import("pages/OrdersPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];
// Router.beforeEach((to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     if (getAuth().currentUser) {
//       next();
//     }
//   } else {
//     alert("you dont have access");
//     next("/");
//   }
// })

export default routes;
