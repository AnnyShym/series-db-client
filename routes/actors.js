const express = require('express');
const router = express.Router();

const main = require('../main');

const COUNTRIES = require('../modules/countries');

// Some information for queries
const TABLE = 'actors';
const ORDER_BY = 'ORDER BY name, middle_name, last_name ASC';

// Some information for UI
const COLUMNS = ['#', 'name', 'middle_name', 'last_name', 'citizenship'];
const COLUMNS_ALT = ['#', 'Name', 'Middle Name', 'Last Name', 'Citizenship'];

// Some information for routing
const CHANGE_ROUTE = 'change/actors';

// Validation patterns
const NAME_PATTERN = /^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?$/;
const MIDDLE_NAME_PATTERN = /^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?$/;
const LAST_NAME_PATTERN = /^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?(\,\s[A-Za-z]+\.)?$/;

// Some validation information
const NAME_MAX = 50;

// Some validation messages
const MSG_NAME_NOT_EMPTY = "Name is required!";
const MSG_NAME_MAX = `Name must contain not more than ${NAME_MAX} symbols!`;
const MSG_NAME_PATTERN = 'Invalid name!';

const MSG_MIDDLE_NAME_MAX = `Middle name must contain not more than ${NAME_MAX} symbols!`;
const MSG_MIDDLE_NAME_PATTERN = 'Invalid middle name!';

const MSG_LAST_NAME_NOT_EMPTY = "Last name is required!";
const MSG_LAST_NAME_MAX = `Last name must contain not more than ${NAME_MAX} symbols!`;
const MSG_LAST_NAME_PATTERN = 'Invalid last name!';

router.post('/delete/:id', function(req, res) {
    main.deleteRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg) {

        if (err) {
            res.status(statusCode).send(msg);
        }

        res.status(statusCode).redirect(`/${TABLE}`);;

    });
});

var operation = null;
var id = 0;

router.post('/insert', function(req, res) {

    operation = main.OP_INSERT;
    id = 0;

    res.status(main.OK).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
        table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
        operation: operation, countries: COUNTRIES, rows: null, errors: null});

});

router.post('/update/:id', function(req, res) {

    operation = main.OP_UPDATE;
    id = req.params.id;

    main.selectRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg, row) {
        if (err) {
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, countries: COUNTRIES, rows: row,
                errors: [{ msg: msg }]});
        }
        else {
            if (row[0].citizenship === null) {
                row[0].citizenship = 'NULL';
            }
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, countries: COUNTRIES, rows: row,
                errors: null});
        }
    });

});

function validateRequest(req) {

    req.check('name')
        .trim()
        .notEmpty().withMessage(MSG_NAME_NOT_EMPTY)
        .isLength({ max: NAME_MAX }).withMessage(MSG_NAME_MAX)
        .matches(NAME_PATTERN, 'i')
        .withMessage(MSG_NAME_PATTERN);

    req.check('middle_name')
        .trim()
        .isLength({ max: NAME_MAX }).withMessage(MSG_MIDDLE_NAME_MAX)

    if (req.body.middle_name !== '') {
        req.check('middle_name')
            .matches(MIDDLE_NAME_PATTERN, 'i')
            .withMessage(MSG_MIDDLE_NAME_PATTERN);
    }

    req.check('last_name')
        .trim()
        .notEmpty().withMessage(MSG_LAST_NAME_NOT_EMPTY)
        .isLength({ max: NAME_MAX }).withMessage(MSG_LAST_NAME_MAX)
        .matches(LAST_NAME_PATTERN, 'i')
        .withMessage(MSG_LAST_NAME_PATTERN);

    return req.validationErrors();

}

router.post('/save', main.urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(main.BAD_REQUEST).render(CHANGE_ROUTE, {
            dbName: main.DB_NAME_ALT, table: TABLE,
            columns: COLUMNS, columnsAlt: COLUMNS_ALT,
            operation: operation, countries: COUNTRIES, rows: [req.body],
            errors: errors});
    }
    else {

        if (req.body.citizenship !== 'NULL') {
            req.body.citizenship = `"${req.body.citizenship}"`;
        }

        const newValues = `name = "${req.body.name}", middle_name = "${
            req.body.middle_name}", last_name = "${
            req.body.last_name}", citizenship = ${req.body.citizenship}`;

        if (operation === main.OP_INSERT) {
            main.insertRow(TABLE, newValues, function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).render(CHANGE_ROUTE, {
                        dbName: main.DB_NAME_ALT, table: TABLE,
                        columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, countries: COUNTRIES,
                        rows: [req.body], errors: [{ msg: msg }]});
                }
                else {
                    res.status(statusCode).redirect('.');
                }
            });
        }
        else {
            main.updateRow(TABLE, newValues, `id = ${id}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).render(CHANGE_ROUTE, {
                        dbName: main.DB_NAME_ALT, table: TABLE,
                        columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, countries: COUNTRIES,
                        rows: [req.body], errors: [{ msg: msg }]});
                }
                else {
                    res.status(statusCode).redirect('.');
                }
            });
        }
    }
});

router.use('/', function(req, res) {
    main.selectAllRows(TABLE, ORDER_BY, function (err, statusCode, msg, rows) {
        if (err) {
            res.status(statusCode).render(main.TABLE_ROUTE,
                {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                rows: rows, errors: [{ msg: msg }]});
        }
        else {
            res.status(statusCode).render(main.TABLE_ROUTE,
                {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                rows: rows, errors: []});
        }
    });
});

module.exports = router;
