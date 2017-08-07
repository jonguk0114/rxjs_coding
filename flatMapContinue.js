const Rx = require('rxjs/Rx');
const flatMapContinueLettable = (project, resultSelector, concurrent) => source => source.flatMap(
		(value, index) => project(value, index).catch(err => Rx.Observable.empty()), resultSelector, concurrent);
Rx.Observable.prototype.flatMapContinue = function(project, resultSelector, concurrent) {
	return this.let(flatMapContinueLettable(project, resultSelector, concurrent));
};

Rx.Observable.range(1, 10)
	.let(flatMapContinueLettable(x => x % 2 === 0 ? Rx.Observable.of(x+2) : Rx.Observable.throw(new Error('error'))))
	.flatMapContinue(x => x % 2 === 0 ? Rx.Observable.of(x+1) : Rx.Observable.throw(new Error('error')))
	.subscribe(result => console.log(`result ${result}`));

