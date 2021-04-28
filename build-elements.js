const fs = require('fs-extra');
const concat = require('concat');
const replace = require('replace-in-file');

(async function build() {
  try {
    const project = process.argv.slice(2)[0];
    if (!project) {
      return false;
    }

    const srcPath = `./dist/${project}`;
    const dstPath = `./elements/${project}`;

    ////////////////////////////////
    //   JS FILES AND REPLACE
    ////////////////////////////////
    const files_es_2015 = [`${srcPath}/runtime.js`, `${srcPath}/polyfills.js`, `${srcPath}/main.js`];
    await fs.ensureDir(dstPath);
    await concat(files_es_2015, `${dstPath}/${project}-element.js`);
    const JsonpAppender = project.indexOf('-') !== -1 ? project.replace(/-/g, '') : project;
    await replace({
      files: `${dstPath}/${project}-element.js`,
      from: /webpackJsonp/g,
      to: `webpackJsonp${JsonpAppender}`
    });

    //////////////
    //   CSS FILES
    //////////////
    await fs.copyFile(`${srcPath}/styles.css`, `${dstPath}/${project}-styles.css`);

    //////////////
    //   ASSETS FILES
    //////////////
    fs.ensureDir(`${srcPath}/assets`)
      .then(() => {
        fs.copy(`${srcPath}/assets`, `${dstPath}/assets`);
      })
      .catch(e => {
        throw e;
      });

    console.info(`
          ====================================
              elements build successfully
          ====================================
          `);
  } catch (e) {
    console.error(
      `
        ======================================
            Error while building elements
        ======================================
        \n`,
      '\n',
      e
    );
  }
})();
