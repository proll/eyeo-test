(function () {
    var eycal = {},
        app = null;

    // generates fire event with btn gui on click
    eycal.ButtonView = function(id, nm, ttl, key_code) {
        var template =
            '<button class="eycal__button" data-guid="{{guid}}" title="{{title}}">{{name}}</button>',
            name = nm ? nm : '',
            title = ttl ? ttl : '',
            guid = id ? id : generateID(),
            el = null,
            evt = new CustomEvent('press', { detail: guid });

        function generateID() {
            var max_id = 1000000;

            return 'id' + Math.round(Math.random() * max_id);
        }

        function render() {
            var tmpl = '',
                div = null;

            tmpl = template
                .replace('{{guid}}', guid)
                .replace('{{title}}', title)
                .replace('{{name}}', name);
            div = document.createElement('div');
            div.innerHTML = tmpl;
            return div.childNodes[0];
        }

        el = render();
        el.addEventListener('click', function(e) {
            // protection from click by pressing 'return'
            if (e.x !== 0) {
                el.dispatchEvent(evt);
            }
        }, false);

        // check the keyboard
        if (key_code) {
            document.addEventListener('keypress', function(e) {
                e.stopPropagation();
                if (e.keyCode === key_code) {
                    el.focus();
                    el.dispatchEvent(evt);
                }
            });
        }

        return el;
    };

    eycal.App = function() {
        var max_digit = 28,
            result_str = '0',
            result_field = null,
            operation_queue = [],
            is_digit_last = false,
            is_block = true,
            actions = [
                {
                    type: 'digit_mod',
                    id: 'c',
                    name: 'AC',
                    title: 'reset',
                    key: 'c'
                },
                {
                    type: 'digit_mod',
                    id: 'plusminus',
                    name: '&#177;',
                    title: 'plus/minus',
                    key: ''
                },
                {
                    type: 'digit_mod',
                    id: 'empty',
                    name: '',
                    title: '',
                    key: ''
                },
                {
                    type: 'digit',
                    id: '1',
                    name: '1'
                },
                {
                    type: 'digit',
                    id: '2',
                    name: '2'
                },
                {
                    type: 'digit',
                    id: '3',
                    name: '3'
                },
                {
                    type: 'digit',
                    id: '4',
                    name: '4'
                },
                {
                    type: 'digit',
                    id: '5',
                    name: '5'
                },
                {
                    type: 'digit',
                    id: '6',
                    name: '6'
                },
                {
                    type: 'digit',
                    id: '7',
                    name: '7'
                },
                {
                    type: 'digit',
                    id: '8',
                    name: '8'
                },
                {
                    type: 'digit',
                    id: '9',
                    name: '9'
                },
                {
                    type: 'digit',
                    id: '0',
                    name: '0'
                },
                {
                    type: 'digit_mod',
                    id: 'dot',
                    name: '.'
                },
                {
                    type: 'operation',
                    id: 'plus',
                    name: '+',
                    title: 'addition',
                    func: function(res1, res2) {
                        return res1 + res2;
                    }
                },
                {
                    type: 'operation',
                    id: 'minus',
                    name: '–',
                    title: 'subtraction',
                    key: '-',
                    func: function(res1, res2) {
                        return res1 - res2;
                    }
                },
                {
                    type: 'operation',
                    id: 'multy',
                    name: '&#215;',
                    title: 'multiplication',
                    key: '*',
                    func: function(res1, res2) {
                        return res1 * res2;
                    }
                },
                {
                    type: 'operation',
                    id: 'div',
                    name: '&#247;',
                    title: 'division',
                    key: '/',
                    func: function(res1, res2) {
                        return res1 / res2;
                    }
                },
                {
                    type: 'operation',
                    id: 'exp',
                    name: 'exp',
                    title: 'exponential',
                    key: '',
                    queue: 1,
                    func: function(res1) {
                        return Math.exp(res1);
                    }
                },
                {
                    type: 'operation',
                    id: 'equal',
                    name: '&#9166;',
                    title: 'equals',
                    key: String.fromCharCode(13),
                    queue: 1,
                    func: function(res1) {
                        return res1;
                    }
                }
            ];


        function addAction(type, id, nm, ttl, key_code) {
            var btn = null;

            btn = new eycal.ButtonView(id, nm, ttl, key_code);

            if (type === 'digit' || type === 'digit_mod') {
                document.getElementsByClassName('eycal__col_digit')[0]
                    .appendChild(btn);
            } else if (type === 'operation') {
                document.getElementsByClassName('eycal__col_operation')[0]
                    .appendChild(btn);
            }

            btn.addEventListener('press', function(e) {
                doAction(e.detail);
            });
        }

        function getAction(guid) {
            var action_length = actions.length,
                i = 0;

            for (i = 0; i < action_length; i++) {
                if (actions[i].id === guid) {
                    return actions[i];
                }
            }
            return false;
        }

        function doAction(action_guid) {
            var action = getAction(action_guid);

            if (action) {
                if (action.id === 'c') {
                    reset();
                } else if (!is_block) {
                    // digits
                    if (action.type === 'digit') {
                        if (result_str === '0') {
                            updateResult(action.id);
                        } else {
                            updateResult(result_str + action.id);
                        }
                        is_digit_last = true;

                    // operation modificators
                    } else if (action.type === 'digit_mod') {
                        if (action.id === 'plusminus') {
                            if (result_str !== '0') {
                                if (result_str.indexOf('-') === 0) {
                                    updateResult(result_str.substr(1));
                                } else {
                                    updateResult('-' + result_str);
                                }
                            }

                        } else if (action.id === 'dot' && !is_block) {
                            if (result_str.indexOf('.') === -1) {
                                updateResult(result_str + '.');
                            }
                        }
                        is_digit_last = false;

                    // operations
                    } else if (action.type === 'operation') {
                        if (action.func) {
                            pushEquation(action);
                        }
                        is_digit_last = false;
                    }
                }
            }
        }

        // logic of calculator input and operation
        function pushEquation(action) {
            var res1 = 0,
                action_pre_id = '',
                action_pre = null;

            if (!is_digit_last && (!action.queue || action.queue !== 1)) {
                // if we press operation again
                if (operation_queue.length && operation_queue.length === 2) {
                    operation_queue.pop();
                    operation_queue.push(action.id);
                } else {
                    operation_queue.push(getResult(), action.id);
                }
                return;
            }

            // we press next operation
            if (operation_queue.length && operation_queue.length === 2) {
                res1 = operation_queue.shift();
                action_pre_id = operation_queue.shift();
                action_pre = getAction(action_pre_id);
                updateResult(
                    action_pre.func(
                        res1,
                        getResult()
                    )
                );
                operation_queue = [];
            }

            // we press exp or equals - instant operation
            if (action.queue && action.queue === 1) {
                updateResult(action.func(getResult()));
            } else {
                operation_queue.push(getResult(), action.id);
                updateResult(getResult());
            }

            clearResult();
        }

        // get current calculator value - float
        function getResult() {
            return parseFloat(result_str);
        }

        function updateResult(res) {
            var rloc = res.toString();

            if (rloc.length < max_digit) {
                result_str = rloc;
                result_field.value = result_str;

                if (result_str === 'Infinity' ||
                    result_str === 'NaN' ||
                    result_str === '-Infinity') {
                    is_block = true;
                }
            }
        }

        function clearResult() {
            result_str = '0';
        }

        function reset() {
            operation_queue = [];
            updateResult('0');
            is_digit_last = true;
            is_block = false;
        }

        return {
            init: function() {
                var action_length = actions.length,
                    i = 0;

                for (i; i < action_length; i++) {
                    addAction(
                        actions[i].type,
                        actions[i].id,
                        actions[i].name,
                        actions[i].title,
                        actions[i].key ?
                            actions[i].key.charCodeAt(0) : actions[i].name.charCodeAt(0)
                    );
                }

                result_field = document.getElementsByClassName('eycal__input')[0];
                updateResult('0');
                is_digit_last = true;
                is_block = false;
            }
        };
    };

    app = new eycal.App();
    app.init();
})();
