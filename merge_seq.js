const { Observable } = require('rxjs/Rx');

function mergeSeq(...observables) {
    const observableLength = observables.length;
    return Observable.from(observables)
	.mergeMap((observable,index) => Observable.zip(
			observable.do(value => console.log(`do ${value}`)).last(), 
			Observable.of(index), 
			(result, index) => {return {result, index}}))
	.scan((acc, current) => {
	   acc.results = null;
	   acc.accResults[current.index] = current.result;
	   const results = [];
	   let searchIndex;
  	   for (searchIndex = acc.nextIndex; 
			acc.accResults[searchIndex]; searchIndex++) {
		results.push(acc.accResults[searchIndex]);	
		acc.accResults[searchIndex] = null;
 	   }
	   return {
		nextIndex: searchIndex,
		results: results,
		accResults: acc.accResults
	   }
	}, {
	   nextIndex: 0,
	   results: null,
	   accResults: new Array(observableLength)
	}).concatMap((accObj) => Observable.from(accObj.results));
}

const req1$ = Observable.timer(2000).map(value => "req1");
const req2$ = Observable.timer(4000).map(value => "req2");
const req3$ = Observable.timer(2000).map(value => "req3");

mergeSeq(req1$, req2$, req3$).subscribe(
	value => console.log(`subscribe result: ${value}`)
); 

