import base64
import os
import subprocess

logo_path = r"C:\Users\ASUS\.gemini\antigravity\brain\abd5c86a-87ab-4d46-83bc-7798d2cf2222\.user_uploaded\media_1795255186521_6ed5f8a3.jpg"
with open(logo_path, "rb") as f:
    logo_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lakshmi Agency - Project Architecture & Technical Blueprint</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

    @page {{
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {{
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #888;
      }}
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #2D1A29;
      background: #FFFFFF;
      line-height: 1.5;
      font-size: 10pt;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    .page-break {{
      page-break-after: always;
      break-after: page;
    }}

    /* Cover Page */
    .cover-container {{
      height: 100%;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 30mm 15mm 20mm;
      background: radial-gradient(circle at 50% 20%, #FFF5F9 0%, #FFFFFF 70%);
      border: 2px solid #E8D3B9;
      border-radius: 16px;
      position: relative;
    }}

    .cover-logo-wrapper {{
      width: 170px;
      height: 170px;
      margin: 0 auto 20px;
      border-radius: 50%;
      box-shadow: 0 12px 36px rgba(110, 16, 75, 0.15);
      padding: 6px;
      background: linear-gradient(135deg, #D4AF37, #FF80BF, #520D38);
    }}

    .cover-logo {{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background: #FFF;
    }}

    .cover-badge {{
      display: inline-block;
      background: linear-gradient(135deg, #520D38, #6E104B);
      color: #FFF;
      padding: 6px 18px;
      border-radius: 30px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(82, 13, 56, 0.2);
    }}

    .cover-title {{
      font-family: 'Playfair Display', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #520D38;
      line-height: 1.2;
      margin-bottom: 8px;
    }}

    .cover-subtitle {{
      font-size: 13pt;
      font-weight: 500;
      color: #D4AF37;
      letter-spacing: 0.5px;
      margin-bottom: 24px;
      font-style: italic;
    }}

    .cover-tagline {{
      font-size: 11pt;
      color: #665;
      max-width: 500px;
      margin: 0 auto 35px;
      line-height: 1.6;
    }}

    .cover-meta-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      width: 100%;
      max-width: 540px;
      margin-top: auto;
      padding-top: 25px;
      border-top: 1px solid #F0D9E7;
    }}

    .cover-meta-card {{
      background: #FFF9FC;
      border: 1px solid #F7DEEC;
      padding: 12px;
      border-radius: 10px;
      text-align: center;
    }}

    .cover-meta-label {{
      font-size: 7.5pt;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }}

    .cover-meta-val {{
      font-size: 9.5pt;
      font-weight: 700;
      color: #520D38;
    }}

    /* Standard Content Pages */
    .page-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #F3DBE9;
      margin-bottom: 18px;
    }}

    .page-header-left {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .header-logo-mini {{
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }}

    .page-header-title {{
      font-family: 'Playfair Display', serif;
      font-size: 11pt;
      font-weight: 700;
      color: #520D38;
    }}

    .page-header-tag {{
      font-size: 7.5pt;
      color: #D4AF37;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }}

    h1, h2, h3, h4 {{
      color: #520D38;
      font-weight: 700;
    }}

    .section-title {{
      font-family: 'Playfair Display', serif;
      font-size: 17pt;
      color: #520D38;
      margin-bottom: 6px;
      position: relative;
      display: inline-block;
    }}

    .section-desc {{
      font-size: 9.5pt;
      color: #5E505B;
      margin-bottom: 16px;
      line-height: 1.5;
    }}

    /* Cards */
    .card {{
      background: #FFFFFF;
      border: 1px solid #F2DEEB;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 14px;
      box-shadow: 0 4px 14px rgba(82, 13, 56, 0.04);
    }}

    .card-accent {{
      border-left: 4px solid #E83A89;
      background: #FFFDFE;
    }}

    .card-gold {{
      border-left: 4px solid #D4AF37;
      background: #FFFDF8;
    }}

    .card-title {{
      font-size: 11pt;
      font-weight: 700;
      color: #520D38;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    /* Tables */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 9pt;
    }}

    th {{
      background: #520D38;
      color: #FFFFFF;
      text-align: left;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 8.5pt;
      letter-spacing: 0.5px;
    }}

    th:first-child {{ border-top-left-radius: 8px; }}
    th:last-child {{ border-top-right-radius: 8px; }}

    td {{
      padding: 8px 12px;
      border-bottom: 1px solid #F3E5EE;
      color: #332B31;
    }}

    tr:nth-child(even) td {{
      background: #FFF9FC;
    }}

    .badge-free {{
      background: #E8F5E9;
      color: #2E7D32;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8pt;
      display: inline-block;
    }}

    .badge-role {{
      background: #FCE4EC;
      color: #C2185B;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8pt;
      display: inline-block;
    }}

    /* Flow Steps */
    .flow-steps {{
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin: 14px 0;
    }}

    .flow-step-item {{
      display: flex;
      gap: 12px;
      background: #FFFDFE;
      border: 1px solid #F5E5F0;
      border-radius: 10px;
      padding: 10px 14px;
      align-items: flex-start;
    }}

    .flow-step-num {{
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #520D38, #E83A89);
      color: #FFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 9pt;
      flex-shrink: 0;
      margin-top: 2px;
    }}

    .flow-step-content {{
      flex: 1;
    }}

    .flow-step-title {{
      font-weight: 700;
      font-size: 9.5pt;
      color: #520D38;
      margin-bottom: 2px;
    }}

    .flow-step-desc {{
      font-size: 8.5pt;
      color: #5E505B;
      line-height: 1.4;
    }}

    /* Policy Highlight Box */
    .policy-box {{
      background: linear-gradient(135deg, #FFF9FA 0%, #FFFDF8 100%);
      border: 1.5px dashed #D4AF37;
      border-radius: 12px;
      padding: 14px 16px;
      margin: 14px 0;
    }}

    .policy-title {{
      font-size: 10pt;
      font-weight: 700;
      color: #520D38;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .policy-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 8.5pt;
    }}

    .policy-item {{
      background: #FFF;
      border: 1px solid #F4E4EF;
      padding: 8px 10px;
      border-radius: 8px;
    }}

    .policy-item strong {{
      color: #E83A89;
    }}

    .footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #F0D9E7;
      padding-top: 10px;
      margin-top: 20px;
      font-size: 8pt;
      color: #8C7E88;
    }}
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-container page-break">
    <div style="margin-top: 10mm;">
      <div class="cover-logo-wrapper">
        <img class="cover-logo" src="data:image/jpeg;base64,{logo_base64}" alt="Lakshmi Agency Logo" />
      </div>
      <div class="cover-badge">Confidential Project Blueprint</div>
      <h1 class="cover-title">Lakshmi Agency</h1>
      <div class="cover-subtitle">Your Needs... Our Priority...</div>
      <p class="cover-tagline">
        End-to-End Technical Architecture & Automated Operational Blueprint for Next-Generation Deal Mediation, Review Operations & Payout Management.
      </p>
    </div>

    <div class="cover-meta-grid">
      <div class="cover-meta-card">
        <div class="cover-meta-label">Client Agency</div>
        <div class="cover-meta-val">Lakshmi Agency</div>
      </div>
      <div class="cover-meta-card">
        <div class="cover-meta-label">Architecture</div>
        <div class="cover-meta-val">Next.js + MongoDB</div>
      </div>
      <div class="cover-meta-card">
        <div class="cover-meta-label">Cost Efficiency</div>
        <div class="cover-meta-val">100% Free Cloud Stack</div>
      </div>
    </div>
  </div>

  <!-- PAGE 1: EXECUTIVE SUMMARY & ARCHITECTURE -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-left">
        <img class="header-logo-mini" src="data:image/jpeg;base64,{logo_base64}" alt="Logo" />
        <span class="page-header-title">Lakshmi Agency | Architecture Blueprint</span>
      </div>
      <span class="page-header-tag">Executive Plan</span>
    </div>

    <h2 class="section-title">1. Executive Overview & Philosophy</h2>
    <p class="section-desc">
      Lakshmi Agency is transitioning from traditional manual spreadsheet coordination to a fully automated, scalable digital ecosystem. The platform eliminates internal form fatigue by leveraging familiar <strong>Google Forms</strong> while retaining enterprise-grade automation: <strong>real-time slot deduction, order lifecycle tracking, countdown deadlines, and in-app alerts</strong>.
    </p>

    <div class="card card-accent">
      <div class="card-title">✨ Core Deliverables & Distinctions</div>
      <ul style="padding-left: 18px; font-size: 9pt; line-height: 1.6; color: #4A3E47;">
        <li><strong>External Google Forms with Zero Friction:</strong> Buyers submit orders and refunds via official Google Forms; no complex multi-step website registration required.</li>
        <li><strong>Automatic Stock & Slot Deduction:</strong> When a Google Form order is placed, available slots on the website are deducted automatically in real-time.</li>
        <li><strong>Intelligent Days & Payout Timers:</strong> Built-in Indian Working Days calculator (excluding weekends and public holidays) tracking the 20-day review deadline and 20–25 day payout period.</li>
        <li><strong>Distinctive Lakshmi Agency UI:</strong> Crafted around the agency's royal brand identity (Burgundy, Lotus Pink, Champagne Gold). Not a clone of third-party platforms.</li>
      </ul>
    </div>

    <h2 class="section-title" style="margin-top: 14px;">2. 100% Free Cloud Infrastructure</h2>
    <p class="section-desc">
      Engineered to eliminate monthly recurring software bills. All technologies operate permanently within enterprise-grade free tiers:
    </p>

    <table>
      <thead>
        <tr>
          <th>System Component</th>
          <th>Chosen Provider</th>
          <th>Capacity & Free Guarantee</th>
          <th>Monthly Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend & Backend Web Server</strong></td>
          <td>Vercel Deployment</td>
          <td>Production Edge Network with free automated SSL</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>Database Engine</strong></td>
          <td>MongoDB Atlas M0</td>
          <td>Cloud Cluster (512MB dedicated, millions of records)</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>Media & Screenshot Hosting</strong></td>
          <td>Cloudinary CDN</td>
          <td>25GB bandwidth & storage per month forever</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>Password Recovery Mailer</strong></td>
          <td>Nodemailer (Gmail SMTP)</td>
          <td>500 secure transactional OTP emails per day</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>Form Engine & Storage</strong></td>
          <td>Google Forms & Sheets</td>
          <td>Unlimited responses, encrypted cloud storage</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>Real-Time Webhook Pipe</strong></td>
          <td>Google Apps Script</td>
          <td>Zero-latency serverless triggers on Google Cloud</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
        <tr>
          <td><strong>In-App Notifications</strong></td>
          <td>Native MongoDB Event Stream</td>
          <td>Instant portal alerts with zero third-party socket fees</td>
          <td><span class="badge-free">₹0 / Month</span></td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <span>Lakshmi Agency &bull; Confidential &bull; Version 1.0</span>
      <span>Page 2</span>
    </div>
  </div>

  <!-- PAGE 2: GOOGLE FORM INTEGRATION & 9 AGENCY RULES -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-left">
        <img class="header-logo-mini" src="data:image/jpeg;base64,{logo_base64}" alt="Logo" />
        <span class="page-header-title">Lakshmi Agency | Automated Order Lifecycle</span>
      </div>
      <span class="page-header-tag">Operational Engine</span>
    </div>

    <h2 class="section-title">3. The 9-Step Agency Lifecycle Workflow</h2>
    <p class="section-desc">
      Every step defined in Lakshmi Agency's official policy is fully embedded into the platform's automated state machine:
    </p>

    <div class="flow-steps">
      <div class="flow-step-item">
        <div class="flow-step-num">1</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Order Placement on Marketplace</div>
          <div class="flow-step-desc">Buyer purchases product through the official link provided by the Premium User (Amazon, Flipkart, Myntra).</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">2</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Immediate Google Order Form Submission</div>
          <div class="flow-step-desc">Buyer fills <strong>https://forms.gle/ydedLFJwcef59hPD7</strong>. Google Apps Script fires an instant webhook to MongoDB. Deal slot is automatically reduced by 1. Order status is marked <strong>"ORDER_FILLED"</strong>.</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">3</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Product Delivery & Notification</div>
          <div class="flow-step-desc">Buyer receives delivery. Holding period clock begins ticking inside the system.</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">4</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Review Submission Window (4–5 Days)</div>
          <div class="flow-step-desc">Buyer submits review/rating on the marketplace within 4 to 5 days of delivery (image review preferred).</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">5</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Review Goes Live ➔ Fill Google Refund Form</div>
          <div class="flow-step-desc">Once approved by marketplace, buyer fills <strong>https://forms.gle/ssWFUKVpoxoKzKWc8</strong> with Order ID, review screenshot, and payout UPI.</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">6</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Strict 20-Day Form Completion Deadline</div>
          <div class="flow-step-desc">Refund form must be submitted within 20 days of delivery. The system displays a live countdown timer: <em>"On Track - X day(s) left before form closes"</em>.</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">7</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Disbursal in 20–25 Working Days</div>
          <div class="flow-step-desc">Upon refund form submission, the system triggers the 20 to 25 working days payout timer (automatically removing Saturdays, Sundays, and gazetted holidays).</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">8</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Official Form Only Enforcement</div>
          <div class="flow-step-desc">Only verified form submissions are recognized for payment. Submissions sent via personal WhatsApp or chat are rejected.</div>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-num">9</div>
        <div class="flow-step-content">
          <div class="flow-step-title">Strict Marketplace Fee Exclusions</div>
          <div class="flow-step-desc">COD charges, marketplace convenience fees, platform charges, and supercoins are strictly non-refundable.</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span>Lakshmi Agency &bull; Confidential &bull; Version 1.0</span>
      <span>Page 3</span>
    </div>
  </div>

  <!-- PAGE 3: 3 ROLES & ADMIN CONTROL -->
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <img class="header-logo-mini" src="data:image/jpeg;base64,{logo_base64}" alt="Logo" />
        <span class="page-header-title">Lakshmi Agency | User Roles & System Control</span>
      </div>
      <span class="page-header-tag">Role Specifications</span>
    </div>

    <h2 class="section-title">4. The Three Core Portals</h2>
    <p class="section-desc">
      The platform provides dedicated, role-tailored interfaces for seamless operation:
    </p>

    <div class="card card-accent">
      <div class="card-title"><span class="badge-role">ADMIN</span> Master Agency Command Center</div>
      <p style="font-size: 8.5pt; color: #4A3E47; line-height: 1.5;">
        &bull; <strong>Deals Studio:</strong> Add deals with Brand Name, Marketplace, Price, Review/Rating slots, and Cloudinary image upload.<br>
        &bull; <strong>WhatsApp Pitch Template Manager:</strong> Edit dynamic message templates (Order Message & Deal Announcements) with automatic tag replacement.<br>
        &bull; <strong>User & Mediator Directory:</strong> Manage Premium Users (Mediators) and registered Buyers, approve accounts, search by mobile or email.<br>
        &bull; <strong>Orders Master Ledger:</strong> View all agency orders, bulk status updates, transaction recording, and Google Sheet sync.
      </p>
    </div>

    <div class="card card-gold">
      <div class="card-title"><span class="badge-role" style="background:#FFF3E0; color:#E65100;">PREMIUM USER</span> Mediator Operations Portal</div>
      <p style="font-size: 8.5pt; color: #4A3E47; line-height: 1.5;">
        &bull; <strong>Orders Desk:</strong> Filter by "Needs Refund Only", track live 20-day countdowns, and inspect buyer details.<br>
        &bull; <strong>1-Click WhatsApp Client:</strong> Direct link to initiate customer WhatsApp chats with a single tap.<br>
        &bull; <strong>Browse Deals & Slot Tracker:</strong> Live slot availability with automatic "Slots Full" indicators.<br>
        &bull; <strong>1-Click Order Pitch Generator:</strong> Generates ready-to-send WhatsApp promo text embedding their prefilled Google Form URL.<br>
        &bull; <strong>In-App Notifications:</strong> Instant alert bell on order submissions and refund form arrivals.
      </p>
    </div>

    <div class="card" style="border-left: 4px solid #520D38;">
      <div class="card-title"><span class="badge-role" style="background:#EDE7F6; color:#512DA8;">USER</span> Buyer Tracking & History Portal</div>
      <p style="font-size: 8.5pt; color: #4A3E47; line-height: 1.5;">
        &bull; <strong>Order Progress Stepper:</strong> Real-time visual timeline showing holding days, review stage, and refund verification.<br>
        &bull; <strong>Direct Refund Form Access:</strong> 1-click button to open the Google Refund Form when eligible.<br>
        &bull; <strong>Profile & Bank/UPI Management:</strong> Store payment preferences securely for faster disbursements.<br>
        &bull; <strong>Clean Zero-Spam Alerts:</strong> Updates received via in-app notification center without email spam.
      </p>
    </div>

    <h2 class="section-title" style="margin-top: 14px;">5. Brand Identity & Visual Palette</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;">
      <div style="background: #520D38; color: #FFF; padding: 10px; border-radius: 8px; text-align: center; font-size: 8pt;">
        <strong>Royal Burgundy</strong><br>#520D38<br><span style="font-size:7pt;">Primary / Headers</span>
      </div>
      <div style="background: #E83A89; color: #FFF; padding: 10px; border-radius: 8px; text-align: center; font-size: 8pt;">
        <strong>Lotus Pink</strong><br>#E83A89<br><span style="font-size:7pt;">Accents / Highlights</span>
      </div>
      <div style="background: #D4AF37; color: #FFF; padding: 10px; border-radius: 8px; text-align: center; font-size: 8pt;">
        <strong>Champagne Gold</strong><br>#D4AF37<br><span style="font-size:7pt;">Borders / Badges</span>
      </div>
      <div style="background: #FFF8FA; color: #520D38; border: 1px solid #F0D9E7; padding: 10px; border-radius: 8px; text-align: center; font-size: 8pt;">
        <strong>Soft Pearl</strong><br>#FFF8FA<br><span style="font-size:7pt;">Luxury Background</span>
      </div>
    </div>

    <div class="footer">
      <span>Lakshmi Agency &bull; Confidential &bull; Version 1.0</span>
      <span>Page 4</span>
    </div>
  </div>

</body>
</html>
"""

html_path = r"f:\LAXMI\Lakshmi_Agency_Blueprint.html"
pdf_path = r"f:\LAXMI\Lakshmi_Agency_Project_Blueprint.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_exe,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Converting to PDF using headless Chrome...")
subprocess.run(cmd, check=True)
print(f"PDF successfully generated at: {pdf_path}")
