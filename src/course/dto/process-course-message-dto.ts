import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class ProcessCourseMessageDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    id: string;

    @IsString()
    @IsNotEmpty()
    courseId: string;

    @IsOptional()
    errors?: Error[];

    @IsDateString()
    @IsOptional()
    createdAt?: Date;

    @IsDateString()
    @IsOptional()
    editedAt?: Date;

    @IsString()
    structureId: string;

    @IsString()
    doubleCheckId: string;
}

type Error = {
    id?: string;
    name: string;
    type: 'error' | 'warning';
    severity: 'high' | 'low' | 'medium';
    itemId?: string;
    itemName: string;
    itemType: string;
    errorId: string;
    message: string;
};
