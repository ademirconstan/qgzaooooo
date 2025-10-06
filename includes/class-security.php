<?php

class CompanyHub_Security {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init_security'));
        add_filter('wp_headers', array($this, 'add_security_headers'));
        add_action('wp_login_failed', array($this, 'log_failed_login'));
        add_action('wp_login', array($this, 'log_successful_login'), 10, 2);
    }
    
    public function init_security() {
        // Rate limiting for API endpoints
        add_action('rest_api_init', array($this, 'setup_rate_limiting'));
        
        // CSRF protection
        add_action('wp_ajax_nopriv_company_hub_action', array($this, 'verify_nonce'));
        add_action('wp_ajax_company_hub_action', array($this, 'verify_nonce'));
    }
    
    public function add_security_headers($headers) {
        // Only add headers for Company Hub pages
        if (get_query_var('company_hub_page') !== false) {
            $headers['X-Frame-Options'] = 'SAMEORIGIN';
            $headers['X-Content-Type-Options'] = 'nosniff';
            $headers['X-XSS-Protection'] = '1; mode=block';
            $headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
            $headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";
        }
        
        return $headers;
    }
    
    public function setup_rate_limiting() {
        // Simple rate limiting for login attempts
        add_filter('rest_pre_dispatch', array($this, 'rate_limit_login'), 10, 3);
    }
    
    public function rate_limit_login($result, $server, $request) {
        $route = $request->get_route();
        
        if ($route === '/company-hub/v1/auth/login') {
            $ip = $this->get_client_ip();
            $attempts = get_transient('ch_login_attempts_' . md5($ip));
            
            if ($attempts && $attempts >= 5) {
                return new WP_Error(
                    'too_many_attempts',
                    'Muitas tentativas de login. Tente novamente em 15 minutos.',
                    array('status' => 429)
                );
            }
        }
        
        return $result;
    }
    
    public function log_failed_login($username) {
        $ip = $this->get_client_ip();
        
        // Increment failed attempts
        $attempts = get_transient('ch_login_attempts_' . md5($ip)) ?: 0;
        $attempts++;
        set_transient('ch_login_attempts_' . md5($ip), $attempts, 15 * MINUTE_IN_SECONDS);
        
        // Log the attempt
        $this->log_security_event('failed_login', array(
            'username' => $username,
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'attempts' => $attempts
        ));
    }
    
    public function log_successful_login($user_login, $user) {
        $ip = $this->get_client_ip();
        
        // Clear failed attempts on successful login
        delete_transient('ch_login_attempts_' . md5($ip));
        
        // Log successful login
        $this->log_security_event('successful_login', array(
            'user_id' => $user->ID,
            'username' => $user_login,
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ));
    }
    
    public function verify_nonce() {
        if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'company_hub_action')) {
            wp_die('Security check failed');
        }
    }
    
    public function sanitize_input($input, $type = 'text') {
        switch ($type) {
            case 'email':
                return sanitize_email($input);
            case 'url':
                return esc_url_raw($input);
            case 'textarea':
                return sanitize_textarea_field($input);
            case 'html':
                return wp_kses_post($input);
            case 'int':
                return intval($input);
            case 'float':
                return floatval($input);
            case 'array':
                return is_array($input) ? array_map('sanitize_text_field', $input) : array();
            default:
                return sanitize_text_field($input);
        }
    }
    
    public function escape_output($output, $context = 'html') {
        switch ($context) {
            case 'attr':
                return esc_attr($output);
            case 'url':
                return esc_url($output);
            case 'js':
                return esc_js($output);
            case 'textarea':
                return esc_textarea($output);
            case 'html':
                return wp_kses_post($output);
            default:
                return esc_html($output);
        }
    }
    
    public function validate_permissions($action, $user_id = null) {
        $auth = CompanyHub_Auth::get_instance();
        
        if (!$auth->is_logged_in()) {
            return false;
        }
        
        $current_user = $auth->get_current_user();
        
        // Admin can do everything
        if ($current_user->role === 'admin') {
            return true;
        }
        
        // Define action permissions
        $permissions = array(
            'view_dashboard' => array('admin', 'collaborator'),
            'view_sites' => array('admin', 'collaborator'),
            'manage_sites' => array('admin'),
            'view_leads' => array('admin', 'collaborator'),
            'manage_leads' => array('admin', 'collaborator'),
            'view_tasks' => array('admin', 'collaborator'),
            'manage_tasks' => array('admin', 'collaborator'),
            'view_financial' => array('admin'),
            'manage_financial' => array('admin'),
            'view_settings' => array('admin'),
            'manage_settings' => array('admin'),
            'manage_integrations' => array('admin'),
            'manage_automation' => array('admin')
        );
        
        return isset($permissions[$action]) && in_array($current_user->role, $permissions[$action]);
    }
    
    public function get_client_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }
    
    private function get_client_ip_internal() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }
    
    private function log_security_event($event_type, $data) {
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'ch_activity_log',
            array(
                'user_id' => $data['user_id'] ?? 0,
                'action' => $event_type,
                'details' => wp_json_encode($data),
                'ip_address' => $data['ip'] ?? $this->get_client_ip(),
                'user_agent' => $data['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? '')
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );
    }
    
    public function check_sql_injection($input) {
        $dangerous_patterns = array(
            '/(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/i',
            '/(\s|^)(or|and)(\s|$).*(\s|^)(=|like)(\s|$)/i',
            '/(\'|\"|\`|;|--|\#|\*|\|)/i'
        );
        
        foreach ($dangerous_patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        
        return false;
    }
    
    public function validate_file_upload($file) {
        $allowed_types = array('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx');
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Check file extension
        if (!in_array($file_extension, $allowed_types)) {
            return array('success' => false, 'message' => 'Tipo de arquivo não permitido');
        }
        
        // Check file size (5MB max)
        if ($file['size'] > 5 * 1024 * 1024) {
            return array('success' => false, 'message' => 'Arquivo muito grande (máximo 5MB)');
        }
        
        // Check for malicious content
        $file_content = file_get_contents($file['tmp_name']);
        if (strpos($file_content, '<?php') !== false || strpos($file_content, '<script') !== false) {
            return array('success' => false, 'message' => 'Arquivo contém código malicioso');
        }
        
        return array('success' => true);
    }
}