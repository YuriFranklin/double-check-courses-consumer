import Error, { errorSchema } from './Error';
import crypto from 'crypto';
import * as z from 'zod';
import Content, { ContentSchema, CreateContentParams } from './Content';

export const courseSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    errors: z
        .array(errorSchema)
        .optional()
        .transform((errors) => errors?.map((error) => Error.create(error))),
    contents: z
        .array(ContentSchema)
        .optional()
        .transform((contents) =>
            contents?.map((content) => Content.create(content)),
        ),
    createdAt: z.date().optional(),
    editedAt: z.date().optional(),
    courseId: z.string(),
    doubleCheckId: z.string().optional(),
    checked: z.boolean().optional(),
});

export type CourseProps = {
    id?: string;
    name?: string;
    errors?: Error[];
    contents?: Content[];
    createdAt?: Date;
    editedAt?: Date;
    courseId: string;
    doubleCheckId?: string;
    checked?: boolean;
};

export type CreateCourseParams = Omit<CourseProps, 'contents'> & {
    contents?: CreateContentParams[];
};

export default class Course {
    public props: Required<CourseProps>;
    private constructor(props: CourseProps) {
        this.props = {
            ...props,
            id: props.id || crypto.randomUUID(),
            name: props.name || '',
            contents: props.contents || [],
            errors: props.errors || [],
            checked: props.checked || false,
            doubleCheckId: props.doubleCheckId || '',
            createdAt: props.createdAt ? new Date(props.createdAt) : new Date(),
            editedAt: props.editedAt ? new Date(props.editedAt) : new Date(),
        };
    }

    public get contents(): Content[] {
        return this.props.contents;
    }

    public setErrors(errors: Error[]) {
        this.props.errors = errors;
    }

    static create(props: CreateCourseParams) {
        const validatedProps = courseSchema.parse(props);
        return new Course(validatedProps);
    }

    public toJSON() {
        return {
            ...this.props,
            createdAt: this.props.createdAt.toISOString(),
            editedAt: this.props.createdAt.toISOString(),
            errors: this.props.errors.map((error) => error.toJSON()) || [],
        };
    }
}
