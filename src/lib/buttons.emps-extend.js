var jszip = require("./jszip.min.js");
var exportObj = {
    //params = {url:'',type:'',data:'Datatable query data',...}
    loadData:function (params, successFn) {
        app.appOption.ajax.url = app.appOption.url+params.url;
        app.appOption.ajax.type = params.type;
        app.appOption.ajax.data = JSON.stringify(params.data);
        app.appOption.ajax.asyncRequest(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,successFn,function (error) {
            console.log(error);
        });
    },
    //data is the needed export data
    //opts = {header:[],subHeader:[],fieldNames:[],subFieldNames:[],subRowList:""
    //          ajaxParams:{url:'',type:'',data:'Datatable query data',...}}
    customerExportData:function (data,opts) {
        var hasSubTable = opts.subRowList;
        //set length -1 to disabled the paging
        opts.ajaxParams.data.length = -1;
        this.loadData(opts.ajaxParams,function (result) {
            var tableData = result.data,
                setRowData = function (rowObj) {
                    var rowDataArr = [];
                    for(var i in opts.fieldNames) {
                        if(!opts.fieldNames) {
                            rowDataArr.push("");
                            continue;
                        }
                        rowDataArr.push(rowObj[opts.fieldNames[i]]);
                    }
                    return rowDataArr;
                },
                setSubRowData = function (subRowList) {
                    var dataArr = [];
                    for(var subRowIndex in subRowList) {
                        var rowDataArr = [];
                        var item = subRowList[subRowIndex];
                        for(var i in opts.subFieldNames) {
                            if(!opts.subFieldNames) {
                                rowDataArr.push("");
                                continue;
                            }
                            rowDataArr.push(item[opts.subFieldNames[i]]);
                        }
                        dataArr.push(rowDataArr);
                    }
                    return dataArr;
                },
                fixColumn = function (len,arr) {
                    for(var i=0;i<len;i++) {
                        arr.push("");
                    }
                };

            data.header = opts.header;
            for(var index=0;index < tableData.length;index++) {
                var rowObj = {
                    data:[],
                    subTable:{
                        header:opts.subHeader,
                        body:[]
                    }
                };
                rowObj.data = setRowData(tableData[index]);

                //set subRow if existed
                if(hasSubTable) {
                    var subRowDatas = tableData[index][opts.subRowList];
                    if(subRowDatas && subRowDatas.length > 0) {
                        rowObj.subTable.body = setSubRowData(subRowDatas);
                    }

                }

                data.body.push(rowObj);

                if(hasSubTable) {
                    var len = data.body[0].subTable.header.length - data.header.length;
                    fixColumn(len,rowObj.data);
                }

            }

            if(hasSubTable) {
                var len = data.body[0].subTable.header.length - data.header.length;
                fixColumn(len,data.header);
            }
        });
    },
    excelAction: function (_this, e, dt, button, config ) {
        _this.processing( true );

        var that = _this;
        var rowPos = 0;
        var getXml = function ( type ) {
            var str = excelStrings[ type ];

            //str = str.replace( /xmlns:/g, 'xmlns_' ).replace( /mc:/g, 'mc_' );

            return $.parseXML( str );
        };
        var rels = getXml('xl/worksheets/sheet1.xml');
        var relsGet = rels.getElementsByTagName( "sheetData" )[0];

        var xlsx = {
            _rels: {
                ".rels": getXml('_rels/.rels')
            },
            xl: {
                _rels: {
                    "workbook.xml.rels": getXml('xl/_rels/workbook.xml.rels')
                },
                "workbook.xml": getXml('xl/workbook.xml'),
                "styles.xml": getXml('xl/styles.xml'),
                "worksheets": {
                    "sheet1.xml": rels
                }

            },
            "[Content_Types].xml": getXml('[Content_Types].xml')
        };

        // var data = dt.buttons.exportData( config.exportOptions );
        //emps-change start
        var data = {
            body:[],
            header:[],
            footer:null
        };
        //emps-change end
        var currentRow, rowNode;
        var addRow = function ( row ) {
            currentRow = rowPos+1;
            rowNode = _createNode( rels, "row", { attr: {r:currentRow} } );

            for ( var i=0, ien=row.length ; i<ien ; i++ ) {
                // Concat both the Cell Columns as a letter and the Row of the cell.
                var cellId = createCellPos(i) + '' + currentRow;
                var cell = null;

                // For null, undefined of blank cell, continue so it doesn't create the _createNode
                if ( row[i] === null || row[i] === undefined || row[i] === '' ) {
                    continue;
                }

                row[i] = $.trim( row[i] );

                // Special number formatting options
                for ( var j=0, jen=_excelSpecials.length ; j<jen ; j++ ) {
                    var special = _excelSpecials[j];

                    // TODO Need to provide the ability for the specials to say
                    // if they are returning a string, since at the moment it is
                    // assumed to be a number
                    if ( row[i].match && ! row[i].match(/^0\d+/) && row[i].match( special.match ) ) {
                        var val = row[i].replace(/[^\d\.\-]/g, '');

                        if ( special.fmt ) {
                            val = special.fmt( val );
                        }

                        cell = _createNode( rels, 'c', {
                            attr: {
                                r: cellId,
                                s: special.style
                            },
                            children: [
                                _createNode( rels, 'v', { text: val } )
                            ]
                        } );

                        break;
                    }
                }

                if ( ! cell ) {
                    if ( typeof row[i] === 'number' || (
                        row[i].match &&
                        row[i].match(/^-?\d+(\.\d+)?$/) &&
                        ! row[i].match(/^0\d+/) )
                    ) {
                        // Detect numbers - don't match numbers with leading zeros
                        // or a negative anywhere but the start
                        cell = _createNode( rels, 'c', {
                            attr: {
                                t: 'n',
                                r: cellId
                            },
                            children: [
                                _createNode( rels, 'v', { text: row[i] } )
                            ]
                        } );
                    }
                    else {
                        // String output - replace non standard characters for text output
                        var text = ! row[i].replace ?
                            row[i] :
                            row[i].replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

                        cell = _createNode( rels, 'c', {
                            attr: {
                                t: 'inlineStr',
                                r: cellId
                            },
                            children:{
                                row: _createNode( rels, 'is', {
                                    children: {
                                        row: _createNode( rels, 't', {
                                            text: text
                                        } )
                                    }
                                } )
                            }
                        } );
                    }
                }

                rowNode.appendChild( cell );
            }

            relsGet.appendChild(rowNode);
            rowPos++;
        };

        $( 'sheets sheet', xlsx.xl['workbook.xml'] ).attr( 'name', _sheetname( config ) );

        if ( config.customizeData ) {
            config.customizeData( data );
        }

        if ( config.header ) {
            addRow( data.header, rowPos );
            // $('row c', rels).attr( 's', '2' ); // bold

            //emps-change start
            $('row c', rels).attr( 's', '32' ); // bold
            //emps-change end
        }

        for ( var n=0, ie=data.body.length ; n<ie ; n++ ) {
            // addRow( data.body[n], rowPos );

            //emps-change start
            if(data.body[n] instanceof Array) {
                addRow( data.body[n], rowPos );
                $('row:last c',rels).attr( 's', '30' ); //with backcolor
            }else {
                var rowBody = data.body[n];
                addRow(rowBody.data,rowPos);
                $('row:last c',rels).attr( 's', '30' ); //with backcolor
                if(rowBody.subTable.header && rowBody.subTable.header.length > 0){
                    addRow(rowBody.subTable.header, rowPos );
                    $('row:last c',rels).attr( 's', '27' );
                }
                var subBody = rowBody.subTable.body;
                if(subBody && subBody.length > 0) {
                    for(var index in subBody) {
                        addRow(rowBody.subTable.body[index]);
                        $('row:last c',rels).attr( 's', '25' );
                    }
                }
            }
            //emps-change end

        }

        if ( config.footer && data.footer ) {
            addRow( data.footer, rowPos);
            $('row:last c', rels).attr( 's', '2' ); // bold
        }

        // Set column widths
        var cols = _createNode( rels, 'cols' );
        $('worksheet', rels).prepend( cols );

        for ( var i=0, ien=data.header.length ; i<ien ; i++ ) {
            cols.appendChild( _createNode( rels, 'col', {
                attr: {
                    min: i+1,
                    max: i+1,
                    width: _excelColWidth( data, i ),
                    customWidth: 1
                }
            } ) );
        }

        // Let the developer customise the document if they want to
        if ( config.customize ) {
            config.customize( xlsx );
        }

        var jszip = _jsZip();
        var zip = new jszip();
        var zipConfig = {
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        _addToZip( zip, xlsx );

        if ( zip.generateAsync ) {
            // JSZip 3+
            zip
                .generateAsync( zipConfig )
                .then( function ( blob ) {
                    _saveAs( blob, _filename( config ) );
                    that.processing( false );
                } );
        }
        else {
            // JSZip 2.5
            _saveAs(
                zip.generate( zipConfig ),
                _filename( config )
            );
            _this.processing( false );
        }
    },
    //pdf action
    pdfAction: function ( _this,e, dt, button, config ) {
        _this.processing( true );

        var that = _this;
        // var data = dt.buttons.exportData( config.exportOptions );

        //emps-change start
        var data = {
            body:[],
            header:[],
            footer:null
        };
        //emps-change end

        var rows = [];
        var addSpaceIfLetterIsTooLong = function (data,len) {
            if(!data) return data;
            var dataArr = data.split('');
            var str = '';
            for(var i=0;i<dataArr.length;i++) {
                if(i % len === 0) {
                    str += ' ' + dataArr[i];
                    continue;
                }
                str += dataArr[i];
            }
            return str;
        };

        if ( config.customizeData ) {
            config.customizeData(data);
        }

        if ( config.header ) {
            rows.push( $.map( data.header, function ( d ) {
                return {
                    text: typeof d === 'string' ? d : d+'',
                    style: 'tableHeader'
                };
            } ) );
        }

        for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
            /*rows.push( $.map( data.body[i], function ( d ) {
             return {
             text: typeof d === 'string' ? d : d+'',
             style: i % 2 ? 'tableBodyEven' : 'tableBodyOdd'
             };
             } ) );*/

            //emps-change start
            if(data.body[i] instanceof Array) {
                rows.push( $.map( data.body[i], function ( d ) {
                    return {
                        text: typeof d === 'string' ? d : d+'',
                        style: i % 2 ? 'tableBodyEven' : 'tableBodyOdd'
                    };
                } ) );
            }else {
                var rowBody = data.body[i];
                rows.push( $.map( rowBody.data, function ( d ) {
                    d = typeof d === 'string' ? d : d+'';
                    d = addSpaceIfLetterIsTooLong(d,7);
                    return {
                        text: d,
                        style: 'tableBodyOdd'
                    };
                } ) );
                if(rowBody.subTable.header && rowBody.subTable.header.length > 0) {
                    rows.push( $.map( rowBody.subTable.header, function ( d ) {
                        return {
                            text: typeof d === 'string' ? d : d+'',
                            style: 'tableBodyEven'
                        };
                    } ) );
                }
                if(rowBody.subTable.body && rowBody.subTable.body.length > 0) {
                    for(var subIdx in rowBody.subTable.body) {
                        rows.push( $.map( rowBody.subTable.body[subIdx], function ( d ) {
                            d = typeof d === 'string' ? d : d+'';
                            d = addSpaceIfLetterIsTooLong(d,7);
                            return {
                                text: d,
                                style: 'tableBodyEven'
                            };
                        } ) );
                    }
                }
            }
            //emps-change end

        }

        if ( config.footer && data.footer) {
            rows.push( $.map( data.footer, function ( d ) {
                return {
                    text: typeof d === 'string' ? d : d+'',
                    style: 'tableFooter'
                };
            } ) );
        }
        var widths = [];
        for(var index in data.header) {
            widths.push("auto");
        }
        var doc = {
            pageSize: config.pageSize,
            pageOrientation: config.orientation,
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths: widths,
                        body: rows
                    },
                    layout: 'borders'//'noBorders'
                }
            ],
            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 11,
                    color: 'white',
                    fillColor: '#2d4154',
                    alignment: 'center'
                },
                tableBodyEven: {},
                tableBodyOdd: {
                    fillColor: '#cccccc'//'#f3f3f3'
                },
                tableFooter: {
                    bold: true,
                    fontSize: 11,
                    color: 'white',
                    fillColor: '#2d4154'
                },
                title: {
                    alignment: 'center',
                    fontSize: 15
                },
                message: {}
            },
            defaultStyle: {
                fontSize: 10
            }
        };

        if ( config.message ) {
            doc.content.unshift( {
                text: typeof config.message == 'function' ? config.message(dt, button, config) : config.message,
                style: 'message',
                margin: [ 0, 0, 0, 12 ]
            } );
        }

        if ( config.title ) {
            doc.content.unshift( {
                text: _title( config, false ),
                style: 'title',
                margin: [ 0, 0, 0, 12 ]
            } );
        }

        if ( config.customize ) {
            config.customize( doc, config );
        }

        var pdf = _pdfMake().createPdf( doc );

        if ( config.download === 'open' && ! _isDuffSafari() ) {
            pdf.open();
            this.processing( false );
        }
        else {
            pdf.getBuffer( function (buffer) {
                var blob = new Blob( [buffer], {type:'application/pdf'} );

                _saveAs( blob, _filename( config ) );
                that.processing( false );
            } );
        }
    }
};


function _jsZip () {
    return jszip || window.JSZip;
}
function _pdfMake () {
    return window.pdfMake;
}

/**
 * Get the file name for an exported file.
 *
 * @param {object}	config Button configuration
 * @param {boolean} incExtension Include the file name extension
 */
var _filename = function ( config, incExtension )
{
    // Backwards compatibility
    var filename = config.filename === '*' && config.title !== '*' && config.title !== undefined ?
        config.title :
        config.filename;

    if ( typeof filename === 'function' ) {
        filename = filename();
    }

    if ( filename.indexOf( '*' ) !== -1 ) {
        filename = $.trim( filename.replace( '*', $('title').text() ) );
    }

    // Strip characters which the OS will object to
    filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");

    return incExtension === undefined || incExtension === true ?
        filename+config.extension :
        filename;
};

/**
 * Get the sheet name for Excel exports.
 *
 * @param {object}	config Button configuration
 */
var _sheetname = function ( config )
{
    var sheetName = 'Sheet1';

    if ( config.sheetName ) {
        sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
    }

    return sheetName;
};

/**
 * Get the title for an exported file.
 *
 * @param {object} config	Button configuration
 */
var _title = function ( config )
{
    var title = config.title;

    if ( typeof title === 'function' ) {
        title = title();
    }

    return title.indexOf( '*' ) !== -1 ?
        title.replace( '*', $('title').text() || 'Exported data' ) :
        title;
};

/**
 * Get the newline character(s)
 *
 * @param {object}	config Button configuration
 * @return {string}				Newline character
 */
var _newLine = function ( config )
{
    return config.newline ?
        config.newline :
        navigator.userAgent.match(/Windows/) ?
            '\r\n' :
            '\n';
};

/**
 * Combine the data from the `buttons.exportData` method into a string that
 * will be used in the export file.
 *
 * @param	{DataTable.Api} dt		 DataTables API instance
 * @param	{object}				config Button configuration
 * @return {object}							 The data to export
 */
var _exportData = function ( dt, config )
{
    var newLine = _newLine( config );
    var data = dt.buttons.exportData( config.exportOptions );
    var boundary = config.fieldBoundary;
    var separator = config.fieldSeparator;
    var reBoundary = new RegExp( boundary, 'g' );
    var escapeChar = config.escapeChar !== undefined ?
        config.escapeChar :
        '\\';
    var join = function ( a ) {
        var s = '';

        // If there is a field boundary, then we might need to escape it in
        // the source data
        for ( var i=0, ien=a.length ; i<ien ; i++ ) {
            if ( i > 0 ) {
                s += separator;
            }

            s += boundary ?
                boundary + ('' + a[i]).replace( reBoundary, escapeChar+boundary ) + boundary :
                a[i];
        }

        return s;
    };

    var header = config.header ? join( data.header )+newLine : '';
    var footer = config.footer && data.footer ? newLine+join( data.footer ) : '';
    var body = [];

    for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
        body.push( join( data.body[i] ) );
    }

    return {
        str: header + body.join( newLine ) + footer,
        rows: body.length
    };
};

/**
 * Older versions of Safari (prior to tech preview 18) don't support the
 * download option required.
 *
 * @return {Boolean} `true` if old Safari
 */
var _isDuffSafari = function ()
{
    var safari = navigator.userAgent.indexOf('Safari') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1 &&
        navigator.userAgent.indexOf('Opera') === -1;

    if ( ! safari ) {
        return false;
    }

    var version = navigator.userAgent.match( /AppleWebKit\/(\d+\.\d+)/ );
    if ( version && version.length > 1 && version[1]*1 < 603.1 ) {
        return true;
    }

    return false;
};

/**
 * Convert from numeric position to letter for column names in Excel
 * @param  {int} n Column number
 * @return {string} Column letter(s) name
 */
function createCellPos( n ){
    var ordA = 'A'.charCodeAt(0);
    var ordZ = 'Z'.charCodeAt(0);
    var len = ordZ - ordA + 1;
    var s = "";

    while( n >= 0 ) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }

    return s;
}

try {
    var _serialiser = new XMLSerializer();
    var _ieExcel;
}
catch (t) {}

/**
 * Recursively add XML files from an object's structure to a ZIP file. This
 * allows the XSLX file to be easily defined with an object's structure matching
 * the files structure.
 *
 * @param {JSZip} zip ZIP package
 * @param {object} obj Object to add (recursive)
 */
function _addToZip( zip, obj ) {
    if ( _ieExcel === undefined ) {
        // Detect if we are dealing with IE's _awful_ serialiser by seeing if it
        // drop attributes
        _ieExcel = _serialiser
                .serializeToString(
                    $.parseXML( excelStrings['xl/worksheets/sheet1.xml'] )
                )
                .indexOf( 'xmlns:r' ) === -1;
    }

    $.each( obj, function ( name, val ) {
        if ( $.isPlainObject( val ) ) {
            var newDir = zip.folder( name );
            _addToZip( newDir, val );
        }
        else {
            if ( _ieExcel ) {
                // IE's XML serialiser will drop some name space attributes from
                // from the root node, so we need to save them. Do this by
                // replacing the namespace nodes with a regular attribute that
                // we convert back when serialised. Edge does not have this
                // issue
                var worksheet = val.childNodes[0];
                var i, ien;
                var attrs = [];

                for ( i=worksheet.attributes.length-1 ; i>=0 ; i-- ) {
                    var attrName = worksheet.attributes[i].nodeName;
                    var attrValue = worksheet.attributes[i].nodeValue;

                    if ( attrName.indexOf( ':' ) !== -1 ) {
                        attrs.push( { name: attrName, value: attrValue } );

                        worksheet.removeAttribute( attrName );
                    }
                }

                for ( i=0, ien=attrs.length ; i<ien ; i++ ) {
                    var attr = val.createAttribute( attrs[i].name.replace( ':', '_dt_b_namespace_token_' ) );
                    attr.value = attrs[i].value;
                    worksheet.setAttributeNode( attr );
                }
            }

            var str = _serialiser.serializeToString(val);

            // Fix IE's XML
            if ( _ieExcel ) {
                // IE doesn't include the XML declaration
                if ( str.indexOf( '<?xml' ) === -1 ) {
                    str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+str;
                }

                // Return namespace attributes to being as such
                str = str.replace( /_dt_b_namespace_token_/g, ':' );
            }

            // Safari, IE and Edge will put empty name space attributes onto
            // various elements making them useless. This strips them out
            str = str.replace( /<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>' );

            zip.file( name, str );
        }
    } );
}

/**
 * Create an XML node and add any children, attributes, etc without needing to
 * be verbose in the DOM.
 *
 * @param  {object} doc      XML document
 * @param  {string} nodeName Node name
 * @param  {object} opts     Options - can be `attr` (attributes), `children`
 *   (child nodes) and `text` (text content)
 * @return {node}            Created node
 */
function _createNode( doc, nodeName, opts ) {
    var tempNode = doc.createElement( nodeName );

    if ( opts ) {
        if ( opts.attr ) {
            $(tempNode).attr( opts.attr );
        }

        if( opts.children ) {
            $.each( opts.children, function ( key, value ) {
                tempNode.appendChild( value );
            });
        }

        if( opts.text ) {
            tempNode.appendChild( doc.createTextNode( opts.text ) );
        }
    }

    return tempNode;
}

/**
 * Get the width for an Excel column based on the contents of that column
 * @param  {object} data Data for export
 * @param  {int}    col  Column index
 * @return {int}         Column width
 */
function _excelColWidth( data, col ) {
    var max = data.header[col].length;
    var len, lineSplit, str;

    if ( data.footer && data.footer[col].length > max ) {
        max = data.footer[col].length;
    }

    for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
        var point = data.body[i][col];
        str = point !== null && point !== undefined ?
            point.toString() :
            '';

        // If there is a newline character, workout the width of the column
        // based on the longest line in the string
        if ( str.indexOf('\n') !== -1 ) {
            lineSplit = str.split('\n');
            lineSplit.sort( function (a, b) {
                return b.length - a.length;
            } );

            len = lineSplit[0].length;
        }
        else {
            len = str.length;
        }

        if ( len > max ) {
            max = len;
        }

        // Max width rather than having potentially massive column widths
        if ( max > 40 ) {
            return 52; // 40 * 1.3
        }
    }

    max *= 1.3;

    // And a min width
    return max > 6 ? max : 6;
}

var _saveAs = (function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
        doc = view.document
        // only get URL when necessary in case Blob.js hasn't overridden it yet
        , get_URL = function() {
            return view.URL || view.webkitURL || view;
        }
        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
        , click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }
        , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
        , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
        , throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        }
        , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
        , arbitrary_revoke_timeout = 1000 * 40 // in ms
        , revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                    get_URL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            // First try a.download, then web filesystem, then object URLs
            var
                filesaver = this
                , type = blob.type
                , force = type === force_saveable_type
                , object_url
                , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                }
                // on any filesys errors revert to saving with object URLs
                , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        // Safari doesn't allow downloading of blob urls
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var popup = view.open(url, '_blank');
                            if(!popup) view.location.href = url;
                            url=undefined; // release reference before dispatching
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) {
                        object_url = get_URL().createObjectURL(blob);
                    }
                    if (force) {
                        view.location.href = object_url;
                    } else {
                        var opened = view.open(object_url, "_blank");
                        if (!opened) {
                            // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                            view.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
            ;
            filesaver.readyState = filesaver.INIT;

            if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }

            fs_error();
        }
        , FS_proto = FileSaver.prototype
        , saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        }
    ;
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";

            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }

    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
        FS_proto.onwritestart =
            FS_proto.onprogress =
                FS_proto.onwrite =
                    FS_proto.onabort =
                        FS_proto.onerror =
                            FS_proto.onwriteend =
                                null;

    return saveAs;
}(
    typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));

// Excel - Pre-defined strings to build a basic XLSX file
var excelStrings = {
    "_rels/.rels":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
    '</Relationships>',

    "xl/_rels/workbook.xml.rels":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'+
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
    '</Relationships>',

    "[Content_Types].xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
    '<Default Extension="xml" ContentType="application/xml" />'+
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />'+
    '<Default Extension="jpeg" ContentType="image/jpeg" />'+
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />'+
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />'+
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />'+
    '</Types>',

    "xl/workbook.xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
    '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>'+
    '<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>'+
    '<bookViews>'+
    '<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>'+
    '</bookViews>'+
    '<sheets>'+
    '<sheet name="" sheetId="1" r:id="rId1"/>'+
    '</sheets>'+
    '</workbook>',

    "xl/worksheets/sheet1.xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
    '<sheetData/>'+
    '</worksheet>',

    "xl/styles.xml":
    '<?xml version="1.0" encoding="UTF-8"?>'+
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
    '<numFmts count="6">'+
    '<numFmt numFmtId="164" formatCode="#,##0.00_-\ [$$-45C]"/>'+
    '<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>'+
    '<numFmt numFmtId="166" formatCode="[$€-2]\ #,##0.00"/>'+
    '<numFmt numFmtId="167" formatCode="0.0%"/>'+
    '<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>'+
    '<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>'+
    '</numFmts>'+
    '<fonts count="5" x14ac:knownFonts="1">'+
    '<font>'+
    '<sz val="11" />'+
    '<name val="Calibri" />'+
    '</font>'+
    '<font>'+
    '<sz val="11" />'+
    '<name val="Calibri" />'+
    '<color rgb="FFFFFFFF" />'+
    '</font>'+
    '<font>'+
    '<sz val="11" />'+
    '<name val="Calibri" />'+
    '<b />'+
    '</font>'+
    '<font>'+
    '<sz val="11" />'+
    '<name val="Calibri" />'+
    '<i />'+
    '</font>'+
    '<font>'+
    '<sz val="11" />'+
    '<name val="Calibri" />'+
    '<u />'+
    '</font>'+
    '</fonts>'+
    '<fills count="6">'+
    '<fill>'+
    '<patternFill patternType="none" />'+
    '</fill>'+
    '<fill/>'+ // Excel appears to use this as a dotted background regardless of values
    '<fill>'+
    '<patternFill patternType="solid">'+
    '<fgColor rgb="FFD9D9D9" />'+
    '<bgColor indexed="64" />'+
    '</patternFill>'+
    '</fill>'+
    '<fill>'+
    '<patternFill patternType="solid">'+
    '<fgColor rgb="FFD99795" />'+
    '<bgColor indexed="64" />'+
    '</patternFill>'+
    '</fill>'+
    '<fill>'+
    '<patternFill patternType="solid">'+
    '<fgColor rgb="ffc6efce" />'+
    '<bgColor indexed="64" />'+
    '</patternFill>'+
    '</fill>'+
    '<fill>'+
    '<patternFill patternType="solid">'+
    '<fgColor rgb="ffc6cfef" />'+
    '<bgColor indexed="64" />'+
    '</patternFill>'+
    '</fill>'+
    '</fills>'+
    '<borders count="2">'+
    '<border>'+
    '<left />'+
    '<right />'+
    '<top />'+
    '<bottom />'+
    '<diagonal />'+
    '</border>'+
    '<border diagonalUp="false" diagonalDown="false">'+
    '<left style="thin">'+
    '<color auto="1" />'+
    '</left>'+
    '<right style="thin">'+
    '<color auto="1" />'+
    '</right>'+
    '<top style="thin">'+
    '<color auto="1" />'+
    '</top>'+
    '<bottom style="thin">'+
    '<color auto="1" />'+
    '</bottom>'+
    '<diagonal />'+
    '</border>'+
    '</borders>'+
    '<cellStyleXfs count="1">'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />'+
    '</cellStyleXfs>'+
    '<cellXfs count="67">'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment horizontal="left"/>'+
    '</xf>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment horizontal="center"/>'+
    '</xf>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment horizontal="right"/>'+
    '</xf>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment horizontal="fill"/>'+
    '</xf>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment textRotation="90"/>'+
    '</xf>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
    '<alignment wrapText="1"/>'+
    '</xf>'+
    '<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '<xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
    '</cellXfs>'+
    '<cellStyles count="1">'+
    '<cellStyle name="Normal" xfId="0" builtinId="0" />'+
    '</cellStyles>'+
    '<dxfs count="0" />'+
    '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />'+
    '</styleSheet>'
};
// Note we could use 3 `for` loops for the styles, but when gzipped there is
// virtually no difference in size, since the above can be easily compressed

// Pattern matching for special number formats. Perhaps this should be exposed
// via an API in future?
// Ref: section 3.8.30 - built in formatters in open spreadsheet
//   https://www.ecma-international.org/news/TC45_current_work/Office%20Open%20XML%20Part%204%20-%20Markup%20Language%20Reference.pdf
var _excelSpecials = [
    { match: /^\-?\d+\.\d%$/,       style: 60, fmt: function (d) { return d/100; } }, // Precent with d.p.
    { match: /^\-?\d+\.?\d*%$/,     style: 56, fmt: function (d) { return d/100; } }, // Percent
    { match: /^\-?\$[\d,]+.?\d*$/,  style: 57 }, // Dollars
    { match: /^\-?£[\d,]+.?\d*$/,   style: 58 }, // Pounds
    { match: /^\-?€[\d,]+.?\d*$/,   style: 59 }, // Euros
    { match: /^\-?\d+$/,            style: 65 }, // Numbers without thousand separators
    { match: /^\-?\d+\.\d{2}$/,     style: 66 }, // Numbers 2 d.p. without thousands separators
    { match: /^\([\d,]+\)$/,        style: 61, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets
    { match: /^\([\d,]+\.\d{2}\)$/, style: 62, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets - 2d.p.
    { match: /^\-?[\d,]+$/,         style: 63 }, // Numbers with thousand separators
    { match: /^\-?[\d,]+\.\d{2}$/,  style: 64 }  // Numbers with 2 d.p. and thousands separators
];


module.exports = {
    exportObj:exportObj
}