# Payment Backend Gaps

This document records the backend work still needed before real payment providers can move from "display only" to executable channels in the Next.js frontend.

## Current first-version frontend behavior

- The payment page always renders a unified provider selector for:
  - `MOCK`
  - `ALIPAY`
  - `WECHAT`
  - `UNIONPAY`
  - `STRIPE`
  - `PAYPAL`
  - `APPLE_PAY`
  - `GOOGLE_PAY`
- Only `MOCK` is executable today.
- Real providers render as unavailable with explicit reasons instead of pretending to work.

## Backend gaps to close

### 1. Provider availability contract

Needed:

- an API that returns which payment channels are enabled for the current environment;
- optional per-channel reason fields for disabled or misconfigured providers;
- optional order-context rules, for example:
  - domestic-only orders;
  - cross-border orders;
  - minimum / maximum amount limits.

Suggested shape:

```json
{
  "providers": [
    {
      "channel": "ALIPAY",
      "available": true,
      "reason": null
    }
  ]
}
```

### 2. Channel enum alignment

Frontend already models:

- `MOCK`
- `ALIPAY`
- `WECHAT`
- `UNIONPAY`
- `STRIPE`
- `PAYPAL`
- `APPLE_PAY`
- `GOOGLE_PAY`

Backend currently treats real channels as future work. The `PaymentChannel` enum or equivalent channel field needs to align with the list above before real-provider execution can be enabled.

### 3. Payment initiation payloads

Real providers need a backend initiation endpoint that returns provider-specific execution data instead of only a final mock payment result.

Frontend needs to support at least these response families:

- `redirect`
  - URL to jump to a hosted checkout or gateway page
- `qr`
  - QR code payload or image URL
- `wallet-sheet`
  - wallet sheet / client token / publishable configuration
- `mock`
  - immediate payment result for local development

Suggested response sketch:

```json
{
  "channel": "STRIPE",
  "mode": "wallet-sheet",
  "paymentNo": "P202605170001",
  "clientToken": "...",
  "redirectUrl": null,
  "qrCodeUrl": null
}
```

### 4. Payment order channel update flow

Each order already has a waiting payment flow. Before real-channel execution, backend should support:

- updating the selected payment channel on an existing active payment order;
- preventing multiple active payment orders for one order;
- validating channel changes against provider availability and order context.

### 5. Callback and reconciliation handling

Real providers need callback / webhook verification for:

- payment success;
- payment failure / close;
- duplicate callback idempotency;
- third-party trade number persistence.

The frontend assumes these transitions will eventually map back into the existing payment status display:

- `WAITING_PAY`
- `PAYING`
- `PAID`
- `FAILED`
- `CLOSED`

### 6. Admin visibility improvements

For better operations tooling, backend should later expose:

- payment channel usage counts;
- payment failure reasons;
- reconciliation / callback anomalies;
- dashboard summaries for payment conversion and pending payment backlog.
