import {configureStore} from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // services: serviceReducer,
        // bookings: bookingReducer,
        // admin: adminReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false
        })
})