const Rx = require('rxjs/Rx');
function next(prevObservable) {
	if (prevObservable === null) {
		return Rx.Observable.of(1);
	}
	let count = 1;
	let prevValue = -1;
	return prevObservable
			.do(x => x === prevValue && count++) // same value count
			.distinctUntilChanged() // distinct value only until changed
			.do(x => prevValue = prevValue === -1 ? x : prevValue) // if first time, set prevValue to value only (init)
			.skip(1) // skip first time because first time is before value changed or stream is completed 
			.map(newValue => ({prevValue, newValue, count})) // keep prev and new 
			.do(prevAndNew => [prevValue, count] = [prevAndNew.newValue, 1]) // reset prevValue and count 
			.map(prevAndNew => ({
				value: prevAndNew.prevValue,
				count: prevAndNew.count
			})) // prevAndNew -> prev Only		
			.concatMap(prev => Rx.Observable.of(prev.count, prev.value)) // next Observable
			.concat(Rx.Observable.defer(() => Rx.Observable.of(count, prevValue))); // last Observable
}

function lookAndSaySeq(n) { 
	return Rx.Observable.range(1, n)
			.reduce((next$, current) => next(next$), null)
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

