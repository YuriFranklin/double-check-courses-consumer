import Structure from '../entities/Structure';
import Error from '../entities/Error';
import Content from '../entities/Content';
import Course from '../entities/Course';
import ErrorDictionary from '../constants/ErrorDictionary';
import Template from '../entities/Template';

type filterXorsReturn = {
    template: Template;
    before?: Template[];
    parent?: Template;
}[];

export default class CompareCourseService {
    public compareCourseWithStructureAndGenerateErrors(
        structure: Structure,
        course: Course,
    ): Error[] {
        const { courseId, name } = course.toJSON();

        return [
            ...this.generateWhitespacedContentsErrors(
                course.contents,
                courseId,
            ),
            ...this.generateXorContentsErrors(
                courseId,
                name,
                structure.templates,
                course.contents,
            ),
        ];
    }

    private generateWhitespacedContentsErrors(
        contents: Content[],
        courseId: string,
    ): Error[] {
        const {
            message,
            name,
            severity,
            type,
            id: errorId,
        } = ErrorDictionary['CONTENT_WITH_WHITESPACE'];

        const errors = contents
            .filter((content) => content.children?.length > 0)
            .map((content) =>
                this.generateWhitespacedContentsErrors(
                    content.children,
                    courseId,
                ),
            )
            .flat(1);

        return [
            contents
                .filter((content) => content.toJSON().name.endsWith(' '))
                .map((content) => {
                    const {
                        name: itemName,
                        type: itemType,
                        id: itemId,
                    } = content.toJSON();

                    return Error.create({
                        errorId,
                        courseId,
                        message,
                        name,
                        severity,
                        type,
                        itemName,
                        itemType,
                        itemId,
                    });
                }),
            ...errors,
        ].flat(1);
    }

    private generateXorContentsErrors(
        courseId: string,
        courseName: string,
        templates: Template[],
        contents: Content[],
    ): Error[] {
        const xors = this.filterTemplateXors(templates);

        return this.findContentXorsAndGenerateErrors({
            contents,
            xors,
            courseId,
            courseName,
        });
    }

    private filterTemplateXors(
        templates: Template[],
        parent?: Template,
    ): filterXorsReturn {
        const templateXorsRecurrence = templates
            .filter((template) => template.children.length)
            .map((template) =>
                this.filterTemplateXors(template.children, template),
            );

        const xors = templates
            .filter((template) => template.toJSON().xor?.length)
            .map((template, index) => {
                return {
                    template,
                    parent,
                    before: templates.filter(
                        (t) =>
                            t.toJSON().id === template.toJSON().beforeId ||
                            template
                                .toJSON()
                                .beforeAlt?.includes(t.toJSON().id),
                    ),
                };
            });

        return [...templateXorsRecurrence, ...xors].flat(1);
    }

    private findContentXorsAndGenerateErrors({
        xors,
        contents,
        courseName,
        courseId,
    }: {
        xors: filterXorsReturn;
        contents: Content[];
        courseName: string;
        courseId: string;
    }): Error[] {
        const {
            message,
            name,
            severity,
            type,
            id: errorId,
        } = ErrorDictionary['XOR_CONTENT'];

        const errors: Error[] = [];

        const findContentXorsAndGenerateErrorsRecurrence = contents
            .filter((content) => content.children.length)
            .map((content) =>
                this.findContentXorsAndGenerateErrors({
                    xors,
                    contents: content.children,
                    courseName,
                    courseId,
                }),
            )
            .flat(1);

        xors.forEach((xor) => {
            contents
                .filter((content, index) =>
                    this.isTemplateEqualsOfContent({
                        content,
                        template: xor.template,
                        beforeContent: contents.at(index - 1),
                        beforeTemplates: xor.before,
                        courseName: courseName,
                    }),
                )
                .forEach((content) => {
                    const {
                        name: itemName,
                        type: itemType,
                        id: itemId,
                    } = content.toJSON();

                    errors.push(
                        Error.create({
                            errorId,
                            courseId,
                            message,
                            name,
                            severity,
                            type,
                            itemName,
                            itemType,
                            itemId,
                        }),
                    );
                });
        });

        return [...errors, ...findContentXorsAndGenerateErrorsRecurrence].flat(
            1,
        );
    }

    private isTemplateEqualsOfContent({
        template,
        content,
        beforeContent,
        beforeTemplates,
        parentContent,
        parentTemplate,
        courseName,
    }: {
        template: Template;
        content: Content;
        beforeContent?: Content;
        beforeTemplates?: Template[];
        parentContent?: Content;
        parentTemplate?: Template;
        courseName: string;
    }): boolean {
        const isNameEqual = this.possibleNames(template, courseName).some(
            (name) => name === content.toJSON().name,
        );

        const beforeNameIsEquivalent =
            (template.toJSON().beforeId === '' &&
                content.toJSON().beforeId === '') ||
            !!beforeTemplates?.some((beforeTemplate) =>
                this.possibleNames(beforeTemplate, courseName).some(
                    (name) => name === beforeContent?.toJSON().name.trim(),
                ),
            );

        const haveParents = !!parentTemplate && !!parentContent;

        const notHaveParents = !parentTemplate && !parentContent;

        const parentNameIsEquivalent =
            haveParents &&
            this.possibleNames(parentTemplate, courseName).some(
                (name) => name === parentContent.toJSON().name.trim(),
            );

        return (
            isNameEqual &&
            beforeNameIsEquivalent &&
            ((haveParents && parentNameIsEquivalent) || notHaveParents)
        );
    }

    private possibleNames(template: Template, courseName: string): string[] {
        const { hasNameOfCourseInContent, name, nameAlt } = template.toJSON();

        const possibleNames: string[] = [name, nameAlt];

        if (hasNameOfCourseInContent) {
            const nameArrayString = courseName.split(/\s*-\s*/);

            nameArrayString.forEach((substring, index) => {
                let concatedName = substring;
                possibleNames.push(concatedName);
                nameArrayString.forEach((subs, i) => {
                    if (i <= index) return;
                    concatedName += ` ${subs}`;
                    possibleNames.push(concatedName);
                });
            });
        }
        return possibleNames;
    }

    private compareStructure({
        contents,
        templates,
        parentContent,
        parentTemplate,
        courseName,
        courseId,
    }: {
        contents: Content[];
        templates: Template[];
        parentContent?: Content;
        parentTemplate?: Template;
        courseName: string;
        courseId: string;
    }): Error[] {}
}
