<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal recruitment-modal">
      <div class="modal-header">
        <div class="header-left">
          <h2>🎯 练习生招募中心</h2>
          <div class="header-stats">
            <span>当前练习生：<strong>{{ activeCount }} / {{ maxTrainees }}</strong></span>
            <span>可用资金：<strong class="money">¥{{ money.toLocaleString() }}</strong></span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div v-if="recruitmentEvent" class="event-banner" :class="eventClass">
        <div class="event-content">
          <span class="event-label">🎁 {{ recruitmentEvent.label }}</span>
          <span class="event-msg">{{ recruitmentEvent.message }}</span>
          <span v-if="recruitmentEvent.amount" class="event-amount">
            +¥{{ recruitmentEvent.amount?.toLocaleString?.() || recruitmentEvent.amount }}
          </span>
        </div>
        <button class="event-dismiss" @click="$emit('dismiss-event')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="candidates.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>还没有候选人，点击「刷新名单」寻找新的练习生吧！</p>
          <p class="empty-hint">每次刷新费用：¥{{ refreshCost.toLocaleString() }}</p>
        </div>

        <div v-else class="candidates-grid">
          <CandidateCard
            v-for="c in candidates"
            :key="c.id"
            :candidate="c"
            :money="money"
            :active-count="activeCount"
            :max-trainees="maxTrainees"
            @sign="onSign"
          />
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-tips">
          <span class="tip">💡 稀有度越高，初始属性越好，特质越强</span>
          <span class="tip">⚡ 每次刷新有概率触发稀有事件</span>
        </div>
        <button
          class="refresh-btn"
          :class="{ disabled: money < refreshCost }"
          :disabled="money < refreshCost"
          @click="onRefresh"
        >
          🔄 刷新名单 (¥{{ refreshCost.toLocaleString() }})
        </button>
      </div>

      <div v-if="toast" class="toast" :class="toast.type">{{ toast.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { GAME_CONFIG } from '../config/gameConfig'
import CandidateCard from './CandidateCard.vue'

const props = defineProps({
  candidates: Array,
  money: Number,
  activeCount: Number,
  maxTrainees: Number,
  recruitmentEvent: Object,
})

const emit = defineEmits(['close', 'refresh', 'sign', 'dismiss-event'])

const refreshCost = GAME_CONFIG.recruitment.refreshCost
const toast = ref(null)

const eventClass = computed(() => {
  if (!props.recruitmentEvent) return ''
  const label = props.recruitmentEvent.label
  if (label.includes('传奇')) return 'legendary'
  if (label.includes('沧海') || label.includes('双子')) return 'epic'
  if (label.includes('赞助') || label.includes('粉丝')) return 'positive'
  return 'normal'
})

function onRefresh() {
  const result = emit('refresh')
}

function onSign(candidateId) {
  emit('sign', candidateId, (result) => {
    if (result?.success) {
      showToast('签约成功！🎉', 'success')
    } else if (result?.message) {
      showToast(result.message, 'error')
    }
  })
}

function showToast(text, type = 'info') {
  toast.value = { text, type }
  setTimeout(() => { toast.value = null }, 2500)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  gap: 1rem;
}

.header-left h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.35rem;
}

.header-stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.header-stats .money {
  color: var(--accent);
}

.close-btn {
  background: var(--bg-secondary);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.close-btn:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

.event-banner {
  margin: 1rem 1.5rem 0;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--accent-soft);
  border-left: 4px solid var(--accent);
}

.event-banner.positive {
  background: rgba(34, 197, 94, 0.1);
  border-left-color: #22c55e;
}

.event-banner.epic {
  background: rgba(168, 85, 247, 0.1);
  border-left-color: #a855f7;
}

.event-banner.legendary {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: #f59e0b;
}

.event-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  font-size: 0.85rem;
}

.event-label {
  font-weight: 700;
  color: var(--accent);
}

.event-msg {
  color: var(--text-secondary);
}

.event-amount {
  font-weight: 700;
  color: #22c55e;
}

.event-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  font-size: 0.8rem;
  padding: 0.25rem;
}

.event-dismiss:hover { opacity: 1; }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin: 0.35rem 0;
  font-size: 0.95rem;
}

.empty-hint {
  font-size: 0.8rem !important;
  opacity: 0.8;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-tips {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tip {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.refresh-btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.refresh-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.refresh-btn.disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.toast {
  position: absolute;
  bottom: 5.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: toastIn 0.25s ease;
}

.toast.success {
  border-color: #22c55e;
  color: #22c55e;
}

.toast.error {
  border-color: var(--danger);
  color: var(--danger);
}

@keyframes toastIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
