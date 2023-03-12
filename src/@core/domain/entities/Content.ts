import { z } from 'zod';

export type ContentProps = {
    id: string;
    name: string;
    description?: string;
    beforeId?: string;
    type: string;
    hasChildren: boolean;
    children?: Content[];
    parentId?: string;
    disponibility: boolean;
};

export type CreateContentParams = Omit<ContentProps, 'children'> & {
    children?: CreateContentParams[];
};

export type ContentToJSON = Omit<ContentProps, 'children'> & {
    children?: ContentToJSON[];
};

export const ContentSchema = z.lazy(() =>
    z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        beforeId: z.string().optional(),
        type: z.string(),
        hasChildren: z.boolean(),
        children: z.array(z.lazy(() => ContentSchema)).optional(),
        parentId: z.string().optional(),
        disponibility: z.boolean(),
    }),
);

export default class Content {
    private props: Required<ContentProps>;

    private constructor(props: ContentProps) {
        this.props = {
            ...props,
            description: props.description || '',
            beforeId: props.beforeId || '',
            parentId: props.parentId || '',
            children: props.children || [],
        };
    }

    public static create(props: CreateContentParams): Content {
        const validatedProps = ContentSchema.parse(props);

        return new Content({
            ...validatedProps,
            children: props.children?.map((child) => Content.create(child)),
        });
    }

    public get children(): Content[] {
        return this.props.children;
    }

    public toJSON(): ContentToJSON {
        return {
            ...this.props,
            children: this.props.children.map((children) => children.toJSON()),
        };
    }
}
