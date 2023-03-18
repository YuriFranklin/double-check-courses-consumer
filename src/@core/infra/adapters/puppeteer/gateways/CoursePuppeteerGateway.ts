/* eslint-disable @typescript-eslint/no-unused-vars */
import Content from '../../../../domain/entities/Content';
import Course from '../../../../domain/entities/Course';
import CourseGatewayInterface from '../../../../domain/gateways/CourseGatewayInterface';
import Learn from '../Learn';
import { Promise as Bluebird } from 'bluebird';
import Puppeteer from '../PuppeteerAdapter';
import ContentPuppeteerMapper from '../mappers/ContentPuppeteerMapper';
import CoursePuppeteerMapper from '../mappers/CoursePuppeteerMapper';

export default class CoursePuppeteerGateway
    extends Learn
    implements CourseGatewayInterface
{
    constructor() {
        super();
    }

    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    update(id: string, course: Course): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async getContents(externalId: string): Promise<Content[]> {
        try {
            const page = await this.openPage();

            await page.goto(
                `${process.env.LEARN_BASE_URL}/learn/api/public/v3/courses/?externalId=${externalId}`,
                { waitUntil: 'networkidle0' },
            );

            const result: CourseFindResult = await page.evaluate(() => {
                return JSON.parse(
                    String(document.querySelector('body')?.innerText),
                );
            });

            const course = result.results.find(
                (course) => course.externalId === externalId,
            );

            await this.closePage(page);
            if (!course) throw 'Course not found';
            const content = await this.getContentsRecurrence({
                courseId: course.id,
            });

            return content;
        } catch (error) {
            throw error;
        }
    }

    public async find(
        courseExternalId: string,
        fetchContents?: boolean,
    ): Promise<Course> {
        try {
            const page = await this.openPage();

            await page.goto(
                `${process.env.LEARN_BASE_URL}/learn/api/public/v3/courses/?externalId=${courseExternalId}`,
                { waitUntil: 'networkidle0' },
            );

            const result: CourseFindResult = await page.evaluate(() => {
                return JSON.parse(
                    String(document.querySelector('body')?.innerText),
                );
            });

            const course = result.results.find(
                (course) => course.externalId === courseExternalId,
            );

            await this.closePage(page);

            if (!course) throw 'Course not found';

            const { externalId, id, name, termId } = course;

            const contents = fetchContents
                ? await this.getContentsRecurrence({
                      courseId: id,
                  })
                : [];

            return CoursePuppeteerMapper.toDomainEntity({
                termId,
                courseId: externalId,
                id,
                name,
                contents: contents.map((content) => content.toJSON()),
            });
        } catch (error) {
            throw error;
        }
    }

    public async insert(course: Course): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async getContentsRecurrence({
        courseId,
        parentId,
    }: {
        courseId: string;
        parentId?: string;
    }): Promise<Content[]> {
        const url = !parentId
            ? `${process.env.LEARN_BASE_URL}/learn/api/public/v1/courses/${courseId}/contents`
            : `${process.env.LEARN_BASE_URL}/learn/api/public/v1/courses/${courseId}/contents/${parentId}/children`;
        try {
            const page = await this.openPage();

            await page.goto(url, { waitUntil: 'networkidle2' });

            const result: ContentResult = await page.evaluate(() => {
                return JSON.parse(
                    String(document.querySelector('body')?.innerText),
                );
            });

            await this.closePage(page);

            if (!result.results?.length) return [];

            const contentPromises = result.results.map(async (contentLearn) => {
                const {
                    description,
                    availability,
                    contentHandler,
                    created,
                    id,
                    modified,
                    position,
                    title,
                } = contentLearn;

                const beforeId =
                    position > 0 ? result.results[position - 1].id : undefined;

                const disponibility =
                    availability.available === 'Yes' ? true : false;

                const type = this.typeContent(contentLearn.contentHandler);

                if (type !== 'folder')
                    return ContentPuppeteerMapper.toDomainEntity({
                        id,
                        name: title,
                        parentId,
                        description,
                        beforeId,
                        disponibility,
                        type,
                        hasChildren: false,
                    });

                const children =
                    (await this.getContentsRecurrence({
                        courseId,
                        parentId: contentLearn.id,
                    })) || [];

                const content = ContentPuppeteerMapper.toDomainEntity({
                    id,
                    name: title,
                    parentId,
                    description,
                    beforeId,
                    disponibility,
                    type,
                    hasChildren: children.length ? true : false,
                    children: children.map((content) => content.toJSON()),
                });

                return content;
            });

            const content = await Bluebird.map(
                contentPromises,
                (contentPromise) => contentPromise,
                { concurrency: Puppeteer.limitTabs },
            );

            return content;
        } catch (error) {
            throw error;
        }
    }

    private typeContent(contentHandler: { id: string; isBbPage?: boolean }) {
        switch (contentHandler.id) {
            case 'resource/x-bb-folder':
                switch (contentHandler.isBbPage) {
                    case true:
                        return 'document';
                    default:
                        return 'folder';
                }
            case 'resource/x-bb-courselink':
                return 'discussion';
            case 'resource/x-bb-externallink':
                return 'link';
            case 'resource/x-bb-blti-link':
                return 'lti';
            case 'resource/x-bb-asmt-test-link':
                return 'test';
            default:
                return 'undefined';
        }
    }
}

type CourseFindResult = {
    results: [
        {
            id: string;
            externalId: string;
            name: string;
            termId?: string;
        },
    ];
};

type ContentResult = {
    results: ContentLearn[];
};

type ContentLearn = {
    id: string;
    description?: string;
    parentId: string;
    title: string;
    created: Date;
    modified: Date;
    position: number;
    availability: {
        available: 'Yes' | 'No';
        allowGuests: boolean;
        allowObservers: boolean;
    };
    contentHandler: {
        id: string;
        isBbPage?: boolean;
    };
};
