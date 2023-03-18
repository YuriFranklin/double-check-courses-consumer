import { Controller } from '@nestjs/common';
import {
    Ctx,
    KafkaContext,
    MessagePattern,
    Payload,
} from '@nestjs/microservices';
import FindLearnCourseUseCase from '../@core/application/usecases/FindLearnCourseUseCase';
import { CourseService } from './course.service';
import { ProcessCourseMessageDto } from './dto/process-course-message-dto';

@Controller()
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private findLearnCourseUseCase: FindLearnCourseUseCase,
    ) {}

    @MessagePattern('double-check')
    async consumer(
        @Payload() message: ProcessCourseMessageDto,
        @Ctx() context: KafkaContext,
    ) {
        const hearbeat = context.getHeartbeat();

        const learnCourse = await this.findLearnCourseUseCase.execute(
            message.courseId,
        );

        await hearbeat();

        console.log(learnCourse);
    }
}
