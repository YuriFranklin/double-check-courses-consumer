import Course, { CreateCourseParams } from '../../../../domain/entities/Course';

export default class CoursePuppeteerMapper {
    public static toDomainEntity(input: CreateCourseParams) {
        return Course.create({
            ...input,
        });
    }
}
