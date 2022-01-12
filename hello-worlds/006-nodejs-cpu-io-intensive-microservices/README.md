# nodejs micro service with cpu and io intensive APIs
These microservices are useful to simulate high/low cpu usage related scale-in, scale-out; health check failures, etc.  Useful for testing containerized execution with Load balacing and scaling.

To run, set values in sample.env file and rename the file to .env.
```
cp sample.env .env
npm i
npm run start
```
