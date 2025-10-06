import React, { useState, useEffect } from 'react';
import { backlinksService, sitesService, opportunitiesService, obligationsService } from '../services/supabase.js';

function Backlinks() {
  const [backlinks, setBacklinks] = useState([]);
  const [sites, setSites] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOpportunitiesPanel, setShowOpportunitiesPanel] = useState(true);
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
    target_site_id: '',
    da: '',
    pa: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [backlinksData, sitesData, opportunitiesData] = await Promise.all([
        backlinksService.getAll(),
        sitesService.getAll(),
        opportunitiesService.getAll()
      ]);

      setBacklinks(backlinksData);
      setSites(sitesData);
      setOpportunities(opportunitiesData);

      if (sitesData.length > 0) {
        const allObligations = [];
        for (const site of sitesData) {
          const siteObligations = await obligationsService.getAllForSite(site.id);
          allObligations.push(...siteObligations);
        }
        setObligations(allObligations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        da: formData.da ? parseInt(formData.da) : null,
        pa: formData.pa ? parseInt(formData.pa) : null
      };

      if (editingId) {
        await backlinksService.update(editingId, submitData);
      } else {
        await backlinksService.create(submitData);
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
      target_site_id: backlink.target_site_id || '',
      da: backlink.da || '',
      pa: backlink.pa || ''
    });
    setEditingId(backlink.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este backlink?')) {
      try {
        await backlinksService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting backlink:', error);
        alert('Erro ao excluir backlink. Tente novamente.');
      }
    }
  };

  const handleMarkObligationComplete = async (obligationId, backlinkId) => {
    try {
      await obligationsService.update(obligationId, {
        status: 'completed',
        backlink_id: backlinkId,
        completed_at: new Date().toISOString()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating obligation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      source_url: '',
      target_url: '',
      anchor_text: '',
      type: 'external',
      site_id: '',
      target_site_id: '',
      da: '',
      pa: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'broken': return 'bg-red-100 text-red-800';
      case 'removed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSiteByUrl = (url) => {
    try {
      return sites.find(site => url.includes(new URL(site.primary_url).hostname));
    } catch {
      return null;
    }
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

  const pendingObligations = obligations.filter(obl => obl.status === 'pending' || obl.status === 'in_progress');

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' })
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'flex justify-between items-center mb-8' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Gestão de Backlinks'),
          React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Monitore e gerencie todos os seus backlinks e oportunidades')
        ),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium'
        }, 'Novo Backlink')
      ),

      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-5 gap-6 mb-8' },
        [
          { title: 'Total de Backlinks', value: backlinks.length, icon: '🔗', color: 'blue' },
          { title: 'Ativos', value: backlinks.filter(b => b.status === 'active').length, icon: '✓', color: 'green' },
          { title: 'Quebrados', value: backlinks.filter(b => b.status === 'broken').length, icon: '✗', color: 'red' },
          { title: 'Externos', value: backlinks.filter(b => b.type === 'external').length, icon: '🌐', color: 'orange' },
          { title: 'Obrigações Pendentes', value: pendingObligations.length, icon: '⏳', color: 'orange' }
        ].map((stat, index) =>
          React.createElement('div', { key: index, className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, stat.title),
                React.createElement('p', { className: 'text-2xl font-bold text-gray-900 mt-1' }, stat.value)
              ),
              React.createElement('div', { className: 'text-2xl' }, stat.icon)
            )
          )
        )
      ),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6' },
        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6' },
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
              React.createElement('div', null,
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Buscar por URL ou texto âncora...',
                  value: searchTerm,
                  onChange: (e) => setSearchTerm(e.target.value),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                })
              ),
              React.createElement('div', null,
                React.createElement('select', {
                  value: filterType,
                  onChange: (e) => setFilterType(e.target.value),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                },
                  React.createElement('option', { value: 'all' }, 'Todos os status'),
                  React.createElement('option', { value: 'active' }, 'Ativo'),
                  React.createElement('option', { value: 'broken' }, 'Quebrado'),
                  React.createElement('option', { value: 'removed' }, 'Removido')
                )
              )
            )
          ),

          React.createElement('div', { className: 'space-y-4' },
            filteredBacklinks.length > 0 ? filteredBacklinks.map(backlink => {
              const sourceSite = getSiteByUrl(backlink.source_url);
              const targetSite = getSiteByUrl(backlink.target_url);

              return React.createElement('div', {
                key: backlink.id,
                className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
              },
                React.createElement('div', { className: 'flex justify-between items-start mb-4' },
                  React.createElement('div', { className: 'flex-1' },
                    React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
                      React.createElement('span', {
                        className: `px-2 py-1 text-xs font-medium rounded ${getStatusColor(backlink.status)}`
                      },
                        backlink.status === 'active' ? 'Ativo' :
                        backlink.status === 'broken' ? 'Quebrado' : 'Removido'
                      ),
                      React.createElement('span', {
                        className: `px-2 py-1 text-xs font-medium rounded ${
                          backlink.type === 'external' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`
                      }, backlink.type === 'external' ? 'Externo' : 'Interno'),
                      backlink.da && React.createElement('span', { className: 'text-xs text-gray-600' }, `DA: ${backlink.da}`),
                      backlink.pa && React.createElement('span', { className: 'text-xs text-gray-600' }, `PA: ${backlink.pa}`)
                    )
                  ),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', {
                      onClick: () => handleEdit(backlink),
                      className: 'text-blue-600 hover:text-blue-800 text-sm font-medium'
                    }, 'Editar'),
                    React.createElement('button', {
                      onClick: () => handleDelete(backlink.id),
                      className: 'text-red-600 hover:text-red-800 text-sm font-medium'
                    }, 'Excluir')
                  )
                ),

                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                  React.createElement('div', null,
                    React.createElement('h4', { className: 'text-sm font-medium text-gray-500 mb-2' }, 'Origem'),
                    sourceSite && React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-1' }, sourceSite.name),
                    React.createElement('a', {
                      href: backlink.source_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-sm text-blue-600 hover:text-blue-800 break-all'
                    }, backlink.source_url)
                  ),
                  React.createElement('div', null,
                    React.createElement('h4', { className: 'text-sm font-medium text-gray-500 mb-2' }, 'Destino'),
                    targetSite && React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-1' }, targetSite.name),
                    React.createElement('a', {
                      href: backlink.target_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-sm text-blue-600 hover:text-blue-800 break-all'
                    }, backlink.target_url)
                  )
                ),

                backlink.anchor_text && React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-200' },
                  React.createElement('p', { className: 'text-sm text-gray-600' },
                    React.createElement('span', { className: 'font-medium' }, 'Texto Âncora: '),
                    backlink.anchor_text
                  )
                )
              );
            }) : React.createElement('div', { className: 'text-center py-12 bg-white rounded-lg border border-gray-200' },
              React.createElement('div', { className: 'text-6xl mb-4' }, '🔗'),
              React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' },
                backlinks.length === 0 ? 'Nenhum backlink cadastrado' : 'Nenhum backlink encontrado'
              ),
              React.createElement('p', { className: 'text-gray-600' },
                backlinks.length === 0
                  ? 'Comece adicionando seu primeiro backlink para monitorar.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'
              )
            )
          )
        ),

        React.createElement('div', { className: 'lg:col-span-1' },
          React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6' },
            React.createElement('div', { className: 'p-4 border-b border-gray-200' },
              React.createElement('h3', { className: 'font-semibold text-gray-900' }, 'Oportunidades de Backlinks')
            ),
            React.createElement('div', { className: 'p-4 max-h-[calc(100vh-200px)] overflow-y-auto' },
              pendingObligations.length > 0 ? React.createElement('div', { className: 'mb-6' },
                React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Suas Obrigações Pendentes'),
                React.createElement('div', { className: 'space-y-3' },
                  pendingObligations.map(obligation => {
                    const site = sites.find(s => s.id === obligation.site_id);
                    return React.createElement('div', {
                      key: obligation.id,
                      className: 'p-3 bg-orange-50 border border-orange-200 rounded-lg'
                    },
                      React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-1' },
                        site?.name || 'Site'
                      ),
                      obligation.opportunity && React.createElement('p', { className: 'text-xs text-gray-600 mb-2' },
                        obligation.opportunity.platform_name
                      ),
                      React.createElement('span', {
                        className: `px-2 py-1 text-xs font-medium rounded ${
                          obligation.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`
                      },
                        obligation.status === 'pending' ? 'Pendente' : 'Em Andamento'
                      )
                    );
                  })
                )
              ) : null,

              React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Plataformas Recomendadas'),
              React.createElement('div', { className: 'space-y-3' },
                opportunities.slice(0, 10).map(opp =>
                  React.createElement('div', {
                    key: opp.id,
                    className: 'p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors'
                  },
                    React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                      React.createElement('h5', { className: 'text-sm font-semibold text-gray-900' }, opp.platform_name),
                      React.createElement('span', {
                        className: `px-2 py-1 text-xs font-medium rounded ${getPriorityColor(opp.priority)}`
                      },
                        opp.priority === 'high' ? 'Alta' :
                        opp.priority === 'medium' ? 'Média' : 'Baixa'
                      )
                    ),
                    opp.da && React.createElement('p', { className: 'text-xs text-gray-600 mb-2' }, `DA: ${opp.da}`),
                    React.createElement('p', { className: 'text-xs text-gray-600 mb-2' }, opp.notes),
                    React.createElement('a', {
                      href: opp.platform_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-xs text-blue-600 hover:text-blue-800'
                    }, 'Visitar plataforma')
                  )
                )
              )
            )
          )
        )
      ),

      showForm && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              editingId ? 'Editar Backlink' : 'Novo Backlink'
            ),
            React.createElement('button', {
              onClick: resetForm,
              className: 'text-gray-400 hover:text-gray-600 text-2xl'
            }, '×')
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
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
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
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
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
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                })
              ),

              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Tipo'),
                  React.createElement('select', {
                    value: formData.type,
                    onChange: (e) => setFormData({...formData, type: e.target.value}),
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  },
                    React.createElement('option', { value: '' }, 'Selecione um site...'),
                    sites.map(site =>
                      React.createElement('option', { key: site.id, value: site.id }, site.name)
                    )
                  )
                )
              ),

              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Site de Destino'),
                  React.createElement('select', {
                    value: formData.target_site_id,
                    onChange: (e) => setFormData({...formData, target_site_id: e.target.value}),
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  },
                    React.createElement('option', { value: '' }, 'Selecione um site...'),
                    sites.map(site =>
                      React.createElement('option', { key: site.id, value: site.id }, site.name)
                    )
                  )
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'DA'),
                  React.createElement('input', {
                    type: 'number',
                    min: '0',
                    max: '100',
                    value: formData.da,
                    onChange: (e) => setFormData({...formData, da: e.target.value}),
                    placeholder: '0-100',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'PA'),
                  React.createElement('input', {
                    type: 'number',
                    min: '0',
                    max: '100',
                    value: formData.pa,
                    onChange: (e) => setFormData({...formData, pa: e.target.value}),
                    placeholder: '0-100',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  })
                )
              )
            ),

            React.createElement('div', { className: 'flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6' },
              React.createElement('button', {
                type: 'button',
                onClick: resetForm,
                className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
              }, 'Cancelar'),
              React.createElement('button', {
                type: 'submit',
                className: 'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
              }, editingId ? 'Atualizar' : 'Salvar')
            )
          )
        )
      )
    )
  );
}

export default Backlinks;
