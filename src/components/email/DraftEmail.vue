<template>
  <div
    class="card-float"
    style="
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    "
  >
    <!-- Header -->
    <div
      style="
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e0dad0;
        flex-shrink: 0;
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        "
      >
        <div>
          <h2
            style="
              font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
              font-size: 1.25rem;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 0.2rem;
            "
          >
            Osnutek test
          </h2>
          <div style="font-size: 0.72rem; color: #8a8279">
            {{ draft.subject }}
          </div>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
          "
        >
          <span
            style="
              font-size: 0.68rem;
              padding: 0.2rem 0.5rem;
              border-radius: 4px;
              background: #f5f2ed;
              color: #8a8279;
              border: 1px solid #e0dad0;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            "
          >
            {{
              draft.language === "sl"
                ? "SL"
                : draft.language === "en"
                  ? "EN"
                  : "SL/EN"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Conflict overlay -->
    <div
      v-if="conflictBlocked"
      style="
        position: absolute;
        inset: 0;
        background: rgba(26, 26, 26, 0.65);
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        backdrop-filter: blur(2px);
      "
    >
      <div
        style="
          background: #fff0ee;
          border: 2px solid #e88070;
          border-radius: 16px;
          padding: 2rem;
          max-width: 340px;
        "
      >
        <div
          style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #a85040;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          "
        >
          <svg width="22" height="22" viewBox="0 0 16 16" fill="white">
            <path
              d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"
            />
          </svg>
        </div>
        <div
          style="
            font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: #7a2020;
            margin-bottom: 0.5rem;
          "
        >
          Konflikt interesom
        </div>
        <div style="font-size: 0.82rem; color: #6b3030; line-height: 1.5">
          Zaznano je prekrivanje s obstoječo stranko. Pošiljanje je blokirano do
          pregleda odvetnika.
        </div>
      </div>
    </div>

    <!-- Email body -->
    <div style="flex: 1; padding: 1.25rem 1.5rem; overflow: auto">
      <textarea
        v-model="editableBody"
        style="
          width: 100%;
          min-height: 380px;
          border: none;
          background: transparent;
          color: #1a1a1a;
          font-size: 0.875rem;
          font-family: &quot;DM Sans&quot;, sans-serif;
          line-height: 1.7;
          resize: none;
          outline: none;
        "
      ></textarea>
    </div>

    <!-- Footer actions -->
    <div
      style="
        padding: 1rem 1.5rem;
        border-top: 1px solid #e0dad0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-shrink: 0;
      "
    >
      <button
        @click="copyToClipboard"
        class="btn-pill btn-pill-ghost"
        style="
          font-size: 0.8rem;
          padding: 0.45rem 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M10 1H4a2 2 0 00-2 2v9h2V3h6V1zm3 3H7a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2zm0 11H7V6h6v9z"
          />
        </svg>
        {{ copied ? "Kopirano!" : "Kopiraj" }}
      </button>
      <button
        v-if="!conflictBlocked"
        class="btn-pill btn-pill-primary"
        style="
          font-size: 0.8rem;
          padding: 0.45rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M15.7 1.6L.3 7.4c-.4.2-.4.7 0 .9l3.7 1.5L13.5 3 5.5 10.6l5.6 2.3c.4.2.8-.1.9-.5L16 2.3c.1-.4-.1-.8-.3-.7z"
          />
        </svg>
        Pošlji
      </button>
      <div
        v-else
        style="
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #a85040;
          font-weight: 500;
        "
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z"
          />
        </svg>
        Pošiljanje blokirano
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  draft: { type: Object, required: true },
  conflictBlocked: { type: Boolean, default: false },
});

const editableBody = ref(props.draft.body);
const copied = ref(false);

watch(
  () => props.draft.body,
  (val) => {
    editableBody.value = val;
  },
);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(editableBody.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // fallback
  }
}
</script>
