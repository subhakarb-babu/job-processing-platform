import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number | undefined {
    return this.configService.get<number>('port');
  }

  get db() {
    return this.configService.get('database');
  }

  get redis() {
    return this.configService.get('redis');
  }
}