import Course from '../entities/Course';

export default interface CourseGatewayInterface {
    insert(course: Course): Promise<void>;
    find(id: string, fetchContents?: boolean): Promise<Course>;
    delete(id: string): Promise<void>;
    update(id: string, course: Course): Promise<void>;
}
