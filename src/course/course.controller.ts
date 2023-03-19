import { Controller, Inject } from '@nestjs/common';
import {
    Ctx,
    KafkaContext,
    MessagePattern,
    Payload,
} from '@nestjs/microservices';
import FindCourseUseCase from '../@core/application/usecases/FindCourseUseCase';
import CompareCourseWithStructureUseCase from '../@core/application/usecases/CompareCourseWithStructureUseCase';
import FindLearnCourseUseCase from '../@core/application/usecases/FindLearnCourseUseCase';
import { CourseService } from './course.service';
import { ProcessCourseMessageDto } from './dto/process-course-message-dto';
import { Producer } from 'kafkajs';

@Controller()
export class CourseController {
    constructor(
        @Inject('KAFKA_PRODUCER') private kafkaProducer: Producer,
        private readonly courseService: CourseService,
        private findLearnCourseUseCase: FindLearnCourseUseCase,
        private findCourseUseCase: FindCourseUseCase,
        private compareCourseWithStructureUseCase: CompareCourseWithStructureUseCase,
    ) {}

    @MessagePattern('double-check-course')
    async consumer(
        @Payload() message: ProcessCourseMessageDto,
        @Ctx() context: KafkaContext,
    ) {
        const hearbeat = context.getHeartbeat();

        const learnCourse = await this.findLearnCourseUseCase.execute({
            courseId: message.courseId,
            fetchContent: true,
        });

        await hearbeat();

        const course = await this.findCourseUseCase.execute(message.id);

        const comparedCourse =
            await this.compareCourseWithStructureUseCase.execute({
                course: {
                    ...course,
                    createdAt: new Date(course.createdAt),
                    editedAt: new Date(course.editedAt),
                    contents: learnCourse.contents,
                },
                structureId: message.structureId,
            });

        await hearbeat();

        console.log(comparedCourse);

        await this.kafkaProducer.send({
            topic: 'double-check-course-processed',
            messages: [
                {
                    key: 'double-check-course-processed',
                    value: JSON.stringify({
                        ...comparedCourse,
                        structureId: message.structureId,
                        doubleCheckId: message.doubleCheckId,
                    }),
                },
            ],
        });
    }
}
