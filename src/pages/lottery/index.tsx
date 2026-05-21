import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserInfo {
  id: number;
  name: string;
  employee_id: string;
  role: 'admin' | 'leader' | 'employee';
}

interface Prize {
  id: number;
  event_id: number;
  name: string;
  level: number;
  quantity: number;
  remaining_quantity: number;
  description: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
}

const LotteryPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<{ prize: Prize } | null>(null);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // 检查登录状态
    const user = Taro.getStorageSync('userInfo');
    if (!user) {
      Taro.redirectTo({ url: '/pages/index/index' });
      return;
    }
    setUserInfo(user);
    
    // 加载活动信息
    loadActiveEvent();
  }, []);

  const loadActiveEvent = async () => {
    try {
      // 获取活跃活动
      const eventRes = await Network.request({ url: '/api/events/active' });
      console.log('[抽奖页] 活动响应:', eventRes.data);

      if (eventRes.data?.code === 200 && eventRes.data?.data) {
        const eventData = eventRes.data.data as Event;
        setEvent(eventData);

        // 获取奖项列表
        const prizesRes = await Network.request({
          url: `/api/prizes?event_id=${eventData.id}`,
        });
        console.log('[抽奖页] 奖项响应:', prizesRes.data);

        if (prizesRes.data?.code === 200) {
          setPrizes(prizesRes.data.data || []);
        }
      } else {
        Taro.showToast({ title: '当前没有活跃的抽奖活动', icon: 'none' });
      }
    } catch (error) {
      console.error('[抽奖页] 加载错误:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  const handleDraw = async () => {
    if (!event || !userInfo) return;

    setIsDrawing(true);
    setDrawResult(null);
    setAnimationClass('animate-pulse');

    try {
      // 模拟抽奖动画效果
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('[抽奖] 发送请求:', { user_id: userInfo.id, event_id: event.id });

      const res = await Network.request({
        url: '/api/lottery/draw',
        method: 'POST',
        data: { user_id: userInfo.id, event_id: event.id },
      });

      console.log('[抽奖] 响应:', res.data);

      if (res.data?.code === 200 && res.data?.data) {
        const result = res.data.data;
        setDrawResult(result);
        setAnimationClass('animate-bounce');

        // 震动反馈
        Taro.vibrateShort({ type: 'heavy' });

        // 刷新奖项列表
        await loadActiveEvent();
      } else {
        Taro.showToast({ title: res.data?.msg || '抽奖失败', icon: 'none' });
        setAnimationClass('');
      }
    } catch (error) {
      console.error('[抽奖] 错误:', error);
      Taro.showToast({ title: '抽奖失败，请重试', icon: 'none' });
      setAnimationClass('');
    } finally {
      setIsDrawing(false);
    }
  };

  const goToAdmin = () => {
    Taro.navigateTo({ url: '/pages/admin/index' });
  };

  const goToHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('userInfo');
          Taro.redirectTo({ url: '/pages/index/index' });
        }
      },
    });
  };

  const getPrizeBadgeVariant = (level: number) => {
    switch (level) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPrizeColor = (level: number) => {
    switch (level) {
      case 1:
        return '#faad14'; // 金色
      case 2:
        return '#8c8c8c'; // 银色
      case 3:
        return '#cd7f32'; // 铜色
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
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部信息栏 */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex justify-between items-center">
          <View>
            <Text className="block text-lg font-semibold text-[#1a1a1a]">
              {userInfo.name}
            </Text>
            <Text className="block text-sm text-[#8c8c8c]">
              {userInfo.employee_id} · {userInfo.role === 'admin' ? '管理员' : userInfo.role === 'leader' ? '领导' : '员工'}
            </Text>
          </View>
          <Button
            size="sm"
            variant="outline"
            className="text-[#8c8c8c]"
            onClick={handleLogout}
          >
            <Text>退出</Text>
          </Button>
        </View>
      </View>

      {/* 活动标题 */}
      {event && (
        <View className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
          <Text className="block text-xl font-bold text-white text-center">
            {event.title}
          </Text>
          {event.description && (
            <Text className="block text-sm text-white opacity-80 text-center mt-1">
              {event.description}
            </Text>
          )}
        </View>
      )}

      {/* 奖项列表 */}
      <View className="px-6 py-4">
        <Text className="block text-base font-semibold text-[#1a1a1a] mb-3">
          奖项列表
        </Text>

        {prizes.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <Text className="block text-center text-[#8c8c8c]">
                暂无可抽奖的奖项
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="flex flex-col gap-3">
            {prizes.map((prize) => (
              <Card key={prize.id}>
                <CardContent className="py-4 flex flex-row justify-between items-center">
                  <View className="flex flex-row items-center gap-3">
                    <Badge variant={getPrizeBadgeVariant(prize.level)}>
                      <Text style={{ color: getPrizeColor(prize.level) }}>
                        {prize.name}
                      </Text>
                    </Badge>
                    <View>
                      <Text className="block text-base font-medium text-[#1a1a1a]">
                        {prize.description}
                      </Text>
                      <Text className="block text-sm text-[#8c8c8c]">
                        剩余 {prize.remaining_quantity} / {prize.quantity}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* 抽奖按钮 */}
      <View className="px-6 py-8">
        <Button
          className={`w-full py-6 rounded-2xl text-white text-lg font-bold shadow-lg ${
            isDrawing || prizes.length === 0
              ? 'bg-gray-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          } ${animationClass}`}
          disabled={isDrawing || prizes.length === 0}
          onClick={handleDraw}
        >
          <Text className="text-lg font-bold">
            {isDrawing ? '抽奖中...' : '立即抽奖'}
          </Text>
        </Button>
      </View>

      {/* 抽奖结果 */}
      {drawResult && (
        <View className="px-6 py-4">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500">
            <CardContent className="py-8">
              <Text className="block text-center text-white text-xl font-bold mb-2">
                🎉 恭喜您！
              </Text>
              <Text className="block text-center text-white text-2xl font-bold">
                获得 {drawResult.prize.name}
              </Text>
              <Text className="block text-center text-white opacity-90 text-base mt-2">
                {drawResult.prize.description}
              </Text>
            </CardContent>
          </Card>
        </View>
      )}

      {/* 底部操作栏 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #e5e5e5',
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <Button
          variant="outline"
          className="flex-1"
          onClick={goToHistory}
        >
          <Text>中奖记录</Text>
        </Button>
        {userInfo.role === 'admin' && (
          <Button
            variant="default"
            className="flex-1 bg-[#1890ff]"
            onClick={goToAdmin}
          >
            <Text>管理奖项</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default LotteryPage;
