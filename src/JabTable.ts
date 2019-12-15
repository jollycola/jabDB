import _, { Dictionary } from "lodash";
import { JabTableError, EntryNotFoundError } from "./errors";
import JabDB from "./JabDB";
import Adapter from "./adapters/Adapter";
import { Entry, Table } from "./model";
import JabEntry from "./JabEntry";
import { rejects } from "assert";
import { JabResult } from "./JabResult";

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
     * Returns the amount of entries in the table
     *
     * @returns {Promise<Number>} the amount of entries in the table as a promise
     */
    public async count(): Promise<Number> {
        return new Promise((resolve, reject) => {
            this.getEntries()
                .then(entries => resolve(_.size(entries)))
                .catch(reject);
        });
    }

    /**
     * Returns the object with the specified id.
     * @param id The id of the entry to get
     * @param {boolean} returnUndefined if `true`, returns `undefined` instead of throwing exception if no entry is found
     * (`true` by default)
     * @returns The object as a promise
     * @throws Throws a {@link JabTableError} if entry does not exist in table
     */
    public get(id: string, returnUndefined: boolean = false): JabResult {
        const entryPromise = new Promise<Entry[]>(async (resolve, reject) => {
            const entries = await this.getEntries();

            let val;
            if (val = _.get(entries, id)) {
                resolve([val]);
            } else {
                if (returnUndefined) {
                    resolve([]);
                } else reject(new EntryNotFoundError(id));
            }
        });

        return new JabResult(entryPromise);
    }

    /**
     * Returns all objects matching the predicate
     * @param predicate search predicate
     * @returns All objects matching the predicate as an array. Empty array if none was found
     */
    public find<T = any>(predicate: (v: T) => boolean): JabResult {

        const promise = new Promise<Entry[]>(async (resolve, reject) => {
            const entries = await this.getEntries();

            const values = _.filter(entries, (v: Entry) => predicate(v.value));

            if (_.size(values) == 0) {
                resolve([]);
            } else {
                if (this.isEntries(values)) {
                    resolve(values);
                }
            }
        });

        return new JabResult(promise);
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
        return new Promise(async (resolve, reject) => {
            const table = await this.getTable();

            if (!id) {
                id = JabTable.getNewId(table);
            }

            while (_.has(table.entries, id)) {
                console.warn("An entry with id '" + id + "' already exists in table! Generating new id");
                id = JabTable.getNewId(table);
            }

            const newEntry = new Entry(id, entry);
            _.set(table.entries, newEntry.id, newEntry);

            this.adapter.saveTable(table)
                .then((_) => resolve(newEntry.id))
                .catch(reject);
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


    /**
     * Put an entry into the table.
     * If any entry with the same id already exists, it its overridden.
     *
     * @param {string} id the id of the entry
     * @param {*} entry the object to put in the table
     * @returns {Promise<void>}
     */
    public async put(id: string, entry: any): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const table = await this.getTable();
            _.set(table.entries, id, new Entry(id, entry));

            this.adapter.saveTable(table)
                .then(resolve)
                .then(reject);
        });
    }

    /**
     * Patch an entry in the table, this updates the fields specified.
     * @param {...any} changes A list of changes to be made to the entry
     *
     * This method uses assignIn from lodash
     * @see https://lodash.com/docs/#assignIn
     */
    public patch(id: string, ...changes: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this.patchWith(id, undefined, ...changes)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Patch an entry in the table, this updates the fields specified.
     * Uses the customizer if not null.
     * @param {lodash.AssignCustomizer} customizer A customizer invoked to produce assigned values
     * if customizer is null, the function acts the same as `patch` @see JabTable.patch
     * @param {...any} changes A list of changes to be made to the entry
     *
     * This method uses assignInWith from lodash
     * @see https://lodash.com/docs/#assignInWith
     */
    public patchWith(id: string, customizer: _.AssignCustomizer, ...changes: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const table = await this.getTable();

            if (_.has(table.entries, id)) {
                let obj = _.get(table.entries, id).value;

                obj = _.assignInWith(obj, ...changes, customizer);

                _.set(table.entries, id, new Entry(id, obj));

                this.adapter.saveTable(table)
                    .then(() => resolve(obj))
                    .catch(reject);

            } else {
                reject(new EntryNotFoundError(id));
            }
        });

    }


    /**
     * Delete an entry from the table by its id
     *
     * @param {string} id The id of the entry to remove
     */
    public delete(id: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const table = await this.getTable();

            if (_.has(table.entries, id)) {
                _.unset(table.entries, id);

                this.adapter.saveTable(table)
                    .then(() => resolve())
                    .catch(reject);

            } else {
                reject(new EntryNotFoundError(id));
            }
        });
    }


}