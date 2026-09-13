<?php
/**
 * Designs by KOA - Architectural Visualization Studio
 * Project Brief & Instant Quote Form Handler (Bluehost PHP Mailer)
 *
 * Designed for deployment on Bluehost (cPanel / Apache / PHP 7.4+ / PHP 8.x)
 */

// Prevent direct script execution via GET
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');

// =============================================================================
// 1. CONFIGURATION (Set your destination inbox email address here)
// =============================================================================
// The email where you want to receive project quotes and briefs:
$TO_EMAIL = 'projects@designsbykoa.com'; 

// Studio Sender Info (Used in the From header to ensure high deliverability)
$SERVER_HOST = $_SERVER['SERVER_NAME'] ?? 'designsbykoa.com';
$FROM_EMAIL = 'quotes@' . preg_replace('/^www\./', '', $SERVER_HOST);
$FROM_NAME  = 'Designs by KOA - Quote System';

// =============================================================================
// 2. SPAM HONEYPOT PROTECTION
// =============================================================================
// If the hidden honeypot field is filled, silently discard spam bot submission
if (!empty($_POST['website_url_hp'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your submission.'
    ]);
    exit;
}

// =============================================================================
// 3. SANITIZE & VALIDATE FORM INPUTS
// =============================================================================
$name           = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name']), ENT_QUOTES, 'UTF-8') : '';
$email          = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone          = isset($_POST['phone']) ? htmlspecialchars(trim($_POST['phone']), ENT_QUOTES, 'UTF-8') : 'Not provided';
$firm           = isset($_POST['firm']) ? htmlspecialchars(trim($_POST['firm']), ENT_QUOTES, 'UTF-8') : 'Not provided';
$project_type   = isset($_POST['project_type']) ? trim($_POST['project_type']) : 'res-exterior';
$views_count    = isset($_POST['views_count']) ? (int)$_POST['views_count'] : 1;
$lighting_mood  = isset($_POST['lighting_mood']) ? trim($_POST['lighting_mood']) : 'golden-hour';
$notes          = isset($_POST['notes']) ? htmlspecialchars(trim($_POST['notes']), ENT_QUOTES, 'UTF-8') : 'None provided';
$estimate_total = isset($_POST['estimate_total']) ? htmlspecialchars(trim($_POST['estimate_total']), ENT_QUOTES, 'UTF-8') : 'Custom Inquiry';

if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid client name and business email address.'
    ]);
    exit;
}

// Format Category & Lighting Labels
$category_map = [
    'res-exterior'   => 'Residential Exterior',
    'res-interior'   => 'Residential Interior',
    'comm-exterior'  => 'Commercial Exterior',
    'comm-interior'  => 'Commercial Interior',
    'floorplan-3d'   => '3D Cutaway Floor Plan',
    'animation-3d'   => 'Cinematic 3D Video Walkthrough'
];
$category_label = $category_map[$project_type] ?? $project_type;

$lighting_map = [
    'golden-hour'     => 'Twilight / Sunset Golden Hour (Signature)',
    'bright-daylight' => 'Bright Natural Midday Sunlight',
    'moody-night'     => 'Dramatic Moody Night with Interior Glow',
    'overcast'        => 'Soft Overcast / Editorial Studio'
];
$lighting_label = $lighting_map[$lighting_mood] ?? $lighting_mood;

$submission_time = date('F j, Y - g:i A T');

// =============================================================================
// 4. PROCESS FILE ATTACHMENTS (CAD / PDF / DWG / RVT / SKP / ZIP)
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
// 5. COMPOSE LUXURY HTML & PLAIN TEXT EMAILS
// =============================================================================
$subject = "[New Brief] {$name} - {$category_label} ({$estimate_total})";

// Branded HTML Body
$html_body = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Project Brief</title>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e0e2ec; margin: 0; padding: 24px; }
  .card { background-color: #12141a; border: 1px solid #232733; border-radius: 12px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .header { background: linear-gradient(135deg, #181a24 0%, #0d0e14 100%); border-bottom: 2px solid #cfa858; padding: 28px; text-align: center; }
  .header h1 { color: #f5f6f9; margin: 0 0 6px 0; font-size: 22px; letter-spacing: 1px; font-weight: 700; text-transform: uppercase; }
  .header p { color: #cfa858; margin: 0; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
  .content { padding: 28px; }
  .badge-est { background-color: rgba(207, 168, 88, 0.12); border: 1px solid #cfa858; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center; }
  .badge-est span { color: #cfa858; font-size: 18px; font-weight: 700; display: block; }
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #8e93a6; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #232733; padding-bottom: 6px; font-weight: 700; }
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
      <span style="font-size: 12px; text-transform: uppercase; color: #8e93a6; margin-bottom: 4px;">Dynamic Calculated Quote</span>
      <span>{$estimate_total}</span>
    </div>

    <div class="section-title">Client Information</div>
    <table>
      <tr><td class="label">Client Name:</td><td class="value"><strong>{$name}</strong></td></tr>
      <tr><td class="label">Work Email:</td><td class="value"><a href="mailto:{$email}">{$email}</a></td></tr>
      <tr><td class="label">Phone:</td><td class="value">{$phone}</td></tr>
      <tr><td class="label">Firm / Company:</td><td class="value">{$firm}</td></tr>
      <tr><td class="label">Received:</td><td class="value">{$submission_time}</td></tr>
    </table>

    <div class="section-title">Project Specifications</div>
    <table>
      <tr><td class="label">Project Scope:</td><td class="value">{$category_label}</td></tr>
      <tr><td class="label">Views / Angles:</td><td class="value">{$views_count} View(s)</td></tr>
      <tr><td class="label">Lighting / Mood:</td><td class="value">{$lighting_label}</td></tr>
      <tr><td class="label">CAD / Blueprint File:</td><td class="value">
HTML;

if ($has_attachment) {
    $html_body .= "✓ Attached: {$attachment_filename} ({$attachment_size_formatted})";
} elseif (!empty($attachment_filename)) {
    $html_body .= "File uploaded: {$attachment_filename} ({$attachment_size_formatted})";
} else {
    $html_body .= "None attached";
}

$html_body .= <<<HTML
      </td></tr>
    </table>

    <div class="section-title">Project Notes & Instructions</div>
    <div class="notes-box">
      {$notes}
    </div>
  </div>

  <div class="footer">
    Sent automatically by Designs by KOA Studio Engine &bull; Bluehost Dispatcher
  </div>
</div>
</body>
</html>
HTML;

// Plain text fallback
$plain_body = <<<TEXT
DESIGNS BY KOA - NEW PROJECT BRIEF & QUOTE
==========================================

Estimated Total: {$estimate_total}
Submitted: {$submission_time}

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
Lighting Mood: {$lighting_label}
Attachment: {$attachment_filename} ({$attachment_size_formatted})

PROJECT NOTES:
--------------
{$notes}

--
Designs by KOA Studio Engine
TEXT;

// =============================================================================
// 6. BUILD MULTIPART MIME HEADERS & DISPATCH EMAIL
// =============================================================================
$boundary_mixed = "==_MIMEMIXED_" . md5(time() . "mixed");
$boundary_alt   = "==_MIMEALT_" . md5(time() . "alt");

// Headers
$headers  = "From: {$FROM_NAME} <{$FROM_EMAIL}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary_mixed}\"\r\n";

// Mixed Message Body
$message = "--{$boundary_mixed}\r\n";
$message .= "Content-Type: multipart/alternative; boundary=\"{$boundary_alt}\"\r\n\r\n";

// Plain Text Part
$message .= "--{$boundary_alt}\r\n";
$message .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $plain_body . "\r\n\r\n";

// HTML Part
$message .= "--{$boundary_alt}\r\n";
$message .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $html_body . "\r\n\r\n";

$message .= "--{$boundary_alt}--\r\n";

// Attachment Part (if present)
if ($has_attachment && !empty($attachment_data)) {
    $message .= "--{$boundary_mixed}\r\n";
    $message .= "Content-Type: {$attachment_type}; name=\"{$attachment_filename}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$attachment_filename}\"\r\n\r\n";
    $message .= $attachment_data . "\r\n\r\n";
}

$message .= "--{$boundary_mixed}--";

// Execute PHP mail
$mail_sent = @mail($TO_EMAIL, $subject, $message, $headers);

if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$name}! Your brief has been submitted directly to our studio team. We will contact you at {$email} within 2 business hours."
    ]);
} else {
    // If local environment without sendmail or server restriction, notify user gracefully
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to dispatch email from local environment. When uploaded to Bluehost, PHP mail will send automatically.'
    ]);
}
