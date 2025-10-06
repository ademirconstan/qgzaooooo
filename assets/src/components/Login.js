import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      onLogin(result.token);
    } else {
      setError(result.message || 'Erro ao fazer login');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8' },
    React.createElement('div', { className: 'max-w-md w-full space-y-8' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'mt-6 text-center text-3xl font-extrabold text-gray-900' },
          'QG Company Hub'
        ),
        React.createElement('p', { className: 'mt-2 text-center text-sm text-gray-600' },
          'Faça login para acessar o painel'
        )
      ),
      React.createElement('form', { className: 'mt-8 space-y-6', onSubmit: handleSubmit },
        React.createElement('div', { className: 'rounded-md shadow-sm -space-y-px' },
          React.createElement('div', null,
            React.createElement('input', {
              id: 'username',
              name: 'username',
              type: 'text',
              required: true,
              className: 'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
              placeholder: 'Nome de usuário',
              value: credentials.username,
              onChange: handleChange
            })
          ),
          React.createElement('div', null,
            React.createElement('input', {
              id: 'password',
              name: 'password',
              type: 'password',
              required: true,
              className: 'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
              placeholder: 'Senha',
              value: credentials.password,
              onChange: handleChange
            })
          )
        ),
        error && React.createElement('div', { className: 'text-red-600 text-sm text-center' }, error),
        React.createElement('div', null,
          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            className: 'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
          },
            loading ? 'Entrando...' : 'Entrar'
          )
        )
      )
    )
  );
}

export default Login;