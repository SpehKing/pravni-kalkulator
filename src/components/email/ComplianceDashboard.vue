<template>
  <div style="display: flex; flex-direction: column; gap: 0.875rem;">
    <ConflictCard :conflict="compliance.conflict" />
    <AmlCard :aml="compliance.aml" />
    <UrgencyCard :urgency="analysis.urgency" :deadlines="analysis.deadlines" />
    <TeamCard :team="analysis.assignedTeam" />
    <SummaryCard :summary="analysis.summary" :key-facts="analysis.keyFacts" :legal-domains="analysis.legalDomains" />
    <FollowUpCard :questions="analysis.followUpQuestions" />
    <FeeCard :fee-estimate="analysis.feeEstimate" />
    <MatterFormCard :matter-form="analysis.matterForm" />
  </div>
</template>

<script setup>
import ConflictCard from './ConflictCard.vue'
import AmlCard from './AmlCard.vue'
import UrgencyCard from './UrgencyCard.vue'
import TeamCard from './TeamCard.vue'
import SummaryCard from './SummaryCard.vue'
import FollowUpCard from './FollowUpCard.vue'
import FeeCard from './FeeCard.vue'
import MatterFormCard from './MatterFormCard.vue'

defineProps({
  analysis: { type: Object, required: true },
  compliance: { type: Object, required: true }
})
</script>
