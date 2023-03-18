import CompareCourseWithStructureUseCase from '../usecases/CompareCourseWithStructureUseCase';
import CourseGatewayInterface from '../../domain/gateways/CourseGatewayInterface';
import StructureGatewayInterface from '../../domain/gateways/StructureGatewayInterface';
import CourseMemoryGateway from '../../infra/db/memory/gateways/CourseMemoryGateway';
import StructureMemoryGateway from '../../infra/db/memory/gateways/StructureMemoryGateway';
import Structure from '../../domain/entities/Structure';
import Course from '../../domain/entities/Course';

describe('CompareCourseWithStructureUseCase Tests', () => {
    const courseGateway: CourseGatewayInterface = new CourseMemoryGateway();
    const structureGateway: StructureGatewayInterface =
        new StructureMemoryGateway();

    beforeAll(async () => {
        const course = Course.create({
            id: '123',
            courseId: '123',
            name: 'Course Test',
            contents: [
                {
                    id: '1',
                    name: 'New Content',
                    description: 'Its a new content',
                    disponibility: true,
                    type: 'document',
                    hasChildren: true,
                    children: [
                        {
                            id: '2',
                            name: 'New Content 2 ',
                            description: 'Its a new content',
                            disponibility: true,
                            type: 'document',
                            hasChildren: false,
                            parentId: '1',
                        },
                    ],
                },
                {
                    id: '3',
                    name: 'New Content 3',
                    description: 'Its a new content',
                    disponibility: true,
                    type: 'document',
                    beforeId: '1',
                    hasChildren: false,
                },
                {
                    id: '4',
                    name: 'New Content 4',
                    description: 'Its a new content',
                    disponibility: true,
                    type: 'document',
                    beforeId: '3',
                    parentId: '',
                    hasChildren: false,
                },
                {
                    id: '77',
                    name: 'New Content 67',
                    description: 'Its a new content',
                    disponibility: true,
                    type: 'document',
                    beforeId: '4',
                    parentId: '',
                    hasChildren: false,
                },
            ],
        });

        await courseGateway.insert(course);

        const structure = Structure.create({
            id: '123',
            name: 'Test Structure',
            templates: [
                {
                    id: '2',
                    name: 'New Content',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '',
                    beforeAlt: [],
                    xor: ['2', '4', '5'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    hasChildren: true,
                    parentId: '',
                    children: [
                        {
                            id: '3',
                            name: 'New Content 2 ',
                            nameAlt: '',
                            description: '',
                            descriptionAlt: '',
                            isOptional: false,
                            warnIfNotFound: true,
                            beforeId: '',
                            beforeAlt: [],
                            xor: [],
                            hasNameOfCourseInContent: false,
                            disponibility: true,
                            type: 'document',
                            hasChildren: false,
                            children: [],
                            parentId: '2',
                        },
                    ],
                },
                {
                    id: '4',
                    name: 'New Content 3',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '',
                    beforeAlt: ['2'],
                    xor: ['2', '4', '5'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    hasChildren: false,
                    children: [],
                    parentId: '',
                },
                {
                    id: '5',
                    name: 'New Content 4',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '',
                    beforeAlt: ['2', '4'],
                    xor: ['2', '4', '5'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    hasChildren: false,
                    parentId: '',
                    children: [
                        {
                            id: '7',
                            name: 'New Content 6',
                            nameAlt: '',
                            description: '',
                            descriptionAlt: '',
                            isOptional: false,
                            warnIfNotFound: true,
                            beforeId: '',
                            beforeAlt: [],
                            xor: ['6', '7', '8'],
                            hasNameOfCourseInContent: false,
                            disponibility: true,
                            type: 'document',
                            children: [],
                            hasChildren: false,
                            parentId: '',
                        },
                    ],
                },
                {
                    id: '6',
                    name: 'New Content 5',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '2',
                    beforeAlt: ['4', '5'],
                    xor: ['6', '7', '8', '9'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    children: [],
                    hasChildren: false,
                    parentId: '',
                },
                {
                    id: '8',
                    name: 'New Content 7',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '2',
                    beforeAlt: ['4', '5'],
                    xor: ['6', '7', '8', '9'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    children: [],
                    hasChildren: false,
                    parentId: '',
                },
                {
                    id: '9',
                    name: 'New Content 8',
                    nameAlt: '',
                    description: '',
                    descriptionAlt: '',
                    isOptional: false,
                    warnIfNotFound: true,
                    beforeId: '2',
                    beforeAlt: ['4', '5'],
                    xor: ['6', '7', '8', '9'],
                    hasNameOfCourseInContent: false,
                    disponibility: true,
                    type: 'document',
                    hasChildren: false,
                    parentId: '',
                    children: [
                        {
                            id: '10',
                            name: 'New Content 9',
                            nameAlt: '',
                            description: '',
                            descriptionAlt: '',
                            isOptional: false,
                            warnIfNotFound: true,
                            beforeId: '',
                            beforeAlt: [],
                            xor: [],
                            hasNameOfCourseInContent: false,
                            disponibility: true,
                            type: 'document',
                            children: [],
                            hasChildren: false,
                            parentId: '9',
                        },
                    ],
                },
            ],
        });

        await structureGateway.insert(structure);
    });

    it('Should compare course with structure, generate errors and update the course', async () => {
        const courseId = '123';
        const structureId = '123';

        const course = (await courseGateway.find(courseId)).toJSON();

        const compareUsecase = new CompareCourseWithStructureUseCase(
            structureGateway,
            courseGateway,
        );

        const output = await compareUsecase.execute({
            course: {
                ...course,
                createdAt: new Date(course.createdAt),
                editedAt: new Date(course.editedAt),
            },
            structureId,
        });

        expect(output).toEqual(
            expect.objectContaining({
                checked: expect.any(Boolean),
                doubleCheckId: expect.any(String),
                createdAt: expect.any(String),
                editedAt: expect.any(String),
                errors: expect.any(Array),
            }),
        );
    });
});
