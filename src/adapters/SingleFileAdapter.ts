import Adapter from "./Adapter";
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";


import fs from "fs";
import util from "util";
import { stringify } from "querystring";

const readFile = util.promisify(fs.readFile);

export default class SingleFileAdapter extends Adapter {
    private source: string;
    
    constructor(source: string) {
        super();

        this.source = source;

        this.checkSource().catch((reason) => {
            throw reason;
        });
    }

    private async checkSource(): Promise<boolean> {
        let value = false;

        if (fs.existsSync(this.source)) {
            await fs.stat(this.source, (err, stats) => {
                if (err) {
                    throw err;
                }

                if (!stats.isFile()){
                    value = false;
                    throw Error("Source: " + this.source + " is not a file!");
                }

                value = true;
            })
        } else {
            value = false;
            throw Error("Source: " + this.source + " does not exist!");
        }

        return value;
    }

    private async readSource(): Promise<any> {
        return JSON.parse((await readFile(this.source)).toString());
    }

    async readMeta(): Promise<JabDBMeta> {
        const data = await this.readSource();

        let meta = data.meta as JabDBMeta;
        
        return meta;
    }

    async readTable<T>(id: string): Promise<JabTable<T>> {
        const data = await this.readSource();

        if (data.tables != undefined) {
            const _tables = data.tables;

            const tables = this.plainToJabTables<T>(_tables);
                
            return tables.get(id);

        } else {
            throw new Error("[MalformedSourceFileError]: Object missing a 'tables' field");
        }

    }

    write() {
        throw new Error("Method not implemented.");
    }

}