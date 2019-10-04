import Adapter from "./adapters/Adapter";
import JabTable from "./JabTable";

export default class JabDB {
    private adapter: Adapter;

    private meta: JabDBMeta;
    private tables: Map<string, JabTable<any>> = new Map<string, JabTable<any>>();

    constructor(adapter: Adapter, meta?: JabDBMeta) {
        this.adapter = adapter;
        if (meta) {
            this.meta = meta;
        } else {
            this.meta = new JabDBMeta();
        }
    }

    public async getTable(id: string): Promise<JabTable<any>> {
        let table;

        if (this.tables.has(id)) {
            table = this.tables.get(id);

            if (this.meta.doCaching) {
                if (table.cacheTimestamp == -1 || (table.cacheTimestamp + this.meta.cacheLifespan) < Date.now()) {
                    return this.adapter.readTable(id)
                }
            }

            return this.tables.get(id);

        } else {
            table = await this.adapter.readTable(id);

            if (table != undefined) {
                this.tables.set(table.name, table);
                return table;
            } else {
                throw Error("No table with id '" + id + "' exists");
            }
        }

    }

    // TODO: Returning "Not yet implemented";
    public async createTable(id: string, returnIfAlreadyExists: boolean = true): Promise<JabTable<any>> {
        this.adapter.readTable(id).then((table: JabTable<any>) => {
            console.log(table);

            if (table != undefined) {
                this.tables.set(table.name, table);
            }

            if (this.tables.has(id)) {
                if (returnIfAlreadyExists) {
                    return this.tables.get(id);
                } else {
                    throw Error("Table with id '" + id + "' already exists!");
                }
            }
        }).catch(err => {
            throw err;
        });


        throw Error("Not yet implemented");
    }

}

export class JabDBMeta {
    public doCaching: boolean;
    public cacheLifespan?: number;

    constructor(doCaching: boolean = true, cacheLifespan: number = 120000) {
        this.doCaching = doCaching;
        this.cacheLifespan = cacheLifespan;
    }
}