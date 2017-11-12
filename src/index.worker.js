import { Subject } from 'rxjs/Subject';
import { filter, map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of'
import { merge } from 'rxjs/observable/merge'

const action$ = new Subject();

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
