export const paymentPendingTemplate = ({
  ownerName,
  renterName,
  product,
  productImage,
  rentalPrice,
  adminCommission,
  totalAmount,
  bookingDate,
  bookingId,
  deadlineHours = 24,
}) => {
  const commission = (parseFloat(rentalPrice) * 0.3).toFixed(2);
  const commissionRate = 30;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Pending</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f5;
      padding: 40px 16px;
      color: #18181b;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
    }

    /* ── Brand header ── */
    .brand {
      text-align: center;
      margin-bottom: 24px;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 800;
      color: #c0392b;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 12px;
      color: #71717a;
      margin-top: 2px;
    }

    /* ── Card ── */
    .card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }

    /* ── Alert banner ── */
    .alert-banner {
      background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
      padding: 20px 28px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .alert-icon {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.20);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
    }
    .alert-title {
      color: #fff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .alert-subtitle {
      color: rgba(255,255,255,0.85);
      font-size: 12px;
      margin-top: 2px;
    }

    /* ── Warning strip ── */
    .warning-strip {
      background: #fff5f5;
      border-left: 4px solid #e74c3c;
      padding: 14px 28px;
      font-size: 13.5px;
      color: #c0392b;
      line-height: 1.5;
    }
    .warning-strip strong { font-weight: 700; }

    /* ── Greeting ── */
    .greeting {
      padding: 24px 28px 0;
      font-size: 15px;
      color: #3f3f46;
      line-height: 1.6;
    }
    .greeting strong { color: #18181b; }

    /* ── Booking card ── */
    .booking-card {
      margin: 20px 28px;
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .booking-img {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      object-fit: cover;
      background: #e4e4e7;
      flex-shrink: 0;
    }
    .booking-img-placeholder {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e4e4e7, #d4d4d8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }
    .booking-info { flex: 1; }
    .booking-product {
      font-size: 16px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 4px;
    }
    .booking-meta {
      font-size: 13px;
      color: #71717a;
      line-height: 1.7;
    }
    .booking-meta span { color: #3f3f46; font-weight: 600; }
    .booking-id {
      display: inline-block;
      margin-top: 6px;
      background: #f0f0f0;
      color: #52525b;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
      letter-spacing: 0.3px;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: #f0f0f0;
      margin: 0 28px;
    }

    /* ── Amount breakdown ── */
    .breakdown {
      padding: 20px 28px;
    }
    .breakdown-title {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #52525b;
      margin-bottom: 10px;
    }
    .breakdown-row .amount { font-weight: 600; color: #18181b; }
    .breakdown-row .badge {
      display: inline-block;
      background: #dcfce7;
      color: #16a34a;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 20px;
      margin-left: 6px;
    }

    /* ── Total row ── */
    .total-row {
      background: #fff5f5;
      border: 1.5px solid #fca5a5;
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .total-label {
      font-size: 14px;
      font-weight: 800;
      color: #c0392b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 900;
      color: #c0392b;
    }

    /* ── Timer ── */
    .timer-section {
      padding: 16px 28px 0;
      text-align: center;
    }
    .timer-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fef9c3;
      border: 1px solid #fde047;
      border-radius: 30px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      color: #854d0e;
    }
    .timer-icon { font-size: 16px; }

    /* ── CTA ── */
    .cta-section {
      padding: 20px 28px 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn-primary {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
      color: #fff !important;
      text-align: center;
      padding: 15px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(192,57,43,0.35);
    }
    .btn-secondary {
      display: block;
      width: 100%;
      background: #fff;
      color: #52525b !important;
      text-align: center;
      padding: 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1.5px solid #e4e4e7;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding: 24px 16px 8px;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.7;
    }
    .footer a { color: #c0392b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Brand -->
    <div class="brand">
      <div class="brand-name"></div>
      <div class="brand-tagline">Ezrent</div>
    </div>

    <!-- Card -->
    <div class="card">

      <!-- Alert Banner -->
      <div class="alert-banner">
        <div class="alert-icon"></div>
        <div>
          <div class="alert-title">PAYMENT PENDING</div>
          <div class="alert-subtitle">Action required within ${deadlineHours} hours</div>
        </div>
      </div>

      <!-- Warning Strip -->
      <div class="warning-strip">
        Failure to remit the required payment within <strong>${deadlineHours} hours</strong>
        may result in <strong>account suspension</strong> and removal of your listing.
      </div>

      <!-- Greeting -->
      <div class="greeting">
        Hello, <strong>${ownerName}</strong><br/>
        A rental transaction has been completed on your listing. Please review the
        breakdown below and remit your commission share at your earliest convenience.
      </div>

      <!-- Booking Card -->
      <div class="booking-card">
        ${
          productImage
            ? `<img src="${productImage}" alt="${product}" class="booking-img" />`
            : `<div class="booking-img-placeholder"></div>`
        }
        <div class="booking-info">
          <div class="booking-product">${product}</div>
          <div class="booking-meta">
            Renter: <span>${renterName}</span><br/>
            Date: <span>${new Date(bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div class="booking-id">ID: ${String(bookingId).slice(0, 12).toUpperCase()}</div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Amount Breakdown -->
      <div class="breakdown">
        <div class="breakdown-title">Payment Breakdown</div>

        <div class="breakdown-row">
          <span>Rental Price</span>
          <span class="amount">₱ ${parseFloat(rentalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>

        <div class="breakdown-row">
          <span>
            Admin Commission
            <span class="badge">${commissionRate}%</span>
          </span>
          <span class="amount">₱ ${commission}</span>
        </div>

        <div class="total-row">
          <span class="total-label">Total Amount Due</span>
          <span class="total-amount">₱ ${parseFloat(totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Timer -->
      <div class="timer-section">
        <div class="timer-pill">
          <span class="timer-icon"></span>
          Please remit within <strong>&nbsp;${deadlineHours} hours&nbsp;</strong> of receiving this notice
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="cta-section">
        <a href="${process.env.APP_URL || "#"}/owner/pay/${bookingId}" class="btn-primary">
          PAY NOW
        </a>
        <a href="${process.env.APP_URL || "#"}/owner/bookings/${bookingId}" class="btn-secondary">
          View Details
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      This is an automated message from <strong>RentEase</strong>.<br/>
      If you believe this is an error, please <a href="mailto:support@rentease.com">contact support</a>.<br/><br/>
      © ${new Date().getFullYear()} RentEase. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;
};
