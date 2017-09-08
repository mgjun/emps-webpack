var utilEntry = require("./inherit/page-entry.config.js");

var entries = utilEntry.getEntry('./src/js/*.js', './src/js/');
var chunks = Object.keys(entries);

var entry = Object.assign(entries, {
    vendor: ['font-self','bs-js','bs-css','font-awesome',
            'adminLTE-css','icheck-css','alertify-css','alertify-core-css',
            'toastr-css','loading-overlay-css','datatables.net','dt-bs-css',
            'dt-bs-js','datatables.net-buttons','dt-flash','dt-jszip',
            'dt-pdfmake','dt-vfs-fonts','dt-colVis','dt-html5','dt-print',
            'select2-js','select2-css','datepicker-js','datepicker-css',
            'datetimepicker-js','datetimepicker-css','raty-js',
            'fileinput-css','fileinput-canvas-js','fileinput-sortable-js','fileinput-purify-js',
            'fileinput-js','fileinput-theme-js','fileinput-extent-js','cropper-js','cropper-css',
            'app-css']
});


module.exports = entry;