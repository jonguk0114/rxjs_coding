const { Observable } = require('rxjs/Rx');
const mergeSeq = function(first = false, ...observables) {
    const observableLength = observables.length;
    const selectOperatorName = first ? 'first' : 'last';
    return Observable.from(observables)
	.mergeMap((observable,index) => Observable.zip(
		        observable.do(value => console.log(`do ${value}`))[selectOperatorName](), 
			Observable.of(index), 
			(result, index) => {return {result, index}}))
	.scan((acc, current) => {
	   const accResults = acc.accResults || new Array(observableLength);
	   accResults[current.index] = current.result;
	   const nextIndex = acc.nextIndex;
	   const results = [];
	   let serachIndex;
  	   for (searchIndex = nextIndex; accResults[searchIndex]; searchIndex++) {
		results.push(accResults[searchIndex]);	
		accResults[searchIndex] = null;
 	   }
	   return {
		nextIndex: searchIndex,
		results: results,
		accResults: accResults
	   }
	}, {nextIndex: 0}).pluck('results').concatAll();
};
const parallelConcatFirst = (...observables) => mergeSeq(true, ...observables);
const parallelConcatLast = (...observables) => mergeSeq(false, ...observables);

const req1$ = Observable.timer(2000).map(value => "req1");
const req2$ = Observable.timer(4000).map(value => "req2");
const req3$ = Observable.timer(2000).map(value => "req3");

mergeSeq(req1$, req2$, req3$).subscribe(value => console.log(`subscribe result: ${value}`));
//parallelConcatLast(req1$, req2$, req3$).subscribe(value => console.log(`subscribe result: ${value}`))
//parallelConcatFirst(req1$, req2$, req3$).subscribe(value => console.log(`subscribe result: ${value}`));

