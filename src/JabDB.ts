import Adapter from "./adapters/Adapter";
import JabTable from "./JabTable";

import _ from "lodash";
import { JabDBError, JabTableNotFoundError } from "./errors";
import { Table } from "./model";

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

    public async connect(): Promise<void> {
        return this.adapter.connect();
    }

    /**
     * Get a table from the database. 
     * @param id The id of the table to search for
     * @returns {Promise<JabTable>} The table found, as a promise. The promise is 
     * rejected if the table was not found
     */
    public async getTable(id: string): Promise<JabTable> {
        return new Promise(async (resolve, reject) => {
            this.adapter.getTable(id)
                .then(table => {
                    resolve(new JabTable(table.name, this.adapter));
                })
                .catch(reject)
        });
    }

    /**
     * Create a new table in the database
     *
     * @param {string} id The id of the table to create
     * @param {boolean} [returnIfAlreadyExists=true] If `returnIfAlreadyExists` is set to `true`,
     *  then the function returns the existing table, if it has the same id.
     * @returns {Promise<JabTable>} Returns the table as a {@link JabTable} Promise.
     * @memberof JabDB
     */
    public async createTable(id: string, returnIfAlreadyExists: boolean = true): Promise<JabTable> {
        return new Promise((resolve, reject) => {
            this.getTable(id).then((table) => {
                if (returnIfAlreadyExists)
                    resolve(table);
                else
                    reject(new JabDBError("Table with id '" + id + "' already exists!"))
            }).catch(err => {
                if (err instanceof JabTableNotFoundError) {
                    this.adapter.saveTable(new Table(id))
                        .then(() => resolve(new JabTable(id, this.adapter)))
                        .catch(reject)
                } else
                    reject(err)
            })

        })
    }


    //TODO: Delete Table method

}

export class JabDBMeta {

}