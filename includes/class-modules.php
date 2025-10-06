<?php

class CompanyHub_Modules {
    
    private static $instance = null;
    private $modules = array();
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_modules();
        add_action('wp_ajax_ch_toggle_module', array($this, 'toggle_module'));
        add_action('wp_ajax_nopriv_ch_toggle_module', array($this, 'toggle_module'));
    }
    
    private function init_modules() {
        $this->modules = array(
            'dashboard' => array(
                'name' => 'Dashboard Central',
                'description' => 'Painel principal com resumos e métricas',
                'enabled' => true,
                'required' => true
            ),
            'sites' => array(
                'name' => 'Gestão de Sites',
                'description' => 'Gerenciamento de todos os sites da empresa',
                'enabled' => true,
                'required' => false
            ),
            'accounts' => array(
                'name' => 'Contas & Credenciais',
                'description' => 'Centralização de contas externas e APIs',
                'enabled' => true,
                'required' => false
            ),
            'analytics' => array(
                'name' => 'Métricas & Analytics',
                'description' => 'Integração com Google Analytics e outras métricas',
                'enabled' => true,
                'required' => false
            ),
            'backlinks' => array(
                'name' => 'Gestão de Backlinks',
                'description' => 'Monitoramento de links internos e externos',
                'enabled' => true,
                'required' => false
            ),
            'crm' => array(
                'name' => 'CRM & Leads',
                'description' => 'Gestão de leads e relacionamento com clientes',
                'enabled' => true,
                'required' => false
            ),
            'tasks' => array(
                'name' => 'Projetos & Tarefas',
                'description' => 'Sistema de gerenciamento de tarefas e projetos',
                'enabled' => true,
                'required' => false
            ),
            'financial' => array(
                'name' => 'Financeiro',
                'description' => 'Controle de receitas e despesas',
                'enabled' => true,
                'required' => false
            ),
            'seo' => array(
                'name' => 'SEO & Marketing',
                'description' => 'Ferramentas de SEO e marketing digital',
                'enabled' => true,
                'required' => false
            ),
            'automation' => array(
                'name' => 'Automação',
                'description' => 'Webhooks e automações internas',
                'enabled' => true,
                'required' => false
            )
        );
        
        // Load enabled modules from database
        $enabled_modules = get_option('ch_enabled_modules', array());
        if (!empty($enabled_modules)) {
            foreach ($this->modules as $key => &$module) {
                if (!$module['required']) {
                    $module['enabled'] = in_array($key, $enabled_modules);
                }
            }
        }
    }
    
    public function get_modules() {
        return $this->modules;
    }
    
    public function is_module_enabled($module_key) {
        return isset($this->modules[$module_key]) && $this->modules[$module_key]['enabled'];
    }
    
    public function toggle_module() {
        if (!CompanyHub_Auth::get_instance()->has_permission('manage_modules')) {
            wp_die('Unauthorized');
        }
        
        $module_key = sanitize_text_field($_POST['module']);
        
        if (!isset($this->modules[$module_key]) || $this->modules[$module_key]['required']) {
            wp_die('Invalid module');
        }
        
        $this->modules[$module_key]['enabled'] = !$this->modules[$module_key]['enabled'];
        
        // Save to database
        $enabled_modules = array();
        foreach ($this->modules as $key => $module) {
            if ($module['enabled'] && !$module['required']) {
                $enabled_modules[] = $key;
            }
        }
        
        update_option('ch_enabled_modules', $enabled_modules);
        
        wp_send_json_success(array(
            'module' => $module_key,
            'enabled' => $this->modules[$module_key]['enabled']
        ));
    }
    
    public function get_enabled_modules() {
        $enabled = array();
        foreach ($this->modules as $key => $module) {
            if ($module['enabled']) {
                $enabled[] = $key;
            }
        }
        return $enabled;
    }
}