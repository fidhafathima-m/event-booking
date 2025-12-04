import {configureStore} from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import serviceReducer from "./slices/serviceSlice"
import bookingReducer from "./slices/bookingSlice"
import adminReducer from "./slices/adminSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        services: serviceReducer,
        bookings: bookingReducer,
        admin: adminReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false
        })
})