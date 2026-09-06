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
      if (saved) {
        const parsed: FamilyConnectionData[] = JSON.parse(saved);
        const synced = parsed.map((item) => {
          const targetIds = [item.connected_user_id, item.user_id, item.id].filter(Boolean);
          for (const targetId of targetIds) {
            if (targetId) {
              const statusOverride = localStorage.getItem(`weathergpt_user_safety_status_${targetId}`);
              if (statusOverride === 'SAFE' || statusOverride === 'AT RISK') {
                return { ...item, safety_status: statusOverride as 'SAFE' | 'AT RISK' };
              }
            }
          }
          return item;
        });
        return synced;
      }

      // Seed initial default family circle members if nothing stored yet
      const defaultMembers: FamilyConnectionData[] = [
        {
          id: 'fam_mom',
          user_id: userId,
          connected_user_id: 'user_mom',
          name: 'Mom (Radha)',
          relationship_label: 'Mother',
          invite_method: 'whatsapp',
          contact_value: '+91 98480 12345',
          invite_token: 'tok_mom',
          status: 'accepted',
          safety_status: 'SAFE',
          last_checkin: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: 'fam_dad',
          user_id: userId,
          connected_user_id: 'user_dad',
          name: 'Dad (Srinivas)',
          relationship_label: 'Father',
          invite_method: 'whatsapp',
          contact_value: '+91 98480 12346',
          invite_token: 'tok_dad',
          status: 'accepted',
          safety_status: 'SAFE',
          last_checkin: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: 'fam_brother',
          user_id: userId,
          connected_user_id: 'user_brother',
          name: 'Brother (Ravi)',
          relationship_label: 'Brother',
          invite_method: 'whatsapp',
          contact_value: '+91 98480 12347',
          invite_token: 'tok_brother',
          status: 'accepted',
          safety_status: 'AT RISK',
          last_checkin: new Date(Date.now() - 35 * 60000).toISOString()
        }
      ];

      localStorage.setItem(`weathergpt_family_${userId}`, JSON.stringify(defaultMembers));
      return defaultMembers;
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
            safety_status: 'SAFE',
            last_checkin: new Date().toISOString()
          })
          .eq('invite_token', token);

        if (!error) console.log('[ProfileService] Invite accepted in Supabase');
      } catch (err) {
        console.warn('[ProfileService] acceptFamilyInvite notice:', err);
      }
    }

    // Local storage fallback sync
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weathergpt_family_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: FamilyConnectionData[] = JSON.parse(raw);
            let updatedAny = false;
            const updatedList = list.map((item) => {
              if (item.invite_token === token) {
                updatedAny = true;
                return {
                  ...item,
                  status: 'accepted' as const,
                  connected_user_id: currentUserId,
                  safety_status: 'SAFE' as const,
                  last_checkin: new Date().toISOString()
                };
              }
              return item;
            });
            if (updatedAny) {
              localStorage.setItem(key, JSON.stringify(updatedList));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[ProfileService] Fallback sync notice:', e);
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
   * Updates safety status for a specific family member by id
   */
  public static async updateMemberSafetyStatus(
    userId: string,
    memberId: string,
    safetyStatus: 'SAFE' | 'AT RISK'
  ): Promise<FamilyConnectionData | null> {
    if (!memberId || !userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('family_connections')
          .update({
            safety_status: safetyStatus,
            last_checkin: new Date().toISOString()
          })
          .eq('id', memberId)
          .select()
          .single();

        if (!error && data) {
          return data as FamilyConnectionData;
        }
      } catch (err) {
        console.warn('[ProfileService] updateMemberSafetyStatus notice:', err);
      }
    }

    try {
      const existing = await this.getFamilyConnections(userId);
      let targetMember: FamilyConnectionData | null = null;

      const updated = existing.map((member) => {
        if (member.id === memberId) {
          targetMember = {
            ...member,
            safety_status: safetyStatus,
            last_checkin: new Date().toISOString()
          };
          return targetMember;
        }
        return member;
      });

      localStorage.setItem(`weathergpt_family_${userId}`, JSON.stringify(updated));
      return targetMember;
    } catch (e) {
      return null;
    }
  }

  /**
   * Updates user's own personal safety status
   */
  public static async updateUserSafetyStatus(userId: string, safetyStatus: 'SAFE' | 'AT RISK'): Promise<boolean> {
    if (!userId) return false;
    const nowIso = new Date().toISOString();

    try {
      localStorage.setItem(`weathergpt_user_safety_status_${userId}`, safetyStatus);
    } catch (e) {
      // ignore
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('family_connections')
          .update({
            safety_status: safetyStatus,
            last_checkin: nowIso
          })
          .eq('connected_user_id', userId);
      } catch (err) {
        console.warn('[ProfileService] updateUserSafetyStatus notice:', err);
      }
    }

    // Local storage fallback sync across other family members' stored lists
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weathergpt_family_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: FamilyConnectionData[] = JSON.parse(raw);
            let updatedAny = false;
            const updatedList = list.map((item) => {
              const isMatch =
                item.connected_user_id === userId ||
                item.id === userId ||
                (item.name && userId && (
                  item.name.toLowerCase().includes(userId.toLowerCase()) ||
                  userId.toLowerCase().includes(item.name.toLowerCase()) ||
                  item.name.toLowerCase().split(/\s+/).some((t) => t.length > 2 && userId.toLowerCase().includes(t))
                ));

              if (isMatch) {
                updatedAny = true;
                return {
                  ...item,
                  safety_status: safetyStatus,
                  last_checkin: nowIso
                };
              }
              return item;
            });
            if (updatedAny) {
              localStorage.setItem(key, JSON.stringify(updatedList));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[ProfileService] Local storage sync notice:', e);
    }

    return true;
  }

  /**
   * Gets user's own safety status
   */
  public static getUserSafetyStatus(userId: string): 'SAFE' | 'AT RISK' {
    try {
      const saved = localStorage.getItem(`weathergpt_user_safety_status_${userId}`);
      if (saved === 'AT RISK' || saved === 'SAFE') return saved;
    } catch {
      // ignore
    }
    return 'SAFE';
  }
}
