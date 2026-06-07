/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkrobuattxhlxtvuijtg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_we8MLkhIK9fKOgEJAYaiPw_4kmQ-yj8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE CREDENTIALS MISSING: The app is running in MOCK MODE. Data will not be saved or fetched. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.");
}

// Helper to create a promise-like object that returns empty data
const mockResult = (data: any = []) => {
  const promise = Promise.resolve({ data, error: null });
  return Object.assign(promise, {
    order: () => mockResult(data),
    limit: () => mockResult(data),
    eq: () => mockResult(data),
    single: () => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error: null }),
    select: () => mockResult(data),
    insert: () => mockResult(data),
    update: () => mockResult(data),
    delete: () => mockResult(data),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  });
};

const mockSupabase = {
  from: () => mockResult([]),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
  }),
  removeChannel: () => ({}),
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signInAnonymously: () => Promise.resolve({ data: { session: {} }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
} as any;

export const supabase = (() => {
  const rawSupabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : mockSupabase;

  const safeThen = (promise: any, tableInfo: string, defaultFallbackData: any) => {
    if (!promise || typeof promise.then !== 'function') return promise;

    // Save the original then method
    const originalThen = promise.then;
    promise.then = function(onfulfilled: any, onrejected: any) {
      return originalThen.call(promise, 
        (value: any) => {
          if (value && value.error) {
            const errMsg = value.error.message || '';
            if (
              errMsg.toLowerCase().includes('fetch') || 
              errMsg.toLowerCase().includes('network') || 
              errMsg.toLowerCase().includes('cors') ||
              errMsg.toLowerCase().includes('load failed') ||
              value.error.status === 0
            ) {
              console.warn(`[Supabase Safe Intercepted Error for ${tableInfo}]:`, value.error);
              return onfulfilled ? onfulfilled({ data: defaultFallbackData, error: null }) : { data: defaultFallbackData, error: null };
            }
          }
          return onfulfilled ? onfulfilled(value) : value;
        },
        (err: any) => {
          const errMsg = err?.message || String(err);
          if (
            errMsg.toLowerCase().includes('fetch') || 
            errMsg.toLowerCase().includes('network') || 
            errMsg.toLowerCase().includes('cors') ||
            errMsg.toLowerCase().includes('load failed') ||
            err?.status === 0
          ) {
            console.warn(`[Supabase Safe Intercepted Rejection for ${tableInfo}]:`, err);
            return onfulfilled ? onfulfilled({ data: defaultFallbackData, error: null }) : { data: defaultFallbackData, error: null };
          }
          if (onrejected) {
            return onrejected(err);
          }
          throw err;
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
      try {
        const builder = rawSupabase.from(table);
        return safeThen(builder, `from(${table})`, []);
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
          return await rawSupabase.auth.getSession();
        } catch (e) {
          console.warn("[Safe supabase auth.getSession fallback]", e);
          return { data: { session: null }, error: null };
        }
      },
      async signInAnonymously(options?: any) {
        try {
          return await rawSupabase.auth.signInAnonymously(options);
        } catch (e) {
          console.warn("[Safe supabase auth.signInAnonymously fallback]", e);
          return { data: { session: {} }, error: null };
        }
      },
      async signInWithPassword(credentials: any) {
        try {
          return await rawSupabase.auth.signInWithPassword(credentials);
        } catch (e) {
          console.warn("[Safe supabase auth.signInWithPassword fallback]", e);
          return { data: {}, error: null };
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
