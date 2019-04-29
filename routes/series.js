const express = require('express');
const COUNTRIES = require('../modules/countries');

const main = require('../main');

const router = express.Router();

// Some information for queries
const TABLE = 'series';
const ORDER_BY = 'ORDER BY title ASC, rating DESC';

// Some information for UI
const COLUMNS = ['#', 'title', 'country', 'description', 'rating'];
const COLUMNS_ALT = ['#', 'Title', 'Country', 'Description', 'Rating'];
const RATING_OPTIONS = ['NULL', '1', '2', '3', '4', '5'];

// Some information for routing
const CHANGE_ROUTE = 'change/series';

// Some validation information
const TITLE_MAX = 50;
const DESCRIPTION_MAX = 255;

// Some validation messages
const MSG_TITLE_NOT_EMPTY = "Title is required!";
const MSG_TITLE_MAX = `Title must contain not more than ${TITLE_MAX} symbols!`;
const MSG_TITLE_ASCII_ONLY = 'Title may contain only ASCII symbols!';

const MSG_DESCRIPTION_MAX = `Description must contain not more than ${DESCRIPTION_MAX} symbols!`;
const MSG_DESCRIPTION_ASCII_ONLY = 'Description may contain only ASCII symbols!';

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
        operation: operation, ratingOptions: RATING_OPTIONS,
        countries: COUNTRIES, rows: null, errors: null});

});

router.post('/update/:id', function(req, res) {

    operation = main.OP_UPDATE;
    id = req.params.id;

    main.selectRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg, row) {
        if (err) {
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, ratingOptions: RATING_OPTIONS,
                countries: COUNTRIES, rows: row,
                errors: [{ msg: msg }]});
        }
        else {
            if (row[0].country === null) {
                row[0].country = 'NULL';
            }
            if (row[0].rating === null) {
                row[0].rating = 'NULL';
            }
            res.status(statusCode).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, ratingOptions: RATING_OPTIONS,
                countries: COUNTRIES, rows: row,
                errors: null});
        }
    });

});

function validateRequest(req) {

    req.check('title')
        .trim()
        .notEmpty().withMessage(MSG_TITLE_NOT_EMPTY)
        .isLength({ max: TITLE_MAX }).withMessage(MSG_TITLE_MAX)
        .isAscii().withMessage(MSG_TITLE_ASCII_ONLY);

    req.check('description')
        .trim()
        .isLength({ max: DESCRIPTION_MAX }).withMessage(MSG_DESCRIPTION_MAX);

    if (req.body.description !== '') {
        req.check('description')
            .isAscii().withMessage(MSG_DESCRIPTION_ASCII_ONLY);
    }

    return req.validationErrors();

}

router.post('/save', main.urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(main.BAD_REQUEST).render(CHANGE_ROUTE, {
            dbName: main.DB_NAME_ALT, table: TABLE,
            columns: COLUMNS, columnsAlt: COLUMNS_ALT,
            operation: operation, ratingOptions: RATING_OPTIONS,
            countries: COUNTRIES, rows: [req.body],
            errors: errors});
    }
    else {

        if (req.body.country !== 'NULL') {
            req.body.country = `"${req.body.country}"`;
        }

        if (req.body.rating !== 'NULL') {
            req.body.rating = `"${req.body.rating}"`;
        }

        const newValues = `title = "${req.body.title}", country = ${
            req.body.country}, description = "${
            req.body.description}", rating = ${req.body.rating}`;

        if (operation === main.OP_INSERT) {
            main.insertRow(TABLE, newValues, function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).render(CHANGE_ROUTE, {
                        dbName: main.DB_NAME_ALT, table: TABLE,
                        columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, ratingOptions: RATING_OPTIONS,
                        countries: COUNTRIES, rows: [req.body],
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
                        operation: operation, ratingOptions: RATING_OPTIONS,
                        countries: COUNTRIES, rows: [req.body],
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
