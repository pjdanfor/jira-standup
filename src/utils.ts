export function waitForElement(selector: string, wait: number = 1000): Promise<Element | null> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const timeout = setTimeout(() => {
            observer.disconnect();
            reject(`Element ${selector} not found.`);
        }, wait);

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                clearTimeout(timeout);
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
