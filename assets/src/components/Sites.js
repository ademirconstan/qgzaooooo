import React, { useState, useEffect } from 'react';
import { sitesService, obligationsService, opportunitiesService } from '../services/supabase.js';

function Sites() {
  const [sites, setSites] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [obligationsStats, setObligationsStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showObligationsModal, setShowObligationsModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    primary_url: '',
    category: '',
    cms: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sitesData, opportunitiesData, statsData] = await Promise.all([
        sitesService.getAll(),
        opportunitiesService.getAll(),
        obligationsService.getStats()
      ]);

      setSites(sitesData);
      setOpportunities(opportunitiesData);
      setObligationsStats(statsData);

      if (opportunitiesData.length === 0) {
        await initializeDefaultOpportunities();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultOpportunities = async () => {
    try {
      const defaultOpps = await opportunitiesService.getDefaultOpportunities();
      for (const opp of defaultOpps) {
        await opportunitiesService.create(opp);
      }
      const newOpportunities = await opportunitiesService.getAll();
      setOpportunities(newOpportunities);
    } catch (error) {
      console.error('Error initializing opportunities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await sitesService.update(editingId, formData);
      } else {
        await sitesService.create(formData);
      }
      resetForm();
      fetchData();
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
        await sitesService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Erro ao excluir site. Tente novamente.');
      }
    }
  };

  const handleManageObligations = (site) => {
    setSelectedSite(site);
    setShowObligationsModal(true);
  };

  const handleCreateObligation = async (opportunityId) => {
    if (!selectedSite) return;

    try {
      await obligationsService.create({
        site_id: selectedSite.id,
        opportunity_id: opportunityId,
        status: 'pending'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating obligation:', error);
      alert('Erro ao criar obrigação. Pode ser que já exista.');
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

  const getSiteObligations = (siteId) => {
    return obligationsStats.bySite?.[siteId] || { total: 0, pending: 0, in_progress: 0, completed: 0 };
  };

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' })
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'flex justify-between items-center mb-8' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Gestão de Sites'),
          React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Gerencie todos os seus sites e suas obrigações de backlinks')
        ),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2'
        }, 'Adicionar Site')
      ),

      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8' },
        [
          { title: 'Total de Sites', value: sites.length, icon: '🌐', color: 'blue' },
          { title: 'Sites Ativos', value: sites.filter(s => s.status === 'active').length, icon: '✓', color: 'green' },
          { title: 'Obrigações Pendentes', value: obligationsStats.pending || 0, icon: '⏳', color: 'orange' },
          { title: 'Obrigações Concluídas', value: obligationsStats.completed || 0, icon: '✓', color: 'green' }
        ].map((stat, index) =>
          React.createElement('div', { key: index, className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, stat.title),
                React.createElement('p', { className: 'text-2xl font-bold text-gray-900 mt-1' }, stat.value)
              ),
              React.createElement('div', {
                className: `w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center text-2xl`
              }, stat.icon)
            )
          )
        )
      ),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' },
        sites.map((site) => {
          const siteObligations = getSiteObligations(site.id);
          return React.createElement('div', {
            key: site.id,
            className: 'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
          },
            React.createElement('div', { className: 'p-6' },
              React.createElement('div', { className: 'flex items-start justify-between mb-4' },
                React.createElement('div', { className: 'flex items-center gap-3 flex-1' },
                  getFavicon(site.primary_url) && React.createElement('img', {
                    src: getFavicon(site.primary_url),
                    alt: 'Favicon',
                    className: 'w-8 h-8 rounded',
                    onError: (e) => e.target.style.display = 'none'
                  }),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('h3', { className: 'font-semibold text-gray-900 text-lg truncate' }, site.name),
                    React.createElement('a', {
                      href: site.primary_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-blue-600 hover:text-blue-800 text-sm truncate block'
                    }, new URL(site.primary_url).hostname)
                  )
                ),
                React.createElement('span', {
                  className: `px-2 py-1 text-xs font-medium rounded-full ${
                    site.status === 'active' ? 'bg-green-100 text-green-800' :
                    site.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`
                },
                  site.status === 'active' ? 'Ativo' :
                  site.status === 'inactive' ? 'Inativo' : 'Manutenção'
                )
              ),

              React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4 text-sm' },
                site.category && React.createElement('div', { className: 'flex items-center gap-2 text-gray-600' },
                  React.createElement('span', null, '📊'),
                  React.createElement('span', { className: 'capitalize' }, site.category)
                ),
                site.cms && React.createElement('div', { className: 'flex items-center gap-2 text-gray-600' },
                  React.createElement('span', null, '💾'),
                  React.createElement('span', null, site.cms)
                )
              ),

              siteObligations.total > 0 && React.createElement('div', {
                className: 'bg-gray-50 rounded-lg p-4 mb-4'
              },
                React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                  React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Obrigações de Backlinks'),
                  React.createElement('span', { className: 'text-sm font-bold text-gray-900' }, siteObligations.total)
                ),
                React.createElement('div', { className: 'flex gap-4 text-xs' },
                  React.createElement('div', { className: 'flex items-center gap-1' },
                    React.createElement('span', { className: 'w-2 h-2 rounded-full bg-orange-500' }),
                    React.createElement('span', { className: 'text-gray-600' }, `${siteObligations.pending} pendentes`)
                  ),
                  React.createElement('div', { className: 'flex items-center gap-1' },
                    React.createElement('span', { className: 'w-2 h-2 rounded-full bg-blue-500' }),
                    React.createElement('span', { className: 'text-gray-600' }, `${siteObligations.in_progress} em andamento`)
                  ),
                  React.createElement('div', { className: 'flex items-center gap-1' },
                    React.createElement('span', { className: 'w-2 h-2 rounded-full bg-green-500' }),
                    React.createElement('span', { className: 'text-gray-600' }, `${siteObligations.completed} concluídas`)
                  )
                )
              ),

              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', {
                  onClick: () => handleManageObligations(site),
                  className: 'flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium'
                }, 'Backlinks'),
                React.createElement('button', {
                  onClick: () => handleEdit(site),
                  className: 'flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium'
                }, 'Editar'),
                React.createElement('button', {
                  onClick: () => handleDelete(site.id),
                  className: 'bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium'
                }, '🗑️')
              )
            )
          );
        })
      ),

      sites.length === 0 && React.createElement('div', { className: 'text-center py-12 bg-white rounded-lg border border-gray-200' },
        React.createElement('div', { className: 'text-6xl mb-4' }, '🌐'),
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'Nenhum site cadastrado'),
        React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Comece adicionando seu primeiro site para gerenciar.'),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium'
        }, 'Adicionar Primeiro Site')
      ),

      showForm && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              editingId ? 'Editar Site' : 'Novo Site'
            ),
            React.createElement('button', {
              onClick: resetForm,
              className: 'text-gray-400 hover:text-gray-600 text-2xl'
            }, '×')
          ),

          React.createElement('form', { onSubmit: handleSubmit, className: 'p-6' },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Nome do Site *'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.name,
                  onChange: (e) => setFormData({...formData, name: e.target.value}),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  required: true
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'URL Principal *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.primary_url,
                  onChange: (e) => setFormData({...formData, primary_url: e.target.value}),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  required: true
                })
              ),
              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Categoria'),
                  React.createElement('select', {
                    value: formData.category,
                    onChange: (e) => setFormData({...formData, category: e.target.value}),
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
              }, 'Cancelar'),
              React.createElement('button', {
                type: 'submit',
                className: 'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
              }, editingId ? 'Atualizar' : 'Salvar')
            )
          )
        )
      ),

      showObligationsModal && selectedSite && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b border-gray-200' },
            React.createElement('h2', { className: 'text-xl font-semibold text-gray-900' },
              `Obrigações de Backlinks - ${selectedSite.name}`
            ),
            React.createElement('button', {
              onClick: () => setShowObligationsModal(false),
              className: 'text-gray-400 hover:text-gray-600 text-2xl'
            }, '×')
          ),

          React.createElement('div', { className: 'p-6' },
            React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' }, 'Plataformas Disponíveis para Backlinks'),
            React.createElement('div', { className: 'space-y-3' },
              opportunities.filter(opp => opp.status === 'pending').map(opp =>
                React.createElement('div', {
                  key: opp.id,
                  className: 'flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors'
                },
                  React.createElement('div', { className: 'flex-1' },
                    React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
                      React.createElement('h4', { className: 'font-semibold text-gray-900' }, opp.platform_name),
                      React.createElement('span', {
                        className: `px-2 py-1 text-xs font-medium rounded ${
                          opp.priority === 'high' ? 'bg-red-100 text-red-800' :
                          opp.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`
                      },
                        opp.priority === 'high' ? 'Alta Prioridade' :
                        opp.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'
                      ),
                      opp.da && React.createElement('span', { className: 'text-sm text-gray-600' }, `DA: ${opp.da}`)
                    ),
                    React.createElement('p', { className: 'text-sm text-gray-600 mb-2' }, opp.notes),
                    React.createElement('a', {
                      href: opp.platform_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-sm text-blue-600 hover:text-blue-800'
                    }, opp.platform_url)
                  ),
                  React.createElement('button', {
                    onClick: () => handleCreateObligation(opp.id),
                    className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium'
                  }, 'Adicionar ao Site')
                )
              )
            )
          )
        )
      )
    )
  );
}

export default Sites;
