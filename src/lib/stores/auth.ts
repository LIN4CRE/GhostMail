import { writable, derived } from 'svelte/store';
import type { GoogleUser } from '$lib/types';

function createAuthStore() {
  const { subscribe, set, update } = writable<{
    user: GoogleUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  return {
    subscribe,

    setUser(user: GoogleUser) {
      set({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });
    },

    setLoading(loading: boolean) {
      update(s => ({ ...s, isLoading: loading }));
    },

    setError(error: string) {
      update(s => ({ ...s, error, isLoading: false }));
    },

    logout() {
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
    },

    clearError() {
      update(s => ({ ...s, error: null }));
    }
  };
}

export const auth = createAuthStore();

export const currentUser = derived(auth, $auth => $auth.user);
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const isAuthLoading = derived(auth, $auth => $auth.isLoading);
