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
        const { courseId, name: courseName } = course.toJSON();

        return [
            ...this.generateWhitespacedContentsErrors(
                course.contents,
                courseId,
            ),
            ...this.generateXorContentsErrors(
                courseId,
                courseName,
                structure.templates,
                course.contents,
            ),
            ...this.compareTemplates({
                contents: course.contents,
                courseId,
                courseName,
                templates: structure.templates,
            }),
            ...this.compareContentsAndAttributes({
                contents: course.contents,
                courseId,
                courseName,
                templates: structure.templates,
            }),
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
            .map((template) => {
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

    private compareTemplates({
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
    }): Error[] {
        const {
            message,
            name,
            severity,
            type,
            id: errorId,
        } = ErrorDictionary['TEMPLATE_NOT_FOUND'];

        const errors: Error[] = [];

        templates.forEach((template) => {
            const {
                id: itemId,
                type: itemType,
                isOptional,
                name: itemName,
            } = template.toJSON();

            const children = template.children;

            const beforeTemplates = this.getBeforeTemplates(
                template,
                templates,
            );

            const findedContent = contents.find((content, index) =>
                this.isTemplateEqualsOfContent({
                    content,
                    template,
                    beforeTemplates,
                    beforeContent: contents.at(index - 1),
                    parentContent,
                    parentTemplate,
                    courseName,
                }),
            );

            if (!findedContent && !isOptional)
                return errors.push(
                    Error.create({
                        errorId,
                        courseId,
                        itemName,
                        itemType,
                        message,
                        name,
                        severity,
                        type,
                        itemId,
                    }),
                );

            if (findedContent && children.length)
                this.compareTemplates({
                    contents: findedContent.children,
                    templates: children,
                    parentContent: findedContent,
                    parentTemplate: template,
                    courseName: courseName,
                    courseId,
                }).forEach((error) => errors.push(error));
        });

        return errors;
    }

    private getBeforeTemplates(
        template: Template,
        templates: Template[],
    ): Template[] {
        const { beforeAlt, beforeId, xor, id } = template.toJSON();

        return templates.filter((templateFilter) => {
            const temp = templateFilter.toJSON();
            if (temp.id === beforeId) return temp;

            const findedAlternativeId = beforeAlt.find(
                (altId) => altId === temp.id,
            );

            if (findedAlternativeId) return temp;

            const findedByXorId = xor.find(
                (xorId) => xorId === temp.id && xorId !== id,
            );

            if (findedByXorId) return temp;
        });
    }

    private compareContentsAndAttributes({
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
    }): Error[] {
        const {
            message,
            name,
            severity,
            type,
            id: errorId,
        } = ErrorDictionary['CONTENT_NOT_FOUNDED_IN_STRUCTURE'];

        const errors: Error[] = [];

        contents.forEach((content, index) => {
            const {
                id: itemId,
                name: itemName,
                type: itemType,
            } = content.toJSON();

            const { children } = content;

            const findedTemplate = templates.find((template, index) =>
                this.isTemplateEqualsOfContent({
                    content,
                    template,
                    beforeTemplates: this.getBeforeTemplates(
                        template,
                        template.children,
                    ),
                    beforeContent: contents.at(index - 1),
                    parentContent,
                    parentTemplate,
                    courseName,
                }),
            );

            if (!findedTemplate) {
                children.length &&
                    errors.push(
                        Error.create({
                            errorId:
                                ErrorDictionary['CONTENT_WITH_CHILDREN'].id,
                            courseId,
                            itemName,
                            itemType,
                            message:
                                ErrorDictionary['CONTENT_WITH_CHILDREN']
                                    .message,
                            name: ErrorDictionary['CONTENT_WITH_CHILDREN'].name,
                            severity:
                                ErrorDictionary['CONTENT_WITH_CHILDREN']
                                    .severity,
                            type: ErrorDictionary['CONTENT_WITH_CHILDREN'].type,
                            itemId,
                        }),
                    );

                return errors.push(
                    Error.create({
                        errorId,
                        courseId,
                        itemName,
                        itemType,
                        message,
                        name,
                        severity,
                        type,
                        itemId,
                    }),
                );
            }

            this.compareAttributes({
                content,
                template: findedTemplate,
                courseId,
            }).forEach((error) => errors.push(error));

            if (children.length)
                this.compareContentsAndAttributes({
                    contents: children,
                    templates: findedTemplate.children,
                    parentContent: content,
                    parentTemplate: findedTemplate,
                    courseName,
                    courseId,
                }).forEach((error) => errors.push(error));
        });

        return errors;
    }

    private compareAttributes({
        content,
        template,
        courseId,
    }: {
        content: Content;
        template: Template;
        courseId: string;
    }): Error[] {
        const errors: Error[] = [];

        const {
            name: contentName,
            id: contentId,
            description: contentDescription,
            hasChildren: contentHasChildren,
            disponibility: contentDisponibility,
            type: contentType,
        } = content.toJSON();

        const {
            description: templateDescription,
            hasChildren: templateHasChildren,
            disponibility: templateDisponibility,
            type: templateType,
            descriptionAlt: templateDescriptionAlt,
        } = template.toJSON();

        if (
            contentDescription !== templateDescription ||
            contentDescription !== templateDescriptionAlt
        )
            errors.push(
                Error.create({
                    errorId: ErrorDictionary['WRONG_DESCRIPTION'].id,
                    courseId,
                    itemName: contentName,
                    itemType: contentType,
                    message: ErrorDictionary['WRONG_DESCRIPTION'].message,
                    name: ErrorDictionary['WRONG_DESCRIPTION'].name,
                    severity: ErrorDictionary['WRONG_DESCRIPTION'].severity,
                    type: ErrorDictionary['WRONG_DESCRIPTION'].type,
                    itemId: contentId,
                }),
            );

        if (templateHasChildren === true && contentHasChildren === false)
            errors.push(
                Error.create({
                    errorId: ErrorDictionary['CONTENT_WITH_CHILDREN'].id,
                    courseId,
                    itemName: contentName,
                    itemType: contentType,
                    message: ErrorDictionary['CONTENT_WITH_CHILDREN'].message,
                    name: ErrorDictionary['CONTENT_WITH_CHILDREN'].name,
                    severity: ErrorDictionary['CONTENT_WITH_CHILDREN'].severity,
                    type: ErrorDictionary['CONTENT_WITH_CHILDREN'].type,
                    itemId: contentId,
                }),
            );

        if (templateDisponibility === true && contentDisponibility === false)
            errors.push(
                Error.create({
                    errorId: ErrorDictionary['CONTENT_ISNOT_VISIBLE'].id,
                    courseId,
                    itemName: contentName,
                    itemType: contentType,
                    message: ErrorDictionary['CONTENT_ISNOT_VISIBLE'].message,
                    name: ErrorDictionary['CONTENT_ISNOT_VISIBLE'].name,
                    severity: ErrorDictionary['CONTENT_ISNOT_VISIBLE'].severity,
                    type: ErrorDictionary['CONTENT_ISNOT_VISIBLE'].type,
                    itemId: contentId,
                }),
            );

        if (templateDisponibility === false && contentDisponibility === true)
            errors.push(
                Error.create({
                    errorId: ErrorDictionary['CONTENT_IS_VISIBLE'].id,
                    courseId,
                    itemName: contentName,
                    itemType: contentType,
                    message: ErrorDictionary['CONTENT_IS_VISIBLE'].message,
                    name: ErrorDictionary['CONTENT_IS_VISIBLE'].name,
                    severity: ErrorDictionary['CONTENT_IS_VISIBLE'].severity,
                    type: ErrorDictionary['CONTENT_IS_VISIBLE'].type,
                    itemId: contentId,
                }),
            );

        if (templateType !== contentType)
            errors.push(
                Error.create({
                    errorId: ErrorDictionary['CONTENT_TYPE_IS_DIFFERENT'].id,
                    courseId,
                    itemName: contentName,
                    itemType: contentType,
                    message:
                        ErrorDictionary['CONTENT_TYPE_IS_DIFFERENT'].message,
                    name: ErrorDictionary['CONTENT_TYPE_IS_DIFFERENT'].name,
                    severity:
                        ErrorDictionary['CONTENT_TYPE_IS_DIFFERENT'].severity,
                    type: ErrorDictionary['CONTENT_TYPE_IS_DIFFERENT'].type,
                    itemId: contentId,
                }),
            );

        return errors;
    }
}
