/**
 * Enterprise Architecture - Centralized Admin Session Service
 * Manages admin authentication token across browser session, local storage, and memory.
 * Complies with ARCHITECTURE.md layer separation guidelines.
 */

const TOKEN_KEY = 'proteck_admin_token';

export class AdminSessionService {
  private static memoryToken: string | null = null;

  /**
   * Retrieves active admin session token from memory or storage
   */
  public static getToken(): string | null {
    if (this.memoryToken) {
      return this.memoryToken;
    }

    if (typeof window !== 'undefined') {
      try {
        if (typeof sessionStorage !== 'undefined') {
          const sessionToken = sessionStorage.getItem(TOKEN_KEY);
          if (sessionToken && sessionToken.trim()) {
            this.memoryToken = sessionToken.trim();
            return this.memoryToken;
          }
        }
        if (typeof localStorage !== 'undefined') {
          const localToken = localStorage.getItem(TOKEN_KEY);
          if (localToken && localToken.trim()) {
            this.memoryToken = localToken.trim();
            return this.memoryToken;
          }
        }
      } catch {
        // Storage access might be restricted in some sandboxed iframes
      }
    }

    return null;
  }

  /**
   * Stores admin session token across memory, sessionStorage, and localStorage
   */
  public static setToken(token: string): void {
    if (!token) return;
    const cleanToken = token.trim();
    this.memoryToken = cleanToken;

    if (typeof window !== 'undefined') {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(TOKEN_KEY, cleanToken);
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, cleanToken);
        }
      } catch {
        // Silently continue if storage writes fail
      }
    }
  }

  /**
   * Clears admin session token from all persistence layers
   */
  public static clearToken(): void {
    this.memoryToken = null;

    if (typeof window !== 'undefined') {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(TOKEN_KEY);
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        // Silently continue
      }
    }
  }

  /**
   * Checks if an admin session token exists
   */
  public static hasToken(): boolean {
    return Boolean(this.getToken());
  }

  /**
   * Generates authorization headers with the x-admin-token
   */
  public static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'x-admin-token': token } : {};
  }
}
