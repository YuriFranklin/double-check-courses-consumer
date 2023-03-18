import Course from '../../../../domain/entities/Course';
import CoursePuppeteerGateway from '../gateways/CoursePuppeteerGateway';

describe('CoursePuppeteerGateway', () => {
    let gateway: CoursePuppeteerGateway;

    beforeAll(() => {
        gateway = new CoursePuppeteerGateway();
    });
    it('Should find async course', async () => {
        const course = await gateway.find('TESTE_YURI');

        expect(course).toBeInstanceOf(Course);
    }, 30000);

    it('Should find an course and get contents', async () => {
        const course = await gateway.find('TESTE_YURI', true);

        expect(course).toBeInstanceOf(Course);

        expect(course.toJSON().contents).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                }),
            ]),
        );
    }, 30000);

    afterAll(async () => {
        gateway && (await gateway.closeBrowser());
    });
});
