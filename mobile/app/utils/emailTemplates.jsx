export const paymentPendingTemplate = ({
  ownerName,
  renterName,
  product,
  productImage,
  rentalPrice,
  totalAmount,
  bookingDate,
  bookingId,
  deadlineHours = 24,
}) => {
  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const formattedRentalPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(rentalPrice ?? 0);

  const formattedTotal = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(totalAmount ?? 0);

  const commission = ((totalAmount ?? 0) * 0.3).toFixed(2);
  const formattedCommission = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(commission);

  // Parse productImage if it's a JSON array string
  let imageUrl = null;
  if (productImage) {
    try {
      const parsed = JSON.parse(productImage);
      imageUrl = Array.isArray(parsed) ? parsed[0] : productImage;
    } catch {
      imageUrl = productImage;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Pending</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      background-color: #f1f1f1;
      color: #1a1a1a;
      padding: 40px 16px;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, #C0392B 0%, #E74C3C 100%);
      padding: 32px 28px 28px;
      text-align: center;
      position: relative;
    }
    .header-icon {
      width: 52px;
      height: 52px;
      background: rgba(255,255,255,0.18);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
      font-size: 26px;
    }
    .header h1 {
      font-family: 'DM Sans', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    /* ── WARNING BANNER ── */
    .warning-banner {
      background: #FEF2F2;
      border-left: 4px solid #E74C3C;
      padding: 16px 24px;
      font-size: 13.5px;
      color: #C0392B;
      line-height: 1.6;
    }
    .warning-banner strong { font-weight: 700; }

    /* ── BODY ── */
    .body { padding: 28px 28px 0; }

    .greeting {
      font-size: 15px;
      color: #444;
      margin-bottom: 6px;
    }
    .greeting strong { color: #1a1a1a; font-weight: 700; }

    .subtext {
      font-size: 13.5px;
      color: #777;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    /* ── PRODUCT CARD ── */
    .product-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .product-img {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid #e5e5e5;
      background: #e8e8e8;
      flex-shrink: 0;
    }
    .product-img-placeholder {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      background: #e8e8e8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }
    .product-info h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    .product-meta {
      font-size: 13px;
      color: #666;
      line-height: 1.7;
    }
    .product-meta span { font-weight: 600; color: #333; }

    /* ── DIVIDER ── */
    .divider {
      border: none;
      border-top: 1px solid #f0f0f0;
      margin: 0 28px;
    }

    /* ── PRICING TABLE ── */
    .pricing { padding: 20px 28px; }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #555;
      padding: 8px 0;
    }
    .pricing-row.total {
      border-top: 2px solid #E74C3C;
      margin-top: 8px;
      padding-top: 14px;
      font-size: 16px;
      font-weight: 700;
      color: #C0392B;
    }
    .pricing-row.total .amount { font-size: 20px; }

    /* ── TIMER ── */
    .timer-section {
      text-align: center;
      padding: 16px 28px 20px;
      background: #FEF2F2;
      margin: 0 28px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .timer-label {
      font-size: 13px;
      color: #E74C3C;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .timer-value {
      font-size: 28px;
      font-weight: 700;
      color: #C0392B;
      letter-spacing: 2px;
      margin-top: 4px;
      font-family: 'DM Serif Display', serif;
    }

    /* ── BUTTONS ── */
    .buttons { padding: 0 28px 28px; }
    .btn-primary {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #C0392B, #E74C3C);
      color: #fff;
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-decoration: none;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      background: #fff;
      color: #444;
      text-align: center;
      padding: 14px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      border: 1.5px solid #e0e0e0;
    }

    /* ── FOOTER ── */
    .footer {
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      padding: 18px 28px;
      text-align: center;
      font-size: 12px;
      color: #aaa;
      line-height: 1.7;
    }
    .footer a { color: #E74C3C; text-decoration: none; }
    .booking-id {
      font-size: 11px;
      color: #bbb;
      margin-top: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="header-icon">⚠️</div>
      <h1>Payment Pending</h1>
    </div>

    <!-- Warning Banner -->
    <div class="warning-banner">
      Failure to remit the required payment within <strong>${deadlineHours} hours</strong>
      may result in <strong>account suspension</strong> and cancellation of this booking.
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Hello, <strong>${ownerName}</strong></p>
      <p class="subtext">
        A rental booking requires your immediate attention. Please review the details below and complete the payment before the deadline.
      </p>

      <!-- Product Card -->
      <div class="product-card">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${product}" class="product-img" />`
            : `<div class="product-img-placeholder">📦</div>`
        }
        <div class="product-info">
          <h3>${product || "Rental Item"}</h3>
          <div class="product-meta">
            Renter: <span>${renterName || "N/A"}</span><br/>
            Date: <span>${formattedDate}</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <!-- Pricing -->
    <div class="pricing">
      <div class="pricing-row">
        <span>Rental Price:</span>
        <span>${formattedRentalPrice}</span>
      </div>
      <div class="pricing-row">
        <span>Admin Commission (30%):</span>
        <span>${formattedCommission}</span>
      </div>
      <div class="pricing-row total">
        <span>Total Amount Due:</span>
        <span class="amount">${formattedTotal}</span>
      </div>
    </div>

    <hr class="divider" />

    <!-- Timer -->
    <div style="padding: 20px 28px;">
      <div class="timer-section">
        <div class="timer-label">⏳ Time Remaining</div>
        <div class="timer-value">${deadlineHours}:00:00</div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="buttons">
      <a href="#" class="btn-primary">Pay Now</a>
      <a href="#" class="btn-secondary">View Details</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      You're receiving this because you have an active booking on <a href="#">RentEase</a>.<br/>
      If you have questions, please contact our support team.
      <div class="booking-id">Booking ID: ${bookingId}</div>
    </div>

  </div>
</body>
</html>`;
};
