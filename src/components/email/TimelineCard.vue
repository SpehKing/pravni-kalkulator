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
        style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <line
            x1="8"
            y1="1"
            x2="8"
            y2="15"
            stroke="white"
            stroke-width="1.5"
          />
          <circle cx="8" cy="4" r="2" fill="white" />
          <circle cx="8" cy="9" r="2" fill="white" />
          <circle cx="8" cy="14" r="2" fill="white" opacity="0.5" />
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
        Potek postopka
      </h3>
    </div>

    <div v-if="timeline && timeline.length > 0" style="position: relative">
      <!-- Vertical connector line -->
      <div
        style="
          position: absolute;
          left: 10px;
          top: 12px;
          bottom: 12px;
          width: 1px;
          background: linear-gradient(to bottom, #a0694b, #e0dad0);
        "
      ></div>

      <div style="display: flex; flex-direction: column; gap: 0.875rem">
        <div
          v-for="(phase, i) in timeline"
          :key="i"
          style="
            display: flex;
            align-items: flex-start;
            gap: 0.875rem;
            position: relative;
          "
        >
          <!-- Node dot -->
          <div
            :style="nodeDotStyle(i)"
            style="
              width: 21px;
              height: 21px;
              border-radius: 50%;
              border: 2px solid;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              background: white;
              z-index: 1;
            "
          >
            <span style="font-size: 0.58rem; font-weight: 700">{{
              i + 1
            }}</span>
          </div>

          <!-- Phase content -->
          <div
            style="
              flex: 1;
              background: #fdfcf9;
              border: 1px solid #e0dad0;
              border-radius: 10px;
              padding: 0.625rem 0.75rem;
            "
          >
            <div
              style="
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 0.5rem;
              "
            >
              <div
                style="
                  font-size: 0.825rem;
                  font-weight: 600;
                  color: #1a1a1a;
                  line-height: 1.3;
                "
              >
                {{ phase.naslovFaze }}
              </div>
              <div
                style="
                  font-size: 0.68rem;
                  font-weight: 600;
                  color: #a0694b;
                  background: #f2e8e2;
                  padding: 0.15rem 0.5rem;
                  border-radius: 9999px;
                  white-space: nowrap;
                  flex-shrink: 0;
                  border: 1px solid #dfc8bc;
                "
              >
                {{ phase.trajanjeFaze }}
              </div>
            </div>
            <div
              v-if="phase.opisFaze"
              style="
                font-size: 0.775rem;
                color: #6b6460;
                line-height: 1.45;
                margin-top: 0.3rem;
              "
            >
              {{ phase.opisFaze }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else style="font-size: 0.85rem; color: #8a8279">
      Ni podatkov o poteku postopka.
    </p>

    <div
      style="
        margin-top: 0.875rem;
        padding: 0.5rem 0.625rem;
        background: #f5f2ed;
        border-radius: 8px;
        font-size: 0.7rem;
        color: #8a8279;
        line-height: 1.4;
      "
    >
      Navedeni roki so okvirni in so odvisni od konkretnih okoliščin zadeve,
      odzivnosti nasprotnih strani in obremenjenosti sodišč.
    </div>
  </div>
</template>

<script setup>
defineProps({
  timeline: { type: Array, default: () => [] },
});

function nodeDotStyle(i) {
  const colors = [
    "#A0694B",
    "#C8896A",
    "#8A8279",
    "#B8B0A4",
    "#D4CCC4",
    "#E0DAD0",
  ];
  const color = colors[Math.min(i, colors.length - 1)];
  return `border-color: ${color}; color: ${color};`;
}
</script>
