onmessage = (e) => {
  console.log('Worker received a message', e.data);

  postMessage({
    type: 'RESPONSE',
    payload: 'Coming back from worker',
  });
};
