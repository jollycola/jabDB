"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const readFile = util_1.default.promisify(fs_1.default.readFile);
class SingleFileAdapter {
    constructor(source) {
        this.source = source;
        this.checkSource().catch((reason) => {
            throw reason;
        });
    }
    checkSource() {
        return __awaiter(this, void 0, void 0, function* () {
            let value = false;
            if (fs_1.default.existsSync(this.source)) {
                yield fs_1.default.stat(this.source, (err, stats) => {
                    if (err) {
                        throw err;
                    }
                    if (!stats.isFile()) {
                        value = false;
                        throw Error("Source: " + this.source + " is not a file!");
                    }
                    value = true;
                });
            }
            else {
                value = false;
                throw Error("Source: " + this.source + " does not exist!");
            }
            return value;
        });
    }
    readSource() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse((yield readFile(this.source)).toString());
        });
    }
    readMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.readSource();
            let meta = data.meta;
            return meta;
        });
    }
    readTable(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.readSource();
            const tables = data.tables;
            console.log(tables);
            console.log(tables[0].get("1"));
            return (tables.find(v => v.name == id));
        });
    }
    write() {
        throw new Error("Method not implemented.");
    }
}
exports.default = SingleFileAdapter;
//# sourceMappingURL=SingleFileAdapter.js.map