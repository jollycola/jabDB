import Adapter from "./Adapter";
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";
import { MalformedSourceFileError, IOError } from "../errors/Errors";

import fs, { writeFile } from "fs";
import util from "util";

const readFile = util.promisify(fs.readFile);

export default class SingleFileAdapter extends Adapter {
    private source: string;

    constructor(source: string) {
        super();

        this.source = source;
    }

    private async checkSource(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            if (fs.existsSync(this.source)) {
                await fs.stat(this.source, (err, stats) => {
                    if (err) {
                        reject(err);
                    }
                    if (!stats.isFile()) {
                        reject(new IOError("Source '" + this.source + "' is not a file!"));
                    }
                    resolve(true);
                })
            } else {
                reject(new IOError("Source '" + this.source + "' does not exist!"));
            }
        });
    }

    private async readSource(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.checkSource().then(async value => {
                resolve(JSON.parse((await readFile(this.source)).toString()));
            }).catch(err => {
                reject(err);
            });
        });
    }

    private async writeSource<T>(meta: JabDBMeta, tables: JabTable<T>[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!meta) meta = new JabDBMeta();
            if (!tables) tables = [];

            const data = { meta: meta, tables: tables };
            const json = JSON.stringify(data);

            writeFile(this.source, json, { flag: "w" }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async readMeta(): Promise<JabDBMeta> {
        try {
            const data = await this.readSource();
            if (data.meta != undefined) {
                const meta = new JabDBMeta(data.meta.doCaching, data.meta.cacheLifespan);

                return meta;
            } else {
                throw new MalformedSourceFileError("Object missing a 'meta' field");
            }


        } catch (err) {
            throw err;
        }
    }

    async readTable<T>(id: string): Promise<JabTable<T>> {
        try {
            const data = await this.readSource();

            if (data.tables != undefined) {
                const _tables = data.tables;

                const tables = this.plainToJabTables<T>(_tables);

                return tables.get(id);
            } else {
                throw new MalformedSourceFileError("Object missing a 'tables' field");
            }
        } catch (err) {
            throw err;
        }
    }

    async writeMeta(meta: JabDBMeta): Promise<any> {
        return new Promise((resolve, reject) => {
            if (meta.doCaching) {
                if (!meta.cacheLifespan) {
                    meta = new JabDBMeta(meta.doCaching);
                }
            } else {
                meta = new JabDBMeta();
            }

            // Get tables from the file
            let tables: JabTable<any>[] = [];
            this.readSource().then((value) => {
                if (value.tables) tables = value.tables;

                this.writeSource(meta, tables).then(() => {
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }

    writeTable<T>(table: JabTable<T>): Promise<any> {
        // return new Promise((resolve, reject) => {

        // })
        throw new Error("Method not implemented.");
    }

    write() {
        throw new Error("Method not implemented.");
    }

}