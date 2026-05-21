import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { name: string; employee_id: string }) {
    console.log('[AuthController] 登录请求:', { name: body.name, employee_id: body.employee_id });
    
    const user = await this.authService.login(body.name, body.employee_id);
    
    return {
      code: 200,
      msg: '登录成功',
      data: user,
    };
  }

  /**
   * 获取用户信息
   * GET /api/auth/user?user_id=1
   */
  @Get('user')
  async getUser(@Query('user_id') userId: string) {
    console.log('[AuthController] 获取用户信息:', { userId });
    
    const user = await this.authService.getUser(Number(userId));
    
    return {
      code: 200,
      msg: '获取成功',
      data: user,
    };
  }
}
