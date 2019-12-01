import { JabDB } from "../src"
import { SingleFileAdapter } from "../src/adapters"

import chai, { assert, expect } from "chai";
import fs from "fs";

const DB_PATH = 'data/test/integration_test.json';


describe("Integration", () => {

    xit("Quick Test", () => {

    })

    it("Complete", async () => {

        const adapter = new SingleFileAdapter(DB_PATH);
        const db = new JabDB(adapter);

        await db.connect();

        // Create users table
        const users = await db.createTable("users", true);

        // Create entries
        await users.create(new User("John Stone", 30));
        await users.create(new User("Mia Wong", 30));
        await users.create(new User("Trevor Virtue", 32));
        await users.create(new User("Jane Meldrum", 28));
        expect(await users.count()).to.equal(4);

        // Get all users with age 30
        const usersAged30 = await users.findAll<User>((v) => v.age == 30);
        expect(usersAged30.length).to.equal(2);

        // Change user
        const trevor = await users.findFirst<User>((v) => v.name == "Trevor Virtue")

        console.log(trevor);

        expect(trevor).to.exist;


        fs.unlinkSync(DB_PATH);

    })

})

class User {

    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

}