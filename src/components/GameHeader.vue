<template>
  <header class="game-header">
    <div class="header-left">
      <button class="btn ghost" @click="$emit('back')">← 存档</button>
      <h2>第 {{ state.day }} 天</h2>
      <span class="days-left">剩余 {{ daysLeft }} 天</span>
    </div>
    <div class="header-stats">
      <div class="stat-item">
        <span class="label">资金</span>
        <span class="value" :class="{ danger: state.money < 10000 }">
          ¥{{ state.money.toLocaleString() }}
        </span>
      </div>
      <div class="stat-item">
        <span class="label">粉丝</span>
        <span class="value">{{ state.fans.toLocaleString() }}</span>
      </div>
      <div class="stat-item">
        <span class="label">盈利</span>
        <span class="value" :class="profit >= 0 ? 'success' : 'danger'">
          ¥{{ profit.toLocaleString() }}
        </span>
      </div>
      <div class="stat-item">
        <span class="label">练习生</span>
        <span class="value">{{ activeCount }}/{{ maxTrainees }}</span>
      </div>
      <div class="stat-item">
        <span class="label">出道</span>
        <span class="value">{{ state.groups.length }}/{{ targetGroups }}</span>
      </div>
    </div>
    <div class="header-actions">
      <button class="recruit-btn" @click="$emit('open-recruitment')">
        🎯 招募中心
      </button>
      <button class="theme-btn" @click="$emit('toggle-theme')">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { GAME_CONFIG } from '../config/gameConfig'

defineProps({
  state: Object,
  daysLeft: Number,
  profit: Number,
  theme: String,
  activeCount: Number,
  maxTrainees: Number,
})
defineEmits(['back', 'toggle-theme', 'open-recruitment'])

const targetGroups = GAME_CONFIG.victory.targetGroups
</script>

<style scoped>
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left h2 {
  font-size: 1.25rem;
}

.days-left {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.header-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-item .value {
  font-weight: 700;
  font-size: 1rem;
}

.stat-item .value.success { color: var(--success); }
.stat-item .value.danger { color: var(--danger); }

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.recruit-btn {
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  color: white;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
}

.recruit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.theme-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.1rem;
}
</style>
