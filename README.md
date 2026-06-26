<p align="center">
  <a href="https://ocean.io" target="_blank">
    <img src="https://raw.githubusercontent.com/bcharleson/n8n-nodes-ocean/main/nodes/Ocean/ocean-logo.png" alt="Ocean.io" width="280" />
  </a>
</p>

<p align="center">
  <strong>Lookalike company &amp; people discovery for n8n</strong><br />
  Search, enrich, reveal, and normalize prospect data — directly inside your workflows.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/n8n-nodes-ocean"><img src="https://img.shields.io/npm/v/n8n-nodes-ocean.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-ocean"><img src="https://img.shields.io/npm/dm/n8n-nodes-ocean.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT license" /></a>
  <a href="https://docs.n8n.io/integrations/community-nodes/"><img src="https://img.shields.io/badge/n8n-community_node-FF6D5A?style=flat-square&logo=n8n&logoColor=white" alt="n8n community node" /></a>
</p>

---

## What is this?

**n8n-nodes-ocean** is a community node that connects [n8n](https://n8n.io) to the [Ocean.io](https://ocean.io) API.

[Ocean.io](https://ocean.io) specializes in **lookalike discovery** — finding companies and people similar to your best customers — plus **firmographic enrichment** and **contact reveal**. This node wraps those capabilities in a single, workflow-friendly **Ocean.io** node with clear helper text, dropdown filters, and patterns built for real automation (CRM sync, lead enrichment, outbound prospecting).

> **Install:** `n8n-nodes-ocean` on npm · **Node name in n8n:** `Ocean.io`

---

## Why use it?

| Use case | What you do in n8n |
| --- | --- |
| **Find lookalike companies** | Search from seed domains (e.g. `stripe.com`) with country, industry, and size filters |
| **Enrich a lead or account** | Look up a company by domain or a person by name, email, or LinkedIn |
| **Build prospect lists** | Search people by job title, company domain, and country |
| **Fix messy CRM data** | Autocomplete company names, titles, and locations before a paid search |
| **Get verified contact info** | Reveal work emails or phone numbers for people already found in Ocean |
| **Guard credit spend** | Check balance before large runs; warmup domains for bulk jobs |

Built for **backend automation** — not just API coverage. Every resource includes in-node guidance, sensible defaults, and execute-time validation so workflows fail clearly instead of silently.

---

## Operations overview

**14 operations** across **5 resources**:

| Resource | Operations | Best for |
| --- | --- | --- |
| **Company** | Search Companies, Enrich Company | Lookalike discovery & firmographics |
| **Person** | Search People, Enrich Person | Prospect lists & lead enrichment |
| **Reveal** | Reveal Emails, Reveal Phones | Verified contact discovery (async) |
| **Autocomplete** | Companies, Job Titles, Keywords, Skills, Locations | Normalizing messy input before Search/Enrich |
| **Other** | Get Credit Balance, Get Data Fields, Warmup Companies | Ops, reference data & performance prep |

---

## Installation

### n8n (recommended)

1. Open **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-ocean`
4. Confirm and **restart n8n**

[Official n8n community node install guide →](https://docs.n8n.io/integrations/community-nodes/installation/)

### Self-hosted / manual

```bash
npm install n8n-nodes-ocean
```

Set `N8N_CUSTOM_EXTENSIONS` to include the package path, then restart n8n.

---

## Authentication

1. Get an API key from [Ocean.io → Settings → API Keys](https://app.ocean.io/)
2. In n8n, add credentials of type **Ocean.io API**
3. Paste your key and click **Test** (calls `GET /v2/credits/balance`)

---

## Resources & operations

### Company

#### Search Companies
Find companies similar to your seed domains — Ocean's core lookalike engine.

- **Lookalike Domains** — comma-separated domains (e.g. `topoffunnel.com, stripe.com`); URLs normalized automatically
- **Countries & Industries** — searchable dropdowns loaded from Ocean's data fields
- **Employee count** — min/max filters
- **Companies Filters JSON** — optional advanced filters

#### Enrich Company
Look up one company by website domain (e.g. `stripe.com`). Accepts full URLs — `https` and `www` are stripped automatically.

---

### Person

#### Search People
Build lists of prospects with filters that map to Ocean's v3 people search.

- **Job Titles**, **Company Domains**, **Countries**
- **Lookalike People** — LinkedIn handles for similarity search
- **People Filters JSON** / **Companies Filters JSON** — advanced filters

#### Enrich Person
Look up one person. Provide **at least one** identifier:

- LinkedIn URL
- Email
- Full name
- First name + last name

**Tip:** Name + work email (e.g. `Brandon Charleson` + `brandon@company.com`) works well for lead enrichment.

---

### Reveal

Discover **verified** work emails or phone numbers for people you already found via Search or Enrich.

> **Important:** Reveal is **asynchronous**. The node returns `{ "status": "in progress" }` immediately. Ocean delivers results to your **Webhook URL** when ready.

**Requirements:**
- **Ocean person IDs** from Search People or Enrich Person (`id` field in output)
- **Webhook URL** — for in-workflow delivery, use `{{ $execution.resumeUrl }}` and add a **Wait** node (mode: *On Webhook Call*) after Reveal

**Account note:** Reveal requires email/phone verification to be enabled on your Ocean.io organization. If disabled, the API returns `403`.

---

### Autocomplete

Cheap, synchronous lookup to fix spelling before Search or Enrich.

| Operation | Returns | Typical next step |
| --- | --- | --- |
| **Companies** | Name + domain suggestions | Enrich Company or Lookalike Domains |
| **Job Titles** | Title strings | Search People → Job Titles |
| **Keywords** | Keyword strings | Companies Filters JSON |
| **Skills** | Skill strings | People Filters JSON |
| **Locations** | City/region strings | Location filters |

**Cost:** 0.1 credits per call (flat, not per suggestion). Does not return full profiles or contact info.

---

### Other

| Operation | Cost | Purpose |
| --- | --- | --- |
| **Get Credit Balance** | Free | Check standard, email, and phone credit pools |
| **Get Data Fields** | Free | Raw lists (industries, countries, etc.) — most users rely on in-node dropdowns instead |
| **Warmup Companies** | Free | Pre-load domains before bulk search/enrich |

---

## Example workflows

### Lookalike company discovery
```
Manual Trigger → Ocean.io (Company → Search Companies)
  Lookalike Domains: topoffunnel.com
  Limit: 25
→ Spreadsheet / CRM / Slack
```

### CRM lead enrichment
```
HubSpot Trigger → Ocean.io (Person → Enrich Person)
  Person Name: {{ $json.firstname }} {{ $json.lastname }}
  Email: {{ $json.email }}
→ HubSpot (update contact)
```

### Normalize then enrich
```
Google Sheets → Ocean.io (Autocomplete → Companies)
  Query: {{ $json.companyName }}
→ Set (pick best domain) → Ocean.io (Company → Enrich Company)
```

### Search → reveal email (async)
```
Ocean.io (Person → Search People) → Ocean.io (Reveal → Reveal Emails)
  Ocean Person IDs: {{ $json.id }}
  Webhook URL: {{ $execution.resumeUrl }}
→ Wait (On Webhook Call) → CRM / sequencer
```

---

## Credit costs

Rates below reflect Ocean.io's [v3 unified credit model](https://app.ocean.io/docs/getting-started/credits). Check your plan if you're on enterprise/legacy pricing.

| Operation | Cost |
| --- | --- |
| Search Companies | 0.2 credits / company returned |
| Search People | 0.2 credits / person returned |
| Enrich Company | 0.1 credits / result |
| Enrich Person | 0.1 credits / result |
| Autocomplete (all types) | 0.1 credits / call |
| Reveal Emails | 1 credit / email **found** |
| Reveal Phones | 10 credits / phone **found** |
| Get Credit Balance | Free |
| Get Data Fields | Free |
| Warmup Companies | Free |

Use **Other → Get Credit Balance** before large batch runs.

---

## Developer setup

```bash
git clone https://github.com/bcharleson/n8n-nodes-ocean.git
cd n8n-nodes-ocean
npm install
npm run dev:full          # local n8n at http://localhost:5678
npm run verify:audit      # build + package checks + n8n-node lint
OCEAN_API_TOKEN=xxx npm run verify:e2e   # live API smoke test (optional)
```

---

## Error handling

The node surfaces clear errors for common Ocean API responses:

- Insufficient credits (`402`)
- Invalid or missing API key (`403`)
- Validation errors (`422`)
- Reveal not enabled on account (`403`)

Enable **Continue on Fail** on the node to capture errors per item instead of stopping the workflow.

Ocean.io rate limit: **300 requests/minute**.

---

## Links

| | |
| --- | --- |
| **npm** | https://www.npmjs.com/package/n8n-nodes-ocean |
| **GitHub** | https://github.com/bcharleson/n8n-nodes-ocean |
| **Ocean.io API docs** | https://docs.ocean.io/ |
| **Ocean.io dashboard** | https://app.ocean.io/ |
| **n8n community nodes** | https://docs.n8n.io/integrations/community-nodes/ |
| **Report an issue** | https://github.com/bcharleson/n8n-nodes-ocean/issues |

---

## License

[MIT](LICENSE.md)

## Support

- **This node:** [Open a GitHub issue](https://github.com/bcharleson/n8n-nodes-ocean/issues)
- **Ocean.io API:** [Ocean.io support](https://ocean.io/support)
