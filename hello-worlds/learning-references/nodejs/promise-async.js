function resolveAfter2Seconds(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`f1-resolved with  ${x}`);
    }, 200);
  });
}

async function f1() {
  console.log("f1 start===");
  var x = await resolveAfter2Seconds(10);
  console.log(x); // 10
  console.log("f1 end");
}

f1();


async function f2() {
  console.log("f2 start==");
  console.log("f2 nodejs is singled threaded. but non-blocking... so, while sleeping on f1, f2 can be processed");
  const thenable = {
    then: function (resolve, _reject) {
      setTimeout(() => {
        resolve("f2 resolved!");
      }, 500);
      // resolve('resolved!')
    }
  };
  console.log("f2 Await thenable");
  console.log(await thenable); // resolved!
  console.log("f2 Awaited thenable");
}

f2();

//If the value is not a Promise, it converts the value to a resolved Promise, and waits for it. 
async function f3() {
  //var y = await 20; //this is same as Promise.resolve(20);
  var y = await Promise.resolve(20);
  console.log(`f3 resolved ${y}`); // 20
}

 f3();

//reject
async function f4() {
  try {
    var z = await Promise.reject(30);
  } catch (e) {
    console.error(`f4 rejected ${e}`); // 30
  }
}

 f4();

async function f5promised(p) {
  if (p === "reject") {
    return ( Promise.reject("f5promised rejected"));
  } else return "f5promised resolved";

}
//reject promise without try block
async function f5(res) {
  var response = await f5promised(res)
    .catch((err) => { console.log(`f5 err ${err}`); })
    .then(console.log(`f5 resolved`));
}


console.log("f5(resolve) called");
 f5("resolve");
console.log("f5(reject) called");
 f5("reject");

