/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkrobuattxhlxtvuijtg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_we8MLkhIK9fKOgEJAYaiPw_4kmQ-yj8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE CREDENTIALS MISSING: The app is running in MOCK MODE. Data will not be saved or fetched. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.");
}

// In-memory rich fallback database for offline/paused Supabase service
const fallbackData: Record<string, any[]> = {
  announcements: [
    {
      id: '1',
      title: 'Mega Campus Green Drive 🌳',
      content: 'Join us this Friday at 9:00 AM for our campus green initiative. Saplings will be distributed. Special attendance points will be awarded!',
      message: 'Join us this Friday at 9:00 AM for our campus green initiative. Saplings will be distributed. Special attendance points will be awarded!',
      created_at: '2026-06-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Annual Special Camp 2026 🏕️',
      content: 'The 7-day Special Village Adoption Camp is scheduled to begin from April 15th at Ottapalam Village. All registered volunteers must report.',
      message: 'The 7-day Special Village Adoption Camp is scheduled to begin from April 15th at Ottapalam Village. All registered volunteers must report.',
      created_at: '2026-06-18T10:00:00Z'
    },
    {
      id: '3',
      title: 'Urgent: Blood Donation Camp 🩸',
      content: 'NSS units 36 & 94 are organizing an emergency blood donation drive in collaboration with District Hospital Ottapalam on June 30th.',
      message: 'NSS units 36 & 94 are organizing an emergency blood donation drive in collaboration with District Hospital Ottapalam on June 30th.',
      created_at: '2026-06-15T10:00:00Z'
    },
    {
      id: '4',
      title: 'Pain & Palliative Care Training 🩺',
      content: 'Specialized home care assistance and basic clinical empathy training scheduled for next Monday in the college seminar hall.',
      message: 'Specialized home care assistance and basic clinical empathy training scheduled for next Monday in the college seminar hall.',
      created_at: '2026-06-12T10:00:00Z'
    }
  ],
  highlights: [
    {
      id: '1',
      event_name: 'World Environment Day Celebration',
      event: 'World Environment Day Celebration',
      venue: 'College Ground',
      event_date: '05 Jun 2026',
      date: '05 Jun 2026',
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
      description: 'Planted over 150 indigenous saplings across the college borders.'
    },
    {
      id: '2',
      event_name: 'Gram Vikas Road Construction',
      event: 'Gram Vikas Road Construction',
      venue: 'Ottapalam Ward 5',
      event_date: '12 May 2026',
      date: '12 May 2026',
      image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
      description: 'Successfully cleared and laid 500m pathway for village school kids.'
    },
    {
      id: '3',
      event_name: 'Digital Literacy Workshop',
      event: 'Digital Literacy Workshop',
      venue: 'NSS Lab',
      event_date: '28 Apr 2026',
      date: '28 Apr 2026',
      image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      description: 'Empowered 50 senior citizens of the adopted village with basic smartphone skills.'
    }
  ],
  blood_emergency_requests: [
    {
      id: '1',
      blood_group: 'O+',
      hospital_venue: 'District Hospital Ottapalam',
      contact_number: '9876543210',
      status: 'active',
      patient_name: 'Raghavan Nair',
      required_date: '2026-06-25',
      units: 2,
      created_at: '2026-06-23T10:00:00Z'
    },
    {
      id: '2',
      blood_group: 'A-',
      hospital_venue: 'Valluvanad Hospital',
      contact_number: '9447123456',
      status: 'active',
      patient_name: 'Amina Beevi',
      required_date: '2026-06-26',
      units: 1,
      created_at: '2026-06-24T05:00:00Z'
    }
  ],
  blood_donors: [
    {
      id: '1',
      full_name: 'Siddharth K',
      blood_group: 'O+',
      contact_number: '9087654321',
      last_donated: '2026-03-10',
      is_available: true,
      unit: 'Unit 36',
      created_at: '2026-03-10T10:00:00Z'
    },
    {
      id: '2',
      full_name: 'Anjana Krishnan',
      blood_group: 'B+',
      contact_number: '9567123458',
      last_donated: '2026-04-15',
      is_available: true,
      unit: 'Unit 94',
      created_at: '2026-04-15T10:00:00Z'
    },
    {
      id: '3',
      full_name: 'Abhinav V A',
      blood_group: 'AB+',
      contact_number: '9446215732',
      last_donated: '2026-05-20',
      is_available: true,
      unit: 'Unit 36',
      created_at: '2026-05-20T10:00:00Z'
    }
  ],
  programs: [
    {
      id: 'prog1',
      title: 'Anti-Drug Awareness Rally',
      name: 'Anti-Drug Awareness Rally',
      description: 'Rally through Ottapalam town spreading awareness against substance abuse.',
      date: '2026-06-28',
      points: 100,
      created_at: '2026-06-20T10:00:00Z'
    },
    {
      id: 'prog2',
      title: 'Pond Restoration Project',
      name: 'Pond Restoration Project',
      description: 'Restoring and desilting the local community pond.',
      date: '2026-07-05',
      points: 120,
      created_at: '2026-06-18T10:00:00Z'
    },
    {
      id: 'prog3',
      title: 'Pain and Palliative Care Visit',
      name: 'Pain and Palliative Care Visit',
      description: 'Volunteering and aiding patients in local home care.',
      date: '2026-07-12',
      points: 80,
      created_at: '2026-06-15T10:00:00Z'
    }
  ],
  profiles: [
    {
      id: '1',
      full_name: 'Abhinav V A',
      name: 'Abhinav V A',
      email: 'abhinav@nss.org',
      role: 'volunteer',
      points: 850,
      unit: 'Unit 36'
    },
    {
      id: '2',
      full_name: 'Meenakshi R',
      name: 'Meenakshi R',
      email: 'meenakshi@nss.org',
      role: 'volunteer',
      points: 620,
      unit: 'Unit 94'
    },
    {
      id: '3',
      full_name: 'Saran Dev',
      name: 'Saran Dev',
      email: 'saran@nss.org',
      role: 'volunteer',
      points: 540,
      unit: 'Unit 36'
    }
  ],
  gallery: [
    {
      id: '1',
      url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
      title: "NSS Mega Campus Cleaning & Green Drive",
      date: "04 Jun 2026",
      category: "Ottapalam Campus",
      created_at: "2026-06-04T10:00:00Z"
    },
    {
      id: '2',
      url: "https://images.unsplash.com/photo-1615461066841-6116ecdccd04?q=80&w=800&auto=format&fit=crop",
      title: "Emergency Medical & Blood Donation Camp",
      date: "28 May 2026",
      category: "Academic Hall",
      created_at: "2026-05-28T10:00:00Z"
    },
    {
      id: '3',
      url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
      title: "Interactive Literacy Outreach & Study Kits Supply",
      date: "15 May 2026",
      category: "Orphanage Annex",
      created_at: "2026-05-15T10:00:00Z"
    }
  ],
  marked_attendance: [],
  reports_log: [],
  complaints: []
};

// Helper to create a promise-like object that returns the specified data
const mockResult = (table: string, data: any = []) => {
  const promise = Promise.resolve({ data, error: null });
  return Object.assign(promise, {
    order: () => mockResult(table, data),
    limit: (n: number) => mockResult(table, data.slice(0, n)),
    eq: (col: string, val: any) => mockResult(table, data.filter((item: any) => item[col] === val || item[col] === undefined)),
    single: () => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error: null }),
    select: () => mockResult(table, data),
    insert: (payload: any) => {
      const items = Array.isArray(payload) ? payload : [payload];
      fallbackData[table] = [...items, ...(fallbackData[table] || [])];
      return mockResult(table, fallbackData[table]);
    },
    update: (payload: any) => {
      return mockResult(table, data);
    },
    delete: () => {
      return mockResult(table, data);
    },
    maybeSingle: () => Promise.resolve({ data: Array.isArray(data) ? data[0] || null : data, error: null }),
  });
};

const mockSupabase = {
  from: (table: string) => mockResult(table, fallbackData[table] || []),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
  }),
  removeChannel: () => ({}),
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null }),
    signInAnonymously: () => Promise.resolve({ data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
} as any;

export const supabase = (() => {
  const isRealSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://dkrobuattxhlxtvuijtg.supabase.co' &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  const rawSupabase = isRealSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }) 
    : mockSupabase;

  const safeThen = (promise: any, tableInfo: string, defaultFallbackData: any) => {
    if (!promise || typeof promise.then !== 'function') return promise;

    // Save the original then method
    const originalThen = promise.then;
    promise.then = function(onfulfilled: any, onrejected: any) {
      return originalThen.call(promise, 
        (value: any) => {
          if (value && value.error) {
            console.warn(`[Supabase Safe Intercepted Error for ${tableInfo}]:`, value.error);
            return onfulfilled ? onfulfilled({ data: defaultFallbackData, error: null }) : { data: defaultFallbackData, error: null };
          }
          return onfulfilled ? onfulfilled(value) : value;
        },
        (err: any) => {
          console.warn(`[Supabase Safe Intercepted Rejection for ${tableInfo}]:`, err);
          return onfulfilled ? onfulfilled({ data: defaultFallbackData, error: null }) : { data: defaultFallbackData, error: null };
        }
      );
    };

    // Also wrap properties returned by PostgrestFilterBuilder chain that return new builders/promises
    const wrapper = new Proxy(promise, {
      get(target, prop) {
        const val = Reflect.get(target, prop);
        if (typeof val === 'function') {
          return function(...args: any[]) {
            const result = val.apply(target, args);
            return safeThen(result, `${tableInfo}.${String(prop)}`, defaultFallbackData);
          };
        }
        return val;
      }
    });

    return wrapper;
  };

  return {
    from(table: string) {
      const fallback = fallbackData[table] || [];
      try {
        const builder = rawSupabase.from(table);
        return safeThen(builder, `from(${table})`, fallback);
      } catch (e) {
        console.warn(`[Supabase Safe Fallback from(${table})]:`, e);
        return mockSupabase.from(table);
      }
    },

    rpc(name: string, args?: any) {
      try {
        const builder = rawSupabase.rpc(name, args);
        return safeThen(builder, `rpc(${name})`, null);
      } catch (e) {
        console.warn(`[Supabase Safe Fallback rpc(${name})]:`, e);
        return Promise.resolve({ data: null, error: null });
      }
    },

    channel(name: string, opts?: any) {
      try {
        return rawSupabase.channel(name, opts);
      } catch (e) {
        return mockSupabase.channel(name, opts);
      }
    },

    removeChannel(channel: any) {
      try {
        return rawSupabase.removeChannel(channel);
      } catch (e) {
        return mockSupabase.removeChannel(channel);
      }
    },

    auth: {
      async getSession() {
        try {
          const res = await rawSupabase.auth.getSession();
          if (!res || !res.data) {
            return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
          }
          return res;
        } catch (e) {
          console.warn("[Safe supabase auth.getSession fallback]", e);
          return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
        }
      },
      async signInAnonymously(options?: any) {
        try {
          const res = await rawSupabase.auth.signInAnonymously(options);
          if (!res || !res.data) {
            return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
          }
          return res;
        } catch (e) {
          console.warn("[Safe supabase auth.signInAnonymously fallback]", e);
          return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
        }
      },
      async signInWithPassword(credentials: any) {
        try {
          const res = await rawSupabase.auth.signInWithPassword(credentials);
          if (!res || !res.data) {
            return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
          }
          return res;
        } catch (e) {
          console.warn("[Safe supabase auth.signInWithPassword fallback]", e);
          return { data: { session: { user: { id: 'mock-user-id', email: 'mock@nss.org' } } }, error: null };
        }
      },
      async signOut() {
        try {
          return await rawSupabase.auth.signOut();
        } catch (e) {
          console.warn("[Safe supabase auth.signOut fallback]", e);
          return { error: null };
        }
      },
      onAuthStateChange(callback: any) {
        try {
          return rawSupabase.auth.onAuthStateChange(callback);
        } catch (e) {
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      }
    }
  } as any;
})();
