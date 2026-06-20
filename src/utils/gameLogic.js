import { GAME_CONFIG } from '../config/gameConfig'
import { randInt, randFloat, pickRandom, weightedPick, clamp, pairKey } from './random'

const CFG = GAME_CONFIG

export function createInitialGameState() {
  const names = [...CFG.names].sort(() => Math.random() - 0.5)
  const trainees = []
  for (let i = 0; i < CFG.initial.traineeCount; i++) {
    trainees.push(createTrainee(names[i], i, { assignTrait: true, rarity: 'common' }))
  }
  return {
    day: 1,
    money: CFG.initial.money,
    fans: CFG.initial.fans,
    totalRevenue: 0,
    totalExpenses: 0,
    trainees,
    groups: [],
    relationships: initRelationships(trainees),
    schedule: {},
    logs: [{ day: 1, text: '事务所成立！五位练习生已就位，三年征途正式开始。' }],
    pendingEvent: null,
    pendingRating: false,
    gameStatus: 'playing',
    lastSingleDay: {},
    recruitment: {
      candidates: [],
      lastEvent: null,
      pendingEvent: null,
    },
    traineeJoinDays: Object.fromEntries(trainees.map(t => [t.id, 1])),
  }
}

function createTrainee(name, index, opts = {}) {
  const { assignTrait = false, rarity = null } = opts
  const stats = {}
  for (const key of CFG.stats) {
    stats[key] = randInt(CFG.initial.statMin, CFG.initial.statMax)
  }

  const traits = []
  if (assignTrait && rarity) {
    const rarityLevel = rarity || pickRarity()
    const trait = pickTraitForRarity(rarityLevel)
    if (trait) {
      traits.push(trait)
    }
  }

  return {
    id: `t${index}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    stats,
    fatigue: CFG.initial.fatigue + randInt(-5, 5),
    stress: CFG.initial.stress + randInt(-3, 3),
    status: 'trainee',
    groupId: null,
    illnessDays: 0,
    poachResist: randInt(40, 70),
    fans: 0,
    singlesReleased: 0,
    traits,
  }
}

function pickRarity(override = null) {
  if (override) return override
  const entries = Object.entries(CFG.recruitment.rarityWeights).map(([key, weight]) => ({
    key,
    weight,
  }))
  return weightedPick(entries).key
}

function pickTraitForRarity(rarity) {
  const availableTraits = Object.entries(CFG.traits)
    .filter(([_, t]) => t.rarity.includes(rarity))
    .map(([key, t]) => ({ key, ...t, weight: 1 }))
  if (availableTraits.length === 0) return null
  const picked = weightedPick(availableTraits)
  return picked.key
}

export function generateCandidates(state, opts = {}) {
  const { guaranteeLegendary = false, extraEpic = false } = opts
  let extraRareCount = opts.extraRareCount || 0
  const usedNames = state.trainees.map(t => t.name)
  const availableNames = CFG.names.filter(n => !usedNames.includes(n))
  const extraPoolNames = [
    '楚凌霄', '白若溪', '南宫月', '司徒雪', '慕容曦',
    '上官瑶', '东方晴', '皇甫琳', '夏侯芸', '诸葛敏',
    '欧阳瑾', '闻人玥', '赫连清', '尉迟柔', '澹台雅',
  ]
  const allNames = [...availableNames, ...extraPoolNames]

  let count = CFG.recruitment.candidateCount
  let candidates = []
  let used = []

  for (let i = 0; i < count; i++) {
    let rarity
    if (guaranteeLegendary && i === 0) {
      rarity = 'legendary'
    } else if (extraRareCount > 0 && i < 2) {
      rarity = Math.random() < 0.5 ? 'rare' : 'epic'
      extraRareCount--
    } else {
      rarity = pickRarity()
    }
    candidates.push(createCandidate(rarity, allNames, used))
    used.push(candidates[candidates.length - 1].name)
  }

  if (extraEpic) {
    candidates.push(createCandidate('epic', allNames, used))
    used.push(candidates[candidates.length - 1].name)
  }

  return candidates
}

function createCandidate(rarity, namePool, usedNames) {
  const available = namePool.filter(n => !usedNames.includes(n))
  const name = available.length > 0 ? pickRandom(available) : `练习生${randInt(100, 999)}`

  const stats = {}
  const bonusRange = CFG.recruitment.statBonus[rarity]
  const mult = CFG.recruitment.rarityMultiplier[rarity]

  for (const key of CFG.stats) {
    const base = randInt(CFG.initial.statMin, CFG.initial.statMax)
    const bonus = randInt(bonusRange[0], bonusRange[1])
    stats[key] = clamp(Math.round((base + bonus) * (0.9 + mult * 0.1)), 0, CFG.thresholds.statCap)
  }

  const traitKey = pickTraitForRarity(rarity)
  const traits = traitKey ? [traitKey] : []

  const baseCost = randInt(CFG.recruitment.baseSignCostMin, CFG.recruitment.baseSignCostMax)
  const signCost = Math.round(baseCost * mult)

  return {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    stats,
    rarity,
    traits,
    signCost,
    fatigue: randInt(5, 20),
    stress: randInt(3, 15),
    poachResist: randInt(30, 80),
  }
}

export function triggerRecruitmentEvent() {
  const chance = 0.35
  if (Math.random() > chance) return null

  const events = Object.entries(CFG.recruitmentEvents).map(([key, val]) => ({
    key,
    ...val,
  }))
  const picked = weightedPick(events)
  const event = {
    type: picked.key,
    label: picked.label,
    effect: picked.effect,
    message: picked.message,
  }

  switch (picked.effect) {
    case 'discount':
      event.discount = picked.discount
      break
    case 'extraCandidate':
      event.rarity = picked.rarity
      break
    case 'grantMoney':
      event.amount = randInt(picked.amount[0], picked.amount[1])
      break
    case 'gainFans':
      event.amount = randInt(picked.amount[0], picked.amount[1])
      break
    case 'extraRare':
      event.count = picked.count
      break
  }

  return event
}

export function signCandidate(state, candidateId) {
  const candidate = state.recruitment.candidates.find(c => c.id === candidateId)
  if (!candidate) return { success: false, message: '候选人不存在' }

  const activeCount = getActiveTrainees(state).length
  if (activeCount >= CFG.recruitment.maxTrainees) {
    return { success: false, message: `练习生数量已达上限（${CFG.recruitment.maxTrainees}人）` }
  }

  if (state.money < candidate.signCost) {
    return { success: false, message: '资金不足，无法签约' }
  }

  const newTrainee = {
    id: `t_signed_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: candidate.name,
    stats: { ...candidate.stats },
    fatigue: candidate.fatigue,
    stress: candidate.stress,
    status: 'trainee',
    groupId: null,
    illnessDays: 0,
    poachResist: candidate.poachResist,
    fans: 0,
    singlesReleased: 0,
    traits: [...candidate.traits],
  }

  const trainees = [...state.trainees, newTrainee]
  const relationships = addNewTraineeRelationships(state.relationships, state.trainees, newTrainee)
  const traineeJoinDays = { ...state.traineeJoinDays, [newTrainee.id]: state.day }

  const newCandidates = state.recruitment.candidates.filter(c => c.id !== candidateId)

  const logs = [
    ...state.logs,
    {
      day: state.day,
      text: `📝 签约成功！${CFG.recruitment.rarityLabels[candidate.rarity]}级练习生「${candidate.name}」加入事务所，花费 ¥${candidate.signCost.toLocaleString()}。`,
    },
  ]

  return {
    success: true,
    state: {
      ...state,
      money: state.money - candidate.signCost,
      totalExpenses: state.totalExpenses + candidate.signCost,
      trainees,
      relationships,
      traineeJoinDays,
      logs,
      recruitment: {
        ...state.recruitment,
        candidates: newCandidates,
      },
    },
  }
}

function addNewTraineeRelationships(relationships, existingTrainees, newTrainee) {
  const newRel = { ...relationships }
  for (const existing of existingTrainees) {
    if (existing.status === 'left') continue
    newRel[pairKey(existing.id, newTrainee.id)] = randInt(
      CFG.relationships.initialRange[0],
      CFG.relationships.initialRange[1]
    )
  }
  return newRel
}

function initRelationships(trainees) {
  const rel = {}
  for (let i = 0; i < trainees.length; i++) {
    for (let j = i + 1; j < trainees.length; j++) {
      rel[pairKey(trainees[i].id, trainees[j].id)] = randInt(
        CFG.relationships.initialRange[0],
        CFG.relationships.initialRange[1]
      )
    }
  }
  return rel
}

export function calcTraineeScore(trainee) {
  const w = CFG.rating.scoreWeights
  let score = 0
  for (const key of CFG.stats) {
    score += trainee.stats[key] * w[key]
  }
  const fatiguePenalty = trainee.fatigue > CFG.thresholds.fatigueExhausted ? 0.85 : 1
  const stressPenalty = trainee.stress > CFG.thresholds.stressHigh ? 0.9 : 1
  return Math.round(score * fatiguePenalty * stressPenalty)
}

export function getRelationship(relationships, idA, idB) {
  return relationships[pairKey(idA, idB)] ?? 0
}

export function setRelationship(relationships, idA, idB, value) {
  relationships[pairKey(idA, idB)] = clamp(
    value,
    CFG.relationships.min,
    CFG.relationships.max
  )
}

export function getActiveTrainees(state) {
  return state.trainees.filter((t) => t.status !== 'left')
}

export function getDebutedTrainees(state) {
  return state.trainees.filter((t) => t.status === 'debuted')
}

export function calcProfit(state) {
  return state.totalRevenue - state.totalExpenses
}

export function checkVictory(state) {
  const profit = calcProfit(state)
  const groups = state.groups.length
  const goalsMet =
    groups >= CFG.victory.targetGroups &&
    (!CFG.victory.requirePositiveProfit || profit > 0)

  if (goalsMet) return 'won'

  if (state.day > CFG.victory.totalDays) {
    if (groups < CFG.victory.targetGroups) return 'lost_groups'
    if (CFG.victory.requirePositiveProfit && profit <= 0) return 'lost_profit'
  }
  if (state.money < -20000) return 'lost_bankrupt'
  const active = getActiveTrainees(state)
  if (active.length === 0 && state.groups.length === 0) return 'lost_empty'
  return null
}

function applyRange(val, range, mult = 1) {
  if (!range || range.length < 2) return val
  return val + randInt(Math.round(range[0] * mult), Math.round(range[1] * mult))
}

function getTrainingMultiplier(trainee, partners, relationships, activityKey) {
  let mult = 1
  if (trainee.fatigue >= CFG.thresholds.fatigueExhausted) mult *= 0.5
  if (trainee.stress >= CFG.thresholds.stressHigh) mult *= 0.8
  if (trainee.stress >= CFG.thresholds.stressBreakdown) mult *= 0

  let synergyCount = 0
  for (const p of partners) {
    const rel = getRelationship(relationships, trainee.id, p.id)
    if (rel >= CFG.relationships.synergyThreshold) synergyCount++
  }
  if (synergyCount > 0) {
    mult *= 1 + CFG.relationships.synergyBonus * Math.min(synergyCount, 2)
  }

  const traitMult = getTraitTrainingBonus(trainee, activityKey, partners.length === 0)
  mult *= traitMult

  return mult
}

function getTraitTrainingBonus(trainee, activityKey, isAlone) {
  let bonus = 1
  const daysSinceJoin = (trainee._daysSinceJoin || 0)

  for (const traitKey of (trainee.traits || [])) {
    const trait = CFG.traits[traitKey]
    if (!trait) continue

    if (trait.allTrainBonus) bonus *= (1 + trait.allTrainBonus)

    if (trait.trainBonus && trait.stat) {
      if ((activityKey === 'vocal' && trait.stat === 'vocal') ||
          (activityKey === 'dance' && trait.stat === 'dance') ||
          (activityKey === 'rap' && trait.stat === 'rap') ||
          (activityKey === 'physical' && (trait.stat === 'dance' || trait.stat === 'looks')) ||
          (activityKey === 'pr' && (trait.stat === 'charm' || trait.stat === 'looks'))) {
        bonus *= (1 + trait.trainBonus)
      }
    }

    if (trait.rapBonus && activityKey === 'rap') {
      bonus *= (1 + trait.rapBonus)
    }

    if (traitKey === 'introvert' && isAlone) {
      bonus *= (1 + trait.trainBonus)
    }

    if (trait.lateBonus && daysSinceJoin >= 100) {
      bonus *= (1 + trait.lateBonus)
    }
  }

  return bonus
}

function getTraitFatigueModifier(trainee) {
  let mod = 1
  for (const traitKey of (trainee.traits || [])) {
    const trait = CFG.traits[traitKey]
    if (trait && trait.fatigueReduce) mod *= (1 - trait.fatigueReduce)
  }
  return mod
}

function getTraitStressModifier(trainee) {
  let mod = 1
  for (const traitKey of (trainee.traits || [])) {
    const trait = CFG.traits[traitKey]
    if (!trait) continue
    if (trait.stressReduce) mod *= (1 - trait.stressReduce)
    if (trait.stressPenalty) mod *= (1 + trait.stressPenalty)
  }
  return mod
}

function getTraitFansModifier(trainee) {
  let mod = 1
  for (const traitKey of (trainee.traits || [])) {
    const trait = CFG.traits[traitKey]
    if (trait && trait.fansBonus) mod *= (1 + trait.fansBonus)
  }
  return mod
}

function getTraitPublicModifier(trainee) {
  let mod = 1
  for (const traitKey of (trainee.traits || [])) {
    const trait = CFG.traits[traitKey]
    if (!trait) continue
    if (trait.publicBonus) mod *= (1 + trait.publicBonus)
    if (traitKey === 'introvert' && trait.publicPenalty) mod *= (1 - trait.publicPenalty)
  }
  return mod
}

export function getTraitsInfo(trainee) {
  return (trainee.traits || []).map(key => ({
    key,
    ...CFG.traits[key],
  }))
}

export function processDay(state) {
  const logs = []
  let money = state.money
  let fans = state.fans
  let totalExpenses = state.totalExpenses
  const relationships = { ...state.relationships }
  const trainees = state.trainees.map((t) => ({ ...t, stats: { ...t.stats } }))
  const schedule = state.schedule

  const joinDays = state.traineeJoinDays || {}
  for (const t of trainees) {
    t._daysSinceJoin = state.day - (joinDays[t.id] || state.day)
  }

  const activityGroups = {}
  for (const [traineeId, activity] of Object.entries(schedule)) {
    if (!activityGroups[activity]) activityGroups[activity] = []
    activityGroups[activity].push(traineeId)
  }

  for (const trainee of trainees) {
    if (trainee.status === 'left') continue

    if (trainee.illnessDays > 0) {
      trainee.illnessDays--
      trainee.fatigue = clamp(trainee.fatigue - 5, 0, 100)
      logs.push({ day: state.day, text: `${trainee.name} 仍在休养中（剩余 ${trainee.illnessDays} 天）。` })
      continue
    }

    if (trainee.fatigue >= CFG.thresholds.fatigueCollapse) {
      trainee.fatigue = applyRange(trainee.fatigue, CFG.activities.rest.fatigue)
      trainee.stress = applyRange(trainee.stress, CFG.activities.rest.stress)
      logs.push({ day: state.day, text: `${trainee.name} 过度疲劳，被迫休息。` })
      continue
    }

    const activityKey = schedule[trainee.id]
    if (!activityKey) {
      logs.push({ day: state.day, text: `${trainee.name} 今日未安排日程。` })
      continue
    }

    const activity = CFG.activities[activityKey]
    if (!activity) continue

    money -= activity.moneyCost
    totalExpenses += activity.moneyCost

    const partners = (activityGroups[activityKey] || [])
      .filter((id) => id !== trainee.id)
      .map((id) => trainees.find((t) => t.id === id))
      .filter(Boolean)

    const mult = getTrainingMultiplier(trainee, partners, relationships, activityKey)
    const fatigueMod = getTraitFatigueModifier(trainee)
    const stressMod = getTraitStressModifier(trainee)
    const fansMod = getTraitFansModifier(trainee)
    const publicMod = getTraitPublicModifier(trainee)

    if (activity.requiresTraining && trainee.stress >= CFG.thresholds.stressBreakdown) {
      logs.push({ day: state.day, text: `${trainee.name} 压力过大，无法集中精力训练。` })
      trainee.stress = clamp(trainee.stress + randInt(2, 5), 0, 100)
      continue
    }

    let hasProdigyBonus = false
    for (const [stat, range] of Object.entries(activity.statGain || {})) {
      const gain = randInt(range[0], range[1])
      let finalGain = Math.round(gain * mult)

      for (const traitKey of (trainee.traits || [])) {
        const trait = CFG.traits[traitKey]
        if (trait?.statGainChance && Math.random() < trait.statGainChance) {
          finalGain += 1
          hasProdigyBonus = true
        }
      }

      trainee.stats[stat] = clamp(
        trainee.stats[stat] + finalGain,
        0,
        CFG.thresholds.statCap
      )
    }
    if (hasProdigyBonus) {
      logs.push({ day: state.day, text: `✨ ${trainee.name} 灵光一闪，训练效果额外提升！` })
    }

    const fatigueGain = Math.round((activity.fatigue[1] - activity.fatigue[0]) * fatigueMod)
    const fatigueBase = activity.fatigue[0]
    trainee.fatigue = clamp(trainee.fatigue + randInt(fatigueBase, fatigueBase + fatigueGain), 0, 100)

    const stressGain = Math.round((activity.stress[1] - activity.stress[0]) * stressMod)
    const stressBase = activity.stress[0]
    trainee.stress = clamp(trainee.stress + randInt(stressBase, stressBase + stressGain), 0, 100)

    if (activity.fansGain) {
      const baseGain = randInt(activity.fansGain[0], activity.fansGain[1])
      const gained = Math.round(baseGain * fansMod * publicMod)
      fans += gained
      trainee.fans += Math.round(gained * 0.3 * fansMod)
      logs.push({ day: state.day, text: `${trainee.name} 参与公关，粉丝 +${gained}。` })
    }

    for (const p of partners) {
      const cur = getRelationship(relationships, trainee.id, p.id)
      setRelationship(
        relationships,
        trainee.id,
        p.id,
        cur + randInt(CFG.relationships.trainingTogether[0], CFG.relationships.trainingTogether[1])
      )
    }
  }

  for (let i = 0; i < trainees.length; i++) {
    for (let j = i + 1; j < trainees.length; j++) {
      const a = trainees[i]
      const b = trainees[j]
      if (a.status === 'left' || b.status === 'left') continue

      const key = pairKey(a.id, b.id)
      let rel = relationships[key] ?? 0
      rel += randInt(CFG.relationships.dailyDrift[0], CFG.relationships.dailyDrift[1])
      rel = clamp(rel, CFG.relationships.min, CFG.relationships.max)

      const maxStat = (t) => Math.max(...CFG.stats.map((s) => t.stats[s]))
      const gap = Math.abs(maxStat(a) - maxStat(b))
      if (gap >= CFG.relationships.statGapCompetition) {
        rel -= randInt(2, 6)
        const weaker = maxStat(a) < maxStat(b) ? a : b
        weaker.stress = clamp(
          weaker.stress + randInt(CFG.relationships.competitionStress[0], CFG.relationships.competitionStress[1]),
          0,
          100
        )
        if (rel <= CFG.relationships.competitionThreshold) {
          logs.push({
            day: state.day,
            text: `${weaker.name} 感受到来自 ${weaker === a ? b.name : a.name} 的竞争压力！`,
          })
        }
      }

      relationships[key] = rel
    }
  }

  const dailyCost =
    CFG.dailyCosts.baseOperatingCost +
    trainees.filter((t) => t.status === 'trainee').length * CFG.dailyCosts.perTraineeCost +
    trainees.filter((t) => t.status === 'debuted').length * CFG.dailyCosts.perDebutedCost +
    state.groups.length * CFG.dailyCosts.perGroupCost

  money -= dailyCost
  totalExpenses += dailyCost

  const newDay = state.day + 1
  const pendingRating = state.day % CFG.rating.interval === 0

  let pendingEvent = null
  if (Math.random() < CFG.events.dailyChance) {
    pendingEvent = generateRandomEvent(trainees, state.day)
    if (pendingEvent.type === 'fan_surge') {
      fans += pendingEvent.fansGain
      logs.push({ day: state.day, text: `【${pendingEvent.label}】粉丝 +${pendingEvent.fansGain}！` })
      pendingEvent = null
    } else if (pendingEvent.type === 'inspiration') {
      const target = pendingEvent.target
      const stat = pickRandom(CFG.stats)
      target.stats[stat] = clamp(target.stats[stat] + pendingEvent.statBoost, 0, CFG.thresholds.statCap)
      logs.push({
        day: state.day,
        text: `【${pendingEvent.label}】${target.name} 的${CFG.statLabels[stat]} +${pendingEvent.statBoost}！`,
      })
      pendingEvent = null
    } else if (pendingEvent.type === 'negative_news') {
      fans = Math.max(0, fans - pendingEvent.fansLoss)
      for (const t of trainees) {
        if (t.status !== 'left') {
          t.stress = clamp(t.stress + pendingEvent.stressGain, 0, 100)
        }
      }
      logs.push({
        day: state.day,
        text: `【${pendingEvent.label}】粉丝 -${pendingEvent.fansLoss}，全员压力上升。`,
      })
      pendingEvent = null
    } else if (pendingEvent.type === 'illness') {
      pendingEvent.target.illnessDays = pendingEvent.duration
      pendingEvent.target.stress = clamp(
        pendingEvent.target.stress + pendingEvent.stressGain,
        0,
        100
      )
      logs.push({
        day: state.day,
        text: `【${pendingEvent.label}】${pendingEvent.target.name} 需要休养 ${pendingEvent.duration} 天。`,
      })
      pendingEvent = null
    }
  }

  const nextState = {
    ...state,
    day: newDay,
    money,
    fans,
    totalExpenses,
    trainees,
    relationships,
    schedule: {},
    logs: [...state.logs, ...logs],
    pendingEvent,
    pendingRating,
  }

  const result = checkVictory(nextState)
  if (result) nextState.gameStatus = result

  return nextState
}

function generateRandomEvent(trainees, day) {
  const active = trainees.filter((t) => t.status !== 'left' && t.illnessDays === 0)
  if (active.length === 0) return null

  const types = Object.entries(CFG.events.types).map(([key, val]) => ({
    key,
    ...val,
  }))
  const picked = weightedPick(types)
  const target = pickRandom(active)

  const event = {
    type: picked.key,
    label: picked.label,
    description: picked.description,
    day,
    target,
    resolved: false,
  }

  switch (picked.key) {
    case 'poaching':
      event.successChance = picked.successChance
      break
    case 'illness':
      event.duration = randInt(picked.duration[0], picked.duration[1])
      event.stressGain = randInt(picked.stressGain[0], picked.stressGain[1])
      break
    case 'inspiration':
      event.statBoost = randInt(picked.statBoost[0], picked.statBoost[1])
      break
    case 'negative_news':
      event.fansLoss = randInt(picked.fansLoss[0], picked.fansLoss[1])
      event.stressGain = randInt(picked.stressGain[0], picked.stressGain[1])
      break
    case 'fan_surge':
      event.fansGain = randInt(picked.fansGain[0], picked.fansGain[1])
      break
  }

  return event
}

export function resolvePoachingEvent(state, keepTrainee) {
  const event = state.pendingEvent
  if (!event || event.type !== 'poaching') return state

  const logs = [...state.logs]
  const trainees = state.trainees.map((t) => ({ ...t, stats: { ...t.stats } }))
  const target = trainees.find((t) => t.id === event.target.id)

  if (keepTrainee) {
    const cost = randInt(8000, 15000)
    logs.push({
      day: state.day,
      text: `【挖角危机】你花费 ¥${cost} 成功挽留 ${target.name}！`,
    })
    target.stress = clamp(target.stress + randInt(5, 12), 0, 100)
    return {
      ...state,
      money: state.money - cost,
      totalExpenses: state.totalExpenses + cost,
      trainees,
      logs,
      pendingEvent: null,
    }
  }

  const roll = Math.random()
  const resist = target.poachResist / 100
  if (roll > event.successChance * (1 - resist * 0.5)) {
    logs.push({ day: state.day, text: `【挖角危机】${target.name} 决定留在事务所。` })
    return { ...state, trainees, logs, pendingEvent: null }
  }

  target.status = 'left'
  logs.push({ day: state.day, text: `【挖角危机】${target.name} 被竞争对手挖走，离开了事务所！` })
  const result = checkVictory({ ...state, trainees })
  return {
    ...state,
    trainees,
    logs,
    pendingEvent: null,
    gameStatus: result || state.gameStatus,
  }
}

export function debutGroup(state, memberIds, groupName) {
  const members = state.trainees.filter((t) => memberIds.includes(t.id))
  if (members.length < CFG.rating.minGroupSize || members.length > CFG.rating.maxGroupSize) {
    return { success: false, message: `出道人数需在 ${CFG.rating.minGroupSize}-${CFG.rating.maxGroupSize} 人之间` }
  }

  for (const m of members) {
    if (m.status !== 'trainee') return { success: false, message: `${m.name} 无法出道` }
    if (calcTraineeScore(m) < CFG.rating.debutScoreThreshold) {
      return { success: false, message: `${m.name} 综合评分未达标（需 ≥${CFG.rating.debutScoreThreshold}）` }
    }
  }

  const groupId = `g_${Date.now()}`
  const trainees = state.trainees.map((t) => {
    if (memberIds.includes(t.id)) {
      return { ...t, status: 'debuted', groupId }
    }
    return t
  })

  const avgStats = {}
  for (const key of CFG.stats) {
    avgStats[key] = Math.round(members.reduce((s, m) => s + m.stats[key], 0) / members.length)
  }

  const groups = [
    ...state.groups,
    {
      id: groupId,
      name: groupName || `${members.map((m) => m.name[0]).join('')}组`,
      memberIds: [...memberIds],
      debutedDay: state.day,
      avgStats,
      totalSales: 0,
      singles: [],
    },
  ]

  const logs = [
    ...state.logs,
    {
      day: state.day,
      text: `🎉 组合「${groupName || groups[groups.length - 1].name}」正式出道！成员：${members.map((m) => m.name).join('、')}`,
    },
  ]

  return {
    success: true,
    state: { ...state, trainees, groups, logs, pendingRating: false },
  }
}

export function releaseSingle(state, groupId) {
  const group = state.groups.find((g) => g.id === groupId)
  if (!group) return { success: false, message: '组合不存在' }

  const lastDay = state.lastSingleDay[groupId] || 0
  if (state.day - lastDay < CFG.single.cooldownDays) {
    return {
      success: false,
      message: `距上次发歌还需 ${CFG.single.cooldownDays - (state.day - lastDay)} 天`,
    }
  }

  if (state.money < CFG.single.creationCost) {
    return { success: false, message: '资金不足' }
  }

  const members = state.trainees.filter((t) => group.memberIds.includes(t.id))
  const statAvg =
    CFG.stats.reduce((s, k) => s + group.avgStats[k], 0) / CFG.stats.length
  const charmAvg = group.avgStats.charm
  const popularity = state.fans + members.reduce((s, m) => s + m.fans, 0)

  let salesBonus = 1
  for (const m of members) {
    for (const traitKey of (m.traits || [])) {
      const trait = CFG.traits[traitKey]
      if (trait?.salesBonus) salesBonus *= (1 + trait.salesBonus)
    }
  }

  const baseSales = Math.round(
    CFG.single.baseSales +
      statAvg * CFG.single.statWeight * 50 +
      popularity * CFG.single.fansWeight * 0.08 +
      charmAvg * CFG.single.charmWeight * 30 +
      randInt(-200, 400)
  )
  const sales = Math.round(baseSales * salesBonus)

  const revenue = sales * CFG.single.revenuePerSale
  const groups = state.groups.map((g) => {
    if (g.id !== groupId) return g
    return {
      ...g,
      totalSales: g.totalSales + sales,
      singles: [
        ...g.singles,
        { day: state.day, sales, revenue, title: `单曲 Vol.${g.singles.length + 1}` },
      ],
    }
  })

  const trainees = state.trainees.map((t) => {
    if (!group.memberIds.includes(t.id)) return t
    return { ...t, singlesReleased: t.singlesReleased + 1, fans: t.fans + Math.round(sales * 0.05) }
  })

  const logs = [
    ...state.logs,
    {
      day: state.day,
      text: `💿 ${group.name} 发行新单曲，销量 ${sales.toLocaleString()}，收入 ¥${revenue.toLocaleString()}！`,
    },
  ]

  return {
    success: true,
    state: {
      ...state,
      money: state.money - CFG.single.creationCost + revenue,
      totalRevenue: state.totalRevenue + revenue,
      totalExpenses: state.totalExpenses + CFG.single.creationCost,
      fans: state.fans + Math.round(sales * 0.02),
      groups,
      trainees,
      logs,
      lastSingleDay: { ...state.lastSingleDay, [groupId]: state.day },
    },
    sales,
    revenue,
  }
}

export function getRatingResults(state) {
  return getActiveTrainees(state)
    .filter((t) => t.status === 'trainee')
    .map((t) => ({
      ...t,
      score: calcTraineeScore(t),
      canDebut: calcTraineeScore(t) >= CFG.rating.debutScoreThreshold,
    }))
    .sort((a, b) => b.score - a.score)
}
