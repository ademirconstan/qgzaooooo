<?php
/**
 * Plugin Name: Company Hub
 * Plugin URI: https://companyhub.com
 * Description: CRM corporativo personalizado para gestão completa da empresa
 * Version: 1.0.0
 * Author: Company Hub Team
 * License: GPL v2 or later
 * Text Domain: company-hub
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('COMPANY_HUB_VERSION', '1.0.0');
define('COMPANY_HUB_PLUGIN_FILE', __FILE__);
define('COMPANY_HUB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COMPANY_HUB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('COMPANY_HUB_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Main plugin class
class CompanyHub {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init();
    }

    private function init() {
        $this->load_dependencies();
        $this->init_hooks();
        $this->init_components();
    }

    private function load_dependencies() {
        $includes = array(
            'includes/class-database.php',
            'includes/class-security.php',
            'includes/class-utils.php',
            'includes/class-auth.php',
            'includes/class-modules.php',
            'includes/class-admin.php',
            'includes/class-frontend.php',
            'includes/class-api.php'
        );

        foreach ($includes as $file) {
            $filepath = COMPANY_HUB_PLUGIN_DIR . $file;
            if (file_exists($filepath)) {
                require_once $filepath;
            } else {
                error_log("Company Hub: File not found - {$filepath}");
            }
        }
    }

    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        add_action('init', array($this, 'add_rewrite_rules'));
        add_filter('query_vars', array($this, 'add_query_vars'));
        add_action('template_redirect', array($this, 'handle_frontend_routes'));

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('rest_api_init', array('CompanyHub_API', 'register_routes'));

        add_action('wp', array($this, 'schedule_cron_jobs'));
        add_action('company_hub_check_uptime', array('CompanyHub_Utils', 'check_sites_uptime'));
        add_action('company_hub_cleanup', array('CompanyHub_Utils', 'cleanup_old_data'));
    }

    private function init_components() {
        CompanyHub_Database::get_instance();
        CompanyHub_Auth::get_instance();
        CompanyHub_API::get_instance();
        CompanyHub_Admin::get_instance();
        CompanyHub_Frontend::get_instance();
        CompanyHub_Modules::get_instance();
        CompanyHub_Security::get_instance();
    }

    public function add_rewrite_rules() {
        add_rewrite_rule('^company-hub/?$', 'index.php?company_hub_page=dashboard', 'top');
        add_rewrite_rule('^company-hub/([^/]+)/?$', 'index.php?company_hub_page=$matches[1]', 'top');

        // Flush rewrite rules if flag is set
        if (get_option('company_hub_flush_rewrite_rules')) {
            flush_rewrite_rules();
            delete_option('company_hub_flush_rewrite_rules');
        }
    }

    public function add_query_vars($vars) {
        $vars[] = 'company_hub_page';
        return $vars;
    }

    public function handle_frontend_routes() {
        $page = get_query_var('company_hub_page');

        // Fallback: se query var não estiver definida mas URL começa com /company-hub/
        if ($page === false && isset($_SERVER['REQUEST_URI'])) {
            $uri = trim($_SERVER['REQUEST_URI'], '/');
            if (strpos($uri, 'company-hub') === 0) {
                $page = 'dashboard';
            }
        }

        if ($page !== false) {
            CompanyHub_Frontend::get_instance()->render_app($page);
            exit;
        }
    }

    public function add_admin_menu() {
        add_menu_page(
            __('Company Hub', 'company-hub'),
            __('Company Hub', 'company-hub'),
            'manage_options',
            'company-hub',
            array('CompanyHub_Admin', 'render_admin_page'),
            'dashicons-building',
            30
        );

        add_submenu_page(
            'company-hub',
            __('Configurações', 'company-hub'),
            __('Configurações', 'company-hub'),
            'manage_options',
            'company-hub-settings',
            array('CompanyHub_Admin', 'render_settings_page')
        );
    }

    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'company-hub') === false) return;

        wp_enqueue_style(
            'company-hub-admin',
            COMPANY_HUB_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            COMPANY_HUB_VERSION
        );

        wp_enqueue_script(
            'company-hub-admin',
            COMPANY_HUB_PLUGIN_URL . 'admin/js/admin.js',
            array('jquery'),
            COMPANY_HUB_VERSION,
            true
        );

        wp_localize_script('company-hub-admin', 'companyHubAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('company_hub_admin'),
            'strings' => array(
                'confirmDelete' => __('Tem certeza que deseja excluir?', 'company-hub'),
                'error' => __('Erro ao processar solicitação', 'company-hub')
            )
        ));
    }

    public function enqueue_frontend_scripts() {
        if (get_query_var('company_hub_page') === false) return;

        $build_path = COMPANY_HUB_PLUGIN_DIR . 'assets/dist/';
        $build_url  = COMPANY_HUB_PLUGIN_URL . 'assets/dist/';

        if (file_exists($build_path . 'main.js')) {
            wp_enqueue_script(
                'company-hub-app',
                $build_url . 'main.js',
                array(),
                COMPANY_HUB_VERSION,
                true
            );

            wp_enqueue_style(
                'company-hub-app',
                $build_url . 'main.css',
                array(),
                COMPANY_HUB_VERSION
            );
        } else {
            add_action('wp_footer', function() {
                echo '<script>console.error("Company Hub: Build files not found. Please run: npm run build");</script>';
            });
        }

        wp_localize_script('company-hub-app', 'companyHub', array(
            'apiUrl' => rest_url('company-hub/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'pluginUrl' => COMPANY_HUB_PLUGIN_URL,
            'currentPage' => get_query_var('company_hub_page', 'dashboard'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'strings' => array(
                'confirmDelete' => __('Tem certeza que deseja excluir?', 'company-hub'),
                'error' => __('Erro ao processar solicitação', 'company-hub'),
                'success' => __('Operação realizada com sucesso', 'company-hub')
            )
        ));
    }

    public function schedule_cron_jobs() {
        if (!wp_next_scheduled('company_hub_check_uptime')) {
            wp_schedule_event(time(), 'five_minutes', 'company_hub_check_uptime');
        }
        if (!wp_next_scheduled('company_hub_cleanup')) {
            wp_schedule_event(time(), 'daily', 'company_hub_cleanup');
        }
    }

    public function activate() {
        CompanyHub_Database::create_tables();

        // Set flag to flush rewrite rules
        update_option('company_hub_flush_rewrite_rules', true);

        // Add rewrite rules and flush
        $this->add_rewrite_rules();
        flush_rewrite_rules();

        $this->schedule_cron_jobs();

        if (!get_option('ch_enabled_modules')) {
            update_option('ch_enabled_modules', array(
                'dashboard', 'sites', 'leads', 'tasks', 'financial'
            ));
        }
    }

    public function deactivate() {
        wp_clear_scheduled_hook('company_hub_check_uptime');
        wp_clear_scheduled_hook('company_hub_cleanup');
        flush_rewrite_rules();
    }
}

// Custom cron schedule
add_filter('cron_schedules', function($schedules) {
    $schedules['five_minutes'] = array(
        'interval' => 300,
        'display' => __('A cada 5 minutos', 'company-hub')
    );
    return $schedules;
});

// Initialize plugin
add_action('plugins_loaded', function() {
    return CompanyHub::get_instance();
});

// Uninstall
function company_hub_uninstall() {
    if (defined('WP_UNINSTALL_PLUGIN')) {
        CompanyHub_Database::drop_tables();
        delete_option('company_hub_db_version');
        delete_option('ch_enabled_modules');
        delete_option('ch_integrations');
        delete_option('company_hub_flush_rewrite_rules');
    }
}
register_uninstall_hook(__FILE__, 'company_hub_uninstall');
