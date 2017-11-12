import { Subject } from 'rxjs/Subject';
import { filter, map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of'
import { merge } from 'rxjs/observable/merge'

const action$ = new Subject();

// My larger idea is to somehow make it fairly seamless to have worker epics.
// I.e. epics that run completely with in a web worker. What would be nice
// though, is to be able to collocate them with the rest of your code. I also
// went back on fourth on whether to encapsulate async worker tasks into a
// helper, like a `postMessage` that returned an observable, or whether to do
// what i'm now suggesting which is simply export a worker epic (can be the
// result of combine epics) that functions almost exactly the same as any other
// epic. Then, at some point I will need to create the worker itself which gets
// set up much like redux observable. It takes in, from the outside world, some
// sort of root epic and connects that up. But when it subscribes to the stream
// the results are posted back and dispatched into the redux store (at that
// point of course they will also make it into standard epics, so there might be
// some considerations to be had here.)
//
// const workerEpic = (action$) =>
//   action$.ofType('FETCH')
//     .do(x => debug('JUST SAW', x))
//     .ignoreElements();

onmessage = (e) => {
  action$.next(e.data);
};

onerror = (err) => {
  action$.error(err);
};

const safeEpic = (action$) =>
  action$.pipe(
    filter(x => x.type === 'PING'),
    map(x => ({ type: 'PONG' })),
  );

const dangerEpic = action$ =>
  action$.pipe(
    filter(x => x.type === 'DO_SOMETHING_DANGEROUS'),
    mergeMap(x => {
      return of({
        type: 'DO_SOMETHING_DANGEROUS_SUCCESS',
        payload: "Yup, that's new :D",
      }).pipe(
        map(x => {
          throw new Error('Something went very wrontg');
        }),
        catchError(err => {
          console.warn('An error occurred but all is well, we got it');
          return of({
            type: 'DO_SOMETHING_DANGEROUS_FAILURE',
          });
        })
      );
    })
  );

// Combine epics, attach top level error handler and subscribe
merge(
  safeEpic(action$),
  dangerEpic(action$)
)
  .pipe(
    catchError((err, source) => {
      console.warn('Handled top-level error handler', err);
      return source; // Prevent the stream from collapsing by resubscribing
    })
  )
  .subscribe(
    x => postMessage(x),
    err => {
      console.warn('Error was not caught in epics. This is not good', err);
    }
  )
