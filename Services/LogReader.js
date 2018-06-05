require('dotenv').load();

const documentClient = require("documentdb").DocumentClient;
const uriFactory = require('documentdb').UriFactory;

const client = new documentClient(process.env.LOG_URI, { "masterKey": process.env.LOG_TOKEN });

const databaseId = process.env.LOG_DB;
const collectionId = process.env.LOG_COLLECTION

const getLogByQuery = (query) => {

    let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            query
        ).toArray((err, results) => {
            if (err)
                reject(err)

            resolve(results);
        });
    });
};

module.exports = {
    getLogByQuery: getLogByQuery
}