const $ = sel => document.querySelector(sel);

const main = () => {
  const worker = new Worker('worker.js');

  worker.onmessage = e => {
    console.log('message came in from worker', e.data);
  };

  // Expose for dev
  window.worker = worker;

  $('.msg-btn').addEventListener('click', e => {
    e.preventDefault();
    worker.postMessage({
      type: 'PING_WORKER',
      payload: 'ping',
    });
  });
};

document.addEventListener('DOMContentLoaded', main);
