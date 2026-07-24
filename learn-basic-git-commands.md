# Git guide for Sandy — get the latest updates

Hi Sandy 👋

Don’t worry about breaking anything. Follow this guide step by step.  
If something looks wrong, stop and send the error message — we’ll help.

Mahmoud walked you through this file so you can use Git safely on the Falcon Codes project.  
**Keep using this guide** whenever you need to pull the latest work or start a new task.

We combine finished work into a shared branch called **`development`**.  
**For now, use `development` as your starting point.**

---

## What’s on `development` right now (latest)

As of the latest merge, **`development` is the current Figma-aligned clone** with **responsive mobile finished** for these pages:

| Page | File | Status |
|------|------|--------|
| Home | `index.html` | Done — desktop + mobile |
| About | `about.html` | Done — desktop + mobile |
| Contact | `contact.html` | Done — desktop + mobile |
| Services (list) | `services.html` | Done — desktop + mobile |
| Web Development (detail) | `web.html` | Done — desktop + mobile (shared header + footer) |

Also shared across pages: the site header, mobile tab bar, and footer CTA zone.

**Pull `development` to get this full set.**

---

## Next task (deliver Saturday morning)

This is the next piece to ship:

1. **Use `web.html` as the template** for other service detail pages (same layout / header / footer pattern).
2. **Create JSON file(s)** that hold each service’s content:
   - titles, text, lists
   - **image paths**
   - any other detail fields the page needs
3. **Update the parent Services list page** (`services.html`) so it **reads the services list from JSON** (not hard-coded only).
4. When the user **clicks a service**, open the detail page and **load that service’s data from JSON** (same idea as dumping the detail fields into the `web.html`-style page).

Goal for Saturday morning: list page driven by JSON + detail page filled from JSON when a service is clicked.

Suggested branch name when you start (from `development`):

```bash
git checkout -b sandy-services-json
```

---

## Branches (simple)

| Branch | What it is | What you should do |
|--------|------------|--------------------|
| `main` | Older / stable line | Don’t start new work here for now |
| `mobile` | Older mobile line (already folded into development) | You don’t need this now |
| **`development`** | **Latest shared project (Figma clone + responsive pages above)** | **Start here. Pull this. Build from this.** |

Repo: `https://github.com/SandyKaliny/falcon-codes`

### Best practice for our project (read this)

1. **Latest expected working code right now = `development`**  
   That’s the branch where finished pieces should land first so we can all see them together.

2. **`main` is not “abandoned”** — later, when `development` looks good and stable, we merge into `main`.  
   So: **finish work into `development` first**, not straight into `main` while things are still moving.

3. **Don’t edit directly on `development` for big new features** (best practice).  
   Create your **own small branch from `development`**, do your work there, then we merge it back into `development`.

4. You **do not** need to manually copy mobile work into your branch.  
   When you start from `development`, the responsive pages listed above are already included.

---

## How to get the latest `development` branch

Open a terminal **inside your Falcon Codes project folder**, then run:

```bash
git fetch origin
git checkout development
git pull origin development
```

That’s it. You now have the latest shared version (home, about, contact, services, web — responsive).

Open the site from this folder as usual (for example `index.html` or `web.html`).

---

## If `development` doesn’t exist on your computer yet

First time only:

```bash
git fetch origin
git checkout -b development origin/development
```

Next times, just use:

```bash
git checkout development
git pull origin development
```

---

## Before you pull (if you have unsaved local edits)

Check:

```bash
git status
```

- If it says **clean** → safe to pull.
- If you have files you changed and want to keep → commit them first on your own branch (see below), or ask before pulling.

---

## Quick check that you’re on the right branch

```bash
git branch
```

The branch with `*` should be:

```text
* development
```

---

## Best way for you to work: create your own branch from `development`

This is the recommended practice.

### Step 1 — Update `development`

```bash
git fetch origin
git checkout development
git pull origin development
```

### Step 2 — Create your new branch from it

Pick a clear name, for example:

- `sandy-services-json` ← good name for the Saturday task
- `sandy-about-updates`
- `sandy-contact-form`

```bash
git checkout -b sandy-services-json
```

You are now on your own branch, based on the latest `development`  
(so you already have the responsive home / about / contact / services / web work).

### Step 3 — Make your edits, then save them

```bash
git status
git add .
git commit -m "Describe your update in a short sentence"
```

### Step 4 — Send your branch to GitHub

```bash
git push -u origin sandy-services-json
```

(Use your real branch name instead of `sandy-services-json`.)

### Step 5 — Merge into `development` (together)

After your work looks good:

- open a Pull Request on GitHub: **your branch → `development`**  
  or tell us your branch is ready and we’ll merge it with you.

**Do not merge into `main` by yourself for now.**  
We put finished shared work into **`development` first**.

---

## What if you already did work on `main`?

No stress. Tell us, and we’ll help move it.  
In many cases the safe idea is:

1. Save your work (commit on your current branch).
2. Update `development`.
3. Create a new branch from `development`.
4. Bring your commits over carefully (we can help with this).

You don’t need to solve that alone.

---

## Where should “finished” code live?

| Question | Answer |
|----------|--------|
| Where is the latest expected combined code **today**? | **`development`** |
| What’s finished there now? | Home, About, Contact, Services, Web — responsive / Figma-aligned |
| What’s next (Saturday morning)? | JSON-driven services list + detail pages (from `web.html` pattern) |
| Where should your new finished feature go first? | Merge into **`development`** |
| When does code go to **`main`**? | Later, when `development` is stable and we agree it’s ready |
| Do you need the `mobile` branch every day? | **No** — that work is already inside `development` |

So you can relax:  
**pull `development` → create your branch from it → work → push → merge back to `development`.**

---

## Optional: look at `main` later (not for daily work)

```bash
git checkout main
git pull origin main
```

Remember: for current work, go back to `development` (or your branch created from it).

---

## Need help?

### Get back to Mahmoud and he’ll walk you through this file if you face any problems.

If a command shows an error, copy the **full message** and send it — we’ll help fix it.  
Please don’t force-push, and don’t delete branches unless we agree together.

You’re not expected to manage all branches alone.  
Your simple loop is enough:

1. Pull latest `development`  
2. Create your branch from it  
3. Commit + push your work  
4. Merge into `development` when ready
