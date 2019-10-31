import Adapter from "./Adapter";
import JabDB from "../JabDB";
import { MalformedSourceFileError, IOError, JabDBError } from "../errors";

import { Database, Table } from "../model"

import fs, { readFile, writeFile, write } from "fs";
import util, { isUndefined } from "util";
import _ from "lodash";
import { resolve } from "url";
import { rejects } from "assert";

/**
 * An adapter for JabDB that uses a single file as the source,
 * and uses aync methods
 * @extends Adapter
 */
export class SingleFileAdapter extends Adapter {
    private source: string;
    private requireJSONFile: boolean;

    /**
     * Creates an instance of SingleFileAdapter.
     * @param {string} source The path of the source file
     * @param {boolean} [requireJSONFile=true] Whether to require the file to 
     * be a .json file (``true`` by default)
     */
    constructor(source: string, requireJSONFile: boolean = true) {
        super();

        this.source = source;
        this.requireJSONFile;
    }

    /** @inheritdoc */
    public async connect(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Check if source exists
            if (fs.existsSync(this.source)) {
                // Check source
                this.checkSource().then(() => {
                    util.promisify(readFile)(this.source).then(data => {
                        const database = JSON.parse(data.toString())

                        if (!Database.isDatabase(database)) {
                            reject(new MalformedSourceFileError("Invalid source file, missing 'tables' or 'meta' field"))
                        }

                    }).catch(reject)
                }).catch(reject);

            } else {
                fs.writeFile(this.source, JSON.stringify({ meta: {}, tables: [] }), (err) => {
                    if (err) reject(err);

                    resolve();
                });
            }
        });
    }


    /**
     * Checks that the source file exists, and is a .json file
     * @private
     * @returns {Promise<boolean>}
     * @memberof SingleFileAdapter
     */
    private async checkSource(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {

            if (this.requireJSONFile && !this.source.endsWith(".json")) {
                reject(new MalformedSourceFileError("Source file is not a '.json' file!"))
            }

            if (fs.existsSync(this.source)) {
                util.promisify(fs.stat)(this.source).then(stats => {
                    if (!stats.isFile()) {
                        reject(new IOError("Source '" + this.source + "' is not a file!"));
                    }
                    resolve(true);
                }).catch(reject);
            } else {
                reject(new IOError("Source '" + this.source + "' does not exist!"));
            }
        });
    }

    private async readSource(): Promise<Database> {
        return new Promise<any>((resolve, reject) => {
            this.checkSource().then(async () => {
                const data = JSON.parse((await util.promisify(readFile)(this.source)).toString());

                if (Database.isDatabase(data)) resolve(data);
                else reject(new MalformedSourceFileError("Invalid source file, missing 'tables' or 'meta' field"))

            }).catch(err => {
                reject(err);
            });
        });
    }

    private async writeSource(database: Database): Promise<void> {
        return new Promise((resolve, reject) => {

            const json = JSON.stringify(database);

            console.log("json: " + json)

            util.promisify(writeFile)(this.source, json, { flag: "w" })
                .then(resolve)
                .catch(reject);
        })
    }


    public async getTable(id: string): Promise<Table> {
        const data = await this.readSource();

        return new Promise((resolve, reject) => {
            const table = _.get(data.tables, id) as Table;
            if (table) resolve(table)
            else reject(new JabDBError("No table found with id '" + id + "'"))
        });
    }

    public async saveTable(table: Table): Promise<void> {
        return new Promise(async (resolve, reject) => {
            console.log("start")
            const data = await this.readSource();
            console.log("data loaded")


            _.set(data.tables, table.name, table);


            this.writeSource(data)
                .then(resolve)
                .catch(reject);
        });
    }

}