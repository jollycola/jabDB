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
const chai_1 = require("chai");
const SingleFileAdapter_1 = __importDefault(require("../src/adapters/SingleFileAdapter"));
describe("SingleFileAdapter", () => {
    let adapter;
    beforeEach(() => {
        adapter = new SingleFileAdapter_1.default("source.json");
    });
    xit("file not existing", () => {
        chai_1.assert.throws(() => __awaiter(void 0, void 0, void 0, function* () { return yield new SingleFileAdapter_1.default("_nonexisting_file_.json"); }));
    });
    it("readMeta", () => {
        adapter.readMeta();
    });
    it("readTable", () => __awaiter(void 0, void 0, void 0, function* () {
        const table = yield adapter.readTable("test_table");
        console.log(table);
    }));
});
class test {
}
//# sourceMappingURL=Test.js.map