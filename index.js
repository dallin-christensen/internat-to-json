const parse = require('csv-parse')
const fs = require('fs')
const fsExtra = require('fs-extra')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const languages = {
  en: {
    name: 'english',
    row: 2,
  },
  fr: {
    name: 'french',
    row: 3,
  },
  es: {
    name: 'spanish',
    row: 4,
  },
}


const deleteFilesInDist = ({ language, isLocal }) => {
  const delPath = isLocal
    ? `./dist/${language.name}`
    : `../../devops/client-lib/src/lib/i18n/${language.name}`

  fsExtra.emptyDirSync(delPath)
}

const writeFiles = ({ language, csvData, repeatedIds, totalIdAmount, isLocal }) => {

  const sections = Object.keys(csvData)

  sections.forEach(sectionName => {
    const section = csvData[sectionName]
    const data = JSON.stringify(section, null, 2)

    const writePath = isLocal
      ? `./dist/${language.name}/${sectionName}.json`
      : `../../devops/client-lib/src/lib/i18n/${language.name}/${sectionName}.json`

    fs.writeFileSync(writePath, data)
  })

  if (repeatedIds.length) {
    console.log({ repeatedIds })
  }

  console.log(`Contratulations, ${totalIdAmount} ${language.name} ids created!`)
}


const parseCsvData = ({ language, onParsed }) =>{
  const csvData = {};
  const repeatedIds = [];
  let totalIdAmount = 0;

  fs.createReadStream('./translations.csv')
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvrow) {
    
    const phraseId = csvrow[6]

    if (phraseId && csvrow[language.row] && phraseId !== 'ID') {

      const section = phraseId.slice(0, phraseId.indexOf('-'))

      if (!csvData[section]) {
        csvData[section] = {}
      }

      if (csvData[section][phraseId]) {
        repeatedIds.push(phraseId)
      } else {
        totalIdAmount++;
      }

      csvData[section][phraseId] = csvrow[language.row].replace('\\', '').replace('\\', '').replace('\n', '')
    }
  })
  .on('end',function() {
    onParsed({ language, csvData, repeatedIds, totalIdAmount })
  });
}

const execute = () => {
  readline.question(`Place new files in client-lib? [y/n] `, answer => {
    const isLocal = answer.toLowerCase() !== 'y'
    readline.close()

    Object.keys(languages).forEach(language => {

      const handleParsedCallback = ({ language, csvData, repeatedIds, totalIdAmount }) => {
        deleteFilesInDist({ language, isLocal })
        writeFiles({ language, csvData, repeatedIds, totalIdAmount, isLocal })
      }

      parseCsvData({ language: languages[language], onParsed: handleParsedCallback })
    })
  })
}

execute()
