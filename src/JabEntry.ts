import JabTable from "./JabTable";
import { Entry } from "./model";

export default class JabEntry {
    private entry: Entry;

    constructor(entry: Entry) {
        this.entry = entry;
    }

    public value(): any {
        if (this.entry)
            return this.entry.value;
        else
            return undefined;
    }

    public id(): string {
        return this.entry.id;
    }

}