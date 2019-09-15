import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";

export default abstract class Adapter {

    abstract readMeta(): Promise<JabDBMeta>;
    abstract readTable(id: string): Promise<JabTable<any>>;
    abstract write(): void;

    protected plainToJabTables<T>(tables: any[]): Map<string, JabTable<T>> {
        let map = new Map<string, JabTable<T>>();

        tables.forEach((table: any) => {

            // Check if table has a 'name' field
            if (table.name != undefined) {

                const entries = new Map<string, JabEntry<T>>();

                // Check if table has an 'entries' field
                if (table.entries != undefined) {
                    table.entries.forEach((entry: any) => {
                        // Check if entry has an id and value field
                        if (entry.id != undefined && entry.value != undefined) {
                            const newEntry = new JabEntry<T>(entry.id, entry.value);
                            entries.set(newEntry.getId(), newEntry);

                        } else {
                            throw new Error("[MalformedSourceFileError]: Entry missing 'id' or 'value' field")
                        }
                    });
                } else {
                    throw new Error("[MalformedSourceFileError]: Table does not contain an 'entries' field")
                }
                
                const jabTable = new JabTable<T>(table.name, entries);
                map.set(jabTable.name, jabTable);

            } else {
                throw new Error("[MalformedSourceFileError]: Table does not contain a 'name' field")
            }
        })
        
        return map;        
    }

}