"use strict";
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.MyError = i18n_ts.MyError;
    diagram_ts.assert = i18n_ts.assert;
    diagram_ts.msg = i18n_ts.msg;
    diagram_ts.range = i18n_ts.range;
    diagram_ts.range2 = i18n_ts.range2;
    diagram_ts.setPlayMode = i18n_ts.setPlayMode;
    diagram_ts.PlayMode = i18n_ts.PlayMode;
    diagram_ts.sleep = i18n_ts.sleep;
    diagram_ts.append = i18n_ts.append;
    diagram_ts.$ = i18n_ts.$;
    diagram_ts.last = i18n_ts.last;
    diagram_ts.unique = i18n_ts.unique;
    diagram_ts.remove = i18n_ts.remove;
    diagram_ts.arrayFill = i18n_ts.arrayFill;
    diagram_ts.sum = i18n_ts.sum;
    diagram_ts.list = i18n_ts.list;
    diagram_ts.intersection = i18n_ts.intersection;
    diagram_ts.permutation = i18n_ts.permutation;
    diagram_ts.circularPermutation = i18n_ts.circularPermutation;
    diagram_ts.areSetsEqual = i18n_ts.areSetsEqual;
    diagram_ts.isSubSet = i18n_ts.isSubSet;
    diagram_ts.check = i18n_ts.check;
    diagram_ts.Speech = i18n_ts.Speech;
    diagram_ts.parseMath = parser_ts.parseMath;
    diagram_ts.renderKatexSub = parser_ts.renderKatexSub;
    diagram_ts.showFlow = parser_ts.showFlow;
    diagram_ts.makeIdToTermMap = parser_ts.makeIdToTermMap;
    diagram_ts.Rational = parser_ts.Rational;
    diagram_ts.Term = parser_ts.Term;
    diagram_ts.ConstNum = parser_ts.ConstNum;
    diagram_ts.App = parser_ts.App;
    diagram_ts.RefVar = parser_ts.RefVar;
    diagram_ts.operator = parser_ts.operator;
    diagram_ts.Vec2 = plane_ts.Vec2;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    const AUTO = "auto";
    const TextSizeFill = 8;
    diagram_ts.textColor = "black";
    function ratio(width) {
        width = width.trim();
        diagram_ts.assert(width.endsWith("%"));
        const num_str = width.substring(0, width.length - 1);
        const num = parseFloat(num_str);
        return num / 100;
    }
    function pixel(length, remaining_length) {
        if (length != undefined) {
            if (length.endsWith("px")) {
                const num_str = length.substring(0, length.length - 2);
                return parseFloat(num_str);
            }
            else if (length.endsWith("%")) {
                if (remaining_length != undefined) {
                    return ratio(length) * remaining_length;
                }
            }
        }
        throw new diagram_ts.MyError();
    }
    function setContext2D(ctx, ui) {
        ui.ctx = ctx;
        ui.children().forEach(child => setContext2D(ctx, child));
    }
    diagram_ts.setContext2D = setContext2D;
    class UI {
        static count = 0;
        idx;
        ctx;
        position = diagram_ts.Vec2.zero();
        boxSize = diagram_ts.Vec2.zero();
        width;
        height;
        minSize;
        colspan = 1;
        rowspan = 1;
        margin = [4, 4, 4, 4]; // left, right, top, bottom
        borderWidth = 3;
        padding = [0, 0, 0, 0]; // left, right, top, bottom
        horizontalAlign;
        backgroundColor;
        constructor(data) {
            this.idx = ++UI.count;
            if (data.colspan != undefined) {
                this.colspan = data.colspan;
            }
            this.backgroundColor = data.backgroundColor;
        }
        children() {
            return [];
        }
        getAllUISub(uis) {
            uis.push(this);
            this.children().forEach(x => x.getAllUISub(uis));
        }
        getAllUI() {
            let uis = [];
            this.getAllUISub(uis);
            return uis;
        }
        marginWidth() {
            return this.margin[0] + this.margin[1];
        }
        marginHeight() {
            return this.margin[2] + this.margin[3];
        }
        marginBorderPaddingWidth() {
            return this.margin[0] + this.margin[1] + 2 * this.borderWidth + this.padding[0] + this.padding[1];
        }
        marginBorderPaddingHeight() {
            return this.margin[2] + this.margin[3] + 2 * this.borderWidth + this.padding[2] + this.padding[3];
        }
        setMinSize() {
            this.minSize = diagram_ts.Vec2.zero();
            diagram_ts.msg(`set-min-size:${this.constructor.name}`);
        }
        getMinWidth() {
            diagram_ts.assert(this.minSize != undefined);
            return this.minSize.x;
        }
        getMinHeight() {
            diagram_ts.assert(this.minSize != undefined);
            return this.minSize.y;
        }
        setPosition(position) {
            this.position = position;
        }
        layout(x, y, size, nest) {
            this.boxSize = size;
            this.setPosition(new diagram_ts.Vec2(x, y));
        }
        drawBox() {
            const x = this.position.x + this.margin[0];
            const y = this.position.y + this.margin[2];
            const w = this.boxSize.x - this.marginWidth();
            const h = this.boxSize.y - this.marginHeight();
            return [new diagram_ts.Vec2(x, y), new diagram_ts.Vec2(w, h)];
        }
        draw() {
            const [pos, size] = this.drawBox();
            this.drawRidgeRect2(this.ctx, pos.x, pos.y, size.x, size.y, this.borderWidth);
        }
        str() {
            if (this.minSize == undefined) {
                throw new diagram_ts.MyError();
            }
            const width = (this.width != undefined ? `width:${this.width} ` : "");
            const height = (this.height != undefined ? `height:${this.height} ` : "");
            const minSize = (this.minSize != undefined ? `min-size:${this.minSize.x.toFixed()}, ${this.minSize.y.toFixed()} ` : "");
            const position = `pos:(${this.position.x},${this.position.y}) `;
            const boxSize = `box:(${this.boxSize.x},${this.boxSize.y}) `;
            return `${this.constructor.name} ${width}${height}${minSize}${position}${boxSize}`;
        }
        dump(nest) {
            diagram_ts.msg(`${" ".repeat(nest * 4)}${this.str()}`);
        }
        drawRidgeRect2(ctx, x, y, width, height, ridgeWidth, isInset = false) {
            // Define light and dark colors
            // const lightColor = isInset ? '#888' : '#eee'; // Darker for inset top/left
            // const darkColor = isInset ? '#eee' : '#888';  // Lighter for inset bottom/right
            const lightColor = "#ffffff";
            const darkColor = "#888888";
            const backgroundColor = (this.backgroundColor != undefined ? this.backgroundColor : "#cccccc");
            // Optionally, draw the inner rectangle (fill or another stroke)
            ctx.fillStyle = backgroundColor; // Example inner color
            ctx.fillRect(x + ridgeWidth, y + ridgeWidth, width - 2 * ridgeWidth, height - 2 * ridgeWidth);
            // Draw the "light" sides (top and left)
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = ridgeWidth;
            ctx.beginPath();
            ctx.moveTo(x + ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-left corner
            ctx.lineTo(x + ridgeWidth / 2, y + ridgeWidth / 2); // Top-left corner
            ctx.lineTo(x + width - ridgeWidth / 2, y + ridgeWidth / 2); // Top-right corner
            ctx.stroke();
            // Draw the "dark" sides (bottom and right)
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = ridgeWidth;
            ctx.beginPath();
            ctx.moveTo(x + width - ridgeWidth / 2, y + ridgeWidth / 2); // Top-right corner
            ctx.lineTo(x + width - ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-right corner
            ctx.lineTo(x + ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-left corner
            ctx.stroke();
        }
        drawRidgeRect(ctx, x, y, width, height, borderWidth, isInset = false) {
            // Colors for ridge effect
            const lightColor = "#ffffff";
            const darkColor = "#888888";
            const backgroundColor = "#cccccc";
            // Fill rectangle background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);
            // Top & left (highlight)
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = borderWidth;
            ctx.beginPath();
            ctx.moveTo(x + width, y); // Top-right
            ctx.lineTo(x, y); // Top-left
            ctx.lineTo(x, y + height); // Bottom-left
            ctx.stroke();
            // Bottom & right (shadow)
            ctx.strokeStyle = darkColor;
            ctx.beginPath();
            ctx.moveTo(x, y + height); // Bottom-left
            ctx.lineTo(x + width, y + height); // Bottom-right
            ctx.lineTo(x + width, y); // Top-right
            ctx.stroke();
        }
    }
    diagram_ts.UI = UI;
    class Filler extends UI {
    }
    diagram_ts.Filler = Filler;
    class TextUI extends UI {
        fontSize;
        textAlign;
        text;
        metrics;
        actualHeight;
        constructor(data) {
            super(data);
            this.fontSize = data.fontSize;
            this.textAlign = data.textAlign;
            this.text = (data.text != undefined ? data.text : "");
        }
        setMinSize() {
            this.metrics = this.ctx.measureText(this.text);
            this.actualHeight = this.metrics.actualBoundingBoxAscent + this.metrics.actualBoundingBoxDescent;
            diagram_ts.msg(`idx:[${this.idx}]  font :[${this.fontSize}]  w:[${this.metrics.width}] h:[${this.actualHeight}] [${this.text}]`);
            const width = this.metrics.width + this.marginBorderPaddingWidth() + TextSizeFill;
            const height = this.actualHeight + this.marginBorderPaddingHeight() + TextSizeFill;
            this.minSize = new diagram_ts.Vec2(width, height);
        }
        draw() {
            super.draw();
            const x = this.position.x + this.margin[0] + this.borderWidth + this.padding[0];
            const y = this.position.y + this.margin[2] + this.borderWidth + this.padding[2]
                + this.actualHeight;
            this.ctx.strokeStyle = diagram_ts.textColor;
            this.ctx.strokeText(this.text, x, y);
        }
        str() {
            return `${super.str()} text:${this.text}`;
        }
    }
    diagram_ts.TextUI = TextUI;
    class Label extends TextUI {
    }
    diagram_ts.Label = Label;
    class Button extends TextUI {
        click;
        constructor(data) {
            super(data);
            this.click = data.click;
        }
    }
    diagram_ts.Button = Button;
    class Node extends UI {
        constructor(data) {
            super(data);
        }
    }
    diagram_ts.Node = Node;
    class Editor extends UI {
        blocks = [];
        children() {
            return this.blocks.slice();
        }
        addBlock(block) {
            this.blocks.push(block);
        }
        draw() {
            super.draw();
            this.blocks.forEach(x => x.draw());
        }
    }
    diagram_ts.Editor = Editor;
    class Grid extends UI {
        colDescs;
        rowDescs;
        cells;
        minWidths = [];
        minHeights = [];
        colWidths = [];
        rowHeights = [];
        numRows;
        numCols;
        constructor(data) {
            super(data);
            this.cells = data.cells;
            this.numRows = this.cells.length;
            this.numCols = Math.max(...this.cells.map(row => diagram_ts.sum(row.map(ui => ui.colspan))));
            if (data.columns == undefined) {
                this.colDescs = diagram_ts.arrayFill(this.numCols, "auto");
            }
            else {
                this.colDescs = data.columns.split(" ");
            }
            if (data.rows == undefined) {
                this.rowDescs = diagram_ts.arrayFill(this.numRows, "auto");
            }
            else {
                this.rowDescs = data.rows.split(" ");
            }
            diagram_ts.assert(this.colDescs.length == this.numCols);
            diagram_ts.assert(this.rowDescs.length == this.numRows);
        }
        children() {
            return this.cells.flat();
        }
        getRow(idx) {
            return this.cells[idx];
        }
        getRowHeight(idx) {
            return Math.max(...this.getRow(idx).map(ui => ui.getMinHeight()));
        }
        getColumnWith(col_idx) {
            let max_width = 0;
            for (const row of this.cells) {
                let offset = 0;
                for (const ui of row) {
                    if (offset == col_idx) {
                        if (ui.colspan == 1) {
                            max_width = Math.max(max_width, ui.getMinWidth());
                        }
                        break;
                    }
                    offset += ui.colspan;
                    if (col_idx < offset) {
                        break;
                    }
                }
            }
            return max_width;
        }
        calcHeights() {
            const heights = new Array(this.rowDescs.length).fill(0);
            for (const [idx, row] of this.rowDescs.entries()) {
                if (row.endsWith("px")) {
                    heights[idx] = pixel(row);
                }
                else if (row == AUTO) {
                    heights[idx] = this.getRowHeight(idx);
                }
            }
            return heights;
        }
        setMinSizeSub(is_width) {
            let offset_size_px_ui_spans = [];
            const min_sizes = diagram_ts.arrayFill(is_width ? this.numCols : this.numRows, 0);
            for (const [row_idx, row] of this.cells.entries()) {
                let offset = 0;
                for (const ui of row) {
                    let size_px;
                    const [ui_size, ui_min_size, ui_span] = (is_width ? [ui.width, ui.minSize.x, ui.colspan] : [ui.height, ui.minSize.y, ui.rowspan]);
                    if (ui_size == undefined) {
                        size_px = ui_min_size;
                    }
                    else {
                        if (ui_size.endsWith("px")) {
                            size_px = pixel(ui_size);
                            if (size_px < ui_min_size) {
                                throw new diagram_ts.MyError();
                            }
                        }
                        else if (ui_size.endsWith("%")) {
                            size_px = ui_min_size / ratio(ui_size);
                        }
                        else {
                            throw new diagram_ts.MyError();
                        }
                    }
                    const pos = (is_width ? offset : row_idx);
                    if (ui_span == 1) {
                        if (min_sizes[pos] < size_px) {
                            min_sizes[pos] = size_px;
                        }
                    }
                    else {
                        offset_size_px_ui_spans.push([pos, size_px, ui, ui_span]);
                    }
                    offset += ui.colspan;
                }
            }
            let max_remaining_size = 0;
            const descs = (is_width ? this.colDescs : this.rowDescs);
            for (const [offset, width_px, ui, ui_span] of offset_size_px_ui_spans) {
                let fixed_px = 0;
                let ratio_sum = 0;
                for (const idx of diagram_ts.range2(offset, offset + ui_span)) {
                    if (descs[idx].endsWith("%")) {
                        ratio_sum += ratio(descs[idx]);
                    }
                    else {
                        fixed_px += min_sizes[idx];
                    }
                }
                if (ratio_sum == 0) {
                    if (fixed_px < ui.minSize.x) {
                        throw new diagram_ts.MyError();
                    }
                }
                else {
                    if (fixed_px <= ui.minSize.x) {
                        const ratio_px = ui.minSize.x - fixed_px;
                        const remaining_width = ratio_px / ratio_sum;
                        if (max_remaining_size < remaining_width) {
                            max_remaining_size = remaining_width;
                        }
                    }
                    else {
                        throw new diagram_ts.MyError();
                    }
                }
            }
            for (const [idx, col] of descs.entries()) {
                if (col.endsWith("px")) {
                    min_sizes[idx] = pixel(col);
                }
                else if (col.endsWith("%")) {
                    min_sizes[idx] = max_remaining_size * ratio(col);
                }
            }
            const size = diagram_ts.sum(min_sizes);
            const this_size = (is_width ? this.width : this.height);
            let this_size_px;
            if (this_size == undefined || this_size == "auto") {
                this_size_px = size;
            }
            else {
                if (this_size.endsWith("px")) {
                    this_size_px = pixel(this_size);
                    if (this_size_px < size) {
                        throw new diagram_ts.MyError();
                    }
                }
                else if (this_size.endsWith("%")) {
                    this_size_px = size / ratio(this_size);
                }
                else {
                    throw new diagram_ts.MyError();
                }
            }
            if (is_width) {
                this.minWidths = min_sizes;
                this.minSize.x = this_size_px + this.marginBorderPaddingWidth();
            }
            else {
                this.minHeights = min_sizes;
                this.minSize.y = this_size_px + this.marginBorderPaddingHeight();
            }
        }
        setMinSize() {
            this.minSize = diagram_ts.Vec2.zero();
            this.children().forEach(x => x.setMinSize());
            this.setMinSizeSub(true);
            this.setMinSizeSub(false);
        }
        static calcSizes(descs, min_sizes, remaining_px) {
            const sizes = Array(descs.length);
            for (const [idx, desc] of descs.entries()) {
                if (desc.endsWith("px")) {
                    sizes[idx] = pixel(desc);
                    if (sizes[idx] < min_sizes[idx]) {
                        throw new diagram_ts.MyError();
                    }
                }
                else if (desc.endsWith("%")) {
                    sizes[idx] = ratio(desc) * remaining_px;
                }
                else if (desc == "auto") {
                    sizes[idx] = min_sizes[idx];
                }
                else {
                    throw new diagram_ts.MyError();
                }
            }
            return sizes;
        }
        layout(x, y, size, nest) {
            super.layout(x, y, size, nest);
            const fixed_width_px = diagram_ts.sum(diagram_ts.range(this.numCols).filter(i => !this.colDescs[i].endsWith("%")).map(i => this.minWidths[i]));
            const fixed_height_px = diagram_ts.sum(diagram_ts.range(this.numRows).filter(i => !this.rowDescs[i].endsWith("%")).map(i => this.minHeights[i]));
            if (size.x < fixed_width_px || size.y < fixed_height_px) {
                throw new diagram_ts.MyError();
            }
            const remaining_width_px = size.x - fixed_width_px;
            const remaining_height_px = size.y - fixed_height_px;
            this.colWidths = Grid.calcSizes(this.colDescs, this.minWidths, remaining_width_px);
            this.rowHeights = Grid.calcSizes(this.rowDescs, this.minHeights, remaining_height_px);
            let y_offset = 0;
            for (const [row_idx, row] of this.cells.entries()) {
                let offset = 0;
                let x_offset = 0;
                for (const ui of row) {
                    let ui_width_px;
                    let ui_height_px;
                    if (ui.colspan == 1) {
                        ui_width_px = this.colWidths[offset];
                    }
                    else {
                        ui_width_px = diagram_ts.sum(this.colWidths.slice(offset, offset + ui.colspan));
                    }
                    if (ui.width != undefined && ui.width.endsWith("%")) {
                        ui_width_px *= ratio(ui.width);
                    }
                    if (ui.rowspan == 1) {
                        ui_height_px = this.rowHeights[row_idx];
                    }
                    else {
                        ui_height_px = diagram_ts.sum(this.rowHeights.slice(row_idx, row_idx + ui.rowspan));
                    }
                    if (ui.height != undefined && ui.height.endsWith("%")) {
                        ui_height_px *= ratio(ui.height);
                    }
                    const ui_size = new diagram_ts.Vec2(ui_width_px, ui_height_px);
                    ui.layout(x + x_offset, y + y_offset, ui_size, nest + 1);
                    x_offset += diagram_ts.sum(this.colWidths.slice(offset, offset + ui.colspan));
                    offset += ui.colspan;
                }
                y_offset += this.rowHeights[row_idx];
            }
        }
        updateRootLayout() {
            this.getAllUI().forEach(x => x.setMinSize());
            let size = diagram_ts.Vec2.zero();
            let x;
            let y;
            if (this.colDescs.some(x => x.endsWith("%"))) {
                size.x = window.innerWidth;
                x = 0;
            }
            else {
                size.x = this.minSize.x;
                x = Math.max(0, 0.5 * (window.innerWidth - size.x));
            }
            if (this.rowDescs.some(x => x.endsWith("%"))) {
                size.y = window.innerHeight;
                y = 0;
            }
            else {
                size.y = this.minSize.y;
                y = Math.max(0, 0.5 * (window.innerHeight - size.y));
            }
            this.layout(x, y, size, 0);
        }
        draw() {
            super.draw();
            this.children().forEach(x => x.draw());
        }
        str() {
            const col_descs = this.colDescs.join(" ");
            const row_descs = this.rowDescs.join(" ");
            const min_ws = this.minWidths.map(x => `${x}`).join(" ");
            const min_hs = this.minHeights.map(x => `${x}`).join(" ");
            const col_ws = this.colWidths.map(x => `${x}`).join(" ");
            const row_hs = this.rowHeights.map(x => `${x}`).join(" ");
            return `${super.str()} col:${col_descs} row:${row_descs} min-ws:${min_ws} min-hs:${min_hs} col-ws:${col_ws} row-hs:${row_hs}`;
        }
        dump(nest) {
            super.dump(nest);
            for (const row of this.cells) {
                row.forEach(ui => ui.dump(nest + 1));
                diagram_ts.msg("");
            }
        }
    }
    diagram_ts.Grid = Grid;
    function $label(data) {
        return new Label(data);
    }
    diagram_ts.$label = $label;
    function $button(data) {
        return new Button(data);
    }
    diagram_ts.$button = $button;
    function $filler(data) {
        return new Filler(data);
    }
    diagram_ts.$filler = $filler;
    function $grid(data) {
        return new Grid(data);
    }
    diagram_ts.$grid = $grid;
    function $hlist(data) {
        const grid_data = data;
        grid_data.columns = data.column;
        grid_data.cells = [data.children];
        delete data.children;
        delete data.column;
        return $grid(grid_data);
    }
    diagram_ts.$hlist = $hlist;
    function $vlist(data) {
        const grid_data = data;
        grid_data.columns = data.column;
        grid_data.cells = data.children.map(x => [x]);
        delete data.children;
        delete data.column;
        return $grid(grid_data);
    }
    diagram_ts.$vlist = $vlist;
})(diagram_ts || (diagram_ts = {}));
///<reference path="export.ts" />
///<reference path="ui.ts" />
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.notchRadius = 10;
    diagram_ts.nest_h1 = 35;
    diagram_ts.nest_h2 = 30;
    diagram_ts.nest_h3 = 35;
    diagram_ts.nest_h123 = diagram_ts.nest_h1 + diagram_ts.nest_h2 + diagram_ts.nest_h3;
    diagram_ts.blockLineWidth = 2;
    const blockLineColor = "brown";
    const nearPortDistance = 10;
    const rangeWidth = 150;
    const numberWidth = 45;
    let PortType;
    (function (PortType) {
        PortType[PortType["unknown"] = 0] = "unknown";
        PortType[PortType["bottom"] = 1] = "bottom";
        PortType[PortType["top"] = 2] = "top";
        PortType[PortType["inputPort"] = 3] = "inputPort";
        PortType[PortType["outputPort"] = 4] = "outputPort";
    })(PortType = diagram_ts.PortType || (diagram_ts.PortType = {}));
    class Block extends diagram_ts.UI {
        ports = [];
        outlineColor = "green";
        notchBottom = true;
        notchRight = true;
        inToolbox = false;
        constructor(data) {
            super(data);
            if (this.backgroundColor == undefined) {
                this.backgroundColor = "cornsilk";
            }
            this.padding = [5, 5, 5, 5];
            if (data.inToolbox != undefined) {
                this.inToolbox = data.inToolbox;
            }
        }
        copy() {
            const block = makeBlockByTypeName(this.constructor.name);
            block.position = this.position.copy();
            block.ctx = this.ctx;
            block.setMinSize();
            block.boxSize = block.minSize.copy();
            return block;
        }
        makeObj() {
            return {
                idx: this.idx,
                typeName: this.constructor.name,
                x: this.position.x,
                y: this.position.y,
                ports: this.ports.map(x => x.makeObj())
            };
        }
        loadObj(obj) {
        }
        calcHeight() {
            return this.minSize.y;
        }
        nextBlock() {
            let bottom_port;
            if (this instanceof diagram_ts.IfBlock) {
                bottom_port = this.bottomPort;
            }
            else if (this instanceof diagram_ts.InfiniteLoop) {
            }
            else {
                bottom_port = this.ports.find(x => x.type == PortType.bottom);
            }
            if (bottom_port != undefined && bottom_port.destinations.length != 0) {
                const dest_port = bottom_port.destinations[0];
                return dest_port.parent;
            }
            return undefined;
        }
        isProcedure() {
            return this instanceof diagram_ts.NestBlock || this instanceof TTSBlock || this instanceof SleepBlock;
        }
        getPortFromPosition(pos) {
            return this.ports.find(x => x.isNear(pos));
        }
        moveDiff(diff) {
            const new_position = this.position.add(diff);
            this.setPosition(new_position);
        }
        outputPorts() {
            return this.ports.filter(x => x.type == PortType.outputPort);
        }
        nextDataflowBlocks() {
            const blocks = [];
            const output_ports = this.outputPorts();
            for (const port of output_ports) {
                for (const dst of port.destinations) {
                    blocks.push(dst.parent);
                }
            }
            return blocks;
        }
        propergateCalc() {
            const next_dataflow_blocks = this.nextDataflowBlocks();
            next_dataflow_blocks.forEach(x => x.calc());
        }
        connectBlock(ports) {
            let [port1, port2] = ports;
            diagram_ts.assert(port1.parent == this);
            if (port1.type == PortType.bottom) {
                diagram_ts.assert(port2.type == PortType.top);
            }
            else if (port1.type == PortType.top) {
                diagram_ts.assert(port2.type == PortType.bottom);
                [port1, port2] = [port2, port1];
            }
            else {
                return;
            }
            port1.connect(port2);
            diagram_ts.msg(`connect block`);
        }
        drawNotch(cx, cy, type) {
            switch (type) {
                case PortType.bottom:
                    this.ctx.arc(cx, cy, diagram_ts.notchRadius, Math.PI, 0, true);
                    break;
                case PortType.top:
                    this.ctx.arc(cx, cy, diagram_ts.notchRadius, 0, Math.PI, false);
                    break;
                default:
                    throw new diagram_ts.MyError();
            }
        }
        drawOutline(points) {
            const canvas = diagram_ts.Canvas.one;
            if (canvas.draggedUI == this) {
                this.ctx.globalAlpha = 0.5;
            }
            else if (canvas.nearPorts.length != 0 && canvas.nearPorts[1].parent == this) {
                this.ctx.globalAlpha = 0.5;
            }
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.strokeStyle = blockLineColor;
            this.ctx.lineWidth = diagram_ts.blockLineWidth;
            this.ctx.beginPath();
            for (const [idx, [x, y, port]] of points.entries()) {
                if (idx == 0) {
                    this.ctx.moveTo(x, y);
                }
                else {
                    if (port == null) {
                        this.ctx.lineTo(x, y);
                    }
                    else {
                        this.drawNotch(x, y, port.type);
                        const port_pos = port.position;
                        port_pos.x = x;
                        port_pos.y = y;
                    }
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            if (this.ctx.globalAlpha != 1.0) {
                this.ctx.globalAlpha = 1.0;
            }
        }
        drawIOPorts(x1, x2, y1, y2) {
            const input_ports = this.ports.filter(x => x.type == PortType.inputPort);
            const output_ports = this.ports.filter(x => x.type == PortType.outputPort);
            for (const ports of [input_ports, output_ports]) {
                const y = (ports == input_ports ? y1 + diagram_ts.notchRadius : y2 - diagram_ts.notchRadius);
                for (const [i, port] of ports.entries()) {
                    const p = (i + 1) / (ports.length + 1);
                    const x = x1 * (1 - p) + x2 * p;
                    port.drawPort(this.ctx, x, y);
                }
            }
        }
        drawIcon(img) {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const img_height = (y2 - y1) - 6;
            const img_width = img_height * img.width / img.height;
            const img_x = x2 - img_width - 5;
            const img_y = y1 + 3;
            this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
        }
        getCornerPosition() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + this.minSize.x;
            const y2 = y1 + this.minSize.y;
            return [x1, y1, x2, y2];
        }
        drawDataflowBlock() {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, null],
                [x2, y1, null],
            ]);
            this.drawIOPorts(x1, x2, y1, y2);
        }
        drawActionBlock() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x1 + this.minSize.x;
            const y2 = y1 + this.minSize.y - diagram_ts.notchRadius;
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, this.ports[1]],
                [x3, y2, null],
                [x3, y1, null],
                [x2, y1, this.ports[0]]
            ]);
        }
        canConnectNearPortPair(block) {
            for (const port1 of this.ports) {
                for (const port2 of block.ports) {
                    if (port1.canConnect(port2) && port1.position.distance(port2.position) <= nearPortDistance) {
                        return [port1, port2];
                    }
                }
            }
            return [];
        }
        async valueChanged() {
            diagram_ts.msg(`changed : ${this.constructor.name}`);
        }
        calc() {
            throw new diagram_ts.MyError();
        }
        async run() {
            throw new diagram_ts.MyError();
        }
    }
    diagram_ts.Block = Block;
    class InputBlock extends Block {
        input;
        constructor(data) {
            super(data);
            this.input = document.createElement("input");
            this.input.style.position = "absolute";
            document.body.appendChild(this.input);
        }
        getInputPosition() {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const rect = this.input.getBoundingClientRect();
            const input_x = x1 + 0.5 * ((x2 - x1) - rect.width);
            const input_y = y1 + 0.5 * ((y2 - y1) - rect.height);
            return [input_x, input_y];
        }
        setPosition(position) {
            super.setPosition(position);
            const [x1, y1] = this.getInputPosition();
            this.input.style.left = `${x1}px`;
            this.input.style.top = `${y1}px`;
        }
    }
    diagram_ts.InputBlock = InputBlock;
    class InputRangeBlock extends InputBlock {
        minInput;
        maxInput;
        constructor(data) {
            super(data);
            this.input.type = "range";
            this.input.style.width = `${rangeWidth}px`;
            this.input.min = "0";
            this.input.max = "100";
            this.minInput = document.createElement("input");
            this.minInput.type = "number";
            this.minInput.value = "0";
            this.minInput.style.position = "absolute";
            this.minInput.style.width = `${numberWidth}px`;
            this.maxInput = document.createElement("input");
            this.maxInput.type = "number";
            this.maxInput.value = "100";
            this.maxInput.style.position = "absolute";
            this.maxInput.style.width = `${numberWidth}px`;
            document.body.appendChild(this.minInput);
            document.body.appendChild(this.maxInput);
            this.input.addEventListener("input", async (ev) => {
                const value = parseFloat(this.input.value);
                for (const src of this.ports) {
                    src.setPortValue(value);
                }
                diagram_ts.Canvas.one.requestUpdateCanvas();
            });
            this.minInput.addEventListener('change', (ev) => {
                this.input.min = this.minInput.value;
                diagram_ts.msg(`min : [${this.input.min}]`);
            });
            this.maxInput.addEventListener('change', (ev) => {
                this.input.max = this.maxInput.value;
                diagram_ts.msg(`max : [${this.input.max}]`);
            });
            this.ports = [new diagram_ts.Port(this, PortType.outputPort)];
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                value: this.input.value,
                min: this.minInput.value,
                max: this.maxInput.value
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = `${obj.value}`;
            this.minInput.value = `${obj.min}`;
            this.maxInput.value = `${obj.max}`;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        setPosition(position) {
            super.setPosition(position);
            const [pos, size] = this.drawBox();
            const rc1 = this.input.getBoundingClientRect();
            const rc2 = this.minInput.getBoundingClientRect();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth + 2 * diagram_ts.Port.radius;
            const y1 = pos.y + 0.5 * (size.y - (rc1.height + rc2.height));
            const y2 = y1 + rc1.height;
            this.input.style.left = `${x1}px`;
            this.input.style.top = `${y1}px`;
            this.minInput.style.left = `${x1}px`;
            this.minInput.style.top = `${y2}px`;
            this.maxInput.style.left = `${x1 + rc1.width - rc2.width}px`;
            this.maxInput.style.top = `${y2}px`;
        }
        draw() {
            this.drawDataflowBlock();
        }
    }
    diagram_ts.InputRangeBlock = InputRangeBlock;
    class ServoMotorBlock extends InputBlock {
        constructor(data) {
            super(data);
            this.input.type = "number";
            this.input.style.width = "45px";
            this.input.value = "0";
            this.input.min = "0";
            this.input.max = "15";
            this.input.addEventListener("input", (ev) => {
                diagram_ts.msg(`change : [${this.input.value}]`);
            });
            this.ports = [new diagram_ts.Port(this, PortType.inputPort)];
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                channel: parseInt(this.input.value)
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = `${obj.channel}`;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        setPosition(position) {
            super.setPosition(position);
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const rect = this.input.getBoundingClientRect();
            const input_x = x1 + 10;
            const input_y = y1 + 0.5 * ((y2 - y1) - rect.height);
            this.input.style.left = `${input_x}px`;
            this.input.style.top = `${input_y}px`;
        }
        draw() {
            this.drawDataflowBlock();
            this.drawIcon(diagram_ts.motorIcon);
        }
        async valueChanged() {
            const channel = parseInt(this.input.value);
            const value = this.ports[0].value;
            diagram_ts.msg(`motor changed : ch:${channel} value:[${value}]`);
            if (typeof value != "number") {
                diagram_ts.msg(`illegal motor value:${value}`);
                return;
            }
            await diagram_ts.sendData({
                command: "servo",
                channel: channel,
                value: value
            });
        }
        calc() {
            diagram_ts.msg(`motor calc:${this.ports[0].value}`);
        }
    }
    diagram_ts.ServoMotorBlock = ServoMotorBlock;
    class InputTextBlock extends InputBlock {
        constructor(data) {
            super(data);
            this.input.type = "text";
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                text: this.input.value
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = obj.text;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 20 + 2 * 2 * diagram_ts.notchRadius);
        }
        draw() {
            this.drawDataflowBlock();
        }
        makeInputValueMap() {
            const map = new Map();
            for (const port of this.ports) {
                if (port.type == PortType.inputPort) {
                    diagram_ts.assert(port.name != "" && typeof port.value === 'number' && !isNaN(port.value));
                    map.set(port.name, port.value);
                }
            }
            return map;
        }
    }
    class SetValueBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.input.style.width = "45px";
            this.input.value = "0";
            this.input.addEventListener("change", (ev) => {
                diagram_ts.msg(`change : [${this.input.value}]`);
            });
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.outputPort),
                new diagram_ts.Port(this, PortType.bottom),
            ];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x1 + this.minSize.x;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const y2 = y1 + this.minSize.y - diagram_ts.notchRadius;
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, this.ports[2]],
                [x3, y2, null],
                [x3, y1, null],
                [x2, y1, this.ports[0]]
            ]);
            this.drawIOPorts(x1, x3, y1, y2);
        }
    }
    diagram_ts.SetValueBlock = SetValueBlock;
    class CameraBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [new diagram_ts.Port(this, PortType.outputPort)];
        }
        setMinSize() {
            if (this.inToolbox) {
                this.minSize = new diagram_ts.Vec2(320, 50 + 2 * diagram_ts.notchRadius);
            }
            else {
                this.minSize = new diagram_ts.Vec2(320, 240 + 2 * diagram_ts.notchRadius);
            }
        }
        draw() {
            this.drawDataflowBlock();
            const [x1, y1, x2, y2] = this.getCornerPosition();
            let img;
            if (this.inToolbox) {
                img = diagram_ts.cameraIcon;
            }
            else {
                if (diagram_ts.cameraImg == undefined) {
                    return;
                }
                img = diagram_ts.cameraImg;
            }
            const img_height = (y2 - y1) - 2 * diagram_ts.notchRadius;
            const img_width = img_height * img.width / img.height;
            const img_x = x1 + 0.5 * ((x2 - x1) - img_width);
            const img_y = y1;
            this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
        }
    }
    diagram_ts.CameraBlock = CameraBlock;
    class TTSBlock extends InputTextBlock {
        speech;
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.bottom)
            ];
            this.input.value = "こんにちは!どうぞよろしく!";
            i18n_ts.setVoiceLanguageCode("jpn");
            this.speech = new diagram_ts.Speech();
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(300, 50);
        }
        draw() {
            this.drawActionBlock();
            this.drawIcon(diagram_ts.ttsIcon);
        }
        async run() {
            await this.speech.speak_waitEnd(this.input.value.trim());
        }
    }
    diagram_ts.TTSBlock = TTSBlock;
    class SleepBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.bottom)
            ];
            this.input.value = "3";
            this.input.style.width = "45px";
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        draw() {
            this.drawActionBlock();
            this.drawIcon(diagram_ts.sleepIcon);
        }
        async run() {
            const second = parseFloat(this.input.value.trim());
            await diagram_ts.sleep(second * 1000);
        }
    }
    diagram_ts.SleepBlock = SleepBlock;
    class FaceDetectionBlock extends Block {
        face = [];
        constructor(data) {
            super(data);
            this.ports = [new diagram_ts.Port(this, PortType.inputPort), new diagram_ts.Port(this, PortType.outputPort), new diagram_ts.Port(this, PortType.outputPort)];
        }
        setMinSize() {
            if (this.inToolbox) {
                this.minSize = new diagram_ts.Vec2(150, 10 + 2 * 2 * diagram_ts.notchRadius);
            }
            else {
                this.minSize = new diagram_ts.Vec2(320, 240 + 2 * 2 * diagram_ts.notchRadius);
            }
        }
        setFace(face) {
            this.face = face.slice();
            const [x, y, w, h] = this.face;
            const cx = x + w / 2;
            const cy = y + h / 2;
            this.ports[1].setPortValue(cx);
            this.ports[2].setPortValue(cy);
        }
        getCamera() {
            if (this.ports[0].sources.length != 0) {
                const camera = this.ports[0].sources.map(x => x.parent).find(x => x instanceof CameraBlock);
                return camera;
            }
            return undefined;
        }
        draw() {
            this.drawDataflowBlock();
            const camera = this.getCamera();
            if (camera != undefined) {
                const [x1, y1, x2, y2] = this.getCornerPosition();
                if (diagram_ts.cameraImg == undefined) {
                    return;
                }
                const img = diagram_ts.cameraImg;
                const img_height = (y2 - y1) - 2 * 2 * diagram_ts.notchRadius;
                const img_width = img_height * img.width / img.height;
                const img_x = x1 + 0.5 * ((x2 - x1) - img_width);
                const img_y = y1 + 2 * diagram_ts.notchRadius;
                this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
                if (this.face.length == 4) {
                    this.ctx.save();
                    // Set the stroke color to red
                    this.ctx.strokeStyle = 'red';
                    // Set the line thickness to 5 pixels
                    this.ctx.lineWidth = 5;
                    const [face_x, face_y, face_w, face_h] = this.face;
                    const cx = img_x + img_width / 2;
                    const cy = img_y + img_height / 2;
                    const img_face_x = cx + img_width * face_x / 100;
                    const img_face_y = cy + img_height * face_y / 100;
                    const img_face_w = img_width * face_w / 100;
                    const img_face_h = img_height * face_h / 100;
                    // Draw an outlined rectangle at (200, 50) with a size of 100x75
                    this.ctx.strokeRect(img_face_x, img_face_y, img_face_w, img_face_h);
                    this.ctx.restore();
                }
            }
        }
    }
    diagram_ts.FaceDetectionBlock = FaceDetectionBlock;
    class JoyStickBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(150, 50);
        }
    }
    diagram_ts.JoyStickBlock = JoyStickBlock;
    class UltrasonicDistanceSensorBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.outputPort)
            ];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(300, 50);
        }
        setDistance(distance) {
            this.ports[0].setPortValue(distance);
        }
        draw() {
            this.drawDataflowBlock();
            this.drawIcon(diagram_ts.distanceSensorIcon);
        }
    }
    diagram_ts.UltrasonicDistanceSensorBlock = UltrasonicDistanceSensorBlock;
    function calcTerm(map, term) {
        let value;
        if (term instanceof diagram_ts.Rational) {
            return term.fval();
        }
        else if (term instanceof diagram_ts.ConstNum) {
            return term.value.fval();
        }
        else if (term instanceof diagram_ts.RefVar) {
            value = map.get(term.name);
            diagram_ts.assert(value != undefined);
            return value;
        }
        else if (term instanceof diagram_ts.App) {
            const app = term;
            const arg_values = app.args.map(x => calcTerm(map, x));
            if (app.isAdd()) {
                value = diagram_ts.sum(arg_values);
            }
            else if (app.isMul()) {
                value = arg_values.reduce((acc, cur) => acc * cur, 1);
            }
            else if (app.isDiv()) {
                value = arg_values[0] / arg_values[1];
            }
            else if (app.fncName == "%") {
                value = arg_values[0] % arg_values[1];
            }
            else if (app.isEq()) {
                value = (arg_values[0] == arg_values[1] ? 1 : 0);
            }
            else if (app.fncName == "<=") {
                value = (arg_values[0] <= arg_values[1] ? 1 : 0);
            }
            else if (app.fncName == "<") {
                value = (arg_values[0] < arg_values[1] ? 1 : 0);
            }
            else {
                throw new diagram_ts.MyError("unimplemented");
            }
        }
        else {
            throw new diagram_ts.MyError("unimplemented");
        }
        return term.value.fval() * value;
    }
    class CalcBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.inputPort, "a"),
                new diagram_ts.Port(this, PortType.outputPort, "b")
            ];
        }
        calc() {
            diagram_ts.msg(`start calc: a:${this.ports[0].value}`);
            const expr = diagram_ts.parseMath(this.input.value.trim());
            diagram_ts.assert(expr.isRootEq());
            const lhs = expr.args[0];
            const rhs = expr.args[1];
            const map = this.makeInputValueMap();
            const rhs_value = calcTerm(map, rhs);
            const lhs_port = this.ports.find(x => x.name == lhs.name && x.type == PortType.outputPort);
            diagram_ts.assert(lhs_port != undefined);
            lhs_port.setPortValue(rhs_value);
            diagram_ts.msg(`end calc: b:${this.ports[1].value}`);
            this.propergateCalc();
        }
    }
    diagram_ts.CalcBlock = CalcBlock;
    class CompareBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.inputPort, "a"),
                new diagram_ts.Port(this, PortType.outputPort)
            ];
            this.input.value = "a == a";
        }
        calc() {
            diagram_ts.msg(`start compare: a:${this.ports[0].value}`);
            let expr;
            try {
                expr = diagram_ts.parseMath(this.input.value.trim());
            }
            catch (error) {
                if (error instanceof parser_ts.SyntaxError) {
                    diagram_ts.msg(`syntax error`);
                }
                else {
                    console.error("An unexpected error occurred:", error);
                }
                this.ports[1].setPortValue(undefined);
                return;
            }
            const map = this.makeInputValueMap();
            const result = calcTerm(map, expr);
            if (result == 0 || result == 1) {
                this.ports[1].setPortValue(result);
            }
            else {
                diagram_ts.msg(`illegal compare result:${result}`);
                this.ports[1].setPortValue(undefined);
            }
        }
    }
    diagram_ts.CompareBlock = CompareBlock;
    function makeBlockByTypeName(typeName) {
        switch (typeName) {
            case diagram_ts.IfBlock.name: return new diagram_ts.IfBlock({});
            case CompareBlock.name: return new CompareBlock({});
            case diagram_ts.InfiniteLoop.name: return new diagram_ts.InfiniteLoop({});
            case InputRangeBlock.name: return new InputRangeBlock({});
            case ServoMotorBlock.name: return new ServoMotorBlock({});
            case SetValueBlock.name: return new SetValueBlock({});
            case CameraBlock.name: return new CameraBlock({});
            case TTSBlock.name: return new TTSBlock({});
            case SleepBlock.name: return new SleepBlock({});
            case FaceDetectionBlock.name: return new FaceDetectionBlock({});
            case JoyStickBlock.name: return new JoyStickBlock({});
            case UltrasonicDistanceSensorBlock.name: return new UltrasonicDistanceSensorBlock({});
            case CalcBlock.name: return new CalcBlock({});
            default:
                throw new diagram_ts.MyError();
        }
    }
    diagram_ts.makeBlockByTypeName = makeBlockByTypeName;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.repaintCount = 0;
    let animationFrameId = null;
    class Canvas {
        static one;
        canvas;
        ctx;
        root;
        draggedUI;
        nearPorts = [];
        pointerId = NaN;
        downPos = diagram_ts.Vec2.zero();
        movePos = diagram_ts.Vec2.zero();
        uiOrgPos = diagram_ts.Vec2.zero();
        moved = false;
        constructor(canvas_html, root) {
            Canvas.one = this;
            this.canvas = canvas_html;
            this.ctx = this.canvas.getContext('2d'); // Or 'webgl', 'webgl2'
            if (!this.ctx) {
                console.error("Canvas context not supported!");
            }
            this.root = root;
            diagram_ts.setContext2D(this.ctx, this.root);
            this.canvas.addEventListener("pointerdown", this.pointerdown.bind(this));
            this.canvas.addEventListener("pointermove", this.pointermove.bind(this));
            this.canvas.addEventListener("pointerup", async (ev) => {
                await Canvas.one.pointerup(ev);
            });
        }
        getPositionInCanvas(event) {
            // Get the bounding rectangle of the canvas
            const rect = this.canvas.getBoundingClientRect();
            // Calculate the scaling factors if the canvas is styled differently from its internal resolution
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            // Calculate the canvas coordinates
            const canvasX = (event.clientX - rect.left) * scaleX;
            const canvasY = (event.clientY - rect.top) * scaleY;
            return new diagram_ts.Vec2(canvasX, canvasY);
            // Now you have the canvas coordinates!
            // console.log(`Canvas X: ${canvasX}, Canvas Y: ${canvasY}`);
        }
        getUIFromPosition(ui, pos) {
            for (const child of ui.children()) {
                const target = this.getUIFromPosition(child, pos);
                if (target != undefined) {
                    return target;
                }
            }
            if (ui.position.x <= pos.x && pos.x < ui.position.x + ui.boxSize.x) {
                if (ui.position.y <= pos.y && pos.y < ui.position.y + ui.boxSize.y) {
                    if (ui instanceof diagram_ts.Block) {
                        const port = ui.getPortFromPosition(pos);
                        if (port != undefined) {
                            return port;
                        }
                    }
                    return ui;
                }
            }
            return undefined;
        }
        pointerdown(ev) {
            this.moved = false;
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            if (target != undefined) {
                diagram_ts.msg(`down:${target.constructor.name}`);
                this.downPos = pos;
                this.movePos = pos;
                if (target instanceof diagram_ts.Block) {
                    if (target instanceof diagram_ts.InputRangeBlock) {
                        diagram_ts.msg(`range: box${target.boxSize.x.toFixed()} out:${target.minSize.x}`);
                    }
                    if (target.inToolbox) {
                        const block = target.copy();
                        diagram_ts.Main.one.editor.addBlock(block);
                        this.draggedUI = block;
                    }
                    else {
                        this.draggedUI = target;
                    }
                }
                else if (target instanceof diagram_ts.Port) {
                    diagram_ts.msg(`down port:${target.str()}`);
                    this.draggedUI = target;
                }
                else if (target instanceof diagram_ts.Button) {
                    diagram_ts.msg(`down button:${target.text}`);
                    this.draggedUI = target;
                }
                else {
                    return;
                }
                this.uiOrgPos = this.draggedUI.position.copy();
                this.pointerId = ev.pointerId;
                this.canvas.setPointerCapture(this.pointerId);
                this.canvas.classList.add('dragging');
            }
        }
        getNearPorts(dragged_block) {
            this.nearPorts = [];
            const other_blocks = diagram_ts.Main.one.editor.blocks.filter(x => x != this.draggedUI);
            for (const block of other_blocks) {
                const near_ports = dragged_block.canConnectNearPortPair(block);
                if (near_ports.length != 0) {
                    diagram_ts.msg(`near`);
                    this.nearPorts = near_ports;
                    break;
                }
            }
        }
        pointermove(ev) {
            this.moved = true;
            if (this.draggedUI == undefined) {
                return;
            }
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            const s = (target == undefined ? "" : `target:[${target.str()}]`);
            this.movePos = pos;
            const diff = pos.sub(this.downPos);
            if (this.draggedUI instanceof diagram_ts.Block) {
                this.draggedUI.setPosition(this.uiOrgPos.add(diff));
                this.getNearPorts(this.draggedUI);
            }
            this.requestUpdateCanvas();
        }
        requestUpdateCanvas() {
            if (animationFrameId == null) {
                animationFrameId = requestAnimationFrame(() => {
                    animationFrameId = null;
                    this.repaint();
                });
            }
        }
        async pointerup(ev) {
            if (this.draggedUI == undefined) {
                return;
            }
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            if (this.moved) {
                diagram_ts.msg("dragged");
                if (this.draggedUI instanceof diagram_ts.Port && target instanceof diagram_ts.Port) {
                    this.draggedUI.connect(target);
                }
                else if (this.draggedUI instanceof diagram_ts.Block) {
                    const diff = pos.sub(this.downPos);
                    this.getNearPorts(this.draggedUI);
                    if (this.nearPorts.length == 2) {
                        const port_diffs = this.nearPorts[1].position.sub(this.nearPorts[0].position);
                        this.draggedUI.moveDiff(port_diffs);
                        this.draggedUI.connectBlock(this.nearPorts);
                        this.layoutRoot();
                    }
                    else {
                        this.draggedUI.setPosition(this.uiOrgPos.add(diff));
                    }
                }
            }
            else {
                diagram_ts.msg(`click:${this.draggedUI.constructor.name}`);
                if (this.draggedUI instanceof diagram_ts.Button) {
                    await this.draggedUI.click();
                }
            }
            this.canvas.releasePointerCapture(this.pointerId);
            this.canvas.classList.remove('dragging');
            this.draggedUI = undefined;
            this.pointerId = NaN;
            this.nearPorts = [];
            this.requestUpdateCanvas();
            this.moved = false;
        }
        layoutRoot() {
            this.root.setMinSize();
            this.root.layout(0, 0, new diagram_ts.Vec2(this.canvas.width, this.canvas.height), 0);
        }
        resizeCanvas() {
            // Set the canvas's internal drawing dimensions to match its display size
            // window.innerWidth/Height give the viewport dimensions.
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // If you're drawing something, you might want to redraw it here
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
                // Example drawing
                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(50, 50, 100, 100);
                this.ctx.font = '30px Arial';
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('Hello Canvas!', this.canvas.width / 2 - 100, this.canvas.height / 2);
            }
            this.layoutRoot();
            this.root.dump(0);
            this.requestUpdateCanvas();
        }
        drawDraggedPort(port) {
            this.drawLine(port.position, this.movePos, "blue");
        }
        repaint() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.root.draw();
            if (this.draggedUI instanceof diagram_ts.Port) {
                this.drawDraggedPort(this.draggedUI);
            }
            // msg("repaint");
            diagram_ts.repaintCount++;
        }
        drawLine(start, end, color, lineWidth = 2) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
    }
    diagram_ts.Canvas = Canvas;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    let startButton;
    diagram_ts.stopFlag = false;
    let isRunning = false;
    class Variable {
        name;
        type;
    }
    class Field extends Variable {
        parent;
    }
    class Struct {
        members = [];
    }
    diagram_ts.Struct = Struct;
    class DataType {
        dimensions = [];
        typeName;
    }
    diagram_ts.DataType = DataType;
    class Port {
        static radius = 10;
        idx = 0;
        name;
        parent;
        destinations = [];
        sources = [];
        type;
        pipes = [];
        position = diagram_ts.Vec2.zero();
        prevValue;
        value;
        constructor(parent, type, name = "") {
            this.parent = parent;
            this.type = type;
            this.name = name;
        }
        str() {
            return "port";
        }
        copyPort(parent) {
            const port = new Port(parent, this.type);
            port.position = this.position.copy();
            return port;
        }
        makeObj() {
            return {
                idx: this.idx,
                destinations: this.destinations.map(dst => dst.idx)
            };
        }
        setPortValue(value) {
            this.value = value;
            for (const dst of this.destinations) {
                dst.setPortValue(value);
                dst.parent.valueChanged()
                    .then(() => {
                })
                    .catch(error => {
                    console.error("Failed to value change:", error);
                });
            }
        }
        isNear(pos) {
            return this.position.distance(pos) < Port.radius;
        }
        drawPort(ctx, cx, cy) {
            ctx.beginPath();
            this.position.x = cx;
            this.position.y = cy;
            ctx.arc(this.position.x, this.position.y, Port.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            for (const dst of this.destinations) {
                diagram_ts.Canvas.one.drawLine(this.position, dst.position, "brown", 4);
            }
            if (this.name != "") {
                // ctx.strokeText(this.name, this.position.x, this.position.y);
                ctx.save();
                ctx.font = '24px Arial';
                ctx.fillStyle = "black";
                const x = this.position.x - 7;
                const y = this.position.y + 7;
                ctx.fillText(this.name, x, y);
                ctx.restore();
            }
            if (this.value != undefined) {
                ctx.save();
                ctx.font = '24px Arial';
                ctx.fillStyle = "black";
                const x = this.position.x - 7 + Port.radius;
                const y = this.position.y + 7;
                ctx.fillText(`${this.value}`, x, y);
                ctx.restore();
            }
        }
        canConnect(dst) {
            const pairs = [
                [diagram_ts.PortType.bottom, diagram_ts.PortType.top],
                [diagram_ts.PortType.top, diagram_ts.PortType.bottom],
                [diagram_ts.PortType.inputPort, diagram_ts.PortType.outputPort],
                [diagram_ts.PortType.outputPort, diagram_ts.PortType.inputPort]
            ];
            return pairs.some(pair => pair[0] == this.type && pair[1] == dst.type);
        }
        connect(port) {
            diagram_ts.assert(this.canConnect(port));
            let src;
            let dst;
            if (this.type == diagram_ts.PortType.bottom || this.type == diagram_ts.PortType.outputPort) {
                [src, dst] = [this, port];
            }
            else {
                [src, dst] = [port, this];
            }
            diagram_ts.append(src.destinations, dst);
            diagram_ts.append(dst.sources, src);
            diagram_ts.msg(`connect port:${this.idx}=>${port.idx}`);
        }
    }
    diagram_ts.Port = Port;
    class Joint {
        drawJoint(canvas) {
        }
    }
    class Tube {
        drawTube(canvas) {
        }
    }
    class Pipe {
        source;
        destination;
        tubes = [];
        joints = [];
        drawPipe(canvas) {
        }
    }
    diagram_ts.Pipe = Pipe;
    class Edge {
    }
    diagram_ts.Edge = Edge;
    class Plot {
    }
    class Layer {
    }
    diagram_ts.Layer = Layer;
    class Scheduler {
    }
    document.addEventListener('DOMContentLoaded', async () => {
        await asyncBodyOnLoad();
    });
    //
    let main;
    class Main {
        static one;
        canvas;
        editor;
        constructor() {
            Main.one = this;
            // Get the canvas element
            this.editor = new diagram_ts.Editor({});
            const root = diagram_ts.$grid({
                rows: "60px 100%",
                columns: "10px 25% 75%",
                cells: [
                    // [
                    //     $filler({
                    //         colspan : 3,
                    //         backgroundColor : "cornsilk"
                    //     })
                    // ]
                    // ,
                    [
                        diagram_ts.$filler({ colspan: 3 })
                    ],
                    [
                        diagram_ts.$filler({}),
                        diagram_ts.$vlist({
                            column: "100%",
                            children: [
                                new diagram_ts.IfBlock({ inToolbox: true }),
                                new diagram_ts.InfiniteLoop({ inToolbox: true }),
                                new diagram_ts.CompareBlock({ inToolbox: true }),
                                new diagram_ts.InputRangeBlock({ inToolbox: true }),
                                new diagram_ts.ServoMotorBlock({ inToolbox: true }),
                                new diagram_ts.SetValueBlock({ inToolbox: true }),
                                new diagram_ts.CameraBlock({ inToolbox: true }),
                                new diagram_ts.FaceDetectionBlock({ inToolbox: true }),
                                new diagram_ts.CalcBlock({ inToolbox: true }),
                                new diagram_ts.UltrasonicDistanceSensorBlock({ inToolbox: true }),
                                new diagram_ts.TTSBlock({ inToolbox: true }),
                                new diagram_ts.SleepBlock({ inToolbox: true })
                            ]
                        }),
                        this.editor
                    ]
                ]
            });
            const canvas_html = document.getElementById('world');
            this.canvas = new diagram_ts.Canvas(canvas_html, root);
            // Initial resize when the page loads
            // Use DOMContentLoaded to ensure the canvas element exists before trying to access it
            document.addEventListener('DOMContentLoaded', this.canvas.resizeCanvas.bind(this.canvas));
            // Add an event listener to resize the canvas whenever the window is resized
            window.addEventListener('resize', this.canvas.resizeCanvas.bind(this.canvas));
            diagram_ts.setDragDrop(this.canvas.canvas);
            this.canvas.resizeCanvas();
        }
    }
    diagram_ts.Main = Main;
    function fetchImage(image_url) {
        const image = new Image();
        image.width = 320;
        image.height = 240;
        // 2. Set the crossOrigin attribute for security and to prevent a tainted canvas
        image.crossOrigin = 'Anonymous';
        image.src = image_url;
        // 4. Wait for the image to load
        image.onload = () => {
            diagram_ts.cameraImg = image;
        };
    }
    function updateCameraImage(image_file_name) {
        const blocks = Main.one.editor.blocks;
        const cameras = blocks.filter(x => x instanceof diagram_ts.CameraBlock);
        for (const camera of cameras) {
            const image_url = `static/lib/diagram/img/${image_file_name}`;
            fetchImage(image_url);
        }
    }
    function updateFaceDetection(face) {
        const face_detection = Main.one.editor.blocks.find(x => x instanceof diagram_ts.FaceDetectionBlock);
        if (face_detection != undefined) {
            face_detection.setFace(face);
            face_detection.propergateCalc();
        }
    }
    function updateDistanceSensor(distance) {
        const distance_sensor = Main.one.editor.blocks.find(x => x instanceof diagram_ts.UltrasonicDistanceSensorBlock);
        if (distance_sensor != undefined) {
            distance_sensor.setDistance(distance);
            distance_sensor.propergateCalc();
        }
    }
    async function clearQueue() {
        for (let idx = 0;; idx++) {
            const result = await diagram_ts.sendData({
                command: "status"
            });
            const queue = result["queue"];
            if (queue == null) {
                break;
            }
            diagram_ts.msg(`clear queue:${idx}`);
        }
    }
    async function periodicTask() {
        const result = await diagram_ts.sendData({
            command: "status"
        });
        const queue = result["queue"];
        if (queue != null) {
            const json_str = JSON.stringify(result, null, 2);
            diagram_ts.msg(`status:${json_str}`);
            const image_file_name = queue["image_file_name"];
            if (image_file_name != undefined) {
                updateCameraImage(image_file_name);
            }
            const face = queue["face"];
            if (face != undefined) {
                diagram_ts.assert(face.length == 4);
                updateFaceDetection(face);
            }
            const distance = queue["distance"];
            if (distance != undefined) {
                diagram_ts.assert(typeof distance == "number");
                updateDistanceSensor(distance);
            }
            diagram_ts.Canvas.one.requestUpdateCanvas();
        }
        setTimeout(periodicTask, 100);
    }
    function getTopProcedures() {
        const procedure_blocks = Main.one.editor.blocks.filter(x => x.isProcedure());
        const top_blocks = [];
        for (const block of procedure_blocks) {
            const top_port = block.ports.find(x => x.type == diagram_ts.PortType.top);
            diagram_ts.assert(top_port != undefined);
            if (top_port.sources.length == 0) {
                top_blocks.push(block);
            }
        }
        return top_blocks;
    }
    async function runBlockChain(top_block) {
        for (let block = top_block; block != undefined; block = block.nextBlock()) {
            await block.run();
            if (diagram_ts.stopFlag) {
                break;
            }
        }
    }
    diagram_ts.runBlockChain = runBlockChain;
    async function startProcedures() {
        startButton.innerText = "Stop";
        isRunning = true;
        diagram_ts.stopFlag = false;
        const top_blocks = getTopProcedures();
        for (const top_block of top_blocks) {
            diagram_ts.msg(`top proc:${top_block.constructor.name}`);
            await runBlockChain(top_block);
            if (diagram_ts.stopFlag) {
                break;
            }
        }
        diagram_ts.msg("procedures complete.");
        isRunning = false;
        startButton.innerText = "Start";
    }
    async function asyncBodyOnLoad() {
        diagram_ts.msg("loaded");
        let pathname;
        [diagram_ts.urlOrigin, pathname,] = i18n_ts.parseURL();
        diagram_ts.msg(`origin:[${diagram_ts.urlOrigin}] path:[${pathname}]`);
        diagram_ts.cameraIcon = document.getElementById("camera-icon");
        diagram_ts.motorIcon = document.getElementById("motor-icon");
        diagram_ts.distanceSensorIcon = document.getElementById("distance-sensor-icon");
        diagram_ts.ttsIcon = document.getElementById("tts-icon");
        diagram_ts.sleepIcon = document.getElementById("sleep-icon");
        startButton = diagram_ts.$("start-btn");
        startButton.addEventListener("click", async (ev) => {
            if (isRunning) {
                diagram_ts.stopFlag = true;
            }
            else {
                await startProcedures();
            }
        });
        const downloadBtn = diagram_ts.$("download-btn");
        downloadBtn.addEventListener("click", async (ev) => {
            diagram_ts.saveJson();
        });
        main = new Main();
        await clearQueue();
        if (diagram_ts.urlOrigin != "http://127.0.0.1:5500") {
            await periodicTask();
        }
    }
    diagram_ts.asyncBodyOnLoad = asyncBodyOnLoad;
    // export class Node {
    // }
    /*
    ダイアグラム
    ・フローチャート
    ・データフロー
    ・回路図
    ・UI画面
    ・UML
        ・シーケンス図
        ・クラス図
        ・アクティビティ図
        ・コンポーネント図
        ・状態遷移図
        ・タイミング図
        ・
    ・
    ・
    ・
    ・
    
    コンポーネント
    ・実行
        ・if/else
        ・while
        ・代入
        ・ストリーム
            ・通信
                ・プロセス間
                ・ソケット
                    ・TCP
                    ・UDP
            ・バッファ付き
        ・sleep
        ・wait until
        ・call function
        ・ブロック
            ・関数定義
            ・デバイス
    
    
    実行モード
    ・編集
    ・エミュレーション
    ・実機デバッグ
    
    スケジューリング
    ・即時に再実行
    ・Tick時に再実行
    
    ・入力されたら
    ・値が変化したら
    
    ・１つでも入力されたら
    ・全部入力されたら
    
    */
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    async function sendData(dataToSend) {
        const url = `${diagram_ts.urlOrigin}/send_data`;
        // msg(`post:[${url}]`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend) // Convert JavaScript object to JSON string
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
            }
            const result = await response.json(); // Parse the JSON response from Flask
            const json_str = JSON.stringify(result, null, 2); // Pretty print JSON
            // msg(`send data result:[${json_str}]`);
            return result;
        }
        catch (error) {
            diagram_ts.msg(`send data error: ${error.message || error}`);
            return undefined;
        }
    }
    diagram_ts.sendData = sendData;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    function downloadJson(data) {
        // Convert the object to a JSON string
        const jsonData = JSON.stringify(data, null, 2); // The last two arguments are for formatting (indentation)
        // Create a Blob from the JSON string
        const blob = new Blob([jsonData], { type: "application/json" });
        // Create an anchor element
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "diagram.json"; // Set the filename
        // Append the link to the body (it must be in the document to be clickable)
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Clean up: remove the link and revoke the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
    diagram_ts.downloadJson = downloadJson;
    function preventDefaults(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }
    function setDragDrop(canvas) {
        canvas.addEventListener("dragenter", (ev) => {
            preventDefaults(ev);
            diagram_ts.msg("drag enter");
        });
        canvas.addEventListener("dragover", (ev) => {
            preventDefaults(ev);
            canvas.classList.add('dragover');
            diagram_ts.msg("drag over");
        });
        canvas.addEventListener("dragleave", (ev) => {
            preventDefaults(ev);
            canvas.classList.remove('dragover');
            diagram_ts.msg("drag leave");
        });
        canvas.addEventListener("drop", async (ev) => {
            preventDefaults(ev);
            canvas.classList.remove('dragover');
            diagram_ts.msg("drop");
            const dt = ev.dataTransfer;
            if (dt == null) {
                return;
            }
            const files = Array.from(dt.files);
            diagram_ts.msg(`${files}`);
            if (files.length == 1) {
                const file = files[0];
                diagram_ts.msg(`File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`);
                const reader = new FileReader();
                reader.onload = async () => {
                    const json = reader.result;
                    const obj = JSON.parse(json);
                    diagram_ts.assert(Array.isArray(obj));
                    // msg(`dropped:[${JSON.stringify(data, null, 2)}]`);
                    loadJson(obj);
                    const repaint_count = diagram_ts.repaintCount;
                    diagram_ts.Canvas.one.requestUpdateCanvas();
                    // port positions are set on paing.
                    // edges can be drawn after port position settings.
                    while (repaint_count == diagram_ts.repaintCount) {
                        await diagram_ts.sleep(100);
                    }
                    // draw input elements in blocks.
                    diagram_ts.Main.one.editor.blocks.forEach(x => x.setPosition(x.position));
                    diagram_ts.Canvas.one.requestUpdateCanvas();
                };
                reader.readAsText(file);
            }
        });
    }
    diagram_ts.setDragDrop = setDragDrop;
    function saveJson() {
        let port_idx = 0;
        const blocks = diagram_ts.Main.one.editor.blocks;
        for (const [idx, block] of blocks.entries()) {
            block.idx = idx;
            for (const port of block.ports) {
                port.idx = port_idx++;
            }
        }
        const json = blocks.map(x => x.makeObj());
        downloadJson(json);
    }
    diagram_ts.saveJson = saveJson;
    function loadJson(objs) {
        const block_map = new Map();
        const port_map = new Map();
        for (const obj of objs) {
            diagram_ts.msg(`block:[${obj.typeName}]`);
            const block = diagram_ts.makeBlockByTypeName(obj.typeName);
            block.loadObj(obj);
            block.idx = obj.idx;
            block.position.x = obj.x;
            block.position.y = obj.y;
            block.setMinSize();
            block.boxSize = block.minSize.copy();
            block_map.set(block.idx, block);
            for (const [port_idx, port_obj] of obj.ports.entries()) {
                const port = block.ports[port_idx];
                port.idx = port_obj.idx;
                port_map.set(port.idx, port);
            }
            diagram_ts.Main.one.editor.addBlock(block);
        }
        for (const obj of objs) {
            const block = block_map.get(obj.idx);
            diagram_ts.assert(block != undefined);
            for (const [port_idx, port_obj] of obj.ports.entries()) {
                const port = block.ports[port_idx];
                for (const dst_port_idx of port_obj.destinations) {
                    const dst_port = port_map.get(dst_port_idx);
                    diagram_ts.assert(dst_port != undefined);
                    port.connect(dst_port);
                }
            }
        }
        const canvas = diagram_ts.Main.one.canvas;
        diagram_ts.setContext2D(canvas.ctx, canvas.root);
    }
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    class NestBlock extends diagram_ts.Block {
        innerBlock() {
            let port;
            if (this instanceof IfBlock) {
                port = this.truePort;
            }
            else if (this instanceof InfiniteLoop) {
                port = this.loopPort;
            }
            else {
                throw new diagram_ts.MyError();
            }
            diagram_ts.assert(port.type == diagram_ts.PortType.bottom);
            if (port.destinations.length == 0) {
                return undefined;
            }
            else {
                return port.destinations[0].parent;
            }
        }
        innerBlocksHeight() {
            let height = 0;
            for (let block = this.innerBlock(); block != undefined; block = block.nextBlock()) {
                if (height != 0) {
                    height -= diagram_ts.notchRadius;
                }
                height += block.calcHeight();
            }
            if (height != 0) {
                diagram_ts.msg(`inner blocks id:${this.idx} h:${height}`);
            }
            return height;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(150, diagram_ts.nest_h123);
            for (let block = this.innerBlock(); block != undefined; block = block.nextBlock()) {
                block.setMinSize();
            }
            this.minSize.y += this.innerBlocksHeight();
        }
        calcHeight() {
            return diagram_ts.nest_h123 + this.innerBlocksHeight();
        }
    }
    diagram_ts.NestBlock = NestBlock;
    class IfBlock extends NestBlock {
        topPort = new diagram_ts.Port(this, diagram_ts.PortType.top);
        bottomPort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        truePort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        conditionPort = new diagram_ts.Port(this, diagram_ts.PortType.inputPort);
        constructor(data) {
            super(data);
            this.ports = [
                this.topPort,
                this.bottomPort,
                this.truePort,
                this.conditionPort
            ];
        }
        isTrue() {
            return this.conditionPort.value == 1;
        }
        trueBlock() {
            return this.innerBlock();
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x2 + 35;
            const x4 = x1 + this.minSize.x;
            const y2 = y1 + diagram_ts.nest_h1;
            const y3 = y2 + diagram_ts.nest_h2 + this.innerBlocksHeight();
            const y4 = y3 + diagram_ts.nest_h3 - diagram_ts.notchRadius;
            this.drawOutline([
                // left top
                [x1, y1, null],
                // left bottom
                [x1, y4, null],
                // bottom notch
                [x2, y4, this.bottomPort],
                // right bottom
                [x4, y4, null],
                [x4, y3, null],
                [x2, y3, null],
                [x2, y2, null],
                // loop notch
                [x3, y2, this.truePort],
                [x4, y2, null],
                // right top
                [x4, y1, null],
                // top notch
                [x2, y1, this.topPort]
            ]);
            this.conditionPort.drawPort(this.ctx, x4 - diagram_ts.Port.radius, 0.5 * (y1 + y2));
        }
        async run() {
            const true_block = this.trueBlock();
            if (true_block != undefined && this.isTrue()) {
                await diagram_ts.runBlockChain(true_block);
            }
        }
    }
    diagram_ts.IfBlock = IfBlock;
    class InfiniteLoop extends NestBlock {
        topPort = new diagram_ts.Port(this, diagram_ts.PortType.top);
        loopPort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        constructor(data) {
            super(data);
            this.ports = [
                this.topPort,
                this.loopPort
            ];
        }
        loopBlock() {
            return this.innerBlock();
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x2 + 35;
            const x4 = x1 + this.minSize.x;
            const y2 = y1 + diagram_ts.nest_h1;
            const y3 = y2 + diagram_ts.nest_h2 + this.innerBlocksHeight();
            const y4 = y3 + diagram_ts.nest_h3;
            this.drawOutline([
                [x1, y1, null],
                [x1, y4, null],
                [x4, y4, null],
                [x4, y3, null],
                [x2, y3, null],
                [x2, y2, null],
                [x3, y2, this.loopPort],
                [x4, y2, null],
                [x4, y1, null],
                [x2, y1, this.topPort]
            ]);
        }
        async run() {
            const loop_block = this.loopBlock();
            if (loop_block != undefined) {
                while (true) {
                    await diagram_ts.runBlockChain(loop_block);
                    if (diagram_ts.stopFlag) {
                        break;
                    }
                    await diagram_ts.sleep(100);
                }
            }
        }
    }
    diagram_ts.InfiniteLoop = InfiniteLoop;
})(diagram_ts || (diagram_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL2V4cG9ydC50cyIsIi4uLy4uLy4uL3RzL3VpLnRzIiwiLi4vLi4vLi4vdHMvYmxvY2sudHMiLCIuLi8uLi8uLi90cy9jYW52YXMudHMiLCIuLi8uLi8uLi90cy9kaWFncmFtLnRzIiwiLi4vLi4vLi4vdHMvZGlhZ3JhbV91dGlsLnRzIiwiLi4vLi4vLi4vdHMvanNvbi11dGlsLnRzIiwiLi4vLi4vLi4vdHMvcHJvY2VkdXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFVLFVBQVUsQ0F5RG5CO0FBekRELFdBQVUsVUFBVTtJQUNwQixFQUFFO0lBQ1csa0JBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzFCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixjQUFHLEdBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUN0QixnQkFBSyxHQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDeEIsaUJBQU0sR0FBSSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3pCLHNCQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUNsQyxtQkFBUSxHQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDL0IsZ0JBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3RCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixZQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVkLGVBQUksR0FBTSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixpQkFBTSxHQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDekIsb0JBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBRTlCLGNBQUcsR0FBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ25CLGVBQUksR0FBSSxP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QUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELFdBQVcsQ0FBQyxRQUFlO1lBQ3ZCLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUVsRCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBQSxjQUFjLEdBQUcsQ0FBQyxHQUFHLFdBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2RSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRXJDLElBQUksQ0FBQyxRQUFRLENBQUMs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S0FDSjtJQTlEWSx1QkFBWSxlQThEeEIsQ0FBQTtBQUVELENBQUMsRUF6TVMsVUFBVSxLQUFWLFVBQVUsUUF5TW5CIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgY29uc3QgTXlFcnJvciA9IGkxOG5fdHMuTXlFcnJvcjtcclxuZXhwb3J0IGNvbnN0IGFzc2VydCAgPSBpMThuX3RzLmFzc2VydDtcclxuZXhwb3J0IGNvbnN0IG1zZyAgICAgPSBpMThuX3RzLm1zZztcclxuZXhwb3J0IGNvbnN0IHJhbmdlICAgPSBpMThuX3RzLnJhbmdlO1xyXG5leHBvcnQgY29uc3QgcmFuZ2UyICA9IGkxOG5fdHMucmFuZ2UyO1xyXG5leHBvcnQgY29uc3Qgc2V0UGxheU1vZGUgPSBpMThuX3RzLnNldFBsYXlNb2RlO1xyXG5leHBvcnQgY29uc3QgUGxheU1vZGUgICAgPSBpMThuX3RzLlBsYXlNb2RlO1xyXG5leHBvcnQgY29uc3Qgc2xlZXAgPSBpMThuX3RzLnNsZWVwO1xyXG5leHBvcnQgY29uc3QgYXBwZW5kICA9IGkxOG5fdHMuYXBwZW5kO1xyXG5leHBvcnQgY29uc3QgJCA9IGkxOG5fdHMuJDtcclxuXHJcbmV4cG9ydCBjb25zdCBsYXN0ICAgID0gaTE4bl90cy5sYXN0O1xyXG5leHBvcnQgY29uc3QgdW5pcXVlICA9IGkxOG5fdHMudW5pcXVlO1xyXG5leHBvcnQgY29uc3QgcmVtb3ZlICA9IGkxOG5fdHMucmVtb3ZlO1xyXG5leHBvcnQgY29uc3QgYXJyYXlGaWxsID0gaTE4bl90cy5hcnJheUZpbGw7XHJcblxyXG5leHBvcnQgY29uc3Qgc3VtICA9IGkxOG5fdHMuc3VtO1xyXG5leHBvcnQgY29uc3QgbGlzdCAgPSBpMThuX3RzLmxpc3Q7XHJcbmV4cG9ydCBjb25zdCBpbnRlcnNlY3Rpb24gID0gaTE4bl90cy5pbnRlcnNlY3Rpb247XHJcbmV4cG9ydCBjb25zdCBwZXJtdXRhdGlvbiAgPSBpMThuX3RzLnBlcm11dGF0aW9uO1xyXG5leHBvcnQgY29uc3QgY2lyY3VsYXJQZXJtdXRhdGlvbiAgPSBpMThuX3RzLmNpcmN1bGFyUGVybXV0YXRpb247XHJcbmV4cG9ydCBjb25zdCBhcmVTZXRzRXF1YWwgID0gaTE4bl90cy5hcmVTZXRzRXF1YWw7XHJcbmV4cG9ydCBjb25zdCBpc1N1YlNldCAgPSBpMThuX3RzLmlzU3ViU2V0O1xyXG5leHBvcnQgY29uc3QgY2hlY2sgPSBpMThuX3RzLmNoZWNrO1xyXG5leHBvcnQgdHlwZSAgU3BlZWNoID0gaTE4bl90cy5TcGVlY2g7XHJcblxyXG5leHBvcnQgdHlwZSBBYnN0cmFjdFNwZWVjaCA9IGkxOG5fdHMuQWJzdHJhY3RTcGVlY2g7XHJcbmV4cG9ydCBjb25zdCBTcGVlY2ggPSBpMThuX3RzLlNwZWVjaDtcclxuXHJcbmV4cG9ydCBjb25zdCBwYXJzZU1hdGggPSBwYXJzZXJfdHMucGFyc2VNYXRoO1xyXG5leHBvcnQgY29uc3QgcmVuZGVyS2F0ZXhTdWIgPSBwYXJzZXJfdHMucmVuZGVyS2F0ZXhTdWI7XHJcbmV4cG9ydCBjb25zdCBzaG93RmxvdyA9IHBhcnNlcl90cy5zaG93RmxvdztcclxuZXhwb3J0IGNvbnN0IG1ha2VJZFRvVGVybU1hcCA9IHBhcnNlcl90cy5tYWtlSWRUb1Rlcm1NYXA7XHJcblxyXG5leHBvcnQgdHlwZSAgUmF0aW9uYWwgPSBwYXJzZXJfdHMuUmF0aW9uYWw7XHJcbmV4cG9ydCBjb25zdCBSYXRpb25hbCA9IHBhcnNlcl90cy5SYXRpb25hbDtcclxuXHJcbmV4cG9ydCB0eXBlICBUZXJtID0gcGFyc2VyX3RzLlRlcm07XHJcbmV4cG9ydCBjb25zdCBUZXJtID0gcGFyc2VyX3RzLlRlcm07XHJcblxyXG5leHBvcnQgdHlwZSAgQ29uc3ROdW0gPSBwYXJzZXJfdHMuQ29uc3ROdW07XHJcbmV4cG9ydCBjb25zdCBDb25zdE51bSA9IHBhcnNlcl90cy5Db25zdE51bTtcclxuXHJcbmV4cG9ydCB0eXBlICBBcHAgPSBwYXJzZXJfdHMuQXBwO1xyXG5leHBvcnQgY29uc3QgQXBwID0gcGFyc2VyX3RzLkFwcDtcclxuXHJcbmV4cG9ydCB0eXBlICBSZWZWYXIgPSBwYXJzZXJfdHMuUmVmVmFyO1xyXG5leHBvcnQgY29uc3QgUmVmVmFyID0gcGFyc2VyX3RzLlJlZlZhcjtcclxuXHJcbmV4cG9ydCBjb25zdCBvcGVyYXRvciA9IHBhcnNlcl90cy5vcGVyYXRvcjtcclxuXHJcbmV4cG9ydCB0eXBlICBWZWMyID0gcGxhbmVfdHMuVmVjMjtcclxuZXhwb3J0IGNvbnN0IFZlYzIgPSBwbGFuZV90cy5WZWMyO1xyXG5cclxuXHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmNvbnN0IEFVVE8gPSBcImF1dG9cIjtcclxuY29uc3QgVGV4dFNpemVGaWxsID0gODtcclxuZXhwb3J0IGNvbnN0IHRleHRDb2xvciA9IFwiYmxhY2tcIjtcclxuXHJcbmZ1bmN0aW9uIHJhdGlvKHdpZHRoIDogc3RyaW5nKSA6IG51bWJlciB7XHJcbiAgICB3aWR0aCA9IHdpZHRoLnRyaW0oKTtcclxuICAgIGFzc2VydCh3aWR0aC5lbmRzV2l0aChcIiVcIikpO1xyXG4gICAgY29uc3QgbnVtX3N0ciA9IHdpZHRoLnN1YnN0cmluZygwLCB3aWR0aC5sZW5ndGggLSAxKTtcclxuXHJcbiAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KG51bV9zdHIpO1xyXG5cclxuICAgIHJldHVybiBudW0gLyAxMDA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBpeGVsKGxlbmd0aCA6IHN0cmluZywgIHJlbWFpbmluZ19sZW5ndGg/IDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICBpZihsZW5ndGggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBpZihsZW5ndGguZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IG51bV9zdHIgPSBsZW5ndGguc3Vic3RyaW5nKDAsIGxlbmd0aC5sZW5ndGggLSAyKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG51bV9zdHIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGxlbmd0aC5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICBpZihyZW1haW5pbmdfbGVuZ3RoICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmF0aW8obGVuZ3RoKSAqIHJlbWFpbmluZ19sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0MkQoY3R4IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB1aSA6IFVJKXtcclxuICAgIHVpLmN0eCA9IGN0eDtcclxuICAgIHVpLmNoaWxkcmVuKCkuZm9yRWFjaChjaGlsZCA9PiBzZXRDb250ZXh0MkQoY3R4LCBjaGlsZCkpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEF0dHIge1xyXG4gICAgY2xhc3NOYW1lPyA6IHN0cmluZztcclxuICAgIG9iaj8gOiBhbnk7XHJcbiAgICBuYW1lPyA6IHN0cmluZztcclxuICAgIHBvc2l0aW9uPyA6IHN0cmluZztcclxuICAgIG1hcmdpbj8gOiBudW1iZXJbXTtcclxuICAgIGNvbG9yPyA6IHN0cmluZztcclxuICAgIGJhY2tncm91bmRDb2xvcj8gOiBzdHJpbmc7XHJcbiAgICBib3JkZXJTdHlsZT8gOiBzdHJpbmc7XHJcbiAgICBib3JkZXJXaWR0aD8gOiBudW1iZXI7XHJcbiAgICBwYWRkaW5nPyA6IG51bWJlcltdO1xyXG4gICAgcGFkZGluZ0xlZnQ/IDogc3RyaW5nO1xyXG4gICAgdmVydGljYWxBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBob3Jpem9udGFsQWxpZ24/IDogc3RyaW5nO1xyXG4gICAgY29sc3Bhbj8gOiBudW1iZXI7XHJcbiAgICB3aWR0aD8gOiBzdHJpbmc7XHJcbiAgICBoZWlnaHQ/IDogc3RyaW5nO1xyXG4gICAgZGlzYWJsZWQ/IDogYm9vbGVhbjtcclxuICAgIHZpc2liaWxpdHk/IDogc3RyaW5nO1xyXG4gICAgaW5Ub29sYm94PyAgIDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUZXh0QXR0ciBleHRlbmRzIEF0dHIge1xyXG4gICAgdGV4dD8gOiBzdHJpbmc7XHJcbiAgICBmb250U2l6ZT8gOiBzdHJpbmc7XHJcbiAgICB0ZXh0QWxpZ24/IDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1dHRvbkF0dHIgZXh0ZW5kcyBUZXh0QXR0ciB7XHJcbiAgICBjbGljayA6ICgpPT5Qcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEdyaWRBdHRyIGV4dGVuZHMgQXR0ciB7XHJcbiAgICBjb2x1bW5zPzogc3RyaW5nO1xyXG4gICAgcm93cz8gICA6IHN0cmluZztcclxuICAgIGNlbGxzIDogVUlbXVtdO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFVJIHtcclxuICAgIHN0YXRpYyBjb3VudCA6IG51bWJlciA9IDA7XHJcblxyXG4gICAgaWR4IDogbnVtYmVyO1xyXG4gICAgY3R4ISA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgIHBvc2l0aW9uIDogVmVjMiA9IFZlYzIuemVybygpO1xyXG4gICAgYm94U2l6ZSAgOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcbiAgICB3aWR0aD8gOiBzdHJpbmc7XHJcbiAgICBoZWlnaHQ/IDogc3RyaW5nO1xyXG4gICAgbWluU2l6ZSA6IFZlYzIgfCB1bmRlZmluZWQ7XHJcbiAgICBjb2xzcGFuIDogbnVtYmVyID0gMTtcclxuICAgIHJvd3NwYW4gOiBudW1iZXIgPSAxO1xyXG4gICAgbWFyZ2luIDogbnVtYmVyW10gPSBbIDQsIDQsIDQsIDQgXTsgICAgIC8vIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbVxyXG4gICAgYm9yZGVyV2lkdGggOiBudW1iZXIgPSAzO1xyXG4gICAgcGFkZGluZyA6IG51bWJlcltdID0gWyAwLCAwLCAwLCAwIF07ICAgIC8vIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbVxyXG5cclxuICAgIGhvcml6b250YWxBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I/IDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICB0aGlzLmlkeCA9ICsrVUkuY291bnQ7XHJcbiAgICAgICAgaWYoZGF0YS5jb2xzcGFuICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY29sc3BhbiA9IGRhdGEuY29sc3BhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBkYXRhLmJhY2tncm91bmRDb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBjaGlsZHJlbigpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBnZXRBbGxVSVN1Yih1aXMgOiBVSVtdKXtcclxuICAgICAgICB1aXMucHVzaCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuKCkuZm9yRWFjaCh4ID0+IHguZ2V0QWxsVUlTdWIodWlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWxsVUkoKSA6IFVJW10ge1xyXG4gICAgICAgIGxldCB1aXMgOiBVSVtdID0gW107XHJcbiAgICAgICAgdGhpcy5nZXRBbGxVSVN1Yih1aXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdWlzO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbldpZHRoKCkgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcmdpblswXSArIHRoaXMubWFyZ2luWzFdO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbkhlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXJnaW5bMl0gKyB0aGlzLm1hcmdpblszXTtcclxuICAgIH1cclxuXHJcbiAgICBtYXJnaW5Cb3JkZXJQYWRkaW5nV2lkdGgoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFyZ2luWzBdICsgdGhpcy5tYXJnaW5bMV0gKyAyICogdGhpcy5ib3JkZXJXaWR0aCArIHRoaXMucGFkZGluZ1swXSArIHRoaXMucGFkZGluZ1sxXTtcclxuICAgIH1cclxuXHJcbiAgICBtYXJnaW5Cb3JkZXJQYWRkaW5nSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcmdpblsyXSArIHRoaXMubWFyZ2luWzNdICsgMiAqIHRoaXMuYm9yZGVyV2lkdGggKyB0aGlzLnBhZGRpbmdbMl0gKyB0aGlzLnBhZGRpbmdbM107XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gVmVjMi56ZXJvKCk7XHJcbiAgICAgICAgbXNnKGBzZXQtbWluLXNpemU6JHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluV2lkdGgoKSA6IG51bWJlciB7ICAgICAgIFxyXG4gICAgICAgIGFzc2VydCh0aGlzLm1pblNpemUgIT0gdW5kZWZpbmVkKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5TaXplIS54O1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1pbkhlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICBhc3NlcnQodGhpcy5taW5TaXplICE9IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWluU2l6ZSEueTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGxheW91dCh4IDogbnVtYmVyLCB5IDogbnVtYmVyLCBzaXplIDogVmVjMiwgbmVzdCA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5ib3hTaXplID0gc2l6ZTtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKG5ldyBWZWMyKHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Qm94KCkgOiBbVmVjMiwgVmVjMl0ge1xyXG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLm1hcmdpblswXTtcclxuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5tYXJnaW5bMl07XHJcbiAgICAgICAgY29uc3QgdyA9IHRoaXMuYm94U2l6ZS54IC0gdGhpcy5tYXJnaW5XaWR0aCgpO1xyXG4gICAgICAgIGNvbnN0IGggPSB0aGlzLmJveFNpemUueSAtIHRoaXMubWFyZ2luSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiBbIG5ldyBWZWMyKHgsIHkpLCBuZXcgVmVjMih3LCBoKSBdO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIHRoaXMuZHJhd1JpZGdlUmVjdDIodGhpcy5jdHgsIHBvcy54LCBwb3MueSwgc2l6ZS54LCBzaXplLnksIHRoaXMuYm9yZGVyV2lkdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0cigpIDogc3RyaW5nIHtcclxuICAgICAgICBpZih0aGlzLm1pblNpemUgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHdpZHRoICA9ICh0aGlzLndpZHRoICAhPSB1bmRlZmluZWQgPyBgd2lkdGg6JHt0aGlzLndpZHRofSBgICA6IFwiXCIpO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9ICh0aGlzLmhlaWdodCAhPSB1bmRlZmluZWQgPyBgaGVpZ2h0OiR7dGhpcy5oZWlnaHR9IGAgOiBcIlwiKTtcclxuICAgICAgICBjb25zdCBtaW5TaXplID0gKHRoaXMubWluU2l6ZSE9IHVuZGVmaW5lZCA/IGBtaW4tc2l6ZToke3RoaXMubWluU2l6ZS54LnRvRml4ZWQoKX0sICR7dGhpcy5taW5TaXplLnkudG9GaXhlZCgpfSBgIDogXCJcIik7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBgcG9zOigke3RoaXMucG9zaXRpb24ueH0sJHt0aGlzLnBvc2l0aW9uLnl9KSBgO1xyXG4gICAgICAgIGNvbnN0IGJveFNpemUgPSBgYm94Oigke3RoaXMuYm94U2l6ZS54fSwke3RoaXMuYm94U2l6ZS55fSkgYDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gJHt3aWR0aH0ke2hlaWdodH0ke21pblNpemV9JHtwb3NpdGlvbn0ke2JveFNpemV9YDtcclxuICAgIH1cclxuXHJcbiAgICBkdW1wKG5lc3QgOiBudW1iZXIpe1xyXG4gICAgICAgIG1zZyhgJHtcIiBcIi5yZXBlYXQobmVzdCAqIDQpfSR7dGhpcy5zdHIoKX1gKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZHJhd1JpZGdlUmVjdDIoY3R4IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB4IDogbnVtYmVyLCB5IDogbnVtYmVyLCB3aWR0aCA6IG51bWJlciwgaGVpZ2h0IDogbnVtYmVyLCByaWRnZVdpZHRoIDogbnVtYmVyLCBpc0luc2V0ID0gZmFsc2UpIHtcclxuICAgICAgICAvLyBEZWZpbmUgbGlnaHQgYW5kIGRhcmsgY29sb3JzXHJcbiAgICAgICAgLy8gY29uc3QgbGlnaHRDb2xvciA9IGlzSW5zZXQgPyAnIzg4OCcgOiAnI2VlZSc7IC8vIERhcmtlciBmb3IgaW5zZXQgdG9wL2xlZnRcclxuICAgICAgICAvLyBjb25zdCBkYXJrQ29sb3IgPSBpc0luc2V0ID8gJyNlZWUnIDogJyM4ODgnOyAgLy8gTGlnaHRlciBmb3IgaW5zZXQgYm90dG9tL3JpZ2h0XHJcblxyXG4gICAgICAgIGNvbnN0IGxpZ2h0Q29sb3IgPSBcIiNmZmZmZmZcIjtcclxuICAgICAgICBjb25zdCBkYXJrQ29sb3IgPSBcIiM4ODg4ODhcIjtcclxuICAgICAgICBjb25zdCBiYWNrZ3JvdW5kQ29sb3IgPSAodGhpcy5iYWNrZ3JvdW5kQ29sb3IgIT0gdW5kZWZpbmVkID8gdGhpcy5iYWNrZ3JvdW5kQ29sb3IgOiBcIiNjY2NjY2NcIik7XHJcblxyXG4gICAgICAgIC8vIE9wdGlvbmFsbHksIGRyYXcgdGhlIGlubmVyIHJlY3RhbmdsZSAoZmlsbCBvciBhbm90aGVyIHN0cm9rZSlcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gYmFja2dyb3VuZENvbG9yOyAvLyBFeGFtcGxlIGlubmVyIGNvbG9yXHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KHggKyByaWRnZVdpZHRoLCB5ICsgcmlkZ2VXaWR0aCwgd2lkdGggLSAyICogcmlkZ2VXaWR0aCwgaGVpZ2h0IC0gMiAqIHJpZGdlV2lkdGgpO1xyXG5cclxuICAgICAgICAvLyBEcmF3IHRoZSBcImxpZ2h0XCIgc2lkZXMgKHRvcCBhbmQgbGVmdClcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBsaWdodENvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSByaWRnZVdpZHRoO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHgubW92ZVRvKHggKyByaWRnZVdpZHRoIC8gMiwgeSArIGhlaWdodCAtIHJpZGdlV2lkdGggLyAyKTsgLy8gQm90dG9tLWxlZnQgY29ybmVyXHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgcmlkZ2VXaWR0aCAvIDIsIHkgKyByaWRnZVdpZHRoIC8gMik7ICAgICAvLyBUb3AtbGVmdCBjb3JuZXJcclxuICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJpZGdlV2lkdGggLyAyLCB5ICsgcmlkZ2VXaWR0aCAvIDIpOyAvLyBUb3AtcmlnaHQgY29ybmVyXHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAvLyBEcmF3IHRoZSBcImRhcmtcIiBzaWRlcyAoYm90dG9tIGFuZCByaWdodClcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBkYXJrQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHJpZGdlV2lkdGg7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oeCArIHdpZHRoIC0gcmlkZ2VXaWR0aCAvIDIsIHkgKyByaWRnZVdpZHRoIC8gMik7ICAgICAvLyBUb3AtcmlnaHQgY29ybmVyXHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgd2lkdGggLSByaWRnZVdpZHRoIC8gMiwgeSArIGhlaWdodCAtIHJpZGdlV2lkdGggLyAyKTsgLy8gQm90dG9tLXJpZ2h0IGNvcm5lclxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHJpZGdlV2lkdGggLyAyLCB5ICsgaGVpZ2h0IC0gcmlkZ2VXaWR0aCAvIDIpOyAvLyBCb3R0b20tbGVmdCBjb3JuZXJcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd1JpZGdlUmVjdChjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHdpZHRoIDogbnVtYmVyLCBoZWlnaHQgOiBudW1iZXIsIGJvcmRlcldpZHRoIDogbnVtYmVyLCBpc0luc2V0ID0gZmFsc2Upe1xyXG4gICAgICAgIC8vIENvbG9ycyBmb3IgcmlkZ2UgZWZmZWN0XHJcbiAgICAgICAgY29uc3QgbGlnaHRDb2xvciA9IFwiI2ZmZmZmZlwiO1xyXG4gICAgICAgIGNvbnN0IGRhcmtDb2xvciA9IFwiIzg4ODg4OFwiO1xyXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmRDb2xvciA9IFwiI2NjY2NjY1wiO1xyXG5cclxuICAgICAgICAvLyBGaWxsIHJlY3RhbmdsZSBiYWNrZ3JvdW5kXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vIFRvcCAmIGxlZnQgKGhpZ2hsaWdodClcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBsaWdodENvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBib3JkZXJXaWR0aDtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4ICsgd2lkdGgsIHkpOyAgICAgICAvLyBUb3AtcmlnaHRcclxuICAgICAgICBjdHgubGluZVRvKHgsIHkpOyAgICAgICAgICAgICAgIC8vIFRvcC1sZWZ0XHJcbiAgICAgICAgY3R4LmxpbmVUbyh4LCB5ICsgaGVpZ2h0KTsgICAgICAvLyBCb3R0b20tbGVmdFxyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgLy8gQm90dG9tICYgcmlnaHQgKHNoYWRvdylcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBkYXJrQ29sb3I7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oeCwgeSArIGhlaWdodCk7ICAgICAgLy8gQm90dG9tLWxlZnRcclxuICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCk7IC8vIEJvdHRvbS1yaWdodFxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5KTsgICAgICAgLy8gVG9wLXJpZ2h0XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpOyAgICBcclxuICAgIH1cclxuXHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsbGVyIGV4dGVuZHMgVUkge1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dFVJIGV4dGVuZHMgVUkge1xyXG4gICAgZm9udFNpemU/IDogc3RyaW5nO1xyXG4gICAgdGV4dEFsaWduPyA6IHN0cmluZztcclxuICAgIHRleHQgOiBzdHJpbmc7XHJcbiAgICBtZXRyaWNzITogVGV4dE1ldHJpY3M7XHJcbiAgICBhY3R1YWxIZWlnaHQhOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IFRleHRBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmZvbnRTaXplICA9IGRhdGEuZm9udFNpemU7XHJcbiAgICAgICAgdGhpcy50ZXh0QWxpZ24gPSBkYXRhLnRleHRBbGlnbjtcclxuICAgICAgICB0aGlzLnRleHQgPSAoZGF0YS50ZXh0ICE9IHVuZGVmaW5lZCA/IGRhdGEudGV4dCA6IFwiXCIpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1ldHJpY3MgPSB0aGlzLmN0eC5tZWFzdXJlVGV4dCh0aGlzLnRleHQpO1xyXG4gICAgICBcclxuICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMubWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCArIHRoaXMubWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveERlc2NlbnQ7XHJcbiAgICAgIFxyXG4gICAgICAgIG1zZyhgaWR4Olske3RoaXMuaWR4fV0gIGZvbnQgOlske3RoaXMuZm9udFNpemV9XSAgdzpbJHt0aGlzLm1ldHJpY3Mud2lkdGh9XSBoOlske3RoaXMuYWN0dWFsSGVpZ2h0fV0gWyR7dGhpcy50ZXh0fV1gKTtcclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gdGhpcy5tZXRyaWNzLndpZHRoICsgdGhpcy5tYXJnaW5Cb3JkZXJQYWRkaW5nV2lkdGgoKSArIFRleHRTaXplRmlsbDtcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmFjdHVhbEhlaWdodCAgKyB0aGlzLm1hcmdpbkJvcmRlclBhZGRpbmdIZWlnaHQoKSArIFRleHRTaXplRmlsbDtcclxuXHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIod2lkdGgsIGhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zaXRpb24ueCArIHRoaXMubWFyZ2luWzBdICsgdGhpcy5ib3JkZXJXaWR0aCArIHRoaXMucGFkZGluZ1swXTtcclxuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5tYXJnaW5bMl0gKyB0aGlzLmJvcmRlcldpZHRoICsgdGhpcy5wYWRkaW5nWzJdXHJcbiAgICAgICAgICAgICAgICAgICsgdGhpcy5hY3R1YWxIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGV4dENvbG9yO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVRleHQodGhpcy50ZXh0LCB4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBzdHIoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGAke3N1cGVyLnN0cigpfSB0ZXh0OiR7dGhpcy50ZXh0fWA7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGFiZWwgZXh0ZW5kcyBUZXh0VUkge1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgVGV4dFVJIHtcclxuICAgIGNsaWNrIDogKCk9PlByb21pc2U8dm9pZD47XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEJ1dHRvbkF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpY2sgPSBkYXRhLmNsaWNrO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTm9kZSBleHRlbmRzIFVJIHtcclxuICAgIGFic3RyYWN0IGRvbmUoKSA6IGJvb2xlYW47XHJcbiAgICBhYnN0cmFjdCBkcmF3Tm9kZShjYW52YXMgOiBDYW52YXMpIDogdm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3IgZXh0ZW5kcyBVSSB7XHJcbiAgICBibG9ja3MgOiBCbG9ja1tdID0gW107XHJcblxyXG4gICAgY2hpbGRyZW4oKSA6IFVJW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrcy5zbGljZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEJsb2NrKGJsb2NrIDogQmxvY2spe1xyXG4gICAgICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBzdXBlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIHRoaXMuYmxvY2tzLmZvckVhY2goeCA9PiB4LmRyYXcoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkIGV4dGVuZHMgVUkge1xyXG4gICAgY29sRGVzY3MgOiBzdHJpbmdbXTtcclxuICAgIHJvd0Rlc2NzICAgOiBzdHJpbmdbXTtcclxuICAgIGNlbGxzIDogVUlbXVtdO1xyXG5cclxuICAgIG1pbldpZHRocyA6IG51bWJlcltdID0gW107XHJcbiAgICBtaW5IZWlnaHRzOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbFdpZHRocyA6IG51bWJlcltdID0gW107XHJcbiAgICByb3dIZWlnaHRzOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIG51bVJvd3MgOiBudW1iZXI7XHJcbiAgICBudW1Db2xzIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBHcmlkQXR0cil7ICAgICAgICBcclxuICAgICAgICBzdXBlcihkYXRhIGFzIGFueSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2VsbHMgPSBkYXRhLmNlbGxzO1xyXG4gICAgICAgIHRoaXMubnVtUm93cyA9IHRoaXMuY2VsbHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubnVtQ29scyA9IE1hdGgubWF4KC4uLiB0aGlzLmNlbGxzLm1hcChyb3cgPT4gc3VtKHJvdy5tYXAodWkgPT4gdWkuY29sc3BhbikpKSk7XHJcblxyXG4gICAgICAgIGlmKGRhdGEuY29sdW1ucyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbERlc2NzID0gYXJyYXlGaWxsKHRoaXMubnVtQ29scywgXCJhdXRvXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jb2xEZXNjcyA9IGRhdGEuY29sdW1ucy5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihkYXRhLnJvd3MgPT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucm93RGVzY3MgPSBhcnJheUZpbGwodGhpcy5udW1Sb3dzLCBcImF1dG9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJvd0Rlc2NzID0gZGF0YS5yb3dzLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzc2VydCh0aGlzLmNvbERlc2NzLmxlbmd0aCA9PSB0aGlzLm51bUNvbHMpO1xyXG4gICAgICAgIGFzc2VydCh0aGlzLnJvd0Rlc2NzLmxlbmd0aCAgID09IHRoaXMubnVtUm93cyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hpbGRyZW4oKSA6IFVJW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNlbGxzLmZsYXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3coaWR4IDogbnVtYmVyKSA6IFVJW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNlbGxzW2lkeF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93SGVpZ2h0KGlkeCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCguLi4gdGhpcy5nZXRSb3coaWR4KS5tYXAodWkgPT4gdWkuZ2V0TWluSGVpZ2h0KCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW5XaXRoKGNvbF9pZHggOiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgICAgICBsZXQgbWF4X3dpZHRoID0gMDtcclxuICAgICAgICBmb3IoY29uc3Qgcm93IG9mIHRoaXMuY2VsbHMpe1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHVpIG9mIHJvdyl7XHJcbiAgICAgICAgICAgICAgICBpZihvZmZzZXQgPT0gY29sX2lkeCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodWkuY29sc3BhbiA9PSAxKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4X3dpZHRoID0gTWF0aC5tYXgobWF4X3dpZHRoLCB1aS5nZXRNaW5XaWR0aCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHVpLmNvbHNwYW47XHJcbiAgICAgICAgICAgICAgICBpZihjb2xfaWR4IDwgb2Zmc2V0KXtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1heF93aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjSGVpZ2h0cygpe1xyXG4gICAgICAgIGNvbnN0IGhlaWdodHMgPSBuZXcgQXJyYXkodGhpcy5yb3dEZXNjcyEubGVuZ3RoKS5maWxsKDApO1xyXG4gICAgICAgIGZvcihjb25zdCBbaWR4LCByb3ddIG9mIHRoaXMucm93RGVzY3MhLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGlmKHJvdy5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodHNbaWR4XSA9IHBpeGVsKHJvdyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihyb3cgPT0gQVVUTyl7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHRzW2lkeF0gPSB0aGlzLmdldFJvd0hlaWdodChpZHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGVpZ2h0cztcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplU3ViKGlzX3dpZHRoIDogYm9vbGVhbikgOiB2b2lkIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3NpemVfcHhfdWlfc3BhbnMgOiBbbnVtYmVyLCBudW1iZXIsIFVJLCBudW1iZXJdW10gPSBbXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluX3NpemVzID0gYXJyYXlGaWxsKGlzX3dpZHRoID8gdGhpcy5udW1Db2xzIDogdGhpcy5udW1Sb3dzLCAwKTtcclxuICAgICAgICBmb3IoY29uc3QgW3Jvd19pZHgsIHJvd10gb2YgdGhpcy5jZWxscy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHVpIG9mIHJvdyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2l6ZV9weCA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBbdWlfc2l6ZSwgdWlfbWluX3NpemUsIHVpX3NwYW5dID0gKGlzX3dpZHRoID8gW3VpLndpZHRoLCB1aS5taW5TaXplIS54LCB1aS5jb2xzcGFuXSA6IFt1aS5oZWlnaHQsIHVpLm1pblNpemUhLnksIHVpLnJvd3NwYW5dKTtcclxuICAgICAgICAgICAgICAgIGlmKHVpX3NpemUgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICBzaXplX3B4ID0gdWlfbWluX3NpemU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih1aV9zaXplLmVuZHNXaXRoKFwicHhcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplX3B4ID0gcGl4ZWwodWlfc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNpemVfcHggPCB1aV9taW5fc2l6ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYodWlfc2l6ZS5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplX3B4ID0gdWlfbWluX3NpemUgLyByYXRpbyh1aV9zaXplKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9zID0gKGlzX3dpZHRoID8gb2Zmc2V0IDogcm93X2lkeCk7XHJcbiAgICAgICAgICAgICAgICBpZih1aV9zcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG1pbl9zaXplc1twb3NdIDwgc2l6ZV9weCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbl9zaXplc1twb3NdID0gc2l6ZV9weDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldF9zaXplX3B4X3VpX3NwYW5zLnB1c2goW3Bvcywgc2l6ZV9weCwgdWksIHVpX3NwYW5dKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHVpLmNvbHNwYW47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBtYXhfcmVtYWluaW5nX3NpemUgPSAwO1xyXG5cclxuICAgICAgICBjb25zdCBkZXNjcyA9IChpc193aWR0aCA/IHRoaXMuY29sRGVzY3MgOiB0aGlzLnJvd0Rlc2NzKTtcclxuICAgICAgICBmb3IoY29uc3QgW29mZnNldCwgd2lkdGhfcHgsIHVpLCB1aV9zcGFuXSBvZiBvZmZzZXRfc2l6ZV9weF91aV9zcGFucyl7XHJcbiAgICAgICAgICAgIGxldCBmaXhlZF9weCA9IDA7XHJcbiAgICAgICAgICAgIGxldCByYXRpb19zdW0gPSAwO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgaWR4IG9mIHJhbmdlMihvZmZzZXQsIG9mZnNldCArIHVpX3NwYW4pKXtcclxuICAgICAgICAgICAgICAgIGlmKGRlc2NzW2lkeF0uZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICByYXRpb19zdW0gKz0gcmF0aW8oZGVzY3NbaWR4XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGZpeGVkX3B4ICs9IG1pbl9zaXplc1tpZHhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihyYXRpb19zdW0gPT0gMCl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZml4ZWRfcHggPCB1aS5taW5TaXplIS54KXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZihmaXhlZF9weCA8PSB1aS5taW5TaXplIS54KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByYXRpb19weCA9IHVpLm1pblNpemUhLnggLSBmaXhlZF9weDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdfd2lkdGggPSByYXRpb19weCAvIHJhdGlvX3N1bTtcclxuICAgICAgICAgICAgICAgICAgICBpZihtYXhfcmVtYWluaW5nX3NpemUgPCByZW1haW5pbmdfd2lkdGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhfcmVtYWluaW5nX3NpemUgPSByZW1haW5pbmdfd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIGNvbF0gb2YgZGVzY3MuZW50cmllcygpKXtcclxuICAgICAgICAgICAgaWYoY29sLmVuZHNXaXRoKFwicHhcIikpe1xyXG4gICAgICAgICAgICAgICAgbWluX3NpemVzW2lkeF0gPSBwaXhlbChjb2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoY29sLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICBtaW5fc2l6ZXNbaWR4XSA9IG1heF9yZW1haW5pbmdfc2l6ZSAqIHJhdGlvKGNvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNpemUgPSBzdW0obWluX3NpemVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGhpc19zaXplID0gKGlzX3dpZHRoID8gdGhpcy53aWR0aCA6IHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBsZXQgICB0aGlzX3NpemVfcHggOiBudW1iZXI7XHJcbiAgICAgICAgaWYodGhpc19zaXplID09IHVuZGVmaW5lZCB8fCB0aGlzX3NpemUgPT0gXCJhdXRvXCIpe1xyXG4gICAgICAgICAgICB0aGlzX3NpemVfcHggPSBzaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBpZih0aGlzX3NpemUuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzX3NpemVfcHggPSBwaXhlbCh0aGlzX3NpemUpO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpc19zaXplX3B4IDwgc2l6ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXNfc2l6ZS5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgdGhpc19zaXplX3B4ID0gc2l6ZSAvIHJhdGlvKHRoaXNfc2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGlzX3dpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5taW5XaWR0aHMgID0gbWluX3NpemVzO1xyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUhLnggPSB0aGlzX3NpemVfcHggKyB0aGlzLm1hcmdpbkJvcmRlclBhZGRpbmdXaWR0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1pbkhlaWdodHMgPSBtaW5fc2l6ZXM7XHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSEueSA9IHRoaXNfc2l6ZV9weCArIHRoaXMubWFyZ2luQm9yZGVyUGFkZGluZ0hlaWdodCgpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gVmVjMi56ZXJvKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4oKS5mb3JFYWNoKHggPT4geC5zZXRNaW5TaXplKCkpO1xyXG4gICAgICAgIHRoaXMuc2V0TWluU2l6ZVN1Yih0cnVlKTtcclxuICAgICAgICB0aGlzLnNldE1pblNpemVTdWIoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjYWxjU2l6ZXMoZGVzY3MgOiBzdHJpbmdbXSwgbWluX3NpemVzIDogbnVtYmVyW10sIHJlbWFpbmluZ19weCA6IG51bWJlcikgOiBudW1iZXIgW117XHJcbiAgICAgICAgY29uc3Qgc2l6ZXMgPSBBcnJheTxudW1iZXI+KGRlc2NzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBbaWR4LCBkZXNjXSBvZiBkZXNjcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihkZXNjLmVuZHNXaXRoKFwicHhcIikpe1xyXG4gICAgICAgICAgICAgICAgc2l6ZXNbaWR4XSA9IHBpeGVsKGRlc2MpO1xyXG4gICAgICAgICAgICAgICAgaWYoc2l6ZXNbaWR4XSA8IG1pbl9zaXplc1tpZHhdKXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoZGVzYy5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgc2l6ZXNbaWR4XSA9IHJhdGlvKGRlc2MpICogcmVtYWluaW5nX3B4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoZGVzYyA9PSBcImF1dG9cIil7XHJcbiAgICAgICAgICAgICAgICBzaXplc1tpZHhdID0gbWluX3NpemVzW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzaXplcztcclxuICAgIH1cclxuXHJcbiAgICBsYXlvdXQoeCA6IG51bWJlciwgeSA6IG51bWJlciwgc2l6ZSA6IFZlYzIsIG5lc3QgOiBudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyLmxheW91dCh4LCB5LCBzaXplLCBuZXN0KTtcclxuXHJcbiAgICAgICAgY29uc3QgZml4ZWRfd2lkdGhfcHggID0gc3VtKHJhbmdlKHRoaXMubnVtQ29scykuZmlsdGVyKGkgPT4gIXRoaXMuY29sRGVzY3NbaV0uZW5kc1dpdGgoXCIlXCIpKS5tYXAoaSA9PiB0aGlzLm1pbldpZHRoc1tpXSkpO1xyXG4gICAgICAgIGNvbnN0IGZpeGVkX2hlaWdodF9weCA9IHN1bShyYW5nZSh0aGlzLm51bVJvd3MpLmZpbHRlcihpID0+ICF0aGlzLnJvd0Rlc2NzW2ldLmVuZHNXaXRoKFwiJVwiKSkubWFwKGkgPT4gdGhpcy5taW5IZWlnaHRzW2ldKSk7XHJcblxyXG4gICAgICAgIGlmKHNpemUueCA8IGZpeGVkX3dpZHRoX3B4IHx8IHNpemUueSA8IGZpeGVkX2hlaWdodF9weCl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZW1haW5pbmdfd2lkdGhfcHggID0gc2l6ZS54IC0gZml4ZWRfd2lkdGhfcHg7XHJcbiAgICAgICAgY29uc3QgcmVtYWluaW5nX2hlaWdodF9weCA9IHNpemUueSAtIGZpeGVkX2hlaWdodF9weDtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xXaWR0aHMgID0gR3JpZC5jYWxjU2l6ZXModGhpcy5jb2xEZXNjcywgdGhpcy5taW5XaWR0aHMgLCByZW1haW5pbmdfd2lkdGhfcHgpO1xyXG4gICAgICAgIHRoaXMucm93SGVpZ2h0cyA9IEdyaWQuY2FsY1NpemVzKHRoaXMucm93RGVzY3MsIHRoaXMubWluSGVpZ2h0cywgcmVtYWluaW5nX2hlaWdodF9weCk7XHJcblxyXG4gICAgICAgIGxldCB5X29mZnNldCA9IDA7XHJcbiAgICAgICAgZm9yKGNvbnN0IFtyb3dfaWR4LCByb3ddIG9mIHRoaXMuY2VsbHMuZW50cmllcygpKXtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIGxldCB4X29mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCB1aSBvZiByb3cpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHVpX3dpZHRoX3B4ICA6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGxldCB1aV9oZWlnaHRfcHggOiBudW1iZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkuY29sc3BhbiA9PSAxKXtcclxuICAgICAgICAgICAgICAgICAgICB1aV93aWR0aF9weCA9IHRoaXMuY29sV2lkdGhzW29mZnNldF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHVpX3dpZHRoX3B4ID0gc3VtKHRoaXMuY29sV2lkdGhzLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgdWkuY29sc3BhbikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHVpLndpZHRoICE9IHVuZGVmaW5lZCAmJiB1aS53aWR0aC5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgIHVpX3dpZHRoX3B4ICo9IHJhdGlvKHVpLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih1aS5yb3dzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHVpX2hlaWdodF9weCA9IHRoaXMucm93SGVpZ2h0c1tyb3dfaWR4XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfaGVpZ2h0X3B4ID0gc3VtKHRoaXMucm93SGVpZ2h0cy5zbGljZShyb3dfaWR4LCByb3dfaWR4ICsgdWkucm93c3BhbikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHVpLmhlaWdodCAhPSB1bmRlZmluZWQgJiYgdWkuaGVpZ2h0LmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfaGVpZ2h0X3B4ICo9IHJhdGlvKHVpLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdWlfc2l6ZSA9IG5ldyBWZWMyKHVpX3dpZHRoX3B4LCB1aV9oZWlnaHRfcHgpO1xyXG4gICAgICAgICAgICAgICAgdWkubGF5b3V0KHggKyB4X29mZnNldCwgeSArIHlfb2Zmc2V0LCB1aV9zaXplLCBuZXN0ICsgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgeF9vZmZzZXQgKz0gc3VtKHRoaXMuY29sV2lkdGhzLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgdWkuY29sc3BhbikpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9mZnNldCArPSB1aS5jb2xzcGFuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB5X29mZnNldCArPSB0aGlzLnJvd0hlaWdodHNbcm93X2lkeF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gIFxyXG5cclxuXHJcbiAgICB1cGRhdGVSb290TGF5b3V0KCl7XHJcbiAgICAgICAgdGhpcy5nZXRBbGxVSSgpLmZvckVhY2goeCA9PiB4LnNldE1pblNpemUoKSk7XHJcbiAgICAgICAgbGV0IHNpemUgPSBWZWMyLnplcm8oKTtcclxuXHJcbiAgICAgICAgbGV0IHggOiBudW1iZXI7XHJcbiAgICAgICAgbGV0IHkgOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29sRGVzY3Muc29tZSh4ID0+IHguZW5kc1dpdGgoXCIlXCIpKSl7XHJcblxyXG4gICAgICAgICAgICBzaXplLnggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICBzaXplLnggPSB0aGlzLm1pblNpemUhLng7XHJcbiAgICAgICAgICAgIHggPSBNYXRoLm1heCgwLCAwLjUgKiAod2luZG93LmlubmVyV2lkdGggIC0gc2l6ZS54KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnJvd0Rlc2NzLnNvbWUoeCA9PiB4LmVuZHNXaXRoKFwiJVwiKSkpe1xyXG5cclxuICAgICAgICAgICAgc2l6ZS55ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB5ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHNpemUueSA9IHRoaXMubWluU2l6ZSEueTtcclxuICAgICAgICAgICAgeSA9IE1hdGgubWF4KDAsIDAuNSAqICh3aW5kb3cuaW5uZXJIZWlnaHQgLSBzaXplLnkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGF5b3V0KHgsIHksIHNpemUsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBzdXBlci5kcmF3KCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbigpLmZvckVhY2goeCA9PiB4LmRyYXcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RyKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGNvbF9kZXNjcyA9IHRoaXMuY29sRGVzY3Muam9pbihcIiBcIik7XHJcbiAgICAgICAgY29uc3Qgcm93X2Rlc2NzID0gdGhpcy5yb3dEZXNjcy5qb2luKFwiIFwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluX3dzID0gdGhpcy5taW5XaWR0aHMubWFwKHggPT4gYCR7eH1gKS5qb2luKFwiIFwiKTtcclxuICAgICAgICBjb25zdCBtaW5faHMgPSB0aGlzLm1pbkhlaWdodHMubWFwKHggPT4gYCR7eH1gKS5qb2luKFwiIFwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgY29sX3dzID0gdGhpcy5jb2xXaWR0aHMubWFwKHggPT4gYCR7eH1gKS5qb2luKFwiIFwiKTtcclxuICAgICAgICBjb25zdCByb3dfaHMgPSB0aGlzLnJvd0hlaWdodHMubWFwKHggPT4gYCR7eH1gKS5qb2luKFwiIFwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke3N1cGVyLnN0cigpfSBjb2w6JHtjb2xfZGVzY3N9IHJvdzoke3Jvd19kZXNjc30gbWluLXdzOiR7bWluX3dzfSBtaW4taHM6JHttaW5faHN9IGNvbC13czoke2NvbF93c30gcm93LWhzOiR7cm93X2hzfWA7XHJcbiAgICB9XHJcblxyXG4gICAgZHVtcChuZXN0IDogbnVtYmVyKXtcclxuICAgICAgICBzdXBlci5kdW1wKG5lc3QpO1xyXG4gICAgICAgIGZvcihjb25zdCByb3cgb2YgdGhpcy5jZWxscyl7XHJcbiAgICAgICAgICAgIHJvdy5mb3JFYWNoKHVpID0+IHVpLmR1bXAobmVzdCArIDEpKTtcclxuXHJcbiAgICAgICAgICAgIG1zZyhcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkbGFiZWwoZGF0YSA6IFRleHRBdHRyKSA6IExhYmVsIHtcclxuICAgIHJldHVybiBuZXcgTGFiZWwoZGF0YSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkYnV0dG9uKGRhdGEgOiBCdXR0b25BdHRyKSA6IEJ1dHRvbiB7XHJcbiAgICByZXR1cm4gbmV3IEJ1dHRvbihkYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRmaWxsZXIoZGF0YSA6IEF0dHIpIDogRmlsbGVyIHtcclxuICAgIHJldHVybiBuZXcgRmlsbGVyKGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGdyaWQoZGF0YSA6IEdyaWRBdHRyKSA6IEdyaWQgeyAgICBcclxuICAgIHJldHVybiBuZXcgR3JpZChkYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRobGlzdChkYXRhIDogQXR0ciAmIHsgcm93cz8gOiBzdHJpbmcsIGNvbHVtbj86IHN0cmluZywgY2hpbGRyZW4gOiBVSVtdIH0pe1xyXG4gICAgY29uc3QgZ3JpZF9kYXRhID0gZGF0YSBhcyBhbnkgYXMgR3JpZEF0dHI7XHJcblxyXG4gICAgZ3JpZF9kYXRhLmNvbHVtbnMgPSBkYXRhLmNvbHVtbjtcclxuICAgIGdyaWRfZGF0YS5jZWxscyAgID0gWyBkYXRhLmNoaWxkcmVuIF07XHJcblxyXG4gICAgZGVsZXRlIChkYXRhIGFzIGFueSkuY2hpbGRyZW47XHJcbiAgICBkZWxldGUgKGRhdGEgYXMgYW55KS5jb2x1bW47XHJcblxyXG4gICAgcmV0dXJuICRncmlkKGdyaWRfZGF0YSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkdmxpc3QoZGF0YSA6IEF0dHIgJiB7IHJvd3M/IDogc3RyaW5nLCBjb2x1bW4/OiBzdHJpbmcsIGNoaWxkcmVuIDogVUlbXSB9KXtcclxuICAgIGNvbnN0IGdyaWRfZGF0YSA9IGRhdGEgYXMgYW55IGFzIEdyaWRBdHRyO1xyXG5cclxuICAgIGdyaWRfZGF0YS5jb2x1bW5zID0gZGF0YS5jb2x1bW47XHJcbiAgICBncmlkX2RhdGEuY2VsbHMgICA9IGRhdGEuY2hpbGRyZW4ubWFwKHggPT4gW3hdKTtcclxuXHJcbiAgICBkZWxldGUgKGRhdGEgYXMgYW55KS5jaGlsZHJlbjtcclxuICAgIGRlbGV0ZSAoZGF0YSBhcyBhbnkpLmNvbHVtbjtcclxuXHJcbiAgICByZXR1cm4gJGdyaWQoZ3JpZF9kYXRhKTtcclxufVxyXG5cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cImV4cG9ydC50c1wiIC8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cInVpLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGNvbnN0IG5vdGNoUmFkaXVzID0gMTA7ICAgICAgICBcclxuXHJcbmV4cG9ydCBjb25zdCBuZXN0X2gxID0gMzU7XHJcbmV4cG9ydCBjb25zdCBuZXN0X2gyID0gMzA7XHJcbmV4cG9ydCBjb25zdCBuZXN0X2gzID0gMzU7XHJcbmV4cG9ydCBjb25zdCBuZXN0X2gxMjMgPSBuZXN0X2gxICsgbmVzdF9oMiArIG5lc3RfaDM7XHJcblxyXG5leHBvcnQgY29uc3QgYmxvY2tMaW5lV2lkdGggPSAyO1xyXG5jb25zdCBibG9ja0xpbmVDb2xvciA9IFwiYnJvd25cIjtcclxuY29uc3QgbmVhclBvcnREaXN0YW5jZSA9IDEwO1xyXG5cclxuY29uc3QgcmFuZ2VXaWR0aCAgPSAxNTA7XHJcbmNvbnN0IG51bWJlcldpZHRoID0gNDU7XHJcblxyXG5leHBvcnQgbGV0IGNhbWVyYUljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IG1vdG9ySWNvbiAgOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IGNhbWVyYUltZyA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgZGlzdGFuY2VTZW5zb3JJY29uIDogSFRNTEltYWdlRWxlbWVudDtcclxuZXhwb3J0IGxldCB0dHNJY29uIDogSFRNTEltYWdlRWxlbWVudDtcclxuZXhwb3J0IGxldCBzbGVlcEljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5cclxuZXhwb3J0IGVudW0gUG9ydFR5cGUge1xyXG4gICAgdW5rbm93bixcclxuICAgIGJvdHRvbSxcclxuICAgIHRvcCxcclxuXHJcbiAgICBpbnB1dFBvcnQsXHJcbiAgICBvdXRwdXRQb3J0LFxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmxvY2sgZXh0ZW5kcyBVSSB7XHJcbiAgICBwb3J0cyA6IFBvcnRbXSA9IFtdO1xyXG4gICAgb3V0bGluZUNvbG9yIDogc3RyaW5nID0gXCJncmVlblwiO1xyXG4gICAgbm90Y2hCb3R0b20gOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIG5vdGNoUmlnaHQgIDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBpblRvb2xib3ggICA6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgaWYodGhpcy5iYWNrZ3JvdW5kQ29sb3IgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBcImNvcm5zaWxrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFkZGluZyA9IFs1LCA1LCA1LCA1XTtcclxuXHJcbiAgICAgICAgaWYoZGF0YS5pblRvb2xib3ggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5pblRvb2xib3ggPSBkYXRhLmluVG9vbGJveDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29weSgpIDogQmxvY2sge1xyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gbWFrZUJsb2NrQnlUeXBlTmFtZSh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpO1xyXG5cclxuICAgICAgICBibG9jay5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgIGJsb2NrLmN0eCAgICAgID0gdGhpcy5jdHg7XHJcblxyXG4gICAgICAgIGJsb2NrLnNldE1pblNpemUoKTtcclxuICAgICAgICBibG9jay5ib3hTaXplID0gYmxvY2subWluU2l6ZSEuY29weSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gYmxvY2s7XHJcbiAgICB9XHJcblxyXG4gICAgbWFrZU9iaigpIDogYW55e1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkeDogdGhpcy5pZHgsXHJcbiAgICAgICAgICAgIHR5cGVOYW1lOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsXHJcbiAgICAgICAgICAgIHggOiB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHBvcnRzIDogdGhpcy5wb3J0cy5tYXAoeCA9PiB4Lm1ha2VPYmooKSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPYmoob2JqIDogYW55ICl7ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBhYnN0cmFjdCBzZXRNaW5TaXplKCkgOiB2b2lkO1xyXG5cclxuICAgIGNhbGNIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWluU2l6ZSEueTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0QmxvY2soKSA6IEJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgYm90dG9tX3BvcnQgOiBQb3J0IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBJZkJsb2NrKXtcclxuICAgICAgICAgICAgYm90dG9tX3BvcnQgPSB0aGlzLmJvdHRvbVBvcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcyBpbnN0YW5jZW9mIEluZmluaXRlTG9vcCl7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGJvdHRvbV9wb3J0ID0gdGhpcy5wb3J0cy5maW5kKHggPT4geC50eXBlID09IFBvcnRUeXBlLmJvdHRvbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKGJvdHRvbV9wb3J0ICE9IHVuZGVmaW5lZCAmJiBib3R0b21fcG9ydC5kZXN0aW5hdGlvbnMubGVuZ3RoICE9IDApe1xyXG4gICAgICAgICAgICBjb25zdCBkZXN0X3BvcnQgPSBib3R0b21fcG9ydC5kZXN0aW5hdGlvbnNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiBkZXN0X3BvcnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBpc1Byb2NlZHVyZSgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBOZXN0QmxvY2sgfHwgdGhpcyBpbnN0YW5jZW9mIFRUU0Jsb2NrIHx8IHRoaXMgaW5zdGFuY2VvZiBTbGVlcEJsb2NrO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBvcnRGcm9tUG9zaXRpb24ocG9zIDogVmVjMikgOiBQb3J0IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3J0cy5maW5kKHggPT4geC5pc05lYXIocG9zKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURpZmYoZGlmZiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbmV3X3Bvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5hZGQoZGlmZik7XHJcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihuZXdfcG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIG91dHB1dFBvcnRzKCkgOiBQb3J0W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvcnRzLmZpbHRlcih4ID0+IHgudHlwZSA9PSBQb3J0VHlwZS5vdXRwdXRQb3J0KTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0RGF0YWZsb3dCbG9ja3MoKSA6IEJsb2NrW10ge1xyXG4gICAgICAgIGNvbnN0IGJsb2NrcyA6IEJsb2NrW10gPSBbXTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0X3BvcnRzID0gdGhpcy5vdXRwdXRQb3J0cygpO1xyXG4gICAgICAgIGZvcihjb25zdCBwb3J0IG9mIG91dHB1dF9wb3J0cyl7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBkc3Qgb2YgcG9ydC5kZXN0aW5hdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgYmxvY2tzLnB1c2goZHN0LnBhcmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBibG9ja3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvcGVyZ2F0ZUNhbGMoKXtcclxuICAgICAgICBjb25zdCBuZXh0X2RhdGFmbG93X2Jsb2NrcyA9IHRoaXMubmV4dERhdGFmbG93QmxvY2tzKCk7XHJcbiAgICAgICAgbmV4dF9kYXRhZmxvd19ibG9ja3MuZm9yRWFjaCh4ID0+IHguY2FsYygpKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25uZWN0QmxvY2socG9ydHMgOiBQb3J0W10pe1xyXG4gICAgICAgIGxldCBbcG9ydDEsIHBvcnQyXSA9IHBvcnRzO1xyXG4gICAgICAgIGFzc2VydChwb3J0MS5wYXJlbnQgPT0gdGhpcyk7XHJcblxyXG4gICAgICAgIGlmKHBvcnQxLnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHBvcnQyLnR5cGUgPT0gUG9ydFR5cGUudG9wKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihwb3J0MS50eXBlID09IFBvcnRUeXBlLnRvcCl7XHJcbiAgICAgICAgICAgIGFzc2VydChwb3J0Mi50eXBlID09IFBvcnRUeXBlLmJvdHRvbSk7XHJcbiAgICAgICAgICAgIFtwb3J0MSwgcG9ydDJdID0gW3BvcnQyLCBwb3J0MV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcG9ydDEuY29ubmVjdChwb3J0Mik7XHJcblxyXG4gICAgICAgIG1zZyhgY29ubmVjdCBibG9ja2ApO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdOb3RjaChjeCA6IG51bWJlciwgY3kgOiBudW1iZXIsIHR5cGUgOiBQb3J0VHlwZSl7XHJcbiAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgIGNhc2UgUG9ydFR5cGUuYm90dG9tOlxyXG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY3gsIGN5LCBub3RjaFJhZGl1cywgTWF0aC5QSSwgMCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgUG9ydFR5cGUudG9wOlxyXG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY3gsIGN5LCBub3RjaFJhZGl1cywgMCwgTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd091dGxpbmUocG9pbnRzIDogW251bWJlciwgbnVtYmVyLCBudWxsfFBvcnRdW10pe1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IENhbnZhcy5vbmU7XHJcbiAgICAgICAgaWYoY2FudmFzLmRyYWdnZWRVSSA9PSB0aGlzKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGNhbnZhcy5uZWFyUG9ydHMubGVuZ3RoICE9IDAgJiYgY2FudmFzLm5lYXJQb3J0c1sxXS5wYXJlbnQgPT0gdGhpcyl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3IhO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGJsb2NrTGluZUNvbG9yO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCAgID0gYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgW2lkeCwgW3gsIHksIHBvcnRdXSBvZiBwb2ludHMuZW50cmllcygpKXtcclxuICAgICAgICAgICAgaWYoaWR4ID09IDApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYocG9ydCA9PSBudWxsKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHgsIHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdOb3RjaCh4LCB5LCBwb3J0LnR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3J0X3BvcyA9IHBvcnQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydF9wb3MueCA9IHg7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydF9wb3MueSA9IHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jdHguZ2xvYmFsQWxwaGEgIT0gMS4wKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxLjA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdJT1BvcnRzKHgxIDogbnVtYmVyLCB4MiA6IG51bWJlciwgeTEgOiBudW1iZXIsIHkyIDogbnVtYmVyKXtcclxuICAgICAgICBjb25zdCBpbnB1dF9wb3J0cyAgPSB0aGlzLnBvcnRzLmZpbHRlcih4ID0+IHgudHlwZSA9PSBQb3J0VHlwZS5pbnB1dFBvcnQpO1xyXG4gICAgICAgIGNvbnN0IG91dHB1dF9wb3J0cyA9IHRoaXMucG9ydHMuZmlsdGVyKHggPT4geC50eXBlID09IFBvcnRUeXBlLm91dHB1dFBvcnQpO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgcG9ydHMgb2YgWyBpbnB1dF9wb3J0cywgb3V0cHV0X3BvcnRzXSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSAocG9ydHMgPT0gaW5wdXRfcG9ydHMgPyB5MSArIG5vdGNoUmFkaXVzOiB5MiAtIG5vdGNoUmFkaXVzKTtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IFtpLCBwb3J0XSBvZiBwb3J0cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IChpICsgMSkgLyAocG9ydHMubGVuZ3RoICsgMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0geDEgKiAoMSAtIHApICsgeDIgKiBwO1xyXG4gICAgICAgICAgICAgICAgcG9ydC5kcmF3UG9ydCh0aGlzLmN0eCwgeCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0ljb24oaW1nIDogSFRNTEltYWdlRWxlbWVudCl7XHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgeDIsIHkyXSA9IHRoaXMuZ2V0Q29ybmVyUG9zaXRpb24oKTtcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IGltZ19oZWlnaHQgPSAoeTIgLSB5MSkgLSA2O1xyXG4gICAgICAgIGNvbnN0IGltZ193aWR0aCAgPSBpbWdfaGVpZ2h0ICogaW1nLndpZHRoIC8gaW1nLmhlaWdodDtcclxuXHJcbiAgICAgICAgY29uc3QgaW1nX3ggPSB4MiAtIGltZ193aWR0aCAtIDU7XHJcbiAgICAgICAgY29uc3QgaW1nX3kgPSB5MSArIDM7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWcsIGltZ194LCBpbWdfeSwgaW1nX3dpZHRoLCBpbWdfaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb3JuZXJQb3NpdGlvbigpIDogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSBwb3MueCArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuICAgICAgICBjb25zdCB5MSA9IHBvcy55ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHgxICsgdGhpcy5taW5TaXplIS54O1xyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyB0aGlzLm1pblNpemUhLnk7XHJcblxyXG4gICAgICAgIHJldHVybiBbeDEsIHkxLCB4MiwgeTJdO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdEYXRhZmxvd0Jsb2NrKCl7XHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgeDIsIHkyXSA9IHRoaXMuZ2V0Q29ybmVyUG9zaXRpb24oKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZHJhd091dGxpbmUoW1xyXG4gICAgICAgICAgICBbeDEsIHkxLCBudWxsXSxcclxuICAgICAgICAgICAgW3gxLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkxLCBudWxsXSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3SU9Qb3J0cyh4MSwgeDIsIHkxLCB5Mik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0FjdGlvbkJsb2NrKCl7XHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyAzNTtcclxuICAgICAgICBjb25zdCB4MyA9IHgxICsgdGhpcy5taW5TaXplIS54O1xyXG5cclxuICAgICAgICBjb25zdCB5MiA9IHkxICsgdGhpcy5taW5TaXplIS55IC0gbm90Y2hSYWRpdXM7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd091dGxpbmUoW1xyXG4gICAgICAgICAgICBbeDEsIHkxLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MSwgeTIsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkyLCB0aGlzLnBvcnRzWzFdXSxcclxuICAgICAgICAgICAgW3gzLCB5MiwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDMsIHkxLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MSwgdGhpcy5wb3J0c1swXV1cclxuICAgICAgICBdKTtcclxuICAgIH1cclxuXHJcbiAgICBjYW5Db25uZWN0TmVhclBvcnRQYWlyKGJsb2NrIDogQmxvY2spIDogUG9ydFtdIHtcclxuICAgICAgICBmb3IoY29uc3QgcG9ydDEgb2YgdGhpcy5wb3J0cyl7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBwb3J0MiBvZiBibG9jay5wb3J0cyl7XHJcbiAgICAgICAgICAgICAgICBpZihwb3J0MS5jYW5Db25uZWN0KHBvcnQyKSAmJiBwb3J0MS5wb3NpdGlvbi5kaXN0YW5jZShwb3J0Mi5wb3NpdGlvbikgPD0gbmVhclBvcnREaXN0YW5jZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtwb3J0MSwgcG9ydDJdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdmFsdWVDaGFuZ2VkKCl7XHJcbiAgICAgICAgbXNnKGBjaGFuZ2VkIDogJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2FsYygpe1xyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCl7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIElucHV0QmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBpbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5pbnB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SW5wdXRQb3NpdGlvbigpIDogW251bWJlciwgbnVtYmVyXXtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5pbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5wdXRfeCA9IHgxICsgMC41ICogKCh4MiAtIHgxKSAtIHJlY3Qud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IGlucHV0X3kgPSB5MSArIDAuNSAqICgoeTIgLSB5MSkgLSByZWN0LmhlaWdodCk7XHJcblxyXG4gICAgICAgIHJldHVybiBbaW5wdXRfeCwgaW5wdXRfeV07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24ocG9zaXRpb24gOiBWZWMyKSA6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLnNldFBvc2l0aW9uKHBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgY29uc3QgW3gxLCB5MV0gPSB0aGlzLmdldElucHV0UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDF9cHhgO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUudG9wICA9IGAke3kxfXB4YDtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBJbnB1dFJhbmdlQmxvY2sgZXh0ZW5kcyBJbnB1dEJsb2NrIHtcclxuICAgIG1pbklucHV0IDogSFRNTElucHV0RWxlbWVudDtcclxuICAgIG1heElucHV0IDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudHlwZSA9IFwicmFuZ2VcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gYCR7cmFuZ2VXaWR0aH1weGA7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5taW4gPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmlucHV0Lm1heCA9IFwiMTAwXCI7XHJcblxyXG4gICAgICAgIHRoaXMubWluSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5taW5JbnB1dC50eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5taW5JbnB1dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnN0eWxlLndpZHRoID0gYCR7bnVtYmVyV2lkdGh9cHhgO1xyXG5cclxuICAgICAgICB0aGlzLm1heElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQudHlwZSA9IFwibnVtYmVyXCI7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC52YWx1ZSA9IFwiMTAwXCI7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICB0aGlzLm1heElucHV0LnN0eWxlLndpZHRoID0gYCR7bnVtYmVyV2lkdGh9cHhgO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMubWluSW5wdXQpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5tYXhJbnB1dCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGFzeW5jIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCh0aGlzLmlucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHNyYyBvZiB0aGlzLnBvcnRzKXtcclxuICAgICAgICAgICAgICAgIHNyYy5zZXRQb3J0VmFsdWUodmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBDYW52YXMub25lLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5taW5JbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXYgOiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0Lm1pbiA9IHRoaXMubWluSW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgIG1zZyhgbWluIDogWyR7dGhpcy5pbnB1dC5taW59XWApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm1heElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubWF4ID0gdGhpcy5tYXhJbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgbXNnKGBtYXggOiBbJHt0aGlzLmlucHV0Lm1heH1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpIF07XHJcbiAgICB9XHJcblxyXG4gICAgbWFrZU9iaigpIDogYW55IHtcclxuICAgICAgICBsZXQgb2JqID0gT2JqZWN0LmFzc2lnbihzdXBlci5tYWtlT2JqKCksIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB0aGlzLmlucHV0LnZhbHVlLFxyXG4gICAgICAgICAgICBtaW4gICA6IHRoaXMubWluSW5wdXQudmFsdWUsXHJcbiAgICAgICAgICAgIG1heCAgIDogdGhpcy5tYXhJbnB1dC52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPYmoob2JqIDogYW55ICl7ICAgICAgICBcclxuICAgICAgICBzdXBlci5sb2FkT2JqKG9iaik7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgICAgPSBgJHtvYmoudmFsdWV9YDtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnZhbHVlID0gYCR7b2JqLm1pbn1gO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQudmFsdWUgPSBgJHtvYmoubWF4fWA7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMjAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24ocG9zaXRpb24gOiBWZWMyKSA6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLnNldFBvc2l0aW9uKHBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmMxID0gdGhpcy5pbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBjb25zdCByYzIgPSB0aGlzLm1pbklucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoICsgMiAqIFBvcnQucmFkaXVzO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyAwLjUgKiAoc2l6ZS55IC0gKHJjMS5oZWlnaHQgKyByYzIuaGVpZ2h0KSk7XHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIHJjMS5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUubGVmdCA9IGAke3gxfXB4YDtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLnRvcCAgPSBgJHt5MX1weGA7XHJcblxyXG4gICAgICAgIHRoaXMubWluSW5wdXQuc3R5bGUubGVmdCA9IGAke3gxfXB4YDtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnN0eWxlLnRvcCAgPSBgJHt5Mn1weGA7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuc3R5bGUubGVmdCA9IGAke3gxICsgcmMxLndpZHRoIC0gcmMyLndpZHRofXB4YDtcclxuICAgICAgICB0aGlzLm1heElucHV0LnN0eWxlLnRvcCAgPSBgJHt5Mn1weGA7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHRoaXMuZHJhd0RhdGFmbG93QmxvY2soKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXJ2b01vdG9yQmxvY2sgZXh0ZW5kcyBJbnB1dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC50eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gXCI0NXB4XCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQubWluICAgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmlucHV0Lm1heCAgID0gXCIxNVwiO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXYgOiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBtc2coYGNoYW5nZSA6IFske3RoaXMuaW5wdXQudmFsdWV9XWApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQpIF07XHJcbiAgICB9XHJcblxyXG4gICAgbWFrZU9iaigpIDogYW55IHtcclxuICAgICAgICBsZXQgb2JqID0gT2JqZWN0LmFzc2lnbihzdXBlci5tYWtlT2JqKCksIHtcclxuICAgICAgICAgICAgY2hhbm5lbCA6IHBhcnNlSW50KHRoaXMuaW5wdXQudmFsdWUpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmxvYWRPYmoob2JqKTtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gYCR7b2JqLmNoYW5uZWx9YDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigyMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5pbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5wdXRfeCA9IHgxICsgMTA7XHJcbiAgICAgICAgY29uc3QgaW5wdXRfeSA9IHkxICsgMC41ICogKCh5MiAtIHkxKSAtIHJlY3QuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5sZWZ0ID0gYCR7aW5wdXRfeH1weGA7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS50b3AgID0gYCR7aW5wdXRfeX1weGA7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRyYXdEYXRhZmxvd0Jsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3SWNvbihtb3Rvckljb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHZhbHVlQ2hhbmdlZCgpe1xyXG4gICAgICAgIGNvbnN0IGNoYW5uZWwgPSBwYXJzZUludCh0aGlzLmlucHV0LnZhbHVlKTtcclxuICAgICAgICBjb25zdCB2YWx1ZSAgID0gdGhpcy5wb3J0c1swXS52YWx1ZTtcclxuICAgICAgICBtc2coYG1vdG9yIGNoYW5nZWQgOiBjaDoke2NoYW5uZWx9IHZhbHVlOlske3ZhbHVlfV1gKTtcclxuICAgICAgICBpZih0eXBlb2YgdmFsdWUgIT0gXCJudW1iZXJcIil7XHJcbiAgICAgICAgICAgIG1zZyhgaWxsZWdhbCBtb3RvciB2YWx1ZToke3ZhbHVlfWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCBzZW5kRGF0YSh7XHJcbiAgICAgICAgICAgIGNvbW1hbmQgOiBcInNlcnZvXCIsXHJcbiAgICAgICAgICAgIGNoYW5uZWwgOiBjaGFubmVsLFxyXG4gICAgICAgICAgICB2YWx1ZSAgIDogdmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY2FsYygpe1xyXG4gICAgICAgIG1zZyhgbW90b3IgY2FsYzoke3RoaXMucG9ydHNbMF0udmFsdWV9YCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxuYWJzdHJhY3QgY2xhc3MgSW5wdXRUZXh0QmxvY2sgZXh0ZW5kcyBJbnB1dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcInRleHRcIjtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnkge1xyXG4gICAgICAgIGxldCBvYmogPSBPYmplY3QuYXNzaWduKHN1cGVyLm1ha2VPYmooKSwge1xyXG4gICAgICAgICAgICB0ZXh0IDogdGhpcy5pbnB1dC52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPYmoob2JqIDogYW55ICl7ICAgICAgICBcclxuICAgICAgICBzdXBlci5sb2FkT2JqKG9iaik7XHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IG9iai50ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigyMDAsIDIwICsgMiAqIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHRoaXMuZHJhd0RhdGFmbG93QmxvY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlSW5wdXRWYWx1ZU1hcCgpIDogTWFwPHN0cmluZywgbnVtYmVyPiB7XHJcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcclxuICAgICAgICBmb3IoY29uc3QgcG9ydCBvZiB0aGlzLnBvcnRzKXtcclxuICAgICAgICAgICAgaWYocG9ydC50eXBlID09IFBvcnRUeXBlLmlucHV0UG9ydCl7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQocG9ydC5uYW1lICE9IFwiXCIgJiYgdHlwZW9mIHBvcnQudmFsdWUgPT09ICdudW1iZXInICYmICEgaXNOYU4ocG9ydC52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldChwb3J0Lm5hbWUsIHBvcnQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2V0VmFsdWVCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS53aWR0aCA9IFwiNDVweFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIG1zZyhgY2hhbmdlIDogWyR7dGhpcy5pbnB1dC52YWx1ZX1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS50b3ApLFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSxcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuYm90dG9tKSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDIwMCwgNTApO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyAzNTtcclxuICAgICAgICBjb25zdCB4MyA9IHgxICsgdGhpcy5taW5TaXplIS54O1xyXG5cclxuICAgICAgICBjb25zdCB5MSA9IHBvcy55ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyB0aGlzLm1pblNpemUhLnkgLSBub3RjaFJhZGl1cztcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gxLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIHRoaXMucG9ydHNbMl1dLFxyXG4gICAgICAgICAgICBbeDMsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MywgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkxLCB0aGlzLnBvcnRzWzBdXVxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0lPUG9ydHMoeDEsIHgzLCB5MSwgeTIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIENhbWVyYUJsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpIF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuaW5Ub29sYm94KXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDMyMCwgNTAgKyAyICogbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMzIwLCAyNDAgKyAyICogbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHRoaXMuZHJhd0RhdGFmbG93QmxvY2soKTtcclxuXHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgeDIsIHkyXSA9IHRoaXMuZ2V0Q29ybmVyUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgbGV0IGltZyA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuaW5Ub29sYm94KXtcclxuXHJcbiAgICAgICAgICAgIGltZyA9IGNhbWVyYUljb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICBpZihjYW1lcmFJbWcgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbWcgPSBjYW1lcmFJbWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGltZ19oZWlnaHQgPSAoeTIgLSB5MSkgLSAyICogbm90Y2hSYWRpdXM7XHJcbiAgICAgICAgY29uc3QgaW1nX3dpZHRoICA9IGltZ19oZWlnaHQgKiBpbWcud2lkdGggLyBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBpbWdfeCA9IHgxICsgMC41ICogKCh4MiAtIHgxKSAtIGltZ193aWR0aCk7XHJcbiAgICAgICAgY29uc3QgaW1nX3kgPSB5MTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltZywgaW1nX3gsIGltZ195LCBpbWdfd2lkdGgsIGltZ19oZWlnaHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVFRTQmxvY2sgZXh0ZW5kcyBJbnB1dFRleHRCbG9jayB7XHJcbiAgICBzcGVlY2ggOiBTcGVlY2g7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS50b3ApLCBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuYm90dG9tKSBcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gXCLjgZPjgpPjgavjgaHjga8h44Gp44GG44Ge44KI44KN44GX44GPIVwiO1xyXG5cclxuICAgICAgICBpMThuX3RzLnNldFZvaWNlTGFuZ3VhZ2VDb2RlKFwianBuXCIpO1xyXG4gICAgICAgIHRoaXMuc3BlZWNoID0gbmV3IFNwZWVjaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDMwMCwgNTApO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kcmF3QWN0aW9uQmxvY2soKTtcclxuICAgICAgICB0aGlzLmRyYXdJY29uKHR0c0ljb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIGF3YWl0IHRoaXMuc3BlZWNoLnNwZWFrX3dhaXRFbmQodGhpcy5pbnB1dC52YWx1ZS50cmltKCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNsZWVwQmxvY2sgZXh0ZW5kcyBJbnB1dFRleHRCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCksIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pIFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBcIjNcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gXCI0NXB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMjAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRyYXdBY3Rpb25CbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0ljb24oc2xlZXBJY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICBjb25zdCBzZWNvbmQgPSBwYXJzZUZsb2F0KHRoaXMuaW5wdXQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICBhd2FpdCBzbGVlcChzZWNvbmQgKiAxMDAwKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2VEZXRlY3Rpb25CbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGZhY2UgOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQpLCBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSwgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICBpZih0aGlzLmluVG9vbGJveCl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigxNTAsIDEwICsgMiAqIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMjAsIDI0MCArIDIgKiAyICogbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRGYWNlKGZhY2UgOiBudW1iZXJbXSl7XHJcbiAgICAgICAgdGhpcy5mYWNlID0gZmFjZS5zbGljZSgpO1xyXG4gICAgICAgIGNvbnN0IFt4LCB5LCB3LCBoXSA9IHRoaXMuZmFjZTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjeCA9IHggKyB3IC8gMjtcclxuICAgICAgICBjb25zdCBjeSA9IHkgKyBoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0c1sxXS5zZXRQb3J0VmFsdWUoY3gpO1xyXG4gICAgICAgIHRoaXMucG9ydHNbMl0uc2V0UG9ydFZhbHVlKGN5KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDYW1lcmEoKSA6IENhbWVyYUJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZih0aGlzLnBvcnRzWzBdLnNvdXJjZXMubGVuZ3RoICE9IDApe1xyXG4gICAgICAgICAgICBjb25zdCBjYW1lcmEgPSB0aGlzLnBvcnRzWzBdLnNvdXJjZXMubWFwKHggPT4geC5wYXJlbnQpLmZpbmQoeCA9PiB4IGluc3RhbmNlb2YgQ2FtZXJhQmxvY2spO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FtZXJhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG5cclxuICAgICAgICBjb25zdCBjYW1lcmEgPSB0aGlzLmdldENhbWVyYSgpO1xyXG4gICAgICAgIGlmKGNhbWVyYSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYoY2FtZXJhSW1nID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgaW1nID0gY2FtZXJhSW1nO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDIgKiAyICogbm90Y2hSYWRpdXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGltZ193aWR0aCAgPSBpbWdfaGVpZ2h0ICogaW1nLndpZHRoIC8gaW1nLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGltZ194ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gaW1nX3dpZHRoKTtcclxuICAgICAgICAgICAgY29uc3QgaW1nX3kgPSB5MSArIDIgKiBub3RjaFJhZGl1cztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWcsIGltZ194LCBpbWdfeSwgaW1nX3dpZHRoLCBpbWdfaGVpZ2h0KTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmZhY2UubGVuZ3RoID09IDQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgc3Ryb2tlIGNvbG9yIHRvIHJlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmVkJztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGxpbmUgdGhpY2tuZXNzIHRvIDUgcGl4ZWxzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSA1O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IFtmYWNlX3gsIGZhY2VfeSwgZmFjZV93LCBmYWNlX2hdID0gdGhpcy5mYWNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN4ID0gaW1nX3ggKyBpbWdfd2lkdGggIC8gMjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN5ID0gaW1nX3kgKyBpbWdfaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdfZmFjZV94ID0gY3ggKyBpbWdfd2lkdGggICogZmFjZV94IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1nX2ZhY2VfeSA9IGN5ICsgaW1nX2hlaWdodCAqIGZhY2VfeSAvIDEwMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGltZ19mYWNlX3cgPSBpbWdfd2lkdGggICogZmFjZV93IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1nX2ZhY2VfaCA9IGltZ19oZWlnaHQgKiBmYWNlX2ggLyAxMDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRHJhdyBhbiBvdXRsaW5lZCByZWN0YW5nbGUgYXQgKDIwMCwgNTApIHdpdGggYSBzaXplIG9mIDEwMHg3NVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdChpbWdfZmFjZV94LCBpbWdfZmFjZV95LCBpbWdfZmFjZV93LCBpbWdfZmFjZV9oKTsgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBKb3lTdGlja0Jsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIF07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMTUwLCA1MCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXREaXN0YW5jZShkaXN0YW5jZSA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5wb3J0c1swXS5zZXRQb3J0VmFsdWUoZGlzdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0ljb24oZGlzdGFuY2VTZW5zb3JJY29uKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gIGNhbGNUZXJtKG1hcCA6IE1hcDxzdHJpbmcsIG51bWJlcj4sIHRlcm0gOiBUZXJtKSA6IG51bWJlciB7XHJcbiAgICBsZXQgdmFsdWUgOiBudW1iZXI7XHJcblxyXG4gICAgaWYodGVybSBpbnN0YW5jZW9mIFJhdGlvbmFsKXtcclxuICAgICAgICByZXR1cm4gdGVybS5mdmFsKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRlcm0gaW5zdGFuY2VvZiBDb25zdE51bSl7XHJcbiAgICAgICAgcmV0dXJuIHRlcm0udmFsdWUuZnZhbCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0ZXJtIGluc3RhbmNlb2YgUmVmVmFyKXtcclxuICAgICAgICB2YWx1ZSA9IG1hcC5nZXQodGVybS5uYW1lKSE7XHJcbiAgICAgICAgYXNzZXJ0KHZhbHVlICE9IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0ZXJtIGluc3RhbmNlb2YgQXBwKXtcclxuICAgICAgICBjb25zdCBhcHAgPSB0ZXJtO1xyXG4gICAgICAgIGNvbnN0IGFyZ192YWx1ZXMgPSBhcHAuYXJncy5tYXAoeCA9PiBjYWxjVGVybShtYXAsIHgpKTtcclxuICAgICAgICBpZihhcHAuaXNBZGQoKSl7XHJcbiAgICAgICAgICAgIHZhbHVlID0gc3VtKGFyZ192YWx1ZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5pc011bCgpKXtcclxuICAgICAgICAgICAgdmFsdWUgPSBhcmdfdmFsdWVzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyAqIGN1ciwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmlzRGl2KCkpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ192YWx1ZXNbMF0gLyBhcmdfdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwiJVwiKXtcclxuICAgICAgICAgICAgdmFsdWUgPSBhcmdfdmFsdWVzWzBdICUgYXJnX3ZhbHVlc1sxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihhcHAuaXNFcSgpKXtcclxuICAgICAgICAgICAgdmFsdWUgPSAoYXJnX3ZhbHVlc1swXSA9PSBhcmdfdmFsdWVzWzFdID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwiPD1cIil7XHJcbiAgICAgICAgICAgIHZhbHVlID0gKGFyZ192YWx1ZXNbMF0gPD0gYXJnX3ZhbHVlc1sxXSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihhcHAuZm5jTmFtZSA9PSBcIjxcIil7XHJcbiAgICAgICAgICAgIHZhbHVlID0gKGFyZ192YWx1ZXNbMF0gPCBhcmdfdmFsdWVzWzFdID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihcInVuaW1wbGVtZW50ZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoXCJ1bmltcGxlbWVudGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0ZXJtLnZhbHVlLmZ2YWwoKSAqIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ2FsY0Jsb2NrIGV4dGVuZHMgSW5wdXRUZXh0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQsIFwiYVwiKSwgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQsIFwiYlwiKSBcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGMoKXtcclxuICAgICAgICBtc2coYHN0YXJ0IGNhbGM6IGE6JHt0aGlzLnBvcnRzWzBdLnZhbHVlfWApO1xyXG4gICAgICAgIGNvbnN0IGV4cHIgPSBwYXJzZU1hdGgodGhpcy5pbnB1dC52YWx1ZS50cmltKCkpIGFzIEFwcDtcclxuICAgICAgICBhc3NlcnQoZXhwci5pc1Jvb3RFcSgpKTtcclxuICAgICAgICBjb25zdCBsaHMgPSBleHByLmFyZ3NbMF0gYXMgUmVmVmFyO1xyXG4gICAgICAgIGNvbnN0IHJocyA9IGV4cHIuYXJnc1sxXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFwID0gdGhpcy5tYWtlSW5wdXRWYWx1ZU1hcCgpO1xyXG5cclxuICAgICAgICBjb25zdCByaHNfdmFsdWUgPSBjYWxjVGVybShtYXAsIHJocyk7XHJcbiAgICAgICAgY29uc3QgbGhzX3BvcnQgPSB0aGlzLnBvcnRzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gbGhzLm5hbWUgJiYgeC50eXBlID09IFBvcnRUeXBlLm91dHB1dFBvcnQpITtcclxuICAgICAgICBhc3NlcnQobGhzX3BvcnQgIT0gdW5kZWZpbmVkKTtcclxuICAgICAgICBsaHNfcG9ydC5zZXRQb3J0VmFsdWUocmhzX3ZhbHVlKTtcclxuXHJcbiAgICAgICAgbXNnKGBlbmQgY2FsYzogYjoke3RoaXMucG9ydHNbMV0udmFsdWV9YCk7XHJcblxyXG4gICAgICAgIHRoaXMucHJvcGVyZ2F0ZUNhbGMoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENvbXBhcmVCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHsgICAgXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCwgXCJhXCIpLCBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwiYSA9PSBhXCI7XHJcbiAgICB9XHJcblxyXG4gICAgY2FsYygpIHtcclxuICAgICAgICBtc2coYHN0YXJ0IGNvbXBhcmU6IGE6JHt0aGlzLnBvcnRzWzBdLnZhbHVlfWApO1xyXG4gICAgICAgIGxldCBleHByIDogQXBwO1xyXG5cclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGV4cHIgPSBwYXJzZU1hdGgodGhpcy5pbnB1dC52YWx1ZS50cmltKCkpIGFzIEFwcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2goZXJyb3Ipe1xyXG4gICAgICAgICAgICBpZihlcnJvciBpbnN0YW5jZW9mIHBhcnNlcl90cy5TeW50YXhFcnJvcil7XHJcbiAgICAgICAgICAgICAgICBtc2coYHN5bnRheCBlcnJvcmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZDpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvcnRzWzFdLnNldFBvcnRWYWx1ZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBtYXAgPSB0aGlzLm1ha2VJbnB1dFZhbHVlTWFwKCk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2FsY1Rlcm0obWFwLCBleHByKTtcclxuXHJcbiAgICAgICAgaWYocmVzdWx0ID09IDAgfHwgcmVzdWx0ID09IDEpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wb3J0c1sxXS5zZXRQb3J0VmFsdWUocmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIG1zZyhgaWxsZWdhbCBjb21wYXJlIHJlc3VsdDoke3Jlc3VsdH1gKTtcclxuICAgICAgICAgICAgdGhpcy5wb3J0c1sxXS5zZXRQb3J0VmFsdWUodW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCbG9ja0J5VHlwZU5hbWUodHlwZU5hbWUgOiBzdHJpbmcpIDogQmxvY2sge1xyXG4gICAgc3dpdGNoKHR5cGVOYW1lKXtcclxuICAgIGNhc2UgSWZCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJZkJsb2NrKHt9KTtcclxuICAgIGNhc2UgQ29tcGFyZUJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wYXJlQmxvY2soe30pO1xyXG4gICAgY2FzZSBJbmZpbml0ZUxvb3AubmFtZTogICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEluZmluaXRlTG9vcCh7fSk7XHJcbiAgICBjYXNlIElucHV0UmFuZ2VCbG9jay5uYW1lOiAgICAgICAgICAgICAgIHJldHVybiBuZXcgSW5wdXRSYW5nZUJsb2NrKHt9KTtcclxuICAgIGNhc2UgU2Vydm9Nb3RvckJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXJ2b01vdG9yQmxvY2soe30pO1xyXG4gICAgY2FzZSBTZXRWYWx1ZUJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldFZhbHVlQmxvY2soe30pO1xyXG4gICAgY2FzZSBDYW1lcmFCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENhbWVyYUJsb2NrKHt9KTtcclxuICAgIGNhc2UgVFRTQmxvY2submFtZTogICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUVFNCbG9jayh7fSk7XHJcbiAgICBjYXNlIFNsZWVwQmxvY2submFtZTogICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2xlZXBCbG9jayh7fSk7XHJcbiAgICBjYXNlIEZhY2VEZXRlY3Rpb25CbG9jay5uYW1lOiAgICAgICAgICAgIHJldHVybiBuZXcgRmFjZURldGVjdGlvbkJsb2NrKHt9KTtcclxuICAgIGNhc2UgSm95U3RpY2tCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBKb3lTdGlja0Jsb2NrKHt9KTtcclxuICAgIGNhc2UgVWx0cmFzb25pY0Rpc3RhbmNlU2Vuc29yQmxvY2submFtZTogcmV0dXJuIG5ldyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jayh7fSk7XHJcbiAgICBjYXNlIENhbGNCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ2FsY0Jsb2NrKHt9KTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxufVxyXG5cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGxldCByZXBhaW50Q291bnQgPSAwO1xyXG5cclxubGV0IGFuaW1hdGlvbkZyYW1lSWQgOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbmV4cG9ydCBjbGFzcyBDYW52YXMge1xyXG4gICAgc3RhdGljIG9uZSA6IENhbnZhcztcclxuXHJcbiAgICBjYW52YXMgOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIGN0eCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgIHJvb3QgICA6IEdyaWQ7XHJcbiAgICBkcmFnZ2VkVUk/IDogQmxvY2sgfCBQb3J0IHwgQnV0dG9uO1xyXG4gICAgbmVhclBvcnRzIDogUG9ydFtdID0gW107XHJcbiAgICBwb2ludGVySWQgOiBudW1iZXIgPSBOYU47XHJcblxyXG4gICAgZG93blBvcyA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuICAgIG1vdmVQb3MgOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcbiAgICB1aU9yZ1BvcyA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuXHJcbiAgICBtb3ZlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjYW52YXNfaHRtbCA6IEhUTUxDYW52YXNFbGVtZW50LCByb290IDogR3JpZCl7XHJcbiAgICAgICAgQ2FudmFzLm9uZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXNfaHRtbDtcclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykhOyAvLyBPciAnd2ViZ2wnLCAnd2ViZ2wyJ1xyXG4gICAgICAgIGlmICghdGhpcy5jdHgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNhbnZhcyBjb250ZXh0IG5vdCBzdXBwb3J0ZWQhXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuXHJcbiAgICAgICAgc2V0Q29udGV4dDJEKHRoaXMuY3R4LCB0aGlzLnJvb3QpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgIHRoaXMucG9pbnRlcmRvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsICB0aGlzLnBvaW50ZXJtb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIiAgLCBhc3luYyAoZXY6UG9pbnRlckV2ZW50KT0+e1xyXG4gICAgICAgICAgICBhd2FpdCBDYW52YXMub25lLnBvaW50ZXJ1cChldik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UG9zaXRpb25JbkNhbnZhcyhldmVudCA6IFBvaW50ZXJFdmVudCkgOiBWZWMyIHtcclxuICAgICAgICAvLyBHZXQgdGhlIGJvdW5kaW5nIHJlY3RhbmdsZSBvZiB0aGUgY2FudmFzXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIHNjYWxpbmcgZmFjdG9ycyBpZiB0aGUgY2FudmFzIGlzIHN0eWxlZCBkaWZmZXJlbnRseSBmcm9tIGl0cyBpbnRlcm5hbCByZXNvbHV0aW9uXHJcbiAgICAgICAgY29uc3Qgc2NhbGVYID0gdGhpcy5jYW52YXMud2lkdGggLyByZWN0LndpZHRoO1xyXG4gICAgICAgIGNvbnN0IHNjYWxlWSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHJlY3QuaGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNhbnZhcyBjb29yZGluYXRlc1xyXG4gICAgICAgIGNvbnN0IGNhbnZhc1ggPSAoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgKiBzY2FsZVg7XHJcbiAgICAgICAgY29uc3QgY2FudmFzWSA9IChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApICogc2NhbGVZO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoY2FudmFzWCwgY2FudmFzWSk7XHJcbiAgICAgICAgLy8gTm93IHlvdSBoYXZlIHRoZSBjYW52YXMgY29vcmRpbmF0ZXMhXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYENhbnZhcyBYOiAke2NhbnZhc1h9LCBDYW52YXMgWTogJHtjYW52YXNZfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFVJRnJvbVBvc2l0aW9uKHVpIDogVUksIHBvcyA6IFZlYzIpIDogVUkgfCBQb3J0IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBmb3IoY29uc3QgY2hpbGQgb2YgdWkuY2hpbGRyZW4oKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VUlGcm9tUG9zaXRpb24oY2hpbGQsIHBvcyk7XHJcbiAgICAgICAgICAgIGlmKHRhcmdldCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodWkucG9zaXRpb24ueCA8PSBwb3MueCAmJiBwb3MueCA8IHVpLnBvc2l0aW9uLnggKyB1aS5ib3hTaXplLngpe1xyXG4gICAgICAgICAgICBpZih1aS5wb3NpdGlvbi55IDw9IHBvcy55ICYmIHBvcy55IDwgdWkucG9zaXRpb24ueSArIHVpLmJveFNpemUueSl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkgaW5zdGFuY2VvZiBCbG9jayl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9ydCA9IHVpLmdldFBvcnRGcm9tUG9zaXRpb24ocG9zKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihwb3J0ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdWk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcG9pbnRlcmRvd24oZXY6UG9pbnRlckV2ZW50KXtcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0UG9zaXRpb25JbkNhbnZhcyhldik7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRVSUZyb21Qb3NpdGlvbih0aGlzLnJvb3QsIHBvcyk7XHJcbiAgICAgICAgaWYodGFyZ2V0ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIG1zZyhgZG93bjoke3RhcmdldC5jb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG4gICAgICAgICAgICB0aGlzLmRvd25Qb3MgICA9IHBvcztcclxuICAgICAgICAgICAgdGhpcy5tb3ZlUG9zICAgPSBwb3M7XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBCbG9jayl7XHJcbiAgICAgICAgICAgICAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBJbnB1dFJhbmdlQmxvY2spe1xyXG4gICAgICAgICAgICAgICAgICAgIG1zZyhgcmFuZ2U6IGJveCR7dGFyZ2V0LmJveFNpemUueC50b0ZpeGVkKCl9IG91dDoke3RhcmdldC5taW5TaXplIS54fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pblRvb2xib3gpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IHRhcmdldC5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgTWFpbi5vbmUuZWRpdG9yLmFkZEJsb2NrKGJsb2NrKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkgPSBibG9ja1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0YXJnZXQgaW5zdGFuY2VvZiBQb3J0KXtcclxuXHJcbiAgICAgICAgICAgICAgICBtc2coYGRvd24gcG9ydDoke3RhcmdldC5zdHIoKX1gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGFyZ2V0IGluc3RhbmNlb2YgQnV0dG9uKXtcclxuXHJcbiAgICAgICAgICAgICAgICBtc2coYGRvd24gYnV0dG9uOiR7dGFyZ2V0LnRleHR9YCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSSA9IHRhcmdldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgdGhpcy51aU9yZ1BvcyAgPSB0aGlzLmRyYWdnZWRVSS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcklkID0gZXYucG9pbnRlcklkO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc2V0UG9pbnRlckNhcHR1cmUodGhpcy5wb2ludGVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdkcmFnZ2luZycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXROZWFyUG9ydHMoZHJhZ2dlZF9ibG9jayA6IEJsb2NrKXtcclxuICAgICAgICB0aGlzLm5lYXJQb3J0cyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IG90aGVyX2Jsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3MuZmlsdGVyKHggPT4geCAhPSB0aGlzLmRyYWdnZWRVSSk7XHJcbiAgICAgICAgZm9yKGNvbnN0IGJsb2NrIG9mIG90aGVyX2Jsb2Nrcyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5lYXJfcG9ydHMgPSBkcmFnZ2VkX2Jsb2NrLmNhbkNvbm5lY3ROZWFyUG9ydFBhaXIoYmxvY2spO1xyXG4gICAgICAgICAgICBpZihuZWFyX3BvcnRzLmxlbmd0aCAhPSAwKXtcclxuICAgICAgICAgICAgICAgIG1zZyhgbmVhcmApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZWFyUG9ydHMgPSBuZWFyX3BvcnRzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBvaW50ZXJtb3ZlKGV2OlBvaW50ZXJFdmVudCl7XHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0UG9zaXRpb25JbkNhbnZhcyhldik7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRVSUZyb21Qb3NpdGlvbih0aGlzLnJvb3QsIHBvcyk7XHJcbiAgICAgICAgY29uc3QgcyA9ICh0YXJnZXQgPT0gdW5kZWZpbmVkID8gXCJcIiA6IGB0YXJnZXQ6WyR7dGFyZ2V0LnN0cigpfV1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlUG9zID0gcG9zO1xyXG5cclxuICAgICAgICBjb25zdCBkaWZmID0gcG9zLnN1Yih0aGlzLmRvd25Qb3MpO1xyXG5cclxuICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSBpbnN0YW5jZW9mIEJsb2NrKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJLnNldFBvc2l0aW9uKCB0aGlzLnVpT3JnUG9zLmFkZChkaWZmKSApO1xyXG4gICAgICAgICAgICB0aGlzLmdldE5lYXJQb3J0cyh0aGlzLmRyYWdnZWRVSSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1ZXN0VXBkYXRlQ2FudmFzKCl7XHJcbiAgICAgICAgaWYgKGFuaW1hdGlvbkZyYW1lSWQgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+e1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWVJZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGFpbnQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHBvaW50ZXJ1cChldjpQb2ludGVyRXZlbnQpe1xyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0UG9zaXRpb25JbkNhbnZhcyhldik7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRVSUZyb21Qb3NpdGlvbih0aGlzLnJvb3QsIHBvcyk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW92ZWQpe1xyXG4gICAgICAgICAgICBtc2coXCJkcmFnZ2VkXCIpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSBpbnN0YW5jZW9mIFBvcnQgJiYgdGFyZ2V0IGluc3RhbmNlb2YgUG9ydCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSS5jb25uZWN0KHRhcmdldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmRyYWdnZWRVSSBpbnN0YW5jZW9mIEJsb2NrKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBwb3Muc3ViKHRoaXMuZG93blBvcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXROZWFyUG9ydHModGhpcy5kcmFnZ2VkVUkpO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5uZWFyUG9ydHMubGVuZ3RoID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcnRfZGlmZnMgPSB0aGlzLm5lYXJQb3J0c1sxXS5wb3NpdGlvbi5zdWIodGhpcy5uZWFyUG9ydHNbMF0ucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJLm1vdmVEaWZmKHBvcnRfZGlmZnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSS5jb25uZWN0QmxvY2sodGhpcy5uZWFyUG9ydHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5b3V0Um9vdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSS5zZXRQb3NpdGlvbiggdGhpcy51aU9yZ1Bvcy5hZGQoZGlmZikgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBtc2coYGNsaWNrOiR7dGhpcy5kcmFnZ2VkVUkuY29uc3RydWN0b3IubmFtZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJIGluc3RhbmNlb2YgQnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZHJhZ2dlZFVJLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzLnJlbGVhc2VQb2ludGVyQ2FwdHVyZSh0aGlzLnBvaW50ZXJJZCk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmFnZ2VkVUkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5wb2ludGVySWQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5uZWFyUG9ydHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGF5b3V0Um9vdCgpe1xyXG4gICAgICAgIHRoaXMucm9vdC5zZXRNaW5TaXplKCk7XHJcbiAgICAgICAgdGhpcy5yb290LmxheW91dCgwLCAwLCBuZXcgVmVjMih0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KSwgMCk7ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICByZXNpemVDYW52YXMoKSB7XHJcbiAgICAgICAgLy8gU2V0IHRoZSBjYW52YXMncyBpbnRlcm5hbCBkcmF3aW5nIGRpbWVuc2lvbnMgdG8gbWF0Y2ggaXRzIGRpc3BsYXkgc2l6ZVxyXG4gICAgICAgIC8vIHdpbmRvdy5pbm5lcldpZHRoL0hlaWdodCBnaXZlIHRoZSB2aWV3cG9ydCBkaW1lbnNpb25zLlxyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gSWYgeW91J3JlIGRyYXdpbmcgc29tZXRoaW5nLCB5b3UgbWlnaHQgd2FudCB0byByZWRyYXcgaXQgaGVyZVxyXG4gICAgICAgIGlmICh0aGlzLmN0eCkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7IC8vIENsZWFyIHRoZSBjYW52YXNcclxuICAgICAgICAgICAgLy8gRXhhbXBsZSBkcmF3aW5nXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoNTAsIDUwLCAxMDAsIDEwMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMzBweCBBcmlhbCc7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCdIZWxsbyBDYW52YXMhJywgdGhpcy5jYW52YXMud2lkdGggLyAyIC0gMTAwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGF5b3V0Um9vdCgpO1xyXG4gICAgICAgIHRoaXMucm9vdC5kdW1wKDApO1xyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3RHJhZ2dlZFBvcnQocG9ydCA6IFBvcnQpeyAgICAgICBcclxuICAgICAgICB0aGlzLmRyYXdMaW5lKHBvcnQucG9zaXRpb24sIHRoaXMubW92ZVBvcywgXCJibHVlXCIpIDtcclxuICAgIH1cclxuXHJcbiAgICByZXBhaW50KCl7XHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpOyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yb290LmRyYXcoKTtcclxuICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSBpbnN0YW5jZW9mIFBvcnQpe1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdEcmFnZ2VkUG9ydCh0aGlzLmRyYWdnZWRVSSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1zZyhcInJlcGFpbnRcIik7XHJcbiAgICAgICAgcmVwYWludENvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0xpbmUoc3RhcnQgOiBWZWMyLCBlbmQgOiBWZWMyLCBjb2xvciA6IHN0cmluZywgbGluZVdpZHRoIDogbnVtYmVyID0gMil7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggICA9IGxpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHN0YXJ0LngsIHN0YXJ0LnkpO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhlbmQueCwgZW5kLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxufVxyXG5cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGxldCB1cmxPcmlnaW4gOiBzdHJpbmc7XHJcbmxldCBzdGFydEJ1dHRvbiA6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5leHBvcnQgbGV0IHN0b3BGbGFnIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgaXNSdW5uaW5nIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuY2xhc3MgVmFyaWFibGUge1xyXG4gICAgbmFtZSEgOiBzdHJpbmc7XHJcbiAgICB0eXBlISA6IERhdGFUeXBlO1xyXG59XHJcblxyXG5jbGFzcyBGaWVsZCBleHRlbmRzIFZhcmlhYmxlIHtcclxuICAgIHBhcmVudCEgOiBTdHJ1Y3Q7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTdHJ1Y3Qge1xyXG4gICAgbWVtYmVycyA6IEZpZWxkW10gPSBbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERhdGFUeXBlIHtcclxuICAgIGRpbWVuc2lvbnMgOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgdHlwZU5hbWUhIDogc3RyaW5nO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBvcnQge1xyXG4gICAgc3RhdGljIHJhZGl1cyA9IDEwOyAgICAgICAgXHJcblxyXG4gICAgaWR4IDogbnVtYmVyID0gMDtcclxuICAgIG5hbWUgOiBzdHJpbmc7XHJcbiAgICBwYXJlbnQgOiBCbG9jaztcclxuICAgIGRlc3RpbmF0aW9ucyA6IFBvcnRbXSAgPSBbXTtcclxuICAgIHNvdXJjZXMgOiBQb3J0W10gID0gW107XHJcbiAgICB0eXBlIDogUG9ydFR5cGU7XHJcbiAgICBwaXBlcyA6IFBpcGVbXSA9IFtdO1xyXG4gICAgcG9zaXRpb24gOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcblxyXG4gICAgcHJldlZhbHVlIDogYW55IHwgdW5kZWZpbmVkO1xyXG4gICAgdmFsdWUgOiBhbnkgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGFyZW50IDogQmxvY2ssIHR5cGUgOiBQb3J0VHlwZSwgbmFtZSA6IHN0cmluZyA9IFwiXCIpe1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHRoaXMudHlwZSAgID0gdHlwZTtcclxuICAgICAgICB0aGlzLm5hbWUgICA9IG5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RyKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBcInBvcnRcIjtcclxuICAgIH1cclxuXHJcbiAgICBjb3B5UG9ydChwYXJlbnQgOiBCbG9jaykgOiBQb3J0IHtcclxuICAgICAgICBjb25zdCBwb3J0ID0gbmV3IFBvcnQocGFyZW50LCB0aGlzLnR5cGUpO1xyXG4gICAgICAgIHBvcnQucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmNvcHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBvcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgbWFrZU9iaigpIDogYW55e1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkeCA6IHRoaXMuaWR4LFxyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbnMgOiB0aGlzLmRlc3RpbmF0aW9ucy5tYXAoZHN0ID0+IGRzdC5pZHgpXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3J0VmFsdWUodmFsdWUgOiBhbnkgfCB1bmRlZmluZWQpe1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IGRzdCBvZiB0aGlzLmRlc3RpbmF0aW9ucyl7XHJcbiAgICAgICAgICAgIGRzdC5zZXRQb3J0VmFsdWUodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgZHN0LnBhcmVudC52YWx1ZUNoYW5nZWQoKVxyXG4gICAgICAgICAgICAudGhlbigoKT0+e1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB2YWx1ZSBjaGFuZ2U6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzTmVhcihwb3MgOiBWZWMyKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5kaXN0YW5jZShwb3MpIDwgUG9ydC5yYWRpdXM7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd1BvcnQoY3R4IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjeCA6IG51bWJlciwgY3kgOiBudW1iZXIpIDogdm9pZCB7ICAgICAgIFxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gY3g7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gY3k7XHJcblxyXG4gICAgICAgIGN0eC5hcmModGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIFBvcnQucmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcblxyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgZHN0IG9mIHRoaXMuZGVzdGluYXRpb25zKXtcclxuICAgICAgICAgICAgQ2FudmFzLm9uZS5kcmF3TGluZSh0aGlzLnBvc2l0aW9uLCBkc3QucG9zaXRpb24sIFwiYnJvd25cIiwgNCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLm5hbWUgIT0gXCJcIil7XHJcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VUZXh0KHRoaXMubmFtZSwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICBjdHguZm9udCA9ICcyNHB4IEFyaWFsJztcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zaXRpb24ueCAtIDc7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyA3O1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQodGhpcy5uYW1lLCB4LCB5KTtcclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMudmFsdWUgIT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5mb250ID0gJzI0cHggQXJpYWwnO1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NpdGlvbi54IC0gNyArIFBvcnQucmFkaXVzO1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NpdGlvbi55ICsgNztcclxuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMudmFsdWV9YCwgeCwgeSk7XHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbkNvbm5lY3QoZHN0IDogUG9ydCkgOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBwYWlycyA9IFtcclxuICAgICAgICAgICAgWyBQb3J0VHlwZS5ib3R0b20sIFBvcnRUeXBlLnRvcF0sXHJcbiAgICAgICAgICAgIFsgUG9ydFR5cGUudG9wICwgUG9ydFR5cGUuYm90dG9tXSxcclxuXHJcbiAgICAgICAgICAgIFsgUG9ydFR5cGUuaW5wdXRQb3J0LCBQb3J0VHlwZS5vdXRwdXRQb3J0XSxcclxuICAgICAgICAgICAgWyBQb3J0VHlwZS5vdXRwdXRQb3J0LCBQb3J0VHlwZS5pbnB1dFBvcnRdXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhaXJzLnNvbWUocGFpciA9PiBwYWlyWzBdID09IHRoaXMudHlwZSAmJiBwYWlyWzFdID09IGRzdC50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25uZWN0KHBvcnQgOiBQb3J0KSA6IHZvaWQgeyAgIFxyXG4gICAgICAgIGFzc2VydCh0aGlzLmNhbkNvbm5lY3QocG9ydCkpO1xyXG5cclxuICAgICAgICBsZXQgc3JjIDogUG9ydDtcclxuICAgICAgICBsZXQgZHN0IDogUG9ydDtcclxuXHJcbiAgICAgICAgaWYodGhpcy50eXBlID09IFBvcnRUeXBlLmJvdHRvbSB8fCB0aGlzLnR5cGUgPT0gUG9ydFR5cGUub3V0cHV0UG9ydCl7XHJcbiAgICAgICAgICAgIFtzcmMsIGRzdF0gPSBbdGhpcywgcG9ydF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIFtzcmMsIGRzdF0gPSBbcG9ydCwgdGhpc107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhcHBlbmQoc3JjLmRlc3RpbmF0aW9ucywgZHN0KTtcclxuICAgICAgICBhcHBlbmQoZHN0LnNvdXJjZXMsIHNyYyk7XHJcblxyXG4gICAgICAgIG1zZyhgY29ubmVjdCBwb3J0OiR7dGhpcy5pZHh9PT4ke3BvcnQuaWR4fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBKb2ludCB7XHJcblxyXG4gICAgZHJhd0pvaW50KGNhbnZhcyA6IENhbnZhcyl7ICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVHViZSB7XHJcblxyXG4gICAgZHJhd1R1YmUoY2FudmFzIDogQ2FudmFzKXsgICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGlwZSB7XHJcbiAgICBzb3VyY2UhIDogUG9ydDtcclxuICAgIGRlc3RpbmF0aW9uISA6IFBvcnQ7XHJcbiAgICB0dWJlcyA6IFR1YmVbXSA9IFtdO1xyXG4gICAgam9pbnRzIDogSm9pbnRbXSA9IFtdO1xyXG5cclxuICAgIGRyYXdQaXBlKGNhbnZhcyA6IENhbnZhcyl7ICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2Uge1xyXG59XHJcblxyXG5jbGFzcyBQbG90IHsgICAgXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYXllciB7XHJcbn1cclxuXHJcbmNsYXNzIFNjaGVkdWxlciB7XHJcbn1cclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCBhc3luY0JvZHlPbkxvYWQoKTtcclxufSk7ICBcclxuXHJcbi8vXHJcbmxldCBtYWluIDogTWFpbjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNYWluIHtcclxuICAgIHN0YXRpYyBvbmUgOiBNYWluO1xyXG4gICAgY2FudmFzIDogQ2FudmFzO1xyXG4gICAgZWRpdG9yIDogRWRpdG9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgTWFpbi5vbmUgPSB0aGlzO1xyXG4gICAgICAgIC8vIEdldCB0aGUgY2FudmFzIGVsZW1lbnRcclxuXHJcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBuZXcgRWRpdG9yKHt9KTtcclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdCA9ICRncmlkKHtcclxuICAgICAgICAgICAgcm93cyA6IFwiNjBweCAxMDAlXCIsICAgICAgICBcclxuICAgICAgICAgICAgY29sdW1ucyA6IFwiMTBweCAyNSUgNzUlXCIsXHJcbiAgICAgICAgICAgIGNlbGxzIDogW1xyXG4gICAgICAgICAgICAgICAgLy8gW1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICRmaWxsZXIoe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb2xzcGFuIDogMyxcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgYmFja2dyb3VuZENvbG9yIDogXCJjb3Juc2lsa1wiXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcclxuICAgICAgICAgICAgICAgIC8vIF1cclxuICAgICAgICAgICAgICAgIC8vICxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAkZmlsbGVyKHsgY29sc3BhbiA6IDMgfSlcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAkZmlsbGVyKHt9KVxyXG4gICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAkdmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW4gOiBcIjEwMCVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4gOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSWZCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbmZpbml0ZUxvb3AoeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29tcGFyZUJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IElucHV0UmFuZ2VCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZXJ2b01vdG9yQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNldFZhbHVlQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2FtZXJhQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRmFjZURldGVjdGlvbkJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENhbGNCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUVFNCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTbGVlcEJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBjYW52YXNfaHRtbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3b3JsZCcpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gbmV3IENhbnZhcyhjYW52YXNfaHRtbCwgcm9vdClcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbCByZXNpemUgd2hlbiB0aGUgcGFnZSBsb2Fkc1xyXG4gICAgICAgIC8vIFVzZSBET01Db250ZW50TG9hZGVkIHRvIGVuc3VyZSB0aGUgY2FudmFzIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSB0cnlpbmcgdG8gYWNjZXNzIGl0XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRoaXMuY2FudmFzLnJlc2l6ZUNhbnZhcy5iaW5kKHRoaXMuY2FudmFzKSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byByZXNpemUgdGhlIGNhbnZhcyB3aGVuZXZlciB0aGUgd2luZG93IGlzIHJlc2l6ZWRcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5jYW52YXMucmVzaXplQ2FudmFzLmJpbmQodGhpcy5jYW52YXMpKTtcclxuXHJcbiAgICAgICAgc2V0RHJhZ0Ryb3AodGhpcy5jYW52YXMuY2FudmFzKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMucmVzaXplQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBmZXRjaEltYWdlKGltYWdlX3VybCA6IHN0cmluZyl7XHJcbiAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1hZ2Uud2lkdGggID0gMzIwO1xyXG4gICAgaW1hZ2UuaGVpZ2h0ID0gMjQwO1xyXG5cclxuICAgIC8vIDIuIFNldCB0aGUgY3Jvc3NPcmlnaW4gYXR0cmlidXRlIGZvciBzZWN1cml0eSBhbmQgdG8gcHJldmVudCBhIHRhaW50ZWQgY2FudmFzXHJcbiAgICBpbWFnZS5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnOyBcclxuICAgIFxyXG4gICAgaW1hZ2Uuc3JjID0gaW1hZ2VfdXJsOyBcclxuXHJcbiAgICAvLyA0LiBXYWl0IGZvciB0aGUgaW1hZ2UgdG8gbG9hZFxyXG4gICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbWVyYUltZyA9IGltYWdlO1xyXG4gICAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2FtZXJhSW1hZ2UoaW1hZ2VfZmlsZV9uYW1lIDogc3RyaW5nKXtcclxuICAgIGNvbnN0IGJsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3M7XHJcbiAgICBjb25zdCBjYW1lcmFzID0gYmxvY2tzLmZpbHRlcih4ID0+IHggaW5zdGFuY2VvZiBDYW1lcmFCbG9jayk7XHJcbiAgICBmb3IoY29uc3QgY2FtZXJhIG9mIGNhbWVyYXMpe1xyXG4gICAgICAgIGNvbnN0IGltYWdlX3VybCA9IGBzdGF0aWMvbGliL2RpYWdyYW0vaW1nLyR7aW1hZ2VfZmlsZV9uYW1lfWA7XHJcbiAgICAgICAgZmV0Y2hJbWFnZShpbWFnZV91cmwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVGYWNlRGV0ZWN0aW9uKGZhY2UgOiBudW1iZXJbXSl7XHJcbiAgICBjb25zdCBmYWNlX2RldGVjdGlvbiA9IE1haW4ub25lLmVkaXRvci5ibG9ja3MuZmluZCh4ID0+IHggaW5zdGFuY2VvZiBGYWNlRGV0ZWN0aW9uQmxvY2spIGFzIEZhY2VEZXRlY3Rpb25CbG9jaztcclxuICAgIGlmKGZhY2VfZGV0ZWN0aW9uICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZmFjZV9kZXRlY3Rpb24uc2V0RmFjZShmYWNlKTtcclxuXHJcbiAgICAgICAgZmFjZV9kZXRlY3Rpb24ucHJvcGVyZ2F0ZUNhbGMoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlRGlzdGFuY2VTZW5zb3IoZGlzdGFuY2UgOiBudW1iZXIpe1xyXG4gICAgY29uc3QgZGlzdGFuY2Vfc2Vuc29yID0gTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5maW5kKHggPT4geCBpbnN0YW5jZW9mIFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrKSBhcyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jaztcclxuICAgIGlmKGRpc3RhbmNlX3NlbnNvciAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGRpc3RhbmNlX3NlbnNvci5zZXREaXN0YW5jZShkaXN0YW5jZSk7XHJcblxyXG4gICAgICAgIGRpc3RhbmNlX3NlbnNvci5wcm9wZXJnYXRlQ2FsYygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjbGVhclF1ZXVlKCkge1xyXG4gICAgZm9yKGxldCBpZHggPSAwOyA7IGlkeCsrKXtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZW5kRGF0YSh7XHJcbiAgICAgICAgICAgIGNvbW1hbmQgOiBcInN0YXR1c1wiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gcmVzdWx0W1wicXVldWVcIl1cclxuICAgICAgICBpZihxdWV1ZSA9PSBudWxsKXtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIG1zZyhgY2xlYXIgcXVldWU6JHtpZHh9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBlcmlvZGljVGFzaygpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICBjb21tYW5kIDogXCJzdGF0dXNcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcXVldWUgPSByZXN1bHRbXCJxdWV1ZVwiXVxyXG4gICAgaWYocXVldWUgIT0gbnVsbCl7XHJcblxyXG4gICAgICAgIGNvbnN0IGpzb25fc3RyID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKTtcclxuICAgICAgICBtc2coYHN0YXR1czoke2pzb25fc3RyfWApO1xyXG5cclxuICAgICAgICBjb25zdCBpbWFnZV9maWxlX25hbWUgPSBxdWV1ZVtcImltYWdlX2ZpbGVfbmFtZVwiXTtcclxuICAgICAgICBpZihpbWFnZV9maWxlX25hbWUgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdXBkYXRlQ2FtZXJhSW1hZ2UoaW1hZ2VfZmlsZV9uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZhY2UgPSBxdWV1ZVtcImZhY2VcIl07XHJcbiAgICAgICAgaWYoZmFjZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQoZmFjZS5sZW5ndGggPT0gNCk7XHJcbiAgICAgICAgICAgIHVwZGF0ZUZhY2VEZXRlY3Rpb24oZmFjZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHF1ZXVlW1wiZGlzdGFuY2VcIl07XHJcbiAgICAgICAgaWYoZGlzdGFuY2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHR5cGVvZiBkaXN0YW5jZSA9PSBcIm51bWJlclwiKTtcclxuICAgICAgICAgICAgdXBkYXRlRGlzdGFuY2VTZW5zb3IoZGlzdGFuY2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2FudmFzLm9uZS5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChwZXJpb2RpY1Rhc2ssIDEwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRvcFByb2NlZHVyZXMoKSA6IEJsb2NrW10ge1xyXG4gICAgY29uc3QgcHJvY2VkdXJlX2Jsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3MuZmlsdGVyKHggPT4geC5pc1Byb2NlZHVyZSgpKSBhcyBCbG9ja1tdO1xyXG5cclxuICAgIGNvbnN0IHRvcF9ibG9ja3MgOiBCbG9ja1tdID0gW107XHJcbiAgICBmb3IoY29uc3QgYmxvY2sgb2YgcHJvY2VkdXJlX2Jsb2Nrcyl7XHJcbiAgICAgICAgY29uc3QgdG9wX3BvcnQgPSBibG9jay5wb3J0cy5maW5kKHggPT4geC50eXBlID09IFBvcnRUeXBlLnRvcCkhO1xyXG4gICAgICAgIGFzc2VydCh0b3BfcG9ydCAhPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIGlmKHRvcF9wb3J0LnNvdXJjZXMubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICB0b3BfYmxvY2tzLnB1c2goYmxvY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdG9wX2Jsb2NrcztcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJsb2NrQ2hhaW4odG9wX2Jsb2NrIDogQmxvY2spe1xyXG4gICAgZm9yKGxldCBibG9jayA6IEJsb2NrIHwgdW5kZWZpbmVkID0gdG9wX2Jsb2NrOyBibG9jayAhPSB1bmRlZmluZWQ7IGJsb2NrID0gYmxvY2submV4dEJsb2NrKCkpe1xyXG4gICAgICAgIGF3YWl0IGJsb2NrLnJ1bigpO1xyXG5cclxuICAgICAgICBpZihzdG9wRmxhZyl7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc3RhcnRQcm9jZWR1cmVzKCkge1xyXG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gXCJTdG9wXCI7XHJcblxyXG4gICAgaXNSdW5uaW5nID0gdHJ1ZTtcclxuICAgIHN0b3BGbGFnID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgdG9wX2Jsb2NrcyA9IGdldFRvcFByb2NlZHVyZXMoKTtcclxuICAgIGZvcihjb25zdCB0b3BfYmxvY2sgb2YgdG9wX2Jsb2Nrcyl7XHJcbiAgICAgICAgbXNnKGB0b3AgcHJvYzoke3RvcF9ibG9jay5jb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG4gICAgICAgIGF3YWl0IHJ1bkJsb2NrQ2hhaW4odG9wX2Jsb2NrKTtcclxuXHJcbiAgICAgICAgaWYoc3RvcEZsYWcpe1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbXNnKFwicHJvY2VkdXJlcyBjb21wbGV0ZS5cIik7XHJcbiAgICBpc1J1bm5pbmcgPSBmYWxzZTtcclxuICAgIHN0YXJ0QnV0dG9uLmlubmVyVGV4dCA9IFwiU3RhcnRcIjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzeW5jQm9keU9uTG9hZCgpe1xyXG4gICAgbXNnKFwibG9hZGVkXCIpO1xyXG4gICAgbGV0IHBhdGhuYW1lICA6IHN0cmluZztcclxuICAgIFsgdXJsT3JpZ2luLCBwYXRobmFtZSwgXSA9IGkxOG5fdHMucGFyc2VVUkwoKTtcclxuICAgIG1zZyhgb3JpZ2luOlske3VybE9yaWdpbn1dIHBhdGg6WyR7cGF0aG5hbWV9XWApO1xyXG5cclxuICAgIGNhbWVyYUljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbWVyYS1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBtb3Rvckljb24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb3Rvci1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBkaXN0YW5jZVNlbnNvckljb24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXN0YW5jZS1zZW5zb3ItaWNvblwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgdHRzSWNvbiAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHRzLWljb25cIikgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgIHNsZWVwSWNvbiAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2xlZXAtaWNvblwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgXHJcblxyXG4gICAgc3RhcnRCdXR0b24gPSAkKFwic3RhcnQtYnRuXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jKGV2IDogTW91c2VFdmVudCk9PntcclxuICAgICAgICBpZihpc1J1bm5pbmcpe1xyXG5cclxuICAgICAgICAgICAgc3RvcEZsYWcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBhd2FpdCBzdGFydFByb2NlZHVyZXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkb3dubG9hZEJ0biA9ICQoXCJkb3dubG9hZC1idG5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBkb3dubG9hZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMoZXYgOiBNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgIHNhdmVKc29uKCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgbWFpbiA9IG5ldyBNYWluKCk7XHJcblxyXG4gICAgYXdhaXQgY2xlYXJRdWV1ZSgpO1xyXG5cclxuICAgIGlmKCB1cmxPcmlnaW4gIT0gXCJodHRwOi8vMTI3LjAuMC4xOjU1MDBcIil7XHJcbiAgICAgICAgYXdhaXQgcGVyaW9kaWNUYXNrKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vLyBleHBvcnQgY2xhc3MgTm9kZSB7XHJcbi8vIH1cclxuXHJcbi8qXHJcbuODgOOCpOOCouOCsOODqeODoFxyXG7jg7vjg5Xjg63jg7zjg4Hjg6Pjg7zjg4hcclxu44O744OH44O844K/44OV44Ot44O8XHJcbuODu+Wbnui3r+Wbs1xyXG7jg7tVSeeUu+mdolxyXG7jg7tVTUxcclxuICAgIOODu+OCt+ODvOOCseODs+OCueWbs1xyXG4gICAg44O744Kv44Op44K55ZuzXHJcbiAgICDjg7vjgqLjgq/jg4bjgqPjg5Pjg4bjgqPlm7NcclxuICAgIOODu+OCs+ODs+ODneODvOODjeODs+ODiOWbs1xyXG4gICAg44O754q25oWL6YG356e75ZuzXHJcbiAgICDjg7vjgr/jgqTjg5/jg7PjgrDlm7NcclxuICAgIOODu1xyXG7jg7tcclxu44O7XHJcbuODu1xyXG7jg7tcclxuXHJcbuOCs+ODs+ODneODvOODjeODs+ODiFxyXG7jg7vlrp/ooYxcclxuICAgIOODu2lmL2Vsc2VcclxuICAgIOODu3doaWxlXHJcbiAgICDjg7vku6PlhaVcclxuICAgIOODu+OCueODiOODquODvOODoFxyXG4gICAgICAgIOODu+mAmuS/oVxyXG4gICAgICAgICAgICDjg7vjg5fjg63jgrvjgrnplpNcclxuICAgICAgICAgICAg44O744K944Kx44OD44OIXHJcbiAgICAgICAgICAgICAgICDjg7tUQ1BcclxuICAgICAgICAgICAgICAgIOODu1VEUFxyXG4gICAgICAgIOODu+ODkOODg+ODleOCoeS7mOOBjVxyXG4gICAg44O7c2xlZXBcclxuICAgIOODu3dhaXQgdW50aWxcclxuICAgIOODu2NhbGwgZnVuY3Rpb25cclxuICAgIOODu+ODluODreODg+OCr1xyXG4gICAgICAgIOODu+mWouaVsOWumue+qVxyXG4gICAgICAgIOODu+ODh+ODkOOCpOOCuVxyXG5cclxuXHJcbuWun+ihjOODouODvOODiVxyXG7jg7vnt6jpm4Zcclxu44O744Ko44Of44Ol44Os44O844K344On44OzXHJcbuODu+Wun+apn+ODh+ODkOODg+OCsFxyXG5cclxu44K544Kx44K444Ol44O844Oq44Oz44KwXHJcbuODu+WNs+aZguOBq+WGjeWun+ihjFxyXG7jg7tUaWNr5pmC44Gr5YaN5a6f6KGMXHJcblxyXG7jg7vlhaXlipvjgZXjgozjgZ/jgolcclxu44O75YCk44GM5aSJ5YyW44GX44Gf44KJXHJcblxyXG7jg7vvvJHjgaTjgafjgoLlhaXlipvjgZXjgozjgZ/jgolcclxu44O75YWo6YOo5YWl5Yqb44GV44KM44Gf44KJXHJcblxyXG4qL1xyXG5cclxuXHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kRGF0YShkYXRhVG9TZW5kIDogYW55KSA6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCB1cmwgPSBgJHt1cmxPcmlnaW59L3NlbmRfZGF0YWA7XHJcbiAgICAvLyBtc2coYHBvc3Q6WyR7dXJsfV1gKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGFUb1NlbmQpIC8vIENvbnZlcnQgSmF2YVNjcmlwdCBvYmplY3QgdG8gSlNPTiBzdHJpbmdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgU3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c30sIE1lc3NhZ2U6ICR7ZXJyb3JEYXRhLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7IC8vIFBhcnNlIHRoZSBKU09OIHJlc3BvbnNlIGZyb20gRmxhc2tcclxuICAgICAgICBjb25zdCBqc29uX3N0ciA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMik7IC8vIFByZXR0eSBwcmludCBKU09OXHJcbiAgICAgICAgLy8gbXNnKGBzZW5kIGRhdGEgcmVzdWx0Olske2pzb25fc3RyfV1gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBtc2coYHNlbmQgZGF0YSBlcnJvcjogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWApO1xyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGZ1bmN0aW9uIGRvd25sb2FkSnNvbihkYXRhIDogYW55KXtcclxuICAgIC8vIENvbnZlcnQgdGhlIG9iamVjdCB0byBhIEpTT04gc3RyaW5nXHJcbiAgICBjb25zdCBqc29uRGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpOyAvLyBUaGUgbGFzdCB0d28gYXJndW1lbnRzIGFyZSBmb3IgZm9ybWF0dGluZyAoaW5kZW50YXRpb24pXHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmxvYiBmcm9tIHRoZSBKU09OIHN0cmluZ1xyXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtqc29uRGF0YV0sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuIGFuY2hvciBlbGVtZW50XHJcbiAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgbGluay5kb3dubG9hZCA9IFwiZGlhZ3JhbS5qc29uXCI7IC8vIFNldCB0aGUgZmlsZW5hbWVcclxuXHJcbiAgICAvLyBBcHBlbmQgdGhlIGxpbmsgdG8gdGhlIGJvZHkgKGl0IG11c3QgYmUgaW4gdGhlIGRvY3VtZW50IHRvIGJlIGNsaWNrYWJsZSlcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XHJcblxyXG4gICAgLy8gUHJvZ3JhbW1hdGljYWxseSBjbGljayB0aGUgbGluayB0byB0cmlnZ2VyIHRoZSBkb3dubG9hZFxyXG4gICAgbGluay5jbGljaygpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwOiByZW1vdmUgdGhlIGxpbmsgYW5kIHJldm9rZSB0aGUgb2JqZWN0IFVSTFxyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcclxuICAgIFVSTC5yZXZva2VPYmplY3RVUkwobGluay5ocmVmKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJldmVudERlZmF1bHRzKGV2OkRyYWdFdmVudCkge1xyXG4gICAgZXYucHJldmVudERlZmF1bHQoKTsgXHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYWdEcm9wKGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50KXtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChldiA6IERyYWdFdmVudCk9PntcclxuICAgICAgICBwcmV2ZW50RGVmYXVsdHMoZXYpO1xyXG4gICAgICAgIG1zZyhcImRyYWcgZW50ZXJcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldiA6IERyYWdFdmVudCk9PntcclxuICAgICAgICBwcmV2ZW50RGVmYXVsdHMoZXYpO1xyXG4gICAgICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdkcmFnb3ZlcicpXHJcblxyXG4gICAgICAgIG1zZyhcImRyYWcgb3ZlclwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIChldiA6IERyYWdFdmVudCk9PntcclxuICAgICAgICBwcmV2ZW50RGVmYXVsdHMoZXYpO1xyXG4gICAgICAgIGNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnb3ZlcicpO1xyXG4gICAgICAgIG1zZyhcImRyYWcgbGVhdmVcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgYXN5bmMgKGV2IDogRHJhZ0V2ZW50KT0+e1xyXG4gICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcblxyXG4gICAgICAgIG1zZyhcImRyb3BcIik7XHJcbiAgICAgICAgY29uc3QgZHQgPSBldi5kYXRhVHJhbnNmZXI7XHJcbiAgICAgICAgaWYoZHQgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbGVzID0gQXJyYXkuZnJvbShkdC5maWxlcyk7XHJcblxyXG4gICAgICAgIG1zZyhgJHtmaWxlc31gKTtcclxuXHJcbiAgICAgICAgaWYoZmlsZXMubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZmlsZXNbMF07XHJcblxyXG4gICAgICAgICAgICBtc2coYEZpbGUgbmFtZTogJHtmaWxlLm5hbWV9LCBGaWxlIHNpemU6ICR7ZmlsZS5zaXplfSwgRmlsZSB0eXBlOiAke2ZpbGUudHlwZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gYXN5bmMoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0gcmVhZGVyLnJlc3VsdCBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvYmogID0gSlNPTi5wYXJzZShqc29uKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoQXJyYXkuaXNBcnJheShvYmopKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtc2coYGRyb3BwZWQ6WyR7SlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMil9XWApO1xyXG4gICAgICAgICAgICAgICAgbG9hZEpzb24ob2JqIGFzIGFueVtdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXBhaW50X2NvdW50ID0gcmVwYWludENvdW50O1xyXG4gICAgICAgICAgICAgICAgQ2FudmFzLm9uZS5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcG9ydCBwb3NpdGlvbnMgYXJlIHNldCBvbiBwYWluZy5cclxuICAgICAgICAgICAgICAgIC8vIGVkZ2VzIGNhbiBiZSBkcmF3biBhZnRlciBwb3J0IHBvc2l0aW9uIHNldHRpbmdzLlxyXG4gICAgICAgICAgICAgICAgd2hpbGUocmVwYWludF9jb3VudCA9PSByZXBhaW50Q291bnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBpbnB1dCBlbGVtZW50cyBpbiBibG9ja3MuXHJcbiAgICAgICAgICAgICAgICBNYWluLm9uZS5lZGl0b3IuYmxvY2tzLmZvckVhY2goeCA9PiB4LnNldFBvc2l0aW9uKHgucG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIENhbnZhcy5vbmUucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7ICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH0pOyAgICBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVKc29uKCl7XHJcbiAgICBsZXQgcG9ydF9pZHggPSAwO1xyXG5cclxuICAgIGNvbnN0IGJsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3M7XHJcbiAgICBmb3IoY29uc3QgW2lkeCwgYmxvY2tdIG9mIGJsb2Nrcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgIGJsb2NrLmlkeCA9IGlkeDtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IHBvcnQgb2YgYmxvY2sucG9ydHMpe1xyXG4gICAgICAgICAgICBwb3J0LmlkeCA9IHBvcnRfaWR4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGpzb24gPSBibG9ja3MubWFwKHggPT4geC5tYWtlT2JqKCkpO1xyXG4gICAgZG93bmxvYWRKc29uKGpzb24pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkSnNvbihvYmpzOmFueVtdKXtcclxuICAgIGNvbnN0IGJsb2NrX21hcCA9IG5ldyBNYXA8bnVtYmVyLCBCbG9jaz4oKTtcclxuICAgIGNvbnN0IHBvcnRfbWFwID0gbmV3IE1hcDxudW1iZXIsIFBvcnQ+KCk7XHJcblxyXG4gICAgZm9yKGNvbnN0IG9iaiBvZiBvYmpzKXtcclxuICAgICAgICBtc2coYGJsb2NrOlske29iai50eXBlTmFtZX1dYCk7XHJcbiAgICAgICAgY29uc3QgYmxvY2sgPSBtYWtlQmxvY2tCeVR5cGVOYW1lKG9iai50eXBlTmFtZSk7XHJcbiAgICAgICAgYmxvY2subG9hZE9iaihvYmopO1xyXG5cclxuICAgICAgICBibG9jay5pZHggICAgICAgID0gb2JqLmlkeDtcclxuICAgICAgICBibG9jay5wb3NpdGlvbi54ID0gb2JqLng7XHJcbiAgICAgICAgYmxvY2sucG9zaXRpb24ueSA9IG9iai55O1xyXG4gICAgICAgIGJsb2NrLnNldE1pblNpemUoKTtcclxuICAgICAgICBibG9jay5ib3hTaXplID0gYmxvY2subWluU2l6ZSEuY29weSgpO1xyXG5cclxuICAgICAgICBibG9ja19tYXAuc2V0KGJsb2NrLmlkeCwgYmxvY2spO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgW3BvcnRfaWR4LCBwb3J0X29ial0gb2Ygb2JqLnBvcnRzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcnQgPSBibG9jay5wb3J0c1twb3J0X2lkeF07XHJcbiAgICAgICAgICAgIHBvcnQuaWR4ID0gcG9ydF9vYmouaWR4O1xyXG5cclxuICAgICAgICAgICAgcG9ydF9tYXAuc2V0KHBvcnQuaWR4LCBwb3J0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE1haW4ub25lLmVkaXRvci5hZGRCbG9jayhibG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKGNvbnN0IG9iaiBvZiBvYmpzKXtcclxuICAgICAgICBjb25zdCBibG9jayA9IGJsb2NrX21hcC5nZXQob2JqLmlkeCkhO1xyXG4gICAgICAgIGFzc2VydChibG9jayAhPSB1bmRlZmluZWQpO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgW3BvcnRfaWR4LCBwb3J0X29ial0gb2Ygb2JqLnBvcnRzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcnQgPSBibG9jay5wb3J0c1twb3J0X2lkeF07XHJcblxyXG4gICAgICAgICAgICBmb3IoY29uc3QgZHN0X3BvcnRfaWR4IG9mIHBvcnRfb2JqLmRlc3RpbmF0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkc3RfcG9ydCA9IHBvcnRfbWFwLmdldChkc3RfcG9ydF9pZHgpITtcclxuICAgICAgICAgICAgICAgIGFzc2VydChkc3RfcG9ydCAhPSB1bmRlZmluZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBvcnQuY29ubmVjdChkc3RfcG9ydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gTWFpbi5vbmUuY2FudmFzO1xyXG4gICAgc2V0Q29udGV4dDJEKGNhbnZhcy5jdHgsIGNhbnZhcy5yb290KTtcclxufVxyXG59IiwibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmVzdEJsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgaW5uZXJCbG9jaygpIDogQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBwb3J0IDogUG9ydDtcclxuXHJcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIElmQmxvY2spe1xyXG4gICAgICAgICAgICBwb3J0ID0gdGhpcy50cnVlUG9ydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgSW5maW5pdGVMb29wKXtcclxuICAgICAgICAgICAgcG9ydCA9IHRoaXMubG9vcFBvcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3NlcnQocG9ydC50eXBlID09IFBvcnRUeXBlLmJvdHRvbSk7XHJcblxyXG4gICAgICAgIGlmKHBvcnQuZGVzdGluYXRpb25zLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIHBvcnQuZGVzdGluYXRpb25zWzBdLnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5uZXJCbG9ja3NIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IDA7XHJcblxyXG4gICAgICAgIGZvcihsZXQgYmxvY2sgPSB0aGlzLmlubmVyQmxvY2soKTsgYmxvY2sgIT0gdW5kZWZpbmVkOyBibG9jayA9IGJsb2NrLm5leHRCbG9jaygpKXtcclxuICAgICAgICAgICAgaWYoaGVpZ2h0ICE9IDApe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IC09IG5vdGNoUmFkaXVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gYmxvY2suY2FsY0hlaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihoZWlnaHQgIT0gMCl7XHJcbiAgICAgICAgICAgIG1zZyhgaW5uZXIgYmxvY2tzIGlkOiR7dGhpcy5pZHh9IGg6JHtoZWlnaHR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDE1MCwgbmVzdF9oMTIzKTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBibG9jayA9IHRoaXMuaW5uZXJCbG9jaygpOyBibG9jayAhPSB1bmRlZmluZWQ7IGJsb2NrID0gYmxvY2submV4dEJsb2NrKCkpe1xyXG4gICAgICAgICAgICBibG9jay5zZXRNaW5TaXplKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1pblNpemUueSArPSB0aGlzLmlubmVyQmxvY2tzSGVpZ2h0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY0hlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gbmVzdF9oMTIzICsgdGhpcy5pbm5lckJsb2Nrc0hlaWdodCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSWZCbG9jayBleHRlbmRzIE5lc3RCbG9jayB7ICAgXHJcbiAgICB0b3BQb3J0ICAgICAgID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUudG9wKTtcclxuICAgIGJvdHRvbVBvcnQgICAgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pO1xyXG4gICAgdHJ1ZVBvcnQgICAgICA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmJvdHRvbSk7XHJcblxyXG4gICAgY29uZGl0aW9uUG9ydCA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICB0aGlzLnRvcFBvcnQsIFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbVBvcnQsIFxyXG4gICAgICAgICAgICB0aGlzLnRydWVQb3J0LFxyXG4gICAgICAgICAgICB0aGlzLmNvbmRpdGlvblBvcnRcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVHJ1ZSgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uUG9ydC52YWx1ZSA9PSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHRydWVCbG9jaygpIDogQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyQmxvY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyAzNTtcclxuICAgICAgICBjb25zdCB4MyA9IHgyICsgMzU7XHJcbiAgICAgICAgY29uc3QgeDQgPSB4MSArIHRoaXMubWluU2l6ZSEueDtcclxuXHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIG5lc3RfaDE7XHJcbiAgICAgICAgY29uc3QgeTMgPSB5MiArIG5lc3RfaDIgKyB0aGlzLmlubmVyQmxvY2tzSGVpZ2h0KCk7XHJcbiAgICAgICAgY29uc3QgeTQgPSB5MyArIG5lc3RfaDMgLSBub3RjaFJhZGl1cztcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZHJhd091dGxpbmUoW1xyXG4gICAgICAgICAgICAvLyBsZWZ0IHRvcFxyXG4gICAgICAgICAgICBbeDEsIHkxLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIC8vIGxlZnQgYm90dG9tXHJcbiAgICAgICAgICAgIFt4MSwgeTQsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgLy8gYm90dG9tIG5vdGNoXHJcbiAgICAgICAgICAgIFt4MiwgeTQsIHRoaXMuYm90dG9tUG9ydF0sXHJcblxyXG4gICAgICAgICAgICAvLyByaWdodCBib3R0b21cclxuICAgICAgICAgICAgW3g0LCB5NCwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDQsIHkzLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MywgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDIsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIC8vIGxvb3Agbm90Y2hcclxuICAgICAgICAgICAgW3gzLCB5MiwgdGhpcy50cnVlUG9ydF0sXHJcbiAgICAgICAgICAgIFt4NCwgeTIsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgLy8gcmlnaHQgdG9wXHJcbiAgICAgICAgICAgIFt4NCwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgLy8gdG9wIG5vdGNoXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIHRoaXMudG9wUG9ydF1cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25kaXRpb25Qb3J0LmRyYXdQb3J0KHRoaXMuY3R4LCB4NCAtIFBvcnQucmFkaXVzLCAwLjUgKiAoeTEgKyB5MikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIGNvbnN0IHRydWVfYmxvY2sgPSB0aGlzLnRydWVCbG9jaygpO1xyXG4gICAgICAgIGlmKHRydWVfYmxvY2sgIT0gdW5kZWZpbmVkICYmIHRoaXMuaXNUcnVlKCkpe1xyXG4gICAgICAgICAgICBhd2FpdCBydW5CbG9ja0NoYWluKHRydWVfYmxvY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEluZmluaXRlTG9vcCBleHRlbmRzIE5lc3RCbG9jayB7XHJcbiAgICB0b3BQb3J0ICA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCk7XHJcbiAgICBsb29wUG9ydCA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmJvdHRvbSk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICB0aGlzLnRvcFBvcnQsIFxyXG4gICAgICAgICAgICB0aGlzLmxvb3BQb3J0IFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgbG9vcEJsb2NrKCkgOiBCbG9jayB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDIgKyAzNTtcclxuICAgICAgICBjb25zdCB4NCA9IHgxICsgdGhpcy5taW5TaXplIS54O1xyXG5cclxuICAgICAgICBjb25zdCB5MiA9IHkxICsgbmVzdF9oMTtcclxuICAgICAgICBjb25zdCB5MyA9IHkyICsgbmVzdF9oMiArIHRoaXMuaW5uZXJCbG9ja3NIZWlnaHQoKTtcclxuICAgICAgICBjb25zdCB5NCA9IHkzICsgbmVzdF9oMztcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZHJhd091dGxpbmUoW1xyXG4gICAgICAgICAgICBbeDEsIHkxLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MSwgeTQsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDQsIHk0LCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4NCwgeTMsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkzLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDMsIHkyLCB0aGlzLmxvb3BQb3J0XSxcclxuICAgICAgICAgICAgW3g0LCB5MiwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDQsIHkxLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MSwgdGhpcy50b3BQb3J0XVxyXG4gICAgICAgIF0pXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCl7XHJcbiAgICAgICAgY29uc3QgbG9vcF9ibG9jayA9IHRoaXMubG9vcEJsb2NrKCk7XHJcbiAgICAgICAgaWYobG9vcF9ibG9jayAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB3aGlsZSh0cnVlKXtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHJ1bkJsb2NrQ2hhaW4obG9vcF9ibG9jayk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoc3RvcEZsYWcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbn0iXX0=