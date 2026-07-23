import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import tenantReducer from "../slices/tenantSlice";
import chatReducer from "../slices/chatSlice";

const rootReducer = combineReducers({
  user: userReducer,
  tenant: tenantReducer,
  chat: chatReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
