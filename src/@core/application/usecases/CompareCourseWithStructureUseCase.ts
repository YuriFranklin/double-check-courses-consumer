import CompareCourseService from '../../domain/services/CompareCourseService';
import Course from '../../domain/entities/Course';
import StructureGatewayInterface from '../../domain/gateways/StructureGatewayInterface';

export default class CompareCourseWithStructureUseCase {
    constructor(private structureGateway: StructureGatewayInterface) {}

    public async execute(input: Input): Promise<Output> {
        const structure = await this.structureGateway.find(input.structureId);

        const course = Course.create(input.course);

        const compareService = new CompareCourseService();

        const result =
            compareService.compareCourseWithStructureAndGenerateErrors(
                structure,
                course,
            );
    }
}

type Input = {
    course: CourseInput;
    structureId: string;
};

type CourseInput = {
    name?: string;
    id: string;
    courseId: string;
    createdAt: Date;
    editedAt?: Date;
    doubleCheckId?: string;
};

type Output = {
    id: string;
    name?: string;
    errors: Error[];
    createdAt: string;
    editedAt: string;
    courseId: string;
    doubleCheckId?: string;
    checked: boolean;
};

export type Error = {
    id: string;
    name: string;
    type: 'error' | 'warning';
    severity: 'high' | 'low' | 'medium';
    itemId: string;
    itemName: string;
    itemType: string;
    errorId: string;
    message: string;
};
