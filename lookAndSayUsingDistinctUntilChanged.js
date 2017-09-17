const Rx = require('rxjs/Rx');
const n = process.argv.length >= 3 ? parseInt(process.argv[2]) : 5;
const m = process.argv.length >= 4 ? (process.argv[3] === 'max' ? Number.MAX_VALUE :
    parseInt(process.argv[3])) : 1000;
const showAll = process.argv.length >= 5 ? process.argv[4] === 'showAll' : false;

const completeSubject = new Rx.Subject().take(m).last();
function next(prevObservable) {
    if (prevObservable === null) {
        return Rx.Observable.of(1);
    }
    let count = 1;
    let prevValue = -1;
    return prevObservable
            .takeUntil(completeSubject) // each observable should be complete
            .do(x => x === prevValue && count++) // same value count
            .distinctUntilChanged() // distinct value only until changed
            .map(newValue => ({prevValue, newValue, count})) // keep prev and new
            .do(prevAndNew => [prevValue, count] = [prevAndNew.newValue, 1]) // reset prevValue and count
            .skip(1) // skip first time because first time is before value changed or stream is completed
            .map(prevAndNew => ({value: prevAndNew.prevValue, count: prevAndNew.count})) // prevAndNew -> prev Only
            .concatMap(prev => Rx.Observable.of(prev.count, prev.value)) // next Observable
            .concat(Rx.Observable.defer(() => Rx.Observable.of(count, prevValue))); // last Observable
}
function lookAndSaySeq(n, m) {
    return Rx.Observable.range(1, n)
            .reduce(next$ => next(next$), null)
            .concatAll()
            .do(x => completeSubject.next(x))
            .take(m);
}
if ( n <= 10 || showAll) {
    console.log(`==== sequence 1 ~ ${n} ====`);
    Rx.Observable.range(1, n)
        .do(i => process.stdout.write(`${i} sequence: `))
        .concatMap(i => lookAndSaySeq(i, m).finally(() => console.log('')))
        .subscribe(x => process.stdout.write(`${x}`));
}

console.log(`==== sequence ${n} Only ====`);
lookAndSaySeq(n, m)
    .finally(() => console.log(''))
    .subscribe(x => process.stdout.write(`${x}`));
