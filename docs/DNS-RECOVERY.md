# ⛔ URGENT — DNS records dropped in the 26 July 2026 nameserver move

**Status: five records are missing right now. Email is partially broken.**

When the nameservers for `tinyhomesa.com` were switched to Hostinger
(`artemis.dns-parking.com` / `hermes.dns-parking.com`) on **2026-07-26 at 05:21 UTC**,
Hostinger rebuilt the DNS zone from a scan of the old one. It copied most records but
**silently dropped five**. This has nothing to do with the website migration — it is a
live fault that needs fixing today.

Verified 2026-07-26 by querying Hostinger's nameservers, xneelo's old nameservers, and
public resolvers (8.8.8.8, 1.1.1.1) directly.

---

## What is broken

| Record | Old xneelo zone | Hostinger zone now | Public DNS now |
|---|---|---|---|
| `smtp.tinyhomesa.com` | `CNAME mail.tinyhomesa.com` | **MISSING** | NXDOMAIN |
| `imap.tinyhomesa.com` | `CNAME mail.tinyhomesa.com` | **MISSING** | NXDOMAIN |
| `pop.tinyhomesa.com` | `CNAME mail.tinyhomesa.com` | **MISSING** | NXDOMAIN |
| `relay.tinyhomesa.com` | `CNAME mail.tinyhomesa.com` | **MISSING** | NXDOMAIN |
| `xneelo._domainkey.tinyhomesa.com` | `TXT` (DKIM key) | **MISSING** | NXDOMAIN |

### Real-world impact

1. **Mail apps cannot connect.** xneelo's documented settings use
   `smtp.tinyhomesa.com` and `imap.tinyhomesa.com`. Any phone or desktop mail client
   configured that way can no longer resolve the server, so it cannot send or fetch mail.
   The blast radius is still growing as the old 7200-second (2 hour) DNS caches expire.

2. **Outbound email is no longer signed.** xneelo signs mail with DKIM selector `xneelo`.
   The public key is gone from DNS, so every message from `admin@tinyhomesa.com` now
   **fails DKIM verification** at Gmail, Outlook and Yahoo.

   This compounds badly: the SPF record ends in `?all` (neutral — receivers treat it the
   same as having no SPF at all, per RFC 7208 §8.5), and there is **no DMARC record**.
   So outbound mail currently has *no* passing authentication of any kind. Expect a
   rising spam-folder rate.

3. **Inbound mail is still fine.** `MX 10 mail.tinyhomesa.com` → `196.22.142.128` is
   intact, so mail is still arriving on the xneelo server. This is the reason the problem
   is easy to miss — mail keeps landing while sending quietly degrades.

---

## Fix — add these 5 records in hPanel

**Domains → tinyhomesa.com → DNS / Nameservers → DNS Zone Editor.**
Add records manually. Do **not** use any "import", "replace" or "reset to defaults" option.

### 1–4: the four mail hostname aliases

| Type | Name | Points to | TTL |
|---|---|---|---|
| CNAME | `smtp` | `mail.tinyhomesa.com` | 3600 |
| CNAME | `imap` | `mail.tinyhomesa.com` | 3600 |
| CNAME | `pop` | `mail.tinyhomesa.com` | 3600 |
| CNAME | `relay` | `mail.tinyhomesa.com` | 3600 |

Some panels want a trailing dot (`mail.tinyhomesa.com.`). If Hostinger's editor rejects
one form, try the other.

### 5: the DKIM key

| Type | Name | TTL |
|---|---|---|
| TXT | `xneelo._domainkey` | 3600 |

Value — **paste as one single unbroken line**, no spaces or line breaks inserted:

```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1svT+LcCIQjuf9Aamq1VMAgPQbAaTeu05P+xkLg9mmrcUNVw3HKPJ4oFr0Kw4khpxQ1jgJlj63EsebTA9MMhRIH+wS8w43lu1fY7VAFnrV2CfZSutZqeOK8vj/IKSaCUAVzKJwcE9Uu26Zv7dJyK43W3rR7YBrR70EWOEIj5/5sRcyASBJKxJbqv+48mLzWSQcCCjGcf4+EvQFziP2WCYRlbJdbrTnQ2RkhRjxMRvoa08vm0yxZo/gFCBYr4GdKzYLdpyemH6sFqhPxbW+YEUZ+BjLpIejUdBaKotjsA9e+UAaXPj2JwFyhYD6M6aYzYr1S5MvKz0A8rQ/swjRtRrwIDAQAB;
```

> **Why this matters and why it's time-critical:** this key was recovered from xneelo's
> old nameservers, which are still answering with stale zone data. They will stop
> eventually. Once they do, this key is unrecoverable from DNS — you would have to get it
> reissued by xneelo. It is captured here so that cannot happen.
>
> A DKIM TXT record longer than 255 characters is split into chunks in `dig` output. That
> is a DNS transport detail, not part of the value. The string above is already
> reassembled — paste it as-is.

---

## Verify after adding (wait ~5 minutes)

```bash
dig +short smtp.tinyhomesa.com          # expect: mail.tinyhomesa.com. then 196.22.142.128
dig +short imap.tinyhomesa.com          # same
dig +short pop.tinyhomesa.com           # same
dig +short relay.tinyhomesa.com         # same
dig +short xneelo._domainkey.tinyhomesa.com TXT   # expect the DKIM key
```

Then send a test message from `admin@tinyhomesa.com` to a Gmail address. In Gmail open
**⋮ → Show original** and confirm `DKIM: 'PASS'`.

---

## Records that are correct — do not touch

| Type | Name | Value |
|---|---|---|
| A | `@` | `196.22.142.128` |
| A | `www` | `196.22.142.128` |
| A | `mail` | `196.22.142.128` |
| MX | `@` | `10 mail.tinyhomesa.com` |
| TXT | `@` | `v=spf1 mx a include:spf.host-h.net ?all` |
| TXT | `@` | `google-site-verification=bphUYZJV8eW2_fmxPFJxLwk3s7Vmj4mrUgrV6nJg9eE` |
| TXT | `@` | `google-site-verification=idTj4ClG2ABK6SIso3w9ux9zDYTQnnhhgtyzJsrVXQA` |
| CNAME | `ftp` | `www.tinyhomesa.com` |

⚠️ **`MX` and `mail` are what keep email working.** Never delete them, and never let a
Hostinger wizard "configure email records for you" — that replaces the MX with Hostinger's
own mail servers and inbound mail stops instantly.

⚠️ **`ftp` follows `www`.** It is a CNAME to `www.tinyhomesa.com`, so when `www` is
repointed to the new site at cutover, `ftp.tinyhomesa.com` silently follows it and FTP
into xneelo breaks — exactly when you might need it to pull a WordPress backup.
**Before cutover, change `ftp` to an A record pointing at `196.22.142.128`.**

---

## ⚠️ SECOND INCIDENT — 2026-07-26 ~22:00, Hostinger email setup rewrote the zone

Creating the Hostinger mailboxes silently rewrote the mail records. This was **not** a
manual change by the owner. Observed at 22:16:

| Record | Before | After |
|---|---|---|
| `MX @` | `10 mail.tinyhomesa.com` (xneelo) | `5 mx1.hostinger.com` + `10 mx2.hostinger.com` |
| `TXT @` SPF | `v=spf1 mx a include:spf.host-h.net ?all` | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| `TXT @` google-site-verification × 2 | present | **DELETED** |

Consequence: inbound mail moved to Hostinger without an explicit decision, and for a
period both MX sets were being served — different public resolvers returned different
answers, so mail split unpredictably between the two hosts.

### Google Search Console verification — restore these two TXT records

Both were dropped. Captured here before they were lost:

```
google-site-verification=bphUYZJV8eW2_fmxPFJxLwk3s7Vmj4mrUgrV6nJg9eE
google-site-verification=idTj4ClG2ABK6SIso3w9ux9zDYTQnnhhgtyzJsrVXQA
```

Add as two separate `TXT` records on `@`, TTL 3600. Without them the Search Console
property loses verification — which matters specifically at website cutover, when the new
`sitemap.xml` has to be submitted.

### Lesson

Hostinger's email provisioning edits the DNS zone as a side effect. **After any action in
the Emails section of hPanel, re-check the full zone** — not just the record you meant to
touch.

---

## Known gaps to fix later (not urgent today)

- **SPF ends in `?all`** (neutral) — effectively no protection. Tighten to `~all` after
  the email migration is settled and verified.
- **SPF contains `a`**, which authorises whatever IP the website A record points at.
  Once the website moves to Hostinger, this would authorise a web server to send mail as
  your domain. Replace `a` with an explicit `ip4:` literal — see `EMAIL-MIGRATION.md`.
- **No DMARC record.** Add `_dmarc` with `v=DMARC1; p=none; rua=mailto:admin@tinyhomesa.com`
  to start collecting reports before enforcing anything.

---

*Recorded 2026-07-26. Values verified against `ns1.host-h.net` (xneelo, stale but live)
and `artemis.dns-parking.com` (Hostinger, current).*
