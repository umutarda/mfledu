export type Grade = "9" | "10" | "11" | "12"

export type Subject = {
  id: string
  name: string
  icon: string
}

export const subjects: Subject[] = [
  { id: "matematik", name: "Matematik", icon: "calculator" },
  { id: "fizik", name: "Fizik", icon: "atom" },
  { id: "kimya", name: "Kimya", icon: "flask-conical" },
  { id: "biyoloji", name: "Biyoloji", icon: "dna" },
  { id: "turkce", name: "Turkce", icon: "book-open" },
  { id: "tarih", name: "Tarih", icon: "landmark" },
  { id: "cografya", name: "Cografya", icon: "globe" },
  { id: "ingilizce", name: "Ingilizce", icon: "languages" },
]

// Units per grade-subject pair (dummy data for filtering)
export const unitsByGradeSubject: Record<string, string[]> = {
  "9-matematik": ["Temel Kavramlar", "Sayılar", "Üslü Sayılar", "Kareköklü Sayılar", "Oran-Orantı", "Bağıntı-Fonksiyon", "Denklemler", "Üçgenler"],
  "10-matematik": ["Polinomlar", "İkinci Dereceden Denklemler", "Trigonometrik Fonksiyonlar", "Logaritma", "Permütasyon-Kombinasyon", "Olasılık", "İstatistik"],
  "11-matematik": ["Dizi ve Seriler", "Limit ve Süreklilik", "Türev", "Uygulamalı Türev", "İntegral", "Karmaşık Sayılar"],
  "12-matematik": ["Türev Uygulamaları", "İntegral Uygulamaları", "Analitik Geometri", "Vektörler", "Uzay Geometrisi", "TYT-AYT Soru Tipleri"],

  "9-fizik": ["Ölçme-Birim", "Madde-Özellikler", "Hareket", "Kuvvet-Denge", "Basınç-Kaldırma Kuvveti", "Enerji-Güç-Is"],
  "10-fizik": ["Newton Yasaları", "Atışlar", "Dairesel Hareket", "İş-Güç-Enerji", "Isı-Sıcaklık", "Elektrik"],
  "11-fizik": ["Elektrik Alanı", "Manyetizma", "Dalgalar", "Optik", "Çağdaş Fizik"],
  "12-fizik": ["Çemberin Analitik İncelenmesi", "Alternatif Akım", "Basit Harmonik Hareket", "Atom Modelleri"],

  "9-kimya": ["Kimyaya Giriş", "Atom", "Periyodik Sistem", "Kimyasal Bağlar", "Maddenin Halleri"],
  "10-kimya": ["Kimyasal Tepkimeler", "Mol Kavramı", "Kimyasal Hesaplamalar", "Çözeltiler", "Asit-Baz"],
  "11-kimya": ["Organik Kimya", "Fonksiyonel Gruplar", "Karbonhidratlar", "Yağlar", "Proteinler"],
  "12-kimya": ["Kimyasal Denge", "Elektrokimya", "Nükleer Kimya", "Polimer"],

  "9-biyoloji": ["Hücre", "Canlıların Sınıflandırılması", "Fotosentez", "Solunum", "Ekosistem"],
  "10-biyoloji": ["Mitoz-Mayoz", "Kalıtım", "Biyoteknoloji", "Bitki Biyolojisi", "Sinir Sistemi"],
  "11-biyoloji": ["Endokrin Sistem", "Üreme", "Ekoloji", "Evrim", "Davranış"],
  "12-biyoloji": ["DNA-Sentezi", "Gen Ekspresyonu", "Biyoteknoloji Uygulamaları", "Ekosistem Ekolojisi"],

  "9-turkce": ["Sözcükte Anlam", "Cümlede Anlam", "Dil Bilgisi", "Fiil Çekimi", "Paragraf"],
  "10-turkce": ["Anlatım Biçimleri", "Metin Türleri", "Yazım Kuralları", "Söylem-Argüman"],
  "11-turkce": ["Dönem-Akım", "Şiir Analizi", "Roman-Hikâye", "Dil Bilgisi"],
  "12-turkce": ["Metin Analizi", "Edebiyat Türleri", "Özet-Paragraf", "TYT/AYT Soru Tipleri"],

  "9-tarih": ["Tarih Metodolojisi", "Türklerin İslamiyet'i Kabulü", "Orta Çağ Türk Devletleri"],
  "10-tarih": ["Osmanlı Kuruluş", "Osmanlı Yükselme", "Osmanlı Duraklama", "Avrupa'da Reform"],
  "11-tarih": ["Osmanlı Gerileme", "Birinci Dünya Savaşı", "Kurtuluş Savaşı"],
  "12-tarih": ["İnkılaplar", "İkinci Dünya Savaşı", "Soğuk Savaş", "Çağdaş Türkiye"],

  "9-cografya": ["Harita Bilgisi", "Atmosfer", "İklim", "Türkiye Yeryüzü Şekilleri"],
  "10-cografya": ["Nüfus-Yerleşim", "Ekonomik Coğrafya", "Tarım", "Endüstri"],
  "11-cografya": ["Küresel Ortam", "Beşeri Coğrafya", "Bölgesel Coğrafya"],
  "12-cografya": ["Ülkeler Coğrafyası", "Türkiye'nin Coğrafi Bölgeleri", "Çevre Sorunları"],

  "9-ingilizce": ["Present Tenses", "Past Tenses", "Modals", "Vocabulary: Daily Life"],
  "10-ingilizce": ["Future Tenses", "Passive Voice", "Relative Clauses", "Vocabulary: Science"],
  "11-ingilizce": ["Conditionals", "Reported Speech", "Phrasal Verbs", "Reading Strategies"],
  "12-ingilizce": ["Advanced Grammar", "Essay Writing", "Speaking Skills", "YKS Exam Prep"],
}

export type NoteCard = {
  id: string
  title: string
  author: string
  authorAvatar: string
  subject: string
  grade: Grade
  upvotes: number
  downloads: number
  createdAt: string
  preview: string
}

export const featuredNotes: NoteCard[] = [
  {
    id: "1",
    title: "Turev ve Integral Konu Ozeti",
    author: "Elif Yilmaz",
    authorAvatar: "EY",
    subject: "Matematik",
    grade: "12",
    upvotes: 234,
    downloads: 189,
    createdAt: "2 saat once",
    preview:
      "Turev tanimindan uygulamali integral sorularina kadar tum konularin ozeti...",
  },
  {
    id: "2",
    title: "Newton Hareket Yasalari",
    author: "Ahmet Kaya",
    authorAvatar: "AK",
    subject: "Fizik",
    grade: "10",
    upvotes: 187,
    downloads: 145,
    createdAt: "5 saat once",
    preview:
      "Newton'un uc hareket yasasi, ornekler ve cozumlu sorular ile birlikte...",
  },
  {
    id: "3",
    title: "Organik Kimya Temelleri",
    author: "Zeynep Demir",
    authorAvatar: "ZD",
    subject: "Kimya",
    grade: "11",
    upvotes: 156,
    downloads: 120,
    createdAt: "1 gun once",
    preview:
      "Karbon bilesikleri, fonksiyonel gruplar ve adlandirma kurallari...",
  },
  {
    id: "4",
    title: "Osmanlı Kuruluş Donemi",
    author: "Can Ozturk",
    authorAvatar: "CO",
    subject: "Tarih",
    grade: "10",
    upvotes: 143,
    downloads: 98,
    createdAt: "1 gun once",
    preview:
      "Osmanlı'nin kurulusundan Fatih'e kadar onemli olaylar ve kronoloji...",
  },
  {
    id: "5",
    title: "Hucre Biyolojisi Notlari",
    author: "Selin Arslan",
    authorAvatar: "SA",
    subject: "Biyoloji",
    grade: "9",
    upvotes: 198,
    downloads: 167,
    createdAt: "3 saat once",
    preview:
      "Hucre yapisi, organeller ve hucre bolunmesi konularinin detayli anlatimi...",
  },
  {
    id: "6",
    title: "Trigonometri Formulleri",
    author: "Mert Sahin",
    authorAvatar: "MS",
    subject: "Matematik",
    grade: "11",
    upvotes: 211,
    downloads: 178,
    createdAt: "6 saat once",
    preview:
      "Tum trigonometri formulleri, ozel acilarin degerleri ve cozumlu ornekler...",
  },
]

export type Contributor = {
  id: string
  name: string
  avatar: string
  points: number
  notesShared: number
  rank: number
}

export const topContributors: Contributor[] = [
  {
    id: "1",
    name: "Elif Yilmaz",
    avatar: "EY",
    points: 2450,
    notesShared: 34,
    rank: 1,
  },
  {
    id: "2",
    name: "Ahmet Kaya",
    avatar: "AK",
    points: 2120,
    notesShared: 28,
    rank: 2,
  },
  {
    id: "3",
    name: "Selin Arslan",
    avatar: "SA",
    points: 1890,
    notesShared: 25,
    rank: 3,
  },
  {
    id: "4",
    name: "Mert Sahin",
    avatar: "MS",
    points: 1650,
    notesShared: 21,
    rank: 4,
  },
  {
    id: "5",
    name: "Zeynep Demir",
    avatar: "ZD",
    points: 1430,
    notesShared: 18,
    rank: 5,
  },
]

export type Announcement = {
  id: string
  title: string
  description: string
  date: string
  type: "info" | "event" | "update"
}

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "YKS Deneme Sinavi",
    description: "Bu hafta sonu canli deneme sinavi yapilacaktir.",
    date: "24 Subat",
    type: "event",
  },
  {
    id: "2",
    title: "Yeni Ozellik: Video Ders",
    description: "Artik video ders yukleyebilirsiniz!",
    date: "22 Subat",
    type: "update",
  },
  {
    id: "3",
    title: "Mentor Basvurulari Acik",
    description: "Akran mentor olmak icin basvurabilirsiniz.",
    date: "20 Subat",
    type: "info",
  },
]

export type CourseVideo = {
  id: string
  title: string
  videoUrl: string
  description: string
  author: string
  authorAvatar: string
  subject: string
  grade: Grade
  duration: string
  views: number
  likes: number
  resources: { name: string; type: string }[]
}

export const sampleCourse: CourseVideo = {
  id: "course-1",
  title: "Turev - Limit ve Sureklilik",
  videoUrl: "https://www.youtube.com/embed/WUvTyaaNkzM",
  description:
    "Bu derste turev kavrami, limit ve sureklilik arasindaki iliski, turev alma kurallari ve uygulamali orneklerle konuyu pekistirme yapiyoruz.",
  author: "Elif Yilmaz",
  authorAvatar: "EY",
  subject: "Matematik",
  grade: "12",
  duration: "45 dk",
  views: 1234,
  likes: 89,
  resources: [
    { name: "Ders Notu (PDF)", type: "pdf" },
    { name: "Cozumlu Sorular", type: "pdf" },
    { name: "Formul Tablosu", type: "pdf" },
  ],
}

export type Comment = {
  id: string
  author: string
  authorAvatar: string
  content: string
  likes: number
  createdAt: string
}

export const sampleComments: Comment[] = [
  {
    id: "1",
    author: "Ahmet Kaya",
    authorAvatar: "AK",
    content:
      "Cok guzel anlatmissiniz, turev tanimini sonunda anladim. Tesekkurler!",
    likes: 12,
    createdAt: "2 saat once",
  },
  {
    id: "2",
    author: "Zeynep Demir",
    authorAvatar: "ZD",
    content:
      "14:30'daki ornekte neden L'Hopital kullanildi? Direkt yerine koyarak cozemez miydik?",
    likes: 8,
    createdAt: "4 saat once",
  },
  {
    id: "3",
    author: "Mert Sahin",
    authorAvatar: "MS",
    content:
      "Formul tablosunu indirdim, cok isime yaradi. Baska konularda da yapabilir misiniz?",
    likes: 5,
    createdAt: "1 gun once",
  },
]

// ─── Q&A Question Types ──────────────────────────────
export type Question = {
  id: string
  title: string
  body: string
  author: string
  authorAvatar: string
  authorBadge?: string
  subject: string
  grade: Grade
  tags: string[]
  upvotes: number
  downvotes: number
  answerCount: number
  createdAt: string
  hasImage?: boolean
  imagePreview?: string
  youtubeUrl?: string
  pdfUrl?: string
}

export type Answer = {
  id: string
  questionId: string
  author: string
  authorAvatar: string
  authorBadge?: string
  content: string
  likes: number
  createdAt: string
  isAccepted: boolean
  replies: AnswerReply[]
}

export type AnswerReply = {
  id: string
  author: string
  authorAvatar: string
  content: string
  createdAt: string
  likes: number
}

export const communityQuestions: Question[] = [
  {
    id: "q1",
    title: "Turevde zincirleme kurali ne zaman uygulanir?",
    body: "Bileske fonksiyonlarda turev alirken zincirleme kuralini ne zaman kullanmam gerektigini anlamakta zorluk cekiyorum. Ornek uzerinden anlatan var mi?",
    author: "Selin Arslan",
    authorAvatar: "SA",
    authorBadge: "Yardımsever",
    subject: "Matematik",
    grade: "12",
    tags: ["Turev", "12. Sinif", "Matematik"],
    upvotes: 24,
    downvotes: 1,
    answerCount: 5,
    createdAt: "30 dk once",
    youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
  },
  {
    id: "q2",
    title: "Newton'un 3. yasasinda reaksiyon kuvveti neden zit yonde?",
    body: "Etki-tepki kuvvetleri hep esit ve zit yonde deniyor ama fiziksel olarak neden boyle? Bir cisim kuvvet uyguladiginda diger cisim neden ayni buyuklukte geri kuvvet uyguluyor?",
    author: "Ahmet Kaya",
    authorAvatar: "AK",
    subject: "Fizik",
    grade: "10",
    tags: ["Newton Yasalari", "10. Sinif", "Fizik"],
    upvotes: 18,
    downvotes: 0,
    answerCount: 3,
    createdAt: "1 saat once",
    pdfUrl: "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf",
  },
  {
    id: "q3",
    title: "Organik kimyada fonksiyonel gruplari nasil ezberleyebilirim?",
    body: "Alkol, eter, aldehit, keton... Hepsi birbirine karisiyor. Pratik bir ezberleme yontemi bilen var mi?",
    author: "Can Ozturk",
    authorAvatar: "CO",
    subject: "Kimya",
    grade: "11",
    tags: ["Organik Kimya", "11. Sinif", "Kimya"],
    upvotes: 31,
    downvotes: 2,
    answerCount: 8,
    createdAt: "2 saat once",
    hasImage: true,
  },
  {
    id: "q4",
    title: "Osmanlida Duraklama Donemi sebepleri nelerdir?",
    body: "Duraklama doneminin ic ve dis sebeplerini karistiriyorum. Ozellikle Celali isyanlari ve Kapikulu Ocagi'nin bozulmasi arasindaki farki aciklayabilir misiniz?",
    author: "Elif Yilmaz",
    authorAvatar: "EY",
    authorBadge: "Mentor",
    subject: "Tarih",
    grade: "10",
    tags: ["Osmanli", "10. Sinif", "Tarih"],
    upvotes: 12,
    downvotes: 0,
    answerCount: 4,
    createdAt: "3 saat once",
  },
  {
    id: "q5",
    title: "DNA replikasyonunda onden ve geri iplik farki nedir?",
    body: "Onden iplik (leading strand) ve geri iplik (lagging strand) kavramlarini karistiriyorum. Okazaki parcalari ne ise yarar?",
    author: "Zeynep Demir",
    authorAvatar: "ZD",
    subject: "Biyoloji",
    grade: "12",
    tags: ["DNA", "12. Sinif", "Biyoloji"],
    upvotes: 15,
    downvotes: 1,
    answerCount: 2,
    createdAt: "5 saat once",
  },
  {
    id: "q6",
    title: "Trigonometrik ozdeslikler neden onemli?",
    body: "sin²x + cos²x = 1 gibi ozdeslikler var ama bunlari soru cozumunde ne zaman kullanacagimi bilemiyorum. Pratik ipuclari olan var mi?",
    author: "Mert Sahin",
    authorAvatar: "MS",
    authorBadge: "Yardımsever",
    subject: "Matematik",
    grade: "11",
    tags: ["Trigonometri", "11. Sinif", "Matematik"],
    upvotes: 22,
    downvotes: 0,
    answerCount: 6,
    createdAt: "6 saat once",
  },
]

export const questionAnswers: Record<string, Answer[]> = {
  q1: [
    {
      id: "a1",
      questionId: "q1",
      author: "Elif Yilmaz",
      authorAvatar: "EY",
      authorBadge: "Mentor",
      content:
        "Zincirleme kurali, ic ice fonksiyonlar oldugunda kullanilir. Ornegin f(x) = sin(x²) gibi bir fonksiyonda dis fonksiyon sin, ic fonksiyon x²'dir. Turev alirken once disin turevini alip icini oldugu gibi birakir, sonra icin turevini carparsın. Yani f'(x) = cos(x²) · 2x olur.",
      likes: 18,
      createdAt: "25 dk once",
      isAccepted: true,
      replies: [
        {
          id: "r1",
          author: "Selin Arslan",
          authorAvatar: "SA",
          content: "Tesekkurler! Simdi cok daha net oldu.",
          createdAt: "20 dk once",
          likes: 3,
        },
        {
          id: "r2",
          author: "Mert Sahin",
          authorAvatar: "MS",
          content: "Ben de ayni sorunu yasiyordum, guzel aciklama.",
          createdAt: "15 dk once",
          likes: 2,
        },
      ],
    },
    {
      id: "a2",
      questionId: "q1",
      author: "Ahmet Kaya",
      authorAvatar: "AK",
      content:
        "Bir de su kural ise yarar: Eger fonksiyonu tek bir islemle yazamiyorsan (yani parantez icinde baska bir fonksiyon varsa), zincirleme gerekir. f(g(x)) gordugun an zincirleme dusun.",
      likes: 7,
      createdAt: "20 dk once",
      isAccepted: false,
      replies: [],
    },
    {
      id: "a3",
      questionId: "q1",
      author: "Zeynep Demir",
      authorAvatar: "ZD",
      content:
        "Ek olarak, e^(3x+1) gibi ustel fonksiyonlarda da zincirleme gerekir. Us kismi sabit degilse mutlaka icin turevini carpmayi unutma.",
      likes: 5,
      createdAt: "10 dk once",
      isAccepted: false,
      replies: [
        {
          id: "r3",
          author: "Can Ozturk",
          authorAvatar: "CO",
          content: "Bunu hic dusunmemistim, sagol!",
          createdAt: "5 dk once",
          likes: 1,
        },
      ],
    },
  ],
}

// ─── Notifications ──────────────────────────────
export type Notification = {
  id: string
  type: "answer" | "upvote" | "mention" | "badge"
  message: string
  createdAt: string
  read: boolean
  link: string
}

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "answer",
    message: "Elif Yilmaz sorunuza cevap verdi: 'Turevde zincirleme kurali...'",
    createdAt: "5 dk once",
    read: false,
    link: "/questions/q1",
  },
  {
    id: "n2",
    type: "upvote",
    message: "Notunuz 50 begeni aldi: 'Trigonometri Formulleri'",
    createdAt: "1 saat once",
    read: false,
    link: "/course",
  },
  {
    id: "n3",
    type: "badge",
    message: "Yeni rozet kazandiniz: Yardımsever!",
    createdAt: "3 saat once",
    read: true,
    link: "/leaderboard",
  },
]

// ─── Full Leaderboard ──────────────────────────────
export const fullLeaderboard: Contributor[] = [
  ...topContributors,
  {
    id: "6",
    name: "Can Ozturk",
    avatar: "CO",
    points: 1280,
    notesShared: 16,
    rank: 6,
  },
  {
    id: "7",
    name: "Deniz Yildiz",
    avatar: "DY",
    points: 1150,
    notesShared: 14,
    rank: 7,
  },
  {
    id: "8",
    name: "Baran Celik",
    avatar: "BC",
    points: 980,
    notesShared: 12,
    rank: 8,
  },
  {
    id: "9",
    name: "Ayse Kara",
    avatar: "AK2",
    points: 870,
    notesShared: 11,
    rank: 9,
  },
  {
    id: "10",
    name: "Emre Tas",
    avatar: "ET",
    points: 750,
    notesShared: 9,
    rank: 10,
  },
]
