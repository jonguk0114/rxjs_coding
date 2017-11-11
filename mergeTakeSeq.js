const { Observable } = require('rxjs/Rx');
const mergeTakeSeq = (...observables) =>
    new Observable(observer => {
        const { length } = observables;
        let n = observables[length-1];
        if (n instanceof Observable) {
            n = Number.POSITIVE_INFINITY;
        } else if (typeof n === "number" && n > 0) {
            observables.pop();
        } else {
            throw TypeError('LAST parameter should be observable or positive integer');
        }
        let currentIndex = 0;
        const resultArray = new Array(length);
        return Observable.from(observables)
                    .mergeMap((observable, index) => {
                        return observable.take(n)
                                .last()
                                .do(result => resultArray[index] = result)
                                .mergeMap(result => {
                                    const nextResults = [];
                                    let currentResult = resultArray[currentIndex];
                                    while (currentIndex < length && currentResult) {
                                        nextResults.push(currentResult);
                                        currentResult = resultArray[++currentIndex];
                                    }
                                    return nextResults.length === 0 ? Observable.empty() : Observable.from(nextResults);
                                });
                    })
                    .subscribe(x => observer.next(x), err => observer.error(err), () => observer.complete());
    });
const mergeTakeSeqLettable = (...otherObservables) => source => mergeTakeSeq(source, ...otherObservables);
const req1$ = Observable.interval(500)
                .map(value => `req1 - ${value}`)
                .do(x => console.log(`[do] ${x}`));
const req2$ = Observable.interval(1000)
                .map(value => `req2 - ${value}`)
                .do(x => console.log(`[do] ${x}`));
const req3$ = Observable.interval(500)
                .map(value => `req3 - ${value}`)
                .do(x => console.log(`[do] ${x}`));

mergeTakeSeq(req1$, req2$, req3$, 2)
    .subscribe(x => console.log(x));
/*
// lettable operator from an observable instance
req1$.let(mergeTakeSeqLettable(req2$, req3$, 2))
    .subscribe(x => console.log(x), err => console.log(`ERROR is ${err.message}`));
*/
