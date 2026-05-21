import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  /**
   * 执行抽奖
   * POST /api/lottery/draw
   */
  @Post('draw')
  @HttpCode(HttpStatus.OK)
  async draw(@Body() body: { user_id: number; event_id: number }) {
    console.log('[LotteryController] 抽奖请求:', body);
    
    const result = await this.lotteryService.draw(body.user_id, body.event_id);
    
    return {
      code: 200,
      msg: '抽奖成功',
      data: result,
    };
  }

  /**
   * 获取中奖记录
   * GET /api/lottery/winners?event_id=1&user_id=1
   */
  @Get('winners')
  async getWinners(
    @Query('event_id') eventId?: string,
    @Query('user_id') userId?: string,
  ) {
    console.log('[LotteryController] 获取中奖记录:', { eventId, userId });
    
    const winners = await this.lotteryService.getWinners(
      eventId ? Number(eventId) : undefined,
      userId ? Number(userId) : undefined,
    );
    
    return {
      code: 200,
      msg: '获取成功',
      data: winners,
    };
  }

  /**
   * 获取我的中奖记录
   * GET /api/lottery/my-winners?user_id=1
   */
  @Get('my-winners')
  async getMyWinners(@Query('user_id') userId: string) {
    console.log('[LotteryController] 获取我的中奖记录:', { userId });
    
    const winners = await this.lotteryService.getMyWinners(Number(userId));
    
    return {
      code: 200,
      msg: '获取成功',
      data: winners,
    };
  }
}
