import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngineService } from './workflow-engine.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('WorkflowEngineService', () => {
  let service: WorkflowEngineService;
  let prisma: PrismaService;

  const mockPrismaService = {
    workflowTemplate: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    workflowInstance: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    workflowStepInstance: {
      update: jest.fn(),
    },
    workflowComment: {
      create: jest.fn(),
    },
    activityTimeline: {
      create: jest.fn(),
    },
  };

  const mockNotificationsService = {
    send: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<WorkflowEngineService>(WorkflowEngineService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTemplates', () => {
    it('should return active templates for society', async () => {
      const mockTemplates = [{ id: '1', code: 'MOVE_IN_APPROVAL', name: 'Move In Approval' }];
      mockPrismaService.workflowTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await service.getTemplates('society-123');
      expect(result).toEqual(mockTemplates);
      expect(prisma.workflowTemplate.findMany).toHaveBeenCalledWith({
        where: { OR: [{ societyId: 'society-123' }, { societyId: null }], isActive: true },
        include: { steps: true },
      });
    });
  });
});
