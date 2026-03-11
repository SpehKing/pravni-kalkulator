import { createRouter, createWebHistory } from "vue-router";
import EmailIntake from "./pages/EmailIntake.vue";
import LawyerDashboard from "./pages/LawyerDashboard.vue";

const routerHistory = createWebHistory();

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: "/",
      component: EmailIntake,
    },
    {
      path: "/odvetniki",
      component: LawyerDashboard,
    },
    {
      path: "/:pathMatch(.*)*",
      component: EmailIntake,
    },
  ],
});

export default router;
