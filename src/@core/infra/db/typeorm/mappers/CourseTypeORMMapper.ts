import CourseSchema from '../entities/Course';
import Course from '../../../../domain/entities/Course';
import DoubleCheckSchema from '../entities/DoubleCheck';
import ErrorTypeORMMapper from './ErrorTypeORMMapper';

export default class CourseTypeORMMapper {
    public static toORMEntity(
        course: Course,
        doubleCheck?: DoubleCheckSchema,
    ): CourseSchema {
        const { checked, createdAt, editedAt, errors, id, name, courseId } =
            course.props;

        const courseSchema = new CourseSchema();

        courseSchema.id = id;
        courseSchema.courseId = courseId;
        courseSchema.checked = checked;
        courseSchema.createdAt = createdAt;
        editedAt && (courseSchema.editedAt = editedAt);
        name && (courseSchema.name = name);
        doubleCheck && (courseSchema.doubleCheck = doubleCheck);
        courseSchema.errors = errors.map((error) =>
            ErrorTypeORMMapper.toOrmEntity(error, courseSchema),
        );
        return courseSchema;
    }

    public static toDomainEntity(
        course: CourseSchema,
        doubleCheckId?: string,
    ): Course {
        return Course.create({
            ...course,
            doubleCheckId: doubleCheckId || course.doubleCheck?.id,
            errors: course.errors?.map((err) => {
                return {
                    ...ErrorTypeORMMapper.toJSON(err),
                    courseId: course.id,
                };
            }),
        });
    }

    public static toJSON(course: CourseSchema, doubleCheckId?: string) {
        return {
            ...course,
            doubleCheckId: doubleCheckId || course.doubleCheck?.id,
            errors: course.errors.map((error) =>
                ErrorTypeORMMapper.toJSON(error),
            ),
        };
    }
}
