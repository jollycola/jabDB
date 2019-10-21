import Adapter from "./adapters/Adapter";
import JabTable from "./JabTable";

import _ from "lodash";
import { rejects } from "assert";

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

    public async connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.adapter.connect().then(resolve).catch(reject);
        });
    }

    /**
     * Get a table from the database. 
     * @param id The id of the table to search for
     * @returns {Promise<JabTable<any>>} The table found, as a promise. The promise is 
     * rejected if the table was not found
     */
    public async getTable(id: string): Promise<JabTable<any>> {
        return new Promise(async (resolve, reject) => {
            let table;

            if (this.meta.doCaching && _.has(table, id)) {
                table = _.get(this.tables, id);  
                if (table.cacheTimestamp == -1 || (table.cacheTimestamp + this.meta.cacheLifespan) < Date.now()) {
                    table = await this.adapter.readTable(id);
                }
            } else {
                table = await this.adapter.readTable(id);
            }


            if (table != undefined){
                _.set(this.tables, id, table);
                resolve(table);
            } 
            else reject(new Error("No table with id '" + id + "' exists"));
        });
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