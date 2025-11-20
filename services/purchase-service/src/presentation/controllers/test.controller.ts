import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  async test(): Promise<string> {
    return 'Test controller is working!';
  }
}
