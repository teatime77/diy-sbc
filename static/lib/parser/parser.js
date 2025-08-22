"use strict";
var parser_ts;
(function (parser_ts) {
    let TokenType;
    (function (TokenType) {
        TokenType[TokenType["unknown"] = 0] = "unknown";
        // 識別子
        TokenType[TokenType["identifier"] = 1] = "identifier";
        // クラス
        TokenType[TokenType["Class"] = 2] = "Class";
        // 数値
        TokenType[TokenType["Number"] = 3] = "Number";
        // 記号
        TokenType[TokenType["symbol"] = 4] = "symbol";
        // 予約語
        TokenType[TokenType["reservedWord"] = 5] = "reservedWord";
        // #n.m
        TokenType[TokenType["path"] = 6] = "path";
        // End Of Text
        TokenType[TokenType["eot"] = 7] = "eot";
        // 指定なし
        TokenType[TokenType["any"] = 8] = "any";
        // 行コメント
        TokenType[TokenType["lineComment"] = 9] = "lineComment";
        // ブロックコメント
        TokenType[TokenType["blockComment"] = 10] = "blockComment";
        // 改行
        TokenType[TokenType["newLine"] = 11] = "newLine";
        // 文字列
        TokenType[TokenType["String"] = 12] = "String";
        // 文字
        TokenType[TokenType["character"] = 13] = "character";
        // 不正
        TokenType[TokenType["illegal"] = 14] = "illegal";
    })(TokenType = parser_ts.TokenType || (parser_ts.TokenType = {}));
    var SymbolTable = new Array(",", ";", "(", ")", "[", "]", "{", "}", "+", "-", "*", "/", "^", "%", "=", ":", "<", ">", "$", "==", "!=", "<=", ">=", "$$", "&&", "||", "=>", "⇔", "+=", "-=", "*=", "/=", "%=", "++", "--", "!", "&", "|", "?");
    var KeywordMap = new Set([
        "let"
    ]);
    var IdList = new Array();
    function isLetter(s) {
        return s.length === 1 && ("a" <= s && s <= "z" || "A" <= s && s <= "Z" || s == "_");
    }
    parser_ts.isLetter = isLetter;
    function isDigit(s) {
        return s.length == 1 && "0123456789".indexOf(s) != -1;
    }
    function isIdLetter(s) {
        return isLetter(s) || isDigit(s);
    }
    function isLetterOrAt(s) {
        return isLetter(s[0]) || 2 <= s.length && s[0] == "@" && isLetter(s[1]);
    }
    parser_ts.isLetterOrAt = isLetterOrAt;
    let TokenSubType;
    (function (TokenSubType) {
        TokenSubType[TokenSubType["unknown"] = 0] = "unknown";
        TokenSubType[TokenSubType["integer"] = 1] = "integer";
        TokenSubType[TokenSubType["float"] = 2] = "float";
        TokenSubType[TokenSubType["double"] = 3] = "double";
    })(TokenSubType = parser_ts.TokenSubType || (parser_ts.TokenSubType = {}));
    class Token {
        typeTkn;
        subType;
        text;
        charPos;
        constructor(type, sub_type, text, char_pos) {
            //console.log("" + TokenType[type] + " " + TokenSubType[sub_type] + " " + text + " " + char_pos);
            this.typeTkn = type;
            this.subType = sub_type;
            this.text = text;
            this.charPos = char_pos;
        }
    }
    parser_ts.Token = Token;
    function lexicalAnalysis(text) {
        const tokens = [];
        // 現在の文字位置
        let pos = 0;
        while (pos < text.length) {
            // 改行以外の空白をスキップします。
            for (; pos < text.length && (text[pos] == ' ' || text[pos] == '\t' || text[pos] == '\r'); pos++)
                ;
            if (text.length <= pos) {
                // テキストの終わりの場合
                break;
            }
            const start_pos = pos;
            var token_type = TokenType.unknown;
            var sub_type = TokenSubType.unknown;
            // 現在位置の文字
            var ch1 = text[pos];
            // 次の文字の位置。行末の場合は'\0'
            var ch2;
            if (pos + 1 < text.length) {
                // 行末でない場合
                ch2 = text[pos + 1];
            }
            else {
                // 行末の場合
                ch2 = '\0';
            }
            if (ch1 == '\n') {
                token_type = TokenType.newLine;
                pos++;
            }
            else if (isLetterOrAt(ch1 + ch2)) {
                // 識別子の最初の文字の場合
                // 識別子の文字の最後を探します。識別子の文字はユニコードカテゴリーの文字か数字か'_'。
                for (pos++; pos < text.length && isIdLetter(text[pos]); pos++)
                    ;
                // 識別子の文字列
                var name = text.substring(start_pos, pos);
                if (KeywordMap.has(name)) {
                    // 名前がキーワード辞書にある場合
                    token_type = TokenType.reservedWord;
                }
                else {
                    // 名前がキーワード辞書にない場合
                    if (IdList.indexOf(name) == -1) {
                        IdList.push(name);
                    }
                    token_type = TokenType.identifier;
                }
            }
            else if (isDigit(ch1)) {
                // 数字の場合
                token_type = TokenType.Number;
                // 10進数の終わりを探します。
                for (; pos < text.length && isDigit(text[pos]); pos++)
                    ;
                if (pos < text.length && text[pos] == '.') {
                    // 小数点の場合
                    pos++;
                    // 10進数の終わりを探します。
                    for (; pos < text.length && isDigit(text[pos]); pos++)
                        ;
                    sub_type = TokenSubType.float;
                }
                else {
                    sub_type = TokenSubType.integer;
                }
            }
            else if (ch1 == "#") {
                token_type = TokenType.path;
                for (pos++; pos < text.length && (isDigit(text[pos]) || text[pos] == '-' || text[pos] == parser_ts.pathSep); pos++)
                    ;
            }
            else if (ch1 == '"') {
                token_type = TokenType.String;
                pos = text.indexOf('"', pos + 1);
                parser_ts.assert(pos != -1);
                pos++;
            }
            else if (SymbolTable.indexOf("" + ch1 + ch2) != -1) {
                // 2文字の記号の表にある場合
                token_type = TokenType.symbol;
                pos += 2;
            }
            else if (SymbolTable.indexOf("" + ch1) != -1) {
                // 1文字の記号の表にある場合
                token_type = TokenType.symbol;
                pos++;
            }
            else {
                // 不明の文字の場合
                token_type = TokenType.unknown;
                pos++;
                console.log("不明 {0}", text.substring(start_pos, pos), "");
            }
            // 字句の文字列を得ます。
            var word;
            if (token_type == TokenType.String) {
                word = text.substring(start_pos + 1, pos - 1);
            }
            else {
                word = text.substring(start_pos, pos);
            }
            const token = new Token(token_type, sub_type, word, start_pos);
            // msg(`${token.charPos} [${token.text}] ${token.typeTkn} ${token.subType}`);
            tokens.push(token);
        }
        return tokens;
    }
    parser_ts.lexicalAnalysis = lexicalAnalysis;
})(parser_ts || (parser_ts = {}));
var parser_ts;
(function (parser_ts) {
    parser_ts.termDic = {};
    parser_ts.pathSep = ":";
    parser_ts.variables = [];
    function isShapeName(name) {
        const names = [
            "Point", "Circle", "Arc", "Triangle",
            "LineByPoints", "HalfLine", "Line",
            "Intersection", "Foot", "Angle", "Parallel", "Thumb"
        ];
        return names.includes(name);
    }
    parser_ts.isShapeName = isShapeName;
    function isSystemName(name) {
        const names = [
            "range",
            "sqrt",
            "length"
        ];
        return isShapeName(name) || names.includes(name);
    }
    parser_ts.isSystemName = isSystemName;
    function isRelationToken(text) {
        return ["==", "=", "!=", "<", ">", "<=", ">=", "in", "notin", "subset"].includes(text);
    }
    parser_ts.isRelationToken = isRelationToken;
    function isArithmeticToken(text) {
        return ["cup", "cap"].includes(text);
    }
    function getVariable(name) {
        const va = parser_ts.variables.find(x => x.name == name);
        parser_ts.assert(va != undefined);
        return va;
    }
    parser_ts.getVariable = getVariable;
    function Zero() {
        return new ConstNum(0);
    }
    parser_ts.Zero = Zero;
    function actionRef(name) {
        return new RefVar(name);
    }
    parser_ts.actionRef = actionRef;
    function parseMath(text) {
        // msg(`parse-Math:[${text}]`);
        const parser = new Parser(text);
        const trm = parser.RootExpression();
        if (parser.token.typeTkn != parser_ts.TokenType.eot) {
            throw new parser_ts.SyntaxError();
        }
        trm.setParent(null);
        return trm;
    }
    parser_ts.parseMath = parseMath;
    function setRefVars(root) {
        const all_refs = allTerms(root).filter(x => x instanceof RefVar && parser_ts.isLetter(x.name[0]) && !isSystemName(x.name));
        for (const ref of all_refs) {
            ref.refVar = parser_ts.variables.find(x => x.name == ref.name);
            parser_ts.assert(ref.refVar != undefined);
        }
    }
    parser_ts.setRefVars = setRefVars;
    function isGreek(text) {
        parser_ts.assert(typeof text == "string");
        if (text.length == 0) {
            return false;
        }
        const greeks = [
            "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta",
            "vartheta", "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "varpi", "rho", "varrho",
            "sigma", "varsigma", "tau", "upsilon", "phi", "varphi", "chi", "psi", "omega"
        ];
        if (greeks.includes(text)) {
            return true;
        }
        const lower_case = text[0].toLowerCase() + text.substring(1);
        if (greeks.includes(lower_case)) {
            return true;
        }
        return false;
    }
    parser_ts.isGreek = isGreek;
    function texName(text) {
        switch (text) {
            case "==": return "=";
            case "!=": return "\\ne";
            case "<": return "\\lt";
            case ">": return "\\gt";
            case "<=": return "\\le";
            case ">=": return "\\ge";
            case "*": return "\\cdot";
            case "=>": return "\\implies";
            case "&&": return "\\land";
            case "||": return "\\lor";
            case "hbar": return "\\hbar";
            case "nabla": return "\\nabla";
            case "nabla2": return "\\nabla^2";
            case "subset": return "\\subseteq";
            case "infty": return "\\infty";
            case "cup":
            case "cap":
            case "sin":
            case "cos":
            case "tan":
            case "in":
            case "notin":
                return `\\${text}`;
        }
        if (isGreek(text)) {
            return `\\${text}`;
        }
        return text;
    }
    parser_ts.texName = texName;
    let termId = 0;
    class Rational {
        numerator = 1;
        denominator = 1;
        parent = null;
        constructor(numerator, denominator = 1) {
            this.numerator = numerator;
            this.denominator = denominator;
        }
        eq(r) {
            return (this.numerator == r.numerator && this.denominator == r.denominator);
        }
        is(numerator, denominator = 1) {
            return (this.numerator == numerator && this.denominator == denominator);
        }
        set(numerator, denominator = 1) {
            this.numerator = numerator;
            this.denominator = denominator;
        }
        clone() {
            return new Rational(this.numerator, this.denominator);
        }
        str() {
            if (this.denominator == 1) {
                return `${this.numerator}`;
            }
            else {
                return `${this.numerator} / ${this.denominator}`;
            }
        }
        tex() {
            if (this.denominator == 1) {
                return `${this.numerator}`;
            }
            else {
                return `\\frac{${this.numerator}}{${this.denominator}}`;
            }
        }
        addRational(r) {
            const old_fval = this.fval();
            this.numerator = this.numerator * r.denominator + r.numerator * this.denominator;
            this.denominator *= r.denominator;
            parser_ts.assert(Math.abs(old_fval + r.fval() - this.fval()) < 0.00000001);
        }
        setmul(...rs) {
            this.numerator *= rs.reduce((acc, cur) => acc * cur.numerator, 1);
            this.denominator *= rs.reduce((acc, cur) => acc * cur.denominator, 1);
        }
        setdiv(r) {
            this.numerator *= r.denominator;
            this.denominator *= r.numerator;
        }
        fval() {
            return this.numerator / this.denominator;
        }
        abs() {
            return Math.abs(this.fval());
        }
        setAbs() {
            this.numerator = Math.abs(this.numerator);
            this.denominator = Math.abs(this.denominator);
        }
        isInt() {
            return this.denominator == 1;
        }
        isDivisor(r) {
            const numerator = r.numerator * this.denominator;
            const denominator = r.denominator * this.numerator;
            return numerator % denominator == 0;
        }
        int() {
            parser_ts.assert(this.denominator == 1);
            return this.numerator;
        }
        sign() {
            return Math.sign(this.fval());
        }
        changeSign() {
            this.numerator *= -1;
        }
    }
    parser_ts.Rational = Rational;
    class Term {
        static tabIdxCnt = 0;
        id;
        tabIdx = 0;
        parent = null;
        cloneFrom;
        // 係数
        value = new Rational(1);
        canceled = false;
        colorName;
        hash = 0n;
        constructor() {
            this.id = termId++;
            this.value.parent = this;
        }
        uncolor() {
            this.colorName = undefined;
        }
        red() {
            this.colorName = "red";
        }
        blue() {
            this.colorName = "blue";
        }
        colored() {
            return this.colorName != undefined;
        }
        eq(trm) {
            return this.str() == trm.str();
        }
        equal(trm) {
            return this.value.eq(trm.value);
        }
        copy(dst) {
            dst.cloneFrom = this;
            dst.value = this.value.clone();
            dst.value.parent = dst;
            dst.canceled = this.canceled;
            dst.colorName = this.colorName;
        }
        changeSign() {
            this.value.changeSign();
        }
        /**
         *
         * @returns コピーしたルートと、thisと同じ位置の項を返す。
         */
        cloneRoot() {
            // ルートからthisに至るパスを得る。
            const path = this.getPath();
            // ルートを得る。
            const root = this.getRoot();
            parser_ts.assert(path.getTerm(root) == this);
            // ルートをコピーする。
            const root_cp = root.clone();
            // コピーしたルートから同じパスを辿って項を得る。
            const this_cp = path.getTerm(root_cp);
            parser_ts.assert(this_cp.str() == this.str());
            // コピーしたルートと、thisと同じ位置の項を返す。
            return [root_cp, this_cp];
        }
        getPath(path = new Path([])) {
            if (this.parent == null) {
                return path;
            }
            let idx;
            if (this.parent.fnc == this) {
                idx = -1;
            }
            else {
                idx = this.argIdx();
            }
            path.indexes.unshift(idx);
            return this.parent.getPath(path);
        }
        getRoot() {
            if (this.parent == null) {
                if (this instanceof App) {
                    return this;
                }
                parser_ts.assert(false);
            }
            return this.parent.getRoot();
        }
        getRootEqSideIdx() {
            for (let term = this; term.parent != null; term = term.parent) {
                if (term.parent.isRootEq()) {
                    return term.argIdx();
                }
            }
            throw new parser_ts.MyError();
        }
        getEqSide() {
            for (let term = this; term.parent != null; term = term.parent) {
                if (term.parent.isRootEq()) {
                    return term;
                }
            }
            return null;
        }
        setParent(parent) {
            this.parent = parent;
            this.value.parent = this;
        }
        setTabIdx() {
            this.tabIdx = ++Term.tabIdxCnt;
        }
        verifyParent(parent) {
            parser_ts.assert(this.parent == parent);
            parser_ts.assert(this.value.parent == this);
        }
        verifyParent2() {
            this.verifyParent(this.parent);
        }
        replaceTerm(target) {
            const app = this.parent;
            parser_ts.assert(app != null, "replace");
            if (app.fnc == this) {
                app.fnc = target;
            }
            else {
                const idx = app.args.findIndex(x => x == this);
                parser_ts.assert(idx != -1, "replace idx");
                app.args[idx] = target;
            }
            target.parent = app;
        }
        argIdx() {
            if (this.parent == null) {
                throw new parser_ts.MyError();
            }
            const idx = this.parent.args.indexOf(this);
            parser_ts.assert(idx != -1, "arg idx");
            return idx;
        }
        argShift(diff) {
            const idx = this.argIdx();
            const parent = this.parent;
            parent.args.splice(idx, 1);
            parent.args.splice(idx + diff, 0, this);
        }
        remArg() {
            if (this.parent == null) {
                throw new parser_ts.MyError();
            }
            const idx = this.argIdx();
            this.parent.args.splice(idx, 1);
            if (this.parent.args.length == 1) {
                // this.parent.oneArg();
            }
        }
        putValue(text, in_tex) {
            let val;
            if (this instanceof ConstNum) {
                val = text;
            }
            else {
                parser_ts.assert(this.value instanceof Rational);
                if (this.value.fval() == 1) {
                    val = text;
                }
                else if (this.value.fval() == -1) {
                    if (this.isAdd()) {
                        val = `- (${text})`;
                    }
                    else {
                        val = `- ${text}`;
                    }
                }
                else if (this.value.denominator == 1) {
                    const opr = (in_tex ? "\\cdot" : "*");
                    if (this.isAdd()) {
                        val = `${this.value.numerator} ${opr} (${text})`;
                    }
                    else {
                        val = `${this.value.numerator} ${opr} ${text}`;
                    }
                }
                else {
                    throw new parser_ts.MyError();
                }
            }
            if (this.parent != null && this != this.parent.fnc && this.parent.isAdd()) {
                const idx = this.argIdx();
                if (idx != 0) {
                    if (0 <= this.value.fval()) {
                        val = "+ " + val;
                    }
                }
            }
            if (in_tex) {
                if (this.colored()) {
                    return `{\\color{${this.colorName}} ${val}}`;
                }
                if (this.canceled) {
                    return `\\cancel{${val}}`;
                }
            }
            return val;
        }
        str2() {
            parser_ts.assert(false, "str2");
            return "";
        }
        str() {
            return this.strX();
        }
        strX() {
            const text = this.str2();
            return this.putValue(text, false);
        }
        htmldata(text) {
            parser_ts.termDic[this.id] = this;
            return `\\htmlData{id=${this.id}, tabidx=${this.tabIdx}}{${text}}`;
        }
        tex() {
            let text = this.tex2();
            if (this.colored()) {
                text = `{\\color{${this.colorName}} ${this.putValue(text, true)}}`;
                // return this.htmldata(this.putValue(text, true));
            }
            else {
                text = this.putValue(text, true);
            }
            if (this instanceof ConstNum || this instanceof RefVar || this instanceof App) {
                text = `\\htmlId{tex-term-${this.id}}{${text}}`;
            }
            return text;
        }
        isApp(fnc_name) {
            return this instanceof App && this.fncName == fnc_name;
        }
        isOperator() {
            return this instanceof App && this.precedence() != -1;
        }
        isNamedFnc() {
            return this instanceof RefVar && parser_ts.isLetter(this.name[0]);
        }
        isOprFnc() {
            return this instanceof RefVar && !parser_ts.isLetter(this.name[0]);
        }
        isEq() {
            return this instanceof App && (this.fncName == "==" || this.fncName == "=");
        }
        isRootEq() {
            return this.isEq() && this.parent == null;
        }
        isList() {
            return this instanceof App && this.fncName == "[]";
        }
        isAdd() {
            return this instanceof App && this.fncName == "+";
        }
        isMul() {
            return this instanceof App && this.fncName == "*";
        }
        isDiv() {
            return this instanceof App && this.fncName == "/";
        }
        isDot() {
            return this instanceof App && this.fncName == ".";
        }
        isSqrt() {
            return this instanceof App && this.fncName == "sqrt";
        }
        isZero() {
            return this.value.numerator == 0;
        }
        isValue(n) {
            return this instanceof ConstNum && this.value.fval() == n;
        }
        isOne() {
            return this.isValue(1);
        }
        isInt() {
            return this instanceof ConstNum && this.value.isInt();
        }
        isE() {
            return this instanceof RefVar && this.name == "e";
        }
        isI() {
            return this instanceof RefVar && this.name == "i";
        }
        isDiff() {
            return this instanceof App && (this.fncName == "diff" || this.fncName == "pdiff");
        }
        isLim() {
            return this instanceof App && this.fncName == "lim";
        }
        dividend() {
            parser_ts.assert(this.isDiv());
            return this.args[0];
        }
        divisor() {
            parser_ts.assert(this.isDiv());
            return this.args[1];
        }
        depend(dvar) {
            return allTerms(this).some(x => dvar.eq(x));
        }
        calc() {
            if (this instanceof Rational) {
                return this.fval();
            }
            else if (this instanceof ConstNum) {
                return this.value.fval();
            }
            else if (this instanceof RefVar) {
                const data = this.refVar.expr;
                if (data instanceof Term) {
                    return data.calc();
                }
                else {
                    throw new parser_ts.MyError("unimplemented");
                }
            }
            else if (this instanceof App) {
                const app = this;
                if (app.isApp("sqrt")) {
                    parser_ts.assert(app.args.length == 1);
                    return Math.sqrt(app.args[0].calc());
                }
                else {
                    throw new parser_ts.MyError("unimplemented");
                }
            }
            throw new parser_ts.MyError("unimplemented");
        }
        copyValue(cns) {
            parser_ts.assert(this instanceof ConstNum);
            this.value.set(cns.value.numerator, cns.value.denominator);
        }
        dmpTerm(nest) {
            if (this instanceof App) {
                parser_ts.msg(`${nest}${this.id}`);
                this.fnc.dmpTerm(nest + "\t");
                this.args.forEach(x => x.dmpTerm(nest + "\t"));
            }
            else {
                parser_ts.msg(`${nest}${this.id}:${this.str()}`);
            }
        }
        getAllTerms(terms) {
            terms.push(this);
            if (this instanceof App) {
                this.fnc.getAllTerms(terms);
                this.args.forEach(x => x.getAllTerms(terms));
            }
        }
        includesTerm(term) {
            if (this instanceof App) {
                return this.allTerms().includes(term);
            }
            else {
                return this == term;
            }
        }
    }
    parser_ts.Term = Term;
    class Path extends Term {
        indexes = [];
        constructor(indexes) {
            super();
            this.indexes = indexes.slice();
        }
        equal(trm) {
            return super.equal(trm) && trm instanceof Path && parser_ts.range(this.indexes.length).every(i => this.indexes[i] == trm.indexes[i]);
        }
        strid() {
            throw new parser_ts.MyError();
        }
        strX() {
            return `#${this.indexes.join(parser_ts.pathSep)}`;
        }
        tex2() {
            parser_ts.assert(false, "path:tex2");
            return "";
        }
        clone() {
            const path = new Path(this.indexes);
            this.copy(path);
            return path;
        }
        getTerm(root, get_parent = false) {
            if (this.indexes.length == 0) {
                return root;
            }
            let app = root;
            const last_i = (get_parent ? this.indexes.length - 2 : this.indexes.length - 1);
            for (const [i, idx] of this.indexes.entries()) {
                if (i == last_i) {
                    return (idx == -1 ? app.fnc : app.args[idx]);
                }
                else {
                    app = (idx == -1 ? app.fnc : app.args[idx]);
                    parser_ts.assert(app instanceof App, "pass:get term");
                }
            }
            throw new parser_ts.MyError("get term");
        }
    }
    parser_ts.Path = Path;
    class Variable {
        name;
        expr;
        depVars;
        constructor(name, expr) {
            parser_ts.variables.push(this);
            this.name = name;
            this.expr = expr;
            const refs = allTerms(expr).filter(x => x instanceof RefVar && !(x.parent instanceof App && x.parent.fnc == x));
            this.depVars = refs.map(ref => parser_ts.variables.find(v => v.name == ref.name));
            parser_ts.assert(this.depVars.every(x => x != undefined));
            if (this.depVars.length != 0) {
                parser_ts.msg(`${this.name} depends ${this.depVars.map(x => x.name).join(" ")}`);
            }
        }
        rename(new_name) {
            this.name = new_name;
        }
    }
    parser_ts.Variable = Variable;
    class RefVar extends Term {
        name;
        refVar;
        constructor(name) {
            super();
            this.name = name;
        }
        equal(trm) {
            return super.equal(trm) && trm instanceof RefVar && this.name == trm.name;
        }
        strid() {
            if (this.value.is(1)) {
                return `${this.name}`;
            }
            else {
                return `${this.value.str()} ${this.name}`;
            }
        }
        clone() {
            const ref = new RefVar(this.name);
            this.copy(ref);
            return ref;
        }
        str2() {
            return this.name;
        }
        tex2() {
            return texName(this.name);
        }
    }
    parser_ts.RefVar = RefVar;
    class ConstNum extends Term {
        static zero() {
            return new ConstNum(0);
        }
        constructor(numerator, denominator = 1) {
            super();
            this.value = new Rational(numerator, denominator);
        }
        equal(trm) {
            return super.equal(trm);
        }
        strid() {
            return `${this.value.str()}`;
        }
        static fromRational(r) {
            return new ConstNum(r.numerator, r.denominator);
        }
        clone() {
            const cns = new ConstNum(this.value.numerator, this.value.denominator);
            this.copy(cns);
            return cns;
        }
        str2() {
            return this.value.str();
        }
        strX() {
            return this.value.str();
        }
        tex2() {
            return this.value.tex();
        }
    }
    parser_ts.ConstNum = ConstNum;
    class Str extends Term {
        text;
        constructor(text) {
            super();
            this.text = text;
        }
        equal(trm) {
            return trm instanceof Str && trm.text == this.text;
        }
        strid() {
            return `"${this.text}"`;
        }
        clone() {
            return new Str(this.text);
        }
        str2() {
            return this.strid();
        }
        strX() {
            return this.strid();
        }
        tex2() {
            return this.strid();
        }
    }
    parser_ts.Str = Str;
    class App extends Term {
        fnc;
        args;
        remParentheses = false;
        static startEnd = {
            "(": ")",
            "[": "]",
            "{": "}",
        };
        get refVar() {
            if (this.fnc != null && this.fnc instanceof RefVar) {
                return this.fnc;
            }
            else {
                return null;
            }
        }
        get fncName() {
            if (this.fnc instanceof RefVar) {
                return this.fnc.name;
            }
            else {
                return `no-fnc-name`;
            }
        }
        constructor(fnc, args) {
            super();
            this.fnc = fnc;
            this.fnc.parent = this;
            this.args = args.slice();
            this.args.forEach(x => x.parent = this);
        }
        equal(trm) {
            if (super.equal(trm) && trm instanceof App) {
                if (this.fnc.equal(trm.fnc)) {
                    if (this.args.length == trm.args.length) {
                        return parser_ts.range(this.args.length).every(i => this.args[i].equal(trm.args[i]));
                    }
                }
            }
            return false;
        }
        strid() {
            let s;
            if (this.fnc.isOprFnc()) {
                s = "(" + this.args.map(x => x.strid()).join(this.fncName) + ")";
            }
            else {
                s = `${this.fncName}(${this.args.map(x => x.strid()).join(", ")})`;
            }
            if (this.value.is(1)) {
                return s;
            }
            else {
                return `${this.value.str()} ${s}`;
            }
        }
        clone() {
            const app = new App(this.fnc.clone(), this.args.map(x => x.clone()));
            this.copy(app);
            return app;
        }
        setParent(parent) {
            super.setParent(parent);
            this.fnc.setParent(this);
            this.args.forEach(x => x.setParent(this));
        }
        setTabIdx() {
            super.setTabIdx();
            this.fnc.setTabIdx();
            this.args.forEach(x => x.setTabIdx());
        }
        verifyParent(parent) {
            super.verifyParent(parent);
            this.fnc.verifyParent(this);
            this.args.forEach(x => x.verifyParent(this));
        }
        str2() {
            const args = this.args.map(x => x.str());
            let text;
            if (this.fnc instanceof App) {
                const args_s = args.join(", ");
                text = `(${this.fnc.str()})(${args_s})`;
            }
            else if (parser_ts.isLetterOrAt(this.fncName)) {
                const args_s = args.join(", ");
                text = `${this.fncName}(${args_s})`;
            }
            else {
                switch (this.fncName) {
                    case "+":
                        switch (args.length) {
                            case 0: return " +[] ";
                            case 1: return ` +[${args[0]}] `;
                        }
                        text = args.join(` `);
                        break;
                    case "/":
                        if (this.args.length != 2) {
                            throw new parser_ts.MyError();
                        }
                        text = `${args[0]} / ${args[1]}`;
                        break;
                    default:
                        text = args.join(` ${this.fncName} `);
                        break;
                }
            }
            if (this.isOperator() && this.parent != null && this.parent.isOperator()) {
                if (this.parent.precedence() <= this.precedence()) {
                    return `(${text})`;
                }
            }
            return text;
        }
        tex2() {
            const args = this.args.map(x => x.tex());
            let text;
            if (this.fnc instanceof App) {
                const args_s = args.join(", ");
                text = `(${this.fnc.tex()})(${args_s})`;
            }
            else if (this.fncName == "lim") {
                switch (args.length) {
                    case 1:
                        text = `\\lim ${args[0]}`;
                        break;
                    case 3:
                        text = `\\lim_{${args[1]} \\to ${args[2]}} ${args[0]}`;
                        break;
                    default:
                        throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "sum") {
                switch (args.length) {
                    case 1:
                        text = `\\sum ${args[0]}`;
                        break;
                    case 3:
                        text = `\\sum_{${args[1]}}^{${args[2]}} ${args[0]}`;
                        break;
                    case 4:
                        text = `\\sum_{${args[1]}=${args[2]}}^{${args[3]}} ${args[0]}`;
                        break;
                    default:
                        throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "log") {
                if (args.length == 1) {
                    text = `\\log ${args[0]}`;
                }
                else if (args.length == 2) {
                    text = `\\log_{${args[1]}} ${args[0]}`;
                }
                else {
                    throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "{|}") {
                text = `\\{${args[0]} \\mid ${args[1]} \\}`;
            }
            else if (this.fncName == "in") {
                let ids;
                if (this.args[0].isApp(",")) {
                    ids = this.args[0].args.map(x => x.tex()).join(" , ");
                }
                else {
                    ids = args[0];
                }
                text = `${ids} \\in ${args[1]}`;
            }
            else if (this.fncName == "complement") {
                text = `{ ${args[0]} }^c`;
            }
            else if (this.isDiff()) {
                const n = (this.args.length == 3 ? `^{${args[2]}}` : ``);
                const d = (this.fncName == "diff" ? "d" : "\\partial");
                if (this.args.length == 1) {
                    text = `(${args[0]})'`;
                }
                else if (args[0].indexOf("\\frac") == -1) {
                    text = `\\frac{ ${d} ${n} ${args[0]}}{ ${d}  ${args[1]}${n}}`;
                }
                else {
                    text = `\\frac{ ${d} ${n} }{ ${d}  ${args[1]}${n}} (${args[0]})`;
                }
            }
            else if (parser_ts.isLetterOrAt(this.fncName)) {
                if (["sin", "cos", "tan"].includes(this.fncName) && !(this.args[0] instanceof App)) {
                    text = `${texName(this.fncName)} ${args[0]}`;
                }
                else if (this.fncName == "abs") {
                    parser_ts.assert(args.length == 1, "tex2");
                    text = `\\lvert ${args[0]} \\rvert`;
                }
                else if (this.fncName == "sqrt") {
                    parser_ts.assert(args.length == 1, "tex2");
                    text = `\\sqrt{${args[0]}}`;
                }
                else if (this.fncName == "nth_root") {
                    parser_ts.assert(args.length == 2, "tex2");
                    text = `\\sqrt[${args[1]}]{${args[0]}}`;
                }
                else if (isArithmeticToken(this.fncName)) {
                    text = `${args[0]} ${texName(this.fncName)} ${args[1]}`;
                }
                else if (isRelationToken(this.fncName) || isArithmeticToken(this.fncName)) {
                    text = `${args[0]} ${texName(this.fncName)} ${args[1]}`;
                }
                else {
                    const args_s = args.join(", ");
                    text = `${texName(this.fncName)}(${args_s})`;
                }
            }
            else {
                switch (this.fncName) {
                    case "+":
                        switch (args.length) {
                            case 0: return " +[] ";
                            case 1: return ` +[${args[0]}] `;
                        }
                        text = args.join(` `);
                        break;
                    case "/":
                        if (this.args.length != 2) {
                            throw new parser_ts.MyError();
                        }
                        text = `\\frac{${args[0]}}{${args[1]}}`;
                        break;
                    case "^":
                        if (this.args[0] instanceof App && ["sin", "cos", "tan"].includes(this.args[0].fncName)) {
                            const app = this.args[0];
                            text = `${texName(app.fncName)}^{${args[1]}} ${app.args[0].tex()}`;
                        }
                        else {
                            text = `${args[0]}^{${args[1]}}`;
                        }
                        break;
                    default:
                        if (args.length == 1) {
                            text = `${texName(this.fncName)} ${args[0]}`;
                        }
                        else {
                            text = args.join(` ${texName(this.fncName)} `);
                        }
                        break;
                }
            }
            if (this.parent != null) {
                if (this.remParentheses) {
                    return `\\textbf{ {\\color{red} (} } ${text} \\textbf{ {\\color{red} )} }`;
                }
                else if ((this.isAdd() || this.isMul()) && this.parent.fncName == "lim") {
                    return `(${text})`;
                }
                else if (this.isOperator() && this.parent.isOperator() && !this.parent.isDiv()) {
                    if (this.parent.fncName == "^" && this.parent.args[1] == this) {
                        return text;
                    }
                    if (this.parent.precedence() <= this.precedence()) {
                        return `(${text})`;
                    }
                }
            }
            return text;
        }
        precedence() {
            switch (this.fncName) {
                case "^":
                    return 0;
                case "/":
                    return 1;
                case "*":
                    return 2;
                case "+":
                case "-":
                    return 3;
            }
            return -1;
        }
        setArg(trm, idx) {
            this.args[idx] = trm;
            trm.parent = this;
        }
        addArg(trm) {
            this.args.push(trm);
            trm.parent = this;
        }
        addArgs(trms) {
            this.args.push(...trms);
            trms.forEach(x => x.parent = this);
        }
        insArg(trm, idx) {
            this.args.splice(idx, 0, trm);
            trm.parent = this;
        }
        insArgs(args, idx) {
            parser_ts.assert(idx != -1, "ins parent mul 1");
            const args_cp = args.slice();
            while (args_cp.length != 0) {
                const trm = args_cp.pop();
                this.insArg(trm, idx);
            }
        }
        /**
         *
         * @description 引数が1個だけの加算や乗算を、唯一の引数で置き換える。
         */
        oneArg() {
            parser_ts.assert(this.args.length == 1, "one arg");
            // 唯一の引数
            const arg1 = this.args[0];
            // 加算や乗算を唯一の引数で置き換える。
            this.replaceTerm(arg1);
            // 唯一の引数の係数に、加算や乗算の係数をかける。
            arg1.value.setmul(this.value);
        }
        allTerms() {
            const terms = [];
            this.getAllTerms(terms);
            return terms;
        }
        clearHighlight() {
            const all_terms = this.allTerms();
            for (const term of all_terms) {
                term.canceled = false;
                term.colorName = undefined;
            }
        }
        findTermById(id) {
            return this.allTerms().find(x => x.id == id);
        }
    }
    parser_ts.App = App;
    class Parser {
        tokens;
        tokens_cp;
        token;
        constructor(text) {
            this.tokens = parser_ts.lexicalAnalysis(text);
            if (this.tokens.length == 0) {
            }
            this.tokens_cp = this.tokens.slice();
            this.next();
        }
        next() {
            if (this.tokens.length == 0) {
                this.token = new parser_ts.Token(parser_ts.TokenType.eot, parser_ts.TokenSubType.unknown, "", 0);
            }
            else {
                this.token = this.tokens.shift();
            }
        }
        showError(text) {
            const i = this.tokens_cp.length - this.tokens.length;
            const words = this.tokens_cp.map(x => x.text);
            words.splice(i, 0, `<<${text}>>`);
            parser_ts.msg(`token err:${words.join(" ")}`);
        }
        nextToken(text) {
            if (this.token.text != text) {
                this.showError(text);
                throw new parser_ts.SyntaxError();
            }
            this.next();
        }
        current() {
            return this.token.text;
        }
        peek() {
            return this.tokens.length == 0 ? null : this.tokens[0];
        }
        readArgs(start, end, app) {
            this.nextToken(start);
            while (true) {
                const trm = this.RelationalExpression();
                app.args.push(trm);
                if (this.token.text == ",") {
                    this.nextToken(",");
                }
                else {
                    break;
                }
            }
            this.nextToken(end);
        }
        PrimaryExpression() {
            let trm;
            if (this.token.typeTkn == parser_ts.TokenType.identifier) {
                let refVar = new RefVar(this.token.text);
                this.next();
                if (this.token.text == '(') {
                    let app = new App(refVar, []);
                    this.readArgs("(", ")", app);
                    return app;
                }
                else if (this.token.text == ".") {
                    let app = new App(operator("."), [refVar]);
                    do {
                        this.nextToken(".");
                        parser_ts.assert(this.token.typeTkn == parser_ts.TokenType.identifier);
                        app.addArg(new RefVar(this.token.text));
                        this.next();
                    } while (this.token.text == ".");
                    return app;
                }
                else {
                    return refVar;
                }
            }
            else if (this.token.typeTkn == parser_ts.TokenType.Number) {
                let n = parseFloat(this.token.text);
                if (isNaN(n)) {
                    throw new parser_ts.SyntaxError();
                }
                trm = new ConstNum(n);
                this.next();
            }
            else if (this.token.typeTkn == parser_ts.TokenType.String) {
                trm = new Str(this.token.text);
                this.next();
            }
            else if (this.token.typeTkn == parser_ts.TokenType.path) {
                parser_ts.assert(this.token.text[0] == "#", "parse path");
                if (this.token.text == "#") {
                    trm = new Path([]);
                }
                else {
                    const indexes = this.token.text.substring(1).split(parser_ts.pathSep).map(x => parseFloat(x));
                    trm = new Path(indexes);
                }
                this.next();
            }
            else if (this.token.text == '(') {
                this.next();
                trm = this.RelationalExpression();
                if (this.current() != ')') {
                    throw new parser_ts.SyntaxError();
                }
                this.next();
                if (this.token.text == '(') {
                    let app = new App(trm, []);
                    this.readArgs("(", ")", app);
                    return app;
                }
                return trm;
            }
            else if (this.token.text == '{') {
                this.next();
                const element = this.RelationalExpression();
                this.nextToken('|');
                const logic = this.LogicalExpression();
                this.nextToken('}');
                trm = new App(operator("{|}"), [element, logic]);
                return trm;
            }
            else {
                throw new parser_ts.SyntaxError();
            }
            return trm;
        }
        PowerExpression() {
            const trm1 = this.PrimaryExpression();
            if (this.token.text == "^") {
                this.nextToken("^");
                const trm2 = this.PowerExpression();
                return new App(operator("^"), [trm1, trm2]);
            }
            return trm1;
        }
        UnaryExpression() {
            if (this.token.text == "-") {
                // 負号の場合
                this.nextToken("-");
                // 基本の式を読みます。
                const t1 = this.PowerExpression();
                // 符号を反転します。
                t1.value.numerator *= -1;
                return t1;
            }
            else {
                // 基本の式を読みます。
                return this.PowerExpression();
            }
        }
        DivExpression() {
            let trm1 = this.UnaryExpression();
            while (this.token.text == "/" || this.token.text == "%") {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.UnaryExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            return trm1;
        }
        MultiplicativeExpression() {
            let trm1 = this.DivExpression();
            if (this.current() != "*") {
                return trm1;
            }
            while (this.current() == "*") {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.DivExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            if (trm1 instanceof App && trm1.args[0] instanceof ConstNum) {
                if (trm1.args.length == 2) {
                    const [num, trm2] = trm1.args;
                    trm2.value.setmul(num.value);
                    return trm2;
                }
                else {
                    const num = trm1.args[0];
                    trm1.value.setmul(num.value);
                    num.remArg();
                    return trm1;
                }
            }
            return trm1;
        }
        AdditiveExpression() {
            let nagative = false;
            if (this.token.text == "-") {
                nagative = true;
                this.next();
            }
            const trm1 = this.MultiplicativeExpression();
            if (nagative) {
                trm1.value.numerator *= -1;
            }
            if (this.token.text == "+" || this.token.text == "-") {
                let app = new App(operator("+"), [trm1]);
                while (this.token.text == "+" || this.token.text == "-") {
                    const opr = this.token.text;
                    this.next();
                    const trm2 = this.MultiplicativeExpression();
                    if (opr == "-") {
                        trm2.value.numerator *= -1;
                    }
                    app.addArg(trm2);
                }
                return app;
            }
            return trm1;
        }
        ArithmeticExpression() {
            const trm1 = this.AdditiveExpression();
            if (!isArithmeticToken(this.current())) {
                return trm1;
            }
            const app = new App(operator(this.current()), [trm1]);
            while (isArithmeticToken(this.current())) {
                this.next();
                const trm2 = this.AdditiveExpression();
                app.addArg(trm2);
            }
            return app;
        }
        VariableDeclaration() {
            const ref_vars = [];
            while (true) {
                const id = this.token;
                parser_ts.assert(id.typeTkn == parser_ts.TokenType.identifier);
                this.next();
                ref_vars.push(new RefVar(id.text));
                if (this.token.text == ",") {
                    this.nextToken(",");
                }
                else {
                    break;
                }
            }
            const id_list = new App(operator(","), ref_vars);
            this.nextToken("in");
            const set = this.ArithmeticExpression();
            return new App(operator("in"), [id_list, set]);
        }
        RelationalExpression(in_and = false) {
            const next_token = this.peek();
            if (in_and && this.token.typeTkn == parser_ts.TokenType.identifier && next_token != null && next_token.text == ",") {
                return this.VariableDeclaration();
            }
            let trm1;
            if (this.token.text == "[") {
                const ref = new RefVar("[]");
                trm1 = new App(ref, []);
                this.readArgs("[", "]", trm1);
            }
            else {
                trm1 = this.ArithmeticExpression();
            }
            while (isRelationToken(this.token.text)) {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.ArithmeticExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            return trm1;
        }
        AndExpression() {
            const trm1 = this.RelationalExpression(true);
            if (![";", "&&"].includes(this.token.text)) {
                return trm1;
            }
            const app = new App(operator("&&"), [trm1]);
            while ([";", "&&"].includes(this.token.text)) {
                this.next();
                const trm2 = this.RelationalExpression(true);
                app.addArg(trm2);
            }
            return app;
        }
        OrExpression() {
            const trm1 = this.AndExpression();
            if (this.current() != "||") {
                return trm1;
            }
            const app = new App(operator("||"), [trm1]);
            while (this.current() == "||") {
                this.next();
                const trm2 = this.AndExpression();
                app.addArg(trm2);
            }
            return app;
        }
        LogicalExpression() {
            const trm1 = this.OrExpression();
            if (["=>", "⇔"].includes(this.token.text)) {
                const opr = this.token.text;
                this.next();
                let trm2 = this.OrExpression();
                return new App(operator(opr), [trm1, trm2]);
            }
            else {
                return trm1;
            }
        }
        RootExpression() {
            if (this.token.text == "let") {
                this.next();
                const app = this.VariableDeclaration();
                if (this.token.text != ",") {
                    return app;
                }
                const and = new App(operator("&&"), [app]);
                while (this.token.text == ",") {
                    this.next();
                    const app2 = this.VariableDeclaration();
                    and.addArg(app2);
                }
                return and;
            }
            else if (isRelationToken(this.token.text)) {
                let app = new App(operator(this.token.text), []);
                this.next();
                let trm = this.ArithmeticExpression();
                app.args.push(trm);
                return app;
            }
            else {
                return this.LogicalExpression();
            }
        }
    }
    parser_ts.Parser = Parser;
    function operator(opr) {
        return new RefVar(opr);
    }
    parser_ts.operator = operator;
    function getAllTerms(t, terms) {
        terms.push(t);
        if (t instanceof App) {
            parser_ts.assert(t.fnc != null, "get all terms");
            getAllTerms(t.fnc, terms);
            t.args.forEach(x => getAllTerms(x, terms));
        }
    }
    parser_ts.getAllTerms = getAllTerms;
    function makeIdToTermMap(root) {
        const terms = allTerms(root);
        return new Map(terms.map(x => [x.id, x]));
    }
    parser_ts.makeIdToTermMap = makeIdToTermMap;
    function getSubTerms(root, target) {
        const terms = [];
        getAllTerms(root, terms);
        const target_str = target.str2();
        return terms.filter(x => x.str2() == target_str);
    }
    parser_ts.getSubTerms = getSubTerms;
    function allTerms(trm) {
        const terms = [];
        getAllTerms(trm, terms);
        return terms;
    }
    parser_ts.allTerms = allTerms;
    function bodyOnLoad() {
        const texts = parser_ts.$("sample").value.replace("\r\n", "\n").split("\n").map(x => x.trim()).filter(x => x != "");
        for (const text of texts) {
            parser_ts.msg(text);
            parseMath(text);
        }
    }
    parser_ts.bodyOnLoad = bodyOnLoad;
})(parser_ts || (parser_ts = {}));
var katex;
var parser_ts;
(function (parser_ts) {
    //
    parser_ts.sleep = i18n_ts.sleep;
    const $dic = new Map();
    function $(id) {
        let ele = $dic.get(id);
        if (ele == undefined) {
            ele = document.getElementById(id);
            $dic.set(id, ele);
        }
        return ele;
    }
    parser_ts.$ = $;
    class MyError extends Error {
        constructor(text = "") {
            super(text);
        }
    }
    parser_ts.MyError = MyError;
    class SyntaxError extends MyError {
        constructor(text = "") {
            super(text);
        }
    }
    parser_ts.SyntaxError = SyntaxError;
    function assert(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    parser_ts.assert = assert;
    function msg(txt) {
        console.log(txt);
    }
    parser_ts.msg = msg;
    function range(n) {
        return [...Array(n).keys()];
    }
    parser_ts.range = range;
    function getUserMacros() {
        return {
            "\\dif": "\\frac{d #1}{d #2}",
            "\\pdiff": "\\frac{\\partial #1}{\\partial #2}",
            "\\pddif": "\\frac{\\partial^2 #1}{\\partial {#2}^2}",
            "\\b": "\\boldsymbol{#1}"
        };
    }
    parser_ts.getUserMacros = getUserMacros;
    function renderKatexSub(ele, tex_text) {
        ele.innerHTML = "";
        katex.render(tex_text, ele, {
            throwOnError: false,
            displayMode: true,
            trust: true,
            strict: false, // "ignore", // false, // handler,
            // newLineInDisplayMode : "ignore",
            macros: getUserMacros()
        });
    }
    parser_ts.renderKatexSub = renderKatexSub;
})(parser_ts || (parser_ts = {}));
var parser_ts;
(function (parser_ts) {
    function symbol2words(symbol) {
        const tbl = {
            "sin": "sine",
            "cos": "cosine",
            "tan": "tangent",
            "sec": "secant",
            "cosec": "cosecant",
            "cot": "cotangent",
            "=": "equals",
            "==": "equals",
            "!=": "not equal to",
            "<": "is less than",
            ">": "is greater than",
            "<=": "is less than or equal to",
            ">=": "is greater than or equal to",
            "+": "plus",
            "-": "minus",
            "*": "times"
        };
        const text = tbl[symbol];
        if (text != undefined) {
            return text;
        }
        else {
            return symbol;
        }
    }
    const tex2words = {
        "dif": "diff",
        "Delta": "delta",
        "lim": "limit",
        "sqrt": "square root",
        "ne": "not equals",
        "lt": "is less than",
        "gt": "is greater than",
        "le": "is less than or equals",
        "ge": "is greater than or equals",
        "hbar": "h bar",
    };
    const oprs = new Set();
    function isLetter(str) {
        return /^\p{Letter}+$/u.test(str);
    }
    function isDigit(str) {
        return /^\d+$/.test(str);
    }
    function pronunciationF(tex_node, word) {
        if (word.endsWith("{")) {
            word = word.substring(0, word.length - 1);
        }
        if (word.endsWith("_")) {
            word = word.substring(0, word.length - 1);
        }
        if (word.startsWith("\\")) {
            word = word.substring(1);
            const text = tex2words[word];
            if (text != undefined) {
                return new Phrase(tex_node, text.split(" "));
            }
        }
        else {
            const text = symbol2words(word);
            if (text != word) {
                return new Phrase(tex_node, text.split(" "));
            }
        }
        if (isLetter(word)) {
            if (parser_ts.isGreek(word)) {
                const char0 = word.charAt(0);
                if (char0.toUpperCase() == char0) {
                    return new Phrase(tex_node, ["large", word.toLowerCase()]);
                }
            }
            return new Phrase(tex_node, [word]);
        }
        if (isDigit(word)) {
            return new Phrase(tex_node, [word]);
        }
        if (!oprs.has(word)) {
            oprs.add(word);
            // msg(`operators : [${word}]`);
        }
        return undefined;
    }
    class Phrase {
        texNode;
        words;
        start;
        end;
        constructor(tex_node, words) {
            this.texNode = tex_node;
            this.words = words;
            for (const word of words) {
                if (!oprs.has(word)) {
                    oprs.add(word);
                    // msg(`word : ${word}`);
                }
            }
        }
    }
    parser_ts.Phrase = Phrase;
    function makeTextFromPhrases(phrases) {
        let text = "";
        for (const phrase of phrases) {
            phrase.start = text.length;
            for (const word of phrase.words) {
                if (word != "") {
                    if (text != "") {
                        text += " ";
                    }
                    text += word;
                }
            }
            phrase.end = text.length;
        }
        // msg(`phrases [${text}]`)
        return text;
    }
    parser_ts.makeTextFromPhrases = makeTextFromPhrases;
    class TexNode {
        diction;
        termTex;
        term() {
            return this.termTex;
        }
        initString() {
            return "";
        }
        async *genTex(speech, highlightables) {
            yield "";
        }
        say(text) {
            this.diction = text;
            return this;
        }
        dmpNode(nest) {
            const term = this.term();
            const id = (term == undefined ? "" : `${term.id}`);
            if (this instanceof TexLeaf) {
                parser_ts.msg(`${nest}${id}:${this.texText()}`);
            }
            else if (this instanceof TexBlock) {
                parser_ts.msg(`${nest}${id}`);
                this.nodes.forEach(x => x.dmpNode(nest + "\t"));
            }
            else {
                throw new parser_ts.MyError();
            }
        }
    }
    class TexBlock extends TexNode {
        nodes;
        constructor(nodes) {
            super();
            this.nodes = nodes;
        }
        makeSpeech(phrases) {
            this.nodes.forEach(x => x.makeSpeech(phrases));
        }
    }
    class TexSeq extends TexBlock {
        constructor(nodes) {
            super(nodes);
        }
        async *genTex(speech, highlightables) {
            const arg_strs = this.nodes.map(x => x.initString());
            for (let [idx, node] of this.nodes.entries()) {
                for await (const s of node.genTex(speech, highlightables)) {
                    arg_strs[idx] = s;
                    yield `${arg_strs.join(" ")}`;
                }
            }
            yield `${arg_strs.join(" ")}`;
        }
    }
    class TexLeaf extends TexNode {
        charPos;
        phrase;
        constructor() {
            super();
        }
        speechText() {
            return this.texText();
        }
        makeSpeech(phrases) {
            let text;
            if (this.diction != undefined) {
                text = this.diction;
            }
            else {
                text = this.speechText();
            }
            this.phrase = pronunciationF(this, text);
            if (this.phrase != undefined) {
                phrases.push(this.phrase);
            }
        }
        async *genTex(speech, highlightables) {
            const tex_text = this.texText();
            if (speech != null && this.phrase != undefined) {
                while (speech.speaking && speech.prevCharIndex < this.phrase.start) {
                    parser_ts.msg(`await tex-leaf.gen-tex: prev-Char-Index:${speech.prevCharIndex} phrase-start:${this.phrase.start}`);
                    await parser_ts.sleep(100);
                    yield tex_text;
                }
            }
            yield tex_text;
        }
    }
    class TexNum extends TexLeaf {
        num;
        constructor(num) {
            super();
            this.num = num;
        }
        term() {
            return this.num;
        }
        texText() {
            return this.num.value.str();
        }
    }
    class TexRef extends TexLeaf {
        ref;
        constructor(ref) {
            super();
            this.ref = ref;
        }
        term() {
            return this.ref;
        }
        texText() {
            if (parser_ts.isGreek(this.ref.name)) {
                return `\\${this.ref.name}`;
            }
            else {
                return this.ref.name;
            }
            // return this.ref.tex();
        }
        async *genTex(speech, highlightables) {
            if (highlightables != undefined) {
                const highlightable = highlightables.get(this.ref.name);
                if (highlightable != undefined) {
                    highlightable.highlight(true);
                }
            }
            const tex_text = this.texText();
            if (speech != null && this.phrase != undefined) {
                while (speech.speaking && speech.prevCharIndex < this.phrase.start) {
                    parser_ts.msg(`await tex-ref.gen-tex: prev-Char-Index:${speech.prevCharIndex} phrase-start:${this.phrase.start}`);
                    await parser_ts.sleep(100);
                    yield tex_text;
                }
            }
            yield tex_text;
        }
    }
    class TexStr extends TexLeaf {
        str;
        constructor(str) {
            super();
            this.str = str;
        }
        speechText() {
            if (this.str == "\\lim_{") {
                parser_ts.msg("speech-Text:lim");
            }
            const list = [
                "{", "}", "(", ")", "}{", "}^{", "\\frac{"
            ];
            if (list.includes(this.str)) {
                return "";
            }
            return symbol2words(this.str);
        }
        texText() {
            return parser_ts.texName(this.str);
        }
        initString() {
            const list = [
                "{", "}", "(", ")", "}{", "}^{", "^{"
            ];
            if (list.includes(this.str)) {
                return this.str;
            }
            if (this.str.startsWith("\\") && this.str.endsWith("}")) {
                return this.str;
            }
            return "";
        }
    }
    class TexSpeech extends TexStr {
        constructor(text) {
            super(text);
        }
        async *genTex(speech, highlightables) {
            yield "";
        }
    }
    function spc(text) {
        return new TexSpeech(text);
    }
    function seq(...params) {
        return new TexSeq(params.map(x => makeFlow(x)));
    }
    function join(trms, delimiter) {
        const nodes = trms.map(x => makeTermFlow(x));
        if (trms.length == 1) {
            return makeTermFlow(trms[0]);
        }
        else {
            const nodes = [];
            for (const [i, trm] of trms.entries()) {
                if (i != 0) {
                    nodes.push(new TexStr(delimiter));
                }
                nodes.push(makeTermFlow(trm));
            }
            return new TexSeq(nodes);
        }
    }
    function prependValue(trm, node) {
        const fval = trm.value.fval();
        if (fval != 1 && trm.isAdd()) {
            node = seq("(", node, ")");
        }
        if (fval == -1) {
            node = seq("-", node);
        }
        else if (fval != 1) {
            parser_ts.assert(trm.value.denominator == 1);
            node = seq(trm.value.numerator.toFixed(), node);
        }
        if (trm instanceof parser_ts.App) {
            node.termTex = trm;
        }
        return node;
    }
    function makeFlow(trm) {
        if (trm instanceof TexNode) {
            return trm;
        }
        else if (typeof trm === "string") {
            return new TexStr(trm);
        }
        else if (trm instanceof parser_ts.Term) {
            return makeTermFlow(trm);
        }
        else {
            throw new parser_ts.MyError();
        }
    }
    parser_ts.makeFlow = makeFlow;
    function makeTermFlow(trm) {
        if (trm instanceof parser_ts.RefVar) {
            const ref = trm;
            const node = new TexRef(ref);
            return prependValue(ref, node);
        }
        else if (trm instanceof parser_ts.ConstNum) {
            const num = trm;
            return new TexNum(num);
        }
        else if (trm instanceof parser_ts.App) {
            const app = trm;
            let node;
            if (app.fnc instanceof parser_ts.App) {
                if (app.fnc instanceof parser_ts.RefVar) {
                    node = seq(app.fnc, seq("(", join(app.args, ","), ")"));
                }
                else {
                    node = seq("(", app.fnc, ")", seq("(", join(app.args, ","), ")"));
                }
            }
            else if (app.fncName == "lim") {
                const arg0 = app.args[0];
                if (arg0.isAdd() || arg0.isMul()) {
                    node = seq("\\lim_{", app.args[1], "\\to", app.args[2], "}", "(", app.args[0], ")");
                }
                else {
                    node = seq("\\lim_{", app.args[1], "\\to", app.args[2], "}", app.args[0]);
                }
            }
            else if (app.fncName == "in") {
                const ids = join(app.args, " , ");
                node = seq(ids, "\\in", app.args[1]);
            }
            else if (app.isDiff()) {
                const n = (app.args.length == 3 ? seq("^{", app.args[2], "}") : ``);
                const d = (app.fncName == "diff" ? "d" : "\\partial");
                if (app.args[0].isDiv()) {
                    node = seq("\\frac{", d, n, "}{", spc("over"), d, app.args[1], n, "}", seq("(", app.args[0], ")"));
                }
                else {
                    node = seq("\\frac{", d, n, app.args[0], "}{", spc("over"), d, app.args[1], n, "}");
                }
            }
            else if (parser_ts.isLetterOrAt(app.fncName)) {
                if (["sin", "cos", "tan"].includes(app.fncName) && !(app.args[0] instanceof parser_ts.App)) {
                    node = seq(app.fnc, app.args[0]);
                }
                else if (app.fncName == "sqrt") {
                    parser_ts.assert(app.args.length == 1);
                    node = seq("\\sqrt{", app.args[0], "}");
                }
                else if (app.fncName == "nth_root") {
                    parser_ts.assert(app.args.length == 2);
                    node = seq("\\sqrt[", app.args[1], "]{", app.args[0], "}");
                }
                else {
                    node = seq(app.fnc, seq("(", join(app.args, ","), ")"));
                }
            }
            else {
                switch (app.fncName) {
                    case "+":
                        switch (app.args.length) {
                            case 0:
                                throw new parser_ts.MyError();
                            case 1:
                                node = makeTermFlow(app.args[0]);
                                break;
                            default:
                                const nodes = [];
                                for (const [i, arg] of app.args.entries()) {
                                    if (i != 0) {
                                        const coefficient = arg.value.fval();
                                        if (0 <= coefficient) {
                                            nodes.push(new TexStr("+"));
                                        }
                                        else if (coefficient == -1) {
                                            nodes.push(new TexStr("-"));
                                        }
                                    }
                                    const arg_node = makeTermFlow(arg);
                                    if (app.isAdd() && arg.isMul()) {
                                        nodes.push(seq("(", arg_node, ")"));
                                    }
                                    else {
                                        nodes.push(arg_node);
                                    }
                                }
                                node = new TexSeq(nodes);
                                break;
                        }
                        break;
                    case "*":
                        switch (app.args.length) {
                            case 0:
                                throw new parser_ts.MyError();
                            case 1:
                                node = makeTermFlow(app.args[0]);
                                break;
                            default:
                                node = join(app.args, app.fncName);
                        }
                        break;
                    case "/":
                        if (app.args.length == 3) {
                            // msg(`/ 3args [${app.args[0].str()}] [ ${app.args[1].str()}] [ ${app.args[2].str()}]`);
                        }
                        else if (app.args.length == 1) {
                            // msg(`/ 1arg [${app.args[0].str()}]`);
                            return makeTermFlow(app.args[0]);
                        }
                        else {
                            parser_ts.assert(app.args.length == 2);
                        }
                        node = seq("\\frac{", app.args[0], "}{", spc("over"), app.args[1], "}");
                        break;
                    case "^":
                        let exponent = makeTermFlow(app.args[1]);
                        if (app.args[1].isValue(2)) {
                            exponent.say("squared");
                        }
                        else if (app.args[1].isValue(3)) {
                            exponent.say("cubed");
                        }
                        else {
                            exponent = seq("to the power of", exponent);
                        }
                        if (app.args[0] instanceof parser_ts.App && ["sin", "cos", "tan"].includes(app.args[0].fncName)) {
                            const app2 = app.args[0];
                            node = seq("{", app2.fncName, `}^{`, exponent, "}", app2.args[0]);
                        }
                        else {
                            node = seq("{", app.args[0], "}^{", exponent, "}");
                        }
                        break;
                    default:
                        if (app.args.length == 1) {
                            node = seq(app.fncName, app.args[0]);
                        }
                        else {
                            node = join(app.args, app.fncName);
                        }
                        break;
                }
            }
            // if(app.parent != null){
            //     if(app.isOperator() && app.parent.isOperator() && !app.parent.isDiv()){
            //         if(app.parent.fncName == "^" && app.parent.args[1] == app){
            //             ;
            //         }
            //         else if(app.parent.precedence() <= app.precedence()){
            //             node = seq("(", node, ")");
            //         }            
            //     }
            // }
            return prependValue(app, node);
        }
        else {
            throw new parser_ts.MyError();
        }
    }
    function getAllTexNodes(node, nodes) {
        nodes.push(node);
        if (node instanceof TexBlock) {
            node.nodes.forEach(x => getAllTexNodes(x, nodes));
        }
    }
    function allTexNodes(node) {
        const terms = [];
        getAllTexNodes(node, terms);
        return terms;
    }
    parser_ts.allTexNodes = allTexNodes;
    function makeNodeTextByApp(root) {
        root.setParent(null);
        root.setTabIdx();
        const node = makeTermFlow(root);
        const phrases = [];
        node.makeSpeech(phrases);
        const text = makeTextFromPhrases(phrases);
        return [node, text];
    }
    parser_ts.makeNodeTextByApp = makeNodeTextByApp;
    async function showFlow(speech, root, div, highlightables) {
        div.innerHTML = "";
        const [node, text] = makeNodeTextByApp(root);
        await speech.speak(text);
        let prev_s = "";
        for await (const s of node.genTex(speech, highlightables)) {
            if (prev_s != s) {
                prev_s = s;
                // msg(`show flow:${s}`);
                parser_ts.renderKatexSub(div, s);
                await parser_ts.sleep(10);
            }
        }
        parser_ts.renderKatexSub(div, root.tex());
        await speech.waitEnd();
    }
    parser_ts.showFlow = showFlow;
})(parser_ts || (parser_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvbGV4LnRzIiwiLi4vLi4vLi4vdHMvcGFyc2VyLnRzIiwiLi4vLi4vLi4vdHMvcGFyc2VyX3V0aWwudHMiLCIuLi8uLi8uLi90cy90ZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVUsU0FBUyxDQTZSbEI7QUE3UkQsV0FBVSxTQUFTO0lBRW5CLElBQVksU0E0Q1g7SUE1Q0QsV0FBWSxTQUFTO1FBQ2pCLCtDQUFPLENBQUE7UUFFUCxNQUFNO1FBQ04scURBQVUsQ0FBQTtRQUVWLE1BQU07UUFDTiwyQ0FBSyxDQUFBO1FBRUwsS0FBSztRQUNMLDZDQUFNLENBQUE7UUFFTixLQUFLO1FBQ0wsNkNBQU0sQ0FBQTtRQUVOLE1BQU07UUFDTix5REFBWSxDQUFBO1FBRVosT0FBTztRQUNQLHlDQUFJLENBQUE7UUFFSixjQUFjO1FBQ2QsdUNBQUcsQ0FBQTtRQUVILE9BQU87UUFDUCx1Q0FBRyxDQUFBO1FBRUgsUUFBUTtRQUNSLHVEQUFXLENBQUE7UUFFWCxXQUFXO1FBQ1gsMERBQVksQ0FBQTtRQUVaLEtBQUs7UUFDTCxnREFBTyxDQUFBO1FBRVAsTUFBTTtRQUNOLDhDQUFNLENBQUE7UUFFTixLQUFLO1FBQ0wsb0RBQVMsQ0FBQTtRQUVULEtBQUs7UUFDTCxnREFBTyxDQUFBO0lBQ1gsQ0FBQyxFQTVDVyxTQUFTLEdBQVQsbUJBQVMsS0FBVCxtQkFBUyxRQTRDcEI7SUFHRCxJQUFJLFdBQVcsR0FBbUIsSUFBSyxLQUFLLENBQ3hDLEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdB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QUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsUUFBUTtZQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1FBQzlDLENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQ3ZELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFVO1lBQ2QsT0FBTyxJQUFJLFlBQVksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUVELEdBQUc7WUFDQyxPQUFPLElBQUksWUFBWSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7UUFDdEQsQ0FBQztRQUVELEdBQUc7WUFDQyxPQUFPLElBQUksWUFBWSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7UUFDdEQsQ0FBQztRQUVELE1BQU07WUFDRixPQUFPLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO1FBQ3hELENBQUM7UUFFRCxRQUFRO1lBQ0osVUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckIsT0FBUSxJQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsT0FBTztZQUNILFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLE9BQVEsSUFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUdELE1BQU0sQ0FBQyxJQUFhO1lBQ2hCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSTtZQUNBLElBQUcsSUFBSSxZQUFZLFFBQVEsRUFBQyxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixDQUFDO2lCQUNJLElBQUcsSUFBSSxZQUFZLFFBQVEsRUFBQyxDQUFDO2dCQUM5QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0IsQ0FBQztpQkFDSSxJQUFHLElBQUksWUFBWSxNQUFNLEVBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUcsSUFBSSxZQUFZLElBQUksRUFBQyxDQUFDO29CQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztxQkFDRyxDQUFDO29CQUNELE1BQU0sSUFBSSxVQUFBLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNMLENBQUM7aUJBQ0ksSUFBRyxJQUFJLFlBQVksR0FBRyxFQUFDLENBQUM7Z0JBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztnQkFDakIsSUFBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUM7b0JBQ2xCLFVBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO3FCQUNHLENBQUM7b0JBQ0QsTUFBTSxJQUFJLFVBQUEsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sSUFBSSxVQUFBLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQWM7WUFDcEIsVUFBQSxNQUFNLENBQUMsSUFBSSxZQUFZLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFhO1lBQ2pCLElBQUcsSUFBSSxZQUFZLEdBQUcsRUFBQyxDQUFDO2dCQUVwQixVQUFBLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkQsQ0FBQztpQkFDRyxDQUFDO2dCQUVELFVBQUEsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFjO1lBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsSUFBRyxJQUFJLFlBQVksR0FBRyxFQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0wsQ0FBQztRQUVELFlBQVksQ0FBQyxJQUFXO1lBQ3BCLElBQUcsSUFBSSxZQUFZLEdBQUcsRUFBQyxDQUFDO2dCQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFDRyxDQUFDO2dCQUNELE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQztZQUN4QixDQUFDO1FBQ0wsQ0FBQzs7SUEzY2lCLGNBQUksT0E0Y3pCLENBQUE7SUFFRCxNQUFhLElBQUssU0FBUSxJQUFJO1FBQzFCLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFFeEIsWUFBWSxPQUFrQjtZQUMxQixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBVTtZQUNaLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLFlBQVksSUFBSSxJQUFJLFVBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0gsQ0FBQztRQUVELEtBQUs7WUFDRCxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDNUMsQ0FBQztRQUVELElBQUk7WUFDQSxVQUFBLE1BQU0sQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDM0IsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsS0FBSztZQUNELE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBVSxFQUFFLGFBQXVCLEtBQUs7WUFDNUMsSUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDekIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztZQUVmLE1BQU0sTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWhGLEtBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUM7Z0JBQzFDLElBQUcsQ0FBQyxJQUFJLE1BQU0sRUFBQyxDQUFDO29CQUVaLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDakQsQ0FBQztxQkFDRyxDQUFDO29CQUNELEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBUSxDQUFDO29CQUNuRCxVQUFBLE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sSUFBSSxVQUFBLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQyxDQUFDO0tBQ0o7SUFyRFksY0FBSSxPQXFEaEIsQ0FBQTtJQUdELE1BQWEsUUFBUTtRQUNqQixJQUFJLENBQVU7UUFDZCxJQUFJLENBQVE7UUFDWixPQUFPLENBQWM7UUFFckIsWUFBWSxJQUFhLEVBQUUsSUFBVztZQUNsQyxVQUFBLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFFakIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFhLENBQUM7WUFDNUgsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBQSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQWUsQ0FBQztZQUN0RixVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWhELElBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7Z0JBQ3pCLFVBQUEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQWlCO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLENBQUM7S0FDSjtJQXRCWSxrQkFBUSxXQXNCcEIsQ0FBQTtJQUVELE1BQWEsTUFBTyxTQUFRLElBQUk7UUFDNUIsSUFBSSxDQUFTO1FBQ2IsTUFBTSxDQUF5QjtRQUUvQixZQUFZLElBQVk7WUFDcEIsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQVU7WUFDWixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxZQUFZLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDOUUsQ0FBQztRQUVELEtBQUs7WUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7Z0JBRWpCLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUIsQ0FBQztpQkFDRyxDQUFDO2dCQUVELE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QyxDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUs7WUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVmLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztLQUNKO0lBdENZLGdCQUFNLFNBc0NsQixDQUFBO0lBR0QsTUFBYSxRQUFTLFNBQVEsSUFBSTtRQUM5QixNQUFNLENBQUMsSUFBSTtZQUNQLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVELFlBQVksU0FBa0IsRUFBRSxjQUF1QixDQUFDO1lBQ3BELEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFVO1lBQ1osT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRUQsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFZO1lBQzVCLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELEtBQUs7WUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFZixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDSjtJQXhDWSxrQkFBUSxXQXdDcEIsQ0FBQTtJQUdELE1BQWEsR0FBSSxTQUFRLElBQUk7UUFDekIsSUFBSSxDQUFVO1FBRWQsWUFBWSxJQUFhO1lBQ3JCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFVO1lBQ1osT0FBTyxHQUFHLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2RCxDQUFDO1FBRUQsS0FBSztZQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDNUIsQ0FBQztRQUVELEtBQUs7WUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO0tBQ0o7SUEvQlksYUFBRyxNQStCZixDQUFBO0lBRUQsTUFBYSxHQUFJLFNBQVEsSUFBSTtRQUN6QixHQUFHLENBQVE7UUFDWCxJQUFJLENBQVM7UUFDYixjQUFjLEdBQWEsS0FBSyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxRQUFRLEdBQW1DO1lBQzlDLEdBQUcsRUFBRyxHQUFHO1lBQ1QsR0FBRyxFQUFHLEdBQUc7WUFDVCxHQUFHLEVBQUcsR0FBRztTQUNaLENBQUE7UUFFRCxJQUFJLE1BQU07WUFDTixJQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLFlBQVksTUFBTSxFQUFDLENBQUM7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNwQixDQUFDO2lCQUNHLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDUCxJQUFHLElBQUksQ0FBQyxHQUFHLFlBQVksTUFBTSxFQUFDLENBQUM7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDekIsQ0FBQztpQkFDRyxDQUFDO2dCQUNELE9BQU8sYUFBYSxDQUFDO1lBQ3pCLENBQUM7UUFDTCxDQUFDO1FBR0QsWUFBWSxHQUFTLEVBQUUsSUFBWTtZQUMvQixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxHQUFHLEdBQU0sR0FBRyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUV2QixJQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUzQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFVO1lBQ1osSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsWUFBWSxHQUFHLEVBQUMsQ0FBQztnQkFDdkMsSUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztvQkFDeEIsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDO3dCQUNwQyxPQUFPLFVBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9FLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBR0QsS0FBSztZQUNELElBQUksQ0FBVSxDQUFDO1lBQ2YsSUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7Z0JBQ3BCLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNyRSxDQUFDO2lCQUNHLENBQUM7Z0JBQ0QsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBRXZFLENBQUM7WUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7Z0JBRWpCLE9BQU8sQ0FBQyxDQUFDO1lBQ2IsQ0FBQztpQkFDRyxDQUFDO2dCQUVELE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDO1FBRUQsS0FBSztZQUNELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXJFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFZixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFRCxTQUFTLENBQUMsTUFBbUI7WUFDekIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV4QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsU0FBUztZQUNMLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUdELFlBQVksQ0FBQyxNQUFtQjtZQUM1QixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV6QyxJQUFJLElBQWEsQ0FBQztZQUNsQixJQUFHLElBQUksQ0FBQyxHQUFHLFlBQVksR0FBRyxFQUFDLENBQUM7Z0JBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssTUFBTSxHQUFHLENBQUM7WUFDNUMsQ0FBQztpQkFDSSxJQUFHLFVBQUEsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDO2dCQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMvQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDO1lBQ3hDLENBQUM7aUJBQ0csQ0FBQztnQkFFRCxRQUFPLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQztvQkFDakIsS0FBSyxHQUFHO3dCQUNKLFFBQU8sSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDOzRCQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDOzRCQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDakMsQ0FBQzt3QkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDdEIsTUFBSztvQkFFVCxLQUFLLEdBQUc7d0JBQ0osSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQzs0QkFDdEIsTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7d0JBQ3hCLENBQUM7d0JBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNqQyxNQUFLO29CQUVUO3dCQUNJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQ3RDLE1BQUs7Z0JBQ2IsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLENBQUM7Z0JBQ3JFLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsQ0FBQztvQkFDOUMsT0FBTyxJQUFJLElBQUksR0FBRyxDQUFDO2dCQUN2QixDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV6QyxJQUFJLElBQWEsQ0FBQztZQUNsQixJQUFHLElBQUksQ0FBQyxHQUFHLFlBQVksR0FBRyxFQUFDLENBQUM7Z0JBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssTUFBTSxHQUFHLENBQUM7WUFDNUMsQ0FBQztpQkFDSSxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFDLENBQUM7Z0JBQzNCLFFBQU8sSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDO29CQUNwQixLQUFLLENBQUM7d0JBQ0YsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQzFCLE1BQU07b0JBQ1YsS0FBSyxDQUFDO3dCQUNGLElBQUksR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ3ZELE1BQU07b0JBQ1Y7d0JBQ0ksTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7Z0JBQ3hCLENBQUM7WUFDTCxDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUMsQ0FBQztnQkFDM0IsUUFBTyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7b0JBQ3BCLEtBQUssQ0FBQzt3QkFDRixJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDMUIsTUFBTTtvQkFDVixLQUFLLENBQUM7d0JBQ0YsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEQsTUFBTTtvQkFDVixLQUFLLENBQUM7d0JBQ0YsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQy9ELE1BQU07b0JBQ1Y7d0JBQ0ksTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7Z0JBQ3hCLENBQUM7WUFDTCxDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUMsQ0FBQztnQkFDM0IsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDO29CQUNqQixJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsQ0FBQztxQkFDSSxJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ3RCLElBQUksR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsQ0FBQztxQkFDRyxDQUFDO29CQUNELE1BQU0sSUFBSSxVQUFBLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFDLENBQUM7Z0JBQzNCLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNoRCxDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUMsQ0FBQztnQkFDMUIsSUFBSSxHQUFZLENBQUM7Z0JBQ2pCLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztvQkFFeEIsR0FBRyxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkUsQ0FBQztxQkFDRyxDQUFDO29CQUNELEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLEdBQUcsR0FBRyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BDLENBQUM7aUJBQ0ksSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFlBQVksRUFBQyxDQUFDO2dCQUNsQyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUM5QixDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBLENBQUMsQ0FBQSxFQUFFLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFdkQsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztvQkFDdEIsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLENBQUM7cUJBQ0ksSUFBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUM7b0JBRXJDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2xFLENBQUM7cUJBQ0csQ0FBQztvQkFFRCxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNyRSxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFHLFVBQUEsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDO2dCQUNoQyxJQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxFQUFDLENBQUM7b0JBRWhGLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pELENBQUM7cUJBQ0ksSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssRUFBQyxDQUFDO29CQUMzQixVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDakMsSUFBSSxHQUFHLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQ3hDLENBQUM7cUJBQ0ksSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sRUFBQyxDQUFDO29CQUM1QixVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDakMsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2hDLENBQUM7cUJBQ0ksSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsRUFBQyxDQUFDO29CQUNoQyxVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDakMsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUM1QyxDQUFDO3FCQUNJLElBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3RDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1RCxDQUFDO3FCQUVJLElBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDdkUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzVELENBQUM7cUJBQ0csQ0FBQztvQkFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvQixJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDO2dCQUNqRCxDQUFDO1lBQ0wsQ0FBQztpQkFDRyxDQUFDO2dCQUVELFFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO29CQUNyQixLQUFLLEdBQUc7d0JBQ0osUUFBTyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7NEJBQ3BCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUM7NEJBQ3ZCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxDQUFDO3dCQUNELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUN0QixNQUFLO29CQUVULEtBQUssR0FBRzt3QkFDSixJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDOzRCQUN0QixNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQzt3QkFDeEIsQ0FBQzt3QkFDRCxJQUFJLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQ3hDLE1BQUs7b0JBRVQsS0FBSyxHQUFHO3dCQUNKLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7NEJBRWxGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQzt3QkFDdkUsQ0FBQzs2QkFDRyxDQUFDOzRCQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFDckMsQ0FBQzt3QkFDRCxNQUFLO29CQUVUO3dCQUNJLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQzs0QkFDakIsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDakQsQ0FBQzs2QkFDRyxDQUFDOzRCQUNELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ25ELENBQUM7d0JBQ0QsTUFBSztnQkFDVCxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUMsQ0FBQztnQkFFcEIsSUFBRyxJQUFJLENBQUMsY0FBYyxFQUFDLENBQUM7b0JBQ3BCLE9BQU8sZ0NBQWdDLElBQUksK0JBQStCLENBQUM7Z0JBQy9FLENBQUM7cUJBQ0ksSUFBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUMsQ0FBQztvQkFFcEUsT0FBTyxJQUFJLElBQUksR0FBRyxDQUFDO2dCQUN2QixDQUFDO3FCQUNJLElBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFDLENBQUM7b0JBQzNFLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBQyxDQUFDO3dCQUMxRCxPQUFPLElBQUksQ0FBQztvQkFDaEIsQ0FBQztvQkFFRCxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFDLENBQUM7d0JBQzlDLE9BQU8sSUFBSSxJQUFJLEdBQUcsQ0FBQztvQkFDdkIsQ0FBQztnQkFDTCxDQUFDO1lBRUwsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxVQUFVO1lBQ04sUUFBTyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7Z0JBQ3JCLEtBQUssR0FBRztvQkFDSixPQUFPLENBQUMsQ0FBQztnQkFFYixLQUFLLEdBQUc7b0JBQ0osT0FBTyxDQUFDLENBQUM7Z0JBRWIsS0FBSyxHQUFHO29CQUNKLE9BQU8sQ0FBQyxDQUFDO2dCQUViLEtBQUssR0FBRyxDQUFDO2dCQUNULEtBQUssR0FBRztvQkFDSixPQUFPLENBQUMsQ0FBQztZQUNiLENBQUM7WUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFVLEVBQUUsR0FBWTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNyQixHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQVU7WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQixHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTyxDQUFDLElBQWE7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSSxJQUFJLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQVUsRUFBRSxHQUFZO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFhLEVBQUUsR0FBWTtZQUMvQixVQUFBLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUV0QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsT0FBTSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUN2QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFHLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7UUFDTCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsTUFBTTtZQUNGLFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV6QyxRQUFRO1lBQ1IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixxQkFBcUI7WUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QiwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxRQUFRO1lBQ0osTUFBTSxLQUFLLEdBQVksRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELGNBQWM7WUFDVixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEMsS0FBSSxNQUFNLElBQUksSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBRUQsWUFBWSxDQUFDLEVBQVc7WUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDOztJQXZaUSxhQUFHLE1Bd1pmLENBQUE7SUFFRCxNQUFhLE1BQU07UUFDZixNQUFNLENBQVU7UUFDaEIsU0FBUyxDQUFVO1FBQ25CLEtBQUssQ0FBUztRQUVkLFlBQVksSUFBWTtZQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQUEsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7WUFFNUIsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVyQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVELElBQUk7WUFDQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUV4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksVUFBQSxLQUFLLENBQUMsVUFBQSxTQUFTLENBQUMsR0FBRyxFQUFFLFVBQUEsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkUsQ0FBQztpQkFDRyxDQUFDO2dCQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUcsQ0FBQztZQUN0QyxDQUFDO1FBQ0wsQ0FBQztRQUVELFNBQVMsQ0FBQyxJQUFhO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUM7WUFDbEMsVUFBQSxHQUFHLENBQUMsYUFBYSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsU0FBUyxDQUFDLElBQWE7WUFDbkIsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsTUFBTSxJQUFJLFVBQUEsV0FBVyxFQUFFLENBQUM7WUFDNUIsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTztZQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxRQUFRLENBQUMsS0FBYSxFQUFFLEdBQVksRUFBRSxHQUFTO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdEIsT0FBTSxJQUFJLEVBQUMsQ0FBQztnQkFDUixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDeEMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRW5CLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7cUJBQ0csQ0FBQztvQkFDRCxNQUFNO2dCQUNWLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRUQsaUJBQWlCO1lBQ2IsSUFBSSxHQUFVLENBQUM7WUFFZixJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLFVBQUEsU0FBUyxDQUFDLFVBQVUsRUFBQyxDQUFDO2dCQUMzQyxJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRVosSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztvQkFFdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRTdCLE9BQU8sR0FBRyxDQUFDO2dCQUNmLENBQUM7cUJBQ0ksSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztvQkFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFFM0MsR0FBRyxDQUFDO3dCQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRXBCLFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLFVBQUEsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNuRCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUVoQixDQUFDLFFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFO29CQUVoQyxPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO3FCQUNHLENBQUM7b0JBRUQsT0FBTyxNQUFNLENBQUM7Z0JBQ2xCLENBQUM7WUFDTCxDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksVUFBQSxTQUFTLENBQUMsTUFBTSxFQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxJQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO29CQUNULE1BQU0sSUFBSSxVQUFBLFdBQVcsRUFBRSxDQUFDO2dCQUM1QixDQUFDO2dCQUVELEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLENBQUM7aUJBQ0ksSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFBLFNBQVMsQ0FBQyxNQUFNLEVBQUMsQ0FBQztnQkFDNUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixDQUFDO2lCQUNJLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksVUFBQSxTQUFTLENBQUMsSUFBSSxFQUFDLENBQUM7Z0JBQzFDLFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEQsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztvQkFFdkIsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO3FCQUNHLENBQUM7b0JBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRixHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLENBQUM7aUJBQ0ksSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztnQkFFNUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFFbEMsSUFBRyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFDLENBQUM7b0JBQ3RCLE1BQU0sSUFBSSxVQUFBLFdBQVcsRUFBRSxDQUFDO2dCQUM1QixDQUFDO2dCQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFWixJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDO29CQUV2QixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFFN0IsT0FBTyxHQUFHLENBQUM7Z0JBQ2YsQ0FBQztnQkFFRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7aUJBQ0ksSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztnQkFFNUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUU1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVwQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFcEIsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7aUJBQ0csQ0FBQztnQkFDRCxNQUFNLElBQUksVUFBQSxXQUFXLEVBQUUsQ0FBQztZQUM1QixDQUFDO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsZUFBZTtZQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RDLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFDLENBQUM7Z0JBRXZCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXBCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFFcEMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELGVBQWU7WUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixRQUFRO2dCQUVSLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXBCLGFBQWE7Z0JBQ2IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUVsQyxZQUFZO2dCQUNaLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUV6QixPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUM7aUJBQ0ksQ0FBQztnQkFFRixhQUFhO2dCQUNiLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBR0QsYUFBYTtZQUNULElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNsQyxPQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztnQkFDcEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRVosT0FBTSxJQUFJLEVBQUMsQ0FBQztvQkFDUixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVwQixJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUMsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNoQixDQUFDO3lCQUNHLENBQUM7d0JBQ0QsSUFBSSxHQUFHLEdBQUcsQ0FBQzt3QkFDWCxNQUFNO29CQUNWLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBR0Qsd0JBQXdCO1lBQ3BCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNoQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUMsQ0FBQztnQkFDdEIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELE9BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBQyxDQUFDO2dCQUN6QixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFWixPQUFNLElBQUksRUFBQyxDQUFDO29CQUNSLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXBCLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBQyxDQUFDO3dCQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLENBQUM7eUJBQ0csQ0FBQzt3QkFDRCxJQUFJLEdBQUcsR0FBRyxDQUFDO3dCQUNYLE1BQU07b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUcsSUFBSSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDO2dCQUN4RCxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDO29CQUV0QixNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7cUJBQ0csQ0FBQztvQkFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDYixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsa0JBQWtCO1lBQ2QsSUFBSSxRQUFRLEdBQWEsS0FBSyxDQUFDO1lBQy9CLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFDLENBQUM7Z0JBQ3ZCLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDN0MsSUFBRyxRQUFRLEVBQUMsQ0FBQztnQkFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFDLENBQUM7Z0JBQ2pELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXpDLE9BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDO29CQUNwRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDNUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUVaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO29CQUM3QyxJQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUMsQ0FBQzt3QkFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFFRCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2dCQUVELE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxvQkFBb0I7WUFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFdkMsSUFBRyxDQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUM7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUN2QyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFRCxtQkFBbUI7WUFDZixNQUFNLFFBQVEsR0FBYyxFQUFFLENBQUM7WUFFL0IsT0FBTSxJQUFJLEVBQUMsQ0FBQztnQkFDUixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUN0QixVQUFBLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLFVBQUEsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUUzQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRVosUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkMsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUMsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsQ0FBQztxQkFDRyxDQUFDO29CQUNELE1BQU07Z0JBQ1YsQ0FBQztZQUNMLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUV4QyxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxTQUFtQixLQUFLO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixJQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFBLFNBQVMsQ0FBQyxVQUFVLElBQUksVUFBVSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDO2dCQUNyRyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3RDLENBQUM7WUFFRCxJQUFJLElBQVcsQ0FBQztZQUNoQixJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDO2dCQUV2QixNQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQVcsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7aUJBQ0csQ0FBQztnQkFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDdkMsQ0FBQztZQUVELE9BQU0sZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRVosT0FBTSxJQUFJLEVBQUMsQ0FBQztvQkFDUixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDdkMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXBCLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBQyxDQUFDO3dCQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLENBQUM7eUJBQ0csQ0FBQzt3QkFDRCxJQUFJLEdBQUcsR0FBRyxDQUFDO3dCQUNYLE1BQU07b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxhQUFhO1lBQ1QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdDLElBQUcsQ0FBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUV4QyxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU1QyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVELFlBQVk7WUFDUixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFbEMsSUFBRyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFDLENBQUM7Z0JBRXZCLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRVosTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFRCxpQkFBaUI7WUFDYixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFakMsSUFBRyxDQUFFLElBQUksRUFBRSxHQUFHLENBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFFNUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVaLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO2lCQUNHLENBQUM7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7UUFFRCxjQUFjO1lBQ1YsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVaLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN2QyxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBVyxJQUFJLEdBQUcsRUFBQyxDQUFDO29CQUM5QixPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO2dCQUVELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE9BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFXLElBQUksR0FBRyxFQUFDLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDeEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsQ0FBQztnQkFFRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7aUJBQ0ksSUFBRyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUN0QyxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVaLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFbkIsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDO2lCQUNHLENBQUM7Z0JBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNwQyxDQUFDO1FBRUwsQ0FBQztLQUNKO0lBamVZLGdCQUFNLFNBaWVsQixDQUFBO0lBRUQsU0FBZ0IsUUFBUSxDQUFDLEdBQVk7UUFDakMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRmUsa0JBQVEsV0FFdkIsQ0FBQTtJQUVELFNBQWdCLFdBQVcsQ0FBQyxDQUFRLEVBQUUsS0FBYTtRQUMvQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWQsSUFBRyxDQUFDLFlBQVksR0FBRyxFQUFDLENBQUM7WUFDakIsVUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdkMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNMLENBQUM7SUFUZSxxQkFBVyxjQVMxQixDQUFBO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLElBQVc7UUFDdkMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdCLE9BQU8sSUFBSSxHQUFHLENBQWMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUplLHlCQUFlLGtCQUk5QixDQUFBO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQVcsRUFBRSxNQUFhO1FBQ2xELE1BQU0sS0FBSyxHQUFZLEVBQUUsQ0FBQztRQUMxQixXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFFLENBQUM7SUFDdEQsQ0FBQztJQU5lLHFCQUFXLGNBTTFCLENBQUE7SUFFRCxTQUFnQixRQUFRLENBQUMsR0FBVTtRQUMvQixNQUFNLEtBQUssR0FBWSxFQUFFLENBQUM7UUFDMUIsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBTGUsa0JBQVEsV0FLdkIsQ0FBQTtJQUVELFNBQWdCLFVBQVU7UUFDdEIsTUFBTSxLQUFLLEdBQUksVUFBQSxDQUFDLENBQUMsUUFBUSxDQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkksS0FBSSxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUMsQ0FBQztZQUNyQixVQUFBLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNWLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO0lBQ0wsQ0FBQztJQU5lLG9CQUFVLGFBTXpCLENBQUE7QUFFRCxDQUFDLEVBdHlEUyxTQUFTLEtBQVQsU0FBUyxRQXN5RGxCO0FDdHlERCxJQUFJLEtBQVcsQ0FBQztBQUVoQixJQUFVLFNBQVMsQ0FpRWxCO0FBakVELFdBQVUsU0FBUztJQUNuQixFQUFFO0lBQ1csZUFBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7SUFHNUMsU0FBZ0IsQ0FBQyxDQUFDLEVBQVc7UUFDekIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFHLEdBQUcsSUFBSSxTQUFTLEVBQUMsQ0FBQztZQUNqQixHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBUmUsV0FBQyxJQVFoQixDQUFBO0lBRUQsTUFBYSxPQUFRLFNBQVEsS0FBSztRQUM5QixZQUFZLE9BQWdCLEVBQUU7WUFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLENBQUM7S0FDSjtJQUpZLGlCQUFPLFVBSW5CLENBQUE7SUFFRCxNQUFhLFdBQVksU0FBUSxPQUFPO1FBQ3BDLFlBQVksT0FBZ0IsRUFBRTtZQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsQ0FBQztLQUNKO0lBSlkscUJBQVcsY0FJdkIsQ0FBQTtJQUVELFNBQWdCLE1BQU0sQ0FBQyxDQUFXLEVBQUUsTUFBZSxFQUFFO1FBQ2pELElBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNMLENBQUM7SUFKZSxnQkFBTSxTQUlyQixDQUFBO0lBRUQsU0FBZ0IsR0FBRyxDQUFDLEdBQVk7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRmUsYUFBRyxNQUVsQixDQUFBO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLENBQVM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGVBQUssUUFFcEIsQ0FBQTtJQUVELFNBQWdCLGFBQWE7UUFDekIsT0FBTztZQUNILE9BQU8sRUFBRyxvQkFBb0I7WUFDOUIsU0FBUyxFQUFHLG9DQUFvQztZQUNoRCxTQUFTLEVBQUcsMENBQTBDO1lBQ3RELEtBQUssRUFBRyxrQkFBa0I7U0FDN0IsQ0FBQztJQUNOLENBQUM7SUFQZSx1QkFBYSxnQkFPNUIsQ0FBQTtJQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQWdCO1FBQzdELEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRW5CLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUN4QixZQUFZLEVBQUUsS0FBSztZQUNuQixXQUFXLEVBQUcsSUFBSTtZQUNsQixLQUFLLEVBQUcsSUFBSTtZQUNaLE1BQU0sRUFBRyxLQUFLLEVBQUUsa0NBQWtDO1lBQ2xELG1DQUFtQztZQUNuQyxNQUFNLEVBQUcsYUFBYSxFQUFFO1NBQzNCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFYZSx3QkFBYyxpQkFXN0IsQ0FBQTtBQUdELENBQUMsRUFqRVMsU0FBUyxLQUFULFNBQVMsUUFpRWxCO0FDbkVELElBQVUsU0FBUyxDQWdyQmxCO0FBaHJCRCxXQUFVLFNBQVM7SUFRbkIsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxNQUFNLEdBQUcsR0FBaUM7WUFDdEMsS0FBSyxFQUFHLE1BQU07WUFDZCxLQUFLLEVBQUcsUUFBUTtZQUNoQixLQUFLLEVBQUcsU0FBUztZQUNqQixLQUFLLEVBQUcsUUFBUTtZQUNoQixPQUFPLEVBQUcsVUFBVTtZQUNwQixLQUFLLEVBQUcsV0FBVztZQUNuQixHQUFHLEVBQUcsUUFBUTtZQUNkLElBQUksRUFBRyxRQUFRO1lBQ2YsSUFBSSxFQUFHLGNBQWM7WUFDckIsR0FBRyxFQUFHLGNBQWM7WUFDcEIsR0FBRyxFQUFHLGlCQUFpQjtZQUN2QixJQUFJLEVBQUcsMEJBQTBCO1lBQ2pDLElBQUksRUFBRyw2QkFBNkI7WUFDcEMsR0FBRyxFQUFHLE1BQU07WUFDWixHQUFHLEVBQUcsT0FBTztZQUNiLEdBQUcsRUFBRyxPQUFPO1NBQ2hCLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBRyxJQUFJLElBQUksU0FBUyxFQUFDLENBQUM7WUFDbEIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQzthQUNHLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUEyQjtRQUN0QyxLQUFLLEVBQUssTUFBTTtRQUNoQixPQUFPLEVBQUcsT0FBTztRQUNqQixLQUFLLEVBQU0sT0FBTztRQUNsQixNQUFNLEVBQUksYUFBYTtRQUN2QixJQUFJLEVBQU0sWUFBWTtRQUN0QixJQUFJLEVBQU0sY0FBYztRQUN4QixJQUFJLEVBQU0saUJBQWlCO1FBQzNCLElBQUksRUFBTSx3QkFBd0I7UUFDbEMsSUFBSSxFQUFNLDJCQUEyQjtRQUNyQyxNQUFNLEVBQUksT0FBTztLQUNwQixDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUUvQixTQUFTLFFBQVEsQ0FBQyxHQUFZO1FBQzFCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxTQUFTLE9BQU8sQ0FBQyxHQUFZO1FBQ3pCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsU0FBUyxjQUFjLENBQUMsUUFBa0IsRUFBRSxJQUFhO1FBQ3JELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO1lBQ25CLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztZQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsSUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUcsSUFBSSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUNsQixPQUFPLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNMLENBQUM7YUFDRyxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLElBQUcsSUFBSSxJQUFJLElBQUksRUFBQyxDQUFDO2dCQUViLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7WUFDZixJQUFHLFVBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7Z0JBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDNUIsSUFBRyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksS0FBSyxFQUFDLENBQUM7b0JBRTdCLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7WUFDTCxDQUFDO1lBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxJQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO1lBQ2QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxJQUFHLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixnQ0FBZ0M7UUFDcEMsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFHRCxNQUFhLE1BQU07UUFDZixPQUFPLENBQVc7UUFDbEIsS0FBSyxDQUFjO1FBQ25CLEtBQUssQ0FBWTtRQUNqQixHQUFHLENBQWM7UUFFakIsWUFBWSxRQUFrQixFQUFFLEtBQWdCO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUssS0FBSyxDQUFDO1lBQ3JCLEtBQUksTUFBTSxJQUFJLElBQUksS0FBSyxFQUFDLENBQUM7Z0JBQ3JCLElBQUcsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2YseUJBQXlCO2dCQUM3QixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7S0FDSjtJQWhCWSxnQkFBTSxTQWdCbEIsQ0FBQTtJQUVELFNBQWdCLG1CQUFtQixDQUFDLE9BQWtCO1FBQ2xELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLEtBQUksTUFBTSxNQUFNLElBQUksT0FBTyxFQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzNCLEtBQUksTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDO2dCQUM1QixJQUFHLElBQUksSUFBSSxFQUFFLEVBQUMsQ0FBQztvQkFDWCxJQUFHLElBQUksSUFBSSxFQUFFLEVBQUMsQ0FBQzt3QkFDWCxJQUFJLElBQUksR0FBRyxDQUFDO29CQUNoQixDQUFDO29CQUNELElBQUksSUFBSSxJQUFJLENBQUM7Z0JBQ2pCLENBQUM7WUFDTCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzdCLENBQUM7UUFDRCwyQkFBMkI7UUFFM0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQWpCZSw2QkFBbUIsc0JBaUJsQyxDQUFBO0lBRUQsTUFBZSxPQUFPO1FBQ2xCLE9BQU8sQ0FBc0I7UUFDN0IsT0FBTyxDQUFtQjtRQUkxQixJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFFRCxVQUFVO1lBQ04sT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQThCLEVBQUUsY0FBNEM7WUFDdEYsTUFBTSxFQUFFLENBQUM7UUFDYixDQUFDO1FBRUQsR0FBRyxDQUFDLElBQWE7WUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTyxDQUFDLElBQWE7WUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUcsSUFBSSxZQUFZLE9BQU8sRUFBQyxDQUFDO2dCQUV4QixVQUFBLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQyxDQUFDO2lCQUNJLElBQUcsSUFBSSxZQUFZLFFBQVEsRUFBQyxDQUFDO2dCQUU5QixVQUFBLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztpQkFDRyxDQUFDO2dCQUNELE1BQU0sSUFBSSxVQUFBLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUFFRCxNQUFlLFFBQVMsU0FBUSxPQUFPO1FBQ25DLEtBQUssQ0FBYTtRQUVsQixZQUFZLEtBQWlCO1lBQ3pCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVELFVBQVUsQ0FBQyxPQUFrQjtZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQ0o7SUFHRCxNQUFNLE1BQU8sU0FBUSxRQUFRO1FBQ3pCLFlBQVksS0FBaUI7WUFDekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBOEIsRUFBRSxjQUE0QztZQUN0RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRXJELEtBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUM7Z0JBQ3pDLElBQUksS0FBSyxFQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxFQUFDLENBQUM7b0JBQ3RELFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRWxCLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNsQyxDQUFDO0tBQ0o7SUFFRCxNQUFlLE9BQVEsU0FBUSxPQUFPO1FBQ2xDLE9BQU8sQ0FBVztRQUNsQixNQUFNLENBQXNCO1FBRTVCO1lBQ0ksS0FBSyxFQUFFLENBQUM7UUFDWixDQUFDO1FBSUQsVUFBVTtZQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxVQUFVLENBQUMsT0FBa0I7WUFDekIsSUFBSSxJQUFhLENBQUM7WUFDbEIsSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN4QixDQUFDO2lCQUNHLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3QixDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsQ0FBQztRQUNMLENBQUM7UUFFRCxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBOEIsRUFBRSxjQUE0QztZQUN0RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7WUFFL0IsSUFBRyxNQUFNLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzNDLE9BQU0sTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFDLENBQUM7b0JBQy9ELFVBQUEsR0FBRyxDQUFDLDJDQUEyQyxNQUFNLENBQUMsYUFBYSxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO29CQUN4RyxNQUFNLFVBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqQixNQUFNLFFBQVEsQ0FBQztnQkFDbkIsQ0FBQztZQUNMLENBQUM7WUFFRCxNQUFNLFFBQVEsQ0FBQztRQUNuQixDQUFDO0tBQ0o7SUFFRCxNQUFNLE1BQU8sU0FBUSxPQUFPO1FBQ3hCLEdBQUcsQ0FBWTtRQUVmLFlBQVksR0FBYztZQUN0QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxPQUFPO1lBQ0gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQ0o7SUFFRCxNQUFNLE1BQU8sU0FBUSxPQUFPO1FBQ3hCLEdBQUcsQ0FBVTtRQUViLFlBQVksR0FBWTtZQUNwQixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxPQUFPO1lBQ0gsSUFBRyxVQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7Z0JBRXZCLE9BQU8sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hDLENBQUM7aUJBQ0csQ0FBQztnQkFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFDRCx5QkFBeUI7UUFDN0IsQ0FBQztRQUVELEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUE4QixFQUFFLGNBQTRDO1lBQ3RGLElBQUcsY0FBYyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUU1QixNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hELElBQUcsYUFBYSxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUMzQixhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUUvQixJQUFHLE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDM0MsT0FBTSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQztvQkFDL0QsVUFBQSxHQUFHLENBQUMsMENBQTBDLE1BQU0sQ0FBQyxhQUFhLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7b0JBQ3ZHLE1BQU0sVUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sUUFBUSxDQUFDO2dCQUNuQixDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sUUFBUSxDQUFDO1FBQ25CLENBQUM7S0FDSjtJQUVELE1BQU0sTUFBTyxTQUFRLE9BQU87UUFDeEIsR0FBRyxDQUFVO1FBRWIsWUFBWSxHQUFZO1lBQ3BCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDbkIsQ0FBQztRQUVELFVBQVU7WUFDTixJQUFHLElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3RCLFVBQUEsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUNELE1BQU0sSUFBSSxHQUFHO2dCQUNULEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVM7YUFDN0MsQ0FBQztZQUNGLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztnQkFDeEIsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDO1lBQ0QsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxPQUFPO1lBQ0gsT0FBTyxVQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELFVBQVU7WUFDTixNQUFNLElBQUksR0FBRztnQkFDVCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxJQUFJO2FBQ3ZDLENBQUM7WUFDRixJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUM7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNwQixDQUFDO1lBQ0QsSUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO2dCQUNwRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDcEIsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUNKO0lBRUQsTUFBTSxTQUFVLFNBQVEsTUFBTTtRQUMxQixZQUFZLElBQWE7WUFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFFRCxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBOEIsRUFBRSxjQUE0QztZQUN0RixNQUFNLEVBQUUsQ0FBQztRQUNiLENBQUM7S0FDSjtJQUVELFNBQVMsR0FBRyxDQUFDLElBQWE7UUFDdEIsT0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsU0FBUyxHQUFHLENBQUMsR0FBRyxNQUFZO1FBQ3hCLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELFNBQVMsSUFBSSxDQUFDLElBQVcsRUFBRSxTQUFrQjtRQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDO1lBQ2pCLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7YUFDRyxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO1lBQzdCLEtBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztnQkFDbEMsSUFBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUVELE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxHQUFVLEVBQUUsSUFBYztRQUM1QyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQztZQUN6QixJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUNELElBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO2FBQ0ksSUFBRyxJQUFJLElBQUssQ0FBQyxFQUFDLENBQUM7WUFDaEIsVUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsSUFBRyxHQUFHLFlBQVksVUFBQSxHQUFHLEVBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUN2QixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFFaEIsQ0FBQztJQUVELFNBQWdCLFFBQVEsQ0FBQyxHQUE2QjtRQUNsRCxJQUFHLEdBQUcsWUFBWSxPQUFPLEVBQUMsQ0FBQztZQUN2QixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7YUFDSSxJQUFHLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBQyxDQUFDO1lBQzdCLE9BQU8sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQzthQUNJLElBQUcsR0FBRyxZQUFZLFVBQUEsSUFBSSxFQUFDLENBQUM7WUFDekIsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQzthQUNHLENBQUM7WUFDRCxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQWJlLGtCQUFRLFdBYXZCLENBQUE7SUFFRCxTQUFTLFlBQVksQ0FBQyxHQUFVO1FBQzVCLElBQUcsR0FBRyxZQUFZLFVBQUEsTUFBTSxFQUFDLENBQUM7WUFDdEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzVCLE9BQU8sWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO2FBQ0ksSUFBRyxHQUFHLFlBQVksVUFBQSxRQUFRLEVBQUMsQ0FBQztZQUM3QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDaEIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO2FBQ0ksSUFBRyxHQUFHLFlBQVksVUFBQSxHQUFHLEVBQUMsQ0FBQztZQUN4QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFFaEIsSUFBSSxJQUFjLENBQUM7WUFFbkIsSUFBRyxHQUFHLENBQUMsR0FBRyxZQUFZLFVBQUEsR0FBRyxFQUFDLENBQUM7Z0JBRXZCLElBQUcsR0FBRyxDQUFDLEdBQUcsWUFBWSxVQUFBLE1BQU0sRUFBQyxDQUFDO29CQUUxQixJQUFJLEdBQUcsR0FBRyxDQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBRSxDQUFDO2dCQUM5RCxDQUFDO3FCQUNHLENBQUM7b0JBRUQsSUFBSSxHQUFHLEdBQUcsQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBRSxDQUFDO2dCQUN4RSxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFHLEdBQUcsQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFDLENBQUM7Z0JBQzFCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxDQUFDO29CQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUUsQ0FBQztnQkFFMUYsQ0FBQztxQkFDRyxDQUFDO29CQUNELElBQUksR0FBRyxHQUFHLENBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztnQkFDaEYsQ0FBQztZQUNMLENBQUM7aUJBQ0ksSUFBRyxHQUFHLENBQUMsT0FBTyxJQUFJLElBQUksRUFBQyxDQUFDO2dCQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxHQUFHLEdBQUcsQ0FBRSxHQUFHLEVBQUcsTUFBTSxFQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUM3QyxDQUFDO2lCQUNJLElBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVwRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0RCxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQztvQkFFcEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7Z0JBQ3RHLENBQUM7cUJBQ0csQ0FBQztvQkFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3ZGLENBQUM7WUFDTCxDQUFDO2lCQUNJLElBQUcsVUFBQSxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7Z0JBQy9CLElBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksVUFBQSxHQUFHLENBQUMsRUFBQyxDQUFDO29CQUU5RSxJQUFJLEdBQUcsR0FBRyxDQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFBO2dCQUN0QyxDQUFDO3FCQUNJLElBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsQ0FBQztvQkFFM0IsVUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLENBQUM7cUJBQ0ksSUFBRyxHQUFHLENBQUMsT0FBTyxJQUFJLFVBQVUsRUFBQyxDQUFDO29CQUUvQixVQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0QsQ0FBQztxQkFDRyxDQUFDO29CQUVELElBQUksR0FBRyxHQUFHLENBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUE7Z0JBQzdELENBQUM7WUFDTCxDQUFDO2lCQUNHLENBQUM7Z0JBRUQsUUFBTyxHQUFHLENBQUMsT0FBTyxFQUFDLENBQUM7b0JBQ3BCLEtBQUssR0FBRzt3QkFDSixRQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7NEJBQ3hCLEtBQUssQ0FBQztnQ0FDRixNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQzs0QkFFeEIsS0FBSyxDQUFDO2dDQUNGLElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNqQyxNQUFNOzRCQUVWO2dDQUNJLE1BQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQztnQ0FDN0IsS0FBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztvQ0FDdEMsSUFBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7d0NBQ1AsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3Q0FDckMsSUFBRyxDQUFDLElBQUksV0FBVyxFQUFDLENBQUM7NENBRWpCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3Q0FDaEMsQ0FBQzs2Q0FDSSxJQUFHLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDOzRDQUV2QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0NBQ2hDLENBQUM7b0NBQ0wsQ0FBQztvQ0FFRCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7b0NBQ25DLElBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxDQUFDO3dDQUUzQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0NBQ3hDLENBQUM7eUNBQ0csQ0FBQzt3Q0FFRCxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29DQUN6QixDQUFDO2dDQUNMLENBQUM7Z0NBRUQsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUN6QixNQUFNO3dCQUNWLENBQUM7d0JBQ0QsTUFBTTtvQkFFVixLQUFLLEdBQUc7d0JBQ0osUUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDOzRCQUN4QixLQUFLLENBQUM7Z0NBQ0YsTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7NEJBRXhCLEtBQUssQ0FBQztnQ0FDRixJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDakMsTUFBTTs0QkFFVjtnQ0FDSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN2QyxDQUFDO3dCQUNELE1BQU07b0JBRVYsS0FBSyxHQUFHO3dCQUNKLElBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7NEJBQ3JCLHlGQUF5Rjt3QkFDN0YsQ0FBQzs2QkFDSSxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQyxDQUFDOzRCQUMxQix3Q0FBd0M7NEJBQ3hDLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDckMsQ0FBQzs2QkFDRyxDQUFDOzRCQUNELFVBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxDQUFDO3dCQUNELElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN4RSxNQUFNO29CQUVWLEtBQUssR0FBRzt3QkFDSixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6QyxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7NEJBQ3ZCLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVCLENBQUM7NkJBQ0ksSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDOzRCQUM1QixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMxQixDQUFDOzZCQUNHLENBQUM7NEJBQ0QsUUFBUSxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDaEQsQ0FBQzt3QkFFRCxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksVUFBQSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUM7NEJBRWhGLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFBO3dCQUN0RSxDQUFDOzZCQUNHLENBQUM7NEJBRUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN2RCxDQUFDO3dCQUNELE1BQUs7b0JBRVQ7d0JBQ0ksSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQzs0QkFFckIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDekMsQ0FBQzs2QkFDRyxDQUFDOzRCQUVELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3ZDLENBQUM7d0JBQ0QsTUFBSztnQkFDVCxDQUFDO1lBQ0wsQ0FBQztZQUVELDBCQUEwQjtZQUUxQiw4RUFBOEU7WUFDOUUsc0VBQXNFO1lBQ3RFLGdCQUFnQjtZQUNoQixZQUFZO1lBQ1osZ0VBQWdFO1lBQ2hFLDBDQUEwQztZQUMxQyx3QkFBd0I7WUFDeEIsUUFBUTtZQUNSLElBQUk7WUFFSixPQUFPLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQzthQUNHLENBQUM7WUFDRCxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVELFNBQVMsY0FBYyxDQUFDLElBQWMsRUFBRSxLQUFnQjtRQUNwRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpCLElBQUcsSUFBSSxZQUFZLFFBQVEsRUFBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQWM7UUFDdEMsTUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO1FBQzdCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUxlLHFCQUFXLGNBSzFCLENBQUE7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFXO1FBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRWpCLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QixNQUFNLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUxQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFYZSwyQkFBaUIsb0JBV2hDLENBQUE7SUFFTSxLQUFLLFVBQVUsUUFBUSxDQUFDLE1BQXVCLEVBQUUsSUFBVyxFQUFFLEdBQXNDLEVBQUUsY0FBNEM7UUFDckosR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFbkIsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksS0FBSyxFQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxFQUFDLENBQUM7WUFDdEQsSUFBRyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7Z0JBQ1osTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFWCx5QkFBeUI7Z0JBQ3pCLFVBQUEsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxVQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0wsQ0FBQztRQUVELFVBQUEsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVoQyxNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBckJxQixrQkFBUSxXQXFCN0IsQ0FBQTtBQUVELENBQUMsRUFockJTLFNBQVMsS0FBVCxTQUFTLFFBZ3JCbEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgcGFyc2VyX3RzIHtcblxuZXhwb3J0IGVudW0gVG9rZW5UeXBle1xuICAgIHVua25vd24sXG5cbiAgICAvLyDorZjliKXlrZBcbiAgICBpZGVudGlmaWVyLFxuXG4gICAgLy8g44Kv44Op44K5XG4gICAgQ2xhc3MsXG5cbiAgICAvLyDmlbDlgKRcbiAgICBOdW1iZXIsXG5cbiAgICAvLyDoqJjlj7dcbiAgICBzeW1ib2wsXG5cbiAgICAvLyDkuojntIToqp5cbiAgICByZXNlcnZlZFdvcmQsXG5cbiAgICAvLyAjbi5tXG4gICAgcGF0aCxcblxuICAgIC8vIEVuZCBPZiBUZXh0XG4gICAgZW90LFxuXG4gICAgLy8g5oyH5a6a44Gq44GXXG4gICAgYW55LFxuXG4gICAgLy8g6KGM44Kz44Oh44Oz44OIXG4gICAgbGluZUNvbW1lbnQsXG5cbiAgICAvLyDjg5bjg63jg4Pjgq/jgrPjg6Hjg7Pjg4hcbiAgICBibG9ja0NvbW1lbnQsXG5cbiAgICAvLyDmlLnooYxcbiAgICBuZXdMaW5lLFxuXG4gICAgLy8g5paH5a2X5YiXXG4gICAgU3RyaW5nLFxuXG4gICAgLy8g5paH5a2XXG4gICAgY2hhcmFjdGVyLFxuXG4gICAgLy8g5LiN5q2jXG4gICAgaWxsZWdhbFxufVxuXG5cbnZhciBTeW1ib2xUYWJsZSA6IEFycmF5PHN0cmluZz4gPSBuZXcgIEFycmF5PHN0cmluZz4gKFxuICAgIFwiLFwiLFxuICAgIFwiO1wiLFxuICAgIFwiKFwiLFxuICAgIFwiKVwiLFxuICAgIFwiW1wiLFxuICAgIFwiXVwiLFxuICAgIFwie1wiLFxuICAgIFwifVwiLFxuICAgIFwiK1wiLFxuICAgIFwiLVwiLFxuICAgIFwiKlwiLFxuICAgIFwiL1wiLFxuICAgIFwiXlwiLFxuICAgIFwiJVwiLFxuICAgIFwiPVwiLFxuICAgIFwiOlwiLFxuICAgIFwiPFwiLFxuICAgIFwiPlwiLFxuICAgIFwiJFwiLFxuXG4gICAgXCI9PVwiLFxuICAgIFwiIT1cIixcbiAgICBcIjw9XCIsXG4gICAgXCI+PVwiLFxuXG4gICAgXCIkJFwiLFxuICAgIFwiJiZcIixcbiAgICBcInx8XCIsXG4gICAgXCI9PlwiLFxuICAgIFwi4oeUXCIsXG5cbiAgICBcIis9XCIsXG4gICAgXCItPVwiLFxuICAgIFwiKj1cIixcbiAgICBcIi89XCIsXG4gICAgXCIlPVwiLFxuXG4gICAgXCIrK1wiLFxuICAgIFwiLS1cIixcblxuICAgIFwiIVwiLFxuICAgIFwiJlwiLFxuICAgIFwifFwiLFxuICAgIFwiP1wiLFxuKTtcbiAgICBcbnZhciBLZXl3b3JkTWFwIDogU2V0PHN0cmluZz4gPSBuZXcgIFNldDxzdHJpbmc+IChbXG4gICAgXCJsZXRcIlxuXVxuKTtcblxudmFyIElkTGlzdCA6IEFycmF5PHN0cmluZz4gPSBuZXcgIEFycmF5PHN0cmluZz4gKFxuKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTGV0dGVyKHMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHMubGVuZ3RoID09PSAxICYmIChcImFcIiA8PSBzICYmIHMgPD0gXCJ6XCIgfHwgXCJBXCIgPD0gcyAmJiBzIDw9IFwiWlwiIHx8IHMgPT0gXCJfXCIpO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0KHMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHMubGVuZ3RoID09IDEgJiYgXCIwMTIzNDU2Nzg5XCIuaW5kZXhPZihzKSAhPSAtMTtcbn1cblxuZnVuY3Rpb24gaXNJZExldHRlcihzIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0xldHRlcihzKSB8fCBpc0RpZ2l0KHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMZXR0ZXJPckF0KHMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzTGV0dGVyKHNbMF0pIHx8IDIgPD0gcy5sZW5ndGggJiYgc1swXSA9PSBcIkBcIiAmJiBpc0xldHRlcihzWzFdKTtcbn1cbiAgICBcbmV4cG9ydCBlbnVtIFRva2VuU3ViVHlwZSB7XG4gICAgdW5rbm93bixcbiAgICBpbnRlZ2VyLFxuICAgIGZsb2F0LFxuICAgIGRvdWJsZSxcbn1cblxuZXhwb3J0IGNsYXNzIFRva2Vue1xuICAgIHR5cGVUa246VG9rZW5UeXBlO1xuICAgIHN1YlR5cGU6VG9rZW5TdWJUeXBlO1xuICAgIHRleHQ6c3RyaW5nO1xuICAgIGNoYXJQb3M6bnVtYmVyO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHR5cGUgOiBUb2tlblR5cGUsIHN1Yl90eXBlIDogVG9rZW5TdWJUeXBlLCB0ZXh0IDogc3RyaW5nLCBjaGFyX3BvcyA6IG51bWJlcil7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJcIiArIFRva2VuVHlwZVt0eXBlXSArIFwiIFwiICsgVG9rZW5TdWJUeXBlW3N1Yl90eXBlXSArIFwiIFwiICsgdGV4dCArIFwiIFwiICsgY2hhcl9wb3MpO1xuICAgICAgICB0aGlzLnR5cGVUa24gPSB0eXBlO1xuICAgICAgICB0aGlzLnN1YlR5cGUgPSBzdWJfdHlwZTtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5jaGFyUG9zID0gY2hhcl9wb3M7XG4gICAgfVxufSAgICBcblxuZXhwb3J0IGZ1bmN0aW9uIGxleGljYWxBbmFseXNpcyh0ZXh0IDogc3RyaW5nKSA6IFRva2VuW10ge1xuICAgIGNvbnN0IHRva2VucyA6IFRva2VuW10gPSBbXTtcblxuICAgIC8vIOePvuWcqOOBruaWh+Wtl+S9jee9rlxuICAgIGxldCBwb3MgOiBudW1iZXIgPSAwO1xuXG4gICAgd2hpbGUocG9zIDwgdGV4dC5sZW5ndGgpe1xuICAgICAgICBcbiAgICAgICAgLy8g5pS56KGM5Lul5aSW44Gu56m655m944KS44K544Kt44OD44OX44GX44G+44GZ44CCXG4gICAgICAgIGZvciAoIDsgcG9zIDwgdGV4dC5sZW5ndGggJiYgKHRleHRbcG9zXSA9PSAnICcgfHwgdGV4dFtwb3NdID09ICdcXHQnIHx8IHRleHRbcG9zXSA9PSAnXFxyJyk7IHBvcysrKTtcblxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPD0gcG9zKSB7XG4gICAgICAgICAgICAvLyDjg4bjgq3jgrnjg4jjga7ntYLjgo/jgorjga7loLTlkIhcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGFydF9wb3MgPSBwb3M7XG5cbiAgICAgICAgdmFyIHRva2VuX3R5cGUgPSBUb2tlblR5cGUudW5rbm93bjtcbiAgICAgICAgdmFyIHN1Yl90eXBlIDogVG9rZW5TdWJUeXBlID0gVG9rZW5TdWJUeXBlLnVua25vd247XG5cbiAgICAgICAgLy8g54++5Zyo5L2N572u44Gu5paH5a2XXG4gICAgICAgIHZhciBjaDEgOiBzdHJpbmcgPSB0ZXh0W3Bvc107XG5cbiAgICAgICAgLy8g5qyh44Gu5paH5a2X44Gu5L2N572u44CC6KGM5pyr44Gu5aC05ZCI44GvJ1xcMCdcbiAgICAgICAgdmFyIGNoMiA6IHN0cmluZztcblxuICAgICAgICBpZiAocG9zICsgMSA8IHRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyDooYzmnKvjgafjgarjgYTloLTlkIhcblxuICAgICAgICAgICAgY2gyID0gdGV4dFtwb3MgKyAxXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIOihjOacq+OBruWgtOWQiFxuXG4gICAgICAgICAgICBjaDIgPSAnXFwwJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGNoMSA9PSAnXFxuJyl7XG5cbiAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUubmV3TGluZTtcbiAgICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzTGV0dGVyT3JBdChjaDEgKyBjaDIpKXtcbiAgICAgICAgICAgIC8vIOitmOWIpeWtkOOBruacgOWIneOBruaWh+Wtl+OBruWgtOWQiFxuXG4gICAgICAgICAgICAvLyDorZjliKXlrZDjga7mloflrZfjga7mnIDlvozjgpLmjqLjgZfjgb7jgZnjgILorZjliKXlrZDjga7mloflrZfjga/jg6bjg4vjgrPjg7zjg4njgqvjg4bjgrTjg6rjg7zjga7mloflrZfjgYvmlbDlrZfjgYsnXyfjgIJcbiAgICAgICAgICAgIGZvciAocG9zKys7IHBvcyA8IHRleHQubGVuZ3RoICYmIGlzSWRMZXR0ZXIodGV4dFtwb3NdKTsgcG9zKyspO1xuXG4gICAgICAgICAgICAvLyDorZjliKXlrZDjga7mloflrZfliJdcbiAgICAgICAgICAgIHZhciBuYW1lIDogc3RyaW5nID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRfcG9zLCBwb3MpO1xuXG4gICAgICAgICAgICBpZiAoS2V5d29yZE1hcC5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAvLyDlkI3liY3jgYzjgq3jg7zjg6/jg7zjg4novp7mm7jjgavjgYLjgovloLTlkIhcblxuICAgICAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUucmVzZXJ2ZWRXb3JkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5ZCN5YmN44GM44Kt44O844Ov44O844OJ6L6e5pu444Gr44Gq44GE5aC05ZCIXG5cbiAgICAgICAgICAgICAgICBpZiAoSWRMaXN0LmluZGV4T2YobmFtZSkgPT0gLTEpIHtcblxuICAgICAgICAgICAgICAgICAgICBJZExpc3QucHVzaChuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5pZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzRGlnaXQoY2gxKSkge1xuICAgICAgICAgICAgLy8g5pWw5a2X44Gu5aC05ZCIXG5cbiAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUuTnVtYmVyO1xuXG4gICAgICAgICAgICAvLyAxMOmAsuaVsOOBrue1guOCj+OCiuOCkuaOouOBl+OBvuOBmeOAglxuICAgICAgICAgICAgZm9yICg7IHBvcyA8IHRleHQubGVuZ3RoICYmIGlzRGlnaXQodGV4dFtwb3NdKTsgcG9zKyspO1xuXG4gICAgICAgICAgICBpZiAocG9zIDwgdGV4dC5sZW5ndGggJiYgdGV4dFtwb3NdID09ICcuJykge1xuICAgICAgICAgICAgICAgIC8vIOWwj+aVsOeCueOBruWgtOWQiFxuXG4gICAgICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgICAgICAvLyAxMOmAsuaVsOOBrue1guOCj+OCiuOCkuaOouOBl+OBvuOBmeOAglxuICAgICAgICAgICAgICAgIGZvciAoOyBwb3MgPCB0ZXh0Lmxlbmd0aCAmJiBpc0RpZ2l0KHRleHRbcG9zXSk7IHBvcysrKTtcblxuICAgICAgICAgICAgICAgIHN1Yl90eXBlID0gVG9rZW5TdWJUeXBlLmZsb2F0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBzdWJfdHlwZSA9IFRva2VuU3ViVHlwZS5pbnRlZ2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY2gxID09IFwiI1wiKXtcblxuICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5wYXRoO1xuXG4gICAgICAgICAgICBmb3IgKHBvcysrOyBwb3MgPCB0ZXh0Lmxlbmd0aCAmJiAoaXNEaWdpdCh0ZXh0W3Bvc10pIHx8IHRleHRbcG9zXSA9PSAnLScgfHwgdGV4dFtwb3NdID09IHBhdGhTZXApOyBwb3MrKyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjaDEgPT0gJ1wiJyl7XG4gICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLlN0cmluZztcbiAgICAgICAgICAgIHBvcyA9IHRleHQuaW5kZXhPZignXCInLCBwb3MgKyAxKTtcbiAgICAgICAgICAgIGFzc2VydChwb3MgIT0gLTEpO1xuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoU3ltYm9sVGFibGUuaW5kZXhPZihcIlwiICsgY2gxICsgY2gyKSAhPSAtMSkge1xuICAgICAgICAgICAgLy8gMuaWh+Wtl+OBruiomOWPt+OBruihqOOBq+OBguOCi+WgtOWQiFxuXG4gICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLnN5bWJvbDtcbiAgICAgICAgICAgIHBvcyArPSAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKFN5bWJvbFRhYmxlLmluZGV4T2YoXCJcIiArIGNoMSkgIT0gLTEpIHtcbiAgICAgICAgICAgIC8vIDHmloflrZfjga7oqJjlj7fjga7ooajjgavjgYLjgovloLTlkIhcblxuICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5zeW1ib2w7XG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIOS4jeaYjuOBruaWh+Wtl+OBruWgtOWQiFxuXG4gICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLnVua25vd247XG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5LiN5piOIHswfVwiLCB0ZXh0LnN1YnN0cmluZyhzdGFydF9wb3MsIHBvcyksIFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5a2X5Y+l44Gu5paH5a2X5YiX44KS5b6X44G+44GZ44CCXG4gICAgICAgIHZhciB3b3JkIDogc3RyaW5nO1xuICAgICAgICBpZih0b2tlbl90eXBlID09IFRva2VuVHlwZS5TdHJpbmcpe1xuICAgICAgICAgICAgd29yZCA9IHRleHQuc3Vic3RyaW5nKHN0YXJ0X3BvcyArIDEsIHBvcyAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB3b3JkID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRfcG9zLCBwb3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW4gPSBuZXcgVG9rZW4odG9rZW5fdHlwZSwgc3ViX3R5cGUsIHdvcmQsIHN0YXJ0X3Bvcyk7XG5cbiAgICAgICAgLy8gbXNnKGAke3Rva2VuLmNoYXJQb3N9IFske3Rva2VuLnRleHR9XSAke3Rva2VuLnR5cGVUa259ICR7dG9rZW4uc3ViVHlwZX1gKTtcblxuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2Vucztcbn1cblxuXG59IiwibmFtZXNwYWNlIHBhcnNlcl90cyB7XG5cbmV4cG9ydCBsZXQgdGVybURpYyA6IHsgW2lkIDogbnVtYmVyXSA6IFRlcm0gfSA9IHt9O1xuXG5leHBvcnQgY29uc3QgcGF0aFNlcCA9IFwiOlwiO1xuZXhwb3J0IGxldCB2YXJpYWJsZXMgOiBWYXJpYWJsZVtdID0gW107XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NoYXBlTmFtZShuYW1lIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5hbWVzID0gW1xuICAgICAgICBcIlBvaW50XCIsIFwiQ2lyY2xlXCIsIFwiQXJjXCIsIFwiVHJpYW5nbGVcIiwgXG4gICAgICAgIFwiTGluZUJ5UG9pbnRzXCIsIFwiSGFsZkxpbmVcIiwgXCJMaW5lXCIsXG4gICAgICAgIFwiSW50ZXJzZWN0aW9uXCIsIFwiRm9vdFwiLCBcIkFuZ2xlXCIsIFwiUGFyYWxsZWxcIiwgXCJUaHVtYlwiXG4gICAgXTtcbiAgICByZXR1cm4gbmFtZXMuaW5jbHVkZXMobmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5c3RlbU5hbWUobmFtZSA6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICBjb25zdCBuYW1lcyA9IFtcbiAgICAgICAgXCJyYW5nZVwiLFxuICAgICAgICBcInNxcnRcIixcbiAgICAgICAgXCJsZW5ndGhcIlxuICAgIF07XG4gICAgcmV0dXJuIGlzU2hhcGVOYW1lKG5hbWUpIHx8IG5hbWVzLmluY2x1ZGVzKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWxhdGlvblRva2VuKHRleHQgOiBzdHJpbmcpe1xuICAgIHJldHVybiBbIFwiPT1cIiwgXCI9XCIsIFwiIT1cIiwgXCI8XCIsIFwiPlwiLCBcIjw9XCIsIFwiPj1cIiwgXCJpblwiLCBcIm5vdGluXCIsIFwic3Vic2V0XCIgXS5pbmNsdWRlcyh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gaXNBcml0aG1ldGljVG9rZW4odGV4dCA6IHN0cmluZyl7XG4gICAgcmV0dXJuIFtcImN1cFwiLCBcImNhcFwiXS5pbmNsdWRlcyh0ZXh0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhcmlhYmxlKG5hbWUgOiBzdHJpbmcpIDogVmFyaWFibGUge1xuICAgIGNvbnN0IHZhID0gdmFyaWFibGVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gbmFtZSkhO1xuICAgIGFzc2VydCh2YSAhPSB1bmRlZmluZWQpO1xuICAgIHJldHVybiB2YTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBaZXJvKCkgOiBDb25zdE51bSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdE51bSgwKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uUmVmKG5hbWUgOiBzdHJpbmcpIDogUmVmVmFyIHtcbiAgICByZXR1cm4gbmV3IFJlZlZhcihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWF0aCh0ZXh0OiBzdHJpbmcpIDogVGVybSB7XG4gICAgLy8gbXNnKGBwYXJzZS1NYXRoOlske3RleHR9XWApO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIodGV4dCk7XG4gICAgY29uc3QgdHJtID0gcGFyc2VyLlJvb3RFeHByZXNzaW9uKCk7XG4gICAgaWYocGFyc2VyLnRva2VuLnR5cGVUa24gIT0gVG9rZW5UeXBlLmVvdCl7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuICAgIH1cblxuICAgIHRybS5zZXRQYXJlbnQobnVsbCk7XG5cbiAgICByZXR1cm4gdHJtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UmVmVmFycyhyb290IDogVGVybSl7XG4gICAgY29uc3QgYWxsX3JlZnMgPSBhbGxUZXJtcyhyb290KS5maWx0ZXIoeCA9PiB4IGluc3RhbmNlb2YgUmVmVmFyICYmIGlzTGV0dGVyKHgubmFtZVswXSkgJiYgIWlzU3lzdGVtTmFtZSh4Lm5hbWUpKSBhcyBSZWZWYXJbXTtcbiAgICBmb3IoY29uc3QgcmVmIG9mIGFsbF9yZWZzKXtcbiAgICAgICAgcmVmLnJlZlZhciA9IHZhcmlhYmxlcy5maW5kKHggPT4geC5uYW1lID09IHJlZi5uYW1lKTtcbiAgICAgICAgYXNzZXJ0KHJlZi5yZWZWYXIgIT0gdW5kZWZpbmVkKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0dyZWVrKHRleHQgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgYXNzZXJ0KHR5cGVvZiB0ZXh0ID09IFwic3RyaW5nXCIpO1xuICAgIGlmKHRleHQubGVuZ3RoID09IDApe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZ3JlZWtzID0gW1xuICAgICAgICBcImFscGhhXCIsIFwiYmV0YVwiLCBcImdhbW1hXCIsIFwiZGVsdGFcIiwgXCJlcHNpbG9uXCIsIFwidmFyZXBzaWxvblwiLCBcInpldGFcIiwgXCJldGFcIiwgXCJ0aGV0YVwiLCBcbiAgICAgICAgXCJ2YXJ0aGV0YVwiLCBcImlvdGFcIiwgXCJrYXBwYVwiLCBcImxhbWJkYVwiLCBcIm11XCIsIFwibnVcIiwgXCJ4aVwiLCBcInBpXCIsIFwidmFycGlcIiwgXCJyaG9cIiwgXCJ2YXJyaG9cIiwgXG4gICAgICAgIFwic2lnbWFcIiwgXCJ2YXJzaWdtYVwiLCBcInRhdVwiLCBcInVwc2lsb25cIiwgXCJwaGlcIiwgXCJ2YXJwaGlcIiwgXCJjaGlcIiwgXCJwc2lcIiwgXCJvbWVnYVwiXG4gICAgXTtcblxuICAgIGlmKGdyZWVrcy5pbmNsdWRlcyh0ZXh0KSl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGxvd2VyX2Nhc2UgPSB0ZXh0WzBdLnRvTG93ZXJDYXNlKCkgKyB0ZXh0LnN1YnN0cmluZygxKTsgICAgXG4gICAgaWYoZ3JlZWtzLmluY2x1ZGVzKGxvd2VyX2Nhc2UpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGV4TmFtZSh0ZXh0IDogc3RyaW5nKXtcbiAgICBzd2l0Y2godGV4dCl7XG4gICAgY2FzZSBcIj09XCIgICAgIDogcmV0dXJuIFwiPVwiO1xuICAgIGNhc2UgXCIhPVwiICAgICA6IHJldHVybiBcIlxcXFxuZVwiO1xuICAgIGNhc2UgXCI8XCIgICAgICA6IHJldHVybiBcIlxcXFxsdFwiO1xuICAgIGNhc2UgXCI+XCIgICAgICA6IHJldHVybiBcIlxcXFxndFwiO1xuICAgIGNhc2UgXCI8PVwiICAgICA6IHJldHVybiBcIlxcXFxsZVwiO1xuICAgIGNhc2UgXCI+PVwiICAgICA6IHJldHVybiBcIlxcXFxnZVwiO1xuICAgIGNhc2UgXCIqXCIgICAgICA6IHJldHVybiBcIlxcXFxjZG90XCI7XG4gICAgY2FzZSBcIj0+XCIgICAgIDogcmV0dXJuIFwiXFxcXGltcGxpZXNcIjtcbiAgICBjYXNlIFwiJiZcIiAgICAgOiByZXR1cm4gXCJcXFxcbGFuZFwiO1xuICAgIGNhc2UgXCJ8fFwiICAgICA6IHJldHVybiBcIlxcXFxsb3JcIjtcbiAgICBjYXNlIFwiaGJhclwiICAgOiByZXR1cm4gXCJcXFxcaGJhclwiO1xuICAgIGNhc2UgXCJuYWJsYVwiICA6IHJldHVybiBcIlxcXFxuYWJsYVwiO1xuICAgIGNhc2UgXCJuYWJsYTJcIiA6IHJldHVybiBcIlxcXFxuYWJsYV4yXCI7XG4gICAgY2FzZSBcInN1YnNldFwiIDogcmV0dXJuIFwiXFxcXHN1YnNldGVxXCI7XG4gICAgY2FzZSBcImluZnR5XCIgIDogcmV0dXJuIFwiXFxcXGluZnR5XCI7XG4gICAgY2FzZSBcImN1cFwiOlxuICAgIGNhc2UgXCJjYXBcIjpcbiAgICBjYXNlIFwic2luXCI6XG4gICAgY2FzZSBcImNvc1wiOlxuICAgIGNhc2UgXCJ0YW5cIjpcbiAgICBjYXNlIFwiaW5cIiAgIDpcbiAgICBjYXNlIFwibm90aW5cIjpcbiAgICAgICAgcmV0dXJuIGBcXFxcJHt0ZXh0fWA7XG4gICAgfVxuXG4gICAgaWYoaXNHcmVlayh0ZXh0KSl7XG4gICAgICAgIHJldHVybiBgXFxcXCR7dGV4dH1gO1xuICAgIH1cblxuICAgIHJldHVybiB0ZXh0O1xufVxuXG5sZXQgdGVybUlkIDogbnVtYmVyID0gMDtcblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFse1xuICAgIG51bWVyYXRvciA6IG51bWJlciA9IDE7XG4gICAgZGVub21pbmF0b3IgOiBudW1iZXIgPSAxO1xuICAgIHBhcmVudCA6IFRlcm0gfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKG51bWVyYXRvciA6IG51bWJlciwgZGVub21pbmF0b3IgOiBudW1iZXIgPSAxKXtcbiAgICAgICAgdGhpcy5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcbiAgICB9XG5cbiAgICBlcShyIDogUmF0aW9uYWwpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybih0aGlzLm51bWVyYXRvciA9PSByLm51bWVyYXRvciAmJiB0aGlzLmRlbm9taW5hdG9yID09IHIuZGVub21pbmF0b3IpO1xuICAgIH1cblxuICAgIGlzKG51bWVyYXRvciA6IG51bWJlciwgZGVub21pbmF0b3IgOiBudW1iZXIgPSAxKSA6IGJvb2xlYW57XG4gICAgICAgIHJldHVybih0aGlzLm51bWVyYXRvciA9PSBudW1lcmF0b3IgJiYgdGhpcy5kZW5vbWluYXRvciA9PSBkZW5vbWluYXRvcik7XG4gICAgfVxuXG4gICAgc2V0KG51bWVyYXRvciA6IG51bWJlciwgZGVub21pbmF0b3IgOiBudW1iZXIgPSAxKXtcbiAgICAgICAgdGhpcy5udW1lcmF0b3IgICA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgIH1cblxuICAgIGNsb25lKCkgOiBSYXRpb25hbCB7XG4gICAgICAgIHJldHVybiBuZXcgUmF0aW9uYWwodGhpcy5udW1lcmF0b3IsIHRoaXMuZGVub21pbmF0b3IpO1xuICAgIH1cblxuICAgIHN0cigpIDogc3RyaW5nIHtcbiAgICAgICAgaWYodGhpcy5kZW5vbWluYXRvciA9PSAxKXtcblxuICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMubnVtZXJhdG9yfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMubnVtZXJhdG9yfSAvICR7dGhpcy5kZW5vbWluYXRvcn1gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGV4KCkgOiBzdHJpbmcge1xuICAgICAgICBpZih0aGlzLmRlbm9taW5hdG9yID09IDEpe1xuXG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5udW1lcmF0b3J9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICByZXR1cm4gYFxcXFxmcmFjeyR7dGhpcy5udW1lcmF0b3J9fXske3RoaXMuZGVub21pbmF0b3J9fWA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRSYXRpb25hbChyIDogUmF0aW9uYWwpe1xuICAgICAgICBjb25zdCBvbGRfZnZhbCA9IHRoaXMuZnZhbCgpO1xuXG4gICAgICAgIHRoaXMubnVtZXJhdG9yID0gdGhpcy5udW1lcmF0b3IgKiByLmRlbm9taW5hdG9yICsgci5udW1lcmF0b3IgKiB0aGlzLmRlbm9taW5hdG9yO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yICo9IHIuZGVub21pbmF0b3I7XG5cbiAgICAgICAgYXNzZXJ0KE1hdGguYWJzKG9sZF9mdmFsICsgci5mdmFsKCkgLSB0aGlzLmZ2YWwoKSkgPCAwLjAwMDAwMDAxKTtcbiAgICB9XG5cbiAgICBzZXRtdWwoLi4uIHJzIDogUmF0aW9uYWxbXSl7XG4gICAgICAgIHRoaXMubnVtZXJhdG9yICAgKj0gcnMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICogY3VyLm51bWVyYXRvciwgICAxKTtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciAqPSBycy5yZWR1Y2UoKGFjYywgY3VyKSA9PiBhY2MgKiBjdXIuZGVub21pbmF0b3IsIDEpO1xuICAgIH1cblxuICAgIHNldGRpdihyIDogUmF0aW9uYWwpe1xuICAgICAgICB0aGlzLm51bWVyYXRvciAgICo9IHIuZGVub21pbmF0b3I7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgKj0gci5udW1lcmF0b3I7XG4gICAgfVxuXG4gICAgZnZhbCgpIDogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubnVtZXJhdG9yIC8gdGhpcy5kZW5vbWluYXRvcjtcbiAgICB9XG5cbiAgICBhYnMoKSA6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLmZ2YWwoKSk7XG4gICAgfVxuXG4gICAgc2V0QWJzKCkge1xuICAgICAgICB0aGlzLm51bWVyYXRvciAgID0gTWF0aC5hYnModGhpcy5udW1lcmF0b3IpO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yID0gTWF0aC5hYnModGhpcy5kZW5vbWluYXRvcik7XG4gICAgfVxuXG4gICAgaXNJbnQoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW5vbWluYXRvciA9PSAxO1xuICAgIH1cblxuICAgIGlzRGl2aXNvcihyIDogUmF0aW9uYWwpIDogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IG51bWVyYXRvciAgID0gci5udW1lcmF0b3IgKiB0aGlzLmRlbm9taW5hdG9yO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IHIuZGVub21pbmF0b3IgKiB0aGlzLm51bWVyYXRvcjtcblxuICAgICAgICByZXR1cm4gbnVtZXJhdG9yICUgZGVub21pbmF0b3IgPT0gMDtcbiAgICB9XG5cbiAgICBpbnQoKSA6IG51bWJlciB7XG4gICAgICAgIGFzc2VydCh0aGlzLmRlbm9taW5hdG9yID09IDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5udW1lcmF0b3I7XG4gICAgfVxuXG4gICAgc2lnbigpIDogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc2lnbih0aGlzLmZ2YWwoKSk7XG4gICAgfVxuXG4gICAgY2hhbmdlU2lnbigpe1xuICAgICAgICB0aGlzLm51bWVyYXRvciAqPSAtMTtcbiAgICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZXJtIHtcbiAgICBzdGF0aWMgdGFiSWR4Q250IDogbnVtYmVyID0gMDtcbiAgICBpZCA6IG51bWJlcjtcbiAgICB0YWJJZHggOiBudW1iZXIgPSAwO1xuICAgIHBhcmVudCA6IEFwcCB8IG51bGwgPSBudWxsO1xuICAgIGNsb25lRnJvbSA6IFRlcm0gfCB1bmRlZmluZWQ7XG5cbiAgICAvLyDkv4LmlbBcbiAgICB2YWx1ZSA6IFJhdGlvbmFsID0gbmV3IFJhdGlvbmFsKDEpO1xuXG4gICAgY2FuY2VsZWQgOiBib29sZWFuID0gZmFsc2U7XG4gICAgY29sb3JOYW1lICA6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBoYXNoIDogYmlnaW50ID0gMG47XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmlkID0gdGVybUlkKys7XG4gICAgICAgIHRoaXMudmFsdWUucGFyZW50ID0gdGhpcztcbiAgICB9XG5cbiAgICBhYnN0cmFjdCB0ZXgyKCkgOiBzdHJpbmc7XG4gICAgYWJzdHJhY3QgY2xvbmUoKSA6IFRlcm07XG4gICAgYWJzdHJhY3Qgc3RyaWQoKSA6IHN0cmluZztcblxuICAgIHVuY29sb3IoKXtcbiAgICAgICAgdGhpcy5jb2xvck5hbWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmVkKCl7XG4gICAgICAgIHRoaXMuY29sb3JOYW1lID0gXCJyZWRcIjtcbiAgICB9XG5cbiAgICBibHVlKCl7XG4gICAgICAgIHRoaXMuY29sb3JOYW1lID0gXCJibHVlXCI7XG4gICAgfVxuXG4gICAgY29sb3JlZCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvck5hbWUgIT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGVxKHRybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cigpID09IHRybS5zdHIoKTtcbiAgICB9XG5cbiAgICBlcXVhbCh0cm0gOiBUZXJtKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS5lcSh0cm0udmFsdWUpO1xuICAgIH1cblxuICAgIGNvcHkoZHN0IDogVGVybSl7XG4gICAgICAgIGRzdC5jbG9uZUZyb20gPSB0aGlzO1xuICAgICAgICBkc3QudmFsdWUgID0gdGhpcy52YWx1ZS5jbG9uZSgpO1xuICAgICAgICBkc3QudmFsdWUucGFyZW50ID0gZHN0O1xuXG4gICAgICAgIGRzdC5jYW5jZWxlZCA9IHRoaXMuY2FuY2VsZWQ7XG4gICAgICAgIGRzdC5jb2xvck5hbWUgID0gdGhpcy5jb2xvck5hbWU7XG4gICAgfVxuXG5cbiAgICBjaGFuZ2VTaWduKCl7XG4gICAgICAgIHRoaXMudmFsdWUuY2hhbmdlU2lnbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIOOCs+ODlOODvOOBl+OBn+ODq+ODvOODiOOBqOOAgXRoaXPjgajlkIzjgZjkvY3nva7jga7poIXjgpLov5TjgZnjgIJcbiAgICAgKi9cbiAgICBjbG9uZVJvb3QoKSA6IFsgQXBwLCBUZXJtXSB7XG4gICAgICAgIC8vIOODq+ODvOODiOOBi+OCiXRoaXPjgavoh7Pjgovjg5HjgrnjgpLlvpfjgovjgIJcbiAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpO1xuXG4gICAgICAgIC8vIOODq+ODvOODiOOCkuW+l+OCi+OAglxuICAgICAgICBjb25zdCByb290ID0gdGhpcy5nZXRSb290KCk7XG4gICAgICAgIGFzc2VydChwYXRoLmdldFRlcm0ocm9vdCkgPT0gdGhpcyk7XG5cbiAgICAgICAgLy8g44Or44O844OI44KS44Kz44OU44O844GZ44KL44CCXG4gICAgICAgIGNvbnN0IHJvb3RfY3AgPSByb290LmNsb25lKCk7XG5cbiAgICAgICAgLy8g44Kz44OU44O844GX44Gf44Or44O844OI44GL44KJ5ZCM44GY44OR44K544KS6L6/44Gj44Gm6aCF44KS5b6X44KL44CCXG4gICAgICAgIGNvbnN0IHRoaXNfY3AgPSBwYXRoLmdldFRlcm0ocm9vdF9jcCk7XG4gICAgICAgIGFzc2VydCh0aGlzX2NwLnN0cigpID09IHRoaXMuc3RyKCkpO1xuXG4gICAgICAgIC8vIOOCs+ODlOODvOOBl+OBn+ODq+ODvOODiOOBqOOAgXRoaXPjgajlkIzjgZjkvY3nva7jga7poIXjgpLov5TjgZnjgIJcbiAgICAgICAgcmV0dXJuIFtyb290X2NwLCB0aGlzX2NwXTtcbiAgICB9XG5cbiAgICBnZXRQYXRoKHBhdGggOiBQYXRoID0gbmV3IFBhdGgoW10pKSA6IFBhdGgge1xuICAgICAgICBpZih0aGlzLnBhcmVudCA9PSBudWxsKXtcblxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlkeCA6IG51bWJlcjtcbiAgICAgICAgaWYodGhpcy5wYXJlbnQuZm5jID09IHRoaXMpe1xuICAgICAgICAgICAgaWR4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgaWR4ID0gdGhpcy5hcmdJZHgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguaW5kZXhlcy51bnNoaWZ0KGlkeCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXRQYXRoKHBhdGgpO1xuICAgIH1cblxuICAgIGdldFJvb3QoKSA6IEFwcCB7XG4gICAgICAgIGlmKHRoaXMucGFyZW50ID09IG51bGwpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEFwcCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50IS5nZXRSb290KCk7XG4gICAgfVxuXG4gICAgZ2V0Um9vdEVxU2lkZUlkeCgpIDogbnVtYmVyIHtcbiAgICAgICAgZm9yKGxldCB0ZXJtIDogVGVybSA9IHRoaXM7IHRlcm0ucGFyZW50ICE9IG51bGw7IHRlcm0gPSB0ZXJtLnBhcmVudCl7XG4gICAgICAgICAgICBpZih0ZXJtLnBhcmVudC5pc1Jvb3RFcSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVybS5hcmdJZHgoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgfVxuXG4gICAgZ2V0RXFTaWRlKCkgOiBUZXJtIHwgbnVsbCB7XG4gICAgICAgIGZvcihsZXQgdGVybSA6IFRlcm0gPSB0aGlzOyB0ZXJtLnBhcmVudCAhPSBudWxsOyB0ZXJtID0gdGVybS5wYXJlbnQhKXtcbiAgICAgICAgICAgIGlmKHRlcm0ucGFyZW50LmlzUm9vdEVxKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXJtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgc2V0UGFyZW50KHBhcmVudCA6IEFwcCB8IG51bGwpe1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy52YWx1ZS5wYXJlbnQgPSB0aGlzO1xuICAgIH1cblxuICAgIHNldFRhYklkeCgpe1xuICAgICAgICB0aGlzLnRhYklkeCA9ICsrVGVybS50YWJJZHhDbnQ7XG4gICAgfVxuXG4gICAgdmVyaWZ5UGFyZW50KHBhcmVudCA6IEFwcCB8IG51bGwpe1xuICAgICAgICBhc3NlcnQodGhpcy5wYXJlbnQgPT0gcGFyZW50KTtcbiAgICAgICAgYXNzZXJ0KHRoaXMudmFsdWUucGFyZW50ID09IHRoaXMpXG4gICAgfVxuXG4gICAgdmVyaWZ5UGFyZW50Migpe1xuICAgICAgICB0aGlzLnZlcmlmeVBhcmVudCh0aGlzLnBhcmVudCk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVRlcm0odGFyZ2V0IDogVGVybSl7XG4gICAgICAgIGNvbnN0IGFwcCA6IEFwcCA9IHRoaXMucGFyZW50ITtcbiAgICAgICAgYXNzZXJ0KGFwcCAhPSBudWxsLCBcInJlcGxhY2VcIik7XG5cbiAgICAgICAgaWYoYXBwLmZuYyA9PSB0aGlzKXtcbiAgICAgICAgICAgIGFwcC5mbmMgPSB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IGFwcC5hcmdzLmZpbmRJbmRleCh4ID0+IHggPT0gdGhpcyk7XG4gICAgICAgICAgICBhc3NlcnQoaWR4ICE9IC0xLCBcInJlcGxhY2UgaWR4XCIpO1xuICAgICAgICAgICAgYXBwLmFyZ3NbaWR4XSA9IHRhcmdldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldC5wYXJlbnQgPSBhcHA7XG4gICAgfVxuXG4gICAgYXJnSWR4KCkgOiBudW1iZXIge1xuICAgICAgICBpZih0aGlzLnBhcmVudCA9PSBudWxsKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLnBhcmVudC5hcmdzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIGFzc2VydChpZHggIT0gLTEsIFwiYXJnIGlkeFwiKTtcblxuICAgICAgICByZXR1cm4gaWR4O1xuICAgIH1cblxuICAgIGFyZ1NoaWZ0KGRpZmYgOiBudW1iZXIpe1xuICAgICAgICBjb25zdCBpZHggPSB0aGlzLmFyZ0lkeCgpO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudCBhcyBBcHA7XG4gICAgICAgIHBhcmVudC5hcmdzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICBwYXJlbnQuYXJncy5zcGxpY2UoaWR4ICsgZGlmZiwgMCwgdGhpcyk7XG4gICAgfVxuXG4gICAgcmVtQXJnKCkge1xuICAgICAgICBpZih0aGlzLnBhcmVudCA9PSBudWxsKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLmFyZ0lkeCgpO1xuICAgICAgICB0aGlzLnBhcmVudC5hcmdzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgICAgIGlmKHRoaXMucGFyZW50LmFyZ3MubGVuZ3RoID09IDEpe1xuICAgICAgICAgICAgLy8gdGhpcy5wYXJlbnQub25lQXJnKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdXRWYWx1ZSh0ZXh0IDogc3RyaW5nLCBpbl90ZXggOiBib29sZWFuKSA6IHN0cmluZyB7XG4gICAgICAgIGxldCB2YWwgOiBzdHJpbmc7XG5cbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIENvbnN0TnVtKXtcblxuICAgICAgICAgICAgdmFsID0gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICBhc3NlcnQodGhpcy52YWx1ZSBpbnN0YW5jZW9mIFJhdGlvbmFsKTtcbiAgICAgICAgICAgIGlmKHRoaXMudmFsdWUuZnZhbCgpID09IDEpe1xuICAgICAgICAgICAgICAgIHZhbCA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMudmFsdWUuZnZhbCgpID09IC0xKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmlzQWRkKCkpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IGAtICgke3RleHR9KWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFsID0gYC0gJHt0ZXh0fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLnZhbHVlLmRlbm9taW5hdG9yID09IDEpe1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgb3ByID0gKGluX3RleCA/IFwiXFxcXGNkb3RcIiA6IFwiKlwiKTtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmlzQWRkKCkpe1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSBgJHt0aGlzLnZhbHVlLm51bWVyYXRvcn0gJHtvcHJ9ICgke3RleHR9KWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gYCR7dGhpcy52YWx1ZS5udW1lcmF0b3J9ICR7b3ByfSAke3RleHR9YFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50ICE9IG51bGwgJiYgdGhpcyAhPSB0aGlzLnBhcmVudC5mbmMgJiYgdGhpcy5wYXJlbnQuaXNBZGQoKSl7XG4gICAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLmFyZ0lkeCgpO1xuXG4gICAgICAgICAgICBpZihpZHggIT0gMCl7XG5cbiAgICAgICAgICAgICAgICBpZigwIDw9IHRoaXMudmFsdWUuZnZhbCgpKXtcblxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBcIisgXCIgKyB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoaW5fdGV4KXtcblxuICAgICAgICAgICAgaWYodGhpcy5jb2xvcmVkKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBge1xcXFxjb2xvcnske3RoaXMuY29sb3JOYW1lfX0gJHt2YWx9fWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY2FuY2VsZWQpe1xuICAgICAgICAgICAgICAgIHJldHVybiBgXFxcXGNhbmNlbHske3ZhbH19YFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBzdHIyKCkgOiBzdHJpbmcge1xuICAgICAgICBhc3NlcnQoZmFsc2UsIFwic3RyMlwiKTtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgc3RyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHJYKCk7XG4gICAgfVxuXG4gICAgc3RyWCgpIDogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuc3RyMigpO1xuICAgICAgICByZXR1cm4gdGhpcy5wdXRWYWx1ZSh0ZXh0LCBmYWxzZSk7XG4gICAgfVxuXG5cbiAgICBodG1sZGF0YSh0ZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XG4gICAgICAgIHRlcm1EaWNbdGhpcy5pZF0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gYFxcXFxodG1sRGF0YXtpZD0ke3RoaXMuaWR9LCB0YWJpZHg9JHt0aGlzLnRhYklkeH19eyR7dGV4dH19YDtcbiAgICB9XG4gICAgXG4gICAgdGV4KCkgOiBzdHJpbmcge1xuICAgICAgICBsZXQgdGV4dCA9IHRoaXMudGV4MigpO1xuXG4gICAgICAgIGlmKHRoaXMuY29sb3JlZCgpKXtcblxuICAgICAgICAgICAgdGV4dCA9IGB7XFxcXGNvbG9yeyR7dGhpcy5jb2xvck5hbWV9fSAke3RoaXMucHV0VmFsdWUodGV4dCwgdHJ1ZSl9fWA7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhpcy5odG1sZGF0YSh0aGlzLnB1dFZhbHVlKHRleHQsIHRydWUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICB0ZXh0ID0gdGhpcy5wdXRWYWx1ZSh0ZXh0LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBDb25zdE51bSB8fCB0aGlzIGluc3RhbmNlb2YgUmVmVmFyIHx8IHRoaXMgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgdGV4dCA9IGBcXFxcaHRtbElke3RleC10ZXJtLSR7dGhpcy5pZH19eyR7dGV4dH19YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIGlzQXBwKGZuY19uYW1lIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiB0aGlzLmZuY05hbWUgPT0gZm5jX25hbWU7XG4gICAgfVxuXG4gICAgaXNPcGVyYXRvcigpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMucHJlY2VkZW5jZSgpICE9IC0xO1xuICAgIH1cblxuICAgIGlzTmFtZWRGbmMoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIFJlZlZhciAmJiBpc0xldHRlcih0aGlzLm5hbWVbMF0pO1xuICAgIH1cblxuICAgIGlzT3ByRm5jKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBSZWZWYXIgJiYgISBpc0xldHRlcih0aGlzLm5hbWVbMF0pO1xuICAgIH1cblxuICAgIGlzRXEoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiAodGhpcy5mbmNOYW1lID09IFwiPT1cIiB8fCB0aGlzLmZuY05hbWUgPT0gXCI9XCIpO1xuICAgIH1cblxuICAgIGlzUm9vdEVxKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNFcSgpICYmIHRoaXMucGFyZW50ID09IG51bGw7XG4gICAgfVxuXG4gICAgaXNMaXN0KCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwiW11cIjtcbiAgICB9XG5cbiAgICBpc0FkZCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBcIitcIjtcbiAgICB9XG5cbiAgICBpc011bCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBcIipcIjtcbiAgICB9XG5cbiAgICBpc0RpdigpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBcIi9cIjtcbiAgICB9XG5cbiAgICBpc0RvdCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBcIi5cIjtcbiAgICB9XG5cbiAgICBpc1NxcnQoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiB0aGlzLmZuY05hbWUgPT0gXCJzcXJ0XCI7XG4gICAgfVxuXG4gICAgaXNaZXJvKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUubnVtZXJhdG9yID09IDA7XG4gICAgfVxuXG4gICAgaXNWYWx1ZShuIDogbnVtYmVyKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIENvbnN0TnVtICYmIHRoaXMudmFsdWUuZnZhbCgpID09IG47XG4gICAgfVxuXG4gICAgaXNPbmUoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbHVlKDEpO1xuICAgIH1cblxuICAgIGlzSW50KCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDb25zdE51bSAmJiB0aGlzLnZhbHVlLmlzSW50KCk7XG4gICAgfVxuXG4gICAgaXNFKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBSZWZWYXIgJiYgdGhpcy5uYW1lID09IFwiZVwiO1xuICAgIH1cblxuICAgIGlzSSgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgUmVmVmFyICYmIHRoaXMubmFtZSA9PSBcImlcIjtcbiAgICB9XG5cbiAgICBpc0RpZmYoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiAodGhpcy5mbmNOYW1lID09IFwiZGlmZlwiIHx8IHRoaXMuZm5jTmFtZSA9PSBcInBkaWZmXCIpO1xuICAgIH1cblxuICAgIGlzTGltKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwibGltXCI7XG4gICAgfVxuXG4gICAgZGl2aWRlbmQoKSA6IFRlcm0ge1xuICAgICAgICBhc3NlcnQodGhpcy5pc0RpdigpKTtcbiAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSBhcyBBcHApLmFyZ3NbMF07XG4gICAgfVxuXG4gICAgZGl2aXNvcigpIDogVGVybSB7XG4gICAgICAgIGFzc2VydCh0aGlzLmlzRGl2KCkpO1xuICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55IGFzIEFwcCkuYXJnc1sxXTtcbiAgICB9XG5cblxuICAgIGRlcGVuZChkdmFyIDogUmVmVmFyKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gYWxsVGVybXModGhpcykuc29tZSh4ID0+IGR2YXIuZXEoeCkpO1xuICAgIH1cblxuICAgIGNhbGMoKSA6IG51bWJlciB7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBSYXRpb25hbCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgQ29uc3ROdW0pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZnZhbCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcyBpbnN0YW5jZW9mIFJlZlZhcil7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5yZWZWYXIhLmV4cHI7XG4gICAgICAgICAgICBpZihkYXRhIGluc3RhbmNlb2YgVGVybSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuY2FsYygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihcInVuaW1wbGVtZW50ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgQXBwKXtcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IHRoaXM7XG4gICAgICAgICAgICBpZihhcHAuaXNBcHAoXCJzcXJ0XCIpKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoYXBwLmFyZ3MubGVuZ3RoID09IDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoYXBwLmFyZ3NbMF0uY2FsYygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoXCJ1bmltcGxlbWVudGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKFwidW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICBjb3B5VmFsdWUoY25zIDogQ29uc3ROdW0pe1xuICAgICAgICBhc3NlcnQodGhpcyBpbnN0YW5jZW9mIENvbnN0TnVtKTtcbiAgICAgICAgdGhpcy52YWx1ZS5zZXQoY25zLnZhbHVlLm51bWVyYXRvciwgY25zLnZhbHVlLmRlbm9taW5hdG9yKTtcbiAgICB9XG5cbiAgICBkbXBUZXJtKG5lc3QgOiBzdHJpbmcpe1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQXBwKXtcblxuICAgICAgICAgICAgbXNnKGAke25lc3R9JHt0aGlzLmlkfWApO1xuICAgICAgICAgICAgdGhpcy5mbmMuZG1wVGVybShuZXN0ICsgXCJcXHRcIik7XG4gICAgICAgICAgICB0aGlzLmFyZ3MuZm9yRWFjaCh4ID0+IHguZG1wVGVybShuZXN0ICsgXCJcXHRcIikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIG1zZyhgJHtuZXN0fSR7dGhpcy5pZH06JHt0aGlzLnN0cigpfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0QWxsVGVybXModGVybXMgOiBUZXJtW10pe1xuICAgICAgICB0ZXJtcy5wdXNoKHRoaXMpO1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQXBwKXtcbiAgICAgICAgICAgIHRoaXMuZm5jLmdldEFsbFRlcm1zKHRlcm1zKTtcbiAgICAgICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC5nZXRBbGxUZXJtcyh0ZXJtcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5jbHVkZXNUZXJtKHRlcm0gOiBUZXJtKSA6IGJvb2xlYW4ge1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQXBwKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFsbFRlcm1zKCkuaW5jbHVkZXModGVybSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzID09IHRlcm07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXRoIGV4dGVuZHMgVGVybSB7XG4gICAgaW5kZXhlcyA6IG51bWJlcltdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihpbmRleGVzIDogbnVtYmVyW10pe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmluZGV4ZXMgPSBpbmRleGVzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgZXF1YWwodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFsKHRybSkgJiYgdHJtIGluc3RhbmNlb2YgUGF0aCAmJiByYW5nZSh0aGlzLmluZGV4ZXMubGVuZ3RoKS5ldmVyeShpID0+IHRoaXMuaW5kZXhlc1tpXSA9PSB0cm0uaW5kZXhlc1tpXSk7XG4gICAgfVxuXG4gICAgc3RyaWQoKSA6IHN0cmluZ3tcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICB9XG5cbiAgICBzdHJYKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCMke3RoaXMuaW5kZXhlcy5qb2luKHBhdGhTZXApfWA7XG4gICAgfVxuXG4gICAgdGV4MigpIDogc3RyaW5nIHtcbiAgICAgICAgYXNzZXJ0KGZhbHNlLCBcInBhdGg6dGV4MlwiKTtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgY2xvbmUoKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCBwYXRoID0gbmV3IFBhdGgodGhpcy5pbmRleGVzKTtcbiAgICAgICAgdGhpcy5jb3B5KHBhdGgpO1xuXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIGdldFRlcm0ocm9vdCA6IEFwcCwgZ2V0X3BhcmVudCA6IGJvb2xlYW4gPSBmYWxzZSkgOiBUZXJtIHtcbiAgICAgICAgaWYodGhpcy5pbmRleGVzLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgICAgIHJldHVybiByb290O1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGxldCBhcHAgPSByb290O1xuXG4gICAgICAgIGNvbnN0IGxhc3RfaSA9IChnZXRfcGFyZW50ID8gdGhpcy5pbmRleGVzLmxlbmd0aCAtIDIgOiB0aGlzLmluZGV4ZXMubGVuZ3RoIC0gMSk7XG5cbiAgICAgICAgZm9yKGNvbnN0IFtpLCBpZHhdIG9mIHRoaXMuaW5kZXhlcy5lbnRyaWVzKCkpe1xuICAgICAgICAgICAgaWYoaSA9PSBsYXN0X2kpe1xuICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAoaWR4ID09IC0xID8gYXBwLmZuYyA6IGFwcC5hcmdzW2lkeF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcHAgPSAoaWR4ID09IC0xID8gYXBwLmZuYyA6IGFwcC5hcmdzW2lkeF0pIGFzIEFwcDtcbiAgICAgICAgICAgICAgICBhc3NlcnQoYXBwIGluc3RhbmNlb2YgQXBwLCBcInBhc3M6Z2V0IHRlcm1cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoXCJnZXQgdGVybVwiKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIHtcbiAgICBuYW1lIDogc3RyaW5nO1xuICAgIGV4cHIgOiBUZXJtO1xuICAgIGRlcFZhcnMgOiBWYXJpYWJsZVtdO1xuXG4gICAgY29uc3RydWN0b3IobmFtZSA6IHN0cmluZywgZXhwciA6IFRlcm0pe1xuICAgICAgICB2YXJpYWJsZXMucHVzaCh0aGlzKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5leHByID0gZXhwcjtcblxuICAgICAgICBjb25zdCByZWZzID0gYWxsVGVybXMoZXhwcikuZmlsdGVyKHggPT4geCBpbnN0YW5jZW9mIFJlZlZhciAmJiAhKHgucGFyZW50IGluc3RhbmNlb2YgQXBwICYmIHgucGFyZW50LmZuYyA9PSB4KSkgYXMgUmVmVmFyW107XG4gICAgICAgIHRoaXMuZGVwVmFycyA9IHJlZnMubWFwKHJlZiA9PiB2YXJpYWJsZXMuZmluZCh2ID0+IHYubmFtZSA9PSByZWYubmFtZSkpIGFzIFZhcmlhYmxlW107XG4gICAgICAgIGFzc2VydCh0aGlzLmRlcFZhcnMuZXZlcnkoeCA9PiB4ICE9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgIGlmKHRoaXMuZGVwVmFycy5sZW5ndGggIT0gMCl7XG4gICAgICAgICAgICBtc2coYCR7dGhpcy5uYW1lfSBkZXBlbmRzICR7dGhpcy5kZXBWYXJzLm1hcCh4ID0+IHgubmFtZSkuam9pbihcIiBcIil9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5hbWUobmV3X25hbWUgOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLm5hbWUgPSBuZXdfbmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZWYXIgZXh0ZW5kcyBUZXJte1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByZWZWYXIhIDogVmFyaWFibGUgfCB1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIGVxdWFsKHRybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbCh0cm0pICYmIHRybSBpbnN0YW5jZW9mIFJlZlZhciAmJiB0aGlzLm5hbWUgPT0gdHJtLm5hbWU7XG4gICAgfVxuXG4gICAgc3RyaWQoKSA6IHN0cmluZ3tcbiAgICAgICAgaWYodGhpcy52YWx1ZS5pcygxKSl7XG5cbiAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy52YWx1ZS5zdHIoKX0gJHt0aGlzLm5hbWV9YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb25lKCkgOiBSZWZWYXIge1xuICAgICAgICBjb25zdCByZWYgPSBuZXcgUmVmVmFyKHRoaXMubmFtZSk7XG4gICAgICAgIHRoaXMuY29weShyZWYpO1xuXG4gICAgICAgIHJldHVybiByZWY7XG4gICAgfVxuXG4gICAgc3RyMigpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICB0ZXgyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGV4TmFtZSh0aGlzLm5hbWUpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQ29uc3ROdW0gZXh0ZW5kcyBUZXJte1xuICAgIHN0YXRpYyB6ZXJvKCkgOiBDb25zdE51bSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3ROdW0oMCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IobnVtZXJhdG9yIDogbnVtYmVyLCBkZW5vbWluYXRvciA6IG51bWJlciA9IDEpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnZhbHVlID0gbmV3IFJhdGlvbmFsKG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cblxuICAgIGVxdWFsKHRybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbCh0cm0pO1xuICAgIH1cblxuICAgIHN0cmlkKCkgOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLnZhbHVlLnN0cigpfWA7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21SYXRpb25hbChyIDogUmF0aW9uYWwpIDogQ29uc3ROdW0ge1xuICAgICAgICByZXR1cm4gbmV3IENvbnN0TnVtKHIubnVtZXJhdG9yLCByLmRlbm9taW5hdG9yKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpIDogQ29uc3ROdW0ge1xuICAgICAgICBjb25zdCBjbnMgPSBuZXcgQ29uc3ROdW0odGhpcy52YWx1ZS5udW1lcmF0b3IsIHRoaXMudmFsdWUuZGVub21pbmF0b3IpO1xuICAgICAgICB0aGlzLmNvcHkoY25zKTtcblxuICAgICAgICByZXR1cm4gY25zO1xuICAgIH1cblxuICAgIHN0cjIoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlLnN0cigpOyAgICAgICAgXG4gICAgfVxuXG4gICAgc3RyWCgpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUuc3RyKCk7ICAgICAgICBcbiAgICB9XG5cbiAgICB0ZXgyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS50ZXgoKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFN0ciBleHRlbmRzIFRlcm17XG4gICAgdGV4dCA6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIH1cblxuICAgIGVxdWFsKHRybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cm0gaW5zdGFuY2VvZiBTdHIgJiYgdHJtLnRleHQgPT0gdGhpcy50ZXh0O1xuICAgIH1cblxuICAgIHN0cmlkKCkgOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiBgXCIke3RoaXMudGV4dH1cImA7XG4gICAgfVxuXG4gICAgY2xvbmUoKSA6IFN0ciB7XG4gICAgICAgIHJldHVybiBuZXcgU3RyKHRoaXMudGV4dCk7XG4gICAgfVxuXG4gICAgc3RyMigpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaWQoKTsgICAgICAgIFxuICAgIH1cblxuICAgIHN0clgoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmlkKCk7ICAgICAgICBcbiAgICB9XG5cbiAgICB0ZXgyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHJpZCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFwcCBleHRlbmRzIFRlcm17XG4gICAgZm5jIDogVGVybTtcbiAgICBhcmdzOiBUZXJtW107XG4gICAgcmVtUGFyZW50aGVzZXMgOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBzdGF0aWMgc3RhcnRFbmQgOiB7IFtzdGFydCA6IHN0cmluZ10gOiBzdHJpbmcgfSA9IHtcbiAgICAgICAgXCIoXCIgOiBcIilcIixcbiAgICAgICAgXCJbXCIgOiBcIl1cIixcbiAgICAgICAgXCJ7XCIgOiBcIn1cIixcbiAgICB9XG5cbiAgICBnZXQgcmVmVmFyKCkgOiBSZWZWYXIgfCBudWxsIHtcbiAgICAgICAgaWYodGhpcy5mbmMgIT0gbnVsbCAmJiB0aGlzLmZuYyBpbnN0YW5jZW9mIFJlZlZhcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mbmM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGZuY05hbWUoKSA6IHN0cmluZyB7XG4gICAgICAgIGlmKHRoaXMuZm5jIGluc3RhbmNlb2YgUmVmVmFyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZuYy5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICByZXR1cm4gYG5vLWZuYy1uYW1lYDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgY29uc3RydWN0b3IoZm5jOiBUZXJtLCBhcmdzOiBUZXJtW10pe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZuYyAgICA9IGZuYztcbiAgICAgICAgdGhpcy5mbmMucGFyZW50ID0gdGhpcztcblxuICAgICAgICB0aGlzLmFyZ3MgICA9IGFyZ3Muc2xpY2UoKTtcblxuICAgICAgICB0aGlzLmFyZ3MuZm9yRWFjaCh4ID0+IHgucGFyZW50ID0gdGhpcyk7XG4gICAgfVxuXG4gICAgZXF1YWwodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgaWYoc3VwZXIuZXF1YWwodHJtKSAmJiB0cm0gaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgaWYodGhpcy5mbmMuZXF1YWwodHJtLmZuYykpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJncy5sZW5ndGggPT0gdHJtLmFyZ3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlKHRoaXMuYXJncy5sZW5ndGgpLmV2ZXJ5KGkgPT4gdGhpcy5hcmdzW2ldLmVxdWFsKHRybS5hcmdzW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuXG4gICAgc3RyaWQoKSA6IHN0cmluZ3tcbiAgICAgICAgbGV0IHMgOiBzdHJpbmc7XG4gICAgICAgIGlmKHRoaXMuZm5jLmlzT3ByRm5jKCkpe1xuICAgICAgICAgICAgcyA9IFwiKFwiICsgdGhpcy5hcmdzLm1hcCh4ID0+IHguc3RyaWQoKSkuam9pbih0aGlzLmZuY05hbWUpICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHMgPSBgJHt0aGlzLmZuY05hbWV9KCR7dGhpcy5hcmdzLm1hcCh4ID0+IHguc3RyaWQoKSkuam9pbihcIiwgXCIpfSlgO1xuXG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy52YWx1ZS5pcygxKSl7XG5cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnZhbHVlLnN0cigpfSAke3N9YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb25lKCkgOiBBcHAge1xuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKHRoaXMuZm5jLmNsb25lKCksIHRoaXMuYXJncy5tYXAoeCA9PiB4LmNsb25lKCkpKTtcblxuICAgICAgICB0aGlzLmNvcHkoYXBwKTtcblxuICAgICAgICByZXR1cm4gYXBwO1xuICAgIH1cblxuICAgIHNldFBhcmVudChwYXJlbnQgOiBBcHAgfCBudWxsKXtcbiAgICAgICAgc3VwZXIuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgdGhpcy5mbmMuc2V0UGFyZW50KHRoaXMpO1xuXG4gICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC5zZXRQYXJlbnQodGhpcykpO1xuICAgIH1cblxuICAgIHNldFRhYklkeCgpe1xuICAgICAgICBzdXBlci5zZXRUYWJJZHgoKTtcbiAgICAgICAgdGhpcy5mbmMuc2V0VGFiSWR4KCk7XG4gICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC5zZXRUYWJJZHgoKSk7XG4gICAgfVxuXG5cbiAgICB2ZXJpZnlQYXJlbnQocGFyZW50IDogQXBwIHwgbnVsbCl7XG4gICAgICAgIHN1cGVyLnZlcmlmeVBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIHRoaXMuZm5jLnZlcmlmeVBhcmVudCh0aGlzKTtcblxuICAgICAgICB0aGlzLmFyZ3MuZm9yRWFjaCh4ID0+IHgudmVyaWZ5UGFyZW50KHRoaXMpKTtcbiAgICB9XG5cbiAgICBzdHIyKCkgOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh4ID0+IHguc3RyKCkpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRleHQgOiBzdHJpbmc7XG4gICAgICAgIGlmKHRoaXMuZm5jIGluc3RhbmNlb2YgQXBwKXtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3NfcyA9IGFyZ3Muam9pbihcIiwgXCIpO1xuICAgICAgICAgICAgdGV4dCA9IGAoJHt0aGlzLmZuYy5zdHIoKX0pKCR7YXJnc19zfSlgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoaXNMZXR0ZXJPckF0KHRoaXMuZm5jTmFtZSkpe1xuICAgICAgICAgICAgY29uc3QgYXJnc19zID0gYXJncy5qb2luKFwiLCBcIik7XG4gICAgICAgICAgICB0ZXh0ID0gYCR7dGhpcy5mbmNOYW1lfSgke2FyZ3Nfc30pYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICBzd2l0Y2godGhpcy5mbmNOYW1lKXtcbiAgICAgICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goYXJncy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBcIiArW10gXCI7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGAgK1ske2FyZ3NbMF19XSBgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBhcmdzLmpvaW4oYCBgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICBcbiAgICAgICAgICAgICAgICBjYXNlIFwiL1wiOlxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmFyZ3MubGVuZ3RoICE9IDIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gYCR7YXJnc1swXX0gLyAke2FyZ3NbMV19YDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGFyZ3Muam9pbihgICR7dGhpcy5mbmNOYW1lfSBgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuaXNPcGVyYXRvcigpICYmIHRoaXMucGFyZW50ICE9IG51bGwgJiYgdGhpcy5wYXJlbnQuaXNPcGVyYXRvcigpKXtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LnByZWNlZGVuY2UoKSA8PSB0aGlzLnByZWNlZGVuY2UoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHt0ZXh0fSlgO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgdGV4MigpIDogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAoeCA9PiB4LnRleCgpKTtcblxuICAgICAgICBsZXQgdGV4dCA6IHN0cmluZztcbiAgICAgICAgaWYodGhpcy5mbmMgaW5zdGFuY2VvZiBBcHApe1xuXG4gICAgICAgICAgICBjb25zdCBhcmdzX3MgPSBhcmdzLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICAgIHRleHQgPSBgKCR7dGhpcy5mbmMudGV4KCl9KSgke2FyZ3Nfc30pYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcImxpbVwiKXtcbiAgICAgICAgICAgIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcXFxcbGltICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGxpbV97JHthcmdzWzFdfSBcXFxcdG8gJHthcmdzWzJdfX0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmZuY05hbWUgPT0gXCJzdW1cIil7XG4gICAgICAgICAgICBzd2l0Y2goYXJncy5sZW5ndGgpe1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXHN1bSAke2FyZ3NbMF19YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxzdW1feyR7YXJnc1sxXX19Xnske2FyZ3NbMl19fSAke2FyZ3NbMF19YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxzdW1feyR7YXJnc1sxXX09JHthcmdzWzJdfX1eeyR7YXJnc1szXX19ICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwibG9nXCIpe1xuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT0gMSl7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcXFxcbG9nICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihhcmdzLmxlbmd0aCA9PSAyKXtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxsb2dfeyR7YXJnc1sxXX19ICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwie3x9XCIpe1xuICAgICAgICAgICAgdGV4dCA9IGBcXFxceyR7YXJnc1swXX0gXFxcXG1pZCAke2FyZ3NbMV19IFxcXFx9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcImluXCIpe1xuICAgICAgICAgICAgbGV0IGlkcyA6IHN0cmluZztcbiAgICAgICAgICAgIGlmKHRoaXMuYXJnc1swXS5pc0FwcChcIixcIikpe1xuXG4gICAgICAgICAgICAgICAgaWRzID0gKHRoaXMuYXJnc1swXSBhcyBBcHApLmFyZ3MubWFwKHggPT4geC50ZXgoKSkuam9pbihcIiAsIFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgaWRzID0gYXJnc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRleHQgPSBgJHtpZHN9IFxcXFxpbiAke2FyZ3NbMV19YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcImNvbXBsZW1lbnRcIil7XG4gICAgICAgICAgICB0ZXh0ID0gYHsgJHthcmdzWzBdfSB9XmNgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5pc0RpZmYoKSl7XG4gICAgICAgICAgICBjb25zdCBuID0gKHRoaXMuYXJncy5sZW5ndGggPT0gMyA/IGBeeyR7YXJnc1syXX19YDpgYCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGQgPSAodGhpcy5mbmNOYW1lID09IFwiZGlmZlwiID8gXCJkXCIgOiBcIlxcXFxwYXJ0aWFsXCIpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmFyZ3MubGVuZ3RoID09IDEpe1xuICAgICAgICAgICAgICAgIHRleHQgPSBgKCR7YXJnc1swXX0pJ2A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGFyZ3NbMF0uaW5kZXhPZihcIlxcXFxmcmFjXCIpID09IC0xKXtcblxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGZyYWN7ICR7ZH0gJHtufSAke2FyZ3NbMF19fXsgJHtkfSAgJHthcmdzWzFdfSR7bn19YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxmcmFjeyAke2R9ICR7bn0gfXsgJHtkfSAgJHthcmdzWzFdfSR7bn19ICgke2FyZ3NbMF19KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihpc0xldHRlck9yQXQodGhpcy5mbmNOYW1lKSl7XG4gICAgICAgICAgICBpZihbXCJzaW5cIiwgXCJjb3NcIiwgXCJ0YW5cIl0uaW5jbHVkZXModGhpcy5mbmNOYW1lKSAmJiAhICh0aGlzLmFyZ3NbMF0gaW5zdGFuY2VvZiBBcHApKXtcblxuICAgICAgICAgICAgICAgIHRleHQgPSBgJHt0ZXhOYW1lKHRoaXMuZm5jTmFtZSl9ICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmZuY05hbWUgPT0gXCJhYnNcIil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGFyZ3MubGVuZ3RoID09IDEsIFwidGV4MlwiKTtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxsdmVydCAke2FyZ3NbMF19IFxcXFxydmVydGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcInNxcnRcIil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGFyZ3MubGVuZ3RoID09IDEsIFwidGV4MlwiKTtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxzcXJ0eyR7YXJnc1swXX19YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwibnRoX3Jvb3RcIil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGFyZ3MubGVuZ3RoID09IDIsIFwidGV4MlwiKTtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxzcXJ0WyR7YXJnc1sxXX1deyR7YXJnc1swXX19YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoaXNBcml0aG1ldGljVG9rZW4odGhpcy5mbmNOYW1lKSApe1xuICAgICAgICAgICAgICAgIHRleHQgPSBgJHthcmdzWzBdfSAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0gJHthcmdzWzFdfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2UgaWYoaXNSZWxhdGlvblRva2VuKHRoaXMuZm5jTmFtZSkgfHwgaXNBcml0aG1ldGljVG9rZW4odGhpcy5mbmNOYW1lKSApe1xuICAgICAgICAgICAgICAgIHRleHQgPSBgJHthcmdzWzBdfSAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0gJHthcmdzWzFdfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYXJnc19zID0gYXJncy5qb2luKFwiLCBcIik7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0oJHthcmdzX3N9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMuZm5jTmFtZSl7XG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgICAgIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gXCIgK1tdIFwiO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGAgK1ske2FyZ3NbMF19XSBgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0ZXh0ID0gYXJncy5qb2luKGAgYCk7XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgY2FzZSBcIi9cIjpcbiAgICAgICAgICAgICAgICBpZih0aGlzLmFyZ3MubGVuZ3RoICE9IDIpe1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxmcmFjeyR7YXJnc1swXX19eyR7YXJnc1sxXX19YDtcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBjYXNlIFwiXlwiOlxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJnc1swXSBpbnN0YW5jZW9mIEFwcCAmJiBbXCJzaW5cIixcImNvc1wiLFwidGFuXCJdLmluY2x1ZGVzKHRoaXMuYXJnc1swXS5mbmNOYW1lKSl7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gYCR7dGV4TmFtZShhcHAuZm5jTmFtZSl9Xnske2FyZ3NbMV19fSAke2FwcC5hcmdzWzBdLnRleCgpfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGAke2FyZ3NbMF19Xnske2FyZ3NbMV19fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT0gMSl7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBgJHt0ZXhOYW1lKHRoaXMuZm5jTmFtZSl9ICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gYXJncy5qb2luKGAgJHt0ZXhOYW1lKHRoaXMuZm5jTmFtZSl9IGApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnQgIT0gbnVsbCl7XG5cbiAgICAgICAgICAgIGlmKHRoaXMucmVtUGFyZW50aGVzZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBgXFxcXHRleHRiZnsge1xcXFxjb2xvcntyZWR9ICh9IH0gJHt0ZXh0fSBcXFxcdGV4dGJmeyB7XFxcXGNvbG9ye3JlZH0gKX0gfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCh0aGlzLmlzQWRkKCkgfHwgdGhpcy5pc011bCgpKSAmJiB0aGlzLnBhcmVudC5mbmNOYW1lID09IFwibGltXCIpe1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHt0ZXh0fSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmlzT3BlcmF0b3IoKSAmJiB0aGlzLnBhcmVudC5pc09wZXJhdG9yKCkgJiYgIXRoaXMucGFyZW50LmlzRGl2KCkpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMucGFyZW50LmZuY05hbWUgPT0gXCJeXCIgJiYgdGhpcy5wYXJlbnQuYXJnc1sxXSA9PSB0aGlzKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQucHJlY2VkZW5jZSgpIDw9IHRoaXMucHJlY2VkZW5jZSgpKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAoJHt0ZXh0fSlgO1xuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgcHJlY2VkZW5jZSgpIDogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoKHRoaXMuZm5jTmFtZSl7XG4gICAgICAgIGNhc2UgXCJeXCI6IFxuICAgICAgICAgICAgcmV0dXJuIDA7XG5cbiAgICAgICAgY2FzZSBcIi9cIjogXG4gICAgICAgICAgICByZXR1cm4gMTtcblxuICAgICAgICBjYXNlIFwiKlwiOiBcbiAgICAgICAgICAgIHJldHVybiAyO1xuXG4gICAgICAgIGNhc2UgXCIrXCI6IFxuICAgICAgICBjYXNlIFwiLVwiOiBcbiAgICAgICAgICAgIHJldHVybiAzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHNldEFyZyh0cm0gOiBUZXJtLCBpZHggOiBudW1iZXIpe1xuICAgICAgICB0aGlzLmFyZ3NbaWR4XSA9IHRybTtcbiAgICAgICAgdHJtLnBhcmVudCA9IHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFkZEFyZyh0cm0gOiBUZXJtKXtcbiAgICAgICAgdGhpcy5hcmdzLnB1c2godHJtKTtcbiAgICAgICAgdHJtLnBhcmVudCA9IHRoaXM7XG4gICAgfVxuXG4gICAgYWRkQXJncyh0cm1zIDogVGVybVtdKXtcbiAgICAgICAgdGhpcy5hcmdzLnB1c2goLi4uIHRybXMpO1xuICAgICAgICB0cm1zLmZvckVhY2goeCA9PiB4LnBhcmVudCA9IHRoaXMpO1xuICAgIH1cblxuICAgIGluc0FyZyh0cm0gOiBUZXJtLCBpZHggOiBudW1iZXIpe1xuICAgICAgICB0aGlzLmFyZ3Muc3BsaWNlKGlkeCwgMCwgdHJtKTtcbiAgICAgICAgdHJtLnBhcmVudCA9IHRoaXM7XG4gICAgfVxuXG4gICAgaW5zQXJncyhhcmdzIDogVGVybVtdLCBpZHggOiBudW1iZXIpe1xuICAgICAgICBhc3NlcnQoaWR4ICE9IC0xLCBcImlucyBwYXJlbnQgbXVsIDFcIik7XG5cbiAgICAgICAgY29uc3QgYXJnc19jcCA9IGFyZ3Muc2xpY2UoKTtcbiAgICAgICAgd2hpbGUoYXJnc19jcC5sZW5ndGggIT0gMCl7XG4gICAgICAgICAgICBjb25zdCB0cm0gPSBhcmdzX2NwLnBvcCgpITtcbiAgICAgICAgICAgIHRoaXMuaW5zQXJnKHRybSwgaWR4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBkZXNjcmlwdGlvbiDlvJXmlbDjgYwx5YCL44Gg44GR44Gu5Yqg566X44KE5LmX566X44KS44CB5ZSv5LiA44Gu5byV5pWw44Gn572u44GN5o+b44GI44KL44CCXG4gICAgICovXG4gICAgb25lQXJnKCkge1xuICAgICAgICBhc3NlcnQodGhpcy5hcmdzLmxlbmd0aCA9PSAxLCBcIm9uZSBhcmdcIik7XG5cbiAgICAgICAgLy8g5ZSv5LiA44Gu5byV5pWwXG4gICAgICAgIGNvbnN0IGFyZzEgPSB0aGlzLmFyZ3NbMF07XG5cbiAgICAgICAgLy8g5Yqg566X44KE5LmX566X44KS5ZSv5LiA44Gu5byV5pWw44Gn572u44GN5o+b44GI44KL44CCXG4gICAgICAgIHRoaXMucmVwbGFjZVRlcm0oYXJnMSk7XG5cbiAgICAgICAgLy8g5ZSv5LiA44Gu5byV5pWw44Gu5L+C5pWw44Gr44CB5Yqg566X44KE5LmX566X44Gu5L+C5pWw44KS44GL44GR44KL44CCXG4gICAgICAgIGFyZzEudmFsdWUuc2V0bXVsKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIGFsbFRlcm1zKCkgOiBUZXJtW10ge1xuICAgICAgICBjb25zdCB0ZXJtcyA6IFRlcm1bXSA9IFtdO1xuICAgICAgICB0aGlzLmdldEFsbFRlcm1zKHRlcm1zKTtcblxuICAgICAgICByZXR1cm4gdGVybXM7XG4gICAgfVxuXG4gICAgY2xlYXJIaWdobGlnaHQoKXtcbiAgICAgICAgY29uc3QgYWxsX3Rlcm1zID0gdGhpcy5hbGxUZXJtcygpO1xuICAgICAgICBmb3IoY29uc3QgdGVybSBvZiBhbGxfdGVybXMpe1xuICAgICAgICAgICAgdGVybS5jYW5jZWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGVybS5jb2xvck5hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kVGVybUJ5SWQoaWQgOiBudW1iZXIpIDogVGVybSB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbFRlcm1zKCkuZmluZCh4ID0+IHguaWQgPT0gaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlciB7XG4gICAgdG9rZW5zOiBUb2tlbltdO1xuICAgIHRva2Vuc19jcDogVG9rZW5bXTtcbiAgICB0b2tlbiE6IFRva2VuO1xuXG4gICAgY29uc3RydWN0b3IodGV4dDogc3RyaW5nKXtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBsZXhpY2FsQW5hbHlzaXModGV4dCk7XG4gICAgICAgIGlmKHRoaXMudG9rZW5zLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHRoaXMudG9rZW5zX2NwID0gdGhpcy50b2tlbnMuc2xpY2UoKTtcblxuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICB9XG5cbiAgICBuZXh0KCl7XG4gICAgICAgIGlmKHRoaXMudG9rZW5zLmxlbmd0aCA9PSAwKXtcblxuICAgICAgICAgICAgdGhpcy50b2tlbiA9IG5ldyBUb2tlbihUb2tlblR5cGUuZW90LCBUb2tlblN1YlR5cGUudW5rbm93biwgXCJcIiwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnNoaWZ0KCkhO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0Vycm9yKHRleHQgOiBzdHJpbmcpe1xuICAgICAgICBjb25zdCBpID0gdGhpcy50b2tlbnNfY3AubGVuZ3RoIC0gdGhpcy50b2tlbnMubGVuZ3RoO1xuICAgICAgICBjb25zdCB3b3JkcyA9IHRoaXMudG9rZW5zX2NwLm1hcCh4ID0+IHgudGV4dCk7XG5cbiAgICAgICAgd29yZHMuc3BsaWNlKGksIDAsIGA8PCR7dGV4dH0+PmApO1xuICAgICAgICBtc2coYHRva2VuIGVycjoke3dvcmRzLmpvaW4oXCIgXCIpfWApO1xuICAgIH1cblxuICAgIG5leHRUb2tlbih0ZXh0IDogc3RyaW5nKXtcbiAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ICE9IHRleHQpe1xuICAgICAgICAgICAgdGhpcy5zaG93RXJyb3IodGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgIH1cblxuICAgIGN1cnJlbnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW4udGV4dDtcbiAgICB9XG5cbiAgICBwZWVrKCkgOiBUb2tlbiB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnMubGVuZ3RoID09IDAgPyBudWxsIDogdGhpcy50b2tlbnNbMF07XG4gICAgfVxuXG4gICAgcmVhZEFyZ3Moc3RhcnQ6IHN0cmluZywgZW5kIDogc3RyaW5nLCBhcHAgOiBBcHApe1xuICAgICAgICB0aGlzLm5leHRUb2tlbihzdGFydCk7XG5cbiAgICAgICAgd2hpbGUodHJ1ZSl7XG4gICAgICAgICAgICBjb25zdCB0cm0gPSB0aGlzLlJlbGF0aW9uYWxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBhcHAuYXJncy5wdXNoKHRybSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcIixcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmV4dFRva2VuKGVuZCk7XG4gICAgfVxuXG4gICAgUHJpbWFyeUV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBsZXQgdHJtIDogVGVybTtcblxuICAgICAgICBpZih0aGlzLnRva2VuLnR5cGVUa24gPT0gVG9rZW5UeXBlLmlkZW50aWZpZXIpe1xuICAgICAgICAgICAgbGV0IHJlZlZhciA9IG5ldyBSZWZWYXIodGhpcy50b2tlbi50ZXh0KTtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gJygnKXtcblxuICAgICAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKHJlZlZhciwgW10pO1xuICAgICAgICAgICAgICAgIHRoaXMucmVhZEFyZ3MoXCIoXCIsIFwiKVwiLCBhcHApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiLlwiKXtcbiAgICAgICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcihcIi5cIiksIFtyZWZWYXJdKTtcblxuICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oXCIuXCIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHRoaXMudG9rZW4udHlwZVRrbiA9PSBUb2tlblR5cGUuaWRlbnRpZmllcik7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5hZGRBcmcobmV3IFJlZlZhcih0aGlzLnRva2VuLnRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSB3aGlsZSh0aGlzLnRva2VuLnRleHQgPT0gXCIuXCIpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVmVmFyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy50b2tlbi50eXBlVGtuID09IFRva2VuVHlwZS5OdW1iZXIpe1xuICAgICAgICAgICAgbGV0IG4gPSBwYXJzZUZsb2F0KHRoaXMudG9rZW4udGV4dCk7XG4gICAgICAgICAgICBpZihpc05hTihuKSl7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRybSA9IG5ldyBDb25zdE51bShuKTtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy50b2tlbi50eXBlVGtuID09IFRva2VuVHlwZS5TdHJpbmcpe1xuICAgICAgICAgICAgdHJtID0gbmV3IFN0cih0aGlzLnRva2VuLnRleHQpO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnR5cGVUa24gPT0gVG9rZW5UeXBlLnBhdGgpe1xuICAgICAgICAgICAgYXNzZXJ0KHRoaXMudG9rZW4udGV4dFswXSA9PSBcIiNcIiwgXCJwYXJzZSBwYXRoXCIpO1xuICAgICAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiI1wiKXtcblxuICAgICAgICAgICAgICAgIHRybSA9IG5ldyBQYXRoKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleGVzID0gdGhpcy50b2tlbi50ZXh0LnN1YnN0cmluZygxKS5zcGxpdChwYXRoU2VwKS5tYXAoeCA9PiBwYXJzZUZsb2F0KHgpKTtcbiAgICAgICAgICAgICAgICB0cm0gPSBuZXcgUGF0aChpbmRleGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnRleHQgPT0gJygnKXtcblxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICB0cm0gPSB0aGlzLlJlbGF0aW9uYWxFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudCgpICE9ICcpJyl7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09ICcoJyl7XG5cbiAgICAgICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcCh0cm0sIFtdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWRBcmdzKFwiKFwiLCBcIilcIiwgYXBwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBhcHA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cm07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnRleHQgPT0gJ3snKXtcblxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5SZWxhdGlvbmFsRXhwcmVzc2lvbigpO1xuXG4gICAgICAgICAgICB0aGlzLm5leHRUb2tlbignfCcpO1xuXG4gICAgICAgICAgICBjb25zdCBsb2dpYyA9IHRoaXMuTG9naWNhbEV4cHJlc3Npb24oKTtcblxuICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oJ30nKTtcblxuICAgICAgICAgICAgdHJtID0gbmV3IEFwcChvcGVyYXRvcihcInt8fVwiKSwgW2VsZW1lbnQsIGxvZ2ljXSk7XG4gICAgICAgICAgICByZXR1cm4gdHJtO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cm07XG4gICAgfVxuXG4gICAgUG93ZXJFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgY29uc3QgdHJtMSA9IHRoaXMuUHJpbWFyeUV4cHJlc3Npb24oKTtcbiAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiXlwiKXtcblxuICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oXCJeXCIpO1xuXG4gICAgICAgICAgICBjb25zdCB0cm0yID0gdGhpcy5Qb3dlckV4cHJlc3Npb24oKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcHAob3BlcmF0b3IoXCJeXCIpLCBbdHJtMSwgdHJtMl0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgfVxuXG4gICAgVW5hcnlFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgaWYgKHRoaXMudG9rZW4udGV4dCA9PSBcIi1cIikge1xuICAgICAgICAgICAgLy8g6LKg5Y+344Gu5aC05ZCIXG5cbiAgICAgICAgICAgIHRoaXMubmV4dFRva2VuKFwiLVwiKTtcblxuICAgICAgICAgICAgLy8g5Z+65pys44Gu5byP44KS6Kqt44G/44G+44GZ44CCXG4gICAgICAgICAgICBjb25zdCB0MSA9IHRoaXMuUG93ZXJFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgICAgIC8vIOespuWPt+OCkuWPjei7ouOBl+OBvuOBmeOAglxuICAgICAgICAgICAgdDEudmFsdWUubnVtZXJhdG9yICo9IC0xO1xuXG4gICAgICAgICAgICByZXR1cm4gdDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIOWfuuacrOOBruW8j+OCkuiqreOBv+OBvuOBmeOAglxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUG93ZXJFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbiAgICBEaXZFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgbGV0IHRybTEgPSB0aGlzLlVuYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICB3aGlsZSh0aGlzLnRva2VuLnRleHQgPT0gXCIvXCIgfHwgdGhpcy50b2tlbi50ZXh0ID09IFwiJVwiKXtcbiAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKHRoaXMudG9rZW4udGV4dCksIFt0cm0xXSk7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgd2hpbGUodHJ1ZSl7XG4gICAgICAgICAgICAgICAgbGV0IHRybTIgPSB0aGlzLlVuYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgIGFwcC5hcmdzLnB1c2godHJtMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IGFwcC5mbmNOYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRybTEgPSBhcHA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICByZXR1cm4gdHJtMTtcbiAgICB9XG5cbiAgICBcbiAgICBNdWx0aXBsaWNhdGl2ZUV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBsZXQgdHJtMSA9IHRoaXMuRGl2RXhwcmVzc2lvbigpO1xuICAgICAgICBpZih0aGlzLmN1cnJlbnQoKSAhPSBcIipcIil7XG4gICAgICAgICAgICByZXR1cm4gdHJtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKHRoaXMuY3VycmVudCgpID09IFwiKlwiKXtcbiAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKHRoaXMudG9rZW4udGV4dCksIFt0cm0xXSk7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgd2hpbGUodHJ1ZSl7XG4gICAgICAgICAgICAgICAgbGV0IHRybTIgPSB0aGlzLkRpdkV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICBhcHAuYXJncy5wdXNoKHRybTIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBhcHAuZm5jTmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB0cm0xID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0cm0xIGluc3RhbmNlb2YgQXBwICYmIHRybTEuYXJnc1swXSBpbnN0YW5jZW9mIENvbnN0TnVtKXtcbiAgICAgICAgICAgIGlmKHRybTEuYXJncy5sZW5ndGggPT0gMil7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBbbnVtLCB0cm0yXSA9IHRybTEuYXJncztcbiAgICAgICAgICAgICAgICB0cm0yLnZhbHVlLnNldG11bChudW0udmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cm0yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zdCBudW0gPSB0cm0xLmFyZ3NbMF07XG4gICAgICAgICAgICAgICAgdHJtMS52YWx1ZS5zZXRtdWwobnVtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBudW0ucmVtQXJnKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgfVxuICAgIFxuICAgIEFkZGl0aXZlRXhwcmVzc2lvbigpIDogVGVybSB7XG4gICAgICAgIGxldCBuYWdhdGl2ZSA6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiLVwiKXtcbiAgICAgICAgICAgIG5hZ2F0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJtMSA9IHRoaXMuTXVsdGlwbGljYXRpdmVFeHByZXNzaW9uKCk7XG4gICAgICAgIGlmKG5hZ2F0aXZlKXtcbiAgICAgICAgICAgIHRybTEudmFsdWUubnVtZXJhdG9yICo9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiK1wiIHx8IHRoaXMudG9rZW4udGV4dCA9PSBcIi1cIil7XG4gICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcihcIitcIiksIFt0cm0xXSk7XG5cbiAgICAgICAgICAgIHdoaWxlKHRoaXMudG9rZW4udGV4dCA9PSBcIitcIiB8fCB0aGlzLnRva2VuLnRleHQgPT0gXCItXCIpe1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wciA9IHRoaXMudG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRybTIgPSB0aGlzLk11bHRpcGxpY2F0aXZlRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgIGlmKG9wciA9PSBcIi1cIil7XG4gICAgICAgICAgICAgICAgICAgIHRybTIudmFsdWUubnVtZXJhdG9yICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFwcC5hZGRBcmcodHJtMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcHA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJtMTtcbiAgICB9XG5cbiAgICBBcml0aG1ldGljRXhwcmVzc2lvbigpIDogVGVybSB7XG4gICAgICAgIGNvbnN0IHRybTEgPSB0aGlzLkFkZGl0aXZlRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGlmKCEgaXNBcml0aG1ldGljVG9rZW4odGhpcy5jdXJyZW50KCkpKXtcbiAgICAgICAgICAgIHJldHVybiB0cm0xO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcChvcGVyYXRvcih0aGlzLmN1cnJlbnQoKSksIFt0cm0xXSk7XG4gICAgICAgIHdoaWxlKCBpc0FyaXRobWV0aWNUb2tlbih0aGlzLmN1cnJlbnQoKSkgKXtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBjb25zdCB0cm0yID0gdGhpcy5BZGRpdGl2ZUV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIGFwcC5hZGRBcmcodHJtMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwO1xuICAgIH1cblxuICAgIFZhcmlhYmxlRGVjbGFyYXRpb24oKSA6IEFwcCB7XG4gICAgICAgIGNvbnN0IHJlZl92YXJzIDogUmVmVmFyW10gPSBbXTtcblxuICAgICAgICB3aGlsZSh0cnVlKXtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy50b2tlbjtcbiAgICAgICAgICAgIGFzc2VydChpZC50eXBlVGtuID09IFRva2VuVHlwZS5pZGVudGlmaWVyKTtcblxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIHJlZl92YXJzLnB1c2gobmV3IFJlZlZhcihpZC50ZXh0KSk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcIixcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlkX2xpc3QgPSBuZXcgQXBwKG9wZXJhdG9yKFwiLFwiKSwgcmVmX3ZhcnMpO1xuXG4gICAgICAgIHRoaXMubmV4dFRva2VuKFwiaW5cIik7XG5cbiAgICAgICAgY29uc3Qgc2V0ID0gdGhpcy5Bcml0aG1ldGljRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIHJldHVybiBuZXcgQXBwKG9wZXJhdG9yKFwiaW5cIiksIFtpZF9saXN0LCBzZXRdKTtcbiAgICB9XG5cbiAgICBSZWxhdGlvbmFsRXhwcmVzc2lvbihpbl9hbmQgOiBib29sZWFuID0gZmFsc2UpIDogVGVybSB7XG4gICAgICAgIGNvbnN0IG5leHRfdG9rZW4gPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaWYoaW5fYW5kICYmIHRoaXMudG9rZW4udHlwZVRrbiA9PSBUb2tlblR5cGUuaWRlbnRpZmllciAmJiBuZXh0X3Rva2VuICE9IG51bGwgJiYgbmV4dF90b2tlbi50ZXh0ID09IFwiLFwiKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cm0xIDogVGVybTtcbiAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiW1wiKXtcblxuICAgICAgICAgICAgY29uc3QgcmVmID0gbmV3IFJlZlZhcihcIltdXCIpO1xuICAgICAgICAgICAgdHJtMSA9IG5ldyBBcHAocmVmLCBbXSk7XG4gICAgICAgICAgICB0aGlzLnJlYWRBcmdzKFwiW1wiLCBcIl1cIiwgdHJtMSBhcyBBcHApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHRybTEgPSB0aGlzLkFyaXRobWV0aWNFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZShpc1JlbGF0aW9uVG9rZW4odGhpcy50b2tlbi50ZXh0KSl7XG4gICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcih0aGlzLnRva2VuLnRleHQpLCBbdHJtMV0pO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIHdoaWxlKHRydWUpe1xuICAgICAgICAgICAgICAgIGxldCB0cm0yID0gdGhpcy5Bcml0aG1ldGljRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgIGFwcC5hcmdzLnB1c2godHJtMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IGFwcC5mbmNOYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRybTEgPSBhcHA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cm0xO1xuICAgIH1cblxuICAgIEFuZEV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCB0cm0xID0gdGhpcy5SZWxhdGlvbmFsRXhwcmVzc2lvbih0cnVlKTtcblxuICAgICAgICBpZighIFtcIjtcIiwgXCImJlwiXS5pbmNsdWRlcyh0aGlzLnRva2VuLnRleHQpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKFwiJiZcIiksIFt0cm0xXSk7XG5cbiAgICAgICAgd2hpbGUoIFtcIjtcIiwgXCImJlwiXS5pbmNsdWRlcyh0aGlzLnRva2VuLnRleHQpICl7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgY29uc3QgdHJtMiA9IHRoaXMuUmVsYXRpb25hbEV4cHJlc3Npb24odHJ1ZSk7XG4gICAgICAgICAgICBhcHAuYWRkQXJnKHRybTIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwcDtcbiAgICB9XG5cbiAgICBPckV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCB0cm0xID0gdGhpcy5BbmRFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgaWYodGhpcy5jdXJyZW50KCkgIT0gXCJ8fFwiKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKFwifHxcIiksIFt0cm0xXSk7XG5cbiAgICAgICAgd2hpbGUoIHRoaXMuY3VycmVudCgpID09IFwifHxcIiApe1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRybTIgPSB0aGlzLkFuZEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIGFwcC5hZGRBcmcodHJtMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwO1xuICAgIH1cblxuICAgIExvZ2ljYWxFeHByZXNzaW9uKCl7XG4gICAgICAgIGNvbnN0IHRybTEgPSB0aGlzLk9yRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGlmKFsgXCI9PlwiLCBcIuKHlFwiIF0uaW5jbHVkZXModGhpcy50b2tlbi50ZXh0KSl7XG4gICAgICAgICAgICBjb25zdCBvcHIgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBsZXQgdHJtMiA9IHRoaXMuT3JFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFwcChvcGVyYXRvcihvcHIpLCBbdHJtMSwgdHJtMl0pOyAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdHJtMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFJvb3RFeHByZXNzaW9uKCl7XG4gICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcImxldFwiKXtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBjb25zdCBhcHAgPSB0aGlzLlZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCBhcyBhbnkgIT0gXCIsXCIpe1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFuZCA9IG5ldyBBcHAob3BlcmF0b3IoXCImJlwiKSwgW2FwcF0pO1xuICAgICAgICAgICAgd2hpbGUodGhpcy50b2tlbi50ZXh0IGFzIGFueSA9PSBcIixcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhcHAyID0gdGhpcy5WYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgYW5kLmFkZEFyZyhhcHAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFuZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGlzUmVsYXRpb25Ub2tlbih0aGlzLnRva2VuLnRleHQpKXtcbiAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKHRoaXMudG9rZW4udGV4dCksIFtdKTtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBsZXQgdHJtID0gdGhpcy5Bcml0aG1ldGljRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgYXBwLmFyZ3MucHVzaCh0cm0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYXBwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Mb2dpY2FsRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BlcmF0b3Iob3ByIDogc3RyaW5nKSA6IFJlZlZhciB7XG4gICAgcmV0dXJuIG5ldyBSZWZWYXIob3ByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFRlcm1zKHQgOiBUZXJtLCB0ZXJtczogVGVybVtdKXtcbiAgICB0ZXJtcy5wdXNoKHQpO1xuXG4gICAgaWYodCBpbnN0YW5jZW9mIEFwcCl7XG4gICAgICAgIGFzc2VydCh0LmZuYyAhPSBudWxsLCBcImdldCBhbGwgdGVybXNcIik7XG4gICAgICAgIGdldEFsbFRlcm1zKHQuZm5jLCB0ZXJtcyk7XG5cbiAgICAgICAgdC5hcmdzLmZvckVhY2goeCA9PiBnZXRBbGxUZXJtcyh4LCB0ZXJtcykpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VJZFRvVGVybU1hcChyb290IDogVGVybSkgOiBNYXA8bnVtYmVyLCBUZXJtPntcbiAgICBjb25zdCB0ZXJtcyA9IGFsbFRlcm1zKHJvb3QpO1xuXG4gICAgcmV0dXJuIG5ldyBNYXA8bnVtYmVyLFRlcm0+KHRlcm1zLm1hcCh4ID0+IFt4LmlkLCB4XSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ViVGVybXMocm9vdCA6IFRlcm0sIHRhcmdldCA6IFRlcm0pIDogVGVybVtde1xuICAgIGNvbnN0IHRlcm1zIDogVGVybVtdID0gW107XG4gICAgZ2V0QWxsVGVybXMocm9vdCwgdGVybXMpO1xuXG4gICAgY29uc3QgdGFyZ2V0X3N0ciA9IHRhcmdldC5zdHIyKCk7XG4gICAgcmV0dXJuIHRlcm1zLmZpbHRlcih4ID0+IHguc3RyMigpID09IHRhcmdldF9zdHIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbFRlcm1zKHRybSA6IFRlcm0pIDogVGVybVtdIHtcbiAgICBjb25zdCB0ZXJtcyA6IFRlcm1bXSA9IFtdO1xuICAgIGdldEFsbFRlcm1zKHRybSwgdGVybXMpO1xuXG4gICAgcmV0dXJuIHRlcm1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9keU9uTG9hZCgpe1xuICAgIGNvbnN0IHRleHRzID0gKCQoXCJzYW1wbGVcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudCkudmFsdWUucmVwbGFjZShcIlxcclxcblwiLCBcIlxcblwiKS5zcGxpdChcIlxcblwiKS5tYXAoeCA9PiB4LnRyaW0oKSkuZmlsdGVyKHggPT4geCAhPSBcIlwiKTtcbiAgICBmb3IoY29uc3QgdGV4dCBvZiB0ZXh0cyl7XG4gICAgICAgIG1zZyh0ZXh0KTtcbiAgICAgICAgcGFyc2VNYXRoKHRleHQpO1xuICAgIH1cbn1cblxufSIsInZhciBrYXRleCA6IGFueTtcclxuXHJcbm5hbWVzcGFjZSBwYXJzZXJfdHMge1xyXG4vL1xyXG5leHBvcnQgY29uc3Qgc2xlZXAgPSBpMThuX3RzLnNsZWVwO1xyXG5jb25zdCAkZGljID0gbmV3IE1hcDxzdHJpbmcsIEhUTUxFbGVtZW50PigpO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkKGlkIDogc3RyaW5nKSA6IEhUTUxFbGVtZW50IHtcclxuICAgIGxldCBlbGUgPSAkZGljLmdldChpZCk7XHJcbiAgICBpZihlbGUgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBlbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkhO1xyXG4gICAgICAgICRkaWMuc2V0KGlkLCBlbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IodGV4dCA6IHN0cmluZyA9IFwiXCIpe1xyXG4gICAgICAgIHN1cGVyKHRleHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3ludGF4RXJyb3IgZXh0ZW5kcyBNeUVycm9ye1xyXG4gICAgY29uc3RydWN0b3IodGV4dCA6IHN0cmluZyA9IFwiXCIpe1xyXG4gICAgICAgIHN1cGVyKHRleHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGIgOiBib29sZWFuLCBtc2cgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgIGlmKCFiKXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihtc2cpO1xyXG4gICAgfVxyXG59ICAgIFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1zZyh0eHQgOiBzdHJpbmcpe1xyXG4gICAgY29uc29sZS5sb2codHh0KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKG46IG51bWJlcikgOiBudW1iZXJbXXtcclxuICAgIHJldHVybiBbLi4uQXJyYXkobikua2V5cygpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJNYWNyb3MoKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgXCJcXFxcZGlmXCIgOiBcIlxcXFxmcmFje2QgIzF9e2QgIzJ9XCIsXHJcbiAgICAgICAgXCJcXFxccGRpZmZcIiA6IFwiXFxcXGZyYWN7XFxcXHBhcnRpYWwgIzF9e1xcXFxwYXJ0aWFsICMyfVwiLFxyXG4gICAgICAgIFwiXFxcXHBkZGlmXCIgOiBcIlxcXFxmcmFje1xcXFxwYXJ0aWFsXjIgIzF9e1xcXFxwYXJ0aWFsIHsjMn1eMn1cIixcclxuICAgICAgICBcIlxcXFxiXCIgOiBcIlxcXFxib2xkc3ltYm9seyMxfVwiXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyS2F0ZXhTdWIoZWxlOiBIVE1MRWxlbWVudCwgdGV4X3RleHQ6IHN0cmluZyl7XHJcbiAgICBlbGUuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBcclxuICAgIGthdGV4LnJlbmRlcih0ZXhfdGV4dCwgZWxlLCB7XHJcbiAgICAgICAgdGhyb3dPbkVycm9yOiBmYWxzZSxcclxuICAgICAgICBkaXNwbGF5TW9kZSA6IHRydWUsXHJcbiAgICAgICAgdHJ1c3QgOiB0cnVlLFxyXG4gICAgICAgIHN0cmljdCA6IGZhbHNlLCAvLyBcImlnbm9yZVwiLCAvLyBmYWxzZSwgLy8gaGFuZGxlcixcclxuICAgICAgICAvLyBuZXdMaW5lSW5EaXNwbGF5TW9kZSA6IFwiaWdub3JlXCIsXHJcbiAgICAgICAgbWFjcm9zIDogZ2V0VXNlck1hY3JvcygpXHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbn0iLCJuYW1lc3BhY2UgcGFyc2VyX3RzIHtcclxuLy9cclxudHlwZSBBYnN0cmFjdFNwZWVjaCA9IGkxOG5fdHMuQWJzdHJhY3RTcGVlY2g7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEhpZ2hsaWdodGFibGUge1xyXG4gICAgaGlnaGxpZ2h0KGhpZ2hsaWdodGVkIDogYm9vbGVhbikgOiB2b2lkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzeW1ib2wyd29yZHMoc3ltYm9sOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgIGNvbnN0IHRibDogeyBbc3ltYm9sOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICBcInNpblwiIDogXCJzaW5lXCIsXHJcbiAgICAgICAgXCJjb3NcIiA6IFwiY29zaW5lXCIsXHJcbiAgICAgICAgXCJ0YW5cIiA6IFwidGFuZ2VudFwiLFxyXG4gICAgICAgIFwic2VjXCIgOiBcInNlY2FudFwiLFxyXG4gICAgICAgIFwiY29zZWNcIiA6IFwiY29zZWNhbnRcIixcclxuICAgICAgICBcImNvdFwiIDogXCJjb3RhbmdlbnRcIixcclxuICAgICAgICBcIj1cIiA6IFwiZXF1YWxzXCIsXHJcbiAgICAgICAgXCI9PVwiIDogXCJlcXVhbHNcIixcclxuICAgICAgICBcIiE9XCIgOiBcIm5vdCBlcXVhbCB0b1wiLFxyXG4gICAgICAgIFwiPFwiIDogXCJpcyBsZXNzIHRoYW5cIixcclxuICAgICAgICBcIj5cIiA6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXHJcbiAgICAgICAgXCI8PVwiIDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcclxuICAgICAgICBcIj49XCIgOiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxyXG4gICAgICAgIFwiK1wiIDogXCJwbHVzXCIsXHJcbiAgICAgICAgXCItXCIgOiBcIm1pbnVzXCIsXHJcbiAgICAgICAgXCIqXCIgOiBcInRpbWVzXCJcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IHRibFtzeW1ib2xdO1xyXG4gICAgaWYodGV4dCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICByZXR1cm4gc3ltYm9sO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCB0ZXgyd29yZHMgOiB7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XHJcbiAgICBcImRpZlwiICAgOiBcImRpZmZcIixcclxuICAgIFwiRGVsdGFcIiA6IFwiZGVsdGFcIixcclxuICAgIFwibGltXCIgICA6ICBcImxpbWl0XCIsXHJcbiAgICBcInNxcnRcIiAgOiBcInNxdWFyZSByb290XCIsXHJcbiAgICBcIm5lXCIgICAgOiBcIm5vdCBlcXVhbHNcIixcclxuICAgIFwibHRcIiAgICA6IFwiaXMgbGVzcyB0aGFuXCIsXHJcbiAgICBcImd0XCIgICAgOiBcImlzIGdyZWF0ZXIgdGhhblwiLFxyXG4gICAgXCJsZVwiICAgIDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWxzXCIsXHJcbiAgICBcImdlXCIgICAgOiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbHNcIixcclxuICAgIFwiaGJhclwiICA6IFwiaCBiYXJcIixcclxufTtcclxuXHJcbmNvbnN0IG9wcnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuXHJcbmZ1bmN0aW9uIGlzTGV0dGVyKHN0ciA6IHN0cmluZykgOiBib29sZWFuIHtcclxuICAgIHJldHVybiAvXlxccHtMZXR0ZXJ9KyQvdS50ZXN0KHN0cik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRGlnaXQoc3RyIDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gL15cXGQrJC8udGVzdChzdHIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm9udW5jaWF0aW9uRih0ZXhfbm9kZSA6IFRleE5vZGUsIHdvcmQgOiBzdHJpbmcpIDogUGhyYXNlIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmKHdvcmQuZW5kc1dpdGgoXCJ7XCIpKXtcclxuICAgICAgICB3b3JkID0gd29yZC5zdWJzdHJpbmcoMCwgd29yZC5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuICAgIGlmKHdvcmQuZW5kc1dpdGgoXCJfXCIpKXtcclxuICAgICAgICB3b3JkID0gd29yZC5zdWJzdHJpbmcoMCwgd29yZC5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuICAgIGlmKHdvcmQuc3RhcnRzV2l0aChcIlxcXFxcIikpe1xyXG4gICAgICAgIHdvcmQgPSB3b3JkLnN1YnN0cmluZygxKTtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4MndvcmRzW3dvcmRdO1xyXG4gICAgICAgIGlmKHRleHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQaHJhc2UodGV4X25vZGUsIHRleHQuc3BsaXQoXCIgXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBzeW1ib2wyd29yZHMod29yZCk7XHJcbiAgICAgICAgaWYodGV4dCAhPSB3b3JkKXtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGhyYXNlKHRleF9ub2RlLCB0ZXh0LnNwbGl0KFwiIFwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGV0dGVyKHdvcmQpKXtcclxuICAgICAgICBpZihpc0dyZWVrKHdvcmQpKXtcclxuICAgICAgICAgICAgY29uc3QgY2hhcjAgPSB3b3JkLmNoYXJBdCgwKVxyXG4gICAgICAgICAgICBpZihjaGFyMC50b1VwcGVyQ2FzZSgpID09IGNoYXIwKXtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQaHJhc2UodGV4X25vZGUsIFsgXCJsYXJnZVwiLCB3b3JkLnRvTG93ZXJDYXNlKCldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBocmFzZSh0ZXhfbm9kZSwgW3dvcmRdKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihpc0RpZ2l0KHdvcmQpKXtcclxuICAgICAgICByZXR1cm4gbmV3IFBocmFzZSh0ZXhfbm9kZSwgW3dvcmRdKTtcclxuICAgIH1cclxuXHJcbiAgICBpZighIG9wcnMuaGFzKHdvcmQpKXtcclxuICAgICAgICBvcHJzLmFkZCh3b3JkKTtcclxuICAgICAgICAvLyBtc2coYG9wZXJhdG9ycyA6IFske3dvcmR9XWApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUGhyYXNlIHtcclxuICAgIHRleE5vZGUgOiBUZXhOb2RlO1xyXG4gICAgd29yZHMgICA6IHN0cmluZ1tdO1xyXG4gICAgc3RhcnQhICA6IG51bWJlcjtcclxuICAgIGVuZCEgICAgOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGV4X25vZGUgOiBUZXhOb2RlLCB3b3JkcyA6IHN0cmluZ1tdKXtcclxuICAgICAgICB0aGlzLnRleE5vZGUgPSB0ZXhfbm9kZTtcclxuICAgICAgICB0aGlzLndvcmRzICAgPSB3b3JkcztcclxuICAgICAgICBmb3IoY29uc3Qgd29yZCBvZiB3b3Jkcyl7XHJcbiAgICAgICAgICAgIGlmKCEgb3Bycy5oYXMod29yZCkpe1xyXG4gICAgICAgICAgICAgICAgb3Bycy5hZGQod29yZCk7XHJcbiAgICAgICAgICAgICAgICAvLyBtc2coYHdvcmQgOiAke3dvcmR9YCk7XHJcbiAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VUZXh0RnJvbVBocmFzZXMocGhyYXNlcyA6IFBocmFzZVtdKSA6IHN0cmluZyB7XHJcbiAgICBsZXQgdGV4dCA9IFwiXCI7XHJcbiAgICBmb3IoY29uc3QgcGhyYXNlIG9mIHBocmFzZXMpe1xyXG4gICAgICAgIHBocmFzZS5zdGFydCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIGZvcihjb25zdCB3b3JkIG9mIHBocmFzZS53b3Jkcyl7XHJcbiAgICAgICAgICAgIGlmKHdvcmQgIT0gXCJcIil7XHJcbiAgICAgICAgICAgICAgICBpZih0ZXh0ICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCIgXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IHdvcmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcGhyYXNlLmVuZCA9IHRleHQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgLy8gbXNnKGBwaHJhc2VzIFske3RleHR9XWApXHJcblxyXG4gICAgcmV0dXJuIHRleHQ7XHJcbn1cclxuXHJcbmFic3RyYWN0IGNsYXNzIFRleE5vZGUge1xyXG4gICAgZGljdGlvbiA6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIHRlcm1UZXggOiBBcHAgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgYWJzdHJhY3QgbWFrZVNwZWVjaChwaHJhc2VzIDogUGhyYXNlW10pIDogdm9pZDtcclxuXHJcbiAgICB0ZXJtKCkgOiBUZXJtIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXJtVGV4O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRTdHJpbmcoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgKmdlblRleChzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCB8IG51bGwsIGhpZ2hsaWdodGFibGVzPyA6IE1hcDxzdHJpbmcsIEhpZ2hsaWdodGFibGU+KSA6IEFzeW5jR2VuZXJhdG9yPHN0cmluZywgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgICAgIHlpZWxkIFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2F5KHRleHQgOiBzdHJpbmcpIDogVGV4Tm9kZSB7XHJcbiAgICAgICAgdGhpcy5kaWN0aW9uID0gdGV4dDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBkbXBOb2RlKG5lc3QgOiBzdHJpbmcpe1xyXG4gICAgICAgIGNvbnN0IHRlcm0gPSB0aGlzLnRlcm0oKTtcclxuICAgICAgICBjb25zdCBpZCA9ICh0ZXJtID09IHVuZGVmaW5lZCA/IFwiXCIgOiBgJHt0ZXJtLmlkfWApO1xyXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBUZXhMZWFmKXtcclxuXHJcbiAgICAgICAgICAgIG1zZyhgJHtuZXN0fSR7aWR9OiR7dGhpcy50ZXhUZXh0KCl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcyBpbnN0YW5jZW9mIFRleEJsb2NrKXtcclxuXHJcbiAgICAgICAgICAgIG1zZyhgJHtuZXN0fSR7aWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCh4ID0+IHguZG1wTm9kZShuZXN0ICsgXCJcXHRcIikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgVGV4QmxvY2sgZXh0ZW5kcyBUZXhOb2RlIHtcclxuICAgIG5vZGVzIDogVGV4Tm9kZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5vZGVzIDogVGV4Tm9kZVtdKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIH1cclxuXHJcbiAgICBtYWtlU3BlZWNoKHBocmFzZXMgOiBQaHJhc2VbXSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goeCA9PiB4Lm1ha2VTcGVlY2gocGhyYXNlcykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgVGV4U2VxIGV4dGVuZHMgVGV4QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3Iobm9kZXMgOiBUZXhOb2RlW10pe1xyXG4gICAgICAgIHN1cGVyKG5vZGVzKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyAqZ2VuVGV4KHNwZWVjaCA6IEFic3RyYWN0U3BlZWNoIHwgbnVsbCwgaGlnaGxpZ2h0YWJsZXM/IDogTWFwPHN0cmluZywgSGlnaGxpZ2h0YWJsZT4pIDogQXN5bmNHZW5lcmF0b3I8c3RyaW5nLCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAgICAgY29uc3QgYXJnX3N0cnMgPSB0aGlzLm5vZGVzLm1hcCh4ID0+IHguaW5pdFN0cmluZygpKTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBbaWR4LCBub2RlXSBvZiB0aGlzLm5vZGVzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGZvciBhd2FpdChjb25zdCBzIG9mIG5vZGUuZ2VuVGV4KHNwZWVjaCwgaGlnaGxpZ2h0YWJsZXMpKXtcclxuICAgICAgICAgICAgICAgIGFyZ19zdHJzW2lkeF0gPSBzO1xyXG5cclxuICAgICAgICAgICAgICAgIHlpZWxkIGAke2FyZ19zdHJzLmpvaW4oXCIgXCIpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHlpZWxkIGAke2FyZ19zdHJzLmpvaW4oXCIgXCIpfWA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFic3RyYWN0IGNsYXNzIFRleExlYWYgZXh0ZW5kcyBUZXhOb2RlIHtcclxuICAgIGNoYXJQb3MhIDogbnVtYmVyO1xyXG4gICAgcGhyYXNlIDogUGhyYXNlIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhYnN0cmFjdCB0ZXhUZXh0KCkgOiBzdHJpbmc7XHJcbiAgICBcclxuICAgIHNwZWVjaFRleHQoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4VGV4dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VTcGVlY2gocGhyYXNlcyA6IFBocmFzZVtdKSA6IHZvaWQge1xyXG4gICAgICAgIGxldCB0ZXh0IDogc3RyaW5nO1xyXG4gICAgICAgIGlmKHRoaXMuZGljdGlvbiAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGhpcy5kaWN0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGhpcy5zcGVlY2hUZXh0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGhyYXNlID0gcHJvbnVuY2lhdGlvbkYodGhpcywgdGV4dCk7XHJcbiAgICAgICAgaWYodGhpcy5waHJhc2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcGhyYXNlcy5wdXNoKHRoaXMucGhyYXNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgKmdlblRleChzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCB8IG51bGwsIGhpZ2hsaWdodGFibGVzPyA6IE1hcDxzdHJpbmcsIEhpZ2hsaWdodGFibGU+KSA6IEFzeW5jR2VuZXJhdG9yPHN0cmluZywgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgICAgIGNvbnN0IHRleF90ZXh0ID0gdGhpcy50ZXhUZXh0KClcclxuXHJcbiAgICAgICAgaWYoc3BlZWNoICE9IG51bGwgJiYgdGhpcy5waHJhc2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgd2hpbGUoc3BlZWNoLnNwZWFraW5nICYmIHNwZWVjaC5wcmV2Q2hhckluZGV4IDwgdGhpcy5waHJhc2Uuc3RhcnQpe1xyXG4gICAgICAgICAgICAgICAgbXNnKGBhd2FpdCB0ZXgtbGVhZi5nZW4tdGV4OiBwcmV2LUNoYXItSW5kZXg6JHtzcGVlY2gucHJldkNoYXJJbmRleH0gcGhyYXNlLXN0YXJ0OiR7dGhpcy5waHJhc2Uuc3RhcnR9YClcclxuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0ZXhfdGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeWllbGQgdGV4X3RleHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRleE51bSBleHRlbmRzIFRleExlYWYge1xyXG4gICAgbnVtIDogQ29uc3ROdW07XHJcblxyXG4gICAgY29uc3RydWN0b3IobnVtIDogQ29uc3ROdW0pe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5udW0gPSBudW07XHJcbiAgICB9XHJcblxyXG4gICAgdGVybSgpIDogVGVybSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubnVtO1xyXG4gICAgfVxyXG5cclxuICAgIHRleFRleHQoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubnVtLnZhbHVlLnN0cigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUZXhSZWYgZXh0ZW5kcyBUZXhMZWFmIHtcclxuICAgIHJlZiA6IFJlZlZhcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWYgOiBSZWZWYXIpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5yZWYgPSByZWY7XHJcbiAgICB9XHJcblxyXG4gICAgdGVybSgpIDogVGVybSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmO1xyXG4gICAgfVxyXG5cclxuICAgIHRleFRleHQoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgaWYoaXNHcmVlayh0aGlzLnJlZi5uYW1lKSl7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYFxcXFwke3RoaXMucmVmLm5hbWV9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZi5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gdGhpcy5yZWYudGV4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgKmdlblRleChzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCB8IG51bGwsIGhpZ2hsaWdodGFibGVzPyA6IE1hcDxzdHJpbmcsIEhpZ2hsaWdodGFibGU+KSA6IEFzeW5jR2VuZXJhdG9yPHN0cmluZywgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgICAgIGlmKGhpZ2hsaWdodGFibGVzICE9IHVuZGVmaW5lZCl7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRhYmxlID0gaGlnaGxpZ2h0YWJsZXMuZ2V0KHRoaXMucmVmLm5hbWUpO1xyXG4gICAgICAgICAgICBpZihoaWdobGlnaHRhYmxlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRhYmxlLmhpZ2hsaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGV4X3RleHQgPSB0aGlzLnRleFRleHQoKVxyXG5cclxuICAgICAgICBpZihzcGVlY2ggIT0gbnVsbCAmJiB0aGlzLnBocmFzZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB3aGlsZShzcGVlY2guc3BlYWtpbmcgJiYgc3BlZWNoLnByZXZDaGFySW5kZXggPCB0aGlzLnBocmFzZS5zdGFydCl7XHJcbiAgICAgICAgICAgICAgICBtc2coYGF3YWl0IHRleC1yZWYuZ2VuLXRleDogcHJldi1DaGFyLUluZGV4OiR7c3BlZWNoLnByZXZDaGFySW5kZXh9IHBocmFzZS1zdGFydDoke3RoaXMucGhyYXNlLnN0YXJ0fWApXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCgxMDApO1xyXG4gICAgICAgICAgICAgICAgeWllbGQgdGV4X3RleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHlpZWxkIHRleF90ZXh0O1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUZXhTdHIgZXh0ZW5kcyBUZXhMZWFmIHtcclxuICAgIHN0ciA6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzdHIgOiBzdHJpbmcpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zdHIgPSBzdHI7XHJcbiAgICB9XHJcblxyXG4gICAgc3BlZWNoVGV4dCgpIDogc3RyaW5nIHtcclxuICAgICAgICBpZih0aGlzLnN0ciA9PSBcIlxcXFxsaW1fe1wiKXtcclxuICAgICAgICAgICAgbXNnKFwic3BlZWNoLVRleHQ6bGltXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsaXN0ID0gW1xyXG4gICAgICAgICAgICBcIntcIiwgXCJ9XCIsIFwiKFwiLCBcIilcIiwgXCJ9e1wiLCBcIn1ee1wiLCBcIlxcXFxmcmFje1wiXHJcbiAgICAgICAgXTtcclxuICAgICAgICBpZihsaXN0LmluY2x1ZGVzKHRoaXMuc3RyKSl7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3ltYm9sMndvcmRzKHRoaXMuc3RyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGV4VGV4dCgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGV4TmFtZSh0aGlzLnN0cik7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFN0cmluZygpIDogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBsaXN0ID0gW1xyXG4gICAgICAgICAgICBcIntcIiwgXCJ9XCIsIFwiKFwiLCBcIilcIiwgXCJ9e1wiLCBcIn1ee1wiLFwiXntcIlxyXG4gICAgICAgIF07XHJcbiAgICAgICAgaWYobGlzdC5pbmNsdWRlcyh0aGlzLnN0cikpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuc3RyLnN0YXJ0c1dpdGgoXCJcXFxcXCIpICYmIHRoaXMuc3RyLmVuZHNXaXRoKFwifVwiKSl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRleFNwZWVjaCBleHRlbmRzIFRleFN0ciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0IDogc3RyaW5nKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyAqZ2VuVGV4KHNwZWVjaCA6IEFic3RyYWN0U3BlZWNoIHwgbnVsbCwgaGlnaGxpZ2h0YWJsZXM/IDogTWFwPHN0cmluZywgSGlnaGxpZ2h0YWJsZT4pIDogQXN5bmNHZW5lcmF0b3I8c3RyaW5nLCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAgICAgeWllbGQgXCJcIjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3BjKHRleHQgOiBzdHJpbmcpIDogVGV4U3BlZWNoIHtcclxuICAgIHJldHVybiBuZXcgVGV4U3BlZWNoKHRleHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXEoLi4ucGFyYW1zOmFueVtdKSA6IFRleFNlcSB7XHJcbiAgICByZXR1cm4gbmV3IFRleFNlcShwYXJhbXMubWFwKHggPT4gbWFrZUZsb3coeCkpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gam9pbih0cm1zOlRlcm1bXSwgZGVsaW1pdGVyIDogc3RyaW5nKSA6IFRleE5vZGUge1xyXG4gICAgY29uc3Qgbm9kZXMgPSB0cm1zLm1hcCh4ID0+IG1ha2VUZXJtRmxvdyh4KSk7XHJcbiAgICBpZih0cm1zLmxlbmd0aCA9PSAxKXtcclxuICAgICAgICByZXR1cm4gbWFrZVRlcm1GbG93KHRybXNbMF0pO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjb25zdCBub2RlcyA6IFRleE5vZGVbXSA9IFtdO1xyXG4gICAgICAgIGZvcihjb25zdCBbaSwgdHJtXSBvZiB0cm1zLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGlmKGkgIT0gMCl7XHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5ldyBUZXhTdHIoZGVsaW1pdGVyKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5vZGVzLnB1c2gobWFrZVRlcm1GbG93KHRybSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZXhTZXEobm9kZXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwcmVwZW5kVmFsdWUodHJtIDogVGVybSwgbm9kZSA6IFRleE5vZGUpIDogVGV4Tm9kZSB7XHJcbiAgICBjb25zdCBmdmFsID0gdHJtLnZhbHVlLmZ2YWwoKTtcclxuICAgIGlmKGZ2YWwgIT0gMSAmJiB0cm0uaXNBZGQoKSl7XHJcbiAgICAgICAgbm9kZSA9IHNlcShcIihcIiwgbm9kZSwgXCIpXCIpO1xyXG4gICAgfVxyXG4gICAgaWYoZnZhbCA9PSAtMSl7ICAgICAgICAgICAgXHJcbiAgICAgICAgbm9kZSA9IHNlcShcIi1cIiwgbm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKGZ2YWwgIT0gIDEpe1xyXG4gICAgICAgIGFzc2VydCh0cm0udmFsdWUuZGVub21pbmF0b3IgPT0gMSk7XHJcbiAgICAgICAgbm9kZSA9IHNlcSh0cm0udmFsdWUubnVtZXJhdG9yLnRvRml4ZWQoKSwgbm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYodHJtIGluc3RhbmNlb2YgQXBwKXtcclxuICAgICAgICBub2RlLnRlcm1UZXggPSB0cm07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZsb3codHJtIDogVGV4Tm9kZSB8IFRlcm0gfCBzdHJpbmcpIDogVGV4Tm9kZSB7XHJcbiAgICBpZih0cm0gaW5zdGFuY2VvZiBUZXhOb2RlKXtcclxuICAgICAgICByZXR1cm4gdHJtO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0eXBlb2YgdHJtID09PSBcInN0cmluZ1wiKXtcclxuICAgICAgICByZXR1cm4gbmV3IFRleFN0cih0cm0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0cm0gaW5zdGFuY2VvZiBUZXJtKXtcclxuICAgICAgICByZXR1cm4gbWFrZVRlcm1GbG93KHRybSk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1ha2VUZXJtRmxvdyh0cm0gOiBUZXJtKSA6IFRleE5vZGUge1xyXG4gICAgaWYodHJtIGluc3RhbmNlb2YgUmVmVmFyKXtcclxuICAgICAgICBjb25zdCByZWYgPSB0cm07XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBUZXhSZWYocmVmKVxyXG4gICAgICAgIHJldHVybiBwcmVwZW5kVmFsdWUocmVmLCBub2RlKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodHJtIGluc3RhbmNlb2YgQ29uc3ROdW0pe1xyXG4gICAgICAgIGNvbnN0IG51bSA9IHRybTtcclxuICAgICAgICByZXR1cm4gbmV3IFRleE51bShudW0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0cm0gaW5zdGFuY2VvZiBBcHApe1xyXG4gICAgICAgIGNvbnN0IGFwcCA9IHRybTtcclxuXHJcbiAgICAgICAgbGV0IG5vZGUgOiBUZXhOb2RlO1xyXG5cclxuICAgICAgICBpZihhcHAuZm5jIGluc3RhbmNlb2YgQXBwKXtcclxuXHJcbiAgICAgICAgICAgIGlmKGFwcC5mbmMgaW5zdGFuY2VvZiBSZWZWYXIpe1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoIGFwcC5mbmMsIHNlcShcIihcIiwgam9pbihhcHAuYXJncywgXCIsXCIpLCBcIilcIikgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoIFwiKFwiLCBhcHAuZm5jLCBcIilcIiwgc2VxKFwiKFwiLCBqb2luKGFwcC5hcmdzLCBcIixcIiksIFwiKVwiKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmZuY05hbWUgPT0gXCJsaW1cIil7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZzAgPSBhcHAuYXJnc1swXTtcclxuICAgICAgICAgICAgaWYoYXJnMC5pc0FkZCgpIHx8IGFyZzAuaXNNdWwoKSl7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBcIlxcXFxsaW1fe1wiLCBhcHAuYXJnc1sxXSwgXCJcXFxcdG9cIiwgYXBwLmFyZ3NbMl0sIFwifVwiLCBcIihcIiwgYXBwLmFyZ3NbMF0sIFwiKVwiICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBcIlxcXFxsaW1fe1wiLCBhcHAuYXJnc1sxXSwgXCJcXFxcdG9cIiwgYXBwLmFyZ3NbMl0sIFwifVwiLCBhcHAuYXJnc1swXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmZuY05hbWUgPT0gXCJpblwiKXtcclxuICAgICAgICAgICAgY29uc3QgaWRzID0gam9pbihhcHAuYXJncywgXCIgLCBcIik7XHJcbiAgICAgICAgICAgIG5vZGUgPSBzZXEoIGlkcyAsIFwiXFxcXGluXCIgLCBhcHAuYXJnc1sxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5pc0RpZmYoKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IG4gPSAoYXBwLmFyZ3MubGVuZ3RoID09IDMgPyBzZXEoXCJee1wiLCBhcHAuYXJnc1syXSwgXCJ9XCIpIDogYGApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZCA9IChhcHAuZm5jTmFtZSA9PSBcImRpZmZcIiA/IFwiZFwiIDogXCJcXFxccGFydGlhbFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmKGFwcC5hcmdzWzBdLmlzRGl2KCkpe1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJcXFxcZnJhY3tcIiwgZCwgbiwgXCJ9e1wiLCBzcGMoXCJvdmVyXCIpLCBkLCBhcHAuYXJnc1sxXSwgbiwgXCJ9XCIsIHNlcShcIihcIiwgYXBwLmFyZ3NbMF0sIFwiKVwiKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJcXFxcZnJhY3tcIiwgZCwgbiwgYXBwLmFyZ3NbMF0sIFwifXtcIiwgc3BjKFwib3ZlclwiKSwgZCwgYXBwLmFyZ3NbMV0sIG4sIFwifVwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoaXNMZXR0ZXJPckF0KGFwcC5mbmNOYW1lKSl7XHJcbiAgICAgICAgICAgIGlmKFtcInNpblwiLCBcImNvc1wiLCBcInRhblwiXS5pbmNsdWRlcyhhcHAuZm5jTmFtZSkgJiYgISAoYXBwLmFyZ3NbMF0gaW5zdGFuY2VvZiBBcHApKXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBhcHAuZm5jLCBhcHAuYXJnc1swXSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihhcHAuZm5jTmFtZSA9PSBcInNxcnRcIil7XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGFwcC5hcmdzLmxlbmd0aCA9PSAxKTtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJcXFxcc3FydHtcIiwgYXBwLmFyZ3NbMF0sIFwifVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwibnRoX3Jvb3RcIil7XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGFwcC5hcmdzLmxlbmd0aCA9PSAyKTtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJcXFxcc3FydFtcIiwgYXBwLmFyZ3NbMV0sIFwiXXtcIiwgYXBwLmFyZ3NbMF0sIFwifVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoIGFwcC5mbmMsIHNlcShcIihcIiwgam9pbihhcHAuYXJncywgXCIsXCIpLCBcIilcIikgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goYXBwLmZuY05hbWUpe1xyXG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGFwcC5hcmdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG1ha2VUZXJtRmxvdyhhcHAuYXJnc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA6IFRleE5vZGVbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihjb25zdCBbaSwgYXJnXSBvZiBhcHAuYXJncy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpICE9IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29lZmZpY2llbnQgPSBhcmcudmFsdWUuZnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoMCA8PSBjb2VmZmljaWVudCl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobmV3IFRleFN0cihcIitcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihjb2VmZmljaWVudCA9PSAtMSl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobmV3IFRleFN0cihcIi1cIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcmdfbm9kZSA9IG1ha2VUZXJtRmxvdyhhcmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhcHAuaXNBZGQoKSAmJiBhcmcuaXNNdWwoKSl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChzZXEoXCIoXCIsIGFyZ19ub2RlLCBcIilcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChhcmdfbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBuZXcgVGV4U2VxKG5vZGVzKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBcIipcIjpcclxuICAgICAgICAgICAgICAgIHN3aXRjaChhcHAuYXJncy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBtYWtlVGVybUZsb3coYXBwLmFyZ3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IGpvaW4oYXBwLmFyZ3MsIGFwcC5mbmNOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgXHJcbiAgICAgICAgICAgIGNhc2UgXCIvXCI6XHJcbiAgICAgICAgICAgICAgICBpZihhcHAuYXJncy5sZW5ndGggPT0gMyl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbXNnKGAvIDNhcmdzIFske2FwcC5hcmdzWzBdLnN0cigpfV0gWyAke2FwcC5hcmdzWzFdLnN0cigpfV0gWyAke2FwcC5hcmdzWzJdLnN0cigpfV1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoYXBwLmFyZ3MubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1zZyhgLyAxYXJnIFske2FwcC5hcmdzWzBdLnN0cigpfV1gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFrZVRlcm1GbG93KGFwcC5hcmdzWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGFwcC5hcmdzLmxlbmd0aCA9PSAyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJcXFxcZnJhY3tcIiwgYXBwLmFyZ3NbMF0sIFwifXtcIiwgc3BjKFwib3ZlclwiKSwgYXBwLmFyZ3NbMV0sIFwifVwiKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBcIl5cIjpcclxuICAgICAgICAgICAgICAgIGxldCBleHBvbmVudCA9IG1ha2VUZXJtRmxvdyhhcHAuYXJnc1sxXSk7XHJcbiAgICAgICAgICAgICAgICBpZihhcHAuYXJnc1sxXS5pc1ZhbHVlKDIpKXtcclxuICAgICAgICAgICAgICAgICAgICBleHBvbmVudC5zYXkoXCJzcXVhcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZihhcHAuYXJnc1sxXS5pc1ZhbHVlKDMpKXtcclxuICAgICAgICAgICAgICAgICAgICBleHBvbmVudC5zYXkoXCJjdWJlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb25lbnQgPSBzZXEoXCJ0byB0aGUgcG93ZXIgb2ZcIiwgZXhwb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKGFwcC5hcmdzWzBdIGluc3RhbmNlb2YgQXBwICYmIFtcInNpblwiLFwiY29zXCIsXCJ0YW5cIl0uaW5jbHVkZXMoYXBwLmFyZ3NbMF0uZm5jTmFtZSkpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHAyID0gYXBwLmFyZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHNlcShcIntcIiwgYXBwMi5mbmNOYW1lLCBgfV57YCwgZXhwb25lbnQsIFwifVwiLCBhcHAyLmFyZ3NbMF0gKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHNlcShcIntcIiwgYXBwLmFyZ3NbMF0sIFwifV57XCIsIGV4cG9uZW50LCBcIn1cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGlmKGFwcC5hcmdzLmxlbmd0aCA9PSAxKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHNlcShhcHAuZm5jTmFtZSwgYXBwLmFyZ3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IGpvaW4oYXBwLmFyZ3MsIGFwcC5mbmNOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmKGFwcC5wYXJlbnQgIT0gbnVsbCl7XHJcblxyXG4gICAgICAgIC8vICAgICBpZihhcHAuaXNPcGVyYXRvcigpICYmIGFwcC5wYXJlbnQuaXNPcGVyYXRvcigpICYmICFhcHAucGFyZW50LmlzRGl2KCkpe1xyXG4gICAgICAgIC8vICAgICAgICAgaWYoYXBwLnBhcmVudC5mbmNOYW1lID09IFwiXlwiICYmIGFwcC5wYXJlbnQuYXJnc1sxXSA9PSBhcHApe1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIDtcclxuICAgICAgICAvLyAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgIGVsc2UgaWYoYXBwLnBhcmVudC5wcmVjZWRlbmNlKCkgPD0gYXBwLnByZWNlZGVuY2UoKSl7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgbm9kZSA9IHNlcShcIihcIiwgbm9kZSwgXCIpXCIpO1xyXG4gICAgICAgIC8vICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4gcHJlcGVuZFZhbHVlKGFwcCwgbm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFsbFRleE5vZGVzKG5vZGUgOiBUZXhOb2RlLCBub2RlczogVGV4Tm9kZVtdKXtcclxuICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcblxyXG4gICAgaWYobm9kZSBpbnN0YW5jZW9mIFRleEJsb2NrKXtcclxuICAgICAgICBub2RlLm5vZGVzLmZvckVhY2goeCA9PiBnZXRBbGxUZXhOb2Rlcyh4LCBub2RlcykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWxsVGV4Tm9kZXMobm9kZSA6IFRleE5vZGUpIDogVGV4Tm9kZVtdIHtcclxuICAgIGNvbnN0IHRlcm1zIDogVGV4Tm9kZVtdID0gW107XHJcbiAgICBnZXRBbGxUZXhOb2Rlcyhub2RlLCB0ZXJtcyk7XHJcblxyXG4gICAgcmV0dXJuIHRlcm1zO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZU5vZGVUZXh0QnlBcHAocm9vdCA6IFRlcm0pIDogW1RleE5vZGUsIHN0cmluZ117XHJcbiAgICByb290LnNldFBhcmVudChudWxsKTtcclxuICAgIHJvb3Quc2V0VGFiSWR4KCk7XHJcblxyXG4gICAgY29uc3Qgbm9kZSA9IG1ha2VUZXJtRmxvdyhyb290KTtcclxuICAgIGNvbnN0IHBocmFzZXMgOiBQaHJhc2VbXSA9IFtdO1xyXG4gICAgbm9kZS5tYWtlU3BlZWNoKHBocmFzZXMpO1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSBtYWtlVGV4dEZyb21QaHJhc2VzKHBocmFzZXMpO1xyXG5cclxuICAgIHJldHVybiBbbm9kZSwgdGV4dF07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93RmxvdyhzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCwgcm9vdCA6IFRlcm0sIGRpdiA6IEhUTUxEaXZFbGVtZW50IHwgSFRNTFNwYW5FbGVtZW50LCBoaWdobGlnaHRhYmxlcz8gOiBNYXA8c3RyaW5nLCBIaWdobGlnaHRhYmxlPil7XHJcbiAgICBkaXYuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICBjb25zdCBbbm9kZSwgdGV4dF0gPSBtYWtlTm9kZVRleHRCeUFwcChyb290KTtcclxuXHJcbiAgICBhd2FpdCBzcGVlY2guc3BlYWsodGV4dCk7XHJcblxyXG4gICAgbGV0IHByZXZfcyA9IFwiXCI7XHJcbiAgICBmb3IgYXdhaXQoY29uc3QgcyBvZiBub2RlLmdlblRleChzcGVlY2gsIGhpZ2hsaWdodGFibGVzKSl7XHJcbiAgICAgICAgaWYocHJldl9zICE9IHMpe1xyXG4gICAgICAgICAgICBwcmV2X3MgPSBzO1xyXG5cclxuICAgICAgICAgICAgLy8gbXNnKGBzaG93IGZsb3c6JHtzfWApO1xyXG4gICAgICAgICAgICByZW5kZXJLYXRleFN1YihkaXYsIHMpO1xyXG4gICAgICAgICAgICBhd2FpdCBzbGVlcCgxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZW5kZXJLYXRleFN1YihkaXYsIHJvb3QudGV4KCkpO1xyXG5cclxuICAgIGF3YWl0IHNwZWVjaC53YWl0RW5kKCk7XHJcbn1cclxuXHJcbn0iXX0=