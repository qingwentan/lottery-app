import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class AuthService {
  /**
   * 用户登录（通过工号和姓名）
   * 如果用户不存在则自动创建
   */
  async login(name: string, employeeId: string) {
    const client = getSupabaseClient();
    
    // 查找用户
    const { data: existingUser, error: findError } = await client
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 表示未找到记录，其他错误需要抛出
      throw new Error(`查询用户失败: ${findError.message}`);
    }

    if (existingUser) {
      // 用户已存在，更新姓名（可能改名）
      const { data: updatedUser, error: updateError } = await client
        .from('users')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`更新用户信息失败: ${updateError.message}`);
      }

      return updatedUser;
    }

    // 用户不存在，自动创建
    // 根据工号前缀判断角色（L开头为领导）
    const role = employeeId.toUpperCase().startsWith('L') ? 'leader' : 'employee';
    
    const { data: newUser, error: createError } = await client
      .from('users')
      .insert({
        name,
        employee_id: employeeId,
        role,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`创建用户失败: ${createError.message}`);
    }

    return newUser;
  }

  /**
   * 获取用户信息
   */
  async getUser(userId: number) {
    const client = getSupabaseClient();
    
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`获取用户信息失败: ${error.message}`);
    }

    return user;
  }
}
