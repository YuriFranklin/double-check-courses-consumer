import Course from '../../../../domain/entities/Course';
import CourseGatewayInterface from '../../../../domain/gateways/CourseGatewayInterface';

export default class CourseGatewayTypeORM implements CourseGatewayInterface {
    insert(course: Course): Promise<void> {
        throw new Error('Method not implemented.');
    }
    find(id: string, fetchContents?: boolean | undefined): Promise<Course> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    update(id: string, course: Course): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
