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
# License

The MIT License   

Copyright ⓒ 2017 Jonguk Lee  

See [LICENSE](https://github.com/jonguk0114/rxjs_coding/blob/master/LICENSE.md)   


