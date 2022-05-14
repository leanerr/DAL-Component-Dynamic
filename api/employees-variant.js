const e = require('express');
const express = require('express')
const dataAccess = require('../data-access')

const router = express.Router();

router.get('/search', async (req, res) => {
    try {
        const result = await dataAccess.execute(`SearchEmployee`, [
            { name: 'Name', value: req.query.name }
        ]);
        const employees = result.recordset;

        res.json(employees);
    } catch (error) {
        res.status(500).json(error);
    }
});
router.get('/status', async (req, res) => {
    try {
        const result = await dataAccess.execute(`GetEmployeesStatus`, [], [
            { name: 'Count', value: 0 },
            { name: 'Max', value: 0 },
            { name: 'Min', value: 0 },
            { name: 'Average', value: 0 },
            { name: 'Sum', value: 0 },
        ]);
        const status = {
            Count: +result.output.Count,
            Max: +result.output.Max,
            Min: +result.output.Min,
            Average: +result.output.Average,
            Sum: +result.output.Sum
        };

        res.json(status);
    } catch (error) {
        res.status(500).json(error);
    }
});
router.get('/summary', async (req, res) => {
    try {
        const result = await dataAccess.execute(`GetSalarySummary`);
        const summary = {
            Department: result.recordsets[0],
            Job: result.recordsets[1],
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json(error);
    }
});
router.post('/many', async (req, res) => {
    try {
        const employees = req.body;
        const employeesTable = dataAccess.generateTable([
            { name: 'Code', type: dataAccess.mssql.TYPES.VarChar(50) },
            { name: 'Name', type: dataAccess.mssql.TYPES.VarChar(50) },
            { name: 'Job', type: dataAccess.mssql.TYPES.VarChar(50) },
            { name: 'Salary', type: dataAccess.mssql.TYPES.Int },
            { name: 'Department', type: dataAccess.mssql.TYPES.VarChar(50) }
        ], employees);

        const result = await dataAccess.execute(`AddEmployees`, [
            { name: 'Employees', value: employeesTable }
        ]);
        const newEmployees = result.recordset;
        res.json(newEmployees);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
});


// First Attempt

router.get('/:id', async (req, res) => {
    try {
        const result = await dataAccess.querySelectById( Table = 'Employee' ,[
            { name: 'Id', value: req.params.id ,operator : '=' }
        ]);
       // console.log(result)
        const employee = result.recordset.length ? result.recordset[0] : null;

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});
//second Attempt  orderby ID DESC

router.get('/', async (req, res) => {
    try {
        const result = await dataAccess.querySelectByORDER('Employee', order='DESC');
        const employees = result.recordset;

        res.json(employees);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
});
// 3rd Attempt post / insert to employee

///start  new 3
router.post('/', async (req, res) => {
    try {
       
        // passing input as arrays
        const result = await dataAccess.queryInput(
            'Employee',
            [
                { name: 'Code', value: req.body.Code },
                { name: 'Salary', value: req.body.Salary },
                { name: 'Job', value: req.body.Job },
                { name: 'Department', value: req.body.Department },
                { name: 'Name', value: req.body.Name },
            ]
        );
       /*
        // passing input as entity
        const result = await dataAccess.queryEntityInpute(
         'Employee',
          req.body
        );
         */
        const employee = req.body;
        employee.Id = result.recordset[0].Id;
        res.json(employee);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update  4rth Attempt
router.put('/:id', async (req, res) => {
    try {
        if (+req.params.id !== req.body.Id) {
            res.status(400).json({
                message: 'Mismatched identity'
            });
            return;
        }

        const result = await dataAccess.querySelectById('Employee' , [
            { name: 'Id', value: req.params.id ,operator : '=' }
        ]);

        let employee = result.recordset.length ? result.recordset[0] : null;
        if (employee) {
            await dataAccess.queryUpdate(
            'Employee', 
            [
                { name: 'Code', value: req.body.Code },
                { name: 'Salary', value: req.body.Salary },
                { name: 'Job', value: req.body.Job },
                { name: 'Department', value: req.body.Department },
                { name: 'Name', value: req.body.Name },
                { name: 'Id' , value : req.body.Id}
            ]
            );

            employee = { ...employee, ...req.body };

            res.json(employee);
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});
// Delete 5th Attempt
router.delete('/:id', async (req, res) => {
    try {
        const result = await dataAccess.querySelectById( 'Employee' ,[
            { name: 'Id', value: req.params.id ,operator : '=' }
        ]);

        let employee = result.recordset.length ? result.recordset[0] : null;
        if (employee) {
            await dataAccess.queryDelete('Employee' , [
                { name: 'Id', value: req.params.id }
            ]);
            res.json({});
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});


//new Custom
//Handle Cond1 and Cond2 for data selection


router.post('/cond1', async (req, res) => {
    try {
        const result = await dataAccess.queryCond1('Employee' , req.body );
        const employee = result.recordset.length ? result.recordset[0] : null;

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/cond2', async (req, res) => {
    try {
        const result = await dataAccess.queryCond1And2('Employee' , req.body );
        const employee = result.recordset.length ? result.recordset[0] : null;

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/cond3', async (req, res) => {
    try {
        const result = await dataAccess.queryCond1And2And3('Employee' , req.body );
        const employee = result.recordset.length ? result.recordset[0] : null;

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({
                message: 'Record not found'
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// Custom Big Query
router.post('/custom', async (req, res) => {
    try {
        console.log(Object.keys(req.body).length)

         if (Object.keys(req.body).length == 2) {
            const result = await dataAccess.CustomquerySelectById( Table = 'Employee',[
                { name: 'Id', value: req.body.Id, operator : '='},
                { name: 'Department', value: req.body.Department, operator : '='}
            ]);
            const employee = result.recordset.length ? result.recordset[0] : null;

            if (employee) {
                res.json(employee);
            } else {
                res.status(404).json({
                    message: 'Record not found'
                });
            }
        }
        
        else if (Object.keys(req.body).length ==3) {
            const result = await dataAccess.CustomquerySelectById( Table = 'Employee',[
                { name: 'Id', value: req.body.Id, operator : '='},
                { name: 'Job', value: req.body.Job, operator : '='},
                { name: 'Department', value: req.body.Department , operator : '='}
            ]);
            const employee = result.recordset.length ? result.recordset[0] : null;

            if (employee) {
                res.json(employee);
            } else {
                res.status(404).json({
                    message: 'Record not found'
                });
            }
        }
        else if (Object.keys(req.body).length ==4) {
            const result = await dataAccess.CustomquerySelectById( Table = 'Employee',[
                { name: 'Id', value: req.body.Id, operator : '='},
                { name: 'Job', value: req.body.Job, operator : '='},
                { name: 'Department', value: req.body.Department , operator : '='},
                { name: 'Name', value: req.body.Name , operator : '='}
    
            ]);
            const employee = result.recordset.length ? result.recordset[0] : null;

            if (employee) {
                res.json(employee);
            } else {
                res.status(404).json({
                    message: 'Record not found'
                });
            }
        }
        else {
            const result = await dataAccess.CustomquerySelectById( Table = 'Employee',[
                { name: 'Id', value: req.body.Id, operator : '='}
            ]);
       // console.log(result)
       const employee = result.recordset.length ? result.recordset[0] : null;

       if (employee) {
           res.json(employee);
       } else {
           res.status(404).json({
               message: 'Record not found'
           });
       }
        }

   

    } catch (error) {
        res.status(500).json(error);
    }
});
module.exports = router;