/* eslint-disable no-underscore-dangle */
/* getFragmentSchema.js
 *
 * This code retrieves the schema when we're using fragments on interfaces.
 * See https://www.apollographql.com/docs/react/recipes/fragment-matching.html
 *
 * Run whenever your schema changes to let the client have updated types.
 * To run:
 *     $ node getFragmentSchema.js
 */

const fetch = require("node-fetch");
const fs = require("fs");

const API_HOST = "http://localhost:4001";

fetch(`${API_HOST}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `
    })
})
    .then(result => result.json())
    .then(result => {
        // here we're filtering out any type information unrelated to unions or interfaces
        const filteredData = result.data.__schema.types.filter(
            type => type.possibleTypes !== null
        );
        result.data.__schema.types = filteredData; // eslint-disable-line no-param-reassign
        fs.writeFile("src/fragmentTypes.json", JSON.stringify(result.data), err => {
            if (err) console.error("Error writing fragmentTypes file", err);
            console.log("Fragment types successfully extracted!");
        });
    })
    .catch(err => console.error(err));