import { Table } from "../model";

export default abstract class Adapter {

    /**
     * Connect to the database source
     */
    abstract connect(): Promise<void>;

    abstract getTable(id: string): Promise<Table>;
    abstract saveTable(table: Table): Promise<void>;
    abstract deleteTable(id: string): Promise<void>;

}