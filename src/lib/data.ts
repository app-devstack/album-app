// ============================================================
// 思い出帳 — データ型とモックデータ
// ============================================================

export type AccentColor = "blue" | "emerald" | "rose" | "amber" | "violet" | "slate";

export interface AccentColorConfig {
  id: AccentColor;
  label: string;
  bg: string;
  bgHover: string;
  bgLight: string;
  text: string;
  textHover: string;
  border: string;
  ring: string;
  dot: string;
}

export const ACCENT_COLORS: AccentColorConfig[] = [
  {
    id: "blue",
    label: "青",
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    bgLight: "bg-blue-50",
    text: "text-blue-600",
    textHover: "hover:text-blue-700",
    border: "border-blue-600",
    ring: "ring-blue-600",
    dot: "bg-blue-600",
  },
  {
    id: "emerald",
    label: "緑",
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-700",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    textHover: "hover:text-emerald-700",
    border: "border-emerald-600",
    ring: "ring-emerald-600",
    dot: "bg-emerald-600",
  },
  {
    id: "rose",
    label: "桜",
    bg: "bg-rose-500",
    bgHover: "hover:bg-rose-600",
    bgLight: "bg-rose-50",
    text: "text-rose-500",
    textHover: "hover:text-rose-600",
    border: "border-rose-500",
    ring: "ring-rose-500",
    dot: "bg-rose-500",
  },
  {
    id: "amber",
    label: "琥珀",
    bg: "bg-amber-500",
    bgHover: "hover:bg-amber-600",
    bgLight: "bg-amber-50",
    text: "text-amber-500",
    textHover: "hover:text-amber-600",
    border: "border-amber-500",
    ring: "ring-amber-500",
    dot: "bg-amber-500",
  },
  {
    id: "violet",
    label: "藤",
    bg: "bg-violet-600",
    bgHover: "hover:bg-violet-700",
    bgLight: "bg-violet-50",
    text: "text-violet-600",
    textHover: "hover:text-violet-700",
    border: "border-violet-600",
    ring: "ring-violet-600",
    dot: "bg-violet-600",
  },
  {
    id: "slate",
    label: "鈍",
    bg: "bg-slate-700",
    bgHover: "hover:bg-slate-800",
    bgLight: "bg-slate-100",
    text: "text-slate-700",
    textHover: "hover:text-slate-800",
    border: "border-slate-700",
    ring: "ring-slate-700",
    dot: "bg-slate-700",
  },
];

export interface Photo {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  addedAt: string;
  /** "image"（デフォルト）または "video" */
  mediaType?: "image" | "video";
  /** 動画のサムネイル画像URL（未指定の場合はグリッドでアイコン表示） */
  thumbnailUrl?: string;
  /** 動画の長さ（秒）。表示用 */
  duration?: number;
}

export interface Memo {
  id: string;
  body: string;
  /** ムードタグ — 旅の感情を一言で */
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  title: string;
  type: "personal" | "family";
  coverUrl: string;
  createdBy: string;
  sharedWith?: string[];
  memberAvatar?: string;
  memberName?: string;
  photoCount: number;
  createdAt: string;
  location?: string;
  photos: Photo[];
  /** アルバムに紐づくメモ一覧 */
  memos?: Memo[];
}

export const MOCK_ALBUMS: Album[] = [
  {
    id: "1",
    title: "京都の春",
    type: "personal",
    coverUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    createdBy: "自分",
    photoCount: 6,
    createdAt: "2024-04-12",
    location: "京都府",
    memos: [
      {
        id: "m1",
        body: "清水寺の舞台に立ったとき、眼下に広がる桜の海に言葉を失った。音も、時間も、全部止まったみたいで。",
        mood: "感動",
        createdAt: "2024-04-12",
        updatedAt: "2024-04-12",
      },
      {
        id: "m2",
        body: "嵐山の竹林は、想像よりずっと静かだった。風が通るたびに竹がこすれる音が響いて、まるで別の世界にいるようだった。また来たい。",
        mood: "静寂",
        createdAt: "2024-04-14",
        updatedAt: "2024-04-14",
      },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", alt: "京都の寺院", caption: "清水寺", addedAt: "2024-04-12" },
      { id: "p2", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", alt: "桜", caption: "円山公園の桜", addedAt: "2024-04-12" },
      { id: "p3", url: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80", alt: "鳥居", caption: "伏見稲荷", addedAt: "2024-04-13" },
      { id: "p4", url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80", alt: "和の街並み", caption: "祇園・石畳", addedAt: "2024-04-13" },
      { id: "p5", url: "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&q=80", alt: "竹林", caption: "嵐山の竹林", addedAt: "2024-04-14" },
      { id: "p6", url: "https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=800&q=80", alt: "金閣寺", caption: "金閣寺・黄金の輝き", addedAt: "2024-04-14" },
      {
        id: "v1",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        alt: "京都の朝の風景",
        caption: "夜明けの鐘の音",
        addedAt: "2024-04-14",
        mediaType: "video",
        thumbnailUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=70",
        duration: 596,
      },
    ],
  },
  {
    id: "2",
    title: "夏の家族旅行",
    type: "family",
    coverUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    createdBy: "田中 花子",
    sharedWith: ["自分", "お父さん", "お母さん"],
    memberAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    memberName: "田中 花子",
    photoCount: 6,
    createdAt: "2024-07-20",
    location: "沖縄県",
    memos: [
      {
        id: "m3",
        body: "夕暮れどきの砂浜。子どもたちが波と追いかけっこをしていた。ずっとこの景色のなかにいたかった。",
        mood: "幸福",
        createdAt: "2024-07-21",
        updatedAt: "2024-07-21",
      },
    ],
    photos: [
      { id: "p7", url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", alt: "家族写真", caption: "みんなで砂浜へ", addedAt: "2024-07-20" },
      { id: "p8", url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80", alt: "夕日", caption: "沖縄の夕暮れ", addedAt: "2024-07-21" },
      { id: "p9", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", alt: "山の景色", caption: "山原の緑", addedAt: "2024-07-22" },
      { id: "p10", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", alt: "森", caption: "やんばるの森", addedAt: "2024-07-22" },
      { id: "p11", url: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80", alt: "砂浜の散歩", caption: "波打ち際", addedAt: "2024-07-23" },
      { id: "p12", url: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&q=80", alt: "バーベキュー", caption: "夜のBBQ", addedAt: "2024-07-23" },
      {
        id: "v2",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        alt: "沖縄の波の動画",
        caption: "砂浜に打ち寄せる波",
        addedAt: "2024-07-23",
        mediaType: "video",
        thumbnailUrl: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=400&q=70",
        duration: 654,
      },
    ],
  },
  {
    id: "3",
    title: "建築スケッチ",
    type: "personal",
    coverUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    createdBy: "自分",
    photoCount: 5,
    createdAt: "2024-02-08",
    location: "東京都",
    photos: [
      { id: "p13", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80", alt: "ガラスのビル", caption: "新宿・ガラス幕", addedAt: "2024-02-08" },
      { id: "p14", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", alt: "コンクリート構造", caption: "荒川区のアーチ", addedAt: "2024-02-09" },
      { id: "p15", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", alt: "橋", caption: "レインボーブリッジ", addedAt: "2024-02-10" },
      { id: "p16", url: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80", alt: "室内", caption: "国立競技場エントランス", addedAt: "2024-02-10" },
      { id: "p17", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", alt: "モダンな家", caption: "港区の邸宅", addedAt: "2024-02-11" },
    ],
  },
  {
    id: "4",
    title: "お正月の集まり",
    type: "family",
    coverUrl: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80",
    createdBy: "父",
    sharedWith: ["自分", "田中 花子", "母"],
    memberAvatar: "",
    memberName: "父",
    photoCount: 4,
    createdAt: "2024-01-01",
    location: "神奈川県",
    photos: [
      { id: "p18", url: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80", alt: "お正月の飾り", caption: "初詣の門松", addedAt: "2024-01-01" },
      { id: "p19", url: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80", alt: "雪景色", caption: "裏庭に積もった雪", addedAt: "2024-01-01" },
      { id: "p20", url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80", alt: "冬の風景", caption: "凛とした冬の朝", addedAt: "2024-01-02" },
      { id: "p21", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80", alt: "お年玉", caption: "子どもたちへお年玉", addedAt: "2024-01-02" },
    ],
  },
  {
    id: "5",
    title: "黄金の夕暮れ",
    type: "personal",
    coverUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    createdBy: "自分",
    photoCount: 4,
    createdAt: "2024-09-01",
    location: "長野県",
    photos: [
      { id: "p22", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", alt: "黄金の野原", caption: "秋の稲穂", addedAt: "2024-09-01" },
      { id: "p23", url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80", alt: "湖に映る夕日", caption: "諏訪湖の反射", addedAt: "2024-09-02" },
      { id: "p24", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", alt: "山の夕暮れ", caption: "アルプスの夕焼け", addedAt: "2024-09-03" },
      { id: "p25", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", alt: "空撮の風景", caption: "雲の上から", addedAt: "2024-09-03" },
    ],
  },
  {
    id: "6",
    title: "母の誕生日旅行",
    type: "family",
    coverUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    createdBy: "母",
    sharedWith: ["自分", "田中 花子", "父"],
    memberAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    memberName: "母",
    photoCount: 6,
    createdAt: "2024-05-15",
    location: "バリ島",
    photos: [
      { id: "p26", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", alt: "バリの寺院", caption: "タナロット寺院", addedAt: "2024-05-15" },
      { id: "p27", url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80", alt: "熱帯の海岸", caption: "ヌサドゥアのビーチ", addedAt: "2024-05-16" },
      { id: "p28", url: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80", alt: "棚田", caption: "テガラランの棚田", addedAt: "2024-05-17" },
      { id: "p29", url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80", alt: "日没の儀式", caption: "ケチャックダンス", addedAt: "2024-05-17" },
      { id: "p30", url: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80", alt: "地元の市場", caption: "ウブドの朝市", addedAt: "2024-05-18" },
      { id: "p31", url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80", alt: "滝", caption: "ギアニャルの滝", addedAt: "2024-05-18" },
    ],
  },
];

export const COVER_OPTIONS = [
  { id: "c1", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80", alt: "自然" },
  { id: "c2", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80", alt: "都市" },
  { id: "c3", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", alt: "人物" },
  { id: "c4", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80", alt: "みんな" },
  { id: "c5", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80", alt: "旅行" },
  { id: "c6", url: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?w=400&q=80", alt: "海" },
];
