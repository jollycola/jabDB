import JabTable from "./JabTable";
import { Entry } from "./model";

export default class JabEntry {
    private entry: Promise<Entry>;

    constructor(entry: Promise<Entry>) {
        this.entry = entry;
    }

    public async value(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            if (this.entry)
                resolve((await this.entry).value);
            else
                resolve(undefined);
        });

    }

    public async id(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            resolve((await this.entry).id);
        });
    }

}