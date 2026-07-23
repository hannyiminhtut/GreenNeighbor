# GreenNeighbor — Smart Waste Management System လုပ်ငန်းစဉ်

ဤစာတမ်းသည် လက်ရှိ **GreenNeighbor** ပရောဂျက်၏ ဖွဲ့စည်းပုံ၊ အသုံးပြုသူလုပ်ငန်းစဉ်နှင့် ဒေတာစီးဆင်းပုံကို မြန်မာဘာသာဖြင့် ရှင်းပြထားခြင်းဖြစ်သည်။ Navbar တွင် GreenNeighbor logo နှင့် အမည်ကို အသုံးပြုထားပြီး subtitle အဖြစ် **Smart Waste Management System** ကို ဆက်လက်ထားရှိသည်။

## ၁။ စနစ်၏ ရည်ရွယ်ချက်

ဤစနစ်တွင် အသုံးပြုသူများသည် အမှိုက်တွေ့ရှိသည့်နေရာကို သတင်းပို့နိုင်ပြီး၊ အခြားအသုံးပြုသူများက ထိုအမှိုက်ကို စုဆောင်းနိုင်သည်။ ပုံများကို Gemini AI ဖြင့် စစ်ဆေးပြီး အောင်မြင်သည့် လုပ်ဆောင်ချက်များအတွက် အမှတ်များပေးသည်။

အဓိကလုပ်ဆောင်ချက်များမှာ အောက်ပါအတိုင်းဖြစ်သည်။

- Web3Auth ဖြင့် အကောင့်ဝင်ခြင်း
- အမှိုက်ပုံတင်ပြီး AI ဖြင့် အမျိုးအစားနှင့် ပမာဏစစ်ဆေးခြင်း
- OpenStreetMap ပေါ်တွင် နေရာရှာခြင်း သို့မဟုတ် မြေပုံပေါ်မှ အမှတ်ရွေးချယ်ခြင်း
- အမှိုက်ပုံကို Cloudinary တွင် သိမ်းပြီး အစီရင်ခံစာ တင်သွင်းခြင်း
- အနီးအနားရှိ report များနှင့် AI ပုံနှိုင်းယှဉ်ကာ duplicate report စစ်ဆေးခြင်း
- တူညီသော အမှိုက်ပုံဆိုင်ရာ report များကို waste case တစ်ခုတည်းအောက်တွင် စုစည်းခြင်း
- တင်ထားသောအမှိုက်ကို စုဆောင်းရန် တာဝန်ယူခြင်း
- မြေပုံပေါ်တွင် collection task များကြည့်ခြင်းနှင့် collector အကြံပြုချက်ရယူခြင်း
- စုဆောင်းပြီးသောပုံကို AI ဖြင့် ထပ်မံစစ်ဆေးခြင်း
- အမှတ်နှင့် ဆုများရယူခြင်း
- Leaderboard တွင် အသုံးပြုသူအဆင့်များ ကြည့်ရှုခြင်း
- ဝန်ထမ်းများအတွက် PDF အစီရင်ခံစာ ထုတ်ယူခြင်း

## ၂။ အသုံးပြုထားသော နည်းပညာများ

| အပိုင်း | နည်းပညာ |
|---|---|
| Web application | Next.js 14 App Router, React, TypeScript |
| UI | Tailwind CSS, Radix UI, Lucide icons |
| Authentication | Web3Auth Sapphire Devnet |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| AI verification | Google Gemini 3.6 Flash |
| ပုံသိမ်းဆည်းခြင်း | Cloudinary |
| မြေပုံ | Leaflet နှင့် OpenStreetMap |
| နေရာရှာဖွေခြင်း | OpenStreetMap Nominatim |
| PDF | Puppeteer |
| Testing | Jest |

## ၃။ အဓိကဖိုင်ဖွဲ့စည်းပုံ

```text
app/
├── page.tsx                         ပင်မစာမျက်နှာ
├── login/page.tsx                   အကောင့်ဝင်ရန် လမ်းညွှန်စာမျက်နှာ
├── report/page.tsx                  အမှိုက်သတင်းပို့သည့်စာမျက်နှာ
├── collect/page.tsx                 အမှိုက်စုဆောင်းသည့်စာမျက်နှာ
├── rewards/page.tsx                 ဆုနှင့်အမှတ်စာမျက်နှာ
├── leaderboard/page.tsx             အသုံးပြုသူအဆင့်စာမျက်နှာ
├── download/page.tsx                PDF အစီရင်ခံစာစာမျက်နှာ
├── unauthorized/page.tsx            ခွင့်ပြုချက်မရှိသည့်စာမျက်နှာ
└── api/
    ├── verify-waste/route.ts         Gemini AI စစ်ဆေးမှု API
    ├── report-images/route.ts        ပုံစစ်ဆေးပြီး Cloudinary သို့ upload လုပ်သည့် API
    ├── detect-duplicate/route.ts     အနီးအနား report ပုံများ duplicate ဖြစ်/မဖြစ် စစ်သည့် API
    ├── dispatch-explanation/route.ts Collector အကြံပြုချက်ကို AI ဖြင့်ရှင်းပြသည့် API
    └── reports/download/route.ts     PDF ထုတ်လုပ်သည့် API

components/
├── Header.tsx                        Web3Auth အကောင့်ဝင်/ထွက်ခြင်း
├── Sidebar.tsx                       ဘေးဘက်မီနူး
├── CollectionTaskMap.tsx             Collection task များကို မြေပုံပေါ်တွင်ပြခြင်း
├── OpenStreetMapLocationSearch.tsx   နေရာရှာဖွေခြင်းနှင့် ရွေးချယ်ခြင်း
└── OpenStreetMapCanvas.tsx           မြေပုံ၊ marker နှင့် point picker

utils/db/
├── schema.ts                         Database ဇယားပုံစံများ
├── dbConfig.jsx                      Neon database ချိတ်ဆက်မှု
└── actions.ts                        Server-side database လုပ်ဆောင်ချက်များ
```

## ၄။ Environment variables

ပရောဂျက်၏ root directory တွင် `.env.local` ဖိုင်တစ်ခုရှိရမည်။

```env
DATABASE_URL="Neon PostgreSQL connection URL"
NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID="Web3Auth client ID"
GEMINI_API_KEY="Google Gemini API key"
CLOUDINARY_CLOUD_NAME="Cloudinary cloud name"
CLOUDINARY_API_KEY="Cloudinary API key"
CLOUDINARY_API_SECRET="Cloudinary API secret"
```

သတိပြုရန်အချက်များမှာ အောက်ပါအတိုင်းဖြစ်သည်။

- `DATABASE_URL` ကို browser သို့ မပို့ရပါ။
- `GEMINI_API_KEY` ကို `NEXT_PUBLIC_` မထည့်ရပါ။
- Cloudinary credential သုံးခုကို browser သို့ မပို့ရပါ။
- `.env.local` ကို Git သို့ commit မလုပ်ရပါ။
- Google Maps API key ကို လက်ရှိစနစ်တွင် မလိုအပ်တော့ပါ။

## ၅။ စနစ်စတင်ပုံ

Dependency များထည့်သွင်းရန်—

```bash
npm ci
```

Database ဇယားများ ဖန်တီးရန် သို့မဟုတ် ပြင်ဆင်ရန်—

```bash
npm run db:push
```

Development server စတင်ရန်—

```bash
npm run dev
```

Browser တွင် အောက်ပါလိပ်စာကို ဖွင့်ပါ။

```text
http://localhost:3000
```

## ၆။ အကောင့်ဝင်ခြင်း လုပ်ငန်းစဉ်

```text
အသုံးပြုသူက Login ကိုနှိပ်သည်
          ↓
Web3Auth modal ပေါ်လာသည်
          ↓
Google သို့မဟုတ် ရရှိနိုင်သော provider ဖြင့် အကောင့်ဝင်သည်
          ↓
အသုံးပြုသူ email ကို browser localStorage တွင် သိမ်းသည်
          ↓
Server action က Neon database တွင် user ကို ရှာသည်/ဖန်တီးသည်
          ↓
Header တွင် user balance နှင့် notifications များ ပြသည်
```

Web3Auth project environment သည် `Sapphire Devnet` ဖြစ်ပြီး blockchain network အနေဖြင့် Ethereum Sepolia ကို အသုံးပြုသည်။

## ၇။ အမှိုက်သတင်းပို့ခြင်း လုပ်ငန်းစဉ်

### အဆင့် ၁ — ပုံတင်ခြင်း

အသုံးပြုသူသည် redesigned `/report` စာမျက်နှာတွင် အမှိုက်ပုံတစ်ပုံကို ရွေးချယ်တင်သည်။ ပုံကို browser တွင် preview ပြပြီး AI စစ်ဆေးမှုအောင်မြင်မှ report ဆက်တင်နိုင်သည်။ ပုံ binary ကို PostgreSQL ထဲမသိမ်းဘဲ server-side `/api/report-images` မှတစ်ဆင့် Cloudinary သို့ upload လုပ်ပြီး secure URL ကိုသာ database တွင် သိမ်းသည်။

### အဆင့် ၂ — AI စစ်ဆေးခြင်း

`Verify Waste` ကိုနှိပ်သည့်အခါ—

```text
ပုံကို base64 data အဖြစ် ပြောင်းသည်
          ↓
POST /api/verify-waste သို့ ပို့သည်
          ↓
Server က GEMINI_API_KEY ဖြင့် Gemini 3.6 Flash ကိုခေါ်သည်
          ↓
အမှိုက်အမျိုးအစား၊ ခန့်မှန်းပမာဏနှင့် confidence ပြန်ရသည်
          ↓
Waste Type နှင့် Estimated Amount ကွက်များ အလိုအလျောက် ဖြည့်သည်
```

### အဆင့် ၃ — နေရာရွေးချယ်ခြင်း

အသုံးပြုသူသည် နေရာကို နည်းလမ်းနှစ်မျိုးဖြင့် ရွေးနိုင်သည်။

1. နေရာအမည် သို့မဟုတ် လိပ်စာကို ရိုက်ပြီး `Search` ကိုနှိပ်ကာ ရလဒ်တစ်ခုရွေးခြင်း
2. OpenStreetMap ကို pan/zoom လုပ်ပြီး မြေပုံပေါ်တွင် လိုချင်သည့်နေရာကို နှိပ်ကာ `Use selected point` ကိုနှိပ်ခြင်း

မြေပုံပေါ်မှ point ကိုရွေးသည့်အခါ latitude/longitude ကို Nominatim reverse geocoding ဖြင့် လိပ်စာအဖြစ် ပြောင်းသည်။

### အဆင့် ၄ — Report တင်သွင်းခြင်း

Report တင်ရန် အောက်ပါအချက်များ ပြည့်စုံရမည်။

- အသုံးပြုသူ အကောင့်ဝင်ထားရမည်။
- AI verification အောင်မြင်ထားရမည်။
- နေရာတစ်ခု ရှာဖွေရွေးချယ်ထားရမည်။

`Submit Report` ကိုနှိပ်သည့်အခါ အောက်ပါအတိုင်း ဆက်လက်လုပ်ဆောင်သည်။

```text
ပုံကို POST /api/report-images ဖြင့် Cloudinary သို့တင်သည်
          ↓
ရွေးချယ်ထားသော latitude/longitude အနီးရှိ report candidate များကိုရှာသည်
          ↓
Candidate ရှိလျှင် POST /api/detect-duplicate ဖြင့် Gemini ပုံနှိုင်းယှဉ်သည်
          ↓
createReport က report၊ ၁၀ မှတ်၊ transaction နှင့် notification ကိုသိမ်းသည်
          ↓
attachReportToWasteCase က report ကို case အသစ် သို့မဟုတ် ရှိပြီး case နှင့်ချိတ်သည်
```

အကွာအဝေးဖြင့် အရင်စစ်ပြီးနောက် Cloudinary URL မှန်ကန်သော candidate ပုံ အများဆုံး ၃ ပုံကိုသာ Gemini ဖြင့် နှိုင်းယှဉ်သည်။ တူညီသော physical waste pile ဖြစ်ကြောင်း ယုံကြည်ရလျှင် report အသစ်ကို ရှိပြီးသား `waste_cases` record နှင့် ချိတ်သည်။ မတူညီလျှင် case အသစ်ဖန်တီးသည်။

Report status သည် အစတွင် `pending` ဖြစ်သည်။

## ၈။ အမှိုက်စုဆောင်းခြင်း လုပ်ငန်းစဉ်

`/collect` စာမျက်နှာတွင် database ထဲရှိ report များကို collection task အဖြစ် list နှင့် map နှစ်မျိုးလုံးဖြင့် ပြသသည်။ Search၊ status filter နှင့် pagination ပါဝင်ပြီး confirmation count နှင့် case location ကိုလည်း ပြသည်။

### Task status များ

```text
pending → in_progress → verified
```

- `pending` — မည်သူမျှ မစတင်ရသေးသော task
- `in_progress` — collector တစ်ဦးက တာဝန်ယူထားသော task
- `verified` — စုဆောင်းပြီး AI ဖြင့် အတည်ပြုထားသော task

### စုဆောင်းပုံ

1. Collector က `Start Collection` ကိုနှိပ်သည်။
2. Task ကို အခြား collector မယူနိုင်စေရန် collector ID နှင့် `in_progress` status သိမ်းသည်။
3. စုဆောင်းပြီးနောက် `Complete & Verify` ကိုနှိပ်သည်။
4. စုဆောင်းပြီးသော အမှိုက်ပုံကို တင်သည်။
5. `Verify Collection` ကိုနှိပ်သည်။

မိမိကိုယ်တိုင်တင်ထားသော report ကို မိမိပြန်စုဆောင်း၍မရပါ။ System သည် waste type၊ priority နှင့် simulated team profile များအပေါ် rule-based score တွက်ပြီး သင့်လျော်သော collector team ကို အကြံပြုနိုင်သည်။ `/api/dispatch-explanation` သည် ထိုရွေးချယ်မှုကို Gemini ဖြင့် စာကြောင်းတိုရှင်းပြခြင်းသာ ပြုလုပ်ပြီး team ရွေးချယ်မှုကို AI က မပြောင်းလဲပါ။

Gemini သည် ပုံကို မူလ report ၏ waste type နှင့် amount တို့နှင့် နှိုင်းယှဉ်ပြီး အောက်ပါ JSON ရလဒ်ကို ပြန်ပေးသည်။

```json
{
  "wasteTypeMatch": true,
  "quantityMatch": true,
  "confidence": 0.85
}
```

အောက်ပါသတ်မှတ်ချက်များအားလုံး ပြည့်စုံမှ verification အောင်မြင်သည်။

- `wasteTypeMatch` သည် `true` ဖြစ်ရမည်။
- `quantityMatch` သည် `true` ဖြစ်ရမည်။
- `confidence` သည် `0.7` သို့မဟုတ် ထို့ထက်မြင့်ရမည်။

အောင်မြင်လျှင် task ကို `verified` ပြောင်းပြီး `collected_wastes` ဇယားထဲ မှတ်တမ်းတင်ကာ collector အား reward points ပေးသည်။

## ၉။ Reward နှင့် Leaderboard လုပ်ငန်းစဉ်

အသုံးပြုသူသည် အောက်ပါနည်းလမ်းများဖြင့် အမှတ်ရနိုင်သည်။

- အမှိုက် report တင်ခြင်း
- အမှိုက်စုဆောင်းပြီး verification အောင်မြင်ခြင်း

အမှတ်ပြောင်းလဲမှုတိုင်းကို `transactions` ဇယားတွင် မှတ်တမ်းတင်သည်။ Header တွင် လက်ရှိ balance ကိုပြပြီး `/rewards` တွင် reward အချက်အလက်များ၊ `/leaderboard` တွင် အသုံးပြုသူများ၏ အဆင့်များကို ကြည့်နိုင်သည်။

## ၁၀။ Notification လုပ်ငန်းစဉ်

Report တင်ခြင်း သို့မဟုတ် reward ရခြင်းကဲ့သို့ လုပ်ဆောင်ချက်များအတွက် notification ဖန်တီးသည်။ Header သည် မဖတ်ရသေးသော notification များကို အချိန်အပိုင်းအခြားအလိုက် ရယူသည်။ Notification တစ်ခုကိုနှိပ်လျှင် `isRead` ကို `true` ပြောင်းသည်။

## ၁၁။ PDF အစီရင်ခံစာ လုပ်ငန်းစဉ်

ဝန်ထမ်းအသုံးပြုသူသည် `/download` စာမျက်နှာမှ report အမျိုးအစားရွေးနိုင်သည်။

```text
Report အမျိုးအစားရွေးသည်
          ↓
GET /api/reports/download?type=... သို့ request ပို့သည်
          ↓
Drizzle ဖြင့် database aggregate query ပြုလုပ်သည်
          ↓
HTML table နှင့် chart ဖန်တီးသည်
          ↓
Puppeteer ဖြင့် PDF ပြောင်းသည်
          ↓
Browser က PDF ဖိုင် download လုပ်သည်
```

## ၁၂။ Database ဇယားများ

### `users`

အသုံးပြုသူ email၊ အမည်၊ role နှင့် ဖန်တီးသည့်ရက်ကို သိမ်းသည်။

### `reports`

အမှိုက်နေရာ၊ အမျိုးအစား၊ ပမာဏ၊ verification result၊ status၊ collector ID၊ case ID နှင့် Cloudinary image URL ကို သိမ်းသည်။

### `waste_cases`

Physical waste pile တစ်ခု၏ latitude၊ longitude၊ case status၊ created/updated/verified time တို့ကို သိမ်းသည်။ တူညီသောနေရာနှင့် ပုံဖြစ်ကြောင်း စစ်ဆေးထားသော report အများအပြားသည် case တစ်ခုတည်းကို အတည်ပြုနိုင်သည်။

### `rewards`

အသုံးပြုသူ၏ points၊ level၊ reward name နှင့် reward အချက်အလက်ကို သိမ်းသည်။

### `collected_wastes`

စစ်ဆေးအတည်ပြုပြီးသော collection report၊ collector နှင့် collection date ကို သိမ်းသည်။

### `notifications`

အသုံးပြုသူထံ ပို့မည့် message၊ type နှင့် ဖတ်ပြီး/မဖတ်ရသေး status ကို သိမ်းသည်။

### `transactions`

အမှတ်ရရှိခြင်းနှင့် သုံးစွဲခြင်းဆိုင်ရာ မှတ်တမ်းများကို သိမ်းသည်။

## ၁၃။ စနစ်တစ်ခုလုံး၏ ဒေတာစီးဆင်းပုံ

```text
Browser UI
   │
   ├── Web3Auth ──→ Google login / wallet session
   │
   ├── /api/verify-waste ──→ Gemini 3.6 Flash
   ├── /api/report-images ──→ Cloudinary
   ├── /api/detect-duplicate ──→ Gemini image comparison
   ├── /api/dispatch-explanation ──→ Gemini short explanation
   │
   ├── OpenStreetMap/Nominatim ──→ map, search, reverse geocoding
   │
   └── Next.js Server Actions
             │
             └── Drizzle ORM ──→ Neon PostgreSQL

Staff report request
   └── Next.js API route ──→ Database query ──→ Puppeteer ──→ PDF
```

## ၁၄။ စစ်ဆေးရန် command များ

Code style စစ်ဆေးရန်—

```bash
npm run lint
```

TypeScript စစ်ဆေးရန်—

```bash
npx tsc --noEmit
```

Tests များ run ရန်—

```bash
npx jest --runInBand
```

Production build စစ်ဆေးရန်—

```bash
npm run build
```

## ၁၅။ အရေးကြီးသော မှတ်ချက်များ

- Gemini key၊ database URL နှင့် အခြား secret များကို source code ထဲ မရေးရပါ။
- OpenStreetMap public Nominatim ကို autocomplete အဖြစ် request အဆက်မပြတ် မပို့ရပါ။ လက်ရှိစနစ်သည် အသုံးပြုသူက `Search` သို့မဟုတ် `Use selected point` ကိုနှိပ်မှသာ request ပို့သည်။
- OpenStreetMap attribution ကို မြေပုံပေါ်တွင် အမြဲပြထားရမည်။
- ပုံအပြည့်ကို database ထဲ မသိမ်းပါ။ လက်ရှိစနစ်သည် Cloudinary တွင်ပုံသိမ်းပြီး secure URL ကိုသာ database ထဲသိမ်းသည်။
- `db:push` ကို production database တွင် အသုံးပြုမီ schema ပြောင်းလဲမှုကို စစ်ဆေးသင့်သည်။

## ၁၆။ လက်ရှိအလုပ်လုပ်နေသော အခြေအနေ

လက်ရှိ codebase တွင် အောက်ပါအပိုင်းများ ချိတ်ဆက်ပြီး အလုပ်လုပ်ရန် implementation ပြီးစီးထားသည်။

- GreenNeighbor logo၊ navbar အမည်နှင့် Smart Waste Management System subtitle
- Responsive home၊ report၊ collect၊ rewards နှင့် leaderboard UI
- Web3Auth login၊ user creation၊ role အခြေပြု staff report menu
- Gemini report verification နှင့် collection verification
- Cloudinary report image upload
- OpenStreetMap search၊ browser geolocation၊ point picker နှင့် reverse geocoding
- Nearby duplicate candidate ရှာဖွေခြင်း၊ AI image comparison နှင့် waste-case grouping
- Collection task list/map၊ search/filter/pagination နှင့် collector recommendation
- Reward၊ transaction၊ redemption၊ notification နှင့် leaderboard
- Staff PDF report generation

Local validation အနေဖြင့် `npx tsc --noEmit` အောင်မြင်ပြီး Jest test ၄ ခုလုံး pass ဖြစ်သည်။ External service များကို runtime တွင် အမှန်တကယ်အသုံးပြုရန် `.env.local` ထဲတွင် Neon၊ Web3Auth၊ Gemini နှင့် Cloudinary credential အမှန်များရှိရမည်ဖြစ်ပြီး internet access လိုအပ်သည်။

လက်ရှိ automated tests များသည် PDF request validation နှင့် report-rendering helper များကို အဓိက cover လုပ်ထားသည်။ Authentication၊ Gemini၊ Cloudinary၊ map နှင့် end-to-end report/collection workflow များအတွက် integration သို့မဟုတ် E2E test coverage ကို ဆက်လက်တိုးချဲ့နိုင်သည်။
