/**
 * @fileoverview test plot
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphael = window.Raphael;

var plotFactory = require('../../../src/js/components/plots/plot.js');
var DataProcessor = require('../../../src/js/models/data/dataProcessor');
var chartConst = require('../../../src/js/const');
var dom = require('../../../src/js/helpers/domHandler.js');

describe('Test for Plot', function() {
    var plot, dataProcessor, paper;

    beforeEach(function() {
        paper = raphael(dom.create('div'));

        dataProcessor = new DataProcessor({}, '', {});
        plot = new plotFactory.Plot({
            dataProcessor: dataProcessor,
            theme: {
                lineColor: 'black'
            }
        });

        plot.paper = paper;
    });

    afterEach(function() {
        paper.remove();
    });

    describe('_renderPlotArea()', function() {
        it('options.showLine을 설정하지 않으면 기본값이 true로 설정되어 line을 렌더링 합니다.', function() {
            plot.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            spyOn(plot, '_renderPlotLines');

            plot._renderPlotArea('plotContainer');

            expect(plot._renderPlotLines).toHaveBeenCalledWith('plotContainer', {
                width: 400,
                height: 300
            });
        });

        it('options.showLine이 false이면 _renderLines()을 호출하지 않습니다.', function() {
            plot.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            spyOn(plot, '_renderPlotLines');
            plot.options = {
                showLine: false
            };

            plot._renderPlotArea('plotContainer');

            expect(plot._renderPlotLines).not.toHaveBeenCalled();
        });

        it('if line type chart, execute _renderOptionalLines function', function() {
            plot.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            spyOn(plot, '_renderOptionalLines');
            plot.chartType = chartConst.CHART_TYPE_LINE;
            plot.options = {
                showLine: false
            };
            plot._renderPlotArea('plotContainer');

            expect(plot._renderOptionalLines).toHaveBeenCalledWith('plotContainer', {
                width: 400,
                height: 300
            });
        });
    });

    describe('_createOptionalLineValueRange()', function() {
        it('create value range for optional line, when optionalLineData has range property', function() {
            var optionalLineData = {
                range: [10, 20]
            };
            var actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([10, 20]);
        });

        it('create value range for optional line, when optionalLineData has value property', function() {
            var optionalLineData = {
                value: 10
            };
            var actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([10]);
        });

        it('create value range for optional line, when xAxisType is datetime type', function() {
            var optionalLineData = {
                range: ['01/01/2016', '01/03/2016']
            };
            var actual;

            plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
            actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([
                (new Date('01/01/2016')).getTime(),
                (new Date('01/03/2016')).getTime()
            ]);
        });
    });

    describe('_createOptionalLinePosition()', function() {
        it('create position for optional line, when value axis', function() {
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var actual = plot._createOptionalLinePosition(xAxisData, 400, 120);

            expect(actual).toBe(200);
        });

        it('create position for optional line, when value axis and has maximum value', function() {
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var actual = plot._createOptionalLinePosition(xAxisData, 400, 220);

            expect(actual).toBe(399);
        });
    });

    describe('_createOptionalLinePositionWhenLabelAxis()', function() {
        beforeEach(function() {
            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };
        });

        it('create position for optional line, when label axis', function() {
            var actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate2');

            expect(actual).toBe(100);
        });

        it('create position for optional line, when label axis and has last value', function() {
            var actual;

            actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate4');

            expect(actual).toBe(299);
        });

        it('if has not included value in categories, returns null', function() {
            var actual;

            actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate5');

            expect(actual).toBeNull();
        });
    });

    describe('_createOptionalLinePositionMap()', function() {
        it('create position map for optional line, when x axis is label type', function() {
            var optionalLineData = {
                range: ['cate2', 'cate3']
            };
            var xAxisData = {
                isLabelAxis: true,
                dataMin: 20,
                distance: 200
            };
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

            expect(actual).toEqual({
                start: 100,
                end: 200
            });
        });

        it('create position map for optional line, when x axis is label type and first value in range not included in categories', function() {
            var optionalLineData = {
                range: ['cate0', 'cate3']
            };
            var xAxisData = {
                isLabelAxis: true
            };
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

            expect(actual).toEqual({
                start: 0,
                end: 200
            });
        });

        it('create position map for optional line, when x axis is value type', function() {
            var optionalLineData = {
                range: [170, 220]
            };
            var xAxisData = {
                isLabelAxis: false,
                dataMin: 20,
                distance: 200
            };
            var actual;

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 400);

            expect(actual).toEqual({
                start: 300,
                end: 399
            });
        });
    });

    describe('_makeVerticalPositions()', function() {
        it('make positions for vertical line', function() {
            var positions;

            plot.axisDataMap = {
                yAxis: {
                    validTickCount: 5
                }
            };
            positions = plot._makeVerticalPositions(200);
            expect(positions).toEqual([50, 100, 150, 199]);
        });

        it('if yAxis.validTickCount is zero, returns empty array', function() {
            var actual;

            plot.axisDataMap = {
                yAxis: {
                    validTickCount: 0
                }
            };
            actual = plot._makeVerticalPositions(200);

            expect(actual).toEqual([]);
        });
    });

    describe('_makeDividedPlotPositions()', function() {
        it('make divided positions of plot', function() {
            var actual, expected;

            plot.dimensionMap = {
                yAxis: {
                    width: 50
                }
            };

            actual = plot._makeDividedPlotPositions(450, 8);
            expected = [0, 50, 100, 150, 300, 350, 400, 449];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeHorizontalPositions()', function() {
        it('make positions for horizontal line', function() {
            var actual;

            plot.axisDataMap = {
                xAxis: {
                    validTickCount: 5
                }
            };

            actual = plot._makeHorizontalPositions(200);

            expect(actual).toEqual([50, 100, 150, 199]);
        });

        it('if xAxis.validTickCount is zero, returns empty array', function() {
            var actual;

            plot.axisDataMap = {
                xAxis: {
                    validTickCount: 0
                }
            };

            actual = plot._makeHorizontalPositions(200);

            expect(actual).toEqual([]);
        });

        it('if divided option is true, returns result to executing _makeDividedPlotPositions() function', function() {
            var actual, expected;

            plot.dimensionMap = {
                yAxis: {
                    width: 50
                }
            };
            plot.axisDataMap = {
                xAxis: {
                    validTickCount: 5
                }
            };
            plot.options.divided = true;

            actual = plot._makeHorizontalPositions(350);
            expected = plot._makeDividedPlotPositions(350, 5);

            expect(actual).toEqual(expected);
        });
    });

    describe('render()', function() {
        it('render for plot area', function() {
            var data = {
                layout: {
                    dimension: {
                        width: 400,
                        height: 200
                    },
                    position: {
                        top: 5,
                        left: 5
                    }
                },
                axisDataMap: {
                    yAxis: {
                        validTickCount: 5
                    },
                    xAxis: {
                        validTickCount: 0
                    }
                },
                paper: raphael(dom.create('div'))
            };

            plot.render(data);

            expect(plot.plotSet.length).toBe(4);

            data.paper.remove();
        });
    });
});
