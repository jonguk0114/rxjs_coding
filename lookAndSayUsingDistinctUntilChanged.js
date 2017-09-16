const Rx = require('rxjs/Rx');
function next(observable) {
	let count = 1;
	let prev = -1;
	return observable
			.do(x => x === prev && count++) // same value count
			.distinctUntilChanged() // distinct value only until changed
			.map(current => ({
				prev,
				current
			})) // keep prev and current
			.do(prevCurrent => prev = prevCurrent.current) // reset prev
			.concatMap(prevCurrent => prevCurrent.prev !== -1 ? Rx.Observable.of(count, prevCurrent.prev) : Rx.Observable.empty()) // next Observable
			.do(x => count = 1) // reset count
			.concat(Rx.Observable.defer(() => Rx.Observable.of(count, prev))); // last Observable
}

function lookAndSaySeq(n) { 
	return Rx.Observable.range(1, n)
			.reduce((next$, current) => current === 1 ? Rx.Observable.of(1) : next(next$), null)
			.concatAll();
}

const n = 5;
console.log(`==== sequence 1 ~ ${n} ====`);
Rx.Observable.range(1, n)
	.do(i => process.stdout.write(`${i} sequence: `))
	.concatMap(i => lookAndSaySeq(i).finally(() => console.log('')))
	.subscribe(x => process.stdout.write(`${x}`));

console.log(`==== sequence ${n} Only ====`);
lookAndSaySeq(n).startWith(`${n} sequence: `).finally(() => console.log('')).subscribe(x => process.stdout.write(`${x}`));

