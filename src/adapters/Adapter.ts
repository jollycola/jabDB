import JabTable from "../JabTable";
import JabDB, { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";
import { MalformedSourceFileError } from "../errors";
import _ from "lodash"
import { Table } from "../model";

export default abstract class Adapter {

    /**
     * Connect to the database source
     */
    abstract connect(): Promise<void>;

    abstract getTable(id: string): Promise<Table>;
    abstract saveTable(table: Table): Promise<void>;

}