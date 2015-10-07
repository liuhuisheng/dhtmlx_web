/*!
 * jQuery UI Monthpicker
 *
 * MIT License
 * Copyright (c) 2011, Julien Poumailloux
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software i
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function($) {
    $.extend($.ui, {
        monthpicker: {
            version: "@VERSION"
        }
    });
    var PROP_NAME = 'monthpicker';
    var instActive;
    /* Month picker manager.
	   Use the singleton instance of this class, $.monthpicker, to interact with the date picker.
	   Settings for (groups of) month pickers are maintained in an instance object,
	   allowing multiple different settings on the same page. */
    function Monthpicker() {
        this.uuid = 0;
        this._keyEvent = false; // If the last event was a key event
        this._curInst = null; // The current instance in use
        this._disabledInputs = []; // List of date picker inputs that have been disabled
        this._monthpickerShowing = false; // True if the popup picker is showing , false if not
        this._mainDivId = 'ui-monthpicker-div'; // The ID of the main monthpicker division
        this._triggerClass = 'ui-monthpicker-trigger'; // The name of the trigger marker class
        this._dialogClass = 'ui-monthpicker-dialog'; // The name of the dialog marker class
        this._currentClass = "ui-datepicker-today"; // The name of the current day marker class
        this._dayOverClass = "ui-datepicker-days-cell-over"; // The name of the day hover marker class
        this._unselectableClass = "ui-datepicker-unselectable"; // The name of the unselectable cell marker class
        this.regional = []; // Available regional settings, indexed by language code
        this.regional[''] = { // Default regional settings
            closeText: "Done", // Display text for close link
            prevText: 'Prev', // Display text for previous month link
            nextText: 'Next', // Display text for next month link
            currentText: "Current", // Display text for current month link
            monthNames: ['January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December'
            ], // Names of months for drop-down and formatting
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May',
                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ], // For formatting
            dateFormat: 'mm/yy',
            isRTL: false,
            yearSuffix: '' // Additional text to append to the year in the month headers
        };
        this._defaults = { // Global defaults for all the date picker instances
            showOn: 'focus', // 'focus' for popup on focus,
            // 'button' for trigger button, or 'both' for either
            showAnim: 'fadeIn', // Name of jQuery animation for popup
            showButtonPanel: false, // True to show button panel, false to not show it
            appendText: "", // Display text following the input box, e.g. showing the format
            buttonText: '...', // Text for trigger button
            buttonImage: '', // URL for trigger button image
            gotoCurrent: false, // True if today link goes back to current selection instead
            changeYear: false, // True if year can be selected directly, false if only prev/next
            navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
            yearRange: 'c-10:c+10', // Range of years to display in drop-down,
            // either relative to today's year (-nn:+nn), relative to currently displayed year
            // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
            beforeShow: null, // Function that takes an input field and
            // returns a set of custom settings for the date picker
            onSelect: null, // Define a callback function when a date is selected
            onChangeYear: null, // Define a callback function when the year is changed
            onClose: null, // Define a callback function when the monthpicker is closed
            stepYears: 1, // Number of months to step back/forward
            stepBigYears: 3, // Number of months to step back/forward
            defaultDate: null, // Used when field is blank: actual date,
            minDate: null, // The earliest selectable date, or null for no limit
            maxDate: null, // The latest selectable date, or null for no limit
            altField: '', // Selector for an alternate field to store selected dates into
            altFormat: '', // The date format to use for the alternate field
            disabled: false // The initial disabled state
        };
        $.extend(this._defaults, this.regional['']);
        this.dpDiv = bindHover($('<div id="' + this._mainDivId +
            '" class="ui-monthpicker ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'
        ));
    }
    $.extend(Monthpicker.prototype, {
        /* Class name added to elements to indicate already configured with a date picker. */
        markerClassName: 'hasMonthpicker',
        /* Debug logging (if enabled). */
        log: function() {
            if (this.debug) console.log.apply('', arguments);
        },
        // TODO rename to "widget" when switching to widget factory
        _widgetMonthpicker: function() {
            return this.dpDiv;
        },
        /* Override the default settings for all instances of the date picker.
         * @param  settings  object - the new settings to use as defaults (anonymous object)
         * @return the manager object
         */
        setDefaults: function(settings) {
            extendRemove(this._defaults, settings || {});
            return this;
        },
        /* Retrieve the instance data for the target control.
		   @param  target  element - the target input field or division or span
		   @return  object - the associated instance data
		   @throws  error if a jQuery problem getting data */
        _getInst: function(target) {
            try {
                return $.data(target, PROP_NAME);
            } catch (err) {
                throw 'Missing instance data for this monthpicker';
            }
        },
        /* Get a setting value, defaulting if necessary. */
        _get: function(inst, name) {
            return inst.settings[name] !== undefined ? inst.settings[
                name] : this._defaults[name];
        },
        /* Attach the month picker to a jQuery selection.
		   @param  target    element - the target input field or division or span
		   @param  settings  object - the new settings to use for this month picker instance (anonymous) */
        _attachMonthpicker: function(target, settings) {
            // check for settings on the control itself - in namespace 'month:'
            var inlineSettings = null;
            for (var attrName in this._defaults) {
                var attrValue = target.getAttribute('month:' +
                    attrName);
                if (attrValue) {
                    inlineSettings = inlineSettings || {};
                    try {
                        inlineSettings[attrName] = eval(
                            attrValue);
                    } catch (err) {
                        inlineSettings[attrName] = attrValue;
                    }
                }
            }
            var nodeName = target.nodeName.toLowerCase();
            if (!target.id) {
                this.uuid += 1;
                target.id = 'dp' + this.uuid;
            }
            var inst = this._newInst($(target));
            inst.settings = $.extend({}, settings || {},
                inlineSettings || {});
            if (nodeName == 'input') {
                this._connectMonthpicker(target, inst);
            }
        },
        /* Create a new instance object. */
        _newInst: function(target) {
            var id = target[0].id.replace(/([^A-Za-z0-9_-])/g,
                '\\\\$1'); // escape jQuery meta chars
            return {
                id: id,
                input: target, // associated target
                selectedDay: 0,
                selectedMonth: 0,
                selectedYear: 0, // current selection
                drawMonth: 0,
                drawYear: 0, // month being drawn
                dpDiv: this.dpDiv // presentation div
            };
        },
        /* Attach the date picker to an input field. */
        _connectMonthpicker: function(target, inst) {
            var input = $(target);
            inst.append = $([]);
            inst.trigger = $([]);
            if (input.hasClass(this.markerClassName)) return;
            this._attachments(input, inst);
            input.addClass(this.markerClassName)
            .keydown(this._doKeyDown)
            .keypress(this._doKeyPress)
            .keyup(this._doKeyUp)
            .bind("setData.monthpicker", function(event, key, value) {
                inst.settings[key] = value;
            })
            .bind("getData.monthpicker", function(event, key) {
                return this._get(inst, key);
            });
            //this._autoSize(inst);
            $.data(target, PROP_NAME, inst);
            //If disabled option is true, disable the monthpicker once it has been attached to the input (see ticket #5665)
            if (inst.settings.disabled) {
                this._disableMonthpicker(target);
            }
        },
        /* Make attachments based on settings. */
        _attachments: function(input, inst) {
            var buttonText, buttonImage;
            var appendText = this._get(inst, "appendText"),
                isRTL = this._get(inst, "isRTL");
            if (appendText) {
                inst.append = $("<span class='" + this._appendClass +
                    "'>" + appendText + "</span>");
                input[isRTL ? "before" : "after"](inst.append);
            }
            input.unbind('focus', this._showMonthpicker);
            if (inst.trigger) inst.trigger.remove();
            var showOn = this._get(inst, 'showOn');
            if (showOn == 'focus' || showOn == 'both') // pop-up month picker when in the marked field
                input.focus(this._showMonthpicker);
            if (showOn === "button" || showOn === "both") { // pop-up month picker when button clicked
                buttonText = this._get(inst, "buttonText");
                buttonImage = this._get(inst, "buttonImage");
                inst.trigger = $(this._get(inst,
                    "buttonImageOnly") ? $("<img/>").addClass(
                    this._triggerClass).attr({
                    src: buttonImage,
                    alt: buttonText,
                    title: buttonText
                }) : $(
                    "<button type='button'></button>").addClass(
                    this._triggerClass).html(!
                    buttonImage ? buttonText : $(
                        "<img/>").attr({
                        src: buttonImage,
                        alt: buttonText,
                        title: buttonText
                    })));
                input[isRTL ? "before" : "after"](inst.trigger);
                inst.trigger.click(function() {
                    if ($.monthpicker._monthpickerShowing &&
                        $.monthpicker._lastInput ===
                        input[0]) {
                        $.monthpicker._hideMonthpicker();
                    } else if ($.monthpicker._monthpickerShowing &&
                        $.monthpicker._lastInput !==
                        input[0]) {
                        $.monthpicker._hideMonthpicker();
                        $.monthpicker._showMonthpicker(
                            input[0]);
                    } else {
                        $.monthpicker._showMonthpicker(
                            input[0]);
                    }
                    return false;
                });
            }
        },
        /* Close month picker if clicked elsewhere. */
        _checkExternalClick: function(event) {
            if (!$.monthpicker._curInst) return;
            var $target = $(event.target),
                inst = $.monthpicker._getInst($target[0]);
            if ((($target[0].id != $.monthpicker._mainDivId &&
                $target.parents('#' + $.monthpicker._mainDivId)
                .length == 0 && !$target.hasClass($.monthpicker
                    .markerClassName) && !$target.hasClass(
                    $.monthpicker._triggerClass) && $.monthpicker
                ._monthpickerShowing)) || ($target.hasClass(
                    $.monthpicker.markerClassName) && $.monthpicker
                ._curInst != inst)) $.monthpicker._hideMonthpicker();
        },
        /* Pop-up the month picker for a given input field.
		   If false returned from beforeShow event handler do not show.
		   @param  input  element - the input field attached to the date picker or
						          event - if triggered by focus */
        _showMonthpicker: function(input) {
            input = input.target || input;
            if (input.nodeName.toLowerCase() != 'input') // find from button/image trigger
                input = $('input', input.parentNode)[0];
            if ($.monthpicker._isDisabledMonthpicker(input) ||
                $.monthpicker._lastInput == input) // already here
                return;
            var inst = $.monthpicker._getInst(input);
            if ($.monthpicker._curInst && $.monthpicker._curInst !=
                inst) {
                $.monthpicker._curInst.dpDiv.stop(true, true);
                if (inst && $.monthpicker._monthpickerShowing) {
                    $.monthpicker._hideMonthpicker($.monthpicker
                        ._curInst.input[0]);
                }
            }
            var beforeShow = $.monthpicker._get(inst,
                'beforeShow');
            var beforeShowSettings = beforeShow ? beforeShow.apply(
                input, [input, inst]) : {};
            if (beforeShowSettings === false) {
                //false
                return;
            }
            extendRemove(inst.settings, beforeShowSettings);
            inst.lastVal = null;
            $.monthpicker._lastInput = input;
            $.monthpicker._setDateFromField(inst);
            if ($.monthpicker._inDialog) // hide cursor
                input.value = '';
            if (!$.monthpicker._pos) { // position below input
                $.monthpicker._pos = $.monthpicker._findPos(
                    input);
                $.monthpicker._pos[1] += input.offsetHeight; // add the height
            }
            var isFixed = false;
            $(input).parents().each(function() {
                isFixed |= $(this).css('position') ==
                    'fixed';
                return !isFixed;
            });
            if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
                $.monthpicker._pos[0] -= document.documentElement
                    .scrollLeft;
                $.monthpicker._pos[1] -= document.documentElement
                    .scrollTop;
            }
            var offset = {
                left: $.monthpicker._pos[0],
                top: $.monthpicker._pos[1]
            };
            $.monthpicker._pos = null;
            //to avoid flashes on Firefox
            inst.dpDiv.empty();
            // determine sizing offscreen
            inst.dpDiv.css({
                position: 'absolute',
                display: 'block',
                top: '-1000px'
            });
            $.monthpicker._updateMonthpicker(inst);
            // fix width for dynamic number of date pickers
            // and adjust position before showing
            offset = $.monthpicker._checkOffset(inst, offset,
                isFixed);
            inst.dpDiv.css({
                position: ($.monthpicker._inDialog && $
                    .blockUI ? 'static' : (isFixed ?
                        'fixed' : 'absolute')),
                display: 'none',
                left: offset.left + 'px',
                top: offset.top + 'px'
            });
            var showAnim = $.monthpicker._get(inst, 'showAnim');
            var duration = $.monthpicker._get(inst, 'duration');
            var postProcess = function() {
                var cover = inst.dpDiv.find(
                    'iframe.ui-monthpicker-cover'); // IE6- only
                if (!!cover.length) {
                    var borders = $.monthpicker._getBorders(
                        inst.dpDiv);
                    cover.css({
                        left: -borders[0],
                        top: -borders[1],
                        width: inst.dpDiv.outerWidth(),
                        height: inst.dpDiv.outerHeight()
                    });
                }
            };
            inst.dpDiv.zIndex($(input).zIndex() + 1);
            $.monthpicker._monthpickerShowing = true;
            if ($.effects && $.effects[showAnim]) inst.dpDiv.show(
                showAnim, $.monthpicker._get(inst,
                    'showOptions'), duration, postProcess);
            else inst.dpDiv[showAnim || 'show']((showAnim ?
                duration : null), postProcess);
            if (!showAnim || !duration) postProcess();
            if (inst.input.is(':visible') && !inst.input.is(
                ':disabled')) inst.input.focus();
            $.monthpicker._curInst = inst;
        },
        /* Generate the date picker content. */
        _updateMonthpicker: function(inst) {
            var self = this;
            self.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
            var borders = $.monthpicker._getBorders(inst.dpDiv);
            instActive = inst; // for delegate hover events
            inst.dpDiv.empty().append(this._generateHTML(inst));
            this._attachHandlers(inst);
            var cover = inst.dpDiv.find(
                'iframe.ui-monthpicker-cover'); // IE6- only
            if (!!cover.length) { //avoid call to outerXXXX() when not in IE6
                cover.css({
                    left: -borders[0],
                    top: -borders[1],
                    width: inst.dpDiv.outerWidth(),
                    height: inst.dpDiv.outerHeight()
                })
            }
            inst.dpDiv.find('.' + this._dayOverClass + ' a').mouseover();
            if (inst == $.monthpicker._curInst && $.monthpicker
                ._monthpickerShowing && inst.input &&
                // #6694 - don't focus the input if it's already focused
                // this breaks the change event in IE
                inst.input.is(':visible') && !inst.input.is(
                    ':disabled') && inst.input[0] != document.activeElement
            ) inst.input.focus();
            // deffered render of the years select (to avoid flashes on Firefox)
            if (inst.yearshtml) {
                var origyearshtml = inst.yearshtml;
                setTimeout(function() {
                    //assure that inst.yearshtml didn't change.
                    if (origyearshtml === inst.yearshtml &&
                        inst.yearshtml) {
                        inst.dpDiv.find(
                            'select.ui-monthpicker-year:first'
                        ).replaceWith(inst.yearshtml);
                    }
                    origyearshtml = inst.yearshtml =
                        null;
                }, 0);
            }
        },
        /* Trigger custom callback of onClose. */
        _triggerOnClose: function(inst) {
            var onClose = this._get(inst, 'onClose');
            if (onClose) onClose.apply((inst.input ? inst.input[
                0] : null), [(inst.input ? inst.input.val() :
                ''), inst]);
        },
        /* Hide the month picker from view.
		   @param  input  element - the input field attached to the month picker */
        _hideMonthpicker: function(input) {
            var inst = this._curInst;
            if (!inst || (input && inst != $.data(input,
                PROP_NAME))) return;
            if (this._monthpickerShowing) {
                var showAnim = this._get(inst, 'showAnim');
                var duration = this._get(inst, 'duration');
                var postProcess = function() {
                    $.monthpicker._tidyDialog(inst);
                    $.monthpicker._curInst = null;
                };
                if ($.effects && $.effects[showAnim]) inst.dpDiv
                    .hide(showAnim, $.monthpicker._get(inst,
                            'showOptions'), duration,
                        postProcess);
                else inst.dpDiv[(showAnim == 'slideDown' ?
                    'slideUp' : (showAnim == 'fadeIn' ?
                        'fadeOut' : 'hide'))]((showAnim ?
                    duration : null), postProcess);
                if (!showAnim) postProcess();
                $.monthpicker._triggerOnClose(inst);
                this._monthpickerShowing = false;
                this._lastInput = null;
                if (this._inDialog) {
                    this._dialogInput.css({
                        position: 'absolute',
                        left: '0',
                        top: '-100px'
                    });
                    if ($.blockUI) {
                        $.unblockUI();
                        $('body').append(this.dpDiv);
                    }
                }
                this._inDialog = false;
            }
        },
        /* Handle keystrokes. */
        _doKeyDown: function(event) {
            var onSelect, dateStr, sel,
                inst = $.monthpicker._getInst(event.target),
                handled = true,
                isRTL = inst.dpDiv.is(".ui-datepicker-rtl");
            inst._keyEvent = true;
            if ($.monthpicker._monthpickerShowing) {
                switch (event.keyCode) {
                    case 9:
                        $.monthpicker._hideMonthpicker();
                        handled = false;
                        break; // hide on tab out
                    case 13:
                        sel = $("td." + $.monthpicker._dayOverClass +
                            ":not(." + $.monthpicker._currentClass +
                            ")", inst.dpDiv);
                        if (sel[0]) {
                            $.monthpicker._selectMonth(event.target,
                                inst.selectedYear, inst.selectedMonth,
                                sel[0]);
                        }
                        onSelect = $.monthpicker._get(inst,
                            "onSelect");
                        if (onSelect) {
                            dateStr = $.monthpicker._formatDate(
                                inst);
                            // trigger custom callback
                            onSelect.apply((inst.input ? inst.input[
                                0] : null), [dateStr,
                                inst
                            ]);
                        } else {
                            $.monthpicker._hideMonthpicker();
                        }
                        return false; // don't submit the form
                    case 27:
                        $.monthpicker._hideMonthpicker();
                        break; // hide on escape
                    case 33:
                        $.monthpicker._adjustDate(event.target, (
                            event.ctrlKey ? -$.monthpicker
                            ._get(inst, "stepBigYears") :
                            -$.monthpicker._get(inst,
                                "stepYears")), "Y");
                        break; // previous year on page up/+ ctrl
                    case 34:
                        $.monthpicker._adjustDate(event.target, (
                            event.ctrlKey ? +$.monthpicker
                            ._get(inst, "stepBigYears") :
                            +$.monthpicker._get(inst,
                                "stepYears")), "Y");
                        break; // next year on page down/+ ctrl
                    case 35:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._clearDate(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // clear on ctrl or command +end
                    case 36:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._gotoCurrent(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // current on ctrl or command +home
                    case 37:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._adjustDate(event.target, (
                                isRTL ? +1 : -1), "M");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        // -1 month on ctrl or command +left
                        if (event.originalEvent.altKey) {
                            $.monthpicker._adjustDate(event.target, (
                                event.ctrlKey ? -$.monthpicker
                                ._get(inst,
                                    "stepBigYears") : -
                                $.monthpicker._get(inst,
                                    "stepYears")), "Y");
                        }
                        // next year on alt +left on Mac
                        break;
                    case 38:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._adjustDate(event.target, -
                                3, "M");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // -1 quarter on ctrl or command +up
                    case 39:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._adjustDate(event.target, (
                                isRTL ? -1 : +1), "M");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        // +1 month on ctrl or command +right
                        if (event.originalEvent.altKey) {
                            $.monthpicker._adjustDate(event.target, (
                                event.ctrlKey ? +$.monthpicker
                                ._get(inst,
                                    "stepBigYears") : +
                                $.monthpicker._get(inst,
                                    "stepYears")), "Y");
                        }
                        // next year on alt +right
                        break;
                    case 40:
                        if (event.ctrlKey || event.metaKey) {
                            $.monthpicker._adjustDate(event.target, +
                                3, "M");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // +1 quarter on ctrl or command +down
                    default:
                        handled = false;
                }
            } else if (event.keyCode === 36 && event.ctrlKey) { // display the date picker on ctrl+home
                $.monthpicker._showMonthpicker(this);
            } else {
                handled = false;
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        /* Is the first field in a jQuery collection disabled as a monthpicker?
		   @param  target    element - the target input field or division or span
		   @return boolean - true if disabled, false if enabled */
        _isDisabledMonthpicker: function(target) {
            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] == target) return
                    true;
            }
            return false;
        },
        /* Tidy up after a dialog display. */
        _tidyDialog: function(inst) {
            inst.dpDiv.removeClass(this._dialogClass).unbind(
                '.ui-monthpicker-calendar');
        },
        /* Retrieve the size of left and top borders for an element.
		   @param  elem  (jQuery object) the element of interest
		   @return  (number[2]) the left and top borders */
        _getBorders: function(elem) {
            var convert = function(value) {
                return {
                    thin: 1,
                    medium: 2,
                    thick: 3
                }[value] || value;
            };
            return [parseFloat(convert(elem.css(
                    'border-left-width'))),
                parseFloat(convert(elem.css(
                    'border-top-width')))
            ];
        },
        /* Check positioning to remain on screen. */
        _checkOffset: function(inst, offset, isFixed) {
            var dpWidth = inst.dpDiv.outerWidth();
            var dpHeight = inst.dpDiv.outerHeight();
            var inputWidth = inst.input ? inst.input.outerWidth() :
                0;
            var inputHeight = inst.input ? inst.input.outerHeight() :
                0;
            var viewWidth = document.documentElement.clientWidth +
                $(document).scrollLeft();
            var viewHeight = document.documentElement.clientHeight +
                $(document).scrollTop();
            offset.left -= (isFixed && offset.left == inst.input
                    .offset().left) ? $(document).scrollLeft() :
                0;
            offset.top -= (isFixed && offset.top == (inst.input
                    .offset().top + inputHeight)) ? $(document)
                .scrollTop() : 0;
            // now check if monthpicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left +
                dpWidth > viewWidth && viewWidth >
                dpWidth) ? Math.abs(offset.left +
                dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top +
                dpHeight > viewHeight && viewHeight >
                dpHeight) ? Math.abs(dpHeight +
                inputHeight) : 0);
            return offset;
        },
        /* Find an object's position on the screen. */
        _findPos: function(obj) {
            var inst = this._getInst(obj);
            while (obj && (obj.type == 'hidden' || obj.nodeType !=
                1 || $.expr.filters.hidden(obj))) {
                obj = obj['nextSibling'];
            }
            var position = $(obj).offset();
            return [position.left, position.top];
        },
        /* Adjust one of the month sub-fields. */
        _adjustDate: function(id, offset, period) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            if (this._isDisabledMonthpicker(target[0])) {
                return;
            }
            this._adjustInstDate(inst, offset, period);
            this._updateMonthpicker(inst);
        },
        /* Adjust one of the date sub-fields. */
        _adjustInstDate: function(inst, offset, period) {
            var year = inst.drawYear + (period == 'Y' ? offset :
                0);
            var month = Math.min(inst.selectedMonth, 12) + (
                period === "M" ? offset : 0);
            var date = this._restrictMinMax(inst, new Date(year,
                month, 1));
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.selectedMonth = date.getMonth();
            if (period == 'Y') {
                this._notifyChange(inst);
            }
        },
        /* Notify change of month/year. */
        _notifyChange: function(inst) {
            var onChange = this._get(inst, 'onChangeYear');
            if (onChange) onChange.apply((inst.input ? inst.input[
                0] : null), [inst.selectedYear, inst]);
        },
        /* Detach a datepicker from its control.
         * @param  target	element - the target input field or division or span
         */
        _destroyMonthpicker: function(target) {
            var nodeName,
                $target = $(target),
                inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            nodeName = target.nodeName.toLowerCase();
            $.removeData(target, PROP_NAME);
            if (nodeName === "input") {
                inst.append.remove();
                inst.trigger.remove();
                $target.removeClass(this.markerClassName).
                unbind("focus", this._showMonthpicker).
                unbind("keydown", this._doKeyDown).
                unbind("keypress", this._doKeyPress).
                unbind("keyup", this._doKeyUp);
            } else if (nodeName === "div" || nodeName ===
                "span") {
                $target.removeClass(this.markerClassName).empty();
            }
        },
        /* Enable the date picker to a jQuery selection.
		   @param  target    element - the target input field or division or span */
        _enableMonthpicker: function(target) {
            var $target = $(target);
            var inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName == 'input') {
                target.disabled = false;
                inst.trigger.filter('button').
                each(function() {
                    this.disabled = false;
                }).end().
                filter('img').css({
                    opacity: '1.0',
                    cursor: ''
                });
            }
            this._disabledInputs = $.map(this._disabledInputs,
                function(value) {
                    return (value == target ? null : value);
                }); // delete entry
        },
        /* Disable the month picker to a jQuery selection.
		   @param  target    element - the target input field or division or span */
        _disableMonthpicker: function(target) {
            var $target = $(target);
            var inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName == 'input') {
                target.disabled = true;
                inst.trigger.filter('button').
                each(function() {
                    this.disabled = true;
                }).end().
                filter('img').css({
                    opacity: '0.5',
                    cursor: 'default'
                });
            }
            this._disabledInputs = $.map(this._disabledInputs,
                function(value) {
                    return (value == target ? null : value);
                }); // delete entry
            this._disabledInputs[this._disabledInputs.length] =
                target;
        },
        /* Generate the HTML for the current state of the date picker. */
        _generateHTML: function(inst) {
            var printDate, hideIfNoPrevNext, unselectable;
            hideIfNoPrevNext = false;
            var today = new Date();
            today = new Date(today.getFullYear(), today.getMonth(),
                today.getDate()); // clear time
            var currentDate = (!inst.currentMonth ? new Date(
                9999, 9, 9) : new Date(inst.currentYear,
                inst.currentMonth, 1));
            var minDate = this._getMinMaxDate(inst, "min");
            var maxDate = this._getMinMaxDate(inst, "max");
            var html = '';
            var year = currentDate && currentDate.year ?
                currentDate.year : 2011;
            var prevText = this._get(inst, 'prevText');
            var nextText = this._get(inst, 'nextText');
            var stepYears = this._get(inst, 'stepYears');
            var monthNames = this._get(inst, 'monthNames');
            var monthNamesShort = this._get(inst,
                'monthNamesShort');
            var drawYear = inst.drawYear;
            var showButtonPanel = this._get(inst,
                "showButtonPanel");
            var isRTL = this._get(inst, "isRTL");
            var defaultDate = this._getDefaultDate(inst);
            var navigationAsDateFormat = this._get(inst,
                "navigationAsDateFormat");
            defaultDate.setDate(1);
            prevText = (!navigationAsDateFormat ? prevText :
                this.formatDate(prevText, new Date(drawYear -
                    stepYears, 1, 1), this._getFormatConfig(
                    inst)));
            nextText = (!navigationAsDateFormat ? nextText :
                this.formatDate(nextText, new Date(drawYear +
                    stepYears, 1, 1), this._getFormatConfig(
                    inst)));
            var prev = (this._canAdjustYear(inst, -1, drawYear) ?
                "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
                " title='" + prevText +
                "'><span class='ui-icon ui-icon-circle-triangle-" +
                (isRTL ? "e" : "w") + "'>" + prevText +
                "</span></a>" : (hideIfNoPrevNext ? "" :
                    "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" +
                    prevText +
                    "'><span class='ui-icon ui-icon-circle-triangle-" +
                    (isRTL ? "e" : "w") + "'>" + prevText +
                    "</span></a>"));
            var next = (this._canAdjustYear(inst, +1, drawYear) ?
                "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
                " title='" + nextText +
                "'><span class='ui-icon ui-icon-circle-triangle-" +
                (isRTL ? "w" : "e") + "'>" + nextText +
                "</span></a>" : (hideIfNoPrevNext ? "" :
                    "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" +
                    nextText +
                    "'><span class='ui-icon ui-icon-circle-triangle-" +
                    (isRTL ? "w" : "e") + "'>" + nextText +
                    "</span></a>"));
            html +=
                '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">' +
                prev + next + this._generateYearHeader(inst,
                    drawYear, minDate, maxDate) + // draw year header
                '</div><table class="ui-datepicker-calendar"><tbody>';
            // draw months table
            for (var month = 0; month <= 11; month++) {
                if (month % 3 === 0) {
                    html += '<tr>';
                }
                printDate = new Date(drawYear, month, 1);
                unselectable = (minDate && printDate < minDate) ||
                    (maxDate && printDate > maxDate);
                var selectedDate = new Date(drawYear, inst.selectedMonth,
                    1);
                html += '<td class="' + (drawYear == inst.currentYear &&
                        month == inst.currentMonth ? " " + this
                        ._currentClass : "") // highlight selected month
                    + (unselectable ? " " + this._unselectableClass +
                        " ui-state-disabled" : "") // highlight unselectable months
                    + ((month === inst.selectedMonth &&
                            drawYear === inst.selectedYear &&
                            inst._keyEvent) || // user pressed key
                        (defaultDate.getTime() === printDate.getTime() &&
                            defaultDate.getTime() ===
                            selectedDate.getTime()) ?
                        // or defaultDate is current printedDate and defaultDate is selectedDate
                        " " + this._dayOverClass : "") // highlight selected day
                    + '" data-month="' + month +
                    '" data-year="' + drawYear +
                    '" data-handler="selectMonth" data-event="click">' +
                    '<a class="ui-state-default' + (drawYear ==
                        inst.currentYear && month == inst.currentMonth ?
                        ' ui-state-active' : '') // highlight selected month
                    + (drawYear == today.getFullYear() && month ==
                        today.getMonth() ?
                        ' ui-state-highlight' : '') // highlight today (if different)
                    + '" href="#">' + (inst.settings && inst.settings
                        .monthNamesShort ? inst.settings.monthNamesShort[
                            month] : this._defaults.monthNamesShort[
                            month]) + '</a>' + '</td>'; // display selectable date
                if (month % 3 === 2) {
                    html += '</tr>';
                }
            }
            html += '</tbody></table>';
            var controls =
                "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
                this._get(inst, "closeText") + "</button>";
            var currentText = this._get(inst, "currentText");
            var gotoDate = (this._get(inst, "gotoCurrent") &&
                inst.currentMonth ? currentDate : today);
            currentText = (!navigationAsDateFormat ?
                currentText : this.formatDate(currentText,
                    gotoDate, this._getFormatConfig(inst)));
            var buttonPanel = (showButtonPanel) ?
                "<div class='ui-datepicker-buttonpane ui-widget-content'>" +
                (isRTL ? controls : "") +
                "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='current' data-event='click'" +
                ">" + currentText + "</button>" + (isRTL ? "" :
                    controls) + "</div>" : "";
            html += buttonPanel;
            return html;
        },
        /* Generate the year header. */
        _generateYearHeader: function(inst, drawYear, minDate,
            maxDate) {
            var inMinYear, inMaxYear;
            var changeYear = this._get(inst, 'changeYear');
            var html = '<div class="ui-datepicker-title">';
            // year selection
            if (!inst.yearshtml) {
                inst.yearshtml = '';
                if (changeYear) {
                    // determine range of years to display
                    var years = this._get(inst, 'yearRange').split(
                        ':');
                    var thisYear = new Date().getFullYear();
                    var determineYear = function(value) {
                        var year = (value.match(/c[+-].*/) ?
                            drawYear + parseInt(value.substring(
                                1), 10) : (value.match(
                                    /[+-].*/) ?
                                thisYear + parseInt(
                                    value, 10) :
                                parseInt(value, 10)));
                        return (isNaN(year) ? thisYear :
                            year);
                    };
                    var year = determineYear(years[0]);
                    var endYear = Math.max(year, determineYear(
                        years[1] || ''));
                    year = (minDate ? Math.max(year, minDate.getFullYear()) :
                        year);
                    endYear = (maxDate ? Math.min(endYear,
                            maxDate.getFullYear()) :
                        endYear);
                    inst.yearshtml +=
                        '<select class="ui-datepicker-year" ' +
                        "data-handler='selectYear' data-event='change'>";
                    for (; year <= endYear; year++) {
                        inst.yearshtml += '<option value="' +
                            year + '"' + (year == drawYear ?
                                ' selected="selected"' : '') +
                            '>' + year + '</option>';
                    }
                    inst.yearshtml += '</select>';
                } else {
                    inst.yearshtml +=
                        '<span class="ui-datepicker-year">' +
                        drawYear + '</span>';
                }
                html += inst.yearshtml;
                inst.yearshtml = null;
            }
            html += this._get(inst, 'yearSuffix');
            html += '</div>'; // Close monthpicker_header
            return html;
        },
        /* Provide the configuration settings for formatting/parsing. */
        _getFormatConfig: function(inst) {
            var shortYearCutoff = this._get(inst,
                'shortYearCutoff');
            shortYearCutoff = (typeof shortYearCutoff !=
                'string' ? shortYearCutoff : new Date().getFullYear() %
                100 + parseInt(shortYearCutoff, 10));
            return {
                shortYearCutoff: shortYearCutoff,
                dayNamesShort: this._get(inst, 'dayNamesShort'),
                dayNames: this._get(inst, 'dayNames'),
                monthNamesShort: this._get(inst,
                    'monthNamesShort'),
                monthNames: this._get(inst, 'monthNames')
            };
        },
        /* Parse existing date and initialise date picker. */
        _setDateFromField: function(inst, noDefault) {
            if (inst.input.val() == inst.lastVal) {
                return;
            }
            var dateFormat = this._get(inst, 'dateFormat');
            var dates = inst.lastVal = inst.input ? inst.input.val() :
                null;
            var date, defaultDate;
            date = defaultDate = this._getDefaultDate(inst);
            var settings = this._getFormatConfig(inst);
            try {
                date = this.parseDate(dateFormat, dates,
                    settings) || defaultDate;
            } catch (event) {
                this.log(event);
                dates = (noDefault ? '' : dates);
            }
            inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.currentMonth = (dates ? date.getMonth() : 0);
            inst.currentYear = (dates ? date.getFullYear() : 0);
            this._adjustInstDate(inst);
        },
        /* Retrieve the default date shown on opening. */
        _getDefaultDate: function(inst) {
            return this._restrictMinMax(inst, this._determineDate(
                inst, this._get(inst, 'defaultDate'),
                new Date()));
        },
        /* A date may be specified as an exact value or a relative one. */
        _determineDate: function(inst, date, defaultDate) {
            var offsetNumeric = function(offset) {
                var date = new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() + offset);
                return date;
            };
            var offsetString = function(offset) {
                try {
                    return $.monthpicker.parseDate($.monthpicker
                        ._get(inst, 'dateFormat'),
                        offset, $.monthpicker._getFormatConfig(
                            inst));
                } catch (e) {
                    // Ignore
                }
                var date = (offset.toLowerCase().match(/^c/) ?
                    $.monthpicker._getDate(inst) : null
                ) || new Date();
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = 1;
                var pattern = /([+-]?[0-9]+)\s*(m|M|y|Y)?/g;
                var matches = pattern.exec(offset);
                while (matches) {
                    switch (matches[2] || 'm') {
                        case 'm':
                        case 'M':
                            month += parseInt(matches[1],
                                10);
                            day = 1
                            break;
                        case 'y':
                        case 'Y':
                            year += parseInt(matches[1], 10);
                            day = 1
                            break;
                    }
                    matches = pattern.exec(offset);
                }
                return new Date(year, month, day);
            };
            var newDate = (date == null || date === '' ?
                defaultDate : (typeof date == 'string' ?
                    offsetString(date) : (typeof date ==
                        'number' ? (isNaN(date) ?
                            defaultDate : offsetNumeric(
                                date)) : new Date(date.getTime())
                    )));
            newDate = (newDate && newDate.toString() ==
                'Invalid Date' ? defaultDate : newDate);
            if (newDate) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
            }
            return newDate;
        },
        /* Determine the current maximum date - ensure no time components are set. */
        _getMinMaxDate: function(inst, minMax) {
            return this._determineDate(inst, this._get(inst,
                minMax + 'Date'), null);
        },
        /* Ensure a date is within any min/max bounds. */
        _restrictMinMax: function(inst, date) {
            var minDate = this._getMinMaxDate(inst, 'min');
            var maxDate = this._getMinMaxDate(inst, 'max');
            var newDate = (minDate && date < minDate ? minDate :
                date);
            newDate = (maxDate && newDate > maxDate ? maxDate :
                newDate);
            return newDate;
        },
        /* Determines if we should allow a "next/prev" year display change. */
        _canAdjustYear: function(inst, offset, curYear) {
            var firstMonth = new Date(curYear + offset, 0, 1);
            var lastMonth = new Date(curYear + offset, 11, 1);
            return this._isInRange(inst, firstMonth) || this._isInRange(
                inst, lastMonth);
        },
        /* Is the given date in the accepted range? */
        _isInRange: function(inst, date) {
            var yearSplit, currentYear,
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                minYear = null,
                maxYear = null,
                years = this._get(inst, "yearRange");
            if (years) {
                yearSplit = years.split(":");
                currentYear = new Date().getFullYear();
                minYear = parseInt(yearSplit[0], 10);
                maxYear = parseInt(yearSplit[1], 10);
                if (yearSplit[0].match(/[+\-].*/)) {
                    minYear += currentYear;
                }
                if (yearSplit[1].match(/[+\-].*/)) {
                    maxYear += currentYear;
                }
            }
            return ((!minDate || date.getTime() >= minDate.getTime()) &&
                (!maxDate || date.getTime() <= maxDate.getTime()) &&
                (!minYear || date.getFullYear() >= minYear) &&
                (!maxYear || date.getFullYear() <= maxYear)
            );
        },
        /* Action for selecting a new month/year. */
        _selectYear: function(id, select, period) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst['selected' + (period == 'M' ? 'Month' : 'Year')] =
                inst['draw' + (period == 'M' ? 'Month' : 'Year')] =
                parseInt(select.options[select.selectedIndex].value,
                    10);
            this._notifyChange(inst);
            this._adjustDate(target);
        },
        /* Action for current link. */
        _gotoCurrent: function(id) {
            var date,
                target = $(id),
                inst = this._getInst(target[0]);
            if (this._get(inst, "gotoCurrent") && inst.currentYear) {
                inst.selectedDay = inst.currentDay;
                inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                inst.drawYear = inst.selectedYear = inst.currentYear;
            } else {
                date = new Date();
                inst.selectedDay = date.getDate();
                inst.drawMonth = inst.selectedMonth = date.getMonth();
                inst.drawYear = inst.selectedYear = date.getFullYear();
            }
            this._notifyChange(inst);
            this._adjustDate(target);
        },
        /* Action for selecting a month. */
        _selectMonth: function(id, year, month, td) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            if ($(td).hasClass(this._unselectableClass) || this
                ._isDisabledMonthpicker(target[0])) {
                return;
            }
            inst.selectedMonth = inst.currentMonth = month;
            inst.selectedYear = inst.currentYear = year;
            this._selectDate(id, this._formatDate(inst, inst.currentMonth,
                inst.currentYear));
        },
        /* Parse a string value into a date object.
		   See formatDate below for the possible formats.

		   @param  format    string - the expected format of the date
		   @param  value     string - the date in the above format
		   @param  settings  Object - attributes include:
							 shortYearCutoff  number - the cutoff year for determining the century (optional)
							 monthNamesShort  string[12] - abbreviated names of the months (optional)
							 monthNames       string[12] - names of the months (optional)
		   @return  Date - the extracted date value or null if value is blank */
        parseDate: function(format, value, settings) {
            if (format == null || value == null) throw 'Invalid arguments';
            value = (typeof value == 'object' ? value.toString() :
                value + '');
            if (value == '') return null;
            var shortYearCutoff = (settings ? settings.shortYearCutoff :
                null) || this._defaults.shortYearCutoff;
            shortYearCutoff = (typeof shortYearCutoff !=
                'string' ? shortYearCutoff : new Date().getFullYear() %
                100 + parseInt(shortYearCutoff, 10));
            var monthNamesShort = (settings ? settings.monthNamesShort :
                null) || this._defaults.monthNamesShort;
            var monthNames = (settings ? settings.monthNames :
                null) || this._defaults.monthNames;
            var year = -1;
            var month = -1;
            var literal = false;
            // Check whether a format character is doubled
            var lookAhead = function(match) {
                var matches = (iFormat + 1 < format.length &&
                    format.charAt(iFormat + 1) == match
                );
                if (matches) iFormat++;
                return matches;
            };
            // Extract a number from the string value
            var getNumber = function(match) {
                var isDoubled = lookAhead(match);
                var size = (match == '@' ? 14 : (match ==
                    '!' ? 20 : (match == 'y' &&
                        isDoubled ? 4 : (match ==
                            'o' ? 3 : 2))));
                var digits = new RegExp('^\\d{1,' + size +
                    '}');
                var num = value.substring(iValue).match(
                    digits);
                if (!num) throw 'Missing number at position ' +
                    iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            };
            // Extract a name from the string value and convert to an index
            var getName = function(match, shortNames, longNames) {
                var names = $.map(lookAhead(match) ?
                    longNames : shortNames, function(v,
                        k) {
                        return [
                            [k, v]
                        ];
                    }).sort(function(a, b) {
                    return -(a[1].length - b[1].length);
                });
                var index = -1;
                $.each(names, function(i, pair) {
                    var name = pair[1];
                    if (value.substr(iValue, name.length)
                        .toLowerCase() == name.toLowerCase()
                    ) {
                        index = pair[0];
                        iValue += name.length;
                        return false;
                    }
                });
                if (index != -1) return index + 1;
                else throw 'Unknown name at position ' +
                    iValue;
            };
            // Confirm that a literal character matches the string value
            var checkLiteral = function() {
                if (value.charAt(iValue) != format.charAt(
                    iFormat)) throw 'Unexpected literal at position ' +
                    iValue;
                iValue++;
            };
            var iValue = 0;
            for (var iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal)
                    if (format.charAt(iFormat) == "'" && !
                        lookAhead("'")) literal = false;
                    else checkLiteral();
                else switch (format.charAt(iFormat)) {
                    case 'm':
                        month = getNumber('m');
                        break;
                    case 'M':
                        month = getName('M',
                            monthNamesShort, monthNames
                        );
                        break;
                    case 'y':
                        year = getNumber('y');
                        break;
                    case '@':
                        var date = new Date(getNumber('@'));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case '!':
                        var date = new Date((getNumber('!') -
                                this._ticksTo1970) /
                            10000);
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        break;
                    case "'":
                        if (lookAhead("'")) checkLiteral();
                        else literal = true;
                        break;
                    default:
                        checkLiteral();
                }
            }
            if (iValue < value.length) {
                throw "Extra/unparsed characters found in date: " +
                value.substring(iValue);
            }
            if (year == -1) year = new Date().getFullYear();
            else if (year < 100) year += new Date().getFullYear() -
                new Date().getFullYear() % 100 + (year <=
                    shortYearCutoff ? 0 : -100);
            var date = new Date(year, month - 1, 1);
            if (date.getFullYear() != year || date.getMonth() +
                1 != month || date.getDate() != 1) throw 'Invalid date'; // E.g. 31/02/00
            return date;
        },
        /* Format a date object into a string value.
		   The format can be combinations of the following:
		   d  - day of month (no leading zero)
		   dd - day of month (two digit)
		   o  - day of year (no leading zeros)
		   oo - day of year (three digit)
		   D  - day name short
		   DD - day name long
		   m  - month of year (no leading zero)
		   mm - month of year (two digit)
		   M  - month name short
		   MM - month name long
		   y  - year (two digit)
		   yy - year (four digit)
		   @ - Unix timestamp (ms since 01/01/1970)
		   ! - Windows ticks (100ns since 01/01/0001)
		   '...' - literal text
		   '' - single quote

		   @param  format    string - the desired format of the date
		   @param  date      Date - the date value to format
		   @param  settings  Object - attributes include:
							 dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
							 dayNames         string[7] - names of the days from Sunday (optional)
							 monthNamesShort  string[12] - abbreviated names of the months (optional)
							 monthNames       string[12] - names of the months (optional)
		   @return  string - the date in the above format */
        formatDate: function(format, date, settings) {
            if (!date) return '';
            var monthNamesShort = (settings ? settings.monthNamesShort :
                null) || this._defaults.monthNamesShort;
            var monthNames = (settings ? settings.monthNames :
                null) || this._defaults.monthNames;
            // Check whether a format character is doubled
            var lookAhead = function(match) {
                var matches = (iFormat + 1 < format.length &&
                    format.charAt(iFormat + 1) == match
                );
                if (matches) iFormat++;
                return matches;
            };
            // Format a number, with leading zero if necessary
            var formatNumber = function(match, value, len) {
                var num = '' + value;
                if (lookAhead(match))
                    while (num.length < len) num = '0' +
                        num;
                return num;
            };
            // Format a name, short or long as requested
            var formatName = function(match, value, shortNames,
                longNames) {
                return (lookAhead(match) ? longNames[value] :
                    shortNames[value]);
            };
            var output = '';
            var literal = false;
            if (date)
                for (var iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal)
                        if (format.charAt(iFormat) == "'" && !
                            lookAhead("'")) literal = false;
                        else output += format.charAt(iFormat);
                    else switch (format.charAt(iFormat)) {
                        case 'm':
                            output += formatNumber('m',
                                date.getMonth() + 1, 2);
                            break;
                        case 'M':
                            output += formatName('M', date.getMonth(),
                                monthNamesShort,
                                monthNames);
                            break;
                        case 'y':
                            output += (lookAhead('y') ?
                                date.getFullYear() : (
                                    date.getYear() %
                                    100 < 10 ? '0' : ''
                                ) + date.getYear() %
                                100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            output += date.getTime() *
                                10000 + this._ticksTo1970;
                            break;
                        case "'":
                            if (lookAhead("'")) output +=
                                "'";
                            else literal = true;
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            return output;
        },
        /* Erase the input field and hide the date picker. */
        _clearDate: function(id) {
            var target = $(id);
            this._selectDate(target, "");
        },
        /* Update the input field with the selected date. */
        _selectDate: function(id, dateStr) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            dateStr = (dateStr != null ? dateStr : this._formatDate(
                inst));
            if (inst.input) inst.input.val(dateStr);
            this._updateAlternate(inst);
            var onSelect = this._get(inst, 'onSelect');
            if (onSelect) onSelect.apply((inst.input ? inst.input[
                0] : null), [dateStr, inst]); // trigger custom callback
            else if (inst.input) inst.input.trigger('change'); // fire the change event
            this._hideMonthpicker();
            this._lastInput = inst.input[0];
            if (typeof(inst.input[0]) != 'object') inst.input.focus(); // restore focus
            this._lastInput = null;
        },
        /* Update any alternate field to synchronise with the main field. */
        _updateAlternate: function(inst) {
            var altField = this._get(inst, 'altField');
            if (altField) { // update alternate field too
                var altFormat = this._get(inst, 'altFormat') ||
                    this._get(inst, 'dateFormat');
                var date = this._getDate(inst);
                var dateStr = this.formatDate(altFormat, date,
                    this._getFormatConfig(inst));
                $(altField).each(function() {
                    $(this).val(dateStr);
                });
            }
        },
        /* Set the date(s) directly. */
        _setDate: function(inst, date, noChange) {
            var clear = !date,
                origMonth = inst.selectedMonth,
                origYear = inst.selectedYear,
                newDate = this._restrictMinMax(inst, this._determineDate(
                    inst, date, new Date()));
            inst.drawMonth = inst.selectedMonth = inst.currentMonth =
                newDate.getMonth();
            inst.drawYear = inst.selectedYear = inst.currentYear =
                newDate.getFullYear();
            if ((origYear !== inst.selectedYear) && !noChange) {
                this._notifyChange(inst);
            }
            this._adjustInstDate(inst);
            if (inst.input) {
                inst.input.val(clear ? "" : this._formatDate(
                    inst));
            }
        },
        /* Set the dates for a jQuery selection.
         * @param  target element - the target input field or division or span
         * @param  date	Date - the new date
         */
        _setDateMonthpicker: function(target, date) {
            var inst = this._getInst(target);
            if (inst) {
                this._setDate(inst, date);
                this._updateMonthpicker(inst);
                this._updateAlternate(inst);
            }
        },
        _getDate: function(inst) {
            var date = (!inst.currentYear || (inst.input &&
                inst.input.val() === "") ? null : new Date(
                inst.currentYear, inst.currentMonth, 1));
            return date;
        },
        /* Attach the onxxx handlers.  These are declared statically so
         * they work with static code transformers like Caja.
         */
        _attachHandlers: function(inst) {
            var stepYears = this._get(inst, "stepYears"),
                id = "#" + inst.id.replace(/\\\\/g, "\\");
            inst.dpDiv.find("[data-handler]").map(function() {
                var handler = {
                    prev: function() {
                        $.monthpicker._adjustDate(
                            id, -stepYears,
                            "Y");
                    },
                    next: function() {
                        $.monthpicker._adjustDate(
                            id, +stepYears,
                            "Y");
                    },
                    hide: function() {
                        $.monthpicker._hideMonthpicker();
                    },
                    current: function() {
                        $.monthpicker._gotoCurrent(
                            id);
                    },
                    selectMonth: function() {
                        $.monthpicker._selectMonth(
                            id, +this.getAttribute(
                                "data-year"
                            ), +this.getAttribute(
                                "data-month"
                            ), this);
                        return false;
                    },
                    selectYear: function() {
                        $.monthpicker._selectYear(
                            id, this, "Y");
                        return false;
                    }
                };
                $(this).bind(this.getAttribute(
                    "data-event"), handler[this
                    .getAttribute(
                        "data-handler")]);
            });
        },
        /* Update or retrieve the settings for a month picker attached to an input field or division.
         * @param  target  element - the target input field or division or span
         * @param  name	object - the new settings to update or
         *				string - the name of the setting to change or retrieve,
         *				when retrieving also "all" for all instance settings or
         *				"defaults" for all global defaults
         * @param  value   any - the new value for the setting
         *				(omit if above is an object or to retrieve a value)
         */
        _optionMonthpicker: function(target, name, value) {
            var settings, date, minDate, maxDate,
                inst = this._getInst(target);
            if (arguments.length === 2 && typeof name ===
                "string") {
                return (name === "defaults" ? $.extend({}, $.monthpicker
                    ._defaults) : (inst ? (name ===
                    "all" ? $.extend({}, inst.settings) :
                    this._get(inst, name)) : null));
            }
            settings = name || {};
            if (typeof name === "string") {
                settings = {};
                settings[name] = value;
            }
            if (inst) {
                if (this._curInst === inst) {
                    this._hideMonthpicker();
                }
                date = this._getDateMonthpicker(target, true);
                minDate = this._getMinMaxDate(inst, "min");
                maxDate = this._getMinMaxDate(inst, "max");
                extendRemove(inst.settings, settings);
                // reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
                if (minDate !== null && settings.dateFormat !==
                    undefined && settings.minDate === undefined
                ) {
                    inst.settings.minDate = this._formatDate(
                        inst, minDate);
                }
                if (maxDate !== null && settings.dateFormat !==
                    undefined && settings.maxDate === undefined
                ) {
                    inst.settings.maxDate = this._formatDate(
                        inst, maxDate);
                }
                if ("disabled" in settings) {
                    if (settings.disabled) {
                        this._disableMonthpicker(target);
                    } else {
                        this._enableMonthpicker(target);
                    }
                }
                this._attachments($(target), inst);
                this._setDate(inst, date);
                this._updateAlternate(inst);
                this._updateMonthpicker(inst);
            }
        },
        /* Get the date(s) for the first entry in a jQuery selection.
         * @param  target element - the target input field or division or span
         * @return Date - the current date
         */
        _getDateMonthpicker: function(target, noDefault) {
            var inst = this._getInst(target);
            if (inst && !inst.inline) {
                this._setDateFromField(inst, noDefault);
            }
            return (inst ? this._getDate(inst) : null);
        },
        /* Format the given date for display. */
        _formatDate: function(inst, month, year) {
            if (!month) {
                inst.currentMonth = inst.selectedMonth;
                inst.currentYear = inst.selectedYear;
            }
            var date = (month ? (typeof month == 'object' ?
                month : new Date(year, month, 1)) : new Date(
                inst.currentYear, inst.currentMonth, 1));
            return this.formatDate(this._get(inst, 'dateFormat'),
                date, this._getFormatConfig(inst));
        }
    });
    /* jQuery extend now ignores nulls! */
    function extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props)
            if (props[name] == null || props[name] == undefined) target[
                name] = props[name];
        return target;
    };
    /*
     * Bind hover events for monthpicker elements.
     * Done via delegate so the binding only occurs once in the lifetime of the parent div.
     * Global instActive, set by _updateMonthpicker allows the handlers to find their way back to the active picker.
     */
    function bindHover(dpDiv) {
            var selector =
                '.ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
            return dpDiv.delegate(selector, 'mouseout', function() {
                $(this).removeClass('ui-state-hover');
                if (this.className.indexOf('ui-datepicker-prev') !=
                    -1) $(this).removeClass(
                    'ui-datepicker-prev-hover');
                if (this.className.indexOf('ui-datepicker-next') !=
                    -1) $(this).removeClass(
                    'ui-datepicker-next-hover');
            }).delegate(selector, 'mouseover', function() {
                if (!$.monthpicker._isDisabledMonthpicker(
                    instActive.input[0])) {
                    $(this).parents('.ui-datepicker-calendar').find(
                        'a').removeClass('ui-state-hover');
                    $(this).addClass('ui-state-hover');
                    if (this.className.indexOf('ui-datepicker-prev') !=
                        -1) $(this).addClass(
                        'ui-datepicker-prev-hover');
                    if (this.className.indexOf('ui-datepicker-next') !=
                        -1) $(this).addClass(
                        'ui-datepicker-next-hover');
                }
            });
        }
        /* Invoke the monthpicker functionality.
	   @param  options  Object - settings for attaching new monthpicker functionality
	   @return  jQuery object */
    $.fn.monthpicker = function(options) {
        /* Verify an empty collection wasn't passed */
        if (!this.length) {
            return this;
        }
        /* Initialise the date picker. */
        if (!$.monthpicker.initialized) {
            $(document).mousedown($.monthpicker._checkExternalClick).
            find('body').append($.monthpicker.dpDiv);
            $.monthpicker.initialized = true;
        }
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options === "string" && (options === "isDisabled" ||
            options === "getDate" || options === "widget")) {
            return $.monthpicker["_" + options + "Monthpicker"].
            apply($.monthpicker, [this[0]].concat(otherArgs));
        }
        if (options === "option" && arguments.length === 2 && typeof arguments[
            1] === "string") {
            return $.monthpicker["_" + options + "Monthpicker"].
            apply($.monthpicker, [this[0]].concat(otherArgs));
        }
        return this.each(function() {
            typeof options === 'string' ? $.monthpicker['_' +
                options + 'Monthpicker'].
            apply($.monthpicker, [this].concat(otherArgs)): $.monthpicker
                ._attachMonthpicker(this, options);
        });
    };
    $.monthpicker = new Monthpicker(); // singleton instance
    $.monthpicker.initialized = false;
})(jQuery);