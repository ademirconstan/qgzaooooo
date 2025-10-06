import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sites from './components/Sites';
import Backlinks from './components/Backlinks';
import SEO from './components/SEO';
import Financial from './components/Financial';
import Leads from './components/Leads';
import Tasks from './components/Tasks';
import Automation from './components/Automation';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('company_hub_token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('company_hub_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('company_hub_token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return React.createElement(Dashboard);
      case 'sites':
        return React.createElement(Sites);
      case 'backlinks':
        return React.createElement(Backlinks);
      case 'seo':
        return React.createElement(SEO);
      case 'financial':
        return React.createElement(Financial);
      case 'leads':
        return React.createElement(Leads);
      case 'tasks':
        return React.createElement(Tasks);
      case 'automation':
        return React.createElement(Automation);
      case 'settings':
        return React.createElement(Settings);
      default:
        return React.createElement(Dashboard);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'company-hub-loading' },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', null, 'Carregando...')
    );
  }

  if (!isAuthenticated) {
    return React.createElement(AuthProvider, null,
      React.createElement(Login, { onLogin: handleLogin })
    );
  }

  return React.createElement(AuthProvider, null,
    React.createElement('div', { className: 'min-h-screen bg-gray-50' },
      // Navigation
      React.createElement('nav', { className: 'bg-white shadow-sm border-b border-gray-200' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
          React.createElement('div', { className: 'flex justify-between h-16' },
            React.createElement('div', { className: 'flex items-center' },
              React.createElement('h1', { className: 'text-xl font-bold text-gray-900' }, 'QG Company')
            ),
            React.createElement('div', { className: 'flex items-center space-x-4' },
              React.createElement('button', {
                onClick: handleLogout,
                className: 'text-gray-500 hover:text-gray-700'
              }, 'Sair')
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'flex' },
        // Sidebar
        React.createElement('div', { className: 'w-64 bg-white shadow-sm min-h-screen' },
          React.createElement('nav', { className: 'mt-8' },
            React.createElement('div', { className: 'px-4 space-y-2' },
              [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'sites', label: 'Sites', icon: '🌐' },
                { id: 'backlinks', label: 'Backlinks', icon: '🔗' },
                { id: 'seo', label: 'SEO & Marketing', icon: '📈' },
                { id: 'financial', label: 'Financeiro', icon: '💰' },
                { id: 'leads', label: 'Leads', icon: '👥' },
                { id: 'tasks', label: 'Tarefas', icon: '✅' },
                { id: 'automation', label: 'Automação', icon: '🤖' },
                { id: 'settings', label: 'Configurações', icon: '⚙️' }
              ].map(item =>
                React.createElement('button', {
                  key: item.id,
                  onClick: () => setCurrentView(item.id),
                  className: `w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                },
                  React.createElement('span', null, item.icon),
                  item.label
                )
              )
            )
          )
        ),
        
        // Main content
        React.createElement('div', { className: 'flex-1' },
          renderCurrentView()
        )
      )
    )
  );
}

export default App;