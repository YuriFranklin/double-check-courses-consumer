import Course from '../../../../domain/entities/Course';
import CourseSchema from '../entities/Course';
import CourseGatewayInterface from '../../../../domain/gateways/CourseGatewayInterface';
import { DataSource, Repository } from 'typeorm';
import NotFoundException from '../../../../domain/exceptions/NotFoundException';
import CourseTypeORMMapper from '../mappers/CourseTypeORMMapper';

export default class CourseGatewayTypeORM implements CourseGatewayInterface {
    private ormRepository: Repository<CourseSchema>;

    constructor(private dataSource: DataSource) {
        this.ormRepository = this.dataSource.getRepository(CourseSchema);
    }

    insert(course: Course): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async find(
        id: string,
        fetchContents?: boolean | undefined,
    ): Promise<Course> {
        const ormCourse = await this.ormRepository.findOne({
            where: { id },
            relations: ['errors'],
        });

        if (!ormCourse) throw new NotFoundException('Course has not founded.');

        return CourseTypeORMMapper.toDomainEntity(ormCourse);
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async update(id: string, course: Course): Promise<void> {
        const ormCourse = CourseTypeORMMapper.toORMEntity(course);

        await this.ormRepository.save(ormCourse);
    }
}
