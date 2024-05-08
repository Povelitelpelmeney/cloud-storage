const eventBus = {
  on(event: string, callback: EventListener) {
    document.addEventListener(event, callback);
  },
  dispatch(event: string) {
    document.dispatchEvent(new CustomEvent(event));
  },
  remove(event: string, callback: EventListener) {
    document.removeEventListener(event, callback);
  },
};

export default eventBus;
