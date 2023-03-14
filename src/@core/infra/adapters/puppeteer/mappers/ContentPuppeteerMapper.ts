import Content from '../../../../domain/entities/Content';

export default class ContentPuppeteerMapper {
    public static toDomainEntity(input: ContentProps) {
        return Content.create(input);
    }
}

export type ContentProps = {
    id: string;
    name: string;
    description?: string;
    beforeId?: string;
    disponibility: boolean;
    type: string;
    hasChildren: boolean;
    parentId?: string;
    children?: ContentProps[];
};
