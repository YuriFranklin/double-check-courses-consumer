import Content from 'src/@core/domain/entities/Content';
import ContentGatewayInterface from '../../../../domain/gateways/ContentGatewayInterface';
import Learn from '../Learn';

export default class ContentPuppeteerGateway
    extends Learn
    implements ContentGatewayInterface
{
    constructor() {
        super();
    }

    findAll(courseId: string): Promise<Content[]> {
        throw new Error('Method not implemented.');
    }
}
