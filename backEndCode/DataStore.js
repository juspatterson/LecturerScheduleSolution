

function test() {
    $('#test').text($('#test').text() + " test");
}

var instance = function instance(subjectCode, subjectName ,startMonth ,endMonth ,numberOfStudents) {
    this.subjectCode = subjectCode;
    this.subjectName = subjectName;
    this.startMonth = startMonth;
    this.endMonth = endMonth;
    this.numberOfStudents = numberOfStudents;

    function getSubjectCode() {
        return subjectCode
    }
}

var instances = new Array();

function loadDataForSubjectsTimeTable() {
    table = $("#table_id")



    $.getJSON('../MockUpData/SubjectsTimeTable.json', function (subjectsTimeTable) {
        //console.log(subjectsTimeTable.instances)

        $.each(subjectsTimeTable.instances,
            function (key, value) {

            // table.DataTable({
            //     'data': value,
            //     'columns': [
            //         {'data': value.subjectName},
            //         {'data': 'subjectName'},
            //         {'data': 'startMonth'},
            //         {'data': 'endMonth'},
            //         {'data': 'numberOfStudents'}
            //     ]
            // });

                instances.push(new instance(
                    value.SubjectCode,
                    value.SubjectName,
                    value.StartMonth,
                    value.EndMonth,
                    value.NumberOfStudents,
                ))


        })



        //test code
        $('#test').text( " subject: " + instances[0].subjectName);
    })



        return instances

}