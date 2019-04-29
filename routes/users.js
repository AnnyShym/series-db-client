const express = require('express');
const router = express.Router();

const main = require('../main');

// Some information for queries
const TABLE = 'users';
const ORDER_BY = 'ORDER BY id ASC';

// Some information for UI
const COLUMNS = ['#', 'login', 'password'];
const COLUMNS_ALT = ['#', 'Login', 'Password'];

// Some information for routing
const CHANGE_ROUTE = 'change/users';

// Validation patterns
const DIGITS_PATTERN = '[0-9]';
const LOW_LATIN_PATTERN = '[a-z]';
const UP_LATIN_PATTERN = '[A-Z]';

// Some validation information
const LOGIN_MAX = 50;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

// Some validation messages
const MSG_LOGIN_INCORRECT = 'Login should be a valid email!';
const MSG_LOGIN_MAX = `Login must contain not more than ${LOGIN_MAX} symbols!`;

const MSG_PASSWORD_MIN = `Password must contain at least ${PASSWORD_MIN} symbols!`;
const MSG_PASSWORD_MAX = `Password must contain not more than ${PASSWORD_MAX} symbols!`;
const MSG_PASSWORD_ASCII_ONLY = 'Password may contain only ASCII symbols!';
const MSG_PASSWORD_DIGITS = 'Password must contain at least 1 digital!';
const MSG_PASSWORD_LOW_LATIN = 'Password must contain at least 1 latin lowercase letter!';
const MSG_PASSWORD_UP_LATIN = 'Password must contain at least 1 latin uppercase letter!';

router.post('/delete/:id', function(req, res) {
    main.deleteRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg) {

        if (err) {
            res.status(statusCode).send(msg);
        }

        res.status(statusCode).redirect(`/${TABLE}`);

    });
});

var operation = null;
var id = 0;

router.post('/insert', function(req, res) {

    operation = main.OP_INSERT;
    id = 0;

    res.status(main.OK).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
        table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
        operation: operation, rows: null, errors: null});

});

router.post('/update/:id', function(req, res) {

    operation = main.OP_UPDATE;
    id = req.params.id;

    main.selectRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg, row) {
        if (err) {
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, rows: row,
                errors: [{ msg: msg }]});
        }
        else {
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, rows: row,
                errors: null});
        }
    });

});

function validateRequest(req) {

    req.check('login')
        .trim()
        .isEmail().withMessage(MSG_LOGIN_INCORRECT)
        .isLength({ max: LOGIN_MAX }).withMessage(MSG_LOGIN_MAX)

    req.check('password')
        .isLength({ min: PASSWORD_MIN }).withMessage(MSG_PASSWORD_MIN)
        .isLength({ max: PASSWORD_MAX }).withMessage(MSG_PASSWORD_MAX)
        .isAscii().withMessage(MSG_PASSWORD_ASCII_ONLY)
        .matches(DIGITS_PATTERN).withMessage(MSG_PASSWORD_DIGITS)
        .matches(LOW_LATIN_PATTERN).withMessage(MSG_PASSWORD_LOW_LATIN)
        .matches(UP_LATIN_PATTERN).withMessage(MSG_PASSWORD_UP_LATIN);

    return req.validationErrors();

}

router.post('/save', main.urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(main.BAD_REQUEST).render(CHANGE_ROUTE, {
            dbName: main.DB_NAME_ALT, table: TABLE,
            columns: COLUMNS, columnsAlt: COLUMNS_ALT,
            operation: operation, rows: [req.body],
            errors: errors});
    }
    else {

        const newValues = `login = "${req.body.login}", password = "${
            req.body.password}"`;

        if (operation === main.OP_INSERT) {
            main.insertRow(TABLE, newValues, function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).render(CHANGE_ROUTE, {
                        dbName: main.DB_NAME_ALT, table: TABLE,
                        columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, rows: [req.body],
                        errors: [{ msg: msg }]});
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
                        operation: operation, rows: [req.body],
                        errors: [{ msg: msg }]});
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
