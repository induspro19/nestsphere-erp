import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeopleManagementService } from './people-management.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Master People Management Engine')
@ApiBearerAuth()
@Audit()
@Controller('people')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PeopleManagementController {
  constructor(private peopleService: PeopleManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get Paginated Master People Registry (Search & Filter)' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryPersonDto) {
    return this.peopleService.findAll(societyId, query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export People Registry to Dataset' })
  async export(@CurrentTenant() societyId: string) {
    return this.peopleService.bulkExport(societyId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get Current Person Profile' })
  async findMe(
    @CurrentTenant({ optional: true }) societyId: string | null, 
    @ActiveUser('sub') actorId: string,
    @ActiveUser('email') email: string
  ) {
    if (!actorId) {
      throw new UnauthorizedException('Authentication token missing or invalid');
    }
    
    return await this.peopleService.findMeProfile(societyId, actorId, email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Master Person Profile' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.peopleService.findOne(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Master Person Profile' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreatePersonDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.peopleService.create(societyId, dto, actorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Master Person Profile & Roles' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.peopleService.update(societyId, id, dto, actorId);
  }

  @Post(':id/move-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process Move Out for Unit Mapping' })
  async processMoveOut(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('unitId') unitId: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.peopleService.processMoveOut(societyId, id, unitId, actorId);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk Import People Profiles' })
  async bulkImport(
    @CurrentTenant() societyId: string,
    @Body() records: CreatePersonDto[],
    @ActiveUser('sub') actorId: string,
  ) {
    return this.peopleService.bulkImport(societyId, records, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft Delete Person Profile' })
  async remove(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.peopleService.remove(societyId, id, actorId);
  }
}
