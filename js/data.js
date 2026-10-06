/* ============ TechNova — fuente única de datos ============ */

/* --- Imágenes: SVG data-URI por producto (sin recursos externos) --- */
const PRODUCT_SVGS = {
  Audio: (label, c1, c2) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" role="img" aria-label="${label}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="600" height="420" fill="url(#g)"/>
      <path d="M180 250v-40a120 120 0 0 1 240 0v40" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="22" stroke-linecap="round"/>
      <rect x="150" y="240" width="70" height="110" rx="30" fill="rgba(255,255,255,.9)"/>
      <rect x="380" y="240" width="70" height="110" rx="30" fill="rgba(255,255,255,.9)"/>
      <text x="300" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,.9)">${label}</text>
    </svg>`,
  Teclados: (label, c1, c2) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" role="img" aria-label="${label}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="600" height="420" fill="url(#g)"/>
      <rect x="90" y="140" width="420" height="170" rx="18" fill="rgba(255,255,255,.92)"/>
      <g fill="rgba(30,34,48,.75)">
        <rect x="115" y="165" width="52" height="40" rx="7"/><rect x="177" y="165" width="52" height="40" rx="7"/>
        <rect x="239" y="165" width="52" height="40" rx="7"/><rect x="301" y="165" width="52" height="40" rx="7"/>
        <rect x="363" y="165" width="52" height="40" rx="7"/><rect x="425" y="165" width="60" height="40" rx="7"/>
        <rect x="115" y="215" width="60" height="40" rx="7"/><rect x="185" y="215" width="52" height="40" rx="7"/>
        <rect x="247" y="215" width="52" height="40" rx="7"/><rect x="309" y="215" width="52" height="40" rx="7"/>
        <rect x="371" y="215" width="52" height="40" rx="7"/><rect x="433" y="215" width="52" height="40" rx="7"/>
        <rect x="115" y="265" width="70" height="30" rx="7"/><rect x="195" y="265" width="240" height="30" rx="7"/>
        <rect x="445" y="265" width="40" height="30" rx="7"/>
      </g>
      <text x="300" y="375" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,.9)">${label}</text>
    </svg>`,
  Accesorios: (label, c1, c2) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" role="img" aria-label="${label}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="600" height="420" fill="url(#g)"/>
      <rect x="205" y="110" width="190" height="210" rx="26" fill="rgba(255,255,255,.92)"/>
      <rect x="230" y="140" width="140" height="110" rx="12" fill="rgba(30,34,48,.15)"/>
      <circle cx="300" cy="275" r="22" fill="none" stroke="rgba(30,34,48,.6)" stroke-width="8"/>
      <rect x="270" y="85" width="60" height="26" rx="10" fill="rgba(255,255,255,.92)"/>
      <text x="300" y="375" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,.9)">${label}</text>
    </svg>`
};

const toDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const buildImage = (category, name, c1, c2) =>
  toDataUri(PRODUCT_SVGS[category](name, c1, c2));

/* --- Catálogo: 12 productos en 3 categorías --- */
const PRODUCTS = [
  {
    id: 1,
    name: "Auriculares NovaSound X2",
    price: 129.99,
    oldPrice: 169.99,
    category: "Audio",
    description: "Audio espacial, cancelación activa de ruido y 40 h de batería.",
    longDescription: "Los NovaSound X2 combinan control activo de ruido híbrido con drivers de 40 mm afinados a mano. Modo transparencia, Bluetooth 5.3 multipunto y estuche de carga rápida (10 min = 5 h).",
    rating: 4.8,
    reviews: 342,
    stock: 14,
    featured: true,
    specs: ["Bluetooth 5.3", "ANC híbrido", "40 h de batería", "Carga USB-C"],
    image: buildImage("Audio", "NovaSound X2", "#6a5cff", "#00c2ff")
  },
  {
    id: 2,
    name: "Audífonos Pulse Bass",
    price: 59.99,
    oldPrice: 74.99,
    category: "Audio",
    description: "Graves profundos, diadema acolchada y control táctil.",
    longDescription: "Diseñados para amantes del bajo: controladores dinámicos con refuerzo pasivo, controles táctiles en el auricular derecho y piel sintética hipoalergénica.",
    rating: 4.5,
    reviews: 198,
    stock: 30,
    featured: false,
    specs: ["Graves boost", "Control táctil", "24 h de batería", "Plegables"],
    image: buildImage("Audio", "Pulse Bass", "#ff5c8a", "#ff9a5c")
  },
  {
    id: 3,
    name: "Parlante Orbit 360",
    price: 89.99,
    oldPrice: null,
    category: "Audio",
    description: "Sonido 360°, resistente al agua IPX7 y 24 h de reproducción.",
    longDescription: "Parrilla acústica 360° con dos drivers pasivos. Impermeable IPX7 (se puede sumergir), modo estéreo con dos unidades y luz ambiental sincronizada con la música.",
    rating: 4.7,
    reviews: 264,
    stock: 21,
    featured: true,
    specs: ["360°", "IPX7", "24 h", "Emparable x2"],
    image: buildImage("Audio", "Orbit 360", "#00c853", "#00e5ff")
  },
  {
    id: 4,
    name: "Micrófono StudioVoice",
    price: 79.99,
    oldPrice: 99.99,
    category: "Audio",
    description: "Condensador cardiode con antipop y ganancia en el propio mic.",
    longDescription: "Ideal para streaming y podcasts: patrón cardiode, ganancia y monitorización en el cuerpo, brazo de mesa incluido y conexión USB-C/XLR híbrida.",
    rating: 4.6,
    reviews: 151,
    stock: 9,
    featured: false,
    specs: ["Cardiode", "24-bit/96kHz", "Antipop incluido", "Ganancia física"],
    image: buildImage("Audio", "StudioVoice", "#aa00ff", "#ff1744")
  },
  {
    id: 5,
    name: "Teclado Mecánico NovaKeys",
    price: 99.99,
    oldPrice: 119.99,
    category: "Teclados",
    description: "Switches lineales, RGB por tecla y chasis de aluminio.",
    longDescription: "Hot-swappable con switches lineales pre-lubricados, doble inyección PBT, RGB por tecla con perfiles, macros en firmware y conexión triple (USB-C / 2.4G / BT).",
    rating: 4.9,
    reviews: 411,
    stock: 18,
    featured: true,
    specs: ["Hot-swap", "PBT double-shot", "Tri-mode", "Macros"],
    image: buildImage("Teclados", "NovaKeys", "#7c4dff", "#448aff")
  },
  {
    id: 6,
    name: "Teclado Compacto TypeGo 68",
    price: 74.99,
    oldPrice: null,
    category: "Teclados",
    description: "Layout 68 teclas, inalámbrico y batería de 30 días.",
    longDescription: "El punto dulce entre 60% y TKL: flechas y F-row presentes, estabilizadores de fábrica y batería de 30 días con luz desactivada.",
    rating: 4.6,
    reviews: 187,
    stock: 25,
    featured: false,
    specs: ["68 teclas", "2.4G + BT", "30 días", "Estabilizadores"],
    image: buildImage("Teclados", "TypeGo 68", "#ff6d00", "#ff1744")
  },
  {
    id: 7,
    name: "Teclado TKL Air Lite",
    price: 84.99,
    oldPrice: 94.99,
    category: "Teclados",
    description: "Perfil bajo, switches silent y alcance de 10 m.",
    longDescription: "Diseño ultra delgado con switches silenciosos de recorrido corto: perfecto para oficinas. Perfil de teclas escultórico y soporte para ambos sistemas.",
    rating: 4.4,
    reviews: 96,
    stock: 33,
    featured: false,
    specs: ["Ultra delgado", "Silent", "Multi-OS", "10 m"],
    image: buildImage("Teclados", "Air Lite", "#00bfa5", "#2979ff")
  },
  {
    id: 8,
    name: "Set de Keycaps Prism",
    price: 29.99,
    oldPrice: null,
    category: "Teclados",
    description: "PBT sublimados con leyenda translúcida para RGB.",
    longDescription: "128 teclas ANSI/ISO en PBT de 1.5 mm con leyendas sublimadas que dejan pasar la luz. Incluye removedor y kits de compatibilidad.",
    rating: 4.7,
    reviews: 73,
    stock: 44,
    featured: false,
    specs: ["128 teclas", "PBT 1.5mm", "ANSI/ISO", "Removedor"],
    image: buildImage("Teclados", "Prism Keys", "#ff4081", "#ffd740")
  },
  {
    id: 9,
    name: "Mouse Ergonómico Glide Pro",
    price: 49.99,
    oldPrice: 64.99,
    category: "Accesorios",
    description: "Sensor 8000 DPI, silencioso y carga USB-C rápida.",
    longDescription: "Forma vertical para muñecas neutras, sensor óptico 8000 DPI ajustable por software, 6 botones programables y clics silenciosos.",
    rating: 4.6,
    reviews: 229,
    stock: 27,
    featured: true,
    specs: ["8000 DPI", "6 botones", "Silencioso", "Vertical"],
    image: buildImage("Accesorios", "Glide Pro", "#2979ff", "#00e676")
  },
  {
    id: 10,
    name: "Hub USB-C Vertex 6-en-1",
    price: 39.99,
    oldPrice: 52.99,
    category: "Accesorios",
    description: "HDMI 4K, 2× USB 3.0, SD, lector y carga 100 W.",
    longDescription: "Aluminio anodizado con disipación pasiva: HDMI 4K@60Hz, dos USB 3.0, lector SD/microSD y passthrough de carga Power Delivery de 100 W.",
    rating: 4.5,
    reviews: 312,
    stock: 50,
    featured: false,
    specs: ["4K@60Hz", "PD 100W", "SD/microSD", "Aluminio"],
    image: buildImage("Accesorios", "Vertex 6", "#aa00ff", "#2962ff")
  },
  {
    id: 11,
    name: "Webcam Clarity 2K",
    price: 64.99,
    oldPrice: null,
    category: "Accesorios",
    description: "Resolución 2K, doble micrófono con reducción de ruido.",
    longDescription: "Sensor 2K a 30 fps, enfoque automático con corrección de luz, tapa de privacidad física y micrófonos con IA para reducir ruido de fondo.",
    rating: 4.4,
    reviews: 142,
    stock: 19,
    featured: false,
    specs: ["2K QHD", "Tapa física", "Auto-enfoque", "Doble mic"],
    image: buildImage("Accesorios", "Clarity 2K", "#00bfa5", "#c51162")
  },
  {
    id: 12,
    name: "Soporte Articulado ArcStand",
    price: 44.99,
    oldPrice: 57.99,
    category: "Accesorios",
    description: "Brazo de aluminio con cable management y pinza sin agujeros.",
    longDescription: "Sostén hasta 9 kg con regulación de tensión gas-strut, 360° de rotación y canales internos para ocultar todos los cables.",
    rating: 4.8,
    reviews: 88,
    stock: 12,
    featured: true,
    specs: ["9 kg máx.", "Gas-strut", "Cable management", "360°"],
    image: buildImage("Accesorios", "ArcStand", "#536dfe", "#ff6e40")
  }
];

const CATEGORIES = ["Todos", "Audio", "Teclados", "Accesorios"];

/* --- Oferta flash: duración del contador (ms) --- */
const DEAL_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas desde el primer guardado

/* --- Cupones válidos --- */
const COUPONS = {
  NOVA10: { type: "percent", value: 10, min: 0, label: "10% de descuento" },
  NOVA20: { type: "percent", value: 20, min: 100, label: "20% (compra mín. US$ 100)" },
  FREESHIP: { type: "shipping", value: 0, min: 0, label: "Envío gratis" }
};

const FREE_SHIPPING_MIN = 150;
const FLAT_SHIPPING = 6.99;

/* --- Estadísticas del hero --- */
const STATS = [
  { value: 12400, suffix: "+", label: "Clientes felices" },
  { value: 12, suffix: "", label: "Productos premium" },
  { value: 4.8, suffix: "★", label: "Valoración media", decimals: 1 },
  { value: 8200, suffix: "+", label: "Pedidos enviados" }
];

/* --- Testimonios --- */
const TESTIMONIALS = [
  { name: "Carla Méndez", role: "Diseñadora UX", stars: 5,
    text: "El NovaKeys cambió mi flujo diario. La calidad de las teclas PBT se siente de gama alta y la llegó en 24 h." },
  { name: "Diego Fuentes", role: "Streamer", stars: 5,
    text: "El StudioVoice me quitó el ruido del ventilador de un saque. Los oyentes notaron la diferencia en el primer stream." },
  { name: "Lucía Ortega", role: "Estudiante de ingeniería", stars: 4,
    text: "Compré el TypeGo 68 para la universidad: silencioso, ligero y la batería me dura semanas. Muy buen precio." },
  { name: "Martín Ríos", role: "Desarrollador backend", stars: 5,
    text: "El hub Vertex salvó mi MacBook: un solo cable para todo. Atención al cliente respondió en minutos por el cupón." }
];

/* --- FAQ --- */
const FAQ = [
  { q: "¿Cuánto tarda el envío?",
    a: "Pedidos antes de las 17:00 se despachan el mismo día. Entrega estándar 2–4 días hábiles y exprés 24 h en capitales." },
  { q: "¿Cómo funciona la garantía?",
    a: "Todos los productos tienen 12 meses de garantía oficial TechNova. Si falla, coordinamos recogida y reemplazo sin costo." },
  { q: "¿Qué medios de pago aceptan?",
    a: "Tarjetas de crédito y débito, transferencia, PayPal y pago en 3 cuotas sin interés con tarjetas seleccionadas." },
  { q: "¿Puedo devolver un producto?",
    a: "Sí, tienes 30 días para devolverlo en su embalaje original. Si está en garantía, el envío de retorno corre por nuestra cuenta." },
  { q: "¿Los cupones se acumulan?",
    a: "Se aplica un cupón por pedido, pero siempre puedes combinarlo con el envío gratis en compras mayores a US$ 150." }
];
