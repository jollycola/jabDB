import Adapter from "./Adapter";
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";
import JabEntry from "../JabEntry";


import fs from "fs";
import util from "util";
import { stringify } from "querystring";

const readFile = util.promisify(fs.readFile);

export default class SingleFileAdapter implements Adapter {
    private source: string;
    
    constructor(source: string) {
        this.source = source;

        this.checkSource().catch((reason) => {
            throw reason;
        })        
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

    async readTable<T>(id: string): Promise<JabTable<JabEntry<T>>> {
        const data = await this.readSource();
        
        const tables = data.tables as JabTable<any>[];

        console.log(tables);
        console.log(tables[0].get("1"));
        
        return (tables.find(v => v.name == id)) as JabTable<JabEntry<T>>;
    }

    write() {
        throw new Error("Method not implemented.");
    }

}