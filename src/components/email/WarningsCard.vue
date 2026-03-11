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
          background: #c8896a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
          <path
            d="M8 1L1 14h14L8 1zm0 2.5l5.5 9.5H2.5L8 3.5zM7.25 7v3h1.5V7h-1.5zm0 4v1.5h1.5V11h-1.5z"
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
        Zgodnja opozorila
      </h3>
    </div>

    <div
      v-if="warnings && warnings.length > 0"
      style="display: flex; flex-direction: column; gap: 0.5rem"
    >
      <div
        v-for="(warning, i) in warnings"
        :key="i"
        style="
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          background: #fef3ec;
          border: 1px solid #e8c090;
          border-radius: 10px;
          padding: 0.625rem 0.75rem;
        "
      >
        <div style="flex-shrink: 0; margin-top: 2px">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L1 14h14L8 1z"
              stroke="#C8896A"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <line
              x1="8"
              y1="6"
              x2="8"
              y2="9.5"
              stroke="#C8896A"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle cx="8" cy="11.5" r="0.75" fill="#C8896A" />
          </svg>
        </div>
        <span style="font-size: 0.8rem; color: #5a3820; line-height: 1.45">{{
          warning
        }}</span>
      </div>
    </div>

    <p v-else style="font-size: 0.85rem; color: #8a8279">
      Ni posebnih opozoril.
    </p>
  </div>
</template>

<script setup>
defineProps({
  warnings: { type: Array, default: () => [] },
});
</script>
