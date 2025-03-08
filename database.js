/* global db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'travel';
const collection = 'login';

// No need to use `use(database)` in MongoDB Playground, as the environment is already set.

// Create a new collection
db.createCollection(collection);

// Optional: Verify if the collection was created successfully
const collections = db.getCollectionNames();
if (collections.includes(collection)) {
    print(`Collection '${collection}' created successfully in '${database}' database.`);
} else {
    print(`Failed to create collection '${collection}'.`);
}

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
