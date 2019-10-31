import JabEntry from "./JabEntry";
import _ from "lodash";
import { JabTableError } from "./errors";
import JabDB from "./JabDB";
import Adapter from "./adapters/Adapter";

export default class JabTable {
    private _name: string;
    private adapter: Adapter;

    private _count = 0;

    public get name(){
        return this._name;
    }

    constructor(name: string, adapter: Adapter) {
        this._name = name;
        this.adapter = adapter;
    }

    get entries(): Map<string, JabEntry> {
        return this.adapter.readTableEntries(this.name);
    }

    /**
     * Returns the object with the specified id.
     * Returns `undefined` if entry does not exist.
     * @param id The id of the entry to get
     * @returns The object of type [T], `undefined` if entry does not exist
     */
    public get(id: string): any {
        const entries = this.entries;

        if (_.has(entries, id)){
            return _.get(entries, id).getValue();
        } else return undefined;
    }

    /**
     * Returns the first object matching the predicate
     * @param predicate search predicate
     * @returns The first object matching the predicate, `undefined` if entry does not exist
     */
    public findFirst<T>(predicate: (v: T) => boolean): T {
        const value = _.find(this.entries, (v: JabEntry) => predicate(v.getValue()))

        if (value instanceof JabEntry) return value.getValue();

        return undefined;
    }

    /**
     * Returns all objects matching the predicate
     * @param predicate search predicate
     * @returns All objects matching the predicate as an array. Empty array if none was found
     */
    public findAll<T>(predicate: (v: T) => boolean): T[] {
        const values = _.filter(this.entries, (v: JabEntry) => predicate(v.getValue()));

        if (_.size(values) == 0) return [];

        if (this.isJabEntries(values)){
            return _.map(values, (entry) => {
                return entry.getValue();
            });
        }
    }

    private isJabEntries(array: JabEntry[] | any[]): array is JabEntry[] {
        return array[0] instanceof JabEntry;
    }

    public create(entry: any, id?: string): JabTable {
        if (!id) id = this.getNewId();
        else {
            if (_.has(this.entries, id)) 
                throw new JabTableError("An entry with id '" + id + "' already exists in table!")
        }
        
        const newEntry = new JabEntry(id, entry);
        _.set(this.entries, newEntry.getId(), newEntry);

        return this;
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