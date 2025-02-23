import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModuleLoader } from './core/module.loader';

@Module({})
export class AppModule {
  static async register(): Promise<DynamicModule> {
    const modules = await ModuleLoader.load();

    return {
      module: AppModule,
      controllers: [AppController],
      providers: [AppService],
      imports: [...modules],
    };
  }
}
