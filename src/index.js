import Worker from './index.worker.js';

const $ = sel => document.querySelector(sel);

const main = () => {
  const worker = new Worker();

  worker.onmessage = e => {
    console.log('message came in from worker', e.data);
  };

  // Expose for dev
  window.worker = worker;

  $('.msg-btn').addEventListener('click', e => {
    e.preventDefault();
    worker.postMessage({
      type: 'PING',
    });
  });

  $('.msg-btn-danger').addEventListener('click', e => {
    e.preventDefault();
    worker.postMessage({
      type: 'DO_SOMETHING_DANGEROUS',
    });
  });
};

document.addEventListener('DOMContentLoaded', main);
