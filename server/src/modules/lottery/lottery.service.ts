import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class LotteryService {
  /**
   * 执行抽奖
   */
  async draw(userId: number, eventId: number) {
    const client = getSupabaseClient();

    // 1. 检查用户是否已经中奖过
    const { data: existingWinner, error: checkError } = await client
      .from('winner_records')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`检查中奖记录失败: ${checkError.message}`);
    }

    if (existingWinner) {
      throw new Error('您已经中过奖了，不能重复抽奖');
    }

    // 2. 获取该活动的所有有剩余数量的奖项
    const { data: prizes, error: prizesError } = await client
      .from('prizes')
      .select('*')
      .eq('event_id', eventId)
      .gt('remaining_quantity', 0)
      .order('level', { ascending: true });

    if (prizesError) {
      throw new Error(`获取奖项失败: ${prizesError.message}`);
    }

    if (!prizes || prizes.length === 0) {
      throw new Error('当前没有可抽奖的奖项');
    }

    // 3. 随机选择一个奖项（按剩余数量加权）
    const totalRemaining = prizes.reduce((sum, p) => sum + p.remaining_quantity, 0);
    let random = Math.random() * totalRemaining;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      random -= prize.remaining_quantity;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    // 4. 创建中奖记录
    const { data: winnerRecord, error: insertError } = await client
      .from('winner_records')
      .insert({
        event_id: eventId,
        prize_id: selectedPrize.id,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`创建中奖记录失败: ${insertError.message}`);
    }

    // 5. 更新奖项剩余数量
    const { error: updateError } = await client
      .from('prizes')
      .update({
        remaining_quantity: selectedPrize.remaining_quantity - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPrize.id);

    if (updateError) {
      throw new Error(`更新奖项数量失败: ${updateError.message}`);
    }

    return {
      winnerRecord,
      prize: selectedPrize,
    };
  }

  /**
   * 获取中奖记录
   */
  async getWinners(eventId?: number, userId?: number) {
    const client = getSupabaseClient();
    
    let query = client
      .from('winner_records')
      .select(`
        *,
        users(name, employee_id),
        prizes(name, level, description)
      `)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: winners, error } = await query;

    if (error) {
      throw new Error(`获取中奖记录失败: ${error.message}`);
    }

    return winners;
  }

  /**
   * 获取我的中奖记录
   */
  async getMyWinners(userId: number) {
    const client = getSupabaseClient();
    
    const { data: winners, error } = await client
      .from('winner_records')
      .select(`
        *,
        prizes(name, level, description),
        lottery_events(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`获取我的中奖记录失败: ${error.message}`);
    }

    return winners;
  }
}
