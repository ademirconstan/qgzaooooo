import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function SEO() {
  const [activeTab, setActiveTab] = useState('keywords');
  const [keywords, setKeywords] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [audits, setAudits] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('all');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSites();
    fetchData();
  }, [activeTab]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'keywords':
          const keywordsResponse = await api.get('/seo/keywords');
          setKeywords(keywordsResponse.data);
          break;
        case 'rankings':
          const rankingsResponse = await api.get('/seo/rankings');
          setRankings(rankingsResponse.data);
          break;
        case 'audits':
          const auditsResponse = await api.get('/seo/audits');
          setAudits(auditsResponse.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/seo/${activeTab}`;
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving SEO data:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/seo/${activeTab}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Erro ao excluir. Tente novamente.');
      }
    }
  };

  const handleRunAudit = async (siteId) => {
    try {
      await api.post(`/seo/audit/${siteId}`);
      alert('Auditoria iniciada com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error running audit:', error);
      alert('Erro ao iniciar auditoria. Tente novamente.');
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setShowForm(false);
  };

  const getSiteById = (siteId) => {
    return sites.find(site => site.id === siteId);
  };

  const filteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'keywords':
        data = keywords;
        break;
      case 'rankings':
        data = rankings;
        break;
      case 'audits':
        data = audits;
        break;
    }

    return data.filter(item => {
      const matchesSearch = 
        (item.keyword && item.keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.site_name && item.site_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSite = filterSite === 'all' || item.site_id === filterSite;
      
      return matchesSearch && matchesSite;
    });
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
            '📈',
            'SEO & Marketing'
          ),
          React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Monitore e otimize o desempenho SEO dos seus sites')
        ),
        activeTab !== 'audits' && React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary flex items-center gap-2'
        },
          '➕ ',
          activeTab === 'keywords' ? 'Nova Palavra-chave' : 'Novo Ranking'
        )
      ),

      // Stats Cards
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8' },
        [
          { title: 'Palavras-chave', value: keywords.length, icon: '🔍' },
          { title: 'Rankings', value: rankings.length, icon: '📊' },
          { title: 'Top 10', value: rankings.filter(r => r.current_position <= 10).length, icon: '🎯' },
          { title: 'Auditorias', value: audits.length, icon: '📋' }
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

      // Tabs
      React.createElement('div', { className: 'border-b border-gray-200 mb-8' },
        React.createElement('nav', { className: 'flex space-x-8' },
          [
            { id: 'keywords', label: 'Palavras-chave', icon: '🔍' },
            { id: 'rankings', label: 'Rankings', icon: '📊' },
            { id: 'audits', label: 'Auditorias', icon: '📋' }
          ].map((tab) =>
            React.createElement('button', {
              key: tab.id,
              onClick: () => setActiveTab(tab.id),
              className: `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
              tab.icon,
              tab.label
            )
          )
        )
      ),

      // Content based on active tab
      activeTab === 'keywords' && React.createElement('div', { className: 'space-y-6' },
        // Filters
        React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('input', {
                type: 'text',
                placeholder: 'Buscar palavras-chave...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: 'form-input'
              })
            ),
            React.createElement('div', null,
              React.createElement('select', {
                value: filterSite,
                onChange: (e) => setFilterSite(e.target.value),
                className: 'form-select'
              },
                React.createElement('option', { value: 'all' }, 'Todos os sites'),
                sites.map(site =>
                  React.createElement('option', { key: site.id, value: site.id }, site.name)
                )
              )
            )
          )
        ),

        // Keywords Grid
        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' },
          filteredData().map((keyword) => {
            const site = getSiteById(keyword.site_id);
            return React.createElement('div', { key: keyword.id, className: 'card card-hover p-6' },
              React.createElement('div', { className: 'flex justify-between items-start mb-4' },
                React.createElement('div', { className: 'flex items-center gap-3' },
                  site && React.createElement('img', {
                    src: `https://www.google.com/s2/favicons?domain=${new URL(site.primary_url).hostname}&sz=32`,
                    alt: 'Favicon',
                    className: 'w-8 h-8 rounded',
                    onError: (e) => e.target.style.display = 'none'
                  }),
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'font-semibold text-gray-900' }, keyword.keyword),
                    React.createElement('p', { className: 'text-sm text-gray-600' }, site ? site.name : 'Site não encontrado')
                  )
                ),
                React.createElement('span', {
                  className: `status-badge ${
                    keyword.difficulty === 'easy' ? 'green' : 
                    keyword.difficulty === 'medium' ? 'orange' : 'red'
                  }`
                },
                  keyword.difficulty === 'easy' ? 'Fácil' : 
                  keyword.difficulty === 'medium' ? 'Médio' : 'Difícil'
                )
              ),

              React.createElement('div', { className: 'space-y-3' },
                keyword.target_url && React.createElement('div', null,
                  React.createElement('p', { className: 'text-xs text-gray-500 mb-1' }, 'URL de Destino:'),
                  React.createElement('a', {
                    href: keyword.target_url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-sm text-blue-600 hover:text-blue-800'
                  },
                    keyword.target_url.length > 30 
                      ? keyword.target_url.substring(0, 30) + '...' 
                      : keyword.target_url
                  )
                ),

                keyword.search_volume && React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('span', { className: 'text-sm text-gray-600' },
                    'Volume: ', keyword.search_volume.toLocaleString()
                  )
                ),

                React.createElement('div', { className: 'flex items-center gap-2 text-xs text-gray-500' },
                  '🕒 ',
                  new Date(keyword.created_at).toLocaleDateString()
                )
              ),

              React.createElement('div', { className: 'flex gap-2 mt-4 pt-4 border-t border-gray-200' },
                React.createElement('button', {
                  onClick: () => handleEdit(keyword),
                  className: 'flex-1 btn-primary btn-sm flex items-center justify-center gap-1'
                },
                  '✏️ Editar'
                ),
                React.createElement('button', {
                  onClick: () => handleDelete(keyword.id),
                  className: 'btn-danger btn-sm flex items-center justify-center'
                },
                  '🗑️'
                )
              )
            );
          })
        )
      ),

      activeTab === 'audits' && React.createElement('div', { className: 'space-y-6' },
        // Audit Actions
        React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6' },
          React.createElement('div', { className: 'flex justify-between items-center' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, 'Auditorias SEO'),
              React.createElement('p', { className: 'text-sm text-gray-600' }, 'Execute auditorias completas nos seus sites')
            ),
            React.createElement('select', {
              onChange: (e) => {
                if (e.target.value) {
                  handleRunAudit(e.target.value);
                  e.target.value = '';
                }
              },
              className: 'form-select max-w-xs',
              defaultValue: ''
            },
              React.createElement('option', { value: '' }, 'Selecione um site para auditar...'),
              sites.map(site =>
                React.createElement('option', { key: site.id, value: site.id }, site.name)
              )
            )
          )
        ),

        // Audits Grid
        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          audits.map((audit) => {
            const site = getSiteById(audit.site_id);
            let results = null;
            try {
              results = audit.results ? JSON.parse(audit.results) : null;
            } catch (e) {
              console.error('Error parsing audit results:', e);
            }

            return React.createElement('div', { key: audit.id, className: 'card p-6' },
              React.createElement('div', { className: 'flex justify-between items-start mb-4' },
                React.createElement('div', { className: 'flex items-center gap-3' },
                  site && React.createElement('img', {
                    src: `https://www.google.com/s2/favicons?domain=${new URL(site.primary_url).hostname}&sz=32`,
                    alt: 'Favicon',
                    className: 'w-8 h-8 rounded',
                    onError: (e) => e.target.style.display = 'none'
                  }),
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'font-semibold text-gray-900' },
                      site ? site.name : `Site ID: ${audit.site_id}`
                    ),
                    React.createElement('p', { className: 'text-sm text-gray-600' },
                      new Date(audit.created_at).toLocaleString()
                    )
                  )
                ),
                React.createElement('span', {
                  className: `status-badge ${
                    audit.status === 'completed' ? 'green' : 
                    audit.status === 'running' ? 'orange' : 
                    audit.status === 'failed' ? 'red' : 'gray'
                  }`
                },
                  audit.status === 'completed' ? 'Concluída' : 
                  audit.status === 'running' ? 'Executando' : 
                  audit.status === 'failed' ? 'Falhou' : 'Pendente'
                )
              ),

              results && audit.status === 'completed' && React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'flex items-center justify-between p-4 bg-gray-50 rounded-lg' },
                  React.createElement('div', null,
                    React.createElement('p', { className: 'text-sm font-medium text-gray-700' }, 'Score SEO'),
                    React.createElement('p', {
                      className: `text-2xl font-bold ${
                        results.seo_score >= 80 ? 'text-green-600' : 
                        results.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`
                    },
                      results.seo_score, '/100'
                    )
                  ),
                  React.createElement('div', { className: 'text-right' },
                    React.createElement('p', { className: 'text-sm font-medium text-gray-700' }, 'Problemas'),
                    React.createElement('p', { className: 'text-2xl font-bold text-red-600' },
                      results.issues_count || 0
                    )
                  )
                )
              ),

              audit.status === 'running' && React.createElement('div', { className: 'flex items-center justify-center py-8' },
                React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }),
                React.createElement('span', { className: 'ml-3 text-gray-600' }, 'Executando auditoria...')
              ),

              audit.status === 'failed' && React.createElement('div', { className: 'flex items-center justify-center py-8 text-red-600' },
                '❌ Falha na execução da auditoria'
              )
            );
          })
        )
      ),

      // Empty State
      filteredData().length === 0 && activeTab !== 'audits' && React.createElement('div', { className: 'text-center py-12' },
        React.createElement('span', { className: 'text-6xl mb-4 block' },
          activeTab === 'keywords' ? '🔍' : '📊'
        ),
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' },
          activeTab === 'keywords' ? 'Nenhuma palavra-chave cadastrada' : 'Nenhum ranking cadastrado'
        ),
        React.createElement('p', { className: 'text-gray-600 mb-6' },
          'Comece adicionando ', activeTab === 'keywords' ? 'palavras-chave' : 'rankings', ' para monitorar.'
        ),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'btn-primary'
        },
          activeTab === 'keywords' ? 'Adicionar Primeira Palavra-chave' : 'Adicionar Primeiro Ranking'
        )
      ),

      // Modal Form
      showForm && activeTab !== 'audits' && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              editingId ? 'Editar' : 'Novo', ' ', activeTab === 'keywords' ? 'Palavra-chave' : 'Ranking'
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
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Palavra-chave *'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.keyword || '',
                  onChange: (e) => setFormData({...formData, keyword: e.target.value}),
                  className: 'form-input',
                  required: true
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Site *'),
                React.createElement('select', {
                  value: formData.site_id || '',
                  onChange: (e) => setFormData({...formData, site_id: e.target.value}),
                  className: 'form-select',
                  required: true
                },
                  React.createElement('option', { value: '' }, 'Selecione um site...'),
                  sites.map(site =>
                    React.createElement('option', { key: site.id, value: site.id }, site.name)
                  )
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'URL de Destino'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.target_url || '',
                  onChange: (e) => setFormData({...formData, target_url: e.target.value}),
                  className: 'form-input'
                })
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

export default SEO;