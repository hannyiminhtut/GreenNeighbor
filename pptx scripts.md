# GreenNeighbor — PPTX Script

## Slide 1 — GreenNeighbor

**Smart Waste Management System**

- AI-verified reporting
- Community-powered collection
- Sponsor-funded rewards

**Presenter line:** GreenNeighbor turns visible waste into verified community action and measurable local impact.

---

## Slide 2 — Waste is a coordination problem

- Citizens see waste but lack a trusted reporting channel.
- Collectors need accurate locations and verified evidence.
- Cities need reliable data, accountability, and faster response.
- Businesses need credible ways to support visible community impact.

**Presenter line:** The missing link is not awareness—it is coordination between people, collectors, organizations, and sponsors.

---

## Slide 3 — Supporting statistics

- **2.56B tonnes** of municipal waste were generated globally in 2022.
- Waste could reach **3.86B tonnes by 2050**.
- **23%** of global waste goes uncollected.
- Municipal waste management already costs more than **US$250B annually**.

**Presenter line:** Waste volumes are growing faster than the systems and budgets responsible for managing them.

*Sources: World Bank, What a Waste 3.0; UNEP, Global Waste Management Outlook 2024.*

---

## Slide 4 — Our vision

**Clean neighborhoods where every waste report becomes coordinated action.**

- Citizens participate easily.
- Collectors receive trusted tasks.
- Sponsors fund meaningful rewards.
- Communities see measurable results.

---

## Slide 5 — Our mission

**Use AI, location intelligence, and incentives to make waste reporting and collection faster, trusted, and rewarding.**

- Verify reports before action.
- Connect waste with suitable collectors.
- Reward verified contributions.
- Build transparent environmental data.

---

## Slide 6 — Core values

- **Trust:** Verify evidence and preserve accountability.
- **Community:** Make every resident part of the solution.
- **Fairness:** Reward genuine, completed contributions.
- **Sustainability:** Prioritize lasting environmental value.
- **Transparency:** Make status and impact visible.
- **Inclusion:** Support citizens, independent collectors, and organizations.

---

## Slide 7 — The GreenNeighbor workflow

1. Citizen uploads a waste photo.
2. AI identifies waste type, amount, and confidence.
3. User confirms the location on OpenStreetMap.
4. Duplicate reports are grouped into one waste case.
5. A collector claims and completes the task.
6. AI verifies the completion photo.
7. Verified action earns reward points.

**Presenter line:** Points are earned only after traceable reporting or verified collection.

---

## Slide 8 — The novel idea

**Waste action becomes a local reward economy.**

- Useful behavior earns points.
- Points unlock sponsor-funded rewards.
- Sponsors gain responsible community visibility.
- Verified actions create trustworthy impact data.

**Presenter line:** GreenNeighbor connects environmental action, community participation, and local business sponsorship in one loop.

---

## Slide 9 — Sponsor-powered rewards

- Businesses publish offers: discounts, products, services, or vouchers.
- Users claim rewards using verified GreenNeighbor points.
- Sponsors are featured across appropriate website placements.
- Campaign dashboards show reach, claims, and supported impact.

**Guardrail:** Sponsorship never changes AI verification or collection priority.

---

## Slide 10 — Value for business sponsors

- Positive brand association with cleaner communities
- Local, measurable CSR participation
- Targeted exposure to active community members
- Foot traffic and customer acquisition through reward claims
- Campaign reporting instead of passive advertising

**Presenter line:** Sponsors fund action, receive visibility, and can measure community engagement.

---

## Slide 11 — Unique features

- AI waste-type and quantity verification
- AI comparison for duplicate report detection
- Shared waste cases for multiple confirmations
- Map-based reporting and collection
- Smart collector recommendations
- Completion-photo verification
- Real-time points, transactions, and notifications
- Sponsor-funded reward marketplace
- Staff PDF reporting

---

## Slide 12 — Intended users

- Residents and community volunteers
- Independent waste collectors
- Cleanup and recycling organizations
- Municipal and environmental staff
- Local businesses and corporate sponsors
- NGOs, schools, and community groups

---

## Slide 13 — Customer personas

**Mya — Community Reporter**

- Needs a fast, trustworthy way to report waste
- Wants progress updates and recognition

**Ko Aung — Independent Collector**

- Needs clear locations and verified tasks
- Wants fair points for completed work

**Thiri — Sponsor Manager**

- Needs visible, measurable local impact
- Wants controlled offers and campaign analytics

**U Min — City Officer**

- Needs reliable operational data and reports
- Wants faster response and accountability

---

## Slide 14 — User needs

- Simple onboarding and clear instructions
- Reliable photo and location capture
- Protection against duplicate or false claims
- Fair task claiming
- Immediate status and point updates
- Valuable, easy-to-claim rewards
- Privacy, safety, and transparent rules
- Accessible mobile-first design

---

## Slide 15 — Market segmentation

| Segment | Need | GreenNeighbor value |
|---|---|---|
| Urban communities | Faster cleanup | Reporting and tracking |
| Collectors | Trusted opportunities | Verified, mapped tasks |
| Municipalities | Operational visibility | Data and PDF reports |
| Sponsors | Measurable CSR | Reward campaigns and exposure |
| NGOs and schools | Engagement | Community challenges |
| Recycling partners | Sorted material leads | Waste-type intelligence |

---

## Slide 16 — Existing solutions

- Municipal complaint hotlines
- Social-media reporting groups
- General civic issue-reporting apps
- Recycling pickup platforms
- Commercial waste-management software
- Standalone loyalty and reward applications

**Gap:** Most solutions address reporting, collection, or rewards—but not the complete verified loop.

---

## Slide 17 — Competitor comparison

| Capability | Hotline/social media | Civic reporting app | Commercial waste tool | GreenNeighbor |
|---|:---:|:---:|:---:|:---:|
| Photo + location report | Partial | Yes | Yes | Yes |
| AI verification | No | Limited | Varies | Yes |
| Duplicate case grouping | No | Varies | Varies | Yes |
| Community collection | No | Limited | No | Yes |
| Verified reward points | No | No | No | Yes |
| Sponsor reward model | No | No | No | Planned |
| Staff analytics | Limited | Yes | Yes | Yes |

---

## Slide 18 — Our differentiation

- Verification before rewards
- One waste case instead of duplicated tasks
- Citizens and collectors in the same workflow
- AI assists decisions; application rules preserve control
- Sponsor value is tied to completed environmental action
- Designed for local communities and scalable partnerships

---

## Slide 19 — Technical architecture

```text
Responsive Next.js Web App
        │
        ├── Web3Auth → identity and roles
        ├── OpenStreetMap/Nominatim → location
        ├── Gemini → image verification and explanations
        ├── Cloudinary → report image storage
        └── Server Actions / API Routes
                    │
              Drizzle ORM
                    │
            Neon PostgreSQL
                    │
        Rewards · Cases · Reports · Transactions
```

---

## Slide 20 — Technologies used

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **UI:** Radix UI, Lucide icons
- **Authentication:** Web3Auth
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **AI:** Google Gemini
- **Maps:** Leaflet, React Leaflet, OpenStreetMap, Nominatim
- **Images:** Cloudinary
- **Reports:** Puppeteer PDF generation
- **Quality:** Jest and TypeScript validation

---

## Slide 21 — Development process

1. Define reporting and collection workflows.
2. Build authentication and database foundations.
3. Add AI image verification.
4. Add map search and precise location selection.
5. Add duplicate detection and waste cases.
6. Add collection verification and rewards.
7. Improve responsive UI and accessibility.
8. Test, measure, and iterate with users.

**Method:** Incremental delivery with working validation after each feature.

---

## Slide 22 — Required resources

- Product owner and community coordinator
- Full-stack developer
- UI/UX designer
- Data/AI engineer
- QA and security support
- Cloud infrastructure budget
- Sponsor and municipality partnership team
- Legal support for privacy, rewards, and advertising
- Pilot collectors and community volunteers

---

## Slide 23 — Business model

- Sponsor campaign packages
- Featured reward placements
- Municipal or organization subscriptions
- Analytics and impact-reporting plans
- CSR partnership programs
- White-label deployments for cities, campuses, and estates

**Principle:** Citizens do not pay to report waste or earn points.

---

## Slide 24 — Economic benefits

- Lower cost of finding and validating waste locations
- Better allocation of collection teams
- Reduced duplicate trips and reports
- New customer acquisition channel for sponsors
- Greater material recovery for recycling partners
- New earning and recognition opportunities for collectors
- Better evidence for municipal budgeting

---

## Slide 25 — Social impact

- Stronger neighborhood participation
- Faster response to visible waste
- Recognition for volunteers and collectors
- Better connection between citizens and service providers
- More inclusive access to environmental action
- Transparent evidence that reported issues were addressed

---

## Slide 26 — Environmental impact

- Reduced open dumping and litter accumulation
- Less waste entering drains and waterways
- Improved recycling through waste classification
- Faster removal of hazardous or high-priority waste
- Lower unnecessary travel through duplicate grouping
- Better data for prevention and circular-economy planning

---

## Slide 27 — Survey methodology

**Proposed pilot research — not yet completed**

- **Participants:** residents, collectors, organizations, staff, and sponsors
- **Sample target:** 100–200 residents; 20–30 collectors; 10–15 partners
- **Methods:** online survey, short interviews, usability tests, usage analytics
- **Pilot period:** 6–8 weeks
- **Measures:** reporting success, trust, response time, reward appeal, sponsor recall
- **Ethics:** informed consent, anonymous analysis, minimal personal data

---

## Slide 28 — User feedback framework

**Questions to validate**

- Was reporting easy to complete?
- Did users trust AI verification?
- Were task locations accurate?
- Were reward options valuable?
- Did points motivate repeat participation?
- Did sponsors feel the exposure was credible?
- What prevented task acceptance or completion?

**Collection points:** after report, after collection, after reward claim, and pilot exit.

---

## Slide 29 — Data analysis plan

- Funnel: report started → verified → submitted → collected
- Time: report-to-claim and claim-to-completion
- Quality: AI confidence and verification failure rate
- Duplication: reports merged per waste case
- Engagement: active users and repeat actions
- Rewards: points earned, redemption rate, reward preference
- Sponsors: impressions, claims, conversion, and repeat campaigns
- Equity: participation by area and user type

---

## Slide 30 — Key findings to validate

**Hypotheses—not completed study results**

- Verification increases trust in reports and rewards.
- Useful rewards increase repeat participation.
- Duplicate grouping reduces wasted collection effort.
- Clear locations improve collection completion.
- Sponsor-backed rewards create shared community and business value.
- Simple workflows outperform feature-heavy interfaces.

---

## Slide 31 — Long-term objectives

- Build a trusted citywide waste-action network.
- Grow a diverse sponsor reward marketplace.
- Integrate municipalities and professional collection teams.
- Predict waste hotspots and service demand.
- Support recycling and circular supply chains.
- Publish transparent community-impact dashboards.
- Expand to campuses, estates, townships, and new cities.

---

## Slide 32 — Future expansion

- Organization accounts and private task queues
- Automated assignment with accept/reject/expiry workflow
- Mobile applications and push notifications
- QR or voucher-based sponsor redemption
- Multilingual and accessibility support
- Route optimization
- IoT smart-bin integration
- Carbon and material-recovery estimates
- Regional sponsor and municipality networks

---

## Slide 33 — Expected outcomes

- More verified waste reports
- Faster collection response
- Higher completion accountability
- Greater community participation
- Increased reward redemption
- Measurable sponsor engagement
- Better waste-location and category data
- Cleaner, healthier neighborhoods

---

## Slide 34 — Future work

- Separate reward catalog and user balance records
- Add secure sponsor campaign management
- Add organization identity and role permissions
- Add transactional task assignment
- Expand automated and end-to-end tests
- Evaluate AI accuracy using reviewed datasets
- Add privacy, moderation, and fraud controls
- Run a measured community pilot

---

## Slide 35 — Lessons learned

- AI is strongest when paired with deterministic application rules.
- Verification must happen before points are awarded.
- One physical waste pile needs one shared case.
- Real-time balances require one authoritative source.
- Map usability and mobile layout directly affect completion.
- External AI services require retry and failure handling.
- Impact claims require measured pilot evidence—not assumptions.

---

## Slide 36 — The opportunity

**GreenNeighbor can turn every verified cleanup into three forms of value:**

- A cleaner neighborhood
- A rewarded community member
- A measurable sponsor contribution

**Closing ask:** Partner with GreenNeighbor for a pilot community, collection network, or sponsor reward campaign.

---

## Source notes

- World Bank. *What a Waste 3.0: Global Snapshot of Solid Waste Management toward Circularity until 2050.*
  https://www.worldbank.org/en/publication/what-a-waste
- UNEP. *Global Waste Management Outlook 2024.*
  https://www.unep.org/ietc/resources/report/global-waste-management-outlook-2024
- World Bank. *Clean Cities, Bright Futures.*
  https://www.worldbank.org/en/results/2025/04/30/clean-cities-bright-futures-accelerating-investment-and-reforms-in-solid-waste-management-in-developing-countries

## Evidence note

Survey results, user quotations, sponsor conversion, environmental outcomes, and
local market size must be replaced with measured pilot data before external
claims are made. The survey, feedback, analysis, and findings slides above are a
research plan and hypothesis set—not fabricated results.
