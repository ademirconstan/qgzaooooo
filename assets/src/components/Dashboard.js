import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function Dashboard() {
  const [stats, setStats] = useState({
    sites: 0,
    backlinks: 0,
    keywords: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' })
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Dashboard'),
        React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Visão geral dos seus negócios')
      ),
      
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8' },
        [
          { title: 'Sites', value: stats.sites, icon: '🌐', color: 'blue' },
          { title: 'Backlinks', value: stats.backlinks, icon: '🔗', color: 'green' },
          { title: 'Palavras-chave', value: stats.keywords, icon: '📈', color: 'yellow' },
          { title: 'Receita Mensal', value: `R$ ${stats.revenue.toLocaleString()}`, icon: '💰', color: 'purple' }
        ].map((stat, index) =>
          React.createElement('div', { key: index, className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, stat.title),
                React.createElement('p', { className: `text-2xl font-bold text-${stat.color}-600` }, stat.value)
              ),
              React.createElement('span', { className: 'text-2xl' }, stat.icon)
            )
          )
        )
      ),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        React.createElement('div', { className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
          React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' }, 'Atividades Recentes'),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'w-2 h-2 bg-green-500 rounded-full' }),
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Novo site adicionado')
            ),
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'w-2 h-2 bg-blue-500 rounded-full' }),
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Backlink verificado')
            ),
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'w-2 h-2 bg-yellow-500 rounded-full' }),
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Auditoria SEO concluída')
            )
          )
        ),
        
        React.createElement('div', { className: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200' },
          React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' }, 'Próximas Tarefas'),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Verificar backlinks'),
              React.createElement('span', { className: 'text-xs text-gray-500' }, 'Hoje')
            ),
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Relatório SEO mensal'),
              React.createElement('span', { className: 'text-xs text-gray-500' }, 'Amanhã')
            ),
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, 'Renovar hospedagem'),
              React.createElement('span', { className: 'text-xs text-gray-500' }, '3 dias')
            )
          )
        )
      )
    )
  );
}

export default Dashboard;