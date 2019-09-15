import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import SingleFileAdapter from "../src/adapters/SingleFileAdapter";
import JabTable from "../src/JabTable";
import JabEntry from "../src/JabEntry";
import { IOError } from "../src/errors/Errors";

chai.use(chaiAsPromised);

describe("SingleFileAdapter", ()=> {
    let adapter: SingleFileAdapter;

    beforeEach(()=>{
        adapter = new SingleFileAdapter("source.json");
    })
    
    it("file not existing", async ()=> {
        adapter = new SingleFileAdapter("_nonexisting_file_.json");

        await expect(adapter.readTable<test>("test")).to.be.rejectedWith(IOError);
    })

    it("readMeta_isDefined", async () => {
        const meta = await adapter.readMeta();
        assert.isDefined(meta);
    })

    it("readTable_isDefined", async ()=>{       
        const table = await adapter.readTable<test>("test_table");
        assert.isDefined(table);
    })

    it("getEntryFromTable_isDefined", async ()=>{
        const table = await adapter.readTable<test>("test_table");
        const entry = table.get("1");

        assert.isDefined(entry);
    })

    it("getEntryFromTable_value", async ()=>{
        const table = await adapter.readTable<test>("test_table");
        const entry = table.get("1");

        assert.equal(entry.number, 10);
    })

});


describe("JabTable", ()=>{

    

});

class test {
    number: number;
    streng: string;
}
