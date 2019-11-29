![](https://github.com/jollycola/jabDB/workflows/Build/badge.svg)

<img src="media\jabdb_banner.svg" alt="drawing" height="80"/>

WORK IN PROGRESS

Just A Basic DataBase, a TypeScript-first simple json database for storing plain objects.

## Installation

```sh
# using npm
npm install jabdb --save

# using yarn
yarn add jabdb
```

## Usage - TypeScript

WORK IN PROGRESS

### Importing

```typescript
import JabDB from "jabdb";
import { SingleFileAdapter } from "jabdb/adapters";
```

### Creating the database

```typescript
const adapter = new SingleFileAdapter("data.json"); // Has to be a .json file
const db = new JabDB(adapter);

// Connect to the database
await db.connect();
```

### Creating a new table

```typescript
const users = await db.createTable("users");
```

### Getting a table

```typescript
const users = await db.getTable("users");
```

### Creating entry in table

```typescript
const id1 = await users.create({ name: "John Stone", age: 30 });
const id2 = await users.create({ name: "John Stone", age: 30 }, "johnstone");

// id1 -> "0" or next available id in table
// id2 -> "johnstone" if it is available else next available id
```

### Getting object by its id

```typescript
const user = await users.get("johnstone");
```

### Finding entry

```typescript
const foundUser = await users.findFirst(v => v.name == "John Stone");
const foundUsers = await users.findAll(v => v.age == 30);
```

### Updating entry

There are multiple ways of updating an entry:

#### Put

The [put](https://jollycola.github.io/jabDB/classes/jabtable.html#put) method overrides the entry with the specified id.

```typescript
await users.put("johnstone", { name: "John Stone", age: 31 });
```

#### Patch

The [patch](https://jollycola.github.io/jabDB/classes/jabtable.html#patch) method updates the fields of the object specified. Patch is implemented using [assignIn](https://lodash.com/docs/#assignIn) from Lodash.

```typescript
await users.patch("johnstone", { age: 32 });

// 'johnstone' -> { name: "John Stone", age: 32 }
```

#### PatchWith

The [patchWith](https://jollycola.github.io/jabDB/classes/jabtable.html#patchwith) method works like `patch`, but takes a customizer function. PatchWith is implemented using [assignInWith](https://lodash.com/docs/#assignInWith) from Lodash.

See [the Lodash documentation](https://lodash.com/docs/#assignInWith) for more info

### Deleting entry

```typescript
await users.delete("johnstone");
```
