import Adapter from "./Adapter";
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import { MalformedSourceFileError, IOError } from "../errors";

import fs, { writeFile, readFile } from "fs";
import util, { inherits } from "util";
import _ from "lodash";

/**
 * An adapter for JabDB that uses a single file as the source,
 * and uses aync methods
 * @extends Adapter
 */
export default class SingleFileAdapter extends Adapter {
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
    public async connect(): Promise<any> {
        return new Promise(async (resolve, reject) => {

            if (fs.existsSync(this.source)) {
                this.checkSource().then(() => {
                    util.promisify(readFile)(this.source).then(data => {
                        this.validateData(data.toString()).then(resolve).catch(reject);
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

    private async validateData(data: string): Promise<any> {
        return new Promise((resolve, reject) => {

            try {
                const json = JSON.parse(data);

                if (!json.meta) {
                    reject(new MalformedSourceFileError("Source data missing a 'meta' field"));
                }
                if (!json.tables) {
                    reject(new MalformedSourceFileError("Source data missing a 'tables' field"));
                }

                resolve();

            } catch (err) {
                reject(new MalformedSourceFileError(err));
            }
        });
    }

    private async readSource(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.checkSource().then(async () => {
                resolve(JSON.parse((await util.promisify(readFile)(this.source)).toString()));
            }).catch(err => {
                reject(err);
            });
        });
    }

    private async readTables(): Promise<Map<string, JabTable<any>>> {
        return new Promise((resolve, reject) => {
            this.readSource().then((data) => {
                if (data.tables) {
                    resolve(this.plainToJabTables(data.tables));
                } else {
                    reject(new MalformedSourceFileError("Source file missing 'tables' field!"));
                }
            }).catch(reject);
        });
    }

    

    /**
     * Writes the passed meta and tables objects to the source file
     * @private
     * @param {JabDBMeta} meta
     * @param {JabTable<any>[]} tables
     * @returns {Promise<void>} Returns a void promise
     * @memberof SingleFileAdapter
     */
    private async writeSource(meta: JabDBMeta, tables: Map<string, JabTable<any>>): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            if (!meta) meta = new JabDBMeta();
            if (!tables) tables = new Map<string, JabTable<any>>();

            const data = { meta: meta, tables: tables };
            const json = JSON.stringify(data);

            util.promisify(writeFile)(this.source, json, { flag: "w" })
                .then(resolve)
                .catch(reject);
        });
    }

    /** @inheritdoc */
    public async readMeta(): Promise<JabDBMeta> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.readSource();
                if (data.meta != undefined) {
                    const meta = new JabDBMeta(data.meta.doCaching, data.meta.cacheLifespan);
                    resolve(meta);
                } else {
                    reject(new MalformedSourceFileError("Object missing a 'meta' field"));
                }

            } catch (err) {
                reject(err);
            }
        })

    }

    /** @inheritdoc */
    public async readTable<T>(id: string): Promise<JabTable<T>> {
        return new Promise((resolve, reject) => {
            this.readTables()
                // .then(tables => console.log(_.get(tables, id))) //TODO: REMOVE
                .then(tables => resolve(_.get(tables, id)))
                .catch(reject);
        });
    }

    /** @inheritdoc */
    public async writeMeta(meta: JabDBMeta): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (meta.doCaching) {
                if (!meta.cacheLifespan) {
                    meta = new JabDBMeta(meta.doCaching);
                }
            } else {
                meta = new JabDBMeta();
            }

            this.readTables()
                .then(tables => {
                    this.writeSource(meta, tables)
                        .then(resolve)
                        .catch(reject)
                })
                .catch(reject);
        });
    }

    /** @inheritdoc */
    public writeTable<T>(table: JabTable<T>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.readMeta()
                .then(meta => {
                    this.readTables()
                        .then(tables => {  
                            _.set(tables, table.name, table); 
                                                        
                            this.writeSource(meta, tables)
                                .then(resolve)
                                .catch(reject);
                        })
                        .catch(reject);          
                })
                .catch(reject);
        })
    }

    write() {
        throw new Error("Method not implemented.");
    }

}