import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginResponse {
  id: number;
  name: string;
  employee_id: string;
  role: 'leader' | 'employee';
  created_at: string;
  updated_at: string;
}

const LoginPage = () => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!employeeId.trim()) {
      Taro.showToast({ title: '请输入工号', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      console.log('[登录] 发送请求:', { name, employee_id: employeeId });
      
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { name, employee_id: employeeId },
      });

      console.log('[登录] 响应:', res.data);

      if (res.data?.code === 200 && res.data?.data) {
        const user = res.data.data as LoginResponse;
        
        // 保存用户信息到本地
        Taro.setStorageSync('userInfo', user);
        
        Taro.showToast({
          title: `登录成功！${user.role === 'leader' ? '领导' : '员工'}身份`,
          icon: 'success',
        });

        // 跳转到抽奖页面
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/lottery/index' });
        }, 1000);
      } else {
        Taro.showToast({ title: res.data?.msg || '登录失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[登录] 错误:', error);
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-8">
      {/* Logo 和标题 */}
      <View className="mb-8">
        <Text className="block text-3xl font-bold text-[#1890ff] text-center mb-2">
          企业抽奖系统
        </Text>
        <Text className="block text-base text-[#8c8c8c] text-center">
          简洁、专业、无干扰
        </Text>
      </View>

      {/* 登录卡片 */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">用户登录</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 姓名输入 */}
          <View>
            <Text className="block text-sm font-medium text-[#595959] mb-2">姓名</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入您的姓名"
                value={name}
                onInput={(e) => setName(e.detail.value)}
              />
            </View>
          </View>

          {/* 工号输入 */}
          <View>
            <Text className="block text-sm font-medium text-[#595959] mb-2">工号</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="领导工号以 L 开头"
                value={employeeId}
                onInput={(e) => setEmployeeId(e.detail.value)}
              />
            </View>
            <Text className="block text-xs text-[#8c8c8c] mt-1">
              提示：领导工号以 L 开头（如 L001），员工工号以 E 开头（如 E001）
            </Text>
          </View>

          {/* 登录按钮 */}
          <Button
            className="w-full bg-[#1890ff] text-white rounded-xl py-3 mt-4"
            disabled={loading}
            onClick={handleLogin}
          >
            <Text className="text-base font-medium">
              {loading ? '登录中...' : '登录'}
            </Text>
          </Button>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <View className="mt-8">
        <Text className="block text-xs text-[#8c8c8c] text-center">
          企业内部抽奖工具 · 安全无广告
        </Text>
      </View>
    </View>
  );
};

export default LoginPage;
