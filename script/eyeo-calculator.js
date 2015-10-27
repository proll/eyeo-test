// on keypress enter button press - fix
// fix value +-* -> change last equation
// nan, infinity

(function (global) {
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
        el.addEventListener('click', function() {
            el.dispatchEvent(evt);
        }, false);

        // check the keyboard
        if (key_code) {
            document.addEventListener('keypress', function(e) {
                console.log(e);
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
            equation_queue = [],
            is_digit_last = false;
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
                    type: 'equation',
                    id: 'plus',
                    name: '+',
                    title: 'addition',
                    func: function(res1, res2) {
                        return res1 + res2;
                    }
                },
                {
                    type: 'equation',
                    id: 'minus',
                    name: '–',
                    title: 'subtraction',
                    key: '-',
                    func: function(res1, res2) {
                        return res1 - res2;
                    }
                },
                {
                    type: 'equation',
                    id: 'multy',
                    name: '&#215;',
                    title: 'multiplication',
                    key: '*',
                    func: function(res1, res2) {
                        return res1 * res2;
                    }
                },
                {
                    type: 'equation',
                    id: 'div',
                    name: '&#247;',
                    title: 'division',
                    key: '/',
                    func: function(res1, res2) {
                        return res1 / res2;
                    }
                },
                {
                    type: 'equation',
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
                    type: 'equation',
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
            } else if (type === 'equation') {
                document.getElementsByClassName('eycal__col_equation')[0]
                    .appendChild(btn);
            }

            btn.addEventListener('press', function(e) {
                console.log('press ' + e.detail);
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
                // digits
                if (action.type === 'digit') {
                    if (result_str === '0') {
                        updateResult(action.id);
                    } else {
                        updateResult(result_str + action.id);
                    }
                    is_digit_last = true;

                // equation modificators
                } else if (action.type === 'digit_mod') {
                    if (action.id === 'c') {
                        reset();

                    } else if (action.id === 'plusminus') {
                        if (result_str !== '0') {
                            if (result_str.indexOf('-') === 0) {
                                updateResult(result_str.substr(1));
                            } else {
                                updateResult('-' + result_str);
                            }
                        }

                    } else if (action.id === 'dot') {
                        updateResult(result_str + '.');
                    }
                    is_digit_last = false;

                // equations
                } else if (action.type === 'equation') {
                    if (action.func) {
                        pushEquation(action);
                    }
                    is_digit_last = false;
                }
            }
        }

        // logic of calculator input and equation
        function pushEquation(action) {
            var res1 = 0,
                action_pre_id = '',
                action_pre = null;

            if (!is_digit_last) {
                if (equation_queue.length && equation_queue.length === 2) {
                    equation_queue.pop();
                    equation_queue.push(action.id);
                } else {
                    equation_queue.push(getResult(), action.id);
                }
                console.log('rewrite equation', equation_queue);
                return;
            }

            if (equation_queue.length && equation_queue.length === 2) {
                res1 = equation_queue.shift();
                action_pre_id = equation_queue.shift();
                action_pre = getAction(action_pre_id);
                console.log('filled arr ' + action_pre.func(
                    res1,
                    getResult()
                ), []);
                updateResult(
                    action_pre.func(
                        res1,
                        getResult()
                    )
                );
                equation_queue = [];
            }

            if (action.queue && action.queue === 1) {
                console.log('instant compute ' + action.func(getResult()), equation_queue);
                updateResult(action.func(getResult()));
            } else {
                equation_queue.push(getResult(), action.id);
                console.log('do nothing', equation_queue);
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

            console.log(rloc);
            if (rloc.length < max_digit) {
                result_str = rloc;
                result_field.value = result_str;
            }
        }

        function clearResult() {
            result_str = '0';
        }

        function reset() {
            equation_queue = [];
            updateResult('0');
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
            }
        };
    };

    app = new eycal.App();
    app.init();
})(window);
