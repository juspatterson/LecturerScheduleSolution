// after `cd`ing into the `ConvertCSVIntoUsableData` directory,
// run `js ConvertLectureSMEData.js` and it will generate
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
        var jsonString = JSON.stringify(output)
        updateDatabase(jsonString)

        // for creating a json file
        // var jsonString = JSON.stringify({instances: output}, null, 2)
        // fs.writeFile(outfileJson, jsonString, () => {})

    });
}

function updateDatabase(data) {
    const axios = require('axios');

    axios({
        method: 'post',
        url: "https://stick-dream.bnr.la/api/schedules/lecturers/update",
        async: true,
        data: 'data=' + data
    })
        .then(function (response) {
            console.log(response);
            console.log("data has been added to the database.");
            console.log(response.data);
        })
        .catch(function (error) {
            console.log("error!!!!!!!");
            console.log(error);
        });
}

function convertCSV(data) {
    var allTextLines = data.split(/\r\n|\n/);
    var datalines = allTextLines.slice(2)
    var regex = /([A-Za-z]+, [a-zA-z\s]* \([A-Za-z]+\))|,/
    var subjectCodes = allTextLines[1].split(',').slice(2);
    var output = []
    for (var i = 0; i < datalines.length; i++) {
        output.push(processLine(datalines[i], subjectCodes))
    }
    return output
}

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

function processLine(line, subjectCodes) {
    var data = line.split(',');
    var lecturerName = data[0]
    var lecturerLoad = data[1]
    var subjectsCodeLecturerCanTeach = [];
    var subjectsNameLecturerCanTeach = [];

    for (var j = 2; j < data.length; j++) {
        if (data[j].toLowerCase() == "x")
            subjectsCodeLecturerCanTeach
                .push(subjectCodes[j - 2]);
    }

    const lecturer = {
        Name: lecturerName,
        BaseLoad: lecturerLoad,
        SubjectsCodesLecturerCanTeach: subjectsCodeLecturerCanTeach,
        MaximumLoad: formatter.format(lecturerLoad * 6),
        CurrentLoad: 0
    };

    return lecturer;
}

loadDataFromCSVFileAndLoadIntoJsonFile()