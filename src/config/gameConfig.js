/**
 * 偶像养成事务所 — 全部数值规则集中配置
 * 调整平衡性时只需修改此文件
 */
export const GAME_CONFIG = {
  // ── 胜利 / 失败条件 ──
  victory: {
    targetGroups: 3,        // 需培养出道组合数
    totalDays: 1095,        // 3 年（天）
    requirePositiveProfit: true,
  },

  // ── 初始资源 ──
  initial: {
    money: 80000,
    fans: 200,
    traineeCount: 5,
    statMin: 18,
    statMax: 42,
    fatigue: 10,
    stress: 8,
  },

  // ── 五维属性键名 ──
  stats: ['vocal', 'dance', 'rap', 'looks', 'charm'],
  statLabels: {
    vocal: '唱功',
    dance: '舞蹈',
    rap: '说唱',
    looks: '颜值',
    charm: '魅力',
  },

  // ── 日程活动 ──
  activities: {
    vocal: {
      label: '声乐课',
      icon: '🎤',
      statGain: { vocal: [4, 7] },
      fatigue: [10, 14],
      stress: [2, 4],
      moneyCost: 400,
      requiresTraining: true,
    },
    dance: {
      label: '舞蹈课',
      icon: '💃',
      statGain: { dance: [4, 7] },
      fatigue: [12, 16],
      stress: [2, 4],
      moneyCost: 400,
      requiresTraining: true,
    },
    rap: {
      label: '说唱课',
      icon: '🎧',
      statGain: { rap: [4, 7] },
      fatigue: [10, 14],
      stress: [3, 5],
      moneyCost: 400,
      requiresTraining: true,
    },
    physical: {
      label: '体能训练',
      icon: '🏋️',
      statGain: { dance: [1, 3], looks: [0, 1] },
      fatigue: [6, 10],
      stress: [-2, 0],
      moneyCost: 250,
      requiresTraining: true,
    },
    rest: {
      label: '休息',
      icon: '😴',
      statGain: {},
      fatigue: [-28, -18],
      stress: [-10, -5],
      moneyCost: 0,
      requiresTraining: false,
    },
    pr: {
      label: '公关活动',
      icon: '📸',
      statGain: { charm: [2, 4], looks: [1, 3] },
      fatigue: [5, 8],
      stress: [6, 14],
      fansGain: [80, 250],
      moneyCost: 1200,
      requiresTraining: false,
    },
  },

  // ── 疲劳 / 压力阈值 ──
  thresholds: {
    fatigueExhausted: 75,   // 训练效果减半
    fatigueCollapse: 92,    // 强制休息
    stressHigh: 65,         // 训练效果 -20%
    stressBreakdown: 88,    // 当天无法训练
    statCap: 100,
  },

  // ── 每日运营成本 ──
  dailyCosts: {
    baseOperatingCost: 600,
    perTraineeCost: 250,
    perDebutedCost: 800,
    perGroupCost: 500,
  },

  // ── 周末内部评级 ──
  rating: {
    interval: 7,
    debutScoreThreshold: 58,  // 综合评分达标可出道
    minGroupSize: 2,
    maxGroupSize: 5,
    scoreWeights: {
      vocal: 0.22,
      dance: 0.22,
      rap: 0.16,
      looks: 0.2,
      charm: 0.2,
    },
  },

  // ── 单曲发行 ──
  single: {
    creationCost: 15000,
    baseSales: 800,
    statWeight: 0.45,
    fansWeight: 0.35,
    charmWeight: 0.2,
    revenuePerSale: 6,
    cooldownDays: 30,
  },

  // ── 练习生关系 ──
  relationships: {
    min: -100,
    max: 100,
    synergyThreshold: 55,       // 默契线
    competitionThreshold: -35,    // 竞争线
    synergyBonus: 0.25,           // 默契训练加成
    competitionStress: [12, 22],
    dailyDrift: [-3, 3],
    trainingTogether: [4, 9],
    statGapCompetition: 18,
    initialRange: [-15, 25],
  },

  // ── 随机事件 ──
  events: {
    dailyChance: 0.18,
    types: {
      negative_news: {
        label: '负面新闻',
        weight: 22,
        fansLoss: [150, 600],
        stressGain: [8, 18],
        description: '媒体曝出练习生训练期间发生冲突，粉丝舆论下滑。',
      },
      poaching: {
        label: '挖角危机',
        weight: 14,
        successChance: 0.28,
        description: '竞争对手试图挖走你旗下最有潜力的练习生！',
      },
      illness: {
        label: '生病',
        weight: 20,
        duration: [2, 4],
        statDecay: [1, 3],
        stressGain: [5, 10],
        description: '一名练习生身体不适，需要休养。',
      },
      inspiration: {
        label: '灵感爆发',
        weight: 22,
        statBoost: [6, 14],
        description: '一名练习生突然迸发出创作灵感，能力大幅提升！',
      },
      fan_surge: {
        label: '粉丝暴涨',
        weight: 22,
        fansGain: [300, 900],
        description: '一段练习室花絮意外走红，粉丝数激增！',
      },
    },
  },

  // ── 练习生名字池 ──
  names: [
    '林星遥', '苏晚晴', '陈予安', '顾念初', '沈知夏',
    '江月白', '陆清欢', '唐小满', '许未央', '韩鹿鸣',
    '方念慈', '宋时雨', '叶知秋', '周慕青', '赵星河',
  ],

  // ── 招募中心 ──
  recruitment: {
    refreshCost: 3000,
    candidateCount: 4,
    baseSignCostMin: 12000,
    baseSignCostMax: 28000,
    rarityWeights: {
      common: 55,
      rare: 30,
      epic: 12,
      legendary: 3,
    },
    rarityMultiplier: {
      common: 1.0,
      rare: 1.6,
      epic: 2.4,
      legendary: 4.0,
    },
    rarityLabels: {
      common: '普通',
      rare: '稀有',
      epic: '精英',
      legendary: '传奇',
    },
    statBonus: {
      common: [0, 5],
      rare: [5, 12],
      epic: [12, 22],
      legendary: [22, 35],
    },
    maxTrainees: 12,
  },

  // ── 练习生特质 ──
  traits: {
    vocal_genius: {
      label: '声乐天才',
      icon: '🎤',
      rarity: ['rare', 'epic', 'legendary'],
      stat: 'vocal',
      trainBonus: 0.35,
      description: '声乐训练效果提升35%',
    },
    dance_prodigy: {
      label: '舞蹈奇才',
      icon: '💃',
      rarity: ['rare', 'epic', 'legendary'],
      stat: 'dance',
      trainBonus: 0.35,
      description: '舞蹈训练效果提升35%',
    },
    rap_master: {
      label: '说唱高手',
      icon: '🎧',
      rarity: ['rare', 'epic', 'legendary'],
      stat: 'rap',
      trainBonus: 0.35,
      description: '说唱训练效果提升35%',
    },
    natural_beauty: {
      label: '天生丽质',
      icon: '✨',
      rarity: ['rare', 'epic', 'legendary'],
      stat: 'looks',
      trainBonus: 0.3,
      publicBonus: 0.25,
      description: '颜值相关训练+30%，公关吸粉+25%',
    },
    charisma: {
      label: '天生媚骨',
      icon: '💫',
      rarity: ['rare', 'epic', 'legendary'],
      stat: 'charm',
      trainBonus: 0.3,
      publicBonus: 0.3,
      description: '魅力训练+30%，公关吸粉+30%',
    },
    iron_body: {
      label: '钢铁之躯',
      icon: '💪',
      rarity: ['epic', 'legendary'],
      fatigueReduce: 0.35,
      description: '疲劳积累降低35%',
    },
    zen_mind: {
      label: '禅心',
      icon: '🧘',
      rarity: ['epic', 'legendary'],
      stressReduce: 0.4,
      description: '压力积累降低40%',
    },
    quick_learner: {
      label: '学霸',
      icon: '📚',
      rarity: ['rare', 'epic'],
      allTrainBonus: 0.18,
      description: '所有训练效果提升18%',
    },
    fan_favorite: {
      label: '吸粉体质',
      icon: '🌟',
      rarity: ['rare', 'epic', 'legendary'],
      fansBonus: 0.5,
      description: '粉丝获取量提升50%',
    },
    stage_presence: {
      label: '舞台王者',
      icon: '👑',
      rarity: ['legendary'],
      allTrainBonus: 0.25,
      fansBonus: 0.35,
      publicBonus: 0.2,
      description: '全能型：训练+25%，吸粉+35%，公关+20%',
    },
    prodigy: {
      label: '天才少女',
      icon: '🌈',
      rarity: ['legendary'],
      allTrainBonus: 0.3,
      statGainChance: 0.15,
      description: '训练+30%，每次训练有15%概率随机额外+1属性',
    },
    workaholic: {
      label: '练习狂',
      icon: '🔥',
      rarity: ['epic', 'legendary'],
      allTrainBonus: 0.22,
      fatigueReduce: 0.15,
      stressReduce: 0.1,
      description: '训练+22%，疲劳和压力积累略减',
    },
    lucky: {
      label: '锦鲤体质',
      icon: '🐟',
      rarity: ['rare', 'epic'],
      eventBonus: 0.35,
      description: '正面事件概率+35%，负面事件影响降低',
    },
    songwriter: {
      label: '创作才女',
      icon: '🎵',
      rarity: ['rare', 'epic', 'legendary'],
      salesBonus: 0.15,
      rapBonus: 0.1,
      description: '出道后单曲销量+15%，说唱训练+10%',
    },
    late_bloomer: {
      label: '大器晚成',
      icon: '🌱',
      rarity: ['common', 'rare'],
      lateBonus: 0.5,
      description: '训练100天后，所有训练效果额外+50%',
    },
    introvert: {
      label: '社恐',
      icon: '😳',
      rarity: ['common'],
      trainBonus: 0.1,
      publicPenalty: 0.3,
      description: '独自训练+10%，但公关活动吸粉-30%',
    },
    perfectionist: {
      label: '完美主义',
      icon: '⚡',
      rarity: ['rare', 'epic'],
      trainBonus: 0.25,
      stressPenalty: 0.15,
      description: '训练+25%，但压力积累+15%',
    },
  },

  // ── 招募稀有事件 ──
  recruitmentEvents: {
    scouting_discount: {
      label: '星探优惠',
      weight: 18,
      effect: 'discount',
      discount: 0.5,
      message: '星探老朋友提供半价折扣！本次刷新费用减半',
    },
    hidden_gem: {
      label: '沧海遗珠',
      weight: 10,
      effect: 'extraCandidate',
      rarity: 'epic',
      message: '发现一名被埋没的精英级候选人！',
    },
    legendary_appear: {
      label: '传奇降临',
      weight: 4,
      effect: 'guaranteeLegendary',
      message: '传说中的天才候选人出现在招募中心！',
    },
    bonus_money: {
      label: '赞助惊喜',
      weight: 15,
      effect: 'grantMoney',
      amount: [5000, 15000],
      message: '赞助商对招募很感兴趣，提供了一笔奖金！',
    },
    fan_interest: {
      label: '粉丝期待',
      weight: 15,
      effect: 'gainFans',
      amount: [300, 800],
      message: '招募消息引发粉丝热议，粉丝数增长！',
    },
    double_talent: {
      label: '双子星',
      weight: 8,
      effect: 'extraRare',
      count: 2,
      message: '两名潜力巨大的候选人同时报名！',
    },
  },

  // ── 存档 ──
  storage: {
    savesKey: 'idol-agency-saves-v1',
    themeKey: 'idol-agency-theme',
    maxSlots: 5,
  },
}
