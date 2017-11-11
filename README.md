# rxjs_coding
 RxJS로 코딩해서 만든 것 모아놓아볼까 합니다.  
 Jonguk's RxJS coding  

# Install  
 npm install  

# run  
 node [js file]  

# file list  
 merge_seq.js   
 mergeTakeSeq.js   
 flatMapContinue.js    
 lookAndSayUsingDistinctUntilChanged.js   

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

# mergeTakeSeq   
Merge each observable and emitting sequence is given argument sequence.   
When last argument is positive number, the value is n and otherwise n is POSITIVE_INFINITY.    
Emitted value is value from each observable with take(n).last.   
For example, the following code result is `req1 - 1`, `req - 2`, `req - 3` because
value n is 2 and 2nd value of interval is 1.   
In the example, `req1 - 1` is emitted when the result is emitted from the req1$
and when req3$ emits `req3 - 1`, the result is not emitted because `req2 - 1` is
not emitted from req2$. When `req2 - 1` is emitted from req2$, `req2 - 1` and
`req3 - 1` are emitted sequentially.    
To support instance operator and avoiding dependency with Observable instance,
lettable operator whose name is `mergeTakeSeqLettable` is provided. The lettable
operator example is commented in the following example.   

`[Example source code]`
```js
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
```

`[Example Output]`
```
[do] req1 - 0
[do] req3 - 0
[do] req2 - 0
[do] req1 - 1
req1 - 1
[do] req3 - 1
[do] req2 - 1
req2 - 1
req3 - 1
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
const n = 10;  // sequence number
const m = 100; // characters length
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

console.log(`==== sequence ${n}, ${m} characters ====`);
lookAndSaySeq(n, m)
    .startWith(`${n} sequence: `)
    .finally(() => console.log(''))
    .subscribe(x => process.stdout.write(`${x}`))
```

## Look-and-say sequence References
https://en.wikipedia.org/wiki/Look-and-say_sequence   
https://leanpub.com/programming-look-and-say  


# License

The MIT License   

Copyright ⓒ 2017 Jonguk Lee  

See [LICENSE](https://github.com/jonguk0114/rxjs_coding/blob/master/LICENSE.md)   
