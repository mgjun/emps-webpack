/**
 * Created by MENGJUN on 2017/6/22.
 */
$.fn.fileinput.Constructor.prototype._setFileDropZoneTitle = function () {
    var self = this, $zone = self.$container.find('.file-drop-zone'), title = self.dropZoneTitle, strFiles;
    if (self.isClickable) {
        strFiles = $.fn.fileinput.$h.isEmpty(self.$element.attr('multiple')) ? self.fileSingle : self.filePlural;
        title += self.dropZoneClickTitle.replace('{files}', strFiles);
    }
    $zone.find('.' + self.dropZoneTitleClass).remove();
    if (!self.isUploadable || !self.showPreview || $zone.length === 0 || self.getFileStack().length > 0 || !self.dropZoneEnabled) {
        return;
    }
    //emps-change
    $zone.prepend('<div class="' + self.dropZoneTitleClass + '">' + title + '</div>');
    // if ($zone.find($h.FRAMES).length === 0 && $h.isEmpty(self.defaultPreviewContent)) {
    //     $zone.prepend('<div class="' + self.dropZoneTitleClass + '">' + title + '</div>');
    // }
    self.$container.removeClass('file-input-new');
    $.fn.fileinput.$h.addCss(self.$container, 'file-input-ajax-new');
};

$.fn.fileinput.Constructor.prototype._change = function (e) {
    var self = this, $el = self.$element;
    if (!self.isUploadable && $.fn.fileinput.$h.isEmpty($el.val()) && self.fileInputCleared) { // IE 11 fix
        self.fileInputCleared = false;
        return;
    }
    self.fileInputCleared = false;
    var tfiles = [], msg, total, isDragDrop = arguments.length > 1, isAjaxUpload = self.isUploadable, n, len,
        files = isDragDrop ? e.originalEvent.dataTransfer.files : $el.get(0).files, ctr = self.filestack.length,
        isSingleUpload = $.fn.fileinput.$h.isEmpty($el.attr('multiple')), flagSingle = (isSingleUpload && ctr > 0),
        folders = 0, fileIds = self._getFileIds(), throwError = function (mesg, file, previewId, index) {
            var p1 = $.extend(true, {}, self._getOutData({}, {}, files), {id: previewId, index: index}),
                p2 = {id: previewId, index: index, file: file, files: files};
            return self.isUploadable ? self._showUploadError(mesg, p1) : self._showError(mesg, p2);
        };
    self.reader = null;
    self._resetUpload();
    self._hideFileIcon();
    //emps-change
    // if (self.isUploadable) {
    // self.$container.find('.file-drop-zone .' + self.dropZoneTitleClass).remove();
    // }
    if (isDragDrop) {
        $.each(files, function (i, f) {
            if (f && !f.type && f.size !== undefined && f.size % 4096 === 0) {
                folders++;
            } else {
                self._filterDuplicate(f, tfiles, fileIds);
            }
        });
    } else {
        if (e.target && e.target.files === undefined) {
            files = e.target.value ? [{name: e.target.value.replace(/^.+\\/, '')}] : [];
        } else {
            files = e.target.files || {};
        }
        $.each(files, function (i, f) {
            self._filterDuplicate(f, tfiles, fileIds);
        });
    }
    if ($.fn.fileinput.$h.isEmpty(tfiles) || tfiles.length === 0) {
        if (!isAjaxUpload) {
            self.clear();
        }
        self._showFolderError(folders);
        self._raise('fileselectnone');
        return;
    }
    self._resetErrors();
    len = tfiles.length;
    total = self._getFileCount(self.isUploadable ? (self.getFileStack().length + len) : len);
    if (self.maxFileCount > 0 && total > self.maxFileCount) {
        if (!self.autoReplace || len > self.maxFileCount) {
            n = (self.autoReplace && len > self.maxFileCount) ? len : total;
            msg = self.msgFilesTooMany.replace('{m}', self.maxFileCount).replace('{n}', n);
            self.isError = throwError(msg, null, null, null);
            self.$captionContainer.find('.kv-caption-icon').hide();
            self._setCaption('', true);
            self.$container.removeClass('file-input-new file-input-ajax-new');
            return;
        }
        if (total > self.maxFileCount) {
            self._resetPreviewThumbs(isAjaxUpload);
        }
    } else {
        if (!isAjaxUpload || flagSingle) {
            self._resetPreviewThumbs(false);
            if (flagSingle) {
                self.clearStack();
            }
        } else {
            if (isAjaxUpload && ctr === 0 && (!self.previewCache.count() || self.overwriteInitial)) {
                self._resetPreviewThumbs(true);
            }
        }
    }
    if (self.isPreviewable) {
        self._readFiles(tfiles);
    } else {
        self._updateFileDetails(1);
    }
    self._showFolderError(folders);
};

$.fn.fileinput.Constructor.prototype._readFiles = function (files) {
    this.reader = new FileReader();
    var self = this, $el = self.$element, $preview = self.$preview, reader = self.reader,
        $container = self.$previewContainer, $status = self.$previewStatus, msgLoading = self.msgLoading,
        msgProgress = self.msgProgress, previewInitId = self.previewInitId, numFiles = files.length,
        settings = self.fileTypeSettings, ctr = self.filestack.length, readFile,
        fileTypes = self.allowedFileTypes, typLen = fileTypes ? fileTypes.length : 0,
        fileExt = self.allowedFileExtensions, strExt = $.fn.fileinput.$h.isEmpty(fileExt) ? '' : fileExt.join(', '),
        maxPreviewSize = self.maxFilePreviewSize && parseFloat(self.maxFilePreviewSize),
        canPreview = $preview.length && (!maxPreviewSize || isNaN(maxPreviewSize)),
        throwError = function (msg, file, previewId, index) {
            var p1 = $.extend(true, {}, self._getOutData({}, {}, files), {id: previewId, index: index}),
                p2 = {id: previewId, index: index, file: file, files: files};
            self._previewDefault(file, previewId, true);
            if (self.isUploadable) {
                self.addToStack(undefined);
                setTimeout(function () {
                    readFile(index + 1);
                }, 100);
            }
            self._initFileActions();
            if (self.removeFromPreviewOnError) {
                $('#' + previewId).remove();
            }
            return self.isUploadable ? self._showUploadError(msg, p1) : self._showError(msg, p2);
        };

    self.loadedImages = [];
    self.totalImagesCount = 0;

    $.each(files, function (key, file) {
        var func = self.fileTypeSettings.image;
        if (func && func(file.type)) {
            self.totalImagesCount++;
        }
    });
    readFile = function (i) {
        if ($.fn.fileinput.$h.isEmpty($el.attr('multiple'))) {
            numFiles = 1;
        }
        if (i >= numFiles) {
            if (self.isUploadable && self.filestack.length > 0) {
                self._raise('filebatchselected', [self.getFileStack()]);
            } else {
                self._raise('filebatchselected', [files]);
            }
            $container.removeClass('file-thumb-loading');
            $status.html('');
            return;
        }
        var node = ctr + i, previewId = previewInitId + "-" + node, isText, isImage, file = files[i], fSizeKB,
            caption = file.name ? self.slug(file.name) : '', fileSize = (file.size || 0) / 1000, j, msg,
            fileExtExpr = '', previewData = $.fn.fileinput.$h.objUrl.createObjectURL(file), typ, chk, typ1, typ2,
            fileCount = 0, strTypes = '', func;
        if (typLen > 0) {
            for (j = 0; j < typLen; j++) {
                typ1 = fileTypes[j];
                typ2 = self.msgFileTypes[typ1] || typ1;
                strTypes += j === 0 ? typ2 : ', ' + typ2;
            }
        }
        if (caption === false) {
            readFile(i + 1);
            return;
        }
        if (caption.length === 0) {
            msg = self.msgInvalidFileName.replace('{name}', $.fn.fileinput.$h.htmlEncode(file.name));
            self.isError = throwError(msg, file, previewId, i);
            return;
        }
        if (!$.fn.fileinput.$h.isEmpty(fileExt)) {
            fileExtExpr = new RegExp('\\.(' + fileExt.join('|') + ')$', 'i');
        }
        //emps-change
        //resouces is validate size first,and then type;
        //now changed to validate type first,and then size;
        if (!$.fn.fileinput.$h.isEmpty(fileTypes) && $.fn.fileinput.$h.isArray(fileTypes)) {
            for (j = 0; j < fileTypes.length; j += 1) {
                typ = fileTypes[j];
                func = settings[typ];
                fileCount += !func || (typeof func !== 'function') ? 0 : (func(file.type, file.name) ? 1 : 0);
            }
            if (fileCount === 0) {
                msg = self.msgInvalidFileType.replace('{name}', caption).replace('{types}', strTypes);
                self.isError = throwError(msg, file, previewId, i);
                return;
            }
        }
        fSizeKB = fileSize.toFixed(2);
        if (self.maxFileSize > 0 && fileSize > self.maxFileSize) {
            msg = self.msgSizeTooLarge.replace('{name}', caption).replace('{size}', fSizeKB)
                .replace('{maxSize}', self.maxFileSize);
            self.isError = throwError(msg, file, previewId, i);
            return;
        }
        if (self.minFileSize !== null && fileSize <= $.fn.fileinput.$h.getNum(self.minFileSize)) {
            msg = self.msgSizeTooSmall.replace('{name}', caption).replace('{size}', fSizeKB)
                .replace('{minSize}', self.minFileSize);
            self.isError = throwError(msg, file, previewId, i);
            return;
        }
        if (fileCount === 0 && !$.fn.fileinput.$h.isEmpty(fileExt) && $.fn.fileinput.$h.isArray(fileExt) && !$.fn.fileinput.$h.isEmpty(fileExtExpr)) {
            chk = $.fn.fileinput.$h.compare(caption, fileExtExpr);
            fileCount += $.fn.fileinput.$h.isEmpty(chk) ? 0 : chk.length;
            if (fileCount === 0) {
                msg = self.msgInvalidFileExtension.replace('{name}', caption).replace('{extensions}', strExt);
                self.isError = throwError(msg, file, previewId, i);
                return;
            }
        }
        if (!self.showPreview) {
            self.addToStack(file);
            setTimeout(function () {
                readFile(i + 1);
            }, 100);
            self._raise('fileloaded', [file, previewId, i, reader]);
            return;
        }
        if (!canPreview && fileSize > maxPreviewSize) {
            self.addToStack(file);
            $container.addClass('file-thumb-loading');
            self._previewDefault(file, previewId);
            self._initFileActions();
            self._updateFileDetails(numFiles);
            readFile(i + 1);
            return;
        }
        if ($preview.length && FileReader !== undefined) {
            $status.html(msgLoading.replace('{index}', i + 1).replace('{files}', numFiles));
            $container.addClass('file-thumb-loading');
            reader.onerror = function (evt) {
                self._errorHandler(evt, caption);
            };
            reader.onload = function (theFile) {
                self._previewFile(i, file, theFile, previewId, previewData);
                self._initFileActions();
            };
            reader.onloadend = function () {
                msg = msgProgress.replace('{index}', i + 1).replace('{files}', numFiles)
                    .replace('{percent}', 50).replace('{name}', caption);
                setTimeout(function () {
                    $status.html(msg);
                    self._updateFileDetails(numFiles);
                    readFile(i + 1);
                }, 100);
                self._raise('fileloaded', [file, previewId, i, reader]);
            };
            reader.onprogress = function (data) {
                if (data.lengthComputable) {
                    var fact = (data.loaded / data.total) * 100, progress = Math.ceil(fact);
                    msg = msgProgress.replace('{index}', i + 1).replace('{files}', numFiles)
                        .replace('{percent}', progress).replace('{name}', caption);
                    setTimeout(function () {
                        $status.html(msg);
                    }, 100);
                }
            };
            isText = settings.text;
            isImage = settings.image;

            if (isText(file.type, caption)) {
                reader.readAsText(file, self.textEncoding);
            } else {
                if (isImage(file.type, caption)) {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsArrayBuffer(file);
                }
            }
        } else {
            self._previewDefault(file, previewId);
            setTimeout(function () {
                readFile(i + 1);
                self._updateFileDetails(numFiles);
            }, 100);
            self._raise('fileloaded', [file, previewId, i, reader]);
        }
        self.addToStack(file);
    };

    readFile(0);
    self._updateFileDetails(numFiles, false);
};
$.fn.fileinput.Constructor.prototype._filterDuplicate = function (file, files, fileIds) {
    var self = this, fileId = self._getFileId(file);
    if (fileId && fileIds && fileIds.indexOf(fileId) > -1) {
        toastr.error("Duplicate files existed!");
        return;
    }
    if (!fileIds) {
        fileIds = [];
    }
    files.push(file);
    fileIds.push(fileId);
};


$.fn.fileinput.Constructor.prototype._submitForm = function () {
    var self = this, $el = self.$element, files = $el.get(0).files,preview = self.getPreview(),fileTotalCount = 0;
    if(files) {
        fileTotalCount += self._getFileCount(files.length);
    }
    if(preview) {
        fileTotalCount += preview.content? preview.content.length : 0;
    }
    if (self.minFileCount > 0 && fileTotalCount < self.minFileCount) {
        self._noFilesError({});
        return false;
    }
    return !self._abort({});
};

$.fn.fileinput.Constructor.prototype.upload = function () {
    var self = this, totLen = self.getFileStack().length, params = {}, i, outData, len,
        hasExtraData = !$.isEmptyObject(self._getExtraData()),preview = self.getPreview(),fileTotalCount = 0;
    if (!self.isUploadable || self.isDisabled) {
        return;
    }
    fileTotalCount += self._getFileCount(totLen);
    if(preview) {
        fileTotalCount += preview.content? preview.content.length : 0;
    }
    if (self.minFileCount > 0 && fileTotalCount < self.minFileCount) {
        self._noFilesError(params);
        return;
    }
    self._resetUpload();
    if (totLen === 0 && !hasExtraData) {
        self._showUploadError(self.msgUploadEmpty);
        return;
    }
    self.$progress.removeClass('hide');
    self.uploadCount = 0;
    self.uploadStatus = {};
    self.uploadLog = [];
    self.lock();
    self._setProgress(2);
    if (totLen === 0 && hasExtraData) {
        self._uploadExtraOnly();
        return;
    }
    len = self.filestack.length;
    self.hasInitData = false;
    if (self.uploadAsync) {
        outData = self._getOutData();
        self._raise('filebatchpreupload', [outData]);
        self.fileBatchCompleted = false;
        self.uploadCache = {content: [], config: [], tags: [], append: true};
        self.uploadAsyncCount = self.getFileStack().length;
        for (i = 0; i < len; i++) {
            self.uploadCache.content[i] = null;
            self.uploadCache.config[i] = null;
            self.uploadCache.tags[i] = null;
        }
        self.$preview.find('.file-preview-initial').removeClass($h.SORT_CSS);
        self._initSortable();
        self.cacheInitialPreview = self.getPreview();

        for (i = 0; i < len; i++) {
            if (self.filestack[i] !== undefined) {
                self._uploadSingle(i, self.filestack, true);
            }
        }
        return;
    }
    self._uploadBatch();
    return self.$element;
};

$.fn.fileinput.Constructor.prototype._noFilesError = function (params) {
    var self = this, label = self.minFileCount > 1 ? self.filePlural : self.fileSingle,
        msg = self.msgFilesTooLess.replace('{n}', self.minFileCount).replace('{files}', label),
        $error = self.$errorContainer;
    self._addError(msg);
    self.isError = true;
    self._updateFileDetails(0);
    $error.fadeIn(800);
    self._raise('fileerror', [params, msg]);
    self._clearFileInput();
    $.fn.fileinput.$h.addCss(self.$container, 'has-error');
};
