<?php

class CompanyHub_Database {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Set database version
        update_option('company_hub_db_version', COMPANY_HUB_VERSION);
        
        // Users table
        $table_users = $wpdb->prefix . 'ch_users';
        $sql_users = "CREATE TABLE $table_users (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            username varchar(50) NOT NULL,
            email varchar(100) NOT NULL,
            password varchar(255) NOT NULL,
            role enum('admin','collaborator') DEFAULT 'collaborator',
            status enum('active','inactive') DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY username (username),
            UNIQUE KEY email (email)
        ) $charset_collate;";
        
        // Sites table
        $table_sites = $wpdb->prefix . 'companyhub_sites';
        $sql_sites = "CREATE TABLE $table_sites (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            primary_url varchar(500) NOT NULL,
            other_urls text,
            category varchar(100),
            cms varchar(100),
            server varchar(255),
            hosting_provider varchar(255),
            hosting_type enum('shared','vps','dedicated','cloud') DEFAULT 'shared',
            responsible_user_id mediumint(9),
            team_members text,
            external_providers text,
            ftp_credentials text,
            ssh_credentials text,
            db_credentials text,
            google_analytics_id varchar(100),
            search_console_url varchar(500),
            tag_manager_id varchar(100),
            facebook_pixel_id varchar(100),
            webhook_urls text,
            main_keywords text,
            backlinks_count int DEFAULT 0,
            last_audit_date date,
            indexation_status enum('indexed','not_indexed','partial','unknown') DEFAULT 'unknown',
            hosting_cost decimal(10,2) DEFAULT 0.00,
            extra_costs decimal(10,2) DEFAULT 0.00,
            estimated_revenue decimal(10,2) DEFAULT 0.00,
            roi decimal(5,2) DEFAULT 0.00,
            status enum('active','inactive','maintenance') DEFAULT 'active',
            ssl_status enum('valid','invalid','expired') DEFAULT 'valid',
            dns_status enum('ok','warning','error') DEFAULT 'ok',
            domain_expiry date,
            uptime_status enum('up','down','unknown') DEFAULT 'unknown',
            last_uptime_check datetime,
            uptime_alerts enum('enabled','disabled') DEFAULT 'enabled',
            internal_notes text,
            attached_files text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY responsible_user_id (responsible_user_id),
            KEY status (status),
            KEY uptime_status (uptime_status)
        ) $charset_collate;";
        
        // Accounts table
        $table_accounts = $wpdb->prefix . 'ch_accounts';
        $sql_accounts = "CREATE TABLE $table_accounts (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            type enum('google_ads','analytics','search_console','affiliate','social','other') NOT NULL,
            credentials text,
            api_key varchar(255),
            access_token text,
            refresh_token text,
            expires_at datetime,
            status enum('active','inactive','expired') DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Leads table
        $table_leads = $wpdb->prefix . 'ch_leads';
        $sql_leads = "CREATE TABLE $table_leads (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255),
            phone varchar(50),
            company varchar(255),
            source varchar(100),
            status enum('new','contacted','qualified','converted','lost') DEFAULT 'new',
            assigned_to mediumint(9),
            notes text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY assigned_to (assigned_to),
            KEY status (status)
        ) $charset_collate;";
        
        // Tasks table
        $table_tasks = $wpdb->prefix . 'ch_tasks';
        $sql_tasks = "CREATE TABLE $table_tasks (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            status enum('todo','in_progress','done','cancelled') DEFAULT 'todo',
            priority enum('low','medium','high','urgent') DEFAULT 'medium',
            assigned_to mediumint(9),
            project varchar(255),
            due_date datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY assigned_to (assigned_to),
            KEY status (status)
        ) $charset_collate;";
        
        // Backlinks table
        $table_backlinks = $wpdb->prefix . 'ch_backlinks';
        $sql_backlinks = "CREATE TABLE $table_backlinks (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            source_url varchar(500) NOT NULL,
            target_url varchar(500) NOT NULL,
            anchor_text varchar(255),
            type enum('internal','external') DEFAULT 'external',
            status enum('active','broken','removed') DEFAULT 'active',
            last_checked datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY type (type),
            KEY status (status)
        ) $charset_collate;";
        
        // SEO Keywords table
        $table_seo_keywords = $wpdb->prefix . 'ch_seo_keywords';
        $sql_seo_keywords = "CREATE TABLE $table_seo_keywords (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            keyword varchar(255) NOT NULL,
            target_url varchar(500),
            search_volume int DEFAULT 0,
            difficulty enum('easy','medium','hard') DEFAULT 'medium',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY keyword (keyword)
        ) $charset_collate;";
        
        // SEO Rankings table
        $table_seo_rankings = $wpdb->prefix . 'ch_seo_rankings';
        $sql_seo_rankings = "CREATE TABLE $table_seo_rankings (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            keyword varchar(255) NOT NULL,
            target_url varchar(500),
            current_position int,
            previous_position int,
            target_position int,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY keyword (keyword)
        ) $charset_collate;";
        
        // SEO Audits table
        $table_seo_audits = $wpdb->prefix . 'ch_seo_audits';
        $sql_seo_audits = "CREATE TABLE $table_seo_audits (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            site_id mediumint(9) NOT NULL,
            status enum('pending','running','completed','failed') DEFAULT 'pending',
            results longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY site_id (site_id)
        ) $charset_collate;";
        
        // Automation Rules table
        $table_automation_rules = $wpdb->prefix . 'ch_automation_rules';
        $sql_automation_rules = "CREATE TABLE $table_automation_rules (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            trigger varchar(100) NOT NULL,
            action varchar(100) NOT NULL,
            conditions text,
            webhook_url varchar(500),
            email_template text,
            is_active tinyint(1) DEFAULT 1,
            execution_count int DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY trigger (trigger),
            KEY is_active (is_active)
        ) $charset_collate;";
        
        // Automation Webhooks table
        $table_automation_webhooks = $wpdb->prefix . 'ch_automation_webhooks';
        $sql_automation_webhooks = "CREATE TABLE $table_automation_webhooks (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            webhook_url varchar(500) NOT NULL,
            trigger varchar(100) NOT NULL,
            is_active tinyint(1) DEFAULT 1,
            last_execution datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY trigger (trigger),
            KEY is_active (is_active)
        ) $charset_collate;";
        
        // Financial records table
        $table_financial = $wpdb->prefix . 'ch_financial';
        $sql_financial = "CREATE TABLE $table_financial (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            type enum('income','expense') NOT NULL,
            category varchar(100) NOT NULL,
            description varchar(255) NOT NULL,
            amount decimal(10,2) NOT NULL,
            currency varchar(3) DEFAULT 'BRL',
            site_id mediumint(9),
            date date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY type (type),
            KEY site_id (site_id),
            KEY date (date),
            FOREIGN KEY (site_id) REFERENCES {$wpdb->prefix}companyhub_sites(id) ON DELETE SET NULL
        ) $charset_collate;";
        
        // Metrics table
        $table_metrics = $wpdb->prefix . 'ch_metrics';
        $sql_metrics = "CREATE TABLE $table_metrics (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            site_id mediumint(9) NOT NULL,
            metric_type varchar(50) NOT NULL,
            metric_value varchar(255) NOT NULL,
            date date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY site_id (site_id),
            KEY metric_type (metric_type),
            KEY date (date),
            FOREIGN KEY (site_id) REFERENCES {$wpdb->prefix}companyhub_sites(id) ON DELETE CASCADE
        ) $charset_collate;";
        
        // Activity log table
        $table_activity = $wpdb->prefix . 'ch_activity_log';
        $sql_activity = "CREATE TABLE $table_activity (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            action varchar(100) NOT NULL,
            details text,
            ip_address varchar(45),
            user_agent text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY action (action),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // Notifications table
        $table_notifications = $wpdb->prefix . 'ch_notifications';
        $sql_notifications = "CREATE TABLE $table_notifications (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            title varchar(255) NOT NULL,
            message text NOT NULL,
            type enum('info','success','warning','error') DEFAULT 'info',
            is_read tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY is_read (is_read)
        ) $charset_collate;";
        
        // Sessions table for better session management
        $table_sessions = $wpdb->prefix . 'ch_sessions';
        $sql_sessions = "CREATE TABLE $table_sessions (
            id varchar(128) NOT NULL,
            user_id mediumint(9) NOT NULL,
            ip_address varchar(45),
            user_agent text,
            data text,
            expires_at datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY expires_at (expires_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        dbDelta($sql_users);
        dbDelta($sql_sites);
        dbDelta($sql_accounts);
        dbDelta($sql_leads);
        dbDelta($sql_tasks);
        dbDelta($sql_backlinks);
        dbDelta($sql_seo_keywords);
        dbDelta($sql_seo_rankings);
        dbDelta($sql_seo_audits);
        dbDelta($sql_automation_rules);
        dbDelta($sql_automation_webhooks);
        dbDelta($sql_financial);
        dbDelta($sql_metrics);
        dbDelta($sql_activity);
        dbDelta($sql_notifications);
        dbDelta($sql_sessions);
        
        // Create default admin user
        self::create_default_admin();
    }
    
    public static function update_tables() {
        // Run create_tables to update schema
        self::create_tables();
        
        // Update version
        update_option('company_hub_db_version', COMPANY_HUB_VERSION);
        
        return true;
    }
    
    public static function drop_tables() {
        global $wpdb;
        
        $tables = array(
            'ch_users',
            'ch_sites',
            'ch_accounts',
            'ch_leads',
            'ch_tasks',
            'ch_backlinks',
            'ch_seo_keywords',
            'ch_seo_rankings',
            'ch_seo_audits',
            'ch_automation_rules',
            'ch_automation_webhooks',
            'ch_financial',
            'ch_metrics',
            'ch_activity_log',
            'ch_notifications',
            'ch_sessions'
        );
        
        foreach ($tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}{$table}");
        }
    }
    
    private static function create_default_admin() {
        global $wpdb;
        
        $table_users = $wpdb->prefix . 'ch_users';
        
        // Check if admin already exists
        $admin_exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_users WHERE role = %s",
            'admin'
        ));
        
        if (!$admin_exists) {
            $wpdb->insert(
                $table_users,
                array(
                    'username' => 'admin',
                    'email' => 'admin@company.com',
                    'password' => password_hash('admin123', PASSWORD_DEFAULT),
                    'role' => 'admin',
                    'status' => 'active'
                ),
                array('%s', '%s', '%s', '%s', '%s')
            );
        }
    }
}