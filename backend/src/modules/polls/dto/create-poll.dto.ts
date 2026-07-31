import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export enum PollType {
  OPINION_POLL = 'OPINION_POLL',
  SURVEY = 'SURVEY',
  AGM_RESOLUTION = 'AGM_RESOLUTION',
  COMMITTEE_RESOLUTION = 'COMMITTEE_RESOLUTION',
  EMERGENCY_VOTE = 'EMERGENCY_VOTE',
  BUDGET_APPROVAL = 'BUDGET_APPROVAL',
  VENDOR_SELECTION = 'VENDOR_SELECTION',
}

export enum VotingRuleType {
  ONE_VOTE_PER_FLAT = 'ONE_VOTE_PER_FLAT',
  ONE_VOTE_PER_RESIDENT = 'ONE_VOTE_PER_RESIDENT',
  OWNER_ONLY = 'OWNER_ONLY',
  TENANT_ALLOWED = 'TENANT_ALLOWED',
  COMMITTEE_ONLY = 'COMMITTEE_ONLY',
}

export class CreatePollChoiceDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PollType)
  @IsOptional()
  pollType?: PollType = PollType.OPINION_POLL;

  @IsEnum(VotingRuleType)
  @IsOptional()
  votingRule?: VotingRuleType = VotingRuleType.ONE_VOTE_PER_FLAT;

  @IsBoolean()
  @IsOptional()
  isSecretBallot?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;

  @IsBoolean()
  @IsOptional()
  allowProxyVoting?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isWeightedVoting?: boolean = false;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  quorumPercentage?: number = 0;

  @IsString()
  @IsOptional()
  targetAudience?: string = 'ENTIRE_SOCIETY'; // ENTIRE_SOCIETY, BUILDING, WING, OWNER_ONLY, TENANT_ONLY, COMMITTEE

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsOptional()
  choices?: CreatePollChoiceDto[];

  @IsArray()
  @IsOptional()
  attachments?: string[]; // URLs or Document IDs

  @IsString()
  @IsOptional()
  meetingId?: string;

  @IsString()
  @IsOptional()
  noticeId?: string;
}
