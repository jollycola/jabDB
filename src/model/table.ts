import { Entry } from ".";
import { Dictionary } from "lodash";
import _ from "lodash";

export class Table {
    name: string;
    count: number;
    entries: Dictionary<Entry>;

    constructor(name: string, entries?: Dictionary<Entry>) {
        this.name = name;
        if (entries) {
            this.entries = entries;
            this.count = _.size(entries)
        } else {
            this.entries = _.keyBy(new Array<Entry>(), Entry.name);
            this.count = 0;
        }
    }

    public static isTable(object: any): object is Table {
        return (
            'name' in object && typeof object.name === 'string' &&
            'count' in object && typeof object.cound === 'number' &&
            'entries' in object && typeof object.entries === 'object')
    }
}