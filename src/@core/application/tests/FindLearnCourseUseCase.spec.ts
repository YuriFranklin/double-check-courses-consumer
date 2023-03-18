import CoursePuppeteerGateway from '../../infra/adapters/puppeteer/gateways/CoursePuppeteerGateway';
import FindLearnCourseUseCase from '../usecases/FindLearnCourseUseCase';

describe('FindLearnCourseUseCase Tests', () => {
    const courseGateway = new CoursePuppeteerGateway();

    it('Should find course on learn', async () => {
        const findLearncourseUseCase = new FindLearnCourseUseCase(
            courseGateway,
        );

        const course = await findLearncourseUseCase.execute('TESTE_YURI');

        expect(course).toStrictEqual({
            termId: expect.any(String),
            externalId: expect.any(String),
            name: expect.any(String),
            id: expect.any(String),
        });
    }, 60000);

    afterAll(async () => {
        courseGateway && (await courseGateway.closeBrowser());
    });
});
