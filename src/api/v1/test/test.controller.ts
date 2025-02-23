import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Test')
@Controller()
export class TestController {
  constructor() {}

  @Post()
  @ApiOperation({ summary: 'test' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create() {
    return {
      message: 'Created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all test' })
  @ApiResponse({ status: 200, description: 'Return all' })
  findAll() {
    return {
      message: 'Return all',
    };
  }
}
