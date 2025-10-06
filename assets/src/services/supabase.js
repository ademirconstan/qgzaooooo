import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const sitesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(siteData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sites')
      .insert([{ ...siteData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, siteData) {
    const { data, error } = await supabase
      .from('sites')
      .update(siteData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getWithObligations(id) {
    const { data, error } = await supabase
      .from('sites')
      .select(`
        *,
        obligations:site_backlink_obligations(
          *,
          opportunity:backlink_opportunities(*)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

export const backlinksService = {
  async getAll() {
    const { data, error } = await supabase
      .from('backlinks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(backlinkData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('backlinks')
      .insert([{ ...backlinkData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, backlinkData) {
    const { data, error } = await supabase
      .from('backlinks')
      .update(backlinkData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('backlinks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const opportunitiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('backlink_opportunities')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(opportunityData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('backlink_opportunities')
      .insert([{ ...opportunityData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, opportunityData) {
    const { data, error } = await supabase
      .from('backlink_opportunities')
      .update(opportunityData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('backlink_opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getDefaultOpportunities() {
    return [
      {
        platform_name: 'Quora',
        platform_url: 'https://www.quora.com',
        platform_type: 'qa',
        da: 92,
        notes: 'Plataforma de perguntas e respostas com alto DA. Crie um perfil e responda perguntas relacionadas ao seu nicho.',
        priority: 'high'
      },
      {
        platform_name: 'Reddit',
        platform_url: 'https://www.reddit.com',
        platform_type: 'forum',
        da: 91,
        notes: 'Comunidades ativas em diversos nichos. Participe de subreddits relevantes.',
        priority: 'high'
      },
      {
        platform_name: 'Medium',
        platform_url: 'https://medium.com',
        platform_type: 'blog',
        da: 95,
        notes: 'Plataforma de blogging com alto DA. Publique artigos de qualidade.',
        priority: 'high'
      },
      {
        platform_name: 'LinkedIn Articles',
        platform_url: 'https://www.linkedin.com/pulse',
        platform_type: 'blog',
        da: 99,
        notes: 'Publique artigos profissionais no LinkedIn.',
        priority: 'high'
      },
      {
        platform_name: 'Dev.to',
        platform_url: 'https://dev.to',
        platform_type: 'blog',
        da: 80,
        notes: 'Comunidade de desenvolvedores. Ideal para conteúdo técnico.',
        priority: 'medium'
      },
      {
        platform_name: 'Hashnode',
        platform_url: 'https://hashnode.com',
        platform_type: 'blog',
        da: 75,
        notes: 'Plataforma de blogging para desenvolvedores.',
        priority: 'medium'
      },
      {
        platform_name: 'Stack Overflow',
        platform_url: 'https://stackoverflow.com',
        platform_type: 'qa',
        da: 97,
        notes: 'Responda perguntas técnicas e inclua links úteis quando relevante.',
        priority: 'medium'
      },
      {
        platform_name: 'GitHub Discussions',
        platform_url: 'https://github.com',
        platform_type: 'forum',
        da: 100,
        notes: 'Participe de discussões em repositórios relevantes.',
        priority: 'medium'
      },
      {
        platform_name: 'ProductHunt',
        platform_url: 'https://www.producthunt.com',
        platform_type: 'directory',
        da: 87,
        notes: 'Lance produtos e participe da comunidade.',
        priority: 'medium'
      },
      {
        platform_name: 'Hacker News',
        platform_url: 'https://news.ycombinator.com',
        platform_type: 'forum',
        da: 93,
        notes: 'Compartilhe conteúdo relevante para a comunidade tech.',
        priority: 'medium'
      }
    ];
  }
};

export const obligationsService = {
  async getAllForSite(siteId) {
    const { data, error } = await supabase
      .from('site_backlink_obligations')
      .select(`
        *,
        opportunity:backlink_opportunities(*),
        backlink:backlinks(*)
      `)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(obligationData) {
    const { data, error } = await supabase
      .from('site_backlink_obligations')
      .insert([obligationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, obligationData) {
    const { data, error } = await supabase
      .from('site_backlink_obligations')
      .update(obligationData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('site_backlink_obligations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase
      .from('site_backlink_obligations')
      .select('status, site_id');

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      in_progress: data.filter(o => o.status === 'in_progress').length,
      completed: data.filter(o => o.status === 'completed').length,
      bySite: {}
    };

    data.forEach(obligation => {
      if (!stats.bySite[obligation.site_id]) {
        stats.bySite[obligation.site_id] = {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0
        };
      }
      stats.bySite[obligation.site_id].total++;
      stats.bySite[obligation.site_id][obligation.status]++;
    });

    return stats;
  }
};
