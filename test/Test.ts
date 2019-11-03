import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SingleFileAdapter } from "../src/adapters"
import _ from "lodash";
import { JabDBError } from "../src/errors";
import { Entry, Table } from "../src/model";
import { before, Test } from "mocha";
import JabTable from "../src/JabTable";
import fs from "fs";
import { WriteStream } from "tty";

chai.use(chaiAsPromised);

const WRITABLE_PATH = "data/test/writable.json";
const PREFILLED_PATH = "data/test/prefilled.json";


describe("SingleFileAdapter", () => {
    let adapter: SingleFileAdapter;

    let entry1: Entry;
    let entry2: Entry;

    before(() => {
        entry1 = { id: "1", value: new TestClass(1) };
        entry2 = { id: "2", value: new TestClass(2) };
    })

    beforeEach(() => {
        adapter = new SingleFileAdapter(PREFILLED_PATH, true);
        adapter.connect();
    })

    it("getTable_defined", async () => {
        assert.isDefined(await adapter.getTable("test_table"))
    })

    it("getTable_not_found", () => {
        expect(adapter.getTable("__notexisting__")).to.eventually.be.rejectedWith(JabDBError);
    })

    it("getTable_entries", async () => {
        const entries = (await adapter.getTable("test_table")).entries;

        expect(entries.size).to.not.eq(0);
    })

    it("saveTable", async () => {
        adapter = new SingleFileAdapter(WRITABLE_PATH)
        adapter.connect();

        const table = new Table("table1")
        await adapter.saveTable(table);

        const receivedTable = await adapter.getTable(table.name);

        expect(receivedTable).to.deep.eq(table);

        fs.unlinkSync(WRITABLE_PATH);
    })

    it("saveTable_withEntry", async () => {
        adapter = new SingleFileAdapter(WRITABLE_PATH)
        adapter.connect();

        const table = new Table("table1")
        _.set(table.entries, "1", new Entry("1", new TestClass(1)))
        await adapter.saveTable(table);

        const receivedTable = await adapter.getTable(table.name);

        expect(receivedTable).to.deep.eq(table);

        fs.unlinkSync(WRITABLE_PATH);
    })


})



class TestClass {
    number: number;
    string: string;

    constructor(number: number = -1, string: string = "lorem") {
        this.number = number;
        this.string = string;
    }
}
