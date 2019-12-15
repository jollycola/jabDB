import JabTable from "./JabTable";
import { Entry } from "./model";

export default class JabEntry {
    private entry: Entry;

    constructor(entry: Entry) {
        this.entry = entry;
    }

    public value(): any {
        return this.entry.value;
    }

    public id(): string {
        return this.entry.id;
    }

}