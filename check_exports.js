const firebaseAuth = require('firebase/auth');
const atFirebaseAuth = require('@firebase/auth');

console.log('--- firebase/auth keys ---');
console.log(Object.keys(firebaseAuth).filter(k => k.includes('Persist')));
console.log('getReactNativePersistence in firebase/auth:', !!firebaseAuth.getReactNativePersistence);

console.log('\n--- @firebase/auth keys ---');
console.log(Object.keys(atFirebaseAuth).filter(k => k.includes('Persist')));
console.log('getReactNativePersistence in @firebase/auth:', !!atFirebaseAuth.getReactNativePersistence);
