"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JabTable {
    constructor(name, entries) {
        this.name = name;
        this.entries = entries;
    }
    get(id) {
        return this.entries.get(id).getValue();
    }
    find(predicate) {
        return Array.from(this.entries.values()).find(predicate).getValue();
    }
}
exports.default = JabTable;
//# sourceMappingURL=JabTable.js.map