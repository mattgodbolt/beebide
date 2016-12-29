define(function () {
    return {
        defaultToken: 'invalid',
        brackets: [
            ['{', '}', 'delimiter.curly'],
            ['[', ']', 'delimiter.square'],
            ['(', ')', 'delimiter.parenthesis'],
        ],
        opcodes: [
            'LDA', 'LDX', 'LDY',
            'STA', 'STX', 'STY',
            'TAX', 'TAY', 'TXA', 'TYA', 'TSX',
            'ADC', 'SBC', 'SEC', 'CLC',
            'INC', 'DEC',
            'INY', 'DEY',
            'INX', 'DEX',
            'CLI', 'SEI',
            'CLD', 'SED',
            'CMP', 'CPX', 'CPY',
            'AND', 'ORA', 'EOR',
            'BPL', 'BMI', 'BEQ', 'BNE', 'BRA', 'BCC', 'BCS', 'BVS', 'BVC',
            'JMP', 'BRK',
            'ROL', 'ROR', 'ASL',
            'BIT'
        ],
        directives: [
            'ORG',
            'CPU',
            'SKIP',
            'SKIPTO',
            'ALIGN',
            'INCLUDE',
            'INCBIN',
            'EQUB',
            'EQUW',
            'EQUD',
            'EQUS',
            'MAPCHAR',
            'GUARD',
            'CLEAR',
            'SAVE',
            'PRINT',
            'ERROR',
            'FOR', 'NEXT',
            'IF', 'ELIF', 'ELSE', 'ENDIF',
            'PUTFILE',
            'PUTBASIC',
            'MACRO',
            'ENDMACRO'
        ],
        intrinsics: [
            'LO', 'HI',
            'SIN', 'COS', 'TAN', 'ATN', 'ABS', 'SQR',
            'PI', 'FALSE', 'TRUE'
        ],
        operators: [
            '#', // immediate
            '+', '-', '*', '/', '<<', '>>', '^', '=', '==', '<>', '!=', '<', '>', '<=', '>=',
            '{', '}', ':'
        ],
        symbols: /[-+#=><!*\/{}:]+/,
        tokenizer: {
            root: [
                // identifiers and keywords
                [/[a-zA-Z_$][\w$]*/, {
                    cases: {
                        '@directives': 'keyword',
                        '@opcodes': 'keyword',
                        '@intrinsics': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/,\s*[XY]/, 'keyword'],
                // whitespace
                {include: '@whitespace'},
                // labels
                [/\.[a-zA-Z_$][\w$]*/, 'type.identifier'],
                // immediate
                [/@symbols/, { cases: {'@operators' : 'operator', '@default': ''}}],
                // numbers
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/&[0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
                [/[{}()\[\]]/, '@brackets']
            ],
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/[;\\\\].*/, 'comment']
            ]
        }
    };
});