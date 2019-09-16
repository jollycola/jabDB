import Adapter from "./Adapter";
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";
import { MalformedSourceFileError, IOError } from "../errors/Errors";


import fs from "fs";
import util from "util";
import { stringify } from "querystring";

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

    async readMeta(): Promise<JabDBMeta> {
        try {
            const data = await this.readSource();
            if (data.meta != undefined) {
                const meta = new JabDBMeta(data.meta.doCaching, data.meta.cachingLifespan);

                return meta;                
            } else {
                throw new MalformedSourceFileError("Object missing a 'meta' field");
            }
    

        } catch (err) {
            throw new err;
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

    write() {
        throw new Error("Method not implemented.");
    }

}