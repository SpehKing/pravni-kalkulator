import { createRouter, createWebHistory } from "vue-router";
import EmailIntake from "./pages/EmailIntake.vue";

const routerHistory = createWebHistory();

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: "/",
      component: EmailIntake,
    },
    {
      path: "/:pathMatch(.*)*",
      component: EmailIntake,
    },
  ],
});

export default router;
