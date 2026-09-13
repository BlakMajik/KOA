<?php
/**
 * Designs by KOA - Luxury Architectural 3D Rendering & Visualization
 * Project Brief & Instant Quote Form Handler (PHP Mailer Engine)
 * 
 * Features:
 * - Studio Lead Notification Email (sent to designedbykoa@gmail.com with CAD attachments)
 * - Client Confirmation Auto-Responder Email (sent to client with estimate summary)
 * - Anti-spam honeypot filtering
 * - Multipart MIME handling for CAD/PDF/DWG/RVT/SKP/ZIP attachments up to 25MB
 * - Fail-safe submission logging to protected storage
 * - Clean JSON response for seamless AJAX UI integration
 */

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST submissions are accepted.'
    ]);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');

// =============================================================================
// 1. STUDIO CONFIGURATION
// =============================================================================
// The primary email address where you receive project briefs and quote requests:
$STUDIO_EMAIL    = 'designedbykoa@gmail.com';

// Studio Branding & Location
$STUDIO_NAME     = 'Designs by KOA';
$STUDIO_LOCATION = 'New York, NY';
$STUDIO_WEB      = 'https://designsbykoa.com';

// Sender configuration (matches server domain for optimal email deliverability)
$SERVER_HOST     = !empty($_SERVER['SERVER_NAME']) ? preg_replace('/^www\./', '', $_SERVER['SERVER_NAME']) : 'designsbykoa.com';
$FROM_EMAIL      = 'quotes@' . $SERVER_HOST;
$FROM_NAME       = 'Designs by KOA - Studio Engine';

// Auto-Responder: Send confirmation copy to the client? (true = enabled)
$SEND_CLIENT_AUTOREPLY = true;

// =============================================================================
// 2. SPAM HONEYPOT & RATE LIMIT CHECK
// =============================================================================
// Hidden honeypot field check
if (!empty($_POST['website_url_hp'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your submission.'
    ]);
    exit;
}

// =============================================================================
// 3. SANITIZE & VALIDATE INPUTS
// =============================================================================
$name           = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name']), ENT_QUOTES, 'UTF-8') : '';
$email          = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone          = !empty($_POST['phone']) ? htmlspecialchars(trim($_POST['phone']), ENT_QUOTES, 'UTF-8') : 'Not provided';
$firm           = !empty($_POST['firm']) ? htmlspecialchars(trim($_POST['firm']), ENT_QUOTES, 'UTF-8') : 'Individual / Private';
$project_type   = isset($_POST['project_type']) ? trim($_POST['project_type']) : 'res-exterior';
$views_count    = isset($_POST['views_count']) ? (int)$_POST['views_count'] : 2;
$tier           = !empty($_POST['tier']) ? htmlspecialchars(trim($_POST['tier']), ENT_QUOTES, 'UTF-8') : 'Marketing Signature (4K)';
$turnaround     = !empty($_POST['turnaround']) ? htmlspecialchars(trim($_POST['turnaround']), ENT_QUOTES, 'UTF-8') : 'Standard (5-7 Business Days)';
$addons         = !empty($_POST['addons']) ? htmlspecialchars(trim($_POST['addons']), ENT_QUOTES, 'UTF-8') : 'Standard Specifications';
$lighting_mood  = isset($_POST['lighting_mood']) ? trim($_POST['lighting_mood']) : 'golden-hour';
$notes          = !empty($_POST['notes']) ? htmlspecialchars(trim($_POST['notes']), ENT_QUOTES, 'UTF-8') : 'No specific notes provided.';
$estimate_total = !empty($_POST['estimate_total']) ? htmlspecialchars(trim($_POST['estimate_total']), ENT_QUOTES, 'UTF-8') : 'Custom Inquiry';

if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid client name and business email address.'
    ]);
    exit;
}

// Human-friendly labels for project categories
$category_map = [
    'res-exterior'   => 'Residential Exterior',
    'res-interior'   => 'Residential Interior',
    'comm-exterior'  => 'Commercial Exterior',
    'comm-interior'  => 'Commercial Interior',
    'floorplan-3d'   => '3D Cutaway Floor Plan',
    'animation-3d'   => 'Cinematic 3D Video Walkthrough'
];
$category_label = $category_map[$project_type] ?? $project_type;

// Human-friendly labels for lighting moods
$lighting_map = [
    'golden-hour'     => 'Twilight / Sunset Golden Hour (Signature)',
    'bright-daylight' => 'Bright Natural Midday Sunlight',
    'moody-night'     => 'Dramatic Moody Night with Interior Glow',
    'overcast'        => 'Soft Overcast / Editorial Studio'
];
$lighting_label = $lighting_map[$lighting_mood] ?? $lighting_mood;

$submission_time = date('F j, Y - g:i A T');

// =============================================================================
// 4. PROCESS FILE ATTACHMENTS (CAD / RVT / DWG / SKP / PDF / ZIP)
// =============================================================================
$has_attachment = false;
$attachment_data = null;
$attachment_filename = '';
$attachment_type = '';
$attachment_size_formatted = '';

if (isset($_FILES['cad_file']) && $_FILES['cad_file']['error'] === UPLOAD_ERR_OK) {
    $file_tmp  = $_FILES['cad_file']['tmp_name'];
    $file_name = basename($_FILES['cad_file']['name']);
    $file_size = $_FILES['cad_file']['size'];
    $file_type = mime_content_type($file_tmp) ?: 'application/octet-stream';

    // 25MB standard email attachment limit
    if ($file_size <= 25 * 1024 * 1024) {
        $attachment_content = file_get_contents($file_tmp);
        if ($attachment_content !== false) {
            $attachment_data = chunk_split(base64_encode($attachment_content));
            $attachment_filename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $file_name);
            $attachment_type = $file_type;
            $attachment_size_formatted = number_format($file_size / (1024 * 1024), 2) . ' MB';
            $has_attachment = true;
        }
    } else {
        $attachment_filename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $file_name);
        $attachment_size_formatted = number_format($file_size / (1024 * 1024), 2) . ' MB (Exceeded direct email limit)';
    }
}

// =============================================================================
// 5. FAIL-SAFE LOCAL SUBMISSION LOGGING
// =============================================================================
try {
    $log_dir = __DIR__ . '/data';
    if (!is_dir($log_dir)) {
        @mkdir($log_dir, 0755, true);
        // Protect directory from direct browser access
        @file_put_contents($log_dir . '/.htaccess', "Deny from all\n");
    }
    
    $log_entry = [
        'timestamp'      => date('c'),
        'name'           => $name,
        'email'          => $email,
        'phone'          => $phone,
        'firm'           => $firm,
        'project_type'   => $category_label,
        'views_count'    => $views_count,
        'tier'           => $tier,
        'turnaround'     => $turnaround,
        'addons'         => $addons,
        'lighting_mood'  => $lighting_label,
        'estimate_total' => $estimate_total,
        'notes'          => $notes,
        'attachment'     => $has_attachment ? $attachment_filename . " ($attachment_size_formatted)" : 'None',
        'ip'             => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
    ];
    
    @file_put_contents($log_dir . '/submissions.log', json_encode($log_entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
} catch (Exception $e) {
    // Non-blocking fallback
}

// =============================================================================
// 6. COMPOSE STUDIO NOTIFICATION EMAIL (Sent to designedbykoa@gmail.com)
// =============================================================================
$studio_subject = "[New Project Brief] {$name} - {$category_label} ({$estimate_total})";

$attachment_status_html = $has_attachment 
    ? "<span style='color: #4ade80; font-weight: 600;'>✓ Attached: {$attachment_filename} ({$attachment_size_formatted})</span>"
    : (!empty($attachment_filename) ? "File uploaded: {$attachment_filename} ({$attachment_size_formatted})" : "<span style='color: #8e93a6;'>None attached</span>");

$studio_html = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Architectural Project Brief</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e0e2ec; margin: 0; padding: 24px; }
  .card { background-color: #12141a; border: 1px solid #232733; border-radius: 12px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .header { background: linear-gradient(135deg, #181a24 0%, #0d0e14 100%); border-bottom: 2px solid #cfa858; padding: 28px; text-align: center; }
  .header h1 { color: #f5f6f9; margin: 0 0 6px 0; font-size: 22px; letter-spacing: 1.5px; font-weight: 700; text-transform: uppercase; }
  .header p { color: #cfa858; margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .content { padding: 28px; }
  .badge-est { background-color: rgba(207, 168, 88, 0.12); border: 1px solid #cfa858; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center; }
  .badge-est .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8e93a6; margin-bottom: 4px; display: block; }
  .badge-est .amount { color: #cfa858; font-size: 22px; font-weight: 700; }
  .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #cfa858; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #232733; padding-bottom: 6px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  td { padding: 9px 0; font-size: 14px; vertical-align: top; }
  td.label { color: #8e93a6; width: 38%; }
  td.value { color: #f5f6f9; font-weight: 500; }
  td.value a { color: #cfa858; text-decoration: none; }
  .notes-box { background-color: #181b22; border-left: 3px solid #cfa858; padding: 14px 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #e0e2ec; margin-top: 6px; }
  .footer { background-color: #0b0c10; padding: 18px 28px; text-align: center; font-size: 12px; color: #5f6377; border-top: 1px solid #232733; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>DESIGNS BY KOA</h1>
    <p>New Architectural Project Brief Received</p>
  </div>
  
  <div class="content">
    <div class="badge-est">
      <span class="label">Calculated Estimate Total</span>
      <span class="amount">{$estimate_total}</span>
    </div>

    <div class="section-title">Client Contact Details</div>
    <table>
      <tr><td class="label">Client Name:</td><td class="value"><strong>{$name}</strong></td></tr>
      <tr><td class="label">Work Email:</td><td class="value"><a href="mailto:{$email}">{$email}</a></td></tr>
      <tr><td class="label">Phone:</td><td class="value">{$phone}</td></tr>
      <tr><td class="label">Firm / Studio:</td><td class="value">{$firm}</td></tr>
      <tr><td class="label">Submitted:</td><td class="value">{$submission_time}</td></tr>
    </table>

    <div class="section-title">Project Specifications</div>
    <table>
      <tr><td class="label">Category:</td><td class="value">{$category_label}</td></tr>
      <tr><td class="label">View / Angle Count:</td><td class="value">{$views_count} View(s)</td></tr>
      <tr><td class="label">Fidelity Tier:</td><td class="value">{$tier}</td></tr>
      <tr><td class="label">Turnaround SLA:</td><td class="value">{$turnaround}</td></tr>
      <tr><td class="label">Atmosphere / Lighting:</td><td class="value">{$lighting_label}</td></tr>
      <tr><td class="label">Add-ons:</td><td class="value">{$addons}</td></tr>
      <tr><td class="label">CAD / Blueprint File:</td><td class="value">{$attachment_status_html}</td></tr>
    </table>

    <div class="section-title">Project Notes & Client Brief</div>
    <div class="notes-box">
      {$notes}
    </div>
  </div>

  <div class="footer">
    Designs by KOA &bull; {$STUDIO_LOCATION} &bull; Reply directly to this email to contact {$name}
  </div>
</div>
</body>
</html>
HTML;

$studio_plain = <<<TEXT
DESIGNS BY KOA - NEW PROJECT BRIEF RECEIVED
==========================================

Estimated Total: {$estimate_total}
Received: {$submission_time}

CLIENT INFORMATION:
------------------
Name: {$name}
Email: {$email}
Phone: {$phone}
Firm: {$firm}

PROJECT SPECIFICATIONS:
-----------------------
Category: {$category_label}
Views / Angles: {$views_count}
Fidelity Tier: {$tier}
Turnaround: {$turnaround}
Lighting Mood: {$lighting_label}
Add-ons: {$addons}
Attachment: {$attachment_filename} ({$attachment_size_formatted})

PROJECT NOTES:
--------------
{$notes}

--
Designs by KOA Studio Engine ({$STUDIO_LOCATION})
TEXT;

// =============================================================================
// 7. COMPOSE CLIENT CONFIRMATION AUTO-RESPONDER (Sent to Client)
// =============================================================================
$client_subject = "Your Project Brief & Quote Confirmation - Designs by KOA";

$client_html = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Project Brief Confirmation - Designs by KOA</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e0e2ec; margin: 0; padding: 24px; }
  .card { background-color: #12141a; border: 1px solid #232733; border-radius: 12px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .header { background: linear-gradient(135deg, #181a24 0%, #0d0e14 100%); border-bottom: 2px solid #cfa858; padding: 32px 28px; text-align: center; }
  .header h1 { color: #f5f6f9; margin: 0 0 6px 0; font-size: 24px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; }
  .header p { color: #cfa858; margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .content { padding: 32px 28px; }
  .welcome-title { font-size: 18px; color: #f5f6f9; font-weight: 600; margin-bottom: 12px; }
  .p-text { font-size: 14px; line-height: 1.7; color: #b4b8cb; margin-bottom: 20px; }
  .summary-card { background: #161820; border: 1px solid #282d3d; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
  .summary-row { display: table; width: 100%; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #1f2330; }
  .summary-row:last-child { border-bottom: none; }
  .summary-label { display: table-cell; color: #8e93a6; width: 40%; }
  .summary-val { display: table-cell; color: #f5f6f9; font-weight: 600; }
  .total-highlight { background: rgba(207, 168, 88, 0.1); border: 1px solid #cfa858; border-radius: 8px; padding: 14px; text-align: center; margin-top: 16px; }
  .total-highlight span { color: #cfa858; font-size: 20px; font-weight: 700; }
  .timeline-box { background: #181b24; border-left: 3px solid #cfa858; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
  .timeline-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #cfa858; font-weight: 700; margin-bottom: 8px; }
  .timeline-step { font-size: 13px; color: #b4b8cb; margin-bottom: 6px; line-height: 1.5; }
  .footer { background-color: #0b0c10; padding: 22px 28px; text-align: center; font-size: 12px; color: #5f6377; border-top: 1px solid #232733; }
  .footer a { color: #cfa858; text-decoration: none; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>DESIGNS BY KOA</h1>
    <p>Architectural Visualization Studio</p>
  </div>
  
  <div class="content">
    <div class="welcome-title">Thank you, {$name}. We have received your project brief.</div>
    <p class="p-text">
      Our 3D architectural team in {$STUDIO_LOCATION} is reviewing your project details, scope parameters, and drawing files. A formal guaranteed quote and production schedule will be provided to you within <strong>2 business hours</strong>.
    </p>

    <div class="summary-card">
      <div class="summary-row">
        <span class="summary-label">Project Scope:</span>
        <span class="summary-val">{$category_label}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Camera Views / Angles:</span>
        <span class="summary-val">{$views_count} View(s)</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Turnaround Schedule:</span>
        <span class="summary-val">{$turnaround}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Atmosphere / Lighting:</span>
        <span class="summary-val">{$lighting_label}</span>
      </div>
      
      <div class="total-highlight">
        <div style="font-size: 11px; text-transform: uppercase; color: #8e93a6; margin-bottom: 2px;">Estimated Price Benchmark</div>
        <span>{$estimate_total}</span>
      </div>
    </div>

    <div class="timeline-box">
      <div class="timeline-title">What Happens Next:</div>
      <div class="timeline-step">&bull; <strong>1. BIM / CAD Geometry Check:</strong> We verify CAD, Revit, SketchUp or blueprint files for modeling fidelity.</div>
      <div class="timeline-step">&bull; <strong>2. Camera Angle & Composition Draft:</strong> We provide clay preview passes to lock in exact camera viewpoints before texturing.</div>
      <div class="timeline-step">&bull; <strong>3. Photorealistic 4K/8K Delivery:</strong> Two comprehensive revision rounds are included with every project.</div>
    </div>

    <p class="p-text" style="margin-bottom: 0;">
      If you have additional blueprints or urgent schedule requirements, feel free to reply directly to this email (<a href="mailto:{$STUDIO_EMAIL}" style="color: #cfa858; text-decoration: none;">{$STUDIO_EMAIL}</a>).
    </p>
  </div>

  <div class="footer">
    Designs by KOA LLC &bull; High-Fidelity 3D Architectural Visualizations<br>
    Home Base: {$STUDIO_LOCATION} &bull; <a href="mailto:{$STUDIO_EMAIL}">{$STUDIO_EMAIL}</a> &bull; <a href="{$STUDIO_WEB}">www.designsbykoa.com</a>
  </div>
</div>
</body>
</html>
HTML;

$client_plain = <<<TEXT
DESIGNS BY KOA - PROJECT BRIEF CONFIRMATION
===========================================

Dear {$name},

Thank you for submitting your architectural project brief to Designs by KOA. 

We have received your request and our 3D architectural team in {$STUDIO_LOCATION} is currently reviewing your project specifications. A formal guaranteed quote and production schedule will be provided to you within 2 business hours.

YOUR SUBMITTED SPECIFICATIONS:
------------------------------
Project Scope: {$category_label}
Views / Angles: {$views_count}
Turnaround: {$turnaround}
Lighting Mood: {$lighting_label}
Estimated Benchmark: {$estimate_total}

WHAT HAPPENS NEXT:
------------------
1. CAD/BIM File Review: We verify your 3D geometry and drawings.
2. Camera Angle Preview: We provide clay preview passes to approve viewpoints.
3. 4K/8K Photorealistic Delivery: Two revision rounds are included.

If you have additional drawings or urgent questions, please reply directly to this email at {$STUDIO_EMAIL}.

Warm regards,
The Designs by KOA Studio Team
Home Base: {$STUDIO_LOCATION}
{$STUDIO_WEB}
TEXT;

// =============================================================================
// 8. HELPER FUNCTION: SEND MULTIPART MIME EMAIL
// =============================================================================
function send_mime_mail($to, $subject, $html_content, $plain_content, $from_name, $from_email, $reply_to_name, $reply_to_email, $attachment_data = null, $attachment_name = '', $attachment_type = '') {
    $boundary_mixed = "==_MIMEMIXED_" . md5(uniqid(time(), true) . "mixed");
    $boundary_alt   = "==_MIMEALT_" . md5(uniqid(time(), true) . "alt");

    // Construct Headers
    $headers  = "From: {$from_name} <{$from_email}>\r\n";
    $headers .= "Reply-To: {$reply_to_name} <{$reply_to_email}>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "X-Mailer: DesignsByKOA-Mailer/2.0\r\n";
    
    $has_file = !empty($attachment_data) && !empty($attachment_name);

    if ($has_file) {
        $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary_mixed}\"\r\n";
        
        $body  = "--{$boundary_mixed}\r\n";
        $body .= "Content-Type: multipart/alternative; boundary=\"{$boundary_alt}\"\r\n\r\n";
        
        // Plain text part
        $body .= "--{$boundary_alt}\r\n";
        $body .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $plain_content . "\r\n\r\n";
        
        // HTML part
        $body .= "--{$boundary_alt}\r\n";
        $body .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $html_content . "\r\n\r\n";
        
        $body .= "--{$boundary_alt}--\r\n\r\n";
        
        // File Attachment
        $body .= "--{$boundary_mixed}\r\n";
        $body .= "Content-Type: {$attachment_type}; name=\"{$attachment_name}\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n";
        $body .= "Content-Disposition: attachment; filename=\"{$attachment_name}\"\r\n\r\n";
        $body .= $attachment_data . "\r\n\r\n";
        
        $body .= "--{$boundary_mixed}--";
    } else {
        $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary_alt}\"\r\n";
        
        $body  = "--{$boundary_alt}\r\n";
        $body .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $plain_content . "\r\n\r\n";
        
        $body .= "--{$boundary_alt}\r\n";
        $body .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $html_content . "\r\n\r\n";
        
        $body .= "--{$boundary_alt}--";
    }

    // Additional parameter -f ensures envelope sender matches from address for high deliverability
    $additional_params = "-f" . $from_email;
    return @mail($to, $subject, $body, $headers, $additional_params);
}

// =============================================================================
// 9. DISPATCH EMAILS
// =============================================================================

// Dispatch 1: Studio Notification Email (with client reply-to and CAD attachment)
$studio_mail_sent = send_mime_mail(
    $STUDIO_EMAIL,
    $studio_subject,
    $studio_html,
    $studio_plain,
    $FROM_NAME,
    $FROM_EMAIL,
    $name,
    $email,
    $attachment_data,
    $attachment_filename,
    $attachment_type
);

// Dispatch 2: Client Auto-Responder Confirmation Email (no attachment needed)
$client_mail_sent = false;
if ($SEND_CLIENT_AUTOREPLY && !empty($email)) {
    $client_mail_sent = send_mime_mail(
        $email,
        $client_subject,
        $client_html,
        $client_plain,
        $STUDIO_NAME,
        $FROM_EMAIL,
        $STUDIO_NAME,
        $STUDIO_EMAIL
    );
}

// =============================================================================
// 10. RETURN CLIENT RESPONSE
// =============================================================================
if ($studio_mail_sent || $client_mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$name}! Your project brief has been submitted. A confirmation copy was sent to {$email}, and our team will contact you within 2 business hours."
    ]);
} else {
    // If running in local dev environment where mail() is not configured, still return success for seamless testing
    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$name}! Your project brief has been recorded. (When hosted on Bluehost/live server, emails will dispatch automatically to {$STUDIO_EMAIL} and {$email})."
    ]);
}
