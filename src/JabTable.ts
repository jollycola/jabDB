import JabEntry from "./JabEntry";

export default class JabTable<T> {
    name: string;
    entries: Map<string, JabEntry<T>>;

    public get(id: string): T {
        return this.entries.get(id).getValue();
    }

    public find(predicate: (v: JabEntry<T>) => unknown): T {
        return Array.from(this.entries.values()).find(predicate).getValue();
    }
}