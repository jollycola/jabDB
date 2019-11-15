import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SingleFileAdapter } from "../src/adapters"
import _ from "lodash";
import { JabDBError, JabTableError } from "../src/errors";
import { Entry, Table } from "../src/model";
import { before, Test } from "mocha";
import JabTable from "../src/JabTable";
import fs from "fs";
import { WriteStream } from "tty";
import JabDB from "../src/JabDB";

chai.use(chaiAsPromised);

const WRITABLE_PATH = 'data/test/writable.json';
const PREFILLED_PATH = 'data/test/prefilled.json';


function deleteWritableFile() {
    fs.unlinkSync(WRITABLE_PATH);
}


describe("SingleFileAdapter", () => {
    let adapter: SingleFileAdapter;

    let entry1: Entry;
    let entry2: Entry;

    context("# Reading", () => {

        beforeEach(() => {
            adapter = new SingleFileAdapter(PREFILLED_PATH, true);
            adapter.connect();
        })

        before(() => {
            entry1 = { id: "1", value: new TestClass(1) };
            entry2 = { id: "2", value: new TestClass(2) };
        })

        it("connect", function () {
            expect(adapter.connect()).to.eventually.not.be.rejectedWith(Error);
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


    })

    context("# Writing", () => {

        let prefilledWritableAdapter: SingleFileAdapter;

        beforeEach(async () => {
            adapter = new SingleFileAdapter(WRITABLE_PATH)
            await adapter.connect()
        })

        afterEach(() => {
            deleteWritableFile();
        })


        it("saveTable", async () => {
            const table = new Table("table1")
            await adapter.saveTable(table);

            const receivedTable = await adapter.getTable(table.name);

            expect(receivedTable).to.deep.eq(table);
        })

        it("saveTable_withEntry", async () => {
            const table = new Table("table1")
            _.set(table.entries, "1", new Entry("1", new TestClass(1)))
            await adapter.saveTable(table);

            const receivedTable = await adapter.getTable(table.name);

            expect(receivedTable).to.deep.eq(table);
        })


        it("removeTable", async () => {
            adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            assert.isDefined(await adapter.getTable("test_table2"));

            await adapter.deleteTable("test_table2");

            await expect(adapter.getTable("test_table2")).to.eventually.be.rejectedWith(JabDBError);
        })


    })





})


describe("JabTable", () => {
    let table: JabTable;

    context("# Reading", () => {
        before(() => {
            const adapter = new SingleFileAdapter(PREFILLED_PATH)
            adapter.connect();

            table = new JabTable("test_table", adapter);
        })


        it("get", async () => {
            assert.isDefined(await table.get("1"))
        })

        it("get_not_found", () => {
            expect(table.get("__not_found__")).to.eventually.be.rejectedWith(JabTableError)
        })

        it("findFirst", async () => {
            assert.isDefined(await table.findFirst<TestClass>((v) => v.string == "lorem"));
        })

        it("findFirst_not_found", async () => {
            expect(table.findFirst<TestClass>((v) => v.string == "__not_found__"))
                .to.eventually.be.rejectedWith(JabTableError)
        })

        it("findAll_defined", async () => {
            assert.isDefined(await table.findAll(v => v.string == "lorem"));
        })

        it("findAll_none", async () => {
            expect((await table.findAll(v => v.string == "__notexisting__")).length).to.equal(0);
        })

        it("findAll_length", async () => {
            expect((await table.findAll(v => v.string == "lorem")).length).to.equal(1);
        })

        it("findAll_two", async () => {
            const expected = [new TestClass(2, "ipsum"), new TestClass(2, "ipsum")]

            const found = await table.findAll(v => v.string == "ipsum");

            expect(found).to.deep.eq(expected);
        })

    })

    context("# Writing", () => {

        beforeEach(() => {
            const adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            table = new JabTable("test_table", adapter);
        })

        afterEach(() => {
            deleteWritableFile();
        })


        it("create", async () => {
            const id = await table.create(new TestClass(5, "lorem ipsum"));

            assert.isDefined(await table.get(id))
        })

        it("create_generated_id", async () => {
            const id = await table.create(new TestClass(5, "lorem ipsum"));

            assert.isDefined(await table.get(id))
        })

        it("create_generated_id_increments", async () => {
            const id = await table.create(new TestClass(5, "lorem ipsum"));
            const id2 = await table.create(new TestClass(5, "lorem ipsum"));

            expect(Number.parseInt(id)).to.be.lessThan(Number.parseInt(id2))
        })

        it("create_id_exists", async () => {
            const id = await table.create(new TestClass(5, "lorem ipsum"), "3");

            expect(Number.parseInt(id)).to.be.greaterThan(Number.parseInt("3"))
        })
    })

})


describe("JabDB", () => {

    let database: JabDB;

    context("# Reading", () => {

        before(async () => {
            const adapter = new SingleFileAdapter(PREFILLED_PATH);
            database = new JabDB(adapter);
            await database.connect()
        })

        it("getTable", async () => {
            assert.isDefined(await database.getTable("test_table"))
        })

        it("getTable_not_found", async () => {
            expect(database.getTable("__not_found__")).to.eventually.be.rejectedWith(JabDBError);
        })
    })

    context("# Writing", () => {

        beforeEach(() => {
            const adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            database = new JabDB(adapter);
        })

        afterEach(() => {
            deleteWritableFile();
        })

        it("createTable", async () => {
            await database.createTable("new_table");
            assert.isDefined(await database.getTable("new_table"));
        })

        it("createTable_already_exists", async () => {
            await expect(database.createTable("test_table", false)).to.eventually.be.rejectedWith(JabDBError);
        })

        it("createTable_already_exists_returnOld", async () => {
            assert.isDefined(await database.createTable("test_table"));
        })

        it("createTable_already_exists_returnOld", async () => {
            assert.isDefined(await database.createTable("test_table"));
        })

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
