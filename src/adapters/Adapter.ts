import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";
import { MalformedSourceFileError } from "../errors";
import _ from "lodash"

export default abstract class Adapter {

    /**
     * Connect to the database source
     */
    abstract connect(): Promise<any>;

    /**
     * Read the database metadata
     * @abstract
     * @returns {Promise<JabDBMeta>}
     * @memberof Adapter
     */
    abstract readMeta(): Promise<JabDBMeta>;
    /**
     * Write the database metadata to the database source
     * @abstract
     * @param {JabDBMeta} meta The JabDBMeta object containing database metadata
     * @returns {Promise<any>}
     * @memberof Adapter
     */
    abstract writeMeta(meta: JabDBMeta): Promise<any>;
    /**
     * Read a table from the database
     * @param id The id of the table to read
     * @returns {Promise<JabTable<any>>} Promise object represents the Table
     */
    abstract readTable(id: string): Promise<JabTable<any>>;
    /**
     * Writes a table to the database source
     * @param table The table to write to the database source
     */
    abstract writeTable<T>(table: JabTable<T>): Promise<any>;

    /**
     * Converts an array of plain objects into a map of JabTable objects mapped by their id
     * @param tables The array of plain objects 
     */
    protected plainToJabTables<T>(tables: any[]): Map<string, JabTable<T>> {
        let map = new Map<string, JabTable<T>>();

        _.forEach(tables, (table: any) => {

            // Check if table has a 'name' field
            if (table.name != undefined) {

                const entries = new Map<string, JabEntry<T>>();

                // Check if table has an 'entries' field
                if (table.entries != undefined) {
                    _.forEach(table.entries, entry => {
                        // Check if entry has an id and value field
                        if (entry.id != undefined && entry.value != undefined) {
                            const newEntry = new JabEntry<T>(entry.id, entry.value);
                            _.set(entries, newEntry.getId(), newEntry);

                        } else {
                            throw new MalformedSourceFileError("[MalformedSourceFileError]: Entry missing 'id' or 'value' field")
                        }
                    });
                } else {
                    throw new MalformedSourceFileError("[MalformedSourceFileError]: Table does not contain an 'entries' field")
                }
                
                const jabTable = new JabTable<T>(table.name, entries);
                _.set(map, jabTable.name, jabTable);
            } else {
                throw new MalformedSourceFileError("Table does not contain a 'name' field")
            }
        })
        
        return map;        
    }

}