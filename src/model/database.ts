import { Table, Meta } from ".";
import { Dictionary } from "lodash";
import _ from "lodash";

/**
 * @hidden
 */
export class Database {

    meta: Meta;
    tables: Dictionary<Table>;

    public static isDatabase(object: any): object is Database {
        return (
            'meta' in object &&
            'tables' in object);
    }
}