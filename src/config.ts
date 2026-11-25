import travelManifest from './travel-manifest.json'

export type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type EndingMode = 'physical_clue' | 'love_letter' | 'both'

export interface DailyFrameConfig {
  id: number
  title: string
  caption: string
  src: string
  blurSrc: string
}

export interface FlowerConfig {
  id: number
  title: string
  remark: string
  src: string
  puzzleType?: 'heartbeat' | 'smooth' | 'fireworks' | 'distance' | 'card'
}

export interface CityStopConfig {
  id: string
  name: string
  x: number
  y: number
  labelOffset: [number, number]
  clue: string
  date: string
  note: string
  photos: { src: string; w: number; h: number }[]
}

export interface PaperSlipConfig {
  layer: number
  color: string
  width: number
  rotation: number
  text: string
  doodle?: 'gift-cat' | 'smile-cat'
}

export const SITE_CONFIG = {
  profile: {
    herName: '佳奇',
    herNick: 'guaiguai',
    myName: 'choice',
    herBirthYear: 2003,
    myBirthYear: 2006,
    age: 23,
    birthdayDate: '12.14',
    lockScreenDate: '12月14日 星期一',
    togetherDate: '2025.06.27',
    anniversaryDate: '2026.06.27',
  },

  sceneTitles: [
    '01 · 一份礼物',
    '02 · 闭眼许愿',
    '03 · 拍立得换装',
    '04 · 烛光干杯',
    '05 · 富士胶卷卷',
    '06 · 十一束花',
    '07 · 六城足迹',
    '08 · 好运刮刮乐',
    '09 · 幸运老虎机',
    '10 · 童年同框',
    '11 · 纸条蛋糕',
    '12 · 叮咚礼物',
  ] as const,

  scene1: {
    to: '佳奇 guaiguai',
    topic: '23岁生日快乐',
    badge: 'HBD · guaiguai',
    badgeSub: 'A birthday gift, made only for you',
    enTitle: ['A GIFT', 'FOR YOU'] as const,
    cnTitle: ['想送你', '1份礼物'] as const,
    stampTop: 'HAPPY BIRTHDAY',
    stampYear: '2026',
    stampBottom: '· 生日快乐 ·',
    dateRange: '12.14 - ∞',
    recipient: '佳奇 guaiguai',
    signNote: '签收的时候，记得笑一下',
    step1Hint: '拉一下红丝带，解开蝴蝶结',
    step2Hint: '沿中间虚线，往下撕开',
    teaseStep1: '先把右下角的红丝带拉开呀~',
    teaseStep2: '再往下多划一点点，马上就撕开啦~',
  },

  scene2: {
    wishTitle: '闭上眼睛，许个愿',
    blowTitle: '许好了！现在，吹蜡烛',
    typewriterText: '生日快乐！',
    nextLabel: '给寿星拍一张 →',
  },

  scene3: {
    title: '今天的寿星。',
    developHint: '点击相纸，看看刚刚拍到的寿星',
    dressPrompt: '打扮一下我们的小寿星吧',
    cutPrompt: '拖着小剪刀，沿虚线剪一圈',
    teaseNeedBoth: '帽子和墨镜都要各挑一件戴整齐哦~',
    stickers: [
      { id: 'crown_gold', kind: 'hat' as const, label: '公主皇冠', src: 'assets/art/crown_gold.webp' },
      { id: 'hat_pink_dots', kind: 'hat' as const, label: '粉色波点帽', src: 'assets/art/hat_pink_dots.webp' },
      { id: 'bow_red', kind: 'hat' as const, label: '红丝带蝴蝶结', src: '' },
      { id: 'flower_wreath', kind: 'hat' as const, label: '春日花环', src: '' },
      { id: 'glasses_heart', kind: 'glasses' as const, label: '爱心墨镜', src: 'assets/art/glasses_heart.webp' },
      { id: 'pixel_sunglasses', kind: 'glasses' as const, label: '像素墨镜', src: '' },
      { id: 'glasses_round', kind: 'glasses' as const, label: '复古圆框镜', src: '' },
      { id: 'blush_stars', kind: 'glasses' as const, label: '星光腮红', src: '' },
    ],
  },

  scene4: {
    placePrompt: '拖着寿星，插到蛋糕顶上',
    lightOffPrompt: '点一下，关灯',
    cheersPrompt: '干杯！',
    toastHeadline: 'Cheers！',
    toastSub: '干杯！',
    nextLabel: '拉开我们的胶卷 →',
  },

  scene5: {
    title: '这一卷，是我们的日常。',
    pullHint: '按住黑色胶片头往右拉出底片',
    focusHint: '用手指擦拭底片（或滑动调焦滑块）显影',
    frames: [
      {
        id: 1,
        title: '第一次牵手手',
        caption: '每次见你都是在下雨天，第一次和万小雨牵手手',
        src: 'assets/photos/daily_1.webp',
        blurSrc: 'assets/photos/daily_1_blur.webp',
      },
      {
        id: 2,
        title: '表白送花',
        caption: '2025.06.27，正式的恋爱就要从一朵花和一段告白开始。',
        src: 'assets/photos/daily_2.webp',
        blurSrc: 'assets/photos/daily_2_blur.webp',
      },
      {
        id: 3,
        title: '第一次一起拍拍立得 · 9.27',
        caption: '嘿嘿，你好帅呀。',
        src: 'assets/photos/daily_3.webp',
        blurSrc: 'assets/photos/daily_3_blur.webp',
      },
      {
        id: 4,
        title: '第一次一起跨年',
        caption: '还记得我们第一次一起跨年吗，今年跨年我们也要在一起哦。',
        src: 'assets/photos/daily_4.webp',
        blurSrc: 'assets/photos/daily_4_blur.webp',
      },
      {
        id: 5,
        title: '我们的搞怪日常',
        caption: '不用端着偶像包袱，在你面前可以做最幼稚的小朋友。',
        src: 'assets/photos/daily_5.webp',
        blurSrc: 'assets/photos/daily_5_blur.webp',
      },
      {
        id: 6,
        title: '第一次正式约会 · 海洋馆',
        caption: '蓝色的水波落在你的侧脸上，比整片海底世界都要好看。',
        src: 'assets/photos/daily_6.webp',
        blurSrc: 'assets/photos/daily_6_blur.webp',
      },
      {
        id: 7,
        title: '随手合照',
        caption: '不需要挑什么好日子，普通的一天和你在一起就是好日子',
        src: 'assets/photos/daily_7.webp',
        blurSrc: 'assets/photos/daily_7_blur.webp',
      },
      {
        id: 8,
        title: '周年纪念',
        caption: '一周年快乐，谢谢你从去年夏天一直陪我走到现在。',
        src: 'assets/photos/daily_8.webp',
        blurSrc: 'assets/photos/daily_8_blur.webp',
      },
    ] as DailyFrameConfig[],
    blankFrame: {
      title: '明天 · ？',
      caption: '这一格还空着，等我们一起去拍。',
    },
    nextLabel: '再去看看，我送你的那些花 →',
  },

  scene6: {
    stage1Title: '我送你的花，每一束都有心事',
    stage2Title: '全部 11 束花图鉴 · 点开看看我的悄悄话',
    flowers: [
      {
        id: 1,
        title: '第一束 · 表白',
        remark: '故事开始的那一天，藏在背后的第一束粉玫瑰。',
        src: 'assets/flowers/flower_01.webp',
        puzzleType: 'heartbeat',
      },
      {
        id: 2,
        title: '第二束 · “对不齐鸭”',
        remark: '惹guaiguai 生气了，对不齐鸭~',
        src: 'assets/flowers/flower_02.webp',
        puzzleType: 'smooth',
      },
      {
        id: 3,
        title: '第三束 · 陪你过的生日',
        remark: '那时候就在想，以后的每一年生日都要有花和你。',
        src: 'assets/flowers/flower_03.webp',
      },
      {
        id: 4,
        title: '第四束 · 跨年烟花菊',
        remark: '把不会熄灭的跨年烟花包进花里送给你。',
        src: 'assets/flowers/flower_04.webp',
        puzzleType: 'fireworks',
      },
      {
        id: 5,
        title: '第五束 · 结束漫长寒假的红玫瑰',
        remark: '熬过漫长的寒假，终于又能第一时间抱到你。',
        src: 'assets/flowers/flower_05.webp',
        puzzleType: 'distance',
      },
      {
        id: 6,
        title: '第六束 · 周年纪念日',
        remark: '我们的一周年，爱意比第一天还要多得多。',
        src: 'assets/flowers/flower_06.webp',
        puzzleType: 'card',
      },
      {
        id: 7,
        title: '第七束 · 白雪公主',
        remark: '漫长的假期好难熬，买一束白雪公主，送给全世界最可爱的小公主',
        src: 'assets/flowers/flower_07.webp',
      },
      {
        id: 8,
        title: '第八束 · 结束漫长暑假',
        remark: '每一次分开后的重逢，都要用鲜花来迎接你。',
        src: 'assets/flowers/flower_08.webp',
      },
      {
        id: 9,
        title: '第九束 ·我们不要分开',
        remark: '不要分开好不好',
        src: 'assets/flowers/flower_09.webp',
      },
      {
        id: 10,
        title: '第十束 · 只想让你开心',
        remark: '开心一点嘛',
        src: 'assets/flowers/flower_10.webp',
      },
      {
        id: 11,
        title: '第十一束 · 祝你比赛顺利',
        remark: '站在赛场上闪闪发光，你永远是我的第一名！',
        src: 'assets/flowers/flower_11.webp',
      },
    ] as FlowerConfig[],
    nextLabel: '带着花，去看看我们走过的地方 →',
  },

  scene7: {
    origin: { name: '武汉', x: 428, y: 457 },
    cities: [
      {
        id: 'hongcun',
        name: '宏村',
        x: 679,
        y: 503,
        labelOffset: [16, 18],
        clue: '我们第一次旅行',
        date: '2025.10',
        note: '那时候我们两个都懵懵懂懂的',
        photos: travelManifest['宏村'] ?? [],
      },
      {
        id: 'lushan',
        name: '庐山',
        x: 542,
        y: 538,
        labelOffset: [-64, -14],
        clue: '还记得zyn被我们逼着上山了',
        date: '2025.10',
        note: '虽然很难，但是我们坚持下来了不是吗',
        photos: travelManifest['庐山'] ?? [],
      },
      {
        id: 'nanchang',
        name: '南昌',
        x: 534,
        y: 606,
        labelOffset: [-64, 22],
        clue: '再也不会去第二次了',
        date: '2026.03',
        note: '可是只要是和你一起去，去哪里都很开心',
        photos: travelManifest['南昌'] ?? [],
      },
      {
        id: 'kaifeng',
        name: '开封',
        x: 429,
        y: 117,
        labelOffset: [16, -6],
        clue: '谁妆造做美了我不说',
        date: '2026.04',
        note: '谁妆造做美了我不说，反正我看呆了',
        photos: travelManifest['开封'] ?? [],
      },
      {
        id: 'hangzhou',
        name: '杭州',
        x: 826,
        y: 482,
        labelOffset: [16, 14],
        clue: '好想再来一次',
        date: '2026.08',
        note: '欲把西湖比西子，淡妆浓抹总相宜',
        photos: travelManifest['杭州'] ?? [],
      },
      {
        id: 'suzhou',
        name: '苏州',
        x: 857,
        y: 401,
        labelOffset: [16, -12],
        clue: '旗袍，评弹，江南烟雨',
        date: '2026.08',
        note: '烟雨入江南~',
        photos: travelManifest['苏州'] ?? [],
      },
    ] as CityStopConfig[],
    boardingPass: {
      passenger: 'choice & 佳奇guaiguai',
      from: '今天',
      to: '我们的以后',
      flight: 'LOVE 520',
      seat: '12A · 12B',
      tearHint: '按住票根，往下撕',
    },
    heartCaption: '下一站：我们的以后',
    nextLabel: '开个刮刮乐叭，我们第一次买就中奖了欸 →',
  },

  scene8: {
    title: 'intangible lottery ticket!',
    subtitle: '23 岁好运刮刮乐 · 刮开三格看看',
    cards: [
      { label: '第一张好运', result: '一战成硕 · 考研成功上岸！' },
      { label: '第二张好运', result: '健身成果显著 · 好身材吃不胖！' },
      { label: '第三张好运', result: '小金库暴富 · 有钱有闲越来越美！' },
    ],
    stampText: '全部中奖！这一年，你刮开的都是好运',
    nextLabel: '再领几张寿星专属券 →',
  },

  scene9: {
    title: '寿星专属券，拉一下就有。',
    leverHint: '按住红色拉杆往下拉',
    coupons: [
      {
        id: 1,
        theme: 'pink' as const,
        title: '专业按摩券',
        desc: '专属肩颈放松按摩 30 分钟（备考久坐必备）',
        meta: '随叫随到 · 绝不敷衍',
      },
      {
        id: 2,
        theme: 'pink' as const,
        title: '免吵架哄好券',
        desc: '不开心或吵架时出示，立刻无条件认错哄好',
        meta: '无限期有效 · 特权通道',
      },
      {
        id: 3,
        theme: 'yellow' as const,
        title: '心愿空白万能券',
        desc: '想要什么礼物 / 大餐 / 奶茶，自己写上立刻兑现',
        meta: '最终解释权归寿星所有',
      },
    ],
    stampText: '已到账 · choice 签发',
    nextLabel: '看看小时候的你叭 →',
  },

  scene10: {
    titleBefore: '错过的那些生日，那时候我们还不认识',
    titleAfter: '错过的那些生日，以后一起补上',
    leftLabel: '2006 · 小时候的 choice',
    rightLabel: '2003 · 小时候的佳奇',
    savedToast: '✅ 已存储到相册',
    wechatSaveTip: '长按图片保存到手机相册 ~',
    notification: {
      sender: 'choice',
      time: '现在',
      body: '23岁生日快乐！以后的每一个生日，都想陪你过。',
    },
    nextLabel: '一起拼个蛋糕叭 →',
  },

  scene11: {
    slips: [
      {
        layer: 1,
        color: '#9A82C4',
        width: 490,
        rotation: -0.6,
        text: '生日快乐！☀️ 今天不是庆祝你几岁，而是庆祝你存在，愿你在属于你的 23 岁新岁朝日，有着无法丈量的珍贵与美丽！新的一岁，有着万事胜意的运气，如果没有，希望你有化险为夷的能力，昭昭如愿，岁岁安澜。',
      },
      {
        layer: 2,
        color: '#E04860',
        width: 410,
        rotation: 0.7,
        text: '祝你白天有说有笑，晚上睡个好觉，祝你拥有很多小快乐、小惊喜、小浪漫、小当下、小乐趣',
        doodle: 'gift-cat',
      },
      {
        layer: 3,
        color: '#F8E889',
        width: 245,
        rotation: -2.2,
        text: 'HAPPY BIRTHDAY 希望所有祝福语都在你身上灵验！今年努力的每一页书都算数，考研一战成硕！',
        doodle: 'smile-cat',
      },
      {
        layer: 3,
        color: '#F5B8C4',
        width: 225,
        rotation: 2.0,
        text: '人类比星星的数量更稀少，从宇宙的角度来说，你比星星更珍贵！',
      },
      {
        layer: 4,
        color: '#A8C97F',
        width: 270,
        rotation: -0.5,
        text: '祝你轻盈如蝶，在此起彼伏的山野中寻见永不消逝的春天～',
      },
      {
        layer: 5,
        color: '#F7C6CE',
        width: 210,
        rotation: 0.8,
        text: '23 岁生日快乐 永远开心～',
      },
    ] as PaperSlipConfig[],
    wrongOrderBubble: '这张纸条太短啦，要先拿更宽的纸条当下面一层哦~',
    matchStrikeHint: '按住火柴往右划燃，点燃蜡烛叭',
    litTopLeft: '亲爱的你',
    litTopRight: '要天天开心',
    litRightText: '生日快乐。以后的每一个生日，都想陪你过。',
    nextLabel: '叮咚——有人按门铃 →',
  },

  scene12: {
    endingMode: 'love_letter' as EndingMode,
    dingDong: '叮咚——',
    letterTitle: '写给 23 岁的佳奇 guaiguai：',
    letterParagraphs: [
      '生日快乐，我最爱的女孩。',
      '从2025年6月27日，我从背后拿出那朵花的那一刻起，我相信我的人生轨迹就已经改变了。',
      '12月14日，这个原本平平无奇的日子，也从此成了我生命里的一个节日——一个只为庆祝你的存在而创造的节日。（挺有宗教意味的不是吗？就像圣诞节一样。可能爱一人，本身就是一种信仰吧）',
      '不知不觉，我们已经“在一起”536天了，这真的很长、很长。不过今天不是用来怀念的，今天只用来庆祝！',
      '祝你每天都能睡个好觉，吃到所有自己想吃的，去所有想去的地方，像一只自由的鸟儿一样，不必在意任何世俗的压力，认认真真的享受生活。\n当然还有，学业进步，越来越酷！\n新的一岁，希望你永远自由、明朗，不用去迎合任何人的期待，只管按自己喜欢的方式去生活。',
      'happy birthday！',
      'ps：我不知道生日那天，我会以怎样的身份陪在你身边。但没关系，只要能在你身边，就已经很快乐了。',
    ],
    letterSign: '永远偏爱你的 choice · 2026.12.14',
    physicalClueText: '礼物就藏在你身边，抬头看看我的眼睛（或者去床头柜第二格看看）~',
  },
} as const
