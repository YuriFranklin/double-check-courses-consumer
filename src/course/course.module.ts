import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import StructureSchema from '../@core/infra/db/typeorm/entities/Structure';
import CourseSchema from '../@core/infra/db/typeorm/entities/Course';
import { TypeOrmModule } from '@nestjs/typeorm';
import StructureGatewayTypeORM from '../@core/infra/db/typeorm/gateways/StructureGatewayTypeORM';
import CompareCourseWithStructureUseCase from '../@core/application/usecases/CompareCourseWithStructureUseCase';
import StructureGatewayInterface from '../@core/domain/gateways/StructureGatewayInterface';
import CourseGatewayInterface from '../@core/domain/gateways/CourseGatewayInterface';
import CourseGatewayTypeORM from '../@core/infra/db/typeorm/gateways/CourseGatewayTypeORM';
import FindLearnCourseUseCase from '../@core/application/usecases/FindLearnCourseUseCase';
import CoursePuppeteerGateway from '../@core/infra/adapters/puppeteer/gateways/CoursePuppeteerGateway';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm/dist';
import FindCourseUseCase from '../@core/application/usecases/FindCourseUseCase';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([StructureSchema, CourseSchema]),
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        requestTimeout: 30000,
                        brokers: [
                            `${process.env.KAFKA_HOSTNAME}:${process.env.KAFKA_PORT}`,
                        ],
                    },
                },
            },
        ]),
    ],
    controllers: [CourseController],
    providers: [
        CourseService,
        {
            provide: StructureGatewayTypeORM,
            useFactory: (dataSource: DataSource) =>
                new StructureGatewayTypeORM(dataSource),
            inject: [getDataSourceToken()],
        },
        {
            provide: CourseGatewayTypeORM,
            useFactory: (dataSource: DataSource) =>
                new CourseGatewayTypeORM(dataSource),
            inject: [getDataSourceToken()],
        },
        {
            provide: CoursePuppeteerGateway,
            useClass: CoursePuppeteerGateway,
        },
        {
            provide: CompareCourseWithStructureUseCase,
            useFactory: (
                structureGateway: StructureGatewayInterface,
                courseGateway: CourseGatewayInterface,
            ) =>
                new CompareCourseWithStructureUseCase(
                    structureGateway,
                    courseGateway,
                ),
            inject: [StructureGatewayTypeORM, CourseGatewayTypeORM],
        },
        {
            provide: FindCourseUseCase,
            useFactory: (courseGateway: CourseGatewayInterface) =>
                new FindCourseUseCase(courseGateway),
            inject: [CourseGatewayTypeORM],
        },
        {
            provide: FindLearnCourseUseCase,
            useFactory: (courseGateway: CoursePuppeteerGateway) =>
                new FindLearnCourseUseCase(courseGateway),
            inject: [CoursePuppeteerGateway],
        },
        {
            provide: 'KAFKA_PRODUCER',
            useFactory: async (kafkaService: ClientKafka) => {
                return kafkaService.connect();
            },
            inject: ['KAFKA_SERVICE'],
        },
    ],
})
export class CourseModule {}
