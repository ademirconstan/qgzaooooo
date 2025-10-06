import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function Backlinks() {
  const [backlinks, setBacklinks] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    anchor_text: '',
    type: 'external',
    site_id: '',
    target_site_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [backlinksResponse, sitesResponse] = await Promise.all([
        api.get('/backlinks'),
        api.get('/sites')
      ]);
      setBacklinks(backlinksResponse.data);
      setSites(sitesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/backlinks/${editingId}`, formData);
      } else {
        await api.post('/backlinks', formData);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving backlink:', error);
      alert('Erro ao salvar backlink. Tente novamente.');
    }
  };

  const handleEdit = (backlink) => {
    setFormData({
      source_url: backlink.source_url,
      target_url: backlink.target_url,
      anchor_text: backlink.anchor_text || '',
      type: backlink.type || 'external',
      site_id: backlink.site_id || '',
      target_site_id: backlink.target_site_id || ''
    });
    setEditingId(backlink.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este backlink?')) {
      try {
        await api.delete(`/backlinks/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting backlink:', error);
        alert('Erro ao excluir backlink. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source_url: '',
      target_url: '',
      anchor_text: '',
      type: 'external',
      site_id: '',
      target_site_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'broken': return 'red';
      case 'removed': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'internal': return 'blue';
      case 'external': return 'purple';
      default: return 'gray';
    }
  };

  const getSiteByUrl = (url) => {
    return sites.find(site => url.includes(new URL(site.primary_url).hostname));
  };

  const filteredBacklinks = backlinks.filter(backlink => {
    const matchesSearch = 
      backlink.source_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backlink.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (backlink.anchor_text && backlink.anchor_text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || backlink.type === filterType;
    const matchesStatus = filterStatus === 'all' || backlink.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
            '🔗',
            'Gestão de Backlinks'
          ),
          React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Monitore e gerencie todos os seus backlinks')
        ),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary flex items-center gap-2'
        },
          '➕ Novo Backlink'
        )
      ),

      // Stats Cards
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8' },
        [
          { title: 'Total de Backlinks', value: backlinks.length, icon: '🔗' },
          { title: 'Ativos', value: backlinks.filter(b => b.status === 'active').length, icon: '✅' },
          { title: 'Quebrados', value: backlinks.filter(b => b.status === 'broken').length, icon: '❌' },
          { title: 'Externos', value: backlinks.filter(b => b.type === 'external').length, icon: '🌐' }
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

      // Filters
      React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement('div', { className: 'relative' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'Buscar por URL ou texto âncora...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: 'form-input'
            })
          ),
          React.createElement('div', null,
            React.createElement('select', {
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              className: 'form-select'
            },
              React.createElement('option', { value: 'all' }, 'Todos os tipos'),
              React.createElement('option', { value: 'internal' }, 'Interno'),
              React.createElement('option', { value: 'external' }, 'Externo')
            )
          ),
          React.createElement('div', null,
            React.createElement('select', {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: 'form-select'
            },
              React.createElement('option', { value: 'all' }, 'Todos os status'),
              React.createElement('option', { value: 'active' }, 'Ativo'),
              React.createElement('option', { value: 'broken' }, 'Quebrado'),
              React.createElement('option', { value: 'removed' }, 'Removido')
            )
          )
        )
      ),

      // Backlinks Table
      React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden' },
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement('thead', { className: 'bg-gray-50' },
              React.createElement('tr', null,
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Origem'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Destino'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Texto Âncora'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Tipo'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Status'),
                React.createElement('th', { className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Ações')
              )
            ),
            React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
              filteredBacklinks.map((backlink) => {
                const sourceSite = getSiteByUrl(backlink.source_url);
                const targetSite = getSiteByUrl(backlink.target_url);
                
                return React.createElement('tr', { key: backlink.id, className: 'hover:bg-gray-50' },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'flex items-center' },
                      React.createElement('div', { className: 'flex-shrink-0 h-8 w-8' },
                        sourceSite ? React.createElement('img', {
                          src: `https://www.google.com/s2/favicons?domain=${new URL(sourceSite.primary_url).hostname}&sz=32`,
                          alt: 'Favicon',
                          className: 'h-8 w-8 rounded',
                          onError: (e) => e.target.style.display = 'none'
                        }) : React.createElement('span', { className: 'text-2xl' }, '🌐')
                      ),
                      React.createElement('div', { className: 'ml-4' },
                        React.createElement('div', { className: 'text-sm font-medium text-gray-900' },
                          sourceSite ? sourceSite.name : new URL(backlink.source_url).hostname
                        ),
                        React.createElement('a', {
                          href: backlink.source_url,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          className: 'text-sm text-blue-600 hover:text-blue-800'
                        },
                          backlink.source_url.length > 40 
                            ? backlink.source_url.substring(0, 40) + '...' 
                            : backlink.source_url
                        )
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'flex items-center' },
                      React.createElement('div', { className: 'flex-shrink-0 h-8 w-8' },
                        targetSite ? React.createElement('img', {
                          src: `https://www.google.com/s2/favicons?domain=${new URL(targetSite.primary_url).hostname}&sz=32`,
                          alt: 'Favicon',
                          className: 'h-8 w-8 rounded',
                          onError: (e) => e.target.style.display = 'none'
                        }) : React.createElement('span', { className: 'text-2xl' }, '🌐')
                      ),
                      React.createElement('div', { className: 'ml-4' },
                        React.createElement('div', { className: 'text-sm font-medium text-gray-900' },
                          targetSite ? targetSite.name : new URL(backlink.target_url).hostname
                        ),
                        React.createElement('a', {
                          href: backlink.target_url,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          className: 'text-sm text-blue-600 hover:text-blue-800'
                        },
                          backlink.target_url.length > 40 
                            ? backlink.target_url.substring(0, 40) + '...' 
                            : backlink.target_url
                        )
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'text-sm text-gray-900' },
                      backlink.anchor_text || React.createElement('span', { className: 'text-gray-400 italic' }, 'Sem texto âncora')
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('span', { className: `status-badge ${getTypeColor(backlink.type)}` },
                      backlink.type === 'internal' ? 'Interno' : 'Externo'
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('span', { className: `status-badge ${getStatusColor(backlink.status)}` },
                      backlink.status === 'active' ? 'Ativo' : 
                      backlink.status === 'broken' ? 'Quebrado' : 
                      backlink.status === 'removed' ? 'Removido' : 'Desconhecido'
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium' },
                    React.createElement('div', { className: 'flex items-center justify-end gap-2' },
                      React.createElement('button', {
                        onClick: () => handleEdit(backlink),
                        className: 'text-blue-600 hover:text-blue-900',
                        title: 'Editar'
                      }, '✏️'),
                      React.createElement('button', {
                        onClick: () => handleDelete(backlink.id),
                        className: 'text-red-600 hover:text-red-900',
                        title: 'Excluir'
                      }, '🗑️')
                    )
                  )
                );
              })
            )
          )
        )
      ),

      // Empty State
      filteredBacklinks.length === 0 && React.createElement('div', { className: 'text-center py-12' },
        React.createElement('span', { className: 'text-6xl mb-4 block' }, '🔗'),
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' },
          backlinks.length === 0 ? 'Nenhum backlink cadastrado' : 'Nenhum backlink encontrado'
        ),
        React.createElement('p', { className: 'text-gray-600 mb-6' },
          backlinks.length === 0 
            ? 'Comece adicionando seu primeiro backlink para monitorar.'
            : 'Tente ajustar os filtros para encontrar o que procura.'
        ),
        backlinks.length === 0 && React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary'
        },
          'Adicionar Primeiro Backlink'
        )
      ),

      // Modal Form
      showForm && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              editingId ? 'Editar Backlink' : 'Novo Backlink'
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
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'URL de Origem *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.source_url,
                  onChange: (e) => setFormData({...formData, source_url: e.target.value}),
                  placeholder: 'https://exemplo.com/pagina-com-link',
                  className: 'form-input',
                  required: true
                }),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, 'URL da página que contém o link')
              ),
              
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'URL de Destino *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.target_url,
                  onChange: (e) => setFormData({...formData, target_url: e.target.value}),
                  placeholder: 'https://meusite.com/pagina-destino',
                  className: 'form-input',
                  required: true
                }),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, 'URL para onde o link aponta')
              ),
              
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Texto Âncora'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.anchor_text,
                  onChange: (e) => setFormData({...formData, anchor_text: e.target.value}),
                  placeholder: 'Texto do link',
                  className: 'form-input'
                })
              ),
              
              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Tipo'),
                  React.createElement('select', {
                    value: formData.type,
                    onChange: (e) => setFormData({...formData, type: e.target.value}),
                    className: 'form-select'
                  },
                    React.createElement('option', { value: 'external' }, 'Externo'),
                    React.createElement('option', { value: 'internal' }, 'Interno')
                  )
                ),
                
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Site de Origem'),
                  React.createElement('select', {
                    value: formData.site_id,
                    onChange: (e) => setFormData({...formData, site_id: e.target.value}),
                    className: 'form-select'
                  },
                    React.createElement('option', { value: '' }, 'Selecione um site...'),
                    sites.map(site =>
                      React.createElement('option', { key: site.id, value: site.id }, site.name)
                    )
                  )
                )
              ),
              
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Site de Destino'),
                React.createElement('select', {
                  value: formData.target_site_id,
                  onChange: (e) => setFormData({...formData, target_site_id: e.target.value}),
                  className: 'form-select'
                },
                  React.createElement('option', { value: '' }, 'Selecione um site...'),
                  sites.map(site =>
                    React.createElement('option', { key: site.id, value: site.id }, site.name)
                  )
                )
              )
            ),
            
            React.createElement('div', { className: 'flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6' },
              React.createElement('button', {
                type: 'button',
                onClick: resetForm,
                className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              }, 'Cancelar'),
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

export default Backlinks;