# UTM Tracking Guide — Startup Anthology

A practical guide for creating, using, and tracking UTM parameters across all your marketing channels.

---

## Table of Contents

1. [What Are UTMs and Why They Matter](#1-what-are-utms-and-why-they-matter)
2. [The 5 UTM Parameters Explained](#2-the-5-utm-parameters-explained)
3. [Startup Anthology Naming Convention](#3-startup-anthology-naming-convention)
4. [How to Build UTM URLs](#4-how-to-build-utm-urls)
5. [UTM Tracking Spreadsheet Template](#5-utm-tracking-spreadsheet-template)
6. [Setting Up Google Analytics (GA4) to Read UTMs](#6-setting-up-google-analytics-ga4-to-read-utms)
7. [Best Practices and Common Mistakes](#7-best-practices-and-common-mistakes)
8. [Quick Reference Cheat Sheet](#8-quick-reference-cheat-sheet)

---

## 1. What Are UTMs and Why They Matter

**UTM parameters** (Urchin Tracking Module) are tags you add to the end of a URL. When someone clicks a UTM-tagged link, those tags are sent to your analytics tool (like Google Analytics), telling you exactly where that visitor came from and what campaign brought them.

**Example:**

```
https://startupanthology.com/guides/fundraising?utm_source=linkedin&utm_medium=social&utm_campaign=2026-q2-fundraising-guide
```

Without UTMs, your analytics shows traffic as "direct" or "organic" with no way to know which specific post, email, or ad drove the visit. With UTMs, you can answer:

- Which social platform drives the most traffic?
- Which email campaign had the best click-through rate?
- Is podcast promotion worth the effort?
- Which ad creative is performing better?

**Bottom line:** UTMs turn vague traffic data into actionable marketing intelligence. If you're creating content with the Marketing Content Suite, UTMs are how you measure whether that content is actually working.

---

## 2. The 5 UTM Parameters Explained

Every UTM-tagged URL can include up to five parameters. The first three are **required**; the last two are **optional**.

| Parameter | Purpose | Example Value |
|---|---|---|
| `utm_source` | **Where** the traffic comes from — the specific platform or sender | `linkedin`, `newsletter`, `google`, `podcast-show-notes` |
| `utm_medium` | **How** the traffic arrives — the marketing channel type | `social`, `email`, `paid`, `referral`, `cpc` |
| `utm_campaign` | **Why** — the specific campaign or promotion name | `2026-q2-fundraising-guide`, `welcome-series` |
| `utm_term` | The paid search keyword (optional) | `startup-funding`, `saas-metrics` |
| `utm_content` | Differentiates similar links — useful for A/B testing (optional) | `header-cta`, `footer-link`, `variant-b` |

### How They Work Together

Think of it as answering a chain of questions:

```
utm_source  → "Where did this visitor come from?"     → linkedin
utm_medium  → "What type of channel was it?"           → social
utm_campaign → "What campaign brought them?"           → 2026-q2-fundraising-guide
utm_term    → "What keyword triggered this?" (paid)    → startup-funding
utm_content → "Which specific link did they click?"    → carousel-slide-3
```

---

## 3. Startup Anthology Naming Convention

Consistent naming is the single most important factor in useful UTM data. One team member using `LinkedIn` while another uses `linkedin` or `li` creates fragmented, unreliable reports.

### Rules

| Rule | Do | Don't |
|---|---|---|
| Always lowercase | `linkedin` | `LinkedIn`, `LINKEDIN` |
| Use hyphens for spaces | `welcome-series` | `welcome_series`, `welcome series`, `welcomeseries` |
| No special characters | `2026-q2-launch` | `2026/Q2_launch!` |
| Be specific but concise | `podcast-ep-12` | `p12`, `the-twelfth-episode-of-our-podcast` |
| Use dates in campaigns | `2026-q2-fundraising-guide` | `fundraising-guide` (when did it run?) |

### Approved Source Values

Use these exact values for `utm_source`:

| Source Value | When to Use |
|---|---|
| `linkedin` | LinkedIn posts, articles, DMs |
| `twitter` | Twitter/X posts, threads |
| `instagram` | Instagram posts, stories, reels |
| `facebook` | Facebook posts, groups |
| `threads` | Threads posts |
| `youtube` | YouTube descriptions, cards |
| `tiktok` | TikTok videos, bio links |
| `newsletter` | Startup Anthology email newsletter |
| `email-sequence` | Automated email drip campaigns |
| `google` | Google Ads |
| `podcast` | Podcast show notes, episode descriptions |
| `blog` | Blog post CTAs, cross-links from other blogs |
| `partner-{name}` | Partner/affiliate referrals (e.g., `partner-techcrunch`) |
| `qr-code` | Physical or digital QR codes |
| `direct-outreach` | Cold emails, DMs sent individually |

### Approved Medium Values

Use these exact values for `utm_medium`:

| Medium Value | When to Use |
|---|---|
| `social` | Organic social media posts |
| `paid-social` | Paid/boosted social media posts |
| `email` | Newsletters and email campaigns |
| `cpc` | Cost-per-click ads (Google Ads, etc.) |
| `paid` | Other paid advertising (display, sponsorships) |
| `referral` | Partner links, guest posts, mentions |
| `audio` | Podcast mentions, audio ads |
| `video` | YouTube, video ads |
| `organic` | SEO-driven content |
| `qr` | QR code scans |

### Campaign Naming Format

Use this pattern for all campaign names:

```
{year}-{quarter}-{descriptive-name}
```

**Examples:**
- `2026-q2-fundraising-guide`
- `2026-q2-product-launch`
- `2026-q3-podcast-season-2`
- `2026-q1-welcome-series`
- `2026-annual-brand-awareness`

For evergreen campaigns that aren't tied to a quarter, use:
```
{year}-evergreen-{descriptive-name}
```

Example: `2026-evergreen-homepage-traffic`

---

## 4. How to Build UTM URLs

### Anatomy of a UTM URL

```
https://startupanthology.com/your-page
?utm_source=linkedin
&utm_medium=social
&utm_campaign=2026-q2-fundraising-guide
&utm_content=carousel-slide-3
```

The `?` starts the parameters. Each additional parameter is joined with `&`. Spaces are not allowed anywhere in the URL.

### Option A: Build Manually

1. Start with your destination URL: `https://startupanthology.com/guides/fundraising`
2. Add `?` after the URL
3. Add each parameter as `key=value`, joined by `&`
4. Result: `https://startupanthology.com/guides/fundraising?utm_source=linkedin&utm_medium=social&utm_campaign=2026-q2-fundraising-guide`

### Option B: Use Google's Campaign URL Builder

Google provides a free tool that builds UTM URLs for you:

1. Go to the **Google Analytics Campaign URL Builder** (search "GA4 Campaign URL Builder")
2. Fill in the fields:
   - **Website URL:** `https://startupanthology.com/guides/fundraising`
   - **Campaign source:** `linkedin`
   - **Campaign medium:** `social`
   - **Campaign name:** `2026-q2-fundraising-guide`
   - **Campaign content:** `carousel-slide-3` (optional)
3. Copy the generated URL
4. Shorten it using a link shortener (Bitly, Short.io, etc.) for cleaner sharing

### Ready-to-Use Examples by Content Type

#### Social Media Posts

**LinkedIn organic post promoting a guide:**
```
https://startupanthology.com/guides/fundraising?utm_source=linkedin&utm_medium=social&utm_campaign=2026-q2-fundraising-guide&utm_content=post-april-3
```

**Twitter/X thread with CTA:**
```
https://startupanthology.com/guides/fundraising?utm_source=twitter&utm_medium=social&utm_campaign=2026-q2-fundraising-guide&utm_content=thread-cta
```

**Instagram bio link:**
```
https://startupanthology.com/guides/fundraising?utm_source=instagram&utm_medium=social&utm_campaign=2026-q2-fundraising-guide&utm_content=bio-link
```

**Facebook group share:**
```
https://startupanthology.com/guides/fundraising?utm_source=facebook&utm_medium=social&utm_campaign=2026-q2-fundraising-guide&utm_content=group-post
```

#### Email Newsletters

**Weekly newsletter feature:**
```
https://startupanthology.com/guides/fundraising?utm_source=newsletter&utm_medium=email&utm_campaign=2026-q2-fundraising-guide&utm_content=featured-article
```

**Welcome email sequence (email 3 of 5):**
```
https://startupanthology.com/guides/fundraising?utm_source=email-sequence&utm_medium=email&utm_campaign=2026-q1-welcome-series&utm_content=email-3-cta
```

#### Podcast Promotion

**Show notes link for Episode 12:**
```
https://startupanthology.com/guides/fundraising?utm_source=podcast&utm_medium=audio&utm_campaign=2026-q2-podcast-ep-12&utm_content=show-notes
```

**Verbal CTA (use a short link that redirects to this):**
```
https://startupanthology.com/guides/fundraising?utm_source=podcast&utm_medium=audio&utm_campaign=2026-q2-podcast-ep-12&utm_content=verbal-cta
```

#### Ad Creatives

**LinkedIn paid ad — version A:**
```
https://startupanthology.com/guides/fundraising?utm_source=linkedin&utm_medium=paid-social&utm_campaign=2026-q2-fundraising-guide&utm_content=ad-version-a
```

**LinkedIn paid ad — version B (A/B test):**
```
https://startupanthology.com/guides/fundraising?utm_source=linkedin&utm_medium=paid-social&utm_campaign=2026-q2-fundraising-guide&utm_content=ad-version-b
```

**Google Search Ad:**
```
https://startupanthology.com/guides/fundraising?utm_source=google&utm_medium=cpc&utm_campaign=2026-q2-fundraising-guide&utm_term=startup-fundraising-tips
```

#### Blog and SEO Content

**CTA within a guest blog post:**
```
https://startupanthology.com/guides/fundraising?utm_source=partner-techblog&utm_medium=referral&utm_campaign=2026-q2-guest-posts&utm_content=in-article-cta
```

#### Partner and Referral Links

**Affiliate partner link:**
```
https://startupanthology.com/guides/fundraising?utm_source=partner-founderhub&utm_medium=referral&utm_campaign=2026-q2-partner-program&utm_content=sidebar-banner
```

#### QR Codes

**QR code on a business card:**
```
https://startupanthology.com?utm_source=qr-code&utm_medium=qr&utm_campaign=2026-evergreen-business-card&utm_content=personal-card
```

**QR code at a conference booth:**
```
https://startupanthology.com/demo?utm_source=qr-code&utm_medium=qr&utm_campaign=2026-q2-saastr-conference&utm_content=booth-banner
```

---

## 5. UTM Tracking Spreadsheet Template

Maintain a master spreadsheet to log every UTM link you create. This prevents duplicates, ensures consistency, and gives you a single place to review all active campaigns.

### Template Columns

| Date Created | Campaign | Source | Medium | Content | Term | Destination URL | Full UTM URL | Short URL | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-04-03 | 2026-q2-fundraising-guide | linkedin | social | post-april-3 | — | /guides/fundraising | (full URL) | bit.ly/sa-fg | Jane | Active | Launch day post |
| 2026-04-03 | 2026-q2-fundraising-guide | twitter | social | thread-cta | — | /guides/fundraising | (full URL) | bit.ly/sa-fg2 | Jane | Active | 5-part thread |
| 2026-04-03 | 2026-q2-fundraising-guide | newsletter | email | featured-article | — | /guides/fundraising | (full URL) | — | Mike | Scheduled | Goes out April 7 |
| 2026-04-03 | 2026-q2-fundraising-guide | linkedin | paid-social | ad-version-a | — | /guides/fundraising | (full URL) | — | Jane | Active | $50/day budget |
| 2026-04-03 | 2026-q2-fundraising-guide | linkedin | paid-social | ad-version-b | — | /guides/fundraising | (full URL) | — | Jane | Active | A/B test variant |
| 2026-04-10 | 2026-q2-podcast-ep-12 | podcast | audio | show-notes | — | /guides/fundraising | (full URL) | bit.ly/sa-ep12 | Mike | Draft | Episode records April 8 |
| 2026-04-15 | 2026-q2-fundraising-guide | google | cpc | — | startup-fundraising-tips | /guides/fundraising | (full URL) | — | Jane | Active | Google Ads campaign |

### Column Definitions

- **Date Created** — When the UTM link was created
- **Campaign** — The `utm_campaign` value
- **Source** — The `utm_source` value
- **Medium** — The `utm_medium` value
- **Content** — The `utm_content` value (leave blank if not used)
- **Term** — The `utm_term` value (leave blank if not used)
- **Destination URL** — The page path without UTM parameters
- **Full UTM URL** — The complete URL with all UTM parameters
- **Short URL** — Shortened version for sharing (Bitly, Short.io, etc.)
- **Owner** — Team member responsible for this link
- **Status** — `Draft`, `Active`, `Paused`, `Completed`
- **Notes** — Any additional context (budget, schedule, A/B test details)

### Tips for Spreadsheet Management

- **One spreadsheet per quarter** or use tabs/sheets for each quarter
- **Color-code by status:** green = active, yellow = scheduled, gray = completed
- **Review weekly:** mark completed campaigns, archive old ones
- **Share with your team** so everyone uses the same naming conventions

---

## 6. Setting Up Google Analytics (GA4) to Read UTMs

UTM parameters are automatically read by Google Analytics — no special configuration needed for the parameters themselves. You just need GA4 installed on your site.

### Setup Checklist

- [ ] Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
- [ ] Install the GA4 tracking code on your website (via Google Tag Manager or direct script tag)
- [ ] Verify data is flowing by visiting your site and checking the GA4 Realtime report
- [ ] Ensure your site's domain matches what you use in UTM URLs

### Where to Find UTM Data in GA4

1. **Traffic Acquisition Report**
   - Navigate to: **Reports > Acquisition > Traffic acquisition**
   - This shows sessions grouped by channel. Click on a channel group to drill down
   - Use the dropdown to change the primary dimension to:
     - **Session source** (shows `utm_source` values)
     - **Session medium** (shows `utm_medium` values)
     - **Session campaign** (shows `utm_campaign` values)
     - **Session source/medium** (shows combined view)

2. **Explorations (Custom Reports)**
   - Navigate to: **Explore > Blank exploration**
   - Add dimensions: Session source, Session medium, Session campaign, Session manual ad content (utm_content)
   - Add metrics: Sessions, Engaged sessions, Conversions, Engagement rate
   - Build a table to see exactly which UTM combinations drive the best results

### Creating a UTM Performance Report

Build this custom exploration for a campaign-level performance overview:

| Dimension | Maps To |
|---|---|
| Session campaign | `utm_campaign` |
| Session source | `utm_source` |
| Session medium | `utm_medium` |
| Session manual ad content | `utm_content` |
| Session manual term | `utm_term` |

**Recommended metrics to track:**
- **Sessions** — How many visits came from each UTM
- **Engaged sessions** — Visits where the user actually interacted
- **Engagement rate** — Percentage of sessions that were engaged
- **Average engagement time** — How long visitors stayed
- **Conversions** — Goal completions (sign-ups, downloads, purchases)
- **Conversion rate** — Percentage of sessions that converted

---

## 7. Best Practices and Common Mistakes

### Do

- **Be consistent** — Always use the approved naming convention from Section 3
- **Use lowercase everything** — `linkedin` not `LinkedIn` (GA4 is case-sensitive)
- **Document every link** — Add it to the tracking spreadsheet before sharing
- **Use link shorteners** — Long UTM URLs look messy in social posts; shorten them with Bitly or Short.io
- **Test your links** — Click every UTM link before publishing to make sure it goes to the right page
- **Use `utm_content` for A/B tests** — This is the easiest way to compare two versions of the same ad or post
- **Review data weekly** — Check your GA4 reports to see what's working and adjust your strategy
- **Archive old campaigns** — Mark completed campaigns in your spreadsheet so the tracker stays clean

### Don't

- **Don't use UTMs on internal links** — UTMs are for external traffic sources only. Using them on links within your own site (e.g., nav menu, footer links) will overwrite the original source data and make your reports inaccurate
- **Don't use spaces** — Use hyphens instead. Spaces become `%20` in URLs and break some tools
- **Don't use inconsistent names** — `linkedin` and `LinkedIn` show up as two separate sources in GA4
- **Don't put personal information in UTMs** — UTM values are visible in the URL bar and in analytics. Never include email addresses, names, or user IDs
- **Don't skip the campaign parameter** — Without `utm_campaign`, you can see where traffic came from but not which campaign drove it
- **Don't forget to shorten URLs for social** — A raw UTM URL in a tweet looks unprofessional and takes up character count
- **Don't reuse campaign names across years** — Always include the year and quarter so you can compare performance over time

---

## 8. Quick Reference Cheat Sheet

### UTM Parameters at a Glance

| Parameter | Required? | Question It Answers | Example |
|---|---|---|---|
| `utm_source` | Yes | Where did they come from? | `linkedin` |
| `utm_medium` | Yes | What channel type? | `social` |
| `utm_campaign` | Yes | Which campaign? | `2026-q2-fundraising-guide` |
| `utm_term` | No | What keyword? (paid search) | `startup-funding` |
| `utm_content` | No | Which link/variant? | `header-cta` |

### Quick Reference by Channel

| Channel | Source | Medium | Example Content |
|---|---|---|---|
| LinkedIn (organic) | `linkedin` | `social` | `post-april-3`, `article-cta` |
| LinkedIn (paid) | `linkedin` | `paid-social` | `ad-version-a`, `carousel-v2` |
| Twitter/X | `twitter` | `social` | `thread-cta`, `quote-tweet` |
| Instagram | `instagram` | `social` | `bio-link`, `story-swipeup` |
| Facebook | `facebook` | `social` | `group-post`, `page-share` |
| Email Newsletter | `newsletter` | `email` | `featured-article`, `sidebar-ad` |
| Email Sequence | `email-sequence` | `email` | `email-3-cta`, `welcome-final` |
| Podcast | `podcast` | `audio` | `show-notes`, `verbal-cta` |
| Google Ads | `google` | `cpc` | — (use `utm_term` for keywords) |
| Guest Blog | `partner-{name}` | `referral` | `in-article-cta`, `author-bio` |
| QR Code | `qr-code` | `qr` | `business-card`, `booth-banner` |
| YouTube | `youtube` | `video` | `description-link`, `end-card` |

### URL Template

Copy and customize:

```
https://startupanthology.com/YOUR-PAGE?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=YEAR-QUARTER-NAME&utm_content=CONTENT
```

---

*Last updated: 2026-04-03 | Startup Anthology Marketing Team*
