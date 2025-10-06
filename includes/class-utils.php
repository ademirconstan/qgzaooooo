<?php

class CompanyHub_Utils {
    
    public static function check_url_status($url) {
        $response = wp_remote_head($url, array(
            'timeout' => 10,
            'redirection' => 5,
            'user-agent' => 'Company Hub Bot/1.0'
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        return $status_code >= 200 && $status_code < 400;
    }
    
    public static function check_sites_uptime() {
        global $wpdb;
        
        $sites = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}companyhub_sites WHERE status = 'active'");
        
        foreach ($sites as $site) {
            $is_up = self::check_url_status($site->primary_url);
            $status = $is_up ? 'up' : 'down';
            
            // Update site status
            $wpdb->update(
                $wpdb->prefix . 'companyhub_sites',
                array(
                    'uptime_status' => $status,
                    'last_uptime_check' => current_time('mysql')
                ),
                array('id' => $site->id),
                array('%s', '%s'),
                array('%d')
            );
            
            // Send notification if site is down
            if (!$is_up && $site->uptime_status !== 'down') {
                self::send_downtime_notification($site);
            }
        }
    }
    
    public static function cleanup_old_data() {
        global $wpdb;
        
        // Clean old activity logs (older than 90 days)
        $wpdb->query($wpdb->prepare("
            DELETE FROM {$wpdb->prefix}ch_activity_log 
            WHERE created_at < %s
        ", date('Y-m-d H:i:s', strtotime('-90 days'))));
        
        // Clean old notifications (older than 30 days and read)
        $wpdb->query($wpdb->prepare("
            DELETE FROM {$wpdb->prefix}ch_notifications 
            WHERE created_at < %s AND is_read = 1
        ", date('Y-m-d H:i:s', strtotime('-30 days'))));
        
        // Clean expired sessions
        $wpdb->query($wpdb->prepare("
            DELETE FROM {$wpdb->prefix}ch_sessions 
            WHERE expires_at < %s
        ", current_time('mysql')));
    }
    
    public static function send_downtime_notification($site) {
        global $wpdb;
        
        // Get admin users
        $admins = $wpdb->get_results("
            SELECT * FROM {$wpdb->prefix}ch_users 
            WHERE role = 'admin' AND status = 'active'
        ");
        
        foreach ($admins as $admin) {
            // Create notification
            $wpdb->insert(
                $wpdb->prefix . 'ch_notifications',
                array(
                    'user_id' => $admin->id,
                    'title' => 'Site Fora do Ar',
                    'message' => "O site {$site->name} ({$site->url}) está fora do ar.",
                    'type' => 'error'
                ),
                array('%d', '%s', '%s', '%s')
            );
            
            // Send email notification
            self::send_email_notification($admin->email, 'Site Fora do Ar', "
                <h2>Alerta de Downtime</h2>
                <p>O site <strong>{$site->name}</strong> está fora do ar.</p>
                <p><strong>URL:</strong> {$site->primary_url}</p>
                <p><strong>Horário:</strong> " . current_time('d/m/Y H:i:s') . "</p>
                <p>Verifique o site o mais rápido possível.</p>
            ");
        }
    }
    
    public static function send_email_notification($to, $subject, $message) {
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: Company Hub <noreply@' . parse_url(home_url(), PHP_URL_HOST) . '>'
        );
        
        wp_mail($to, $subject, $message, $headers);
    }
    
    public static function format_currency($amount, $currency = 'BRL') {
        switch ($currency) {
            case 'BRL':
                return 'R$ ' . number_format($amount, 2, ',', '.');
            case 'USD':
                return '$' . number_format($amount, 2, '.', ',');
            case 'EUR':
                return '€' . number_format($amount, 2, ',', '.');
            default:
                return $currency . ' ' . number_format($amount, 2);
        }
    }
    
    public static function calculate_percentage_change($old_value, $new_value) {
        if ($old_value == 0) {
            return $new_value > 0 ? 100 : 0;
        }
        
        return round((($new_value - $old_value) / $old_value) * 100, 2);
    }
    
    public static function generate_api_key() {
        return wp_generate_password(32, false);
    }
    
    public static function encrypt_data($data, $key = null) {
        if (!$key) {
            $key = defined('AUTH_KEY') ? AUTH_KEY : 'company-hub-default-key';
        }
        
        if (empty($data)) {
            return '';
        }
        
        $method = 'AES-256-CBC';
        $iv_length = openssl_cipher_iv_length($method);
        $iv = openssl_random_pseudo_bytes($iv_length);
        $encrypted = openssl_encrypt($data, $method, $key, 0, $iv);
        
        if ($encrypted === false) {
            return '';
        }
        
        return base64_encode($iv . $encrypted);
    }
    
    public static function decrypt_data($encrypted_data, $key = null) {
        if (!$key) {
            $key = defined('AUTH_KEY') ? AUTH_KEY : 'company-hub-default-key';
        }
        
        if (empty($encrypted_data)) {
            return '';
        }
        
        $data = base64_decode($encrypted_data);
        if ($data === false) {
            return '';
        }
        
        $method = 'AES-256-CBC';
        $iv_length = openssl_cipher_iv_length($method);
        
        if (strlen($data) < $iv_length) {
            return '';
        }
        
        $iv = substr($data, 0, $iv_length);
        $encrypted = substr($data, $iv_length);
        
        $decrypted = openssl_decrypt($encrypted, $method, $key, 0, $iv);
        
        return $decrypted !== false ? $decrypted : '';
    }
    
    public static function log_activity($user_id, $action, $details = array()) {
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'ch_activity_log',
            array(
                'user_id' => $user_id,
                'action' => $action,
                'details' => wp_json_encode($details),
                'ip_address' => CompanyHub_Security::get_instance()->get_client_ip(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );
    }
    
    public static function create_notification($user_id, $title, $message, $type = 'info') {
        global $wpdb;
        
        return $wpdb->insert(
            $wpdb->prefix . 'ch_notifications',
            array(
                'user_id' => $user_id,
                'title' => $title,
                'message' => $message,
                'type' => $type
            ),
            array('%d', '%s', '%s', '%s')
        );
    }
    
    public static function get_user_notifications($user_id, $limit = 10) {
        global $wpdb;
        
        return $wpdb->get_results($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}ch_notifications 
            WHERE user_id = %d 
            ORDER BY created_at DESC 
            LIMIT %d
        ", $user_id, $limit));
    }
    
    public static function mark_notification_read($notification_id, $user_id) {
        global $wpdb;
        
        return $wpdb->update(
            $wpdb->prefix . 'ch_notifications',
            array('is_read' => 1),
            array('id' => $notification_id, 'user_id' => $user_id),
            array('%d'),
            array('%d', '%d')
        );
    }
    
    public static function validate_domain($domain) {
        return filter_var($domain, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME);
    }
    
    public static function check_ssl_certificate($url) {
        $parsed_url = parse_url($url);
        
        if ($parsed_url['scheme'] !== 'https') {
            return array('valid' => false, 'message' => 'Site não usa HTTPS');
        }
        
        $context = stream_context_create(array(
            'ssl' => array(
                'capture_peer_cert' => true,
                'verify_peer' => false,
                'verify_peer_name' => false
            )
        ));
        
        $stream = @stream_socket_client(
            'ssl://' . $parsed_url['host'] . ':443',
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT,
            $context
        );
        
        if (!$stream) {
            return array('valid' => false, 'message' => 'Não foi possível conectar via SSL');
        }
        
        $cert = stream_context_get_params($stream);
        $cert_info = openssl_x509_parse($cert['options']['ssl']['peer_certificate']);
        
        fclose($stream);
        
        $expiry_date = date('Y-m-d', $cert_info['validTo_time_t']);
        $days_until_expiry = ceil((strtotime($expiry_date) - time()) / (60 * 60 * 24));
        
        if ($days_until_expiry <= 0) {
            return array('valid' => false, 'message' => 'Certificado SSL expirado');
        } elseif ($days_until_expiry <= 30) {
            return array('valid' => true, 'message' => "Certificado SSL expira em {$days_until_expiry} dias", 'warning' => true);
        }
        
        return array('valid' => true, 'message' => 'Certificado SSL válido');
    }
    
    public static function backup_database() {
        global $wpdb;
        
        $tables = array(
            'ch_users', 'ch_sites', 'ch_accounts', 'ch_leads', 'ch_tasks',
            'ch_backlinks', 'ch_seo_keywords', 'ch_seo_rankings', 'ch_seo_audits',
            'ch_automation_rules', 'ch_automation_webhooks', 'ch_financial',
            'ch_metrics', 'ch_activity_log', 'ch_notifications', 'ch_sessions'
        );
        
        $backup_data = array();
        
        foreach ($tables as $table) {
            $full_table_name = $wpdb->prefix . $table;
            $results = $wpdb->get_results("SELECT * FROM {$full_table_name}", ARRAY_A);
            $backup_data[$table] = $results;
        }
        
        $backup_file = WP_CONTENT_DIR . '/company-hub-backup-' . date('Y-m-d-H-i-s') . '.json';
        file_put_contents($backup_file, wp_json_encode($backup_data, JSON_PRETTY_PRINT));
        
        return $backup_file;
    }
    
    public static function export_data($table, $format = 'csv') {
        global $wpdb;
        
        $full_table_name = $wpdb->prefix . 'ch_' . $table;
        $results = $wpdb->get_results("SELECT * FROM {$full_table_name}", ARRAY_A);
        
        if (empty($results)) {
            return false;
        }
        
        $filename = "company-hub-{$table}-" . date('Y-m-d') . ".{$format}";
        $filepath = WP_CONTENT_DIR . '/uploads/' . $filename;
        
        if ($format === 'csv') {
            $file = fopen($filepath, 'w');
            
            // Write headers
            fputcsv($file, array_keys($results[0]));
            
            // Write data
            foreach ($results as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        } else {
            file_put_contents($filepath, wp_json_encode($results, JSON_PRETTY_PRINT));
        }
        
        return $filepath;
    }
}