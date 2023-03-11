import { Controller } from '@nestjs/common';
import {
    Ctx,
    KafkaContext,
    MessagePattern,
    Payload,
} from '@nestjs/microservices';
import { CourseService } from './course.service';
import { ProcessCourseMessageDto } from './dto/process-course-message-dto';

@Controller()
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @MessagePattern('double-check')
    async consumer(
        @Payload() message: ProcessCourseMessageDto,
        @Ctx() context: KafkaContext,
    ) {
        const hearbeat = context.getHeartbeat();
        //await hearbeat();
        console.log(message);
    }
}
