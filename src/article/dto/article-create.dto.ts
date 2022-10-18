import { Article } from '@prisma/client';
import { IsNumber, IsString, IsDefined, IsEmpty, IsOptional } from 'class-validator';

export class ArticleCreateDto implements Omit<Article, 'id' | 'userId'> {
  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  spoiler: string;

  @IsDefined()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  coverImage: string;

  @IsOptional()
  @IsString()
  picture: string;

  @IsEmpty()
  comments: number;

  @IsEmpty()
  published: boolean;

  @IsDefined()
  @IsNumber()
  categoryId: number;

  @IsEmpty()
  views: number;

  @IsEmpty()
  createdAt: Date;

  @IsEmpty()
  updatedAt: Date;
}
