import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const AdminPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: '',
    level: 1,
    quantity: 1,
    description: '',
  });

  useEffect(() => {
    // 检查登录状态和权限
    const user = Taro.getStorageSync('userInfo');
    if (!user) {
      Taro.redirectTo({ url: '/pages/index/index' });
      return;
    }
    if (user.role !== 'admin') {
      Taro.showToast({ title: '无权访问此页面，仅管理员可访问', icon: 'none' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
      return;
    }
    setUserInfo(user);
    
    // 加载数据
    loadActiveEvent();
  }, []);

  const loadActiveEvent = async () => {
    try {
      const eventRes = await Network.request({ url: '/api/events/active' });
      console.log('[管理页] 活动响应:', eventRes.data);

      if (eventRes.data?.code === 200 && eventRes.data?.data) {
        const eventData = eventRes.data.data as Event;
        setEvent(eventData);
        await loadPrizes(eventData.id);
      }
    } catch (error) {
      console.error('[管理页] 加载错误:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  const loadPrizes = async (eventId: number) => {
    try {
      const res = await Network.request({
        url: `/api/prizes?event_id=${eventId}`,
      });
      console.log('[管理页] 奖项响应:', res.data);

      if (res.data?.code === 200) {
        setPrizes(res.data.data || []);
      }
    } catch (error) {
      console.error('[管理页] 加载奖项错误:', error);
    }
  };

  const handleAddPrize = async () => {
    if (!event || !userInfo) return;

    if (!newPrize.name.trim()) {
      Taro.showToast({ title: '请输入奖项名称', icon: 'none' });
      return;
    }
    if (!newPrize.description.trim()) {
      Taro.showToast({ title: '请输入奖品描述', icon: 'none' });
      return;
    }

    try {
      console.log('[管理页] 添加奖项:', newPrize);

      const res = await Network.request({
        url: '/api/prizes',
        method: 'POST',
        data: {
          event_id: event.id,
          name: newPrize.name,
          level: newPrize.level,
          quantity: newPrize.quantity,
          description: newPrize.description,
          user_role: userInfo.role,
        },
      });

      console.log('[管理页] 添加奖项响应:', res.data);

      if (res.data?.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setShowAddForm(false);
        setNewPrize({ name: '', level: 1, quantity: 1, description: '' });
        await loadPrizes(event.id);
      } else {
        Taro.showToast({ title: res.data?.msg || '添加失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[管理页] 添加奖项错误:', error);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDeletePrize = async (prizeId: number) => {
    if (!userInfo) return;
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个奖项吗？',
      success: async (res) => {
        if (res.confirm && event) {
          try {
            const delRes = await Network.request({
              url: `/api/prizes/${prizeId}`,
              method: 'DELETE',
              data: { user_role: userInfo.role },
            });

            if (delRes.data?.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              await loadPrizes(event.id);
            } else {
              Taro.showToast({ title: delRes.data?.msg || '删除失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[管理页] 删除奖项错误:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
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
          奖项管理
        </Text>
        <Text className="block text-sm text-[#8c8c8c] mt-1">
          仅管理员可访问
        </Text>
      </View>

      {/* 活动信息 */}
      {event && (
        <View className="px-6 py-4">
          <Card>
            <CardContent className="py-4">
              <Text className="block text-base font-semibold text-[#1a1a1a]">
                {event.title}
              </Text>
              {event.description && (
                <Text className="block text-sm text-[#8c8c8c] mt-1">
                  {event.description}
                </Text>
              )}
            </CardContent>
          </Card>
        </View>
      )}

      {/* 添加按钮 */}
      <View className="px-6 mb-4">
        <Button
          className="w-full bg-[#1890ff]"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Text>{showAddForm ? '取消添加' : '新增奖项'}</Text>
        </Button>
      </View>

      {/* 添加表单 */}
      {showAddForm && (
        <View className="px-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle>新增奖项</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <View>
                <Text className="block text-sm font-medium text-[#595959] mb-2">
                  奖项名称
                </Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent"
                    placeholder="如：一等奖、二等奖"
                    value={newPrize.name}
                    onInput={(e) =>
                      setNewPrize({ ...newPrize, name: e.detail.value })
                    }
                  />
                </View>
              </View>

              <View>
                <Text className="block text-sm font-medium text-[#595959] mb-2">
                  奖项等级
                </Text>
                <View className="flex flex-row gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={newPrize.level === level ? 'default' : 'outline'}
                      onClick={() => setNewPrize({ ...newPrize, level })}
                    >
                      <Text>{level}等奖</Text>
                    </Button>
                  ))}
                </View>
              </View>

              <View>
                <Text className="block text-sm font-medium text-[#595959] mb-2">
                  奖项数量
                </Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent"
                    type="number"
                    placeholder="请输入数量"
                    value={String(newPrize.quantity)}
                    onInput={(e) =>
                      setNewPrize({
                        ...newPrize,
                        quantity: Number(e.detail.value) || 1,
                      })
                    }
                  />
                </View>
              </View>

              <View>
                <Text className="block text-sm font-medium text-[#595959] mb-2">
                  奖品描述
                </Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent"
                    placeholder="如：iPhone 15 Pro"
                    value={newPrize.description}
                    onInput={(e) =>
                      setNewPrize({ ...newPrize, description: e.detail.value })
                    }
                  />
                </View>
              </View>

              <Button
                className="w-full bg-[#52c41a]"
                onClick={handleAddPrize}
              >
                <Text>确认添加</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      )}

      {/* 奖项列表 */}
      <View className="px-6">
        <Text className="block text-base font-semibold text-[#1a1a1a] mb-3">
          奖项列表 ({prizes.length})
        </Text>

        {prizes.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <Text className="block text-center text-[#8c8c8c]">
                暂无奖项，点击上方按钮添加
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="flex flex-col gap-3">
            {prizes.map((prize) => (
              <Card key={prize.id}>
                <CardContent className="py-4">
                  <View className="flex flex-row justify-between items-start mb-2">
                    <View className="flex flex-row items-center gap-2">
                      <Badge>
                        <Text>{prize.name}</Text>
                      </Badge>
                      <Text className="text-sm text-[#8c8c8c]">
                        {prize.level}等奖
                      </Text>
                    </View>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePrize(prize.id)}
                    >
                      <Text>删除</Text>
                    </Button>
                  </View>
                  <Text className="block text-base font-medium text-[#1a1a1a]">
                    {prize.description}
                  </Text>
                  <Text className="block text-sm text-[#8c8c8c] mt-1">
                    总数：{prize.quantity} · 剩余：{prize.remaining_quantity}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default AdminPage;
