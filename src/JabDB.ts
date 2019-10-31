import Adapter from "./adapters/Adapter";
import JabTable from "./JabTable";

import _ from "lodash";

export default class JabDB {
    private adapter: Adapter;

    private meta: JabDBMeta;

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
            this.adapter.connect(this).then(resolve).catch(reject);
        });
    }

    public get getMeta(): JabDBMeta {
        return this.meta;
    }

    public get getAdapter(): Adapter {
        return this.adapter;
    }

    /**
     * Get a table from the database. 
     * @param id The id of the table to search for
     * @returns {Promise<JabTable<any>>} The table found, as a promise. The promise is 
     * rejected if the table was not found
     */
    public async getTable(id: string): Promise<JabTable> {,
        throw Error("Not yet implemented");
        // return new Promise(async (resolve, reject) => {
        //     const tableName = await this.adapter.readTable(id);

        //     if (tableName != undefined){
        //         resolve(new JabTable(tableName, this.adapter));
        //     } 
        //     else reject(new Error("No table with id '" + id + "' exists"));
        // });
    }

    // // TODO: Returning "Not yet implemented";
    // public async createTable(id: string, returnIfAlreadyExists: boolean = true): Promise<JabTable> {
    //     this.adapter.readTable(id).then((table: JabTable) => {
    //         console.log(table);

    //         if (table != undefined) {
    //             this.tables.set(table.Name, table);
    //         }

    //         if (this.tables.has(id)) {
    //             if (returnIfAlreadyExists) {
    //                 return this.tables.get(id);
    //             } else {
    //                 throw Error("Table with id '" + id + "' already exists!");
    //             }
    //         }
    //     }).catch(err => {
    //         throw err;
    //     });


    //     throw Error("Not yet implemented");
    // }

}

export class JabDBMeta {

}