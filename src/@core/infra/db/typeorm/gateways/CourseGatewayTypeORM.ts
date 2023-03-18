import Course from '../../../../domain/entities/Course';
import CourseSchema from '../entities/Course';
import CourseGatewayInterface from '../../../../domain/gateways/CourseGatewayInterface';
import { DataSource, Repository } from 'typeorm';

export default class CourseGatewayTypeORM implements CourseGatewayInterface {
    private ormRepository: Repository<CourseSchema>;

    constructor(private dataSource: DataSource) {
        this.ormRepository = this.dataSource.getRepository(CourseSchema);
    }

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
