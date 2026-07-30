import { Test, TestingModule } from '@nestjs/testing';
import { FinancialEngineService } from './financial-engine.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('FinancialEngineService', () => {
  let service: FinancialEngineService;
  let prisma: PrismaService;

  const mockPrismaService = {
    financialAccount: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    journalEntry: {
      count: jest.fn(),
      create: jest.fn(),
    },
    financialTransaction: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    memberWallet: {
      findMany: jest.fn(),
    },
    activityTimeline: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FinancialEngineService>(FinancialEngineService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJournalEntry', () => {
    it('should throw BadRequestException if Debit and Credit are unbalanced', async () => {
      const unbalancedDto = {
        narration: 'Test Journal',
        items: [
          { accountId: 'acc-1', debitAmount: 100, creditAmount: 0 },
          { accountId: 'acc-2', debitAmount: 0, creditAmount: 50 }, // Unbalanced!
        ],
      };

      await expect(service.createJournalEntry('society-123', unbalancedDto, 'actor-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
