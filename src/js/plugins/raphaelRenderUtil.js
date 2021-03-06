/**
 * @fileoverview Util for raphael rendering.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = window.Raphael;

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 * @private
 */
var raphaelRenderUtil = {
    /**
     * Make line path.
     * @memberOf module:raphaelRenderUtil
     * @param {{top: number, left: number}} fromPos from position
     * @param {{top: number, left: number}} toPos to position
     * @param {number} width width
     * @returns {string} path
     */
    makeLinePath: function(fromPos, toPos, width) {
        var fromPoint = [fromPos.left, fromPos.top];
        var toPoint = [toPos.left, toPos.top];
        var additionalPoint;

        width = width || 1;
        additionalPoint = (width % 2 / 2);

        tui.util.forEachArray(fromPoint, function(from, index) {
            if (from === toPoint[index]) {
                fromPoint[index] = toPoint[index] = Math.round(from) - additionalPoint;
            }
        });

        return ['M'].concat(fromPoint).concat('L').concat(toPoint);
    },

    /**
     * Render line.
     * @memberOf module:raphaelRenderUtil
     * @param {object} paper raphael paper
     * @param {string} path line path
     * @param {string} color line color
     * @param {number} strokeWidth stroke width
     * @returns {object} raphael line
     */
    renderLine: function(paper, path, color, strokeWidth) {
        var line = paper.path([path]),
            strokeStyle = {
                stroke: color,
                'stroke-width': strokeWidth || 2
            };

        if (color === 'transparent') {
            strokeStyle.stroke = '#fff';
            strokeStyle['stroke-opacity'] = 0;
        }
        line.attr(strokeStyle);

        return line;
    },

    /**
     * Render text
     * @param {object} paper - Raphael paper object
     * @param {{left: number, top: number}} pos - text object position
     * @param {string} text - text content
     * @param {object} [attributes] - text object's attributes
     * @returns {object}
     */
    renderText: function(paper, pos, text, attributes) {
        var textObj = paper.text(pos.left, pos.top, text);

        if (attributes) {
            if (attributes['dominant-baseline']) {
                textObj.node.setAttribute('dominant-baseline', attributes['dominant-baseline']);
            } else {
                textObj.node.setAttribute('dominant-baseline', 'central');
            }

            textObj.attr(attributes);
        }

        return textObj;
    },

    /**
     * Render area graph.
     * @param {object} paper raphael paper
     * @param {string} path path
     * @param {object} fillStyle fill style
     *      @param {string} fillStyle.fill fill color
     *      @param {?number} fillStyle.opacity fill opacity
     *      @param {string} fillStyle.stroke stroke color
     *      @param {?number} fillStyle.stroke-opacity stroke opacity
     * @returns {Array.<object>} raphael object
     */
    renderArea: function(paper, path, fillStyle) {
        var area = paper.path(path);

        fillStyle = tui.util.extend({
            'stroke-opacity': 0
        }, fillStyle);
        area.attr(fillStyle);

        return area;
    },

    /**
     * Render circle.
     * @param {object} paper - raphael object
     * @param {{left: number, top: number}} position - position
     * @param {number} radius - radius
     * @param {object} attributes - attributes
     * @returns {object}
     */
    renderCircle: function(paper, position, radius, attributes) {
        var circle = paper.circle(position.left, position.top, radius);

        if (attributes) {
            circle.attr(attributes);
        }

        return circle;
    },

    /**
     * Render rect.
     * @param {object} paper - raphael object
     * @param {{left: number, top: number, width: number, height, number}} bound - bound
     * @param {object} attributes - attributes
     * @returns {*}
     */
    renderRect: function(paper, bound, attributes) {
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);

        if (attributes) {
            rect.attr(attributes);
        }

        return rect;
    },

    /**
     * Update rect bound
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     */
    updateRectBound: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * Render items of line type chart.
     * @param {Array.<Array.<object>>} groupItems group items
     * @param {function} funcRenderItem function
     */
    forEach2dArray: function(groupItems, funcRenderItem) {
        if (groupItems) {
            tui.util.forEachArray(groupItems, function(items, groupIndex) {
                tui.util.forEachArray(items, function(item, index) {
                    funcRenderItem(item, groupIndex, index);
                });
            });
        }
    },

    /**
     * Make changed luminance color.
     * @param {string} hex hax color
     * @param {number} lum luminance
     * @returns {string} changed color
     */
    makeChangedLuminanceColor: function(hex, lum) {
        var changedHex;

        hex = hex.replace('#', '');
        lum = lum || 0;

        changedHex = tui.util.map(tui.util.range(3), function(index) {
            var hd = parseInt(hex.substr(index * 2, 2), 16);
            var newHd = hd + (hd * lum);

            newHd = Math.round(Math.min(Math.max(0, newHd), 255)).toString(16);

            return tui.chart.renderUtil.formatToZeroFill(newHd, 2);
        }).join('');

        return '#' + changedHex;
    },

    /**
     * Get rendered text element size
     * @param {string} text text content
     * @param {number} fontSize font-size attribute
     * @param {string} fontFamily font-family attribute
     * @returns {{
     *     width: number,
     *     height: number
     * }}
     */
    getRenderedTextSize: function(text, fontSize, fontFamily) {
        var paper = raphael(document.body, 100, 100);
        var textElement = paper.text(0, 0, text).attr({
            'font-size': fontSize,
            'font-family': fontFamily
        });
        var bBox = textElement.getBBox();

        textElement.remove();
        paper.remove();

        return {
            width: bBox.width,
            height: bBox.height
        };
    },

    /**
     * Animate given element's opacity
     * @param {object} element element
     * @param {number} startOpacity endOpacity default is '0'
     * @param {number} endOpacity endOpacity default is '1'
     * @param {number} duration endOpacity default is '600'
     */
    animateOpacity: function(element, startOpacity, endOpacity, duration) {
        var animationDuration = isNumber(duration) ? duration : 600;
        var animationStartOpacity = isNumber(startOpacity) ? startOpacity : 0;
        var animationEndOpacity = isNumber(endOpacity) ? endOpacity : 1;
        var animation = raphael.animation({
            opacity: animationEndOpacity
        }, animationDuration);

        element.attr({
            opacity: animationStartOpacity
        });

        element.animate(animation.delay(600));
    }
};

/**
 * Return boolean value for given parameter is number or not
 * @param {*} numberSuspect number suspect
 * @returns {boolean}
 */
function isNumber(numberSuspect) {
    return tui.util.isExisty(numberSuspect) && typeof numberSuspect === 'number';
}

module.exports = raphaelRenderUtil;
