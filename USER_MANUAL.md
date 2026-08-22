# E-WISE user manual

E-WISE is a Butuan-focused e-waste platform. **Residents sell to the company**, the **cross-dock (admin)** weighs and pays, and **collectors claim company stock**. Collectors never go to a resident’s home.

---

## 1. Getting started

1. Open the landing page and choose **Log in** or **Register**.
2. On register, enter name, email, password, and a **role**:
   - **Resident** — sell household e-waste
   - **Admin** — cross-dock intake, payouts, claims, rates
   - **Collector** — claim paid company stock
3. After login you land on that role’s home. The header shows your role (RESIDENT / ADMIN / COLLECTOR).
4. Use the bottom nav for the main screens. **Profile** is where you log out.

Use a real email and password you can remember. Each account has one role.

---

## 2. Resident

**Nav:** Home · Sell · Activity · Profile

### Home

- Greeting and count of **active** listings (not paid, refused, or cancelled)
- Recent listings
- Published **₱/kg rate card** teaser

### Sell (6 steps)

1. **Photos** — at least one photo. Tap **Add** → **Take photo** (camera) or **Choose from gallery**. On a computer, Take photo uses the webcam (allow permission). Remove a photo with the X.
2. **Condition** — damage, batteries, leaks, etc.
3. **Category** — e.g. computing & mobile, large appliances (sets the ₱/kg rate).
4. **Hazard triage** — safety check. Status text under the bar rotates while it runs.
5. **Rate** — published ₱/kg. Choose **GCash** (number required) or **cash**.
6. **Pickup** — address and preferred window.

**Continue** stays disabled until the current step is valid.

**Tier 4 (intake refused):** the item is too hazardous to pick up. You are **not** paid. Call DENR-EMB Caraga / the DENR hotline shown on screen.

### After you submit

Typical path:

| Status | Meaning |
|---|---|
| Checking safety | Triage in progress |
| Awaiting your acceptance | Confirm the rate if asked |
| Pickup scheduled | Logistics will collect |
| Weighed — payout pending | At the cross-dock |
| Paid | Payout recorded (GCash or cash) |
| Cancelled | You cancelled before weigh-in |
| Intake refused | Unsafe to take |

### Activity

- List of your listings with **status** and **category** chips
- Open a card for photos, payout, pickup details
- **Cancel listing** only before weigh-in/payout, with a reason

### Profile

- Name, phone, address
- Default GCash number and payout method (used to prefill Sell)
- **Log out**

---

## 3. Admin (cross-dock)

**Nav:** Home · Intake · Claims · Activity · Profile

### Home

- Counts: scheduled pickups, weighed, paid today
- Unseen **collector claims**
- Shortcuts to intake, all listings, **edit ₱/kg**

### Intake

1. Open a **pickup scheduled** lot.
2. Confirm photos, resident, hazard tier.
3. Enter **weight (kg)**. Payout preview = weight × quoted ₱/kg.
4. Complete intake:
   - **Tiers 1–3:** status becomes **paid**; eligible stock can appear for collectors.
   - **Tier 4:** **refused** — not listed for collectors.

### Claims (collector inbox)

When a collector claims stock:

- Badge on **Claims** and a toast if you are in the app
- Open Claims: **Confirm** or **Reject**
  - **Confirm** — lot stays reserved. Collector is told pickup today (cross-dock) or delivery today.
  - **Reject** — lot goes back to **Browse** as paid/unclaimed
- Pending vs **Confirmed** badges (amber / teal)
- Opening Claims marks claims as seen (badge clears)

### Activity

- All resident listings
- Search (resident name / category), status chips, category chips
- Open a listing for intake or claim actions when relevant

### Rates

- Edit published **₱/kg** per category. Changes apply to new quotes.

### Profile

- Contact details and log out

---

## 4. Collector

**Nav:** Home · Browse · Orders · Profile

Collectors only see **company stock** that is **paid** and resale-eligible. No resident names or home addresses.

### Home

- **Available** vs **claimed** counts
- Preview of stock
- Pickup vs delivery reminder

### Browse

1. Open a lot (photos, kg, ₱, hazard tier, rate).
2. Choose **Pickup** (Butuan cross-dock) or **Delivery** (needs phone **and** address on Profile).
3. **Claim item**.

Status:

- **Pending** — waiting for admin
- **Confirmed** — admin accepted (pickup today / delivery today)

### Orders

- Your claimed lots (pending + confirmed)
- Rejected claims leave Orders and return to Browse
- If you are in the app: toast on confirm or decline

### Profile

- Phone and address **required for delivery**
- Log out

---

## 5. Hazard tiers (all roles)

| Tier | Meaning |
|---|---|
| 1 Standard | Normal pickup and handling |
| 2 Caution | Extra care, still eligible |
| 3 Hazardous | Hazardous track; can still be paid; not general resale |
| 4 Intake refused | No pickup; DENR guidance |

---

## 6. Money

- **Quote** = category ₱/kg (rate card).
- **Final payout** = **weight × rate**, set at intake.
- Resident chooses **GCash** or **cash**. The app records **status**, not a bank transfer.

---

## 7. Who talks to whom

```
Resident → E-WISE (admin/cross-dock) → Collector
```

- Residents never deal with collectors.
- Collectors never go to the resident.
- Pickup for collectors is the **Butuan cross-dock**, or **delivery to the collector**.

---

## 8. Tips

- **Photos:** at least one; camera or gallery; allow camera on PC.
- **Filters:** Activity chips only show statuses/categories you already have.
- **Realtime:** new claims, intake, and order updates appear without refresh if you are logged in.
- **Device mode in Chrome/Firefox** still uses the **PC webcam**, not a phone camera.
