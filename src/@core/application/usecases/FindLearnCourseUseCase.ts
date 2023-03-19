import CourseGatewayInterface from '../../domain/gateways/CourseGatewayInterface';

export default class FindLearnCourseUseCase {
    constructor(private courseGateway: CourseGatewayInterface) {}

    async execute(input: Input): Promise<Output> {
        const course = await this.courseGateway.find(
            input.courseId,
            input.fetchContent,
        );

        const {
            termId,
            courseId: externalId,
            name,
            id,
            contents,
        } = course.toJSON();

        return { termId, externalId, name, id, contents };
    }
}

type Input = {
    courseId: string;
    fetchContent?: boolean;
};

type Output = {
    id: string;
    externalId: string;
    name: string;
    termId?: string;
    contents?: Content[];
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
