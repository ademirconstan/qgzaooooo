jQuery(document).ready(function($) {
    'use strict';
    
    // Admin JavaScript for Company Hub
    var CompanyHubAdmin = {
        
        init: function() {
            this.bindEvents();
            this.initComponents();
        },
        
        bindEvents: function() {
            // Module toggle
            $(document).on('change', '.module-toggle', this.toggleModule);
            
            // Confirm delete actions
            $(document).on('click', '.delete-item', this.confirmDelete);
            
            // AJAX form submissions
            $(document).on('submit', '.ajax-form', this.submitAjaxForm);
            
            // Dismiss notices
            $(document).on('click', '.notice-dismiss', this.dismissNotice);
        },
        
        initComponents: function() {
            // Initialize tooltips if available
            if ($.fn.tooltip) {
                $('[data-tooltip]').tooltip();
            }
            
            // Initialize date pickers
            if ($.fn.datepicker) {
                $('.datepicker').datepicker({
                    dateFormat: 'yy-mm-dd'
                });
            }
        },
        
        toggleModule: function(e) {
            var $this = $(this);
            var module = $this.data('module');
            var enabled = $this.is(':checked');
            
            $.ajax({
                url: companyHubAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'ch_toggle_module',
                    module: module,
                    enabled: enabled ? 1 : 0,
                    security: companyHubAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        CompanyHubAdmin.showNotice('success', companyHubAdmin.strings.success);
                    } else {
                        CompanyHubAdmin.showNotice('error', response.data || companyHubAdmin.strings.error_occurred);
                        $this.prop('checked', !enabled);
                    }
                },
                error: function() {
                    CompanyHubAdmin.showNotice('error', companyHubAdmin.strings.error_occurred);
                    $this.prop('checked', !enabled);
                }
            });
        },
        
        confirmDelete: function(e) {
            if (!confirm(companyHubAdmin.strings.confirm_delete)) {
                e.preventDefault();
                return false;
            }
        },
        
        submitAjaxForm: function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var $submitBtn = $form.find('[type="submit"]');
            var originalText = $submitBtn.val();
            
            // Disable submit button
            $submitBtn.prop('disabled', true).val('Salvando...');
            
            $.ajax({
                url: $form.attr('action') || companyHubAdmin.ajaxUrl,
                type: $form.attr('method') || 'POST',
                data: $form.serialize(),
                success: function(response) {
                    if (response.success) {
                        CompanyHubAdmin.showNotice('success', response.data || companyHubAdmin.strings.success);
                        
                        // Reset form if specified
                        if ($form.hasClass('reset-on-success')) {
                            $form[0].reset();
                        }
                    } else {
                        CompanyHubAdmin.showNotice('error', response.data || companyHubAdmin.strings.error_occurred);
                    }
                },
                error: function() {
                    CompanyHubAdmin.showNotice('error', companyHubAdmin.strings.error_occurred);
                },
                complete: function() {
                    // Re-enable submit button
                    $submitBtn.prop('disabled', false).val(originalText);
                }
            });
        },
        
        dismissNotice: function(e) {
            $(this).closest('.notice').fadeOut();
        },
        
        showNotice: function(type, message) {
            var noticeClass = 'notice-' + type;
            var $notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p><button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss</span></button></div>');
            
            $('.wrap h1').after($notice);
            
            // Auto-dismiss success notices
            if (type === 'success') {
                setTimeout(function() {
                    $notice.fadeOut();
                }, 3000);
            }
        },
        
        // Utility functions
        formatCurrency: function(amount, currency) {
            currency = currency || 'BRL';
            
            switch (currency) {
                case 'BRL':
                    return 'R$ ' + parseFloat(amount).toLocaleString('pt-BR', {minimumFractionDigits: 2});
                case 'USD':
                    return '$' + parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2});
                default:
                    return parseFloat(amount).toFixed(2);
            }
        },
        
        validateEmail: function(email) {
            var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        validateUrl: function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // Initialize admin
    CompanyHubAdmin.init();
    
    // Make CompanyHubAdmin globally available
    window.CompanyHubAdmin = CompanyHubAdmin;
});