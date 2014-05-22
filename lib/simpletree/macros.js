'use strict';


/*
function let_(node, state, log) {
    num_args('let', 2, error, null, null, node, log);
    if ( node.elems.length === 2 ) {
        log.push(warning('let', 'missing body forms', node.pos, {}));
    }
    // TODO this is going to become part of the 'binding forms' check
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'vector' ) ) {
        log.push(error('let', '2nd arg must be a vector', node.pos, {}));
    }
}

function loop(node, state, log) {
    num_args('loop', 2, error, null, null, node, log);
    if ( node.elems.length === 2 ) {
        log.push(warning('loop', 'missing body forms', node.pos, {}));
    }
    // TODO this is going to become part of the 'binding forms' check
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'vector' ) ) {
        log.push(error('loop', '2nd arg must be a vector', node.pos, {}));
    }
}

function fn(node, state, log) {
    // TODO 
}
*/


function defn(node, log, env, state) {
    var elems = node.elems;
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type === 'symbol' ) {
            var name = second.name;
            // one major drawback (for now):
            //   ignoring namespaces
            if ( state.is_bound(name) ) {
                log.issue({'severity': 'warning', 'name': 'defn', 
                           'position': second.pos, 'message': 'redefining symbol', 
                           'symbol': name, 'original position': state.position(name)});
            } else {
                state.define(name, second.pos);
            }
        } else {
            log.issue({'name': 'defn', 'severity': 'error', 'position': second.pos,
                       'message': '2nd arg must be a symbol'});
        }
    }
}


module.exports = {
    'defn': defn,
    'defn-': defn,
    'defmacro': defn
};

