var maxGrade = 4;

var home = {
    init: function () {

        $('#calGradeform').bootstrapValidator({
            // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                subject: {
                    validators: {
                        notEmpty: {
                            message: 'โปรดระบุวิชา'
                        }
                    }
                },
                allCredit: {
                    validators: {
                        // stringLength: {
                        //     max: 4,
                        //     message: 'โปรดระบุหน่วยกิตเดิมทั้งหมด 3 หลัก'
                        // },
                        notEmpty: {
                            message: 'โปรดระบุหน่วยกิตเดิมทั้งหมด'
                        },
                        between: {
                            min: 0,
                            max: 9999,
                            message: 'โปรดระบุเป็นตัวเลขที่ถูกต้อง'
                        }
                    }
                },
                avgGrade: {
                    validators: {
                        stringLength: {
                            max: 4,
                        },
                        notEmpty: {
                            message: 'โปรดระบุเกรดเฉลี่ย'
                        },
                        between: {
                            min: 0,
                            max: 4,
                            message: 'ค่าสูงสุดของเกรด = 4'
                        }
                    }
                },
                newCredit: {
                    validators: {
                        stringLength: {
                            max: 3,
                        },
                        notEmpty: {
                            message: 'โปรดระบุหน่วยกิตใหม่'
                        },
                        between: {
                            min: 0,
                            max: 9999,
                            message: 'โปรดระบุเป็นตัวเลขที่ถูกต้อง'
                        }
                    }
                },
                goalGrade: {
                    validators: {
                        stringLength: {
                            max: 4,
                        },
                        notEmpty: {
                            message: 'โปรดระบุเกรดเฉลี่ยที่ต้องการ'
                        },
                        between: {
                            min: 0,
                            max: 4,
                            message: 'ค่าสูงสุดของเกรด = 4'
                        }
                    }
                }
            },
            submitHandler: function (validator, form, submitButton) {
                home.saveProcess();
            }
        })

        $("#btnReset").click(() => {
            home.clearData();
        });
    },
    saveProcess: function () {

        var data = home.getData();
        data = home.calculateGrade(data);

        if (data.answerGrade > maxGrade) {
            data = home.reCalculateGrade(data);
        }

        home.setData(data);

        return false;
    },
    clearData: function () {
        $('#success_message').slideUp({ opacity: "hide" }, "slow");
        $('#calGradeform').data('bootstrapValidator').resetForm();

        $("#lbSubject").text(data.subject);
        $("#lbGoalGrade").text(data.goalGrade);
        $("#lbResultGrade").text(data.resultGrade);
    },
    getData: function () {
        var data = {
            subject: $("#subject").val(),//วิชา
            allCredit: $("#allCredit").val() * 1.0,//หน่วยกิตเดิมทั้งหมด
            avgGrade: $("#avgGrade").val() * 1.0,//เกรดเฉลี่ยเดิม
            newCredit: $("#newCredit").val() * 1.0,//หน่วยกิตใหม่
            goalGrade: $("#goalGrade").val() * 1.0,//เกรดเฉลี่ยที่ต้องการ                       
        };
        return data;
    },
    calculateGrade: function (data) {

        data.sumGrade = data.allCredit * data.avgGrade;//เกรดรวม
        data.newAvgGrade = (data.goalGrade * (data.allCredit + data.newCredit)) - data.sumGrade;//เกรดเฉลี่ยใหม่
        data.answerGrade = (data.newAvgGrade) / data.newCredit;//เกรดที่ต้องทำให้ได้
        data.answerGrade = data.answerGrade;
        data.resultGrade = home.calculateResultGrade(data.answerGrade);

        return data;
    },
    calculateResultGrade: function (answerGrade) {

        let floorVal = Math.floor(answerGrade);//เอาค่า floor เช่น 3.5 = 3
        let diffVal = answerGrade - floorVal; // เอาค่า diff เพื่อมา เทียบทศนิยม

        //เทียบ ทศนิยมว่าตกที่ range ไหน
        if (diffVal == 0 || diffVal == 0.5) return answerGrade;
        else if (diffVal < 0.5) answerGrade = floorVal + 0.5;
        else answerGrade = floorVal + 1;

        return answerGrade;
    },
    setData: function (data) {

        //วิชา
        $("#lbSubject").text(data.subject);

        //เกรดเฉลี่ยที่ต้องการ        
        if (data.answerGrade > maxGrade) {
            data.goalGrade = data.goalGrade + " (สูงสุดที่สามารถทำได้)";
        }
        $("#lbGoalGrade").text(data.goalGrade);

        //เกรดที่ต้องทำ
        if (data.resultGrade < 0) {
            data.resultGrade = "ไม่สามารถคำนวณเกรดได้ เนื่องจากมีค่า < 0";
        }
        else if (data.resultGrade > 0 && data.resultGrade < 1) {
            data.resultGrade = 1;
        }
        else if (data.resultGrade < maxGrade) {
            data.resultGrade = data.resultGrade + " หรือมากกว่านั้น";

        }
        $("#lbResultGrade").text(data.resultGrade);

        //แสดง success
        $('#success_message').slideDown({ opacity: "show" }, "slow");
        $("#btnSubmit").removeAttr('disabled');

        //Add to table
        home.insertData(data);
    },
    reCalculateGrade: function (data) {
        data.resultGrade = maxGrade; //กำหนดให้เกรดที่ทำได้สูงสุด = 4
        data.goalGrade = (data.sumGrade + (data.resultGrade * data.newCredit)) / (data.allCredit + data.newCredit);
        data.goalGrade = data.goalGrade.toFixed(2);
        return data;
    },
    insertData: function (data) {
        var row = "<tr>";
        row = row + "<td class='text-center'>" + data.subject + "</td>";
        row = row + "<td class='text-center'>" + data.allCredit + "</td>";
        row = row + "<td class='text-center'>" + data.avgGrade + "</td>";
        row = row + "<td class='text-center'>" + data.newCredit + "</td>";
        row = row + "<td class='text-center'>" + data.goalGrade + "</td>";
        row = row + "<td class='text-center'>" + data.resultGrade + "</td>";
        row = row + "<td class='text-center'><button class='btn btn-xs btn-danger' onclick='home.deleteData(this);' ><span class='glyphicon glyphicon-trash'></span> ลบ</button></td>";
        row = row + "</tr>";
        $("#tblData tbody").append(row);

        $("#divTable").show();
    },
    deleteData: function (r) {
        var row = r.parentNode.parentNode.rowIndex;
        document.getElementById("tblData").deleteRow(row);
    }
};