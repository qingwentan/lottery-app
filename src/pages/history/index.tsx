import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserInfo {
  id: number;
  name: string;
  employee_id: string;
  role: 'admin' | 'leader' | 'employee';
}

interface WinnerRecord {
  id: number;
  event_id: number;
  prize_id: number;
  user_id: number;
  created_at: string;
  users: {
    name: string;
    employee_id: string;
  };
  prizes: {
    name: string;
    level: number;
    description: string;
  };
  lottery_events?: {
    title: string;
  };
}

const HistoryPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);

  useEffect(() => {
    const user = Taro.getStorageSync('userInfo');
    if (!user) {
      Taro.redirectTo({ url: '/pages/index/index' });
      return;
    }
    setUserInfo(user);
    loadWinners(user.id);
  }, []);

  const loadWinners = async (userId: number) => {
    try {
      const res = await Network.request({
        url: `/api/lottery/my-winners?user_id=${userId}`,
      });
      console.log('[记录页] 响应:', res.data);

      if (res.data?.code === 200) {
        setWinners(res.data.data || []);
      }
    } catch (error) {
      console.error('[记录页] 加载错误:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  const getPrizeColor = (level: number) => {
    switch (level) {
      case 1:
        return '#faad14';
      case 2:
        return '#8c8c8c';
      case 3:
        return '#cd7f32';
      default:
        return '#1890ff';
    }
  };

  if (!userInfo) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-[#8c8c8c]">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 顶部标题 */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="block text-xl font-bold text-[#1a1a1a]">
          我的中奖记录
        </Text>
      </View>

      {/* 记录列表 */}
      <View className="px-6 py-4">
        {winners.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <Text className="block text-center text-[#8c8c8c]">
                暂无中奖记录
              </Text>
              <Text className="block text-center text-sm text-[#8c8c8c] mt-2">
                快去抽奖吧！
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="flex flex-col gap-3">
            {winners.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-4">
                  <View className="flex flex-row items-center gap-3 mb-2">
                    <Badge>
                      <Text style={{ color: getPrizeColor(record.prizes.level) }}>
                        {record.prizes.name}
                      </Text>
                    </Badge>
                    <Text className="text-sm text-[#8c8c8c]">
                      {record.prizes.level}等奖
                    </Text>
                  </View>
                  <Text className="block text-base font-medium text-[#1a1a1a]">
                    {record.prizes.description}
                  </Text>
                  <View className="flex flex-row justify-between items-center mt-2">
                    <Text className="block text-sm text-[#8c8c8c]">
                      {record.lottery_events?.title || '抽奖活动'}
                    </Text>
                    <Text className="block text-xs text-[#8c8c8c]">
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default HistoryPage;
