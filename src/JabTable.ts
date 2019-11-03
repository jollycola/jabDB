import _, { Dictionary } from "lodash";
import { JabTableError } from "./errors";
import JabDB from "./JabDB";
import Adapter from "./adapters/Adapter";
import { Entry } from "./model";

export default class JabTable {
    private _name: string;
    private adapter: Adapter;

    private _count = 0;

    public get name() {
        return this._name;
    }

    constructor(name: string, adapter: Adapter) {
        this._name = name;
        this.adapter = adapter;
    }

    private async getEntries(): Promise<Dictionary<Entry>> {
        return (await this.adapter.getTable(this._name)).entries;
    }

    /**
     * Returns the object with the specified id.
     * @param id The id of the entry to get
     * @returns The object of type [T]
     * @throws Throws a {@link JabTableError} if entry does not exist in table
     */
    public async get(id: string): Promise<any> {
        const entries = await this.getEntries();

        return new Promise((resolve, reject) => {
            if (_.has(entries, id)) {
                resolve(_.get(entries, id).value);
            } else
                reject(new JabTableError("No entry with id '" + id + "' found!"))
        });
    }

    /**
     * Returns the first object matching the predicate
     * @param predicate search predicate
     * @returns The first object matching the predicate.
     * @throws Throws a {@link JabTableError} if entry does not exist in table
     */
    public async findFirst<T>(predicate: (v: T) => boolean): Promise<T> {
        const entries = await this.getEntries();

        console.log(entries)

        return new Promise((resolve, reject) => {
            const value = _.find(entries, (v: Entry) => predicate(v.value))

            console.log("value " + value)

            if (Entry.isEntry(value))
                resolve(value.value);

            reject(new JabTableError("No entry matching predicate found!"));
        });

    }

    // /**
    //  * Returns all objects matching the predicate
    //  * @param predicate search predicate
    //  * @returns All objects matching the predicate as an array. Empty array if none was found
    //  */
    // public findAll<T>(predicate: (v: T) => boolean): T[] {
    //     const values = _.filter(this.entries, (v: JabEntry) => predicate(v.getValue()));

    //     if (_.size(values) == 0) return [];

    //     if (this.isJabEntries(values)) {
    //         return _.map(values, (entry) => {
    //             return entry.getValue();
    //         });
    //     }
    // }

    // private isJabEntries(array: JabEntry[] | any[]): array is JabEntry[] {
    //     return array[0] instanceof JabEntry;
    // }

    // public create(entry: any, id?: string): JabTable {
    //     if (!id) id = this.getNewId();
    //     else {
    //         if (_.has(this.entries, id))
    //             throw new JabTableError("An entry with id '" + id + "' already exists in table!")
    //     }

    //     const newEntry = new JabEntry(id, entry);
    //     _.set(this.entries, newEntry.getId(), newEntry);

    //     return this;
    // }

    // /**
    //  * Returns a new ID based on the `this._count` field, 
    //  * and increase `_count` by 1
    //  */
    // private getNewId(): string {
    //     const val = this._count.toString();
    //     this._count++;

    //     return val;
    // }

}