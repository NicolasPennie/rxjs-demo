// Demo observer
const observer = {
    next: val => doSomething(val),
    error: e => handleError(e),
    complete: () => console.log('all done!')
}

class Observable {
    constructor(handleObserver) {
        this.subscribe = handleObserver;
    }

    /**
     * Transforms an observable into another observable based on the provided operators.
     * @param  {...Function} operators Functions that transform one observable into another.
     */
    pipe(...operators) {
        if (operators.length === 0) {
            return this;
        }

        return operators.reduce((acc, operator) => operator(acc), this);
    }
}

class Subscription {
    constructor(handleUnsubscribe) {
        this.unsubscribe = handleUnsubscribe;
    }
}

/* Operators */

/**
 * Unity operator.
 */
function noop() {
    return observable => observable;
}

/**
 * Generates a new observable that will project the original values according to the provided mapping function.
 * @param {Function} fn Mapping function.
 */
function map(fn) {
    return observable => new Observable(({ next, error, complete }) => {
        const sink = observable.subscribe({
            next: x => next(fn(x)),
            error: e => error && error(e),
            complete: () => complete && complete()
        });
        
        return new Subscription(() => sink.unsubscribe());
    });
}

/* script */

// cold observable
const obs$ = new Observable(({ next, error, complete }) => {
    let count = 0;
    const timer = setInterval(() => next(count++), 500);
    return new Subscription(() => clearInterval(timer));
});

// hot observable example
/* WebSocket will not work with Node
const socket = new WebSocket('ws://mysocket');
const hot$ = new Observable(({ next, error, complete }) => {
    const handleMessage = e => next(e);
    socket.addEventListener('message', handleMessage);
    return new Subscription(() => socket.removeEventListener('message', handleMessage));
});
*/

// chained observable
const chained$ = obs$.pipe(
    noop(),
    map(x => x * 2 + 1),
    map(x => 'my val is: ' + x)
);

const sub = chained$.subscribe({
    next: console.log,
    error: console.error,
    complete: () => console.log('we done!')
});

console.log('subscribed!');

setInterval(() => sub.unsubscribe(), 3000);

