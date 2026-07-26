# Email migration runbook — tinyhomesa.com, xneelo → Hostinger

**Goal: move every mailbox from xneelo to Hostinger with zero lost messages and zero
downtime.**

Leads for this business arrive by email. The site's contact and quote forms are
`mailto:` links to `admin@tinyhomesa.com` (`src/lib/site.ts:13`). A mailbox that is
unreachable for an hour is an hour of lost enquiries that nobody will ever know about,
because a bounced enquiry looks like no enquiry at all.

Read the whole document before touching anything. The order of operations in §5 is the
part that actually protects you; every other section is detail supporting it.

Companion document: `docs/DNS-RECOVERY.md` — the five records dropped during the
2026-07-26 nameserver move. **Those must be fixed before any of this.**

---

## Verified state at time of writing (2026-07-26)

Queried live against `1.1.1.1`:

| Record | Current value | Note |
|---|---|---|
| `MX @` | `10 mail.tinyhomesa.com` (TTL **7200**) | xneelo |
| `A mail` | `196.22.142.128` | xneelo, Johannesburg |
| `A @` | `196.22.142.128` | xneelo — **same IP as mail** |
| `TXT @` (SPF) | `v=spf1 mx a include:spf.host-h.net ?all` | ⚠️ see §3 |
| `TXT @` | 2 × `google-site-verification=…` | leave alone |
| `smtp` / `imap` | → `mail.tinyhomesa.com` → `196.22.142.128` | restored since DNS-RECOVERY was written |
| `TXT xneelo._domainkey` | **absent** | ⚠️ still missing — outbound mail fails DKIM today |
| `TXT _dmarc` | **absent** | no DMARC at all |

`spf.host-h.net` currently expands to
`v=spf1 include:safilters.host-h.net include:defilters.host-h.net include:safilters1.host-h.net ~all`
(4 DNS lookups total, all resolving to `ip4:` literals — no deeper nesting).

`_spf.mail.hostinger.com` currently expands to
`v=spf1 include:relay.mail.hostinger.com include:relay.mailchannels.net ~all`
(3 DNS lookups total, all resolving to `ip4:`/`ip6:` literals — no deeper nesting).

Both numbers matter in §3 because SPF hard-fails at 10 DNS lookups (RFC 7208 §4.6.4).

---

## 0. ⚠️ Do the WEBSITE cutover and the EMAIL cutover on different nights

**Recommendation: fix DNS-RECOVERY first, then de-couple SPF (§3, State A), then do the
WEBSITE cutover, then wait at least 7 days (14 is better), then do the EMAIL migration.**

Why in that order:

1. **The website cutover is reversible in one DNS edit. The email migration is not.**
   Once a message has been delivered into a Hostinger mailbox, no DNS change brings it
   back to xneelo. Do the cheap reversible thing first and learn the platform on it.
2. **The website cutover proves Hostinger works** — Node app boots, `next start` stays
   up, SSL issues, how their DNS editor actually behaves — while mail is untouched and
   still on a server that has worked for years. If Hostinger turns out to be unusable,
   you find out at zero risk to email.
3. **Launching a new site while email is mid-migration is the worst possible pairing.**
   A new site drives new enquiries; those enquiries are `mailto:` links into a mailbox
   that is, that week, half-moved. You would be generating leads into a hole.
4. **If you change both the same night and something breaks, you cannot tell which
   change caused it**, and both rollbacks are DNS changes that then have to propagate
   past each other. Diagnosis time is exactly the time you do not have.
5. Doing email first buys nothing — the old WordPress site would still be live, so
   you would be debugging a new mail platform for no delivered benefit.

**The one dependency between them** is the `a` mechanism in the current SPF record, which
ties email authorisation to the website's A record. §3 State A removes that dependency.
**Do §3 State A before the website cutover, not after.** Once it is done, the two
migrations are genuinely independent and can be scheduled without reference to each other.

---

## 1. Inventory — before you touch anything

⚠️ **You cannot migrate mailboxes you do not know exist.** A forgotten `info@` or an
active catch-all that quietly collects enquiries will simply stop working at the MX flip
and nobody will notice for weeks. This step is not optional.

### 1.1 List every mailbox, alias and forwarder on xneelo

Log in to **konsoleH** (xneelo's legacy control panel) or the newer **xneelo Control
Panel**. In konsoleH:

- **Mail → Manage Accounts** — lists every mailbox *and* every alias for the domain, with
  an enabled/disabled status indicator per mailbox.
  ([xneelo: Manage mail via konsoleH](https://xneelo.co.za/help-centre/email/manage-mail-kh1/))
- Open each mailbox to see its **mail forwarders** — forwarders are attached to a mailbox,
  so they will not appear in a single flat list.
  ([xneelo: How to edit or delete a mailbox](https://xneelo.co.za/help-centre/email/edit-delete-mailbox/))
- **Catch-all lives on its own tab.** It is disabled by default, but if it was ever
  switched on, everything sent to any unknown `@tinyhomesa.com` address is landing in one
  mailbox right now. ⚠️ **Hostinger's catch-all behaviour is UNVERIFIED — confirm in
  hPanel** whether a catch-all is available on the plan you buy. If it is not, every
  address the catch-all was silently absorbing must become a real alias, or that mail
  starts bouncing at the flip.

Write the result into a table before proceeding:

| Address | Type (mailbox / alias / forwarder) | Forwards to | Size | Still needed? |
|---|---|---|---|---|
| `admin@tinyhomesa.com` | mailbox | — | ? | yes |
| … | | | | |

### 1.2 Find the addresses that are *not* in the control panel

Control panels lie by omission. Also check:

- **The old WordPress site.** Its contact form plugin has a "send to" address, and
  WooCommerce/WP core has an admin email. Both may be addresses nobody remembers.
- **`dig` for other mail vendors** — confirm nothing else is already handling a subdomain:
  ```bash
  dig +short MX tinyhomesa.com
  dig +short MX mail.tinyhomesa.com
  dig +short TXT tinyhomesa.com | grep -i spf
  ```
  The SPF record is a confession: `include:spf.host-h.net` and nothing else means xneelo
  is currently the only authorised sender. Good — that means there is no third-party
  sender (Mailchimp, a CRM, a booking system) to carry across. If you later find one, it
  must be added to the new SPF in §3.
- **The registrar/domain contact address** and the recovery address on the Hostinger
  account itself. ⚠️ If either is `@tinyhomesa.com`, a broken mailbox during migration
  means you cannot receive the password-reset or 2FA email needed to *fix* the migration.
  Temporarily set both to a Gmail address you control **before** you start.
- **Everything that sends the business a code**: bank, SARS eFiling, Google Search
  Console, GA4 (`G-5R1KHZE03G`), Meta/Facebook, TikTok (`@tiny.homesa`), Hostinger,
  xneelo. List which ones use `admin@tinyhomesa.com`. These are the accounts that hurt if
  mail stops for even an hour.

### 1.3 Measure mailbox sizes

You need sizes because they decide which migration tool you can use (§4) and which
Hostinger plan you need (§2).

xneelo does **not** impose a per-mailbox quota — it bills on total hosting account disk
usage, so konsoleH may not show a per-mailbox figure directly.
([xneelo: Mailbox storage limits](https://xneelo.co.za/help-centre/email/is-there-a-mailbox-storage-limit-on-my-account/))
Use konsoleH's **disk usage** view first
([xneelo: How to reduce your disk usage via konsoleH](https://xneelo.co.za/help-centre/website/manage-disk-usage/)),
then measure per-mailbox directly over IMAP:

```bash
# Message counts per folder, without downloading anything.
curl --url "imaps://mail.tinyhomesa.com/" \
     --user "admin@tinyhomesa.com:PASSWORD"          # lists all folders

curl --url "imaps://mail.tinyhomesa.com/INBOX" \
     --user "admin@tinyhomesa.com:PASSWORD" \
     --request "STATUS INBOX (MESSAGES UIDNEXT UIDVALIDITY)"
```

Or interactively, which also proves the credentials and TLS work:

```bash
openssl s_client -connect mail.tinyhomesa.com:993 -quiet
a1 LOGIN admin@tinyhomesa.com PASSWORD
a2 LIST "" "*"
a3 STATUS INBOX (MESSAGES)
a4 LOGOUT
```

The cleanest size number comes from `imapsync` itself in dry-run mode (§4.3) — it reports
total messages and total bytes on both sides without transferring anything.

**Record the numbers.** You will compare against them after the migration, and "did
everything arrive?" is unanswerable without a before-count.

---

## 2. Hostinger email options — what is included, what is paid

### What is included with the hosting plan

Hostinger bundles **Starter Business Email as a 12-month free trial** with web hosting
plans, at **1 GB per mailbox** and **100 messages/day**, with the mailbox count capped by
the hosting plan (1–10 mailboxes).
([Hostinger: Parameters and limits of Hostinger Email](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/),
[Hostinger: How the Business Email free trial works](https://www.hostinger.com/support/how-the-hostinger-mail-trial-works/))

⚠️ **Do not migrate a business onto the free trial tier.** Two independent traps:

1. **1 GB per mailbox.** A mailbox that has been accumulating since the business started
   is very likely over 1 GB. If it is, the migration will silently stop part-way through
   and you will *think* it succeeded.
2. **100 sends/day, and the trial expires after 12 months.** When it lapses, you are
   upgrading under pressure with live mail on the line.

### Paid Hostinger Email plans (2026)

| | Business Starter | Business Premium |
|---|---|---|
| Storage per mailbox | **5 GB** | **50 GB** |
| Sending limit | 1 000/day | 3 000/day |
| Aliases | 5 | 50 |
| Forwarders | 5 (hPanel) / 4 (Webmail) | 50 / 4 |
| Inbound message max | 50 MB | 50 MB |
| Outbound message max | 35 MB (attachments 25 MB) | 35 MB (25 MB) |

Source: [Hostinger: Parameters and limits of Hostinger Email](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/).

⚠️ **UNVERIFIED — confirm in hPanel:** Hostinger's own marketing pages and third-party
reviews state **10 GB** for Business Starter while their support documentation states
**5 GB**. Check the actual figure on the plan page at purchase time. If it is 5 GB and a
mailbox is close to that, buy Premium.

Hostinger Email is Titan-derived infrastructure, and **storage is dedicated to email — it
does not consume the website hosting quota.** That is the right property here.

### The alternatives

- **Titan Email at Hostinger** — sold separately; Hostinger publishes a distinct import
  guide for it. Functionally overlapping with Hostinger Email; no reason to add a second
  vendor relationship.
- **Google Workspace** — better if the business needs Docs/Drive/Meet, and its
  deliverability reputation is the best available. Costs roughly 5–10× Hostinger Email per
  mailbox and puts mail with a third party outside hPanel, which is the opposite of the
  consolidation the owner asked for.

### ✅ Recommendation

**Hostinger Business Email — Starter, paid, not the trial.** Buy Premium instead if §1.3
shows any mailbox above ~3 GB, or if more than 5 aliases/forwarders came out of §1.1.

Rationale: the whole point of this move is one vendor, one control panel, one invoice.
A handful of mailboxes for a small business is precisely the workload Hostinger Email is
sized for, the storage does not compete with the website, and it sits in the same hPanel
as the DNS zone — which matters a great deal during a migration, because MX, SPF and DKIM
can be changed in the same place and at the same moment as the mailboxes.

---

## 3. ⚠️ THE SPF TRAP — read this twice

Current record:

```
v=spf1 mx a include:spf.host-h.net ?all
```

Three mechanisms, and **two of them are about to become wrong for reasons that have
nothing to do with email**:

### `mx` — "any host in my MX records may send as me"

Today `MX @ → mail.tinyhomesa.com → 196.22.142.128`, so `mx` authorises the xneelo box.
**At the MX flip it silently re-points at `mx1/mx2.hostinger.com`.** Those are Hostinger's
*inbound* mail exchangers — they are not the hosts that send your outbound mail (Hostinger
sends via `relay.mail.hostinger.com` and `relay.mailchannels.net`). So after the flip,
`mx` authorises hosts that never send for you, and fails to authorise the hosts that do.
It is not merely stale, it is pointing at the wrong thing entirely.

### `a` — "whatever IP my website resolves to may send as me" ⚠️ this is the dangerous one

Today `A @ → 196.22.142.128`, the same box as mail. Harmless coincidence.

**After the website cutover, `A @` is a Hostinger web server** — a shared machine hosting
other people's sites. The `a` mechanism would then declare, to every receiving mail server
on the internet, that *that web server* is authorised to send mail as `@tinyhomesa.com`.

That is a live spoofing grant. Any other tenant on that machine, or any compromised PHP
script anywhere on it, can send mail claiming to be `admin@tinyhomesa.com` and it will
**pass SPF**. Under the current `?all` the damage is capped because receivers largely
ignore neutral results — but the moment you tighten to `~all` or `-all` (which you must,
see below), `a` converts from ignored noise into an actual, checked authorisation of a
machine you do not control. **Tightening the qualifier without removing `a` makes the
record more dangerous, not less.** That is the trap: the safety improvement and the
vulnerability arrive in the same edit.

### `?all` — neutral, i.e. no policy at all

`?all` means "I make no assertion about anything else." RFC 7208 §8.5 says a Neutral
result **must be treated exactly as None** — as if you had published no SPF record. So
today the record does no protective work whatsoever; it only grants. Combined with the
missing DKIM key (`docs/DNS-RECOVERY.md`) and no DMARC, outbound mail from this domain
currently has **no passing authentication of any kind**.

### The three records, in order

**State A — NOW, before the website cutover. Mail still on xneelo.**

```
v=spf1 ip4:196.22.142.128 include:spf.host-h.net ~all
```

`mx` and `a` both resolve to `196.22.142.128` today, so `ip4:196.22.142.128` is *exactly
equivalent right now* — but it is frozen. It cannot drift when the A record moves. This
single edit de-couples email from the website cutover permanently. `~all` (softfail) is
the right level while things are still moving: receivers mark rather than reject, so a
sender you forgot in §1.2 lands in spam instead of vanishing.
DNS lookups: 4. **Do this before the website cutover.**

**State B — during the dual-run window (§5), mail on Hostinger, xneelo still alive.**

```
v=spf1 include:_spf.mail.hostinger.com ip4:196.22.142.128 include:spf.host-h.net ~all
```

⚠️ **You must keep the xneelo terms during this window.** Any phone or laptop still
configured with `smtp.tinyhomesa.com` is relaying through xneelo. Remove
`include:spf.host-h.net` before those clients are reconfigured (§7) and the owner's
outbound mail starts failing SPF from a device he is still using every day.
DNS lookups: 3 (Hostinger) + 4 (xneelo) = **7**. Under the limit of 10, but there is no
room to add another vendor — if you need to add one, go to State C first.

**State C — FINAL, only after xneelo is fully decommissioned and every client is
reconfigured.**

```
v=spf1 include:_spf.mail.hostinger.com ~all
```

DNS lookups: 3. ([Hostinger: What is the SPF record for Hostinger Email?](https://www.hostinger.com/support/1583673-what-is-the-spf-record-for-hostinger-email/))

Consider `-all` (hardfail) only after DMARC has been at `p=none` for 4+ weeks and the
aggregate reports show 100% of legitimate mail passing (§6). `-all` with an unlisted
legitimate sender means that mail is **rejected**, not filed — an unrecoverable failure
mode. `~all` is the correct resting state for this business.

### Rules that apply to all three

- ⚠️ **Exactly one SPF TXT record per domain.** Two SPF records is a PermError and *all*
  SPF evaluation fails — worse than having none. When adding the Hostinger terms, **edit
  the existing TXT record; do not add a second one.**
- Leave the two `google-site-verification` TXT records alone. They are separate TXT
  records and do not conflict.
- SPF authorises the **envelope sender** (Return-Path), not the visible From: header.
  DMARC alignment (§6) is what ties the two together.
- Verify after every change:
  ```bash
  dig +short TXT tinyhomesa.com | grep spf1     # expect exactly ONE line
  ```

---

## 4. Mailbox content migration — actually copying the mail

### 4.1 IMAP settings for both ends

**Source — xneelo**
([xneelo: Email settings](https://xneelo.co.za/help-centre/email/email-settings/))

| | Host | Port | Encryption |
|---|---|---|---|
| IMAP | `mail.tinyhomesa.com` | **993** | SSL/TLS |
| POP3 | `mail.tinyhomesa.com` | 995 | SSL/TLS |
| SMTP | `smtp.tinyhomesa.com` | 465 | SSL/TLS |

Username: the full email address. Plain-text alternatives exist (143/110/587) — **do not
use them**, you would be sending mailbox passwords and the entire mail archive across the
internet in the clear.

⚠️ If `mail.tinyhomesa.com` stops resolving mid-migration, substitute **xneelo's server
hostname**, which is shown in konsoleH under the domain's *Hosting Server* detail. xneelo
explicitly supports this and it is your escape hatch when the domain's own DNS is in flux.
**Write that hostname down during §1 — UNVERIFIED until you read it out of konsoleH.**

**Destination — Hostinger Email**
([Hostinger: Email account configuration details](https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/))

| | Host | Port | Encryption |
|---|---|---|---|
| IMAP | `imap.hostinger.com` | **993** | SSL/TLS |
| POP3 | `pop.hostinger.com` | 995 | SSL/TLS |
| SMTP | `smtp.hostinger.com` | **465** | SSL/TLS |
| SMTP (alt) | `smtp.hostinger.com` | 587 | STARTTLS |

Username: the full email address. Note these are Hostinger's own hostnames, **not**
`imap.tinyhomesa.com` — which is a decisive advantage during migration, because they work
regardless of what your domain's DNS is doing at that moment.

### 4.2 Option 1 — Hostinger's built-in Email Import

**hPanel → Emails → Manage (next to the domain) → Email Import → New email import request.**
([Hostinger: How to import emails to Hostinger Email](https://www.hostinger.com/support/5866288-how-to-import-emails-to-hostinger-email/))

Fields: source address, source password, source IMAP server, destination mailbox,
destination password.

Limits and caveats, all from Hostinger's own documentation:

- Per-message maximum **50 MB**; total cannot exceed the destination mailbox quota.
- Runtime "from a few seconds to a few days."
- ⚠️ **It does not support incremental sync.** A failed run can be retried within 7 days,
  but you cannot cleanly re-run it to pick up the delta (§4.4). This single limitation is
  why it cannot be your only tool.
- Folder structure depends on how the source exposes folders over IMAP.

⚠️ **UNVERIFIED — confirm in hPanel:** the documentation describes choosing the source
IMAP server from a **dropdown**. If it is a fixed list of known providers and will not
accept an arbitrary hostname like `mail.tinyhomesa.com`, this tool is unusable here — go
straight to imapsync. Check this early, in §5 step 3, not on cutover night.

Hostinger also ships an **IMAP Sync** tool on cPanel-based plans with a *Sync or resync*
button (so it can do a delta), but capped at **3 GB per transfer**.
([Hostinger: How to migrate emails using the IMAP Sync tool](https://www.hostinger.com/support/4469281-how-to-migrate-emails-using-the-imap-sync-tool-at-hostinger/))
⚠️ **UNVERIFIED — confirm in hPanel** whether this exists on the owner's plan; it may be
cPanel-only.

### 4.3 Option 2 — imapsync (the reliable path; recommended)

`imapsync` is the tool that actually does this properly. It is **incremental and
idempotent**: you can stop it, re-run it, and run it nightly without creating duplicates.
Source is under the NOLIMIT Public License and free to run
([imapsync on GitHub](https://github.com/imapsync/imapsync),
[imapsync.lamiral.info](https://imapsync.lamiral.info/) — the author sells prebuilt
binaries but the source is unrestricted). Verified present in Homebrew core:

```bash
brew install imapsync        # imapsync 2.314, license NLPL
```

**Always dry-run first.** This transfers nothing and prints exactly what it would do,
including the message and byte counts you needed for §1.3:

```bash
imapsync \
  --host1 mail.tinyhomesa.com --port1 993 --ssl1 \
  --user1 'admin@tinyhomesa.com' --password1 'XNEELO_PASSWORD' \
  --host2 imap.hostinger.com   --port2 993 --ssl2 \
  --user2 'admin@tinyhomesa.com' --password2 'HOSTINGER_PASSWORD' \
  --automap --syncinternaldates --useuid \
  --dry
```

Remove `--dry` to run it for real. Flags that matter:

| Flag | Why |
|---|---|
| `--automap` | maps Sent/Drafts/Trash/Junk across differing naming conventions |
| `--syncinternaldates` | preserves original received dates — without it every message looks like it arrived today, which destroys sorting and search |
| `--useuid` | matches messages by UID, making re-runs fast and duplicate-free |
| `--dry` | shows the plan, transfers nothing |
| `--dry --justfolders` | lists folder mapping only — run this first if folder names look unusual |

⚠️ **Never use `--delete1` or `--delete2`.** `--delete1` erases mail from xneelo — that is
your only remaining copy of anything that failed to transfer. `--delete2` erases mail from
Hostinger. Neither is needed for this migration. The idempotency of `--useuid` is what
prevents duplicates, not deletion.

Passwords on a command line land in your shell history and in `ps` output. Use
`--passfile1` / `--passfile2` pointing at files with `chmod 600`, and delete them
afterwards.

Run once per mailbox, from §1.1's table.

### 4.4 ⚠️ The delta sync — the step everyone forgets

**This is the single most commonly skipped step in an email migration, and it is the one
that loses mail.**

The initial copy is a snapshot. From the moment it finishes, xneelo keeps receiving new
mail — for hours or days, until every resolver on the internet has expired the old MX
record. DNS propagation is not instantaneous and it is not uniform: some senders will
still be delivering to xneelo long after your own tests show Hostinger working.

Every message that arrives on xneelo after the initial copy and before the last resolver
switches over exists **only on xneelo**. Miss the delta sync and those messages are lost
the day xneelo is cancelled — and they are exactly the messages you cannot afford to lose,
because they arrived during the busiest, most attention-getting week.

**Therefore: run the identical imapsync command again, unchanged, after the MX flip.**
Same flags, same everything — it transfers only what is new. Run it:

- 1 hour after the MX flip
- 24 hours after
- 72 hours after
- once daily for the remainder of the dual-run window
- ⚠️ **one final time immediately before cancelling xneelo**

The last run should report zero new messages. **If the final run reports a non-zero
transfer, do not cancel xneelo.** Something is still delivering there — find out what,
before you delete the server.

---

## 5. ⚠️ ORDER OF OPERATIONS

Prerequisite: `docs/DNS-RECOVERY.md` fully applied, and §3 State A published. Do not start
otherwise.

| # | Step | Why it is in this position |
|---|---|---|
| 1 | **Lower TTLs** — MX and any mail-related record to **300 s**. | MX TTL is **7200 s (2 h)** today. The TTL you are lowering *from* is what governs how long the old value lingers, so this must happen **at least 2× the old TTL (≥4 h, ideally 24 h) before the flip**. Do it too late and you have a 2-hour uncontrolled window at cutover and a 2-hour rollback delay if it goes wrong. This is the step that buys you the ability to undo. |
| 2 | **Buy the plan, create every mailbox on Hostinger** from §1.1's table — plus every alias and forwarder. | Mailboxes must exist before mail is routed to them. A message for an address that does not exist on the new server is **rejected at the SMTP level and bounced to the sender** — permanently lost, and the sender is told the address is invalid. Verify the count and spelling against §1.1. |
| 3 | **Test the migration tool on one throwaway mailbox first.** | Resolves the §4.2 dropdown uncertainty and any password/TLS problem now, in daylight, rather than on cutover night. |
| 4 | **Initial copy** — imapsync (no `--dry`) for every mailbox. | Do this while mail is still flowing to xneelo. It is completely non-destructive and invisible to users; nothing about it can break live mail. Large mailboxes may take many hours — this is why it happens **before** the flip, not during. |
| 5 | **Test send and receive on Hostinger, before flipping anything.** | Use a temporary address (e.g. `migrationtest@tinyhomesa.com`) via Hostinger webmail and `smtp.hostinger.com`. Because Hostinger's client hostnames are independent of your domain's DNS, you can fully prove the new platform **while every byte of live mail is still safely on xneelo**. If this test fails, you abort having risked nothing. |
| 6 | ⚠️ **FLIP THE MX** — remove `MX 10 mail.tinyhomesa.com`, add `MX 5 mx1.hostinger.com` and `MX 10 mx2.hostinger.com`. | The moment of cutover. Both records go in together. ⚠️ **Leave the `A mail` record pointing at `196.22.142.128`** — do not delete it. It is how imapsync and any un-reconfigured client still reach xneelo for the delta syncs. Flip on a **Monday or Tuesday morning**, never a Friday: you want the noisiest, most-observed days of the week to surface problems, and full support availability at both vendors. |
| 7 | **Monitor BOTH servers for 72 hours.** | Mail will arrive at both during propagation. Check xneelo webmail *and* Hostinger webmail several times a day. Anything arriving on xneelo is proof propagation is incomplete — expected, not alarming, but it means you are not finished. |
| 8 | ⚠️ **Delta re-syncs** per §4.4 — 1 h, 24 h, 72 h, then daily. | Sweeps up everything that landed on xneelo after step 4. **Skip this and you lose mail.** |
| 9 | **Update SPF to State B, add Hostinger DKIM, add DMARC `p=none`** (§3, §6). | ⚠️ **After** the MX flip, not before. Publishing Hostinger's DKIM CNAMEs early is harmless, but changing SPF before mail actually moves creates a window where the record does not describe reality. Sequence within this step: DKIM first (records must exist before signed mail is checked against them), then SPF, then DMARC. |
| 10 | **Reconfigure the owner's phone and desktop** (§7). | After step 9, so that when he sends from the new config, SPF and DKIM already align and his first outbound message is not what teaches Gmail to distrust the domain. |
| 11 | ⚠️ **Keep xneelo alive and paid for a minimum of 30 days after the MX flip — 60 is the right answer.** | See below. This is the most important line in this document. |
| 12 | **Final delta sync → verify zero new messages → raise TTLs back to 3600 → decommission xneelo.** | Only after everything above has been true for weeks. |

### ⚠️ How long to keep xneelo, and why cancelling early is unrecoverable

**Minimum 30 days after the MX flip. Recommended 60 days.**

xneelo deletes website content and email from its servers **30 days after cancellation is
submitted**, and states that at decommissioning the drives are formatted and all data is
lost.
([xneelo: How to cancel your hosting but keep the domain](https://xneelo.co.za/help-centre/control-panel/how-to-cancel-your-hosting-but-keep-the-domain/))
⚠️ **UNVERIFIED for this specific account type — confirm the retention period in writing
with xneelo support before submitting any cancellation.**

Why 30 days is the floor:

1. **There is no undo.** Once those drives are formatted, every message that never made it
   through a delta sync is gone. Not "gone from the mailbox" — gone from the world. There
   is no backup you can buy back.
2. **The long tail of stale DNS is real.** Badly-behaved resolvers and corporate mail
   gateways cache MX records far beyond their TTL. A supplier's Exchange server can keep
   delivering to the old MX for weeks.
3. **Seasonal and low-frequency senders.** A supplier who emails monthly, an accountant who
   emails quarterly, an annual insurance renewal — none of them will have sent you anything
   in the first fortnight. Their first post-migration message is the test of whether the
   migration worked, and you want the old server still running when it arrives.
4. **The cost asymmetry is absurd.** One extra month of xneelo hosting is a rounding error
   against one lost tiny-home enquiry. There is no scenario where cancelling in week two
   was the right call.

⚠️ **Do not cancel xneelo hosting in a way that also cancels or transfers the domain.**
The domain is at Hostinger; xneelo hosting is separate. Use xneelo's *cancel hosting but
keep the domain* path and read the confirmation screen carefully.

---

## 6. DKIM and DMARC

### What "no DKIM, no DMARC" means today

xneelo signs with DKIM selector `xneelo`, but the public key TXT record was dropped in the
nameserver move and is **still missing** (verified above; recovery value is preserved in
`docs/DNS-RECOVERY.md`). Every message currently sent from `admin@tinyhomesa.com` fails
DKIM verification at Gmail, Outlook and Yahoo. Combined with SPF's `?all` (= no assertion)
and no DMARC record, the domain currently has **zero passing authentication**. It is not
protected against spoofing, and its own legitimate mail is increasingly likely to be
filed as spam. Migrating is the opportunity to fix all three properly.

### Enabling DKIM on Hostinger

Hostinger Email publishes **three DKIM records, all CNAME type**, TTL 300
([Hostinger: What are the DKIM records for Hostinger Email?](https://www.hostinger.com/support/4456413-what-are-the-dkim-records-for-hostinger-email/)):

| Type | Name | Points to |
|---|---|---|
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` |

Three records exist so Hostinger can rotate keys without your involvement. **Add all
three.** Confirm the exact values for this domain in **hPanel → Emails → Manage → Connect
Domain**, which shows the MX, SPF, DKIM and DMARC values Hostinger wants
([Hostinger: Email DNS records](https://www.hostinger.com/support/email/hostinger-email-dns-records/)).

⚠️ **They must be CNAME, not TXT.** Pasting a DKIM CNAME target into a TXT record produces
a record that looks present in the zone editor and fails every verification. Verify:

```bash
dig +short CNAME hostingermail-a._domainkey.tinyhomesa.com   # expect the .dkim.mail.hostinger.com target
```

⚠️ **Leave `xneelo._domainkey` in place for the whole dual-run window.** While any client
still relays through `smtp.tinyhomesa.com`, that mail is signed with the xneelo selector
and needs its key published. Remove it only at decommission (step 12). Selectors are
independent — having both published simultaneously is correct and causes no conflict.

### DMARC — start at `p=none`

Add one TXT record:

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@tinyhomesa.com; fo=1` |

**Start at `p=none` and stay there for at least 4 weeks.** `p=none` is monitor-only: it
changes nothing about how mail is handled, but it makes receiving providers send you daily
aggregate reports naming every IP sending mail as your domain. That is the only way to
discover the senders §1.2 missed — the WordPress site's transactional mail, an old CRM, a
booking widget — *before* a policy starts destroying their mail.

**Why not `p=reject` on day one:** `p=reject` instructs Gmail, Outlook and every other
receiver to **discard** any mail that fails DMARC alignment. Publish it during a migration,
where SPF and DKIM are in flux by definition and at least one legitimate sender is
guaranteed to be missing from your SPF record, and you have ordered the world to delete
your own business mail. There is no error message, no spam folder, no bounce you will
notice, and no way to recover the messages. Industry guidance is unanimous: reach ~98–100%
DMARC compliance on legitimate traffic under `p=none` before tightening
([Valimail: how to move from p=none to p=reject safely](https://www.valimail.com/blog/p-none-to-p-reject/)).

Progression, no faster than one step per month, and never during a migration window:

```
p=none  →  p=quarantine; pct=25  →  p=quarantine  →  p=reject
```

`rua=mailto:admin@tinyhomesa.com` sends the reports to the very mailbox being migrated —
correct once things are stable, but consider pointing `rua` at a Gmail address during the
migration itself, and switch it to `admin@` at step 12. The reports are XML; a free DMARC
report reader makes them legible.

---

## 7. Client reconfiguration — phone and desktop

Settings the owner needs (§4.1, repeated here so this section can be sent to him alone):

| Setting | Value |
|---|---|
| Account type | **IMAP** (not POP3) |
| Incoming server | `imap.hostinger.com` |
| Incoming port | `993`, SSL/TLS |
| Outgoing server | `smtp.hostinger.com` |
| Outgoing port | `465`, SSL/TLS (or `587` with STARTTLS) |
| Username | `admin@tinyhomesa.com` — the **full address**, not `admin` |
| Password | the Hostinger mailbox password |
| Outgoing auth | **Yes — same credentials as incoming** |

Do the **desktop first, phone second**, so that if something is wrong there is still one
working device to read mail on while you fix it.

### ⚠️ POP3 — the silent data-loss risk

**Ask the owner directly, before anything else: "Is your mail set up as IMAP or POP?"**

POP3 downloads messages to a device and — depending on the client's settings — **deletes
them from the server**. If any device has been running POP3 with "delete from server after
download", then years of mail exist **only in a local file on that laptop or phone**.
imapsync copies what is on the server. It cannot copy what was never there. Those messages
will not migrate, and nobody will notice until someone searches for an old thread.

How to check and rescue:

1. In each mail client, open the account settings and read the account type. Apple Mail:
   *Settings → Accounts → Server Settings*. Outlook: *File → Account Settings* — the
   account list shows POP or IMAP.
2. If any account is POP: **do not delete it and do not reconfigure that account in place.**
   Add the new Hostinger IMAP account **alongside** the existing POP account.
3. Then drag the old local folders into the new IMAP account's folder tree. That uploads
   them to Hostinger, which is the only way they will ever exist on a server.
4. Verify in Hostinger webmail (a different device) that the messages actually appear.
5. Only then remove the old account.

⚠️ **Reconfiguring a POP account in place, or "just deleting and re-adding it", can destroy
the local store. That is unrecoverable.** If POP is in use anywhere, take a full backup of
the machine before touching the mail client.

Also: **archive the xneelo webmail contents**, and check for any address that only ever
existed as a forwarder — forwarders have no mailbox and therefore no history to migrate,
but they still need recreating on Hostinger or that mail simply stops.

---

## 8. Website interaction — the `mailto:` dependency

Both lead-capture paths on the new site are `mailto:` links to `site.email`:

- `src/components/contact/lead-form.tsx:190`
- `src/components/quote/quote-form.tsx:559`
- plus `src/components/contact/contact-cards.tsx:82`, `src/components/layout/footer.tsx:104`,
  `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`

All resolve to `admin@tinyhomesa.com` (`src/lib/site.ts:13`).

Consequences to hold in mind:

1. **`mailto:` sends from the visitor's own mail client, not from the website.** The site
   never touches SMTP, so nothing in this migration can break the *sending* side. But the
   destination mailbox must be able to *receive*. A rejected or bounced message means a
   lead that is gone with no server-side trace — no database row, no log line, nothing.
2. **`admin@tinyhomesa.com` must exist on Hostinger before the MX flip** (§5 step 2). This
   is the single most important mailbox in the inventory.
3. ⚠️ **Never change `site.email`** to a temporary address during the migration. It is
   published in the site's structured data and on the old WordPress pages, and it is the
   address customers already have. Migrate the mailbox; do not move the address.
4. **Test the real path after cutover**, not just an SMTP test: open
   `https://tinyhomesa.com/quote` on a phone, complete the form, tap send, and confirm the
   message lands in the Hostinger mailbox. That exercises exactly what a customer does.
5. If the site is ever upgraded from `mailto:` to a server-side form handler, that handler
   will need SMTP credentials and its sending IP must be added to SPF (§3). Not today's
   problem, but it is the thing that will break SPF next.

---

## 9. ⚠️ ROLLBACK and the point of no return

| Stage | Rollback | Cost |
|---|---|---|
| 1 — TTLs lowered | Raise them again. | None. Nothing has changed functionally. |
| 2 — Mailboxes created on Hostinger | Delete them, or just leave them. They receive nothing until MX points at them. | None. |
| 3–4 — Initial imapsync copy done | None needed. It is a **copy**; xneelo is untouched and still authoritative. | None. |
| 5 — Tested on Hostinger | Stop. Nothing is live. | None. |
| **6 — MX flipped** | Re-add `MX 10 mail.tinyhomesa.com`, delete the two Hostinger MX records. With TTL at 300 s, mail returns to xneelo within ~5 minutes. | ⚠️ **Messages already delivered into Hostinger mailboxes stay there.** They are not lost — imapsync in reverse (`--host1 imap.hostinger.com --host2 mail.tinyhomesa.com`) brings them back — but the flip is the first step that is not free. |
| 7–8 — Dual-run, delta syncs | Same as step 6, plus a reverse imapsync. Fully recoverable. | Low. This is why the dual-run window exists. |
| 9 — SPF/DKIM/DMARC updated | Restore §3 State A; delete the DKIM CNAMEs and `_dmarc`. Effective within TTL. | Low. |
| 10 — Clients reconfigured | Re-enter the xneelo settings. | Low — unless a POP account was destroyed in the process (§7), which is **unrecoverable**. |
| **11 → 12 — xneelo cancellation submitted** | ⚠️ **NONE.** | ⚠️ **THIS IS THE POINT OF NO RETURN.** |

### ⚠️ The point of no return, stated plainly

**Everything up to and including the MX flip is reversible. Submitting the xneelo
cancellation is not.**

The cancellation starts a countdown after which the drives are formatted. Once that
happens:

- Every message that never made it through a delta sync is permanently gone.
- Any mailbox missed in the §1.1 inventory is gone with all of its history.
- Any POP-only local store you never uploaded has no server-side counterpart to restore
  from.
- There is no backup to purchase, no support ticket that recovers it, and no forensic
  option.

**Before submitting the cancellation, all of the following must be true:**

- [ ] The final delta sync reported **zero** new messages.
- [ ] At least 30 days (preferably 60) have passed since the MX flip.
- [ ] Every mailbox in the §1.1 inventory has been opened on Hostinger and its message
      count compared against the §1.3 baseline.
- [ ] Every alias, forwarder and catch-all has been recreated and individually tested.
- [ ] A **full local backup of every mailbox exists off both servers** — export via
      imapsync to a local Maildir, or a Thunderbird profile copied to external storage.
      ⚠️ Do not skip this. It is the last safety net and it costs an afternoon.
- [ ] The owner has personally confirmed, in writing, that his mail is working.

If any box is unticked, **pay for another month.**

---

## 10. Verification checklist

Run these at each stage. "It seems to be working" is not a result.

### After §3 State A (SPF de-coupled) — before the website cutover

```bash
dig +short TXT tinyhomesa.com | grep spf1        # exactly ONE line, contains ip4:196.22.142.128, no ' a ', no ' mx '
```
- [ ] Send a message from `admin@tinyhomesa.com` to a Gmail address → **Show original** →
      `SPF: PASS`.
- [ ] Reply to it from Gmail → arrives on xneelo. Inbound unaffected.

### After creating mailboxes on Hostinger (step 2) — MX not yet flipped

- [ ] Log in to Hostinger webmail for each new mailbox.
- [ ] Send from Hostinger webmail to an external Gmail address → it arrives. (SPF will
      still fail at this point — expected, Hostinger is not yet in the SPF record.)
- [ ] Mailbox count and spelling match §1.1 exactly. Read them out loud against the table.

### After the initial imapsync (step 4)

- [ ] imapsync's final summary shows `messages transferred` matching its own source count.
- [ ] Folder structure in Hostinger webmail matches xneelo — Sent, Drafts, Archive and any
      custom folders, not just Inbox.
- [ ] Spot-check the **oldest** message and the **newest** message in each folder.
- [ ] ⚠️ Message dates are original, not today's. If everything is dated today,
      `--syncinternaldates` did not take effect — fix it and re-run before proceeding.

### Immediately after the MX flip (step 6)

```bash
dig +short MX tinyhomesa.com @8.8.8.8      # expect 5 mx1.hostinger.com / 10 mx2.hostinger.com
dig +short MX tinyhomesa.com @1.1.1.1      # same
dig +short A mail.tinyhomesa.com           # ⚠️ must STILL be 196.22.142.128
```
- [ ] Send from an **external** address (Gmail, and a phone on mobile data) to
      `admin@tinyhomesa.com` → arrives in **Hostinger** webmail within 2 minutes.
- [ ] Complete the real quote form at `https://tinyhomesa.com/quote` from a phone → the
      enquiry arrives (§8).
- [ ] xneelo webmail still opens and still shows history. It must not go dark.

### 24 / 72 hours after the flip

- [ ] Check xneelo webmail for **new arrivals** — expected during propagation, and each one
      confirms the delta syncs are earning their keep.
- [ ] Each delta imapsync run logged, with its transferred count recorded.
- [ ] `dig MX` from a few public resolvers (8.8.8.8, 1.1.1.1, 9.9.9.9) all agree.

### After SPF/DKIM/DMARC (step 9)

```bash
dig +short TXT tinyhomesa.com | grep spf1                          # ONE record, State B
dig +short CNAME hostingermail-a._domainkey.tinyhomesa.com         # CNAME, not TXT
dig +short CNAME hostingermail-b._domainkey.tinyhomesa.com
dig +short CNAME hostingermail-c._domainkey.tinyhomesa.com
dig +short TXT _dmarc.tinyhomesa.com                               # v=DMARC1; p=none; rua=...
```
- [ ] Send from Hostinger to Gmail → **Show original** → all three of
      `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.
- [ ] ⚠️ **Send to https://www.mail-tester.com/** from the migrated mailbox and score it.
      **Target 9/10 or better.** Anything below 8 means an authentication record is wrong —
      read its SPF/DKIM/DMARC breakdown before continuing. Use a fresh address each time;
      each mail-tester address is single-use.
- [ ] Cross-check at [MXToolbox](https://mxtoolbox.com/) — MX, SPF, DKIM, DMARC, and
      blacklist status for the domain and Hostinger's sending IPs.
- [ ] First DMARC aggregate reports arrive within 24–48 h. Read them. Every sending IP they
      name must be one you recognise.

### After client reconfiguration (step 10)

- [ ] Send from the **phone** → arrives externally, and shows SPF/DKIM PASS in Gmail's
      Show original. (Not just "it sent" — sent and *authenticated* are different things.)
- [ ] Send from the **desktop** → same check.
- [ ] Reply-to on a received message goes to the right address.
- [ ] Sent items appear in the server-side Sent folder and are visible from the *other*
      device. This proves IMAP, not POP.
- [ ] Attachments send and receive (respecting the 25 MB outbound attachment cap, §2).

### Before decommissioning xneelo (step 12)

- [ ] Every box in §9's point-of-no-return list is ticked.
- [ ] Final delta sync: **zero** new messages.
- [ ] Full off-server backup taken and **verified by opening it**, not merely created.

---

## Sources

- [xneelo: Ensure your email settings are configured correctly](https://xneelo.co.za/help-centre/email/email-settings/)
- [xneelo: Manage mail (kH1) via konsoleH](https://xneelo.co.za/help-centre/email/manage-mail-kh1/)
- [xneelo: How to edit or delete a mailbox via konsoleH](https://xneelo.co.za/help-centre/email/edit-delete-mailbox/)
- [xneelo: Mailbox storage limits](https://xneelo.co.za/help-centre/email/is-there-a-mailbox-storage-limit-on-my-account/)
- [xneelo: How to reduce your disk usage via konsoleH](https://xneelo.co.za/help-centre/website/manage-disk-usage/)
- [xneelo: How to cancel your hosting but keep the domain](https://xneelo.co.za/help-centre/control-panel/how-to-cancel-your-hosting-but-keep-the-domain/)
- [xneelo: How to add an SPF record](https://xneelo.co.za/help-centre/email/spf/)
- [Hostinger: Parameters and limits of Hostinger Email](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/)
- [Hostinger: How the Business Email free trial works](https://www.hostinger.com/support/how-the-hostinger-mail-trial-works/)
- [Hostinger: Email account configuration details (IMAP/POP/SMTP)](https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/)
- [Hostinger: Email MX records](https://www.hostinger.com/support/4407237-hostinger-email-mx-records/)
- [Hostinger: What is the SPF record for Hostinger Email?](https://www.hostinger.com/support/1583673-what-is-the-spf-record-for-hostinger-email/)
- [Hostinger: What are the DKIM records for Hostinger Email?](https://www.hostinger.com/support/4456413-what-are-the-dkim-records-for-hostinger-email/)
- [Hostinger: Email DNS records overview](https://www.hostinger.com/support/email/hostinger-email-dns-records/)
- [Hostinger: How to import emails to Hostinger Email](https://www.hostinger.com/support/5866288-how-to-import-emails-to-hostinger-email/)
- [Hostinger: How to migrate emails using the IMAP Sync tool](https://www.hostinger.com/support/4469281-how-to-migrate-emails-using-the-imap-sync-tool-at-hostinger/)
- [Hostinger: Set up a domain for Hostinger Email](https://www.hostinger.com/support/8650765-set-up-a-domain-for-hostinger-email/)
- [imapsync — official site](https://imapsync.lamiral.info/)
- [imapsync — source on GitHub (NOLIMIT Public License)](https://github.com/imapsync/imapsync)
- [Valimail: How to move from DMARC p=none to p=reject safely](https://www.valimail.com/blog/p-none-to-p-reject/)
- [Postmark: Using mail-tester.com to troubleshoot deliverability](https://postmarkapp.com/support/article/using-mail-tester-com-to-troubleshoot-deliverability-issues)
- [Sendmarc: xneelo (Hetzner) SPF setup](https://sendmarc.com/spf/spf-xneelo/)

---

*Written 2026-07-26. DNS state verified live against `1.1.1.1` on the same date. Every
item marked **UNVERIFIED** must be confirmed in hPanel or konsoleH before it is relied on.*
