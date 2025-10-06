import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    primary_url: '',
    category: '',
    cms: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/sites/${editingId}`, formData);
      } else {
        await api.post('/sites', formData);
      }
      resetForm();
      fetchSites();
    } catch (error) {
      console.error('Error saving site:', error);
      alert('Erro ao salvar site. Tente novamente.');
    }
  };

  const handleEdit = (site) => {
    setFormData({
      name: site.name || '',
      primary_url: site.primary_url || '',
      category: site.category || '',
      cms: site.cms || '',
      status: site.status || 'active'
    });
    setEditingId(site.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este site?')) {
      try {
        await api.delete(`/sites/${id}`);
        fetchSites();
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Erro ao excluir site. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      primary_url: '',
      category: '',
      cms: '',
      status: 'active'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'maintenance': return 'orange';
      default: return 'gray';
    }
  };

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' })
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      // Header
      React.createElement('div', { className: 'flex justify-between items-center mb-8' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 flex items-center gap-3' },
            '🌐',
            'Gestão de Sites'
          ),
          React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Gerencie todos os seus sites em um só lugar')
        ),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary flex items-center gap-2'
        },
          '🌐 Adicionar Site'
        )
      ),

      // Stats Cards
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8' },
        [
          { title: 'Total de Sites', value: sites.length, icon: '🌐' },
          { title: 'Sites Ativos', value: sites.filter(s => s.status === 'active').length, icon: '✅' },
          { title: 'Em Manutenção', value: sites.filter(s => s.status === 'maintenance').length, icon: '⚠️' },
          { title: 'Custo Total', value: 'R$ 0', icon: '💰' }
        ].map((stat, index) =>
          React.createElement('div', { key: index, className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, stat.title),
                React.createElement('p', { className: 'text-2xl font-bold text-gray-900' }, stat.value)
              ),
              React.createElement('span', { className: 'text-2xl' }, stat.icon)
            )
          )
        )
      ),

      // Sites Grid
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' },
        sites.map((site) =>
          React.createElement('div', { key: site.id, className: 'card card-hover p-6' },
            // Site Header
            React.createElement('div', { className: 'flex items-start justify-between mb-4' },
              React.createElement('div', { className: 'flex items-center gap-3' },
                getFavicon(site.primary_url) && React.createElement('img', {
                  src: getFavicon(site.primary_url),
                  alt: 'Favicon',
                  className: 'w-8 h-8 rounded',
                  onError: (e) => e.target.style.display = 'none'
                }),
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-semibold text-gray-900 text-lg' }, site.name),
                  React.createElement('a', {
                    href: site.primary_url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1'
                  },
                    new URL(site.primary_url).hostname,
                    ' 🔗'
                  )
                )
              ),
              React.createElement('span', {
                className: `status-badge ${getStatusColor(site.status)}`
              },
                site.status === 'active' ? 'Ativo' :
                site.status === 'inactive' ? 'Inativo' : 'Manutenção'
              )
            ),

            // Site Info
            React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4' },
              site.category && React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
                '📊',
                React.createElement('span', { className: 'capitalize' }, site.category)
              ),
              site.cms && React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
                '💾',
                React.createElement('span', null, site.cms)
              )
            ),

            // Actions
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', {
                onClick: () => handleEdit(site),
                className: 'flex-1 btn-primary btn-sm flex items-center justify-center gap-1'
              },
                '✏️ Editar'
              ),
              React.createElement('button', {
                onClick: () => handleDelete(site.id),
                className: 'btn-danger btn-sm flex items-center justify-center'
              },
                '🗑️'
              )
            )
          )
        )
      ),

      // Empty State
      sites.length === 0 && React.createElement('div', { className: 'text-center py-12' },
        React.createElement('span', { className: 'text-6xl mb-4 block' }, '🌐'),
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'Nenhum site cadastrado'),
        React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Comece adicionando seu primeiro site para gerenciar.'),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary'
        },
          'Adicionar Primeiro Site'
        )
      ),

      // Modal Form
      showForm && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              editingId ? 'Editar Site' : 'Novo Site'
            ),
            React.createElement('button', {
              onClick: resetForm,
              className: 'text-gray-400 hover:text-gray-600'
            },
              React.createElement('span', { className: 'text-2xl' }, '×')
            )
          ),

          React.createElement('form', { onSubmit: handleSubmit, className: 'p-6' },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Nome do Site *'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.name,
                  onChange: (e) => setFormData({...formData, name: e.target.value}),
                  className: 'form-input',
                  required: true
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'URL Principal *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.primary_url,
                  onChange: (e) => setFormData({...formData, primary_url: e.target.value}),
                  className: 'form-input',
                  required: true
                })
              ),
              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Categoria'),
                  React.createElement('select', {
                    value: formData.category,
                    onChange: (e) => setFormData({...formData, category: e.target.value}),
                    className: 'form-select'
                  },
                    React.createElement('option', { value: '' }, 'Selecione...'),
                    React.createElement('option', { value: 'ecommerce' }, 'E-commerce'),
                    React.createElement('option', { value: 'blog' }, 'Blog'),
                    React.createElement('option', { value: 'corporate' }, 'Corporativo'),
                    React.createElement('option', { value: 'portfolio' }, 'Portfólio'),
                    React.createElement('option', { value: 'landing' }, 'Landing Page'),
                    React.createElement('option', { value: 'other' }, 'Outro')
                  )
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'CMS'),
                  React.createElement('select', {
                    value: formData.cms,
                    onChange: (e) => setFormData({...formData, cms: e.target.value}),
                    className: 'form-select'
                  },
                    React.createElement('option', { value: '' }, 'Selecione...'),
                    React.createElement('option', { value: 'wordpress' }, 'WordPress'),
                    React.createElement('option', { value: 'woocommerce' }, 'WooCommerce'),
                    React.createElement('option', { value: 'shopify' }, 'Shopify'),
                    React.createElement('option', { value: 'custom' }, 'Personalizado'),
                    React.createElement('option', { value: 'static' }, 'Site Estático')
                  )
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Status'),
                React.createElement('select', {
                  value: formData.status,
                  onChange: (e) => setFormData({...formData, status: e.target.value}),
                  className: 'form-select'
                },
                  React.createElement('option', { value: 'active' }, 'Ativo'),
                  React.createElement('option', { value: 'inactive' }, 'Inativo'),
                  React.createElement('option', { value: 'maintenance' }, 'Manutenção')
                )
              )
            ),

            React.createElement('div', { className: 'flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6' },
              React.createElement('button', {
                type: 'button',
                onClick: resetForm,
                className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              },
                'Cancelar'
              ),
              React.createElement('button', {
                type: 'submit',
                className: 'btn-primary'
              },
                editingId ? 'Atualizar' : 'Salvar'
              )
            )
          )
        )
      )
    )
  );
}

export default Sites;