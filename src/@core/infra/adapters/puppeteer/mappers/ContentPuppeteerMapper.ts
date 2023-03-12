import Content from '../../../../domain/entities/Content';

export default class ContentPuppeteerMapper {
    public static toDomainEntity({
        disponibility,
        hasChildren,
        id,
        name,
        description,
        type,
        beforeId,
        parentId,
    }: ContentProps) {
        return Content.create({
            disponibility,
            hasChildren,
            id,
            name,
            description,
            type,
            beforeId,
            parentId,
        });
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
};
