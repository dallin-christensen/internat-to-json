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
  es: {
    name: 'spanish',
    row: 4,
  },
}

// const selectedLanguage = 'es'

// const languageName = languages[selectedLanguage].name
// const languageRow = languages[selectedLanguage].row


// const csvData = {};
// const repeatedIds = [];
// let totalIdAmount = 0;


const deleteFilesInDist = ({ language }) => {
  fsExtra.emptyDirSync(`./dist/${language.name}`)
}

const writeFiles = ({ language, csvData, repeatedIds, totalIdAmount }) => {

  const sections = Object.keys(csvData)

  sections.forEach(sectionName => {
    const section = csvData[sectionName]
    const data = JSON.stringify(section, null, 2)

    fs.writeFileSync(`./dist/${language.name}/${sectionName}.json`, data)
  })

  if (repeatedIds.length) {
    console.log({ repeatedIds })
  }

  console.log(`Contratulations, ${totalIdAmount} ${language.name} ids created!`)
}


// const handleParsedData = ({ language, csvData, repeatedIds, totalIdAmount }) => {
//   deleteFilesInDist({ language })
//   writeFiles({ language, csvData, repeatedIds, totalIdAmount })
// }


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

      csvData[section][phraseId] = csvrow[language.row].replace('\\', '').replace('\\', '')
    }
  })
  .on('end',function() {
    onParsed({ language, csvData, repeatedIds, totalIdAmount })
    // handleParsedData({ language, csvData, repeatedIds, totalIdAmount })
  });
}

const execute = () => {
  Object.keys(languages).forEach(language => {

    const handleParsedCallback = ({ language, csvData, repeatedIds, totalIdAmount }) => {
      deleteFilesInDist({ language })
      writeFiles({ language, csvData, repeatedIds, totalIdAmount })
    }

    parseCsvData({ language: languages[language], onParsed: handleParsedCallback })
  })
}

execute()
