const parse = require('csv-parse')
const fs = require('fs')
const fsExtra = require('fs-extra')

const languages = {
  en: {
    name: 'english',
    row: 2,
  },
  fr: {
    name: 'french',
    row: 3,
  },
  sp: {
    name: 'spanish',
    row: 4,
  },
}

const selectedLanguage = 'fr'

const languageName = languages[selectedLanguage].name
const languageRow = languages[selectedLanguage].row


const csvData = {};
const repeatedIds = [];
let totalIdAmount = 0;


const deleteFilesInDist = () => {
  fsExtra.emptyDirSync(`./dist/${languageName}`)
}

const writeFiles = () => {

  const sections = Object.keys(csvData)

  sections.forEach(sectionName => {
    const section = csvData[sectionName]
    const data = JSON.stringify(section, null, 2)

    fs.writeFileSync(`./dist/${languageName}/${sectionName}.json`, data)
  })

  if (repeatedIds.length) {
    console.log({ repeatedIds })
  }

  console.log(`Contratulations, ${totalIdAmount} ${languageName} ids created!`)
}


const handleParsedData = () => {
  deleteFilesInDist()
  writeFiles()
}


const parseCsvData = () =>{
  fs.createReadStream('./translations.csv')
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvrow) {
    
    const phraseId = csvrow[6]

    if (phraseId && csvrow[languageRow] && phraseId !== 'ID') {

      const section = phraseId.slice(0, phraseId.indexOf('-'))

      if (!csvData[section]) {
        csvData[section] = {}
      }

      if (csvData[section][phraseId]) {
        repeatedIds.push(phraseId)
      } else {
        totalIdAmount++;
      }

      csvData[section][phraseId] = csvrow[languageRow].replace('\\', '').replace('\\', '')
    }
  })
  .on('end',function() {
    handleParsedData()
  });
}

const execute = () => parseCsvData()

execute()
