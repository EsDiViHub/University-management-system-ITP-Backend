const express = require('express');
const app = express();
var mysql = require('mysql');
const con = require('../DB');
const financialRoutes = express.Router();

// get employee salary
financialRoutes.route('/getSalary/:id').get(function (req, res) {
  var id = req.params.id;
  
  sql = "SELECT s.salaryId as salId, s.basicsalary as basicSal, s.OTAmount as OTAmount, s.EPF as EPF, s.ETF as ETF, e.name as empName " +
    "FROM salary s, employee e " +
    "WHERE s.salaryId = e.salaryId AND e.employeeId = '"+id+"'; ";

  con.query(sql, function(err, result) {
    if(err) throw err;
    res.json(result);
  });
  
});

// cal attendance return OT hours
financialRoutes.route('/getOT/:id/:startDate/:endDate').get(function(req, res) {
  var id = req.params.id;
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;
  var OTHours = 0;
  var OTMinutes = 0;
  var start = new Date(startDate);
  var end = new Date(endDate);
  console.log(start + " " + end);

  sql = "SELECT arrivalTime as aTime, exitTime as eTime, date as date, employeeId as empId " +
    "FROM attendance " +
    "WHERE employeeId = '"+id+"';";

  con.query(sql, function(err, result) {
    if(err) throw err;

    for(var i in result){

      // check date range
      if(new Date(result[i].date) >= start && new Date(result[i].date) <= end ){
        
        var eTime1 = new String(result[i].eTime);
        var hours = eTime1.substring(0, 2);
        var minutes = eTime1.substring(3, 5);

        // check timeoff
        if(parseInt(hours) == 15 && parseInt(minutes) > 30){
          OTMinutes += minutes - 30;
        }
        if(parseInt(hours) > 15){
          if(parseInt(minutes) > 30){
            OTMinutes += minutes - 30;
            OTHours += hours - 15;          
          }
          if(parseInt(minutes <= 30)){
            OTMinutes += minutes;
          }
        }
         
      }

    }
    var totalOT = (OTMinutes/60) + OTHours;
    console.log(totalOT);
    res.json(totalOT);
  });
 
});


// add expences
financialRoutes.route('/add').post(function (req, res) {

  console.log(req.body);
  var id = req.body.id;
  var etype = req.body.type;
  var amount = req.body.amount;
  var date = req.body.date;
  var description = req.body.description;
  var sql = "INSERT INTO `ums`.`extraexpense`(`type`,`amount`,`date`, `employeeId`, `description`)"+
              "VALUES('"+etype+"','"+amount+"','"+date+"', '"+id+"', '"+description+"');";

  con.query(sql,function(err,result){
    if(err) throw err;
    console.log("1 record inserted, ID: " + result);
    res.json("true");
  });

});

// get filtered incomes
financialRoutes.route('/searchI/:fDate/:tDate').get(function (req, res) {
    var fDate = new Date(req.params.fDate);
    var tDate = new Date(req.params.tDate);
    var filteredIncomes = [];

    var sql =  "SELECT paymentId as paymentId, amount as amount, date as date, courseId as courseId, courseId as coueseId FROM payment;"
    con.query(sql, function (err, result) {
      if (err) throw err;

      for(var i in result){
        var date = new Date(result[i].date);

        if(date >= fDate && date <= tDate){
          filteredIncomes.push(result[i]);
        }
      }

      console.log(filteredIncomes);
      res.json(filteredIncomes);
    });
  
});

// get filtered expences
financialRoutes.route('/searchE/:fDate/:tDate').get(function (req, res) {
  var fDate = new Date(req.params.fDate);
  var tDate = new Date(req.params.tDate);
  var filteredExpences = [];

  var sql =  "SELECT ex.expenseId as expenseId, ex.type as type, ex.amount as amount, ex.date as date, ex.employeeId as employeeId, em.name as employeeName " + 
    "FROM extraexpense ex, employee em " + 
    "WHERE ex.employeeId = em.employeeId;"
  con.query(sql, function (err, result) {
    if (err) throw err;

    for(var i in result){
      var date = new Date(result[i].date);

      if(date >= fDate && date <= tDate){
        filteredExpences.push(result[i]);
      }
    }

    console.log(filteredExpences);
    res.json(filteredExpences);
  });

});

// get money requests
financialRoutes.route('/getMRequests').get(function (req, res) {
  var sql = "SELECT rq.moneyRequestId as moneyRequestId, rq.date as date, rq.amount as amount, rq.description as description, rq.status as status, em.employeeId as employeeId, em.name as employeeName " +
    "FROM moneyrequest rq, employee em " +
    "WHERE rq.employeeId = em.employeeId; ";
    "ORDER BY rq.moneyRequestId DESC;";

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });

});

// accept money requests
financialRoutes.route('/acceptMRequest').post(function (req, res){
  var id = req.body.reqId;
  var sql = "UPDATE `moneyrequest` SET `status` = 'accepted' WHERE moneyRequestId = '"+id+"' ";
  // console.log(id);

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});

// reject money requests
financialRoutes.route('/rejectMRequest').post(function (req, res){
  var id = req.body.reqId;
  var sql = "UPDATE `moneyrequest` SET `status` = 'rejected' WHERE moneyRequestId = '"+id+"' ";
  // console.log(id);

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});



// Defined edit route======================================================
financialRoutes.route('/edit/:id').get(function (req, res) {
  let id = req.params.id;
  con.query("SELECT PersonID as business_gst_number,LastName as business_name,FirstName as person_name FROM nodetest.Persons where PersonID ="+id, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});


//  Defined update route====================================================================
financialRoutes.route('/update/:id').post(function (req, res) {

        var pname = req.body.person_name;
        var bname = req.body.business_name;
        var id = parseInt(req.body.business_gst_number);

          var sql = "UPDATE `nodetest`.`Persons` SET `LastName` ='"+pname+"',`FirstName` = '"+bname+"' WHERE `PersonID`="+id;
          console.log(sql);
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result);
          res.json('Update complete');
        });
});


// Defined delete | remove | destroy route===========================================
financialRoutes.route('/delete/:id').get(function (req, res) {
  var id = parseInt(req.params.id);
  var sql ="DELETE FROM `nodetest`.`Persons` WHERE `PersonID`="+id;
    console.log(sql);
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      res.json('Successfully removed');
    });
});

module.exports = financialRoutes;
