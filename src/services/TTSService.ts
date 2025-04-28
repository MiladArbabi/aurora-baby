// src/services/TTSService.ts

export function speak(text: string): Promise<void> {
let SpeechModule: typeof import('expo-speech');
try {
    // dynamic require so the module‐load is inside a try
    // jest-expo setup will still mock this fine in tests
    // (and in prod if expo-speech is linked, this will succeed)
    // otherwise we catch and no-op
    // @ts-ignore
    SpeechModule = require('expo-speech');
} catch {
    return Promise.resolve();
}

if (typeof SpeechModule.speak !== 'function') {
    return Promise.resolve();
}

return new Promise((resolve, reject) => {
    SpeechModule.speak(text, {
        onDone: () => resolve(),
        onError: (err: any) => reject(err),
    });
});
}