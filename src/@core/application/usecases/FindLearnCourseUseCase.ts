import CourseGatewayInterface from '../../domain/gateways/CourseGatewayInterface';

export default class FindLearnCourseUseCase {
    constructor(private courseGateway: CourseGatewayInterface) {}

    async execute(input: Input): Promise<Output> {
        const course = await this.courseGateway.find(input);

        const { termId, courseId: externalId, name, id } = course.toJSON();

        return { termId, externalId, name, id };
    }
}

type Input = string;

type Output = {
    id: string;
    externalId: string;
    name: string;
    termId?: string;
};
