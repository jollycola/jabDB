import { Entry } from "./model";
import JabEntry from "./JabEntry";

export class JabResult {

    private _entries: Promise<Entry[]>;

    constructor(entries: Promise<Entry[]>) {
        this._entries = entries;
    }

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

    public values(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => entry.value)))
                .catch(reject);
        });

    }

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

    public ids(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => entry.id)))
                .catch(reject);
        });
    }

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

    public entries(): Promise<JabEntry[]> {
        return new Promise((resolve, reject) => {
            this._entries
                .then(entries => resolve(entries.map((entry) => new JabEntry(entry))))
                .catch(reject);
        });
    }
}