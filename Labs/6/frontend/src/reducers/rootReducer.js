import {combineReducers} from '@reduxjs/toolkit';
import collectorReducer from './collectorReducer';

const rootReducer = combineReducers({
  collectors: collectorReducer
});

export default rootReducer;
