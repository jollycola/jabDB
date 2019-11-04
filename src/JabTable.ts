import _, { Dictionary } from "lodash";
import { JabTableError } from "./errors";
import JabDB from "./JabDB";
import Adapter from "./adapters/Adapter";
import { Entry, Table } from "./model";

export default class JabTable {
    private _name: string;
    private adapter: Adapter;

    public get name() {
        return this._name;
    }

    constructor(name: string, adapter: Adapter) {
        this._name = name;
        this.adapter = adapter;
    }

    private async getEntries(): Promise<Dictionary<Entry>> {
        return (await this.getTable()).entries;
    }

    private async getTable(): Promise<Table> {
        return (await this.adapter.getTable(this._name));
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
    public async findFirst<T = any>(predicate: (v: T) => boolean): Promise<T> {
        const entries = await this.getEntries();

        return new Promise((resolve, reject) => {
            const value = _.find(entries, (v: Entry) => predicate(v.value))

            if (value == undefined) reject(new JabTableError("No entry matching predicate found!"));

            if (Entry.isEntry(value))
                resolve(value.value);
            else
                reject(new TypeError("Object returned was no of type 'Entry'"));

        });

    }

    /**
     * Returns all objects matching the predicate
     * @param predicate search predicate
     * @returns All objects matching the predicate as an array. Empty array if none was found
     */
    public async findAll<T = any>(predicate: (v: T) => boolean): Promise<T[]> {
        const entries = await this.getEntries();

        return new Promise((resolve, reject) => {
            const values = _.filter(entries, (v: Entry) => predicate(v.value));

            if (_.size(values) == 0) resolve([]);

            if (this.isEntries(values)) {
                resolve(_.map(values, (entry) => {
                    return entry.value;
                }));
            }
        })
    }

    private isEntries(array: Entry[] | any[]): array is Entry[] {
        return Entry.isEntry(array[0]);
    }

    /**
     * Create a new entry in the table
     *
     * @param {*} entry The object to insert
     * @param {string} [id] the id of the object, a unique id is automatically created by default
     * @returns {string} Returns the id of the entry
     */
    public async create(entry: any, id?: string): Promise<string> {
        const table = await this.getTable();

        return new Promise(async (resolve, reject) => {
            if (!id) {
                id = JabTable.getNewId(table);
            }

            while (_.has(table.entries, id)) {
                console.warn("An entry with id '" + id + "' already exists in table! Generating new id")
                id = JabTable.getNewId(table);
            }

            const newEntry = new Entry(id, entry);
            _.set(table.entries, newEntry.id, newEntry);

            this.adapter.saveTable(table)
                .then((_) => resolve(newEntry.id))
                .catch(reject)
        });
    }

    /**
     * Returns a new ID based on the `count` field on the table, 
     * and increase `count` by 1
     */
    private static getNewId(table: Table): string {
        const count = table.count.toString();
        table.count++;

        return count;
    }

}