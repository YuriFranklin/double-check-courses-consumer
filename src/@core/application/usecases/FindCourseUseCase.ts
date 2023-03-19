import CourseGatewayInterface from 'src/@core/domain/gateways/CourseGatewayInterface';

export default class FindCourseUseCase {
    constructor(private courseGateway: CourseGatewayInterface) {}

    async execute(input: Input): Promise<Output> {
        const course = await this.courseGateway.find(input);

        return course.toJSON();
    }
}

type Input = string;

type Output = {
    id: string;
    name: string;
    errors: Error[];
    contents: Content[];
    createdAt: string;
    editedAt: string;
    courseId: string;
    doubleCheckId: string;
    checked: boolean;
    termId: string;
};

export type Content = {
    id: string;
    name: string;
    description: string;
    beforeId: string;
    type: string;
    hasChildren: boolean;
    children: Content[];
    parentId: string;
    disponibility: boolean;
};
