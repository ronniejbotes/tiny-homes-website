# Deploying tinyhomesa.com to Hostinger (Node.js Web App)

**Audience:** Ronnie — no coding required. Every step is a click in hPanel unless it says otherwise.
**Written:** 26 July 2026. Verified against Hostinger's live documentation on that date; URLs cited throughout.
**Decision already made:** the site runs on **Hostinger as a Node.js web app** (Hostinger runs `next build`, then keeps `next start` alive). Not Vercel, not a static export.

---

## 0. The 60-second summary

| | |
|---|---|
| **Your plan** | Hostinger **Web Business** (the one with 50 website slots) |
| **Node.js supported?** | **Yes.** Business allows **5 Node.js websites**. You need 1. |
| **Node version to pick** | **24.x** (fall back to 22.x if the build fails) |
| **Install command** | `npm ci` |
| **Build command** | `npm run build` |
| **Start command** | `npm run start -- -p $PORT` |
| **Deployment method** | **GitHub integration**, branch `main` |
| **Does `package.json` need changing?** | **No.** See §3.4 |
| **Environment variables needed** | **`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`** — quote email. See §6 |
| **Biggest risk** | The build running out of memory on the server (§5) and the 63 MB of video files (§12) |
| **Total hands-on time** | ~45 minutes, plus a 24-hour DNS wait |

---

## 1. Confirming your plan supports this

Hostinger publishes an exact limits table. Business is the plan with **50 websites**, which matches your account.

**Web Business — verified limits**

| Parameter | Value | Matters because |
|---|---|---|
| Websites | **50** | This is how we identified your plan |
| **Node.js websites** | **5** | ✅ You need 1 |
| NVMe storage | 50 GB | ✅ This project is ~800 MB installed |
| Inodes (file count) | 600,000 | ✅ This project is ~31,000 files |
| RAM | **3 GB** | ⚠️ This is the tight one — see §5 |
| CPU cores | **2** | ⚠️ Shared with everything else on the plan |
| Bandwidth | Unlimited | ✅ |
| Max upload file size | 1024 MB | Relevant only if you use the ZIP method |
| Disk I/O | 20,480 KB/s (~20 MB/s) | ⚠️ See §12 — this is the video problem |

Source: [Parameters and Limits of Hosting Plans in Hostinger](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/)
Source: [Node.js hosting options at Hostinger](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/) — *"If you have a Business web hosting plan or any Cloud hosting plan, you can deploy a Node.js application from a GitHub repository or using the file upload method."*

### ⚠️ If it turns out you are NOT on Business

Node.js web apps are **only** on Business, Cloud (Startup/Professional/Enterprise), VPS and dedicated. Premium and Single **cannot** run this site.
Source: [How to add a Node.js Web App in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

**Fallbacks, in order of preference:**
1. **Upgrade to Business** in hPanel (cheapest fix, keeps everything in this runbook valid).
2. **Upgrade to Cloud Startup** — 4 GB RAM, 4 cores, 10 Node apps, 100 GB. Buy this if the build keeps failing on Business (§5).
3. Do **not** try to convert the site to a static export to squeeze it onto Premium. That would break `next/image` optimisation and the `next.config.ts` redirects that protect your Google rankings.

---

## 2. Before you touch anything — the pre-flight checklist

Tick all of these off first. Getting them wrong is what causes a broken cutover.

- [ ] **Fix the missing DNS records first.** `docs/DNS-RECOVERY.md` lists 5 records that were dropped in the nameserver move and are currently breaking email. Fix those before you start, so you are not debugging two things at once.
- [ ] **The old WordPress site on xneelo stays running** the whole time. Do not cancel it. It is your rollback, and `admin@tinyhomesa.com` lives on that same server (196.22.142.128).
- [ ] **Code is pushed to GitHub**, branch `main`, at `github.com/ronniejbotes/tiny-homes-website`.
- [ ] **You can log in to hPanel** and see the Business plan.
- [ ] **Lower the DNS TTL now.** In hPanel → **Domains → tinyhomesa.com → DNS Zone Editor**, change the TTL on the apex `A` record (the one pointing at `196.22.142.128`) from whatever it is to **300 seconds**. Do this **at least 24 hours before** cutover. This is what turns a "24-hour scary wait" into a "5-minute switch" on the day. It does not change where the site points — only how fast a future change takes effect.

### ⚠️ Check whether tinyhomesa.com is already attached as a website

Hostinger's own documentation states that Node.js apps are created as **new** websites, and that an existing website using that domain must be **removed first** before the domain can be attached to the Node.js app.
Source: [How to add a Node.js Web App in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

Go to hPanel → **Websites** and look for `tinyhomesa.com` in the list. If it is there (Hostinger sometimes auto-creates an empty placeholder site when a domain is registered), you will have to delete that placeholder at cutover time — **not now**. Note it and move on.

**Removing a website does NOT delete the domain, the DNS zone, or email.** Those are managed separately under **Domains**. But read the confirmation dialog carefully before clicking, and if it mentions email or DNS, stop and contact Hostinger support.

---

## 3. Creating the Node.js app in hPanel

### 3.1 Start the wizard

1. Log in to **hPanel**.
2. Left sidebar → **Websites**.
3. Click **Add Website**.
4. Choose **Deploy Web App** (not WordPress, not Website Builder).

Source: [How to add a Node.js Web App in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

### 3.2 Choose the source: GitHub

5. Choose **Import Git Repository**.
6. You will be redirected to GitHub to authorise Hostinger. Approve it.
7. Select the repository **`ronniejbotes/tiny-homes-website`**.
8. Select branch **`main`**.

Why GitHub and not ZIP — see §4.

### 3.3 ⚠️ Do NOT connect the real domain yet

If the wizard offers you a domain, choose the **temporary domain** option, or pick a subdomain (§9). **Do not attach `tinyhomesa.com` at this point.** The whole point is to get the site working on Hostinger *before* you point the real domain at it. Attaching the live domain early is the single most likely way to take the business offline.

### 3.4 Build settings — the exact values

Hostinger should auto-detect Next.js. **Verify every field anyway** and set them to exactly this:

| Field | Value |
|---|---|
| Framework | `Next.js` |
| Node.js version | **`24.x`** |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start -- -p $PORT` |
| Output directory | `.next` |
| Entry file | *leave blank* — Next.js supplies its own server |
| Root directory | *leave blank / `/`* — `package.json` is at the repo root |

These are the values Hostinger publishes in its own official Next.js starter, [github.com/hostinger/deploy-nextjs](https://github.com/hostinger/deploy-nextjs): install `npm ci`, build `npm run build`, start `npm run start -- -p $PORT`.

**On the Node version.** Hostinger offers **18.x, 20.x, 22.x, 24.x** ([How to select the Node.js version](https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/)). Next.js 16.2.10 declares `"engines": { "node": ">=20.9.0" }`, so 18.x is **out**. This site was built and tested locally on **Node 24.14.1**, so picking **24.x** means the server runs the same major version you already know works. Hostinger's own starter suggests 20 — if 24.x produces a build error you cannot explain, drop to **22.x**, then **20.x**, redeploying each time. Hostinger explicitly advises reverting to its auto-detected version if a version change breaks the build.

> ⚠️ **Auto-detection may pick the wrong version.** `package.json` has no `engines` field of its own, so Hostinger infers the version from the lockfile and from Next's own requirement — which could land on 20.x. Always check the dropdown and set it manually.

### 3.5 Deploy

9. Click **Deploy**. Hostinger now clones the repo, runs `npm ci`, runs `npm run build`, and starts the app.
10. Watch the build log (§10). First build will take **several minutes** — installing ~28,000 dependency files and compiling 14 routes.

---

## 4. Deployment method — why GitHub, not ZIP or SSH

| Method | Verdict | Reasoning for *this* project |
|---|---|---|
| **GitHub integration** | ✅ **Use this** | Hostinger clones the repo server-side, so the **132 MB of images and videos in `public/` never touch your upload connection** — they are already committed to the repo. Pushing to `main` triggers an automatic redeploy: Hostinger pulls, reinstalls dependencies and restarts the app. Source: [How to add a Node.js Web App](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) |
| **ZIP upload** | 🟡 Backup only | The ZIP would be ~140 MB (source + `public/`, excluding `node_modules` and `.git`). That fits under the Business plan's **1024 MB** upload limit, so it *works* — but every single content change means re-zipping and re-uploading 140 MB over a South African connection. Use only if GitHub authorisation fails. **If you use it, exclude `node_modules`** — Hostinger installs dependencies itself and including them is a documented cause of build failure ([troubleshooting guide](https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/)). |
| **SSH + `git pull`** | ❌ **Do not use** | SSH does exist on Business plans ([enable SSH](https://www.hostinger.com/support/1583645-how-to-enable-ssh-access-in-hostinger/)), but the managed Node.js app is driven by Hostinger's deployment engine, not by files you drop in by hand — a manual `git pull` would not rebuild or restart anything. Multiple sources also report that **`npm` cannot be run over SSH on Business plans**, only through the deployment engine. **UNVERIFIED — this claim does not appear in Hostinger's own docs**, but it does not matter: even if npm worked, hand-editing files under a managed app is a good way to end up in an unrecoverable state. |

### ⚠️ Repository size

`public/` is 132 MB of committed binaries, and the local `.git` directory is 218 MB because those binaries have version history. Hostinger does not publish a repository size limit for its GitHub integration — **UNVERIFIED — confirm in hPanel.** If the clone step fails or times out in the build log, that is the cause, and the fix is §12 (move the videos off the repo entirely).

---

## 5. Will the build actually run on the server?

**Yes — Hostinger runs `npm run build` on the server as part of every deployment.** That is the whole model; there is no "upload a pre-built site" mode for Node.js apps.

### ⚠️ This is the step most likely to fail

Your Business plan gives the build **3 GB RAM and 2 CPU cores**, shared with everything else on the account. A Next.js production build is memory-hungry, and `JavaScript heap out of memory` is the classic shared-hosting failure ([vercel/next.js discussion #67617](https://github.com/vercel/next.js/discussions/67617)).

**Realistic assessment for *this* site:** 14 routes, no database, no heavy server dependencies. It should build inside 3 GB. But it is close enough that you should take the precaution below.

### Precaution — set a memory ceiling (do this on the first deploy)

In the **Environment variables** section of the deploy wizard, add:

```
NODE_OPTIONS=--max-old-space-size=2048
```

This tells Node to keep its heap under 2 GB, leaving headroom inside the 3 GB plan limit. Without it, Node may size its heap based on the physical machine (which is far larger than your slice), balloon past your quota, and get killed by the host — which shows up in the log as a build that just stops, with no clear error.

### If the build fails anyway — escalation ladder

1. **Read the build log** (§10) and search it for `heap`, `ENOMEM`, `Killed`, or `SIGKILL`.
2. Lower it further: `NODE_OPTIONS=--max-old-space-size=1536`, redeploy.
3. Try Node **22.x** instead of 24.x, redeploy.
4. **Upgrade to Cloud Startup** (4 GB RAM, 4 cores). This is the honest answer if steps 1–3 do not work — roughly double the monthly cost, and it also raises the inode limit to 2,000,000 and storage to 100 GB.
5. **Last resort — build locally, ship the build.** Run `npm run build` on your own machine, then ZIP the project *including* the generated `.next` folder, and set the hPanel **Build command** to something harmless like `echo "prebuilt"`. **UNVERIFIED — confirm in hPanel** that an empty or no-op build command is accepted; Hostinger's docs do not describe this scenario. Only reach for this if 1–4 have all failed, because it means every future content change requires a manual local build and a 140 MB upload.

### ❌ Do not commit `.next` to git

It is 1.3 GB locally (it contains development caches as well as the production output) and it is correctly listed in `.gitignore`. Committing it would blow up the repository and change nothing useful.

---

## 6. Environment variables

**This site needs three, all for quote email** (added August 2026 — this section previously read "none", which was true before `/api/quote` existed):

```
SMTP_USER=admin@tinyhomesa.com
SMTP_PASS=<the admin@tinyhomesa.com mailbox password>
SMTP_HOST=smtp.hostinger.com
```

`SMTP_HOST` and `SMTP_PORT` both have working defaults in `src/lib/mailer.ts` (`smtp.hostinger.com` / `465`), so strictly only `SMTP_USER` and `SMTP_PASS` are required — but setting the host explicitly makes the configuration legible to the next person.

Two optional ones exist and are almost never needed: `QUOTE_NOTIFY_EMAIL` (where shipping-quote requests land, defaults to `admin@tinyhomesa.com`) and `SMTP_FROM` (defaults to `"Tiny Homes SA website" <SMTP_USER>`). See `.env.example`.

**What happens if you skip them:** nothing crashes and the build still succeeds. Visitors still get their quote on screen, but no email is sent — neither their copy of the quotation nor the shipping-quote request to the office. The page tells them so and offers WhatsApp instead, so leads are not lost silently, but every quote then needs manual follow-up. Check the runtime log (§10) for `[quote] SMTP not configured`.

> ⚠️ **Two emails go out per quote request** (customer copy + office notification) against the mailbox's **100 sends per 24 hours** — roughly 50 quotes a day. See `docs/EMAIL-MIGRATION.md` for the plan limits.

- **`MESHY_API_KEY`** exists in your local `.env.local` file but **is not referenced anywhere in the source code** — it is dead. Do not copy it to Hostinger. (It is also excluded from git by `.gitignore`, so it was never going to reach the server anyway.)
- **Google Analytics** (`G-5R1KHZE03G`) is hard-coded in `src/app/layout.tsx`, not read from an environment variable. Nothing to configure.

**Where they go, if you ever need one:** the **Environment variables** step of the deploy wizard. You can paste a whole `.env` file or add them one at a time. After deployment, edit them via **Website Dashboard → Settings and redeploy**.
Source: [How to add environment variables during Node.js application deployment](https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/) · [How to edit or add environment variables after deployment](https://www.hostinger.com/support/how-to-edit-or-add-environment-variables-after-deployment/)

> ⚠️ **Changing an environment variable does not take effect until you redeploy.** Hostinger's docs state you "may need to redeploy your application for changes to take effect." Assume you always do.

> ⚠️ **Do not put `PORT` in the environment variables.** Hostinger supplies it. Setting it yourself risks a `Port already in use` crash.

---

## 7. About the start command and `$PORT` (why `package.json` needs no change)

**Short answer: leave `package.json` exactly as it is.** `"start": "next start"` is correct and needs no modification.

**Why.** Next.js 16's own CLI reference (bundled at `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md`) documents the `next start` port option as:

> `-p` or `--port <port>` — Specify a port number on which to start the application. **(default: 3000, env: PORT)**

So `next start` already reads the `PORT` environment variable by itself. Hostinger sets `PORT` for your app. In principle a bare `npm run start` would work.

**But set the start command to `npm run start -- -p $PORT` anyway**, because that is what Hostinger's own official Next.js starter prescribes, and passing the flag explicitly removes any dependence on how Hostinger's runtime chooses to expose the variable. The `--` is not a typo: it tells npm to hand the `-p $PORT` part through to `next start` rather than consuming it itself.

### ⚠️ Conflicting documentation — the one thing to watch

Hostinger's troubleshooting page says to *"Confirm the application listens on port 3000"* ([Failed to build the application](https://www.hostinger.com/support/fix-failed-to-build-application-error-hostinger-node-js/)), while its Next.js starter says to bind to `$PORT`. These cannot both be the whole truth. **UNVERIFIED — confirm by deploying.**

**If the build succeeds but the site shows a 502 / blank page / "cannot connect":**
1. Open the runtime log (§10) and look for `EADDRINUSE`, `Port already in use`, or a port number in the startup line.
2. Change the start command to plain **`npm run start`** (which defaults to port 3000) and redeploy.
3. If that also fails, try **`npm run start -- -p 3000`**.

One of those three will be right. Note this down once you know which, so future redeploys are not guesswork.

> **Aside:** Next's docs also note *"`PORT` cannot be set in `.env`"* — the HTTP server boots before `.env` files are read. This is only relevant if someone later tries to "fix" a port problem by adding `PORT=` to an env file. It will not work.

---

## 8. Attaching the domain, and apex vs www

**Do this only after §9 has proved the site works.**

### 8.1 The rule for this domain

**The apex `tinyhomesa.com` is canonical.** All 11 of your indexed Google URLs are on the apex, and `www.tinyhomesa.com` currently 301-redirects to it. **This must stay true after cutover** or you will fragment your search rankings.

### 8.2 Connect it

1. hPanel → **Websites** → your new Node.js app → **Dashboard**.
2. Click **Connect domain**.
3. Enter **`tinyhomesa.com`** (the apex, no `www`).
4. Follow any on-screen DNS instructions. Because your nameservers are already Hostinger's (`artemis`/`hermes.dns-parking.com`), Hostinger can update the zone itself — you should not need to add records by hand.
5. Hostinger states **"SSL certificates will be installed automatically"** once the connection completes, and that the process may take **up to 24 hours** for DNS propagation. With the TTL lowered per §2, expect minutes, not hours.

Source: [How to connect a custom domain to a Node.js application](https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/)

### 8.3 ⚠️ www — verify, do not assume

Hostinger's documentation **does not state how apex and www are treated differently** for Node.js apps. **UNVERIFIED — confirm in hPanel.**

After connecting, test all four of these in a browser:

| URL | Must end at |
|---|---|
| `http://tinyhomesa.com` | `https://tinyhomesa.com` |
| `https://tinyhomesa.com` | itself, 200 OK |
| `http://www.tinyhomesa.com` | `https://tinyhomesa.com` |
| `https://www.tinyhomesa.com` | `https://tinyhomesa.com` (301) |

**If `www` does not redirect to the apex**, that is a code change, not a panel change — report it back so a `www → apex` redirect can be added to `next.config.ts` (Next.js supports host-matched redirects). Do not try to fix it with a DNS record; DNS cannot redirect.

### 8.4 The `.htaccess` trap

Node.js apps do **not** read `.htaccess`. Any redirect rules from the old WordPress site are gone. They have already been rebuilt in `next.config.ts` — that file contains the redirects for `/about-us`, `/contact-us`, `/thedome`, `/privacy-policy`, `/terms-and-conditions-tiny-homes-sa`, `/sitemap_index.xml` and `/page-sitemap.xml`. **Do not delete or "simplify" that file.** It is what stops your Google rankings from evaporating.

---

## 9. Testing BEFORE cutover — the most important section

You must see the new site working on Hostinger while the old site is still live. There are two ways; **use both**.

### 9.1 Method A — Hostinger's temporary domain (immediate)

When you deploy without connecting a custom domain, Hostinger assigns a **temporary domain** you can browse right away.

- Find it at **Websites → Dashboard → Preview**, or under **Website details**.
- Format is a Hostinger-owned hostname (e.g. something ending in `.hostingersite.com`). The URL is fixed and cannot be changed.
- Source: [How to Access Your Website Content Without a Domain in Hostinger](https://www.hostinger.com/support/2489693-how-to-access-your-website-content-without-a-domain-in-hostinger/)

> ⚠️ **Conflicting information on lifetime.** Hostinger's support article says temporary domains "work as long as your hosting plan is active," while other Hostinger material describes a preview URL that expires after **120 hours**. **UNVERIFIED — confirm in hPanel.** Treat the temporary domain as short-lived and do not build a testing process around it lasting for weeks.

> ⚠️ **Some things will look wrong on the temporary domain and that is expected.** Anything that depends on the real hostname — canonical tags, the sitemap URLs, absolute Open Graph image URLs — will show the Hostinger hostname instead of `tinyhomesa.com`. Judge *functionality* here, not *URLs*.

### 9.2 Method B — a real subdomain (recommended, zero risk)

This is the better test, and it is available to you because **your DNS is already at Hostinger**.

1. hPanel → **Domains → tinyhomesa.com → Subdomains** (or use the app's **Connect domain** box).
2. Create and connect **`new.tinyhomesa.com`**.
3. Because the main domain already points at Hostinger nameservers, **no additional DNS action is required** — Hostinger's docs state the subdomain "connects automatically and becomes available shortly."
4. Hostinger issues a Let's Encrypt certificate for it automatically.

Source: [How to connect a subdomain](https://www.hostinger.com/support/6976680-how-to-connect-a-subdomain-to-hostinger-website-builder)

**This does not touch the apex `A` record at all.** `tinyhomesa.com` keeps serving the old WordPress site on xneelo the entire time. Zero risk.

> ⚠️ **Google can index `new.tinyhomesa.com` and treat it as duplicate content.** Mitigate by deleting the subdomain from hPanel **within a day of cutover**. Do not leave it up for weeks.

### 9.3 Test checklist — run this on the subdomain

- [ ] Home page loads, hero video plays
- [ ] All 9 product pages load: `/folding-homes`, `/expandable-homes`, `/nature-cabins`, `/the-dome`, `/apple-cabins`, `/glamping-capsules`, `/outdoor-kitchens`, `/garages`, `/safari-tents`
- [ ] `/about`, `/contact`, `/quote`, `/terms`, `/privacy` all load
- [ ] **Images are sharp and load fast** — this proves `next/image` optimisation is working on the server
- [ ] **Every video plays**, including `safari-tent-lodge.mp4` (the 25 MB one). Time it. If it stalls, go to §12 **before** cutover.
- [ ] The old-URL redirects work: `/about-us/` → `/about`, `/contact-us/` → `/contact`, `/thedome/` → `/the-dome`, `/privacy-policy/` → `/privacy`, `/terms-and-conditions-tiny-homes-sa/` → `/terms`
- [ ] `/sitemap.xml` and `/robots.txt` return content
- [ ] `/sitemap_index.xml` redirects to `/sitemap.xml`
- [ ] The contact and quote forms behave as expected
- [ ] The WhatsApp link opens `wa.me/27836603743`
- [ ] Phone links dial `+27 83 660 3743`
- [ ] Test on a phone on mobile data, not just office wifi
- [ ] Deliberately visit a nonsense URL like `/does-not-exist` — you should get the 404 page, not a crash

**Leave the site running on the subdomain for at least 24 hours before cutover** and check it again the next morning. This catches the crash-after-idle class of problem (§11) that a 10-minute test cannot.

---

## 10. Logs, restarts and staying alive

### Build logs (why a deployment failed)
hPanel → **Websites → Dashboard → Deployments** → click the arrow on the failed build → scroll to **Build logs**.
Read the lines marked `ERROR`, and the last ~30 lines before it stopped.
Source: [How to troubleshoot Node.js deployment build errors](https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/)

### Runtime logs (why the site is misbehaving *after* a successful build)
hPanel → the Node.js app's dashboard → **Runtime logs**. You can filter by **time range** and **severity**.
Source: [How to use Node.js Runtime logs at Hostinger](https://www.hostinger.com/support/how-to-use-node-js-runtime-logs-at-hostinger/)

There is also a raw **`stderr.log`** file in the application root, reachable through **File Manager**, at:
```
/home/{your-username}/domains/tinyhomesa.com/nodejs
```
If `stderr.log` is empty, that usually means the app never crashed — the problem is elsewhere (Hostinger has a whole article on this: [Understanding Empty stderr.log](https://www.hostinger.com/support/understanding-empty-stderr-log-in-node-js-applications/)).

### Restarting
On the app's dashboard, click the **Running** status indicator — a **Restart** button appears for server-side Node.js applications. (Static front-end-only apps do not get this button; yours will, because it runs `next start`.)
Source: [How to add a Node.js Web App in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

### Redeploying
**Website Dashboard → Settings and redeploy.** With GitHub connected you do not re-upload anything — Hostinger pulls the latest commit from `main`. The same screen lets you change the Node version, build command, start command and environment variables before redeploying.
Source: [How to redeploy a Node.js application](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)

### ⚠️ After a server reboot / after a crash
**UNVERIFIED — confirm with Hostinger support.** Hostinger's public documentation does not state whether the platform automatically restarts your Node process after a crash or a host reboot. It is a managed platform and almost certainly does, but this is important enough for a business site that you should **ask support directly** and write the answer down here:

> Hostinger's answer (fill in): ________________________________

Until you have that answer in writing, set up an uptime monitor (UptimeRobot's free tier is fine) on `https://tinyhomesa.com` so you find out about a dead process from an email, not from a customer.

---

## 11. Known failure modes

Straight from Hostinger's own troubleshooting documentation plus reported real-world Next.js-on-shared-hosting behaviour.

| Symptom | Cause | Fix |
|---|---|---|
| **"Failed to build the application"** | Node version in hPanel does not match what the project needs | Set it to 24.x (§3.4) |
| | Missing environment variable needed at build time | Not applicable here — this site needs none (§6) |
| | `node_modules` was included in a ZIP upload | Delete it from the ZIP and re-upload |
| | `package.json` not at the repo root | Not applicable — yours is at the root |
| **Build log just stops, no error** / `JavaScript heap out of memory` / `Killed` | Ran past the 3 GB plan RAM limit | §5 — `NODE_OPTIONS=--max-old-space-size=2048`, then Cloud Startup |
| **Build succeeds, site shows 502 or won't connect** | Port binding mismatch | §7 — try the three start-command variants |
| **`Port already in use` / `EADDRINUSE`** | Two processes, or a hard-coded port fighting Hostinger's assigned one | Restart the app; remove any `PORT` you added to env vars |
| **`Module not found` at runtime** | Dependency present locally but not committed to `package.json` | Check the build log for the module name and report it back |
| **Site works, then dies overnight** | Process crashed and nothing restarted it | §10 — this is why the 24-hour subdomain soak test matters |
| **Videos stutter or time out** | 20 MB/s account-wide I/O ceiling | §12 |
| **`.htaccess` rules ignored** | Node.js apps don't read `.htaccess` | Already handled in `next.config.ts` — §8.4 |
| **Can't attach `tinyhomesa.com`** | Domain already bound to another website on the plan | §2 — remove the placeholder website first |

Sources: [Failed to build the application error](https://www.hostinger.com/support/fix-failed-to-build-application-error-hostinger-node-js/) · [Troubleshoot Node.js deployment build errors](https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/)

---

## 12. ⚠️ The honest verdict on 132 MB of media

**Is Hostinger Business Node hosting a poor fit for this site? Partly — and the problem is the videos, not the size.**

What is **fine**:
- **Storage.** 132 MB of assets plus ~800 MB installed against a 50 GB quota. Not close to a limit.
- **File count.** ~31,000 files against a 600,000 inode limit. Not close.
- **Images (70 MB).** These are genuinely fine. `next/image` is configured to serve AVIF and WebP, Next optimises each image once and caches the result on disk, and real visitors download a fraction of the original bytes. This is exactly why the Node.js hosting decision was the right one — a static export would have thrown this away.

What is **not fine**:
- **Videos (63 MB across 9 files, one of them 25 MB).** Two hard problems:
  1. **Video is not optimised by Next.js.** Every byte of that 25 MB `safari-tent-lodge.mp4` is served raw, exactly as it sits in `public/`.
  2. **Your plan's disk I/O ceiling is 20,480 KB/s (~20 MB/s) for the whole account.** One visitor streaming that one video consumes roughly 1.25 seconds of your *entire account's* I/O budget. A handful of simultaneous visitors on a product page with autoplay video will saturate it, and the symptom is the whole site — every page, every visitor — going slow at once.

### The fix, in order — do at least the first two

**1. Enable Hostinger's CDN (5 minutes, free, do this immediately after cutover).**
hPanel → **Websites → Dashboard → Performance → CDN → Enable**. Hostinger's CDN explicitly supports Node.js sites and caches static content on edge servers, which takes the load off your origin.
Source: [Hostinger CDN: How to optimize your website](https://www.hostinger.com/support/7935917-hostinger-cdn-website-optimization/)

**2. Re-compress the videos before cutover.** 25 MB for one web video is far too large — modern H.264/H.265 at 1080p should land these at 3–6 MB each with no visible quality loss. This is the highest-value, lowest-risk action on the whole list, and it fixes the problem at source. It requires a video tool, not a hosting change.

**3. If videos are still a bottleneck after 1 and 2, move them off the origin entirely.** Host them on a dedicated video CDN — Cloudflare Stream, Bunny Stream, or Vimeo — and reference the external URLs. This removes 63 MB from the repository (which also speeds up every future deployment) and hands adaptive bitrate streaming to a service built for it. This is a code change and would need to be planned properly.

**4. Upgrade to Cloud Startup** if traffic grows. Note that the **I/O limit is 20,480 KB/s on Cloud Startup too** — identical to Business. Upgrading buys you RAM and CPU, **not** video throughput. So do not upgrade *for the videos*; do 1–3 instead.

---

## 13. Cutover day — the actual switch

Only start this once §9 is fully green and the site has soaked on `new.tinyhomesa.com` for 24 hours.

Pick a **low-traffic window** — early morning SAST, or a Sunday.

1. **Confirm the TTL is 300** on the apex `A` record (you set this in §2). If it is not, set it now and come back in 24 hours.
2. **Confirm the old xneelo site is still live** at `196.22.142.128`. This is your rollback.
3. **Write down the current apex `A` record value** (`196.22.142.128`) somewhere you can find it in a panic.
4. If a placeholder website is holding `tinyhomesa.com` on the plan, **remove that website now** (§2). ⚠️ Read the dialog. Do not accept anything that offers to remove the domain, the DNS zone, or email.
5. **Connect `tinyhomesa.com` to the Node.js app** (§8.2).
6. **Wait 10–15 minutes.** Then load `https://tinyhomesa.com` in a private/incognito window.
7. **Verify SSL.** If the browser warns about the certificate, go to §14 — do not panic and do not roll back yet.
8. **Run the full §9.3 checklist again**, this time on the real domain.
9. **Verify `www`** behaves per §8.3.
10. **Check email still works.** Send a test message to and from `admin@tinyhomesa.com`. ⚠️ Email lives on the xneelo server (196.22.142.128) via the `MX` record, which you have not touched — but verify, do not assume.
11. **In Google Search Console**, submit `https://tinyhomesa.com/sitemap.xml` and request re-indexing of the home page.
12. **Delete the `new.tinyhomesa.com` subdomain** (§9.2) so Google never indexes it.
13. **Leave the old xneelo WordPress site running for at least 30 days.** Do not cancel it on day one.

### Rollback

If anything is badly wrong and you cannot fix it within your comfort window:

1. hPanel → **Domains → tinyhomesa.com → DNS Zone Editor**.
2. Set the apex `A` record back to **`196.22.142.128`**.
3. With TTL at 300, the old site is back within ~5 minutes.
4. The Node.js app keeps running on Hostinger, untouched — reattach `new.tinyhomesa.com` to it and carry on debugging with no pressure.

**This rollback only stays this easy while the old xneelo site exists.** That is the entire reason for step 13.

---

## 14. SSL certificate

### How it should work
Hostinger issues **free Let's Encrypt certificates** automatically. The [custom domain guide](https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/) states plainly: **"SSL certificates will be installed automatically"** once the domain connection completes. Hostinger's certificates are 90-day Let's Encrypt certs that **auto-renew** and cover **both the apex and the `www` subdomain**.

### ⚠️ The timing constraint you cannot design around
**Let's Encrypt will only issue a certificate for a domain that already resolves to the server requesting it.** Validation works by Let's Encrypt fetching a file over HTTP from whatever server the domain currently points at. So:

> The certificate for `tinyhomesa.com` **cannot** be issued until *after* you have pointed the apex at Hostinger.

**This creates a short window — typically a few minutes, occasionally up to an hour — where `https://tinyhomesa.com` is served with a wrong or missing certificate and browsers show a security warning.** This is normal and expected. It is also why you cut over at 6am on a Sunday and not at 11am on a Tuesday.

**This is the strongest argument for lowering the TTL to 300 in §2.** A 300-second TTL means Hostinger sees the DNS change almost immediately and can validate the certificate almost immediately. A 7200-second TTL means up to two hours of browser warnings on your live site.

### If the certificate does not appear within ~1 hour
1. hPanel → **Websites → Manage → Security → SSL**.
2. Select `tinyhomesa.com` and click **Install SSL**.
3. If it fails, the cause is almost always that DNS has not fully propagated yet. Check `https://dnschecker.org` for `tinyhomesa.com` — it must be showing Hostinger's IP, not `196.22.142.128`, from most locations. Wait, then retry.
4. ⚠️ **Both the apex and `www` must resolve to Hostinger**, or the certificate covering both will fail to validate. If only the apex has propagated, the cert may issue for the apex alone — which is survivable, but re-issue it once `www` catches up.
5. Once issued, confirm **Force HTTPS** is enabled so `http://` visitors are redirected.

Source: [How to install Lifetime SSL at Hostinger](https://www.hostinger.com/support/1583258-how-to-install-lifetime-ssl-at-hostinger/)

---

## 15. After it's live

| Task | When |
|---|---|
| Enable Hostinger CDN (§12) | Same day |
| Set up an uptime monitor on `https://tinyhomesa.com` | Same day |
| Delete the `new.tinyhomesa.com` subdomain | Within 24 hours |
| Check the runtime log for errors (§10) | Daily for the first week |
| Confirm all 11 old URLs still resolve (§9.3 redirect list) | Day 2 |
| Check Google Search Console for crawl errors | Day 3, then weekly |
| Confirm GA4 `G-5R1KHZE03G` is recording traffic | Day 2 |
| Re-compress the videos (§12) | Within 2 weeks |
| Cancel the old xneelo WordPress hosting | **Not before day 30** |
| ⚠️ **Keep `admin@tinyhomesa.com` working** | Forever — it is on the xneelo server; if you ever cancel that hosting, migrate the mailbox **first** |

### Making a content change from now on
1. Change the code locally.
2. `git push` to branch `main`.
3. Hostinger detects the push, pulls, reinstalls, rebuilds, restarts. Nothing to click.
4. Watch **Deployments** in hPanel to confirm the build went green.
5. **Purge the CDN cache** — hPanel → **Websites → Dashboard → Performance → CDN → Purge cache**. See §16; skipping this is what took the site down in July 2026.
6. Run `npm run smoke` to confirm the deploy is actually reaching visitors.

---

## 16. ⚠️ The CDN cache will serve a dead site if you let it

**Read this before you next deploy.** This is the failure that took tinyhomesa.com
down for roughly 18 hours on 27–28 July 2026, and it will happen again on every
deploy unless step 5 above is followed.

### What happened

Nothing was wrong with the code, and the Hostinger build went green. The site
still rendered as a blank cream page below the navbar, and `/garages` showed the
"The site didn't load" error page.

Next.js sends `Cache-Control: s-maxage=31536000` — **one year** — on every fully
static prerendered page. That is Next's documented default
(`node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md`), and it is written
on the assumption that the CDN gets purged whenever you deploy. Vercel does that
automatically. **Hostinger's `hcdn` does not.**

So the edge pinned a copy of the HTML for a year. The next deploy rebuilt
`/_next/static/chunks/*` under new content hashes and deleted the old files — but
the edge carried on serving the *old* HTML, which still asked for the deleted
chunks. They 404'd. React never hydrated. And because every section is
server-rendered inside `<Reveal>` at `opacity: 0` waiting for JavaScript to
animate it into view, "JavaScript never ran" looks to a visitor like "the page is
empty".

Measured on the live site at the time:

| Page | Edge copy | Origin copy |
|---|---|---|
| `/` | **3 of 17** static assets 404 (cache age 63,205s) | 0 of 17 broken |
| `/garages` | **2 of 17** static assets 404 | 0 of 17 broken |

Same URL, same second — the only difference was whether the request hit the edge
cache or went through to the origin.

### What has been fixed in code

`next.config.ts` now sets `Cache-Control: public, max-age=0, must-revalidate` on
HTML documents, so the edge has to revalidate instead of trusting a year-old copy.
Next still sends an `ETag`, so revalidation is a cheap `304`, not a re-render.

Static assets are deliberately **not** touched: `/_next/static/*` keeps
`public, max-age=31536000, immutable`, `/_next/image` keeps its own 4-hour cache,
and `/images/*`, `/videos/*` and `/models/*` are untouched. The 132 MB of media
must stay edge-cacheable — see §12 and the 20 MB/s I/O ceiling.

### ⚠️ The code fix does not clean up what is already cached

Entries the edge stored **before** that fix were saved under the old one-year TTL.
The CDN has no reason to re-ask the origin for them, so deploying the fix does not
evict them. **After the first deploy carrying this fix, purge the CDN cache by
hand.** From then on the header does the work and routine deploys are safe — but
purging after each deploy remains the belt-and-braces habit, and it is one click.

If you cannot find a purge button, disabling the CDN and re-enabling it has the
same effect.

### How to know it worked

```
npm run smoke
```

`scripts/smoke.mjs` reads `sitemap.xml`, then for every route checks that the page
returns 200 and that **every `/_next/static` asset it references also returns
200** — fetching each page both through the CDN and past it, and reporting when
the two disagree. That comparison is the specific thing an uptime monitor cannot
see: the HTML kept returning `200 OK` for the whole outage. It was the files the
HTML pointed at that were missing.

Run it after every deploy. It exits non-zero on failure, so it can be wired into a
cron or an uptime check later.

---

## Appendix — every source used

| Topic | URL |
|---|---|
| Plan limits table (Business vs Cloud Startup) | https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/ |
| Adding a Node.js web app (main guide) | https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/ |
| Which plans support Node.js | https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/ |
| Hostinger's official Next.js starter (commands) | https://github.com/hostinger/deploy-nextjs |
| Selecting the Node.js version | https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/ |
| Environment variables during deployment | https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/ |
| Editing environment variables after deployment | https://www.hostinger.com/support/how-to-edit-or-add-environment-variables-after-deployment/ |
| Connecting a custom domain to a Node.js app | https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/ |
| Redeploying a Node.js app | https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/ |
| Build-log troubleshooting | https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/ |
| "Failed to build the application" | https://www.hostinger.com/support/fix-failed-to-build-application-error-hostinger-node-js/ |
| Runtime logs | https://www.hostinger.com/support/how-to-use-node-js-runtime-logs-at-hostinger/ |
| Empty `stderr.log` | https://www.hostinger.com/support/understanding-empty-stderr-log-in-node-js-applications/ |
| Migrating a Node.js app to Hostinger | https://www.hostinger.com/support/how-to-migrate-a-node-js-application-to-hostinger/ |
| Migrating from Vercel | https://www.hostinger.com/support/how-to-migrate-from-vercel-to-hostinger/ |
| Temporary / preview domains | https://www.hostinger.com/support/2489693-how-to-access-your-website-content-without-a-domain-in-hostinger/ |
| Connecting a subdomain | https://www.hostinger.com/support/6976680-how-to-connect-a-subdomain-to-hostinger-website-builder |
| Installing SSL | https://www.hostinger.com/support/1583258-how-to-install-lifetime-ssl-at-hostinger/ |
| Enabling SSH | https://www.hostinger.com/support/1583645-how-to-enable-ssh-access-in-hostinger/ |
| Hostinger CDN | https://www.hostinger.com/support/7935917-hostinger-cdn-website-optimization/ |
| Web Apps plan tiers & pricing | https://www.hostinger.com/web-apps-hosting |
| Next.js on shared hosting — memory reports | https://github.com/vercel/next.js/discussions/67617 |

**Next.js 16 documentation read locally** (per `AGENTS.md`, from the installed package rather than from memory):

| What it told us | File |
|---|---|
| `next start`'s `-p` flag defaults to 3000 and **reads the `PORT` env var** — so `"start": "next start"` needs no change (§7) | `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md` (line 121) |
| `PORT` cannot be set in `.env` — the HTTP server boots first (§7) | same file, line 333 |
| `next/image` optimisation "works self-hosted with zero configuration when deploying using `next start`" — confirms the Node-hosting decision (§12) | `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md` |
| A reverse proxy in front of `next start` is recommended — Hostinger provides this | same file |
| ISR/page cache is stored on local disk and works for a single `next start` instance with persistent disk — which is what Hostinger gives us | same file |
| `output: 'standalone'` does **not** copy `public/` or `.next/static` by default — a real trap if anyone tries it as a size optimisation | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md` (line 36) |

---

## Appendix B — the "UNVERIFIED" list

Everything in this runbook is sourced except these. Confirm each one in hPanel or with Hostinger support, then update this file.

1. **Does the `$PORT` variable work in the start command, or does the app need to bind to 3000?** Hostinger's own docs contradict each other. §7 gives you three variants to try. → Record which one worked: ________
2. **Is there a repository size limit on the GitHub integration?** Not published. Our repo carries 132 MB of committed binaries. → §4
3. **Does Hostinger auto-restart the Node process after a crash or a host reboot?** Not published. → §10. Ask support in writing.
4. **Does the temporary preview domain last 120 hours or for the life of the plan?** Sources conflict. → §9.1
5. **Will hPanel accept a no-op build command** (needed only for the local-build fallback)? Not documented. → §5, step 5
6. **How does Hostinger route `www` vs the apex for a Node.js app?** Not documented. → §8.3. Test all four URL forms.
