# University Forum Project

## About

This project was my final year university webdev project. It is a simple forum site which uses an Node.js and Express based backend, with a MongoDB database connection. Pages are rendered using the EJS templating library, and use JQuery for some frontend functionality involving API calls etc. Bootstrap is also used for some basic frontend styling and components.

The project originally contained a navbar image and naming related to my university however these have been stripped just to be safe, in case of any potential copyright issues.

## How to use

While I wouldn't recommend using this for anything more than testing, to set up the project you will simply need to have node.js installed (tested and working on v16.17.0), download the code, run ```npm i``` to install any project dependancies, and then point the code to your MongoDB database (defined in constants at the top of the index file).

After this you simply need to run the server. For local testing this is as simple as typing ```node index.js``` in the source folder, however for an actual deployment it could likely be set to run as a service on a linux machine, or simply be put on a serverless hosting platform.