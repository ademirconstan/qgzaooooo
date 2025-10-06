<?php

class CompanyHub_Frontend {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Constructor is now empty as hooks are handled in main class
    }
    
    public function render_app($page = 'dashboard') {
        // Security check
        if (!$this->is_valid_page($page)) {
            wp_die(__('Página não encontrada.', 'company-hub'), 404);
        }
        
        // Check authentication for protected pages
        $auth = CompanyHub_Auth::get_instance();
        
        if ($page !== 'login' && !$auth->is_logged_in()) {
            wp_redirect(home_url('/company-hub/login'));
            exit;
        }
        
        // Prevent caching
        $this->prevent_caching();
        
        // Set proper headers
        $this->set_headers();
        
        // Render the app
        $this->render_html($page);
    }
    
    private function is_valid_page($page) {
        $valid_pages = array(
            'dashboard',
            'login',
            'sites',
            'leads',
            'tasks',
            'financial',
            'settings',
            'accounts',
            'analytics',
            'backlinks'
        );
        
        return in_array($page, $valid_pages);
    }
    
    private function prevent_caching() {
        // Prevent caching of the app pages
        if (!headers_sent()) {
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
        
        // WordPress specific
        define('DONOTCACHEPAGE', true);
        define('DONOTCACHEDB', true);
        define('DONOTMINIFY', true);
        define('DONOTCDN', true);
    }
    
    private function set_headers() {
        if (!headers_sent()) {
            header('Content-Type: text/html; charset=' . get_bloginfo('charset'));
            header('X-Robots-Tag: noindex, nofollow');
        }
    }
    
    private function render_html($page) {
        // Get current user data
        $auth = CompanyHub_Auth::get_instance();
        $current_user = $auth->get_current_user();
        
        // Prepare initial data
        $initial_data = array(
            'currentPage' => $page,
            'isLoggedIn' => $auth->is_logged_in(),
            'currentUser' => $current_user,
            'enabledModules' => CompanyHub_Modules::get_instance()->get_enabled_modules(),
            'siteUrl' => home_url(),
            'pluginUrl' => COMPANY_HUB_PLUGIN_URL,
            'apiUrl' => rest_url('company-hub/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php')
        );
        
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="robots" content="noindex, nofollow">
            <title><?php echo esc_html($this->get_page_title($page)); ?> - Company Hub</title>
            
            <?php wp_head(); ?>
            
            <script>
                window.companyHub = <?php echo wp_json_encode($initial_data); ?>;
            </script>
        </head>
        <body class="company-hub-app company-hub-page-<?php echo esc_attr($page); ?>">
            <div id="company-hub-root">
                <div class="company-hub-loading">
                    <div class="loading-spinner"></div>
                    <p><?php _e('Carregando...', 'company-hub'); ?></p>
                </div>
            </div>
            
            <?php wp_footer(); ?>
            
            <script>
                // Fallback if React doesn't load
                setTimeout(function() {
                    var loadingEl = document.querySelector('.company-hub-loading');
                    if (loadingEl && loadingEl.style.display !== 'none') {
                        loadingEl.innerHTML = '<p><?php _e('Erro ao carregar a aplicação. Recarregue a página.', 'company-hub'); ?></p>';
                    }
                }, 10000);
            </script>
        </body>
        </html>
        <?php
    }
    
    private function get_page_title($page) {
        $titles = array(
            'dashboard' => __('Dashboard', 'company-hub'),
            'login' => __('Login', 'company-hub'),
            'sites' => __('Sites', 'company-hub'),
            'leads' => __('Leads', 'company-hub'),
            'tasks' => __('Tarefas', 'company-hub'),
            'financial' => __('Financeiro', 'company-hub'),
            'settings' => __('Configurações', 'company-hub'),
            'accounts' => __('Contas', 'company-hub'),
            'analytics' => __('Analytics', 'company-hub'),
            'backlinks' => __('Backlinks', 'company-hub')
        );
        
        return isset($titles[$page]) ? $titles[$page] : __('Company Hub', 'company-hub');
    }
    
    public function add_shortcode() {
        add_shortcode('company_hub', array($this, 'shortcode_handler'));
    }
    
    public function shortcode_handler($atts) {
        $atts = shortcode_atts(array(
            'page' => 'dashboard',
            'height' => '600px'
        ), $atts);
        
        // Check if user has permission
        if (!CompanyHub_Auth::get_instance()->is_logged_in()) {
            return '<p>' . __('Você precisa estar logado para acessar o Company Hub.', 'company-hub') . '</p>';
        }
        
        ob_start();
        ?>
        <div class="company-hub-shortcode-wrapper" style="height: <?php echo esc_attr($atts['height']); ?>;">
            <iframe 
                src="<?php echo esc_url(home_url('/company-hub/' . $atts['page'])); ?>"
                width="100%" 
                height="100%" 
                frameborder="0"
                title="Company Hub">
            </iframe>
        </div>
        <?php
        return ob_get_clean();
    }
}