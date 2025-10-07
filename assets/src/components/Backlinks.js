import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function Backlinks() {
  const [backlinks, setBacklinks] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    anchor_text: '',
    type: 'external',
    site_id: ''
  });

  const platformas = [
    { name: 'Quora', url: 'https://www.quora.com', da: 92, tipo: 'Perguntas e Respostas' },
    { name: 'Reddit', url: 'https://www.reddit.com', da: 91, tipo: 'Fórum' },
    { name: 'Medium', url: 'https://medium.com', da: 95, tipo: 'Blog' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com', da: 99, tipo: 'Profissional' },
    { name: 'Dev.to', url: 'https://dev.to', da: 80, tipo: 'Desenvolvedores' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', da: 97, tipo: 'Q&A Técnico' },
    { name: 'GitHub', url: 'https://github.com', da: 100, tipo: 'Código' },
    { name: 'ProductHunt', url: 'https://www.producthunt.com', da: 87, tipo: 'Produtos' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com', da: 93, tipo: 'Notícias Tech' },
    { name: 'Pinterest', url: 'https://www.pinterest.com', da: 96, tipo: 'Visual' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [backlinksResponse, sitesResponse] = await Promise.all([
        api.get('/backlinks'),
        api.get('/sites')
      ]);

      setBacklinks(backlinksResponse.data || []);
      setSites(sitesResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
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
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar backlink');
    }
  };

  const handleEdit = (backlink) => {
    setFormData({
      source_url: backlink.source_url || '',
      target_url: backlink.target_url || '',
      anchor_text: backlink.anchor_text || '',
      type: backlink.type || 'external',
      site_id: backlink.site_id || ''
    });
    setEditingId(backlink.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/backlinks/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir backlink');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source_url: '',
      target_url: '',
      anchor_text: '',
      type: 'external',
      site_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredBacklinks = backlinks.filter(b => {
    const matchesSearch =
      (b.source_url || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.target_url || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.anchor_text || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return React.createElement('div', { className: 'p-8 text-center' },
      React.createElement('div', { className: 'inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' })
    );
  }

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },

      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold' }, 'Gestão de Backlinks'),
        React.createElement('button', {
          onClick: () => setShowForm(true),
          className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
        }, 'Novo Backlink')
      ),

      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6' },
        [
          { label: 'Total', value: backlinks.length, color: 'blue' },
          { label: 'Ativos', value: backlinks.filter(b => b.status === 'active').length, color: 'green' },
          { label: 'Quebrados', value: backlinks.filter(b => b.status === 'broken').length, color: 'red' },
          { label: 'Externos', value: backlinks.filter(b => b.type === 'external').length, color: 'purple' }
        ].map((stat, idx) =>
          React.createElement('div', { key: idx, className: 'bg-white p-4 rounded-lg shadow' },
            React.createElement('div', { className: 'text-sm text-gray-600' }, stat.label),
            React.createElement('div', { className: 'text-2xl font-bold text-' + stat.color + '-600' }, stat.value)
          )
        )
      ),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },

        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('div', { className: 'bg-white rounded-lg shadow p-4 mb-4' },
            React.createElement('div', { className: 'flex gap-4' },
              React.createElement('input', {
                type: 'text',
                placeholder: 'Buscar...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: 'flex-1 px-3 py-2 border rounded'
              }),
              React.createElement('select', {
                value: filterStatus,
                onChange: (e) => setFilterStatus(e.target.value),
                className: 'px-3 py-2 border rounded'
              },
                React.createElement('option', { value: 'all' }, 'Todos'),
                React.createElement('option', { value: 'active' }, 'Ativo'),
                React.createElement('option', { value: 'broken' }, 'Quebrado')
              )
            )
          ),

          React.createElement('div', { className: 'space-y-4' },
            filteredBacklinks.length > 0 ? filteredBacklinks.map(backlink =>
              React.createElement('div', { key: backlink.id, className: 'bg-white rounded-lg shadow p-4' },
                React.createElement('div', { className: 'flex justify-between items-start mb-3' },
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('span', {
                      className: `px-2 py-1 text-xs rounded ${
                        backlink.status === 'active' ? 'bg-green-100 text-green-800' :
                        backlink.status === 'broken' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`
                    }, backlink.status === 'active' ? 'Ativo' : backlink.status === 'broken' ? 'Quebrado' : 'Removido'),
                    React.createElement('span', {
                      className: `px-2 py-1 text-xs rounded ${
                        backlink.type === 'external' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`
                    }, backlink.type === 'external' ? 'Externo' : 'Interno')
                  ),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', {
                      onClick: () => handleEdit(backlink),
                      className: 'text-blue-600 hover:text-blue-800 text-sm'
                    }, 'Editar'),
                    React.createElement('button', {
                      onClick: () => handleDelete(backlink.id),
                      className: 'text-red-600 hover:text-red-800 text-sm'
                    }, 'Excluir')
                  )
                ),

                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-xs text-gray-500 mb-1' }, 'Origem'),
                    React.createElement('a', {
                      href: backlink.source_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-sm text-blue-600 hover:text-blue-800 break-all'
                    }, backlink.source_url)
                  ),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-xs text-gray-500 mb-1' }, 'Destino'),
                    React.createElement('a', {
                      href: backlink.target_url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'text-sm text-blue-600 hover:text-blue-800 break-all'
                    }, backlink.target_url)
                  )
                ),

                backlink.anchor_text && React.createElement('div', { className: 'mt-3 pt-3 border-t' },
                  React.createElement('span', { className: 'text-xs text-gray-500' }, 'Texto: '),
                  React.createElement('span', { className: 'text-sm' }, backlink.anchor_text)
                )
              )
            ) : React.createElement('div', { className: 'bg-white rounded-lg shadow p-8 text-center' },
              React.createElement('div', { className: 'text-6xl mb-4' }, '🔗'),
              React.createElement('h3', { className: 'text-lg font-medium mb-2' }, 'Nenhum backlink encontrado'),
              React.createElement('p', { className: 'text-gray-600' }, 'Comece adicionando seu primeiro backlink')
            )
          )
        ),

        React.createElement('div', { className: 'lg:col-span-1' },
          React.createElement('div', { className: 'bg-white rounded-lg shadow sticky top-6' },
            React.createElement('div', { className: 'p-4 border-b' },
              React.createElement('h3', { className: 'font-semibold' }, 'Plataformas para Backlinks')
            ),
            React.createElement('div', { className: 'p-4 space-y-3 max-h-[600px] overflow-y-auto' },
              platformas.map((plat, idx) =>
                React.createElement('div', { key: idx, className: 'p-3 border rounded hover:border-blue-300' },
                  React.createElement('div', { className: 'flex justify-between items-start mb-2' },
                    React.createElement('h4', { className: 'font-semibold text-sm' }, plat.name),
                    React.createElement('span', { className: 'text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded' }, `DA: ${plat.da}`)
                  ),
                  React.createElement('p', { className: 'text-xs text-gray-600 mb-2' }, plat.tipo),
                  React.createElement('a', {
                    href: plat.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-xs text-blue-600 hover:text-blue-800'
                  }, 'Visitar →')
                )
              )
            )
          )
        )
      ),

      showForm && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' },
          React.createElement('div', { className: 'flex justify-between items-center p-6 border-b' },
            React.createElement('h2', { className: 'text-xl font-semibold' }, editingId ? 'Editar Backlink' : 'Novo Backlink'),
            React.createElement('button', {
              onClick: resetForm,
              className: 'text-gray-400 hover:text-gray-600 text-2xl'
            }, '×')
          ),

          React.createElement('form', { onSubmit: handleSubmit, className: 'p-6' },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'URL de Origem *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.source_url,
                  onChange: (e) => setFormData({...formData, source_url: e.target.value}),
                  placeholder: 'https://exemplo.com/pagina-com-link',
                  className: 'w-full px-3 py-2 border rounded',
                  required: true
                })
              ),

              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'URL de Destino *'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.target_url,
                  onChange: (e) => setFormData({...formData, target_url: e.target.value}),
                  placeholder: 'https://meusite.com/pagina-destino',
                  className: 'w-full px-3 py-2 border rounded',
                  required: true
                })
              ),

              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Texto Âncora'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.anchor_text,
                  onChange: (e) => setFormData({...formData, anchor_text: e.target.value}),
                  placeholder: 'Texto do link',
                  className: 'w-full px-3 py-2 border rounded'
                })
              ),

              React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Tipo'),
                  React.createElement('select', {
                    value: formData.type,
                    onChange: (e) => setFormData({...formData, type: e.target.value}),
                    className: 'w-full px-3 py-2 border rounded'
                  },
                    React.createElement('option', { value: 'external' }, 'Externo'),
                    React.createElement('option', { value: 'internal' }, 'Interno')
                  )
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Site'),
                  React.createElement('select', {
                    value: formData.site_id,
                    onChange: (e) => setFormData({...formData, site_id: e.target.value}),
                    className: 'w-full px-3 py-2 border rounded'
                  },
                    React.createElement('option', { value: '' }, 'Selecione...'),
                    sites.map(site =>
                      React.createElement('option', { key: site.id, value: site.id }, site.name)
                    )
                  )
                )
              )
            ),

            React.createElement('div', { className: 'flex justify-end gap-3 pt-6 border-t mt-6' },
              React.createElement('button', {
                type: 'button',
                onClick: resetForm,
                className: 'px-4 py-2 border rounded hover:bg-gray-50'
              }, 'Cancelar'),
              React.createElement('button', {
                type: 'submit',
                className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              }, editingId ? 'Atualizar' : 'Salvar')
            )
          )
        )
      )
    )
  );
}

export default Backlinks;
