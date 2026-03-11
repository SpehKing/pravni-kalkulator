<template>
  <main class="min-h-screen flex flex-col" style="background-color: #f5f2ed">
    <!-- Header -->
    <header
      class="flex items-center h-16 px-6 sm:px-8 shrink-0"
      style="background-color: #fffdf9; border-bottom: 1px solid #e0dad0"
    >
      <div class="flex items-center gap-3 flex-1">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="#A0694B" stroke-width="1.5" />
          <path
            d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="17" cy="8" r="2.5" stroke="#A0694B" stroke-width="1.5" />
          <path
            d="M21 19c0-2.8-1.8-5-4-5"
            stroke="#A0694B"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <span
          style="
            font-family: &quot;Cormorant Garamond&quot;, Georgia, serif;
            font-size: 1.125rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: #1a1a1a;
            text-transform: uppercase;
          "
        >
          Odvetniki
        </span>
        <span
          style="
            font-size: 0.7rem;
            background: #f2e8e2;
            color: #7a4030;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            border: 1px solid #dfc8bc;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-weight: 600;
          "
        >
          Jadek &amp; Pensa
        </span>
      </div>
      <a
        href="/"
        style="
          font-size: 0.78rem;
          color: #8a8279;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        "
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M10 4L6 8l4 4" />
        </svg>
        E-poštni sprejem
      </a>
    </header>

    <!-- Filter bar -->
    <div
      class="px-6 sm:px-8 py-4"
      style="background-color: #fffdf9; border-bottom: 1px solid #e0dad0"
    >
      <div
        style="
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          align-items: center;
        "
      >
        <span
          style="
            font-size: 0.72rem;
            font-weight: 600;
            color: #6b6460;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-right: 0.25rem;
          "
          >Filtriraj:</span
        >
        <button
          class="btn-pill"
          :class="activeFilter === null ? 'btn-pill-active' : 'btn-pill-ghost'"
          @click="activeFilter = null"
          style="font-size: 0.7rem; padding: 0.2rem 0.7rem"
        >
          Vsi
        </button>
        <button
          v-for="domain in allDomains"
          :key="domain"
          class="btn-pill"
          :class="
            activeFilter === domain ? 'btn-pill-active' : 'btn-pill-ghost'
          "
          @click="activeFilter = activeFilter === domain ? null : domain"
          style="font-size: 0.7rem; padding: 0.2rem 0.7rem"
        >
          {{ domain }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="flex-1 px-4 sm:px-8 py-8">
      <div style="max-width: 1200px; margin: 0 auto">
        <!-- Status legend -->
        <div
          style="
            display: flex;
            gap: 1.25rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          "
        >
          <div
            v-for="s in statusLegend"
            :key="s.label"
            style="
              display: flex;
              align-items: center;
              gap: 0.375rem;
              font-size: 0.72rem;
              color: #6b6460;
            "
          >
            <span
              :style="{ background: s.color }"
              style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
              "
            ></span>
            {{ s.label }}
          </div>
        </div>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
          "
        >
          <div
            v-for="lawyer in filteredLawyers"
            :key="lawyer.id"
            class="card-float"
            style="
              padding: 1.125rem;
              display: flex;
              flex-direction: column;
              gap: 0.625rem;
            "
            :style="highlightStyle(lawyer)"
          >
            <!-- Header row -->
            <div
              style="
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 0.5rem;
              "
            >
              <div>
                <div
                  style="font-size: 0.9rem; font-weight: 700; color: #1a1a1a"
                >
                  {{ lawyer.name }}
                </div>
                <div
                  style="
                    font-size: 0.7rem;
                    color: #8a8279;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-top: 0.1rem;
                  "
                >
                  {{ lawyer.title }}
                </div>
              </div>
              <div
                :style="capacityDotStyle(lawyer.capacity_status)"
                style="
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  flex-shrink: 0;
                  margin-top: 4px;
                "
              ></div>
            </div>

            <!-- Experience blurb -->
            <p style="font-size: 0.775rem; color: #6b6460; line-height: 1.45">
              {{ lawyer.experience_description }}
            </p>

            <!-- Specializations -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem">
              <span
                v-for="spec in lawyer.specializations"
                :key="spec"
                style="
                  font-size: 0.65rem;
                  padding: 0.15rem 0.5rem;
                  border-radius: 9999px;
                  border: 1px solid #dfc8bc;
                  background: #f2e8e2;
                  color: #7a4030;
                  font-weight: 600;
                "
                >{{ spec }}</span
              >
            </div>

            <!-- Capacity badge -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 0.375rem;
                margin-top: auto;
                padding-top: 0.25rem;
              "
            >
              <span
                :style="capacityBadgeStyle(lawyer.capacity_status)"
                style="
                  font-size: 0.68rem;
                  font-weight: 600;
                  letter-spacing: 0.05em;
                  padding: 0.15rem 0.55rem;
                  border-radius: 9999px;
                "
              >
                {{ capacityLabel(lawyer.capacity_status) }}
              </span>
            </div>
          </div>
        </div>

        <p
          v-if="filteredLawyers.length === 0"
          style="
            text-align: center;
            color: #8a8279;
            padding: 3rem 0;
            font-size: 0.875rem;
          "
        >
          Ni odvetnikov za izbrano področje.
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue";

const lawyersRaw = [
  {
    id: "IRPE",
    name: "Iris Pensa",
    title: "Partnerka",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Vodi delovnopravni in imigracijski oddelek ter ESG svetovanje. Akreditirana mediatorka CEDR (2021), vodja Mediacijskega centra OZS od 2023.",
    capacity_status: "AMBER",
  },
  {
    id: "ANJA",
    name: "Andraž Jadek",
    title: "Partner",
    specializations: [
      "Prevzemi in združitve",
      "Korporacijsko pravo",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specializiran za M&A, finančna prestrukturiranja in bančne posle. Magister korporacijskega prava (NYU), priznan v mednarodnih pravnih direktorijih.",
    capacity_status: "GREEN",
  },
  {
    id: "DORO",
    name: "Domen Romih",
    title: "Partner",
    specializations: ["Davčno pravo"],
    experience_description:
      "Vodi davčno enoto pisarne. Specializiran za davčno svetovanje pri transakcijah, davčni nadzor in digitalno ekonomijo.",
    capacity_status: "AMBER",
  },
  {
    id: "MIPO",
    name: "Mitja Podpečan",
    title: "Partner",
    specializations: [
      "Preprečevanje in reševanje sporov",
      "Varstvo osebnih podatkov",
    ],
    experience_description:
      "Vodja enote za reševanje sporov. Poglobljeno znanje prava IT, varstva osebnih podatkov in novih tehnologij, vključno z umetno inteligenco.",
    capacity_status: "GREEN",
  },
  {
    id: "OŽME",
    name: "Ožbej Merc",
    title: "Starejši partner",
    specializations: [
      "Prevzemi in združitve",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Vodja transakcijske enote. Sodeloval pri večini prestrukturiranj velikih sistemov v Sloveniji, LL.M. Columbia University (2005).",
    capacity_status: "AMBER",
  },
  {
    id: "SAJE",
    name: "Aleksandra Merc",
    title: "Starejša partnerka",
    specializations: [
      "Korporacijsko pravo",
      "Intelektualna lastnina",
      "Komercialne pogodbe",
    ],
    experience_description:
      "Poslovodni partner pisarne. Pokriva korporacijsko pravo, patentne spore in farmacevtsko regulativo.",
    capacity_status: "RED",
  },
  {
    id: "GRKO",
    name: "Gregor Kovačič",
    title: "Starejši odvetnik",
    specializations: [
      "Javno naročanje",
      "Delovno pravo",
      "Preprečevanje in reševanje sporov",
    ],
    experience_description:
      "Specialist za gradbeno pravo, javna naročila in delovno pravo. Izkušnje z FIDIC pogodbami in zastopanjem v gradbenih sporih.",
    capacity_status: "GREEN",
  },
  {
    id: "PAPE",
    name: "Pavle Pensa",
    title: "Ustanovni partner",
    specializations: [
      "Prevzemi in združitve",
      "Konkurenčno pravo",
      "Preprečevanje in reševanje sporov",
    ],
    experience_description:
      "Ustanovni partner in vodilni slovenski odvetnik. Obsežne izkušnje z M&A, mednarodno arbitražo in konkurenčnopravnimi zadevami.",
    capacity_status: "RED",
  },
  {
    id: "NIBA",
    name: "Nina Bakovnik",
    title: "Pravnica",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Specializirana za evropsko in mednarodno delovno pravo, protidiskriminacijsko pravo in zaposlovanje tujcev.",
    capacity_status: "GREEN",
  },
  {
    id: "NAME",
    name: "Nastja Merlak",
    title: "Partnerka",
    specializations: [
      "Prevzemi in združitve",
      "Korporacijsko pravo",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specializirana za M&A, insolvenčno pravo in statusnopravna preoblikovanja podjetij. Magistrica prava (LSE).",
    capacity_status: "AMBER",
  },
  {
    id: "VEKN",
    name: "Veronika Bratož",
    title: "Višja davčna svetovalka",
    specializations: ["Davčno pravo"],
    experience_description:
      "Izkušena davčna svetovalka (prej Big 4). Specialistka za DDV, transferne cene in obdavčitev virtualnih valut.",
    capacity_status: "GREEN",
  },
  {
    id: "JULE",
    name: "Jure Levovnik",
    title: "Starejši partner",
    specializations: [
      "Preprečevanje in reševanje sporov",
      "Intelektualna lastnina",
    ],
    experience_description:
      "Vodilni strokovnjak za reševanje sporov v Sloveniji. Mednarodne arbitraže, energetika, IP in športno pravo. Član AEEC od 2019.",
    capacity_status: "AMBER",
  },
  {
    id: "NESE",
    name: "Nejc Setnikar",
    title: "Pravnik",
    specializations: [
      "Intelektualna lastnina",
      "Varstvo osebnih podatkov",
      "Komercialne pogodbe",
    ],
    experience_description:
      "Svetuje na področju pogodbenega prava, varstva podatkov in IP. Specializiran za pravne vidike umetne inteligence, robotike in digitalnih trgov.",
    capacity_status: "GREEN",
  },
  {
    id: "JAZA",
    name: "Janja Zaplotnik",
    title: "Partnerica",
    specializations: ["Konkurenčno pravo", "Komercialne pogodbe"],
    experience_description:
      "Vodja svetovalne enote. Specialistka za konkurenčno pravo, državno pomoč in konkurenčnopravne vidike M&A.",
    capacity_status: "AMBER",
  },
  {
    id: "EVGO",
    name: "Eva Gostiša",
    title: "Partnerka",
    specializations: ["Intelektualna lastnina"],
    experience_description:
      "Osredotočena na IP: blagovne znamke, modeli, patenti in avtorsko pravo. Pokriva tudi regulativo zdravil in nepremičninske transakcije.",
    capacity_status: "GREEN",
  },
  {
    id: "BOLE",
    name: "Borut Leskovec",
    title: "Partner",
    specializations: [
      "Javno naročanje",
      "Preprečevanje in reševanje sporov",
      "Insolvenčno pravo in prestrukturiranja",
    ],
    experience_description:
      "Specialist za javna naročila in kompleksne gospodarske spore. Izkušnje z velikimi infrastrukturnimi projekti in insolvenčnim pravom.",
    capacity_status: "GREEN",
  },
  {
    id: "ANOŠ",
    name: "Ana Oštir",
    title: "Odvetnica",
    specializations: ["Delovno pravo", "Migracijsko pravo"],
    experience_description:
      "Svetuje na področju delovnih razmerij, zaposlovanja tujcev, protidiskriminacije in trajnostnega poročanja (ESG).",
    capacity_status: "GREEN",
  },
];

const allDomains = [
  "Davčno pravo",
  "Delovno pravo",
  "Insolvenčno pravo in prestrukturiranja",
  "Intelektualna lastnina",
  "Javno naročanje",
  "Komercialne pogodbe",
  "Konkurenčno pravo",
  "Korporacijsko pravo",
  "Migracijsko pravo",
  "Preprečevanje in reševanje sporov",
  "Prevzemi in združitve",
  "Varstvo osebnih podatkov",
];

const statusLegend = [
  { label: "Razpoložljiv", color: "#4A8A61" },
  { label: "Delno zaseden", color: "#C8896A" },
  { label: "Polno zaseden", color: "#A85040" },
];

// Read optional ?domains= query param to highlight best-fit lawyers
const urlParams = new URLSearchParams(window.location.search);
const queryDomains = urlParams.get("domains")
  ? urlParams.get("domains").split(",")
  : [];

const activeFilter = ref(queryDomains.length ? queryDomains[0] : null);

const filteredLawyers = computed(() => {
  if (!activeFilter.value) return lawyersRaw;
  return lawyersRaw.filter((l) =>
    l.specializations.includes(activeFilter.value),
  );
});

function highlightStyle(lawyer) {
  if (queryDomains.length === 0) return "";
  const matches = lawyer.specializations.some((s) => queryDomains.includes(s));
  return matches
    ? "box-shadow: 0 0 0 2px #A0694B; border-color: #A0694B;"
    : "opacity: 0.6;";
}

function capacityDotStyle(status) {
  if (status === "GREEN") return "background: #4A8A61;";
  if (status === "AMBER") return "background: #C8896A;";
  return "background: #A85040;";
}

function capacityBadgeStyle(status) {
  if (status === "GREEN")
    return "background: #F0F9F4; color: #3B7050; border: 1px solid #A8D8BC;";
  if (status === "AMBER")
    return "background: #FEF3EC; color: #8B5E2A; border: 1px solid #E8C090;";
  return "background: #FFF0EE; color: #A04040; border: 1px solid #F0C0BC;";
}

function capacityLabel(status) {
  if (status === "GREEN") return "Razpoložljiv";
  if (status === "AMBER") return "Delno zaseden";
  return "Polno zaseden";
}
</script>
