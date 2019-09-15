"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JabTable_1 = __importDefault(require("../JabTable"));
const JabEntry_1 = __importDefault(require("../JabEntry"));
class Adapter {
    plainToJabTables(tables) {
        let map = new Map();
        tables.forEach((table) => {
            // Check if table has a 'name' field
            if (table.name != undefined) {
                const entries = new Map();
                // Check if table has an 'entries' field
                if (table.entries != undefined) {
                    table.entries.forEach((entry) => {
                        // Check if entry has an id and value field
                        if (entry.id != undefined && entry.value != undefined) {
                            const newEntry = new JabEntry_1.default(entry.id, entry.value);
                            entries.set(newEntry.getId(), newEntry);
                        }
                        else {
                            throw new Error("[MalformedSourceFileError]: Entry missing 'id' or 'value' field");
                        }
                    });
                }
                else {
                    throw new Error("[MalformedSourceFileError]: Table does not contain an 'entries' field");
                }
                const jabTable = new JabTable_1.default(table.name, entries);
                map.set(jabTable.name, jabTable);
            }
            else {
                throw new Error("[MalformedSourceFileError]: Table does not contain a 'name' field");
            }
        });
        return map;
    }
}
exports.default = Adapter;
//# sourceMappingURL=Adapter.js.map