const express = require('express');
const router = express.Router();

const main = require('../main');

// Some information for queries
const TABLE = 'actorsinseries';
const SERIES_TABLE = 'series';
const ACTORS_TABLE = 'actors';
const ORDER_BY = 'ORDER BY id_series, id_actors ASC';
const ORDER_BY_ID_SERIES = 'ORDER BY id ASC';
const ORDER_BY_ID_ACTORS = 'ORDER BY id ASC';

// Some information for UI
const COLUMNS = ['id', 'id_series', 'id_actors'];
const COLUMNS_ALT = ['#', '# Series', '(Title)', '# Actor', '(Name Surname)'];

// Some information for routing
const CHANGE_ROUTE = 'change/actorsinseries';

router.post('/delete/:id', function(req, res) {
    main.deleteRow(TABLE, `id = ${req.params.id}`, function (err, statusCode,
        msg) {

        if (err) {
            res.status(statusCode).send(msg);
        }

        res.status(statusCode).redirect(`/${TABLE}`);;

    });
});

function getSeriesInfo(callback) {
    main.selectPartialInfo(SERIES_TABLE, 'id, title', ORDER_BY_ID_SERIES,
        function (err, statusCode, msg, rows) {
            callback({err: err, statusCode: statusCode, msg: msg, rows: rows});
    });
}

function getActorsInfo(callback) {
    main.selectPartialInfo(ACTORS_TABLE, 'id, name, last_name',
        ORDER_BY_ID_ACTORS, function (err, statusCode, msg, rows) {
            callback({err: err, statusCode: statusCode, msg: msg, rows: rows});
    });
}

var operation = null;
var id = 0;

router.post('/insert', function(req, res) {

    operation = main.OP_INSERT;
    id = 0;

    getSeriesInfo(function(seriesInfo) {

        if (seriesInfo.err) {
            res.status(seriesInfo.statusCode).render(CHANGE_ROUTE,
                {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, seriesInfo: [],
                actorsInfo: [], rows: null, errors: [{ msg: seriesInfo.msg }]});
        }

        getActorsInfo(function(actorsInfo) {

            if (actorsInfo.err) {
                res.status(actorsInfo.statusCode).render(CHANGE_ROUTE,
                    {dbName: main.DB_NAME_ALT,
                    table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                    operation: operation, seriesInfo: [],
                    actorsInfo: [], rows: null, errors: [{ msg: actorsInfo.msg }]});
            }

            res.status(main.OK).render(CHANGE_ROUTE, {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, seriesInfo: seriesInfo.rows,
                actorsInfo: actorsInfo.rows, rows: null, errors: null});

        });

    });

});

router.post('/update/:id', function(req, res) {

    operation = main.OP_UPDATE;
    id = req.params.id;

    getSeriesInfo(function(seriesInfo) {

        if (seriesInfo.err) {
            res.status(seriesInfo.statusCode).render(CHANGE_ROUTE,
                {dbName: main.DB_NAME_ALT,
                table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                operation: operation, seriesInfo: [],
                actorsInfo: [], rows: null, errors: [{ msg: seriesInfo.msg }]});
        }

        getActorsInfo(function(actorsInfo) {

            if (actorsInfo.err) {
                res.status(actorsInfo.statusCode).render(CHANGE_ROUTE,
                    {dbName: main.DB_NAME_ALT,
                    table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                    operation: operation, seriesInfo: [],
                    actorsInfo: [], rows: null, errors: [{ msg: actorsInfo.msg }]});
            }

            main.selectRow(TABLE, `id = ${req.params.id}`, function (err,
                statusCode, msg, row) {
                if (err) {
                    res.status(statusCode).render(CHANGE_ROUTE,
                        {dbName: main.DB_NAME_ALT,
                        table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, seriesInfo: seriesInfo.rows,
                        actorsInfo: actorsInfo.rows, rows: row,
                        errors: [{ msg: msg }]});
                }
                else {
                    res.status(statusCode).render(CHANGE_ROUTE,
                        {dbName: main.DB_NAME_ALT,
                        table: TABLE, columns: COLUMNS, columnsAlt: COLUMNS_ALT,
                        operation: operation, seriesInfo: seriesInfo.rows,
                        actorsInfo: actorsInfo.rows, rows: row, errors: null});
                }
            });

        });

    });

});

router.post('/save', main.urlencodedParser, function(req, res) {

    const newValues = `id_series = "${req.body.id_series}", id_actors = "${
        req.body.id_actors}"`;

    if (operation === main.OP_INSERT) {
        main.insertRow(TABLE, newValues, function (err, statusCode, msg) {
            if (err) {

                getSeriesInfo(function(seriesInfo) {

                    if (seriesInfo.err) {
                        res.status(seriesInfo.statusCode).render(CHANGE_ROUTE,
                            {dbName: main.DB_NAME_ALT,
                            table: TABLE, columns: COLUMNS,
                            columnsAlt: COLUMNS_ALT,
                            operation: operation, seriesInfo: [],
                            actorsInfo: [], rows: null,
                            errors: [{ msg: msg }, { msg: seriesInfo.msg }]});
                    }

                    getActorsInfo(function(actorsInfo) {

                        if (actorsInfo.err) {
                            res.status(actorsInfo.statusCode).render(CHANGE_ROUTE,
                                {dbName: main.DB_NAME_ALT,
                                table: TABLE, columns: COLUMNS,
                                columnsAlt: COLUMNS_ALT,
                                operation: operation, seriesInfo: [],
                                actorsInfo: [], rows: null,
                                errors: [{ msg: msg }, { msg: actorsInfo.msg }]});
                        }

                        res.status(main.OK).render(CHANGE_ROUTE,
                            {dbName: main.DB_NAME_ALT,
                            table: TABLE, columns: COLUMNS,
                            columnsAlt: COLUMNS_ALT,
                            operation: operation, seriesInfo: seriesInfo.rows,
                            actorsInfo: actorsInfo.rows, rows: [req.body],
                            errors: [{ msg: msg }]});

                    });

                });
                
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

                getSeriesInfo(function(seriesInfo) {

                    if (seriesInfo.err) {
                        res.status(seriesInfo.statusCode).render(CHANGE_ROUTE,
                            {dbName: main.DB_NAME_ALT,
                            table: TABLE, columns: COLUMNS,
                            columnsAlt: COLUMNS_ALT,
                            operation: operation, seriesInfo: [],
                            actorsInfo: [], rows: null,
                            errors: [{ msg: msg }, { msg: seriesInfo.msg }]});
                    }

                    getActorsInfo(function(actorsInfo) {

                        if (actorsInfo.err) {
                            res.status(actorsInfo.statusCode).render(CHANGE_ROUTE,
                                {dbName: main.DB_NAME_ALT,
                                table: TABLE, columns: COLUMNS,
                                columnsAlt: COLUMNS_ALT,
                                operation: operation, seriesInfo: [],
                                actorsInfo: [], rows: null,
                                errors: [{ msg: msg }, { msg: actorsInfo.msg }]});
                        }

                        res.status(main.OK).render(CHANGE_ROUTE,
                            {dbName: main.DB_NAME_ALT,
                            table: TABLE, columns: COLUMNS,
                            columnsAlt: COLUMNS_ALT,
                            operation: operation, seriesInfo: seriesInfo.rows,
                            actorsInfo: actorsInfo.rows, rows: [req.body],
                            errors:[{ msg: msg }]});

                    });

                });

            }
            else {
                res.status(statusCode).redirect('.');
            }
        });
    }

});

router.use('/', function(req, res) {
    main.selectAllForIntermediateTable(TABLE, SERIES_TABLE, ACTORS_TABLE,
        `${TABLE}.id, ${TABLE}.id_series, ${TABLE}.id_actors, ${SERIES_TABLE
        }.title, ${ACTORS_TABLE}.name, ${ACTORS_TABLE
        }.last_name`, 'id_series', 'id_actors', 'id', 'id', ORDER_BY,
        function (err, statusCode, msg, rows) {
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
