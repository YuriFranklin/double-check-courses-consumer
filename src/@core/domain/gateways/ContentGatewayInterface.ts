import Content from '../entities/Content';

export default interface ContentGatewayInterface {
    findAll(courseId: string): Promise<Content[]>;
}
