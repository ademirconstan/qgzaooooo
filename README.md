# Company Hub - Plugin WordPress

Um CRM corporativo completo para WordPress com gestão de sites, leads, tarefas, financeiro e integrações com APIs externas.

## 🚀 Funcionalidades

### ✅ Módulos Implementados
- **Dashboard Central** - Visão geral com métricas e estatísticas
- **Gestão de Sites** - Monitoramento de uptime, SSL e domínios
- **CRM & Leads** - Sistema completo de gestão de leads
- **Tarefas & Projetos** - Gerenciamento de tarefas com status e prioridades
- **Financeiro** - Controle de receitas e despesas por site
- **Backlinks** - Monitoramento de links internos e externos
- **SEO & Marketing** - Ferramentas de SEO e auditoria
- **Automação** - Webhooks e regras de automação
- **Integrações** - Google Analytics, Search Console e Webhooks

### 🔒 Segurança
- Proteção contra XSS, CSRF e SQL Injection
- Rate limiting para tentativas de login
- Sanitização e escape de todos os inputs/outputs
- Logs de atividade e auditoria
- Controle de permissões por função (Admin/Colaborador)

### 🎨 Interface
- Interface React moderna e responsiva
- Design intuitivo e profissional
- Navegação por sidebar com ícones
- Formulários com validação em tempo real

## 📋 Requisitos

- WordPress 5.0+
- PHP 7.4+
- MySQL 5.7+
- Node.js 16+ (para desenvolvimento)
- npm ou yarn

## 🛠️ Instalação

### 1. Upload do Plugin
```bash
# Faça upload da pasta do plugin para wp-content/plugins/
# Ou instale via painel do WordPress
```

### 2. Ativação
1. Acesse o painel do WordPress
2. Vá em **Plugins > Plugins Instalados**
3. Ative o **Company Hub**

### 3. Build dos Assets (Primeira instalação)
```bash
# Entre na pasta do plugin
cd wp-content/plugins/company-hub/

# Execute o script de build
chmod +x build.sh
./build.sh
```

### 4. Configuração Inicial
1. Acesse **Company Hub** no menu do WordPress
2. O sistema criará automaticamente as tabelas do banco
3. Use as credenciais padrão: `admin` / `admin123`
4. Acesse o frontend em: `https://seusite.com/company-hub/`

## 🔧 Configuração

### Credenciais Padrão
- **Usuário:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha padrão imediatamente após a instalação!

### Estrutura de URLs
- Frontend: `/company-hub/`
- Login: `/company-hub/login`
- API: `/wp-json/company-hub/v1/`

### Permissões
- **Admin:** Acesso total ao sistema
- **Colaborador:** Acesso limitado (sem financeiro e configurações)

## 🔌 Integrações

### Google Analytics
1. Acesse **Configurações > Integrações**
2. Configure o **Google Analytics**:
   - Property ID (GA4-XXXXXXXXX)
   - API Key
   - Client ID OAuth
   - Client Secret OAuth

### Google Search Console
1. Configure o **Search Console**:
   - URL do Site
   - API Key
   - Credenciais OAuth

### Webhooks
1. Configure **Webhooks**:
   - URL do Endpoint
   - Chave Secreta
   - Eventos para monitorar

## 📊 Uso

### Dashboard
- Visualize métricas gerais do sistema
- Monitore sites fora do ar
- Acesse ações rápidas

### Gestão de Sites
- Adicione sites para monitoramento
- Verifique status de uptime e SSL
- Atribua responsáveis

### CRM & Leads
- Cadastre e gerencie leads
- Acompanhe status e conversões
- Atribua leads para colaboradores

### Tarefas
- Crie e gerencie tarefas
- Defina prioridades e prazos
- Acompanhe progresso

### Financeiro
- Registre receitas e despesas
- Categorize por site
- Visualize relatórios

## 🔄 Automação

### Cron Jobs
O plugin configura automaticamente:
- Verificação de uptime (a cada 5 minutos)
- Limpeza de dados antigos (diariamente)

### Webhooks
Configure webhooks para receber notificações sobre:
- Novos leads
- Sites fora do ar
- Tarefas concluídas
- Registros financeiros

## 🛡️ Segurança

### Boas Práticas Implementadas
- Todos os inputs são sanitizados
- Outputs são escapados adequadamente
- Nonces para proteção CSRF
- Rate limiting para login
- Logs de atividade
- Validação de permissões

### Logs
Acesse os logs em:
- Tabela: `wp_ch_activity_log`
- Eventos monitorados: login, CRUD operations, security events

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
company-hub/
├── company-hub.php          # Arquivo principal
├── includes/                # Classes PHP
│   ├── class-admin.php      # Painel administrativo
│   ├── class-api.php        # REST API
│   ├── class-auth.php       # Autenticação
│   ├── class-database.php   # Banco de dados
│   ├── class-frontend.php   # Frontend
│   ├── class-modules.php    # Módulos
│   ├── class-security.php   # Segurança
│   └── class-utils.php      # Utilitários
├── assets/
│   ├── src/                 # Código React
│   └── dist/                # Build de produção
├── admin/                   # Assets do admin
├── languages/               # Traduções
└── build.sh                 # Script de build
```

### Build para Desenvolvimento
```bash
# Instalar dependências
npm install

# Desenvolvimento (watch mode)
npm run dev

# Build para produção
npm run build
```

### API Endpoints
Base URL: `/wp-json/company-hub/v1/`

#### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Usuário atual

#### Sites
- `GET /sites` - Listar sites
- `POST /sites` - Criar site
- `PUT /sites/{id}` - Atualizar site
- `DELETE /sites/{id}` - Excluir site

#### Leads
- `GET /leads` - Listar leads
- `POST /leads` - Criar lead
- `PUT /leads/{id}` - Atualizar lead
- `DELETE /leads/{id}` - Excluir lead

#### Tarefas
- `GET /tasks` - Listar tarefas
- `POST /tasks` - Criar tarefa
- `PUT /tasks/{id}` - Atualizar tarefa
- `DELETE /tasks/{id}` - Excluir tarefa

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Página em branco no frontend
- Verifique se o build foi executado: `./build.sh`
- Confirme se os arquivos existem em `assets/dist/`
- Verifique permissões dos arquivos

#### 2. Erro 404 nas rotas
- Vá em **Configurações > Links Permanentes**
- Clique em **Salvar Alterações**

#### 3. Erro de permissão na API
- Verifique se o usuário está logado
- Confirme as permissões do usuário
- Verifique os logs de atividade

#### 4. Integrações não funcionam
- Teste a conexão nas configurações
- Verifique as credenciais da API
- Confirme as permissões no serviço externo

### Logs e Debug
```php
// Ativar debug no WordPress
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Logs do Company Hub
// Tabela: wp_ch_activity_log
```

## 📝 Changelog

### v1.0.0
- ✅ Sistema completo de CRM
- ✅ Gestão de sites com monitoramento
- ✅ Sistema de tarefas e projetos
- ✅ Controle financeiro
- ✅ Integrações com APIs externas
- ✅ Sistema de segurança robusto
- ✅ Interface React moderna
- ✅ API REST completa

## 🤝 Suporte

Para suporte técnico:
1. Verifique a documentação
2. Consulte os logs de erro
3. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

GPL v2 or later

---

**Company Hub** - Desenvolvido para gestão corporativa completa no WordPress.