/*
  # Sistema de Backlinks e Obrigações

  ## 1. Novas Tabelas
  
  ### `sites`
  - `id` (uuid, primary key) - ID único do site
  - `user_id` (uuid, foreign key) - Dono do site
  - `name` (text) - Nome do site
  - `primary_url` (text) - URL principal do site
  - `category` (text) - Categoria do site (ecommerce, blog, etc)
  - `cms` (text) - Sistema de gerenciamento (wordpress, shopify, etc)
  - `status` (text) - Status do site (active, inactive, maintenance)
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ### `backlinks`
  - `id` (uuid, primary key) - ID único do backlink
  - `user_id` (uuid, foreign key) - Usuário responsável
  - `site_id` (uuid, foreign key, nullable) - Site de origem (se for um dos seus sites)
  - `target_site_id` (uuid, foreign key, nullable) - Site de destino (se for um dos seus sites)
  - `source_url` (text) - URL completa da página de origem
  - `target_url` (text) - URL completa da página de destino
  - `anchor_text` (text, nullable) - Texto âncora do link
  - `type` (text) - Tipo: internal, external
  - `status` (text) - Status: active, broken, removed
  - `da` (integer, nullable) - Domain Authority
  - `pa` (integer, nullable) - Page Authority
  - `last_checked` (timestamptz, nullable) - Última verificação
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ### `backlink_opportunities`
  - `id` (uuid, primary key) - ID único da oportunidade
  - `user_id` (uuid, foreign key) - Usuário responsável
  - `platform_name` (text) - Nome da plataforma (Quora, Reddit, etc)
  - `platform_url` (text) - URL da plataforma
  - `platform_type` (text) - Tipo: forum, qa, social, blog, directory
  - `da` (integer, nullable) - Domain Authority estimado
  - `notes` (text, nullable) - Observações
  - `priority` (text) - Prioridade: high, medium, low
  - `status` (text) - Status: pending, completed, skipped
  - `created_at` (timestamptz) - Data de criação
  - `completed_at` (timestamptz, nullable) - Data de conclusão
  
  ### `site_backlink_obligations`
  - `id` (uuid, primary key) - ID único da obrigação
  - `site_id` (uuid, foreign key) - Site que deve criar backlink
  - `opportunity_id` (uuid, foreign key) - Oportunidade de backlink
  - `status` (text) - Status: pending, in_progress, completed
  - `backlink_id` (uuid, foreign key, nullable) - Backlink criado (quando completado)
  - `due_date` (date, nullable) - Data prevista
  - `completed_at` (timestamptz, nullable) - Data de conclusão
  - `created_at` (timestamptz) - Data de criação

  ## 2. Segurança
  - Habilitar RLS em todas as tabelas
  - Políticas restritivas para acesso por usuário autenticado
*/

-- Criar tabela de sites
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  primary_url text NOT NULL,
  category text DEFAULT '',
  cms text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de backlinks
CREATE TABLE IF NOT EXISTS backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  target_site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  source_url text NOT NULL,
  target_url text NOT NULL,
  anchor_text text DEFAULT '',
  type text DEFAULT 'external' CHECK (type IN ('internal', 'external')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'broken', 'removed')),
  da integer CHECK (da >= 0 AND da <= 100),
  pa integer CHECK (pa >= 0 AND pa <= 100),
  last_checked timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de oportunidades de backlinks
CREATE TABLE IF NOT EXISTS backlink_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform_name text NOT NULL,
  platform_url text NOT NULL,
  platform_type text DEFAULT 'forum' CHECK (platform_type IN ('forum', 'qa', 'social', 'blog', 'directory', 'other')),
  da integer CHECK (da >= 0 AND da <= 100),
  notes text DEFAULT '',
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Criar tabela de obrigações de backlinks por site
CREATE TABLE IF NOT EXISTS site_backlink_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  opportunity_id uuid REFERENCES backlink_opportunities(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  backlink_id uuid REFERENCES backlinks(id) ON DELETE SET NULL,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(site_id, opportunity_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_backlinks_user_id ON backlinks(user_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_site_id ON backlinks(site_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_status ON backlinks(status);
CREATE INDEX IF NOT EXISTS idx_backlink_opportunities_user_id ON backlink_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_backlink_opportunities_status ON backlink_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_site_obligations_site_id ON site_backlink_obligations(site_id);
CREATE INDEX IF NOT EXISTS idx_site_obligations_status ON site_backlink_obligations(status);

-- Habilitar RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_backlink_obligations ENABLE ROW LEVEL SECURITY;

-- Políticas para sites
CREATE POLICY "Users can view own sites"
  ON sites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para backlinks
CREATE POLICY "Users can view own backlinks"
  ON backlinks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backlinks"
  ON backlinks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backlinks"
  ON backlinks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backlinks"
  ON backlinks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para oportunidades de backlinks
CREATE POLICY "Users can view own opportunities"
  ON backlink_opportunities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities"
  ON backlink_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON backlink_opportunities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities"
  ON backlink_opportunities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para obrigações (acesso via site)
CREATE POLICY "Users can view obligations of their sites"
  ON site_backlink_obligations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_backlink_obligations.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert obligations for their sites"
  ON site_backlink_obligations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_backlink_obligations.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update obligations of their sites"
  ON site_backlink_obligations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_backlink_obligations.site_id
      AND sites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_backlink_obligations.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete obligations of their sites"
  ON site_backlink_obligations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_backlink_obligations.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backlinks_updated_at
  BEFORE UPDATE ON backlinks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();