import { Entry } from "model";

export class Table {
    name: string;
    entries: Map<string, Entry>;

    constructor(name: string, entries: Map<string, Entry> = new Map<string, Entry>()) {
        this.name = name;
    }

    public static isTable(object: any): object is Table {
        return (
            'name' in object &&
            'entries' in object)
    }
}