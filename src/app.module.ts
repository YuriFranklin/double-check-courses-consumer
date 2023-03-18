import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import ErrorSchema from './@core/infra/db/typeorm/entities/Error';
import CourseSchema from './@core/infra/db/typeorm/entities/Course';
import DoubleCheckSchema from './@core/infra/db/typeorm/entities/DoubleCheck';
import StructureSchema from './@core/infra/db/typeorm/entities/Structure';
import TemplateSchema from './@core/infra/db/typeorm/entities/Template';

@Module({
    imports: [
        ConfigModule.forRoot({
            //ignoreEnvFile: true,
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.PG_HOSTNAME,
            username: process.env.PG_USER_NAME,
            password: process.env.PG_PASSWORD,
            port: Number(process.env.PG_PORT),
            database: 'double_check',
            synchronize: true,
            logging: false,
            entities: [
                ErrorSchema,
                CourseSchema,
                DoubleCheckSchema,
                StructureSchema,
                TemplateSchema,
            ],
        }),
        CourseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
