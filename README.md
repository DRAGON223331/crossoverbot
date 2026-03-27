# 🎮 CrossOver Bot v1.0

بوت ديسكورد للألعاب — XO | حجر ورقة مقص | Logos | أعلام

---

## ⚡ التثبيت

### 1. المتطلبات
- [Node.js](https://nodejs.org/) v18 أو أحدث
- حساب [Discord Developer Portal](https://discord.com/developers/applications)

### 2. إنشاء البوت
1. روح [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط **New Application** → سميه `CrossOver`
3. روح **Bot** → **Reset Token** → انسخ التوكن
4. فعّل **Message Content Intent** من قسم Bot → Privileged Gateway Intents

### 3. دعوة البوت للسيرفر
من قسم **OAuth2 → URL Generator**:
- Scopes: `bot` + `applications.commands`
- Bot Permissions: `Send Messages`, `Read Message History`, `Use External Emojis`, `Embed Links`, `Add Reactions`

### 4. التشغيل

```bash
# نزّل المتطلبات
npm install

# أنشئ ملف .env
cp .env.example .env
# ثم افتح .env وحط التوكن بتاعك

# شغّل البوت
npm start
```

---

## 🎮 الأوامر

| الأمر | الوصف |
|-------|-------|
| `!setchannel` | تحديد روم الألعاب (أدمن فقط) |
| `!xo @mention` | تيك تاك تو ضد لاعب |
| `!rps @mention` | حجر ورقة مقص ضد لاعب |
| `!logos` | لعبة خمّن الكلمة (2 لاعبين) |
| `!flags` | لعبة خمّن العلم |
| `!help` | قائمة الأوامر |

---

## 📁 هيكل المشروع

```
crossover-bot/
├── index.js          ← نقطة البداية
├── package.json
├── .env              ← التوكن (لا ترفعه على GitHub!)
├── config.json       ← إعدادات السيرفرات (يتولد تلقائياً)
└── games/
    ├── xo.js         ← تيك تاك تو
    ├── rps.js        ← حجر ورقة مقص
    ├── logos.js      ← لعبة الكلمات
    └── flags.js      ← لعبة الأعلام
```

---

## ⚠️ تنبيه أمني
- **لا ترفع `.env` أو `config.json` على GitHub أبدًا**
- أضف `.env` و `config.json` لملف `.gitignore`
