# OTP-Bud frontend

In this following readme file, I will document my way of doing the frontend in a simplified way so anyone who wants to use the project can understand what I am doing.

## Storing the auth token

I'm using _zustand_, it's a small and scalable state management library that has different built-in and community plugins, this makes it simple but really powerful.

In `src/stores/authStore.ts` I've specified actions and states to easily manipulate and store the auth token in the storage, I've extended the functionality of the zustand library to store the token in localStorage for persistant states using the `persist` middleware.
