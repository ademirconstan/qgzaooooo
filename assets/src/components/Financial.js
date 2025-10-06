import React from 'react';

function Financial() {
  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 flex items-center gap-3' },
          '💰',
          'Financeiro'
        ),
        React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Gerencie suas finanças e relatórios')
      ),
      React.createElement('div', { className: 'bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center' },
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'Módulo Financeiro'),
        React.createElement('p', { className: 'text-gray-600' }, 'Este módulo será implementado em breve.')
      )
    )
  );
}

export default Financial;