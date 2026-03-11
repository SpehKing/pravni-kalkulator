<template>
  <div class="card-float p-5">
    <div
      style="
        display: flex;
        align-items: center;
        gap: 0.625rem;
        margin-bottom: 1rem;
      "
    >
      <div
        :style="iconBgStyle"
        style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="white"
            stroke-width="1.5"
            fill="none"
          />
          <line
            x1="8"
            y1="4"
            x2="8"
            y2="8.5"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="8"
            y1="8.5"
            x2="10.5"
            y2="10.5"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <h3
        style="
          font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.02em;
        "
      >
        Nujnost & Roki
      </h3>
    </div>

    <div
      :style="urgencyBadgeStyle"
      style="
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 1rem;
      "
    >
      <span
        :style="dotStyle"
        style="
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        "
      ></span>
      {{ urgencyLabel }}
    </div>

    <div
      v-if="deadlines && deadlines.length > 0"
      style="display: flex; flex-direction: column; gap: 0.75rem"
    >
      <div
        v-for="(deadline, i) in deadlines"
        :key="i"
        style="
          background: #fdfcf9;
          border: 1px solid #e0dad0;
          border-radius: 10px;
          padding: 0.75rem;
        "
      >
        <div
          style="
            font-size: 0.8rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.25rem;
          "
        >
          {{ deadline.description }}
        </div>
        <div style="font-size: 0.72rem; color: #8a8279; margin-bottom: 0.5rem">
          {{ deadline.source }}
        </div>
        <div
          v-if="deadline.hoursRemaining !== null"
          :style="countdownStyle(deadline.hoursRemaining)"
          style="
            font-size: 1.25rem;
            font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
            font-weight: 600;
          "
        >
          {{ liveCountdowns[i] || formatCountdown(deadline.hoursRemaining) }}
        </div>
        <div
          style="
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #b8b0a4;
            margin-top: 0.1rem;
          "
        >
          {{ deadline.deadlineType }}
        </div>
      </div>
    </div>
    <p v-else style="font-size: 0.85rem; color: #8a8279">
      Ni zaznanih zakonskih rokov.
    </p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  urgency: { type: String, default: "normal" },
  deadlines: { type: Array, default: () => [] },
});

// Live countdown — tracks elapsed seconds since component mount
const elapsedSeconds = ref(0);
let countdownInterval = null;

onMounted(() => {
  if (props.deadlines.some((d) => d.hoursRemaining !== null)) {
    countdownInterval = setInterval(() => {
      elapsedSeconds.value++;
    }, 1000);
  }
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

const liveCountdowns = computed(() => {
  return props.deadlines.map((d) => {
    if (d.hoursRemaining === null || d.hoursRemaining === undefined)
      return null;
    const remainingSecs = Math.max(
      0,
      d.hoursRemaining * 3600 - elapsedSeconds.value,
    );
    const h = Math.floor(remainingSecs / 3600);
    const m = Math.floor((remainingSecs % 3600) / 60);
    const s = Math.floor(remainingSecs % 60);
    if (remainingSecs < 60) return `${s}s`;
    if (h < 1) return `${m}m ${s}s`;
    if (h < 24) return `${h}h ${m}m`;
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return remH > 0 ? `${days}d ${remH}h` : `${days} dni`;
  });
});

const iconBgStyle = computed(() => {
  if (props.urgency === "critical") return "background-color: #A85040;";
  if (props.urgency === "high") return "background-color: #C8896A;";
  return "background-color: #8A8279;";
});

const urgencyBadgeStyle = computed(() => {
  if (props.urgency === "critical")
    return "background-color: #FFF0EE; color: #A04040; border: 1px solid #F0C0BC;";
  if (props.urgency === "high")
    return "background-color: #FEF3EC; color: #8B5E2A; border: 1px solid #E8C090;";
  return "background-color: #F5F2ED; color: #6B6460; border: 1px solid #E0DAD0;";
});

const dotStyle = computed(() => {
  if (props.urgency === "critical") return "background-color: #A85040;";
  if (props.urgency === "high") return "background-color: #C8896A;";
  return "background-color: #8A8279;";
});

const urgencyLabel = computed(() => {
  if (props.urgency === "critical") return "Kritično";
  if (props.urgency === "high") return "Visoka nujnost";
  return "Normalno";
});

function countdownStyle(hours) {
  if (hours <= 24) return "color: #A85040;";
  if (hours <= 48) return "color: #C8896A;";
  return "color: #1A1A1A;";
}

function formatCountdown(hours) {
  if (hours === null || hours === undefined) return "—";
  const h = Math.round(hours);
  if (h < 1) return "< 1 ura";
  if (h < 24) return `${h} ur`;
  const days = Math.floor(h / 24);
  const rem = h % 24;
  return rem > 0 ? `${days}d ${rem}h` : `${days} dni`;
}
</script>
