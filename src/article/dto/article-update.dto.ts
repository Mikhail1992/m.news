import { Prisma } from '@prisma/client';
import { IsNumber, IsString, IsEmpty, IsOptional } from 'class-validator';

export class ArticleUpdateDto implements Omit<Prisma.ArticleUpdateInput, 'id'> {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  spoiler?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsEmpty()
  published?: boolean;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsEmpty()
  userId?: number;

  @IsEmpty()
  views?: number;

  @IsEmpty()
  createdAt?: Date;

  @IsEmpty()
  updatedAt?: Date;
}
