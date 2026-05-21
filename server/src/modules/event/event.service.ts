import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class EventService {
  /**
   * 获取活动列表
   */
  async getEvents(isActive?: boolean) {
    const client = getSupabaseClient();
    
    let query = client
      .from('lottery_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`获取活动列表失败: ${error.message}`);
    }

    return events;
  }

  /**
   * 获取单个活动
   */
  async getEvent(eventId: number) {
    const client = getSupabaseClient();
    
    const { data: event, error } = await client
      .from('lottery_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      throw new Error(`获取活动失败: ${error.message}`);
    }

    return event;
  }

  /**
   * 创建活动（仅领导）
   */
  async createEvent(title: string, description?: string) {
    const client = getSupabaseClient();
    
    const { data: event, error } = await client
      .from('lottery_events')
      .insert({
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建活动失败: ${error.message}`);
    }

    return event;
  }

  /**
   * 更新活动（仅领导）
   */
  async updateEvent(
    eventId: number,
    updates: {
      title?: string;
      description?: string;
      is_active?: boolean;
    },
  ) {
    const client = getSupabaseClient();
    
    const { data: event, error } = await client
      .from('lottery_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error(`更新活动失败: ${error.message}`);
    }

    return event;
  }

  /**
   * 删除活动（仅领导）
   */
  async deleteEvent(eventId: number) {
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('lottery_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      throw new Error(`删除活动失败: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * 获取当前活跃的活动
   */
  async getActiveEvent() {
    const client = getSupabaseClient();
    
    const { data: event, error } = await client
      .from('lottery_events')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`获取活跃活动失败: ${error.message}`);
    }

    return event;
  }
}
