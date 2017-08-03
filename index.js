const moment = require('moment');
const neo4j = require('neo4j-driver').v1;

exports.handler = (event, context, callback) => {
  const ENV = context.invokedFunctionArn.split(':').slice(-1).pop();
  let driver = neo4j.driver(process.env[ENV + '_DB_BOLT'], neo4j.auth.basic(process.env[ENV + '_DB_USER'], process.env[ENV + '_DB_PASSWORD']));
  let session = driver.session();
  
  if('LIST' === event.method){
    console.time('query duration');
    session
      .run("MATCH (n:Album) RETURN n SKIP 0 LIMIT 10")
      .then(result => {
        let data = [];
        result.records.forEach(record => {
          record._fields[0].identity = neo4j.int(record._fields[0].identity).toNumber();
          data.push(record._fields[0]);
        });
        session.close();
        console.timeEnd('query duration');
        return context.succeed(data);
      })
      .catch(error => {
        console.log('ERROR', error);
        session.close();
        console.timeEnd('query duration');
        return context.fail(error);
      });
  } else if('GET' === event.method){
    if('undefined' === typeof event.id){
      return context.fail('event.id is missing');
    }
    console.time('query duration');
    session
      .run("MATCH (n) WHERE id(n)=" + event.id + " RETURN n")
      .then(result => {
        result.records[0]._fields[0].identity = neo4j.int(result.records[0]._fields[0].identity).toNumber();
        session.close();
        console.timeEnd('query duration');
        return context.succeed(result.records[0]._fields[0]);
      })
      .catch(error => {
        console.log('ERROR', error);
        session.close();
        console.timeEnd('query duration');
        return context.fail(error);
      });
  } else {
    return context.fail('incorrect method');
  }
};
