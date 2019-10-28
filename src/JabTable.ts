import JabEntry from "./JabEntry";
import _ from "lodash";
import { JabTableError } from "./errors";

export default class JabTable<T> {
    name: string;
    private _count = 0;
    entries: Map<string, JabEntry<T>>;

    cacheTimestamp: number = -1;

    constructor(name: string, entries: Map<string, JabEntry<T>>) {
        this.name = name;
        this.entries = entries;
    }

    /**
     * Returns the object with the specified id.
     * Returns `undefined` if entry does not exist.
     * @param id The id of the entry to get
     * @returns The object of type [T], `undefined` if entry does not exist
     */
    public get(id: string): T {
        if (_.has(this.entries, id)){
            return _.get(this.entries, id).getValue();
        } else return undefined;
    }

    public findFirst(predicate: (v: T) => boolean): T {
        const value = _.find(this.entries, (v: JabEntry<T>) => predicate(v.getValue()))

        if (value instanceof JabEntry) return value.getValue();

        return undefined;
    }

    public findAll(predicate: (v: T) => boolean): T {

        // TODO
        throw Error("NOT YET IMPLEMENTED")

    }

    public create(entry: T, id?: string) {
        if (!id) id = this.getNewId();
        else {
            if (_.has(this.entries, id)) 
                throw new JabTableError("An entry with id '" + id + "' already exists in table!")
        }
        
        const newEntry = new JabEntry(id, entry);
        _.set(this.entries, newEntry.getId(), newEntry);
    }

    /**
     * Returns a new ID based on the `this._count` field, 
     * and increase `_count` by 1
     */
    private getNewId(): string {
        const val = this._count.toString();
        this._count++;

        return val;
    }

}