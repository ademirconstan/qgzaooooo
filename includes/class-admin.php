<?php

class CompanyHub_Admin {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    public function admin_init() {
        // Register settings
        register_setting('company_hub_settings', 'ch_enabled_modules');
        register_setting('company_hub_settings', 'ch_api_settings');
        
        // Add settings sections
        add_settings_section(
            'ch_modules_section',
            __('Módulos Ativos', 'company-hub'),
            array($this, 'modules_section_callback'),
            'company_hub_settings'
        );
        
        add_settings_section(
            'ch_api_section',
            __('Configurações da API', 'company-hub'),
            array($this, 'api_section_callback'),
            'company_hub_settings'
        );
    }
    
    public function admin_notices() {
        // Check if rewrite rules need to be flushed
        if (get_option('company_hub_flush_rewrite_rules')) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <?php _e('Company Hub: As regras de URL foram atualizadas.', 'company-hub'); ?>
                    <a href="<?php echo admin_url('options-permalink.php'); ?>" class="button button-small">
                        <?php _e('Atualizar Permalinks', 'company-hub'); ?>
                    </a>
                </p>
            </div>
            <?php
            delete_option('company_hub_flush_rewrite_rules');
        }
        
        // Check database version
        $db_version = get_option('company_hub_db_version', '0');
        if (version_compare($db_version, COMPANY_HUB_VERSION, '<')) {
            ?>
            <div class="notice notice-info">
                <p>
                    <?php _e('Company Hub: Atualizações do banco de dados disponíveis.', 'company-hub'); ?>
                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=company-hub&action=update_db'), 'update_db'); ?>" class="button button-primary button-small">
                        <?php _e('Atualizar Agora', 'company-hub'); ?>
                    </a>
                </p>
            </div>
            <?php
        }
    }
    
    public static function render_admin_page() {
        // Handle actions
        if (isset($_GET['action']) && $_GET['action'] === 'update_db') {
            if (wp_verify_nonce($_GET['_wpnonce'], 'update_db')) {
                CompanyHub_Database::update_tables();
                echo '<div class="notice notice-success"><p>' . __('Banco de dados atualizado com sucesso!', 'company-hub') . '</p></div>';
            }
        }
        
        // Get stats
        global $wpdb;
        $stats = array(
            'users' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_users"),
            'sites' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_sites"),
            'leads' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_leads"),
            'tasks' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ch_tasks")
        );
        
        ?>
        <div class="wrap">
            <h1><?php _e('Company Hub', 'company-hub'); ?></h1>
            
            <div class="company-hub-admin-dashboard">
                <div class="postbox-container" style="width: 70%;">
                    <div class="postbox">
                        <h2 class="hndle"><?php _e('Visão Geral', 'company-hub'); ?></h2>
                        <div class="inside">
                            <div class="company-hub-stats">
                                <div class="stat-item">
                                    <span class="stat-number"><?php echo esc_html($stats['users']); ?></span>
                                    <span class="stat-label"><?php _e('Usuários', 'company-hub'); ?></span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number"><?php echo esc_html($stats['sites']); ?></span>
                                    <span class="stat-label"><?php _e('Sites', 'company-hub'); ?></span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number"><?php echo esc_html($stats['leads']); ?></span>
                                    <span class="stat-label"><?php _e('Leads', 'company-hub'); ?></span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number"><?php echo esc_html($stats['tasks']); ?></span>
                                    <span class="stat-label"><?php _e('Tarefas', 'company-hub'); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="postbox">
                        <h2 class="hndle"><?php _e('Acesso Rápido', 'company-hub'); ?></h2>
                        <div class="inside">
                            <p>
                                <a href="<?php echo home_url('/company-hub/'); ?>" class="button button-primary" target="_blank">
                                    <?php _e('Abrir Company Hub', 'company-hub'); ?>
                                </a>
                                <a href="<?php echo admin_url('admin.php?page=company-hub-settings'); ?>" class="button">
                                    <?php _e('Configurações', 'company-hub'); ?>
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="postbox-container" style="width: 30%;">
                    <div class="postbox">
                        <h2 class="hndle"><?php _e('Informações do Sistema', 'company-hub'); ?></h2>
                        <div class="inside">
                            <ul>
                                <li><strong><?php _e('Versão:', 'company-hub'); ?></strong> <?php echo COMPANY_HUB_VERSION; ?></li>
                                <li><strong><?php _e('WordPress:', 'company-hub'); ?></strong> <?php echo get_bloginfo('version'); ?></li>
                                <li><strong><?php _e('PHP:', 'company-hub'); ?></strong> <?php echo PHP_VERSION; ?></li>
                                <li><strong><?php _e('URL Frontend:', 'company-hub'); ?></strong> <a href="<?php echo home_url('/company-hub/'); ?>" target="_blank"><?php echo home_url('/company-hub/'); ?></a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="postbox">
                        <h2 class="hndle"><?php _e('Suporte', 'company-hub'); ?></h2>
                        <div class="inside">
                            <p><?php _e('Para suporte técnico, entre em contato com a equipe de desenvolvimento.', 'company-hub'); ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    public static function render_settings_page() {
        if (isset($_POST['submit'])) {
            check_admin_referer('company_hub_settings-options');
            
            // Save settings
            if (isset($_POST['ch_enabled_modules'])) {
                update_option('ch_enabled_modules', array_map('sanitize_text_field', $_POST['ch_enabled_modules']));
            } else {
                update_option('ch_enabled_modules', array());
            }
            
            echo '<div class="notice notice-success"><p>' . __('Configurações salvas!', 'company-hub') . '</p></div>';
        }
        
        $enabled_modules = get_option('ch_enabled_modules', array());
        $all_modules = CompanyHub_Modules::get_instance()->get_modules();
        
        ?>
        <div class="wrap">
            <h1><?php _e('Configurações do Company Hub', 'company-hub'); ?></h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('company_hub_settings-options'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Módulos Ativos', 'company-hub'); ?></th>
                        <td>
                            <?php foreach ($all_modules as $key => $module): ?>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="ch_enabled_modules[]" 
                                        value="<?php echo esc_attr($key); ?>"
                                        <?php checked(in_array($key, $enabled_modules) || $module['required']); ?>
                                        <?php disabled($module['required']); ?>
                                    >
                                    <?php echo esc_html($module['name']); ?>
                                    <?php if ($module['required']): ?>
                                        <em>(<?php _e('obrigatório', 'company-hub'); ?>)</em>
                                    <?php endif; ?>
                                </label><br>
                            <?php endforeach; ?>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function modules_section_callback() {
        echo '<p>' . __('Selecione quais módulos devem estar ativos no sistema.', 'company-hub') . '</p>';
    }
    
    public function api_section_callback() {
        echo '<p>' . __('Configure as integrações com APIs externas.', 'company-hub') . '</p>';
    }
}