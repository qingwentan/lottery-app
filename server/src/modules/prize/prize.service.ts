import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class PrizeService {
  /**
   * 获取指定活动的奖项列表
   */
  async getPrizes(eventId: number) {
    const client = getSupabaseClient();
    
    const { data: prizes, error } = await client
      .from('prizes')
      .select('*')
      .eq('event_id', eventId)
      .order('level', { ascending: true });

    if (error) {
      throw new Error(`获取奖项列表失败: ${error.message}`);
    }

    return prizes;
  }

  /**
   * 创建奖项（仅领导）
   */
  async createPrize(
    eventId: number,
    name: string,
    level: number,
    quantity: number,
    description?: string,
  ) {
    const client = getSupabaseClient();
    
    const { data: prize, error } = await client
      .from('prizes')
      .insert({
        event_id: eventId,
        name,
        level,
        quantity,
        remaining_quantity: quantity,
        description,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建奖项失败: ${error.message}`);
    }

    return prize;
  }

  /**
   * 更新奖项（仅领导）
   */
  async updatePrize(
    prizeId: number,
    updates: {
      name?: string;
      level?: number;
      quantity?: number;
      description?: string;
    },
  ) {
    const client = getSupabaseClient();
    
    // 如果更新数量，需要计算剩余数量的变化
    if (updates.quantity !== undefined) {
      const { data: existingPrize, error: findError } = await client
        .from('prizes')
        .select('quantity, remaining_quantity')
        .eq('id', prizeId)
        .single();

      if (findError) {
        throw new Error(`查询奖项失败: ${findError.message}`);
      }

      const quantityDiff = updates.quantity - existingPrize.quantity;
      const newRemaining = existingPrize.remaining_quantity + quantityDiff;

      if (newRemaining < 0) {
        throw new Error('剩余数量不能为负数');
      }

      const { data: prize, error } = await client
        .from('prizes')
        .update({
          ...updates,
          remaining_quantity: newRemaining,
          updated_at: new Date().toISOString(),
        })
        .eq('id', prizeId)
        .select()
        .single();

      if (error) {
        throw new Error(`更新奖项失败: ${error.message}`);
      }

      return prize;
    }

    const { data: prize, error } = await client
      .from('prizes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prizeId)
      .select()
      .single();

    if (error) {
      throw new Error(`更新奖项失败: ${error.message}`);
    }

    return prize;
  }

  /**
   * 删除奖项（仅领导）
   */
  async deletePrize(prizeId: number) {
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('prizes')
      .delete()
      .eq('id', prizeId);

    if (error) {
      throw new Error(`删除奖项失败: ${error.message}`);
    }

    return { success: true };
  }
}
