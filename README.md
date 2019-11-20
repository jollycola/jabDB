![](https://github.com/jollycola/jabDB/workflows/Build/badge.svg)

# jabDB

WORK IN PROGRESS

Just A Basic DataBase, a TypeScript-first simple json database for storing plain objects.

## Installation

```sh
npm install jabdb --save
yarn add jabdb
```

## Usage - TypeScript

WORK IN PROGRESS

### Importing

```typescript
import JabDB from "jabdb";
import SingleFileAdapter from "jabdb.adapters";
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
const id1 = await users.createEntry({ name: "John Stone", age: 30 });
const id2 = await users.createEntry(
  { name: "John Stone", age: 30 },
  "johnstone"
);

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
