import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface UserProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferenceData {
  id?: string;
  user_id: string;
  temperature_unit: string;
  language: string;
  notifications_enabled: boolean;
}

export interface UserLocationData {
  id?: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface FamilyConnectionData {
  id?: string;
  user_id: string;
  connected_user_id?: string | null;
  name: string;
  relationship_label: string;
  invite_method: 'whatsapp' | 'email';
  contact_value: string;
  invite_token: string;
  status: 'pending' | 'accepted';
  safety_status: 'SAFE' | 'AT RISK' | 'UNKNOWN';
  last_checkin: string;
  created_at?: string;
}

export class ProfileService {
  /**
   * Fetches or creates profile for authenticated user in Supabase
   */
  public static async getOrCreateProfile(authUser: any): Promise<UserProfileData | null> {
    if (!isSupabaseConfigured || !authUser) return null;

    try {
      // 1. Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[ProfileService] Fetch notice:', error.message);
      }

      if (data) return data as UserProfileData;

      // 2. Insert new profile if not found
      const newProfile: UserProfileData = {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'WeatherGPT User',
        email: authUser.email || '',
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select()
        .single();

      if (insertErr) {
        console.warn('[ProfileService] Upsert notice:', insertErr.message);
        return newProfile;
      }

      return inserted as UserProfileData;
    } catch (err) {
      console.warn('[ProfileService] Profile error:', err);
      return null;
    }
  }

  /**
   * Fetches saved locations for the authenticated user
   */
  public static async getUserLocations(userId: string): Promise<UserLocationData[]> {
    if (!isSupabaseConfigured || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return (data || []) as UserLocationData[];
    } catch (err) {
      console.warn('[ProfileService] User locations notice:', err);
      return [];
    }
  }

  /**
   * Saves a new location for the authenticated user
   */
  public static async saveUserLocation(location: Omit<UserLocationData, 'id'>): Promise<UserLocationData | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();

      if (error) throw error;
      return data as UserLocationData;
    } catch (err) {
      console.warn('[ProfileService] Save location error:', err);
      return null;
    }
  }

  /**
   * Deletes a saved location for the authenticated user
   */
  public static async deleteUserLocation(userId: string, locationId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || !locationId) return false;
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[ProfileService] Delete location error:', err);
      return false;
    }
  }

  /**
   * Fetches all family connections for a user
   */
  public static async getFamilyConnections(userId: string): Promise<FamilyConnectionData[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('family_connections')
          .select('*')
          .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as FamilyConnectionData[];
        }
      } catch (err) {
        console.warn('[ProfileService] getFamilyConnections notice:', err);
      }
    }

    // Local storage fallback for offline / unconfigured database
    try {
      const saved = localStorage.getItem(`weathergpt_family_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  }

  /**
   * Creates a new family circle invite connection
   */
  public static async createFamilyInvite(
    inviteData: Omit<FamilyConnectionData, 'id' | 'created_at'>
  ): Promise<FamilyConnectionData | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('family_connections')
          .insert(inviteData)
          .select()
          .single();

        if (!error && data) {
          return data as FamilyConnectionData;
        }
      } catch (err) {
        console.warn('[ProfileService] createFamilyInvite notice:', err);
      }
    }

    // Local fallback
    const fallbackItem: FamilyConnectionData = {
      ...inviteData,
      id: `fam_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      const existing = await this.getFamilyConnections(inviteData.user_id);
      const updated = [fallbackItem, ...existing];
      localStorage.setItem(`weathergpt_family_${inviteData.user_id}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    return fallbackItem;
  }

  /**
   * Accepts an invite token and links the connected user ID
   */
  public static async acceptFamilyInvite(token: string, currentUserId: string): Promise<boolean> {
    if (!token || !currentUserId) return false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('family_connections')
          .update({
            status: 'accepted',
            connected_user_id: currentUserId,
            last_checkin: new Date().toISOString()
          })
          .eq('invite_token', token);

        if (!error) return true;
      } catch (err) {
        console.warn('[ProfileService] acceptFamilyInvite notice:', err);
      }
    }

    return true;
  }

  /**
   * Removes a family connection
   */
  public static async removeFamilyConnection(connectionId: string, userId: string): Promise<boolean> {
    if (!connectionId || !userId) return false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('family_connections')
          .delete()
          .eq('id', connectionId);

        if (!error) return true;
      } catch (err) {
        console.warn('[ProfileService] removeFamilyConnection notice:', err);
      }
    }

    // Local fallback cleanup
    try {
      const existing = await this.getFamilyConnections(userId);
      const updated = existing.filter((c) => c.id !== connectionId);
      localStorage.setItem(`weathergpt_family_${userId}`, JSON.stringify(updated));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Updates user's safety status across family connections
   */
  public static async updateUserSafetyStatus(userId: string, safetyStatus: 'SAFE' | 'AT RISK'): Promise<boolean> {
    if (!userId) return false;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('family_connections')
          .update({
            safety_status: safetyStatus,
            last_checkin: new Date().toISOString()
          })
          .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
      } catch (err) {
        console.warn('[ProfileService] updateUserSafetyStatus notice:', err);
      }
    }

    return true;
  }
}
