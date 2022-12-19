// after `cd`ing into the `ConvertCSVIntoUsableData` directory,
// run `node ConvertLectureSMEData.js` and it will generate
// `../MockUpData/lecturerSME.json` from the CSV in `lecturerSME.csv`

function loadDataFromCSVFileAndLoadIntoJsonFile() {
    var infileCSV = 'lecturerSME.csv'
    var outfileJson = '../MockUpData/lecturerSME.json'

    fs = require('fs');
    fs.readFile(infileCSV, "utf8",  function (err,data) {
        if (err) {
            return console.log(err);
        }
        var output = convertCSV(data)
        var jsonString = JSON.stringify({lectures: output}, null, 2)
        fs.writeFile(outfileJson, jsonString, () => {})
    });
}

function convertCSV(data) {
    var allTextLines = data.split(/\r\n|\n/);
    var datalines = allTextLines.slice(2)
    var regex = /([A-Za-z]+, [a-zA-z\s]* \([A-Za-z]+\))|,/
    var subjectName = allTextLines[0].split(regex).slice(2);
    //remove undefined
    subjectName = subjectName.filter(Boolean)
    //remove "
    subjectName = subjectName.filter(item => item != "\"")

    var subjectCodes = allTextLines[1].split(',').slice(2);
    var output = []
    for (var i = 0; i < datalines.length; i++) {
        output.push(processLine(datalines[i], subjectCodes,subjectName))
    }
    return output
}

function processLine(line, subjectCodes, subjectName) {
        var data = line.split(',');
        var lecturerName = data[0]
        var lecturerLoad = data[1]
        var subjectsCodeLecturerCanTeach = [];
        var subjectsNameLecturerCanTeach = [];

        for (var j = 2; j < data.length; j++) {
            if (data[j].toLowerCase() == "x")
                subjectsCodeLecturerCanTeach
                    .push(subjectCodes[j - 2]);
                // subjectsNameLecturerCanTeach
                //     .push(subjectName[j - 2]);
        }

        const subjectsLecturerCanTeach = {
            subjectsCode: subjectsCodeLecturerCanTeach,
            // subjectsName: subjectsNameLecturerCanTeach,
        }
        const lecturer = {
            name: lecturerName,
            load: lecturerLoad,
            subjectsLecturerCanTeach: subjectsLecturerCanTeach,
            MaximumLoad: (lecturerLoad * 6).toFixed(1),
            CurrentLoad: 0
        };

        return lecturer;
}

loadDataFromCSVFileAndLoadIntoJsonFile()
