// after `cd`ing into the `ConvertCSVIntoUsableData` directory,
// run `node ConvertSubjectTTData.js` and it will generate
// `../MockUpData/SubjectsTimeTable.json` from the CSV in `SubjectTT.csv`

function loadDataFromCSVFileAndLoadIntoJsonFile() {
    var infileCSV = 'SubjectTT.csv'
    var outfileJson = '../MockUpData/SubjectsTimeTable.json'

    fs = require('fs');
    fs.readFile(infileCSV, "utf8",  function (err,data) {
        if (err) {
            return console.log(err);
        }
        var output = convertCSV(data)
        output = output.flat(1)
        var jsonString = JSON.stringify({instances: output}, null, 2)
        fs.writeFile(outfileJson, jsonString, () => {})
    });
}

function convertCSV(data) {
    var allTextLines = data.split(/\r\n|\n/);
    var dataLines = allTextLines.slice(2)
    var years = []
    //dataLines[0] nothing
    //dataLines[1] years
    //dataLines[2] months
    //dataLines[3] nothing
    //dataLines[4] Total Number of Instances
    //dataLines[5] headers
    //dataLines[6] onwards is instance data


    years = findYears(dataLines[1])

    dataLines.splice(0, 6);;
    //console.log(dataLines)

    var output = []
    var subjectCodes = []
    var subjectNames = []
    for (var i = 0; i < dataLines.length; i++) {
        subjectCodes.push(findSubjectCode(dataLines[i]))
        subjectNames.push(findSubjectName(dataLines[i]))
        output.push(processLine(
            dataLines[i],
            years,
            subjectCodes[i] ,
            subjectNames[i]
        ))
    }
    //console.log(output)
    return output
}

function findSubjectCode(data) {
    var subjectCode = data.split(",")
    return subjectCode[0]
}

function findSubjectName(data) {
    var regex = /([A-Za-z]+, [a-zA-z\s]* \([A-Za-z]+\))|,/

    var subjectName = data.split(regex).slice(2);
    //remove undefined
    subjectName = subjectName.filter(Boolean)
    //remove "
    subjectName = subjectName.filter(item => item != "\"")

    //console.log(subjectName)
    return subjectName[0]
}

function findYears(data) {
    data = data.split(',')
    data = data.filter(Boolean)
    data = data.filter(item => item != 'Year')

    var years = []
    years.push(data[0] + data[1] + data[2] + data[3])
    years.push(data[4] + data[5] + data[6] + data[7])

    return years

}

var index = 0

function processLine(data, years, subjectCode ,subjectName) {

    data = data.split(',')

    if (data[0] == 'CSE3NWX') {
        data.splice(0, 3)
    } else {
        data.splice(0, 2)
    }

    var startDate = ""
    var endDate = ""


    var instance = {
        "SubjectCode": subjectCode,
        "SubjectName": subjectName,
        "StartDate": startDate,
        "EndDate": endDate,
        "Load": 1.0,
        "CurrentLoad": 0.0,
        "index": index
    };

    var instances = []

    for (var j = 0; j < data.length; j++) {
        startDate = ''
        endDate = ''

        switch (true) {
            case data[j].toLowerCase() == "x" && j === 0:
                startDate = years[0].toString() + "-01"
                endDate = years[0].toString() + "-03"
                break;

            case data[j].toLowerCase() == "x" && j === 1:
                startDate = years[0].toString() + "-02"
                endDate = years[0] + "-04"
                break;

            case data[j].toLowerCase() == "x" && j === 2:
                startDate = years[0].toString() + "-03"
                endDate = years[0] + "-05"
                break;

            case data[j].toLowerCase() == "x" && j == 3:
                startDate = years[0].toString() + "-04"
                endDate = years[0] + "-06"
                break;

            case data[j].toLowerCase() == "x" && j == 4:
                startDate = years[0].toString() + "-05"
                endDate = years[0] + "-07"
                break;

            case data[j].toLowerCase() == "x" && j == 5:
                startDate = years[0].toString() + "-06"
                endDate = years[0] + "-08"
                break;

            case data[j].toLowerCase() == "x" && j == 6:
                startDate = years[0].toString() + "-07"
                endDate = years[0] + "-09"
                break;

            case data[j].toLowerCase() == "x" && j == 7:
                startDate = years[0].toString() + "-08"
                endDate = years[0] + "-10"
                break;

            case data[j].toLowerCase() == "x" && j == 8:
                startDate = years[0].toString() + "-09"
                endDate = years[0] + "-11"
                break;

            case data[j].toLowerCase() == "x" && j == 9:
                startDate = years[0].toString() + "-10"
                endDate = years[0] + "-12"
                break;

            case data[j].toLowerCase() == "x" && j == 10:
                var nextYear = (parseInt(years[0]) + 1).toString()
                startDate = years[0].toString() + "-11"
                endDate = nextYear + "-01"
                break;

            case data[j].toLowerCase() == "x" && j == 11:
                var nextYear = (parseInt(years[0]) + 1).toString()
                startDate = years[0].toString() + "-12"
                endDate = nextYear + "-02"
                break;

            case data[j].toLowerCase() == "x" && j == 12:
                startDate = years[1].toString() + "-01"
                endDate = years[1] + "-03"
                break;

            case data[j].toLowerCase() == "x" && j == 13:
                startDate = years[1].toString() + "-02"
                endDate = years[1] + "-04"
                break;

            case data[j].toLowerCase() == "x" && j == 14:
                startDate = years[1].toString() + "-03"
                endDate = years[1] + "-05"
                break;

            case data[j].toLowerCase() == "x" && j == 15:
                startDate = years[1].toString() + "-04"
                endDate = years[1] + "-06"
                break;

            case data[j].toLowerCase() == "x" && j == 16:
                startDate = years[1].toString() + "-05"
                endDate = years[1] + "-07"
                break;

            case data[j].toLowerCase() == "x" && j == 17:
                startDate = years[1].toString() + "-06"
                endDate = years[1] + "-08"

            case data[j].toLowerCase() == "x" && j == 18:
                startDate = years[1].toString() + "-07"
                endDate = years[1] + "-09"
                break;

            case data[j].toLowerCase() == "x" && j == 19:
                startDate = years[1].toString() + "-08"
                endDate = years[1] + "-10"
                break;

            case data[j].toLowerCase() == "x" && j == 20:
                startDate = years[1].toString() + "-09"
                endDate = years[1] + "-11"

            case data[j].toLowerCase() == "x" && j == 21:
                startDate = years[1].toString() + "-10"
                endDate = years[1] + "-12"
                break;

            case data[j].toLowerCase() == "x" && j == 22:
                var nextYear = (parseInt(years[1]) + 1).toString()
                startDate = years[1].toString() + "-11"
                endDate = nextYear.toString() + "-01"
                break;

            case data[j].toLowerCase() == "x" && j == 23:
                var nextYear = (parseInt(years[1]) + 1).toString()
                startDate = years[1].toString() + "-12"
                endDate = nextYear.toString() + "-02"
                break;
        }

        index = index + 1

        instance = {
            "SubjectCode": subjectCode,
            "SubjectName": subjectName,
            "StartDate": startDate,
            "EndDate": endDate,
            "Load": 1.0,
            "CurrentLoad": 0.0,
            "index": index
        };

        if (startDate !== ''){
            instances.push(instance)
        }
    }
    return instances;
}


loadDataFromCSVFileAndLoadIntoJsonFile()