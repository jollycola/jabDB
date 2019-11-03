import { Entry } from ".";
import { Dictionary } from "lodash";
import _ from "lodash";

export class Table {
    name: string;
    entries: Dictionary<Entry>;

    constructor(name: string, entries?: Dictionary<Entry>) {
        this.name = name;
        if (entries)
            this.entries = entries;
        else {
            this.entries = _.keyBy(new Array<Entry>(), Entry.name);
        }
    }

    public static isTable(object: any): object is Table {
        return (
            'name' in object &&
            'entries' in object)
    }
}