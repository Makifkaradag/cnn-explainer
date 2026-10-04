import type { Dictionary } from './en';

export const tr: Dictionary = {
  htmlLang: 'tr',
  langName: 'Türkçe',

  nav: {
    explore: 'Keşfet',
    playground: 'Deneme alanı',
    training: 'Eğitim',
    concepts: 'Matematik',
    menu: 'Menü',
    github: "GitHub'daki kaynak kod",
    toLight: 'Açık temaya geç',
    toDark: 'Koyu temaya geç',
    language: 'Dil',
  },

  footer: {
    tagline: 'CNN Explainer tamamen tarayıcında çalışır.',
    note: 'Konvolüsyon, aktivasyon, havuzlama ve softmax gerçekten hesaplanıyor. Ağın kendisi ise eğitim amaçlı küçük bir model, gerçek bir sınıflandırıcı değil.',
  },

  common: {
    loading: 'Yükleniyor…',
    reset: 'Sıfırla',
    play: 'Oynat',
    pause: 'Durdur',
    examples: 'Örnekler',
    draw: 'Çiz',
    upload: 'Yükle',
    input: 'Girdi',
    kernel: 'Çekirdek',
    kernelSize: 'Çekirdek boyutu',
    stride: 'Adım (stride)',
    padding: 'Dolgu (padding)',
    activation: 'Aktivasyon',
    pooling: 'Havuzlama',
    max: 'Maks',
    avg: 'Ort',
    average: 'Ortalama',
    featureMap: 'Özellik haritası',
    yourDrawing: 'Senin çizimin',
    parameters: (n: string) => `${n} parametre`,
    iteration: 'iterasyon',
  },

  playback: {
    prev: 'Önceki konum',
    next: 'Sonraki konum',
    finish: 'Hepsini hesapla',
    restart: 'Başa dön',
    speed: 'Animasyon hızı',
    speeds: ['Yavaş', 'Normal', 'Hızlı', 'Turbo'],
    step: (i: number, n: number) => `adım ${i} / ${n}`,
  },

  classes: ['Daire', 'Kare', 'Üçgen', 'Artı'],

  examples: {
    circle: 'Daire',
    square: 'Kare',
    triangle: 'Üçgen',
    cross: 'Artı',
    seven: '7 rakamı',
    smiley: 'Gülen yüz',
    stripes: 'Çizgiler',
  },

  kernels: {
    edge: 'Kenar bulma',
    vertical: 'Dikey kenar',
    horizontal: 'Yatay kenar',
    diagonal: 'Çapraz kenar ↘',
    antiDiagonal: 'Çapraz kenar ↗',
    sharpen: 'Keskinleştirme',
    blur: 'Bulanıklaştırma',
    texture: 'Doku (dama)',
    identity: 'Birim (değiştirmez)',
  },
  customKernel: 'Özel (düzenlendi)',

  activationFormulas: {
    relu: 'f(x) = max(0, x)',
    leakyRelu: 'f(x) = x > 0 ise x, değilse 0.1x',
    sigmoid: 'f(x) = 1 / (1 + e⁻ˣ)',
    tanh: 'f(x) = tanh(x)',
  },

  chapters: {
    input: {
      title: 'Girdi görüntüsü',
      short: 'Sayılardan oluşan pikseller',
      lede: 'Bilgisayar için gri tonlamalı bir görüntü sadece bir sayı tablosudur. Bizimki 28×28, yani 784 parlaklık değeri. 0 siyah, 1 beyaz demek.',
    },
    convolution: {
      title: 'Konvolüsyon',
      short: 'Çekirdek görüntünün üzerinde kayar',
      lede: 'Çekirdek dediğimiz küçük bir ağırlık tablosu görüntünün üzerinde gezinir. Her konumda altındaki pikselleri kendi ağırlıklarıyla çarpar ve hepsini toplar. Çıkan tek sayı, çıktının bir pikseli olur.',
    },
    'feature-maps': {
      title: 'Özellik haritaları',
      short: 'Farklı filtre, farklı desen',
      lede: 'Konvolüsyonun çıktısına özellik haritası denir. Çekirdeğin aradığı desen görüntünün neresinde varsa orası parlak çıkar. Bir katman aynı anda birçok çekirdek kullandığı için üst üste dizilmiş bir harita yığını üretir.',
    },
    relu: {
      title: 'ReLU aktivasyonu',
      short: 'Pozitifleri tut',
      lede: 'Konvolüsyondan sonra her değere bir aktivasyon fonksiyonu uygulanır. En yaygını ReLU: negatifler 0 olur, pozitifler olduğu gibi geçer. Katmanların tek bir doğrusal filtreden fazlasını öğrenebilmesini bu doğrusal olmayan adım sağlar.',
    },
    pooling: {
      title: 'Havuzlama',
      short: 'Küçült, en güçlüyü tut',
      lede: 'Havuzlama, küçük pencereleri özetleyerek özellik haritasını küçültür. Max pooling her penceredeki en güçlü tepkiyi tutar. Böylece sonraki katman daha az sayıyla çalışır ve küçük kaymalara daha az duyarlı olur.',
    },
    architecture: {
      title: 'Tam bir CNN',
      short: 'Katman katman, boyut boyut',
      lede: 'Gerçek ağlar bu işlemleri üst üste dizer. Aşağıda bu uygulamada kullanılan küçük CNN var. Bir katmana tıklayınca içine ne girdiğini, orada ne olduğunu ve ne çıktığını görürsün.',
    },
    hierarchy: {
      title: 'Özellik hiyerarşisi',
      short: 'Kenarlardan nesnelere',
      lede: 'Her katman bir öncekinin üzerine kurulur. Derindeki nöronlar görüntünün daha büyük bir kısmını görür ve basit özelliklerin daha karmaşık birleşimlerine tepki verebilir.',
    },
    dense: {
      title: 'Flatten ve Dense',
      short: 'Haritadan vektöre, vektörden skora',
      lede: 'Karar verebilmek için son özellik haritaları uzun tek bir vektöre açılır. Ardından tam bağlı (Dense) katman her sınıfa bir skor verir. Bu skor, bütün özelliklerin ağırlıklı toplamıdır.',
    },
    softmax: {
      title: 'Softmax ile tahmin',
      short: 'Skorlar olasılığa dönüşür',
      lede: 'Sınıf skorları (logit) herhangi bir sayı olabilir. Softmax bunları hepsi pozitif ve toplamı 1 olan olasılıklara çevirir. Kaydırıcıları oynatıp nasıl tepki verdiğine bak.',
    },
    experiments: {
      title: 'Şunu değiştirsem ne olur?',
      short: 'Her şeyi değiştir, anında gör',
      lede: 'Çekirdeği, adımı, dolguyu, aktivasyonu, havuzlamayı ya da filtre sayısını değiştir. Özellik haritaları ve tensör boyutları anında güncellenir.',
    },
  },

  home: {
    eyebrow: 'Bir evrişimli sinir ağının içine bak',
    subtitle:
      'Konvolüsyon, özellik haritaları, havuzlama ve tahmin üzerine etkileşimli, görsel bir gezinti.',
    start: 'Keşfetmeye başla',
    playground: 'Deneme alanı',
    pipelineIntro: 'Bir görüntü, on adım, tek tahmin:',
    tryAnother: 'Başka bir girdi dene →',
    chaptersTitle: 'On etkileşimli bölüm',
    chaptersSub: 'Her biri tek bir fikri kurcalayabileceğin bir şeye dönüştürüyor.',
    readFromStart: 'Baştan oku →',
    pages: [
      {
        to: '/playground',
        title: 'Deneme alanı',
        text: 'Bir görüntü ve çekirdek seç, ağı katman katman çalıştır ya da kendi kendine oynamasını izle.',
      },
      {
        to: '/training',
        title: 'Eğitim',
        text: 'İleri geçiş, kayıp, geri yayılım ve ağırlık güncellemesi ağ öğrenene kadar tekrar eder. Hepsini adım adım izle.',
      },
      {
        to: '/concepts',
        title: 'Matematik',
        text: 'Konvolüsyon, havuzlama ve softmax’in formülleri ve CNN terimleri için görsel bir sözlük.',
      },
    ],
    honestyTitle: 'Ne gerçek, ne basitleştirilmiş?',
    honestyReal:
      'Konvolüsyon, aktivasyonlar, havuzlama, flatten, dense katman ve softmax gerçek kodla, senin görüntün üzerinde canlı hesaplanıyor.',
    honestySim:
      'Ağ çok küçük: ilk katmanın filtrelerini elle seçtim, ikinci katmanınkiler rastgele, dense katman ise tarayıcında yapay şekillerle eğitiliyor. Gerçek CNN’ler bütün filtreleri veriden öğrenir.',
    stages: [
      'Girdi',
      'Conv',
      'ReLU',
      'Pool',
      'Conv',
      'ReLU',
      'Pool',
      'Flatten',
      'Dense',
      'Softmax',
    ],
  },

  explore: {
    eyebrow: 'Keşfet',
    title: 'Bir evrişimli sinir ağının içinde',
    intro:
      'Tek bir görüntüyü küçük bir CNN’in bütün aşamalarından geçir. Aşağıdaki her görsel seçtiğin görüntüden canlı hesaplanıyor. Görüntüyü değiştirirsen hepsi güncellenir.',
    currentInput: 'Şu anki girdi',
    change: 'değiştir',
    chaptersNav: 'Bölümler',
    ctaTitle: 'Hattın tamamını kendin çalıştır',
    ctaText: 'Katmanlar arasında adım adım ilerle ya da ağın öğrenmesini izle.',
    ctaPlayground: 'Deneme alanı',
    ctaTraining: 'Eğitim',
  },

  input: {
    chooseTitle: 'Bir girdi seç',
    sourceLabel: 'Girdi kaynağı',
    seesTitle: 'Ağın gördüğü',
    original: 'Yüklenen görüntü',
    originalToGray: 'Orijinal → gri ton',
    inverted: 'Renkler ters çevrildi (açık arka plan algılandı)',
    grayscale: 'Gri tonlu pikseller',
    gridLabel: 'Girdi görüntüsü, 28x28 gri tonlu piksel',
    zoom: 'Yakınlaştırma · pikselin çevresi, 5×5',
    hoverHint: 'Tek tek piksel değerlerini görmek için imleci görüntünün üzerinde gezdir.',
    pixelHint: 'Her piksel tek bir parlaklık değeri: 0 siyah, 1 beyaz.',
    drop: 'Görüntüyü buraya bırak ya da',
    chooseFile: 'Dosya seç',
    notImage: 'Lütfen bir görüntü dosyası seç (PNG, JPG, GIF, WebP…).',
    loadError: 'Bu dosya görüntü olarak okunamadı.',
    privacy:
      'Görüntün tarayıcıdan dışarı çıkmaz. Ortadan kare kırpılır, 28×28’e küçültülür ve gri tona çevrilir. Arka plan açıksa renkler ters çevrilir, böylece şekil eğitim verisindeki gibi koyu zemin üzerinde parlak durur.',
  },

  draw: {
    canvas: 'Çizim alanı',
    tool: 'Çizim aracı',
    brush: 'Fırça',
    eraser: 'Silgi',
    size: 'Fırça boyutu',
    sizes: ['İnce', 'Orta', 'Kalın'],
    clear: 'Temizle',
    hint: 'Daire, kare, üçgen ya da artı çiz. Bu küçük model yalnızca bu dördünü tanıyor.',
  },

  kernelEditor: {
    weight: (r: number, c: number) => `Çekirdek ağırlığı, satır ${r} sütun ${c}`,
    bias: 'bias',
  },

  conv: {
    preset: 'Hazır çekirdek',
    zeroPadding: (p: number) => `+ ${p} piksel sıfır dolgu`,
    inputLabel: 'Çekirdek penceresiyle girdi görüntüsü',
    clickHint: 'Çekirdeği taşımak için istediğin yere tıkla.',
    weights: 'Çekirdek ağırlıkları · düzenlenebilir',
    position: (i: number, j: number) => `Konum (${i}, ${j}) · girdi × ağırlık`,
    pad: 'dolgu',
    output: 'Çıktı özellik haritası',
    legend: 'negatif · 0 · pozitif',
    outputSize: 'Çıktı boyutu:',
  },

  fmaps: {
    filter: (n: number) => `Filtre ${n}`,
    finds: ['dikey kenarlar', 'yatay kenarlar', 'çapraz kenarlar', 'doku / köşeler'],
    looksFor: (what: string) => `aradığı: ${what}`,
    gallery: 'Tek girdi, dört filtre, dört özellik haritası (incelemek için tıkla)',
    note: 'Bu dört çekirdek ders kitaplarından seçilmiş hazır filtreler. Çıktıları kolay okunduğu için bunları seçtim. Eğitilmiş bir CNN bunlarla başlamaz: filtre ağırlıkları rastgele başlar ve geri yayılımla öğrenilir. Eğitilmiş ağların ilk katmanları çoğu zaman kenar ve renk dedektörlerine benzer, ama öğrenilen filtrelerin çoğunun insan diliyle basit bir karşılığı yoktur.',
  },

  relu: {
    from: 'Hangi çekirdeğin haritası',
    mostNeg: 'En negatif',
    mostPos: 'En pozitif',
    keysLabel: 'Vurgulu pikseli ok tuşlarıyla taşıyabilirsin',
    before: 'ReLU’dan önce',
    after: 'ReLU’dan sonra',
    negative: 'negatif → 0',
    positive: 'pozitif → değişmez',
    zero: 'sıfır sıfır kalır',
    move: 'Vurgulu pikseli taşı',
    up: 'Yukarı',
    down: 'Aşağı',
    left: 'Sol',
    right: 'Sağ',
    stats: (neg: number, total: number) =>
      `${total} değerin ${neg} tanesi negatifti ve 0 oldu. Herhangi bir pikseli incelemek için üzerine gel, tıkla ya da ok tuşlarını kullan.`,
  },

  pool: {
    type: 'Havuzlama türü',
    maxPooling: 'Max pooling',
    avgPooling: 'Average pooling',
    window: 'Pencere',
    windowSize: 'Pencere boyutu',
    input: 'Girdi özellik haritası (ReLU sonrası)',
    region: (s: number) => `Şu anki ${s}×${s} bölge`,
    sum: (n: number) => `toplam / ${n}`,
    output: 'Çıktı (havuzlanmış)',
    values: (a: number, b: number) => `${a} → ${b} değer`,
    fewer: (x: string) => `sonraki katman için ${x} kat daha az sayı`,
    maxNote:
      'Max pooling her pencerede yalnızca en güçlü tepkiyi tutar. “Desen burada var mıydı?” sorusuna cevap verir, tam olarak nerede olduğunu değil.',
    avgNote: 'Average pooling her pencerenin ortalamasını alır, bu da haritayı yumuşatır.',
    noWeights: 'Öğrenilen bir ağırlığı yok.',
  },

  arch: {
    hint: 'İncelemek için bir katmana tıkla · boyutlar yükseklik × genişlik × kanal',
    total: (n: string) => `toplam ${n} öğrenilebilir parametre`,
    enters: 'Giren',
    does: 'Katmanın yaptığı',
    comesOut: 'Çıkan',
    rawImage: 'Ham görüntü. Ondan önce bir şey yok.',
    notLearned: 'Ağırlıklar öğrenilmedi',
    trainedHere: 'Tarayıcında eğitildi',
    layers: {
      input: {
        op: 'Gri tonlu görüntü',
        explain:
          '[0, 1] aralığında parlaklık değerlerinden oluşan 28×28’lik bir tablo. Görüntü gri tonlu olduğu için tek kanal var, renkli olsaydı 3 olurdu.',
      },
      conv1: {
        op: '8 filtre · 3×3 · adım 1 · dolgu yok',
        explain:
          '8 filtrenin her biri görüntünün üzerinde kayar ve kendi özellik haritasını üretir. Dolgu olmadan 3×3’lük pencere 28 pikselin üzerine 26 kez sığar.',
      },
      act1: {
        op: 'her değere ayrı ayrı max(0, x)',
        explain:
          'Her değere bağımsız uygulandığı için boyut değişmez. Negatif tepkiler 0’a kırpılır.',
      },
      pool1: {
        op: '2×2 pencere · adım 2',
        explain:
          'Her 2×2’lik bloktan en güçlü tepkiyi tutar, genişlik ve yükseklik yarıya iner. Her kanal ayrı havuzlanır.',
      },
      conv2: {
        op: '16 filtre · 3×3×8 · adım 1',
        explain:
          'Artık her filtre 8 girdi kanalının hepsine birden bakar (3×3×8 ağırlık). Böylece kenarları birleştirip daha karmaşık desenler oluşturabilir.',
      },
      act2: {
        op: 'her değere ayrı ayrı max(0, x)',
        explain:
          'Öncekiyle aynı doğrusal olmayan adım. O olmasa üst üste konvolüsyonlar tek bir doğrusal işleme indirgenirdi.',
      },
      pool2: {
        op: '2×2 pencere · adım 2',
        explain:
          '11 tek sayı olduğu için son satır ve sütun tam pencereye sığmaz ve atılır: ⌊(11 − 2) / 2⌋ + 1 = 5.',
      },
      flat: {
        op: 'Vektöre dönüştür',
        explain:
          'Hesaplama yok. 16 tane 5×5’lik harita uç uca eklenip 400 sayılık bir listeye dönüşür.',
      },
      logits: {
        op: '4 nöron, tam bağlı',
        explain:
          'Her çıktı nöronu 400 girdinin hepsinin ağırlıklı toplamını alır ve bir bias ekler. Çıkan sonuçlara logit denir.',
      },
      probs: {
        op: 'exp(zᵢ) / Σ exp(zⱼ)',
        explain: 'Logitleri hepsi pozitif ve toplamı 1 olan olasılıklara çevirir.',
      },
    },
  },

  hierarchy: {
    rf: 'Alıcı alan',
    rfText: (layer: string, note: string) =>
      `Vurgulanan alan, ${layer} içindeki bir nöronun girdinin ne kadarını “görebildiğini” gösteriyor: ${note}. Konvolüsyon ve havuzlama katmanları eklendikçe bu alan büyür.`,
    levels: [
      {
        title: 'Katman 1',
        subtitle: 'Kenarlar',
        rfNote: '3×3 piksel',
        tag: 'bu ağın çıktısı',
      },
      {
        title: 'Katman 2',
        subtitle: 'Dokular / basit şekiller',
        rfNote: '8×8 piksel',
        tag: 'bu ağ, rastgele filtreler',
      },
      {
        title: 'Katman 3',
        subtitle: 'Parçalar / desenler',
        rfNote: 'daha derin bir ağda yaklaşık 18×18',
        tag: 'çizim',
      },
      {
        title: 'Katman 4',
        subtitle: 'Üst düzey yapılar',
        rfNote: 'görüntünün tamamı',
        tag: 'çizim',
      },
    ],
    edgeNames: ['dikey', 'yatay', 'çapraz', 'dış hat'],
    channel: (n: number) => `kanal ${n}`,
    parts: ['köşe', 'eğri', 'kavşak', 'çizgi ucu', 'paralel', 'halka'],
    wholes: ['yuvarlak nesne', 'kutu gibi', 'sivri', 'yüz gibi'],
    note: 'Bu, hiyerarşik özellik öğrenmenin sezgisel bir resmi, garantisi değil. Katman 1 ve 2 bu uygulamadaki küçük ağın gerçek çıktıları, 3 ve 4 ise çizim. Eğitilmiş CNN’ler üzerine yapılan çalışmalar çoğu zaman basitten karmaşığa benzer bir ilerleme bulur. Yine de her katmanın ne öğrendiği veriye, mimariye ve eğitime bağlıdır.',
  },

  flatten: {
    firstMaps: '16 havuzlanmış haritanın ilk 3’ü',
    vectorFirst: 'Vektör (ilk 3 harita)',
    flatten: 'Düzleştir',
    unflatten: 'Geri al',
    map: (n: number) => `harita ${n}`,
    allMaps: '16 haritanın hepsi',
    vector: 'Düzleştirilmiş vektör',
    note: 'c. satırda c. harita var, soldan sağa ve yukarıdan aşağı okunuyor. Flatten hiçbir hesap yapmaz, sadece şekli 5×5×16’dan 400’e çevirir ki Dense katman kullanabilsin.',
    wrapped: (n: number) => `${n} sayı, satır başına 25 (her satır bir 5×5 harita)`,
  },

  dense: {
    aria: 'Dense katman bağlantıları',
    more: '⋮ 388 girdi daha',
    legendPos: 'pozitif ağırlık',
    legendNeg: 'negatif ağırlık',
    thickness: 'kalınlık = |w|',
    showing: '400 girdiden en aktif 12’si gösteriliyor (1.600 ağırlığın 48’i).',
    adds: (cls: string) => `${cls} logiti nasıl oluşuyor (400 girdinin hepsi)`,
    bias: 'bias',
    others: 'diğer 395 terim',
    feeds: (i: number, v: string) => `x${i} = ${v} girdisi her nörona gidiyor`,
    hint: 'Bir nöronun ya da girdinin üzerine gel. Her çıktı nöronu 400 girdinin hepsine bağlı, “tam bağlı” denmesinin sebebi bu. Bu ağırlıklar tarayıcında yapay şekillerle eğitildi.',
  },

  softmax: {
    edited: 'Logitleri sen değiştirdin',
    fromModel: 'Logitler küçük modelden',
    useNetwork: 'Ağın logitlerine dön',
    equal: 'Hepsi eşit',
    cls: 'Sınıf',
    logit: 'Logit z',
    prob: 'Olasılık',
    sliderLabel: (cls: string) => `${cls} logiti`,
    points: [
      'Olasılıkların hepsi pozitif ve toplamları her zaman 1.',
      'Sadece logitler arasındaki farklar önemli. Hepsine aynı sayıyı eklemek hiçbir şeyi değiştirmez.',
      'Üstel fonksiyon farkları büyütür, bu yüzden en büyük logit genelde baskın çıkar.',
    ],
    note: 'Başlangıçtaki logitler bu uygulamadaki küçük modelden geliyor (4 sınıf, yapay şekillerle eğitildi). Yani bir simülasyon, gerçek dünyada çalışan bir sınıflandırıcının çıktısı değil.',
  },

  exp: {
    firstKernel: 'İlk çekirdek',
    poolSize: 'Havuz boyutu',
    filters: 'Filtre sayısı',
    convOut: 'conv çıktısı',
    params: 'parametre',
    filter: 'Filtre',
    tooSmall: 'Havuzlamak için çok küçük',
    tip: 'Adımı 2 yap, çıktı yarıya iner. 3×3 çekirdekle dolguyu 1 yaparsan boyut korunur. Sigmoid negatifleri yok eder ve her şeyi 0.5’e doğru çeker. Ortalama ve max havuzlamayı da karşılaştır. Hepsi şu anki girdi görüntüsünden canlı hesaplanıyor.',
  },

  playground: {
    eyebrow: 'Deneme alanı',
    title: 'CNN deneme alanı',
    intro: 'İlk katmanı ayarla, sonra görüntünü ağın içinden aşama aşama geçir.',
    imageCard: '1 · Görüntü',
    settingsCard: '2 · Katman ayarları',
    kernelFor1: '1 numaralı filtrenin çekirdeği',
    run: 'Adım adım çalıştır',
    auto: 'Otomatik oynat',
    stage: (i: number, n: number) => `aşama ${i} / ${n}`,
    from: (shape: string) => `${shape} boyutundan`,
    yourFilter: 'senin filtren',
    predicted: 'Tahmin:',
    changedNote:
      'İlk katmanı değiştirdin. Dense katman varsayılan ayarlardan (dikey kenar çekirdeği, ReLU, max pooling) gelen özelliklerle eğitildi. Şimdi hiç görmediği girdiler alıyor, bu yüzden tahmin kötüleşebilir. Gerçek bir ağ böyle bir değişiklikten sonra yeniden eğitilirdi.',
    tinyNote: (n: number) =>
      `Bu tahmin yalnızca ${n} yapay şekil sınıfını bilen küçük, simüle bir CNN’den geliyor. Gülen yüz gibi başka bir şey verirsen de onu bu sınıflardan birine sokmak zorunda.`,
    stages: (act: string, pool: string) => [
      { title: 'Girdi', explain: 'Gri tonlu görüntü: 0 ile 1 arasında 784 sayı.' },
      {
        title: 'Konvolüsyon',
        explain:
          'Sekiz tane 3×3 filtre görüntünün üzerinde kayar. 1 numaralı filtre senin seçtiğin çekirdek, diğer yedisi sabit kenar filtreleri.',
      },
      {
        title: act,
        explain: `${act} her özellik haritasının her değerine uygulanır. Boyut değişmez.`,
      },
      {
        title: `${pool} havuzlama`,
        explain: 'Her 2×2’lik blok tek bir değere iner, genişlik ve yükseklik yarıya düşer.',
      },
      {
        title: 'Konvolüsyon 2',
        explain:
          'On altı filtrenin her biri 8 girdi haritasının hepsine birden bakar (3×3×8 ağırlık) ve ilk katmanın özelliklerini birleştirir.',
      },
      { title: `${act} 2`, explain: 'Aynı aktivasyon bir kez daha, her değere ayrı ayrı.' },
      {
        title: `${pool} havuzlama 2`,
        explain: '11×11 → 5×5. Son satır ve sütun tam pencere oluşturmadığı için atılır.',
      },
      {
        title: 'Flatten',
        explain: '16 tane 5×5’lik harita 400 sayılık tek bir vektöre açılır.',
      },
      {
        title: 'Dense',
        explain:
          'Her sınıf için bir nöron, toplam dört. Her biri 400 girdinin ağırlıklı toplamına bir bias ekler. Bunlar logitler.',
      },
      {
        title: 'Tahmin',
        explain: 'Softmax logitleri toplamı 1 olan olasılıklara çevirir.',
      },
    ],
  },

  training: {
    eyebrow: 'Eğitim',
    title: 'Bir CNN nasıl öğrenir',
    intro:
      'Bir CNN’in ağırlıklarını kimse elle yazmaz. Eğitim aynı döngüyü binlerce kez tekrarlar: tahmin et, hatayı ölç, her ağırlığın bu hataya ne kadar katkı yaptığını hesapla ve hepsini hatayı azaltacak yöne biraz kaydır.',
    train: 'Eğit',
    oneStep: 'Tek adım',
    speed: 'Hız',
    speeds: ['Açıklamalı', 'Normal', 'Hızlı'],
    lr: 'Öğrenme oranı',
    batch: 'Batch boyutu',
    phases: [
      { name: 'İleri geçiş', detail: 'Batch ağın içinden geçirilir' },
      { name: 'Tahmin', detail: 'Softmax sınıf olasılıklarını verir' },
      { name: 'Kayıp', detail: 'Çapraz entropi: −log p(doğru sınıf)' },
      { name: 'Geri yayılım', detail: 'Her ağırlık için ∂kayıp/∂w (burada: p − y çarpı x)' },
      { name: 'Ağırlık güncelleme', detail: 'w ← w − öğrenme oranı × gradyan' },
    ],
    next: '↺ sonraki iterasyon',
    epoch: 'Epoch',
    iteration: 'İterasyon',
    loss: 'Kayıp',
    accuracy: 'Doğruluk',
    validation: 'Doğrulama',
    trainImages: (n: number) => `${n} eğitim görüntüsü`,
    batchOf: (n: number) => `${n} görüntülük batch`,
    thisBatch: 'bu batch',
    unseen: (n: number) => `görülmemiş ${n} görüntü`,
    lower: 'düşük olması iyi',
    higher: 'yüksek olması iyi',
    lossAria: 'İterasyonlara göre kayıp',
    accAria: 'İterasyonlara göre doğruluk',
    batchSeries: 'batch',
    valSeries: 'doğrulama',
    example: 'Batch’ten bir örnek',
    trueLabel: 'gerçek etiket:',
    weightsTitle: 'Dense katman ağırlıkları, 16 tane 5×5 harita olarak',
    cls: 'Sınıf',
    show: 'Göster',
    weights: 'Ağırlıklar',
    gradient: 'Son gradyan',
    ch: (n: number) => `k${n}`,
    weightsNote: (cls: string) =>
      `Her ağırlık düzleştirilmiş bir özelliği ${cls} nöronuna bağlıyor. Turuncu ağırlıklar o özellik aktifken skoru yükseltir, maviler düşürür. Eğitim ilerledikçe nasıl belirginleştiklerine bak.`,
    gradientNote: 'Gradyan, her ağırlığın ters yönde hareket edeceği yönü gösterir.',
    individual: 'Tek tek ağırlıklar',
    individualNote: 'Değer ve son güncellemedeki değişim (Δ).',
    realNote: (n: number) =>
      `Yukarıdaki sayılar softmax çapraz entropisi üzerinde gerçekten çalışan mini-batch gradyan inişinden geliyor, uydurma bir şey yok. Ama yalnızca son Dense katman (1.604 parametre) ${n} yapay çizimle eğitiliyor. Hızlı kalsın diye konvolüsyon filtreleri dondurulmuş durumda.`,
    realCnnNote:
      'Gerçek bir CNN’de geri yayılım burada durmaz. Zincir kuralı gradyanı Dense katmandan, havuzlamadan, ReLU’dan ve her konvolüsyondan geriye taşır, böylece bütün filtre ağırlıkları veriden öğrenilir. Bu genelde binlerce görüntü üzerinde çok sayıda epoch sürer ve çoğu zaman GPU ister. Kararsız, zıplayan bir kayıp görmek için öğrenme oranını 8 yap.',
  },

  concepts: {
    eyebrow: 'Matematik',
    title: 'Kısaca matematik',
    intro:
      'Bir CNN’in büyük kısmını dört formül taşır. Her birini açınca çözülmüş bir örnek göreceksin. Sayılar görselleri çalıştıran kodun aynısıyla hesaplanıyor.',
    convTitle: 'Konvolüsyon',
    convText:
      'Çekirdek K’yı (i, j) konumuna koy, her pikseli üzerindeki ağırlıkla çarp ve topla. Derin öğrenme kütüphaneleri ve bu uygulama çekirdeği ters çevirmez, yani teknik olarak yapılan şey çapraz korelasyon. Ağırlıklar zaten öğrenildiği için pratikte bu fark bir şey değiştirmez.',
    patch: 'görüntü parçası',
    verticalKernel: 'dikey kenar çekirdeği',
    outputSize: (formula: string) => `Eksen başına çıktı boyutu: ${formula}`,
    outputSizeVars: 'n girdi boyutu, p dolgu, k çekirdek boyutu, s adım.',
    reluText:
      'Her değere bağımsız uygulanır. Hesaplaması ucuzdur, gradyanı da pozitif girdiler için 1, diğerleri için 0’dır. Derin ağların eğitilmesini kolaylaştıran şey bu. Uygulamadaki diğer aktivasyonlar sigmoid 1/(1+e⁻ˣ), tanh ve leaky ReLU (negatifler için 0.1x).',
    poolTitle: 'Havuzlama',
    window: 'pencere',
    poolText:
      'Ağırlık yok, havuzlama her pencerenin sabit bir özeti. Adımı 2 olan 2×2 pencere genişlik ve yüksekliği yarıya indirir, kanal sayısını korur. Girdideki küçük kaymalara karşı biraz dayanıklılık kazandırır.',
    softmaxText:
      'Pratikte önce her logitten max(z) çıkarılır. Kesirde birbirini götürür ama exp()’in taşmasını önler. Eğitim, doğru sınıf için −log p olan çapraz entropi kaybını küçültmeye çalışır.',
    sum: 'toplam',
    glossary: 'Sözlük',
    glossarySub: 'Her CNN makalesinde ve eğitiminde karşına çıkacak terimler.',
    terms: {
      rf: {
        term: 'Alıcı alan',
        text: 'Girdi görüntüsünde tek bir nöronu etkileyebilen bölge. Her conv ve havuzlama katmanıyla büyür.',
      },
      stride: {
        term: 'Adım (stride)',
        text: 'Çekirdeğin bir konumdan diğerine kaç piksel kaydığı. Adım 2 olunca çıktı aşağı yukarı yarıya iner.',
      },
      padding: {
        term: 'Dolgu (padding)',
        text: 'Kenarlara eklenen sıfırlar. Böylece çekirdek kenardaki piksellerin üzerine de ortalanabilir. 3×3 çekirdekle dolgu 1 olursa boyut korunur.',
      },
      channels: {
        term: 'Kanallar',
        text: 'Bir tensörün derinliği. Renkli bir görüntünün 3 kanalı vardır (R, G, B). 8 filtreli bir conv katmanı 8 kanal üretir.',
      },
      fmap: {
        term: 'Özellik haritası',
        text: 'Tek bir filtrenin çıktısı. Filtrenin deseninin nerede ve ne kadar güçlü göründüğünü gösteren bir tablo.',
      },
      params: {
        term: 'Parametreler',
        text: 'Ağın öğrendiği sayılar. Bir conv katmanında (k·k·C_girdi + 1)·C_çıktı tane bulunur. Gri tonlu görüntü üzerinde 3×3’lük 8 filtre için bu 80 eder.',
      },
      weights: {
        term: 'Ağırlıklar',
        text: 'Çekirdeklerin ve dense katmanların içindeki değerler. Eğitim, kaybı azaltmak için bunları ayarlar.',
      },
      bias: {
        term: 'Bias',
        text: 'Her filtre ya da nöron için ağırlıklı toplamdan sonra eklenen, öğrenilebilir tek bir sayı. Nöronun “ateşlendiği” noktayı kaydırır.',
      },
      activation: {
        term: 'Aktivasyon',
        text: 'Her değere ayrı uygulanan doğrusal olmayan fonksiyon (ReLU, sigmoid, tanh…). O olmasa üst üste katmanlar tek bir doğrusal dönüşüme indirgenir.',
      },
      logits: {
        term: 'Logitler',
        text: 'Son Dense katmandan softmax’ten önce çıkan ham sınıf skorları. Herhangi bir reel sayı olabilirler.',
      },
    },
    actTitle: 'Aktivasyon fonksiyonları',
    actSub: 'Hepsi x = −3 ile 3 arasında çizildi.',
    limitsTitle: 'Eğitim amaçlı sınırlamalar',
    limits: [
      'Demo ağ çok küçük (yaklaşık 2.9 bin parametre), 28×28 gri tonlu görüntülerle ve 4 sınıfla çalışıyor.',
      'İlk katmanın filtreleri elle seçildi, ikinci katmanınkiler rastgele. Yalnızca Dense katman eğitiliyor.',
      'Gerçek CNN’ler bütün filtreleri öğrenir, çok daha fazla katman ve kanal kullanır, batch normalizasyonu gibi teknikler ekler.',
      'Hiyerarşi ve “bu katman şunu algılar” resimleri sezgi verir. Belirli bir eğitilmiş model hakkında garanti vermez.',
    ],
  },

  notFound: {
    title: 'Böyle bir katman yok.',
    back: 'Başa dön',
  },
};
