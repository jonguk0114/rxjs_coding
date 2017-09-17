# rxjs_coding
 RxJS로 코딩해서 만든 것 모아놓아볼까 합니다.  
 Jonguk's RxJS coding  

# Install  
 npm install  

# run  
 node [js file]  

# file list  
 merge_seq.js  

# mergeSeq   
merge로 하되, 요청한 순서에 따라 다음 item을 보여준다. 요청순서가 늦으면 scan에 저장하고 있다가, 사용가능할 때 보여줌.  
제약사항으로는 last operator로 각 observable에서 마지막 1개의 아이템만 취급한다. 그러므로 무한Observable은 무한루프를 발생시킵니다.  

merge but emission sequence follows request sequence when response is available.  
Restriction: get only last item from each observable by using last operator.
Thus, infinite observable causes infinite loop.
 ```js
 // run each observable by mergeMap: observable.do(value => console.log(`do ${value}`)).last()
 const req1$ = Observable.timer(2000).map(value => "req1");
 const req2$ = Observable.timer(4000).map(value => "req2");
 const req3$ = Observable.timer(2000).map(value => "req3");
 mergeSeq(req1$, req2$, req3$).subscribe(value => console.log(`subscribe result: ${value}`));
 /*
 do req1
 subscribe result: req1
 do req3
 do req2
 subscribe result: req2
 subscribe result: req3
 */
 ```

# flatMapContinue
flatMap의 프로젝트함수가 리턴하는 옵저버블이 에러를 낼 때 이를 Observable.empty()를 대신 리턴해줌으로써 무시하고 다음 emit하는 값을 계속하도록 하기위함   
When the Observable returned by flatMap project function throws error, the error is ignored by Rx.Observable.empty() and continue next emitted values.
```js
Rx.Observable.range(1, 10)
	.let(flatMapContinueLettable(x => x % 2 === 0 ? Rx.Observable.of(x+2) : Rx.Observable.throw(new Error('error'))))
	.flatMapContinue(x => x % 2 === 0 ? Rx.Observable.of(x+1) : Rx.Observable.throw(new Error('error')))
	.subscribe(result => console.log(`result ${result}`));
```
## Prototype operator
```js
const result$ = source$.flatMapContinue([flatmap arguements]));
```

## Lettable operator
```js
const result$ = source$.let(flatMapContinueLettable([flatmap arguements]));
```

# Look-and-say sequence using distinctUntilChanged operator  - 개미수열 distinctUntilChanged 연산자 이용
distinctUntilChanged 연산자와 내부변수(count, prev)를 이용해서 개미수열을 만들어보았다.    
look-and-say seqneuce implementation using distinctUntilChanged operator and internal variables(count, prev)   

```js
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
console.log(`==== sequence ${n} ====`);
lookAndSaySeq(n).startWith(`${n} sequence: `).finally(() => console.log('')).subscribe(x => process.stdout.write(`${x}`));
```

## Look-and-say sequence References
https://en.wikipedia.org/wiki/Look-and-say_sequence   
https://leanpub.com/programming-look-and-say  


# License

The MIT License   

Copyright ⓒ 2017 Jonguk Lee  

See [LICENSE](https://github.com/jonguk0114/rxjs_coding/blob/master/LICENSE.md)   
