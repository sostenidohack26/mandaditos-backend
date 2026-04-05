import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      message: 'Backend de Mandaditos funcionando',
      timestamp: new Date().toISOString(),
    };
  }
}