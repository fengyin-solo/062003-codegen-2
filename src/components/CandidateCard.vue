<template>
  <div class="candidate-card card" :class="rarityClass">
    <div class="card-top">
      <div class="name-row">
        <h4>{{ candidate.name }}</h4>
        <span class="rarity-badge" :class="candidate.rarity">{{ rarityLabel }}</span>
      </div>
      <div class="sign-cost" :class="{ disabled: !canAfford }">
        ¥{{ candidate.signCost.toLocaleString() }}
      </div>
    </div>

    <div v-if="candidate.traits && candidate.traits.length > 0" class="traits-row">
      <div
        v-for="trait in traitsInfo"
        :key="trait.key"
        class="trait-tag"
        :title="trait.description"
      >
        <span class="trait-icon">{{ trait.icon }}</span>
        <span class="trait-label">{{ trait.label }}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="key in statKeys" :key="key" class="stat-cell">
        <span class="stat-label">{{ statLabels[key] }}</span>
        <span class="stat-val">{{ candidate.stats[key] }}</span>
      </div>
    </div>

    <div class="card-footer">
      <button
        class="sign-btn"
        :class="{ disabled: !canAfford || !hasSlot }"
        :disabled="!canAfford || !hasSlot"
        @click="$emit('sign', candidate.id)"
      >
        {{ !hasSlot ? '名额已满' : !canAfford ? '资金不足' : '✒️ 签约' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { GAME_CONFIG } from '../config/gameConfig'

const props = defineProps({
  candidate: Object,
  money: Number,
  activeCount: Number,
  maxTrainees: Number,
})

defineEmits(['sign'])

const statKeys = GAME_CONFIG.stats
const statLabels = GAME_CONFIG.statLabels

const rarityLabel = computed(() =>
  GAME_CONFIG.recruitment.rarityLabels[props.candidate.rarity] || props.candidate.rarity
)

const rarityClass = computed(() => ({
  rarity_common: props.candidate.rarity === 'common',
  rarity_rare: props.candidate.rarity === 'rare',
  rarity_epic: props.candidate.rarity === 'epic',
  rarity_legendary: props.candidate.rarity === 'legendary',
}))

const canAfford = computed(() => props.money >= props.candidate.signCost)
const hasSlot = computed(() => props.activeCount < props.maxTrainees)

const traitsInfo = computed(() =>
  (props.candidate.traits || []).map(key => ({
    key,
    ...GAME_CONFIG.traits[key],
  })).filter(t => t.label)
)
</script>

<style scoped>
.candidate-card {
  padding: 1rem;
  border: 2px solid transparent;
  transition: all 0.25s;
}

.candidate-card.rarity_common {
  border-color: var(--border);
}
.candidate-card.rarity_rare {
  border-color: #4a9eff;
  box-shadow: 0 0 12px rgba(74, 158, 255, 0.15);
}
.candidate-card.rarity_epic {
  border-color: #a855f7;
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.2);
}
.candidate-card.rarity_legendary {
  border-color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.name-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.name-row h4 {
  font-size: 1.05rem;
  margin: 0;
}

.rarity-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  align-self: flex-start;
  font-weight: 600;
}

.rarity-badge.common {
  background: var(--bg-secondary);
  color: var(--text-muted);
}
.rarity-badge.rare {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
}
.rarity-badge.epic {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}
.rarity-badge.legendary {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.sign-cost {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}
.sign-cost.disabled {
  color: var(--text-muted);
  text-decoration: line-through;
  opacity: 0.6;
}

.traits-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.trait-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: var(--accent-soft);
  font-size: 0.75rem;
  cursor: help;
  transition: transform 0.15s;
}

.trait-tag:hover {
  transform: translateY(-1px);
}

.trait-icon {
  font-size: 0.85rem;
}

.trait-label {
  color: var(--accent);
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.3rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.stat-cell {
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 0.35rem 0.15rem;
}

.stat-label {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
}
.stat-val {
  font-weight: 700;
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: center;
}

.sign-btn {
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sign-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sign-btn.disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
