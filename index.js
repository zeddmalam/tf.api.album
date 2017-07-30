const moment = require('moment');
const neo4j = require('neo4j-driver').v1;

exports.handler = (event, context, callback) => {
  const ENV = context.invokedFunctionArn.split(':').slice(-1).pop();
  let driver = neo4j.driver(process.env[ENV + '_DB_BLOT'], neo4j.auth.basic(process.env[ENV + '_DB_USER'], process.env[ENV + '_DB_PASSWORD']));
  let session = driver.session();
  
  if('LIST' === event.method){
    console.time('query duration');
    session
      .run("MATCH (n:ALBUM) RETURN n SKIP 0 LIMIT 10")
      .then(result => {
        let data = [];
        result.records.forEach(record => {
          data.push(record._fields);
        });
        session.close();
        console.timeEnd('query duration');
        return context.succeed(data);
      })
      .catch(error => {
        console.log(error);
        session.close();
        console.timeEnd('query duration');
        return context.fail(error);
      });
  } else {
    return context.fail('incorrect method');
  }
};
