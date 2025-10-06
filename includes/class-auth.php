<?php

class CompanyHub_Auth {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'start_session'));
    }
    
    public function start_session() {
        if (!session_id()) {
            session_start();
        }
    }
    
    public function login($username, $password) {
        global $wpdb;
        
        $table_users = $wpdb->prefix . 'ch_users';
        
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_users WHERE (username = %s OR email = %s) AND status = 'active'",
            $username,
            $username
        ));
        
        if ($user && password_verify($password, $user->password)) {
            $_SESSION['ch_user_id'] = $user->id;
            $_SESSION['ch_user_role'] = $user->role;
            $_SESSION['ch_user_username'] = $user->username;
            
            return array(
                'success' => true,
                'user' => array(
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role
                )
            );
        }
        
        return array(
            'success' => false,
            'message' => 'Credenciais inválidas'
        );
    }
    
    public function logout() {
        unset($_SESSION['ch_user_id']);
        unset($_SESSION['ch_user_role']);
        unset($_SESSION['ch_user_username']);
        
        return array('success' => true);
    }
    
    public function is_logged_in() {
        return isset($_SESSION['ch_user_id']);
    }
    
    public function get_current_user() {
        if (!$this->is_logged_in()) {
            return null;
        }
        
        global $wpdb;
        $table_users = $wpdb->prefix . 'ch_users';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT id, username, email, role FROM $table_users WHERE id = %d",
            $_SESSION['ch_user_id']
        ));
    }
    
    public function has_permission($permission) {
        if (!$this->is_logged_in()) {
            return false;
        }
        
        $user_role = $_SESSION['ch_user_role'];
        
        // Admin has all permissions
        if ($user_role === 'admin') {
            return true;
        }
        
        // Define collaborator permissions
        $collaborator_permissions = array(
            'view_dashboard',
            'view_sites',
            'view_leads',
            'view_tasks',
            'view_metrics',
            'create_tasks',
            'update_tasks'
        );
        
        return in_array($permission, $collaborator_permissions);
    }
    
    public function create_user($data) {
        if (!$this->has_permission('manage_users')) {
            return array('success' => false, 'message' => 'Sem permissão');
        }
        
        global $wpdb;
        $table_users = $wpdb->prefix . 'ch_users';
        
        // Check if username or email already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_users WHERE username = %s OR email = %s",
            $data['username'],
            $data['email']
        ));
        
        if ($existing) {
            return array('success' => false, 'message' => 'Usuário ou email já existe');
        }
        
        $result = $wpdb->insert(
            $table_users,
            array(
                'username' => sanitize_text_field($data['username']),
                'email' => sanitize_email($data['email']),
                'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                'role' => in_array($data['role'], array('admin', 'collaborator')) ? $data['role'] : 'collaborator',
                'status' => 'active'
            ),
            array('%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result) {
            return array('success' => true, 'user_id' => $wpdb->insert_id);
        }
        
        return array('success' => false, 'message' => 'Erro ao criar usuário');
    }
}