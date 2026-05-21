import { Controller, Get, Post, Put, Delete, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PrizeService } from './prize.service';

@Controller('prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  /**
   * 获取奖项列表
   * GET /api/prizes?event_id=1
   */
  @Get()
  async getPrizes(@Query('event_id') eventId: string) {
    console.log('[PrizeController] 获取奖项列表:', { eventId });
    
    const prizes = await this.prizeService.getPrizes(Number(eventId));
    
    return {
      code: 200,
      msg: '获取成功',
      data: prizes,
    };
  }

  /**
   * 创建奖项（仅领导）
   * POST /api/prizes
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createPrize(
    @Body()
    body: {
      event_id: number;
      name: string;
      level: number;
      quantity: number;
      description?: string;
    },
  ) {
    console.log('[PrizeController] 创建奖项:', body);
    
    const prize = await this.prizeService.createPrize(
      body.event_id,
      body.name,
      body.level,
      body.quantity,
      body.description,
    );
    
    return {
      code: 200,
      msg: '创建成功',
      data: prize,
    };
  }

  /**
   * 更新奖项（仅领导）
   * PUT /api/prizes/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePrize(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      level?: number;
      quantity?: number;
      description?: string;
    },
  ) {
    console.log('[PrizeController] 更新奖项:', { id, updates: body });
    
    const prize = await this.prizeService.updatePrize(Number(id), body);
    
    return {
      code: 200,
      msg: '更新成功',
      data: prize,
    };
  }

  /**
   * 删除奖项（仅领导）
   * DELETE /api/prizes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePrize(@Param('id') id: string) {
    console.log('[PrizeController] 删除奖项:', { id });
    
    await this.prizeService.deletePrize(Number(id));
    
    return {
      code: 200,
      msg: '删除成功',
      data: null,
    };
  }
}
