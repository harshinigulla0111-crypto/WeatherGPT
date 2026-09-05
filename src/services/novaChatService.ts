import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { NovaChatMessage } from './novaService';

export interface DBNovaChatMessage {
  id?: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export class NovaChatService {
  /**
   * Fetches persistent chat history for the user from Supabase or localStorage fallback
   */
  public static async getChatHistory(userId: string): Promise<NovaChatMessage[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('nova_chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            sender: row.role === 'user' ? 'user' : 'nova',
            text: row.content,
            timestamp: row.created_at
              ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now'
          }));
        }
      } catch (err) {
        console.warn('[NovaChatService] getChatHistory notice:', err);
      }
    }

    // Local storage fallback
    try {
      const saved = localStorage.getItem(`weathergpt_nova_chat_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }

    return [];
  }

  /**
   * Saves a user or assistant message to Supabase & localStorage fallback
   */
  public static async saveChatMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<NovaChatMessage> {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMsg: NovaChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: role === 'user' ? 'user' : 'nova',
      text: content,
      timestamp: timeStr
    };

    if (isSupabaseConfigured && userId && userId !== 'demo_user') {
      try {
        const { data, error } = await supabase
          .from('nova_chat_messages')
          .insert({
            user_id: userId,
            role,
            content
          })
          .select()
          .single();

        if (!error && data) {
          localMsg.id = data.id;
        }
      } catch (err) {
        console.warn('[NovaChatService] saveChatMessage notice:', err);
      }
    }

    // Save to local storage fallback list
    try {
      const storageKey = `weathergpt_nova_chat_${userId || 'demo_user'}`;
      const saved = localStorage.getItem(storageKey);
      const list: NovaChatMessage[] = saved ? JSON.parse(saved) : [];
      list.push(localMsg);
      // Keep max 50 recent messages in local cache
      if (list.length > 50) list.shift();
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    return localMsg;
  }

  /**
   * Clears chat history for the user from Supabase and localStorage fallback
   */
  public static async clearChatHistory(userId: string): Promise<boolean> {
    if (isSupabaseConfigured && userId && userId !== 'demo_user') {
      try {
        await supabase
          .from('nova_chat_messages')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[NovaChatService] clearChatHistory notice:', err);
      }
    }

    try {
      localStorage.removeItem(`weathergpt_nova_chat_${userId || 'demo_user'}`);
    } catch (e) {
      // ignore
    }

    return true;
  }
}
