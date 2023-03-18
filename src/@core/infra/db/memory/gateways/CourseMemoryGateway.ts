import Course from '../../../../domain/entities/Course';
import CourseGatewayInterface from '../../../../domain/gateways/CourseGatewayInterface';
import NotFoundException from '../../../../domain/exceptions/NotFoundException';

export default class CourseMemoryGateway implements CourseGatewayInterface {
    private courses: Course[] = [];

    async insert(course: Course): Promise<void> {
        this.courses.push(course);
    }

    async find(
        id: string,
        fetchContents?: boolean | undefined,
    ): Promise<Course> {
        const finded = this.courses.find((course) => course.toJSON().id === id);

        if (!finded) throw new NotFoundException('Item not finded.');

        return finded;
    }

    async delete(id: string): Promise<void> {
        const index = this.courses.findIndex(
            (course) => course.toJSON().id === id,
        );
        if (!index) throw new Error('Item not founded.');

        this.courses.splice(index, 1);
    }

    async update(id: string, course: Course): Promise<void> {
        const index = this.courses.findIndex(
            (course) => course.toJSON().id === id,
        );

        if (index === undefined) throw new Error('Item not founded.');

        this.courses[index] = course;
    }
}
