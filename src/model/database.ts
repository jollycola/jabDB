import { Table, Meta } from ".";

export class Database {

    meta: Meta;
    tables: Map<string, Table>;


    public static isDatabase(object: any): object is Database {
        return (
            'meta' in object && 
            'tables' in object);
    }
}