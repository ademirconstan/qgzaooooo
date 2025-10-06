<?php

class CompanyHub_API {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Constructor is empty as routes are registered via static method
    }
    
    public static function register_routes() {
        // Authentication routes
        register_rest_route('company-hub/v1', '/auth/login', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'login'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('company-hub/v1', '/auth/logout', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'logout'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('company-hub/v1', '/auth/me', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_current_user'),
            'permission_callback' => '__return_true'
        ));
        
        // Dashboard routes
        register_rest_route('company-hub/v1', '/dashboard/stats', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_dashboard_stats'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Sites routes
        register_rest_route('company-hub/v1', '/sites', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_sites'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/sites', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_site'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/sites/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_site'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/sites/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array(__CLASS__, 'update_site'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/sites/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array(__CLASS__, 'delete_site'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/sites/(?P<id>\d+)/check-uptime', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'check_site_uptime'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Leads routes
        register_rest_route('company-hub/v1', '/leads', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_leads'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/leads', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_lead'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/leads/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array(__CLASS__, 'update_lead'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/leads/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array(__CLASS__, 'delete_lead'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Tasks routes
        register_rest_route('company-hub/v1', '/tasks', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_tasks'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/tasks', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_task'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/tasks/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array(__CLASS__, 'update_task'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/tasks/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array(__CLASS__, 'delete_task'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Financial routes
        register_rest_route('company-hub/v1', '/financial', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_financial_records'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Backlinks routes
        register_rest_route('company-hub/v1', '/backlinks', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_backlinks'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/backlinks', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_backlink'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/backlinks/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array(__CLASS__, 'update_backlink'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/backlinks/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array(__CLASS__, 'delete_backlink'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/backlinks/(?P<id>\d+)/check', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'check_backlink'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // SEO routes
        register_rest_route('company-hub/v1', '/seo/keywords', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_seo_keywords'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/seo/keywords', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_seo_keyword'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/seo/rankings', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_seo_rankings'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/seo/audits', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_seo_audits'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Automation routes
        register_rest_route('company-hub/v1', '/automation/rules', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_automation_rules'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/automation/webhooks', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_automation_webhooks'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        // Integrations routes
        register_rest_route('company-hub/v1', '/integrations', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_integrations'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/integrations/(?P<type>[a-zA-Z0-9_-]+)', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'save_integration'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/integrations/(?P<type>[a-zA-Z0-9_-]+)/test', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'test_integration'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
        
        register_rest_route('company-hub/v1', '/integrations/(?P<type>[a-zA-Z0-9_-]+)', array(
            'methods' => 'DELETE',
            'callback' => array(__CLASS__, 'delete_integration'),
            'permission_callback' => array(__CLASS__, 'check_permissions')
        ));
    }
    
    public static function check_permissions() {
        $auth = CompanyHub_Auth::get_instance();
        return $auth->is_logged_in();
    }
    
    // Authentication endpoints
    public static function login($request) {
        $username = sanitize_text_field($request->get_param('username'));
        $password = $request->get_param('password');
        
        if (empty($username) || empty($password)) {
            return new WP_Error('missing_credentials', 'Username and password are required', array('status' => 400));
        }
        
        $auth = CompanyHub_Auth::get_instance();
        $result = $auth->login($username, $password);
        
        if ($result['success']) {
            return rest_ensure_response($result);
        } else {
            return new WP_Error('login_failed', $result['message'], array('status' => 401));
        }
    }
    
    public static function logout($request) {
        $auth = CompanyHub_Auth::get_instance();
        $result = $auth->logout();
        return rest_ensure_response($result);
    }
    
    public static function get_current_user($request) {
        $auth = CompanyHub_Auth::get_instance();
        $user = $auth->get_current_user();
        
        if ($user) {
            return rest_ensure_response($user);
        } else {
            return new WP_Error('not_logged_in', 'User not logged in', array('status' => 401));
        }
    }
    
    // Dashboard endpoints
    public static function get_dashboard_stats($request) {
        global $wpdb;
        
        $stats = array(
            'total_sites' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}companyhub_sites WHERE status != 'deleted'"),
            'total_leads' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_leads"),
            'new_leads' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_leads WHERE status = 'new' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
            'active_tasks' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_tasks WHERE status IN ('todo', 'in_progress')"),
            'sites_down' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}companyhub_sites WHERE uptime_status = 'down' AND status = 'active'")
        );
        
        return rest_ensure_response($stats);
    }
    
    // Sites endpoints
    public static function get_sites($request) {
        global $wpdb;
        
        $sites = $wpdb->get_results("
            SELECT s.*, u.username as responsible_name 
            FROM {$wpdb->prefix}companyhub_sites s 
            LEFT JOIN {$wpdb->prefix}ch_users u ON s.responsible_user_id = u.id 
            WHERE s.status != 'deleted' OR s.status IS NULL
            ORDER BY s.created_at DESC
        ");
        
        // Decrypt sensitive data
        foreach ($sites as &$site) {
            if (!empty($site->ftp_credentials)) {
                try {
                    $decrypted = CompanyHub_Utils::decrypt_data($site->ftp_credentials);
                    $site->ftp_credentials = $decrypted;
                } catch (Exception $e) {
                    $site->ftp_credentials = '';
                }
            }
            if (!empty($site->ssh_credentials)) {
                try {
                    $decrypted = CompanyHub_Utils::decrypt_data($site->ssh_credentials);
                    $site->ssh_credentials = $decrypted;
                } catch (Exception $e) {
                    $site->ssh_credentials = '';
                }
            }
            if (!empty($site->db_credentials)) {
                try {
                    $decrypted = CompanyHub_Utils::decrypt_data($site->db_credentials);
                    $site->db_credentials = $decrypted;
                } catch (Exception $e) {
                    $site->db_credentials = '';
                }
            }
        }
        
        return rest_ensure_response($sites);
    }
    
    public static function get_site($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $site = $wpdb->get_row($wpdb->prepare("
            SELECT s.*, u.username as responsible_name 
            FROM {$wpdb->prefix}companyhub_sites s 
            LEFT JOIN {$wpdb->prefix}ch_users u ON s.responsible_user_id = u.id 
            WHERE s.id = %d AND s.status != 'deleted'
        ", $id));
        
        if (!$site) {
            return new WP_Error('site_not_found', 'Site not found', array('status' => 404));
        }
        
        // Decrypt sensitive data
        if (!empty($site->ftp_credentials)) {
            $site->ftp_credentials = CompanyHub_Utils::decrypt_data($site->ftp_credentials);
        }
        if (!empty($site->ssh_credentials)) {
            $site->ssh_credentials = CompanyHub_Utils::decrypt_data($site->ssh_credentials);
        }
        if (!empty($site->db_credentials)) {
            $site->db_credentials = CompanyHub_Utils::decrypt_data($site->db_credentials);
        }
        
        return rest_ensure_response($site);
    }
    
    public static function create_site($request) {
        global $wpdb;
        
        $security = CompanyHub_Security::get_instance();
        
        // Validate and sanitize input
        $data = array(
            'name' => $security->sanitize_input($request->get_param('name')),
            'primary_url' => $security->sanitize_input($request->get_param('primary_url'), 'url'),
            'other_urls' => $security->sanitize_input($request->get_param('other_urls'), 'textarea'),
            'category' => $security->sanitize_input($request->get_param('category')),
            'cms' => $security->sanitize_input($request->get_param('cms')),
            'status' => $security->sanitize_input($request->get_param('status')),
            'server' => $security->sanitize_input($request->get_param('server')),
            'hosting_provider' => $security->sanitize_input($request->get_param('hosting_provider')),
            'hosting_type' => $security->sanitize_input($request->get_param('hosting_type')),
            'responsible_user_id' => $security->sanitize_input($request->get_param('responsible_user_id'), 'int'),
            'team_members' => $security->sanitize_input($request->get_param('team_members'), 'textarea'),
            'external_providers' => $security->sanitize_input($request->get_param('external_providers'), 'textarea'),
            'google_analytics_id' => $security->sanitize_input($request->get_param('google_analytics_id')),
            'search_console_url' => $security->sanitize_input($request->get_param('search_console_url'), 'url'),
            'tag_manager_id' => $security->sanitize_input($request->get_param('tag_manager_id')),
            'facebook_pixel_id' => $security->sanitize_input($request->get_param('facebook_pixel_id')),
            'webhook_urls' => $security->sanitize_input($request->get_param('webhook_urls'), 'textarea'),
            'main_keywords' => $security->sanitize_input($request->get_param('main_keywords'), 'textarea'),
            'backlinks_count' => $security->sanitize_input($request->get_param('backlinks_count'), 'int'),
            'last_audit_date' => $security->sanitize_input($request->get_param('last_audit_date')),
            'indexation_status' => $security->sanitize_input($request->get_param('indexation_status')),
            'hosting_cost' => $security->sanitize_input($request->get_param('hosting_cost'), 'float'),
            'extra_costs' => $security->sanitize_input($request->get_param('extra_costs'), 'float'),
            'estimated_revenue' => $security->sanitize_input($request->get_param('estimated_revenue'), 'float'),
            'roi' => $security->sanitize_input($request->get_param('roi'), 'float'),
            'ssl_status' => $security->sanitize_input($request->get_param('ssl_status')),
            'dns_status' => $security->sanitize_input($request->get_param('dns_status')),
            'uptime_alerts' => $security->sanitize_input($request->get_param('uptime_alerts')),
            'internal_notes' => $security->sanitize_input($request->get_param('internal_notes'), 'textarea')
        );
        
        // Encrypt sensitive credentials
        $ftp_credentials = $request->get_param('ftp_credentials');
        if (!empty($ftp_credentials)) {
            if (is_array($ftp_credentials)) {
                $data['ftp_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($ftp_credentials));
            } else {
                $data['ftp_credentials'] = CompanyHub_Utils::encrypt_data($ftp_credentials);
            }
        }
        
        $ssh_credentials = $request->get_param('ssh_credentials');
        if (!empty($ssh_credentials)) {
            if (is_array($ssh_credentials)) {
                $data['ssh_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($ssh_credentials));
            } else {
                $data['ssh_credentials'] = CompanyHub_Utils::encrypt_data($ssh_credentials);
            }
        }
        
        $db_credentials = $request->get_param('db_credentials');
        if (!empty($db_credentials)) {
            if (is_array($db_credentials)) {
                $data['db_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($db_credentials));
            } else {
                $data['db_credentials'] = CompanyHub_Utils::encrypt_data($db_credentials);
            }
        }
        
        // Required fields validation
        if (empty($data['name']) || empty($data['primary_url'])) {
            return new WP_Error('missing_required_fields', 'Name and primary URL are required', array('status' => 400));
        }
        
        // Prepare data array with proper format specifiers
        $insert_data = array();
        $format_array = array();
        
        foreach ($data as $key => $value) {
            $insert_data[$key] = $value;
            
            // Define format based on field type
            if (in_array($key, array('responsible_user_id', 'backlinks_count'))) {
                $format_array[] = '%d';
            } elseif (in_array($key, array('hosting_cost', 'extra_costs', 'estimated_revenue', 'roi'))) {
                $format_array[] = '%f';
            } else {
                $format_array[] = '%s';
            }
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'companyhub_sites',
            $insert_data,
            $format_array
        );
        
        if ($result) {
            $site_id = $wpdb->insert_id;
            
            // Log activity
            $auth = CompanyHub_Auth::get_instance();
            $current_user = $auth->get_current_user();
            if ($current_user) {
                CompanyHub_Utils::log_activity($current_user->id, 'site_created', array('site_id' => $site_id, 'site_name' => $data['name']));
            }
            
            return rest_ensure_response(array('success' => true, 'site_id' => $site_id));
        } else {
            return new WP_Error('create_failed', 'Failed to create site', array('status' => 500));
        }
    }
    
    public static function update_site($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        $security = CompanyHub_Security::get_instance();
        
        // Check if site exists
        $existing_site = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}companyhub_sites WHERE id = %d AND status != 'deleted'", $id));
        if (!$existing_site) {
            return new WP_Error('site_not_found', 'Site not found', array('status' => 404));
        }
        
        // Validate and sanitize input
        $data = array(
            'name' => $security->sanitize_input($request->get_param('name')),
            'primary_url' => $security->sanitize_input($request->get_param('primary_url'), 'url'),
            'other_urls' => $security->sanitize_input($request->get_param('other_urls'), 'textarea'),
            'category' => $security->sanitize_input($request->get_param('category')),
            'cms' => $security->sanitize_input($request->get_param('cms')),
            'status' => $security->sanitize_input($request->get_param('status')),
            'server' => $security->sanitize_input($request->get_param('server')),
            'hosting_provider' => $security->sanitize_input($request->get_param('hosting_provider')),
            'hosting_type' => $security->sanitize_input($request->get_param('hosting_type')),
            'responsible_user_id' => $security->sanitize_input($request->get_param('responsible_user_id'), 'int'),
            'team_members' => $security->sanitize_input($request->get_param('team_members'), 'textarea'),
            'external_providers' => $security->sanitize_input($request->get_param('external_providers'), 'textarea'),
            'google_analytics_id' => $security->sanitize_input($request->get_param('google_analytics_id')),
            'search_console_url' => $security->sanitize_input($request->get_param('search_console_url'), 'url'),
            'tag_manager_id' => $security->sanitize_input($request->get_param('tag_manager_id')),
            'facebook_pixel_id' => $security->sanitize_input($request->get_param('facebook_pixel_id')),
            'webhook_urls' => $security->sanitize_input($request->get_param('webhook_urls'), 'textarea'),
            'main_keywords' => $security->sanitize_input($request->get_param('main_keywords'), 'textarea'),
            'backlinks_count' => $security->sanitize_input($request->get_param('backlinks_count'), 'int'),
            'last_audit_date' => $security->sanitize_input($request->get_param('last_audit_date')),
            'indexation_status' => $security->sanitize_input($request->get_param('indexation_status')),
            'hosting_cost' => $security->sanitize_input($request->get_param('hosting_cost'), 'float'),
            'extra_costs' => $security->sanitize_input($request->get_param('extra_costs'), 'float'),
            'estimated_revenue' => $security->sanitize_input($request->get_param('estimated_revenue'), 'float'),
            'roi' => $security->sanitize_input($request->get_param('roi'), 'float'),
            'ssl_status' => $security->sanitize_input($request->get_param('ssl_status')),
            'dns_status' => $security->sanitize_input($request->get_param('dns_status')),
            'uptime_alerts' => $security->sanitize_input($request->get_param('uptime_alerts')),
            'internal_notes' => $security->sanitize_input($request->get_param('internal_notes'), 'textarea')
        );
        
        // Encrypt sensitive credentials
        $ftp_credentials = $request->get_param('ftp_credentials');
        if (!empty($ftp_credentials)) {
            if (is_array($ftp_credentials)) {
                $data['ftp_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($ftp_credentials));
            } else {
                $data['ftp_credentials'] = CompanyHub_Utils::encrypt_data($ftp_credentials);
            }
        }
        
        $ssh_credentials = $request->get_param('ssh_credentials');
        if (!empty($ssh_credentials)) {
            if (is_array($ssh_credentials)) {
                $data['ssh_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($ssh_credentials));
            } else {
                $data['ssh_credentials'] = CompanyHub_Utils::encrypt_data($ssh_credentials);
            }
        }
        
        $db_credentials = $request->get_param('db_credentials');
        if (!empty($db_credentials)) {
            if (is_array($db_credentials)) {
                $data['db_credentials'] = CompanyHub_Utils::encrypt_data(wp_json_encode($db_credentials));
            } else {
                $data['db_credentials'] = CompanyHub_Utils::encrypt_data($db_credentials);
            }
        }
        
        // Prepare update data with proper format specifiers
        $update_data = array();
        $format_array = array();
        
        foreach ($data as $key => $value) {
            $update_data[$key] = $value;
            
            // Define format based on field type
            if (in_array($key, array('responsible_user_id', 'backlinks_count'))) {
                $format_array[] = '%d';
            } elseif (in_array($key, array('hosting_cost', 'extra_costs', 'estimated_revenue', 'roi'))) {
                $format_array[] = '%f';
            } else {
                $format_array[] = '%s';
            }
        }
        
        $result = $wpdb->update(
            $wpdb->prefix . 'companyhub_sites',
            $update_data,
            array('id' => $id),
            $format_array,
            array('%d')
        );
        
        if ($result !== false) {
            // Log activity
            $auth = CompanyHub_Auth::get_instance();
            $current_user = $auth->get_current_user();
            if ($current_user) {
                CompanyHub_Utils::log_activity($current_user->id, 'site_updated', array('site_id' => $id, 'site_name' => $data['name']));
            }
            
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('update_failed', 'Failed to update site', array('status' => 500));
        }
    }
    
    public static function delete_site($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        // Soft delete - just mark as deleted
        $result = $wpdb->update(
            $wpdb->prefix . 'companyhub_sites',
            array('status' => 'deleted'),
            array('id' => $id),
            array('%s'),
            array('%d')
        );
        
        if ($result) {
            // Log activity
            $auth = CompanyHub_Auth::get_instance();
            $current_user = $auth->get_current_user();
            CompanyHub_Utils::log_activity($current_user->id, 'site_deleted', array('site_id' => $id));
            
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('delete_failed', 'Failed to delete site', array('status' => 500));
        }
    }
    
    public static function check_site_uptime($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $site = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}companyhub_sites WHERE id = %d", $id));
        
        if (!$site) {
            return new WP_Error('site_not_found', 'Site not found', array('status' => 404));
        }
        
        $is_up = CompanyHub_Utils::check_url_status($site->primary_url);
        $status = $is_up ? 'up' : 'down';
        
        // Update site status
        $wpdb->update(
            $wpdb->prefix . 'companyhub_sites',
            array(
                'uptime_status' => $status,
                'last_uptime_check' => current_time('mysql')
            ),
            array('id' => $id),
            array('%s', '%s'),
            array('%d')
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'status' => $status,
            'is_up' => $is_up,
            'checked_at' => current_time('mysql')
        ));
    }
    
    // Leads endpoints
    public static function get_leads($request) {
        global $wpdb;
        
        $leads = $wpdb->get_results("
            SELECT l.*, u.username as assigned_name 
            FROM {$wpdb->prefix}ch_leads l 
            LEFT JOIN {$wpdb->prefix}ch_users u ON l.assigned_to = u.id 
            ORDER BY l.created_at DESC
        ");
        
        return rest_ensure_response($leads);
    }
    
    public static function create_lead($request) {
        global $wpdb;
        
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'name' => $security->sanitize_input($request->get_param('name')),
            'email' => $security->sanitize_input($request->get_param('email'), 'email'),
            'phone' => $security->sanitize_input($request->get_param('phone')),
            'company' => $security->sanitize_input($request->get_param('company')),
            'source' => $security->sanitize_input($request->get_param('source')),
            'status' => $security->sanitize_input($request->get_param('status')),
            'assigned_to' => $security->sanitize_input($request->get_param('assigned_to'), 'int'),
            'notes' => $security->sanitize_input($request->get_param('notes'), 'textarea')
        );
        
        if (empty($data['name'])) {
            return new WP_Error('missing_required_fields', 'Name is required', array('status' => 400));
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'ch_leads',
            $data,
            array('%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true, 'lead_id' => $wpdb->insert_id));
        } else {
            return new WP_Error('create_failed', 'Failed to create lead', array('status' => 500));
        }
    }
    
    public static function update_lead($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'name' => $security->sanitize_input($request->get_param('name')),
            'email' => $security->sanitize_input($request->get_param('email'), 'email'),
            'phone' => $security->sanitize_input($request->get_param('phone')),
            'company' => $security->sanitize_input($request->get_param('company')),
            'source' => $security->sanitize_input($request->get_param('source')),
            'status' => $security->sanitize_input($request->get_param('status')),
            'assigned_to' => $security->sanitize_input($request->get_param('assigned_to'), 'int'),
            'notes' => $security->sanitize_input($request->get_param('notes'), 'textarea')
        );
        
        $result = $wpdb->update(
            $wpdb->prefix . 'ch_leads',
            $data,
            array('id' => $id),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s'),
            array('%d')
        );
        
        if ($result !== false) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('update_failed', 'Failed to update lead', array('status' => 500));
        }
    }
    
    public static function delete_lead($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'ch_leads',
            array('id' => $id),
            array('%d')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('delete_failed', 'Failed to delete lead', array('status' => 500));
        }
    }
    
    // Tasks endpoints
    public static function get_tasks($request) {
        global $wpdb;
        
        $tasks = $wpdb->get_results("
            SELECT t.*, u.username as assigned_name 
            FROM {$wpdb->prefix}ch_tasks t 
            LEFT JOIN {$wpdb->prefix}ch_users u ON t.assigned_to = u.id 
            ORDER BY t.created_at DESC
        ");
        
        return rest_ensure_response($tasks);
    }
    
    public static function create_task($request) {
        global $wpdb;
        
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'title' => $security->sanitize_input($request->get_param('title')),
            'description' => $security->sanitize_input($request->get_param('description'), 'textarea'),
            'status' => $security->sanitize_input($request->get_param('status')),
            'priority' => $security->sanitize_input($request->get_param('priority')),
            'assigned_to' => $security->sanitize_input($request->get_param('assigned_to'), 'int'),
            'project' => $security->sanitize_input($request->get_param('project')),
            'due_date' => $security->sanitize_input($request->get_param('due_date'))
        );
        
        if (empty($data['title'])) {
            return new WP_Error('missing_required_fields', 'Title is required', array('status' => 400));
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'ch_tasks',
            $data,
            array('%s', '%s', '%s', '%s', '%d', '%s', '%s')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true, 'task_id' => $wpdb->insert_id));
        } else {
            return new WP_Error('create_failed', 'Failed to create task', array('status' => 500));
        }
    }
    
    public static function update_task($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'title' => $security->sanitize_input($request->get_param('title')),
            'description' => $security->sanitize_input($request->get_param('description'), 'textarea'),
            'status' => $security->sanitize_input($request->get_param('status')),
            'priority' => $security->sanitize_input($request->get_param('priority')),
            'assigned_to' => $security->sanitize_input($request->get_param('assigned_to'), 'int'),
            'project' => $security->sanitize_input($request->get_param('project')),
            'due_date' => $security->sanitize_input($request->get_param('due_date'))
        );
        
        $result = $wpdb->update(
            $wpdb->prefix . 'ch_tasks',
            $data,
            array('id' => $id),
            array('%s', '%s', '%s', '%s', '%d', '%s', '%s'),
            array('%d')
        );
        
        if ($result !== false) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('update_failed', 'Failed to update task', array('status' => 500));
        }
    }
    
    public static function delete_task($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'ch_tasks',
            array('id' => $id),
            array('%d')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('delete_failed', 'Failed to delete task', array('status' => 500));
        }
    }
    
    // Financial endpoints
    public static function get_financial_records($request) {
        global $wpdb;
        
        $records = $wpdb->get_results("
            SELECT f.*, s.name as site_name 
            FROM {$wpdb->prefix}ch_financial f 
            LEFT JOIN {$wpdb->prefix}companyhub_sites s ON f.site_id = s.id 
            ORDER BY f.date DESC
        ");
        
        return rest_ensure_response($records);
    }
    
    // Backlinks endpoints
    public static function get_backlinks($request) {
        global $wpdb;
        
        $backlinks = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ch_backlinks ORDER BY created_at DESC");
        
        return rest_ensure_response($backlinks);
    }
    
    public static function create_backlink($request) {
        global $wpdb;
        
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'source_url' => $security->sanitize_input($request->get_param('source_url'), 'url'),
            'target_url' => $security->sanitize_input($request->get_param('target_url'), 'url'),
            'anchor_text' => $security->sanitize_input($request->get_param('anchor_text')),
            'type' => $security->sanitize_input($request->get_param('type'))
        );
        
        if (empty($data['source_url']) || empty($data['target_url'])) {
            return new WP_Error('missing_required_fields', 'Source URL and target URL are required', array('status' => 400));
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'ch_backlinks',
            $data,
            array('%s', '%s', '%s', '%s')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true, 'backlink_id' => $wpdb->insert_id));
        } else {
            return new WP_Error('create_failed', 'Failed to create backlink', array('status' => 500));
        }
    }
    
    public static function update_backlink($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'source_url' => $security->sanitize_input($request->get_param('source_url'), 'url'),
            'target_url' => $security->sanitize_input($request->get_param('target_url'), 'url'),
            'anchor_text' => $security->sanitize_input($request->get_param('anchor_text')),
            'type' => $security->sanitize_input($request->get_param('type'))
        );
        
        $result = $wpdb->update(
            $wpdb->prefix . 'ch_backlinks',
            $data,
            array('id' => $id),
            array('%s', '%s', '%s', '%s'),
            array('%d')
        );
        
        if ($result !== false) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('update_failed', 'Failed to update backlink', array('status' => 500));
        }
    }
    
    public static function delete_backlink($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'ch_backlinks',
            array('id' => $id),
            array('%d')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true));
        } else {
            return new WP_Error('delete_failed', 'Failed to delete backlink', array('status' => 500));
        }
    }
    
    public static function check_backlink($request) {
        global $wpdb;
        
        $id = intval($request->get_param('id'));
        
        $backlink = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}ch_backlinks WHERE id = %d", $id));
        
        if (!$backlink) {
            return new WP_Error('backlink_not_found', 'Backlink not found', array('status' => 404));
        }
        
        $is_active = CompanyHub_Utils::check_url_status($backlink->source_url);
        $status = $is_active ? 'active' : 'broken';
        
        // Update backlink status
        $wpdb->update(
            $wpdb->prefix . 'ch_backlinks',
            array(
                'status' => $status,
                'last_checked' => current_time('mysql')
            ),
            array('id' => $id),
            array('%s', '%s'),
            array('%d')
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'status' => $status,
            'is_active' => $is_active
        ));
    }
    
    // SEO endpoints
    public static function get_seo_keywords($request) {
        global $wpdb;
        
        $keywords = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ch_seo_keywords ORDER BY created_at DESC");
        
        return rest_ensure_response($keywords);
    }
    
    public static function create_seo_keyword($request) {
        global $wpdb;
        
        $security = CompanyHub_Security::get_instance();
        
        $data = array(
            'keyword' => $security->sanitize_input($request->get_param('keyword')),
            'target_url' => $security->sanitize_input($request->get_param('target_url'), 'url'),
            'search_volume' => $security->sanitize_input($request->get_param('search_volume'), 'int'),
            'difficulty' => $security->sanitize_input($request->get_param('difficulty'))
        );
        
        if (empty($data['keyword'])) {
            return new WP_Error('missing_required_fields', 'Keyword is required', array('status' => 400));
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'ch_seo_keywords',
            $data,
            array('%s', '%s', '%d', '%s')
        );
        
        if ($result) {
            return rest_ensure_response(array('success' => true, 'keyword_id' => $wpdb->insert_id));
        } else {
            return new WP_Error('create_failed', 'Failed to create keyword', array('status' => 500));
        }
    }
    
    public static function get_seo_rankings($request) {
        global $wpdb;
        
        $rankings = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ch_seo_rankings ORDER BY created_at DESC");
        
        return rest_ensure_response($rankings);
    }
    
    public static function get_seo_audits($request) {
        global $wpdb;
        
        $audits = $wpdb->get_results("
            SELECT a.*, s.name as site_name 
            FROM {$wpdb->prefix}ch_seo_audits a 
            LEFT JOIN {$wpdb->prefix}companyhub_sites s ON a.site_id = s.id 
            ORDER BY a.created_at DESC
        ");
        
        return rest_ensure_response($audits);
    }
    
    // Automation endpoints
    public static function get_automation_rules($request) {
        global $wpdb;
        
        $rules = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ch_automation_rules ORDER BY created_at DESC");
        
        return rest_ensure_response($rules);
    }
    
    public static function get_automation_webhooks($request) {
        global $wpdb;
        
        $webhooks = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ch_automation_webhooks ORDER BY created_at DESC");
        
        return rest_ensure_response($webhooks);
    }
    
    // Integrations endpoints
    public static function get_integrations($request) {
        $integrations = get_option('ch_integrations', array());
        
        // Default structure for integrations
        $default_integrations = array(
            'google_analytics' => array(
                'status' => 'disconnected',
                'config' => array()
            ),
            'google_search_console' => array(
                'status' => 'disconnected',
                'config' => array()
            ),
            'webhooks' => array(
                'status' => 'inactive',
                'config' => array()
            )
        );
        
        $integrations = array_merge($default_integrations, $integrations);
        
        return rest_ensure_response($integrations);
    }
    
    public static function save_integration($request) {
        $type = sanitize_text_field($request->get_param('type'));
        $config = $request->get_param('config');
        
        $integrations = get_option('ch_integrations', array());
        
        $integrations[$type] = array(
            'status' => 'connected',
            'config' => $config,
            'updated_at' => current_time('mysql')
        );
        
        update_option('ch_integrations', $integrations);
        
        return rest_ensure_response(array('success' => true));
    }
    
    public static function test_integration($request) {
        $type = sanitize_text_field($request->get_param('type'));
        $config = $request->get_param('config');
        
        // Placeholder for integration testing
        // In a real implementation, you would test the actual API connections
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Integration test successful (placeholder)'
        ));
    }
    
    public static function delete_integration($request) {
        $type = sanitize_text_field($request->get_param('type'));
        
        $integrations = get_option('ch_integrations', array());
        
        if (isset($integrations[$type])) {
            $integrations[$type] = array(
                'status' => 'disconnected',
                'config' => array()
            );
            
            update_option('ch_integrations', $integrations);
        }
        
        return rest_ensure_response(array('success' => true));
    }
}