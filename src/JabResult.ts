import { Entry } from "./model";
import JabEntry from "./JabEntry";

export class JabResult {

    private _entries: Promise<Entry[]>;

    constructor(entries: Promise<Entry[]>) {
        this._entries = entries;
    }

    /**
     * Get the first value of result
     *
     * @returns {Promise<any>}
     * @memberof JabResult
     */
    public value(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => {
                    if (entries.length != 0) {
                        resolve(entries[0].value);
                    } else {
                        resolve(undefined);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Get all values of a result as an array
     *
     * @returns {Promise<any[]>}
     * @memberof JabResult
     */
    public values(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => entry.value)))
                .catch(reject);
        });

    }

    /** 
     * Get the first id of a result
     */
    public id(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._entries
                .then(entries => {
                    if (entries.length != 0) {
                        resolve(entries[0].id);
                    } else {
                        resolve(undefined);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Get all ids of a result as an array
     *
     * @returns {Promise<string[]>}
     * @memberof JabResult
     */
    public ids(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => entry.id)))
                .catch(reject);
        });
    }

    /**
     * Get the entry of a result.
     * An entry contains both the value and the id
     *
     * @returns {Promise<JabEntry>}
     * @memberof JabResult
     */
    public entry(): Promise<JabEntry> {
        return new Promise<JabEntry>((resolve, reject) => {
            this._entries
                .then(entries => {
                    if (entries.length != 0) {
                        resolve(new JabEntry(entries[0]));
                    } else {
                        resolve(undefined);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Get all entries of a result as an array.
     * An entry contains both the value and the id
     *
     * @returns {Promise<JabEntry[]>}
     * @memberof JabResult
     */
    public entries(): Promise<JabEntry[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => new JabEntry(entry))))
                .catch(reject);
        });
    }
}