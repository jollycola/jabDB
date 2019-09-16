import JabEntry from "./JabEntry";

export default class JabTable<T> {
    name: string;
    entries: Map<string, JabEntry<T>>;

    cacheTimestamp: number = -1;

    constructor(name: string, entries: Map<string, JabEntry<T>>) {
        this.name = name;
        this.entries = entries;
    }

    public get(id: string): T {
        return this.entries.get(id).getValue();
    }

    public find(predicate: (v: T) => boolean): T {
        return Array.from(this.entries.values()).find(v => predicate(v.getValue())).getValue();
    }
}