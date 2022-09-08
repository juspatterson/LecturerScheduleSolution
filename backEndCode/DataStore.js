

function test() {
    $('#test').text($('#test').text() + " test");
}

function instance(subjectCode, subjectName ,startMonth ,endMonth ,numberOfStudents) {
    this.subjectCode = subjectCode;
    this.subjectName = subjectName;
    this.startMonth = startMonth;
    this.endMonth = endMonth;
    this.numberOfStudents = numberOfStudents;
}

var instances = new Array();

function loadDataForSubjectsTimeTable() {
    $.getJSON('../MockUpData/SubjectsTimeTable.json', function (subjectsTimeTable) {
        console.log(subjectsTimeTable.instances)
        $.each(subjectsTimeTable.instances,
            function (key, value) {

                const newInstance = new instance(
                     value.SubjectCode,
                     value.SubjectName,
                     value.StartMonth,
                    value.EndMonth,
                     value.NumberOfStudents,
                )

                instances.push(newInstance)
        })

        //test code
        //$('#test').text( " subject: " + instances[0].subjectName);
    })

}