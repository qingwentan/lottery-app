import { Controller, Get, Post, Put, Delete, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 获取活动列表
   * GET /api/events?is_active=true
   */
  @Get()
  async getEvents(@Query('is_active') isActive?: string) {
    console.log('[EventController] 获取活动列表:', { isActive });
    
    const events = await this.eventService.getEvents(
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
    
    return {
      code: 200,
      msg: '获取成功',
      data: events,
    };
  }

  /**
   * 获取当前活跃的活动
   * GET /api/events/active
   */
  @Get('active')
  async getActiveEvent() {
    console.log('[EventController] 获取活跃活动');
    
    const event = await this.eventService.getActiveEvent();
    
    return {
      code: 200,
      msg: '获取成功',
      data: event,
    };
  }

  /**
   * 获取单个活动
   * GET /api/events/:id
   */
  @Get(':id')
  async getEvent(@Param('id') id: string) {
    console.log('[EventController] 获取活动:', { id });
    
    const event = await this.eventService.getEvent(Number(id));
    
    return {
      code: 200,
      msg: '获取成功',
      data: event,
    };
  }

  /**
   * 创建活动（仅管理员）
   * POST /api/events
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createEvent(
    @Body() body: { title: string; description?: string; user_role?: string },
  ) {
    console.log('[EventController] 创建活动:', body);
    
    // 权限检查：只有管理员可以创建活动
    if (body.user_role !== 'admin') {
      return {
        code: 403,
        msg: '权限不足，仅管理员可以管理活动',
        data: null,
      };
    }
    
    const event = await this.eventService.createEvent(body.title, body.description);
    
    return {
      code: 200,
      msg: '创建成功',
      data: event,
    };
  }

  /**
   * 更新活动（仅管理员）
   * PUT /api/events/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      is_active?: boolean;
      user_role?: string;
    },
  ) {
    console.log('[EventController] 更新活动:', { id, updates: body });
    
    // 权限检查：只有管理员可以更新活动
    if (body.user_role !== 'admin') {
      return {
        code: 403,
        msg: '权限不足，仅管理员可以管理活动',
        data: null,
      };
    }
    
    const { user_role, ...updates } = body;
    const event = await this.eventService.updateEvent(Number(id), updates);
    
    return {
      code: 200,
      msg: '更新成功',
      data: event,
    };
  }

  /**
   * 删除活动（仅管理员）
   * DELETE /api/events/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteEvent(
    @Param('id') id: string,
    @Body() body: { user_role?: string },
  ) {
    console.log('[EventController] 删除活动:', { id });
    
    // 权限检查：只有管理员可以删除活动
    if (body.user_role !== 'admin') {
      return {
        code: 403,
        msg: '权限不足，仅管理员可以管理活动',
        data: null,
      };
    }
    
    await this.eventService.deleteEvent(Number(id));
    
    return {
      code: 200,
      msg: '删除成功',
      data: null,
    };
  }
}
