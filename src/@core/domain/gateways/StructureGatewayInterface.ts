import Structure from '../entities/Structure';

export default interface StructureGatewayInterface {
    insert(structure: Structure): Promise<void>;
    findAll(): Promise<Structure[]>;
    find(id: string): Promise<Structure>;
    delete(id: string): Promise<void>;
    update(id: string, structure: Structure): Promise<void>;
}
